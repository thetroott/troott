import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import customStyles from '@/assets/styles/custom';
import componentStyles from '@/assets/styles/components';

const ChangeData = () => {
    // pass in user data to show inputed email

    return (
        <View>
            <View style={customStyles.mt10}></View>

            <Text style={componentStyles.termsSubText}>
                To verify email, we’ve sent a One Time Password (OTP) to{' '}
            </Text>

            <View style={{ flexDirection: 'row' }}>
                <Text style={componentStyles.clink}>
                    tobe.innocent@gmail.com{' '}
                </Text>
                <TouchableOpacity
                    onPress={() => console.log('Change email clicked')}
                >
                    <Text style={componentStyles.dlink}>(Change)</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ChangeData;
