"""Bayesian A/B testing simulation package."""

from .simulations import (
    aa_posterior,
    expected_loss_monitoring,
    fixed_horizon_equivalence,
    informative_prior,
    optional_stopping,
    threshold_sweep,
)

__all__ = [
    "aa_posterior",
    "expected_loss_monitoring",
    "fixed_horizon_equivalence",
    "informative_prior",
    "optional_stopping",
    "threshold_sweep",
]
