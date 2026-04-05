"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProgressBar } from "@/components/course/progress-bar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronRight, CheckCircle, PlayCircle, BookOpen, Clock, Shield, Calendar } from "lucide-react";
import { getSectionDuration, parseDurationToMinutes, formatDuration } from "@/lib/utils/duration";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
  isLocked: boolean;
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
      totalMinutes += parseDurationToMinutes(lesson.duration);
    }
  }
  return formatDuration(totalMinutes);
}

interface UserData {
  id: string;
  role: string;
}

const DAY_OPTIONS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

export default function CoursePage() {
  const router = useRouter();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [lessonsPerWeek, setLessonsPerWeek] = useState("5");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [pendingLessonId, setPendingLessonId] = useState<string>("");
  const [hasSchedule, setHasSchedule] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [courseRes, progressRes, userRes, scheduleRes] = await Promise.all([
          fetch("/api/course"),
          fetch("/api/progress"),
          fetch("/api/auth/me"),
          fetch("/api/schedule"),
        ]);
        const courseJson = courseRes.ok ? await courseRes.json() : null;
        const progressJson = progressRes.ok ? await progressRes.json() : null;
        const userJson = userRes.ok ? await userRes.json() : null;
        const scheduleJson = scheduleRes.ok ? await scheduleRes.json() : null;

        const courseData: CourseData | null = courseJson?.course ?? null;
        const progressData: ProgressData | null = progressJson?.progress ?? null;
        const userData: UserData | null = userJson?.user ?? null;

        setCourse(courseData);
        setProgress(progressData);
        setUser(userData);
        setHasSchedule(!!scheduleJson?.schedule);

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

  function toggleDay(day: number) {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  }

  function generateCalendarFile(schedule: { lessonsPerWeek: number; daysOfWeek: number[]; startDate: string; endDate: string }) {
    const events = [];
    const startParts = schedule.startDate.split("T")[0].split("-");
    const endParts = schedule.endDate.split("T")[0].split("-");
    const start = new Date(Number(startParts[0]), Number(startParts[1]) - 1, Number(startParts[2]));
    const end = new Date(Number(endParts[0]), Number(endParts[1]) - 1, Number(endParts[2]));
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      if (schedule.daysOfWeek.includes(dayOfWeek)) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const day = String(currentDate.getDate()).padStart(2, "0");

        events.push({
          summary: "Naim Academy - Study Session",
          description: "Continue your n8n automation course on Naim Academy",
          location: "https://naimacademy.vercel.app/course",
          startTime: `${year}${month}${day}T100000`,
          endTime: `${year}${month}${day}T110000`,
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (events.length === 0) return;

    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Naim Academy//Learning Schedule//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

    events.forEach((event, index) => {
      icsContent += `BEGIN:VEVENT
DTSTART;VALUE=DATE-TIME:${event.startTime}
DTEND;VALUE=DATE-TIME:${event.endTime}
SUMMARY:${event.summary}
DESCRIPTION:${event.description}
URL:${event.location}
UID:naim-academy-${index}@naimacademy.vercel.app
END:VEVENT
`;
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "naim-academy-schedule.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleStartCourse(lessonId: string) {
    setPendingLessonId(lessonId);
    if (!hasSchedule && completedLessons.length === 0) {
      setScheduleDialogOpen(true);
    } else {
      router.push(`/course/lesson/${lessonId}`);
    }
  }

  async function handleScheduleSave() {
    if (!startDate || !lessonsPerWeek) {
      toast.error("Please fill in all fields");
      return;
    }
    if (selectedDays.length === 0) {
      toast.error("Select at least one day");
      return;
    }

    setScheduleSaving(true);
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonsPerWeek: parseInt(lessonsPerWeek),
          daysOfWeek: selectedDays,
          startDate,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(data?.error || "Failed to save schedule");
        return;
      }

      setScheduleDialogOpen(false);
      setHasSchedule(true);
      if (data?.schedule) {
        generateCalendarFile(data.schedule);
      }
      toast.success("Schedule saved & added to calendar!");

      if (pendingLessonId) {
        setTimeout(() => {
          router.push(`/course/lesson/${pendingLessonId}`);
        }, 500);
      }
    } catch (err) {
      console.error("[SCHEDULE_SAVE]", err);
      toast.error("Failed to save schedule");
    } finally {
      setScheduleSaving(false);
    }
  }

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
            <div className="w-full max-w-md">
              <ProgressBar percentage={percentage} />
            </div>

            {ctaLesson && (
              <Button onClick={() => handleStartCourse(ctaLesson._id)} size="lg">
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
            const isLocked = section.isLocked && user?.role !== "admin";
            return (
              <div key={section._id} className="border-b border-border last:border-b-0">
                <button
                  onClick={() => !isLocked && toggleSection(section._id)}
                  className={`w-full flex items-center justify-between gap-2 px-4 py-4 text-left transition-colors ${isLocked ? "opacity-60 cursor-not-allowed" : "hover:bg-muted/50"}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{section.title}</p>
                      {isLocked && <Shield className="size-3.5 text-muted-foreground" />}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                      <span>{section.lessons.length} lesson{section.lessons.length !== 1 ? "s" : ""}</span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        {getSectionDuration(section.lessons)}
                      </span>
                    </p>
                  </div>
                  {isLocked ? null : isOpen ? (
                    <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {isOpen && !isLocked && (
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

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              Plan Your Schedule
            </DialogTitle>
            <DialogDescription>
              Set your learning pace before starting the course
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lessonsPerWeek">Lessons per week</Label>
              <Input
                id="lessonsPerWeek"
                type="number"
                min="1"
                max="20"
                value={lessonsPerWeek}
                onChange={(e) => setLessonsPerWeek(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Study days</Label>
              <div className="flex flex-wrap gap-2">
                {DAY_OPTIONS.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      selectedDays.includes(day.value)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => {
                setScheduleDialogOpen(false);
                if (pendingLessonId) {
                  router.push(`/course/lesson/${pendingLessonId}`);
                }
              }}
              disabled={scheduleSaving}
            >
              Skip & Start Course
            </Button>
            <Button onClick={handleScheduleSave} disabled={scheduleSaving}>
              {scheduleSaving ? "Saving..." : "Save & Add to Calendar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
