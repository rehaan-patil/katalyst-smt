# Mathematical Specification: Katalyst.SMT Engine Contract

## 1. Domain Definitions and Graph Model

### 1.1 Input Domain
A topology is a directed, capacitated graph $G = (V, E)$ defined by:
* $V$: Finite non-empty set of vertices, where each $v \in V$ has a unique string identifier `id`, optional human-readable `label`, optional capacity $c(v) \in (0, \infty]$, and optional independent failure probability $p(v) \in [0, 1]$.
* $E$: Finite set of directed edges $(u, v)$ where $u, v \in V$, $u \ne v$, with directed capacity $c(u, v) \in (0, \infty]$ and spectral weight $w(u, v) \in (0, \infty]$. Parallel edges with identical $(u, v)$ are rejected or collapsed with summed capacity.
* $s \in V$: Designated source node (e.g., Ingress Gateway).
* $t \in V$: Designated sink node (e.g., Primary Database), $t \ne s$.
* $k \in \mathbb{N}_{\ge 1}$: Maximum number of simultaneous node failures to verify (default $k=2$).
* $\text{mode} \in \{\text{"at_most"}, \text{"exact"}\}$: Failure cardinality semantics (default: `"at_most"`).

### 1.2 Output Domain
* **Spectral Domain:**
  - $A \in \mathbb{R}^{|V| \times |V|}$: Symmetrized adjacency matrix.
  - $D \in \mathbb{R}^{|V| \times |V|}$: Diagonal degree matrix.
  - $L \in \mathbb{R}^{|V| \times |V|}$: Symmetrized combinatorial Laplacian $L = D - A$.
  - $\lambda = (\lambda_1, \dots, \lambda_n) \in \mathbb{R}^{|V|}$: Sorted eigenvalues.
  - $\lambda_2 \in \mathbb{R}_{\ge 0}$: Fiedler value (algebraic connectivity).
  - Diagnostic structural robustness score $\rho_{\text{spectral}} \in [0, 1]$.
* **Flow Domain:**
  - $F_{\max} \in [0, \infty)$: Maximum $(s, t)$ network flow value.
  - $C_{\min} \in [0, \infty)$: Minimum $(s, t)$ cut capacity.
  - $\mathcal{C}_{\text{edges}} \subseteq E$: Critical bottleneck cut edges.
  - $S, T \subset V$: Cut partition sets ($s \in S, t \in T, S \cup T = V, S \cap T = \emptyset$).
* **SMT Formal Verification Domain:**
  - $\text{status} \in \{\text{"SAT"}, \text{"UNSAT"}, \text{"UNKNOWN"}\}$.
  - Counterexample failure witness $F^* \subseteq V \setminus \{s, t\}$ if SAT, with $|F^*| \le k$ (or $=k$).
  - Is $(s, t)$ resilient under $\le k$ failures? Boolean ($\text{True} \iff \text{UNSAT}$).
  - Proof certificate description.
* **Proof-to-Repair Domain:**
  - Feasible candidate repairs $\mathcal{R} = \{\Delta E_1, \dots\}$.
  - Recommended repair $\Delta E^*$ minimizing cost $J(\Delta E)$.
  - Formal re-verification status of $G' = (V, E \cup \Delta E^*)$.

---

## 2. Feature Specification 1: Spectral Analysis

### 2.1 Graph Assumptions & Projection
1. The routing graph is directed.
2. The spectral projection $W_{\text{sym}}: V \times V \to \mathbb{R}_{\ge 0}$ is:
   $$W_{\text{sym}}(u, v) = \begin{cases} \max\bigl(w(u, v), w(v, u)\bigr) & \text{if } (u, v) \in E \lor (v, u) \in E \\ 0 & \text{otherwise} \end{cases}$$
3. Self-loops are excluded from $W_{\text{sym}}$ ($W_{\text{sym}}(u, u) = 0$).

### 2.2 Algorithm & Implementation
1. Construct symmetric adjacency matrix $A$ where $A_{ij} = W_{\text{sym}}(v_i, v_j)$ using a deterministic sorting of node IDs.
2. Compute diagonal degree matrix $D_{ii} = \sum_{j=1}^n A_{ij}$.
3. Form Laplacian $L = D - A$.
4. Compute eigenvalues using `scipy.linalg.eigh(L, eigvals_only=True)`.
5. Extract $\lambda_1 \le \lambda_2 \le \dots \le \lambda_n$.
6. Normalized diagnostic score:
   $$\rho_{\text{spectral}} = \min\left(1.0, \frac{\lambda_2}{|V|}\right)$$
   (Normalized against the theoretical maximum $\lambda_2 \le |V|$ for complete graphs with unit weights).

### 2.3 Edge Cases & Numerical Boundaries
* **Small Graphs ($|V| < 2$):** If $|V| = 1$, $\lambda_2 = 0.0$.
* **Disconnected Graphs:** If symmetric graph has $\ge 2$ connected components, $\lambda_2 = 0.0$ (multiplicity of 0 is $\ge 2$).
* **Numerical Zero Tolerance:** Any eigenvalue $|\lambda| < 10^{-10}$ is clamped to $0.0$.

### 2.4 Worked Example
Consider a 3-node path: $v_1 \to v_2 \to v_3$ with unit weights $1.0$.
* Symmetrized edges: $(v_1, v_2)$, $(v_2, v_3)$ with weight $1.0$.
* Degrees: $d_1 = 1, d_2 = 2, d_3 = 1$.
* Laplacian:
  $$L = \begin{pmatrix} 1 & -1 & 0 \\ -1 & 2 & -1 \\ 0 & -1 & 1 \end{pmatrix}$$
* Characteristic polynomial: $\det(L - \lambda I) = -\lambda (\lambda - 1)(\lambda - 3) = 0$.
* Eigenvalues: $\lambda_1 = 0.0, \lambda_2 = 1.0, \lambda_3 = 3.0$.
* Fiedler value: $\lambda_2 = 1.0$.

---

## 3. Feature Specification 2: Directed Max-Flow & Min-Cut

### 3.1 Algorithm
1. Construct directed graph $D = (V, E)$ in NetworkX with edge capacity attribute `capacity = c(u, v)`.
2. When node capacities $c(v)$ are present, apply node splitting:
   - For each node $v \in V \setminus \{s, t\}$ with finite $c(v)$, replace $v$ with $v_{\text{in}}, v_{\text{out}}$ with directed capacity $c(v)$.
3. Run `nx.minimum_cut(D, s, t, capacity='capacity')` (Edmonds-Karp / Boykov-Kolmogorov).
4. Returns cut value $C_{\min}$, reachable partition $S$, and unreachable partition $T = V \setminus S$.
5. Critical cut edges:
   $$\mathcal{C}_{\text{edges}} = \{(u, v) \in E \mid u \in S, v \in T\}$$

### 3.2 Worked Example
Nodes $s, a, b, t$. Edges: $(s, a, 10)$, $(s, b, 10)$, $(a, t, 5)$, $(b, t, 15)$.
* Max-flow: Through $a$ is 5, through $b$ is 10. Total max-flow = $5 + 10 = 15$.
* Min-cut: $S = \{s, a, b\}$, $T = \{t\}$.
* Forward edges in cut: $(a, t)$ with capacity 5, $(b, t)$ with capacity 15... wait, cut partition $S = \{s, b\}, T = \{a, t\}$ gives cut capacity $c(s, a) + c(b, t) = 10 + 15 = 25$.
* But if $S = \{s, b\}, T = \{a, t\}$, forward edge is $(s, a)$ (cap 10) and $(b, t)$ (cap 15) = 25.
* Minimum cut is $S = \{s, b\}, T = \{a, t\}$? No, forward edge from $S$ to $T$: $(s, a)$ cap 10, $(a, t)$ is in $T$, $(b, t)$ is from $b \in S$ to $t \in T$ cap 15 $\implies 25$.
* If $S = \{s\}, T = \{a, b, t\}$, cut edges $(s, a), (s, b)$ cap $10 + 10 = 20$.
* If $S = \{s, b, a\}, T = \{t\}$, cut edges $(a, t)$ (cap 5) and $(b, t)$ (cap 15) cap $= 20$.
* If $S = \{s, b, a\}$? Wait! Can we send 10 to $b$ and 5 to $a$? Yes! Max-flow is $\min(10, 5) + \min(10, 15) = 5 + 10 = 15$. Cut capacity $= 15$ with $S = \{s, b\}, T = \{a, t\}$? In that case edge $(b, t)$ cap 15... wait, if $S=\{s, a\}, T=\{b, t\}$, forward edges are $(s, b)$ (cap 10) and $(a, t)$ (cap 5) $= 10 + 5 = 15$. This achieves 15!
* Verification: Max-flow = 15 == Min-cut = 15. Exactly duality holds!

---

## 4. Feature Specification 3: Z3 Formal Verification

### 4.1 SMT Encoding Contract
1. For each node $v \in V \setminus \{s, t\}$, instantiate Z3 `Bool(f_v)` indicating whether node $v$ is failed.
2. Active condition: $a_v = \neg f_v$. For terminals: $a_s = \text{True}, a_t = \text{True}$.
3. For each node $v \in V$, instantiate Z3 `Bool(R_v)` and integer `Int(d_v)` with bounds $0 \le d_v \le |V|$.
4. Constraints:
   - Source: $R_s \land (d_s == 0)$.
   - For all $v \ne s$:
     $$R_v == \left( a_v \land \bigvee_{(u, v) \in E} (R_u \land (d_v == d_u + 1)) \right)$$
   - Cardinality:
     - If mode is `"at_most"`: $\sum_{v} \text{If}(f_v, 1, 0) \le k$.
     - If mode is `"exact"`: $\sum_{v} \text{If}(f_v, 1, 0) == k$.
   - Counterexample target: $\neg R_t$.
5. Solver execution:
   - Instantiate `z3.Solver()`.
   - Set timeout: `solver.set("timeout", timeout_ms)`.
   - Result:
     - If `sat`: Extract model $M$. Failure set $F^* = \{v \mid M.eval(f_v) == \text{True}\}$.
     - If `unsat`: Mathematical proof that invariant holds across all failure configurations.
     - If `unknown`: Solver timeout or resource exhaustion.

### 4.2 Independent Validation Method
In automated test suites, for any graph with $|V| \le 12$, compute the ground truth by **exhaustive combinatorial enumeration**:
Test all $\sum_{i=1}^k \binom{|V|-2}{i}$ combinations using NetworkX `has_path(G \setminus F, s, t)`.
The Z3 output must match the exhaustive search ground truth with 100% fidelity.

---

## 5. Feature Specification 4: The Proof-to-Repair Workflow

### 5.1 Formulation
Given counterexample $F^*$ on graph $G$:
1. Root cause cut partition: Compute $S = \text{ReachableNodes}(G \setminus F^*, s)$ and $T = V \setminus (S \cup F^*)$.
2. Candidate edge generation:
   $$\text{Candidates} = \{(u, v) \mid u \in S, v \in T, (u, v) \notin E, u \ne v\}$$
   Filter by architectural tier constraints (e.g., ingress $s$ can connect to tier-1 services, intermediate services can connect to downstream peers).
3. Candidate cost function:
   $$\text{Cost}(u, v) = \text{base\_cost} + \alpha \cdot \text{distance\_penalty}(u, v)$$
4. Candidate ranking & selection:
   Sort candidates by cost ascending.
5. Topological mutation:
   Form candidate graph $G' = (V, E \cup \{(u^*, v^*)\})$ with capacity initialized to match the bottleneck flow deficit.
6. Re-Verification:
   Execute the exact same Z3 solver verification on $G'$.
   - If $G'$ produces `unsat` at failure parameter $k$, the repair is **Formally Verified**.
   - If $G'$ remains `sat`, report new counterexample and residual vulnerability.
