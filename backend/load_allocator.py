from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

import numpy as np
import pandas as pd


@dataclass
class LoadAllocationResult:
    frame: pd.DataFrame


def allocate_priority_loads(available_power: float, loads: Iterable[float]) -> tuple[list[float], list[float]]:
    remaining = max(float(available_power), 0.0)
    served: list[float] = []
    shed: list[float] = []

    for demand in loads:
        demand_value = max(float(demand), 0.0)
        served_value = min(remaining, demand_value)
        served.append(served_value)
        shed.append(demand_value - served_value)
        remaining -= served_value

    return served, shed


def simulate_priority_allocation(
    time: np.ndarray,
    available_power: np.ndarray,
    load1: float | np.ndarray,
    load2: float | np.ndarray,
    load3: float | np.ndarray,
) -> pd.DataFrame:
    load1_series = np.full_like(time, load1, dtype=float) if np.isscalar(load1) else np.asarray(load1, dtype=float)
    load2_series = np.full_like(time, load2, dtype=float) if np.isscalar(load2) else np.asarray(load2, dtype=float)
    load3_series = np.full_like(time, load3, dtype=float) if np.isscalar(load3) else np.asarray(load3, dtype=float)

    served_1 = np.zeros_like(time, dtype=float)
    served_2 = np.zeros_like(time, dtype=float)
    served_3 = np.zeros_like(time, dtype=float)
    shed_1 = np.zeros_like(time, dtype=float)
    shed_2 = np.zeros_like(time, dtype=float)
    shed_3 = np.zeros_like(time, dtype=float)

    for index, power in enumerate(available_power):
        served, shed = allocate_priority_loads(power, [load1_series[index], load2_series[index], load3_series[index]])
        served_1[index], served_2[index], served_3[index] = served
        shed_1[index], shed_2[index], shed_3[index] = shed

    return pd.DataFrame(
        {
            "Time": time,
            "Available": available_power,
            "L1_Demand": load1_series,
            "L2_Demand": load2_series,
            "L3_Demand": load3_series,
            "L1_Served": served_1,
            "L2_Served": served_2,
            "L3_Served": served_3,
            "L1_Shed": shed_1,
            "L2_Shed": shed_2,
            "L3_Shed": shed_3,
        }
    )


def summarize_unserved_energy(allocation_frame: pd.DataFrame, dt: float) -> pd.DataFrame:
    totals = {
        "L1_Unserved_kWh": allocation_frame["L1_Shed"].sum() * dt / 3600.0 / 1000.0,
        "L2_Unserved_kWh": allocation_frame["L2_Shed"].sum() * dt / 3600.0 / 1000.0,
        "L3_Unserved_kWh": allocation_frame["L3_Shed"].sum() * dt / 3600.0 / 1000.0,
    }
    return pd.DataFrame([totals])
