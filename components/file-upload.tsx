import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileUploadProps } from "@/lib/types";
import { toast } from "sonner";
import {
  GitHubIcon,
  V0Icon,
  VercelIcon,
  XIcon,
  ChatAppIcon,
  Vecto3dIcon,
} from "@/components/ui/example-icons";
import { AsteriskIcon } from "@/components/ui/ui-icons";
import { Button } from "@/components/ui/button";
import {
  GITHUB_SVG,
  V0_SVG,
  VERCEL_SVG,
  X_SVG,
  CHAT_APP_SVG,
  VECTO3D_SVG,
} from "@/components/raw-svgs";
import { sanitizeSvgForPreview, isValidSvg } from "@/lib/svg-sanitizer";

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

export function FileUpload({
  onFileUpload,
  fileName,
  selectedIcon,
  onIconSelect,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const processFile = (file: File) => {
    if (file && file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const svgData = event.target.result as string;

          // Validate SVG content
          if (!isValidSvg(svgData)) {
            toast.error("Invalid SVG file format");
            return;
          }

          // Sanitize for safe display
          const sanitizedSvg = sanitizeSvgForPreview(svgData);
          if (!sanitizedSvg) {
            toast.error("SVG file could not be processed safely");
            return;
          }

          onFileUpload(svgData, file.name);
          setSvgContent(sanitizedSvg);
          if (onIconSelect) onIconSelect("");
        }
      };
      reader.readAsText(file);
    } else if (file) {
      toast.error("Please upload an SVG file (.svg)");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleIconSelect = (iconName: string) => {
    if (onIconSelect) {
      onIconSelect(iconName);

      const svgContent = iconSvgMap[iconName];
      if (svgContent) {
        // Sanitize the preset SVG content for display
        const sanitizedSvg = sanitizeSvgForPreview(svgContent);
        if (!sanitizedSvg) {
          toast.error("Icon could not be processed safely");
          return;
        }

        const fileName = `${iconName.toLowerCase().replace(/\W+/g, "-")}.svg`;
        onFileUpload(svgContent, fileName);
        setSvgContent(sanitizedSvg);
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if the mouse has actually left the container, not just moved over a child element
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (
      x <= rect.left ||
      x >= rect.right ||
      y <= rect.top ||
      y >= rect.bottom
    ) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const renderSelectedIcon = () => {
    if (selectedIcon) {
      const IconComponent = exampleIcons.find(
        (icon) => icon.name === selectedIcon,
      )?.component;
      if (IconComponent) {
        return (
          <div className="relative z-10 flex h-16 w-16 items-center justify-center sm:h-18 sm:w-18 md:h-20 md:w-20 lg:h-24 lg:w-24">
            <div className="bg-primary/10 absolute inset-0 transform rounded-full blur-xl" />
            <div className="bg-background/80 border-primary/30 shadow-primary/20 relative z-10 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border-2 p-1 shadow-xl backdrop-blur-xs sm:h-16 sm:w-16 md:h-18 md:w-18">
              <IconComponent size={32} />
            </div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="opacity-100">
      <Card className="w-full border-2 p-1.5 shadow-lg sm:p-2">
        <CardContent className="p-0">
          <div
            ref={dropZoneRef}
            className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg px-4 py-3 transition-all duration-500 sm:min-h-[220px] md:min-h-[260px] lg:min-h-[300px] ${
              isDragging
                ? "border-primary bg-primary/10 border-2 border-dashed"
                : "border-border hover:bg-muted/30 border-2 border-dashed"
            }`}
            onClick={handleUploadClick}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              backgroundColor: "transparent",
            }}>
            <input
              type="file"
              ref={fileInputRef}
              accept=".svg"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex h-full flex-col items-center justify-center">
              <div className="relative mb-2 flex h-fit items-center justify-center sm:mb-3">
                {svgContent ? (
                  <div className="relative z-10 flex items-center justify-center">
                    <div
                      className="bg-muted relative z-10 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border-2 p-2.5 shadow-lg sm:h-16 sm:w-16 sm:p-3 md:h-18 md:w-18"
                      // Safe to use dangerouslySetInnerHTML here as svgContent is sanitized
                      dangerouslySetInnerHTML={{
                        __html: svgContent
                          .replace(/width="[^"]*"/, 'width="100%"')
                          .replace(/height="[^"]*"/, 'height="100%"')
                          .replace(/fill="[^"]*"/g, 'fill="currentColor"')
                          .replace(/stroke="[^"]*"/g, 'stroke="currentColor"'),
                      }}
                    />
                  </div>
                ) : selectedIcon ? (
                  renderSelectedIcon()
                ) : (
                  <div>
                    <div
                      className={`relative z-10 rounded-xl border-2 p-2.5 shadow-lg sm:p-3 ${
                        isDragging
                          ? "border-primary bg-primary-foreground"
                          : "border-border bg-muted"
                      }`}>
                      <AsteriskIcon size={36} />
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full text-center">
                <div className={isDragging ? "hidden" : "block"}>
                  <p className="text-sm font-medium sm:text-base">
                    {fileName
                      ? fileName
                      : "Click this space / Drop Your SVG File Here"}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                    {svgContent || selectedIcon
                      ? "Let's make it 3D!"
                      : "And see the magic happen!"}
                  </p>
                  <div className="my-2 flex w-full items-center justify-center gap-2 sm:my-2.5">
                    <div className="h-px w-full border border-dashed"></div>
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      or
                    </span>
                    <div className="h-px w-full border border-dashed"></div>
                  </div>
                  <div className="w-full space-y-2 sm:space-y-3">
                    <p className="text-xs sm:text-sm">
                      Select any of the below
                    </p>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:flex md:flex-wrap md:justify-center md:gap-3">
                      {exampleIcons.map((icon) => (
                        <div key={icon.name}>
                          <Button
                            variant="secondary"
                            className={`flex h-auto w-full flex-col items-center justify-center gap-1 rounded-xl p-2 transition-transform duration-300 ease-out sm:gap-1.5 sm:p-2.5 md:w-[72px] md:p-3 ${
                              selectedIcon === icon.name
                                ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground border-primary/20 border transition-all duration-100 ease-out"
                                : "bg-secondary text-foreground hover:bg-secondary/60 hover:text-foreground border transition-all duration-100 ease-out"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleIconSelect(icon.name);
                            }}>
                            <icon.component size={24} />
                            <span className="text-[9px] font-medium whitespace-nowrap sm:text-[10px]">
                              {icon.name}
                            </span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {isDragging && (
                  <div>
                    <p className="text-primary text-sm font-medium sm:text-base">
                      Drop your SVG file here
                    </p>
                  </div>
                )}
              </div>
            </div>

            {isDragging && (
              <>
                <div
                  className="bg-primary/20 absolute h-12 w-12 rounded-full blur-xl sm:h-14 sm:w-14 md:h-16 md:w-16"
                  style={{ top: "20%", left: "20%" }}
                />
                <div
                  className="bg-primary/20 absolute h-8 w-8 rounded-full blur-xl sm:h-10 sm:w-10 md:h-12 md:w-12"
                  style={{ bottom: "20%", right: "20%" }}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
