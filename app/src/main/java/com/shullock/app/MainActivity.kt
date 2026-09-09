package com.shullock.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.shullock.app.state.ShulLockState
import com.shullock.app.ui.navigation.Screen
import com.shullock.app.ui.navigation.ShulLockNavGraph
import com.shullock.app.ui.theme.ShulLockTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            ShulLockTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    val navController = rememberNavController()
                    val isActive by ShulLockState.isActive.collectAsState()

                    // If Shul Lock is active, start on the active screen
                    val startDestination = if (isActive) {
                        Screen.ShulLockActive.route
                    } else {
                        Screen.Home.route
                    }

                    ShulLockNavGraph(
                        navController = navController,
                        startDestination = startDestination
                    )
                }
            }
        }
    }
}
