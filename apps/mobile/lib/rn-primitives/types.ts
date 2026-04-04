import type * as React from 'react';
import type {
    GestureResponderEvent,
    Pressable,
    PressableProps,
    Text,
    TextProps,
    View,
    ViewProps,
} from 'react-native';

interface SlottableViewProps extends ViewProps {
  asChild?: boolean;
}

interface SlottableTextProps extends TextProps {
  asChild?: boolean;
}

interface SlottablePressableProps extends PressableProps {
  asChild?: boolean;
}

type ViewRef = React.ElementRef<typeof View>;
type PressableRef = React.ElementRef<typeof Pressable>;
type TextRef = React.ElementRef<typeof Text>;

type ComponentPropsWithAsChild<T extends React.ElementType<any>> =
  React.ComponentPropsWithoutRef<T> & {
    asChild?: boolean;
  };

interface PressableStateCallbackType {
  readonly pressed: boolean;
}

interface ForceMountable {
  forceMount?: true | undefined;
}

type PressableOnPress = (ev: GestureResponderEvent) => void;

export type {
    ComponentPropsWithAsChild,
    ForceMountable,
    PressableOnPress,
    PressableRef,
    PressableStateCallbackType,
    SlottablePressableProps,
    SlottableTextProps,
    SlottableViewProps,
    TextRef,
    ViewRef
};


