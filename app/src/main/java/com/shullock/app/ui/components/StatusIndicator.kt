package com.shullock.app.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.shullock.app.ui.theme.ActiveGreen
import com.shullock.app.ui.theme.InactiveGray

@Composable
fun StatusIndicator(
    isActive: Boolean,
    modifier: Modifier = Modifier,
    size: Dp = 20.dp
) {
    val color by animateColorAsState(
        targetValue = if (isActive) ActiveGreen else InactiveGray,
        animationSpec = tween(500),
        label = "status_color"
    )

    if (isActive) {
        val infiniteTransition = rememberInfiniteTransition(label = "pulse")
        val pulseAlpha by infiniteTransition.animateFloat(
            initialValue = 0.3f,
            targetValue = 1f,
            animationSpec = infiniteRepeatable(
                animation = tween(1000),
                repeatMode = RepeatMode.Reverse
            ),
            label = "pulse_alpha"
        )

        Box(
            modifier = modifier.size(size * 1.6f),
            contentAlignment = Alignment.Center
        ) {
            // Outer pulse ring
            Box(
                modifier = Modifier
                    .size(size * 1.6f)
                    .alpha(pulseAlpha * 0.3f)
                    .clip(CircleShape)
                    .background(color)
            )
            // Inner solid dot
            Box(
                modifier = Modifier
                    .size(size)
                    .clip(CircleShape)
                    .background(color)
            )
        }
    } else {
        Box(
            modifier = modifier
                .size(size)
                .clip(CircleShape)
                .background(color)
        )
    }
}
