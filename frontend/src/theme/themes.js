import { shade, contrastText, isLight } from "./colorUtils";

// Every preset here is fully specified by hand — background, surface,
// both shadow colors, both accent roles, and text — so there's no
// algorithmic guessing involved for named presets. This is deliberate:
// letting a resolver *infer* card/shadow colors from 1-3 seed colors is
// what caused the muddled results in the previous (duotone) iteration.
// True neumorphism also needs background === surface: the card is the
// same color as the page, and depth comes only from the light/dark
// shadow pair, never from a color difference.
export const THEME_PRESETS = [
  {
    name: "Soft Gray",
    background: "#E0E5EC",
    surface: "#E0E5EC",
    lightShadow: "#FFFFFF",
    darkShadow: "#A3B1C6",
    primary: "#5B8DEF",
    secondary: "#6C7A89",
    text: "#2F3A4A",
  },
  {
    name: "Warm Sand",
    background: "#ECE7E1",
    surface: "#ECE7E1",
    lightShadow: "#FFFFFF",
    darkShadow: "#C8C1B8",
    primary: "#C27D3B",
    secondary: "#A88B72",
    text: "#4A3F35",
  },
  {
    name: "Ocean Mist",
    background: "#DDE7F0",
    surface: "#DDE7F0",
    lightShadow: "#F9FCFF",
    darkShadow: "#A8B9CC",
    primary: "#4F7DF3",
    secondary: "#6A94D6",
    text: "#243447",
  },
  {
    name: "Mint Fresh",
    background: "#DDEFE6",
    surface: "#DDEFE6",
    lightShadow: "#FFFFFF",
    darkShadow: "#A6C4B5",
    primary: "#2ECC71",
    secondary: "#4CAF8D",
    text: "#2C4A3E",
  },
  {
    name: "Lavender Dream",
    background: "#E8E4F4",
    surface: "#E8E4F4",
    lightShadow: "#FFFFFF",
    darkShadow: "#B7B0CC",
    primary: "#8B5CF6",
    secondary: "#A78BFA",
    text: "#3F355C",
  },
  {
    name: "Peach Glow",
    background: "#F4E6E2",
    surface: "#F4E6E2",
    lightShadow: "#FFFFFF",
    darkShadow: "#D1BBB4",
    primary: "#FF7A59",
    secondary: "#F59E8B",
    text: "#5B4039",
  },
  {
    name: "Midnight Slate",
    background: "#2E3239",
    surface: "#2E3239",
    lightShadow: "#3B414A",
    darkShadow: "#20242A",
    primary: "#4DA3FF",
    secondary: "#7DC4FF",
    text: "#E8EEF7",
  },
];

// Maps one of the fully-specified presets above onto the internal
// variable names ThemeContext writes to :root. Since background ===
// surface for every preset, bg-primary and bg-secondary are always
// identical — the whole point of true neumorphism.
export function presetToResolved(preset) {
  const dark = !isLight(preset.background);
  return {
    bgPrimary: preset.background,
    bgSecondary: preset.surface,
    bgTertiary: dark ? shade(preset.surface, 0.08) : shade(preset.surface, -0.06),
    textPrimary: preset.text,
    textSecondary: preset.secondary,
    textMuted: dark ? shade(preset.text, -0.25) : shade(preset.text, 0.35),
    textOnBg: preset.text,
    textOnBgMuted: dark ? shade(preset.text, -0.25) : shade(preset.text, 0.35),
    shadowLight: preset.lightShadow,
    shadowDark: preset.darkShadow,
    accent: preset.primary,
    secondary: preset.secondary,
    accentBg: `${preset.primary}1f`, // ~12% alpha, hex shorthand
    dark,
  };
}

/**
 * Fallback for the custom color picker, which only collects two colors
 * from the user (accent + background) rather than a fully hand-tuned
 * palette. Derives a plausible single-color neumorphic scheme from just
 * those two — reasonable, but deliberately simpler than the named
 * presets above, which is why picking a named preset gives more
 * precise, tested results than "Custom" will.
 */
export function resolveCustom(accent, background) {
  const dark = !isLight(background);
  const text = contrastText(background);
  return {
    bgPrimary: background,
    bgSecondary: background,
    bgTertiary: dark ? shade(background, 0.08) : shade(background, -0.06),
    textPrimary: text,
    textSecondary: dark ? shade(accent, 0.2) : shade(accent, -0.1),
    textMuted: dark ? shade(text, -0.25) : shade(text, 0.35),
    textOnBg: text,
    textOnBgMuted: dark ? shade(text, -0.25) : shade(text, 0.35),
    shadowLight: dark ? shade(background, 0.12) : "#FFFFFF",
    shadowDark: dark ? shade(background, -0.12) : shade(background, -0.3),
    accent,
    secondary: dark ? shade(accent, 0.2) : shade(accent, -0.1),
    accentBg: `${accent}1f`,
    dark,
  };
}