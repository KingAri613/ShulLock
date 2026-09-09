package com.shullock.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.shullock.app.data.model.Shul
import com.shullock.app.data.repository.ShulRepository
import com.shullock.app.service.GeofenceManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ShulListViewModel @Inject constructor(
    private val repository: ShulRepository,
    private val geofenceManager: GeofenceManager
) : ViewModel() {

    val shuls: StateFlow<List<Shul>> = repository.getAllShuls()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun toggleShulEnabled(shul: Shul) {
        viewModelScope.launch {
            val updated = shul.copy(isEnabled = !shul.isEnabled)
            repository.updateShul(updated)

            if (updated.isEnabled) {
                geofenceManager.addGeofence(updated)
            } else {
                geofenceManager.removeGeofence(updated.id)
            }
        }
    }

    fun deleteShul(shul: Shul) {
        viewModelScope.launch {
            geofenceManager.removeGeofence(shul.id)
            repository.deleteShul(shul)
        }
    }
}
