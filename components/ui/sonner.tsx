"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      duration={3000}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-black group-[.toaster]:text-white group-[.toaster]:border-neutral-800 group-[.toaster]:shadow-lg group-[.toaster]:font-mono group-[.toaster]:text-[14px] group-[.toaster]:tracking-wide group-[.toaster]:uppercase group-[.toaster]:rounded-none",
          title: "group-[.toast]:text-white group-[.toast]:font-mono",
          description:
            "group-[.toast]:text-neutral-400 group-[.toast]:font-mono",
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-black group-[.toast]:font-mono group-[.toast]:rounded-none",
          cancelButton:
            "group-[.toast]:bg-neutral-800 group-[.toast]:text-neutral-400 group-[.toast]:font-mono group-[.toast]:rounded-none",
          success: "group-[.toaster]:border-neutral-700",
          error:
            "group-[.toaster]:border-red-900 group-[.toaster]:text-red-400",
          info: "group-[.toaster]:border-neutral-700",
          warning: "group-[.toaster]:border-yellow-900",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
