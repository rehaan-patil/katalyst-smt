import time
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import z3
import scipy
import numpy as np
import networkx as nx

from app.config import settings
from app.schemas import (
    AnalyzeTopologyRequest, AnalyzeTopologyResponse,
    SuggestRepairsRequest, SuggestRepairsResponse
)
from app.graph_engine import TopologyValidationError, validate_topology
from app.spectral_analysis import compute_spectral_analysis
from app.flow_analysis import compute_flow_analysis
from app.formal_verification import verify_topology_resilience
from app.repair_engine import synthesize_repairs
from app.risk_model import evaluate_probabilistic_risk

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Resilience and SMT Verification Engine for Distributed Topologies"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

START_TIME = time.time()

@app.exception_handler(TopologyValidationError)
async def topology_validation_exception_handler(request: Request, exc: TopologyValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": str(exc), "error_type": "TopologyValidationError"}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal verification engine error", "error_type": type(exc).__name__}
    )

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "katalyst-smt",
        "version": settings.VERSION,
        "uptime_seconds": round(time.time() - START_TIME, 2),
        "engine_runtimes": {
            "z3_version": z3.get_version_string(),
            "scipy_version": scipy.__version__,
            "numpy_version": np.__version__,
            "networkx_version": nx.__version__
        }
    }

@app.get("/api/v1/analysis-capabilities", tags=["Capabilities"])
async def analysis_capabilities():
    return {
        "max_nodes": settings.MAX_NODES,
        "max_edges": settings.MAX_EDGES,
        "max_k_failure": settings.MAX_K_FAILURE,
        "supported_modes": ["at_most", "exact"],
        "default_timeout_ms": settings.SOLVER_TIMEOUT_MS,
        "spectral_method": "Symmetric combinatorial Laplacian with eigh eigensolver",
        "flow_algorithm": "NetworkX directed minimum cut with node-splitting",
        "verification_engine": "Z3 Theorem Prover with anti-cycle distance rank reachability",
        "repair_engine": "Proof-to-Repair SMT counterexample-guided synthesis"
    }

@app.post(
    "/api/v1/analyze-topology",
    response_model=AnalyzeTopologyResponse,
    tags=["Analysis"]
)
async def analyze_topology(request: AnalyzeTopologyRequest):
    t0 = time.perf_counter()
    topology = request.topology
    config = request.config
    
    # 1. Validation
    validate_topology(topology)
    
    # 2. Spectral Analysis
    spectral_res = compute_spectral_analysis(topology)
    
    # 3. Flow Analysis
    flow_res = compute_flow_analysis(topology)
    
    # 4. Z3 Formal SMT Verification
    verification_res = verify_topology_resilience(topology, config)
    
    # 5. Risk Assessment
    risk_res = evaluate_probabilistic_risk(
        topology, verification_res.counterexample_nodes
    )
    
    # 6. Warnings
    warnings = []
    if spectral_res.num_connected_components > 1:
        warnings.append("Symmetrized fabric contains disconnected clusters.")
    if not flow_res.duality_verified:
        warnings.append("Duality discrepancy detected between max flow and min cut.")
    if verification_res.status == "SAT":
        warnings.append(
            f"Vulnerability found: {len(verification_res.counterexample_nodes)} node(s) "
            "can partition the network."
        )
    elif verification_res.status == "UNKNOWN":
        warnings.append("Solver timed out during formal verification.")

    total_time_ms = (time.perf_counter() - t0) * 1000.0

    summary = {
        "node_count": len(topology.nodes),
        "edge_count": len(topology.edges),
        "source": topology.source_node_id,
        "sink": topology.sink_node_id,
        "failure_k": config.failure_k if config else 2,
        "mode": config.failure_mode if config else "at_most"
    }

    return AnalyzeTopologyResponse(
        topology_summary=summary,
        spectral=spectral_res,
        flow=flow_res,
        verification=verification_res,
        risk=risk_res,
        warnings=warnings,
        execution_duration_ms=total_time_ms
    )

@app.post(
    "/api/v1/suggest-repairs",
    response_model=SuggestRepairsResponse,
    tags=["Repair"]
)
async def suggest_repairs(request: SuggestRepairsRequest):
    return synthesize_repairs(
        topology=request.topology,
        failure_k=request.failure_k,
        constraints=request.constraints
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
