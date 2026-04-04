import { PASSWORD } from "@/lib/constants";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/user.model";
import { Admin } from "@/lib/models/admin.model";
import { Course } from "@/lib/models/course.model";
import { Section } from "@/lib/models/section.model";
import { Lesson } from "@/lib/models/lesson.model";
import { Exam } from "@/lib/models/exam.model";
import { Question } from "@/lib/models/question.model";
import { InviteCode } from "@/lib/models/invite-code.model";
import {
  ADMIN_USER,
  COURSE_DATA,
  SECTIONS_DATA,
  EXAM_DATA,
  QUESTIONS_DATA,
} from "./data";

export async function seed() {
  await connectDB();

  // Clear all collections
  await Promise.all([
    User.deleteMany({}),
    Admin.deleteMany({}),
    Course.deleteMany({}),
    Section.deleteMany({}),
    Lesson.deleteMany({}),
    Exam.deleteMany({}),
    Question.deleteMany({}),
    InviteCode.deleteMany({}),
  ]);

  // Create admin in Admin collection
  const hashedPassword = await bcrypt.hash(ADMIN_USER.password, PASSWORD.BCRYPT_ROUNDS);
  const admin = await Admin.create({
    name: ADMIN_USER.name,
    email: ADMIN_USER.email,
    password: hashedPassword,
  });

  // Create invite code
  const invite = await InviteCode.create({
    code: "NAIM2026",
    maxUses: 500,
    usedCount: 0,
  });

  // Create course
  const course = await Course.create(COURSE_DATA);

  // Create sections and lessons
  let totalLessons = 0;

  for (const sectionData of SECTIONS_DATA) {
    const { lessons: lessonsData, ...sectionFields } = sectionData;
    const isFirst = sectionData.order === 1;

    const section = await Section.create({
      ...sectionFields,
      courseId: course._id,
      lessons: [],
      isLocked: !isFirst,
    });

    const lessons = await Lesson.insertMany(
      lessonsData.map((lesson) => ({ ...lesson, sectionId: section._id }))
    );

    const lessonIds = lessons.map((l) => l._id);
    section.lessons = lessonIds;
    await section.save();

    course.sections.push(section._id);
    totalLessons += lessons.length;
  }

  // Update total lesson count and save course
  course.totalLessons = totalLessons;
  await course.save();

  // Create exam
  const exam = await Exam.create({
    ...EXAM_DATA,
    courseId: course._id,
    questions: [],
  });

  // Create questions
  const questions = await Question.insertMany(
    QUESTIONS_DATA.map((q) => ({ ...q, examId: exam._id }))
  );

  exam.questions = questions.map((q) => q._id);
  await exam.save();

  console.log("Seed complete:");
  console.log(`  Admin user: ${admin.email}`);
  console.log(`  Invite code: ${invite.code}`);
  console.log(`  Course: ${course.title}`);
  console.log(`  Sections: ${course.sections.length}`);
  console.log(`  Total lessons: ${totalLessons}`);
  console.log(`  Exam: ${exam.title}`);
  console.log(`  Questions: ${questions.length}`);

  return { admin, course, exam, questions };
}
