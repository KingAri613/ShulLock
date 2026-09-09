package com.shullock.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.shullock.app.R
import com.shullock.app.service.ShulLockForegroundService
import com.shullock.app.state.ShulLockState
import com.shullock.app.ui.components.EmergencyCallButton
import com.shullock.app.ui.theme.NearBlack
import com.shullock.app.ui.theme.OffWhite
import com.shullock.app.ui.theme.Gold500
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import androidx.compose.ui.platform.LocalContext

@Composable
fun ShulLockActiveScreen(
    onDeactivated: () -> Unit
) {
    val isActive by ShulLockState.isActive.collectAsState()
    val activeShulName by ShulLockState.activeShulName.collectAsState()
    val context = LocalContext.current

    // Navigate back when deactivated
    LaunchedEffect(isActive) {
        if (!isActive) {
            onDeactivated()
        }
    }

    // Live clock
    var currentTime by remember { mutableStateOf(getCurrentTime()) }
    LaunchedEffect(Unit) {
        while (true) {
            currentTime = getCurrentTime()
            delay(1000)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(NearBlack)
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Spacer(modifier = Modifier.weight(0.3f))

        // Lock icon
        Icon(
            imageVector = Icons.Default.Lock,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = Gold500
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Current time — large and prominent
        Text(
            text = currentTime,
            fontSize = 72.sp,
            fontWeight = FontWeight.Light,
            color = OffWhite,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Status text
        Text(
            text = stringResource(R.string.status_active),
            style = MaterialTheme.typography.headlineSmall,
            color = Gold500,
            fontWeight = FontWeight.SemiBold,
            textAlign = TextAlign.Center
        )

        // Shul name
        if (activeShulName != null) {
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = stringResource(R.string.shul_lock_active_at, activeShulName!!),
                style = MaterialTheme.typography.bodyLarge,
                color = OffWhite.copy(alpha = 0.7f),
                textAlign = TextAlign.Center
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = stringResource(R.string.phone_is_silent),
            style = MaterialTheme.typography.bodyMedium,
            color = OffWhite.copy(alpha = 0.5f),
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.weight(0.4f))

        // Emergency call button
        EmergencyCallButton(
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Turn off button — large and clear
        Button(
            onClick = {
                ShulLockForegroundService.stopLock(context)
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(60.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = OffWhite.copy(alpha = 0.15f),
                contentColor = OffWhite
            )
        ) {
            Text(
                text = stringResource(R.string.turn_off_shul_lock),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
        }

        Spacer(modifier = Modifier.weight(0.15f))
    }
}

private fun getCurrentTime(): String {
    return SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
}
