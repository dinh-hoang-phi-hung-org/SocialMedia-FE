// Utility function to ensure URLs start with https
export const ensureHttps = (url: string | undefined | null): string => {
  if (!url) return "";
  if (!url.startsWith("https://") && !url.startsWith("http://")) {
    return `https://${url}`;
  }
  return url;
};
