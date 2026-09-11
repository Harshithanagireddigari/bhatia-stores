/**
 * Optional fixed brand imagery.
 *
 * Paste only full HTTPS URLs from your image host (for example Cloudinary).
 * Keep hero slides and product images out of this file: manage those in
 * Admin → Launchpad and Admin → Products, where their URLs are stored in the
 * database automatically after upload.
 */
export const brandImageUrls = {
  // Example: "https://res.cloudinary.com/your-cloud/image/upload/v123/bhatia-brand/login.jpg"
  loginPanel: "",
} as const;

export function hasHostedImage(url: string): boolean {
  return url.startsWith("https://");
}
