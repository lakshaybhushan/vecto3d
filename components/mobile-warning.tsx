import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Monitor, RotateCcw } from "lucide-react";
import { MobileWarningProps } from "@/lib/types";

export function MobileWarning({
  onContinue,
}: Omit<MobileWarningProps, "onReturn">) {
  return (
    <div className="w-full max-w-md">
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Mobile Device Detected</AlertTitle>
        <AlertDescription>
          The 3D editor works best on desktop devices. Some features may be
          limited or difficult to use on smaller screens.
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardContent className="pt-6 pb-4 px-6">
          <div className="flex flex-col items-center text-center mb-4">
            <Monitor className="h-16 w-16 text-primary mb-4" />
            <h2 className="text-xl font-semibold">Recommended</h2>
            <p className="text-muted-foreground mt-2">
              Please switch to a desktop or laptop computer for the best
              experience.
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={onContinue}>
            Continue on Mobile Anyway
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function EditorMobileWarning({
  onContinue,
  onReturn,
}: MobileWarningProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Mobile Device Detected</AlertTitle>
        <AlertDescription>
          The 3D editor works best on desktop devices. Some features may be
          limited or difficult to use on smaller screens.
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardContent className="pt-6 pb-4 px-6">
          <div className="flex flex-col items-center text-center mb-4">
            <RotateCcw className="h-16 w-16 text-primary mb-4" />
            <h2 className="text-xl font-semibold">Recommended</h2>
            <p className="text-muted-foreground mt-2">
              Please switch to a desktop or laptop computer for the best
              experience with the 3D editor.
            </p>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <Button variant="default" className="w-full" onClick={onReturn}>
              Return to Homepage
            </Button>

            <Button variant="outline" className="w-full" onClick={onContinue}>
              Continue Anyway
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
