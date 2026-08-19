"use client";

import * as React from "react";
import { GripVerticalIcon } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Group>) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn("flex h-full w-full", className)}
      {...props}
    />
  );
}

function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Separator> & {
  withHandle?: boolean;
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        "hover:bg-secondary data-[separator=active]:bg-secondary focus-visible:ring-ring after:bg-border/50 data-[separator=hover]:after:bg-border data-[separator=active]:after:bg-border relative flex w-1 items-center justify-center opacity-0 transition-opacity duration-200 after:absolute after:top-1/2 after:left-1/2 after:h-full after:w-1 after:-translate-x-1/2 after:-translate-y-1/2 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden aria-[orientation=horizontal]:h-2 aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:py-0 aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 aria-[orientation=vertical]:my-auto aria-[orientation=vertical]:!h-[90%] aria-[orientation=vertical]:py-0 data-[separator=active]:opacity-100 data-[separator=hover]:opacity-100 [&[aria-orientation=horizontal]>div]:rotate-90",
        className,
      )}
      {...props}>
      {withHandle && (
        <div className="bg-card z-10 flex h-8 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-3" />
        </div>
      )}
    </ResizablePrimitive.Separator>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
