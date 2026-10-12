import pytest
import sys
import os
import random

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.schemas import Topology, TopologyNode, TopologyEdge
from app.spectral_analysis import compute_spectral_analysis

def test_hand_calculated_3_node_path_laplacian():
    """
    Graph: v1 -> v2 -> v3 (unit weights 1.0)
    Symmetric Laplacian:
    [ 1, -1,  0]
    [-1,  2, -1]
    [ 0, -1,  1]
    Eigenvalues must be exactly [0.0, 1.0, 3.0]
    Fiedler value must be 1.0
    """
    top = Topology(
        nodes=[
            TopologyNode(id="v1"),
            TopologyNode(id="v2"),
            TopologyNode(id="v3")
        ],
        edges=[
            TopologyEdge(source="v1", target="v2", spectral_weight=1.0),
            TopologyEdge(source="v2", target="v3", spectral_weight=1.0)
        ],
        source_node_id="v1",
        sink_node_id="v3"
    )
    res = compute_spectral_analysis(top)
    assert len(res.eigenvalues) == 3
    assert abs(res.eigenvalues[0] - 0.0) < 1e-8
    assert abs(res.eigenvalues[1] - 1.0) < 1e-8
    assert abs(res.eigenvalues[2] - 3.0) < 1e-8
    assert abs(res.fiedler_value - 1.0) < 1e-8
    assert res.num_connected_components == 1

def test_disconnected_graph_fiedler_is_zero():
    """
    Two disconnected components: (v1 -> v2) and (v3 -> v4).
    Symmetric Laplacian has 2 zero eigenvalues.
    Fiedler value must be 0.0.
    """
    top = Topology(
        nodes=[
            TopologyNode(id="v1"),
            TopologyNode(id="v2"),
            TopologyNode(id="v3"),
            TopologyNode(id="v4")
        ],
        edges=[
            TopologyEdge(source="v1", target="v2", spectral_weight=1.0),
            TopologyEdge(source="v3", target="v4", spectral_weight=1.0)
        ],
        source_node_id="v1",
        sink_node_id="v4"
    )
    res = compute_spectral_analysis(top)
    assert abs(res.fiedler_value - 0.0) < 1e-8
    assert res.num_connected_components == 2

def test_complete_graph_k4_eigenvalues():
    """
    Complete graph K4 with 4 nodes:
    Every pair has an edge of weight 1.0.
    Combinatorial Laplacian eigenvalues for K_n are:
    lambda_1 = 0 (multiplicity 1)
    lambda_2 = ... = lambda_n = n (multiplicity n-1)
    For K_4: eigenvalues are 0, 4, 4, 4. Fiedler value = 4.0.
    """
    nodes = [TopologyNode(id=f"n{i}") for i in range(1, 5)]
    edges = []
    for i in range(1, 5):
        for j in range(i + 1, 5):
            edges.append(TopologyEdge(source=f"n{i}", target=f"n{j}", spectral_weight=1.0))
            
    top = Topology(
        nodes=nodes,
        edges=edges,
        source_node_id="n1",
        sink_node_id="n4"
    )
    res = compute_spectral_analysis(top)
    assert abs(res.eigenvalues[0] - 0.0) < 1e-8
    for ev in res.eigenvalues[1:]:
        assert abs(ev - 4.0) < 1e-8
    assert abs(res.fiedler_value - 4.0) < 1e-8

def test_node_order_permutation_invariance():
    """
    Eigenvalues must be invariant under any permutation of node insertion order.
    """
    n_list = [TopologyNode(id="a"), TopologyNode(id="b"), TopologyNode(id="c"), TopologyNode(id="d")]
    e_list = [
        TopologyEdge(source="a", target="b"),
        TopologyEdge(source="b", target="c"),
        TopologyEdge(source="c", target="d"),
        TopologyEdge(source="a", target="c")
    ]
    
    top1 = Topology(nodes=n_list, edges=e_list, source_node_id="a", sink_node_id="d")
    res1 = compute_spectral_analysis(top1)
    
    # Shuffle nodes
    shuffled_nodes = list(n_list)
    random.seed(42)
    random.shuffle(shuffled_nodes)
    top2 = Topology(nodes=shuffled_nodes, edges=e_list, source_node_id="a", sink_node_id="d")
    res2 = compute_spectral_analysis(top2)
    
    for ev1, ev2 in zip(res1.eigenvalues, res2.eigenvalues):
        assert abs(ev1 - ev2) < 1e-8
    assert abs(res1.fiedler_value - res2.fiedler_value) < 1e-8
