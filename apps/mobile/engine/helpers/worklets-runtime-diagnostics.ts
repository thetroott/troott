import Constants, { ExecutionEnvironment } from "expo-constants"
import { Platform } from "react-native"

function hasEmbeddedHermes(): boolean {
	const g = globalThis as { HermesInternal?: unknown }
	return (
		g.HermesInternal !== undefined &&
		g.HermesInternal !== null &&
		typeof g.HermesInternal === "object"
	)
}

/**
 * True when JS runs on the normal in-app runtime (not legacy Remote JS Debugging).
 * In Bridgeless / New Architecture, `global.nativeCallSyncHook` is often unset even though
 * Hermes and JSI are fine — see `global.RN$Bridgeless`.
 */
export function isEmbeddedNativeBridgeOk(): boolean {
	if (Platform.OS === "web") return true

	const g = globalThis as {
		nativeCallSyncHook?: unknown
		RN$Bridgeless?: boolean
	}

	if (typeof g.nativeCallSyncHook === "function") return true

	if (g.RN$Bridgeless === true && hasEmbeddedHermes()) return true

	return false
}

export type WorkletsRuntimeSnapshot = {
	platform: typeof Platform.OS
	/** True when running on the Hermes bytecode VM embedded in the native app. */
	hermes: boolean
	/** New Architecture bridgeless mode (no legacy `nativeCallSyncHook` on `global`). */
	bridgeless: boolean
	/**
	 * When true, synchronous native module calls from JS are wired (normal on-device RN).
	 * False often means JS is not executing in the embedded engine (e.g. legacy remote debugging).
	 */
	nativeCallSyncHook: boolean
	/**
	 * Heuristic: on native, missing `nativeCallSyncHook` strongly correlates with Worklets/MMKV/JSI failures.
	 */
	likelyBrokenEmbeddedJsBridge: boolean
	expoExecutionEnvironment: ExecutionEnvironment | string | number | null | undefined
}

/**
 * Logs a one-line snapshot of the JS runtime as it relates to Reanimated Worklets and JSI.
 * Call once early in startup (after `import "react-native-reanimated"` is fine).
 *
 * Interpreting results:
 * - `nativeCallSyncHook: false` with `bridgeless: true` and `hermes: true`: normal New Architecture; not a remote-debugger issue.
 * - `nativeCallSyncHook: false` without bridgeless on native: often legacy Remote JS Debugging — use Hermes / Expo JS debugger only.
 * - `hermes: false` on native: often remote debugger or a non-Hermes build.
 *
 * Reanimated 4 + Fabric: never return `transformOrigin` from `useAnimatedStyle` (UI thread calls
 * non-worklet `processTransformOrigin`). Put `transformOrigin` on a static `style` prop instead.
 * @see https://github.com/software-mansion/react-native-reanimated/issues/8739
 * @see https://docs.swmansion.com/react-native-worklets/docs/guides/troubleshooting#tried-to-synchronously-call-a-non-worklet-function-on-the-ui-thread
 */
export function logWorkletsRuntimeDiagnostics(): void {
	if (!__DEV__) return

	const g = globalThis as typeof globalThis & {
		HermesInternal?: unknown
		nativeCallSyncHook?: unknown
	}

	const hermes =
		g.HermesInternal !== undefined &&
		g.HermesInternal !== null &&
		typeof g.HermesInternal === "object"
	const bridgeless = (globalThis as { RN$Bridgeless?: boolean }).RN$Bridgeless === true
	const nativeCallSyncHook = typeof g.nativeCallSyncHook === "function"
	const embeddedOk = isEmbeddedNativeBridgeOk()
	const likelyBrokenEmbeddedJsBridge = Platform.OS !== "web" && !embeddedOk

	const snapshot: WorkletsRuntimeSnapshot = {
		platform: Platform.OS,
		hermes,
		bridgeless,
		nativeCallSyncHook,
		likelyBrokenEmbeddedJsBridge,
		expoExecutionEnvironment: Constants.executionEnvironment,
	}

	if (likelyBrokenEmbeddedJsBridge) {
		// Use a single warn (not console.error): Metro maps errors to the wrong line and this is
		// an environment/setup issue, not an uncaught exception in app code.
		console.warn(
			"[WorkletsRuntime] Embedded JS runtime looks wrong (not Hermes in-app, or bridge not ready). " +
				"If you use legacy Remote JS Debugging, turn it off and use Hermes / Expo Open JS Debugger.\n" +
				`Snapshot: ${JSON.stringify(snapshot)}\n` +
				"Fix: dev menu → turn OFF Remote JS Debugging / Debug with Chrome (if present) → force-quit → reopen.\n" +
				"https://docs.swmansion.com/react-native-worklets/docs/guides/troubleshooting#tried-to-synchronously-call-a-non-worklet-function-on-the-ui-thread",
		)
	} else {
		console.log("[WorkletsRuntime]", snapshot)
	}
}
