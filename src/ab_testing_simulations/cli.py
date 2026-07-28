"""Command-line interface for individual simulations."""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

from .simulations import (
    aa_posterior,
    expected_loss_monitoring,
    fixed_horizon_equivalence,
    informative_prior,
    optional_stopping,
    threshold_sweep,
)

SIMULATIONS = {
    "aa-posterior": aa_posterior,
    "fixed-horizon": fixed_horizon_equivalence,
    "optional-stopping": optional_stopping,
    "expected-loss": expected_loss_monitoring,
    "informative-prior": informative_prior,
    "threshold-sweep": threshold_sweep,
}


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Run reproducible Bayesian A/B testing simulations."
    )
    parser.add_argument("simulation", choices=[*SIMULATIONS, "all"])
    parser.add_argument("--seed", type=int, help="override the simulation seed")
    parser.add_argument("--trials", type=int, help="override the number of trials")
    parser.add_argument("--looks", type=int, help="override the number of monitoring looks")
    parser.add_argument("--threshold", type=float, help="posterior probability threshold")
    parser.add_argument("--output", type=Path, help="write JSON to this path")
    parser.add_argument("--pretty", action="store_true", help="indent JSON output")
    return parser


def _kwargs(args: argparse.Namespace) -> dict[str, object]:
    values: dict[str, object] = {}
    for key in ("seed", "trials", "looks", "threshold"):
        value = getattr(args, key)
        if value is not None:
            values[key] = value
    return values


def main() -> None:
    args = _parser().parse_args()
    kwargs = _kwargs(args)
    if args.simulation == "all":
        result = {}
        for name, function in SIMULATIONS.items():
            accepted = function.__code__.co_varnames[: function.__code__.co_argcount + function.__code__.co_kwonlyargcount]
            result[name] = function(**{key: value for key, value in kwargs.items() if key in accepted})
    else:
        function = SIMULATIONS[args.simulation]
        result = function(**kwargs)
    text = json.dumps(result, indent=2 if args.pretty else None, allow_nan=False)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text + "\n")
    else:
        print(text)


if __name__ == "__main__":
    main()
