import math
from typing import List, Dict, Optional, Tuple
from .schemas import Topology, RiskAssessment

def evaluate_probabilistic_risk(
    topology: Topology,
    counterexample_nodes: List[str]
) -> RiskAssessment:
    """
    Computes probabilistic risk metrics based on user-supplied independent failure probabilities.
    Explicitly decoupled from deterministic SMT formal proofs.
    """
    node_probs: Dict[str, float] = {
        n.id: float(n.failure_prob) for n in topology.nodes
    }
    
    if not counterexample_nodes:
        # No counterexample was found (system is resilient under k failures)
        return RiskAssessment(
            independent_failure_probabilities=node_probs,
            counterexample_joint_prob=0.0,
            risk_tier="LOW",
            notes=(
                "No failure cut detected at current k parameter. "
                "Probabilistic risk of topology disconnection under modeled k failures is zero."
            )
        )
        
    # Compute joint probability of simultaneous failure for the counterexample witness
    # Under assumption of independent Bernoulli failure distributions:
    # P(F*) = \prod_{v \in F*} p(v)
    joint_prob = 1.0
    for nid in counterexample_nodes:
        p = node_probs.get(nid, 0.01)
        joint_prob *= p
        
    # Risk tier classification
    if joint_prob >= 1e-3:  # Greater than 0.1% chance
        tier = "CRITICAL"
        tier_desc = "High joint failure likelihood. The critical cut nodes possess high individual failure probabilities."
    elif joint_prob >= 1e-5:
        tier = "ELEVATED"
        tier_desc = "Moderate joint failure likelihood across the identified failure cut."
    else:
        tier = "LOW"
        tier_desc = "Low joint failure likelihood; counterexample requires multiple rare simultaneous failures."
        
    notes = (
        f"{tier_desc} Joint failure probability P(F*) = {joint_prob:.2e}. "
        "Notice: Probabilistic metrics represent independent stochastic estimates and do not "
        "alter or substitute for deterministic Z3 SMT formal verification."
    )
    
    return RiskAssessment(
        independent_failure_probabilities=node_probs,
        counterexample_joint_prob=float(joint_prob),
        risk_tier=tier,
        notes=notes
    )
