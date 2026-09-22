import { NextRequest } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/security/guards";
import { apiFailure, jsonError, jsonResponse } from "@/lib/security/http";
import { logMissingConfig, logServerError } from "@/lib/security/logger";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/** Verify file magic bytes to prevent renamed binaries/SVGs with malicious scripts. */
function isValidImageBytes(buffer: Buffer, mime: string): boolean {
  if (buffer.length < 12) return false;

  if (mime === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mime === "image/png") {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }
  if (mime === "image/webp") {
    const isRiff =
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46;
    const isWebp =
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50;
    return isRiff && isWebp;
  }
  return false;
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    logMissingConfig("upload", "Cloudinary environment variables");
    return jsonError(
      "Image storage is not configured. Configure Cloudinary environment variables on the server.",
      503
    );
  }

  try {
    const data = await req.formData();
    const file = data.get("file");
    const rawAssetType = data.get("assetType");

    if (!file || !(file instanceof File)) {
      return jsonError("A valid image file is required.");
    }

    if (file.size > MAX_FILE_SIZE) {
      return jsonError("Image must be smaller than 5MB.");
    }

    const mime = file.type.toLowerCase().trim();
    if (!ALLOWED_MIME_TYPES.has(mime)) {
      return jsonError("Only JPG, PNG, and WebP images are supported.");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!isValidImageBytes(buffer, mime)) {
      return jsonError("File content does not match the allowed image type.");
    }

    const assetType =
      rawAssetType === "hero" ? "hero" : "product";
    const folder = assetType === "hero" ? "bhatia-hero" : "bhatia-products";

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder,
              resource_type: "image",
              use_filename: false,
              unique_filename: true,
            },
            (error, uploaded) => {
              if (error || !uploaded) reject(error || new Error("Upload failed"));
              else resolve(uploaded as { secure_url: string; public_id: string });
            }
          )
          .end(buffer);
      }
    );

    return jsonResponse({
      imageUrl: result.secure_url,
      imagePublicId: result.public_id,
    });
  } catch (error) {
    logServerError("upload", error);
    return apiFailure("upload", error);
  }
}
