export interface TopologyNode {
  id: string;
  label?: string;
  capacity?: number;
  failure_prob?: number;
  tier?: string;
  metadata?: Record<string, any>;
}

export interface TopologyEdge {
  id?: string;
  source: string;
  target: string;
  capacity: number;
  spectral_weight: number;
  latency_ms?: number;
  metadata?: Record<string, any>;
}

export interface Topology {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  source_node_id: string;
  sink_node_id: string;
}

export interface AnalysisConfig {
  failure_k: number;
  failure_mode: "at_most" | "exact";
  timeout_ms: number;
}

export interface SpectralResult {
  node_order: string[];
  adjacency_matrix: number[][];
  degree_matrix: number[][];
  laplacian_matrix: number[][];
  eigenvalues: number[];
  fiedler_value: number;
  algebraic_connectivity_score: number;
  num_connected_components: number;
  interpretation: string;
}

export interface CriticalCutEdge {
  source: string;
  target: string;
  capacity: number;
}

export interface FlowResult {
  max_throughput: number;
  min_cut_capacity: number;
  critical_cut_edges: CriticalCutEdge[];
  source_partition: string[];
  sink_partition: string[];
  duality_verified: boolean;
  interpretation: string;
}

export interface VerificationResult {
  status: "SAT" | "UNSAT" | "UNKNOWN";
  property_verified: string;
  is_resilient: boolean;
  failure_k: number;
  failure_mode: string;
  counterexample_nodes: string[];
  witness_description: string;
  verification_time_ms: number;
  proof_notes: string;
}

export interface RiskAssessment {
  independent_failure_probabilities: Record<string, number>;
  counterexample_joint_prob?: number;
  risk_tier: "LOW" | "ELEVATED" | "CRITICAL";
  notes: string;
}

export interface AnalyzeTopologyResponse {
  topology_summary: Record<string, any>;
  spectral: SpectralResult;
  flow: FlowResult;
  verification: VerificationResult;
  risk: RiskAssessment;
  warnings: string[];
  execution_duration_ms: number;
}

export interface RepairCandidate {
  candidate_id: string;
  added_edges: TopologyEdge[];
  estimated_cost: number;
  structural_gain: string;
  re_verification: VerificationResult;
  new_throughput?: number;
  new_fiedler?: number;
  is_verified: boolean;
}

export interface SuggestRepairsResponse {
  original_counterexample: string[];
  root_cause_diagnosis: string;
  candidates: RepairCandidate[];
  recommended_candidate_id?: string;
  optimality_scope: string;
}
