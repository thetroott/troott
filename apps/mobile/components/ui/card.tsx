import { cn } from '@/lib/utils';
import React from 'react';
import { View, ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <View
      className={cn(
        "rounded-xl border border-border bg-card",
        className,
      )}
      {...props}
    >
      {children}
    </View>
  );
};

Card.displayName = 'Card';

