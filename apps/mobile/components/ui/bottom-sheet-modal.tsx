import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
} from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { theme } from '@/constants/theme';
import { Portal } from './portal';

/**
 * BottomSheetModal component that displays a bottom sheet with gesture handling.
 * It uses React Native Reanimated and Gesture Handler for smooth animations and interactions.
 *
 * @component
 * @example
 * return (
 *   <BottomSheetModal ref={bottomSheetRef} />
 * );
 */
export interface BottomSheetRef {
    open: () => void;
    close: () => void;
}

export interface BottomSheetRootProps {
    children?: React.ReactNode;
    /**
     * Must be unique when several bottom sheets are mounted; otherwise all instances
     * would register the same portal name and clobber one another in the host map.
     */
    portalName?: string;
    /** When stacking sheets, the later sheet should have a higher z-elevation. */
    zIndex?: number;
}

const BottomSheetModalRoot = forwardRef<BottomSheetRef, BottomSheetRootProps>(
    ({ children, portalName, zIndex: zIndexProp = 1 }, ref) => {
        const [showSheet, setShowSheet] = React.useState(false);
        const generatedName = `bottom-sheet-${React.useId().replace(/:/g, '')}`;
        const resolvedPortal = portalName ?? generatedName;

        const initialHeight = theme.sizes.screen.height * 0.5;
        const finalHeight = theme.sizes.screen.height * 0.9;
        const closedTranslateY = initialHeight + 300;

        const sheetTranslateY = useSharedValue(initialHeight + 200);
        const sheetHeight = useSharedValue(initialHeight);

        const finishClose = useCallback(() => {
            setShowSheet(false);
        }, []);

        const runCloseAnimation = useCallback(() => {
            sheetTranslateY.value = withTiming(
                closedTranslateY,
                { duration: 300 },
                (finished) => {
                    if (finished) runOnJS(finishClose)();
                },
            );
        }, [closedTranslateY, finishClose, sheetTranslateY]);

        useImperativeHandle(
            ref,
            () => ({
                open: () => {
                    setShowSheet(true);
                },
                close: () => {
                    runCloseAnimation();
                },
            }),
            [runCloseAnimation],
        );

        useEffect(() => {
            if (showSheet) {
                sheetTranslateY.value = withTiming(0, { duration: 500 });
            } else {
                sheetTranslateY.value = initialHeight + 200;
                sheetHeight.value = initialHeight;
            }
        }, [showSheet, sheetTranslateY, sheetHeight, initialHeight]);

        const gesture = useMemo(
            () =>
                Gesture.Pan()
                    .runOnJS(true)
                    .onUpdate((event) => {
                        if (sheetHeight.value >= finalHeight) {
                            if (event.translationY < 0) {
                                return;
                            }
                        }
                        if (
                            event.translationY < 0 &&
                            sheetHeight.value < finalHeight
                        ) {
                            sheetHeight.value =
                                Math.abs(event.translationY) + initialHeight;
                            return;
                        }
                        sheetTranslateY.value = event.translationY;
                    })
                    .onEnd((event) => {
                        if (event.translationY > 200) {
                            sheetTranslateY.value = withTiming(
                                closedTranslateY,
                                { duration: 300 },
                                (finished) => {
                                    if (finished) runOnJS(finishClose)();
                                },
                            );
                            return;
                        }
                        if (sheetHeight.value >= finalHeight) {
                            if (
                                event.translationY > 0 &&
                                event.translationY < 100
                            ) {
                                sheetTranslateY.value = withTiming(0);
                                return;
                            }
                            if (
                                event.translationY > 0 &&
                                event.translationY > 100
                            ) {
                                sheetTranslateY.value = withTiming(0);
                                sheetHeight.value = withTiming(initialHeight);
                                return;
                            }
                        }
                        if (
                            event.translationY > -100 &&
                            event.translationY < 0 &&
                            sheetHeight.value < finalHeight
                        ) {
                            sheetHeight.value = withSpring(initialHeight);
                            return;
                        }
                        if (
                            event.translationY < -100 &&
                            event.translationY < 0 &&
                            sheetHeight.value < finalHeight
                        ) {
                            sheetHeight.value = withSpring(finalHeight);
                            sheetTranslateY.value = withSpring(0);
                            return;
                        }
                        sheetTranslateY.value = withTiming(0);
                    }),
            [
                closedTranslateY,
                finalHeight,
                finishClose,
                initialHeight,
                sheetHeight,
                sheetTranslateY,
            ],
        );

        const animatedRootStyle = useAnimatedStyle(() => ({
            height: sheetHeight.value,
            transform: [{ translateY: sheetTranslateY.value }],
        }));

        if (!showSheet) {
            return null;
        }

        return (
            <Portal name={resolvedPortal}>
                <View
                    style={[
                        styles.overlayContainer,
                        { zIndex: zIndexProp, elevation: zIndexProp },
                    ]}
                >
                    {/*
                      Backdrop is a separate layer *under* the sheet so:
                      1) Taps on the dimmed area (not covered by the sheet) reliably call onPress
                      2) Touches on the sheet hit the sheet / gestures, not the backdrop
                    */}
                    <Pressable
                        style={styles.dimmingBackdrop}
                        onPress={runCloseAnimation}
                        accessibilityRole="button"
                        accessibilityLabel="Dismiss"
                    />
                    <View style={styles.sheetLayer} pointerEvents="box-none">
                        <GestureDetector gesture={gesture}>
                            <Animated.View
                                style={[
                                    styles.sheetContainer,
                                    animatedRootStyle,
                                ]}
                            >
                                <View style={styles.dragger} />
                                {children}
                            </Animated.View>
                        </GestureDetector>
                    </View>
                </View>
            </Portal>
        );
    },
);

BottomSheetModalRoot.displayName = 'BottomSheetModalRoot';

interface SubProps {
    children?: React.ReactNode;
}

function BottomSheetTitle({ children }: SubProps) {
    return <Pressable style={styles.headerContainer}>{children}</Pressable>;
}
BottomSheetTitle.displayName = 'BottomSheetTitle';

function BottomSheetContent({ children }: SubProps) {
    return (
        <ScrollView contentContainerStyle={styles.contentContainer}>
            {children}
        </ScrollView>
    );
}
BottomSheetContent.displayName = 'BottomSheetContent';

export const BottomSheetModal = {
    Root: BottomSheetModalRoot,
    Title: BottomSheetTitle,
    Content: BottomSheetContent,
};

const styles = StyleSheet.create({
    overlayContainer: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        elevation: 1,
    },
    /** Dimmer behind the sheet; the sheet is drawn on a sibling for correct hit testing. */
    dimmingBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    /**
     * Full screen; top area passes touches through to the dimming Pressable. Sheet subtree
     * still receives touch / pan where it sits.
     */
    sheetLayer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
    },
    sheetContainer: {
        width: '100%',
        backgroundColor: theme.colors.grey[900],
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingVertical: theme.sizes.spacing.lg,
        overflow: 'hidden',
    },
    headerContainer: {
        padding: theme.sizes.spacing.md,
        paddingTop: 16,
        borderBottomWidth: 1.5,
        borderBottomColor: theme.colors.grey[700],
    },
    dragger: {
        width: theme.sizes.spacing.xl * 1.5,
        height: 5,
        backgroundColor: theme.colors.grey[500],
        borderRadius: theme.sizes.radius.full,
        alignSelf: 'center',
        position: 'absolute',
        top: theme.sizes.spacing.md,
    },
    contentContainer: {
        padding: theme.sizes.spacing.md,
        paddingTop: 10,
        paddingBottom: theme.sizes.spacing.xl * 2,
    },
});
