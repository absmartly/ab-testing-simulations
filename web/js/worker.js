import { simulations } from "./simulations.js";

const experimentFunctions = {
  aa_posterior: simulations.aaPosterior,
  fixed_horizon_equivalence: simulations.fixedHorizonEquivalence,
  optional_stopping: simulations.optionalStopping,
  expected_loss_monitoring: simulations.expectedLossMonitoring,
  informative_prior: simulations.informativePrior,
  threshold_sweep: simulations.thresholdSweep,
};

self.addEventListener("message", (event) => {
  const { id, experiment, config } = event.data;
  const simulate = experimentFunctions[experiment];
  if (!simulate) {
    self.postMessage({ id, type: "error", message: `Unknown experiment: ${experiment}` });
    return;
  }
  try {
    const result = simulate({
      ...config,
      progress: (value) => self.postMessage({ id, type: "progress", value }),
    });
    self.postMessage({ id, type: "result", result });
  } catch (error) {
    self.postMessage({
      id,
      type: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});
