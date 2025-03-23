import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background">
      <div className="space-y-6">
        <h1 className="text-[12rem] font-bold leading-none tracking-tight text-primary/20">
          404
        </h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Page not found
          </h2>
          <p className="text-muted-foreground max-w-[400px] mx-auto">
            Oops! The page you're looking for doesn't exist. Please check the
            URL or try searching for something else :D
          </p>
        </div>
        <Button asChild className="text-base px-8">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
