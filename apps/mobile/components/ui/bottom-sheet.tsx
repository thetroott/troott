import React, { useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useColorScheme } from 'nativewind';
import { semanticColors } from "@/constants/tailwind-bridge";
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

export interface BottomSheetRef {
  present: () => void;
  dismiss: () => void;
  expand: () => void;
  collapse: () => void;
  close: () => void;
  isOpen: () => boolean;
}

const bottomSheetVariants = cva(
  'bg-card border-border',
  {
    variants: {
      variant: {
        default: 'bg-card border-border',
        elevated: 'bg-card border-border shadow-large',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const bottomSheetContentVariants = cva(
  'flex-1',
  {
    variants: {
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      padding: 'md',
    },
  }
);

interface BottomSheetProps extends VariantProps<typeof bottomSheetVariants> {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  enablePanDownToClose?: boolean;
  enableDismissOnClose?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  backdropOpacity?: number;
  handleIndicatorStyle?: object;
  backgroundStyle?: object;
  style?: object;
  contentClassName?: string;
  contentPadding?: VariantProps<typeof bottomSheetContentVariants>['padding'];
  initialSnapIndex?: number;
  enableDynamicSizing?: boolean;
}

const BottomSheetComponent = forwardRef<BottomSheetRef, BottomSheetProps>(
  ({
    children,
    snapPoints = ['50%', '75%'],
    enablePanDownToClose = true,
    enableDismissOnClose = true,
    onClose,
    onOpen,
    backdropOpacity = 0.5,
    handleIndicatorStyle,
    backgroundStyle,
    style,
    variant,
    contentClassName,
    contentPadding = 'md',
    initialSnapIndex = -1,
    enableDynamicSizing = false,
    ...props
  }, ref) => {
    const { colorScheme } = useColorScheme();
    const bottomSheetRef = useRef<BottomSheet>(null);

    const snapPointsMemo = useMemo(() => snapPoints, [snapPoints]);

    useImperativeHandle(ref, () => ({
      present: () => bottomSheetRef.current?.expand(),
      dismiss: () => bottomSheetRef.current?.close(),
      expand: () => bottomSheetRef.current?.expand(),
      collapse: () => bottomSheetRef.current?.collapse(),
      close: () => bottomSheetRef.current?.close(),
      isOpen: () => {
        const currentIndex = bottomSheetRef.current?.snapToIndex;
        return typeof currentIndex === 'number' && currentIndex >= 0;
      },
    }));

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={backdropOpacity}
          style={[props.style, { backgroundColor: semanticColors.overlay }]}
        />
      ),
      [backdropOpacity]
    );

    const handleSheetChanges = useCallback(
      (index: number) => {
        if (index === -1) {
          onClose?.();
        } else if (index >= 0) {
          onOpen?.();
        }
      },
      [onClose, onOpen]
    );

    const defaultBackgroundStyle = {
      backgroundColor: semanticColors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    };

    const defaultHandleIndicatorStyle = {
      backgroundColor: semanticColors.mutedForeground,
      width: 48,
      height: 4,
    };

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={initialSnapIndex}
        snapPoints={snapPointsMemo}
        enablePanDownToClose={enablePanDownToClose}
        backdropComponent={renderBackdrop}
        onChange={handleSheetChanges}
        backgroundStyle={[defaultBackgroundStyle, backgroundStyle]}
        handleIndicatorStyle={[defaultHandleIndicatorStyle, handleIndicatorStyle]}
        enableDynamicSizing={enableDynamicSizing}
        style={[
          {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 16,
          },
          style,
        ]}
        {...props}
      >
        <BottomSheetView
          className={cn(
            bottomSheetContentVariants({ padding: contentPadding }),
            contentClassName
          )}
        >
          {children}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

BottomSheetComponent.displayName = 'BottomSheet';

export { BottomSheetComponent as BottomSheet, type BottomSheetProps };

