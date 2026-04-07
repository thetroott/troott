import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import customStyles from "@/assets/styles/custom";
import componentStyles from "@/assets/styles/components";

const ResendCode = () => {
  return (
    <View>
      <View style={customStyles.mt10} />

      <Text style={componentStyles.rSubText}>
        This code will expire in 15 minutes.
      </Text>

      <View style={customStyles.mt10} />

      <TouchableOpacity onPress={() => console.log("Resend code Clicked")}>
        <Text style={componentStyles.rlink}>Resend code </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResendCode;
