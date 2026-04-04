import React from "react";
import { Tabs } from "expo-router";
import { TabBar } from "@/components/containers/navigation";
import { MiniPlayer } from "@/components/containers/player-old";

const TabsLayout = () => {
  return (
    <>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { flex: 1, backgroundColor: "#171717" },
        }}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="search" />
        <Tabs.Screen name="library" />
        <Tabs.Screen name="profile" />
      </Tabs>

      <MiniPlayer />
    </>
  );
};

export default TabsLayout;
