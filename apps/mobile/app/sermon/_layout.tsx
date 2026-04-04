import { Platform } from "react-native";
import React from "react";
import { Stack } from "expo-router";

/** Only `app/sermon/*` routes belong here; playlist screens live under `app/playlist/`. */
const SermonLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "transparent",
          flex: 1,
          marginTop: Platform.select({ ios: 80, android: 60 }),
        },
      }}
    />
  );
};

export default SermonLayout;
