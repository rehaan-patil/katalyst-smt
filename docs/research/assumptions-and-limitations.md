# Assumptions and Limitations

## 1. Explicit Architectural and Mathematical Assumptions

To maintain scientific integrity and prevent misleading reliability assertions, Katalyst.SMT operates under the following explicit assumptions:

### 1.1 Topology and Graph Semantics
1. **Designated Terminals:** The system designates a primary source node $s$ (e.g., Ingress Gateway) and sink node $t$ (e.g., Primary Database). Terminals are protected from failure during intermediate cut verification ($s, t \notin F$). If either $s$ or $t$ fails, end-to-end communication is vacuously broken.
2. **Directed Capacity Semantics:** Edge capacities $c(u, v) \ge 0$ define the maximum rate of flow from $u$ to $v$. Reverse capacity $c(v, u)$ is independent and defaults to 0 unless an explicit bidirectional edge exists.
3. **Node Failures as Complete Disablement:** When a node $v$ fails, all incoming edges $(u, v)$ and outgoing edges $(v, w)$ are disabled. Partial degradation (e.g., 50% packet drop) is modeled via flow capacity reduction rather than binary node failure.
4. **Spectral Projection Symmetrization:** Spectral graph metrics ($\lambda_2$, Laplacian matrices) use the symmetric projection $W_{\text{sym}}(i, j) = \max(W(i, j), W(j, i))$. A positive $\lambda_2 > 0$ indicates physical connectivity, but **does not guarantee directed reachability**.
5. **Bounded SMT Distance Rank:** SMT reachability variables use integer ranks $d_v \in [0, |V|]$. Simple paths in any graph of order $n$ have at most $n-1$ edges; bounding $d_v \le |V|$ strictly eliminates infinite loops and spurious cyclic models while remaining complete.

---

## 2. Documented System Limitations

### 2.1 What Katalyst.SMT Does NOT Guarantee
* **Zero Production Outage Guarantee:** Formal verification certifies that *under the declared model and failure assumptions*, no $k$-node failure disconnects $s$ from $t$. It does not guarantee against unmodeled physical disasters (e.g., simultaneous worldwide DNS outage, data center power grid failure).
* **Application-Level Bug Immunity:** Topologies may be 3-resilient structurally, but application-level deadlocks, SQL syntax errors, or memory leaks within an active pod will still cause transaction failures.
* **Non-Instantaneous Re-routing:** In real networks, BGP/OSPF convergence or service mesh endpoint reconciliation takes tens to hundreds of milliseconds. During this transient window, dropped packets occur.

### 2.2 Algorithmic and Numerical Boundaries
* **Solver Timeouts:** Z3 verification employs a configurable timeout (default: 5,000 ms). If the solver returns `UNKNOWN`, the system records the state honestly and alerts the user rather than claiming resilience.
* **Eigensolver Precision:** SciPy `eigh` operates in IEEE 754 double precision (`float64`). Eigenvalues smaller than $\epsilon = 10^{-10}$ are treated as numerical zero to prevent roundoff errors from falsifying connected component counts.
* **Repair Admissibility Limits:** The repair engine will not suggest links between forbidden layers (e.g., connecting an unauthenticated external client directly to an internal database bypass) if architectural constraints forbid it.
