import {
  aaPosterior,
  expectedLossMonitoring,
  fixedHorizonEquivalence,
  informativePrior,
  optionalStopping,
  thresholdSweep,
} from "../../web/js/simulations.js";

const output = {
  aa_posterior: aaPosterior({
    sampleSizes: [250, 2500],
    baselineRate: 0.07,
    trials: 40,
    posteriorDraws: 100,
    threshold: 0.93,
    seed: 112233,
  }),
  fixed_horizon: fixedHorizonEquivalence({
    sampleSizePerArm: 2000,
    baselineRate: 0.08,
    trials: 50,
    posteriorDraws: 100,
    threshold: 0.93,
    seed: 223344,
  }),
  optional_stopping: optionalStopping({
    totalSamplePerArm: 6000,
    looks: 6,
    trials: 300,
    threshold: 0.94,
    seed: 334455,
  }),
  expected_loss: expectedLossMonitoring({
    totalSamplePerArm: 6000,
    looks: 6,
    trials: 300,
    lossThreshold: 0.003,
    seed: 445566,
  }),
  informative_prior: informativePrior({
    trials: 1000,
    truePriorSd: 0.012,
    assumedPriorSds: [null, 0.006, 0.012, 0.024],
    standardError: 0.009,
    seed: 556677,
  }),
  threshold_sweep: thresholdSweep({
    thresholds: [0.85, 0.95, 0.99],
    totalSamplePerArm: 6000,
    looks: 6,
    trials: 500,
    trueEffectUnderH1: 0.025,
    seed: 667788,
  }),
};

process.stdout.write(`${JSON.stringify(output)}\n`);
