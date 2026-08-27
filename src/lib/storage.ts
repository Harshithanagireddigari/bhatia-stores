import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { uploadedImages } from "@/db/schema";
import { eq } from "drizzle-orm";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface UploadResult {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export async function processAndStoreImage(file: File): Promise<UploadResult> {
  if (!file) {
    throw new Error("No file provided");
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`Unsupported image format: ${file.type}. Please upload JPEG, PNG, or WebP.`);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds 10MB limit.");
  }

  const id = uuidv4();
  const extension = path.extname(file.name) || (file.type === "image/png" ? ".png" : file.type === "image/webp" ? ".webp" : ".jpg");
  const filename = `tile-${Date.now()}-${id.slice(0, 8)}${extension}`;

  // Check if Cloudinary is configured
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");
      const dataUri = `data:${file.type};base64,${base64}`;

      const { v2: cloudinary } = await import("cloudinary");
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });

      const uploadResponse = await cloudinary.uploader.upload(dataUri, {
        folder: "bhatia-stores/products",
        public_id: filename.replace(/\.[^/.]+$/, ""),
        resource_type: "image",
      });

      const resultUrl = uploadResponse.secure_url;

      await db.insert(uploadedImages).values({
        id,
        filename,
        originalName: file.name,
        url: resultUrl,
        mimeType: file.type,
        size: file.size,
      });

      return {
        id,
        url: resultUrl,
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
      };
    } catch (error) {
      console.warn("Cloudinary upload failed, falling back to local storage:", error);
    }
  }

  // Local persistent dedicated storage
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const targetPath = path.join(uploadsDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(targetPath, buffer);

  const localUrl = `/uploads/${filename}`;

  await db.insert(uploadedImages).values({
    id,
    filename,
    originalName: file.name,
    url: localUrl,
    mimeType: file.type,
    size: file.size,
  });

  return {
    id,
    url: localUrl,
    filename,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
  };
}

export async function deleteStoredImage(imageUrl: string) {
  try {
    const record = await db.select().from(uploadedImages).where(eq(uploadedImages.url, imageUrl)).limit(1);
    if (record[0]) {
      const localPath = path.join(process.cwd(), "public", "uploads", record[0].filename);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
      await db.delete(uploadedImages).where(eq(uploadedImages.id, record[0].id));
    }
  } catch (err) {
    console.error("Delete image error:", err);
  }
}
