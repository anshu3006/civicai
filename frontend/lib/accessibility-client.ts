const FONT_KEY = "civix-font-step";
const HC_KEY = "civix-high-contrast";
const LANG_KEY = "civix-lang";

const FONT_PX = [13, 14, 16, 17, 18] as const;

function clampStep(n: number): number {
  return Math.min(FONT_PX.length - 1, Math.max(0, n));
}

export function readFontStep(): number {
  if (typeof window === "undefined") return 2;
  const raw = window.sessionStorage.getItem(FONT_KEY);
  if (raw === null) return 2;
  return clampStep(parseInt(raw, 10) || 2);
}

export function readHighContrast(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(HC_KEY) === "1";
}

export type UiLangCode = "en" | "hi";

export function readLang(): UiLangCode {
  if (typeof window === "undefined") return "en";
  const v = window.sessionStorage.getItem(LANG_KEY);
  return v === "hi" ? "hi" : "en";
}

export function applyAccessibilityFromStorage(): void {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  const step = readFontStep();
  root.dataset.fontStep = String(step);
  root.style.fontSize = `${FONT_PX[step]}px`;

  if (readHighContrast()) root.classList.add("high-contrast");
  else root.classList.remove("high-contrast");

  const lang = readLang();
  root.lang = lang === "hi" ? "hi" : "en";
}

export function setFontStep(step: number): void {
  const s = clampStep(step);
  window.sessionStorage.setItem(FONT_KEY, String(s));
  applyAccessibilityFromStorage();
}

export function bumpFontStep(delta: number): void {
  setFontStep(readFontStep() + delta);
}

export function toggleHighContrast(): void {
  const next = !readHighContrast();
  window.sessionStorage.setItem(HC_KEY, next ? "1" : "0");
  applyAccessibilityFromStorage();
}

export function toggleLang(): void {
  const next: UiLangCode = readLang() === "en" ? "hi" : "en";
  window.sessionStorage.setItem(LANG_KEY, next);
  applyAccessibilityFromStorage();
}
