package com.shullock.app.util

object Constants {
    const val NOTIFICATION_CHANNEL_ID = "shul_lock_active"
    const val NOTIFICATION_ID = 1001
    const val GEOFENCE_REQUEST_CODE = 2001

    const val DEFAULT_RADIUS_METERS = 100f
    const val MIN_RADIUS_METERS = 25f
    const val MAX_RADIUS_METERS = 500f

    const val EXTRA_SHUL_NAME = "extra_shul_name"
    const val EXTRA_SHUL_ID = "extra_shul_id"

    const val ACTION_START_LOCK = "com.shullock.app.ACTION_START_LOCK"
    const val ACTION_STOP_LOCK = "com.shullock.app.ACTION_STOP_LOCK"

    const val EMERGENCY_NUMBER = "911"
}
