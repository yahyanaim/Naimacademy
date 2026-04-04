export function parseDurationToMinutes(duration: string): number {
  const parts = duration.split(":").map(Number);
  if (parts.length === 2) {
    return parts[0] + parts[1] / 60;
  }
  return 0;
}

export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  if (hours === 0) return `${mins}m`;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function getSectionDuration(lessons: { duration: string }[]): string {
  let totalMinutes = 0;
  for (const lesson of lessons) {
    totalMinutes += parseDurationToMinutes(lesson.duration);
  }
  return formatDuration(totalMinutes);
}
