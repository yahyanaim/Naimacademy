import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";

interface ProgressBarProps {
  percentage: number;
}

export function ProgressBar({ percentage }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percentage));
  const isComplete = clamped >= 100;

  return (
    <div className="space-y-1.5">
      <p className={`text-sm font-medium ${isComplete ? "text-green-600 dark:text-green-400" : "text-foreground"}`}>
        {clamped}% Complete
      </p>
      <Progress value={clamped}>
        <ProgressTrack>
          <ProgressIndicator
            className={isComplete ? "bg-green-500" : undefined}
          />
        </ProgressTrack>
      </Progress>
    </div>
  );
}
