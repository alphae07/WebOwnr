import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import type { UploadApiResponse } from "cloudinary";

export const runtime = "nodejs"; // ✅ REQUIRED for Buffer

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "products" },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Upload failed"));

          resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
