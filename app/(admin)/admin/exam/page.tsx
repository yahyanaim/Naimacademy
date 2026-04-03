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
import { QuestionForm } from "@/components/admin/question-form";
import { Plus, Pencil, Trash2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type QuestionType = "multiple-choice" | "true-false";

interface QuestionRecord {
  _id: string;
  question: string;
  type: QuestionType;
  options: string[];
  correctAnswer: number;
  order: number;
  examId: string;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ExamManagementPage() {
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [examId, setExamId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionRecord | null>(
    null
  );

  // Delete confirm
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [examRes, questionsRes] = await Promise.all([
        fetch("/api/exam"),
        fetch("/api/admin/questions"),
      ]);

      const examJson = examRes.ok ? await examRes.json() : null;
      const questionsJson: QuestionRecord[] = questionsRes.ok
        ? await questionsRes.json()
        : [];

      setExamId(examJson?.exam?._id ?? examJson?._id ?? "");
      setQuestions(questionsJson.sort((a, b) => a.order - b.order));
    } catch {
      toast.error("Failed to load exam data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  async function handleFormSubmit(data: {
    question: string;
    type: QuestionType;
    options: string[];
    correctAnswer: number;
    order: number;
    examId: string;
  }) {
    if (editingQuestion) {
      const res = await fetch(
        `/api/admin/questions/${editingQuestion._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        toast.error("Failed to update question.");
        return;
      }
      toast.success("Question updated.");
    } else {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        toast.error("Failed to create question.");
        return;
      }
      toast.success("Question created.");
    }
    setFormOpen(false);
    setEditingQuestion(null);
    fetchData();
  }

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  function askDelete(id: string) {
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!deletingId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/questions/${deletingId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Failed to delete question.");
        return;
      }
      toast.success("Question deleted.");
      setDeleteConfirmOpen(false);
      setDeletingId(null);
      fetchData();
    } finally {
      setDeleting(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function truncate(text: string, max = 80) {
    return text.length > max ? `${text.slice(0, max)}…` : text;
  }

  function typeLabel(type: QuestionType) {
    return type === "multiple-choice" ? "MCQ" : "T/F";
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
            Exam Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage exam questions
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingQuestion(null);
            setFormOpen(true);
          }}
          disabled={!examId || loading}
        >
          <Plus />
          Add Question
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No questions yet. Add your first question above.
        </p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Question</TableHead>
                <TableHead className="w-16">Type</TableHead>
                <TableHead>Correct Answer</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((q) => (
                <TableRow key={q._id}>
                  <TableCell className="text-muted-foreground">
                    {q.order}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <span className="block truncate" title={q.question}>
                      {truncate(q.question)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {typeLabel(q.type)}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {q.options[q.correctAnswer] ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setEditingQuestion(q);
                          setFormOpen(true);
                        }}
                        title="Edit question"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => askDelete(q._id)}
                        title="Delete question"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Question form dialog */}
      <QuestionForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingQuestion(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={
          editingQuestion
            ? {
                question: editingQuestion.question,
                type: editingQuestion.type,
                options: editingQuestion.options,
                correctAnswer: editingQuestion.correctAnswer,
                order: editingQuestion.order,
              }
            : undefined
        }
        examId={examId}
      />

      {/* Delete confirmation */}
      <Dialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => !open && setDeleteConfirmOpen(false)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this question? This action cannot be
            undone.
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
