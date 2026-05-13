"use client";

import { cn } from "@/lib/utils";
import {
  useProfile,
  getDesignationInfo,
  getProgressToNext,
  type Designation,
} from "@/lib/hooks/use-profile";

interface ProfileBadgeProps {
  /** "compact" — just emoji + name (for navbar) | "full" — card with progress bar */
  variant?: "compact" | "full";
  /** Dark nav bar (light text) */
  tone?: "default" | "dark";
  className?: string;
}

export function ProfileBadge({
  variant = "compact",
  tone = "default",
  className,
}: ProfileBadgeProps) {
  const { profile, loading } = useProfile();

  if (loading || !profile) return null;

  const designation = (profile.designation ?? "Newcomer") as Designation;
  const points = profile.points ?? 0;
  const info = getDesignationInfo(designation);
  const { progressPct, nextName, nextMin } = getProgressToNext(points, designation);

  if (variant === "compact") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium",
          tone === "dark"
            ? "border-white/20 bg-white/10 text-white/95 [&>span:first-child]:drop-shadow-sm"
            : ["border-border bg-muted/60", info.color],
          className
        )}
        title={`${points} pts — ${designation}`}
      >
        <span>{info.emoji}</span>
        <span className={tone === "dark" ? "text-primary" : undefined}>{designation}</span>
      </span>
    );
  }

  // Full card variant
  return (
    <div className={cn("rounded-xl border border-border bg-background p-4 space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        {profile.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.imageUrl}
            alt={profile.fullName}
            className="h-10 w-10 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg">
            {info.emoji}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">{profile.fullName}</p>
          <p className={cn("text-sm font-medium", info.color)}>
            {info.emoji} {designation}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xl font-bold tabular-nums">{points}</p>
          <p className="text-xs text-muted-foreground">points</p>
        </div>
      </div>

      {/* Progress bar */}
      {nextName && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress to {nextName}</span>
            <span>{points} / {nextMin}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}
      {!nextName && (
        <p className="text-center text-xs font-medium text-amber-500">
          🏆 Top designation achieved!
        </p>
      )}
    </div>
  );
}
