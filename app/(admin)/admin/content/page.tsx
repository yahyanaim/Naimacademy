"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionForm } from "@/components/admin/section-form";
import { LessonForm } from "@/components/admin/lesson-form";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LessonRecord {
  _id: string;
  title: string;
  videoUrl: string;
  description: string;
  sectionId: string;
  order: number;
  duration: string;
  transcript: string;
}

interface SectionRecord {
  _id: string;
  title: string;
  order: number;
  courseId: string;
  lessons: LessonRecord[];
}

function getSectionDuration(section: SectionRecord): string {
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ContentManagementPage() {
  const [sections, setSections] = useState<SectionRecord[]>([]);
  const [lessons, setLessons] = useState<LessonRecord[]>([]);
  const [courseId, setCourseId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  // Section dialog state
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionRecord | null>(
    null
  );

  // Lesson dialog state
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonRecord | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string>("");

  // Confirm delete state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "section" | "lesson";
    id: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [courseRes, sectionsRes, lessonsRes] = await Promise.all([
        fetch("/api/course"),
        fetch("/api/admin/sections"),
        fetch("/api/admin/lessons"),
      ]);

      const courseJson = courseRes.ok ? await courseRes.json() : null;
      const sectionsJson: SectionRecord[] = sectionsRes.ok
        ? await sectionsRes.json()
        : [];
      const lessonsJson: LessonRecord[] = lessonsRes.ok
        ? await lessonsRes.json()
        : [];

      setCourseId(courseJson?.course?._id ?? "");
      setLessons(lessonsJson);

      // Attach lessons to their sections
      const sectionsWithLessons: SectionRecord[] = sectionsJson.map((s) => ({
        ...s,
        lessons: lessonsJson
          .filter((l) => l.sectionId === s._id)
          .sort((a, b) => a.order - b.order),
      }));

      setSections(sectionsWithLessons.sort((a, b) => a.order - b.order));
    } catch {
      toast.error("Failed to load content data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------------------------------------------------------------------------
  // Section actions
  // ---------------------------------------------------------------------------

  async function handleSectionSubmit(data: {
    title: string;
    order: number;
    courseId: string;
  }) {
    if (editingSection) {
      const res = await fetch(`/api/admin/sections/${editingSection._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        toast.error("Failed to update section.");
        return;
      }
      toast.success("Section updated.");
    } else {
      const res = await fetch("/api/admin/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        toast.error("Failed to create section.");
        return;
      }
      toast.success("Section created.");
    }
    setSectionDialogOpen(false);
    setEditingSection(null);
    fetchData();
  }

  function openAddSection() {
    setEditingSection(null);
    setSectionDialogOpen(true);
  }

  function openEditSection(section: SectionRecord) {
    setEditingSection(section);
    setSectionDialogOpen(true);
  }

  // ---------------------------------------------------------------------------
  // Lesson actions
  // ---------------------------------------------------------------------------

  async function handleLessonSubmit(data: {
    title: string;
    videoUrl: string;
    description: string;
    sectionId: string;
    order: number;
    duration: string;
    transcript: string;
  }) {
    if (editingLesson) {
      const res = await fetch(`/api/admin/lessons/${editingLesson._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        toast.error("Failed to update lesson.");
        return;
      }
      toast.success("Lesson updated.");
    } else {
      const res = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        toast.error("Failed to create lesson.");
        return;
      }
      toast.success("Lesson created.");
    }
    setLessonDialogOpen(false);
    setEditingLesson(null);
    fetchData();
  }

  function openAddLesson(sectionId: string) {
    setEditingLesson(null);
    setActiveSectionId(sectionId);
    setLessonDialogOpen(true);
  }

  function openEditLesson(lesson: LessonRecord) {
    setEditingLesson(lesson);
    setActiveSectionId(lesson.sectionId);
    setLessonDialogOpen(true);
  }

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  function askDelete(type: "section" | "lesson", id: string) {
    setDeleteTarget({ type, id });
    setDeleteConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const endpoint =
        deleteTarget.type === "section"
          ? `/api/admin/sections/${deleteTarget.id}`
          : `/api/admin/lessons/${deleteTarget.id}`;

      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) {
        toast.error(`Failed to delete ${deleteTarget.type}.`);
        return;
      }
      toast.success(
        `${deleteTarget.type === "section" ? "Section" : "Lesson"} deleted.`
      );
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      fetchData();
    } finally {
      setDeleting(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Toggle section expand
  // ---------------------------------------------------------------------------

  function toggleSection(id: string) {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Content Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage course sections and lessons
          </p>
        </div>
        <Button onClick={openAddSection} disabled={!courseId || loading}>
          <Plus />
          Add Section
        </Button>
      </div>

      {/* Sections */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : sections.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No sections yet. Add your first section above.
        </p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          {sections.map((section) => {
            const isExpanded = expandedSections[section._id] ?? false;
            const sectionLessons = section.lessons;

            return (
              <div
                key={section._id}
                className="border-b border-border last:border-b-0"
              >
                {/* Section row */}
                <div className="flex items-center gap-3 px-4 py-3 bg-muted/30">
                  <button
                    type="button"
                    onClick={() => toggleSection(section._id)}
                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                  >
                    {isExpanded ? (
                      <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="text-sm font-semibold">{section.title}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      Order: {section.order} &middot;{" "}
                      {sectionLessons.length} lesson
                      {sectionLessons.length !== 1 ? "s" : ""} &middot;{" "}
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                        {getSectionDuration(section)}
                      </span>
                    </span>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEditSection(section)}
                      title="Edit section"
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => askDelete("section", section._id)}
                      title="Delete section"
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openAddLesson(section._id)}
                    >
                      <Plus />
                      Lesson
                    </Button>
                  </div>
                </div>

                {/* Lessons table */}
                {isExpanded && (
                  <div className="border-t border-border">
                    {sectionLessons.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-muted-foreground">
                        No lessons in this section.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead className="w-24 text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sectionLessons.map((lesson) => (
                            <TableRow key={lesson._id}>
                              <TableCell className="text-muted-foreground">
                                {lesson.order}
                              </TableCell>
                              <TableCell className="font-medium">
                                {lesson.title}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {lesson.duration || "—"}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => openEditLesson(lesson)}
                                    title="Edit lesson"
                                  >
                                    <Pencil />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() =>
                                      askDelete("lesson", lesson._id)
                                    }
                                    title="Delete lesson"
                                  >
                                    <Trash2 className="text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Section Dialog */}
      <SectionForm
        open={sectionDialogOpen}
        onClose={() => {
          setSectionDialogOpen(false);
          setEditingSection(null);
        }}
        onSubmit={handleSectionSubmit}
        initialData={
          editingSection
            ? { title: editingSection.title, order: editingSection.order }
            : undefined
        }
        courseId={courseId}
      />

      {/* Lesson Dialog */}
      <LessonForm
        open={lessonDialogOpen}
        onClose={() => {
          setLessonDialogOpen(false);
          setEditingLesson(null);
        }}
        onSubmit={handleLessonSubmit}
        initialData={
          editingLesson
            ? {
                title: editingLesson.title,
                videoUrl: editingLesson.videoUrl,
                description: editingLesson.description,
                order: editingLesson.order,
                duration: editingLesson.duration,
                transcript: editingLesson.transcript,
              }
            : undefined
        }
        sectionId={activeSectionId}
      />

      {/* Delete confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => !open && setDeleteConfirmOpen(false)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this{" "}
            {deleteTarget?.type ?? "item"}? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
