import networkx as nx
from typing import Tuple, Set, Dict, Any, List
from .schemas import Topology, TopologyNode, TopologyEdge
from .config import settings

class TopologyValidationError(ValueError):
    """Raised when topology violates structural or resource invariants."""
    pass

def validate_topology(topology: Topology) -> None:
    """Strict preflight validation of topology semantics."""
    node_ids = {n.id for n in topology.nodes}
    
    if len(node_ids) != len(topology.nodes):
        raise TopologyValidationError("Duplicate node IDs found in topology")
        
    if len(topology.nodes) > settings.MAX_NODES:
        raise TopologyValidationError(f"Node count ({len(topology.nodes)}) exceeds limit ({settings.MAX_NODES})")
        
    if len(topology.edges) > settings.MAX_EDGES:
        raise TopologyValidationError(f"Edge count ({len(topology.edges)}) exceeds limit ({settings.MAX_EDGES})")

    if topology.source_node_id not in node_ids:
        raise TopologyValidationError(f"Source node '{topology.source_node_id}' does not exist in nodes")
        
    if topology.sink_node_id not in node_ids:
        raise TopologyValidationError(f"Sink node '{topology.sink_node_id}' does not exist in nodes")
        
    # Check edges
    seen_edges: Set[Tuple[str, str]] = set()
    for edge in topology.edges:
        if edge.source not in node_ids:
            raise TopologyValidationError(f"Edge source '{edge.source}' does not exist")
        if edge.target not in node_ids:
            raise TopologyValidationError(f"Edge target '{edge.target}' does not exist")
        if edge.source == edge.target:
            raise TopologyValidationError(f"Self-loop edge '{edge.source} -> {edge.target}' is disallowed")
            
        pair = (edge.source, edge.target)
        if pair in seen_edges:
            raise TopologyValidationError(f"Duplicate directed edge '{edge.source} -> {edge.target}' is disallowed")
        seen_edges.add(pair)

def build_networkx_graph(topology: Topology) -> nx.DiGraph:
    """Build directed graph with all properties preserved."""
    validate_topology(topology)
    G = nx.DiGraph()
    for n in topology.nodes:
        G.add_node(
            n.id,
            label=n.label or n.id,
            capacity=n.capacity,
            failure_prob=n.failure_prob,
            tier=n.tier
        )
    for e in topology.edges:
        G.add_edge(
            e.source,
            e.target,
            id=e.id or f"{e.source}->{e.target}",
            capacity=float(e.capacity),
            spectral_weight=float(e.spectral_weight),
            latency_ms=e.latency_ms
        )
    return G

def build_split_node_graph(topology: Topology) -> Tuple[nx.DiGraph, str, str]:
    """
    Constructs an auxiliary graph using standard node-splitting transformation:
    Each node v with finite capacity c(v) is split into v_in and v_out with capacity c(v).
    Edges (u, v) become (u_out, v_in).
    Source becomes source_out, sink becomes sink_in.
    """
    validate_topology(topology)
    G = nx.DiGraph()
    
    # Process nodes
    for n in topology.nodes:
        in_id = f"{n.id}__in"
        out_id = f"{n.id}__out"
        
        # Internal connecting edge
        internal_cap = float(n.capacity) if (n.capacity is not None and n.capacity > 0) else float("inf")
        G.add_node(in_id, original_id=n.id, type="in")
        G.add_node(out_id, original_id=n.id, type="out")
        G.add_edge(in_id, out_id, capacity=internal_cap, internal=True)
        
    # Process edges
    for e in topology.edges:
        u_out = f"{e.source}__out"
        v_in = f"{e.target}__in"
        G.add_edge(u_out, v_in, capacity=float(e.capacity), original_edge=(e.source, e.target), internal=False)
        
    s_split = f"{topology.source_node_id}__out"
    t_split = f"{topology.sink_node_id}__in"
    return G, s_split, t_split
