import pytest
from httpx import AsyncClient, ASGITransport
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "katalyst-smt"
        assert "z3_version" in data["engine_runtimes"]
        assert "scipy_version" in data["engine_runtimes"]
        assert "numpy_version" in data["engine_runtimes"]

@pytest.mark.asyncio
async def test_capabilities_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/analysis-capabilities")
        assert response.status_code == 200
        data = response.json()
        assert data["max_nodes"] > 0
        assert data["max_edges"] > 0
        assert "at_most" in data["supported_modes"]
