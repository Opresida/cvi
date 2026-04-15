import { useCallback, useEffect, useState } from "react";

/**
 * Gerenciamento de consentimento de cookies — LGPD (Lei 13.709/2018).
 *
 * Categorias:
 *  - necessary: sempre ativas (não podem ser desligadas — são essenciais).
 *  - analytics: métricas de uso (Google Analytics, etc).
 *  - marketing: rastreamento para remarketing/ads.
 *
 * Persistência: localStorage.
 * Versionamento: bump STORAGE_VERSION para forçar re-consentimento quando a
 * política mudar (ex: adição de novo tracker).
 */

export const STORAGE_KEY = "cvi.cookie-consent";
export const STORAGE_VERSION = 1;

export type CookieCategory = "necessary" | "analytics" | "marketing";

export interface CookiePreferences {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
}

export interface StoredConsent {
  version: number;
  preferences: CookiePreferences;
  decidedAt: string; // ISO 8601
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

function readStored(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed.version !== STORAGE_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(preferences: CookiePreferences): StoredConsent {
  const payload: StoredConsent = {
    version: STORAGE_VERSION,
    preferences,
    decidedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    // Dispatch para outras abas/componentes reagirem
    window.dispatchEvent(new CustomEvent("cvi:consent-change", { detail: payload }));
  } catch {
    /* storage indisponível — segue sem persistência */
  }
  return payload;
}

export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);
  const [decided, setDecided] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Carrega do storage no mount
  useEffect(() => {
    const stored = readStored();
    if (stored) {
      setPreferences(stored.preferences);
      setDecided(true);
    }
    setLoaded(true);
  }, []);

  // Sincroniza entre abas
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const stored = readStored();
      if (stored) {
        setPreferences(stored.preferences);
        setDecided(true);
      } else {
        setPreferences(DEFAULT_PREFERENCES);
        setDecided(false);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const acceptAll = useCallback(() => {
    const next: CookiePreferences = { necessary: true, analytics: true, marketing: true };
    writeStored(next);
    setPreferences(next);
    setDecided(true);
  }, []);

  const rejectOptional = useCallback(() => {
    const next: CookiePreferences = { necessary: true, analytics: false, marketing: false };
    writeStored(next);
    setPreferences(next);
    setDecided(true);
  }, []);

  const save = useCallback((custom: Partial<Omit<CookiePreferences, "necessary">>) => {
    const next: CookiePreferences = {
      necessary: true,
      analytics: custom.analytics ?? preferences.analytics,
      marketing: custom.marketing ?? preferences.marketing,
    };
    writeStored(next);
    setPreferences(next);
    setDecided(true);
  }, [preferences]);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent("cvi:consent-change", { detail: null }));
    } catch {
      /* ok */
    }
    setPreferences(DEFAULT_PREFERENCES);
    setDecided(false);
  }, []);

  return {
    preferences,
    decided,
    loaded,
    acceptAll,
    rejectOptional,
    save,
    reset,
  };
}
