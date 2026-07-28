import assert from "node:assert/strict";
import test from "node:test";

import {
  aaPosterior,
  expectedLossMonitoring,
  fixedHorizonEquivalence,
  informativePrior,
  optionalStopping,
  thresholdSweep,
} from "../../web/js/simulations.js";

test("A/A sign probability stays centered around one half", () => {
  const result = aaPosterior({ sampleSizes: [500, 5000], trials: 500, posteriorDraws: 500, seed: 101 });
  for (const row of result.rows) {
    assert.ok(Math.abs(row.mean_probability - 0.5) < 0.06);
    assert.ok(row.sd_probability > 0.22 && row.sd_probability < 0.35);
  }
});

test("fixed horizon rules mostly agree", () => {
  const result = fixedHorizonEquivalence({
    sampleSizePerArm: 10000, trials: 1000, posteriorDraws: 1000, seed: 102,
  });
  assert.ok(result.agreement.rate > 0.98);
});

test("posterior and unadjusted p-value monitoring are identical", () => {
  const result = optionalStopping({ trials: 20000, seed: 103 });
  assert.deepEqual(
    result.posterior_monitoring.first_stop_counts,
    result.unadjusted_pvalue_monitoring.first_stop_counts,
  );
  assert.ok(result.posterior_monitoring.ever_stopped.rate > 0.12);
  assert.ok(result.final_look_only.rate < 0.065);
});

test("expected loss threshold is not an error guarantee", () => {
  const result = expectedLossMonitoring({ trials: 20000, seed: 105 });
  assert.ok(result.stopping.ever_stopped.rate > 0.3);
});

test("correct prior improves RMSE under its own model", () => {
  const result = informativePrior({ trials: 100000, seed: 106 });
  const flat = result.rows.find((row) => row.label === "flat");
  const correct = result.rows.find((row) => row.label === "correct");
  assert.ok(correct.rmse < flat.rmse * 0.75);
  assert.ok(correct.precision > flat.precision);
});

test("threshold sweep exposes speed-error tradeoff", () => {
  const result = thresholdSweep({
    thresholds: [0.8, 0.95, 0.99], trials: 20000, trueEffectUnderH1: 0.02, seed: 107,
  });
  assert.ok(result.rows[0].false_positive.rate > result.rows[1].false_positive.rate);
  assert.ok(result.rows[1].false_positive.rate > result.rows[2].false_positive.rate);
  assert.ok(result.rows[0].average_h1_stop_given_stop < result.rows[2].average_h1_stop_given_stop);
});
