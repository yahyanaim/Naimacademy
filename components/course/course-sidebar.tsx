"use client";

import { useState } from "react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronRight, CheckCircle, PlayCircle, LogOut } from "lucide-react";

interface Lesson {
  _id: string;
  title: string;
  duration: string;
  order: number;
}

interface Section {
  _id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CourseSidebarProps {
  sections: Section[];
  completedLessons: string[];
  currentLessonId?: string;
}

function getSectionContainingLesson(sections: Section[], lessonId?: string): string | null {
  if (!lessonId) return null;
  for (const section of sections) {
    if (section.lessons.some((l) => l._id === lessonId)) {
      return section._id;
    }
  }
  return null;
}

function getSectionDuration(section: Section): string {
  let totalMinutes = 0;
  for (const lesson of section.lessons) {
    const parts = lesson.duration.split(":").map(Number);
    if (parts.length === 2) {
      totalMinutes += parts[0] + parts[1] / 60;
    }
  }
  if (totalMinutes < 60) {
    return `${Math.round(totalMinutes)}m`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function buildInitialOpenState(sections: Section[], currentLessonId?: string): Record<string, boolean> {
  const containingSection = getSectionContainingLesson(sections, currentLessonId);
  const state: Record<string, boolean> = {};
  for (const section of sections) {
    state[section._id] = section._id === containingSection;
  }
  return state;
}

export function CourseSidebar({ sections, completedLessons, currentLessonId }: CourseSidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => buildInitialOpenState(sections, currentLessonId)
  );

  function toggleSection(sectionId: string) {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }

  return (
    <ScrollArea className="h-full">
      <div className="py-2 flex flex-col h-full">
        <div className="flex-1">
          {sections.map((section) => {
            const isOpen = openSections[section._id] ?? false;
            return (
              <div key={section._id} className="border-b border-border last:border-b-0">
                <button
                  onClick={() => toggleSection(section._id)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{section.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                      <span>{section.lessons.length} lesson{section.lessons.length !== 1 ? "s" : ""}</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        {getSectionDuration(section)}
                      </span>
                    </p>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <ul className="pb-1">
                    {section.lessons.map((lesson) => {
                      const isCompleted = completedLessons.includes(lesson._id);
                      const isCurrent = lesson._id === currentLessonId;

                      return (
                        <li key={lesson._id}>
                          <Link
                            href={`/course/lesson/${lesson._id}`}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted/50 ${
                              isCurrent 
                                ? "bg-yellow-500/10 text-yellow-700 border-l-2 border-yellow-500 font-medium" 
                                : ""
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className={`size-4 shrink-0 ${isCurrent ? "text-yellow-600" : "text-green-500"}`} />
                            ) : (
                              <PlayCircle className={`size-4 shrink-0 ${isCurrent ? "text-yellow-600" : "text-muted-foreground"}`} />
                            )}
                            <span className="flex-1 min-w-0 truncate">{lesson.title}</span>
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
        
        <div className="p-4 border-t border-border mt-auto">
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/";
            }}
            className="flex items-center gap-2 text-sm text-destructive hover:opacity-80 transition-opacity"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      </div>
    </ScrollArea>
  );
}
