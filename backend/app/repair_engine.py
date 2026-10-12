import copy
import networkx as nx
from typing import List, Set, Dict, Optional, Tuple
from .schemas import (
    Topology, TopologyEdge, RepairCandidate, SuggestRepairsResponse,
    RepairConstraint, AnalysisConfig
)
from .graph_engine import build_networkx_graph, validate_topology
from .formal_verification import verify_topology_resilience
from .flow_analysis import compute_flow_analysis
from .spectral_analysis import compute_spectral_analysis

def synthesize_repairs(
    topology: Topology,
    failure_k: int = 2,
    constraints: Optional[RepairConstraint] = None
) -> SuggestRepairsResponse:
    """
    Executes the Proof-to-Repair Workflow:
    1. Formally verifies current topology with Z3.
    2. If SAT, extracts minimal counterexample witness F*.
    3. Structural diagnosis: identifies cut partition and articulation bottlenecks.
    4. Synthesizes admissible candidate remediation edges.
    5. Re-runs Z3 formal verification on each proposed repaired topology.
    6. Identifies cost-optimal verified repair.
    """
    validate_topology(topology)
    if constraints is None:
        constraints = RepairConstraint()
        
    s_id = topology.source_node_id
    t_id = topology.sink_node_id
    G = build_networkx_graph(topology)
    
    # 1. Initial verification
    initial_verification = verify_topology_resilience(
        topology, AnalysisConfig(failure_k=failure_k)
    )
    
    if initial_verification.status == "UNSAT":
        return SuggestRepairsResponse(
            original_counterexample=[],
            root_cause_diagnosis=(
                f"Topology is already formally verified as resilient against any {failure_k} "
                "simultaneous node failures. No structural repair needed."
            ),
            candidates=[],
            recommended_candidate_id=None,
            optimality_scope="Topology is already verified; candidate space empty."
        )
        
    failed_nodes = set(initial_verification.counterexample_nodes)
    
    # 2. Structural Root Cause Diagnosis
    if not failed_nodes:
        # Base graph was already disconnected
        root_cause = "Base graph is disconnected: no path exists from source to sink prior to node failure."
        reachable_from_s = nx.descendants(G, s_id) | {s_id}
        unreachable = set(G.nodes) - reachable_from_s
        candidate_sources = list(reachable_from_s)
        candidate_targets = list(unreachable)
    else:
        root_cause = (
            f"Vulnerability identified: Simultaneous failure of {len(failed_nodes)} node(s) "
            f"[{', '.join(sorted(failed_nodes))}] creates an articulation cut partitioning "
            f"ingress '{s_id}' from sink '{t_id}'."
        )
        H = G.copy()
        H.remove_nodes_from(failed_nodes)
        
        reachable_from_s = (nx.descendants(H, s_id) | {s_id}) if H.has_node(s_id) else {s_id}
        # Targets that can reach sink in H or downstream of failed nodes
        can_reach_t = (nx.ancestors(H, t_id) | {t_id}) if H.has_node(t_id) else {t_id}
        
        candidate_sources = list(reachable_from_s - failed_nodes)
        candidate_targets = list(can_reach_t - failed_nodes)

    # 3. Generate Admissible Candidate Edge Modifications
    existing_edges = {(e.source, e.target) for e in topology.edges}
    raw_candidates: List[Tuple[str, str, float]] = []
    
    for u in candidate_sources:
        # Apply source constraints
        if constraints.allowed_sources and u not in constraints.allowed_sources:
            continue
        for v in candidate_targets:
            if constraints.allowed_targets and v not in constraints.allowed_targets:
                continue
            if u == v:
                continue
            if (u, v) in existing_edges:
                continue
                
            # Cost model: Base cost 10.0 + heuristic penalty for cross-tier jumps
            base_cost = 10.0
            raw_candidates.append((u, v, base_cost))

    # Fallback candidate generation if partition search is narrow
    if not raw_candidates:
        all_non_terminals = [n.id for n in topology.nodes if n.id not in (s_id, t_id)]
        for node in all_non_terminals:
            if (s_id, node) not in existing_edges and node not in failed_nodes:
                raw_candidates.append((s_id, node, 12.0))
            if (node, t_id) not in existing_edges and node not in failed_nodes:
                raw_candidates.append((node, t_id, 12.0))
        if (s_id, t_id) not in existing_edges:
            raw_candidates.append((s_id, t_id, 25.0))  # Direct emergency bypass

    # Limit search space to top candidate operations
    sorted_raw = sorted(raw_candidates, key=lambda c: c[2])[: constraints.max_candidate_edges * 2]
    
    candidates: List[RepairCandidate] = []
    candidate_idx = 1
    
    for u, v, cost in sorted_raw:
        if constraints.budget is not None and cost > constraints.budget:
            continue
            
        new_edge = TopologyEdge(
            id=f"repair-{u}-to-{v}",
            source=u,
            target=v,
            capacity=15.0,  # Generous default bypass capacity
            spectral_weight=2.0,
            metadata={"generated_by": "ProofToRepairEngine", "synthetic": True}
        )
        
        # Build mutated candidate topology
        repaired_topology = copy.deepcopy(topology)
        repaired_topology.edges.append(new_edge)
        
        # 4. Formally Re-Verify the Candidate Topology
        re_verification = verify_topology_resilience(
            repaired_topology, AnalysisConfig(failure_k=failure_k)
        )
        flow_res = compute_flow_analysis(repaired_topology)
        spec_res = compute_spectral_analysis(repaired_topology)
        
        is_verified = (re_verification.status == "UNSAT")
        gain_desc = (
            f"Adds direct redundancy edge from '{u}' to '{v}' (capacity 15.0). "
            f"Bypasses failure set {{{', '.join(sorted(failed_nodes))}}}."
        )
        
        candidate_obj = RepairCandidate(
            candidate_id=f"REC-00{candidate_idx}",
            added_edges=[new_edge],
            estimated_cost=cost,
            structural_gain=gain_desc,
            re_verification=re_verification,
            new_throughput=flow_res.max_throughput,
            new_fiedler=spec_res.fiedler_value,
            is_verified=is_verified
        )
        candidates.append(candidate_obj)
        candidate_idx += 1
        
        if len(candidates) >= constraints.max_candidate_edges:
            break

    # 5. Select Recommended Repair
    # Prioritize: 1. is_verified == True, 2. lowest cost, 3. highest throughput
    verified_candidates = [c for c in candidates if c.is_verified]
    if verified_candidates:
        verified_candidates.sort(key=lambda c: (c.estimated_cost, -(c.new_throughput or 0.0)))
        recommended_id = verified_candidates[0].candidate_id
        scope = (
            f"Certified optimal repair within candidate space: eliminates {failure_k}-node "
            f"vulnerability at minimum intervention cost ({verified_candidates[0].estimated_cost:.1f})."
        )
    elif candidates:
        # None fully verified (e.g. k is too high for single edge addition), pick highest flow gain
        candidates.sort(key=lambda c: (-(c.new_throughput or 0.0), c.estimated_cost))
        recommended_id = candidates[0].candidate_id
        scope = (
            f"Best-effort candidate: improves throughput to {candidates[0].new_throughput:.1f}, "
            f"but multi-edge intervention or higher budget required to achieve full {failure_k}-resilience."
        )
    else:
        recommended_id = None
        scope = "No admissible repair candidates could be generated under the current constraints."

    return SuggestRepairsResponse(
        original_counterexample=sorted(list(failed_nodes)),
        root_cause_diagnosis=root_cause,
        candidates=candidates,
        recommended_candidate_id=recommended_id,
        optimality_scope=scope
    )
