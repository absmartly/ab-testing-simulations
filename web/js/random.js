export class Random {
  constructor(seed) {
    this.state = (seed >>> 0) || 0x6d2b79f5;
    this.spareNormal = null;
  }

  uint32() {
    let x = this.state;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x >>> 0;
    return this.state;
  }

  uniform() {
    return (this.uint32() + 0.5) / 4294967296;
  }

  normal() {
    if (this.spareNormal !== null) {
      const value = this.spareNormal;
      this.spareNormal = null;
      return value;
    }
    const radius = Math.sqrt(-2 * Math.log(this.uniform()));
    const angle = 2 * Math.PI * this.uniform();
    this.spareNormal = radius * Math.sin(angle);
    return radius * Math.cos(angle);
  }

  gamma(shape) {
    if (!(shape > 0)) throw new RangeError("gamma shape must be positive");
    if (shape < 1) return this.gamma(shape + 1) * this.uniform() ** (1 / shape);
    const d = shape - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);
    while (true) {
      const x = this.normal();
      let v = 1 + c * x;
      if (v <= 0) continue;
      v = v * v * v;
      const u = this.uniform();
      if (u < 1 - 0.0331 * x ** 4) return d * v;
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
    }
  }
}
