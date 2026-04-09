from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class EMSConfig:
    dt: float = 0.001
    sim_duration: float = 15.0
    battery_wh: float = 300.0
    battery_max_w: float = 1500.0
    eta: float = 0.9
    soc_init: float = 0.5
    soc_min: float = 0.2
    soc_max: float = 0.9
    peak_start_s: float = 6.0
    peak_end_s: float = 10.0
    peak_tariff_rs_per_kwh: float = 8.0
    offpeak_tariff_rs_per_kwh: float = 5.0


DEFAULT_CASES = (
    "residential",
    "industrial",
    "high_solar",
    "low_solar",
    "small_battery",
    "large_battery",
)


def time_grid(config: EMSConfig = EMSConfig()) -> list[float]:
    steps = int(round(config.sim_duration / config.dt))
    return [i * config.dt for i in range(steps + 1)]
