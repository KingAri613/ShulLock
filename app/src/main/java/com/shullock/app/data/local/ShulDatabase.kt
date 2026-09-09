package com.shullock.app.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.shullock.app.data.model.Shul

@Database(
    entities = [Shul::class],
    version = 1,
    exportSchema = false
)
abstract class ShulDatabase : RoomDatabase() {
    abstract fun shulDao(): ShulDao
}
