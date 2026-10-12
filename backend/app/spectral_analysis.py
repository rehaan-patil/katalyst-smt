import numpy as np
import scipy.linalg
from typing import List, Tuple
from .schemas import Topology, SpectralResult
from .graph_engine import validate_topology

EPSILON = 1e-10

def compute_spectral_analysis(topology: Topology) -> SpectralResult:
    """
    Computes combinatorial Laplacian and algebraic connectivity (Fiedler value)
    under the documented symmetric projection:
    W_sym(u, v) = max(w(u, v), w(v, u))
    """
    validate_topology(topology)
    
    # 1. Deterministic node ordering
    sorted_nodes = sorted(topology.nodes, key=lambda n: n.id)
    node_ids = [n.id for n in sorted_nodes]
    node_idx = {nid: i for i, nid in enumerate(node_ids)}
    n = len(node_ids)
    
    # 2. Build symmetric adjacency matrix
    A = np.zeros((n, n), dtype=np.float64)
    for edge in topology.edges:
        u_idx = node_idx[edge.source]
        v_idx = node_idx[edge.target]
        w = float(edge.spectral_weight)
        # Symmetrize via max positive weight
        current = max(A[u_idx, v_idx], w)
        A[u_idx, v_idx] = current
        A[v_idx, u_idx] = current
        
    # 3. Build diagonal degree matrix
    degrees = np.sum(A, axis=1)
    D = np.diag(degrees)
    
    # 4. Form Combinatorial Laplacian L = D - A
    L = D - A
    
    # 5. Compute sorted real eigenvalues
    # Since L is real symmetric, eigh is numerically stable and optimal
    raw_evals = scipy.linalg.eigh(L, eigvals_only=True)
    
    # Clean numerical noise near zero
    evals = [0.0 if abs(val) < EPSILON else float(val) for val in raw_evals]
    evals.sort()
    
    # 6. Extract Fiedler value & connected components
    zero_evals = sum(1 for val in evals if val == 0.0)
    num_components = max(1, zero_evals)
    
    if n < 2:
        fiedler = 0.0
        score = 0.0
    else:
        fiedler = float(evals[1])
        score = float(min(1.0, max(0.0, fiedler / float(n))))
        
    # 7. Scientific interpretation
    if num_components > 1 or fiedler == 0.0:
        interp = (
            f"Physical graph is partitioned into {num_components} disconnected components "
            f"(lambda_2 = 0.00). Symmetrized fabric lacks global reachability."
        )
    elif fiedler < 0.5:
        interp = (
            f"Weak algebraic connectivity (lambda_2 = {fiedler:.3f}). The topology possesses "
            "sparse bottlenecks or articulation clusters susceptible to partition."
        )
    else:
        interp = (
            f"Robust algebraic connectivity (lambda_2 = {fiedler:.3f}). The underlying fabric "
            "exhibits dense multi-path meshing under symmetric projection."
        )
        
    return SpectralResult(
        node_order=node_ids,
        adjacency_matrix=A.tolist(),
        degree_matrix=D.tolist(),
        laplacian_matrix=L.tolist(),
        eigenvalues=evals,
        fiedler_value=fiedler,
        algebraic_connectivity_score=score,
        num_connected_components=num_components,
        interpretation=interp
    )
