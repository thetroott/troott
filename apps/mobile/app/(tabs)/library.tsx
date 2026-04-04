import React from "react";
import { Pressable, View } from "react-native";
import ScreenView from "@/components/layouts/screenview";
import { ScrollView } from "react-native-gesture-handler";
import { FlashList } from "@shopify/flash-list";
import { theme } from "@/constants/theme";
import Text from "@/components/ui/text";
import { Heart } from "iconsax-react-nativejs";
import { OutlineIcons, SolidIcons } from "@/assets/icons";
import {
  BottomSheetModal,
  BottomSheetRef,
} from "@/components/ui/bottom-sheet-modal";
import Animated from "react-native-reanimated";
import { router } from "expo-router";
import {
  CategoryItem,
  LibraryHeader,
  PlayListView,
  SortItem,
} from "@/components/containers/tabs/library";
import { PlayListCardItem, TrackCard } from "@/components/containers/player-old";
import { tracks } from "@/_data/_mock/tracks";
import { cn } from "@/lib/utils";

type categoryKey = "All" | "Playlist" | "Sermon" | "Series" | "Preacher";

const Library = () => {
  const categories = [
    { id: 1, name: "All", subs: [] },
    { id: 2, name: "Playlist", subs: ["All playlist", "By You", "By Troott"] },
    { id: 3, name: "Sermon", subs: ["All Sermons", "Downloaded"] },
    { id: 4, name: "Series", subs: ["All Series", "Downloaded"] },
    { id: 5, name: "Preacher", subs: [] },
  ];
  const sheetRef = React.useRef<BottomSheetRef>(null);
  function openBottomSheet() {
    sheetRef.current?.open();
  }
  const [sortValue, setSortValue] = React.useState<string>("Recent Activities");
  const [displayStyle, setDisplayStyle] = React.useState<"grid" | "list">("list");
  const [selectedCategory, setSelectedCategory] =
    React.useState<categoryKey>("All");
  const [subCategories, setSubCategories] = React.useState<string[]>([]);
  const handleAddSubCategory = (sub: string) => {
    setSubCategories((prev) =>
      prev.includes(sub) ? prev.filter((item) => item !== sub) : [...prev, sub]
    );
  };
  const sortItemsMap: Record<
    categoryKey,
    { selected?: boolean; onPress?: () => void; name?: string }[]
  > = {
    All: [
      {
        name: "Recent Activities",
        selected: sortValue === "Recent Activities",
        onPress: () => setSortValue("Recent Activities"),
      },
      {
        name: "Listening History",
        selected: sortValue === "Listening History",
        onPress: () => setSortValue("Listening History"),
      },
      {
        name: "Alphabetical",
        selected: sortValue === "Alphabetical",
        onPress: () => setSortValue("Alphabetical"),
      },
    ],
    Playlist: [
      {
        name: "Recently Updated",
        selected: sortValue === "Recent Updated",
        onPress: () => setSortValue("Recent Updated"),
      },
      {
        name: "Recently Added",
        selected: sortValue === "Recently Added",
        onPress: () => setSortValue("Recently Added"),
      },
      {
        name: "Alphabetical",
        selected: sortValue === "Alphabetical",
        onPress: () => setSortValue("Alphabetical"),
      },
    ],
    Sermon: [
      { name: "Recent Activities", selected: sortValue === "Recent Activities", onPress: () => setSortValue("Recent Activities") },
      { name: "Alphabetical", selected: sortValue === "Alphabetical", onPress: () => setSortValue("Alphabetical") },
    ],
    Series: [
      { name: "Recent Activities", selected: sortValue === "Recent Activities", onPress: () => setSortValue("Recent Activities") },
      { name: "Alphabetical", selected: sortValue === "Alphabetical", onPress: () => setSortValue("Alphabetical") },
    ],
    Preacher: [
      { name: "Alphabetical", selected: sortValue === "Alphabetical", onPress: () => setSortValue("Alphabetical") },
    ],
  };
  function handleFloatingButtonPress() {
    router.push("/playlist/create-playlist");
  }
  const categoriesComponentMap: Record<categoryKey, React.JSX.Element> = {
    All: <View />,
    Playlist: <PlayListView isGrid={displayStyle == "grid"} />,
    Sermon: <View />,
    Series: <View />,
    Preacher: <View />,
  };
  return (
    <ScreenView>
      <LibraryHeader />
      <ScrollView nestedScrollEnabled>
        <View className="gap-6">
        <FlashList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          estimatedItemSize={100}
          renderItem={({ item }) => (
            <CategoryItem
              name={item.name}
              id={item.id}
              onPress={() => setSelectedCategory(item.name as categoryKey)}
              selected={item.name === selectedCategory}
            />
          )}
        />
        <View className="flex-row flex-wrap gap-4">
          {categories
            .find((item) => item.name === selectedCategory)
            ?.subs.map((sub, index) => (
              <Animated.View key={sub + index}>
                <Pressable
                  className={cn(
                    "mb-2 py-2 rounded-full px-4",
                    subCategories.includes(sub)
                      ? "bg-teal-500"
                      : "bg-neutral-600"
                  )}
                  onPress={() => handleAddSubCategory(sub)}
                  accessibilityRole="button"
                  accessibilityLabel={sub}
                >
                  <Text
                    size="xs"
                    color={
                      subCategories.includes(sub)
                        ? theme.colors.grey[700]
                        : theme.colors.grey[300]
                    }
                  >
                    {sub}
                  </Text>
                </Pressable>
              </Animated.View>
            ))}
        </View>
        <View className="flex-row justify-between items-center">
          <Pressable
            className="flex-row items-center gap-2"
            onPress={openBottomSheet}
            accessibilityRole="button"
            accessibilityLabel="Sort options"
          >
            <SolidIcons.ArrowsUpDownIcon color={theme.colors.white[50]} />
            <Text color={theme.colors.white[50]} weight="medium" size="base">
              {sortValue}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setDisplayStyle((prev) => (prev === "grid" ? "list" : "grid"));
            }}
            accessibilityRole="button"
            accessibilityLabel="Toggle grid or list view"
          >
            {displayStyle === "list" && (
              <SolidIcons.ListBulletIcon
                color={theme.colors.white[50]}
                size={24}
              />
            )}
            {displayStyle === "grid" && (
              <SolidIcons.Squares2X2Icon color={theme.colors.white[50]} />
            )}
          </Pressable>
        </View>
        {sortValue === "Recent Activities" && (
          <AllElements isGrid={displayStyle === "grid"} />
        )}
        {sortValue === "Listening History" && (
          <ListeningHistory displayStyle={displayStyle} />
        )}
        </View>
      </ScrollView>

      <BottomSheetModal.Root ref={sheetRef}>
        <BottomSheetModal.Title>
          <Text weight="medium" size="base" color={theme.colors.white[50]}>
            Sort By
          </Text>
        </BottomSheetModal.Title>
        <BottomSheetModal.Content>
          <View className="gap-6 mt-6">
            {(sortItemsMap[selectedCategory] || []).map((item, index) => (
              <SortItem {...item} key={index} />
            ))}
          </View>
        </BottomSheetModal.Content>
      </BottomSheetModal.Root>

      <Pressable
        className="p-4 rounded bg-teal-500 absolute bottom-[120px] right-5"
        onPress={handleFloatingButtonPress}
        accessibilityRole="button"
        accessibilityLabel="Create playlist"
      >
        <OutlineIcons.PlusIcon color={theme.colors.black[50]} size={24} />
      </Pressable>
    </ScreenView>
  );
};

function AllElements({ isGrid = false }: { isGrid?: boolean }) {
  return (
    <View
      className={cn(
        "gap-4",
        isGrid ? "flex-row flex-wrap justify-between" : "flex-col"
      )}
    >
      <PlayListCardItem
        title="Liked Sermon"
        description="Auto playlist - 6 sermons"
        image=""
        id=""
        icon={Heart}
        variant={isGrid ? "large" : "small"}
        cardStyle={{
          width: isGrid ? theme.sizes.screen.width * 0.42 : "100%",
        }}
      />
      <PlayListCardItem
        title="Favortite Preachers"
        description="5 ministers"
        image=""
        id=""
        icon={OutlineIcons.UserPlusIcon}
        variant={isGrid ? "large" : "small"}
        cardStyle={{
          width: isGrid ? theme.sizes.screen.width * 0.42 : "100%",
        }}
      />
      <PlayListCardItem
        title="Downloads"
        description="23 sermons"
        image=""
        id=""
        icon={OutlineIcons.ArrowDownIcon}
        variant={isGrid ? "large" : "small"}
        cardStyle={{
          width: isGrid ? theme.sizes.screen.width * 0.42 : "100%",
        }}
      />
      <PlayListCardItem
        title="My Playlists"
        description="2 playlists"
        image="https://picsum.photos/200/300"
        id=""
        variant={isGrid ? "large" : "small"}
        cardStyle={{
          width: isGrid ? theme.sizes.screen.width * 0.42 : "100%",
        }}
      />
    </View>
  );
}

function ListeningHistory({
  displayStyle = "list",
}: {
  displayStyle?: "grid" | "list";
}) {
  return (
    <AnimatedFlashList
      data={[1, 2, 3, 4, 5, 6, 7, 8]}
      keyExtractor={(item, index) => index + "group"}
      numColumns={displayStyle === "list" ? 1 : 2}
      snapToInterval={theme.sizes.screen.width * 0.8}
      showsHorizontalScrollIndicator={false}
      decelerationRate={-1}
      estimatedItemSize={290}
      renderItem={({ item, index }) => {
        const track = tracks[index % 3];
        return (
          <View className="gap-2">
            <TrackCard
              key={index + "track"}
              title={track.title ?? ""}
              minister={track.minister ?? ""}
              duration={track.duration ?? ""}
              image={track.image ?? ""}
              sermon={track.sermon}
              variant={displayStyle === "list" ? "small" : "large"}
              cardStyle={{
                width:
                  displayStyle === "list"
                    ? "100%"
                    : theme.sizes.screen.width * 0.44,
                marginBottom: displayStyle === "list" ? 0 : 20,
              }}
            />
          </View>
        );
      }}
    />
  );
}

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

export default Library;
