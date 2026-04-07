import { View } from "react-native";
import React from "react";
import customStyles from "../../../assets/styles/custom";
import componentStyles from "@/assets/styles/components";
import Text from "@/components/ui/text";

const TermsAndConditions = () => {
  return (
    <View>
      <View ></View>
      <Text style={componentStyles.termsSubText}>
        By continuing, you agree to the updated{" "}
        <Text
          style={componentStyles.link}
          onPress={() => console.log("Terms of Sale Clicked")}
        >
          Terms of Sale
        </Text>
        ,{" "}
        <Text
          style={componentStyles.link}
          onPress={() => console.log("Terms of Service Clicked")}
        >
          Terms of Service
        </Text>{" "}
        and{" "}
        <Text
          style={componentStyles.link}
          onPress={() => console.log("Privacy Policy Clicked")}
        >
          Privacy Policy
        </Text>
        .
      </Text>
    </View>
  );
};

export default TermsAndConditions;
