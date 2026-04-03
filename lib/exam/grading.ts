import { EXAM } from "@/lib/constants";

export function gradeExam(
  answers: number[],
  correctAnswers: number[]
): { score: number; passed: boolean; total: number; correct: number } {
  const total = correctAnswers.length;
  let correct = 0;

  for (let i = 0; i < total; i++) {
    if (answers[i] === correctAnswers[i]) {
      correct++;
    }
  }

  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = score >= EXAM.DEFAULT_PASSING_SCORE;

  return { score, passed, total, correct };
}
