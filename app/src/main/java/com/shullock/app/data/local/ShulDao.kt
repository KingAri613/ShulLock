package com.shullock.app.data.local

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.shullock.app.data.model.Shul
import kotlinx.coroutines.flow.Flow

@Dao
interface ShulDao {

    @Query("SELECT * FROM shuls ORDER BY name ASC")
    fun getAllShuls(): Flow<List<Shul>>

    @Query("SELECT * FROM shuls WHERE isEnabled = 1 ORDER BY name ASC")
    fun getEnabledShuls(): Flow<List<Shul>>

    @Query("SELECT * FROM shuls WHERE isEnabled = 1")
    suspend fun getEnabledShulsList(): List<Shul>

    @Query("SELECT * FROM shuls WHERE id = :id")
    suspend fun getShulById(id: Long): Shul?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertShul(shul: Shul): Long

    @Update
    suspend fun updateShul(shul: Shul)

    @Delete
    suspend fun deleteShul(shul: Shul)

    @Query("DELETE FROM shuls WHERE id = :id")
    suspend fun deleteShulById(id: Long)
}
