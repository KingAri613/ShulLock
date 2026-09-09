package com.shullock.app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.shullock.app.data.local.SettingsDataStore
import com.shullock.app.service.GeofenceManager
import com.shullock.app.service.ShulLockForegroundService
import com.shullock.app.state.ShulLockState
import com.shullock.app.data.repository.ShulRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val application: Application,
    private val repository: ShulRepository,
    private val geofenceManager: GeofenceManager,
    private val settingsDataStore: SettingsDataStore
) : AndroidViewModel(application) {

    val isActive: StateFlow<Boolean> = ShulLockState.isActive
    val activeShulName: StateFlow<String?> = ShulLockState.activeShulName

    val shulCount = repository.getAllShuls()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val startupMode = settingsDataStore.startupMode
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), false)

    /**
     * Manually activate Shul Lock.
     */
    fun activateManually() {
        ShulLockForegroundService.startLock(
            context = application,
            shulName = null
        )
    }

    /**
     * Manually deactivate Shul Lock.
     */
    fun deactivate() {
        ShulLockForegroundService.stopLock(application)
    }

    /**
     * Register geofences for all enabled shuls.
     */
    fun registerGeofences() {
        viewModelScope.launch {
            val enabledShuls = repository.getEnabledShulsList()
            if (enabledShuls.isNotEmpty()) {
                geofenceManager.addGeofencesForShuls(enabledShuls)
            }
        }
    }
}
