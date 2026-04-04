import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, VStack } from "@/components/ui";
import { IMAGES } from "@/assets/images/images";

/**
 * Splash / index — Figma 1281:5046, 1166:6100 (section), 4081:19306, 7070:20310 (instances).
 * [Figma](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=1281-5046)
 *
 * Button (components/ui/button): Pressable > Animated.View; className is merged with base
 * "rounded-xl" and sizeClasses (default: min-h-12 px-6). To match Figma 4px radius we pass
 * containerStyle={{ borderRadius: 4 }} (overrides any class). Variants use semanticColors.
 */
const ROOT_VIEW_CLASS = "flex-1 bg-background";
const FIRST_BUTTON_CLASS =
  "min-h-12 h-12 w-full items-center justify-center pb-4";

export default function IndexScreen() {
  const { width, height } = useWindowDimensions();
  const { bottom } = useSafeAreaInsets();
  const heroHeight = (height * 453) / 812;
  const contentTop = (height * 37) / 812;

  return (
    <View className={ROOT_VIEW_CLASS}>
      <StatusBar style="light" />

      {/* Hero: 453/812 (Figma 375x453), image + gradient + 10% wash */}
      <View
        className="overflow-hidden bg-background self-center w-full"
        style={{ height: heroHeight, maxWidth: 375 }}
      >
        <Image
          source={IMAGES.ministersGroup}
          className="absolute inset-0 h-full w-full"
          resizeMode="contain"
          accessibilityLabel="Troott welcome illustration"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.93)", "rgba(0,0,0,0)"]}
          style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <View className="pointer-events-none absolute inset-0 bg-black/10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          width,
          paddingTop: contentTop,
          paddingBottom: bottom + 16,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <VStack className="w-full max-w-[343px] items-center" gap="8">
          {/* Logo + headline: gap 16 (Figma) */}
          <VStack className="w-full items-center" gap="4">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Troott"
              className="active:opacity-90"
              style={{ alignSelf: "center" }}
            >
              <Image
                source={IMAGES.png}
                resizeMode="contain"
                accessibilityLabel="Troott logo"
                style={{ width: 116, height: 32 }}
              />
            </Pressable>
            <Text
              variant="h5"
              weight="400"
              tone="primary"
              className="max-w-full text-center leading-6 text-white"
            >
              Experience sermons the way they{"\n"}
              were meant to be heard, ad-free.
            </Text>
          </VStack>

          {/* CTAs: Figma 48h, 4px radius, 343w, gap 16. Button applies rounded-xl by default; containerStyle forces 4px. */}
          <VStack className="w-full" gap="4">
            <Button
              variant="primary"
              size="default"
              className={FIRST_BUTTON_CLASS}
              containerStyle={{ borderRadius: 4 }}
              onPress={() => router.push("/enter-email")}
            >
              Create Account
            </Button>
            <Button
              variant="outline"
              size="default"
              className="min-h-12 h-12 mb-40 w-full items-center justify-center"
              containerStyle={{ borderRadius: 4, marginBottom: 40 }}
              onPress={() => router.push("/login")}
            >
              Log In
            </Button>
          </VStack>
        </VStack>
      </ScrollView>
    </View>
  );
}
