import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function checkIsUSLocation(): Promise<boolean> {
  try {
    const response = await fetch('https://freeipapi.com/api/json');
    const data = await response.json();
    return data.countryCode === 'US';
  } catch (error) {
    console.error('Error checking location:', error);
    // Fallback to language check if IP geolocation fails
    return navigator.language.startsWith('en-US');
  }
}
