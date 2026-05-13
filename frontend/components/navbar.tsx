"use client";

import Link from "next/link";
import { SignedIn, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { AccessibilityToolbar } from "@/components/accessibility-toolbar";
import { cn } from "@/lib/utils";

const LANDING_NAV = [
  { href: "/feed", label: "Public Feed" },
  { href: "/map", label: "Hotspot Map" },
  { href: "/events", label: "Leaderboard" },
] as const;

function BrandLink() {
  return (
    <Link
      href="/"
      className="flex min-w-0 items-center gap-3 rounded-md outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10">
        <span className="text-xl" aria-hidden>
          🏛️
        </span>
      </div>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="text-xl font-extrabold uppercase tracking-wide">
          Civix.
        </span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-primary">
          Smart Grievance Portal
        </span>
      </div>
    </Link>
  );
}

function FileComplaintButton({ size = "default" }: { size?: "default" | "sm" }) {
  return (
    <SignInButton mode="redirect" forceRedirectUrl="/feed">
      <Button
        type="button"
        size={size === "sm" ? "sm" : "default"}
        className="shrink-0 bg-primary text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 md:px-6"
      >
        + File Complaint
      </Button>
    </SignInButton>
  );
}

function NavLinks({ className }: { className?: string }) {
  return (
    <>
      {LANDING_NAV.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "text-sm font-semibold tracking-wide text-white/70 transition hover:text-primary",
            className
          )}
        >
          {label}
        </Link>
      ))}
    </>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-[#0d1117] text-white shadow-xl">
      <div className="mx-auto max-w-7xl px-6 py-2 md:py-0">
        {/* Desktop: true center column for nav, actions pinned top-right */}
        <div className="hidden min-h-16 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-4 md:py-0">
          <div className="flex min-w-0 items-center justify-start py-2">
            <BrandLink />
          </div>
          <nav
            className="flex shrink-0 items-center justify-center gap-5 lg:gap-6"
            aria-label="Primary"
          >
            <NavLinks />
          </nav>
          <div className="flex min-w-0 items-center justify-end gap-2 py-2">
            <AccessibilityToolbar surface="dark" />
            <FileComplaintButton />
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: { avatarBox: "ml-2 h-8 w-8 border-2 border-primary" },
                }}
              />
            </SignedIn>
          </div>
        </div>

        {/* Mobile */}
        <div className="flex flex-col md:hidden">
          <div className="flex h-14 items-center justify-between">
            <BrandLink />
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-2">
            <AccessibilityToolbar compact surface="dark" />
            <div className="flex items-center gap-2">
              <FileComplaintButton size="sm" />
              <SignedIn>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: { avatarBox: "h-8 w-8 border-2 border-primary" },
                  }}
                />
              </SignedIn>
            </div>
          </div>
          <nav
            className="flex justify-center gap-4 border-t border-white/10 py-2 text-xs font-semibold text-white/80"
            aria-label="Primary"
          >
            <NavLinks className="text-xs text-white/80" />
          </nav>
        </div>
      </div>
    </header>
  );
}
