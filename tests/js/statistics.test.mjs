import assert from "node:assert/strict";
import test from "node:test";

import { Random } from "../../web/js/random.js";
import { normalCdf, normalPpf, wilsonInterval } from "../../web/js/statistics.js";

test("xorshift32 matches the golden sequence", () => {
  const rng = new Random(123456789);
  assert.deepEqual(
    Array.from({ length: 5 }, () => rng.uint32()),
    [2714967881, 2238813396, 1250077441, 3820100336, 3177519686],
  );
});

test("normal cdf and ppf round trip", () => {
  for (const probability of [0.001, 0.01, 0.1, 0.5, 0.9, 0.99, 0.999]) {
    assert.ok(Math.abs(normalCdf(normalPpf(probability)) - probability) < 8e-8);
  }
});

test("wilson interval contains the observed rate", () => {
  const [low, high] = wilsonInterval(50, 1000);
  assert.ok(low < 0.05 && 0.05 < high);
});
