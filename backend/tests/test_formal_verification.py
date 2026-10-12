import pytest
import itertools
import networkx as nx
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.schemas import Topology, TopologyNode, TopologyEdge, AnalysisConfig
from app.formal_verification import verify_topology_resilience

def test_single_articulation_point_k1_sat():
    """
    Topology: s -> gateway -> t
    With k=1: Failing 'gateway' must disconnect s from t.
    Z3 must return SAT and extract counterexample ['gateway'].
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
    res = verify_topology_resilience(top, AnalysisConfig(failure_k=1))
    assert res.status == "SAT"
    assert res.is_resilient is False
    assert res.counterexample_nodes == ["gateway"]

def test_two_disjoint_paths_k1_unsat():
    """
    Two internally vertex-disjoint paths:
    Path 1: s -> a -> t
    Path 2: s -> b -> t
    With k=1: No single node failure can disconnect s and t.
    Z3 must return UNSAT (certified resilient).
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
    res = verify_topology_resilience(top, AnalysisConfig(failure_k=1))
    assert res.status == "UNSAT"
    assert res.is_resilient is True
    assert len(res.counterexample_nodes) == 0

def test_two_disjoint_paths_k2_sat():
    """
    Same graph with k=2:
    Failing both 'a' and 'b' cuts both paths.
    Z3 must return SAT with counterexample containing {'a', 'b'}.
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
    res = verify_topology_resilience(top, AnalysisConfig(failure_k=2))
    assert res.status == "SAT"
    assert res.is_resilient is False
    assert set(res.counterexample_nodes) == {"a", "b"}

def test_anti_cycle_ranking_with_isolated_cycle():
    """
    Isolated cycle: c1 -> c2 -> c1 -> t
    Source s is isolated.
    A naive Horn clause without rank bounds might allow c1 and c2 to justify each other.
    Z3 with distance ranking must recognize that s cannot reach t.
    """
    top = Topology(
        nodes=[
            TopologyNode(id="s"),
            TopologyNode(id="c1"),
            TopologyNode(id="c2"),
            TopologyNode(id="t")
        ],
        edges=[
            TopologyEdge(source="c1", target="c2"),
            TopologyEdge(source="c2", target="c1"),
            TopologyEdge(source="c1", target="t")
        ],
        source_node_id="s",
        sink_node_id="t"
    )
    res = verify_topology_resilience(top, AnalysisConfig(failure_k=1))
    # Must report SAT or base partitioned
    assert res.status == "SAT"
    assert res.is_resilient is False

def test_exhaustive_combinatorial_cross_validation():
    """
    Double-blind test against ground-truth combinatorial search:
    For a graph with 6 nodes, test all subsets of size <= 2 using NetworkX.
    Verify that Z3 SAT/UNSAT matches exhaustive ground truth 100%.
    """
    # Graph: s -> {a, b, c} -> {d} -> t with cross edges
    nodes = [
        TopologyNode(id="s"),
        TopologyNode(id="a"),
        TopologyNode(id="b"),
        TopologyNode(id="c"),
        TopologyNode(id="d"),
        TopologyNode(id="t")
    ]
    edges = [
        TopologyEdge(source="s", target="a"),
        TopologyEdge(source="s", target="b"),
        TopologyEdge(source="s", target="c"),
        TopologyEdge(source="a", target="d"),
        TopologyEdge(source="b", target="d"),
        TopologyEdge(source="c", target="t"),
        TopologyEdge(source="d", target="t")
    ]
    top = Topology(nodes=nodes, edges=edges, source_node_id="s", sink_node_id="t")
    
    # 1. Ground truth exhaustive calculation
    G = nx.DiGraph()
    for e in edges:
        G.add_edge(e.source, e.target)
        
    intermediate = ["a", "b", "c", "d"]
    ground_truth_can_disconnect = False
    for r in [1, 2]:
        for comb in itertools.combinations(intermediate, r):
            H = G.copy()
            H.remove_nodes_from(comb)
            if not nx.has_path(H, "s", "t"):
                ground_truth_can_disconnect = True
                break
        if ground_truth_can_disconnect:
            break
            
    # 2. Z3 solver result
    res = verify_topology_resilience(top, AnalysisConfig(failure_k=2))
    
    if ground_truth_can_disconnect:
        assert res.status == "SAT"
        assert res.is_resilient is False
        # Validate that returned counterexample genuinely disconnects graph
        H = G.copy()
        H.remove_nodes_from(res.counterexample_nodes)
        assert not nx.has_path(H, "s", "t")
    else:
        assert res.status == "UNSAT"
        assert res.is_resilient is True
