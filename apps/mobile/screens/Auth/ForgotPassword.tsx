import { View } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthRoot from "../../components/layouts/AuthRoot";
import customStyles from "../../assets/styles/custom";
import CustomTextInput from "../../components/Input/TextInput";
import { palette } from "../../constants/theme/palette";
import Icon from "react-native-vector-icons/FontAwesome";
import Button from "../../components/Buttons/Button";
import { useNavigation } from "@react-navigation/native";
import { INavigation } from "../../engine/types/type";
import { spacing } from "../../constants/theme/spacing";
import ResetSubtext from "../../components/containers/auth/ResetSubtext";

const ForgotPassword = () => {
  const navigation = useNavigation<INavigation>();
  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState(false)

  const handleSubmit = () => {
    setUserEmail(true)
    setTimeout(() => {
      navigation.navigate("ForgotPasswordCode");
      setUserEmail(false);
    }, 2000);
  }

  return (
    <SafeAreaView>
      <AuthRoot>
        <View>
          <ResetSubtext />

          <View style={customStyles.mt20}></View>

          <View>
            <CustomTextInput
              id="email"
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              secureTextEntry={false}
              onChangeText={(val) => setEmail(val)}
              keyboardType="default"
              variant="outline"
              disabled={false}
              backgroundColor={palette.grey700}
              leftIcon={
                <Icon name="envelope" size={16} color={palette.grey400} />
              }
            />
          </View>

          <View style={customStyles.mt5}></View>

          <Button
            title="Continue"
            variant="primary"
            onPress={handleSubmit}
            paddingVertical={spacing.space18}
            disabled={userEmail}
            loading={userEmail}
            borderRadius={spacing.space4}
          ></Button>

          
        </View>
      </AuthRoot>
    </SafeAreaView>
  );
};

export default ForgotPassword;
