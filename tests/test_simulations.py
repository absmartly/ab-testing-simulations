from __future__ import annotations

import math

from ab_testing_simulations import (
    aa_posterior,
    expected_loss_monitoring,
    fixed_horizon_equivalence,
    informative_prior,
    optional_stopping,
    threshold_sweep,
)


def test_aa_posterior_stays_centered_near_half() -> None:
    result = aa_posterior(
        sample_sizes=(500, 5_000),
        trials=500,
        posterior_draws=500,
        seed=101,
    )
    for row in result["rows"]:
        assert abs(row["mean_probability"] - 0.5) < 0.06
        assert 0.22 < row["sd_probability"] < 0.35


def test_fixed_horizon_rules_mostly_agree() -> None:
    result = fixed_horizon_equivalence(
        sample_size_per_arm=10_000,
        trials=1_000,
        posterior_draws=1_000,
        seed=102,
    )
    assert result["agreement"]["rate"] > 0.98
    assert result["bayesian_false_positive"]["rate"] < 0.09
    assert result["frequentist_false_positive"]["rate"] < 0.09


def test_optional_stopping_matches_unadjusted_pvalue_monitoring() -> None:
    result = optional_stopping(trials=20_000, seed=103)
    posterior = result["posterior_monitoring"]
    pvalue = result["unadjusted_pvalue_monitoring"]
    assert posterior["first_stop_counts"] == pvalue["first_stop_counts"]
    assert posterior["ever_stopped"]["rate"] > 0.12
    assert result["final_look_only"]["rate"] < 0.065


def test_more_looks_increase_unadjusted_monitoring_error() -> None:
    one = optional_stopping(looks=1, trials=30_000, seed=104)
    twelve = optional_stopping(looks=12, trials=30_000, seed=104)
    assert one["posterior_monitoring"]["ever_stopped"]["rate"] < 0.065
    assert twelve["posterior_monitoring"]["ever_stopped"]["rate"] > one["posterior_monitoring"]["ever_stopped"]["rate"] * 2


def test_expected_loss_threshold_is_a_decision_rule_not_an_error_guarantee() -> None:
    result = expected_loss_monitoring(trials=20_000, seed=105)
    assert result["stopping"]["ever_stopped"]["rate"] > 0.3


def test_correct_informative_prior_improves_rmse_under_its_own_model() -> None:
    result = informative_prior(trials=100_000, seed=106)
    flat = next(row for row in result["rows"] if row["label"] == "flat")
    correct = next(row for row in result["rows"] if row["label"] == "correct")
    assert correct["rmse"] < flat["rmse"] * 0.75
    assert correct["precision"] > flat["precision"]


def test_threshold_sweep_exposes_speed_error_tradeoff() -> None:
    result = threshold_sweep(
        thresholds=(0.8, 0.95, 0.99),
        trials=20_000,
        true_effect_under_h1=0.02,
        seed=107,
    )
    rows = result["rows"]
    assert rows[0]["false_positive"]["rate"] > rows[1]["false_positive"]["rate"] > rows[2]["false_positive"]["rate"]
    assert rows[0]["average_h1_stop_given_stop"] < rows[2]["average_h1_stop_given_stop"]
