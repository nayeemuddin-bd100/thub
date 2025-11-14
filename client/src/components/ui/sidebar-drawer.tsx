"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

const SidebarDrawer = DrawerPrimitive.Root;

const SidebarDrawerTrigger = DrawerPrimitive.Trigger;

const SidebarDrawerPortal = DrawerPrimitive.Portal;

const SidebarDrawerClose = DrawerPrimitive.Close;

const SidebarDrawerOverlay = React.forwardRef<
    React.ElementRef<typeof DrawerPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DrawerPrimitive.Overlay
        ref={ref}
        className={cn("fixed inset-0 z-40 bg-black/50", className)}
        {...props}
    />
));
SidebarDrawerOverlay.displayName = "SidebarDrawerOverlay";

const SidebarDrawerContent = React.forwardRef<
    React.ElementRef<typeof DrawerPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <SidebarDrawerPortal>
        <SidebarDrawerOverlay />
        <DrawerPrimitive.Content
            ref={ref}
            className={cn(
                "fixed inset-y-0 left-0 z-50 h-full w-64 bg-background border-r shadow-lg",
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
                "duration-300",
                className
            )}
            {...props}
        >
            {children}
        </DrawerPrimitive.Content>
    </SidebarDrawerPortal>
));
SidebarDrawerContent.displayName = "SidebarDrawerContent";

export {
    SidebarDrawer,
    SidebarDrawerClose,
    SidebarDrawerContent,
    SidebarDrawerOverlay,
    SidebarDrawerTrigger,
};
