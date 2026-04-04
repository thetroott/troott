import { Image, Pressable, StyleSheet, View } from "react-native";
import React from "react";
import { SolidIcons } from "@/assets/icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/ui/forminput";
import { theme } from "@/constants/theme";
import Text from "@/components/ui/text";
import * as ImagePicker from "expo-image-picker";
import FormSwitch from "@/components/ui/form-switch";
import Button from "@/components/ui/button";
import { PlayListValidationSchema, PlayListValidationSchemaType } from "@/validation/playlist";
import { IncognitoIcon } from "@/components/containers/shared/Icons";

const CreatePlaylistForm = () => {
  const { control, handleSubmit, formState, setValue, getValues } =
    useForm<PlayListValidationSchemaType>({
      defaultValues: {
        title: "",
        description: "",
        image: "",
        collaborative: false,
        private: false,
      },
      resolver: zodResolver(PlayListValidationSchema),
    });

  async function handleImagePicker() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setValue("image", imageUri);
      setImage(imageUri);
    } else {
      console.log("Image picker was canceled");
    }
  }
  const [image, setImage] = React.useState<string | null>(null);

  return (
    <View>
      <Pressable
        style={styles.camera}
        onPress={handleImagePicker}
        accessibilityRole="button"
        accessibilityLabel="Pick playlist cover"
      >
        {!image && (
          <SolidIcons.CameraIcon color={theme.colors.white[50]} size={30} />
        )}
        {image && (
          <Image
            source={{ uri: image }}
            className="h-full w-full rounded-[15px]"
          />
        )}
      </Pressable>
      <View className="gap-6">
        <FormInput
          label="Name"
          control={control}
          name="title"
          placeholder="Playlist name"
        />
        <FormInput
          label="Description"
          control={control}
          name="title"
          placeholder="Uplift, inspire and share the word"
        />

        <View className="mt-6 gap-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="rounded-full bg-neutral-700 p-4">
                <SolidIcons.UsersIcon
                  color={theme.colors.grey[200]}
                  size={20}
                />
              </View>
              <View className="gap-0.5">
                <Text className="text-neutral-200" size="base">
                  Collaborative
                </Text>
                <Text size="xs" className="text-neutral-500">
                  All others to add tracks
                </Text>
              </View>
            </View>
            <FormSwitch control={control} name="collaborative" />
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="rounded-full bg-neutral-700 p-4">
                <IncognitoIcon
                  color={theme.colors.grey[200]}
                  height={20}
                  width={20}
                />
              </View>
              <View className="gap-0.5">
                <Text className="text-neutral-200" size="base">
                  Private
                </Text>
              </View>
            </View>
            <FormSwitch control={control} name="private" />
          </View>
        </View>
        <Button
          label="Create playlist"
          className="mt-8 w-full"
        />
      </View>
    </View>
  );
};

export default CreatePlaylistForm;

// Allowed exception: runtime dimensions (screen width) and shadow for camera button.
const styles = StyleSheet.create({
  camera: {
    borderRadius: 15,
    backgroundColor: theme.colors.grey[700],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    width: theme.sizes.screen.width * 0.4,
    height: theme.sizes.screen.width * 0.4,
    alignSelf: "center",
    elevation: 5,
    shadowColor: theme.colors.grey[500],
    marginTop: theme.sizes.spacing.md,
  },
});
