import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import Link from "next/link";

export function NotAScam() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="secondary" size="icon">
          <Info className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-[320px] rounded-lg border p-0 md:w-[480px]">
        <AlertDialogHeader className="px-4 pt-4 md:px-6 md:pt-6">
          <AlertDialogTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
            <Info className="h-5 w-5" />
            <span className="text-yellow-600 dark:text-yellow-400">
              Warning
            </span>
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-2 text-left leading-6">
            Vecto3d has no involvement with cryptocurrencies, memecoins, or
            tokens. Please be aware of scams and impersonators claiming to be
            Vecto3d. The official website is{" "}
            <Link
              href="https://vecto3d.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline">
              vecto3d.xyz
            </Link>{" "}
            only.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="border-t p-6">
          <AlertDialogAction className="h-10 w-full">
            Yes, I understand
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
