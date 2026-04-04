"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Trash2, Download } from "lucide-react";
import { toast } from "sonner";

const DAY_OPTIONS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

interface ScheduleData {
  lessonsPerWeek: number;
  daysOfWeek: number[];
  startDate: string;
  endDate: string;
}

interface ScheduleStats {
  totalLessons: number;
  completedLessons: number;
  remainingLessons: number;
  weeksRemaining: number;
}

export function LearningSchedule() {
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [stats, setStats] = useState<ScheduleStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [lessonsPerWeek, setLessonsPerWeek] = useState("5");
  const [startDate, setStartDate] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);

  function toggleDay(day: number) {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  }

  async function handleSave() {
    if (!startDate || !lessonsPerWeek) {
      toast.error("Please fill in all fields");
      return;
    }
    if (selectedDays.length === 0) {
      toast.error("Select at least one day");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonsPerWeek: parseInt(lessonsPerWeek),
          daysOfWeek: selectedDays,
          startDate,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to save schedule");
        return;
      }

      const data = await res.json();
      setSchedule(data.schedule);
      toast.success("Schedule saved!");
    } catch {
      toast.error("Failed to save schedule");
    } finally {
      setLoading(false);
    }
  }

  function generateCalendarEvents() {
    if (!schedule) return;

    const events = [];
    const start = new Date(schedule.startDate);
    const end = new Date(schedule.endDate);
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      if (schedule.daysOfWeek.includes(dayOfWeek)) {
        const eventStart = new Date(currentDate);
        eventStart.setHours(10, 0, 0, 0);
        const eventEnd = new Date(currentDate);
        eventEnd.setHours(11, 0, 0, 0);

        events.push({
          summary: "Naim Academy - Study Session",
          description: "Continue your n8n automation course on Naim Academy",
          location: "https://naimacademy.vercel.app/course",
          startTime: eventStart.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
          endTime: eventEnd.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return events;
  }

  function downloadICS() {
    const events = generateCalendarEvents();
    if (!events || events.length === 0) return;

    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Naim Academy//Learning Schedule//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

    events.forEach((event, index) => {
      icsContent += `BEGIN:VEVENT
DTSTART:${event.startTime}
DTEND:${event.endTime}
SUMMARY:${event.summary}
DESCRIPTION:${event.description}
URL:${event.location}
UID:naim-academy-${index}@naimacademy.vercel.app
END:VEVENT
`;
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "naim-academy-schedule.ics";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Calendar file downloaded!");
  }

  if (!schedule) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            Learning Schedule
          </CardTitle>
          <CardDescription>Plan your study sessions and add them to your calendar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lessonsPerWeek">Lessons per week</Label>
            <Input
              id="lessonsPerWeek"
              type="number"
              min="1"
              max="20"
              value={lessonsPerWeek}
              onChange={(e) => setLessonsPerWeek(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Study days</Label>
            <div className="flex flex-wrap gap-2">
              {DAY_OPTIONS.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedDays.includes(day.value)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? "Saving..." : "Save Schedule"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              Your Learning Schedule
            </CardTitle>
            <CardDescription>
              {schedule.lessonsPerWeek} lessons/week • {stats?.weeksRemaining} weeks remaining
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={downloadICS}>
              <Download className="size-4 mr-1" />
              Calendar
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={async () => {
                await fetch("/api/schedule", { method: "DELETE" });
                setSchedule(null);
                toast.success("Schedule removed");
              }}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Start</p>
              <p className="font-medium">{new Date(schedule.startDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">End</p>
              <p className="font-medium">{new Date(schedule.endDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {DAY_OPTIONS.filter(d => schedule.daysOfWeek.includes(d.value)).map(day => (
            <span
              key={day.value}
              className="px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary"
            >
              {day.label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
