import networkx as nx
from typing import List, Set, Dict, Tuple
from .schemas import Topology, FlowResult, CriticalCutEdge
from .graph_engine import build_networkx_graph, build_split_node_graph

TOLERANCE = 1e-6

def compute_flow_analysis(topology: Topology) -> FlowResult:
    """
    Computes directed maximum flow and minimum cut using NetworkX.
    Respects directed edge capacities and node capacity limits via node-splitting.
    """
    s_orig = topology.source_node_id
    t_orig = topology.sink_node_id
    
    # Check if any intermediate node has a finite capacity constraint
    has_node_capacities = any(
        n.capacity is not None and n.capacity > 0
        for n in topology.nodes
        if n.id not in (s_orig, t_orig)
    )
    
    if has_node_capacities:
        # Use node-splitting auxiliary graph
        G_aux, s_target, t_target = build_split_node_graph(topology)
        
        try:
            cut_val, (s_part_aux, t_part_aux) = nx.minimum_cut(
                G_aux, s_target, t_target, capacity="capacity"
            )
            max_flow_val = nx.maximum_flow_value(
                G_aux, s_target, t_target, capacity="capacity"
            )
        except nx.NetworkXUnbounded:
            cut_val = float("inf")
            max_flow_val = float("inf")
            s_part_aux, t_part_aux = set(G_aux.nodes), set()
        except nx.NetworkXError:
            cut_val = 0.0
            max_flow_val = 0.0
            s_part_aux, t_part_aux = {s_target}, set(G_aux.nodes) - {s_target}
            
        # Map cut edges from auxiliary back to original elements
        cut_edges: List[CriticalCutEdge] = []
        for u, v in G_aux.edges():
            if u in s_part_aux and v in t_part_aux:
                edge_data = G_aux[u][v]
                cap = float(edge_data.get("capacity", 0.0))
                if edge_data.get("internal"):
                    # This was a node capacity constraint
                    orig_node = G_aux.nodes[u]["original_id"]
                    cut_edges.append(CriticalCutEdge(
                        source=f"{orig_node} (internal ingress)",
                        target=f"{orig_node} (internal egress)",
                        capacity=cap
                    ))
                else:
                    orig_edge = edge_data.get("original_edge")
                    if orig_edge:
                        cut_edges.append(CriticalCutEdge(
                            source=orig_edge[0],
                            target=orig_edge[1],
                            capacity=cap
                        ))
                        
        # Map partitions back to original node IDs
        s_partition: Set[str] = set()
        t_partition: Set[str] = set()
        for n in topology.nodes:
            out_node = f"{n.id}__out"
            if out_node in s_part_aux:
                s_partition.add(n.id)
            else:
                t_partition.add(n.id)
                
    else:
        # Standard directed edge-capacitated graph
        G = build_networkx_graph(topology)
        
        # Verify directed path exists
        if not nx.has_path(G, s_orig, t_orig):
            # Already disconnected
            reachable_from_s = nx.descendants(G, s_orig) | {s_orig}
            all_nodes = set(G.nodes)
            return FlowResult(
                max_throughput=0.0,
                min_cut_capacity=0.0,
                critical_cut_edges=[],
                source_partition=sorted(list(reachable_from_s)),
                sink_partition=sorted(list(all_nodes - reachable_from_s)),
                duality_verified=True,
                interpretation=(
                    "Source cannot reach sink in current topology (0.00 throughput). "
                    "The graph is already disconnected prior to node failures."
                )
            )
            
        try:
            cut_val, (s_part, t_part) = nx.minimum_cut(
                G, s_orig, t_orig, capacity="capacity"
            )
            max_flow_val = nx.maximum_flow_value(
                G, s_orig, t_orig, capacity="capacity"
            )
        except nx.NetworkXUnbounded:
            cut_val = float("inf")
            max_flow_val = float("inf")
            s_part, t_part = set(G.nodes), set()
            
        cut_edges = []
        for u, v in G.edges():
            if u in s_part and v in t_part:
                cut_edges.append(CriticalCutEdge(
                    source=u,
                    target=v,
                    capacity=float(G[u][v].get("capacity", 0.0))
                ))
                
        s_partition = s_part
        t_partition = t_part

    duality_verified = (
        (cut_val == float("inf") and max_flow_val == float("inf")) or
        abs(max_flow_val - cut_val) < TOLERANCE
    )
    
    interp = (
        f"Maximum directed flow is {max_flow_val:.2f} units. "
        f"The minimum (s, t)-cut consists of {len(cut_edges)} critical forward bottleneck(s) "
        f"with total cut capacity {cut_val:.2f} units."
    )
    
    return FlowResult(
        max_throughput=float(max_flow_val),
        min_cut_capacity=float(cut_val),
        critical_cut_edges=cut_edges,
        source_partition=sorted(list(s_partition)),
        sink_partition=sorted(list(t_partition)),
        duality_verified=duality_verified,
        interpretation=interp
    )
