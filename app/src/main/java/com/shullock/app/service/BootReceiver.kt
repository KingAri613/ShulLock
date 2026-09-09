package com.shullock.app.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.room.Room
import com.shullock.app.data.local.ShulDatabase
import com.shullock.app.data.local.SettingsDataStore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

/**
 * Re-registers geofences after device reboot.
 * Geofences are cleared by the system on reboot, so we must re-register them.
 */
class BootReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "BootReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED &&
            intent.action != "android.intent.action.QUICKBOOT_POWERON"
        ) {
            return
        }

        Log.d(TAG, "Device booted — re-registering geofences")

        val pendingResult = goAsync()

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val settingsDataStore = SettingsDataStore(context)
                val autoActivate = settingsDataStore.autoActivate.first()

                if (!autoActivate) {
                    Log.d(TAG, "Auto-activate disabled, skipping geofence registration")
                    pendingResult.finish()
                    return@launch
                }

                val database = Room.databaseBuilder(
                    context.applicationContext,
                    ShulDatabase::class.java,
                    "shullock_database"
                ).build()

                val enabledShuls = database.shulDao().getEnabledShulsList()

                if (enabledShuls.isNotEmpty()) {
                    val geofenceManager = GeofenceManager(context)
                    geofenceManager.addGeofencesForShuls(enabledShuls)
                    Log.d(TAG, "Re-registered ${enabledShuls.size} geofences after boot")
                } else {
                    Log.d(TAG, "No enabled shuls to register")
                }

                database.close()
            } catch (e: Exception) {
                Log.e(TAG, "Error re-registering geofences after boot", e)
            } finally {
                pendingResult.finish()
            }
        }
    }
}
