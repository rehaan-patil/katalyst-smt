import time
import z3
import networkx as nx
from typing import List, Set, Dict, Optional
from .schemas import Topology, VerificationResult, AnalysisConfig
from .graph_engine import build_networkx_graph, validate_topology

def verify_topology_resilience(
    topology: Topology,
    config: Optional[AnalysisConfig] = None
) -> VerificationResult:
    """
    Formulates and executes the Z3 SMT constraint problem:
    Can a set of at most (or exact) k simultaneous failures among eligible non-terminal
    nodes disconnect designated source s from sink t?
    
    Uses Menger's Directed Cut-Reachability Closure:
    A failure set F disconnects s from t iff there exists a partition S subset of V such that:
    1. s in S
    2. t not in S
    3. For all u in V \\ {s, t}: u in S implies u not in F
    4. For all (u, v) in E: (u in S and v not in F) implies v in S
    5. |F| <= k
    """
    start_time = time.perf_counter()
    validate_topology(topology)
    
    if config is None:
        config = AnalysisConfig()
        
    s_id = topology.source_node_id
    t_id = topology.sink_node_id
    k = config.failure_k
    mode = config.failure_mode
    timeout_ms = config.timeout_ms
    
    G = build_networkx_graph(topology)
    all_node_ids = [n.id for n in topology.nodes]
    
    # 1. Base Pre-condition Check: Are source and sink connected prior to failures?
    if not nx.has_path(G, s_id, t_id):
        elapsed = (time.perf_counter() - start_time) * 1000.0
        return VerificationResult(
            status="SAT",
            property_verified=f"Resilience against {mode} {k} simultaneous node failures",
            is_resilient=False,
            failure_k=k,
            failure_mode=mode,
            counterexample_nodes=[],
            witness_description="Trivially partitioned: Source cannot reach sink even with 0 node failures.",
            verification_time_ms=elapsed,
            proof_notes="Base graph lacks any directed path from source to sink prior to failure injection."
        )

    # Eligible failure candidates: intermediate nodes only (terminals are protected)
    eligible_nodes = [nid for nid in all_node_ids if nid not in (s_id, t_id)]
    
    if len(eligible_nodes) == 0:
        elapsed = (time.perf_counter() - start_time) * 1000.0
        return VerificationResult(
            status="UNSAT",
            property_verified=f"Resilience against {mode} {k} simultaneous node failures",
            is_resilient=True,
            failure_k=k,
            failure_mode=mode,
            counterexample_nodes=[],
            witness_description="No eligible intermediate nodes to fail; source directly connected to sink.",
            verification_time_ms=elapsed,
            proof_notes="Vacuously resilient against intermediate failures."
        )

    # 2. Build Z3 SMT Cut-Reachability Formula
    solver = z3.Solver()
    solver.set("timeout", timeout_ms)
    
    # f[v] is True iff node v is selected to fail
    f_vars: Dict[str, z3.BoolRef] = {}
    for nid in eligible_nodes:
        f_vars[nid] = z3.Bool(f"fail_{nid}")
        
    # S_vars[v] is True iff node v is in the source-reachable partition S
    S_vars: Dict[str, z3.BoolRef] = {}
    for nid in all_node_ids:
        S_vars[nid] = z3.Bool(f"in_cut_S_{nid}")

    # Base conditions
    solver.add(S_vars[s_id] == z3.BoolVal(True))
    solver.add(S_vars[t_id] == z3.BoolVal(False))
    
    # Intermediate nodes in S cannot be failed
    for nid in eligible_nodes:
        solver.add(z3.Implies(S_vars[nid], z3.Not(f_vars[nid])))

    # Edge reachability propagation across cut:
    # If u is in S and v is not failed, then v MUST be in S
    for e in topology.edges:
        u = e.source
        v = e.target
        v_failed_cond = f_vars[v] if v in f_vars else z3.BoolVal(False)
        solver.add(
            z3.Implies(
                z3.And(S_vars[u], z3.Not(v_failed_cond)),
                S_vars[v]
            )
        )

    # Cardinality constraint on failures
    effective_k = min(k, len(eligible_nodes))
    failure_terms = [z3.If(f_vars[nid], 1, 0) for nid in eligible_nodes]
    
    if mode == "exact":
        solver.add(z3.Sum(failure_terms) == effective_k)
    else:  # at_most
        solver.add(z3.Sum(failure_terms) <= effective_k)

    # 3. Solver Execution
    check_result = solver.check()
    elapsed = (time.perf_counter() - start_time) * 1000.0
    
    if check_result == z3.sat:
        model = solver.model()
        raw_witness: List[str] = [
            nid for nid in eligible_nodes
            if z3.is_true(model.eval(f_vars[nid]))
        ]
        
        # Minimize witness: drop any node whose removal is not necessary to disconnect s and t
        minimal_witness: List[str] = list(raw_witness)
        for cand in raw_witness:
            test_subset = [x for x in minimal_witness if x != cand]
            H = G.copy()
            H.remove_nodes_from(test_subset)
            if not nx.has_path(H, s_id, t_id):
                # Still disconnected without cand, so cand was redundant
                minimal_witness = test_subset
                
        # Independent validation on minimal witness
        H = G.copy()
        H.remove_nodes_from(minimal_witness)
        is_actually_disconnected = not nx.has_path(H, s_id, t_id)
        
        witness_str = ", ".join(sorted(minimal_witness)) if minimal_witness else "None"
        proof_note = (
            f"Z3 SMT solver proved existence of cutting failure set {{{witness_str}}} "
            f"(size={len(minimal_witness)} <= {k}). "
            f"Independent NetworkX path validation: Disconnected={is_actually_disconnected}."
        )
        
        return VerificationResult(
            status="SAT",
            property_verified=f"Resilience against {mode} {k} simultaneous node failures",
            is_resilient=False,
            failure_k=k,
            failure_mode=mode,
            counterexample_nodes=sorted(minimal_witness),
            witness_description=f"Counterexample identified: Failure of nodes [{witness_str}] completely partitions sink from source.",
            verification_time_ms=elapsed,
            proof_notes=proof_note
        )
        
    elif check_result == z3.unsat:
        proof_note = (
            f"Formally certified UNSAT by Z3 SMT solver across all failure configurations "
            f"(up to {k} simultaneous failures from {len(eligible_nodes)} eligible nodes). "
            f"By Menger's Theorem, directed vertex connectivity strictly exceeds {k}."
        )
        return VerificationResult(
            status="UNSAT",
            property_verified=f"Resilience against {mode} {k} simultaneous node failures",
            is_resilient=True,
            failure_k=k,
            failure_mode=mode,
            counterexample_nodes=[],
            witness_description="Verification certified: No qualifying failure configuration can sever source-sink connectivity.",
            verification_time_ms=elapsed,
            proof_notes=proof_note
        )
        
    else:  # z3.unknown
        return VerificationResult(
            status="UNKNOWN",
            property_verified=f"Resilience against {mode} {k} simultaneous node failures",
            is_resilient=False,
            failure_k=k,
            failure_mode=mode,
            counterexample_nodes=[],
            witness_description="Verification inconclusive: Solver timed out or exceeded computational budget.",
            verification_time_ms=elapsed,
            proof_notes=f"Solver returned UNKNOWN after {elapsed:.1f}ms (timeout limit: {timeout_ms}ms)."
        )
