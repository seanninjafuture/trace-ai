"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";

/** Backdrop blur + dimming for editor workflow modals. */
export const dialogOverlayClassName =
  "fixed inset-0 isolate z-50 bg-black/60 backdrop-blur-md duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0";

/** Centered panel shell: title, description, and footer actions. */
export const dialogContentClassName =
  "fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border border-border-default bg-bg-surface p-6 text-sm text-text-primary shadow-xl duration-100 outline-none sm:max-w-lg data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95";

export const dialogFooterClassName =
  "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3";

type DialogShellProps = DialogPrimitive.Root.Props & {
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  contentClassName?: string;
  overlayClassName?: string;
};

function DialogShellOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-shell-overlay"
      className={cn(dialogOverlayClassName, className)}
      {...props}
    />
  );
}

function DialogShellContent({
  className,
  title,
  description,
  children,
  footer,
  showCloseButton = true,
  overlayClassName,
  ...props
}: Omit<DialogShellProps, keyof DialogPrimitive.Root.Props> &
  DialogPrimitive.Popup.Props) {
  return (
    <DialogPortal>
      <DialogShellOverlay className={overlayClassName} />
      <DialogPrimitive.Popup
        data-slot="dialog-shell-content"
        className={cn(dialogContentClassName, className)}
        {...props}
      >
        <DialogHeader>
          <DialogTitle className="text-text-primary">{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        {children ? (
          <div className="text-sm text-text-muted">{children}</div>
        ) : null}

        {footer ? (
          <DialogFooter className={dialogFooterClassName}>{footer}</DialogFooter>
        ) : null}

        {showCloseButton ? (
          <DialogPrimitive.Close
            data-slot="dialog-shell-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-3 right-3"
                size="icon-sm"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

/**
 * Standardized modal wrapper for future editor dialogs.
 * Not wired to any workflow yet — use when building concrete modals.
 */
export function DialogShell({
  title,
  description,
  children,
  footer,
  showCloseButton,
  contentClassName,
  overlayClassName,
  ...rootProps
}: DialogShellProps) {
  return (
    <Dialog {...rootProps}>
      <DialogShellContent
        title={title}
        description={description}
        footer={footer}
        showCloseButton={showCloseButton}
        className={contentClassName}
        overlayClassName={overlayClassName}
      >
        {children}
      </DialogShellContent>
    </Dialog>
  );
}

export { DialogClose, DialogShellContent, DialogShellOverlay };
