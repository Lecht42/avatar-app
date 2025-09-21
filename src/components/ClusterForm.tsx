"use client";
import { useState } from "react";
import JsonTextarea from "@/components/JsonTextarea";
import { cluster } from "@/lib/services";
import type { ClusterResponse } from "@/lib/types";

const SAMPLE = `[
  [0.12, 0.34, 0.5],
  [0.18, 0.4, 0.62],
  [1.1, 0.8, 0.4],
  [1.05, 0.9, 0.45]
]`;

export default function ClusterForm() {
  const [vectorsText, setVectorsText] = useState(SAMPLE);
  const [minClusterSize, setMinClusterSize] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClusterResponse | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const parsed = JSON.parse(vectorsText);
      if (!Array.isArray(parsed) || !parsed.every((row) => Array.isArray(row))) {
        throw new Error("Expected number[][] structure");
      }
      const response = await cluster({ vectors: parsed, minClusterSize });
      setResult(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Clustering failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="panel-stack" onSubmit={submit}>
      <header className="panel-stack__header">
        <div>
          <h1>Cluster embeddings offline</h1>
          <p>Group experimental vectors to justify methodology chapters in the thesis.</p>
        </div>
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? "Evaluating..." : "Run clustering"}
        </button>
      </header>

      <div className="panel">
        <h2>Configuration</h2>
        <div className="panel__grid">
          <JsonTextarea value={vectorsText} onChange={setVectorsText} label="Vectors" placeholder={SAMPLE} />
          <div className="field">
            <label>Minimum cluster size</label>
            <input type="number" value={minClusterSize} onChange={(event) => setMinClusterSize(Number(event.target.value) || 1)} />
          </div>
        </div>
      </div>

      <div className="panel panel--accent">
        <h2>Results</h2>
        {error && <p className="error-text">{error}</p>}
        {!error && !result && <p className="panel__placeholder">Provide vectors to see cluster assignments and metrics.</p>}
        {result && (
          <div className="cluster-results">
            <section>
              <h3>Metrics</h3>
              <div className="metrics-grid">
                <Metric label="Silhouette" value={result.metrics.silhouette} />
                <Metric label="Davies-Bouldin" value={result.metrics.daviesBouldin} inverse />
                <Metric label="Calinski-Harabasz" value={result.metrics.calinskiHarabasz} />
              </div>
            </section>
            <section>
              <h3>Clusters</h3>
              <table>
                <thead>
                  <tr>
                    <th>Label</th>
                    <th>Members</th>
                  </tr>
                </thead>
                <tbody>
                  {result.clusters.map((cluster) => (
                    <tr key={cluster.id}>
                      <td>{cluster.id}</td>
                      <td>{cluster.size}</td>
                    </tr>
                  ))}
                  <tr>
                    <td>Noise</td>
                    <td>{result.noiseCount}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>
        )}
      </div>
    </form>
  );
}

type MetricProps = {
  label: string;
  value: number | null;
  inverse?: boolean;
};

function Metric({ label, value, inverse }: MetricProps) {
  if (value === null) {
    return (
      <div className="metric">
        <span>{label}</span>
        <strong>n/a</strong>
        <div className="metric__bar">
          <div style={{ width: "8%" }} />
        </div>
      </div>
    );
  }
  const normalized = inverse ? 1 / (1 + value) : value;
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value.toFixed(3)}</strong>
      <div className="metric__bar">
        <div style={{ width: `${Math.max(0, Math.min(1, normalized)) * 100}%` }} />
      </div>
    </div>
  );
}
