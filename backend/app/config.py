import os
from typing import List

class Settings:
    PROJECT_NAME: str = "Katalyst.SMT Verification Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,*"
        ).split(",")
        if origin.strip()
    ]
    
    # Limits & Safeguards
    MAX_NODES: int = int(os.getenv("MAX_NODES", "150"))
    MAX_EDGES: int = int(os.getenv("MAX_EDGES", "600"))
    MAX_K_FAILURE: int = int(os.getenv("MAX_K_FAILURE", "5"))
    SOLVER_TIMEOUT_MS: int = int(os.getenv("SOLVER_TIMEOUT_MS", "5000"))

settings = Settings()
