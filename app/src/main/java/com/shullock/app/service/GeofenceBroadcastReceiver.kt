package com.shullock.app.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingEvent
import com.shullock.app.data.local.SettingsDataStore
import com.shullock.app.util.Constants
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking

class GeofenceBroadcastReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "GeofenceReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val geofencingEvent = GeofencingEvent.fromIntent(intent)
        if (geofencingEvent == null) {
            Log.e(TAG, "GeofencingEvent is null")
            return
        }

        if (geofencingEvent.hasError()) {
            Log.e(TAG, "Geofencing error: ${geofencingEvent.errorCode}")
            return
        }

        val settingsDataStore = SettingsDataStore(context)

        when (geofencingEvent.geofenceTransition) {
            Geofence.GEOFENCE_TRANSITION_ENTER -> {
                Log.d(TAG, "Entered geofence")

                val autoActivate = runBlocking { settingsDataStore.autoActivate.first() }
                if (!autoActivate) {
                    Log.d(TAG, "Auto-activate is disabled, ignoring enter")
                    return
                }

                // Get the triggered geofence IDs (shul IDs)
                val triggeringGeofences = geofencingEvent.triggeringGeofences ?: return
                val shulId = triggeringGeofences.firstOrNull()?.requestId?.toLongOrNull()

                // Start the foreground service
                val serviceIntent = Intent(context, ShulLockForegroundService::class.java).apply {
                    action = Constants.ACTION_START_LOCK
                    shulId?.let { putExtra(Constants.EXTRA_SHUL_ID, it) }
                }
                context.startForegroundService(serviceIntent)
            }

            Geofence.GEOFENCE_TRANSITION_EXIT -> {
                Log.d(TAG, "Exited geofence")

                val autoDeactivate = runBlocking { settingsDataStore.autoDeactivate.first() }
                if (!autoDeactivate) {
                    Log.d(TAG, "Auto-deactivate is disabled, ignoring exit")
                    return
                }

                // Stop the foreground service
                val serviceIntent = Intent(context, ShulLockForegroundService::class.java).apply {
                    action = Constants.ACTION_STOP_LOCK
                }
                context.startService(serviceIntent)
            }

            else -> {
                Log.w(TAG, "Unknown geofence transition: ${geofencingEvent.geofenceTransition}")
            }
        }
    }
}
