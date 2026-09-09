# Shul Lock

An Android app that automatically puts your phone into silent/Do Not Disturb mode when you enter a synagogue (shul). Designed to minimise distractions during prayer.

## Features

- **Automatic activation** — uses geofencing to detect when you enter a shul area
- **Multiple shuls** — add, edit, enable/disable shuls with custom radii
- **Do Not Disturb** — silences your phone using Android's DND system
- **Clean active screen** — shows time, status, and shul name with minimal distraction
- **Emergency calls** — always accessible, never blocked
- **Manual control** — activate/deactivate at any time
- **Boot recovery** — re-registers geofences after device restart
- **Battery efficient** — uses geofencing instead of continuous GPS polling
- **Privacy focused** — all data stored locally, nothing uploaded

## Setup

### Prerequisites

- Android Studio (latest stable)
- JDK 17
- Android SDK 34

### Getting Started

1. Clone this repository
2. Open in Android Studio
3. Let Gradle sync (Android Studio will download the Gradle wrapper automatically)
4. Configure your Google Maps API key (optional, see below)
5. Build and run

### Google Maps API Key (Optional)

To enable map-based location search when adding shuls:

1. Get a Google Maps API key from the [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the "Maps SDK for Android" API
3. Create/edit `local.properties` in the project root:
   ```
   MAPS_API_KEY=your_api_key_here
   ```

**Without a Maps API key**, you can still use the app — search for locations by address using Android's built-in Geocoder, or enter coordinates manually.

### Required Permissions

The app will guide you through granting these permissions:

| Permission | Why |
|---|---|
| **Location** | To detect when you're near a shul |
| **Background Location** | To detect shul entry when the app is closed |
| **Do Not Disturb** | To silence your phone automatically |
| **Notifications** | To show a persistent notification while active (Android 13+) |

### Building

```bash
./gradlew assembleDebug
```

Debug APK will be at: `app/build/outputs/apk/debug/app-debug.apk`

## Architecture

- **Kotlin** + **Jetpack Compose** + **Material 3**
- **Room** database for shul storage
- **DataStore** for preferences/settings
- **Hilt** for dependency injection
- **Geofencing API** (Play Services) for location detection
- **Foreground Service** for active lock state
- **BroadcastReceivers** for geofence events and boot recovery

### Package Structure

```
com.shullock.app/
├── data/
│   ├── local/       # Room DB, DataStore, DAO
│   ├── model/       # Shul entity
│   └── repository/  # Data access layer
├── di/              # Hilt dependency injection
├── service/         # Geofencing, DND, foreground service, boot receiver
├── state/           # Global ShulLock state
├── ui/
│   ├── components/  # Reusable UI components
│   ├── navigation/  # Navigation graph
│   ├── screens/     # App screens
│   └── theme/       # Material 3 theming
├── util/            # Constants, permission helpers
└── viewmodel/       # Screen ViewModels
```

## Android Limitations

- **Do Not Disturb**: Requires explicit user permission via system settings. The app cannot grant this permission silently.
- **Background Location**: Android requires a separate permission grant for background location. The app guides users through this.
- **Geofence limits**: Android limits the number of active geofences (~100). Each saved shul uses one geofence.
- **Battery optimization**: Some manufacturers aggressively kill background services. Users may need to exempt Shul Lock from battery optimization.
- **Lock screen replacement**: Android does not allow third-party apps to replace the system lock screen. The "startup mode" feature shows a full-screen overlay within the app, not a system-level lock.
- **Emergency calls**: The app uses `ACTION_DIAL` (opens dialer) rather than `ACTION_CALL` (direct call) for emergency numbers, ensuring the user confirms the call. Emergency calls are never blocked by DND on Android.

## License

Private — all rights reserved.
