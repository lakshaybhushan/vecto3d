import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="space-y-6">
        <h1 className="text-primary/20 text-[12rem] leading-none font-bold tracking-tight">
          404
        </h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Page not found
          </h2>
          <p className="text-muted-foreground mx-auto max-w-[400px]">
            Oops! The page you&apos;re looking for doesn&apos;t exist. Please
            check the URL or try searching for something else :D
          </p>
        </div>
        <Button asChild className="px-8 text-base">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
