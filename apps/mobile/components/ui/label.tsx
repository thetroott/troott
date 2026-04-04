import * as LabelPrimitive from "@rn-primitives/label";
import { cn } from "@/lib/utils";

export const Label = {
  Root: LabelPrimitive.Root,
  Text: ({
    className,
    ...props
  }: LabelPrimitive.TextProps & { className?: string }) => (
    <LabelPrimitive.Text
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  ),
};

export type { RootProps as LabelRootProps, TextProps as LabelTextProps } from "@rn-primitives/label";
