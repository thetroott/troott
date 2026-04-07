import React, { useCallback } from "react";
import { useFocusEffect } from "expo-router";

import FullPlayerTrackDetails from "./sermon/[id]";
import { useTrackStore } from "@/stores/player-store";

/**
 * Keep `showFullPlayer` in sync while this modal is focused so the mini player
 * hides even when `usePathname()` still reports the underlying tab (Expo Router + modals).
 */
export default function TrackScreen() {
  const setShowFullPlayer = useTrackStore((s) => s.setShowFullPlayer);

  useFocusEffect(
    useCallback(() => {
      setShowFullPlayer(true);
      return () => setShowFullPlayer(false);
    }, [setShowFullPlayer]),
  );

  return <FullPlayerTrackDetails />;
}
