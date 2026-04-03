"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { VideoPlayer } from "@/components/course/video-player";
import { CourseSidebar } from "@/components/course/course-sidebar";
import { LessonContent } from "@/components/course/lesson-content";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CheckCircle, ChevronRight, Menu } from "lucide-react";

interface Resource {
  name: string;
  url: string;
}

interface LessonData {
  _id: string;
  title: string;
  videoUrl: string;
  description: string;
  resources: Resource[];
  sectionId: string;
  order: number;
  duration: string;
  transcript: string;
}

interface LessonListItem {
  _id: string;
  title: string;
  duration: string;
  order: number;
}

interface SectionData {
  _id: string;
  title: string;
  order: number;
  lessons: LessonListItem[];
}

interface CourseData {
  _id: string;
  title: string;
  sections: SectionData[];
}

interface ProgressData {
  completedLessons: string[];
  completionPercentage: number;
  lastLessonId?: string;
}

function getAllOrderedLessons(sections: SectionData[]): LessonListItem[] {
  return [...sections]
    .sort((a, b) => a.order - b.order)
    .flatMap((s) => [...s.lessons].sort((a, b) => a.order - b.order));
}

function getNextLesson(sections: SectionData[], currentId: string): LessonListItem | null {
  const all = getAllOrderedLessons(sections);
  const idx = all.findIndex((l) => l._id === currentId);
  if (idx === -1 || idx >= all.length - 1) return null;
  return all[idx + 1];
}

export default function LessonPage() {
  const params = useParams();
  const lessonId = typeof params?.lessonId === "string" ? params.lessonId : Array.isArray(params?.lessonId) ? params.lessonId[0] : "";

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [initialTimestamp, setInitialTimestamp] = useState(0);

  const currentTimestampRef = useRef(0);

  useEffect(() => {
    if (!lessonId) return;
    setLoading(true);

    async function load() {
      try {
        const [lessonRes, courseRes, progressRes] = await Promise.all([
          fetch(`/api/course/lessons/${lessonId}`),
          fetch("/api/course"),
          fetch("/api/progress"),
        ]);

        const lessonJson = lessonRes.ok ? await lessonRes.json() : null;
        const courseJson = courseRes.ok ? await courseRes.json() : null;
        const progressJson = progressRes.ok ? await progressRes.json() : null;

        const lessonData: LessonData | null = lessonJson?.lesson ?? null;
        const lessonProgressData = lessonJson?.progress ?? null;
        const courseData: CourseData | null = courseJson?.course ?? null;
        const progressData: ProgressData | null = progressJson?.progress ?? null;

        setLesson(lessonData);
        setCourse(courseData);
        setProgress(progressData);
        setIsCompleted(lessonProgressData?.isCompleted ?? false);
        setInitialTimestamp(lessonProgressData?.lastVideoTimestamp ?? 0);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [lessonId]);

  const handleProgress = useCallback((timestamp: number) => {
    currentTimestampRef.current = timestamp;
  }, []);

  async function handlePause() {
    if (!lessonId) return;
    try {
      await fetch("/api/progress/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, timestamp: Math.floor(currentTimestampRef.current) }),
      });
    } catch {
      // silently ignore
    }
  }

  async function handleMarkComplete() {
    if (!lessonId || isCompleted) return;
    setMarking(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
      if (res.ok) {
        const json = await res.json();
        setProgress(json.progress);
        setIsCompleted(true);
      }
    } finally {
      setMarking(false);
    }
  }

  const completedLessons = progress?.completedLessons ?? [];
  const nextLesson = course && lessonId ? getNextLesson(course.sections, lessonId) : null;

  const sidebarContent = course ? (
    <CourseSidebar
      sections={course.sections}
      completedLessons={completedLessons}
      currentLessonId={lessonId}
    />
  ) : null;

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row h-full min-h-screen">
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
        <div className="hidden lg:block w-80 border-l border-border">
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Lesson not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header with sidebar trigger */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border lg:hidden">
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Menu className="size-5" />
              <span className="sr-only">Course contents</span>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <SheetHeader className="px-4 py-3 border-b border-border">
                <SheetTitle>{course?.title ?? "Course Contents"}</SheetTitle>
              </SheetHeader>
              <div className="h-[calc(100%-57px)]">{sidebarContent}</div>
            </SheetContent>
          </Sheet>
          <span className="text-sm font-medium truncate">{course?.title}</span>
        </div>

        <div className="flex-1 px-4 py-6 space-y-6 max-w-4xl w-full mx-auto lg:mx-0 lg:max-w-none lg:px-6">
          {/* Video */}
          <VideoPlayer
            url={lesson.videoUrl}
            onProgress={handleProgress}
            onPause={handlePause}
            initialTimestamp={initialTimestamp}
          />

          {/* Lesson Header */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold">{lesson.title}</h1>
            </div>
            <Button
              onClick={handleMarkComplete}
              disabled={isCompleted || marking}
              variant={isCompleted ? "outline" : "default"}
              className="shrink-0"
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="size-4 text-green-500" />
                  Completed
                </>
              ) : marking ? (
                "Saving..."
              ) : (
                "Mark as Complete"
              )}
            </Button>
          </div>

          {/* Lesson Content */}
          <LessonContent 
            description={lesson.description} 
            resources={lesson.resources} 
            transcript={lesson.transcript}
          />

          {/* Next Lesson */}
          {nextLesson && (
            <div className="pt-4 border-t border-border">
              <Button
                render={<Link href={`/course/lesson/${nextLesson._id}`} />}
                variant="outline"
                className="flex items-center gap-1.5"
              >
                Next: {nextLesson.title}
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-80 border-l border-border">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold truncate">{course?.title ?? "Course Contents"}</p>
        </div>
        <div className="flex-1 min-h-0">{sidebarContent}</div>
      </aside>
    </div>
  );
}
