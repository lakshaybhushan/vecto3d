import Link from "next/link";
import { VercelIcon, V0Icon } from "@/components/ui/example-icons";

export default function Footer() {
  return (
    <footer className="w-full px-8 py-4">
      <div className="text-muted-foreground flex flex-col items-center justify-between text-sm md:flex-row">
        <div className="flex items-center gap-1">
          Hosted on{" "}
          <Link
            href="https://vercel.com"
            className="text-primary flex items-center gap-0.5 font-medium transition-colors duration-200 hover:underline"
            target="_blank"
            rel="noopener noreferrer">
            <span className="-mt-0.5">
              <VercelIcon size={12} />
            </span>
            <span className="hidden sm:inline">Vercel</span>
          </Link>
        </div>
        <div className="mt-2 flex items-center gap-1 md:mt-0">
          Ideated with{" "}
          <Link
            href="https://v0.dev/chat/three-js-logo-converter-JEQ692TQD4t"
            className="text-primary flex items-center gap-2 font-medium transition-colors duration-200 hover:underline"
            target="_blank"
            rel="noopener noreferrer">
            <span className="sm:inline">
              <V0Icon size={20} />
            </span>
          </Link>
          —
          <Link
            href="https://lakshb.dev"
            className="hover:text-primary font-medium transition-colors duration-200 hover:underline"
            target="_blank"
            rel="noopener noreferrer">
            lakshaybhushan
          </Link>
        </div>
      </div>
    </footer>
  );
}
