import { useEffect, useRef, useState } from "react";
import { useTheme } from "../theme/ThemeContext";

export default function ThemeSwitcher() {
  const { presets, activeName, isCustom, customAccent, customBackground, setPreset, setCustom } = useTheme();
  const [open, setOpen] = useState(false);
  const [accent, setAccent] = useState(customAccent);
  const [background, setBackground] = useState(customBackground);
  const popRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (
        popRef.current && !popRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="theme-switcher">
      <button
        ref={btnRef}
        className="theme-switcher-btn"
        onClick={() => setOpen((o) => !o)}
        title="Theme"
      >
        <span className="theme-swatch-dot" />
        <span>{activeName}</span>
      </button>

      {open && (
        <div className="theme-popover" ref={popRef}>
          <div className="theme-popover-title">Presets</div>
          <div className="theme-grid">
            {presets.map((p) => (
              <button
                key={p.name}
                className={`theme-swatch ${!isCustom && activeName === p.name ? "active" : ""}`}
                title={p.name}
                onClick={() => setPreset(p.name)}
                style={{ background: p.background }}
              >
                <span className="theme-swatch-preview">
                  <span className="theme-swatch-chip" style={{ background: p.primary }} />
                  <span className="theme-swatch-chip" style={{ background: p.secondary }} />
                </span>
              </button>
            ))}
          </div>

          <div className="theme-popover-title">Custom</div>
          <div className="theme-custom-row">
            <label className="theme-color-input">
              <input
                type="color"
                value={accent}
                onChange={(e) => {
                  setAccent(e.target.value);
                  setCustom(e.target.value, background);
                }}
              />
              <span>Accent</span>
            </label>
            <label className="theme-color-input">
              <input
                type="color"
                value={background}
                onChange={(e) => {
                  setBackground(e.target.value);
                  setCustom(accent, e.target.value);
                }}
              />
              <span>Background</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}