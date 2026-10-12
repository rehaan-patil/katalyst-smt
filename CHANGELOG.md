# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-12

### Added
* **Formal Verification Core**: Z3 SMT prover integration for simultaneous node failure reachability analysis with Menger cut-closure constraints.
* **Proof-to-Repair Engine**: SMT counterexample-guided remediation synthesis with formal Z3 re-verification and cost-optimal candidate ranking.
* **Spectral Analysis**: Combinatorial Graph Laplacian $L = D - A$, algebraic connectivity (Fiedler value $\lambda_2$), and normalized robustness scoring with real symmetric eigensolver (`scipy.linalg.eigh`).
* **Directed Network Flow**: Edmonds-Karp maximum flow and minimum cut duality verification with node-splitting capacity constraints.
* **Professional Workspace UI**: Blackbox.ai-inspired technical dark workspace with `@xyflow/react` topology canvas, interactive telemetry drawer, node inspector, and floating execution dock.
* **API Endpoints**: `/health`, `/api/v1/analysis-capabilities`, `/api/v1/analyze-topology`, and `/api/v1/suggest-repairs`.
* **Zero-Known-Defect Quality Suite**: 27 automated tests covering spectral eigenvalues, flow duality, SMT counterexamples, combinatorial cross-validation, and HTTP endpoints.
