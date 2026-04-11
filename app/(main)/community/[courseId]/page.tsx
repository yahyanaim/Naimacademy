"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";
import CourseCommunity from "@/components/course/community";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CourseData {
  _id: string;
  title: string;
}

export default function CommunityPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/course");
        if (res.ok) {
          const data = await res.json();
          setCourse(data.course);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-14">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link
            href="/course"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="size-4" />
            Back to Course
          </Link>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-64" />
            </div>
          ) : course ? (
            <>
              <h1 className="text-2xl font-bold mb-6">{course.title} Community</h1>
              <CourseCommunity courseId={course._id} courseName={course.title} />
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Course not found</p>
              <Link href="/course" className="text-primary hover:underline mt-2 inline-block">
                Go back to course
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
