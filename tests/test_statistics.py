from __future__ import annotations

import math

from ab_testing_simulations.random import Random
from ab_testing_simulations.statistics import normal_cdf, normal_ppf, wilson_interval


def test_xorshift32_golden_sequence() -> None:
    rng = Random(123456789)
    assert [rng.uint32() for _ in range(5)] == [
        2714967881,
        2238813396,
        1250077441,
        3820100336,
        3177519686,
    ]


def test_normal_cdf_ppf_round_trip() -> None:
    for probability in (0.001, 0.01, 0.1, 0.5, 0.9, 0.99, 0.999):
        assert abs(normal_cdf(normal_ppf(probability)) - probability) < 8e-8


def test_wilson_contains_observed_rate() -> None:
    low, high = wilson_interval(50, 1_000)
    assert low < 0.05 < high
    assert 0 <= low <= high <= 1
