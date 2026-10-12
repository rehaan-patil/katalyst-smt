# Mathematical Foundations: Spectral Theory, SMT Verification, and Network Flow

## 1. Spectral Graph Theory and Algebraic Connectivity

### 1.1 Combinatorial Graph Laplacian
Let $G = (V, E)$ be a graph with $n = |V|$ nodes indexed $1, \dots, n$, and non-negative edge weights $w_{ij} \ge 0$.
The **adjacency matrix** $A \in \mathbb{R}^{n \times n}$ has entries $A_{ij} = w_{ij}$ for $(i, j) \in E$, and $0$ otherwise.
The **degree matrix** $D \in \mathbb{R}^{n \times n}$ is diagonal, with:
$$D_{ii} = \sum_{j=1}^n A_{ij}, \quad D_{ij} = 0 \text{ for } i \ne j$$

The **combinatorial Laplacian matrix** $L \in \mathbb{R}^{n \times n}$ is defined as:
$$L = D - A$$

### 1.2 Spectral Properties of Symmetric Laplacians
When $A$ is symmetric ($A_{ij} = A_{ji}$):
1. **Positive Semi-definiteness:** For any vector $x \in \mathbb{R}^n$:
   $$x^T L x = \sum_{(i,j) \in E} w_{ij} (x_i - x_j)^2 \ge 0$$
   Therefore, all eigenvalues of $L$ are real and non-negative:
   $$0 = \lambda_1 \le \lambda_2 \le \dots \le \lambda_n$$
2. **Trivial Eigenvector:** The constant vector $\mathbf{1} = (1, 1, \dots, 1)^T$ satisfies $L \mathbf{1} = \mathbf{0}$, corresponding to eigenvalue $\lambda_1 = 0$.
3. **Connected Components Theorem:** The multiplicity of eigenvalue 0 equals the number of connected components in the graph. Specifically, $\lambda_2 > 0$ if and only if $G$ is connected.
4. **Fiedler Value $\lambda_2$ (Algebraic Connectivity):**
   $$\lambda_2 = \min_{x \perp \mathbf{1}, x \ne \mathbf{0}} \frac{x^T L x}{x^T x}$$
   The eigenvector $v_2$ corresponding to $\lambda_2$ is known as the **Fiedler vector**, widely used in spectral bisection to partition a graph into two loosely coupled clusters.

### 1.3 Directed Routing Graphs and Symmetric Projection
Real-world infrastructure topologies are **directed graphs**. A standard directed adjacency matrix $A$ produces an asymmetric Laplacian $L = D_{\text{out}} - A$, whose eigenvalues can be complex numbers. While Fan Chung (2005) established a directed Laplacian for strongly connected graphs using the stationary distribution $\phi$, infrastructure topologies have distinct ingress sources and database sinks, meaning no positive stationary distribution exists.

To provide a mathematically sound spectral indicator, Katalyst.SMT defines an **undirected spectral projection**:
$$W_{\text{sym}}(i, j) = \max\bigl(W(i, j), W(j, i)\bigr)$$
* **Interpretation:** $W_{\text{sym}}$ models the *underlying physical communication fabric*. If $\lambda_2(L_{\text{sym}}) = 0$, the infrastructure is physically partitioned into disconnected components.
* **Limitations (Explicitly Disclosed):** $\lambda_2(L_{\text{sym}}) > 0$ is a necessary, but **not sufficient**, condition for directed $(s, t)$-reachability. A graph with edge $t \to s$ has $\lambda_2 > 0$, but zero traffic can flow from $s$ to $t$. Hence, spectral metrics serve as structural diagnostics, whereas directed resilience is strictly verified by SMT.

---

## 2. Directed Reachability and SMT Encoding

### 2.1 The Combinatorial Problem
Let $G = (V, E)$ be a directed graph. Ingress source $s \in V$ and sink $t \in V$ are designated terminal nodes.
A failure set $F \subseteq V \setminus \{s, t\}$ represents failed intermediate nodes.
The residual graph after failure is $G \setminus F = (V \setminus F, E \cap ((V \setminus F) \times (V \setminus F)))$.

**Resilience Property $\mathcal{P}_k$:**
For every failure subset $F \subseteq V \setminus \{s, t\}$ with cardinality $|F| \le k$, there exists at least one directed path from $s$ to $t$ in $G \setminus F$.

**Counterexample Search:**
Find an assignment of failures $F \subseteq V \setminus \{s, t\}$ such that:
$$|F| \le k \quad \land \quad \neg \text{Reachable}_{G \setminus F}(s, t)$$

### 2.2 SMT Formal Encoding in Z3

To prevent cycle-induced false positive reachability (where two disconnected nodes $u, v$ satisfy $R_u \iff R_v$ along a directed cycle), we employ a **bounded distance rank encoding**:

1. **Failure Variables:** For each non-terminal node $v \in V \setminus \{s, t\}$, define Boolean variable $f_v \in \{\text{True}, \text{False}\}$.
   - Active state: $a_v = \neg f_v$.
   - Terminals are protected: $a_s = \text{True}$, $a_t = \text{True}$.
2. **Reachability Indicators:** For each node $v \in V$, define Boolean variable $R_v \in \{\text{True}, \text{False}\}$.
3. **Distance Rank Variables:** For each node $v \in V$, define integer variable $d_v \in [0, |V|]$.
4. **Base Case (Source):**
   $$R_s = \text{True} \quad \land \quad d_s = 0$$
5. **Inductive Step (Non-Source Nodes $v \ne s$):**
   $$R_v \iff \left( a_v \land \bigvee_{(u, v) \in E} (R_u \land d_v = d_u + 1) \right)$$
   For any node with in-degree 0 (other than $s$), $R_v = \text{False}$.
6. **Failure Cardinality Constraint:**
   $$\sum_{v \in V \setminus \{s, t\}} \text{ite}(f_v, 1, 0) \le k$$
7. **Disconnection Objective (Counterexample Target):**
   $$R_t = \text{False}$$

### 2.3 Solver Semantics and Soundness
* **SAT:** The solver returns a satisfying assignment $M$. The failure set $F^* = \{v \in V \setminus \{s, t\} \mid M(f_v) = \text{True}\}$ is a concrete, sound witness disconnecting $s$ from $t$.
* **UNSAT:** Proves that across all $\sum_{i=1}^k \binom{|V|-2}{i}$ combinations, no qualifying failure set can disconnect $s$ from $t$. By Menger's theorem, the directed vertex connectivity $\kappa_v(s, t) \ge k + 1$.
* **UNKNOWN:** Returned on solver timeout or resource exhaustion; explicitly presented as inconclusive.

---

## 3. Directed Max-Flow / Min-Cut Duality

### 3.1 Network Flow Model
Let $c: E \to \mathbb{R}_{\ge 0}$ denote edge capacity. A feasible flow $f: E \to \mathbb{R}_{\ge 0}$ satisfies:
1. **Capacity Constraint:** $0 \le f(u, v) \le c(u, v)$ for all $(u, v) \in E$.
2. **Flow Conservation:** For all $v \in V \setminus \{s, t\}$:
   $$\sum_{u: (u, v) \in E} f(u, v) = \sum_{w: (v, w) \in E} f(v, w)$$

The maximum flow value $|f^*| = \sum_{w: (s, w) \in E} f(s, w) - \sum_{u: (u, s) \in E} f(u, s)$.

### 3.2 Minimum Directed Cut
An $(s, t)$-cut is a partition of $V$ into disjoint sets $S$ and $T = V \setminus S$ such that $s \in S$ and $t \in T$.
The capacity of the cut is the sum of capacities of forward edges:
$$C(S, T) = \sum_{u \in S, v \in T, (u, v) \in E} c(u, v)$$

By the Max-Flow Min-Cut Theorem (Ford & Fulkerson, 1956):
$$\max |f| = \min_{S, T} C(S, T)$$
The set of critical forward edges $\{(u, v) \in E \mid u \in S, v \in T\}$ defines the exact structural bottleneck constraining system throughput.

### 3.3 Node Capacities via Node-Splitting
When nodes possess finite concurrency limits $c_v < \infty$:
1. Replace each node $v$ with two vertices: $v_{\text{in}}$ and $v_{\text{out}}$.
2. Add a directed edge $(v_{\text{in}}, v_{\text{out}})$ with capacity $c_v$.
3. Re-route all incoming edges $(u, v)$ to $(u_{\text{out}}, v_{\text{in}})$.
4. Re-route all outgoing edges $(v, w)$ to $(v_{\text{out}}, w_{\text{in}})$.
This preserves exact flow semantics while directly exposing node processing bottlenecks in the min-cut.

---

## 4. Probabilistic Failure and Reliability Estimation

When individual failure probabilities $p_v \in [0, 1]$ are provided:
* Under the assumption of independent node failures, the joint probability of a specific failure set $F^*$ occurring is:
  $$\Pr(F^*) = \prod_{v \in F^*} p_v \prod_{u \notin F^*, u \ne s, t} (1 - p_u)$$
* The probability of a catastrophic disconnection event is bounded below by the probability of the most likely minimal cut counterexample:
  $$\Pr(\text{Outage}) \ge \max_{F^* \in \text{Cuts}} \prod_{v \in F^*} p_v$$
* Katalyst.SMT strictly separates this probabilistic metric from SMT proof: high availability probability does not substitute for deterministic $k$-fault tolerance.
