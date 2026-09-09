package com.shullock.app.di

import android.content.Context
import androidx.room.Room
import com.shullock.app.data.local.SettingsDataStore
import com.shullock.app.data.local.ShulDao
import com.shullock.app.data.local.ShulDatabase
import com.shullock.app.data.repository.ShulRepository
import com.shullock.app.service.DndManager
import com.shullock.app.service.GeofenceManager
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideShulDatabase(@ApplicationContext context: Context): ShulDatabase {
        return Room.databaseBuilder(
            context,
            ShulDatabase::class.java,
            "shullock_database"
        ).build()
    }

    @Provides
    @Singleton
    fun provideShulDao(database: ShulDatabase): ShulDao {
        return database.shulDao()
    }

    @Provides
    @Singleton
    fun provideShulRepository(shulDao: ShulDao): ShulRepository {
        return ShulRepository(shulDao)
    }

    @Provides
    @Singleton
    fun provideSettingsDataStore(@ApplicationContext context: Context): SettingsDataStore {
        return SettingsDataStore(context)
    }

    @Provides
    @Singleton
    fun provideDndManager(
        @ApplicationContext context: Context,
        settingsDataStore: SettingsDataStore
    ): DndManager {
        return DndManager(context, settingsDataStore)
    }

    @Provides
    @Singleton
    fun provideGeofenceManager(@ApplicationContext context: Context): GeofenceManager {
        return GeofenceManager(context)
    }
}
