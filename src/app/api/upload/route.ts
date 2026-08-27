import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { processAndStoreImage } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    const result = await processAndStoreImage(file);

    return NextResponse.json({
      success: true,
      imageUrl: result.url,
      imageId: result.id,
      filename: result.filename,
    });
  } catch (error: any) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      { error: error?.message || "Image upload failed. Please try again." },
      { status: 500 }
    );
  }
}
