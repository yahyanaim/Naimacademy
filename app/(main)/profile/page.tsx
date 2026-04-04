"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, User as UserIcon, Mail, Lock, Save, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data?.user) {
          setName(data.user.name || "");
          setEmail(data.user.email || "");
        }
        setLoading(false);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: password || undefined }),
      });
      if (!res.ok) throw new Error();
      
      const data = await res.json();
      toast.success("Profile saved successfully.");
      setPassword("");
      if (data.user?.name) setName(data.user.name);
      
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch {
      toast.error("Error saving profile details.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmEmail !== email) {
      toast.error("Email does not match");
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch("/api/user/account", { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Account deleted successfully");
      window.location.href = "/";
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin size-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-12 px-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your personal information and security credentials.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-sm border-border overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border pb-6">
            <CardTitle className="text-xl flex items-center gap-2">
              <UserIcon className="size-5 text-primary" />
              General Profile
            </CardTitle>
            <CardDescription>
              This information will be displayed on your certificate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-9 h-11"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9 h-11"
                    placeholder="m@example.com"
                  />
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-3 max-w-sm">
              <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                <Lock className="size-4" />
                Change Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Leave blank to keep current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                className="h-11"
              />
              <p className="text-[0.8rem] text-muted-foreground">Must be at least 8 characters long.</p>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t border-border px-6 py-4 flex justify-end">
            <Button type="submit" size="lg" disabled={saving} className="px-8 font-medium">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {saving ? "Saving Changes..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Danger Zone */}
      <Card className="shadow-sm border-destructive/30 overflow-hidden">
        <CardHeader className="bg-destructive/5 border-b border-destructive/20 pb-6">
          <CardTitle className="text-xl flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg border border-border">
            <div>
              <p className="text-sm font-medium">Delete your account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              className="shrink-0"
            >
              <Trash2 className="size-4 mr-1.5" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your progress, certificates, and data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirmEmail">
                Type your email <strong>{email}</strong> to confirm
              </Label>
              <Input
                id="confirmEmail"
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setConfirmEmail("");
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting || confirmEmail !== email}
            >
              {deleting ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
