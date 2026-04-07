import "@expo/metro-runtime"
import { AppRegistry } from "react-native"
import { App } from "expo-router/build/qualified-entry"
import { renderRootComponent } from "expo-router/build/renderRootComponent"
import { enableScreens } from "react-native-screens"

enableScreens(true)
renderRootComponent(App)
AppRegistry.registerComponent("RNCarPlayScene", () => App)
