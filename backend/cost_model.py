from __future__ import annotations

import numpy as np
import pandas as pd

from config import EMSConfig


def tariff_series(time: np.ndarray, config: EMSConfig = EMSConfig()) -> np.ndarray:
    return np.where(
        (time >= config.peak_start_s) & (time <= config.peak_end_s),
        config.peak_tariff_rs_per_kwh,
        config.offpeak_tariff_rs_per_kwh,
    )


def compute_cost(grid_power_w: np.ndarray, time: np.ndarray, config: EMSConfig = EMSConfig()) -> dict[str, float]:
    tariffs = tariff_series(time, config=config)
    dt = config.dt if len(time) < 2 else float(np.mean(np.diff(time)))
    energy_kwh = float(np.sum(grid_power_w) * dt / 3600.0 / 1000.0)
    cost_rs = float(np.sum(grid_power_w * tariffs) * dt / 3600.0 / 1000.0)
    return {"energy_kwh": energy_kwh, "cost_rs": cost_rs}


def compare_costs(
    time: np.ndarray,
    baseline_grid: np.ndarray,
    rule_grid: np.ndarray,
    fuzzy_grid: np.ndarray,
    config: EMSConfig = EMSConfig(),
) -> pd.DataFrame:
    results = []
    for label, grid in [("baseline", baseline_grid), ("rule_based", rule_grid), ("fuzzy", fuzzy_grid)]:
        metrics = compute_cost(grid, time, config=config)
        results.append({"Mode": label, **metrics})

    frame = pd.DataFrame(results)
    base_cost = float(frame.loc[frame["Mode"] == "baseline", "cost_rs"].iloc[0])
    frame["saving_pct_vs_baseline"] = np.where(base_cost > 0, (base_cost - frame["cost_rs"]) / base_cost * 100.0, 0.0)
    return frame


def annualize_cycle_cost(cost_rs: float, cycles_per_day: int = 5760) -> float:
    return float(cost_rs * cycles_per_day * 365.0)
