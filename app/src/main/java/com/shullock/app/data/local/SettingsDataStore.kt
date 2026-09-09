package com.shullock.app.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "shullock_settings")

class SettingsDataStore(private val context: Context) {

    companion object {
        val AUTO_ACTIVATE = booleanPreferencesKey("auto_activate")
        val AUTO_DEACTIVATE = booleanPreferencesKey("auto_deactivate")
        val STARTUP_MODE = booleanPreferencesKey("startup_mode")
        val LAST_RINGER_MODE = intPreferencesKey("last_ringer_mode")
        val LAST_DND_STATE = booleanPreferencesKey("last_dnd_state")
    }

    val autoActivate: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[AUTO_ACTIVATE] ?: true
    }

    val autoDeactivate: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[AUTO_DEACTIVATE] ?: true
    }

    val startupMode: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[STARTUP_MODE] ?: false
    }

    suspend fun setAutoActivate(value: Boolean) {
        context.dataStore.edit { it[AUTO_ACTIVATE] = value }
    }

    suspend fun setAutoDeactivate(value: Boolean) {
        context.dataStore.edit { it[AUTO_DEACTIVATE] = value }
    }

    suspend fun setStartupMode(value: Boolean) {
        context.dataStore.edit { it[STARTUP_MODE] = value }
    }

    suspend fun saveRingerMode(mode: Int) {
        context.dataStore.edit { it[LAST_RINGER_MODE] = mode }
    }

    suspend fun getLastRingerMode(): Int {
        return context.dataStore.data.first()[LAST_RINGER_MODE]
            ?: android.media.AudioManager.RINGER_MODE_NORMAL
    }

    suspend fun saveDndState(wasEnabled: Boolean) {
        context.dataStore.edit { it[LAST_DND_STATE] = wasEnabled }
    }

    suspend fun getLastDndState(): Boolean {
        return context.dataStore.data.first()[LAST_DND_STATE] ?: false
    }
}
