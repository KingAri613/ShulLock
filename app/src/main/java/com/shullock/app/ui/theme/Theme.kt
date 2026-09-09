package com.shullock.app.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = Navy800,
    onPrimary = White,
    primaryContainer = Navy600,
    onPrimaryContainer = White,
    secondary = Gold500,
    onSecondary = NearBlack,
    secondaryContainer = Gold300,
    onSecondaryContainer = NearBlack,
    tertiary = ActiveGreen,
    onTertiary = White,
    background = OffWhite,
    onBackground = NearBlack,
    surface = White,
    onSurface = NearBlack,
    surfaceVariant = LightGray,
    onSurfaceVariant = DarkGray,
    error = ErrorRed,
    onError = White
)

private val DarkColorScheme = darkColorScheme(
    primary = Gold400,
    onPrimary = Navy900,
    primaryContainer = Navy700,
    onPrimaryContainer = Gold300,
    secondary = Gold400,
    onSecondary = Navy900,
    secondaryContainer = Navy700,
    onSecondaryContainer = Gold300,
    tertiary = ActiveGreenLight,
    onTertiary = NearBlack,
    background = Navy900,
    onBackground = OffWhite,
    surface = NearBlack,
    onSurface = OffWhite,
    surfaceVariant = DarkGray,
    onSurfaceVariant = LightGray,
    error = ErrorRed,
    onError = White
)

@Composable
fun ShulLockTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
