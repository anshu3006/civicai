"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { formatDistanceToNow } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Loader2, Send, User, MessageSquare } from "lucide-react";

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5500").replace(/\/$/, "");

interface Comment {
  _id: string;
  issueId: string;
  clerkUserId: string;
  text: string;
  createdAt: string;
  userName: string;
  userImage?: string;
}

interface CommentsSectionProps {
  issueId: string;
}

export function CommentsSection({ issueId }: CommentsSectionProps) {
  const { userId, getToken } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch comments on mount
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${BACKEND_URL}/api/issues/${issueId}/comments`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setComments(json.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load comments.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [issueId]);

  // Scroll to bottom when new comment added
  useEffect(() => {
    if (comments.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments.length]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/api/issues/${issueId}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "Failed to post comment");
      }

      const json = await res.json();
      setComments((prev) => [...prev, json.data as Comment]);
      setText("");
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Comments {comments.length > 0 && `· ${comments.length}`}
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <p className="py-2 text-center text-sm text-red-500">{error}</p>
      )}

      {/* Empty state */}
      {!loading && !error && comments.length === 0 && (
        <p className="py-3 text-center text-sm text-muted-foreground">
          No comments yet. Be the first to comment.
        </p>
      )}

      {/* Comments list */}
      {!loading && !error && comments.length > 0 && (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-2.5">
              {/* Avatar */}
              {comment.userImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={comment.userImage}
                  alt={comment.userName}
                  className="h-9 w-9 shrink-0 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}

              {/* Bubble */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {comment.userName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(comment.createdAt)}
                  </span>
                </div>
                <p className="mt-1 break-words text-base leading-relaxed text-foreground">
                  {comment.text}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input form */}
      {userId ? (
        <form onSubmit={handleSubmit} className="flex items-end gap-2 pt-1">
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setSubmitError(null); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent);
              }
            }}
            placeholder="Write a comment… (Enter to submit)"
            rows={1}
            className={cn(
              "min-h-[44px] max-h-28 flex-1 resize-none overflow-y-auto rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-base",
              "placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30",
            )}
          />
          <button
            type="submit"
            disabled={!text.trim() || submitting}
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
              "bg-primary text-primary-foreground transition-opacity",
              (!text.trim() || submitting) && "cursor-not-allowed opacity-50"
            )}
            title="Post comment"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      ) : (
        <p className="py-2 text-center text-sm text-muted-foreground">
          Sign in to leave a comment.
        </p>
      )}

      {submitError && (
        <p className="text-sm text-red-500">{submitError}</p>
      )}
    </div>
  );
}
