/**
 * Formats a date or ISO string into a human-readable relative time format
 * e.g., "just now", "5 mins ago", "2 hours ago", "yesterday", etc.
 *
 * @param timestamp Date object or ISO string to format
 * @param language Optional language code for translation (defaults to 'en')
 * @returns Formatted relative time string
 */
export function getRelativeTime(timestamp: Date | string, language = "en"): string {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Invalid date check
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  // Handle future dates
  if (diffInSeconds < 0) {
    return formatFutureTime(diffInSeconds, language);
  }

  // Time intervals in seconds
  const MINUTE = 60;
  const HOUR = MINUTE * 60;
  const DAY = HOUR * 24;
  const WEEK = DAY * 7;
  const MONTH = DAY * 30;
  const YEAR = DAY * 365;

  // Format past dates
  if (diffInSeconds < 10) {
    return translateTime("just now", language);
  } else if (diffInSeconds < MINUTE) {
    return translateTime(`${diffInSeconds} seconds ago`, language);
  } else if (diffInSeconds < 2 * MINUTE) {
    return translateTime("1 min ago", language);
  } else if (diffInSeconds < HOUR) {
    return translateTime(`${Math.floor(diffInSeconds / MINUTE)} mins ago`, language);
  } else if (diffInSeconds < 2 * HOUR) {
    return translateTime("1 hour ago", language);
  } else if (diffInSeconds < DAY) {
    return translateTime(`${Math.floor(diffInSeconds / HOUR)} hours ago`, language);
  } else if (diffInSeconds < 2 * DAY) {
    return translateTime("yesterday", language);
  } else if (diffInSeconds < WEEK) {
    return translateTime(`${Math.floor(diffInSeconds / DAY)} days ago`, language);
  } else if (diffInSeconds < 2 * WEEK) {
    return translateTime("1 week ago", language);
  } else if (diffInSeconds < MONTH) {
    return translateTime(`${Math.floor(diffInSeconds / WEEK)} weeks ago`, language);
  } else if (diffInSeconds < 2 * MONTH) {
    return translateTime("1 month ago", language);
  } else if (diffInSeconds < YEAR) {
    return translateTime(`${Math.floor(diffInSeconds / MONTH)} months ago`, language);
  } else if (diffInSeconds < 2 * YEAR) {
    return translateTime("1 year ago", language);
  } else {
    return translateTime(`${Math.floor(diffInSeconds / YEAR)} years ago`, language);
  }
}

/**
 * Formats future time (mostly for completeness)
 */
function formatFutureTime(diffInSeconds: number, language: string): string {
  // Convert to positive for easier calculation
  const positiveDiff = Math.abs(diffInSeconds);

  // Time intervals in seconds
  const MINUTE = 60;
  const HOUR = MINUTE * 60;
  const DAY = HOUR * 24;
  const WEEK = DAY * 7;
  const MONTH = DAY * 30;
  const YEAR = DAY * 365;

  if (positiveDiff < 10) {
    return translateTime("just now", language);
  } else if (positiveDiff < MINUTE) {
    return translateTime(`in ${positiveDiff} seconds`, language);
  } else if (positiveDiff < 2 * MINUTE) {
    return translateTime("in 1 min", language);
  } else if (positiveDiff < HOUR) {
    return translateTime(`in ${Math.floor(positiveDiff / MINUTE)} mins`, language);
  } else if (positiveDiff < 2 * HOUR) {
    return translateTime("in 1 hour", language);
  } else if (positiveDiff < DAY) {
    return translateTime(`in ${Math.floor(positiveDiff / HOUR)} hours`, language);
  } else if (positiveDiff < 2 * DAY) {
    return translateTime("tomorrow", language);
  } else if (positiveDiff < WEEK) {
    return translateTime(`in ${Math.floor(positiveDiff / DAY)} days`, language);
  } else if (positiveDiff < MONTH) {
    return translateTime(`in ${Math.floor(positiveDiff / WEEK)} weeks`, language);
  } else if (positiveDiff < YEAR) {
    return translateTime(`in ${Math.floor(positiveDiff / MONTH)} months`, language);
  } else {
    return translateTime(`in ${Math.floor(positiveDiff / YEAR)} years`, language);
  }
}

/**
 * Simple translation function - can be expanded or integrated with i18n libraries
 */
// eslint-disable-next-line
function translateTime(text: string, language: string): string {
  // In a real app, you would use your i18n system here
  // This is a placeholder for demonstration

  // For now, return English (could be expanded with translations)
  return text;
}

/**
 * Additional examples:
 *
 * // Example with the specific timestamp from the post data
 * // If you run this code on 2025-05-06T04:06:54.236Z (14 minutes after the post timestamp):
 * getRelativeTime("2025-05-06T03:52:54.236Z"); // Would return "14 mins ago"
 *
 * // For testing this functionality without waiting:
 * function simulateTimeAgo(minutes: number): string {
 *   // Create a date that's X minutes in the past from now
 *   const date = new Date(Date.now() - minutes * 60 * 1000);
 *   return getRelativeTime(date);
 * }
 *
 * // This will always return "14 mins ago" regardless of when you run it:
 * simulateTimeAgo(14); // "14 mins ago"
 */
