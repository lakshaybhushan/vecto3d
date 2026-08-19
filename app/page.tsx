"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  CHAT_APP_SVG,
  GITHUB_SVG,
  V0_SVG,
  VECTO3D_SVG,
  VERCEL_SVG,
  X_SVG,
} from "@/components/data/raw-svgs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { useEditorStore } from "@/lib/store";
import { isValidSvg, sanitizeSvgForPreview } from "@/lib/svg-sanitizer";

const workflow = [
  {
    name: "Shape",
    description: "Adjust depth, bevel, and rotation in real time.",
  },
  {
    name: "Finish",
    description: "Choose materials, textures, lighting, and a background.",
  },
  {
    name: "Export",
    description:
      "Save an image, video, animation, or production-ready 3D file.",
  },
];

const formats = [
  ["PNG", "Still image with transparency"],
  ["MP4 / GIF", "Video and looping animation"],
  ["GLB / GLTF", "Portable 3D model"],
  ["STL", "File for 3D printing"],
];

const examples = [
  { name: "GitHub", fileName: "github.svg", svg: GITHUB_SVG },
  { name: "v0", fileName: "v0.svg", svg: V0_SVG },
  { name: "Vercel", fileName: "vercel.svg", svg: VERCEL_SVG },
  { name: "X", fileName: "x.svg", svg: X_SVG },
  { name: "AI chat", fileName: "ai-chat.svg", svg: CHAT_APP_SVG },
  { name: "Vecto3d", fileName: "vecto3d.svg", svg: VECTO3D_SVG },
];

function prepareIconSvg(svg: string) {
  return svg
    .replace(/width="[^"]*"/, 'width="100%"')
    .replace(/height="[^"]*"/, 'height="100%"')
    .replace(/fill="[^"]*"/g, 'fill="currentColor"')
    .replace(/stroke="[^"]*"/g, 'stroke="currentColor"');
}

export default function Home() {
  const router = useRouter();
  const [svgData, setSvgData] = useState<string | null>(null);
  const [svgPreview, setSvgPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [stars, setStars] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageRef = useRef<HTMLElement>(null);

  const selectSvg = useCallback(
    (data: string, name: string, announce = false) => {
      if (!isValidSvg(data)) {
        toast.error("Choose a valid SVG file");
        return;
      }

      const sanitized = sanitizeSvgForPreview(data);
      if (!sanitized) {
        toast.error("This SVG could not be processed");
        return;
      }

      setSvgData(data);
      setSvgPreview(sanitized);
      setFileName(name);
      if (announce) toast.success("SVG ready to edit");
    },
    [],
  );

  const processFile = useCallback(
    (file: File) => {
      if (file.type !== "image/svg+xml") {
        toast.error("Choose an SVG file to continue");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          selectSvg(event.target.result, file.name, true);
        }
      };
      reader.readAsText(file);
    },
    [selectSvg],
  );

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const target = event.target as Element;
      const isWithinPage =
        pageRef.current?.contains(target) ||
        document.activeElement === document.body;
      if (!isWithinPage || !event.clipboardData) return;

      const textData = event.clipboardData.getData("text/plain");
      const htmlData = event.clipboardData.getData("text/html");

      if (
        textData.trim().startsWith("<svg") &&
        textData.trim().endsWith("</svg>")
      ) {
        event.preventDefault();
        selectSvg(textData, "pasted.svg", true);
        return;
      }

      if (htmlData.includes("<svg")) {
        const svgMatch = htmlData.match(/<svg[^>]*>[\s\S]*?<\/svg>/i);
        if (svgMatch) {
          event.preventDefault();
          selectSvg(svgMatch[0], "pasted.svg", true);
          return;
        }
      }

      const svgFile = Array.from(event.clipboardData.files).find(
        (file) => file.type === "image/svg+xml",
      );
      if (svgFile) {
        event.preventDefault();
        processFile(svgFile);
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [processFile, selectSvg]);

  useEffect(() => {
    const controller = new AbortController();

    fetch("https://api.github.com/repos/lakshaybhushan/vecto3d", {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("GitHub request failed");
        return response.json();
      })
      .then((repository: { stargazers_count?: number }) => {
        if (typeof repository.stargazers_count === "number") {
          setStars(repository.stargazers_count);
        }
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
      });

    return () => controller.abort();
  }, []);

  const openEditor = () => {
    if (!svgData) {
      openFilePicker();
      return;
    }

    const { setSvgData: setStoreSvg, setFileName: setStoreName } =
      useEditorStore.getState();
    sessionStorage.setItem("vecto3d_svgData", svgData);
    sessionStorage.setItem("vecto3d_fileName", fileName);
    setStoreSvg(svgData);
    setStoreName(fileName);
    startTransition(() => router.push("/edit"));
  };

  const openFilePicker = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  };

  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const textAction =
    "h-auto rounded-none p-0 text-[14px] font-normal text-[#bcbcbc] underline decoration-[#666] underline-offset-4 hover:text-white hover:no-underline";

  return (
    <main
      ref={pageRef}
      className="min-h-screen bg-[#101010] text-[14px] leading-6 text-[#a8a8a8]">
      <Input
        ref={fileInputRef}
        type="file"
        accept=".svg,image/svg+xml"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) processFile(file);
        }}
      />

      <div className="mx-auto w-full max-w-[760px] px-5 pt-10 sm:px-8 sm:pt-12">
        <header className="flex items-center justify-between gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-sm font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-white/50">
            <Logo className="size-5" />
            Vecto3d
          </Link>
          <nav className="flex items-center gap-4" aria-label="Primary">
            <Button asChild variant="link" className={textAction}>
              <Link
                href="https://github.com/lakshaybhushan/vecto3d"
                target="_blank"
                rel="noopener noreferrer">
                <span
                  aria-hidden="true"
                  className="size-4 shrink-0 text-current"
                  dangerouslySetInnerHTML={{
                    __html: prepareIconSvg(GITHUB_SVG),
                  }}
                />
                GitHub
                {stars === null
                  ? null
                  : ` · ${stars.toLocaleString()} ${stars === 1 ? "star" : "stars"}`}
              </Link>
            </Button>
          </nav>
        </header>

        <section className="mt-16 max-w-[620px]">
          <h1 className="font-medium text-white">Turn SVGs into 3D objects.</h1>
          <p className="mt-3">
            Vecto3d is a small browser-based tool for giving flat artwork depth,
            material, lighting, and motion. Nothing to install and no account
            required.
          </p>
        </section>

        <section className="mt-8 pb-10">
          <div
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                setIsDragging(false);
              }
            }}
            onDrop={handleDrop}
            className={`group flex h-[400px] w-full items-center justify-center rounded-lg border border-dashed text-center transition-[background-color,border-color] duration-150 ${
              isDragging
                ? "border-white/30 bg-white/[0.06]"
                : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.03]"
            }`}>
            {svgPreview ? (
              <div className="flex flex-col items-center px-6">
                <span
                  aria-hidden="true"
                  className="size-10 text-[#ededed] [&>svg]:h-full [&>svg]:w-full"
                  dangerouslySetInnerHTML={{ __html: svgPreview }}
                />
                <span className="mt-2 max-w-[260px] truncate text-[#777]">
                  {fileName}
                </span>
                <div className="mt-5 flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={openEditor}
                    disabled={isPending}
                    className="h-7 rounded-md bg-white px-2.5 text-[14px] font-medium text-[#101010] hover:bg-[#e8e8e8]">
                    {isPending ? "Opening…" : "Open editor"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={openFilePicker}
                    className="h-7 rounded-md border border-white/10 bg-white/[0.03] px-2.5 text-[14px] font-normal text-[#999] hover:border-white/20 hover:bg-white/[0.06] hover:text-white">
                    Replace
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={openFilePicker}
                className="flex h-full w-full flex-col rounded-lg text-[14px] font-normal whitespace-normal hover:bg-transparent active:scale-[0.995]">
                <span className="font-medium text-white">
                  Drop an SVG here or click to upload
                </span>
                <span className="mt-1 text-[#777]">You can also paste</span>
              </Button>
            )}
          </div>

          <p className="mt-4 text-[#777]">Or choose an example</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {examples.map((example) => {
              const selected = fileName === example.fileName;
              return (
                <Button
                  key={example.name}
                  type="button"
                  variant="ghost"
                  aria-pressed={selected}
                  onClick={() => selectSvg(example.svg, example.fileName)}
                  className={`h-10 justify-start rounded-md border px-3 text-[14px] font-normal ${
                    selected
                      ? "border-white/25 bg-white/[0.08] text-white"
                      : "border-white/10 bg-white/[0.03] text-[#bcbcbc] hover:border-white/20"
                  }`}>
                  <span
                    aria-hidden="true"
                    className="size-4 shrink-0 text-current"
                    dangerouslySetInnerHTML={{
                      __html: prepareIconSvg(example.svg),
                    }}
                  />
                  {example.name}
                </Button>
              );
            })}
          </div>
        </section>

        <section className="border-t border-white/[0.04] py-10">
          <h2 className="font-medium text-white">Workflow</h2>
          <div className="mt-6 space-y-5">
            {workflow.map((item) => (
              <div
                key={item.name}
                className="grid gap-1 sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-5">
                <h3 className="font-medium text-white">{item.name}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-white/[0.04] py-10">
          <h2 className="font-medium text-white">Formats</h2>
          <div className="mt-6 space-y-5">
            {formats.map(([name, description]) => (
              <div
                key={name}
                className="grid gap-1 sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-5">
                <h3 className="font-medium text-white">{name}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="flex flex-col gap-5 border-t border-white/[0.04] py-10 text-[#858585] sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-medium text-white">Vecto3d</p>
            <p className="mt-1">Free and open source. Files stay local.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="link" className={textAction}>
              <Link
                href="https://github.com/lakshaybhushan/vecto3d"
                target="_blank"
                rel="noopener noreferrer">
                Source
              </Link>
            </Button>
            <Button asChild variant="link" className={textAction}>
              <Link
                href="https://x.com/blakssh"
                target="_blank"
                rel="noopener noreferrer">
                Made by @blakssh
              </Link>
            </Button>
          </div>
        </footer>
      </div>
    </main>
  );
}
