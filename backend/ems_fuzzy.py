from __future__ import annotations

from functools import lru_cache

import numpy as np
import pandas as pd

from config import EMSConfig
from data_loader import validate_frame


def _triangular_membership(x: float, left: float, center: float, right: float) -> float:
    if x <= left or x >= right:
        return 0.0
    if x == center:
        return 1.0
    if x < center:
        return (x - left) / max(center - left, 1e-9)
    return (right - x) / max(right - center, 1e-9)


def _deficit_memberships(deficit: float) -> dict[str, float]:
    value = max(deficit, 0.0)
    return {
        "low": _triangular_membership(value, 0.0, 0.0, 1500.0),
        "medium": _triangular_membership(value, 1000.0, 2250.0, 3500.0),
        "high": _triangular_membership(value, 3000.0, 4500.0, 6000.0),
    }


def _soc_memberships(soc: float) -> dict[str, float]:
    value = float(np.clip(soc, 0.0, 1.0))
    return {
        "low": _triangular_membership(value, 0.0, 0.0, 0.35),
        "medium": _triangular_membership(value, 0.25, 0.5, 0.75),
        "high": _triangular_membership(value, 0.65, 1.0, 1.0),
    }


def _dispatch_membership(value: float, kind: str) -> float:
    if kind == "low":
        return _triangular_membership(value, 0.0, 0.0, 500.0)
    if kind == "medium":
        return _triangular_membership(value, 300.0, 600.0, 900.0)
    return _triangular_membership(value, 700.0, 1100.0, 1500.0)


@lru_cache(maxsize=8)
def _dispatch_lookup(max_dispatch_w: float, points: int = 300) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    universe = np.linspace(0.0, max_dispatch_w, points)
    low_curve = np.array([_dispatch_membership(x, "low") for x in universe], dtype=float)
    medium_curve = np.array([_dispatch_membership(x, "medium") for x in universe], dtype=float)
    high_curve = np.array([_dispatch_membership(x, "high") for x in universe], dtype=float)
    return universe, low_curve, medium_curve, high_curve


def fuzzy_battery_dispatch(deficit_w: float, soc: float, max_dispatch_w: float = 1500.0) -> float:
    deficit_memberships = _deficit_memberships(deficit_w)
    soc_memberships = _soc_memberships(soc)

    low_rules = [
        deficit_memberships["low"],
        min(deficit_memberships["medium"], soc_memberships["medium"]),
        min(deficit_memberships["medium"], soc_memberships["low"]),
        min(deficit_memberships["high"], soc_memberships["low"]),
    ]
    medium_rules = [
        min(deficit_memberships["high"], soc_memberships["medium"]),
        min(deficit_memberships["medium"], soc_memberships["high"]),
    ]
    high_rules = [
        min(deficit_memberships["high"], soc_memberships["high"]),
    ]

    universe, low_curve, medium_curve, high_curve = _dispatch_lookup(float(max_dispatch_w))
    aggregated = np.zeros_like(universe)

    low_level = max(low_rules) if low_rules else 0.0
    medium_level = max(medium_rules) if medium_rules else 0.0
    high_level = max(high_rules) if high_rules else 0.0

    if low_level > 0.0:
        aggregated = np.maximum(aggregated, np.minimum(low_level, low_curve))
    if medium_level > 0.0:
        aggregated = np.maximum(aggregated, np.minimum(medium_level, medium_curve))
    if high_level > 0.0:
        aggregated = np.maximum(aggregated, np.minimum(high_level, high_curve))

    area = float(np.trapezoid(aggregated, universe))
    if area <= 1e-9:
        return 0.0
    return float(np.trapezoid(universe * aggregated, universe) / area)


def simulate_fuzzy(frame: pd.DataFrame, config: EMSConfig = EMSConfig()) -> pd.DataFrame:
    validate_frame(frame)

    time = frame["Time"].to_numpy(dtype=float)
    load = frame["Load"].to_numpy(dtype=float)
    solar = frame["Solar"].to_numpy(dtype=float)

    battery = np.zeros_like(load, dtype=float)
    soc = np.zeros_like(load, dtype=float)
    grid = np.zeros_like(load, dtype=float)

    soc[0] = config.soc_init
    grid[0] = load[0] - solar[0]

    for index in range(1, len(frame)):
        deficit = max(load[index] - solar[index], 0.0)
        p_req = fuzzy_battery_dispatch(deficit, soc[index - 1], config.battery_max_w)

        if load[index] < solar[index]:
            p_req = -min(config.battery_max_w, (solar[index] - load[index]) * 0.5)

        if soc[index - 1] >= config.soc_max and p_req < 0:
            p_req = 0.0
        if soc[index - 1] <= config.soc_min and p_req > 0:
            p_req = 0.0

        p_req = float(np.clip(p_req, -config.battery_max_w, config.battery_max_w))
        battery[index] = p_req
        soc[index] = soc[index - 1] - (battery[index] * config.dt) / 3600.0 / config.battery_wh
        soc[index] = float(np.clip(soc[index], config.soc_min, config.soc_max))
        grid[index] = load[index] - (solar[index] + battery[index])

    output = frame.copy()
    output["Battery_fuzzy"] = battery
    output["SOC_fuzzy"] = soc
    output["Grid_fuzzy"] = grid
    return output


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="Run fuzzy EMS on a CSV file.")
    parser.add_argument("csv_path")
    parser.add_argument("--output", default="fuzzy_output.csv")
    args = parser.parse_args()

    frame = pd.read_csv(args.csv_path)
    result = simulate_fuzzy(frame)
    result.to_csv(args.output, index=False)
    print(f"Saved {args.output}")


if __name__ == "__main__":
    main()
