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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusIcon, Trash2Icon } from "lucide-react";

type QuestionType = "multiple-choice" | "true-false";

interface QuestionFormData {
  question: string;
  type: QuestionType;
  options: string[];
  correctAnswer: number;
  order: number;
  examId: string;
}

interface QuestionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: QuestionFormData) => void;
  initialData?: Partial<QuestionFormData>;
  examId: string;
}

const TRUE_FALSE_OPTIONS = ["True", "False"];

export function QuestionForm({
  open,
  onClose,
  onSubmit,
  initialData,
  examId,
}: QuestionFormProps) {
  const [questionText, setQuestionText] = useState(initialData?.question ?? "");
  const [type, setType] = useState<QuestionType>(
    initialData?.type ?? "multiple-choice"
  );
  const [options, setOptions] = useState<string[]>(
    initialData?.options ?? ["", "", "", ""]
  );
  const [correctAnswer, setCorrectAnswer] = useState<number>(
    initialData?.correctAnswer ?? 0
  );
  const [order, setOrder] = useState(initialData?.order ?? 1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setQuestionText(initialData?.question ?? "");
      const t = initialData?.type ?? "multiple-choice";
      setType(t);
      if (t === "true-false") {
        setOptions(TRUE_FALSE_OPTIONS);
      } else {
        setOptions(initialData?.options ?? ["", "", "", ""]);
      }
      setCorrectAnswer(initialData?.correctAnswer ?? 0);
      setOrder(initialData?.order ?? 1);
    }
  }, [open, initialData]);

  function handleTypeChange(value: QuestionType | null) {
    const newType = (value ?? type) as QuestionType;
    setType(newType);
    if (newType === "true-false") {
      setOptions(TRUE_FALSE_OPTIONS);
      setCorrectAnswer(0);
    } else {
      setOptions(["", "", "", ""]);
      setCorrectAnswer(0);
    }
  }

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }

  function addOption() {
    setOptions((prev) => [...prev, ""]);
  }

  function removeOption(index: number) {
    setOptions((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (correctAnswer >= next.length) setCorrectAnswer(0);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ question: questionText, type, options, correctAnswer, order, examId });
    } finally {
      setSubmitting(false);
    }
  }

  const filledOptions = options.filter((o) => o.trim() !== "");

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData?.question ? "Edit Question" : "Add Question"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="q-text">Question</Label>
            <Textarea
              id="q-text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter the question text…"
              required
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="true-false">True / False</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="q-order">Order</Label>
              <Input
                id="q-order"
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                required
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <Label>Options</Label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    disabled={type === "true-false"}
                    required={type === "multiple-choice"}
                  />
                  {type === "multiple-choice" && options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeOption(i)}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {type === "multiple-choice" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="mt-1"
              >
                <PlusIcon className="size-4" />
                Add Option
              </Button>
            )}
          </div>

          {/* Correct answer */}
          <div className="space-y-2">
            <Label>Correct Answer</Label>
            <Select
              value={String(correctAnswer)}
              onValueChange={(v: string | null) => setCorrectAnswer(Number(v ?? 0))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt, i) => (
                  <SelectItem key={i} value={String(i)} disabled={!opt.trim()}>
                    {opt.trim() ? `${i + 1}. ${opt}` : `Option ${i + 1} (empty)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <input type="hidden" value={examId} readOnly />

          <DialogFooter showCloseButton>
            <Button
              type="submit"
              disabled={submitting || (type === "multiple-choice" && filledOptions.length < 2)}
            >
              {submitting
                ? "Saving…"
                : initialData?.question
                ? "Save Changes"
                : "Add Question"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
