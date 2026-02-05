import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names safely with tailwind-merge
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
