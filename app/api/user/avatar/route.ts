import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guards";
import { User } from "@/lib/models/user.model";
import { connectDB } from "@/lib/db/mongoose";
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
      await connectDB();

      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." },
          { status: 400 }
        );
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: "File too large. Maximum size is 5MB." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "naim-academy/avatars",
            width: 200,
            height: 200,
            crop: "fill",
            gravity: "face",
            format: "jpg",
          },
          (error, result) => {
            if (error) reject(error);
            else if (result) resolve({ secure_url: result.secure_url });
            else reject(new Error("Upload failed"));
          }
        );
        uploadStream.end(buffer);
      });

      await User.findByIdAndUpdate(ctx.user.userId, { avatar: result.secure_url });

      return NextResponse.json(
        { url: result.secure_url, message: "Avatar uploaded successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error("[POST /api/user/avatar]", error);
      const message = error instanceof Error ? error.message : "Upload failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }
);
