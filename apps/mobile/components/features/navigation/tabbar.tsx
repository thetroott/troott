import { Pressable, StyleSheet, View } from 'react-native';
import Text from '@/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
    Home,
    Icon,
    Notepad,
    ProfileCircle,
    SearchNormal,
} from 'iconsax-react-nativejs';
import { theme } from '@/constants/theme';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

/**
 *
 * @description This custom tabbar omits a screen item from showing by passing adding tabBarShowLabel:false in the options props to the child screen in the bottom tabs navigator
 */

const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
    const insets = useSafeAreaInsets();

    const tabIcons = {
        home: {
            icon: Home,
            label: 'Home',
        },
        search: {
            icon: SearchNormal,
            label: 'Search',
        },
        library: {
            icon: Notepad,
            label: 'Library',
        },
        profile: {
            icon: ProfileCircle,
            label: 'Profile',
        },
    };

    return (
        <View
            style={[
                styles.tabBarContainer,
                {
                    paddingBottom: Math.max(
                        insets.bottom,
                        theme.sizes.spacing.sm,
                    ),
                },
            ]}
        >
            {state.routes.map((routeName, index) => {
                // hide a tabBar item screen from showing in the bottom Tab
                if (
                    descriptors[routeName.key].options?.tabBarShowLabel !==
                        undefined &&
                    descriptors[routeName.key].options?.tabBarShowLabel ===
                        false
                ) {
                    return null;
                }
                const isFocused = state.index === index;
                const handleNavigation = () => {
                    if (isFocused) return;
                    navigation.navigate(routeName.name);
                };
                return (
                    <Pressable onPress={handleNavigation} key={index}>
                        <TabBarIcon
                            focused={isFocused}
                            Icon={
                                tabIcons[
                                    routeName.name as keyof typeof tabIcons
                                ]?.icon ?? undefined
                            }
                            label={
                                tabIcons[
                                    routeName.name as keyof typeof tabIcons
                                ]?.label ?? undefined
                            }
                        />
                    </Pressable>
                );
            })}
        </View>
    );
};

export default TabBar;

const styles = StyleSheet.create({
    tabBarContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 10,
        backgroundColor: theme.colors.black[50],
        gap: theme.sizes.spacing['2xl'] + 15,
    },
    iconContainer: {
        gap: theme.sizes.spacing.sm,
        alignItems: 'center',
    },
});

interface TabBarIconProps {
    focused: boolean;
    Icon: Icon;
    label: string;
}

const TabBarIcon = ({ focused, Icon, label }: TabBarIconProps) => {
    const scalepProgess = useSharedValue(0);
    useEffect(() => {
        if (focused) {
            scalepProgess.value = withTiming(1);
            return;
        }
        scalepProgess.value = withTiming(0);
    }, [focused]);

    const AnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                scale: interpolate(scalepProgess.value, [0, 1], [0.9, 1.1]),
            },
        ],
    }));
    return (
        <Animated.View style={[styles.iconContainer, AnimatedStyle]}>
            <Icon
                size={24}
                variant={focused ? 'Bold' : 'Outline'}
                color={
                    focused ? theme.colors.teal[500] : theme.colors.grey[300]
                }
            />
            <Text
                textStyle={{
                    textAlign: 'center',
                    color: focused
                        ? theme.colors.teal[500]
                        : theme.colors.grey[300],
                }}
                size="xs"
            >
                {label}
            </Text>
        </Animated.View>
    );
};
