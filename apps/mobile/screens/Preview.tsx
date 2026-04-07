import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import customStyles from "../assets/styles/custom";
import { SafeAreaView } from "react-native-safe-area-context";
import componentStyles from "../assets/styles/components";
import { useNavigation } from "@react-navigation/native";
import { INavigation } from "../engine/types/type";
import { palette } from "../constants/theme/palette";
import { useForm } from "react-hook-form";
import OAuth from "../components/containers/auth/OAuth";
import AuthHeader from "../components/containers/auth/AuthHeader";
import Icon from "react-native-vector-icons/FontAwesome";
import CustomTextInput from "../components/Input/CustomTextInput";
import ChangeData from "../components/containers/auth/ChangeData";
import ResendCode from "../components/containers/auth/ResendCode";
import AppStack from "../routes/AppStack";

const Preview = () => {
  const { control } = useForm();
  const navigation = useNavigation<INavigation>();
  const [text, setText] = useState("");

  return (
    <SafeAreaView style={customStyles.container}>
      {/* <View>
        <Text style={customStyles.text}>
          Review components and screens here
        </Text>
      </View> */}

      <View >

        <View>

          {/* <ResendCode/> */}

          

        </View>

        <View>
          <TouchableOpacity
            style={componentStyles.button}
            onPress={() => navigation.navigate("Welcome")}
          >
            <Text style={componentStyles.buttonText}>Welcome Screen</Text>
          </TouchableOpacity>
{/* 
          <TouchableOpacity
            style={componentStyles.button}
            onPress={() => navigation.navigate("ForgotPasswordCode")}
          >
            <Text style={componentStyles.buttonText}>Forgot code Screen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={componentStyles.button}
            onPress={() => navigation.navigate("ResetPassword")}
          >
            <Text style={componentStyles.buttonText}>Reset Password Screen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={componentStyles.button}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={componentStyles.buttonText}>Forgot Password</Text>
          </TouchableOpacity> */}

          <AppStack/>

          {/* <TouchableOpacity
            style={componentStyles.button}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={componentStyles.buttonText}>Login Screen</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={componentStyles.button}
            onPress={() => navigation.navigate("Email")}
          >
            <Text style={componentStyles.buttonText}>Create account Screen</Text>
          </TouchableOpacity> */}


        </View>

        {/* <AuthHeader /> */}
        {/*         
        <View>
          <CustomTextInput
            value={text}
            id="otp"
            placeholder="Enter the OTP"
            onChangeText={(val) => setText(val)}
            keyboardType="numeric"
            variant="filled"
            secureTextEntry={true}

            leftIcon={
              <Icon name="envelope" size={18} color={palette.grey400} />
            }
            rightIcon={
              <TouchableOpacity onPress={() => setText("")}>
                <Icon name="times-circle" size={18} color={palette.baseBlack} />
              </TouchableOpacity>
            }
          />
        </View> */}

        {/* <View style={customStyles.mt20}></View> */}

        {/* <View>
          <CustomTextInput
            value={text}
            id="text"
            placeholder="Enter your first name"
            onChangeText={(val) => setText(val)}
            keyboardType="email-address"
            variant="transparent"
            leftIcon={
              <Icon name="user" size={20} color={palette.grey400} />
            }
          />
        </View>

        <View style={customStyles.mt20}></View> */}

        {/* <View>
          <CustomTextInput
            value={text}
            id="text"
            placeholder="Enter your first name"
            secureTextEntry={true}
            onChangeText={(val) => setText(val)}
            keyboardType="phone-pad"
            variant="outline"
            rightIcon={<Icon name="eye" size={18} color={palette.grey100} />}
            leftIcon={
              <Icon name="user" size={20} color={palette.grey400} />
            }
          />
        </View> */}
      </View>
    </SafeAreaView>
  );
};

export default Preview;
