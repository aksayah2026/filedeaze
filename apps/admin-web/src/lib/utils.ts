import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const extractApiData = (response: any) => {
  const data = response?.data?.content || response?.data || response?.content || response || [];
  return Array.isArray(data) ? data : [];
};
