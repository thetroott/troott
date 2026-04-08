import { Pressable, StyleSheet, View } from "react-native";
import React from "react";
import ScreenView from "@/components/layouts/screenview";
// import {
//   CategoryItem,
//   LibraryHeader,
//   PlayListView,
//   SortItem,
// } from "@/components/library";
import { ScrollView } from "react-native-gesture-handler";
import Button from "@/components/ui/button";
import { FlashList } from "@shopify/flash-list";
import { theme } from "@/constants/theme";
import Text from "@/components/ui/text";
import { OutlineIcons, SolidIcons } from "@/assets/icons";
import {
  BottomSheetModal,
  BottomSheetRef,
} from "@/components/ui/bottom-sheet-modal";
//import { PlayListCardItem, TrackCard } from "@/components/tracks";
import { Grid1, Heart } from "iconsax-react-nativejs";
//import { Tracks } from "@/_mock";
import Animated from "react-native-reanimated";
import { router } from "expo-router";
import { CategoryItem, LibraryHeader, SortItem } from "@/components/containers/tabs/library";
import { PlayListCardItem, TrackCard } from "@/components/containers/player-old";
import { loadSermons as Tracks } from "@/_data/loader";
import { tracks } from "@/_data/_mock/tracks";

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
  const [displayStyle, setDisplayStyle] = React.useState<"grid" | "list">(
    "list"
  );
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
        onPress: () => {
          setSortValue("Recent Activities");
        },
      },
      {
        name: "Listening History",
        selected: sortValue === "Listening History",
        onPress: () => {
          setSortValue("Listening History");
        },
      },
      {
        name: "Alphabetical",
        selected: sortValue === "Alphabetical",
        onPress: () => {
          setSortValue("Alphabetical");
        },
      },
    ],
    Playlist: [
      {
        name: "Recently Updated",
        selected: sortValue === "Recent Updated",
        onPress: () => {
          setSortValue("Recent Updated");
        },
      },
      {
        name: "Recently Added",
        selected: sortValue === "Recently Added",
        onPress: () => {
          setSortValue("Recently Added");
        },
      },
      {
        name: "Alphabetical",
        selected: sortValue === "Alphabetical",
        onPress: () => {
          setSortValue("Alphabetical");
        },
      },
    ],
    Sermon: [
      {
        name: "Recent Activities",
        selected: sortValue === "Recent Activities",
        onPress: () => setSortValue("Recent Activities"),
      },
      {
        name: "Alphabetical",
        selected: sortValue === "Alphabetical",
        onPress: () => setSortValue("Alphabetical"),
      },
    ],
    Series: [
      {
        name: "Recent Activities",
        selected: sortValue === "Recent Activities",
        onPress: () => setSortValue("Recent Activities"),
      },
      {
        name: "Alphabetical",
        selected: sortValue === "Alphabetical",
        onPress: () => setSortValue("Alphabetical"),
      },
    ],
    Preacher: [
      {
        name: "Alphabetical",
        selected: sortValue === "Alphabetical",
        onPress: () => setSortValue("Alphabetical"),
      },
    ],
  };
  function handleFloatingButtonPress (){
    router.push('/playlist/create-playlist')
  }
  return (
    <ScreenView>
      <LibraryHeader />
      <ScrollView
        contentContainerStyle={{
          gap: theme.sizes.spacing.lg,
        }}
        nestedScrollEnabled
      >
        <FlashList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          renderItem={({ item }) => (
            <CategoryItem
              name={item.name}
              id={item.id}
              onPress={() => setSelectedCategory(item.name as categoryKey)}
              selected={item.name === selectedCategory}
            />
          )}
        />
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: theme.sizes.spacing.md,
          }}
        >
          {categories
            .find((item) => item.name === selectedCategory)
            ?.subs.map((sub, index) => (
              <Animated.View key={sub + index}>
                <Button
                  variant="secondary"
                  style={{
                    marginBottom: theme.sizes.spacing.sm,
                    backgroundColor: subCategories.includes(sub)
                      ? theme.colors.teal[500]
                      : theme.colors.grey[600],
                    padding: theme.sizes.spacing.sm,
                    borderRadius: theme.sizes.radius.full,
                    paddingHorizontal: theme.sizes.spacing.md,
                  }}
                  onPress={() => handleAddSubCategory(sub)}
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
                </Button>
              </Animated.View>
            ))}
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.sizes.spacing.sm,
            }}
            onPress={openBottomSheet}
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
          >
            {displayStyle === "list" && (
              <SolidIcons.ListBulletIcon color={theme.colors.white[50]} size={24} />
            )}
            {displayStyle === "grid" && <Grid1 color={theme.colors.white[50]} />}
          </Pressable>
        </View>
        {sortValue === "Recent Activities" && (
          <AllElements isGrid={displayStyle === "grid"} />
        )}
        {sortValue === "Listening History" && (
          <ListeningHistory displayStyle={displayStyle} />
        )}
      </ScrollView>

      <BottomSheetModal.Root ref={sheetRef}>
        <BottomSheetModal.Title>
          <Text weight="medium" size="base" color={theme.colors.white[50]}>
            Sort By
          </Text>
        </BottomSheetModal.Title>
        <BottomSheetModal.Content>
          <View
            style={{
              gap: theme.sizes.spacing.lg,
              marginTop: theme.sizes.spacing.lg,
            }}
          >
            {(sortItemsMap[selectedCategory]||[]).map((item, index) => (
              <SortItem {...item} key={index} />
            ))}
          </View>
        </BottomSheetModal.Content>
      </BottomSheetModal.Root>
      {/* floating action button */}
      <Pressable
        style={{
          padding: theme.sizes.spacing.md,
          borderRadius: theme.sizes.radius.sm,
          backgroundColor: theme.colors.teal[500],
          position: "absolute",
          bottom: 120,
          right: 20,
        }}
        onPress={handleFloatingButtonPress}
      >
        <OutlineIcons.PlusIcon color={theme.colors.black[50]} size={24} />
      </Pressable>
    </ScreenView>
  );
};

function AllElements({ isGrid = false }) {
  return (
    <View
      style={{
        gap: theme.sizes.spacing.md,
        flexDirection: isGrid ? "row" : "column",
        flexWrap: isGrid ? "wrap" : "nowrap",
        justifyContent: isGrid ? "space-between" : "flex-start",
      }}
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

interface ListeningHistoryProps {
  displayStyle?: "grid" | "list";
}
const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);
function ListeningHistory({ displayStyle = "list" }: ListeningHistoryProps) {
  return (
    <AnimatedFlashList
      data={[1, 2, 3, 4, 5, 6, 7, 8]}
      keyExtractor={(item, index) => index + "group"}
      numColumns={displayStyle === "list" ? 1 : 2}
      snapToInterval={theme.sizes.screen.width * 0.8}
      showsHorizontalScrollIndicator={false}
      decelerationRate={-1}
      renderItem={({ item, index }) => {
        const track = tracks[index % 3];
        return (
          <View style={{ gap: 10 }}>
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

export default Library;

const styles = StyleSheet.create({});
