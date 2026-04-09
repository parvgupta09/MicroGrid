from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd

from config import EMSConfig
from data_loader import validate_frame


@dataclass
class SimulationResult:
    data: pd.DataFrame

    @property
    def frame(self) -> pd.DataFrame:
        return self.data


def simulate_rule_based(frame: pd.DataFrame, config: EMSConfig = EMSConfig()) -> pd.DataFrame:
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
        deficit = load[index] - solar[index]
        p_req = 0.6 * deficit
        if p_req > 0:
            p_req = p_req / config.eta
        else:
            p_req = p_req * config.eta

        p_req = float(np.clip(p_req, -config.battery_max_w, config.battery_max_w))

        if soc[index - 1] >= config.soc_max and p_req < 0:
            p_req = 0.0
        if soc[index - 1] <= config.soc_min and p_req > 0:
            p_req = 0.0

        battery[index] = p_req
        soc[index] = soc[index - 1] - (battery[index] * config.dt) / 3600.0 / config.battery_wh
        soc[index] = float(np.clip(soc[index], config.soc_min, config.soc_max))
        grid[index] = load[index] - (solar[index] + battery[index])

    output = frame.copy()
    output["Battery_rule"] = battery
    output["SOC_rule"] = soc
    output["Grid_rule"] = grid
    return output


def run_from_csv(path: str, config: EMSConfig = EMSConfig()) -> pd.DataFrame:
    frame = pd.read_csv(path)
    return simulate_rule_based(frame, config=config)


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="Run rule-based EMS on a CSV file.")
    parser.add_argument("csv_path")
    parser.add_argument("--output", default="rule_based_output.csv")
    args = parser.parse_args()

    result = run_from_csv(args.csv_path)
    result.to_csv(args.output, index=False)
    print(f"Saved {args.output}")


if __name__ == "__main__":
    main()
