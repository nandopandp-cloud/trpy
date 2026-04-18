import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts any string to a URL-safe ASCII slug.
 * "Patagônia" → "patagonia", "Rio de Janeiro" → "rio-de-janeiro"
 * Safe for Next.js route params — no percent-encoding issues.
 */
export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')                    // decompose accented chars: ô → o + combining ˆ
    .replace(/[\u0300-\u036f]/g, '')     // strip combining diacritics
    .replace(/[^a-z0-9\s-]/g, '')       // remove anything that's not alphanumeric/space/hyphen
    .trim()
    .replace(/\s+/g, '-')               // spaces → hyphens
    .replace(/-+/g, '-')                // collapse consecutive hyphens
}

/**
 * Converts a slug back to a display-friendly name.
 * "rio-de-janeiro" → "rio de janeiro"
 */
export function fromSlug(slug: string): string {
  return slug.replace(/-/g, ' ')
}
