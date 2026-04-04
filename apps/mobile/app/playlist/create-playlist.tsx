import { View } from "react-native";
import React from "react";
import ScreenModalAndroidView from "@/components/ui/screen-modal-android";
import Header from "@/components/containers/shared/headers";
import { ScrollView } from "react-native-gesture-handler";
import CreatePlaylistForm from "@/components/containers/playlist/create-playlist-form";

const CreatePlayListScreen = () => {
  return (
    <ScreenModalAndroidView>
      <View className="flex-1 gap-4 rounded-t-2xl bg-neutral-900 py-4">
        <Header variant="playlist" title="Create Playlist" />
        <ScrollView className="flex-1" nestedScrollEnabled>
          <View className="gap-4 px-4">
            <CreatePlaylistForm />
          </View>
        </ScrollView>
      </View>
    </ScreenModalAndroidView>
  );
};

export default CreatePlayListScreen;