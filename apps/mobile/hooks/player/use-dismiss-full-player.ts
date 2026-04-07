import { useCallback } from "react"
import type { Href } from "expo-router"
import { useRouter } from "expo-router"

import { useTrackStore } from "@/stores/player-store"

/**
 * Closes the full-player UI and returns to the screen that was visible when the user
 * opened it from the mini player ({@link fullPlayerReturnPath}), using `dismissTo` when set.
 */
export function useDismissFullPlayer() {
	const router = useRouter()
	const setShowFullPlayer = useTrackStore((s) => s.setShowFullPlayer)

	return useCallback(() => {
		setShowFullPlayer(false)

		const returnPath = useTrackStore.getState().fullPlayerReturnPath
		useTrackStore.getState().setFullPlayerReturnPath(null)

		if (returnPath && returnPath.length > 0) {
			router.dismissTo(returnPath as Href)
			return
		}

		if (router.canDismiss()) {
			router.dismiss()
			return
		}

		if (router.canGoBack()) {
			router.back()
		}
	}, [router, setShowFullPlayer])
}
