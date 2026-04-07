import Constants, { ExecutionEnvironment } from "expo-constants"
import { Platform } from "react-native"

export type WorkletsRuntimeSnapshot = {
	platform: typeof Platform.OS
	/** True when running on the Hermes bytecode VM embedded in the native app. */
	hermes: boolean
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
 * - `nativeCallSyncHook: false` on iOS/Android: expect `[Worklets] addListener` / SharedValue warnings;
 *   disable Remote JS Debugging and use on-device debugging (Chrome connected to Hermes is not the same as legacy remote JS).
 * - `hermes: false` on native: often same root cause as above, or a non-Hermes build.
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
	const nativeCallSyncHook = typeof g.nativeCallSyncHook === "function"
	const likelyBrokenEmbeddedJsBridge =
		Platform.OS !== "web" && !nativeCallSyncHook

	const snapshot: WorkletsRuntimeSnapshot = {
		platform: Platform.OS,
		hermes,
		nativeCallSyncHook,
		likelyBrokenEmbeddedJsBridge,
		expoExecutionEnvironment: Constants.executionEnvironment,
	}

	console.log("[WorkletsRuntime]", snapshot)

	if (likelyBrokenEmbeddedJsBridge) {
		console.warn(
			"[WorkletsRuntime] `nativeCallSyncHook` is missing; JS is probably not running in the embedded React Native engine. " +
				"Reanimated Worklets and JSI modules (e.g. MMKV) will misbehave. Turn off legacy Remote JS Debugging, fully reload the app, " +
				"and use DevTools attached to the on-device Hermes runtime.",
		)
	}
}
