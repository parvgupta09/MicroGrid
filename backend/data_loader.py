from __future__ import annotations

from pathlib import Path
from typing import Dict

import pandas as pd


REQUIRED_COLUMNS = ["Time", "Load", "Solar", "Battery", "Grid", "SOC"]


def load_case_csv(path: str | Path) -> pd.DataFrame:
    frame = pd.read_csv(path)
    missing = [column for column in REQUIRED_COLUMNS if column not in frame.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")
    return frame.copy()


def discover_case_files(folder: str | Path = "Datasets") -> Dict[str, Path]:
    # Handle both cases: running from root or from backend directory
    root = Path(folder)
    if not root.exists():
        # Try parent directory if not found
        root = Path("..") / folder
    if not root.exists():
        # Last resort: find absolute path
        root = Path(__file__).parent.parent / folder
    
    mapping: Dict[str, Path] = {}
    for case in ["residential", "industrial", "high_solar", "low_solar", "small_battery", "large_battery"]:
        candidate = root / f"{case}_data.csv"
        if candidate.exists():
            mapping[case] = candidate
    return mapping


def validate_frame(frame: pd.DataFrame) -> None:
    missing = [column for column in REQUIRED_COLUMNS if column not in frame.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")
    if frame[REQUIRED_COLUMNS].isna().any().any():
        raise ValueError("Input data contains NaN values")
    if not frame["Time"].is_monotonic_increasing:
        raise ValueError("Time column must be increasing")
