"""Deterministic random numbers shared with the browser implementation.

XorShift32 is not intended for cryptography. It is used here because its complete
32-bit state transition is portable between Python and JavaScript, which makes every
simulation reproducible in both environments.
"""

from __future__ import annotations

import math

_UINT32_SCALE = 4294967296.0


class Random:
    """Small deterministic PRNG with normal and gamma samplers."""

    def __init__(self, seed: int) -> None:
        self.state = seed & 0xFFFFFFFF or 0x6D2B79F5
        self._spare_normal: float | None = None

    def uint32(self) -> int:
        x = self.state
        x ^= (x << 13) & 0xFFFFFFFF
        x ^= x >> 17
        x ^= (x << 5) & 0xFFFFFFFF
        self.state = x & 0xFFFFFFFF
        return self.state

    def uniform(self) -> float:
        return (self.uint32() + 0.5) / _UINT32_SCALE

    def normal(self) -> float:
        if self._spare_normal is not None:
            value = self._spare_normal
            self._spare_normal = None
            return value
        radius = math.sqrt(-2.0 * math.log(self.uniform()))
        angle = 2.0 * math.pi * self.uniform()
        self._spare_normal = radius * math.sin(angle)
        return radius * math.cos(angle)

    def gamma(self, shape: float) -> float:
        if shape <= 0:
            raise ValueError("gamma shape must be positive")
        if shape < 1:
            return self.gamma(shape + 1) * self.uniform() ** (1 / shape)
        d = shape - 1 / 3
        c = 1 / math.sqrt(9 * d)
        while True:
            x = self.normal()
            v = 1 + c * x
            if v <= 0:
                continue
            v = v * v * v
            u = self.uniform()
            if u < 1 - 0.0331 * x**4:
                return d * v
            if math.log(u) < 0.5 * x * x + d * (1 - v + math.log(v)):
                return d * v
