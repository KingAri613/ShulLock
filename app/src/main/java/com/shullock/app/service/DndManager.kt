package com.shullock.app.service

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.media.AudioManager
import android.os.Build
import android.provider.Settings
import com.shullock.app.data.local.SettingsDataStore
import kotlinx.coroutines.runBlocking
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DndManager @Inject constructor(
    private val context: Context,
    private val settingsDataStore: SettingsDataStore
) {

    private val audioManager: AudioManager =
        context.getSystemService(Context.AUDIO_SERVICE) as AudioManager

    private val notificationManager: NotificationManager =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    /**
     * Check if the app has Do Not Disturb policy access.
     */
    fun hasDndPermission(): Boolean {
        return notificationManager.isNotificationPolicyAccessGranted
    }

    /**
     * Get the intent to open DND access settings.
     */
    fun getDndSettingsIntent(): Intent {
        return Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS)
    }

    /**
     * Activate silent/DND mode. Saves the previous ringer state first.
     */
    fun activateSilentMode() {
        // Save current state before changing
        runBlocking {
            settingsDataStore.saveRingerMode(audioManager.ringerMode)
            settingsDataStore.saveDndState(
                notificationManager.currentInterruptionFilter != NotificationManager.INTERRUPTION_FILTER_ALL
            )
        }

        // Use DND if we have permission, otherwise fall back to silent ringer
        if (hasDndPermission()) {
            // Set DND with priority exceptions (allows alarms and emergency)
            notificationManager.setInterruptionFilter(
                NotificationManager.INTERRUPTION_FILTER_PRIORITY
            )

            // Also set ringer to silent as a backup
            try {
                audioManager.ringerMode = AudioManager.RINGER_MODE_SILENT
            } catch (_: SecurityException) {
                // Some devices may block this; DND is the primary mechanism
            }
        } else {
            // No DND permission — just set ringer to silent
            try {
                audioManager.ringerMode = AudioManager.RINGER_MODE_SILENT
            } catch (_: SecurityException) {
                // Cannot change ringer without DND permission on some devices
            }
        }
    }

    /**
     * Restore previous sound settings.
     */
    fun deactivateSilentMode() {
        runBlocking {
            val previousRingerMode = settingsDataStore.getLastRingerMode()
            val wasDndOn = settingsDataStore.getLastDndState()

            // Restore DND state
            if (hasDndPermission()) {
                if (!wasDndOn) {
                    notificationManager.setInterruptionFilter(
                        NotificationManager.INTERRUPTION_FILTER_ALL
                    )
                }
                // If DND was already on before we activated, leave it on
            }

            // Restore ringer mode
            try {
                audioManager.ringerMode = previousRingerMode
            } catch (_: SecurityException) {
                // Best effort
            }
        }
    }
}
