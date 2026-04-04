import React from "react";
import { View } from "react-native";
import ScreenView from "@/components/layouts/screenview";
import { Notification, ProfileCircle, SearchNormal } from "iconsax-react-nativejs";
import Text from "@/components/ui/text";
import { theme } from "@/constants/theme";
import Input from "@/components/ui/input";
import { RecentlyAdded } from "@/components/containers/tabs/search";

const Search = () => {
  return (
    <ScreenView>
      <Header />
      <Input
        leftIcon={<SearchNormal size={20} color={theme.colors.white[100]} />}
        placeholder="Seach sermons, pastors, topics..."
      />
      <RecentlyAdded />
    </ScreenView>
  );
};

function Header() {
  return (
    <View className="flex-row justify-between items-center mb-4">
      <View className="flex-row gap-2 items-center">
        <View className="bg-neutral-800 p-2 rounded-full">
          <ProfileCircle color={theme.colors.white[100]} />
        </View>
        <Text size="lg" color={theme.colors.white[100]} weight="semiBold">
          Search
        </Text>
      </View>
      <Notification variant="Bold" />
    </View>
  );
}

export default Search;
