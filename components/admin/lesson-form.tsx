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

interface Resource {
  name: string;
  url: string;
}

interface LinkItem {
  name: string;
  url: string;
}

interface LessonFormData {
  title: string;
  videoUrl: string;
  description: string;
  summary: string;
  explanation: string;
  images: string[];
  resources: Resource[];
  links: LinkItem[];
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
  const [summary, setSummary] = useState(initialData?.summary ?? "");
  const [explanation, setExplanation] = useState(initialData?.explanation ?? "");
  const [images, setImages] = useState<string[]>(initialData?.images ?? []);
  const [resources, setResources] = useState<Resource[]>(initialData?.resources ?? []);
  const [links, setLinks] = useState<LinkItem[]>(initialData?.links ?? []);
  const [order, setOrder] = useState(initialData?.order ?? 1);
  const [duration, setDuration] = useState(initialData?.duration ?? "");
  const [transcript, setTranscript] = useState(initialData?.transcript ?? "");
  const [submitting, setSubmitting] = useState(false);

  const [newResourceName, setNewResourceName] = useState("");
  const [newResourceUrl, setNewResourceUrl] = useState("");
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newImage, setNewImage] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(initialData?.title ?? "");
      setVideoUrl(initialData?.videoUrl ?? "");
      setDescription(initialData?.description ?? "");
      setSummary(initialData?.summary ?? "");
      setExplanation(initialData?.explanation ?? "");
      setImages(initialData?.images ?? []);
      setResources(initialData?.resources ?? []);
      setLinks(initialData?.links ?? []);
      setOrder(initialData?.order ?? 1);
      setDuration(initialData?.duration ?? "");
      setTranscript(initialData?.transcript ?? "");
    }
  }, [open, initialData]);

  function addResource() {
    if (newResourceName && newResourceUrl) {
      setResources([...resources, { name: newResourceName, url: newResourceUrl }]);
      setNewResourceName("");
      setNewResourceUrl("");
    }
  }

  function removeResource(index: number) {
    setResources(resources.filter((_, i) => i !== index));
  }

  function addLink() {
    if (newLinkName && newLinkUrl) {
      setLinks([...links, { name: newLinkName, url: newLinkUrl }]);
      setNewLinkName("");
      setNewLinkUrl("");
    }
  }

  function removeLink(index: number) {
    setLinks(links.filter((_, i) => i !== index));
  }

  function addImage() {
    if (newImage) {
      setImages([...images, newImage]);
      setNewImage("");
    }
  }

  function removeImage(index: number) {
    setImages(images.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        title,
        videoUrl,
        description,
        summary,
        explanation,
        images,
        resources,
        links,
        sectionId,
        order,
        duration,
        transcript,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
              placeholder="Short description…"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson-summary">Summary</Label>
            <Textarea
              id="lesson-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Key points and summary…"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson-explanation">Detailed Explanation</Label>
            <Textarea
              id="lesson-explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="In-depth explanation, code examples, step-by-step guide…"
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label>Images (URLs)</Label>
            <div className="flex gap-2">
              <Input
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                placeholder="Image URL"
              />
              <Button type="button" onClick={addImage} variant="outline">Add</Button>
            </div>
            {images.length > 0 && (
              <div className="space-y-1 mt-2">
                {images.map((img, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-muted px-2 py-1 rounded">
                    <span className="truncate">{img}</span>
                    <Button type="button" onClick={() => removeImage(i)} variant="ghost" size="sm" className="text-destructive">✕</Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Resources</Label>
            <div className="flex gap-2">
              <Input
                value={newResourceName}
                onChange={(e) => setNewResourceName(e.target.value)}
                placeholder="Resource name"
              />
              <Input
                value={newResourceUrl}
                onChange={(e) => setNewResourceUrl(e.target.value)}
                placeholder="Resource URL"
              />
              <Button type="button" onClick={addResource} variant="outline">Add</Button>
            </div>
            {resources.length > 0 && (
              <div className="space-y-1 mt-2">
                {resources.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-muted px-2 py-1 rounded">
                    <span>{r.name}</span>
                    <Button type="button" onClick={() => removeResource(i)} variant="ghost" size="sm" className="text-destructive">✕</Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Additional Links</Label>
            <div className="flex gap-2">
              <Input
                value={newLinkName}
                onChange={(e) => setNewLinkName(e.target.value)}
                placeholder="Link name"
              />
              <Input
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                placeholder="Link URL"
              />
              <Button type="button" onClick={addLink} variant="outline">Add</Button>
            </div>
            {links.length > 0 && (
              <div className="space-y-1 mt-2">
                {links.map((l, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-muted px-2 py-1 rounded">
                    <span>{l.name}</span>
                    <Button type="button" onClick={() => removeLink(i)} variant="ghost" size="sm" className="text-destructive">✕</Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson-transcript">Transcript</Label>
            <Textarea
              id="lesson-transcript"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Full transcript or lesson notes…"
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
