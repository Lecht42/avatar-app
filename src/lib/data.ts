import type { ModelPreset, ResolutionPreset, StylePreset, UiConfig } from "./types";

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "realistic-soft-light",
    label: "Realistic Soft Light",
    description: "Balanced portrait aesthetics for thesis personas with gentle studio lighting.",
    accent: "#E8D4B0",
    prompt: "soft academic portrait lighting, photorealistic textures, medium close-up",
  },
  {
    id: "neo-anime-glow",
    label: "Neo Anime Glow",
    description: "Expressive outlines and neon gradients for conceptual storyboard figures.",
    accent: "#A855F7",
    prompt: "anime illustration, glowing rim light, precise ink, futuristic campus background",
  },
  {
    id: "painterly-pastel",
    label: "Painterly Pastel",
    description: "Hand-painted look for narrative diagrams and reflective moments.",
    accent: "#F9A8D4",
    prompt: "pastel gouache, visible brush strokes, warm depth of field, scholarly atmosphere",
  },
];

export const RESOLUTIONS: ResolutionPreset[] = [
  { id: "square-512", width: 512, height: 512, aspect: "1:1" },
  { id: "portrait-768x960", width: 768, height: 960, aspect: "4:5" },
  { id: "portrait-1024x1280", width: 1024, height: 1280, aspect: "4:5" },
];

export const MODELS: ModelPreset[] = [
  { id: "aurora-v1", label: "Aurora V1", specialty: "Versatile diffusion tuned for academic characters." },
  { id: "inkwave-v2", label: "Inkwave V2", specialty: "Stylised ink renderings suited for storyboard frames." },
  { id: "velvet-paint", label: "Velvet Paint", specialty: "Pastel mixes optimised for empathetic thesis visuals." },
];

export function buildUiConfig(): UiConfig {
  return {
    styles: STYLE_PRESETS,
    resolutions: RESOLUTIONS,
    models: MODELS,
    defaults: {
      styleId: STYLE_PRESETS[0].id,
      resolutionId: RESOLUTIONS[0].id,
      modelId: MODELS[0].id,
      steps: 28,
      guidance: 7,
    },
    fetchedAt: new Date().toISOString(),
    fallback: true,
  };
}

export const DEFAULT_HEALTH = { ok: true, status: 200, ms: 42 } as const;

