import { Random } from "./random.js";

const SQRT_2PI = Math.sqrt(2 * Math.PI);

export function normalPdf(x) {
  return Math.exp(-0.5 * x * x) / SQRT_2PI;
}

// Abramowitz-Stegun 7.1.26, max absolute error about 7.5e-8.
export function erf(x) {
  const sign = x < 0 ? -1 : 1;
  const value = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * value);
  const polynomial =
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t);
  return sign * (1 - polynomial * Math.exp(-value * value));
}

export function normalCdf(x) {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

export function normalPpf(p) {
  if (p === 0) return -Infinity;
  if (p === 1) return Infinity;
  if (!(p > 0 && p < 1)) throw new RangeError("p must be in [0, 1]");
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687,
    138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866,
    66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996,
    3.754408661907416];
  const low = 0.02425;
  const high = 1 - low;
  if (p < low) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > high) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  const q = p - 0.5;
  const r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

export function betaSample(rng, alpha, beta) {
  const x = rng.gamma(alpha);
  const y = rng.gamma(beta);
  return x / (x + y);
}

export function binomialSample(rng, n, p) {
  if (n < 0 || p < 0 || p > 1) throw new RangeError("invalid binomial parameters");
  if (p === 0) return 0;
  if (p === 1) return n;
  if (p > 0.5) return n - binomialSample(rng, n, 1 - p);
  const logFailure = Math.log1p(-p);
  let successes = 0;
  let position = 0;
  while (true) {
    position += Math.floor(Math.log(rng.uniform()) / logFailure) + 1;
    if (position > n) return successes;
    successes += 1;
  }
}

export function mean(values) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function sampleSd(values) {
  if (values.length < 2) return 0;
  const average = mean(values);
  return Math.sqrt(values.reduce((total, value) => total + (value - average) ** 2, 0) / (values.length - 1));
}

export function quantile(values, q) {
  const ordered = [...values].sort((a, b) => a - b);
  const at = (ordered.length - 1) * q;
  const low = Math.floor(at);
  const high = Math.ceil(at);
  if (low === high) return ordered[low];
  return ordered[low] * (high - at) + ordered[high] * (at - low);
}

export function wilsonInterval(successes, total, confidence = 0.95) {
  if (!(total > 0)) return [NaN, NaN];
  const z = normalPpf(0.5 + confidence / 2);
  const p = successes / total;
  const denominator = 1 + z * z / total;
  const center = (p + z * z / (2 * total)) / denominator;
  const half = z * Math.sqrt(p * (1 - p) / total + z * z / (4 * total * total)) / denominator;
  return [Math.max(0, center - half), Math.min(1, center + half)];
}

export { Random };
