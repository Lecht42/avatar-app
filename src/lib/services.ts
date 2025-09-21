import { buildUiConfig, DEFAULT_HEALTH, STYLE_PRESETS } from "./data";
import type {
  ClusterRequest,
  ClusterResponse,
  GenerateAvatarRequest,
  GenerateAvatarResponse,
  VectorizeRequest,
  VectorizeResponse,
  UiConfig,
} from "./types";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getUiConfig(): Promise<UiConfig> {
  await sleep(120);
  return buildUiConfig();
}

export async function getStyles() {
  await sleep(80);
  return STYLE_PRESETS;
}

export async function checkHealth() {
  await sleep(60);
  return DEFAULT_HEALTH;
}

export async function vectorize(req: VectorizeRequest): Promise<VectorizeResponse> {
  await sleep(140);
  const response: VectorizeResponse = {};
  if (req.text) response.text = [createTextEmbedding(req.text)];
  if (req.graph) response.graph = [createGraphEmbedding(req.graph)];
  if (req.imageBase64) response.image = [createImageEmbedding(req.imageBase64)];
  return response;
}

export async function cluster(req: ClusterRequest): Promise<ClusterResponse> {
  await sleep(150);
  const vectors = req.vectors.filter((vector): vector is number[] => Array.isArray(vector) && vector.length > 0);
  if (vectors.length === 0) {
    return {
      labels: [],
      clusters: [],
      noiseCount: 0,
      metrics: { silhouette: null, daviesBouldin: null, calinskiHarabasz: null },
    };
  }

  const centroids = computeCentroids(vectors);
  const labels = vectors.map((vector) => labelByNearestCentroid(vector, centroids));
  const clusterMap = new Map<number, number[]>();
  labels.forEach((label, index) => {
    const bucket = clusterMap.get(label) ?? [];
    bucket.push(index);
    clusterMap.set(label, bucket);
  });

  const clusters = Array.from(clusterMap.entries()).map(([id, members]) => ({ id, size: members.length }));
  const silhouette = estimateSilhouette(vectors, labels);

  return {
    labels,
    clusters,
    noiseCount: 0,
    metrics: {
      silhouette,
      daviesBouldin: silhouette !== null ? Number((2 - silhouette).toFixed(3)) : null,
      calinskiHarabasz: silhouette !== null ? Number((silhouette * 120).toFixed(1)) : null,
    },
  };
}

export async function generateAvatar(req: GenerateAvatarRequest): Promise<GenerateAvatarResponse> {
  await sleep(220);
  const style = STYLE_PRESETS.find((item) => item.id === req.styleId);
  const title = style ? style.label : "Custom thesis frame";
  const subtitle = req.prompt.slice(0, 72) || "Seminar reflection";
  const svg = createSvgPoster({
    title,
    subtitle,
    width: req.width,
    height: req.height,
    accent: style?.accent ?? "#65c6f0",
    palette: req.palette,
  });
  return { images: [svg] };
}

function createTextEmbedding(text: string): number[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [0, 0, 0, 0, 0];
  const words = normalized.split(" ");
  const totalChars = normalized.length;
  const vowels = (normalized.match(/[aeiouаеёиоуыэюя]/gi) || []).length;
  const consonants = (normalized.match(/[bcdfghjklmnpqrstvwxyzбвгґджзклмнпрстфхцчшщ]/gi) || []).length;
  return [totalChars / 120, words.length / 18, vowels / 60, consonants / 60, (vowels - consonants) / 80];
}

function createGraphEmbedding(graph: unknown): number[] {
  if (Array.isArray(graph)) {
    const nodes = new Set<number>();
    graph.forEach((edge) => {
      if (Array.isArray(edge) && edge.length === 2) {
        nodes.add(Number(edge[0]));
        nodes.add(Number(edge[1]));
      }
    });
    const edgeCount = graph.length;
    const nodeCount = nodes.size;
    return [nodeCount / 12, edgeCount / 20, nodeCount ? edgeCount / nodeCount : 0, Math.min(1, edgeCount / 40), 0.12];
  }
  if (isGraphObject(graph)) {
    return createGraphEmbedding(graph.edges);
  }
  return [0.05, 0.05, 0.05, 0.05, 0.05];
}

function createImageEmbedding(imageBase64: string): number[] {
  try {
    const [, data] = imageBase64.split(",");
    if (!data) return [0, 0, 0, 0, 0];
    const buffer = Buffer.from(data, "base64");
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) sum += buffer[i];
    const average = sum / buffer.length;
    return [average / 255, (average % 100) / 100, buffer.length / 2048, 0.2, 0.18];
  } catch {
    return [0, 0, 0, 0, 0];
  }
}

function computeCentroids(vectors: number[][]) {
  const even = vectors.filter((_, index) => index % 2 === 0);
  const odd = vectors.filter((_, index) => index % 2 === 1);
  return [averageVector(even), averageVector(odd.length ? odd : even)];
}

function averageVector(vectors: number[][]) {
  if (vectors.length === 0) return [0, 0, 0, 0, 0];
  const dimension = Math.max(...vectors.map((vector) => vector.length));
  const sums = Array(dimension).fill(0);
  vectors.forEach((vector) => {
    vector.forEach((value, index) => {
      sums[index] += value;
    });
  });
  return sums.map((value) => value / vectors.length);
}

function labelByNearestCentroid(vector: number[], centroids: number[][]) {
  let best = 0;
  let min = Number.POSITIVE_INFINITY;
  centroids.forEach((centroid, index) => {
    const distance = euclidean(vector, centroid);
    if (distance < min) {
      min = distance;
      best = index;
    }
  });
  return best;
}

function euclidean(a: number[], b: number[]) {
  const dimension = Math.max(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < dimension; i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

function estimateSilhouette(vectors: number[][], labels: number[]) {
  if (vectors.length < 2) return null;
  const centroid = averageVector(vectors);
  const avgDist = vectors.reduce((acc, vector) => acc + euclidean(vector, centroid), 0) / vectors.length;
  const distinctLabels = new Set(labels).size;
  const score = Math.max(0.1, Math.min(0.95, distinctLabels / 3 + 1 / (1 + avgDist)));
  return Number(score.toFixed(3));
}

function createSvgPoster({
  title,
  subtitle,
  width,
  height,
  accent,
  palette,
}: {
  title: string;
  subtitle: string;
  width: number;
  height: number;
  accent: string;
  palette?: string;
}) {
  const safePalette = palette ? palette.replace(/[^a-zA-Z0-9,#\s-]/g, "") : "sky blue, periwinkle";
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.95" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="100" height="100" fill="url(#bg)" rx="12" />
    <text x="50" y="42" font-size="9" text-anchor="middle" font-family="Segoe UI" fill="#1f2433" font-weight="700">${escapeXml(title)}</text>
    <text x="50" y="54" font-size="4" text-anchor="middle" font-family="Segoe UI" fill="#1f2433">${escapeXml(subtitle)}</text>
    <text x="50" y="64" font-size="3.2" text-anchor="middle" font-family="Segoe UI" fill="#1f2433">Palette: ${escapeXml(safePalette)}</text>
    <text x="50" y="74" font-size="3.2" text-anchor="middle" font-family="Segoe UI" fill="#1f2433">Master thesis visual sandbox</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function escapeXml(value: string) {
  const map: Record<string, string> = {
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    '"': "&quot;",
    "'": "&apos;",
  };
  return value.replace(/[<>&"']/g, (char) => map[char as keyof typeof map]);
}

function isGraphObject(input: unknown): input is { edges: unknown } {
  return typeof input === "object" && input !== null && Array.isArray((input as { edges?: unknown }).edges);
}

