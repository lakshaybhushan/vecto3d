"use client";

import { Button } from "@/components/ui/button";
import AnimatedLogo from "@/components/ui/animated-logo";

export const ModelLoadingState = ({ message }: { message: string }) => (
  <div className="bg-card flex h-full w-full flex-col items-center justify-center">
    <div className="flex max-w-xs flex-col items-center gap-4 px-4 text-center">
      <div className="relative h-20 w-20">
        <div className="bg-background/20 absolute inset-0 animate-pulse rounded-full"></div>
        <div className="bg-background/40 absolute inset-4 animate-pulse rounded-full [animation-delay:200ms]"></div>
        <AnimatedLogo className="absolute inset-0 h-full w-full" />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">{message}</p>
        <p className="text-muted-foreground text-xs">
          This may take a moment for complex SVGs
        </p>
      </div>
    </div>
  </div>
);

export const ModelErrorState = ({ error }: { error: string }) => (
  <div className="bg-destructive/5 flex h-full w-full items-center justify-center">
    <div className="max-w-sm p-6 text-center">
      <p className="text-destructive mb-2 font-medium">Error processing SVG</p>
      <p className="text-muted-foreground text-xs">{error}</p>
      <Button
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  </div>
);
