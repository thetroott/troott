import React from "react";
import { Tabs } from "expo-router";
import { theme } from "@/constants/theme";
import FullPlayerTrackDetails from "../sermon/[id]";
import { TabBar } from "@/components/containers/navigation";
import { useIsNowPlayingStackRouteFocused } from "@/hooks/navigation/now-playing-route";

const FullPlayerInTabs = FullPlayerTrackDetails as React.ComponentType<{
  embedInTabsShell?: boolean;
}>;

const TabsLayout = () => {
  /** Avoid two `FullPlayerTrackDetails` trees (tabs embed + `track` modal) fighting the same store/effects. */
  const nowPlayingModalFocused = useIsNowPlayingStackRouteFocused();

  return (
    <>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: false,
          sceneStyle: { flex: 1, backgroundColor: theme.colors.grey[900] },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{ tabBarShowLabel: true, title: "Home" }}
        />
        <Tabs.Screen
          name="search"
          options={{ tabBarShowLabel: true, title: "Search" }}
        />
        <Tabs.Screen
          name="library"
          options={{ tabBarShowLabel: true, title: "Library" }}
        />
        <Tabs.Screen
          name="profile"
          options={{ tabBarShowLabel: true, title: "Profile" }}
        />
      </Tabs>

      {!nowPlayingModalFocused && <FullPlayerInTabs embedInTabsShell />}
    </>
  );
};

export default TabsLayout;
