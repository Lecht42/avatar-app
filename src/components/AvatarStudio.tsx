"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import { checkHealth, generateAvatar, getUiConfig } from "@/lib/services";
import type { StylePreset, UiConfig } from "@/lib/types";

const ACTIVITY_LIMIT = 60;

type AvatarResult = {
  id: string;
  src: string;
  createdAt: string;
  styleId?: string;
};

type ActivityItem = {
  id: string;
  level: "info" | "error";
  message: string;
  timestamp: string;
};

export function AvatarStudio() {
  const controllerRef = useRef<AbortController | null>(null);
  const [uiConfig, setUiConfig] = useState<UiConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [styleId, setStyleId] = useState<string>("");
  const [modelId, setModelId] = useState<string>("");
  const [resolutionId, setResolutionId] = useState<string>("");
  const [steps, setSteps] = useState(28);
  const [guidance, setGuidance] = useState(7);
  const [seed, setSeed] = useState<number | null>(null);
  const [palette, setPalette] = useState<string>("");
  const [accessories, setAccessories] = useState<string>("");
  const [background, setBackground] = useState<string>("");
  const [autoClusterStyle, setAutoClusterStyle] = useState(true);
  const [fullName, setFullName] = useState("Oksana Kovalenko");
  const [bio, setBio] = useState("Graduate researcher exploring community storytelling with AI visuals.");
  const [socialUrl, setSocialUrl] = useState("https://t.me/thesis_lab");
  const [avatarPhoto, setAvatarPhoto] = useState<string | null>(null);
  const [results, setResults] = useState<AvatarResult[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [healthStatus, setHealthStatus] = useState<string>("Idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const response = await getUiConfig();
      setUiConfig(response);
      setStyleId(response.defaults.styleId);
      setModelId(response.defaults.modelId);
      setResolutionId(response.defaults.resolutionId);
      setSteps(response.defaults.steps);
      setGuidance(response.defaults.guidance);
    })().catch((err) => {
      setConfigError(err instanceof Error ? err.message : String(err));
    });
  }, []);

  const resolution = useMemo(() => uiConfig?.resolutions.find((item) => item.id === resolutionId), [uiConfig, resolutionId]);
  const stylePreset = useMemo(() => uiConfig?.styles.find((item) => item.id === styleId), [uiConfig, styleId]);
  const width = resolution?.width ?? 768;
  const height = resolution?.height ?? 768;

  const onCheckHealth = async () => {
    const res = await checkHealth();
    setHealthStatus(res.ok ? `Self-check OK • ${res.ms}ms` : `Offline fallback • ${res.ms}ms`);
  };

  const onGenerate = async () => {
    if (!uiConfig) return;
    if (!bio.trim() || !fullName.trim()) {
      setError("Please describe the persona to enrich the thesis archive.");
      return;
    }
    setError(null);
    setLoading(true);
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    try {
      const response = await generateAvatar({
        prompt: composePrompt({ fullName, bio, socialUrl, style: stylePreset, palette, accessories, background }),
        seed,
        steps,
        guidance,
        model: modelId,
        width,
        height,
        styleId,
        palette,
        accessories,
        background,
      });
      const item: AvatarResult = {
        id: randomId(),
        src: response.images[0],
        styleId,
        createdAt: new Date().toISOString(),
      };
      setResults((prev) => [item, ...prev].slice(0, 12));
      logActivity({ level: "info", message: `Generated storyboard portrait (${stylePreset?.label ?? "Custom"})` });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown generation issue";
      setError(message);
      logActivity({ level: "error", message });
    } finally {
      setLoading(false);
    }
  };

  const onAnalyze = () => {
    if (!socialUrl.trim()) {
      logActivity({ level: "error", message: "Provide a public profile link for context." });
      return;
    }
    logActivity({ level: "info", message: `Annotated social footprint for ${socialUrl}` });
  };

  const logActivity = (item: Omit<ActivityItem, "id" | "timestamp">) => {
    setActivity((prev) => [
      { id: randomId(), timestamp: new Date().toISOString(), ...item },
      ...prev,
    ].slice(0, ACTIVITY_LIMIT));
  };

  if (configError) {
    return (
      <div className="studio-fallback">
        <h1>Avatar Studio</h1>
        <p className="studio-fallback__error">Unable to initialise presets: {configError}</p>
      </div>
    );
  }

  if (!uiConfig) {
    return (
      <div className="studio-fallback">
        <h1>Avatar Studio</h1>
        <p>Loading thesis presets…</p>
      </div>
    );
  }

  return (
    <div className="studio">
      <header className="studio__header">
        <div className="studio__title">
          <div className="studio__badge">Master Thesis Lab</div>
          <h1>Craft avatars tuned to your research narrative</h1>
          <p>
            This studio curates visual personas for a magistracy diploma project. All computation runs locally so the
            narrative remains reproducible even without backend infrastructure.
          </p>
        </div>
        <div className="studio__status">
          <button type="button" className="ghost-button" onClick={onCheckHealth}>
            Run self-check
          </button>
          <span className="studio__health">{healthStatus}</span>
        </div>
      </header>

      <div className="studio__body">
        <section className="panel">
          <h2>Persona brief</h2>
          <div className="panel__grid">
            <div className="field">
              <label>Full name</label>
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Research participant" />
            </div>
            <div className="field">
              <label>Short bio</label>
              <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={4} />
            </div>
            <div className="field">
              <label>Social profile</label>
              <div className="field__inline">
                <input value={socialUrl} onChange={(event) => setSocialUrl(event.target.value)} placeholder="https://" />
                <button type="button" className="ghost-button" onClick={onAnalyze}>
                  Analyse
                </button>
              </div>
              <p className="field__hint">Used only for inspiration in the thesis appendix.</p>
            </div>
            <ImageUpload label="Reference image" description="Optional storyboard sketch" value={avatarPhoto} onChange={setAvatarPhoto} />
          </div>
        </section>

        <section className="panel">
          <h2>Style & resolution</h2>
          <div className="panel__grid">
            <div className="field">
              <label>Style preset</label>
              <select value={styleId} onChange={(event) => setStyleId(event.target.value)}>
                {uiConfig.styles.map((style) => (
                  <option key={style.id} value={style.id}>
                    {style.label}
                  </option>
                ))}
              </select>
              {stylePreset && <p className="field__hint">{stylePreset.description}</p>}
            </div>
            <div className="field">
              <label>Model</label>
              <select value={modelId} onChange={(event) => setModelId(event.target.value)}>
                {uiConfig.models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Resolution</label>
              <select value={resolutionId} onChange={(event) => setResolutionId(event.target.value)}>
                {uiConfig.resolutions.map((resolution) => (
                  <option key={resolution.id} value={resolution.id}>
                    {resolution.width}?{resolution.height} ({resolution.aspect})
                  </option>
                ))}
              </select>
            </div>
            <div className="field field--checkbox">
              <input id="auto-style" type="checkbox" checked={autoClusterStyle} onChange={(event) => setAutoClusterStyle(event.target.checked)} />
              <label htmlFor="auto-style">Keep stylistic balance for the thesis gallery</label>
            </div>
          </div>
        </section>

        <section className="panel">
          <h2>Generation settings</h2>
          <div className="tuning">
            <SliderField label="Detail steps" value={steps} min={12} max={80} onChange={setSteps} />
            <SliderField label="Guidance" value={guidance} min={2} max={18} onChange={setGuidance} />
            <NumberField label="Seed" value={seed} onChange={setSeed} placeholder="Random" />
          </div>
          <div className="panel__grid panel__grid--compact">
            <TextField label="Palette keywords" value={palette} onChange={setPalette} placeholder="periwinkle glow, warm amber" />
            <TextField label="Accessories" value={accessories} onChange={setAccessories} placeholder="studio headset, notebook" />
            <TextField label="Background" value={background} onChange={setBackground} placeholder="university observatory" />
          </div>
        </section>

        <section className="panel">
          <h2>Render portrait</h2>
          <div className="generate-actions">
            <label className="field field--checkbox">
              <input type="checkbox" checked={Boolean(seed)} onChange={(event) => setSeed(event.target.checked ? 42 : null)} />
              <span>Lock deterministic seed (42) for reproducibility chapter.</span>
            </label>
            <button type="button" className="primary-button" onClick={onGenerate} disabled={loading}>
              {loading ? "Synthesizing..." : "Generate thesis avatar"}
            </button>
            {error && <p className="error-text">{error}</p>}
          </div>
        </section>

        <div className="studio__split">
          <section className="panel panel--accent">
            <h2>Preview gallery</h2>
            {results.length === 0 ? (
              <div className="preview__placeholder">Generated portraits will appear here for the diploma annex.</div>
            ) : (
              <div className="preview__grid">
                {results.map((item) => (
                  <figure key={item.id} className="preview__item">
                    <img src={item.src} alt={item.id} />
                    <figcaption>{item.styleId ?? "custom"}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </section>

          <section className="panel">
            <h2>Research log</h2>
            <ul className="activity">
              {activity.length === 0 ? (
                <li className="activity__item activity__item--empty">No steps recorded yet.</li>
              ) : (
                activity.map((item) => (
                  <li key={item.id} className={`activity__item activity__item--${item.level}`}>
                    <span className="activity__time">{formatTime(item.timestamp)}</span>
                    <span>{item.message}</span>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function SliderField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <div className="slider-field">
      <div className="slider-field__label">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </div>
  );
}

function NumberField({ label, value, onChange, placeholder }: { label: string; value: number | null; onChange: (value: number | null) => void; placeholder?: string }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        type="number"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(event) => {
          const raw = event.target.value;
          onChange(raw === "" ? null : Number(raw));
        }}
      />
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  );
}

function composePrompt({ fullName, bio, socialUrl, style, palette, accessories, background }: { fullName: string; bio: string; socialUrl: string; style?: StylePreset; palette: string; accessories: string; background: string }) {
  const fragments = [fullName ? `portrait of ${fullName}` : "graduate protagonist", bio];
  if (style?.prompt) fragments.push(style.prompt);
  if (palette) fragments.push(`palette ${palette}`);
  if (accessories) fragments.push(`accessories ${accessories}`);
  if (background) fragments.push(`background ${background}`);
  if (socialUrl) fragments.push(`inspired by ${socialUrl}`);
  return fragments.join(", ");
}

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

function formatTime(value: string) {
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
