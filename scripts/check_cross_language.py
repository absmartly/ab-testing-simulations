#!/usr/bin/env python3
"""Assert that Python and JavaScript produce matching deterministic fixtures."""

from __future__ import annotations

import json
import math
import subprocess
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from ab_testing_simulations import (  # noqa: E402
    aa_posterior,
    expected_loss_monitoring,
    fixed_horizon_equivalence,
    informative_prior,
    optional_stopping,
    threshold_sweep,
)


def python_results() -> dict[str, Any]:
    return {
        "aa_posterior": aa_posterior(
            sample_sizes=(250, 2500),
            baseline_rate=0.07,
            trials=40,
            posterior_draws=100,
            threshold=0.93,
            seed=112233,
        ),
        "fixed_horizon": fixed_horizon_equivalence(
            sample_size_per_arm=2000,
            baseline_rate=0.08,
            trials=50,
            posterior_draws=100,
            threshold=0.93,
            seed=223344,
        ),
        "optional_stopping": optional_stopping(
            total_sample_per_arm=6000,
            looks=6,
            trials=300,
            threshold=0.94,
            seed=334455,
        ),
        "expected_loss": expected_loss_monitoring(
            total_sample_per_arm=6000,
            looks=6,
            trials=300,
            loss_threshold=0.003,
            seed=445566,
        ),
        "informative_prior": informative_prior(
            trials=1000,
            true_prior_sd=0.012,
            assumed_prior_sds=(math.inf, 0.006, 0.012, 0.024),
            standard_error=0.009,
            seed=556677,
        ),
        "threshold_sweep": threshold_sweep(
            thresholds=(0.85, 0.95, 0.99),
            total_sample_per_arm=6000,
            looks=6,
            trials=500,
            true_effect_under_h1=0.025,
            seed=667788,
        ),
    }


def compare(left: Any, right: Any, path: str = "root") -> None:
    if isinstance(left, dict):
        if set(left) != set(right):
            raise AssertionError(f"{path}: keys differ: {set(left) ^ set(right)}")
        for key in left:
            compare(left[key], right[key], f"{path}.{key}")
        return
    if isinstance(left, (list, tuple)):
        if len(left) != len(right):
            raise AssertionError(f"{path}: lengths differ: {len(left)} != {len(right)}")
        for index, (a, b) in enumerate(zip(left, right)):
            compare(a, b, f"{path}[{index}]")
        return
    if isinstance(left, bool) or left is None or isinstance(left, str):
        if left != right:
            raise AssertionError(f"{path}: {left!r} != {right!r}")
        return
    if isinstance(left, int) and isinstance(right, int):
        if left != right:
            raise AssertionError(f"{path}: {left} != {right}")
        return
    if isinstance(left, (int, float)) and isinstance(right, (int, float)):
        if not math.isclose(float(left), float(right), rel_tol=2e-12, abs_tol=2e-12):
            raise AssertionError(f"{path}: {left:.17g} != {right:.17g}")
        return
    if left != right:
        raise AssertionError(f"{path}: {left!r} != {right!r}")


def main() -> None:
    completed = subprocess.run(
        ["node", str(ROOT / "tests" / "js" / "parity.mjs")],
        check=True,
        capture_output=True,
        text=True,
    )
    javascript = json.loads(completed.stdout)
    python = python_results()
    compare(python, javascript)
    print("Python and JavaScript fixtures match exactly within 2e-12.")


if __name__ == "__main__":
    main()
