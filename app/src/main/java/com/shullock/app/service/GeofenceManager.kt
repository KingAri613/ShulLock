package com.shullock.app.service

import android.Manifest
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.util.Log
import androidx.core.content.ContextCompat
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingClient
import com.google.android.gms.location.GeofencingRequest
import com.google.android.gms.location.LocationServices
import com.shullock.app.data.model.Shul
import com.shullock.app.util.Constants
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class GeofenceManager @Inject constructor(
    private val context: Context
) {

    companion object {
        private const val TAG = "GeofenceManager"
    }

    private val geofencingClient: GeofencingClient =
        LocationServices.getGeofencingClient(context)

    private val geofencePendingIntent: PendingIntent by lazy {
        val intent = Intent(context, GeofenceBroadcastReceiver::class.java)
        PendingIntent.getBroadcast(
            context,
            Constants.GEOFENCE_REQUEST_CODE,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
        )
    }

    /**
     * Register a geofence for a single shul.
     */
    fun addGeofence(shul: Shul, onSuccess: () -> Unit = {}, onFailure: (Exception) -> Unit = {}) {
        if (!hasLocationPermission()) {
            onFailure(SecurityException("Location permission not granted"))
            return
        }

        val geofence = Geofence.Builder()
            .setRequestId(shul.id.toString())
            .setCircularRegion(shul.latitude, shul.longitude, shul.radiusMeters)
            .setExpirationDuration(Geofence.NEVER_EXPIRE)
            .setTransitionTypes(
                Geofence.GEOFENCE_TRANSITION_ENTER or Geofence.GEOFENCE_TRANSITION_EXIT
            )
            .build()

        val request = GeofencingRequest.Builder()
            .setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_ENTER)
            .addGeofence(geofence)
            .build()

        try {
            geofencingClient.addGeofences(request, geofencePendingIntent)
                .addOnSuccessListener {
                    Log.d(TAG, "Geofence added for shul: ${shul.name}")
                    onSuccess()
                }
                .addOnFailureListener { e ->
                    Log.e(TAG, "Failed to add geofence for shul: ${shul.name}", e)
                    onFailure(e)
                }
        } catch (e: SecurityException) {
            Log.e(TAG, "Security exception adding geofence", e)
            onFailure(e)
        }
    }

    /**
     * Register geofences for all enabled shuls.
     */
    fun addGeofencesForShuls(shuls: List<Shul>) {
        if (!hasLocationPermission() || shuls.isEmpty()) return

        val geofences = shuls.map { shul ->
            Geofence.Builder()
                .setRequestId(shul.id.toString())
                .setCircularRegion(shul.latitude, shul.longitude, shul.radiusMeters)
                .setExpirationDuration(Geofence.NEVER_EXPIRE)
                .setTransitionTypes(
                    Geofence.GEOFENCE_TRANSITION_ENTER or Geofence.GEOFENCE_TRANSITION_EXIT
                )
                .build()
        }

        val request = GeofencingRequest.Builder()
            .setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_ENTER)
            .addGeofences(geofences)
            .build()

        try {
            geofencingClient.addGeofences(request, geofencePendingIntent)
                .addOnSuccessListener {
                    Log.d(TAG, "Registered ${shuls.size} geofences")
                }
                .addOnFailureListener { e ->
                    Log.e(TAG, "Failed to register geofences", e)
                }
        } catch (e: SecurityException) {
            Log.e(TAG, "Security exception registering geofences", e)
        }
    }

    /**
     * Remove geofence for a specific shul.
     */
    fun removeGeofence(shulId: Long) {
        geofencingClient.removeGeofences(listOf(shulId.toString()))
            .addOnSuccessListener {
                Log.d(TAG, "Geofence removed for shul ID: $shulId")
            }
            .addOnFailureListener { e ->
                Log.e(TAG, "Failed to remove geofence for shul ID: $shulId", e)
            }
    }

    /**
     * Remove all registered geofences.
     */
    fun removeAllGeofences() {
        geofencingClient.removeGeofences(geofencePendingIntent)
            .addOnSuccessListener {
                Log.d(TAG, "All geofences removed")
            }
            .addOnFailureListener { e ->
                Log.e(TAG, "Failed to remove all geofences", e)
            }
    }

    private fun hasLocationPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            context, Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
    }
}
