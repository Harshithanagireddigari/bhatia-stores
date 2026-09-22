const configuredServerUrl = process.env.IMAGE_SERVER_URL?.replace(/\/$/, "");

export function isAllowedImageUrl(value: unknown): value is string {
  try {
    const url = new URL(String(value));
    return url.protocol === "https:" || (url.protocol === "http:" && configuredServerUrl !== undefined && url.origin === new URL(configuredServerUrl).origin);
  } catch {
    return false;
  }
}

export async function deleteSelfHostedImage(assetId: string | null) {
  if (!assetId || !configuredServerUrl || !process.env.IMAGE_SERVER_TOKEN) return;
  try {
    await fetch(`${configuredServerUrl}/v1/images`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${process.env.IMAGE_SERVER_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ assetId }),
    });
  } catch (error) {
    console.error("Self-hosted image cleanup failed:", error);
  }
}
