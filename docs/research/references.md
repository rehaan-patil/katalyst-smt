# Research References and Primary Sources

## 1. Peer-Reviewed Academic Literature

1. **Fiedler, Miroslav (1973).** "Algebraic Connectivity of Graphs." *Czechoslovak Mathematical Journal*, 23(98), No. 2, pp. 298–305.
   - DOI: [10.21136/CMJ.1973.101168](https://doi.org/10.21136/CMJ.1973.101168)
   - *Supported Claim:* Definition of graph Laplacian $L = D - A$, algebraic connectivity $\lambda_2$, and proof that $\lambda_2 > 0 \iff$ graph is connected.

2. **Chung, Fan (2005).** "Laplacians and the Cheeger Inequality for Directed Graphs." *Annals of Combinatorics*, 9(1), pp. 1–19.
   - DOI: [10.1007/s00026-005-0237-z](https://doi.org/10.1007/s00026-005-0237-z)
   - *Supported Claim:* Formulation of directed graph Laplacians via stationary distributions, and fundamental limitations on acyclic or non-strongly connected directed graphs.

3. **Menger, Karl (1927).** "Zur allgemeinen Kurventheorie." *Fundamenta Mathematicae*, 10, pp. 96–115.
   - Persistent Link: [http://matwbn.icm.edu.pl/ksiazki/fm/fm10/fm1018.pdf](http://matwbn.icm.edu.pl/ksiazki/fm/fm10/fm1018.pdf)
   - *Supported Claim:* Vertex connectivity equivalence to pairwise internally vertex-disjoint paths in directed graphs.

4. **Ford, L. R., & Fulkerson, D. R. (1956).** "Maximal Flow Through a Network." *Canadian Journal of Mathematics*, 8, pp. 399–404.
   - DOI: [10.4153/CJM-1956-045-5](https://doi.org/10.4153/CJM-1956-045-5)
   - *Supported Claim:* Max-Flow Min-Cut duality theorem and augmenting path formulation.

5. **Edmonds, Jack, & Karp, Richard M. (1972).** "Theoretical Improvements in Algorithmic Efficiency for Network Flow Problems." *Journal of the ACM*, 19(2), pp. 248–264.
   - DOI: [10.1145/321694.321699](https://doi.org/10.1145/321694.321699)
   - *Supported Claim:* Shortest augmenting path (Edmonds-Karp) algorithm running in $O(|V| |E|^2)$ time.

6. **De Moura, Leonardo, & Bjørner, Nikolaj (2008).** "Z3: An Efficient SMT Solver." *Tools and Algorithms for the Construction and Analysis of Systems (TACAS 2008)*, Lecture Notes in Computer Science, Vol. 4963, pp. 337–340. Springer, Berlin, Heidelberg.
   - DOI: [10.1007/978-3-540-78800-3_24](https://doi.org/10.1007/978-3-540-78800-3_24)
   - *Supported Claim:* DPLL(T) architecture, QF-LIA theory solving, and cardinality constraints.

7. **Beckett, Ryan, Gupta, Aarti, Mahajan, Ratul, & Walker, David (2017).** "A General Approach to Network Configuration Verification." *ACM SIGCOMM 2017 Conference*, pp. 155–168.
   - DOI: [10.1145/3098822.3098834](https://doi.org/10.1145/3098822.3098834)
   - *Supported Claim:* SMT encoding of network reachability invariants and bounded path distance constraints preventing cyclic spurious loops.

8. **Goemans, Michel X., & Williamson, David P. (1995).** "A General Approximation Technique for Constrained Forest Problems." *SIAM Journal on Computing*, 24(2), pp. 296–317.
   - DOI: [10.1137/S0097539793244224](https://doi.org/10.1137/S0097539793244224)
   - *Supported Claim:* Primal-dual approximation framework for Survivable Network Design (SNDP).

9. **Fogel, Ari, Fung, C., Pedrosa, L., et al. (2015).** "A General Approach to Network Configuration Analysis based on Declarative Programming." *12th USENIX Symposium on Networked Systems Design and Implementation (NSDI 15)*, pp. 325–339.
   - *Supported Claim:* Static configuration parsing vs. data-plane reachability analysis.

---

## 2. Software Systems and Standards

1. **Z3 Theorem Prover (Microsoft Research):** GitHub repository: `https://github.com/Z3Prover/z3`. Python bindings: `z3-solver`.
2. **NetworkX:** Hagberg, A. A., Schult, D. A., & Swart, P. J. (2008). "Exploring Network Structure, Dynamics, and Function using NetworkX." *Proceedings of the 7th Python in Science Conference (SciPy2008)*, pp. 11–15.
3. **SciPy Eigensolvers:** Virtanen, P., Gommers, R., Oliphant, T. E., et al. (2020). "SciPy 1.0: Fundamental Algorithms for Scientific Computing in Python." *Nature Methods*, 17(3), pp. 261–272.
4. **Chaos Mesh:** CNCF Incubating Project, PingCAP, `https://github.com/chaos-mesh/chaos-mesh`.
5. **LitmusChaos:** CNCF Incubating Project, `https://github.com/litmuschaos/litmus`.
