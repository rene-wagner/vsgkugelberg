/**
 * Shared formatting utilities for the application
 */

/**
 * Format a date string to German locale format (DD.MM.YYYY)
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format a date string to German time format (HH:MM)
 * @param dateString ISO date string
 * @returns Formatted time string
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get initials from a name or username
 * @param name Full name or username
 * @param maxLength Maximum number of initials to return (default: 2)
 * @returns Uppercase initials
 */
export function getInitials(name: string, maxLength: number = 2): string {
  return name
    .split(/[\s._-]+/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, maxLength);
}

/**
 * Truncate text to a specific length with ellipsis
 * @param text Text to truncate
 * @param length Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) {
    return text;
  }
  return text.slice(0, length) + '...';
}
