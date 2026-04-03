"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProgressBar } from "@/components/course/progress-bar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronRight, CheckCircle, PlayCircle, BookOpen, Clock, Shield } from "lucide-react";

interface LessonItem {
  _id: string;
  title: string;
  duration: string;
  order: number;
}

interface SectionItem {
  _id: string;
  title: string;
  order: number;
  lessons: LessonItem[];
}

interface CourseData {
  _id: string;
  title: string;
  description: string;
  sections: SectionItem[];
  totalLessons: number;
}

interface ProgressData {
  completedLessons: string[];
  completionPercentage: number;
  lastLessonId?: string;
}

function getAllLessons(sections: SectionItem[]): LessonItem[] {
  return sections.flatMap((s) => s.lessons);
}

function getFirstIncompleteLesson(sections: SectionItem[], completed: string[]): LessonItem | null {
  for (const section of sections) {
    for (const lesson of section.lessons) {
      if (!completed.includes(lesson._id)) return lesson;
    }
  }
  return null;
}

function estimateTotalDuration(sections: SectionItem[]): string {
  let totalMinutes = 0;
  for (const section of sections) {
    for (const lesson of section.lessons) {
      const parts = lesson.duration.split(":").map(Number);
      if (parts.length === 2) {
        totalMinutes += parts[0] + parts[1] / 60;
      }
    }
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  return `${mins}m`;
}

interface UserData {
  id: string;
  role: string;
}

export default function CoursePage() {
  const [course, setCourse] = useState<CourseData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      try {
        const [courseRes, progressRes, userRes] = await Promise.all([
          fetch("/api/course"),
          fetch("/api/progress"),
          fetch("/api/auth/me"),
        ]);
        const courseJson = courseRes.ok ? await courseRes.json() : null;
        const progressJson = progressRes.ok ? await progressRes.json() : null;
        const userJson = userRes.ok ? await userRes.json() : null;

        const courseData: CourseData | null = courseJson?.course ?? null;
        const progressData: ProgressData | null = progressJson?.progress ?? null;
        const userData: UserData | null = userJson?.user ?? null;

        setCourse(courseData);
        setProgress(progressData);
        setUser(userData);

        if (courseData) {
          const initial: Record<string, boolean> = {};
          courseData.sections.forEach((s) => { initial[s._id] = true; });
          setOpenSections(initial);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-2 w-full" />
        <div className="space-y-3 pt-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Course not found.</p>
      </div>
    );
  }

  const completedLessons: string[] = progress?.completedLessons ?? [];
  const percentage = progress?.completionPercentage ?? 0;
  const allLessons = getAllLessons(course.sections);
  const totalLessons = allLessons.length;
  const estimatedDuration = estimateTotalDuration(course.sections);

  const firstIncomplete = getFirstIncompleteLesson(course.sections, completedLessons);
  const lastLesson = progress?.lastLessonId
    ? allLessons.find((l) => l._id === progress.lastLessonId) ?? null
    : null;
  const ctaLesson = lastLesson ?? firstIncomplete ?? allLessons[0] ?? null;
  const ctaLabel = completedLessons.length > 0 ? "Continue Learning" : "Start Learning";

  function toggleSection(id: string) {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      {/* Hero */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
        <p className="text-muted-foreground leading-relaxed">{course.description}</p>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpen className="size-4" />
            {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" />
            {estimatedDuration} estimated
          </span>
        </div>

        {user?.role === "admin" ? (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-semibold border border-blue-200">
            <Shield className="size-3" />
            Admin Preview Mode
          </div>
        ) : (
          <>
            <div className="max-w-sm">
              <ProgressBar percentage={percentage} />
            </div>

            {ctaLesson && (
              <Button render={<Link href={`/course/lesson/${ctaLesson._id}`} />} size="lg">
                {ctaLabel}
              </Button>
            )}
          </>
        )}
      </div>

      {/* Sections Accordion */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Course Content</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          {course.sections.map((section) => {
            const isOpen = openSections[section._id] ?? false;
            return (
              <div key={section._id} className="border-b border-border last:border-b-0">
                <button
                  onClick={() => toggleSection(section._id)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{section.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {section.lessons.length} lesson{section.lessons.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <ul className="border-t border-border">
                    {section.lessons.map((lesson) => {
                      const isCompleted = completedLessons.includes(lesson._id);
                      return (
                        <li key={lesson._id}>
                          <Link
                            href={`/course/lesson/${lesson._id}`}
                            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-colors"
                          >
                            {isCompleted ? (
                              <CheckCircle className="size-4 text-green-500 shrink-0" />
                            ) : (
                              <PlayCircle className="size-4 text-muted-foreground shrink-0" />
                            )}
                            <span className="flex-1 min-w-0">{lesson.title}</span>
                            <span className="text-xs text-muted-foreground shrink-0">{lesson.duration}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
