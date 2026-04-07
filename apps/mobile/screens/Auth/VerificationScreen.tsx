// import { View, Text, TouchableWithoutFeedback, Keyboard } from "react-native";
// import React, { useState } from "react";
// import { SafeAreaView } from "react-native-safe-area-context";
// import AuthRoot from "../../components/layouts/AuthRoot";
// import customStyles from "../../assets/styles/custom";
// import { useNavigation } from "@react-navigation/native";
// import { INavigation } from "../../utils/type.util";
// import TermsAndConditions from "../../components/containers/auth/TermsConditions";
// import { spacing } from "../../constants/theme/spacing";
// import Button from "../../components/Buttons/Button";
// import ChangeData from "../../components/containers/auth/ChangeData";
// import ResendCode from "../../components/containers/auth/ResendCode";
// import OTPInput from "@/components/ui/otpinput";

// const VerificationScreen = () => {
//   const navigation = useNavigation<INavigation>();

//   const [otp, setOTP] = useState("");
//   const [registerUser, setRegisterUser] = useState(false);

//   const handleSubmit = () => {
//     setRegisterUser(true);
//     setTimeout(() => {
//       navigation.navigate("ChooseMinisters");
//       setRegisterUser(false);
//     }, 2000);
//   };

//   return (
//     <SafeAreaView>
//       <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
//         <AuthRoot>
//           <View>
//             <ChangeData />

//             <View style={[customStyles.mt20]}></View>

          

//             <TermsAndConditions />

//             <View style={customStyles.mt15}></View>

//             <Button
//               title="Continue"
//               variant="primary"
//               onPress={handleSubmit}
//               paddingVertical={spacing.space18}
//               disabled={registerUser || otp.length < 6}
//               loading={registerUser}
//               borderRadius={spacing.space4}
//             ></Button>

//             <ResendCode/>
//           </View>
//         </AuthRoot>
//       </TouchableWithoutFeedback>
//     </SafeAreaView>
//   );
// };

// export default VerificationScreen;
