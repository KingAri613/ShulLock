package com.shullock.app.state

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Global singleton that tracks whether Shul Lock is currently active.
 * Shared between the foreground service and the UI.
 */
object ShulLockState {

    private val _isActive = MutableStateFlow(false)
    val isActive: StateFlow<Boolean> = _isActive.asStateFlow()

    private val _activeShulName = MutableStateFlow<String?>(null)
    val activeShulName: StateFlow<String?> = _activeShulName.asStateFlow()

    private val _activeShulId = MutableStateFlow<Long?>(null)
    val activeShulId: StateFlow<Long?> = _activeShulId.asStateFlow()

    fun activate(shulName: String?, shulId: Long? = null) {
        _activeShulName.value = shulName
        _activeShulId.value = shulId
        _isActive.value = true
    }

    fun deactivate() {
        _isActive.value = false
        _activeShulName.value = null
        _activeShulId.value = null
    }
}
