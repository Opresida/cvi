import { useEffect, useState, useCallback } from "react";

export type FontSize = "normal" | "large" | "xlarge";
export type Contrast = "normal" | "high";
export type MotionPref = "auto" | "off";
export type LinksPref = "default" | "underlined";

export interface AccessibilitySettings {
  fontSize: FontSize;
  contrast: Contrast;
  motion: MotionPref;
  links: LinksPref;
}

const DEFAULTS: AccessibilitySettings = {
  fontSize: "normal",
  contrast: "normal",
  motion: "auto",
  links: "default",
};

const STORAGE_KEY = "cvi-a11y-settings";

function readSettings(): AccessibilitySettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

function applySettings(s: AccessibilitySettings) {
  const html = document.documentElement;
  html.setAttribute("data-font-size", s.fontSize);
  html.setAttribute("data-contrast", s.contrast);
  html.setAttribute("data-motion", s.motion);
  html.setAttribute("data-links", s.links);
}

export function useAccessibilitySettings() {
  const [settings, setSettings] = useState<AccessibilitySettings>(readSettings);

  useEffect(() => {
    applySettings(settings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings]);

  const update = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => setSettings(DEFAULTS), []);

  return { settings, update, reset };
}
