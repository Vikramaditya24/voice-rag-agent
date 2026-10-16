import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { THEME_PRESETS, presetToResolved, resolveCustom } from "./themes";

const ThemeContext = createContext(null);
const STORAGE_KEY = "nd-voice-agent-theme";

function applyToDocument(resolved) {
  const root = document.documentElement.style;
  root.setProperty("--bg-primary", resolved.bgPrimary);
  root.setProperty("--bg-secondary", resolved.bgSecondary);
  root.setProperty("--bg-tertiary", resolved.bgTertiary);
  root.setProperty("--text-primary", resolved.textPrimary);
  root.setProperty("--text-secondary", resolved.textSecondary);
  root.setProperty("--text-muted", resolved.textMuted);
  root.setProperty("--text-on-bg", resolved.textOnBg);
  root.setProperty("--text-on-bg-muted", resolved.textOnBgMuted);
  root.setProperty("--shadow-light", resolved.shadowLight);
  root.setProperty("--shadow-dark", resolved.shadowDark);
  root.setProperty("--accent", resolved.accent);
  root.setProperty("--secondary", resolved.secondary);
  root.setProperty("--accent-bg", resolved.accentBg);
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore malformed storage */
  }
  return null;
}

function resolveSelection(selection) {
  if (selection.kind === "custom") {
    return resolveCustom(selection.accent, selection.background);
  }
  const preset = THEME_PRESETS.find((p) => p.name === selection.presetName) || THEME_PRESETS[0];
  return presetToResolved(preset);
}

export function ThemeProvider({ children }) {
  const saved = loadSaved();
  const [selection, setSelection] = useState(
    saved || { kind: "preset", presetName: "Soft Gray" }
  );

  const resolved = useMemo(() => resolveSelection(selection), [selection]);

  useEffect(() => {
    applyToDocument(resolved);
  }, [resolved]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
    } catch {
      /* storage unavailable — non-fatal */
    }
  }, [selection]);

  const setPreset = (name) => setSelection({ kind: "preset", presetName: name });
  const setCustom = (accent, background) => setSelection({ kind: "custom", accent, background });

  const value = {
    presets: THEME_PRESETS,
    activeName: selection.kind === "preset" ? selection.presetName : "Custom",
    isCustom: selection.kind === "custom",
    customAccent: selection.kind === "custom" ? selection.accent : "#5B8DEF",
    customBackground: selection.kind === "custom" ? selection.background : "#E0E5EC",
    resolved,
    setPreset,
    setCustom,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}