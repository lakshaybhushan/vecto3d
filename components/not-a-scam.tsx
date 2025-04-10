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
        <Button variant="secondary" size="icon" className="">
          <Info className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-[320px] md:w-[480px] p-0 border rounded-lg">
        <AlertDialogHeader className="px-4 md:px-6 pt-4 md:pt-6">
          <AlertDialogTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
            <Info className="w-5 h-5" />
            <span className="text-yellow-600 dark:text-yellow-400">
              Warning
            </span>
          </AlertDialogTitle>
          <AlertDialogDescription className="leading-6 mt-2 text-left">
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
          <AlertDialogAction className="w-full h-10">
            Yes, I understand
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
