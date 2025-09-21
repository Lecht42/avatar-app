export type StylePreset = {
  id: string;
  label: string;
  description: string;
  accent: string;
  prompt: string;
};

export type ResolutionPreset = {
  id: string;
  width: number;
  height: number;
  aspect: string;
};

export type ModelPreset = {
  id: string;
  label: string;
  specialty: string;
};

export type UiDefaults = {
  styleId: string;
  resolutionId: string;
  modelId: string;
  steps: number;
  guidance: number;
};

export type UiConfig = {
  styles: StylePreset[];
  resolutions: ResolutionPreset[];
  models: ModelPreset[];
  defaults: UiDefaults;
  fetchedAt: string;
  fallback: boolean;
};

export type VectorizeRequest = {
  text?: string;
  graph?: unknown;
  imageBase64?: string;
};

export type VectorizeResponse = {
  text?: number[][];
  graph?: number[][];
  image?: number[][];
};

export type ClusterRequest = {
  vectors: number[][];
  minClusterSize?: number;
  minSamples?: number;
};

export type ClusterMetrics = {
  silhouette: number | null;
  daviesBouldin: number | null;
  calinskiHarabasz: number | null;
};

export type ClusterResponse = {
  labels: number[];
  clusters: Array<{ id: number; size: number }>;
  noiseCount: number;
  metrics: ClusterMetrics;
};

export type GenerateAvatarRequest = {
  prompt: string;
  seed?: number | null;
  steps: number;
  guidance: number;
  model: string;
  width: number;
  height: number;
  styleId?: string;
  palette?: string;
  accessories?: string;
  background?: string;
};

export type GenerateAvatarResponse = {
  images: string[];
};
