import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json({ error: "Image storage is not configured. Add the Cloudinary environment variables on the server." }, { status: 503 });
  }
  try {
    const data = await req.formData();
    const file = data.get("file") as File;
    const assetType = data.get("assetType");
    if (!file || !file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Please upload a valid image file" },
        { status: 400 }
      );
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be smaller than 5MB" }, { status: 400 });
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const folder = assetType === "hero" ? "bhatia-hero" : assetType === "category" ? "bhatia-categories" : "bhatia-products";
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: "image",
            use_filename: false,
            unique_filename: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });
    return NextResponse.json({
      imageUrl: result.secure_url,
      imagePublicId: result.public_id,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
