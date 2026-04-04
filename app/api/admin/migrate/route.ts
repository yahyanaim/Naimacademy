import { connectDB } from "@/lib/db/mongoose";
import mongoose from "mongoose";
import { Admin } from "@/lib/models/admin.model";
import { User } from "@/lib/models/user.model";
import { PASSWORD } from "@/lib/constants";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const results: string[] = [];

    // 1. Drop stale certification index
    try {
      await db.collection("users").dropIndex("certifications.certificationId_1");
      results.push("Dropped stale certification index");
    } catch {
      results.push("Certification index already dropped or not found");
    }

    // 2. Migrate admin user from User to Admin collection
    const existingAdmin = await User.findOne({ email: "admin@n8n-course.com" });
    if (existingAdmin) {
      const adminExists = await Admin.findOne({ email: "admin@n8n-course.com" });
      if (!adminExists) {
        await Admin.create({
          name: existingAdmin.name,
          email: existingAdmin.email,
          password: existingAdmin.password,
        });
        results.push("Migrated admin to Admin collection");
      } else {
        results.push("Admin already exists in Admin collection");
      }
      
      // Remove admin from User collection
      await User.deleteOne({ email: "admin@n8n-course.com" });
      results.push("Removed admin from User collection");
    } else {
      // Create admin from scratch
      const hashedPassword = await bcrypt.hash("admin123", PASSWORD.BCRYPT_ROUNDS);
      await Admin.create({
        name: "Admin",
        email: "admin@n8n-course.com",
        password: hashedPassword,
      });
      results.push("Created new admin in Admin collection");
    }

    // 3. Clean up any other users with role "admin" in User collection
    const adminUsers = await User.find({ role: "admin" });
    if (adminUsers.length > 0) {
      await User.deleteMany({ role: "admin" });
      results.push(`Removed ${adminUsers.length} admin(s) from User collection`);
    }

    return NextResponse.json({ success: true, results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[MIGRATE_ERROR]", error);
    return NextResponse.json({ error: message, success: false }, { status: 500 });
  }
}
