package com.shullock.app.viewmodel

import android.app.Application
import android.location.Geocoder
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.shullock.app.data.model.Shul
import com.shullock.app.data.repository.ShulRepository
import com.shullock.app.service.GeofenceManager
import com.shullock.app.util.Constants
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Locale
import javax.inject.Inject

data class AddEditShulState(
    val name: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val radiusMeters: Float = Constants.DEFAULT_RADIUS_METERS,
    val address: String = "",
    val isEnabled: Boolean = true,
    val isLoading: Boolean = false,
    val isEditing: Boolean = false,
    val editingShulId: Long = 0,
    val searchQuery: String = "",
    val searchResults: List<SearchResult> = emptyList(),
    val isSearching: Boolean = false,
    val hasLocation: Boolean = false,
    val errorMessage: String? = null,
    val isSaved: Boolean = false
)

data class SearchResult(
    val address: String,
    val latitude: Double,
    val longitude: Double
)

@HiltViewModel
class AddEditShulViewModel @Inject constructor(
    private val application: Application,
    private val repository: ShulRepository,
    private val geofenceManager: GeofenceManager
) : AndroidViewModel(application) {

    private val _state = MutableStateFlow(AddEditShulState())
    val state: StateFlow<AddEditShulState> = _state.asStateFlow()

    fun loadShul(shulId: Long) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            val shul = repository.getShulById(shulId)
            if (shul != null) {
                _state.value = _state.value.copy(
                    name = shul.name,
                    latitude = shul.latitude,
                    longitude = shul.longitude,
                    radiusMeters = shul.radiusMeters,
                    address = shul.address,
                    isEnabled = shul.isEnabled,
                    isEditing = true,
                    editingShulId = shul.id,
                    hasLocation = true,
                    isLoading = false
                )
            } else {
                _state.value = _state.value.copy(
                    isLoading = false,
                    errorMessage = "Shul not found"
                )
            }
        }
    }

    fun updateName(name: String) {
        _state.value = _state.value.copy(name = name)
    }

    fun updateRadius(radius: Float) {
        _state.value = _state.value.copy(radiusMeters = radius)
    }

    fun updateSearchQuery(query: String) {
        _state.value = _state.value.copy(searchQuery = query)
    }

    fun updateLocation(lat: Double, lng: Double) {
        _state.value = _state.value.copy(
            latitude = lat,
            longitude = lng,
            hasLocation = true
        )
        // Reverse geocode to get address
        viewModelScope.launch {
            reverseGeocode(lat, lng)
        }
    }

    fun searchLocation() {
        val query = _state.value.searchQuery.trim()
        if (query.isEmpty()) return

        viewModelScope.launch {
            _state.value = _state.value.copy(isSearching = true, searchResults = emptyList())

            try {
                val results = withContext(Dispatchers.IO) {
                    val geocoder = Geocoder(application, Locale.getDefault())
                    @Suppress("DEPRECATION")
                    val addresses = geocoder.getFromLocationName(query, 5)
                    addresses?.map { addr ->
                        SearchResult(
                            address = addr.getAddressLine(0) ?: "${addr.latitude}, ${addr.longitude}",
                            latitude = addr.latitude,
                            longitude = addr.longitude
                        )
                    } ?: emptyList()
                }

                _state.value = _state.value.copy(
                    searchResults = results,
                    isSearching = false,
                    errorMessage = if (results.isEmpty()) "No results found" else null
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isSearching = false,
                    errorMessage = "Search failed: ${e.localizedMessage}"
                )
            }
        }
    }

    fun selectSearchResult(result: SearchResult) {
        _state.value = _state.value.copy(
            latitude = result.latitude,
            longitude = result.longitude,
            address = result.address,
            hasLocation = true,
            searchResults = emptyList(),
            searchQuery = ""
        )
    }

    fun updateLatitude(lat: String) {
        lat.toDoubleOrNull()?.let { d ->
            _state.value = _state.value.copy(latitude = d, hasLocation = true)
        }
    }

    fun updateLongitude(lng: String) {
        lng.toDoubleOrNull()?.let { d ->
            _state.value = _state.value.copy(longitude = d, hasLocation = true)
        }
    }

    fun save() {
        val s = _state.value
        if (s.name.isBlank()) {
            _state.value = s.copy(errorMessage = "Please enter a name for this shul")
            return
        }
        if (!s.hasLocation) {
            _state.value = s.copy(errorMessage = "Please select a location")
            return
        }

        viewModelScope.launch {
            val shul = Shul(
                id = if (s.isEditing) s.editingShulId else 0,
                name = s.name.trim(),
                latitude = s.latitude,
                longitude = s.longitude,
                radiusMeters = s.radiusMeters,
                address = s.address,
                isEnabled = s.isEnabled
            )

            if (s.isEditing) {
                repository.updateShul(shul)
                geofenceManager.removeGeofence(shul.id)
            } else {
                val id = repository.insertShul(shul)
                // Re-create with actual ID for geofence
                val savedShul = shul.copy(id = id)
                if (savedShul.isEnabled) {
                    geofenceManager.addGeofence(savedShul)
                }
            }

            if (s.isEditing && shul.isEnabled) {
                geofenceManager.addGeofence(shul)
            }

            _state.value = _state.value.copy(isSaved = true)
        }
    }

    fun clearError() {
        _state.value = _state.value.copy(errorMessage = null)
    }

    private suspend fun reverseGeocode(lat: Double, lng: Double) {
        try {
            val address = withContext(Dispatchers.IO) {
                val geocoder = Geocoder(application, Locale.getDefault())
                @Suppress("DEPRECATION")
                val addresses = geocoder.getFromLocation(lat, lng, 1)
                addresses?.firstOrNull()?.getAddressLine(0)
            }
            if (address != null) {
                _state.value = _state.value.copy(address = address)
            }
        } catch (_: Exception) {
            // Reverse geocoding is best-effort
        }
    }
}
