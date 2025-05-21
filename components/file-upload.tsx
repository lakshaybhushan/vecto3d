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

const exampleIcons = [
  { name: "GitHub", component: GitHubIcon },
  { name: "v0.dev", component: V0Icon },
  { name: "Vercel", component: VercelIcon },
  { name: "X", component: XIcon },
  { name: "Chat App", component: ChatAppIcon },
  { name: "Vecto3d", component: Vecto3dIcon },
];

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
          onFileUpload(svgData, file.name);
          setSvgContent(svgData);
          // Reset selected icon when uploading a new file
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

      const selectedIconObj = exampleIcons.find(
        (icon) => icon.name === iconName,
      );
      if (selectedIconObj) {
        let svgContent = "";
        if (iconName === "GitHub") {
          svgContent = GITHUB_SVG;
        } else if (iconName === "v0.dev") {
          svgContent = V0_SVG;
        } else if (iconName === "Vercel") {
          svgContent = VERCEL_SVG;
        } else if (iconName === "X") {
          svgContent = X_SVG;
        } else if (iconName === "Chat App") {
          svgContent = CHAT_APP_SVG;
        } else if (iconName === "Vecto3d") {
          svgContent = VECTO3D_SVG;
        }

        onFileUpload(svgContent, `${iconName.toLowerCase()}.svg`);
        setSvgContent(svgContent);
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
          <div className="relative z-10 flex items-center justify-center w-32 h-32">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl transform scale-75" />
            <div className="relative z-10 w-22 h-22 p-1 rounded-xl bg-background/80 backdrop-blur-xs border-2 border-primary/30 shadow-xl shadow-primary/20 flex items-center justify-center overflow-hidden">
              <IconComponent size={58} />
            </div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="opacity-100">
      <Card className="border-2 shadow-lg w-full p-2">
        <CardContent className="p-0">
          <div
            ref={dropZoneRef}
            className={`relative flex flex-col py-6 px-10 items-center justify-center cursor-pointer transition-all duration-500 min-w-[200px] min-h-[340px] rounded-lg ${
              isDragging
                ? "border-primary border-2 border-dashed bg-primary/10"
                : "border-border border-2 border-dashed hover:bg-muted/30"
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

            <div className="flex flex-col items-center justify-center h-full">
              <div className="relative h-fit mb-5 flex items-center justify-center">
                {svgContent ? (
                  <div className="relative z-10 flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl transform scale-75" />
                    <div
                      className="relative z-10 w-24 h-24 p-6 rounded-xl bg-primary-foreground backdrop-blur-xs border-2 shadow-xl shadow-primary/20 flex items-center justify-center overflow-hidden"
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
                      className={`relative z-10 p-3.5 rounded-xl border-2 shadow-lg ${
                        isDragging
                          ? "border-primary bg-primary-foreground"
                          : "border-border bg-muted"
                      }`}>
                      <AsteriskIcon size={48} />
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center w-full">
                <div className={isDragging ? "hidden" : "block"}>
                  <p className="text-lg font-medium">
                    {fileName
                      ? fileName
                      : "Click this space / Drop Your SVG File Here"}
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    {svgContent || selectedIcon
                      ? "Let's make it 3D!"
                      : "And see the magic happen!"}
                  </p>
                  <div className="w-full flex items-center justify-center gap-2 my-3">
                    <div className="w-full h-px border border-dashed"></div>
                    <span className="text-sm text-muted-foreground">or</span>
                    <div className="w-full h-px border border-dashed"></div>
                  </div>
                  <div className="w-full space-y-4">
                    <p className="text-sm">Select any of the below</p>
                    <div className="flex flex-wrap justify-center gap-4">
                      {exampleIcons.map((icon) => (
                        <div key={icon.name}>
                          <Button
                            variant={
                              selectedIcon === icon.name ? "default" : "outline"
                            }
                            size="lg"
                            className={`flex flex-col items-center justify-center p-3.5 h-auto w-[81px] gap-1.5 rounded-lg transition-transform duration-300 ease-out ${
                              selectedIcon === icon.name
                                ? "bg-primary text-primary-foreground shadow-lg scale-105"
                                : "bg-background text-foreground hover:scale-105 hover:bg-muted/60 active:scale-100 active:duration-75"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleIconSelect(icon.name);
                            }}>
                            <icon.component size={34} />
                            <span className="text-xs font-medium whitespace-nowrap">
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
                    <p className="text-lg font-medium text-primary">
                      Drop your SVG file here
                    </p>
                  </div>
                )}
              </div>
            </div>

            {isDragging && (
              <>
                <div
                  className="absolute w-18 h-18 rounded-full bg-primary/20 blur-xl"
                  style={{ top: "20%", left: "20%" }}
                />
                <div
                  className="absolute w-14 h-14 rounded-full bg-primary/20 blur-xl"
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
