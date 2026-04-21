"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Trash2, Download, Mail, Calendar, GraduationCap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WaitlistEntry {
  _id: string;
  name: string;
  email: string;
  education?: string;
  skillsInterest?: string;
  isWaitlisted: boolean;
  createdAt?: string;
}

export default function WaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/waitlist?page=${page}&limit=13`);
      const data = await res.json();
      if (data.entries) {
        setEntries(data.entries);
        setTotalPages(data.totalPages || 1);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch waitlist:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    const interval = setInterval(fetchEntries, 30000);
    return () => clearInterval(interval);
  }, [fetchEntries]);

  const deleteEntry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    
    try {
      await fetch(`/api/admin/waitlist/${id}`, { method: "DELETE" });
      toast.success("Entry deleted");
      fetchEntries();
    } catch (error) {
      toast.error("Failed to delete entry");
    }
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Education", "Interest", "Date"];
    const rows = filteredEntries.map(e => [
      e.name,
      e.email,
      e.education || "",
      e.skillsInterest || "",
      e.createdAt ? new Date(e.createdAt).toLocaleDateString() : ""
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const filteredEntries = entries.filter(
    e =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.skillsInterest?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Waitlist</h1>
          <p className="text-muted-foreground text-sm">
            {entries.length} entries &bull; Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={exportCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or interest..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Education</TableHead>
              <TableHead>Interest</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No waitlist entries found
                </TableCell>
              </TableRow>
            ) : (
              filteredEntries.map(entry => (
                <TableRow key={entry._id}>
                  <TableCell className="font-medium">{entry.name}</TableCell>
                  <TableCell>
                    <a href={`mailto:${entry.email}`} className="flex items-center gap-2 hover:underline">
                      <Mail className="h-4 w-4" />
                      {entry.email}
                    </a>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      {entry.education || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      {entry.skillsInterest || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {entry.createdAt
                        ? new Date(entry.createdAt).toLocaleDateString()
                        : "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteEntry(entry._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex justify-center gap-1 flex-wrap">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={page === p ? "default" : "outline"}
                size="sm"
                className="w-10"
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-2 text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}