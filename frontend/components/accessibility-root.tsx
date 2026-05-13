"use client";

import { useEffect } from "react";
import { applyAccessibilityFromStorage } from "@/lib/accessibility-client";

/** Re-applies font / contrast / lang from sessionStorage on load and after client navigations. */
export function AccessibilityRoot() {
  useEffect(() => {
    applyAccessibilityFromStorage();
  }, []);

  return null;
}
