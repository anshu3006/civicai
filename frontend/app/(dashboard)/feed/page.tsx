"use client";

import { useEffect, useState, useCallback } from "react";
import { PostIssue } from "@/components/post-issue";
import { IssueCard, type Issue } from "@/components/issue-card";
import { Loader2, Inbox, AlertCircle, RefreshCw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5500").replace(/\/$/, "");

type FeedTab = "all" | "pending_verifications";

export default function FeedPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [pendingIssues, setPendingIssues] = useState<Issue[]>([]);
  const [activeTab, setActiveTab] = useState<FeedTab>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [allRes, pendingRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/issues`),
        fetch(`${BACKEND_URL}/api/issues/pending-verifications`),
      ]);
      if (!allRes.ok) throw new Error(`Failed to load issues (${allRes.status})`);
      const allJson = await allRes.json();
      setIssues(allJson.data ?? []);
      if (pendingRes.ok) {
        const pendingJson = await pendingRes.json();
        setPendingIssues(pendingJson.data ?? []);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const displayedIssues = activeTab === "all" ? issues : pendingIssues;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Post issue form */}
      <PostIssue onSuccess={fetchIssues} />

      {/* Feed header */}
      <div className="flex flex-col gap-4 border-b border-border/50 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Community Issues
          </h1>
          <p className="mt-1 max-w-2xl text-base text-muted-foreground">
            Browse reports, verify resolutions, and keep your neighbourhood accountable.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchIssues}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-border/80 bg-card px-4 py-2.5 text-base font-medium text-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-muted/50 hover:shadow-md disabled:pointer-events-none disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-base font-medium transition-all duration-200",
            "hover:-translate-y-0.5 active:translate-y-0",
            activeTab === "all"
              ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "border-border/80 bg-card/80 text-muted-foreground hover:border-primary/35 hover:text-foreground"
          )}
        >
          All Issues
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
              activeTab === "all" ? "bg-white/20 text-white" : "bg-muted text-foreground"
            )}
          >
            {issues.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("pending_verifications")}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-base font-medium transition-all duration-200",
            "hover:-translate-y-0.5 active:translate-y-0",
            activeTab === "pending_verifications"
              ? "border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/25"
              : "border-border/80 bg-card/80 text-muted-foreground hover:border-amber-400/60 hover:text-foreground"
          )}
        >
          <ShieldAlert className="h-3 w-3" />
          Pending Verifications
          {pendingIssues.length > 0 && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
                activeTab === "pending_verifications"
                  ? "bg-white/20 text-white"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
              )}
            >
              {pendingIssues.length}
            </span>
          )}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-200/80 bg-red-50/90 py-14 text-center shadow-sm dark:border-red-900/40 dark:bg-red-950/30">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-base text-red-600 dark:text-red-400">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchIssues}>
            Try again
          </Button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && displayedIssues.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card/80 py-16 text-center shadow-sm">
          <Inbox className="h-10 w-10 text-muted-foreground/50" />
          {activeTab === "all" ? (
            <>
              <p className="text-base font-medium text-muted-foreground">No issues reported yet.</p>
              <p className="text-sm text-muted-foreground/80">Be the first to report a civic issue!</p>
            </>
          ) : (
            <>
              <p className="text-base font-medium text-muted-foreground">No pending verifications.</p>
              <p className="text-sm text-muted-foreground/80">All resolved issues have been verified by residents.</p>
            </>
          )}
        </div>
      )}

      {/* Issues list */}
      {!loading && !error && displayedIssues.length > 0 && (
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6 xl:gap-8">
          {displayedIssues.map((issue) => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}
