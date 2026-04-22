import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import ListenerShareSheet from './listener-share-sheet';
import ShareCopyToast from './share-copy-toast';
import IosShareSheet from './ios-share-sheet';
import AndroidShareSheet from './android-share-sheet';
import type { ShareTrack } from './share-types';

export type SharingFlowStep =
    | 'listener-sheet'
    | 'copy-toast'
    | 'ios-share-sheet'
    | 'android-share-sheet';

type ListenerSharingFlowProps = {
    visible: boolean;
    step: SharingFlowStep;
    track: ShareTrack;
    onDismiss?: () => void;
    onPressInstagram?: () => void;
    onPressCopy?: () => void;
    onPressMoreOptions?: () => void;
};

export default function ListenerSharingFlow({
    visible,
    step,
    track,
    onDismiss,
    onPressInstagram,
    onPressCopy,
    onPressMoreOptions,
}: ListenerSharingFlowProps) {
    if (!visible) return null;

    return (
        <View style={styles.overlay} pointerEvents="box-none">
            <Pressable style={styles.backdrop} onPress={onDismiss} />
            <View style={styles.bottomWrap} pointerEvents="box-none">
                {step === 'listener-sheet' ? (
                    <ListenerShareSheet
                        track={track}
                        onShareInstagram={onPressInstagram}
                        onCopyToClipboard={onPressCopy}
                        onMoreShareOptions={onPressMoreOptions}
                    />
                ) : null}

                {step === 'copy-toast' ? <ShareCopyToast /> : null}

                {step === 'ios-share-sheet' ? <IosShareSheet /> : null}

                {step === 'android-share-sheet' ? <AndroidShareSheet /> : null}
            </View>
        </View>
    );
}

export function defaultShareSheetStepForPlatform(): SharingFlowStep {
    return Platform.OS === 'android' ? 'android-share-sheet' : 'ios-share-sheet';
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        zIndex: 400,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.58)',
    },
    bottomWrap: {
        width: '100%',
    },
});
