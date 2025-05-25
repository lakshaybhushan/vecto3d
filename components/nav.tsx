import { Logo } from "@/components/ui/logo";
import { NotAScam } from "@/components/not-a-scam";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { GitHubIcon } from "@/components/ui/example-icons";
import { AnimatedNumber } from "@/components/ui/animated-numbers";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Nav() {
  const [stars, setStars] = useState(1001);

  useEffect(() => {
    fetch("https://api.github.com/repos/lakshaybhushan/vecto3d")
      .then((response) => response.json())
      .then((data) => {
        const starCount = data.stargazers_count;
        setStars(starCount);
      })
      .catch(() => setStars(0));
  }, []);

  return (
    <header className="flex w-full items-center justify-between px-8 py-4">
      <div className="flex items-center space-x-2">
        <Logo className="text-primary h-8 w-8" />
        {/* <span className="text-xl font-semibold"></span> */}
      </div>
      <div className="flex items-center space-x-3">
        <NotAScam />
        <ModeToggle />
        <Link
          href="https://github.com/lakshaybhushan/vecto3d"
          target="_blank"
          rel="noopener noreferrer">
          <Button className="flex w-fit items-center gap-1">
            <Star size={16} />
            <AnimatedNumber
              className="inline-flex min-w-6 justify-end"
              springOptions={{
                bounce: 0,
                duration: 800,
              }}
              value={stars}
            />
            <span className="mr-0.5 hidden sm:inline">Stars on GitHub</span>
            <GitHubIcon size={16} />
          </Button>
        </Link>
      </div>
    </header>
  );
}
