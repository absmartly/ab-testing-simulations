"""Vendor-neutral simulations used by the article and browser lab."""

from __future__ import annotations

import math
from collections.abc import Callable, Iterable
from typing import Any

from .random import Random
from .statistics import (
    beta_sample,
    binomial_sample,
    mean,
    normal_cdf,
    normal_pdf,
    quantile,
    sample_sd,
    wilson_interval,
)

Progress = Callable[[float], None] | None


def _rate(successes: int, total: int) -> dict[str, Any]:
    low, high = wilson_interval(successes, total)
    return {
        "count": successes,
        "total": total,
        "rate": successes / total,
        "ci95": [low, high],
    }


def _histogram(values: list[float], bins: int, low: float, high: float) -> list[dict[str, float | int]]:
    width = (high - low) / bins
    counts = [0] * bins
    for value in values:
        index = min(bins - 1, max(0, int((value - low) / width)))
        counts[index] += 1
    return [
        {
            "low": low + i * width,
            "high": low + (i + 1) * width,
            "count": count,
        }
        for i, count in enumerate(counts)
    ]


def posterior_probability_b_beats_a(
    rng: Random,
    successes_a: int,
    failures_a: int,
    successes_b: int,
    failures_b: int,
    draws: int,
    prior_alpha: float = 1.0,
    prior_beta: float = 1.0,
) -> float:
    """Monte Carlo P(p_B > p_A) for independent Beta posteriors."""
    wins = 0
    for _ in range(draws):
        p_a = beta_sample(rng, prior_alpha + successes_a, prior_beta + failures_a)
        p_b = beta_sample(rng, prior_alpha + successes_b, prior_beta + failures_b)
        wins += p_b > p_a
    return wins / draws


def aa_posterior(
    *,
    sample_sizes: Iterable[int] = (1_000, 10_000, 100_000),
    baseline_rate: float = 0.05,
    trials: int = 400,
    posterior_draws: int = 2_000,
    threshold: float = 0.95,
    seed: int = 20_260_728,
    progress: Progress = None,
) -> dict[str, Any]:
    """Distribution of flat-prior P(B>A) over repeated A/A experiments."""
    sizes = list(sample_sizes)
    rng = Random(seed)
    rows = []
    total_work = len(sizes) * trials
    done = 0
    for sample_size in sizes:
        probabilities: list[float] = []
        above = 0
        for _ in range(trials):
            successes_a = binomial_sample(rng, sample_size, baseline_rate)
            successes_b = binomial_sample(rng, sample_size, baseline_rate)
            probability = posterior_probability_b_beats_a(
                rng,
                successes_a,
                sample_size - successes_a,
                successes_b,
                sample_size - successes_b,
                posterior_draws,
            )
            probabilities.append(probability)
            above += probability > threshold
            done += 1
            if progress and done % max(1, total_work // 100) == 0:
                progress(done / total_work)
        rows.append(
            {
                "sample_size_per_arm": sample_size,
                "mean_probability": mean(probabilities),
                "sd_probability": sample_sd(probabilities),
                "median_probability": quantile(probabilities, 0.5),
                "probability_quantiles": {
                    "q05": quantile(probabilities, 0.05),
                    "q25": quantile(probabilities, 0.25),
                    "q75": quantile(probabilities, 0.75),
                    "q95": quantile(probabilities, 0.95),
                },
                "above_threshold": _rate(above, trials),
                "histogram": _histogram(probabilities, 20, 0, 1),
            }
        )
    return {
        "experiment": "aa_posterior",
        "config": {
            "sample_sizes": sizes,
            "baseline_rate": baseline_rate,
            "trials": trials,
            "posterior_draws": posterior_draws,
            "threshold": threshold,
            "prior": "Beta(1,1) independently per arm",
            "seed": seed,
        },
        "rows": rows,
        "theory": {
            "asymptotic_mean": 0.5,
            "asymptotic_sd": 1 / math.sqrt(12),
            "explanation": "At the equality boundary, Phi(Z) is Uniform(0,1) when Z is standard normal.",
        },
    }


def _one_sided_z_pvalue(successes_a: int, successes_b: int, n: int) -> float:
    pooled = (successes_a + successes_b) / (2 * n)
    variance = pooled * (1 - pooled) * 2 / n
    if variance <= 0:
        return 1.0
    z = (successes_b / n - successes_a / n) / math.sqrt(variance)
    return 1 - normal_cdf(z)


def fixed_horizon_equivalence(
    *,
    sample_size_per_arm: int = 20_000,
    baseline_rate: float = 0.05,
    trials: int = 4_000,
    posterior_draws: int = 4_000,
    threshold: float = 0.95,
    seed: int = 20_260_729,
    progress: Progress = None,
) -> dict[str, Any]:
    """Compare a flat-prior posterior threshold with a one-sided z-test."""
    rng = Random(seed)
    matrix = {"both": 0, "bayes_only": 0, "frequentist_only": 0, "neither": 0}
    probabilities: list[float] = []
    pvalues: list[float] = []
    alpha = 1 - threshold
    for trial in range(trials):
        a = binomial_sample(rng, sample_size_per_arm, baseline_rate)
        b = binomial_sample(rng, sample_size_per_arm, baseline_rate)
        probability = posterior_probability_b_beats_a(
            rng, a, sample_size_per_arm - a, b, sample_size_per_arm - b, posterior_draws
        )
        pvalue = _one_sided_z_pvalue(a, b, sample_size_per_arm)
        probabilities.append(probability)
        pvalues.append(pvalue)
        bayes = probability > threshold
        frequentist = pvalue < alpha
        if bayes and frequentist:
            matrix["both"] += 1
        elif bayes:
            matrix["bayes_only"] += 1
        elif frequentist:
            matrix["frequentist_only"] += 1
        else:
            matrix["neither"] += 1
        if progress and trial % max(1, trials // 100) == 0:
            progress((trial + 1) / trials)
    bayes_count = matrix["both"] + matrix["bayes_only"]
    frequentist_count = matrix["both"] + matrix["frequentist_only"]
    agreement = matrix["both"] + matrix["neither"]
    return {
        "experiment": "fixed_horizon_equivalence",
        "config": {
            "sample_size_per_arm": sample_size_per_arm,
            "baseline_rate": baseline_rate,
            "trials": trials,
            "posterior_draws": posterior_draws,
            "threshold": threshold,
            "alpha": alpha,
            "seed": seed,
        },
        "bayesian_false_positive": _rate(bayes_count, trials),
        "frequentist_false_positive": _rate(frequentist_count, trials),
        "agreement": _rate(agreement, trials),
        "decision_matrix": matrix,
        "mean_abs_probability_minus_one_minus_p": mean(
            [abs(probability - (1 - pvalue)) for probability, pvalue in zip(probabilities, pvalues)]
        ),
    }


def _normal_paths(
    rng: Random,
    *,
    trials: int,
    looks: int,
    total_sample_per_arm: int,
    true_effect: float,
    sd: float,
) -> list[list[tuple[float, float]]]:
    """Generate (delta_hat, standard_error) at equally-spaced looks.

    The sufficient statistic is simulated directly. For each arm, observations have
    variance sd^2. The difference of arm sums in an increment of m observations per
    arm is Normal(m*true_effect, 2*m*sd^2).
    """
    per_look = total_sample_per_arm // looks
    paths: list[list[tuple[float, float]]] = []
    for _ in range(trials):
        cumulative_difference_sum = 0.0
        path = []
        for look in range(1, looks + 1):
            cumulative_difference_sum += (
                per_look * true_effect + math.sqrt(2 * per_look) * sd * rng.normal()
            )
            n = look * per_look
            delta_hat = cumulative_difference_sum / n
            standard_error = sd * math.sqrt(2 / n)
            path.append((delta_hat, standard_error))
        paths.append(path)
    return paths


def _summarize_stops(first_stops: list[int | None], looks: int) -> dict[str, Any]:
    counts = [0] * looks
    for stop in first_stops:
        if stop is not None:
            counts[stop - 1] += 1
    cumulative = []
    running = 0
    for look, count in enumerate(counts, start=1):
        running += count
        low, high = wilson_interval(running, len(first_stops))
        cumulative.append(
            {"look": look, "count": running, "rate": running / len(first_stops), "ci95": [low, high]}
        )
    stopped = sum(counts)
    average = (
        sum((index + 1) * count for index, count in enumerate(counts)) / stopped
        if stopped
        else None
    )
    return {
        "ever_stopped": _rate(stopped, len(first_stops)),
        "first_stop_counts": [{"look": i + 1, "count": count} for i, count in enumerate(counts)],
        "cumulative": cumulative,
        "average_stop_look_given_stop": average,
    }


def optional_stopping(
    *,
    total_sample_per_arm: int = 24_000,
    looks: int = 12,
    trials: int = 20_000,
    threshold: float = 0.95,
    true_effect: float = 0.0,
    sd: float = 1.0,
    seed: int = 7,
    progress: Progress = None,
) -> dict[str, Any]:
    """Monitor flat-prior posterior probability at every look under A/A."""
    rng = Random(seed)
    paths = _normal_paths(
        rng,
        trials=trials,
        looks=looks,
        total_sample_per_arm=total_sample_per_arm,
        true_effect=true_effect,
        sd=sd,
    )
    posterior_stops: list[int | None] = []
    pvalue_stops: list[int | None] = []
    final_rejections = 0
    alpha = 1 - threshold
    for trial, path in enumerate(paths):
        posterior_stop = None
        pvalue_stop = None
        for look, (delta_hat, standard_error) in enumerate(path, start=1):
            z = delta_hat / standard_error
            probability = normal_cdf(z)
            pvalue = 1 - normal_cdf(z)
            if posterior_stop is None and probability > threshold:
                posterior_stop = look
            if pvalue_stop is None and pvalue < alpha:
                pvalue_stop = look
        final_delta, final_se = path[-1]
        final_rejections += 1 - normal_cdf(final_delta / final_se) < alpha
        posterior_stops.append(posterior_stop)
        pvalue_stops.append(pvalue_stop)
        if progress and trial % max(1, trials // 100) == 0:
            progress((trial + 1) / trials)
    return {
        "experiment": "optional_stopping",
        "config": {
            "total_sample_per_arm": total_sample_per_arm,
            "looks": looks,
            "trials": trials,
            "threshold": threshold,
            "alpha": alpha,
            "true_effect": true_effect,
            "sd": sd,
            "seed": seed,
        },
        "posterior_monitoring": _summarize_stops(posterior_stops, looks),
        "unadjusted_pvalue_monitoring": _summarize_stops(pvalue_stops, looks),
        "final_look_only": _rate(final_rejections, trials),
        "identity": "For this normal flat-prior model, P(delta>0|data) = 1 - one-sided p-value at every look.",
    }


def expected_loss_monitoring(
    *,
    total_sample_per_arm: int = 24_000,
    looks: int = 12,
    trials: int = 20_000,
    loss_threshold: float = 0.0015,
    true_effect: float = 0.0,
    sd: float = 1.0,
    seed: int = 8,
    progress: Progress = None,
) -> dict[str, Any]:
    """Stop when posterior expected loss of choosing B falls below a threshold."""
    rng = Random(seed)
    paths = _normal_paths(
        rng,
        trials=trials,
        looks=looks,
        total_sample_per_arm=total_sample_per_arm,
        true_effect=true_effect,
        sd=sd,
    )
    stops: list[int | None] = []
    final_losses: list[float] = []
    for trial, path in enumerate(paths):
        first_stop = None
        for look, (delta_hat, standard_error) in enumerate(path, start=1):
            z = delta_hat / standard_error
            expected_loss = standard_error * normal_pdf(z) - delta_hat * normal_cdf(-z)
            if first_stop is None and expected_loss < loss_threshold:
                first_stop = look
            if look == looks:
                final_losses.append(expected_loss)
        stops.append(first_stop)
        if progress and trial % max(1, trials // 100) == 0:
            progress((trial + 1) / trials)
    return {
        "experiment": "expected_loss_monitoring",
        "config": {
            "total_sample_per_arm": total_sample_per_arm,
            "looks": looks,
            "trials": trials,
            "loss_threshold": loss_threshold,
            "true_effect": true_effect,
            "sd": sd,
            "seed": seed,
        },
        "stopping": _summarize_stops(stops, looks),
        "final_loss_quantiles": {
            "q05": quantile(final_losses, 0.05),
            "median": quantile(final_losses, 0.5),
            "q95": quantile(final_losses, 0.95),
        },
        "formula": "E[max(0,-delta)] = se*phi(delta_hat/se) - delta_hat*Phi(-delta_hat/se)",
    }


def informative_prior(
    *,
    trials: int = 200_000,
    true_prior_sd: float = 0.01,
    assumed_prior_sds: Iterable[float] = (math.inf, 0.003333333333, 0.005, 0.01, 0.02, 0.05),
    standard_error: float = 0.01,
    decision_probability: float = 0.95,
    seed: int = 11,
    progress: Progress = None,
) -> dict[str, Any]:
    """Portfolio simulation showing shrinkage, decisions, and prior sensitivity."""
    rng = Random(seed)
    truths = [true_prior_sd * rng.normal() for _ in range(trials)]
    observations = [truth + standard_error * rng.normal() for truth in truths]
    rows = []
    from .statistics import normal_ppf

    z_threshold = normal_ppf(decision_probability)
    prior_sds = list(assumed_prior_sds)
    for index, prior_sd in enumerate(prior_sds):
        if math.isinf(prior_sd):
            shrinkage = 1.0
            posterior_sd = standard_error
            label = "flat"
        else:
            prior_variance = prior_sd * prior_sd
            measurement_variance = standard_error * standard_error
            shrinkage = prior_variance / (prior_variance + measurement_variance)
            posterior_sd = math.sqrt(1 / (1 / prior_variance + 1 / measurement_variance))
            label = "correct" if abs(prior_sd - true_prior_sd) < 1e-12 else "informative"
        estimates = [observation * shrinkage for observation in observations]
        shipped = [estimate / posterior_sd > z_threshold for estimate in estimates]
        shipped_indices = [i for i, decision in enumerate(shipped) if decision]
        true_positive = sum(truths[i] > 0 for i in shipped_indices)
        rows.append(
            {
                "label": label,
                "assumed_prior_sd": None if math.isinf(prior_sd) else prior_sd,
                "shrinkage": shrinkage,
                "rmse": math.sqrt(mean([(estimate - truth) ** 2 for estimate, truth in zip(estimates, truths)])),
                "ship_rate": len(shipped_indices) / trials,
                "ship_count": len(shipped_indices),
                "precision": true_positive / len(shipped_indices) if shipped_indices else None,
                "mean_true_lift_shipped": mean([truths[i] for i in shipped_indices]) if shipped_indices else None,
                "mean_claimed_lift_shipped": mean([observations[i] for i in shipped_indices]) if shipped_indices else None,
                "winner_curse_ratio": (
                    mean([observations[i] for i in shipped_indices]) / mean([truths[i] for i in shipped_indices])
                    if shipped_indices and mean([truths[i] for i in shipped_indices]) != 0
                    else None
                ),
            }
        )
        if progress:
            progress((index + 1) / len(prior_sds))
    return {
        "experiment": "informative_prior",
        "config": {
            "trials": trials,
            "true_prior_sd": true_prior_sd,
            "assumed_prior_sds": [None if math.isinf(x) else x for x in prior_sds],
            "standard_error": standard_error,
            "decision_probability": decision_probability,
            "seed": seed,
        },
        "rows": rows,
    }


def threshold_sweep(
    *,
    thresholds: Iterable[float] = (0.8, 0.85, 0.9, 0.925, 0.95, 0.975, 0.99, 0.995),
    total_sample_per_arm: int = 24_000,
    looks: int = 12,
    trials: int = 30_000,
    true_effect_under_h1: float = 0.015,
    sd: float = 1.0,
    seed: int = 17,
    progress: Progress = None,
) -> dict[str, Any]:
    """Sweep posterior thresholds to expose speed versus error trade-offs."""
    rng = Random(seed)
    h0_paths = _normal_paths(
        rng,
        trials=trials,
        looks=looks,
        total_sample_per_arm=total_sample_per_arm,
        true_effect=0,
        sd=sd,
    )
    h1_paths = _normal_paths(
        rng,
        trials=trials,
        looks=looks,
        total_sample_per_arm=total_sample_per_arm,
        true_effect=true_effect_under_h1,
        sd=sd,
    )
    rows = []
    threshold_values = list(thresholds)
    for index, threshold in enumerate(threshold_values):
        def evaluate(paths: list[list[tuple[float, float]]]) -> tuple[int, float | None]:
            hits = 0
            stop_sum = 0
            for path in paths:
                stop = None
                for look, (delta_hat, se) in enumerate(path, start=1):
                    if normal_cdf(delta_hat / se) > threshold:
                        stop = look
                        break
                if stop is not None:
                    hits += 1
                    stop_sum += stop
            return hits, stop_sum / hits if hits else None

        false_positives, h0_stop = evaluate(h0_paths)
        true_positives, h1_stop = evaluate(h1_paths)
        rows.append(
            {
                "threshold": threshold,
                "false_positive": _rate(false_positives, trials),
                "power": _rate(true_positives, trials),
                "average_h0_stop_given_stop": h0_stop,
                "average_h1_stop_given_stop": h1_stop,
            }
        )
        if progress:
            progress((index + 1) / len(threshold_values))
    return {
        "experiment": "threshold_sweep",
        "config": {
            "thresholds": threshold_values,
            "total_sample_per_arm": total_sample_per_arm,
            "looks": looks,
            "trials": trials,
            "true_effect_under_h1": true_effect_under_h1,
            "sd": sd,
            "seed": seed,
        },
        "rows": rows,
    }
