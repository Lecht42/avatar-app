"use client";
import { useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import JsonTextarea from "@/components/JsonTextarea";
import { vectorize } from "@/lib/services";
import type { VectorizeResponse } from "@/lib/types";

const SAMPLE_GRAPH = `{
  "edges": [[0, 1], [1, 2], [2, 3]]
}`;

export default function VectorizeForm() {
  const [text, setText] = useState("Graduate narrative about campus wellbeing and co-creation.");
  const [graphJson, setGraphJson] = useState(SAMPLE_GRAPH);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VectorizeResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"text" | "graph" | "image">("text");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const parsed = graphJson.trim() ? JSON.parse(graphJson) : undefined;
      const response = await vectorize({ text, graph: parsed, imageBase64: image ?? undefined });
      setResult(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Vectorisation failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="panel-stack" onSubmit={submit}>
      <header className="panel-stack__header">
        <div>
          <h1>Vectorize thesis evidence</h1>
          <p>Project qualitative material into vector space to support methodology chapters and reproducibility.</p>
        </div>
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? "Calculating..." : "Compute embeddings"}
        </button>
      </header>

      <div className="panel">
        <h2>Inputs</h2>
        <div className="panel__grid">
          <div className="field">
            <label>Abstract text</label>
            <textarea value={text} onChange={(event) => setText(event.target.value)} rows={5} />
          </div>
          <JsonTextarea label="Graph schema" value={graphJson} onChange={setGraphJson} placeholder={SAMPLE_GRAPH} />
        </div>
        <ImageUpload label="Visual cue" description="Optional storyboard or diagram" value={image} onChange={setImage} />
      </div>

      <div className="panel panel--accent">
        <h2>Embeddings</h2>
        {error && <p className="error-text">{error}</p>}
        {!error && !result && <p className="panel__placeholder">Submit the form to see numeric descriptors.</p>}
        {result && (
          <div className="tabs">
            <div className="tabs__list">
              <button type="button" className={`tabs__trigger ${activeTab === "text" ? "tabs__trigger--active" : ""}`} onClick={() => setActiveTab("text")}>
                Text
              </button>
              <button type="button" className={`tabs__trigger ${activeTab === "graph" ? "tabs__trigger--active" : ""}`} onClick={() => setActiveTab("graph")}>
                Graph
              </button>
              <button type="button" className={`tabs__trigger ${activeTab === "image" ? "tabs__trigger--active" : ""}`} onClick={() => setActiveTab("image")}>
                Image
              </button>
            </div>
            <div className="tabs__content">
              {renderVectors(result, activeTab)}
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

function renderVectors(result: VectorizeResponse, tab: "text" | "graph" | "image") {
  const payload = tab === "text" ? result.text : tab === "graph" ? result.graph : result.image;
  if (!payload || payload.length === 0) {
    return <span>No vectors generated for this modality.</span>;
  }
  return <pre>{JSON.stringify(payload, null, 2)}</pre>;
}
