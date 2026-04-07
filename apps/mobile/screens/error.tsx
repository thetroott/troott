import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import customStyles from "../assets/styles/custom";
import { Button, Text, View } from "react-native";

type IError = {
  error: Error;
  resetError: () => void;
};

const Error = (props: IError) => {
  const { error, resetError } = props;

  return (
    <SafeAreaView style={customStyles.container}>
      <View>
        <Text>Something went wrong:</Text>
        <Text>{error.message}</Text>
        <Button title="Try again" onPress={resetError} />
      </View>
    </SafeAreaView>
  );
};

export default Error;
