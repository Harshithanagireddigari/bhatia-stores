import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import fs from "node:fs";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await req.formData();
    const file = data.get("file") as File;
    const assetType = data.get("assetType");

    if (!file) {
      return NextResponse.json({ error: "No file provided for upload" }, { status: 400 });
    }

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Please upload a valid image (JPG, PNG, WebP) or video file (MP4, WebM, MOV)" },
        { status: 400 }
      );
    }

    const maxBytes = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: isVideo ? "Video file must be smaller than 50MB" : "Image file must be smaller than 10MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If Cloudinary is configured, prioritize CDN upload for high performance
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        const { default: cloudinary } = await import("@/lib/cloudinary");
        const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: `bhatia-stores/${assetType || "general"}`,
              resource_type: isVideo ? "video" : "image",
              transformation: isVideo ? undefined : [{ quality: "auto:good", fetch_format: "auto" }],
            },
            (error, result) => {
              if (error || !result) reject(error || new Error("Cloudinary upload failed"));
              else resolve(result);
            }
          );
          stream.end(buffer);
        });

        return NextResponse.json({
          imageUrl: uploadResult.secure_url,
          imagePublicId: uploadResult.public_id,
          mediaType: isVideo ? "video" : "image",
        });
      } catch (cloudErr) {
        console.warn("Cloudinary upload error, checking filesystem fallback:", cloudErr);
      }
    }

    // Local filesystem storage fallback for local development
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const ext = file.name.split(".").pop() || (isVideo ? "mp4" : "jpg");
      const fileName = `${assetType || "upload"}-${uuidv4()}.${ext}`;
      const filePath = path.join(uploadDir, fileName);

      await fs.promises.writeFile(filePath, buffer);
      const imageUrl = `/uploads/${fileName}`;

      return NextResponse.json({
        imageUrl,
        imagePublicId: null,
        mediaType: isVideo ? "video" : "image",
      });
    } catch (fsErr) {
      console.error("Storage failed:", fsErr);
      return NextResponse.json(
        { error: "Image storage unavailable. Please check cloud storage credentials." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      { error: "Upload failed: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}
