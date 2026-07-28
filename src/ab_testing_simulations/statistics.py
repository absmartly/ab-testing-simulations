"""Small dependency-free statistical helpers used by the simulations."""

from __future__ import annotations

import math

from .random import Random

_SQRT_2PI = math.sqrt(2 * math.pi)


def normal_pdf(x: float) -> float:
    return math.exp(-0.5 * x * x) / _SQRT_2PI


def _erf(x: float) -> float:
    """Abramowitz-Stegun 7.1.26, shared verbatim with the browser."""
    sign = -1.0 if x < 0 else 1.0
    value = abs(x)
    t = 1.0 / (1.0 + 0.3275911 * value)
    polynomial = (
        ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t
         + 0.254829592)
        * t
    )
    return sign * (1.0 - polynomial * math.exp(-value * value))


def normal_cdf(x: float) -> float:
    return 0.5 * (1.0 + _erf(x / math.sqrt(2.0)))


def normal_ppf(p: float) -> float:
    """Acklam's inverse-normal approximation (absolute error below 1.2e-9)."""
    if not 0 < p < 1:
        if p == 0:
            return -math.inf
        if p == 1:
            return math.inf
        raise ValueError("p must be in [0, 1]")
    a = (-39.69683028665376, 220.9460984245205, -275.9285104469687,
         138.3577518672690, -30.66479806614716, 2.506628277459239)
    b = (-54.47609879822406, 161.5858368580409, -155.6989798598866,
         66.80131188771972, -13.28068155288572)
    c = (-0.007784894002430293, -0.3223964580411365, -2.400758277161838,
         -2.549732539343734, 4.374664141464968, 2.938163982698783)
    d = (0.007784695709041462, 0.3224671290700398, 2.445134137142996,
         3.754408661907416)
    low = 0.02425
    high = 1 - low
    if p < low:
        q = math.sqrt(-2 * math.log(p))
        return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / \
               ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    if p > high:
        q = math.sqrt(-2 * math.log(1 - p))
        return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / \
                ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    q = p - 0.5
    r = q * q
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / \
           (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)


def beta_sample(rng: Random, alpha: float, beta: float) -> float:
    x = rng.gamma(alpha)
    y = rng.gamma(beta)
    return x / (x + y)


def binomial_sample(rng: Random, n: int, p: float) -> int:
    """Exact binomial sampling using geometric gaps between Bernoulli successes."""
    if n < 0 or not 0 <= p <= 1:
        raise ValueError("invalid binomial parameters")
    if p == 0:
        return 0
    if p == 1:
        return n
    if p > 0.5:
        return n - binomial_sample(rng, n, 1 - p)
    log_failure = math.log1p(-p)
    successes = 0
    position = 0
    while True:
        position += int(math.log(rng.uniform()) / log_failure) + 1
        if position > n:
            return successes
        successes += 1


def mean(values: list[float]) -> float:
    return sum(values) / len(values)


def sample_sd(values: list[float]) -> float:
    if len(values) < 2:
        return 0.0
    m = mean(values)
    return math.sqrt(sum((x - m) ** 2 for x in values) / (len(values) - 1))


def quantile(values: list[float], q: float) -> float:
    ordered = sorted(values)
    at = (len(ordered) - 1) * q
    low = int(math.floor(at))
    high = int(math.ceil(at))
    if low == high:
        return ordered[low]
    return ordered[low] * (high - at) + ordered[high] * (at - low)


def wilson_interval(successes: int, total: int, confidence: float = 0.95) -> tuple[float, float]:
    if total <= 0:
        return (math.nan, math.nan)
    z = normal_ppf(0.5 + confidence / 2)
    p = successes / total
    denominator = 1 + z * z / total
    center = (p + z * z / (2 * total)) / denominator
    half = z * math.sqrt(p * (1 - p) / total + z * z / (4 * total * total)) / denominator
    return max(0.0, center - half), min(1.0, center + half)
