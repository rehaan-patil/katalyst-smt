import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.schemas import Topology, TopologyNode, TopologyEdge
from app.flow_analysis import compute_flow_analysis

def test_hand_calculated_diamond_flow_duality():
    """
    Diamond graph:
    s -> a (cap 10), s -> b (cap 10)
    a -> t (cap 5),  b -> t (cap 15)
    Max flow through a = 5, through b = 10 -> Total max flow = 15.0
    Min cut capacity must equal 15.0
    """
    top = Topology(
        nodes=[
            TopologyNode(id="s"),
            TopologyNode(id="a"),
            TopologyNode(id="b"),
            TopologyNode(id="t")
        ],
        edges=[
            TopologyEdge(source="s", target="a", capacity=10.0),
            TopologyEdge(source="s", target="b", capacity=10.0),
            TopologyEdge(source="a", target="t", capacity=5.0),
            TopologyEdge(source="b", target="t", capacity=15.0)
        ],
        source_node_id="s",
        sink_node_id="t"
    )
    res = compute_flow_analysis(top)
    assert abs(res.max_throughput - 15.0) < 1e-6
    assert abs(res.min_cut_capacity - 15.0) < 1e-6
    assert res.duality_verified is True
    assert "s" in res.source_partition
    assert "t" in res.sink_partition

def test_node_capacity_throttles_flow():
    """
    Path s -> v -> t with huge edge capacities (100.0),
    but node v has capacity=7.5.
    Node-splitting must restrict max throughput to 7.5.
    """
    top = Topology(
        nodes=[
            TopologyNode(id="s"),
            TopologyNode(id="v", capacity=7.5),
            TopologyNode(id="t")
        ],
        edges=[
            TopologyEdge(source="s", target="v", capacity=100.0),
            TopologyEdge(source="v", target="t", capacity=100.0)
        ],
        source_node_id="s",
        sink_node_id="t"
    )
    res = compute_flow_analysis(top)
    assert abs(res.max_throughput - 7.5) < 1e-6
    assert abs(res.min_cut_capacity - 7.5) < 1e-6
    assert res.duality_verified is True

def test_disconnected_graph_has_zero_flow():
    top = Topology(
        nodes=[
            TopologyNode(id="s"),
            TopologyNode(id="a"),
            TopologyNode(id="b"),
            TopologyNode(id="t")
        ],
        edges=[
            TopologyEdge(source="s", target="a", capacity=10.0),
            TopologyEdge(source="b", target="t", capacity=10.0)
        ],
        source_node_id="s",
        sink_node_id="t"
    )
    res = compute_flow_analysis(top)
    assert res.max_throughput == 0.0
    assert res.min_cut_capacity == 0.0
    assert "s" in res.source_partition
    assert "t" in res.sink_partition

def test_directed_graph_not_undirected():
    """
    Graph only has edge t -> s. Flow from s -> t must be 0.
    """
    top = Topology(
        nodes=[
            TopologyNode(id="s"),
            TopologyNode(id="t")
        ],
        edges=[
            TopologyEdge(source="t", target="s", capacity=50.0)
        ],
        source_node_id="s",
        sink_node_id="t"
    )
    res = compute_flow_analysis(top)
    assert res.max_throughput == 0.0
