// `@expo/metro-runtime` must be first (same contract as `expo-router/entry-classic`).
// Import `react-native` before `react-native-reanimated`: Reanimated runs `executeOnUIRuntimeSync`
// at module load; on Android New Architecture that can run before `PlatformConstants` is
// registered if Reanimated is evaluated first.
import '@expo/metro-runtime';
import { AppRegistry } from 'react-native';
import 'react-native-reanimated';
import { App } from 'expo-router/build/qualified-entry';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';
import { enableScreens } from 'react-native-screens';

enableScreens(true);
renderRootComponent(App);
AppRegistry.registerComponent('RNCarPlayScene', () => App);
