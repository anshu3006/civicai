"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import {
  applyAccessibilityFromStorage,
  bumpFontStep,
  readFontStep,
  readHighContrast,
  readLang,
  toggleHighContrast,
  toggleLang,
  type UiLangCode,
} from "@/lib/accessibility-client";

type AccessibilityToolbarProps = {
  /** Tighter padding for dashboard header */
  compact?: boolean;
  /** Landing navbar (dark) vs dashboard (light) */
  surface?: "dark" | "light";
};

export function AccessibilityToolbar({
  compact,
  surface = "dark",
}: AccessibilityToolbarProps) {
  const [fontStep, setFontStepState] = useState(2);
  const [highContrast, setHighContrastState] = useState(false);
  const [lang, setLangState] = useState<UiLangCode>("en");

  const syncFromDom = useCallback(() => {
    setFontStepState(readFontStep());
    setHighContrastState(readHighContrast());
    setLangState(readLang());
  }, []);

  useEffect(() => {
    applyAccessibilityFromStorage();
    startTransition(() => {
      setFontStepState(readFontStep());
      setHighContrastState(readHighContrast());
      setLangState(readLang());
    });
  }, []);

  const btnDark =
    "font-bold rounded bg-white/5 hover:bg-white/10 transition border border-transparent text-white/90 hover:text-white disabled:opacity-40 disabled:pointer-events-none";
  const btnLight =
    "font-bold rounded bg-muted hover:bg-accent transition border border-border/60 text-foreground disabled:opacity-40 disabled:pointer-events-none";
  const btn = surface === "dark" ? btnDark : btnLight;

  const minFont = fontStep <= 0;
  const maxFont = fontStep >= 4;

  const wrapBorder =
    surface === "dark"
      ? "border-white/10"
      : "border-border/40";

  return (
    <div
      className={
        compact
          ? `flex items-center gap-1.5 border-r ${wrapBorder} pr-3 mr-1`
          : `hidden lg:flex items-center gap-2 border-r ${wrapBorder} pr-4 mr-2`
      }
    >
      <button
        type="button"
        className={`${btn} text-sm px-2.5 py-1`}
        onClick={() => {
          bumpFontStep(-1);
          syncFromDom();
        }}
        disabled={minFont}
        aria-label="Decrease text size"
      >
        A-
      </button>
      <button
        type="button"
        className={`${btn} text-base px-2.5 py-1`}
        onClick={() => {
          bumpFontStep(1);
          syncFromDom();
        }}
        disabled={maxFont}
        aria-label="Increase text size"
      >
        A+
      </button>
      <button
        type="button"
        className={`${btn} text-sm px-2.5 py-1 ${highContrast ? "ring-1 ring-primary bg-white/15" : ""}`}
        onClick={() => {
          toggleHighContrast();
          syncFromDom();
        }}
        aria-pressed={highContrast}
        aria-label="Toggle high contrast"
      >
        High Contrast
      </button>
      <button
        type="button"
        className={`${btn} text-sm px-2.5 py-1 ml-1`}
        onClick={() => {
          toggleLang();
          syncFromDom();
        }}
        aria-label="Toggle display language (English / Hindi)"
        title="Toggles page language attribute (EN ↔ HI). Full translation can be added later."
      >
        {lang === "hi" ? "HI" : "EN"}
      </button>
    </div>
  );
}
