import {
  Topology,
  AnalysisConfig,
  AnalyzeTopologyResponse,
  SuggestRepairsResponse,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(`API Error ${status}: ${detail}`);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!res.ok) {
      let errorDetail = `HTTP ${res.status} ${res.statusText}`;
      try {
        const errorJson = await res.json();
        if (errorJson.detail) {
          errorDetail = typeof errorJson.detail === "string" 
            ? errorJson.detail 
            : JSON.stringify(errorJson.detail);
        }
      } catch {
        // ignore parse error
      }
      throw new ApiError(res.status, errorDetail);
    }

    return (await res.json()) as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      0,
      `Network connection failed to ${API_BASE_URL}. Ensure the backend service is running.`
    );
  }
}

export async function checkBackendHealth(): Promise<{ status: string; version: string }> {
  return request<{ status: string; version: string }>("/health");
}

export async function getAnalysisCapabilities(): Promise<Record<string, any>> {
  return request<Record<string, any>>("/api/v1/analysis-capabilities");
}

export async function analyzeTopology(
  topology: Topology,
  config?: Partial<AnalysisConfig>
): Promise<AnalyzeTopologyResponse> {
  return request<AnalyzeTopologyResponse>("/api/v1/analyze-topology", {
    method: "POST",
    body: JSON.stringify({
      topology,
      config: {
        failure_k: config?.failure_k ?? 2,
        failure_mode: config?.failure_mode ?? "at_most",
        timeout_ms: config?.timeout_ms ?? 5000,
      },
    }),
  });
}

export async function suggestRepairs(
  topology: Topology,
  failure_k: number = 2
): Promise<SuggestRepairsResponse> {
  return request<SuggestRepairsResponse>("/api/v1/suggest-repairs", {
    method: "POST",
    body: JSON.stringify({
      topology,
      failure_k,
      constraints: {
        max_candidate_edges: 3,
      },
    }),
  });
}
