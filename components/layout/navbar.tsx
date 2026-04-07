"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Menu,
  LogOut,
  User,
  LayoutDashboard,
  Shield,
  FileBadge,
  Coffee,
  LogIn,
  UserPlus,
  Bell,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NotificationBell } from "./notification-bell";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  const desktopNavLinks = (
    <>
      <Link
        href="/course"
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 hover:-translate-y-0.5"
      >
        Course
      </Link>
      {user && (
        <Link
          href="/certificates"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 hover:-translate-y-0.5"
        >
          Certificates
        </Link>
      )}
      {user && (
        <Link
          href={user.role === "admin" ? "/admin" : "/dashboard"}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 hover:-translate-y-0.5"
        >
          {user.role === "admin" ? "Admin" : "Dashboard"}
        </Link>
      )}
    </>
  );

  const handleDonate = () => {
    setMobileOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] transition-all duration-300">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <GraduationCap className="h-5 w-5" />
          <span>Naim Academy</span>
        </Link>

        {/* Center nav – desktop */}
        <nav className="hidden md:flex items-center gap-6">{desktopNavLinks}</nav>

        {/* Right side – desktop */}
        <div className="hidden md:flex items-center gap-2">
          {user && (
            <Link
              href="/donate"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 flex items-center gap-1 hover:-translate-y-0.5"
            >
              <Coffee className="size-4" />
              Support
            </Link>
          )}
          {user && <NotificationBell />}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost" }), "font-semibold text-base")}>
                {user.name || user.email}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Link 
                    href={user.role === "admin" ? "/admin" : "/dashboard"} 
                    className="flex w-full items-center gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {user.role === "admin" ? "Admin Panel" : "Dashboard"}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/profile" className="flex w-full items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/certificates" className="flex w-full items-center gap-2">
                    <FileBadge className="h-4 w-4" />
                    My Certificates
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Login
              </Link>
              <Link href="/signup" className={buttonVariants({ size: "sm" })}>
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="inline-flex h-10 w-10 items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-1 pt-12">
                <Link
                  href="/course"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md hover:bg-muted transition-colors"
                >
                  <GraduationCap className="size-5" />
                  Course
                </Link>
                
                <div className="my-2 border-t" />
                
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md hover:bg-muted transition-colors"
                    >
                      <LayoutDashboard className="size-5" />
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md hover:bg-muted transition-colors"
                    >
                      <User className="size-5" />
                      Profile
                    </Link>
                    <Link
                      href="/certificates"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md hover:bg-muted transition-colors"
                    >
                      <FileBadge className="size-5" />
                      My Certificates
                    </Link>
                    <div className="my-2 border-t" />
                    {user && (
                      <div className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md hover:bg-muted transition-colors">
                        <NotificationBell />
                      </div>
                    )}
                    {user && (
                    <Link
                      href="/donate"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md hover:bg-muted transition-colors"
                    >
                      <Coffee className="size-5" />
                      Support Us
                    </Link>
                    )}
                    {user?.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md hover:bg-muted transition-colors"
                      >
                        <Shield className="size-5" />
                        Admin
                      </Link>
                    )}
                    
                    <div className="my-2 border-t" />
                    
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md text-destructive hover:bg-destructive/10 transition-colors text-left"
                    >
                      <LogOut className="size-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md hover:bg-muted transition-colors"
                    >
                      <LogIn className="size-5" />
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md hover:bg-muted transition-colors"
                    >
                      <UserPlus className="size-5" />
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
