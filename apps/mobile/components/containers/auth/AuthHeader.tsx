import { View, Text, TouchableOpacity } from "react-native";
import React from "react";;
import componentStyles from "@/assets/styles/components";


const AuthHeader = () => {
  return (
    <View>
      
      {/* <View style={customStyles.mt30}></View>
      <Text style={componentStyles.title}>Log In or Create an Account</Text> */}
      {/* <View style={customStyles.mt10}></View> */}
      <Text style={componentStyles.subText}>
        By continuing, you agree to the updated{" "}
        
        <TouchableOpacity onPress={() => console.log("Terms of Sale Clicked")}>
        <Text style={componentStyles.link}>Terms of Sale</Text>
        </TouchableOpacity>

        ,{" "}

        <TouchableOpacity onPress={() => console.log("Terms of Service Clicked")}>
        <Text style={componentStyles.link}>Terms of Service </Text>
        </TouchableOpacity>

        {" "}and{" "}

        <TouchableOpacity onPress={() => console.log("Privacy Policy Clicked")}>
        <Text style={componentStyles.link}>Privacy Policy</Text>
        </TouchableOpacity>
        .
      </Text>

    </View>
  );
};

export default AuthHeader;