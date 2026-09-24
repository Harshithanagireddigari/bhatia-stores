import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
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

    if (!file || !file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Please upload a valid image file (JPG, PNG, WebP)" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be smaller than 5MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const hasCloudinaryConfig = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    if (hasCloudinaryConfig) {
      const folder =
        assetType === "hero"
          ? "bhatia-hero"
          : assetType === "category"
          ? "bhatia-categories"
          : "bhatia-products";

      try {
        const result: any = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder,
                resource_type: "image",
                use_filename: false,
                unique_filename: true,
                allowed_formats: ["jpg", "jpeg", "png", "webp"],
                transformation: [
                  { quality: "auto", fetch_format: "auto" },
                  { width: 1920, crop: "limit" },
                ],
              },
              (error, res) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(res);
                }
              }
            )
            .end(buffer);
        });

        if (result?.secure_url) {
          return NextResponse.json({
            imageUrl: result.secure_url,
            imagePublicId: result.public_id || null,
          });
        }
      } catch (cloudErr) {
        console.warn("Cloudinary upload failed, falling back to local/data storage:", cloudErr);
      }
    }

    // Fallback: save to public/uploads/ or return data URL
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${assetType || "upload"}-${uuidv4()}.${ext}`;
      const filePath = path.join(uploadDir, fileName);

      await fs.promises.writeFile(filePath, buffer);
      const imageUrl = `/uploads/${fileName}`;

      return NextResponse.json({
        imageUrl,
        imagePublicId: null,
      });
    } catch (fsErr) {
      console.warn("Filesystem write failed, using data URL fallback:", fsErr);
      const base64 = buffer.toString("base64");
      const imageUrl = `data:${file.type};base64,${base64}`;

      return NextResponse.json({
        imageUrl,
        imagePublicId: null,
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
