import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guards";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const POST = withAuth(
  async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>>; user: { userId: string; role: string } }
  ) => {
    try {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "naim-academy/blog",
          },
          (error, result) => {
            if (error) reject(error);
            else if (result) resolve({ secure_url: result.secure_url });
            else reject(new Error("Upload failed"));
          }
        );
        uploadStream.end(buffer);
      });

      return NextResponse.json({ url: result.secure_url });
    } catch (error) {
      console.error("[POST /api/upload]", error);
      const message = error instanceof Error ? error.message : "Upload failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }
);
