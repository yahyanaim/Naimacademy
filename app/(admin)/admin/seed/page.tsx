"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminSeedPage() {
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<{ code: string; usedCount: number; maxUses: number } | null>(null);

  const checkInvite = async () => {
    try {
      const res = await fetch("/api/admin/create-invite");
      const data = await res.json();
      setInviteStatus(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkInvite();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      if (res.ok) {
        toast.success("Database seeded successfully!");
        await checkInvite();
      } else {
        toast.error("Failed to seed database");
      }
    } catch (err) {
      toast.error("Error seeding database");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Tools</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Initialize and manage your platform
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Database Initialization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Run the seed to create the default course, sections, lessons, exam, and admin user.
          </p>
          
          <Button onClick={handleSeed} disabled={seeding}>
            {seeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {seeding ? "Seeding..." : "Seed Database"}
          </Button>

          {inviteStatus && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Invite Code Status:</p>
              <p className="text-sm">Code: <span className="font-mono font-bold">{inviteStatus.code}</span></p>
              <p className="text-sm text-muted-foreground">
                Uses: {inviteStatus.usedCount} / {inviteStatus.maxUses}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Login Credentials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Email:</span> admin@n8n-course.com</p>
            <p><span className="font-medium">Password:</span> admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}