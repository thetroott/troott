import * as AlertDialogPrimitive from "@rn-primitives/alert-dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

export const AlertDialog = {
  Root: AlertDialogPrimitive.Root,
  Portal: AlertDialogPrimitive.Portal,
  Trigger: AlertDialogPrimitive.Trigger,
  Overlay: ({
    className,
    ...props
  }: AlertDialogPrimitive.OverlayProps & { className?: string }) => (
    <AlertDialogPrimitive.Overlay
      className={cn("fixed inset-0 bg-black/50", className)}
      {...props}
    />
  ),
  Content: ({
    className,
    ...props
  }: AlertDialogPrimitive.ContentProps & { className?: string }) => (
    <AlertDialogPrimitive.Content
      className={cn(
        "rounded-xl border border-border bg-card p-6 shadow-lg",
        className,
      )}
      {...props}
    />
  ),
  Title: ({
    className,
    ...props
  }: AlertDialogPrimitive.TitleProps & { className?: string }) => (
    <AlertDialogPrimitive.Title
      className={cn("font-matter text-lg font-semibold text-foreground", className)}
      {...props}
    />
  ),
  Description: ({
    className,
    ...props
  }: AlertDialogPrimitive.DescriptionProps & { className?: string }) => (
    <AlertDialogPrimitive.Description
      className={cn("mt-2 font-matter text-sm text-muted-foreground", className)}
      {...props}
    />
  ),
  Action: ({
    className,
    children,
    ...props
  }: AlertDialogPrimitive.ActionProps & { className?: string }) => (
    <AlertDialogPrimitive.Action asChild {...props}>
      <Button variant="primary" className={className}>
        {typeof children === "function" ? null : (children as ReactNode)}
      </Button>
    </AlertDialogPrimitive.Action>
  ),
  Cancel: ({
    className,
    children,
    ...props
  }: AlertDialogPrimitive.CancelProps & { className?: string }) => (
    <AlertDialogPrimitive.Cancel asChild {...props}>
      <Button variant="outline" className={className}>
        {typeof children === "function" ? null : (children as ReactNode)}
      </Button>
    </AlertDialogPrimitive.Cancel>
  ),
};

export { useRootContext as useAlertDialogContext } from "@rn-primitives/alert-dialog";
export type {
  RootProps as AlertDialogRootProps,
  TriggerProps as AlertDialogTriggerProps,
  ContentProps as AlertDialogContentProps,
  ActionProps as AlertDialogActionProps,
  CancelProps as AlertDialogCancelProps,
  TitleProps as AlertDialogTitleProps,
  DescriptionProps as AlertDialogDescriptionProps,
} from "@rn-primitives/alert-dialog";
