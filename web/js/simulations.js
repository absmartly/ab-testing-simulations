import {
  Random,
  betaSample,
  binomialSample,
  mean,
  normalCdf,
  normalPdf,
  normalPpf,
  quantile,
  sampleSd,
  wilsonInterval,
} from "./statistics.js";

function rate(successes, total) {
  return {
    count: successes,
    total,
    rate: successes / total,
    ci95: wilsonInterval(successes, total),
  };
}

function histogram(values, bins, low, high) {
  const width = (high - low) / bins;
  const counts = Array(bins).fill(0);
  for (const value of values) {
    const index = Math.min(bins - 1, Math.max(0, Math.floor((value - low) / width)));
    counts[index] += 1;
  }
  return counts.map((count, index) => ({
    low: low + index * width,
    high: low + (index + 1) * width,
    count,
  }));
}

function reportProgress(progress, done, total) {
  if (progress && (done === total || done % Math.max(1, Math.floor(total / 100)) === 0)) {
    progress(done / total);
  }
}

export function posteriorProbabilityBBeatsA(
  rng,
  successesA,
  failuresA,
  successesB,
  failuresB,
  draws,
  priorAlpha = 1,
  priorBeta = 1,
) {
  let wins = 0;
  for (let draw = 0; draw < draws; draw += 1) {
    const pA = betaSample(rng, priorAlpha + successesA, priorBeta + failuresA);
    const pB = betaSample(rng, priorAlpha + successesB, priorBeta + failuresB);
    if (pB > pA) wins += 1;
  }
  return wins / draws;
}

export function aaPosterior({
  sampleSizes = [1_000, 10_000, 100_000],
  baselineRate = 0.05,
  trials = 400,
  posteriorDraws = 2_000,
  threshold = 0.95,
  seed = 20_260_728,
  progress = null,
} = {}) {
  const rng = new Random(seed);
  const rows = [];
  const totalWork = sampleSizes.length * trials;
  let done = 0;
  for (const sampleSize of sampleSizes) {
    const probabilities = [];
    let above = 0;
    for (let trial = 0; trial < trials; trial += 1) {
      const successesA = binomialSample(rng, sampleSize, baselineRate);
      const successesB = binomialSample(rng, sampleSize, baselineRate);
      const probability = posteriorProbabilityBBeatsA(
        rng,
        successesA,
        sampleSize - successesA,
        successesB,
        sampleSize - successesB,
        posteriorDraws,
      );
      probabilities.push(probability);
      if (probability > threshold) above += 1;
      done += 1;
      reportProgress(progress, done, totalWork);
    }
    rows.push({
      sample_size_per_arm: sampleSize,
      mean_probability: mean(probabilities),
      sd_probability: sampleSd(probabilities),
      median_probability: quantile(probabilities, 0.5),
      probability_quantiles: {
        q05: quantile(probabilities, 0.05),
        q25: quantile(probabilities, 0.25),
        q75: quantile(probabilities, 0.75),
        q95: quantile(probabilities, 0.95),
      },
      above_threshold: rate(above, trials),
      histogram: histogram(probabilities, 20, 0, 1),
    });
  }
  return {
    experiment: "aa_posterior",
    config: {
      sample_sizes: sampleSizes,
      baseline_rate: baselineRate,
      trials,
      posterior_draws: posteriorDraws,
      threshold,
      prior: "Beta(1,1) independently per arm",
      seed,
    },
    rows,
    theory: {
      asymptotic_mean: 0.5,
      asymptotic_sd: 1 / Math.sqrt(12),
      explanation: "At the equality boundary, Phi(Z) is Uniform(0,1) when Z is standard normal.",
    },
  };
}

function oneSidedZPvalue(successesA, successesB, n) {
  const pooled = (successesA + successesB) / (2 * n);
  const variance = pooled * (1 - pooled) * 2 / n;
  if (!(variance > 0)) return 1;
  const z = (successesB / n - successesA / n) / Math.sqrt(variance);
  return 1 - normalCdf(z);
}

export function fixedHorizonEquivalence({
  sampleSizePerArm = 20_000,
  baselineRate = 0.05,
  trials = 4_000,
  posteriorDraws = 4_000,
  threshold = 0.95,
  seed = 20_260_729,
  progress = null,
} = {}) {
  const rng = new Random(seed);
  const matrix = { both: 0, bayes_only: 0, frequentist_only: 0, neither: 0 };
  const probabilities = [];
  const pvalues = [];
  const alpha = 1 - threshold;
  for (let trial = 0; trial < trials; trial += 1) {
    const a = binomialSample(rng, sampleSizePerArm, baselineRate);
    const b = binomialSample(rng, sampleSizePerArm, baselineRate);
    const probability = posteriorProbabilityBBeatsA(
      rng,
      a,
      sampleSizePerArm - a,
      b,
      sampleSizePerArm - b,
      posteriorDraws,
    );
    const pvalue = oneSidedZPvalue(a, b, sampleSizePerArm);
    probabilities.push(probability);
    pvalues.push(pvalue);
    const bayes = probability > threshold;
    const frequentist = pvalue < alpha;
    if (bayes && frequentist) matrix.both += 1;
    else if (bayes) matrix.bayes_only += 1;
    else if (frequentist) matrix.frequentist_only += 1;
    else matrix.neither += 1;
    reportProgress(progress, trial + 1, trials);
  }
  const bayesCount = matrix.both + matrix.bayes_only;
  const frequentistCount = matrix.both + matrix.frequentist_only;
  const agreement = matrix.both + matrix.neither;
  return {
    experiment: "fixed_horizon_equivalence",
    config: {
      sample_size_per_arm: sampleSizePerArm,
      baseline_rate: baselineRate,
      trials,
      posterior_draws: posteriorDraws,
      threshold,
      alpha,
      seed,
    },
    bayesian_false_positive: rate(bayesCount, trials),
    frequentist_false_positive: rate(frequentistCount, trials),
    agreement: rate(agreement, trials),
    decision_matrix: matrix,
    mean_abs_probability_minus_one_minus_p: mean(
      probabilities.map((probability, index) => Math.abs(probability - (1 - pvalues[index]))),
    ),
  };
}

function normalPaths(rng, {
  trials,
  looks,
  totalSamplePerArm,
  trueEffect,
  sd,
}) {
  const perLook = Math.floor(totalSamplePerArm / looks);
  const paths = [];
  for (let trial = 0; trial < trials; trial += 1) {
    let cumulativeDifferenceSum = 0;
    const path = [];
    for (let look = 1; look <= looks; look += 1) {
      cumulativeDifferenceSum += perLook * trueEffect + Math.sqrt(2 * perLook) * sd * rng.normal();
      const n = look * perLook;
      path.push([cumulativeDifferenceSum / n, sd * Math.sqrt(2 / n)]);
    }
    paths.push(path);
  }
  return paths;
}

function summarizeStops(firstStops, looks) {
  const counts = Array(looks).fill(0);
  for (const stop of firstStops) {
    if (stop !== null) counts[stop - 1] += 1;
  }
  const cumulative = [];
  let running = 0;
  counts.forEach((count, index) => {
    running += count;
    cumulative.push({
      look: index + 1,
      count: running,
      rate: running / firstStops.length,
      ci95: wilsonInterval(running, firstStops.length),
    });
  });
  const stopped = counts.reduce((total, count) => total + count, 0);
  const weightedStops = counts.reduce((total, count, index) => total + (index + 1) * count, 0);
  return {
    ever_stopped: rate(stopped, firstStops.length),
    first_stop_counts: counts.map((count, index) => ({ look: index + 1, count })),
    cumulative,
    average_stop_look_given_stop: stopped ? weightedStops / stopped : null,
  };
}

export function optionalStopping({
  totalSamplePerArm = 24_000,
  looks = 12,
  trials = 20_000,
  threshold = 0.95,
  trueEffect = 0,
  sd = 1,
  seed = 7,
  progress = null,
} = {}) {
  const rng = new Random(seed);
  const paths = normalPaths(rng, { trials, looks, totalSamplePerArm, trueEffect, sd });
  const posteriorStops = [];
  const pvalueStops = [];
  let finalRejections = 0;
  const alpha = 1 - threshold;
  paths.forEach((path, trial) => {
    let posteriorStop = null;
    let pvalueStop = null;
    path.forEach(([deltaHat, standardError], index) => {
      const probability = normalCdf(deltaHat / standardError);
      const pvalue = 1 - probability;
      if (posteriorStop === null && probability > threshold) posteriorStop = index + 1;
      if (pvalueStop === null && pvalue < alpha) pvalueStop = index + 1;
    });
    const [finalDelta, finalSe] = path[path.length - 1];
    if (1 - normalCdf(finalDelta / finalSe) < alpha) finalRejections += 1;
    posteriorStops.push(posteriorStop);
    pvalueStops.push(pvalueStop);
    reportProgress(progress, trial + 1, trials);
  });
  return {
    experiment: "optional_stopping",
    config: {
      total_sample_per_arm: totalSamplePerArm,
      looks,
      trials,
      threshold,
      alpha,
      true_effect: trueEffect,
      sd,
      seed,
    },
    posterior_monitoring: summarizeStops(posteriorStops, looks),
    unadjusted_pvalue_monitoring: summarizeStops(pvalueStops, looks),
    final_look_only: rate(finalRejections, trials),
    identity: "For this normal flat-prior model, P(delta>0|data) = 1 - one-sided p-value at every look.",
  };
}

export function expectedLossMonitoring({
  totalSamplePerArm = 24_000,
  looks = 12,
  trials = 20_000,
  lossThreshold = 0.0015,
  trueEffect = 0,
  sd = 1,
  seed = 8,
  progress = null,
} = {}) {
  const rng = new Random(seed);
  const paths = normalPaths(rng, { trials, looks, totalSamplePerArm, trueEffect, sd });
  const stops = [];
  const finalLosses = [];
  paths.forEach((path, trial) => {
    let firstStop = null;
    path.forEach(([deltaHat, standardError], index) => {
      const z = deltaHat / standardError;
      const expectedLoss = standardError * normalPdf(z) - deltaHat * normalCdf(-z);
      if (firstStop === null && expectedLoss < lossThreshold) firstStop = index + 1;
      if (index === looks - 1) finalLosses.push(expectedLoss);
    });
    stops.push(firstStop);
    reportProgress(progress, trial + 1, trials);
  });
  return {
    experiment: "expected_loss_monitoring",
    config: {
      total_sample_per_arm: totalSamplePerArm,
      looks,
      trials,
      loss_threshold: lossThreshold,
      true_effect: trueEffect,
      sd,
      seed,
    },
    stopping: summarizeStops(stops, looks),
    final_loss_quantiles: {
      q05: quantile(finalLosses, 0.05),
      median: quantile(finalLosses, 0.5),
      q95: quantile(finalLosses, 0.95),
    },
    formula: "E[max(0,-delta)] = se*phi(delta_hat/se) - delta_hat*Phi(-delta_hat/se)",
  };
}

export function informativePrior({
  trials = 200_000,
  truePriorSd = 0.01,
  assumedPriorSds = [null, 0.003333333333, 0.005, 0.01, 0.02, 0.05],
  standardError = 0.01,
  decisionProbability = 0.95,
  seed = 11,
  progress = null,
} = {}) {
  const rng = new Random(seed);
  const truths = Array.from({ length: trials }, () => truePriorSd * rng.normal());
  const observations = truths.map((truth) => truth + standardError * rng.normal());
  const zThreshold = normalPpf(decisionProbability);
  const rows = [];
  assumedPriorSds.forEach((priorSd, index) => {
    let shrinkage;
    let posteriorSd;
    let label;
    if (priorSd === null) {
      shrinkage = 1;
      posteriorSd = standardError;
      label = "flat";
    } else {
      const priorVariance = priorSd ** 2;
      const measurementVariance = standardError ** 2;
      shrinkage = priorVariance / (priorVariance + measurementVariance);
      posteriorSd = Math.sqrt(1 / (1 / priorVariance + 1 / measurementVariance));
      label = Math.abs(priorSd - truePriorSd) < 1e-12 ? "correct" : "informative";
    }
    let squaredError = 0;
    let shipCount = 0;
    let truePositive = 0;
    let trueLiftSum = 0;
    let claimedLiftSum = 0;
    observations.forEach((observation, trial) => {
      const estimate = observation * shrinkage;
      const truth = truths[trial];
      squaredError += (estimate - truth) ** 2;
      if (estimate / posteriorSd > zThreshold) {
        shipCount += 1;
        if (truth > 0) truePositive += 1;
        trueLiftSum += truth;
        claimedLiftSum += observation;
      }
    });
    const meanTrueLift = shipCount ? trueLiftSum / shipCount : null;
    const meanClaimedLift = shipCount ? claimedLiftSum / shipCount : null;
    rows.push({
      label,
      assumed_prior_sd: priorSd,
      shrinkage,
      rmse: Math.sqrt(squaredError / trials),
      ship_rate: shipCount / trials,
      ship_count: shipCount,
      precision: shipCount ? truePositive / shipCount : null,
      mean_true_lift_shipped: meanTrueLift,
      mean_claimed_lift_shipped: meanClaimedLift,
      winner_curse_ratio: meanTrueLift ? meanClaimedLift / meanTrueLift : null,
    });
    if (progress) progress((index + 1) / assumedPriorSds.length);
  });
  return {
    experiment: "informative_prior",
    config: {
      trials,
      true_prior_sd: truePriorSd,
      assumed_prior_sds: assumedPriorSds,
      standard_error: standardError,
      decision_probability: decisionProbability,
      seed,
    },
    rows,
  };
}

export function thresholdSweep({
  thresholds = [0.8, 0.85, 0.9, 0.925, 0.95, 0.975, 0.99, 0.995],
  totalSamplePerArm = 24_000,
  looks = 12,
  trials = 30_000,
  trueEffectUnderH1 = 0.015,
  sd = 1,
  seed = 17,
  progress = null,
} = {}) {
  const rng = new Random(seed);
  const h0Paths = normalPaths(rng, {
    trials, looks, totalSamplePerArm, trueEffect: 0, sd,
  });
  const h1Paths = normalPaths(rng, {
    trials, looks, totalSamplePerArm, trueEffect: trueEffectUnderH1, sd,
  });
  function evaluate(paths, threshold) {
    let hits = 0;
    let stopSum = 0;
    for (const path of paths) {
      let stop = null;
      for (let index = 0; index < path.length; index += 1) {
        const [deltaHat, standardError] = path[index];
        if (normalCdf(deltaHat / standardError) > threshold) {
          stop = index + 1;
          break;
        }
      }
      if (stop !== null) {
        hits += 1;
        stopSum += stop;
      }
    }
    return [hits, hits ? stopSum / hits : null];
  }
  const rows = thresholds.map((threshold, index) => {
    const [falsePositives, h0Stop] = evaluate(h0Paths, threshold);
    const [truePositives, h1Stop] = evaluate(h1Paths, threshold);
    if (progress) progress((index + 1) / thresholds.length);
    return {
      threshold,
      false_positive: rate(falsePositives, trials),
      power: rate(truePositives, trials),
      average_h0_stop_given_stop: h0Stop,
      average_h1_stop_given_stop: h1Stop,
    };
  });
  return {
    experiment: "threshold_sweep",
    config: {
      thresholds,
      total_sample_per_arm: totalSamplePerArm,
      looks,
      trials,
      true_effect_under_h1: trueEffectUnderH1,
      sd,
      seed,
    },
    rows,
  };
}

export const simulations = {
  aaPosterior,
  fixedHorizonEquivalence,
  optionalStopping,
  expectedLossMonitoring,
  informativePrior,
  thresholdSweep,
};
