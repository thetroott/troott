// import React, { useEffect } from "react";
// import { SafeAreaView } from "react-native-safe-area-context";
// import CustomImage from "../../components/Images/Images";
// import customStyles from "../../assets/styles/custom";
// import { IMAGES } from "../../assets/images/images";
// import { useNavigation } from "@react-navigation/native";
// import { INavigation } from "../../utils/type.util";

// const SplashScreen = () => {
//   const navigation = useNavigation<INavigation>();

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       navigation.replace("Review");
//     }, 2000);

//     return () => clearTimeout(timer);
//   }, [navigation]);

//   return (
//     <SafeAreaView style={customStyles.container}>
//         <CustomImage source={IMAGES.png} style={customStyles.logo} />
//     </SafeAreaView>
//   );
// };

// export default SplashScreen;