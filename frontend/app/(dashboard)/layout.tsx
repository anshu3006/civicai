import { DashboardNav } from "@/components/dashboard-nav";
import { UserSync } from "@/components/user-sync";
import { AdminRedirect } from "@/components/admin/admin-redirect";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      {/* Subtle depth + theme tie-in (matches landing hero atmosphere) */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35] dark:opacity-[0.2]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, oklch(0.5 0.02 260 / 0.12) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-primary/[0.06] via-transparent to-transparent dark:from-primary/[0.09]" />

      <UserSync />
      <AdminRedirect />
      <DashboardNav />
      <main className="relative mx-auto w-full max-w-7xl px-4 py-8 text-base leading-relaxed sm:px-6 lg:px-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}
