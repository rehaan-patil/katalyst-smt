# Threat Model & Security Architecture

## 1. System Assets & Trust Boundaries

### 1.1 Critical Assets
1. **Infrastructure Topology Definitions:** Architecture schemas disclosing sensitive cloud infrastructure topology, service identities, gateway configurations, and database endpoints.
2. **Computational Engine Availability:** High-memory and CPU resources powering scientific eigensolvers, NetworkX flow computations, and Z3 SMT solver routines.
3. **Integrity of Mathematical Certificates:** The authenticity of formal verification claims (`UNSAT` vs. `SAT`). Falsified claims could lead engineers to deploy fragile systems into production under a false sense of security.

### 1.2 Trust Boundaries
* **Boundary A (Public Internet to API Gateway):** Ingress requests from untrusted clients into the FastAPI service.
* **Boundary B (API Gateway to Mathematical Engines):** In-memory parsing of client-supplied graph structures into SciPy and Z3 C++ engine memory spaces.
* **Boundary C (Frontend to External Services):** Browser execution boundary; no private tokens or API keys exposed to client bundles.

---

## 2. Threat Analysis & Mitigations

### 2.1 Threat: SMT Algorithmic Complexity Attack (Solver Bomb / DoS)
* **Risk:** An adversary submits an adversarial graph with dense cycles or pathological constraint structures designed to force exponential clause learning in Z3, exhausting backend CPU and memory.
* **Mitigation:**
  1. **Strict Input Dimension Limits:** Max nodes: $|V| \le 150$; max edges: $|E| \le 600$; max failure budget $k \le 5$.
  2. **Hard Solver Timeouts:** Every Z3 solver instance executes with a mandatory timeout parameter (`solver.set("timeout", 5000)` ms). If computation exceeds 5 seconds, it terminates with `UNKNOWN`.
  3. **Process Sandboxing & Memory Limits:** API execution workers are bounded in memory and CPU quota via Docker container constraints.

### 2.2 Threat: Data Injection and Identifier Poisoning
* **Risk:** Malicious node IDs containing control characters, ANSI escape sequences, or script injection tags designed to compromise web UI rendering or logging pipelines.
* **Mitigation:**
  1. **Strict Regex Validation:** Node and edge IDs must strictly match `^[a-zA-Z0-9_\-\.]{1,64}$`.
  2. **Sanitization:** All labels are HTML-escaped during client rendering via React's default DOM escaping.

### 2.3 Threat: Cross-Origin Resource Sharing (CORS) Misconfiguration
* **Risk:** Arbitrary external websites executing cross-origin requests to exfiltrate topology definitions from an intranet deployment.
* **Mitigation:**
  1. Explicitly configured CORS middleware via `ALLOWED_ORIGINS` environment variable.
  2. Default to restrictive origins; wildcard `*` strictly disallowed in production deployments.

### 2.4 Threat: Information Leakage via Stack Traces
* **Risk:** Unhandled exceptions exposing server filesystem paths, internal package versions, or environment configuration in HTTP 500 responses.
* **Mitigation:**
  1. Centralized FastAPI global exception handler catches unexpected exceptions.
  2. Sanitized error envelopes returning structured JSON error payloads with request IDs.
