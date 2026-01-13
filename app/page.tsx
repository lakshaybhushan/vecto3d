"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditorStore } from "@/lib/store";
import { toast } from "sonner";
import { Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  GitHubIcon,
  V0Icon,
  VercelIcon,
  XIcon,
  ChatAppIcon,
  Vecto3dIcon,
  AsteriskIcon,
} from "@/components/ui/icons";
import {
  GITHUB_SVG,
  V0_SVG,
  VERCEL_SVG,
  X_SVG,
  CHAT_APP_SVG,
  VECTO3D_SVG,
} from "@/components/data/raw-svgs";
import { sanitizeSvgForPreview, isValidSvg } from "@/lib/svg-sanitizer";
import { Logo } from "@/components/ui/logo";
import AnimatedLogo from "@/components/ui/animated-logo";

const exampleIcons = [
  { name: "GitHub", component: GitHubIcon },
  { name: "v0", component: V0Icon },
  { name: "Vercel", component: VercelIcon },
  { name: "X/Twitter", component: XIcon },
  { name: "AI Chat", component: ChatAppIcon },
  { name: "Vecto3d", component: Vecto3dIcon },
];

const iconSvgMap: Record<string, string> = {
  GitHub: GITHUB_SVG,
  v0: V0_SVG,
  Vercel: VERCEL_SVG,
  "X/Twitter": X_SVG,
  "AI Chat": CHAT_APP_SVG,
  Vecto3d: VECTO3D_SVG,
};

export default function Home() {
  const router = useRouter();
  const [svgData, setSvgData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [selectedIcon, setSelectedIcon] = useState<string>("");
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [stars, setStars] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    fetch("https://api.github.com/repos/lakshaybhushan/vecto3d")
      .then((response) => response.json())
      .then((data) => setStars(data.stargazers_count || 0))
      .catch(() => setStars(0));
  }, []);

  const processFile = useCallback((file: File) => {
    if (file && file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const data = event.target.result as string;
          if (!isValidSvg(data)) {
            toast.error("INVALID SVG FILE");
            return;
          }
          const sanitized = sanitizeSvgForPreview(data);
          if (!sanitized) {
            toast.error("SVG PROCESSING FAILED");
            return;
          }
          setSvgData(data);
          setFileName(file.name);
          setSvgContent(sanitized);
          setSelectedIcon("");
        }
      };
      reader.readAsText(file);
    } else if (file) {
      toast.error("PLEASE UPLOAD AN SVG FILE");
    }
  }, []);

  const processSvgContent = useCallback(
    (data: string, name: string = "pasted.svg") => {
      if (!isValidSvg(data)) {
        toast.error("INVALID SVG CONTENT");
        return;
      }
      const sanitized = sanitizeSvgForPreview(data);
      if (!sanitized) {
        toast.error("SVG PROCESSING FAILED");
        return;
      }
      setSvgData(data);
      setFileName(name);
      setSvgContent(sanitized);
      setSelectedIcon("");
      toast.success("SVG PASTED");
    },
    [],
  );

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as Element;
      const isWithinComponent =
        dropZoneRef.current?.contains(target) ||
        document.activeElement === document.body;
      if (!isWithinComponent) return;

      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      const textData = clipboardData.getData("text/plain");
      const htmlData = clipboardData.getData("text/html");

      if (
        textData &&
        textData.trim().startsWith("<svg") &&
        textData.trim().endsWith("</svg>")
      ) {
        e.preventDefault();
        processSvgContent(textData);
        return;
      }

      if (htmlData && htmlData.includes("<svg")) {
        const svgMatch = htmlData.match(/<svg[^>]*>[\s\S]*?<\/svg>/i);
        if (svgMatch) {
          e.preventDefault();
          processSvgContent(svgMatch[0]);
          return;
        }
      }

      const files = Array.from(clipboardData.files);
      const svgFile = files.find((file) => file.type === "image/svg+xml");
      if (svgFile) {
        e.preventDefault();
        processFile(svgFile);
        return;
      }

      if (textData || htmlData || files.length > 0) {
        e.preventDefault();
        toast.error("PLEASE PASTE VALID SVG");
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [processFile, processSvgContent]);

  const handleIconSelect = (iconName: string) => {
    setSelectedIcon(iconName);
    const content = iconSvgMap[iconName];
    if (content) {
      const sanitized = sanitizeSvgForPreview(content);
      if (!sanitized) {
        toast.error("ICON PROCESSING FAILED");
        return;
      }
      const name = `${iconName.toLowerCase().replace(/\W+/g, "-")}.svg`;
      setSvgData(content);
      setFileName(name);
      setSvgContent(sanitized);
    }
  };

  const handleContinue = async () => {
    if (svgData) {
      setIsLoading(true);
      try {
        const audio = new Audio("/continue.mp3");
        audio.play().catch(() => {});
      } catch {}

      try {
        const { setSvgData: setStoreSvg, setFileName: setStoreName } =
          useEditorStore.getState();
        sessionStorage.removeItem("vecto3d_svgData");
        sessionStorage.removeItem("vecto3d_fileName");
        setStoreSvg(svgData);
        setStoreName(fileName);

        const animationSpeed = 2;
        const baseDuration = 2.7;
        const animationCycleDuration = baseDuration / animationSpeed;
        const delayMs = Math.ceil(animationCycleDuration * 1000) + 300;
        await new Promise((resolve) => setTimeout(resolve, delayMs));

        router.push("/edit");
      } catch {
        setIsLoading(false);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) processFile(files[0]);
  };

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-black font-mono text-[14px] tracking-wide text-white uppercase">
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            <AnimatedLogo size={128} isLoading={true} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container with vertical lines */}
      <div className="mx-auto max-w-[920px] border-x border-neutral-800">
        {/* Nav */}
        <header className="flex h-12 items-center justify-between border-b border-neutral-800 px-6">
          <div className="flex items-center gap-2">
            <Logo className="h-5 w-5" />
            <span className="text-[12px] text-neutral-500">VECTO3D</span>
          </div>
          <Link
            href="https://github.com/lakshaybhushan/vecto3d"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[12px] text-neutral-500 transition-colors hover:text-white">
            <Star className="h-3 w-3" />
            <span>{stars.toLocaleString()}</span>
            <GitHubIcon size={14} />
          </Link>
        </header>

        {/* Hero */}
        <section className="border-b border-neutral-800 px-6 py-16">
          <motion.h1
            className="mb-3 text-[24px] text-white sm:text-[32px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}>
            TRANSFORM SVG TO 3D
          </motion.h1>
          <motion.p
            className="max-w-xl text-[14px] leading-relaxed text-neutral-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}>
            UPLOAD ANY SVG AND TURN IT INTO A CUSTOMIZABLE 3D MODEL. ADJUST
            DEPTH, MATERIALS, LIGHTING, AND EXPORT AS PNG, VIDEO, OR 3D FILES.
          </motion.p>
        </section>

        {/* Upload */}
        <section className="border-b border-neutral-800 px-6 py-12">
          <motion.div
            ref={dropZoneRef}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              const rect = e.currentTarget.getBoundingClientRect();
              if (
                e.clientX <= rect.left ||
                e.clientX >= rect.right ||
                e.clientY <= rect.top ||
                e.clientY >= rect.bottom
              ) {
                setIsDragging(false);
              }
            }}
            onDrop={handleDrop}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`cursor-pointer border border-dashed p-12 text-center transition-colors ${
              isDragging
                ? "border-neutral-600 bg-neutral-950"
                : "border-neutral-800 hover:border-neutral-700"
            }`}>
            <input
              type="file"
              ref={fileInputRef}
              accept=".svg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processFile(file);
              }}
            />

            <div className="flex flex-col items-center">
              {svgContent ? (
                <motion.div
                  className="mb-6 flex h-20 w-20 items-center justify-center border border-neutral-800 p-4"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  dangerouslySetInnerHTML={{
                    __html: svgContent
                      .replace(/width="[^"]*"/, 'width="100%"')
                      .replace(/height="[^"]*"/, 'height="100%"')
                      .replace(/fill="[^"]*"/g, 'fill="currentColor"')
                      .replace(/stroke="[^"]*"/g, 'stroke="currentColor"'),
                  }}
                />
              ) : (
                <div className="mb-6 flex h-20 w-20 items-center justify-center border border-neutral-800 text-neutral-700">
                  <AsteriskIcon size={32} />
                </div>
              )}

              <p className="mb-1 text-neutral-400">
                {fileName || "DROP SVG OR CLICK TO UPLOAD"}
              </p>
              <p className="text-[12px] text-neutral-700">
                {svgContent ? "READY TO TRANSFORM" : "YOU CAN ALSO PASTE"}
              </p>
            </div>
          </motion.div>

          {/* Examples */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}>
            <p className="mb-4 text-[12px] text-neutral-700">
              OR TRY AN EXAMPLE
            </p>
            <div className="flex flex-wrap gap-2">
              {exampleIcons.map((icon, index) => (
                <motion.button
                  key={icon.name}
                  onClick={() => handleIconSelect(icon.name)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                  className={`flex items-center gap-2 border px-3 py-2 text-[12px] transition-colors ${
                    selectedIcon === icon.name
                      ? "border-white bg-white text-black"
                      : "border-neutral-800 text-neutral-500 hover:border-neutral-700 hover:text-white"
                  }`}>
                  <icon.component size={14} />
                  {icon.name.toUpperCase()}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Continue */}
          <AnimatePresence>
            {svgData && (
              <motion.button
                onClick={handleContinue}
                disabled={isLoading}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-8 flex w-full items-center justify-center gap-2 border border-white bg-white py-3 text-black transition-colors hover:bg-neutral-200 disabled:opacity-50">
                {isLoading ? "PROCESSING..." : "OPEN EDITOR"}
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </section>

        {/* How It Works */}
        <section className="border-b border-neutral-800 px-6 py-16">
          <motion.p
            className="mb-8 text-[12px] text-neutral-600"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}>
            HOW IT WORKS
          </motion.p>

          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "UPLOAD",
                desc: "DROP YOUR SVG FILE OR PASTE FROM CLIPBOARD. WORKS BEST WITH SIMPLE SHAPES.",
              },
              {
                step: "02",
                title: "CUSTOMIZE",
                desc: "ADJUST DEPTH, BEVEL, MATERIALS, AND LIGHTING IN THE REAL-TIME 3D EDITOR.",
              },
              {
                step: "03",
                title: "EXPORT",
                desc: "DOWNLOAD AS PNG, MP4, GIF FOR SHARING OR STL, GLB, GLTF FOR 3D PRINTING.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}>
                <p className="mb-2 text-[12px] text-neutral-600">{item.step}</p>
                <p className="mb-2 text-white">{item.title}</p>
                <p className="text-[12px] leading-relaxed text-neutral-600">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="border-b border-neutral-800 px-6 py-16">
          <motion.p
            className="mb-8 text-[12px] text-neutral-600"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}>
            FEATURES
          </motion.p>

          <div className="grid gap-6 sm:grid-cols-2">
            {[
              {
                title: "DEPTH CONTROL",
                desc: "EXTRUDE SVG WITH PRECISE DEPTH VALUES",
              },
              {
                title: "BEVEL EDGES",
                desc: "SMOOTH BEVELED EDGES WITH ADJUSTABLE SIZE",
              },
              {
                title: "MATERIAL PRESETS",
                desc: "MATTE, GLOSSY, METALLIC, GLASS AND MORE",
              },
              {
                title: "HDR ENVIRONMENTS",
                desc: "STUDIO, SUNSET, DAWN LIGHTING SETUPS",
              },
              {
                title: "AUTO ROTATION",
                desc: "360° ROTATION FOR VIDEO RECORDING",
              },
              {
                title: "BLOOM EFFECTS",
                desc: "GLOW POST-PROCESSING FOR DRAMATIC VISUALS",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                className="border-l border-neutral-800 pl-4"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}>
                <p className="mb-1 text-neutral-400">{item.title}</p>
                <p className="text-[12px] text-neutral-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Export Formats */}
        <section className="border-b border-neutral-800 px-6 py-16">
          <motion.p
            className="mb-8 text-[12px] text-neutral-600"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}>
            EXPORT FORMATS
          </motion.p>

          <div className="grid gap-8 sm:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}>
              <p className="mb-3 text-neutral-400">IMAGES</p>
              <p className="text-[12px] text-neutral-600">
                PNG WITH TRANSPARENCY
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}>
              <p className="mb-3 text-neutral-400">VIDEO</p>
              <p className="text-[12px] text-neutral-600">
                MP4 AND GIF ANIMATIONS
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}>
              <p className="mb-3 text-neutral-400">3D FILES</p>
              <p className="text-[12px] text-neutral-600">
                STL, GLB, GLTF FOR PRINTING
              </p>
            </motion.div>
          </div>
        </section>

        {/* Open Source */}
        <section className="border-b border-neutral-800 px-6 py-16">
          <motion.p
            className="mb-8 text-[12px] text-neutral-600"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}>
            OPEN SOURCE
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}>
            <p className="mb-4 text-neutral-400">
              VECTO3D IS FREE AND OPEN SOURCE UNDER THE MIT LICENSE.
            </p>
            <Link
              href="https://github.com/lakshaybhushan/vecto3d"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[12px] text-neutral-500 transition-colors hover:text-white">
              <GitHubIcon size={14} />
              VIEW ON GITHUB
            </Link>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="flex items-center justify-between px-6 py-4 text-[12px]">
          <div className="flex items-center gap-2">
            <Logo className="h-4 w-4" />
            <span className="text-neutral-500">VECTO3D</span>
          </div>
          <Link
            href="https://laks.sh"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-600 transition-colors hover:text-white">
            MADE WITH VIBES BY LAKS.SH
          </Link>
        </footer>
      </div>
    </main>
  );
}
