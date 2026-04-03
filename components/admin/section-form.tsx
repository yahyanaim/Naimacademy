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

interface SectionFormData {
  title: string;
  order: number;
}

interface SectionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SectionFormData & { courseId: string }) => void;
  initialData?: { title: string; order: number };
  courseId: string;
}

export function SectionForm({
  open,
  onClose,
  onSubmit,
  initialData,
  courseId,
}: SectionFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [order, setOrder] = useState(initialData?.order ?? 1);
  const [submitting, setSubmitting] = useState(false);

  // Sync when initialData changes (edit mode)
  useEffect(() => {
    if (open) {
      setTitle(initialData?.title ?? "");
      setOrder(initialData?.order ?? 1);
    }
  }, [open, initialData]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ title, order, courseId });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Section" : "Add Section"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="section-title">Title</Label>
            <Input
              id="section-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="section-order">Order</Label>
            <Input
              id="section-order"
              type="number"
              min={1}
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              required
            />
          </div>

          {/* Hidden courseId — passed via prop */}
          <input type="hidden" value={courseId} readOnly />

          <DialogFooter showCloseButton>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : initialData ? "Save Changes" : "Add Section"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
