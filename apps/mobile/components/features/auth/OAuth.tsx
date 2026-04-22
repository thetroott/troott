import { Text, View } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import componentStyles from '@/assets/styles/components';
import customStyles from '@/assets/styles/custom';

import { theme } from '@/constants/theme';
import Button from '@/components/ui/button';

const OAuth = () => {
    const signInWithGoogle = async () => {
        try {
            console.log('Google Sign-In Triggered');
            // TODO: Implement Google Authentication logic here
        } catch (error) {
            console.error('Google Sign-In Error:', error);
        }
    };

    const signInWithApple = async () => {
        try {
            console.log('Apple Sign-In Triggered');
            // TODO: Implement Apple Authentication logic here
        } catch (error) {
            console.error('Apple Sign-In Error:', error);
        }
    };

    return (
        <View>
            <View style={componentStyles.OrCongtainer}>
                <View style={componentStyles.line} />
                <Text style={componentStyles.orText}>or</Text>
                <View style={componentStyles.line} />
            </View>

            <View style={[customStyles.mt10]}></View>

            <Button
                label="Sign in with Apple"
                variant="outline"
                leftIcon={
                    <Icon
                        name="apple"
                        size={18}
                        color={theme.colors.grey[50]}
                        style={componentStyles.icon}
                    />
                }
                containerStyle={{
                    paddingVertical: theme.sizes.spacing.sm,
                    borderRadius: theme.sizes.spacing.sm,
                    borderColor: theme.colors.grey[300],
                }}
                onPress={signInWithApple}
                isLoading={false}
                disabled={false}
            />

            <View style={customStyles.mt10}></View>

            <Button
                label="Continue with Google"
                variant="outline"
                leftIcon={
                    <Icon
                        name="google"
                        size={18}
                        color={theme.colors.grey[50]}
                        style={componentStyles.icon}
                    />
                }
                containerStyle={{
                    borderColor: theme.colors.grey[300],
                    paddingVertical: theme.sizes.spacing.sm,
                    borderRadius: theme.sizes.spacing.sm,
                }}
                onPress={signInWithGoogle}
                isLoading={false}
                disabled={false}
            />
        </View>
    );
};

export default OAuth;
