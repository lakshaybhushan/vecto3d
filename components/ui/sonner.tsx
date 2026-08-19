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
            "group toast group-[.toaster]:rounded-md group-[.toaster]:border-white/10 group-[.toaster]:bg-neutral-950 group-[.toaster]:text-[14px] group-[.toaster]:text-white group-[.toaster]:shadow-2xl",
          title: "group-[.toast]:text-white",
          description: "group-[.toast]:text-neutral-400",
          actionButton:
            "group-[.toast]:rounded-md group-[.toast]:bg-white group-[.toast]:text-black",
          cancelButton:
            "group-[.toast]:rounded-md group-[.toast]:bg-neutral-800 group-[.toast]:text-neutral-300",
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
