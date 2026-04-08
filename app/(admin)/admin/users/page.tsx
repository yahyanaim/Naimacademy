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
import { CheckIcon, MinusIcon, Pencil, Trash2, ShieldAlert, Search, Award, Clock, UserPlus, RefreshCw, User, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
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
import { Input } from "@/components/ui/input";

interface ExamAttempt {
  score: number;
  passed: boolean;
}

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
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
  certifications?: {
    examTitle: string;
    score: number;
    issuedAt: string;
  }[];
  createdAt?: string;
  lastActivityAt?: string;
}

function isNewUser(user: UserRecord): boolean {
  if (!user.createdAt) return false;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return new Date(user.createdAt) >= sevenDaysAgo;
}

function isActive(user: UserRecord): boolean {
  if (!user.lastActivityAt) return false;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return new Date(user.lastActivityAt) >= sevenDaysAgo;
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
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data: UserRecord[] = await res.json();
      setUsers(data);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<"admin" | "student">("student");
  const [updating, setUpdating] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sortedUsers = users
    .filter((user) => {
      const searchMatch = 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const roleMatch = roleFilter === "all" || user.role === roleFilter;
      const pct = user.progress?.completionPercentage ?? 0;
      const statusMatch = 
        statusFilter === "all" || 
        (statusFilter === "banned" && user.isBanned) ||
        (statusFilter === "active" && !user.isBanned) ||
        (statusFilter === "certified" && (user.certifications?.length ?? 0) > 0) ||
        (statusFilter === "passed" && user.examAttempts?.some(a => a.passed)) ||
        (statusFilter === "try" && pct === 0) ||
        (statusFilter === "inactive" && !user.lastActivityAt);
      return searchMatch && roleMatch && statusMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "oldest":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  function handlePageChange(page: number) {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">
            All registered accounts and their progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdate && <span className="text-xs text-muted-foreground">Updated: {lastUpdate}</span>}
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value || "all")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || "all")}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
            <SelectItem value="passed">Passed Exam</SelectItem>
            <SelectItem value="certified">Certified</SelectItem>
            <SelectItem value="try">Haven&apos;t Started (0%)</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as "newest" | "oldest" | "name")}>
          <SelectTrigger className="w-[140px]">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="size-4" />
              <SelectValue placeholder="Sort" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">
              <div className="flex items-center gap-2">
                <ArrowDown className="size-4" />
                Newest First
              </div>
            </SelectItem>
            <SelectItem value="oldest">
              <div className="flex items-center gap-2">
                <ArrowUp className="size-4" />
                Oldest First
              </div>
            </SelectItem>
            <SelectItem value="name">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="size-4" />
                Name (A-Z)
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
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
          <div className="overflow-auto" style={{ maxHeight: "500px" }}>
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
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
                {paginatedUsers.map((user) => (
                <TableRow key={user._id} className={user.isBanned ? "bg-destructive/5" : ""}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border">
                          <User className="size-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          {isNewUser(user) && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              <UserPlus className="size-3 mr-1" />New
                            </Badge>
                          )}
                          {isActive(user) && !isNewUser(user) && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              <Clock className="size-3 mr-1" />Active
                            </Badge>
                          )}
                        </div>
                        {user.lastActivityAt && (
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Last: {new Date(user.lastActivityAt).toLocaleDateString("en-US", { 
                              month: "short", 
                              day: "numeric"
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
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
                    {(user.certifications && user.certifications.length > 0) || user.certificate?.issued ? (
                      <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                        <Award className="size-3 mr-1" />
                        n8n Certificate
                      </Badge>
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
                    <div className="flex items-center justify-end gap-2">
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedUsers.length)} of {sortedUsers.length} users
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Select value={String(itemsPerPage)} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[100px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 / page</SelectItem>
                    <SelectItem value="20">20 / page</SelectItem>
                    <SelectItem value="50">50 / page</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="text-sm px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
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
