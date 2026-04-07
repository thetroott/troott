import componentStyles from '@/assets/styles/components';
import React from 'react';
import { TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/ui/button';
import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';

export type Props = { error: Error; resetError: () => void };

const FallbackComponent = (props: Props) => (
    <SafeAreaView
        style={[componentStyles.econtainer, componentStyles.econtent]}
    >
        <Text
            textStyle={componentStyles.etitle as TextStyle}
            weight="light"
            color={theme.colors.grey[900]}
        >
            Oops!
        </Text>
        <Text
            textStyle={componentStyles.esubtitle as TextStyle}
            weight="bold"
            color={theme.colors.grey[900]}
        >
            {"There's an error"}
        </Text>
        <Text
            textStyle={componentStyles.eerror as TextStyle}
            color={theme.colors.grey[800]}
        >
            {props.error.toString()}
        </Text>
        <Button
            variant="ghost"
            onPress={props.resetError}
            containerStyle={componentStyles.ebutton}
        >
            <Text
                textStyle={componentStyles.ebuttonText as TextStyle}
                color={theme.colors.white[100]}
                weight="semiBold"
            >
                Try again
            </Text>
        </Button>
    </SafeAreaView>
);

export default FallbackComponent;
