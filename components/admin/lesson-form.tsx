"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface LessonFormData {
  title: string;
  videoUrl: string;
  description: string;
  sectionId: string;
  order: number;
  duration: string;
  transcript: string;
}

interface LessonFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: LessonFormData) => void;
  initialData?: Partial<LessonFormData>;
  sectionId: string;
}

export function LessonForm({
  open,
  onClose,
  onSubmit,
  initialData,
  sectionId,
}: LessonFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [order, setOrder] = useState(initialData?.order ?? 1);
  const [duration, setDuration] = useState(initialData?.duration ?? "");
  const [transcript, setTranscript] = useState(initialData?.transcript ?? "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(initialData?.title ?? "");
      setVideoUrl(initialData?.videoUrl ?? "");
      setDescription(initialData?.description ?? "");
      setOrder(initialData?.order ?? 1);
      setDuration(initialData?.duration ?? "");
      setTranscript(initialData?.transcript ?? "");
    }
  }, [open, initialData]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ title, videoUrl, description, sectionId, order, duration, transcript });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData?.title ? "Edit Lesson" : "Add Lesson"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lesson-title">Title</Label>
            <Input
              id="lesson-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to React"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson-video">Video URL</Label>
            <Input
              id="lesson-video"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson-description">Description</Label>
            <Textarea
              id="lesson-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Lesson overview…"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson-transcript">Transcript (Lesson Resume)</Label>
            <Textarea
              id="lesson-transcript"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Full transcript or summary…"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lesson-order">Order</Label>
              <Input
                id="lesson-order"
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-duration">Duration (mm:ss)</Label>
              <Input
                id="lesson-duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="12:30"
              />
            </div>
          </div>

          <input type="hidden" value={sectionId} readOnly />

          <DialogFooter showCloseButton>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : initialData?.title ? "Save Changes" : "Add Lesson"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
