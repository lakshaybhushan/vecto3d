import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export async function checkIsUSLocation(): Promise<boolean> {
  try {
    const response = await fetch("https://freeipapi.com/api/json");
    if (!response.ok) {
      throw new Error("Failed to fetch location data");
    }
    const data = await response.json();
    return data.countryCode === "US";
  } catch (error) {
    console.error("Error checking location:", error);
    // If we can't determine location, default to false for safety
    return false;
  }
}