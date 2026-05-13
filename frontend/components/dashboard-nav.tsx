"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Rss, Map, CalendarDays, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

import { ProfileBadge } from "@/components/profile-badge";
import { AccessibilityToolbar } from "@/components/accessibility-toolbar";

const NAV_LINKS = [
  { href: "/feed", label: "Feed", icon: Rss },
  { href: "/map", label: "Map", icon: Map },
  { href: "/events", label: "Events", icon: CalendarDays },
];

export function DashboardNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0d1117] text-white shadow-lg shadow-black/30">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/feed"
          className="text-3xl font-extrabold tracking-tight text-white transition-colors hover:text-primary"
        >
          Civix.
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2.5 text-base font-medium transition-all duration-200",
                pathname === href
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <AccessibilityToolbar compact surface="dark" />
          <ProfileBadge variant="compact" tone="dark" className="hidden sm:inline-flex" />
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 ring-2 ring-white/20",
              },
            }}
          />
          <button
            type="button"
            className="rounded-lg p-2 text-white/90 transition-colors hover:bg-white/10 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#0d1117] px-4 pb-4 pt-2 md:hidden">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                pathname === href
                  ? "bg-primary text-primary-foreground"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
