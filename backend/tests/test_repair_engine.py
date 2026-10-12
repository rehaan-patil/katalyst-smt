import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.schemas import Topology, TopologyNode, TopologyEdge, RepairConstraint
from app.repair_engine import synthesize_repairs

def test_proof_to_repair_synthesizes_verified_fix_for_spof():
    """
    Topology: s -> gateway -> t
    At k=1: 'gateway' is an articulation point (SPOF).
    The Proof-to-Repair engine must:
    1. Detect counterexample ['gateway']
    2. Synthesize admissible bypass (e.g. s -> t)
    3. Re-verify candidate topology with Z3 (achieving UNSAT)
    4. Return recommended verified candidate
    """
    top = Topology(
        nodes=[
            TopologyNode(id="s"),
            TopologyNode(id="gateway"),
            TopologyNode(id="t")
        ],
        edges=[
            TopologyEdge(source="s", target="gateway"),
            TopologyEdge(source="gateway", target="t")
        ],
        source_node_id="s",
        sink_node_id="t"
    )
    
    resp = synthesize_repairs(top, failure_k=1)
    
    assert "gateway" in resp.original_counterexample
    assert len(resp.candidates) > 0
    
    # Must have a recommended candidate
    assert resp.recommended_candidate_id is not None
    rec = next(c for c in resp.candidates if c.candidate_id == resp.recommended_candidate_id)
    
    # Critical requirement: Suggested repair must be formally verified by Z3
    assert rec.is_verified is True
    assert rec.re_verification.status == "UNSAT"
    assert rec.re_verification.is_resilient is True

def test_already_verified_topology_needs_no_repairs():
    """
    Topology with 2 vertex-disjoint paths evaluated at k=1.
    Already resilient -> no repairs required.
    """
    top = Topology(
        nodes=[
            TopologyNode(id="s"),
            TopologyNode(id="a"),
            TopologyNode(id="b"),
            TopologyNode(id="t")
        ],
        edges=[
            TopologyEdge(source="s", target="a"),
            TopologyEdge(source="a", target="t"),
            TopologyEdge(source="s", target="b"),
            TopologyEdge(source="b", target="t")
        ],
        source_node_id="s",
        sink_node_id="t"
    )
    
    resp = synthesize_repairs(top, failure_k=1)
    assert len(resp.candidates) == 0
    assert resp.recommended_candidate_id is None
    assert "already formally verified" in resp.root_cause_diagnosis.lower()

def test_repair_respects_cost_budget():
    """
    Budget constraint: if budget is too low (e.g., $5.0 where base cost is $10.0),
    candidates exceeding budget must be excluded.
    """
    top = Topology(
        nodes=[
            TopologyNode(id="s"),
            TopologyNode(id="gateway"),
            TopologyNode(id="t")
        ],
        edges=[
            TopologyEdge(source="s", target="gateway"),
            TopologyEdge(source="gateway", target="t")
        ],
        source_node_id="s",
        sink_node_id="t"
    )
    
    # Set impossible budget
    constraints = RepairConstraint(budget=5.0)
    resp = synthesize_repairs(top, failure_k=1, constraints=constraints)
    assert len(resp.candidates) == 0
