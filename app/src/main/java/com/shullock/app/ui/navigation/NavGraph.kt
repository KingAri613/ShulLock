package com.shullock.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.shullock.app.ui.screens.AddEditShulScreen
import com.shullock.app.ui.screens.HomeScreen
import com.shullock.app.ui.screens.SettingsScreen
import com.shullock.app.ui.screens.ShulListScreen
import com.shullock.app.ui.screens.ShulLockActiveScreen

sealed class Screen(val route: String) {
    data object Home : Screen("home")
    data object ShulList : Screen("shul_list")
    data object AddShul : Screen("add_shul")
    data object EditShul : Screen("edit_shul/{shulId}") {
        fun createRoute(shulId: Long) = "edit_shul/$shulId"
    }
    data object Settings : Screen("settings")
    data object ShulLockActive : Screen("shul_lock_active")
}

@Composable
fun ShulLockNavGraph(
    navController: NavHostController,
    startDestination: String = Screen.Home.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable(Screen.Home.route) {
            HomeScreen(
                onNavigateToShulList = {
                    navController.navigate(Screen.ShulList.route)
                },
                onNavigateToSettings = {
                    navController.navigate(Screen.Settings.route)
                },
                onNavigateToActive = {
                    navController.navigate(Screen.ShulLockActive.route)
                }
            )
        }

        composable(Screen.ShulList.route) {
            ShulListScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToAddShul = {
                    navController.navigate(Screen.AddShul.route)
                },
                onNavigateToEditShul = { shulId ->
                    navController.navigate(Screen.EditShul.createRoute(shulId))
                }
            )
        }

        composable(Screen.AddShul.route) {
            AddEditShulScreen(
                shulId = null,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(
            route = Screen.EditShul.route,
            arguments = listOf(
                navArgument("shulId") { type = NavType.LongType }
            )
        ) { backStackEntry ->
            val shulId = backStackEntry.arguments?.getLong("shulId")
            AddEditShulScreen(
                shulId = shulId,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Settings.route) {
            SettingsScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.ShulLockActive.route) {
            ShulLockActiveScreen(
                onDeactivated = {
                    navController.popBackStack(Screen.Home.route, inclusive = false)
                }
            )
        }
    }
}
