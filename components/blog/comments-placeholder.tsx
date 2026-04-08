"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CommentsPlaceholder() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setIsLoggedIn(!!data?.user))
      .catch(() => setIsLoggedIn(false));
  }, []);

  if (isLoggedIn === null) {
    return (
      <section className="mt-12 pt-8 border-t">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="size-6 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Comments</h2>
        </div>
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12 pt-8 border-t">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="size-6 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Comments</h2>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <Construction className="size-8 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Comments Under Development</h3>
          <p className="text-muted-foreground">
            We&apos;re building an amazing community discussion feature for registered users. 
            Stay tuned - it will be available soon!
          </p>
        </div>
      </div>
    </section>
  );
}
