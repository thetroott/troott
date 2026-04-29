import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import customStyles from '@/assets/styles/custom';
import componentStyles from '@/assets/styles/components';

const ResetSubtext = () => {
    return (
        <View>
            <View style={customStyles.mt10} />

            <Text style={componentStyles.reSubText}>
                Enter your account's email address, and we'll send you a
                one-time password (OTP) to reset it.
            </Text>

            <View style={customStyles.mt10} />
            {/* 
      <TouchableOpacity onPress={() => console.log("Resend code Clicked")}>
        <Text style={componentStyles.rlink}>Resend code </Text>
      </TouchableOpacity> */}
        </View>
    );
};

export default ResetSubtext;
