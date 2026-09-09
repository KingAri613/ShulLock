package com.shullock.app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.shullock.app.data.local.SettingsDataStore
import com.shullock.app.service.DndManager
import com.shullock.app.util.PermissionHelper
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

data class PermissionStatus(
    val hasLocation: Boolean = false,
    val hasBackgroundLocation: Boolean = false,
    val hasDnd: Boolean = false,
    val hasNotification: Boolean = false
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val application: Application,
    private val settingsDataStore: SettingsDataStore,
    private val dndManager: DndManager
) : AndroidViewModel(application) {

    val autoActivate = settingsDataStore.autoActivate
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), true)

    val autoDeactivate = settingsDataStore.autoDeactivate
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), true)

    val startupMode = settingsDataStore.startupMode
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), false)

    private val _permissionStatus = MutableStateFlow(PermissionStatus())
    val permissionStatus: StateFlow<PermissionStatus> = _permissionStatus.asStateFlow()

    fun refreshPermissions() {
        _permissionStatus.value = PermissionStatus(
            hasLocation = PermissionHelper.hasLocationPermission(application),
            hasBackgroundLocation = PermissionHelper.hasBackgroundLocationPermission(application),
            hasDnd = PermissionHelper.hasDndPermission(application),
            hasNotification = PermissionHelper.hasNotificationPermission(application)
        )
    }

    fun setAutoActivate(enabled: Boolean) {
        viewModelScope.launch { settingsDataStore.setAutoActivate(enabled) }
    }

    fun setAutoDeactivate(enabled: Boolean) {
        viewModelScope.launch { settingsDataStore.setAutoDeactivate(enabled) }
    }

    fun setStartupMode(enabled: Boolean) {
        viewModelScope.launch { settingsDataStore.setStartupMode(enabled) }
    }

    fun getDndSettingsIntent() = dndManager.getDndSettingsIntent()

    fun getAppVersion(): String {
        return try {
            val packageInfo = application.packageManager.getPackageInfo(
                application.packageName, 0
            )
            packageInfo.versionName ?: "1.0.0"
        } catch (_: Exception) {
            "1.0.0"
        }
    }
}
