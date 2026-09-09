package com.shullock.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "shuls")
data class Shul(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val latitude: Double,
    val longitude: Double,
    val radiusMeters: Float = 100f,
    val address: String = "",
    val isEnabled: Boolean = true
)
