import AdminSidebar from "@/components/layout/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-screen">
      {/* Sidebar – hidden on mobile */}
      <aside className="hidden md:flex w-64 flex-shrink-0">
        <AdminSidebar />
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center px-4 py-3 border-b bg-background">
          <span className="font-semibold text-sm">Admin Panel</span>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
