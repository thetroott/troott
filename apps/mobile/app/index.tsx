import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import React from 'react';
import { router } from 'expo-router';
import Button from '@/components/ui/button';
import { theme } from '@/constants/theme';
import customStyles from '@/assets/styles/custom';
import { IMAGES } from '@/assets/images/images';
import CustomImage from '@/components/features/shared/Images/Images';

const IndexScreen = () => {
    const handleCreateAccount = () => {
        router.push('/enter-email');
    };

    const handleLogin = () => {
        router.push('/login');
    };

    return (
        <>
            <View style={[customStyles.welcomeScreenContainer, {}]}>
                <ScrollView>
                    <View style={customStyles.welcomeScreenView}>
                        <Image
                            source={IMAGES.ministersGroup}
                            style={{
                                width: theme.sizes.screen.width,
                                height: theme.sizes.screen.height * 0.6,
                            }}
                        />
                        <CustomImage
                            source={IMAGES.png}
                            style={customStyles.welcomeScreenLogo}
                        />
                        <Text style={customStyles.welcomeScreenText}>
                            Experience sermons the way they {'\n'} were meant to
                            be heard, ad-free.{' '}
                        </Text>
                    </View>

                    <View
                        style={[
                            customStyles.mt30,
                            { paddingHorizontal: 10, gap: 20 },
                        ]}
                    >
                        <Button
                            onPress={handleCreateAccount}
                            label="Create Account"
                        />
                        <Button
                            label="Login"
                            onPress={handleLogin}
                            variant="outline"
                        />
                    </View>
                </ScrollView>
            </View>
        </>
    );
};

export default IndexScreen;

const styles = StyleSheet.create({}); // This can be empty if no specific styles are needed for this component.
