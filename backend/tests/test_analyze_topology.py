import pytest
from httpx import AsyncClient, ASGITransport
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app

@pytest.mark.asyncio
async def test_api_analyze_topology_full_pipeline():
    payload = {
        "topology": {
            "nodes": [
                {"id": "ingress", "label": "Ingress Envoy", "failure_prob": 0.005},
                {"id": "auth-svc", "label": "Auth Service", "failure_prob": 0.02},
                {"id": "order-svc", "label": "Order Service", "failure_prob": 0.02},
                {"id": "db-cluster", "label": "PostgreSQL Primary", "failure_prob": 0.001}
            ],
            "edges": [
                {"source": "ingress", "target": "auth-svc", "capacity": 50.0, "spectral_weight": 2.0},
                {"source": "auth-svc", "target": "db-cluster", "capacity": 30.0, "spectral_weight": 1.5},
                {"source": "ingress", "target": "order-svc", "capacity": 40.0, "spectral_weight": 2.0},
                {"source": "order-svc", "target": "db-cluster", "capacity": 35.0, "spectral_weight": 1.5}
            ],
            "source_node_id": "ingress",
            "sink_node_id": "db-cluster"
        },
        "config": {
            "failure_k": 2,
            "failure_mode": "at_most",
            "timeout_ms": 5000
        }
    }
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/analyze-topology", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Verify spectral data
        assert "spectral" in data
        assert data["spectral"]["fiedler_value"] > 0
        assert len(data["spectral"]["eigenvalues"]) == 4
        
        # Verify flow data
        assert "flow" in data
        assert data["flow"]["max_throughput"] > 0
        assert data["flow"]["duality_verified"] is True
        
        # Verify verification data
        assert "verification" in data
        # At k=2, failing both auth-svc and order-svc partitions ingress from db-cluster
        assert data["verification"]["status"] == "SAT"
        assert set(data["verification"]["counterexample_nodes"]) == {"auth-svc", "order-svc"}
        
        # Verify risk data
        assert "risk" in data
        assert data["risk"]["counterexample_joint_prob"] is not None

@pytest.mark.asyncio
async def test_api_suggest_repairs():
    payload = {
        "topology": {
            "nodes": [
                {"id": "ingress"},
                {"id": "single-proxy"},
                {"id": "db"}
            ],
            "edges": [
                {"source": "ingress", "target": "single-proxy", "capacity": 20.0},
                {"source": "single-proxy", "target": "db", "capacity": 20.0}
            ],
            "source_node_id": "ingress",
            "sink_node_id": "db"
        },
        "failure_k": 1
    }
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/suggest-repairs", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "single-proxy" in data["original_counterexample"]
        assert len(data["candidates"]) > 0
        assert data["recommended_candidate_id"] is not None
        
        # Candidate must have is_verified == True
        rec = next(c for c in data["candidates"] if c["candidate_id"] == data["recommended_candidate_id"])
        assert rec["is_verified"] is True
        assert rec["re_verification"]["status"] == "UNSAT"

@pytest.mark.asyncio
async def test_api_rejects_malformed_input():
    payload = {
        "topology": {
            "nodes": [{"id": "s"}],  # Only 1 node (min_length=2)
            "edges": [],
            "source_node_id": "s",
            "sink_node_id": "t"
        }
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/analyze-topology", json=payload)
        assert response.status_code in (400, 422)
