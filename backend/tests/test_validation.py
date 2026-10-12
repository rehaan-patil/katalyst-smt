import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.schemas import Topology, TopologyNode, TopologyEdge
from app.graph_engine import validate_topology, TopologyValidationError

def test_valid_topology_passes():
    top = Topology(
        nodes=[
            TopologyNode(id="ingress"),
            TopologyNode(id="db")
        ],
        edges=[
            TopologyEdge(source="ingress", target="db")
        ],
        source_node_id="ingress",
        sink_node_id="db"
    )
    validate_topology(top)  # Should not raise

def test_duplicate_nodes_rejected():
    with pytest.raises(ValueError):
        # Pydantic or graph_engine should reject duplicate node IDs
        Topology(
            nodes=[
                TopologyNode(id="node-a"),
                TopologyNode(id="node-a")
            ],
            edges=[],
            source_node_id="node-a",
            sink_node_id="node-b"
        )

def test_self_loop_rejected():
    top = Topology(
        nodes=[
            TopologyNode(id="node-a"),
            TopologyNode(id="node-b")
        ],
        edges=[
            TopologyEdge(source="node-a", target="node-a")
        ],
        source_node_id="node-a",
        sink_node_id="node-b"
    )
    with pytest.raises(TopologyValidationError, match="Self-loop"):
        validate_topology(top)

def test_duplicate_directed_edges_rejected():
    top = Topology(
        nodes=[
            TopologyNode(id="node-a"),
            TopologyNode(id="node-b")
        ],
        edges=[
            TopologyEdge(source="node-a", target="node-b"),
            TopologyEdge(source="node-a", target="node-b")
        ],
        source_node_id="node-a",
        sink_node_id="node-b"
    )
    with pytest.raises(TopologyValidationError, match="Duplicate directed edge"):
        validate_topology(top)

def test_missing_source_rejected():
    top = Topology(
        nodes=[
            TopologyNode(id="node-a"),
            TopologyNode(id="node-b")
        ],
        edges=[],
        source_node_id="missing-node",
        sink_node_id="node-b"
    )
    with pytest.raises(TopologyValidationError, match="Source node 'missing-node' does not exist"):
        validate_topology(top)

def test_identical_source_and_sink_rejected():
    with pytest.raises(ValueError, match="Source and sink node IDs must be distinct"):
        Topology(
            nodes=[
                TopologyNode(id="node-a"),
                TopologyNode(id="node-b")
            ],
            edges=[],
            source_node_id="node-a",
            sink_node_id="node-a"
        )
