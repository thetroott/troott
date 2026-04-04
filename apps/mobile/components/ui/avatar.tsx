import * as AvatarPrimitive from "@rn-primitives/avatar";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";

export const Avatar = {
  Root: ({
    className,
    alt,
    ...props
  }: AvatarPrimitive.RootProps & { className?: string }) => (
    <AvatarPrimitive.Root
      alt={alt}
      className={cn("aspect-square overflow-hidden rounded-full", className)}
      {...props}
    />
  ),
  Image: ({
    className,
    ...props
  }: AvatarPrimitive.ImageProps & { className?: string }) => (
    <AvatarPrimitive.Image
      className={cn("h-full w-full object-cover", className)}
      {...props}
    />
  ),
  Fallback: ({
    className,
    children,
    ...props
  }: AvatarPrimitive.FallbackProps & { className?: string }) => (
    <AvatarPrimitive.Fallback
      className={cn(
        "flex h-full w-full items-center justify-center bg-muted",
        className,
      )}
      {...props}
    >
      {children ?? <Text className="text-muted-foreground text-lg">?</Text>}
    </AvatarPrimitive.Fallback>
  ),
};

export type {
  RootProps as AvatarRootProps,
  ImageProps as AvatarImageProps,
  FallbackProps as AvatarFallbackProps,
} from "@rn-primitives/avatar";
