"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckIcon, MinusIcon, Pencil, Trash2, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ExamAttempt {
  score: number;
  passed: boolean;
}

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "student";
  isBanned: boolean;
  banReason?: string;
  progress?: {
    completedLessons: string[];
    completionPercentage?: number;
  };
  examAttempts?: ExamAttempt[];
  certificate?: {
    issued: boolean;
    issuedAt?: string;
  } | null;
}

function bestScore(attempts: ExamAttempt[] | undefined): string {
  if (!attempts || attempts.length === 0) return "N/A";
  return `${Math.max(...attempts.map((a) => a.score))}%`;
}

function completionPct(user: UserRecord): string {
  const pct = user.progress?.completionPercentage ?? 0;
  return `${pct}%`;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data: UserRecord[] = await res.json();
        setUsers(data);
      } catch {
        toast.error("Failed to load users.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<"admin" | "student">("student");
  const [updating, setUpdating] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleUpdateRole() {
    if (!editingUser) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        toast.success("User role updated");
        setUsers((prev) =>
          prev.map((u) => (u._id === editingUser._id ? { ...u, role: newRole } : u))
        );
        setEditDialogOpen(false);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update role");
      }
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteUser() {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${userToDelete._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("User deleted");
        setUsers((prev) => prev.filter((u) => u._id !== userToDelete._id));
        setDeleteConfirmOpen(false);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete user");
      }
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggleBan(userId: string, isBanned: boolean) {
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned }),
      });

      if (!res.ok) {
        toast.error("Failed to update ban status");
        return;
      }

      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isBanned, banReason: isBanned ? u.banReason : undefined } : u
        )
      );
      toast.success(isBanned ? "User banned" : "User activated");
    } catch {
      toast.error("Failed to update ban status");
    }
  }

  function openEdit(user: UserRecord) {
    setEditingUser(user);
    setNewRole(user.role);
    setEditDialogOpen(true);
  }

  function openDelete(user: UserRecord) {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground text-sm mt-1">
          All registered accounts and their progress
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <p className="text-muted-foreground text-sm">No users found.</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-24">Role</TableHead>
                <TableHead className="w-28">Progress</TableHead>
                <TableHead className="w-32">Best Exam Score</TableHead>
                <TableHead className="w-24 text-center">Certificate</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id} className={user.isBanned ? "bg-destructive/5" : ""}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.role === "admin" ? "destructive" : "default"
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{completionPct(user)}</TableCell>
                  <TableCell>{bestScore(user.examAttempts)}</TableCell>
                  <TableCell className="text-center">
                    {user.certificate?.issued ? (
                      <CheckIcon className="size-4 text-green-500 mx-auto" />
                    ) : (
                      <MinusIcon className="size-4 text-muted-foreground mx-auto" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={!user.isBanned}
                        onCheckedChange={(checked) => handleToggleBan(user._id, !checked)}
                      />
                      {user.isBanned ? (
                        <Badge variant="destructive" className="text-xs">
                          <ShieldAlert className="size-3 mr-1" />
                          Banned
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-xs bg-green-500">
                          Active
                        </Badge>
                      )}
                    </div>
                    {user.isBanned && user.banReason && (
                      <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-[200px]" title={user.banReason}>
                        {user.banReason}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(user)}
                        title="Edit Role"
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openDelete(user)}
                        title="Delete User"
                      >
                        <Trash2 className="text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>User</Label>
              <p className="text-sm font-medium">{editingUser?.name} ({editingUser?.email})</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-select">Role</Label>
              <Select value={newRole} onValueChange={(v) => v && setNewRole(v as "admin" | "student")}>
                <SelectTrigger id="role-select">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={updating}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={updating}>
              {updating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{userToDelete?.name}</strong>? 
              This action will remove all their progress and cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
