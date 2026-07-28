# Bayesian A/B Testing Simulations

Reproduce and interactively explore claims about Bayesian A/B testing:

- why a flat-prior `P(B > A)` stays centered near 50% in repeated A/A tests;
- why a flat-prior posterior threshold and a one-sided p-value nearly coincide at a fixed horizon;
- how repeated monitoring changes false-positive rates;
- what an expected-loss stopping rule actually guarantees;
- when informative priors improve estimation and decisions;
- how apparent decision speed trades against false positives.

This repository is vendor-neutral. It does **not** validate ABsmartly's statistical engine or ask readers to trust an ABsmartly-specific simulation. The disputed Bayesian claims are implemented here in full, with source code, tests, seeded publication runs, and a browser version.

## Run everything

Requires Python 3.11 or newer.

```bash
git clone https://github.com/absmartly/ab-testing-simulations.git
cd ab-testing-simulations
python -m venv .venv
source .venv/bin/activate
python -m pip install -e '.[dev]'
python scripts/reproduce_all.py
pytest
```

Publication outputs are written to [`results/`](results/). The complete machine-readable bundle is [`results/reference-results.json`](results/reference-results.json).

## Run one experiment

```bash
ab-simulations optional-stopping --trials 50000 --looks 12 --threshold 0.95 --pretty
ab-simulations aa-posterior --trials 500 --seed 20260728 --pretty
ab-simulations informative-prior --trials 200000 --pretty
```

Use `ab-simulations --help` for all options.

## Interactive simulation lab

Open the [GitHub Pages simulation lab](https://absmartly.github.io/ab-testing-simulations/) to change assumptions, run simulations in your browser, inspect charts and tables, and download the results. Computation runs locally in a Web Worker. No experiment data is uploaded.

Every parameter can be set from the query string, so a configuration is a plain, readable link:

```
?experiment=optional_stopping&looks=12&trials=100000&threshold=0.95&seed=7
```

Omitted parameters use that field's default, and out-of-range or malformed values fall back to it rather than running an invalid configuration. The address bar updates as you edit, so the URL you copy always reproduces what is on screen. Each field name matches the CLI/Python argument for the same quantity.

**A link with parameters shows results immediately, with nothing to click.** If the parameters match the committed publication run, that stored result is displayed instantly; any other configuration is simulated in the browser on arrival. Append `&run=0` to open a pre-filled form without running it.

For local development:

```bash
python -m http.server 8000 --directory web
open http://localhost:8000
```

## What each experiment tests

| Experiment | Question | Main output |
|---|---|---|
| A/A posterior | Does `P(B>A)` converge to zero when A and B are equal? | Distribution by sample size |
| Fixed horizon | What does a flat prior add at one planned analysis? | False-positive rates and decision agreement |
| Repeated monitoring | Is a posterior threshold automatically safe to monitor? | Cumulative Type I error by look |
| Expected loss | Does a small posterior expected loss imply a controlled false-positive rate? | A/A stop rate and stopping stage |
| Informative prior | When does Bayesian shrinkage improve results? | RMSE, precision, ship rate, winner's curse |
| Threshold sweep | What buys an earlier decision? | Error, power, and stopping-time trade-off |

The full statistical specification, formulas, assumptions, and limitations are in [`METHODS.md`](METHODS.md).

## Reproducibility

Python and JavaScript use the same:

- XorShift32 seeded pseudo-random stream;
- Box-Muller normal sampler;
- Marsaglia-Tsang gamma sampler;
- exact geometric-gap binomial sampler;
- simulation formulas and output schema.

CI checks the implementations against deterministic golden values and cross-language fixtures. Monte Carlo proportions include Wilson 95% confidence intervals; do not interpret the last displayed decimal as exact.

## Project structure

```text
src/ab_testing_simulations/   Python reference implementation
scripts/reproduce_all.py      One-command publication run
results/                      Committed reference JSON and CSV outputs
tests/                        Statistical and cross-language tests
web/                          Dependency-free GitHub Pages application
METHODS.md                    Auditable statistical specification
```

## License

Apache-2.0. See [`LICENSE`](LICENSE).
