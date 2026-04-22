import React, { useCallback, useEffect, useState } from "react";
import {
	AppState,
	Modal,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import {
	isEmbeddedNativeBridgeOk,
	logWorkletsRuntimeDiagnostics,
} from "@/engine/helpers/worklets-runtime-diagnostics";
import { theme } from "@/constants/theme";

/**
 * In __DEV__ on native, blocks the UI when the runtime looks like legacy Remote JS Debugging
 * (JS not on in-app Hermes). New Architecture bridgeless omits `nativeCallSyncHook` on
 * `global` even when healthy — that case is treated as OK in `isEmbeddedNativeBridgeOk`.
 */
export function EmbeddedBridgeGuard(): React.JSX.Element | null {
	if (!__DEV__ || Platform.OS === "web") return null;

	const [blocked, setBlocked] = useState(() => !isEmbeddedNativeBridgeOk());

	const recheck = useCallback(() => {
		logWorkletsRuntimeDiagnostics();
		setBlocked(!isEmbeddedNativeBridgeOk());
	}, []);

	useEffect(() => {
		logWorkletsRuntimeDiagnostics();
	}, []);

	useEffect(() => {
		const sub = AppState.addEventListener("change", (s) => {
			if (s === "active") recheck();
		});
		return () => sub.remove();
	}, [recheck]);

	if (!blocked) return null;

	return (
		<Modal visible transparent animationType="fade" statusBarTranslucent>
			<View style={styles.backdrop}>
				<View style={styles.card}>
					<Text style={styles.title}>Fix the JS bridge</Text>
					<Text style={styles.subtitle}>
						Reanimated / Worklets need JS on the in-app Hermes runtime (not Chrome as the
						JS engine). On New Architecture, the React Native dev menu may say Bridgeless;
						that is normal. Worklets also use a separate UI runtime—see Software Mansion’s
						“Runtime kinds” overview for the model.
					</Text>
					<ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
						<Text style={styles.step}>
							1. Open the dev menu (shake device, or Cmd+D / Ctrl+M on simulator).
						</Text>
						<Text style={styles.step}>
							2. On the Expo menu, &quot;Open JS debugger&quot; is OK—it attaches DevTools
							to Hermes in the app. If you opened &quot;Open React Native dev menu&quot;
							from the bottom, turn OFF &quot;Remote JS Debugging&quot; / &quot;Debug with
							Chrome&quot; there (that mode runs JS in Chrome and breaks Worklets).
						</Text>
						<Text style={styles.step}>
							3. Force-quit this app (swipe away from the app switcher), then reopen it.
						</Text>
						<Text style={styles.step}>
							4. Close any Chrome tab from legacy &quot;Debug JS Remotely&quot; where Chrome
							was the JS engine. Prefer Expo &quot;Open JS debugger&quot; or press j in the
							Metro terminal.
						</Text>
						<Text style={styles.step}>
							5. If it still shows: stop Metro, then from the repo root run
							pnpm start:mobile:clear (or pnpm --filter @troott/mobile run start:clear),
							then launch the dev client again.
						</Text>
						<Text style={styles.docRef}>
							https://docs.swmansion.com/react-native-worklets/docs/fundamentals/runtimeKinds
						</Text>
					</ScrollView>
					<Pressable
						style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
						onPress={recheck}
						accessibilityRole="button"
						accessibilityLabel="Re-check embedded JS bridge"
					>
						<Text style={styles.btnLabel}>I fixed it — check again</Text>
					</Pressable>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.92)",
		justifyContent: "center",
		padding: theme.sizes.spacing.lg,
	},
	card: {
		backgroundColor: theme.colors.grey[900],
		borderRadius: theme.sizes.radius.md,
		borderWidth: 1,
		borderColor: theme.colors.grey[600],
		padding: theme.sizes.spacing.lg,
		maxHeight: "88%",
	},
	title: {
		color: theme.colors.white[50],
		fontSize: 20,
		fontWeight: "700",
		marginBottom: theme.sizes.spacing.sm,
	},
	subtitle: {
		color: theme.colors.grey[200],
		fontSize: 14,
		lineHeight: 20,
		marginBottom: theme.sizes.spacing.md,
	},
	scroll: {
		maxHeight: 320,
		marginBottom: theme.sizes.spacing.md,
	},
	scrollContent: {
		paddingBottom: theme.sizes.spacing.sm,
	},
	step: {
		color: theme.colors.grey[100],
		fontSize: 14,
		lineHeight: 22,
		marginBottom: theme.sizes.spacing.sm,
	},
	docRef: {
		color: theme.colors.grey[400],
		fontSize: 12,
		lineHeight: 18,
		marginTop: theme.sizes.spacing.xs,
	},
	btn: {
		backgroundColor: theme.colors.teal[500],
		paddingVertical: theme.sizes.spacing.md,
		borderRadius: theme.sizes.radius.sm,
		alignItems: "center",
	},
	btnPressed: {
		opacity: 0.85,
	},
	btnLabel: {
		color: theme.colors.grey[900],
		fontSize: 16,
		fontWeight: "600",
	},
});
