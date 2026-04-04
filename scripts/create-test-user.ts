import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import bcrypt from "bcryptjs";

async function createTestUser() {
  await connectDB();

  const email = "testuser@test.com";
  const password = "password123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Test user already exists");
    await User.deleteOne({ email });
  }

  const user = await User.create({
    name: "Test User",
    email,
    password: hashedPassword,
    role: "user",
  });

  console.log("Created test user:", user.email, "role:", user.role);
  process.exit(0);
}

createTestUser();