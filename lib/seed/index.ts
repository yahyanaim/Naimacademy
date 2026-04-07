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

export async function seed(mode: "create" | "update" = "create") {
  await connectDB();

  // Check if course already exists
  const existingCourse = await Course.findOne();
  
  if (mode === "create") {
    if (existingCourse) {
      console.log("Data already exists, skipping seed.");
      return null;
    }
  }

  // Ensure admin exists
  let admin = await Admin.findOne({ email: ADMIN_USER.email });
  if (!admin) {
    const hashedPassword = await bcrypt.hash(ADMIN_USER.password, PASSWORD.BCRYPT_ROUNDS);
    admin = await Admin.create({
      name: ADMIN_USER.name,
      email: ADMIN_USER.email,
      password: hashedPassword,
    });
    console.log("Created admin user");
  }

  // Ensure invite code exists
  const invite = await InviteCode.findOne({ code: "NAIM2026" });
  if (!invite) {
    await InviteCode.create({
      code: "NAIM2025",
      maxUses: 500,
      usedCount: 0,
    });
  }

  let course = existingCourse;
  let totalLessons = 0;

  if (mode === "update" && course) {
    // Update mode - update existing lessons without deleting
    console.log("Updating existing course data...");
    
    for (const sectionData of SECTIONS_DATA) {
      const { lessons: lessonsData, ...sectionFields } = sectionData;
      
      // Find or create section
      let section = await Section.findOne({ title: sectionFields.title, courseId: course._id });
      
      if (!section) {
        const isFirst = sectionData.order === 1;
        section = await Section.create({
          ...sectionFields,
          courseId: course._id,
          lessons: [],
          isLocked: !isFirst,
        });
        course.sections.push(section._id);
      }

      // Update or create lessons
      for (const lessonData of lessonsData) {
        const existingLesson = await Lesson.findOne({ 
          title: lessonData.title, 
          sectionId: section._id 
        });

        if (existingLesson) {
          // Update existing lesson fields
          await Lesson.findByIdAndUpdate(existingLesson._id, {
            videoUrl: lessonData.videoUrl,
            description: lessonData.description,
            explanation: lessonData.explanation,
            duration: lessonData.duration,
            resources: lessonData.resources,
            links: lessonData.links,
          });
        } else {
          // Create new lesson
          await Lesson.create({
            ...lessonData,
            sectionId: section._id,
          });
        }
      }

      // Update section lessons array
      const sectionLessons = await Lesson.find({ sectionId: section._id }).select("_id");
      section.lessons = sectionLessons.map((l) => l._id);
      await section.save();

      totalLessons += sectionLessons.length;
    }

    course.totalLessons = totalLessons;
    await course.save();
    console.log("Course updated successfully!");
  } else {
    // Create mode - fresh install
    course = await Course.create(COURSE_DATA);

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

    course.totalLessons = totalLessons;
    await course.save();
  }

  // Ensure exam exists
  let exam = await Exam.findOne({ courseId: course._id });
  
  if (!exam) {
    exam = await Exam.create({
      ...EXAM_DATA,
      courseId: course._id,
      questions: [],
    });

    const questions = await Question.insertMany(
      QUESTIONS_DATA.map((q) => ({ ...q, examId: exam._id }))
    );

    exam.questions = questions.map((q) => q._id);
    await exam.save();
    console.log(`Created exam with ${questions.length} questions`);
  }

  console.log("Seed complete:");
  console.log(`  Admin user: ${admin.email}`);
  console.log(`  Course: ${course.title}`);
  console.log(`  Sections: ${course.sections.length}`);
  console.log(`  Total lessons: ${totalLessons}`);

  return { admin, course, exam };
}
