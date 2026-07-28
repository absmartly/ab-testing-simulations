# Methods

This repository is a reproducibility artifact for claims about Bayesian A/B testing.
It is deliberately vendor-neutral. It does not call an experimentation platform, use
private datasets, or validate ABsmartly's statistical engine.

## Reproducibility contract

- All simulations take an explicit 32-bit seed.
- Python and JavaScript use the same XorShift32 state transition.
- Both implementations use the same Box-Muller normal sampler and Marsaglia-Tsang
  gamma sampler.
- Binomial observations use an exact geometric-gap sampler rather than a normal
  approximation.
- Proportions include Wilson 95% confidence intervals. Monte Carlo estimates should
  always be read with those intervals, not as exact constants.

XorShift32 is used for portability, not cryptographic quality. Its role here is to make
a run repeatable in Python and in a browser. The conclusions are also tested across
multiple seeds.

## Experiment 1: A/A posterior sign probability

For each trial, both arms are generated from the same Bernoulli conversion rate:

```text
X_A, X_B ~ Binomial(n, p)
```

The prior is independent `Beta(1,1)` for each arm. The posterior is therefore:

```text
p_A | X_A ~ Beta(1 + X_A, 1 + n - X_A)
p_B | X_B ~ Beta(1 + X_B, 1 + n - X_B)
```

We estimate `P(p_B > p_A | data)` by posterior Monte Carlo draws.

### What it tests

At the equality boundary, repeated experiments do not make this posterior sign
probability converge to zero. Under the normal asymptotic approximation,

```text
P(delta > 0 | data) = Phi(Z),    Z ~ N(0,1) under A/A.
```

The probability integral transform implies `Phi(Z) ~ Uniform(0,1)`. Its mean is 0.5
and its standard deviation is `1/sqrt(12) ~= 0.2887`, regardless of sample size. This
is not a numerical bug; it is what a strict sign probability does at the boundary.

## Experiment 2: fixed-horizon equivalence

At one prespecified analysis, the experiment compares:

```text
Bayesian:    P(p_B > p_A | data) > 0.95
Frequentist: one-sided pooled z-test p-value < 0.05
```

With a flat prior and a regular large-sample model, the posterior distribution and
sampling distribution have the same asymptotic shape. The experiment reports both
false-positive rates, agreement, and the complete 2x2 decision matrix. It does not
claim mathematical identity for every finite sample or every prior.

## Experiment 3: repeated monitoring

The data model is a continuous outcome with known standard deviation. Rather than
materializing every observation, the simulation generates the sufficient statistic
for each increment exactly:

```text
sum(B - A) in an increment of m observations per arm
    ~ Normal(m * delta, 2 * m * sigma^2)
```

At each equally spaced look:

```text
delta_hat = cumulative_difference_sum / n
se        = sigma * sqrt(2/n)
P(delta > 0 | data, flat prior) = Phi(delta_hat / se)
```

The experiment compares continuous monitoring to one final analysis. It also reports
that, for this model, posterior monitoring at threshold `q` and unadjusted one-sided
p-value monitoring at alpha `1-q` make exactly the same decision at every look. Neither
is anytime-valid merely because one output is called a posterior probability.

## Experiment 4: posterior expected-loss stopping

For `delta | data ~ Normal(delta_hat, se^2)`, the posterior expected loss from choosing
B when it is actually worse is:

```text
E[max(0, -delta) | data]
    = se * phi(delta_hat/se) - delta_hat * Phi(-delta_hat/se)
```

The simulation stops at the first look where this loss is below a user-selected
threshold. Under A/A, every stop is a false positive if the business action is
"declare B safe/better and ship it." The chosen loss threshold is therefore part of
the decision rule and must be calibrated to a desired operating characteristic if an
error-rate interpretation is wanted.

## Experiment 5: informative priors and shrinkage

The portfolio model is:

```text
true effect delta ~ Normal(0, tau_true^2)
observed estimate d ~ Normal(delta, se^2)
```

For an assumed `Normal(0, tau_assumed^2)` prior, the posterior mean is:

```text
E[delta | d] = d * tau_assumed^2 / (tau_assumed^2 + se^2)
```

The simulation sweeps assumed prior widths and reports:

- root mean squared estimation error;
- fraction of experiments shipped;
- fraction of shipped experiments with a positive true effect;
- mean true and observed lift among shipped experiments;
- the ratio between claimed and true shipped lift.

This is a model-based demonstration, not a universal statement that every informative
prior helps. A prior can hurt when its center, shape, or width is badly misspecified.
The sensitivity curve exists to show that dependence.

## Experiment 6: speed versus error

The same monitoring paths are evaluated at a range of posterior probability thresholds.
For every threshold, the experiment reports:

- A/A false-positive probability at any look;
- power under a specified true effect;
- average first-stop look conditional on stopping.

This makes the trade-off visible: looser thresholds stop sooner under the alternative,
but they also stop sooner on noise. A claim of "faster decisions" is incomplete unless
its error rate is reported alongside it.

## Limitations

- The browser defaults use fewer trials than the committed publication run so they
  complete quickly on phones. Confidence intervals expose the resulting Monte Carlo
  uncertainty.
- The conversion experiments use independent Beta priors per arm. Hierarchical priors
  and covariance between variants are outside this repository's scope.
- The monitoring experiments use a known-variance normal model. This is intentional:
  it isolates the stopping-rule issue and makes the sufficient-statistic simulation
  exact. Unknown variance and non-normal outcomes add estimation details but do not
  make an unadjusted repeated threshold anytime-valid.
- The informative-prior experiment assumes its portfolio model. Real organizations
  should estimate and validate effect distributions using their own historical data.
