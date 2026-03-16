import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines and merges CSS class names using clsx and tailwind-merge.
 *
 * This utility function takes multiple class name inputs, processes them with clsx
 * to handle conditional classes, and then merges them with twMerge to resolve
 * Tailwind CSS class conflicts.
 *
 * @param inputs - Variable number of class value inputs that can be strings, objects, arrays, etc.
 * @returns A string of merged and deduplicated CSS class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
