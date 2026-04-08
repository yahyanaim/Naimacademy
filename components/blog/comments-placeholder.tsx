"use client";

import { MessageSquare, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CommentsPlaceholder() {
  return (
    <section className="mt-12 pt-8 border-t">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="size-6 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Comments</h2>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="size-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Comments Coming Soon</h3>
          <p className="text-muted-foreground mb-6">
            We&apos;re building a community discussion feature for registered users. 
            Sign in to join the conversation when it launches.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Create Account</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
