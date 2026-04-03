import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";

interface ProgressBarProps {
  percentage: number;
}

export function ProgressBar({ percentage }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percentage));

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-green-600 dark:text-green-400">
        {clamped}% Complete
      </p>
      <Progress value={clamped}>
        <ProgressTrack>
          <ProgressIndicator className="bg-green-500" />
        </ProgressTrack>
      </Progress>
    </div>
  );
}
