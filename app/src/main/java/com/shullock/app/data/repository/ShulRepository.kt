package com.shullock.app.data.repository

import com.shullock.app.data.local.ShulDao
import com.shullock.app.data.model.Shul
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ShulRepository @Inject constructor(
    private val shulDao: ShulDao
) {

    fun getAllShuls(): Flow<List<Shul>> = shulDao.getAllShuls()

    fun getEnabledShuls(): Flow<List<Shul>> = shulDao.getEnabledShuls()

    suspend fun getEnabledShulsList(): List<Shul> = shulDao.getEnabledShulsList()

    suspend fun getShulById(id: Long): Shul? = shulDao.getShulById(id)

    suspend fun insertShul(shul: Shul): Long = shulDao.insertShul(shul)

    suspend fun updateShul(shul: Shul) = shulDao.updateShul(shul)

    suspend fun deleteShul(shul: Shul) = shulDao.deleteShul(shul)

    suspend fun deleteShulById(id: Long) = shulDao.deleteShulById(id)
}
