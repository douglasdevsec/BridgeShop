/**
 * ColorPaletteSelector.tsx
 *
 * Componente de selección de paleta de colores para el panel de Settings.
 *
 * Funcionalidades:
 *  - 10 paletas preestablecidas con nombre y vista previa de chips de color
 *  - Modo "Personalizado": color picker HTML5 nativo para cada variable CSS global
 *  - Live preview: al cambiar cualquier color, inyecta un <style> en el <head>
 *    con las variables CSS de :root sin recargar la página
 *  - Al guardar el formulario, los valores se persisten en Settings (BD)
 *  - Variables soportadas: --color-primary, --color-secondary, --color-muted,
 *    --color-accent, --color-background, --color-foreground, --color-border
 *
 * Fase 5.4.b — Plan BridgeShop
 */

import React, { useEffect, useState } from 'react';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface ColorVars {
  primary: string;
  primaryFg: string;
  secondary: string;
  secondaryFg: string;
  accent: string;
  muted: string;
  mutedFg: string;
  background: string;
  foreground: string;
  border: string;
}

interface Palette {
  name: string;
  emoji: string;
  colors: ColorVars;
}

interface ColorPaletteSelectorProps {
  currentColors?: Partial<ColorVars>;
}

// ── 10 Paletas preestablecidas ────────────────────────────────────────────────
const PRESET_PALETTES: Palette[] = [
  {
    name: 'Azul Océano',
    emoji: '🌊',
    colors: {
      primary: '#1e40af', primaryFg: '#ffffff',
      secondary: '#3b82f6', secondaryFg: '#ffffff',
      accent: '#06b6d4', muted: '#dbeafe', mutedFg: '#1e3a8a',
      background: '#f8faff', foreground: '#0f172a', border: '#bfdbfe'
    }
  },
  {
    name: 'Verde Esmeralda',
    emoji: '🌿',
    colors: {
      primary: '#065f46', primaryFg: '#ffffff',
      secondary: '#10b981', secondaryFg: '#ffffff',
      accent: '#34d399', muted: '#d1fae5', mutedFg: '#064e3b',
      background: '#f0fdf4', foreground: '#052e16', border: '#a7f3d0'
    }
  },
  {
    name: 'Púrpura Real',
    emoji: '💜',
    colors: {
      primary: '#6d28d9', primaryFg: '#ffffff',
      secondary: '#8b5cf6', secondaryFg: '#ffffff',
      accent: '#a78bfa', muted: '#ede9fe', mutedFg: '#4c1d95',
      background: '#faf5ff', foreground: '#1e0a3c', border: '#ddd6fe'
    }
  },
  {
    name: 'Naranja Fuego',
    emoji: '🔥',
    colors: {
      primary: '#c2410c', primaryFg: '#ffffff',
      secondary: '#f97316', secondaryFg: '#ffffff',
      accent: '#fb923c', muted: '#ffedd5', mutedFg: '#7c2d12',
      background: '#fff7ed', foreground: '#1c0a00', border: '#fed7aa'
    }
  },
  {
    name: 'Rosa Pasión',
    emoji: '🌸',
    colors: {
      primary: '#9d174d', primaryFg: '#ffffff',
      secondary: '#ec4899', secondaryFg: '#ffffff',
      accent: '#f472b6', muted: '#fce7f3', mutedFg: '#831843',
      background: '#fdf2f8', foreground: '#1a0010', border: '#f9a8d4'
    }
  },
  {
    name: 'Modo Oscuro',
    emoji: '🌑',
    colors: {
      primary: '#6366f1', primaryFg: '#ffffff',
      secondary: '#4f46e5', secondaryFg: '#ffffff',
      accent: '#818cf8', muted: '#1e1e2e', mutedFg: '#a5b4fc',
      background: '#0f0f1a', foreground: '#e2e8f0', border: '#334155'
    }
  },
  {
    name: 'Gris Platino',
    emoji: '🔘',
    colors: {
      primary: '#374151', primaryFg: '#ffffff',
      secondary: '#6b7280', secondaryFg: '#ffffff',
      accent: '#9ca3af', muted: '#f3f4f6', mutedFg: '#1f2937',
      background: '#f9fafb', foreground: '#111827', border: '#e5e7eb'
    }
  },
  {
    name: 'Turquesa Caribe',
    emoji: '🏖️',
    colors: {
      primary: '#0e7490', primaryFg: '#ffffff',
      secondary: '#06b6d4', secondaryFg: '#ffffff',
      accent: '#22d3ee', muted: '#cffafe', mutedFg: '#164e63',
      background: '#f0fdff', foreground: '#083344', border: '#a5f3fc'
    }
  },
  {
    name: 'Tierra Cálida',
    emoji: '🌄',
    colors: {
      primary: '#92400e', primaryFg: '#ffffff',
      secondary: '#b45309', secondaryFg: '#ffffff',
      accent: '#d97706', muted: '#fef3c7', mutedFg: '#78350f',
      background: '#fffbeb', foreground: '#1c1100', border: '#fde68a'
    }
  },
  {
    name: 'Rojo Burdeos',
    emoji: '🍷',
    colors: {
      primary: '#9f1239', primaryFg: '#ffffff',
      secondary: '#e11d48', secondaryFg: '#ffffff',
      accent: '#fb7185', muted: '#ffe4e6', mutedFg: '#881337',
      background: '#fff1f2', foreground: '#1c0008', border: '#fecdd3'
    }
  }
];

// ── Labels de variables ───────────────────────────────────────────────────────
const COLOR_LABELS: Record<keyof ColorVars, string> = {
  primary: 'Color Primary',
  primaryFg: 'Texto sobre Primary',
  secondary: 'Color Secondary',
  secondaryFg: 'Texto sobre Secondary',
  accent: 'Color Accent',
  muted: 'Fondo Muted',
  mutedFg: 'Texto Muted',
  background: 'Fondo General',
  foreground: 'Texto General',
  border: 'Bordes'
};

// ── Mapeo a variables CSS ─────────────────────────────────────────────────────
const CSS_VAR_MAP: Record<keyof ColorVars, string> = {
  primary: '--color-primary',
  primaryFg: '--color-primary-foreground',
  secondary: '--color-secondary',
  secondaryFg: '--color-secondary-foreground',
  accent: '--color-accent',
  muted: '--color-muted',
  mutedFg: '--color-muted-foreground',
  background: '--color-background',
  foreground: '--color-foreground',
  border: '--color-border'
};

// ── Default ───────────────────────────────────────────────────────────────────
const DEFAULT_COLORS: ColorVars = PRESET_PALETTES[0].colors;

// ── Inyectar CSS variables en :root (live preview) ────────────────────────────
function injectCssVars(colors: ColorVars) {
  const styleId = 'bridgeshop-theme-preview';
  let el = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = styleId;
    document.head.appendChild(el);
  }
  const vars = (Object.keys(colors) as (keyof ColorVars)[])
    .map((k) => `  ${CSS_VAR_MAP[k]}: ${colors[k]};`)
    .join('\n');
  el.textContent = `:root {\n${vars}\n}`;
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function ColorPaletteSelector({
  currentColors = {}
}: ColorPaletteSelectorProps) {
  const [colors, setColors] = useState<ColorVars>({
    ...DEFAULT_COLORS,
    ...currentColors
  });
  const [mode, setMode] = useState<'presets' | 'custom'>('presets');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Aplicar colores al montar si hay colores guardados
  useEffect(() => {
    injectCssVars(colors);
  }, []);

  // ── Actualizar un color individual ──────────────────────────────────────────
  const updateColor = (key: keyof ColorVars, value: string) => {
    const next = { ...colors, [key]: value };
    setColors(next);
    setSelectedPreset(null);
    injectCssVars(next);
  };

  // ── Seleccionar paleta preestablecida ─────────────────────────────────────
  const applyPalette = (palette: Palette) => {
    setColors(palette.colors);
    setSelectedPreset(palette.name);
    injectCssVars(palette.colors);
  };

  return (
    <div className="space-y-5">
      {/* Inputs hidden para persistir en DB con el form */}
      {(Object.keys(colors) as (keyof ColorVars)[]).map((k) => (
        <input
          key={k}
          type="hidden"
          name={`storeColor_${k}`}
          value={colors[k]}
        />
      ))}

      {/* ── Toggle Presets / Personalizado ── */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('presets')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'presets'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          🎨 Paletas Preestablecidas
        </button>
        <button
          type="button"
          onClick={() => setMode('custom')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'custom'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          🖌️ Personalizar Colores
        </button>
      </div>

      {/* ── Vista Previa de Color Actual ── */}
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(colors) as (keyof ColorVars)[])
          .filter((k) => !k.endsWith('Fg'))
          .map((k) => (
            <div
              key={k}
              className="flex flex-col items-center gap-1"
              title={COLOR_LABELS[k]}
            >
              <div
                className="w-8 h-8 rounded-full border border-border shadow-sm"
                style={{ backgroundColor: colors[k] }}
              />
              <span className="text-[10px] text-muted-foreground leading-none">
                {COLOR_LABELS[k].split(' ')[1] || COLOR_LABELS[k]}
              </span>
            </div>
          ))}
      </div>

      {/* ── Modo Paletas Preestablecidas ── */}
      {mode === 'presets' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {PRESET_PALETTES.map((palette) => (
            <button
              key={palette.name}
              type="button"
              onClick={() => applyPalette(palette)}
              className={`p-3 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                selectedPreset === palette.name
                  ? 'border-primary shadow-md scale-105'
                  : 'border-border hover:border-primary/50'
              }`}
              title={palette.name}
            >
              {/* Chips de color */}
              <div className="flex gap-0.5 mb-2">
                {[palette.colors.primary, palette.colors.secondary, palette.colors.accent, palette.colors.muted].map(
                  (c, i) => (
                    <div
                      key={i}
                      className="h-5 flex-1 rounded-sm"
                      style={{ backgroundColor: c }}
                    />
                  )
                )}
              </div>
              <p className="text-xs font-medium truncate">
                {palette.emoji} {palette.name}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* ── Modo Personalizado ── */}
      {mode === 'custom' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.keys(colors) as (keyof ColorVars)[]).map((key) => (
            <div key={key} className="flex items-center gap-3">
              {/* Color picker nativo */}
              <input
                type="color"
                value={colors[key]}
                onChange={(e) => updateColor(key, e.target.value)}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer p-0.5 bg-background"
                aria-label={`Seleccionar ${COLOR_LABELS[key]}`}
                title={COLOR_LABELS[key]}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {COLOR_LABELS[key]}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {colors[key]}
                </p>
              </div>
              {/* Input de texto para ingresar hex manual */}
              <input
                type="text"
                value={colors[key]}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) updateColor(key, v);
                }}
                className="w-24 border border-border rounded-md px-2 py-1 text-xs font-mono bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={7}
                aria-label={`Valor hex de ${COLOR_LABELS[key]}`}
              />
            </div>
          ))}
        </div>
      )}

      <p className="text-muted-foreground text-xs">
        Los cambios de color se aplican en tiempo real como vista previa. Haz clic en{' '}
        <strong>Guardar</strong> para persistirlos en la tienda.
      </p>
    </div>
  );
}
