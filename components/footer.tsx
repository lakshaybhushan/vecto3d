import Link from "next/link";
import { VercelIcon, V0Icon } from "@/components/ui/example-icons";

export default function Footer() {
  return (
    <footer className="w-full py-4 px-8">
      <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          Hosted on{" "}
          <Link
            href="https://vercel.com"
            className="font-medium text-primary hover:underline flex items-center gap-0.5 transition-colors duration-200"
            target="_blank"
            rel="noopener noreferrer">
            <VercelIcon size={12} />
            <span className="hidden sm:inline">Vercel</span>
          </Link>
        </div>
        <div className="flex items-center gap-1 mt-2 md:mt-0">
          Ideated with{" "}
          <Link
            href="https://v0.dev/chat/three-js-logo-converter-JEQ692TQD4t"
            className="font-medium text-primary hover:underline flex items-center transition-colors duration-200 gap-2"
            target="_blank"
            rel="noopener noreferrer">
            <span className="sm:inline">
              <V0Icon size={20} />
            </span>
          </Link>
          {/* <span className="text-muted-foreground">by</span> */}
          <Link
            href="https://lakshb.dev"
            className="hover:underline font-medium hover:text-primary transition-colors duration-200"
            target="_blank"
            rel="noopener noreferrer">
            — lakshaybhushan
          </Link>
        </div>
      </div>
    </footer>
  );
}
