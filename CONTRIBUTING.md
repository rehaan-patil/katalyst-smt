# Contributing to Katalyst.SMT

Thank you for your interest in contributing to **Katalyst.SMT**! This project is an open-source, mathematically rigorous infrastructure resilience verification platform. We welcome contributions from software engineers, formal methods researchers, mathematicians, and SREs.

## 1. Code of Conduct

All contributors are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat all community members with respect and professionalism.

## 2. Development Setup

### Prerequisites
* Python 3.10+ (Python 3.12 recommended)
* Node.js 18+ (Node 20+ recommended)
* Docker & Docker Compose (optional, for containerized workflows)

### Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run test suite
pytest tests/ -v
```

### Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run local development server
npm run dev

# Run production build and typechecks
npm run build
```

## 3. Mathematical Quality Standard

Katalyst.SMT maintains a strict **Zero-Known-Defect standard**:
* Any modification to spectral algorithms, network flow, or Z3 SMT encodings **must** be accompanied by hand-calculable test cases and independent cross-validation.
* Never fabricate proofs or silence solver timeouts.
* Ensure all eigenvalues, cut capacities, and solver outputs are tested for numerical stability.

## 4. Submitting Pull Requests

1. Fork the repository and create a feature branch (`git checkout -b feat/my-improvement`).
2. Implement your changes, adhering to strict typing (Pydantic in backend, TypeScript in frontend).
3. Ensure all tests pass (`pytest` and `npm run build`).
4. Commit with descriptive commit messages following the Conventional Commits specification.
5. Submit a Pull Request targeting the `main` branch.
