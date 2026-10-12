from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field, field_validator
import re

ID_REGEX = re.compile(r"^[a-zA-Z0-9_\-\.]{1,64}$")

class TopologyNode(BaseModel):
    id: str = Field(..., description="Unique node identifier")
    label: Optional[str] = Field(None, description="Human readable name or service role")
    capacity: Optional[float] = Field(None, gt=0, description="Node concurrency/flow limit (req/s)")
    failure_prob: float = Field(0.01, ge=0.0, le=1.0, description="Independent empirical failure probability")
    tier: Optional[str] = Field(None, description="Architectural tier: ingress, service, cache, db")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

    @field_validator("id")
    @classmethod
    def validate_id(cls, v: str) -> str:
        if not ID_REGEX.match(v):
            raise ValueError(f"Node id '{v}' must be alphanumeric with dashes, underscores, dots (max 64 chars)")
        return v

class TopologyEdge(BaseModel):
    id: Optional[str] = Field(None, description="Unique edge identifier")
    source: str = Field(..., description="Source node id")
    target: str = Field(..., description="Target node id")
    capacity: float = Field(10.0, gt=0, description="Directed flow capacity")
    spectral_weight: float = Field(1.0, gt=0, description="Weight used in symmetric Laplacian")
    latency_ms: Optional[float] = Field(None, ge=0, description="Network round-trip latency")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

    @field_validator("source", "target")
    @classmethod
    def validate_endpoint_ids(cls, v: str) -> str:
        if not ID_REGEX.match(v):
            raise ValueError(f"Endpoint id '{v}' is invalid")
        return v

class Topology(BaseModel):
    nodes: List[TopologyNode] = Field(..., min_length=2, description="List of nodes in the graph")
    edges: List[TopologyEdge] = Field(default_factory=list, description="List of directed edges")
    source_node_id: str = Field(..., description="Designated source/ingress node id")
    sink_node_id: str = Field(..., description="Designated sink/data store node id")

    @field_validator("nodes")
    @classmethod
    def validate_unique_nodes(cls, v: List[TopologyNode]) -> List[TopologyNode]:
        ids = [n.id for n in v]
        if len(ids) != len(set(ids)):
            raise ValueError("Duplicate node IDs found in topology nodes list")
        return v

    @field_validator("sink_node_id")
    @classmethod
    def validate_distinct_terminals(cls, v: str, info) -> str:
        source = info.data.get("source_node_id")
        if source and source == v:
            raise ValueError("Source and sink node IDs must be distinct")
        return v

class AnalysisConfig(BaseModel):
    failure_k: int = Field(2, ge=1, le=10, description="Number of simultaneous failures to tolerate")
    failure_mode: Literal["at_most", "exact"] = Field("at_most", description="Failure cardinality constraint")
    timeout_ms: int = Field(5000, ge=500, le=30000, description="Z3 solver timeout in milliseconds")

class AnalyzeTopologyRequest(BaseModel):
    topology: Topology
    config: Optional[AnalysisConfig] = Field(default_factory=AnalysisConfig)

class SpectralResult(BaseModel):
    node_order: List[str]
    adjacency_matrix: List[List[float]]
    degree_matrix: List[List[float]]
    laplacian_matrix: List[List[float]]
    eigenvalues: List[float]
    fiedler_value: float
    algebraic_connectivity_score: float
    num_connected_components: int
    interpretation: str

class CriticalCutEdge(BaseModel):
    source: str
    target: str
    capacity: float

class FlowResult(BaseModel):
    max_throughput: float
    min_cut_capacity: float
    critical_cut_edges: List[CriticalCutEdge]
    source_partition: List[str]
    sink_partition: List[str]
    duality_verified: bool
    interpretation: str

class VerificationResult(BaseModel):
    status: Literal["SAT", "UNSAT", "UNKNOWN"]
    property_verified: str
    is_resilient: bool
    failure_k: int
    failure_mode: str
    counterexample_nodes: List[str] = Field(default_factory=list)
    witness_description: str
    verification_time_ms: float
    proof_notes: str

class RiskAssessment(BaseModel):
    independent_failure_probabilities: Dict[str, float]
    counterexample_joint_prob: Optional[float] = None
    risk_tier: Literal["LOW", "ELEVATED", "CRITICAL"]
    notes: str

class AnalyzeTopologyResponse(BaseModel):
    topology_summary: Dict[str, Any]
    spectral: SpectralResult
    flow: FlowResult
    verification: VerificationResult
    risk: RiskAssessment
    warnings: List[str] = Field(default_factory=list)
    execution_duration_ms: float

class RepairConstraint(BaseModel):
    max_candidate_edges: int = Field(3, ge=1, le=5)
    allowed_sources: Optional[List[str]] = None
    allowed_targets: Optional[List[str]] = None
    budget: Optional[float] = Field(None, gt=0)

class SuggestRepairsRequest(BaseModel):
    topology: Topology
    failure_k: int = Field(2, ge=1, le=10)
    constraints: Optional[RepairConstraint] = Field(default_factory=RepairConstraint)

class RepairCandidate(BaseModel):
    candidate_id: str
    added_edges: List[TopologyEdge]
    estimated_cost: float
    structural_gain: str
    re_verification: VerificationResult
    new_throughput: Optional[float] = None
    new_fiedler: Optional[float] = None
    is_verified: bool

class SuggestRepairsResponse(BaseModel):
    original_counterexample: List[str]
    root_cause_diagnosis: str
    candidates: List[RepairCandidate]
    recommended_candidate_id: Optional[str] = None
    optimality_scope: str
