#!/usr/bin/env python3
"""Reproduce all publication results and write JSON/CSV artifacts."""

from __future__ import annotations

import csv
import json
import sys
from pathlib import Path

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


def status(name: str):
    last = -1

    def update(fraction: float) -> None:
        nonlocal last
        percentage = int(fraction * 100)
        if percentage // 10 > last // 10:
            last = percentage
            print(f"  {name}: {percentage}%", flush=True)

    return update


def write_csv(path: Path, rows: list[dict[str, object]]) -> None:
    if not rows:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    columns: list[str] = []
    for row in rows:
        for key in row:
            if key not in columns:
                columns.append(key)
    with path.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns)
        writer.writeheader()
        for row in rows:
            writer.writerow({key: json.dumps(value) if isinstance(value, (dict, list)) else value for key, value in row.items()})


def main() -> None:
    results_dir = ROOT / "results"
    web_results_dir = ROOT / "web" / "results"
    results_dir.mkdir(exist_ok=True)
    web_results_dir.mkdir(exist_ok=True)

    print("Running A/A posterior experiment")
    aa = aa_posterior(
        trials=500,
        posterior_draws=3_000,
        seed=20_260_728,
        progress=status("A/A posterior"),
    )

    print("Running fixed-horizon equivalence experiment")
    fixed = fixed_horizon_equivalence(
        trials=4_000,
        posterior_draws=3_000,
        seed=20_260_729,
        progress=status("fixed horizon"),
    )

    print("Running optional-stopping experiment")
    stopping = optional_stopping(
        trials=100_000,
        seed=7,
        progress=status("optional stopping"),
    )

    print("Running expected-loss experiment")
    loss = expected_loss_monitoring(
        trials=100_000,
        seed=8,
        progress=status("expected loss"),
    )

    print("Running informative-prior experiment")
    prior = informative_prior(
        trials=300_000,
        seed=11,
        progress=status("informative prior"),
    )

    print("Running threshold sweep")
    sweep = threshold_sweep(
        trials=60_000,
        seed=17,
        progress=status("threshold sweep"),
    )

    bundle = {
        "schema_version": 1,
        "description": "Reproducible Bayesian A/B testing simulation results",
        "results": {
            "aa_posterior": aa,
            "fixed_horizon_equivalence": fixed,
            "optional_stopping": stopping,
            "expected_loss_monitoring": loss,
            "informative_prior": prior,
            "threshold_sweep": sweep,
        },
    }
    text = json.dumps(bundle, indent=2, allow_nan=False) + "\n"
    (results_dir / "reference-results.json").write_text(text)
    (web_results_dir / "reference-results.json").write_text(text)

    write_csv(results_dir / "aa-posterior.csv", aa["rows"])
    write_csv(results_dir / "optional-stopping.csv", stopping["posterior_monitoring"]["cumulative"])
    write_csv(results_dir / "expected-loss.csv", loss["stopping"]["cumulative"])
    write_csv(results_dir / "informative-prior.csv", prior["rows"])
    write_csv(results_dir / "threshold-sweep.csv", sweep["rows"])

    print(f"Wrote {results_dir / 'reference-results.json'}")


if __name__ == "__main__":
    main()
