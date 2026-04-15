"use client";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { usePathname } from "next/navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCommunityPage = pathname?.startsWith("/community");

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-14">{children}</main>
      {!isCommunityPage && <Footer />}
    </>
  );
}
