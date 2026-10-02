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

    // Directly save to local filesystem in public/uploads/
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
      console.warn("Filesystem write failed, using data URL fallback:", fsErr);
      const base64 = buffer.toString("base64");
      const imageUrl = `data:${file.type};base64,${base64}`;

      return NextResponse.json({
        imageUrl,
        imagePublicId: null,
        mediaType: isVideo ? "video" : "image",
      });
    }
  } catch (error) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      { error: "Upload failed: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}
