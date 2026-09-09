package com.shullock.app.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.shullock.app.MainActivity
import com.shullock.app.R
import com.shullock.app.data.local.ShulDatabase
import com.shullock.app.data.local.SettingsDataStore
import com.shullock.app.state.ShulLockState
import com.shullock.app.util.Constants
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class ShulLockForegroundService : Service() {

    companion object {
        private const val TAG = "ShulLockService"

        fun startLock(context: Context, shulName: String? = null, shulId: Long? = null) {
            val intent = Intent(context, ShulLockForegroundService::class.java).apply {
                action = Constants.ACTION_START_LOCK
                shulName?.let { putExtra(Constants.EXTRA_SHUL_NAME, it) }
                shulId?.let { putExtra(Constants.EXTRA_SHUL_ID, it) }
            }
            context.startForegroundService(intent)
        }

        fun stopLock(context: Context) {
            val intent = Intent(context, ShulLockForegroundService::class.java).apply {
                action = Constants.ACTION_STOP_LOCK
            }
            context.startService(intent)
        }
    }

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private lateinit var dndManager: DndManager
    private lateinit var settingsDataStore: SettingsDataStore

    override fun onCreate() {
        super.onCreate()
        settingsDataStore = SettingsDataStore(this)
        dndManager = DndManager(this, settingsDataStore)
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            Constants.ACTION_START_LOCK -> {
                val shulName = intent.getStringExtra(Constants.EXTRA_SHUL_NAME)
                val shulId = intent.getLongExtra(Constants.EXTRA_SHUL_ID, -1L)
                    .takeIf { it != -1L }

                if (shulName != null) {
                    activateLock(shulName, shulId)
                } else if (shulId != null) {
                    // Look up shul name from database
                    serviceScope.launch {
                        val db = androidx.room.Room.databaseBuilder(
                            applicationContext,
                            ShulDatabase::class.java,
                            "shullock_database"
                        ).build()
                        val shul = db.shulDao().getShulById(shulId)
                        val name = shul?.name ?: "Shul"
                        activateLock(name, shulId)
                        db.close()
                    }
                } else {
                    activateLock(null, null)
                }
            }

            Constants.ACTION_STOP_LOCK -> {
                deactivateLock()
            }

            else -> {
                // Service restarted by system — check if we should still be active
                if (ShulLockState.isActive.value) {
                    val notification = buildNotification(
                        ShulLockState.activeShulName.value
                    )
                    startForeground(Constants.NOTIFICATION_ID, notification)
                } else {
                    stopSelf()
                }
            }
        }

        return START_STICKY
    }

    private fun activateLock(shulName: String?, shulId: Long?) {
        Log.d(TAG, "Activating Shul Lock: $shulName")

        // Update global state
        ShulLockState.activate(shulName, shulId)

        // Activate silent/DND mode
        dndManager.activateSilentMode()

        // Show foreground notification
        val notification = buildNotification(shulName)
        startForeground(Constants.NOTIFICATION_ID, notification)
    }

    private fun deactivateLock() {
        Log.d(TAG, "Deactivating Shul Lock")

        // Restore sound settings
        dndManager.deactivateSilentMode()

        // Update global state
        ShulLockState.deactivate()

        // Stop foreground service
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun buildNotification(shulName: String?): Notification {
        // Tap notification to open app
        val openAppIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val openAppPendingIntent = PendingIntent.getActivity(
            this, 0, openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Stop action
        val stopIntent = Intent(this, ShulLockForegroundService::class.java).apply {
            action = Constants.ACTION_STOP_LOCK
        }
        val stopPendingIntent = PendingIntent.getService(
            this, 1, stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val contentText = if (shulName != null) {
            getString(R.string.notification_text, shulName)
        } else {
            getString(R.string.notification_text_manual)
        }

        return NotificationCompat.Builder(this, Constants.NOTIFICATION_CHANNEL_ID)
            .setContentTitle(getString(R.string.notification_title))
            .setContentText(contentText)
            .setSmallIcon(R.drawable.ic_notification)
            .setOngoing(true)
            .setContentIntent(openAppPendingIntent)
            .addAction(
                android.R.drawable.ic_menu_close_clear_cancel,
                getString(R.string.turn_off_shul_lock),
                stopPendingIntent
            )
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            Constants.NOTIFICATION_CHANNEL_ID,
            getString(R.string.notification_channel_name),
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = getString(R.string.notification_channel_desc)
            setShowBadge(false)
        }

        val notificationManager = getSystemService(NotificationManager::class.java)
        notificationManager.createNotificationChannel(channel)
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        // If service is destroyed unexpectedly, ensure state is updated
        if (ShulLockState.isActive.value) {
            dndManager.deactivateSilentMode()
            ShulLockState.deactivate()
        }
    }
}
