/**
 * Convert a string into a URL-safe slug
 * @param text - The text to slugify
 * @returns A URL-safe slug (lowercase, hyphen-separated)
 *
 * @example
 * slugify('Hello World!') // 'hello-world'
 * slugify('My First Post!') // 'my-first-post'
 * slugify('  Trim Spaces  ') // 'trim-spaces'
 */
export function slugify(text: string): string {
  return text
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing whitespace
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple consecutive hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}
