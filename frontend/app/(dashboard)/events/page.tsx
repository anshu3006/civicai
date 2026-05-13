"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  CalendarDays, MapPin, Clock, Users, Star, CheckCircle2,
  Plus, Loader2, X, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileBadge } from "@/components/profile-badge";
import { useProfile } from "@/lib/hooks/use-profile";

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5500").replace(/\/$/, "");

const TAG_COLORS: Record<string, string> = {
  Environment:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Safety:         "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Infrastructure: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  General:        "bg-muted text-muted-foreground",
  Health:         "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Education:      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

const TAGS = ["General", "Environment", "Safety", "Infrastructure", "Health", "Education"];

interface CivixEvent {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  tag: string;
  organiser: string;
  organiserName: string;
  organiserImage?: string;
  interestedUsers: string[];
  participatingUsers: string[];
  createdAt: string;
}

// ── Point toast ──────────────────────────────────────────────────────────
function PointToast({ delta, onDone }: { delta: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
      <div className="flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-base font-medium shadow-lg">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className={delta > 0 ? "text-green-600" : "text-red-500"}>
          {delta > 0 ? `+${delta}` : delta} points
        </span>
      </div>
    </div>
  );
}

// ── Create Event Modal ───────────────────────────────────────────────────
function CreateEventModal({ onClose, onCreated }: { onClose: () => void; onCreated: (e: CivixEvent) => void }) {
  const { getToken } = useAuth();
  const [form, setForm] = useState({ title: "", description: "", location: "", date: "", time: "", tag: "General" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.date) { setError("Title and date are required."); return; }
    setSubmitting(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/api/events`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to create event");
      onCreated(json.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border border-border bg-background shadow-2xl animate-in slide-in-from-bottom-4 duration-200 sm:max-w-lg sm:rounded-xl sm:zoom-in-95">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background px-5 py-4">
          <h2 className="text-lg font-semibold sm:text-xl">Create Event</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-muted" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
          <div className="space-y-1.5">
            <label className="text-base font-medium">Title <span className="text-red-500">*</span></label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Event title"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="space-y-1.5">
            <label className="text-base font-medium">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} placeholder="What's this event about?"
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-base font-medium">Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="space-y-1.5">
              <label className="text-base font-medium">Time</label>
              <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-base font-medium">Location</label>
            <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="Venue or area"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="space-y-1.5">
            <label className="text-base font-medium">Tag</label>
            <select value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-primary/30">
              {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:bg-red-900/20">{error}</p>}
          <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
            <Sparkles className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm font-medium text-primary sm:text-base">You&apos;ll earn +80 points for organising!</p>
          </div>
          <button type="submit" disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Creating…" : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Event Card ───────────────────────────────────────────────────────────
function EventCard({ event, userId, onUpdate, onToast }: {
  event: CivixEvent;
  userId: string | null | undefined;
  onUpdate: (updated: CivixEvent) => void;
  onToast: (delta: number) => void;
}) {
  const { getToken } = useAuth();
  const [pending, setPending] = useState<"interested" | "participating" | null>(null);

  const isInterested    = !!userId && event.interestedUsers.includes(userId);
  const isParticipating = !!userId && event.participatingUsers.includes(userId);
  const totalCount      = new Set([...event.interestedUsers, ...event.participatingUsers]).size;

  async function toggle(action: "interested" | "participating") {
    if (!userId || pending) return;
    setPending(action);
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/api/events/${event._id}/${action}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      onUpdate({ ...event, interestedUsers: json.data.interestedUsers, participatingUsers: json.data.participatingUsers });
      onToast(json.data.pointsDelta);
    } catch { /* silent */ }
    finally { setPending(null); }
  }

  return (
    <article
      className={cn(
        "group relative min-w-0 overflow-hidden rounded-2xl border border-border/50 bg-card/80 p-5 shadow-sm ring-1 ring-black/[0.03] transition-all duration-300 sm:p-6",
        "hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 dark:ring-white/[0.06]"
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-foreground sm:text-xl">
            {event.title}
          </h3>
          <span
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-sm font-medium",
              TAG_COLORS[event.tag] ?? "bg-muted text-muted-foreground"
            )}
          >
            {event.tag}
          </span>
        </div>

        {event.description && (
          <p className="mt-3 line-clamp-3 text-base leading-relaxed text-muted-foreground">{event.description}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 shrink-0" />
            {event.date}
          </span>
          {event.time && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 shrink-0" />
              {event.time}
            </span>
          )}
          {event.location && (
            <span className="flex min-w-0 items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{event.location}</span>
            </span>
          )}
          <span className="ml-auto flex items-center gap-1.5 font-medium text-foreground/80">
            <Users className="h-4 w-4 shrink-0" />
            {totalCount} engaged
          </span>
        </div>

        <div className="mt-4 flex items-center gap-3 text-base text-muted-foreground">
          {event.organiserImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.organiserImage}
              alt={event.organiserName}
              className="h-9 w-9 shrink-0 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold text-muted-foreground">
              {event.organiserName?.charAt(0) ?? "?"}
            </div>
          )}
          <span>
            Organised by{" "}
            <span className="text-lg font-semibold text-foreground">{event.organiserName}</span>
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => toggle("interested")}
            disabled={!userId || pending !== null}
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200",
              "active:scale-[0.98] hover:ring-1 hover:ring-amber-400/30",
              isInterested
                ? "border-amber-400 bg-amber-100 text-amber-900 dark:border-amber-600 dark:bg-amber-900/35 dark:text-amber-200"
                : "border-border bg-card text-muted-foreground hover:border-amber-400/50 hover:bg-amber-50/80 hover:text-amber-900 dark:hover:bg-amber-950/20",
              (!userId || pending !== null) && "cursor-not-allowed opacity-60"
            )}
          >
            {pending === "interested" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Star className="h-4 w-4" />
            )}
            {isInterested ? "Interested ✓" : "Interested"}
            <span className="text-xs font-normal text-muted-foreground">(+10 pts)</span>
          </button>

          <button
            type="button"
            onClick={() => toggle("participating")}
            disabled={!userId || pending !== null}
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200",
              "active:scale-[0.98] hover:ring-1 hover:ring-primary/35",
              isParticipating
                ? "border-primary/40 bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "border-border bg-primary/90 text-primary-foreground hover:bg-primary",
              (!userId || pending !== null) && "cursor-not-allowed opacity-60"
            )}
          >
            {pending === "participating" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {isParticipating ? "Participating ✓" : "Participate"}
            <span className="text-xs font-normal opacity-90">(+20 pts)</span>
          </button>
        </div>
      </div>
    </article>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function EventsPage() {
  const { userId, isSignedIn } = useAuth();
  const { profile, refresh: refreshProfile } = useProfile();
  const [events, setEvents] = useState<CivixEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState<number | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/events`);
      const json = await res.json();
      if (json.success) setEvents(json.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  function handleUpdate(updated: CivixEvent) {
    setEvents((ev) => ev.map((e) => (e._id === updated._id ? updated : e)));
    refreshProfile();
  }

  function handleToast(delta: number) {
    setToast(delta);
    refreshProfile();
  }

  function handleCreated(event: CivixEvent) {
    setEvents((ev) => [event, ...ev]);
    setShowCreate(false);
    setToast(80);
    refreshProfile();
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-border/50 bg-card/80 p-5 shadow-md ring-1 ring-black/[0.03] sm:p-6 dark:ring-white/[0.06]">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/20">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Civic Events</h1>
              <p className="mt-1 max-w-2xl text-base text-muted-foreground">
                Participate and earn community points.
              </p>
            </div>
          </div>
          {isSignedIn && (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-base font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Create Event
            </button>
          )}
        </div>
      </div>

      {/* Profile badge (full) */}
      {profile && (
        <ProfileBadge
          variant="full"
          className="rounded-2xl border-border/50 shadow-md ring-1 ring-black/[0.03] dark:ring-white/[0.06]"
        />
      )}

      {/* Events list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card/80 p-12 text-center shadow-sm">
          <CalendarDays className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg font-semibold text-foreground">No events yet</p>
          <p className="mt-2 text-base text-muted-foreground">Be the first to create a community event!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6 xl:gap-8">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              userId={userId}
              onUpdate={handleUpdate}
              onToast={handleToast}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateEventModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {/* Points toast */}
      {toast !== null && (
        <PointToast delta={toast} onDone={() => setToast(null)} />
      )}
    </div>
  );
}
