"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  FileQuestion,
  Users,
  ArrowLeft,
  Shield,
  LogOut,
  MessageSquare,
  Bot,
  Bell,
  FileText,
  MessageCircle,
  UsersRound,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/content", label: "Content", icon: BookOpen },
  { href: "/admin/exam", label: "Exam", icon: FileQuestion },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/ai", label: "AI Stats", icon: Bot },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/support", label: "Support", icon: MessageSquare },
  { href: "/admin/comments", label: "Comments", icon: MessageCircle },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/community", label: "Community", icon: Users },
  { href: "/admin/waitlist", label: "Waitlist", icon: UsersRound },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col h-full w-full border-r bg-muted/20">
      <div className="flex items-center gap-2 h-14 px-4 border-b">
        <Shield className="size-4 text-primary" />
        <span className="font-bold tracking-tight text-xs uppercase">Admin Panel</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/admin"
              ? pathname === "/admin"
              : pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 flex-shrink-0" />
          Back to Site
        </Link>
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/";
          }}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
}
