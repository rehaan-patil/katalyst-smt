# Literature Review: Foundational Mathematics and Verification Research

## 1. Spectral Graph Theory and Algebraic Connectivity

### 1.1 Fiedler's Algebraic Connectivity (1973)
* **Citation:** Fiedler, M. (1973). "Algebraic Connectivity of Graphs." *Czechoslovak Mathematical Journal*, 23(98), No. 2, pp. 298–305. DOI: `10.21136/CMJ.1973.101168`.
* **Mathematical Claim:** For an undirected, unweighted graph $G = (V, E)$ with combinatorial Laplacian $L = D - A$ (where $D$ is the diagonal degree matrix and $A$ is the adjacency matrix), the eigenvalues are real, non-negative, and ordered $0 = \lambda_1 \le \lambda_2 \le \dots \le \lambda_n$. Fiedler defined $\lambda_2$ as the **algebraic connectivity** of $G$.
* **Key Proven Theorem:** $G$ is connected if and only if $\lambda_2 > 0$. The multiplicity of eigenvalue 0 equals the number of connected components in $G$. Furthermore, $\lambda_2 \le \kappa_v(G) \le \kappa_e(G)$, where $\kappa_v$ is vertex connectivity and $\kappa_e$ is edge connectivity.
* **Engineering Implications for Katalyst.SMT:** While $\lambda_2$ provides a continuous, spectral proxy for global network robustness, it is fundamentally an undirected metric. For directed routing graphs, an undirected symmetrization must be applied and its semantic limits explicitly stated.

### 1.2 Directed Graph Laplacians (Fan Chung, 2005)
* **Citation:** Chung, F. (2005). "Laplacians and the Cheeger Inequality for Directed Graphs." *Annals of Combinatorics*, 9(1), pp. 1–19. DOI: `10.1007/s00026-005-0237-z`.
* **Mathematical Claim:** For strongly connected, directed graphs with stationary distribution $\Phi = \text{diag}(\phi_1, \dots, \phi_n)$ from random walks on transition probability matrix $P$, the directed normalized Laplacian is defined as $\mathcal{L} = I - \frac{1}{2}(\Phi^{1/2} P \Phi^{-1/2} + \Phi^{-1/2} P^T \Phi^{1/2})$.
* **Limitation in Practice:** Arbitrary infrastructure service graphs are **rarely strongly connected** (ingress gateways have in-degree 0; terminal databases have out-degree 0). Consequently, a valid stationary probability vector $\phi > 0$ does not exist without artificial restart vectors (PageRank-style teleportation), which distort structural connectivity.
* **Architectural Decision:** Katalyst.SMT adopts an explicit, well-defined symmetric projection for spectral analysis: $W_{\text{sym}}(u, v) = \max(W(u, v), W(v, u))$. This models whether any physical communication channel exists between services, while directed routing and failure reachability are delegated to SMT verification.

---

## 2. Graph Connectivity, Cuts, and Network Flows

### 2.1 Menger's Theorem (1927)
* **Citation:** Menger, K. (1927). "Zur allgemeinen Kurventheorie." *Fundamenta Mathematicae*, 10, pp. 96–115.
* **Mathematical Claim:** In a directed graph $G = (V, E)$, the maximum number of pairwise internally vertex-disjoint directed paths between two non-adjacent vertices $s$ and $t$ equals the minimum number of vertices whose removal disconnects $s$ from $t$ (the minimum directed $(s, t)$-vertex cut).
* **Corollary for Katalyst.SMT:** A topology is guaranteed to tolerate any simultaneous failure of at most $k$ non-terminal nodes without disconnecting $s$ from $t$ **if and only if** the minimum directed vertex cut strictly exceeds $k$ (i.e., minimum vertex cut $\ge k + 1$).

### 2.2 Maximum-Flow / Minimum-Cut Duality
* **Citations:**
  - Ford, L. R., & Fulkerson, D. R. (1956). "Maximal flow through a network." *Canadian Journal of Mathematics*, 8, pp. 399–404.
  - Edmonds, J., & Karp, R. M. (1972). "Theoretical improvements in algorithmic efficiency for network flow problems." *Journal of the ACM*, 19(2), pp. 248–264.
* **Mathematical Claim:** The maximum value of an $(s, t)$-flow equals the minimum capacity of an $(s, t)$-cut. With integer capacities, Edmonds-Karp runs in $O(|V| |E|^2)$ time.
* **Node Capacity Transformation:** In service meshes, services have finite concurrency or processing limits. We model node capacity $c(v)$ using the standard node-splitting technique: each node $v$ is split into $v_{\text{in}}$ and $v_{\text{out}}$ connected by a directed internal edge $(v_{\text{in}}, v_{\text{out}})$ with capacity $c(v)$, while incoming edges target $v_{\text{in}}$ and outgoing edges originate from $v_{\text{out}}$.

---

## 3. SMT-Based Formal Verification of Networks

### 3.1 Z3 Theorem Prover
* **Citation:** De Moura, L., & Bjørner, N. (2008). "Z3: An Efficient SMT Solver." *Tools and Algorithms for the Construction and Analysis of Systems (TACAS 2008)*, LNCS 4963, pp. 337–340.
* **Relevance:** Z3 provides industrial-grade quantifier-free linear integer arithmetic (QF-LIA) and propositional logic solving with DPLL(T) architecture and built-in cardinality constraints (`AtMost`, `PbLe`).

### 3.2 SMT Network Verification (Beckett et al. 2017, Minesweeper)
* **Citation:** Beckett, R., Gupta, A., Mahajan, R., & Walker, D. (2017). "A General Approach to Network Configuration Verification." *ACM SIGCOMM 2017*, pp. 155–168.
* **Key Methodology:** Minesweeper encodes routing protocols (BGP, OSPF) and network data-plane reachability into SMT constraints. It verifies properties such as fault-tolerance by posing queries of the form: "Does there exist a link/node failure pattern of size $\le k$ that violates invariant $\phi$?"
* **Reachability Encoding Soundness:** In cyclic graphs, a naive reachability encoding $R_v \iff \bigvee_{(u, v)} R_u$ admits false cyclic loops (spurious models where disconnected cycles satisfy mutual reachability). Beckett et al. resolve this by incorporating **bounded distance / path ranks** $d_v \in [0, |V|]$: an edge $(u, v)$ propagates reachability only if $d_v > d_u$. This guarantees acyclic, sound path validation.

---

## 4. Survivable Network Design (SNDP) and Combinatorial Optimization

### 4.1 Primal-Dual Approximation in Network Design
* **Citation:** Goemans, M. X., & Williamson, D. P. (1995). "A general approximation technique for constrained forest problems." *SIAM Journal on Computing*, 24(2), pp. 296–317.
* **Citation:** Jain, K. (2001). "A factor 2 approximation algorithm for the generalized Steiner network problem." *Combinatorica*, 21(1), pp. 39–60.
* **Relevance:** Finding a minimum-cost set of candidate edges to increase graph connectivity to a required threshold is NP-hard. For small-to-medium enterprise service topologies ($|V| \le 100$), exact bounded combinatorial search or mixed integer formulations over structural cut candidates provide provably optimal repairs without relying on unbounded heuristics.
