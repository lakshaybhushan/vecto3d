import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
// import { FileType } from "lucide-react";
import { FileUploadProps } from "@/lib/types";
import { motion } from "framer-motion";
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
        (icon) => icon.name === iconName
      );
      if (selectedIconObj) {
        let svgContent = "";
        if (iconName === "GitHub") {
          svgContent =
            '<svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.304 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577 0-.287-.011-1.045-.017-2.052-3.338.724-4.042-1.607-4.042-1.607-.546-1.384-1.333-1.754-1.333-1.754-1.089-.743.083-.728.083-.728 1.205.085 1.838 1.237 1.838 1.237 1.07 1.83 2.807 1.301 3.49.995.108-.775.419-1.301.762-1.601-2.665-.303-5.467-1.333-5.467-5.933 0-1.313.469-2.386 1.236-3.227-.124-.303-.536-1.53.117-3.185 0 0 1.008-.322 3.303 1.227.957-.266 1.986-.398 3.006-.403 1.02.005 2.049.137 3.006.403 2.295-1.549 3.303-1.227 3.303-1.227.653 1.655.241 2.882.118 3.185.767.841 1.236 1.914 1.236 3.227 0 4.608-2.805 5.63-5.475 5.925.43.371.815 1.102.815 2.222 0 1.604-.014 2.898-.014 3.287 0 .319.192.693.798.577C20.563 21.8 24 17.304 24 12c0-6.627-5.373-12-12-12z" /></svg>';
        } else if (iconName === "v0.dev") {
          svgContent =
            '<svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path clipRule="evenodd" d="M14.252 8.25h5.624c.088 0 .176.006.26.018l-5.87 5.87a1.889 1.889 0 01-.019-.265V8.25h-2.25v5.623a4.124 4.124 0 004.125 4.125h5.624v-2.25h-5.624c-.09 0-.179-.006-.265-.018l5.874-5.875a1.9 1.9 0 01.02.27v5.623H24v-5.624A4.124 4.124 0 0019.876 6h-5.624v2.25zM0 7.5v.006l7.686 9.788c.924 1.176 2.813.523 2.813-.973V7.5H8.25v6.87L2.856 7.5H0z" /></svg>';
        } else if (iconName === "Vercel") {
          svgContent =
            '<svg width="512" height="512" fill="currentColor" viewBox="0 0 512 512"><path fillRule="evenodd" d="M256,48,496,464H16Z" /></svg>';
        } else if (iconName === "X") {
          svgContent =
            '<svg width="300" height="300.251" fill="currentColor" viewBox="0 0 300 300.251"><path d="M178.57 127.15 290.27 0h-26.46l-97.03 110.38L89.34 0H0l117.13 166.93L0 300.25h26.46l102.4-116.59 81.8 116.59h89.34M36.01 19.54H76.66l187.13 262.13h-40.66" /></svg>';
        } else if (iconName === "Chat App") {
          svgContent =
            '<svg width="428" height="418" fill="currentColor" viewBox="0 0 428 418"><path d="M364.062 138.596L359.276 149.599C358.528 151.391 357.267 152.922 355.65 153.998C354.033 155.075 352.134 155.649 350.191 155.649C348.248 155.649 346.349 155.075 344.732 153.998C343.115 152.922 341.853 151.391 341.105 149.599L336.32 138.596C327.905 119.13 312.494 103.523 293.129 94.8536L278.363 88.2632C276.571 87.4397 275.054 86.1202 273.99 84.4611C272.926 82.802 272.361 80.8729 272.361 78.9024C272.361 76.9319 272.926 75.0028 273.99 73.3437C275.054 71.6846 276.571 70.3651 278.363 69.5416L292.312 63.34C312.164 54.424 327.838 38.2395 336.105 18.1205L341.028 6.2421C341.751 4.4021 343.011 2.82241 344.646 1.70897C346.28 0.595536 348.213 0 350.191 0C352.169 0 354.101 0.595536 355.736 1.70897C357.37 2.82241 358.631 4.4021 359.354 6.2421L364.276 18.101C372.535 38.2238 388.202 54.4153 408.05 63.34L422.019 69.5611C423.805 70.3869 425.317 71.7062 426.377 73.3632C427.437 75.0202 428 76.9456 428 78.9121C428 80.8786 427.437 82.8041 426.377 84.4611C425.317 86.118 423.805 87.4373 422.019 88.2632L407.233 94.8342C387.872 103.512 372.468 119.126 364.062 138.596ZM350.191 194.43C363.396 194.44 376.506 192.212 388.965 187.839C389.056 190.043 389.101 192.24 389.101 194.43C389.101 235.678 372.703 275.237 343.515 304.404C314.327 333.571 274.739 349.957 233.461 349.957V418C136.185 379.118 0 320.796 0 194.43C0 153.182 16.3978 113.623 45.586 84.4556C74.7743 55.2886 114.362 38.9028 155.64 38.9028H233.461C235.666 38.9028 237.864 38.9481 240.056 39.0389C233.856 56.6314 231.968 75.4531 234.551 93.9252C237.134 112.397 244.112 129.981 254.9 145.202C265.687 160.423 279.971 172.836 296.551 181.402C313.132 189.968 331.526 194.435 350.191 194.43Z" /></svg>';
        } else if (iconName === "Vecto3d") {
          svgContent =
            '<svg width="128" height="128" fill="currentColor" viewBox="0 0 128 128"><path d="M111.76 46.9546V58.7413C111.76 59.8021 111.339 60.8196 110.588 61.5697C109.838 62.3199 108.821 62.7413 107.76 62.7413C106.699 62.7413 105.682 62.3199 104.932 61.5697C104.181 60.8196 103.76 59.8021 103.76 58.7413V46.9546C103.794 45.5713 103.559 44.1946 103.067 42.9013L64.1333 66.2613V109.941C64.7461 109.759 65.3365 109.509 65.8933 109.195L79.3867 101.728C80.3055 101.258 81.3688 101.157 82.3598 101.445C83.3508 101.732 84.1949 102.386 84.72 103.275C85.1985 104.197 85.299 105.27 85.0004 106.265C84.7017 107.261 84.0273 108.101 83.12 108.608L69.68 116.075C66.73 117.723 63.406 118.586 60.0267 118.581C56.6323 118.572 53.2946 117.71 50.32 116.075L18.5867 98.4746C15.4986 96.723 12.9263 94.1889 11.1287 91.1274C9.33113 88.0658 8.37159 84.5848 8.34668 81.0346V46.9546C8.34668 43.3866 9.30668 39.8879 11.12 36.8213C11.4258 36.2702 11.7813 35.7546 12.1867 35.2746C13.8508 32.8898 16.0404 30.9192 18.5867 29.5146L50.5867 11.8613C53.5524 10.2602 56.8697 9.42188 60.24 9.42188C63.6103 9.42188 66.9277 10.2602 69.8933 11.8613L101.893 29.5146C104.133 30.7466 106.101 32.4373 107.653 34.4746C107.892 34.72 108.105 34.9866 108.293 35.2746C108.699 35.7546 109.054 36.2702 109.36 36.8213C111.067 39.9146 111.899 43.4186 111.76 46.9546Z" /><path d="M89.824 77.4208L95.0056 80.2323L93.3263 74.5688C91.927 73.8096 91.4073 72.0571 92.1741 70.644C92.539 69.9715 93.156 69.4716 93.8895 69.2541C94.6229 69.0366 95.4127 69.1194 96.0851 69.4843C97.4983 70.2511 98.0179 72.0035 97.2587 73.4028L98.938 79.0663L101.749 73.8848C101.536 73.1508 101.62 72.3621 101.985 71.6901C102.349 71.0181 102.965 70.5173 103.696 70.2965C104.058 70.1861 104.439 70.1487 104.815 70.1867C105.192 70.2246 105.557 70.3371 105.89 70.5176C106.223 70.6982 106.516 70.943 106.753 71.2381C106.99 71.5331 107.166 71.8723 107.271 72.236C107.721 73.7534 106.849 75.3605 105.324 75.8243L102.512 81.0058L108.19 79.334C108.555 78.6616 109.172 78.1617 109.905 77.9442C110.639 77.7267 111.428 77.8095 112.101 78.1744C112.773 78.5392 113.273 79.1563 113.491 79.8897C113.708 80.6232 113.625 81.413 113.26 82.0854C112.494 83.4986 110.741 84.0182 109.342 83.2589L103.678 84.9382L108.86 87.7497C109.594 87.5358 110.383 87.6204 111.055 87.985C111.727 88.3496 112.227 88.9648 112.448 89.6967C112.912 91.2216 112.04 92.8287 110.509 93.2712C108.991 93.7211 107.384 92.8491 106.92 91.3242L101.739 88.5127L103.411 94.19C104.81 94.9493 105.337 96.6879 104.57 98.101C104.206 98.7735 103.588 99.2734 102.855 99.4909C102.122 99.7084 101.332 99.6256 100.659 99.2607C99.2462 98.4939 98.7404 96.749 99.4997 95.3497L97.8065 89.6787L94.995 94.8602C95.4374 96.3914 94.5654 97.9985 93.048 98.4485C91.5231 98.9122 89.916 98.0402 89.4736 96.509C89.2597 95.775 89.3442 94.9862 89.7088 94.3143C90.0734 93.6423 90.6886 93.1415 91.4206 92.9207L94.2321 87.7392L88.5686 89.4185C87.8093 90.8178 86.0568 91.3374 84.6437 90.5706C83.9713 90.2058 83.4713 89.5887 83.2539 88.8553C83.0364 88.1218 83.1192 87.332 83.484 86.6596C83.8489 85.9872 84.4659 85.4872 85.1994 85.2698C85.9328 85.0523 86.7226 85.1351 87.3951 85.4999L93.0661 83.8068L87.8845 80.9953C86.3533 81.4377 84.7462 80.5657 84.2963 79.0483C84.1858 78.6863 84.1485 78.3059 84.1864 77.9293C84.2244 77.5528 84.3369 77.1875 84.5174 76.8548C84.6979 76.5222 84.9428 76.2288 85.2378 75.9917C85.5328 75.7546 85.872 75.5785 86.2358 75.4738C86.9697 75.2599 87.7585 75.3445 88.4305 75.7091C89.1025 76.0737 89.6033 76.6889 89.824 77.4208Z" /></svg>';
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
    if (e.currentTarget === dropZoneRef.current) {
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
        (icon) => icon.name === selectedIcon
      )?.component;
      if (IconComponent) {
        return (
          <motion.div
            className="relative z-10 flex items-center justify-center w-32 h-32"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 20 }}>
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl transform scale-75" />
            <div className="relative z-10 w-22 h-22 p-1 rounded-xl bg-background/80 backdrop-blur-xs border-2 border-primary/30 shadow-xl shadow-primary/20 flex items-center justify-center overflow-hidden">
              <IconComponent size={58} />
            </div>
          </motion.div>
        );
      }
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}>
      <Card className="border-2 shadow-lg w-full p-2">
        <CardContent className="p-0">
          <motion.div
            ref={dropZoneRef}
            className={`relative flex flex-col py-4 px-8 items-center justify-center cursor-pointer transition-all duration-500 ${
              isDragging
                ? "border-primary border-2 border-dashed bg-primary/10"
                : "border-border border-2 border-dashed hover:bg-muted/30"
            }`}
            onClick={handleUploadClick}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            animate={{
              borderRadius: "8px",
            }}
            style={{
              backgroundColor: "transparent",
            }}
            transition={{
              duration: 0.2,
            }}>
            <input
              type="file"
              ref={fileInputRef}
              accept=".svg"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex flex-col items-center justify-center">
              <motion.div
                className="relative h-fit mb-5 flex items-center justify-center"
                animate={{
                  scale: isDragging ? 1.1 : 1,
                  y: isDragging ? -5 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}>
                {svgContent ? (
                  <motion.div
                    className="relative z-10 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 20 }}>
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
                  </motion.div>
                ) : selectedIcon ? (
                  renderSelectedIcon()
                ) : (
                  <div>
                    <motion.div
                      className={`relative z-10 p-3.5 rounded-xl border-2 shadow-lg ${
                        isDragging
                          ? "border-primary bg-primary-foreground"
                          : "border-border bg-muted"
                      }`}
                      // animate={{
                      //   rotate: isDragging ? [-2, 2, -2] : 0,
                      // }}
                      // transition={{
                      //   rotate: { repeat: Infinity, duration: 0.5 },
                      // }}>
                    >
                      <AsteriskIcon size={48} />
                    </motion.div>
                  </div>
                )}
              </motion.div>

              <div className="text-center space-y-1.5">
                <motion.div
                  animate={{
                    opacity: isDragging ? 0 : 1,
                    height: isDragging ? 0 : "auto",
                  }}
                  transition={{ duration: 0.2 }}>
                  <p className="text-lg font-medium">
                    {fileName ? (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}>
                        {fileName}
                      </motion.span>
                    ) : (
                      "Click this space / Drop Your SVG File Here"
                    )}
                  </p>
                  <p className="text-muted-foreground text-sm mt-1.5">
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
                    <motion.div
                      className="flex flex-wrap justify-center gap-4"
                      variants={{
                        hidden: { opacity: 0 },
                        show: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.05,
                          },
                        },
                      }}
                      initial="hidden"
                      animate="show">
                      {exampleIcons.map((icon) => (
                        <motion.div
                          key={icon.name}
                          variants={{
                            hidden: { opacity: 0, y: 10, scale: 0.95 },
                            show: {
                              opacity: 1,
                              y: 0,
                              scale: 1,
                              transition: {
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                              },
                            },
                          }}>
                          <Button
                            variant={
                              selectedIcon === icon.name ? "default" : "outline"
                            }
                            size="lg"
                            className={`flex flex-col items-center justify-center p-3.5 h-auto w-[81px] gap-1.5 rounded-lg transition-all duration-200 ${
                              selectedIcon === icon.name
                                ? "bg-primary text-primary-foreground shadow-lg scale-105"
                                : "hover:bg-muted/60 hover:scale-105"
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
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{
                    opacity: isDragging ? 1 : 0,
                    height: isDragging ? "auto" : 0,
                  }}
                  transition={{ duration: 0.2 }}>
                  <p className="text-lg font-medium text-primary">
                    Drop your SVG file here
                  </p>
                </motion.div>
              </div>
            </div>

            {isDragging && (
              <>
                <motion.div
                  className="absolute w-18 h-18 rounded-full bg-primary/20 blur-xl"
                  animate={{
                    x: [0, 30, -30, 0],
                    y: [0, -30, 30, 0],
                    scale: [1, 1.2, 0.8, 1],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  style={{ top: "20%", left: "20%" }}
                />
                <motion.div
                  className="absolute w-14 h-14 rounded-full bg-primary/20 blur-xl"
                  animate={{
                    x: [0, -40, 40, 0],
                    y: [0, 40, -40, 0],
                    scale: [1, 0.7, 1.3, 1],
                  }}
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  style={{ bottom: "20%", right: "20%" }}
                />
              </>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
