import { Pressable, View } from "react-native";
import React from "react";
import Text from "@/components/ui/text";
import Header from "@/components/containers/shared/headers";
import { theme } from "@/constants/theme";
import Input from "@/components/ui/input";
import { SearchNormal } from "iconsax-react-nativejs";
import { SolidIcons } from "@/assets/icons";
import ScreenModalAndroidView from "@/components/ui/screen-modal-android";
import { ScrollView } from "react-native-gesture-handler";
import { router } from "expo-router";
import { PlayListCardItem } from "@/components/containers/player-old";

const UserPlayList = () => {
  return (
    <ScreenModalAndroidView>
      <View className="flex-1 gap-4 rounded-t-2xl bg-neutral-900 py-4">
        <Header title="Your Playlist" variant="playlist" />
        <Input
          placeholder="Find in playlist"
          leftIcon={<SearchNormal color={theme.colors.grey[200]} size={18} />}
          placeholderTextColor={theme.colors.grey[200]}
          containerstyle={{
            backgroundColor: theme.colors.grey[700],
            borderRadius: theme.sizes.radius.base,
            borderWidth: 0,
            marginHorizontal: theme.sizes.spacing.md,
          }}
        />
        <ScrollView className="flex-1" nestedScrollEnabled>
          <View className="gap-4 px-4">
            <NewPlayList />
            <AllPlayList />
          </View>
        </ScrollView>
      </View>
    </ScreenModalAndroidView>
  );
};

function NewPlayList() {
  return (
    <Pressable
      className="mt-4 flex-row items-center gap-4"
      onPress={() => router.replace("/playlist/create-playlist")}
      accessibilityRole="button"
      accessibilityLabel="Create new playlist"
    >
      <View className="items-center justify-center rounded-2xl bg-neutral-800 p-6">
        <SolidIcons.PlusIcon color={theme.colors.white[50]} size={22} />
      </View>
      <Text className="text-neutral-100" size="md">
        New playlist
      </Text>
    </Pressable>
  );
}

function AllPlayList() {
  return (
    <View className="mt-6 gap-6">
      <Text className="text-neutral-200" size="md" weight="medium">
        All Playlists
      </Text>
      <View className="gap-4">
        {[...Array(2)].map((_, index) => (
          <PlayListCardItem
            title="Loved Sermon"
            description="Auto playlist"
            image=""
            id=""
            key={index}
          />
        ))}
      </View>
    </View>
  );
}

export default UserPlayList;
