"""
FastAPI backend for Microgrid EMS System
Provides REST API for simulation, scenario generation, and optimization
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
import numpy as np
import pandas as pd
from typing import Optional, Dict, Any

load_dotenv()

from config import EMSConfig, time_grid
from cost_model import compare_costs
from ems_fuzzy import simulate_fuzzy
from ems_rule import simulate_rule_based
from load_allocator import simulate_priority_allocation, summarize_unserved_energy
from data_loader import discover_case_files

app = FastAPI(
    title="Microgrid EMS API",
    description="Energy Management System for Microgrids",
    version="1.0.0"
)

allowed_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

frontend_path = Path(__file__).resolve().parent.parent / "frontend-showcase"
frontend_available = frontend_path.exists()
if frontend_available:
    # Mount frontend under /frontend so API routes (e.g. /cases, /simulate) are not shadowed.
    app.mount("/frontend", StaticFiles(directory=str(frontend_path), html=True), name="frontend")

# ==================== Pydantic Models ====================

class ScenarioParams(BaseModel):
    """Parameters for synthetic scenario generation"""
    load1: float = 100.0
    load2: float = 150.0
    load3: float = 200.0
    solar_scale: float = 0.8
    battery_wh: float = 300.0
    soc_init: float = 0.5


class ConfigParams(BaseModel):
    """EMS Configuration parameters"""
    dt: float = 0.001
    sim_duration: float = 15.0
    battery_wh: float = 300.0
    battery_max_w: float = 1500.0
    eta: float = 0.9
    soc_init: float = 0.5
    soc_min: float = 0.2
    soc_max: float = 0.9


class SimulationRequest(BaseModel):
    """Request for running a simulation"""
    case_name: Optional[str] = None  # Use preset case
    scenario_params: Optional[ScenarioParams] = None  # Or generate synthetic
    config_params: Optional[ConfigParams] = None


class SimulationResponse(BaseModel):
    """Response from simulation"""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None


PRESET_CONFIG_OVERRIDES = {
    "small_battery": {"battery_wh": 150.0, "battery_max_w": 600.0},
    "large_battery": {"battery_wh": 800.0, "battery_max_w": 2500.0},
}



def _load_preset_case(case_name: str) -> Optional[pd.DataFrame]:
    cases = discover_case_files("Datasets")
    if case_name in cases:
        return pd.read_csv(cases[case_name])
    return None


def _resolve_config(
    config_params: Optional[ConfigParams],
    case_name: Optional[str] = None,
    scenario: Optional[pd.DataFrame] = None,
) -> EMSConfig:
    config_dict = config_params.dict() if config_params else {}

    if case_name in PRESET_CONFIG_OVERRIDES:
        for key, value in PRESET_CONFIG_OVERRIDES[case_name].items():
            config_dict.setdefault(key, value)

    if scenario is not None and "SOC" in scenario.columns:
        try:
            config_dict.setdefault("soc_init", float(scenario["SOC"].iloc[0]))
        except Exception:
            pass

    return EMSConfig(**config_dict)


def _apply_case_modifiers(scenario: pd.DataFrame, params: Optional[ScenarioParams]) -> pd.DataFrame:
    if params is None:
        return scenario

    updated = scenario.copy()

    solar_scale = float(params.solar_scale)
    if solar_scale != 1.0:
        load = updated["Load"].to_numpy(dtype=float)
        solar = updated["Solar"].to_numpy(dtype=float) * solar_scale
        solar = np.minimum(np.maximum(solar, 0.0), load)
        updated["Solar"] = solar
        updated["Grid"] = load - solar

    return updated


def _build_synthetic_scenario(
    load1: float,
    load2: float,
    load3: float,
    solar_scale: float,
    battery_wh: float,
    soc_init: float,
    config: EMSConfig,
) -> pd.DataFrame:
    time = np.array(time_grid(config), dtype=float)
    load_total = (
        load1 * (1.0 - 0.2 * np.exp(-((time - 4.0) ** 2) / 1.0))
        + load2 * (1.0 - 0.25 * np.exp(-((time - 6.0) ** 2) / 1.5))
        + load3 * (1.0 - 0.3 * np.exp(-((time - 8.0) ** 2) / 2.0))
    )
    solar = solar_scale * 2000.0 * (1.0 / (1.0 + np.exp(-(time - 5.0)))) * np.exp(-((time - 10.0) ** 2) / 30.0)
    solar[time < 3.0] = 0.0
    solar = np.minimum(solar, load_total)

    return pd.DataFrame(
        {
            "Time": time,
            "Load": load_total,
            "Solar": solar,
            "Battery": np.zeros_like(time),
            "Grid": load_total - solar,
            "SOC": np.full_like(time, soc_init, dtype=float),
        }
    )


@app.get("/")
async def root():
    if frontend_available:
        return RedirectResponse(url="/frontend/")

    return {
        "status": "running",
        "service": "Microgrid EMS API",
        "version": "1.0.0"
    }


@app.get("/health")
async def health():
    return {
        "status": "running",
        "service": "Microgrid EMS API",
        "version": "1.0.0"
    }


@app.get("/cases")
async def get_available_cases():
    cases = discover_case_files("Datasets")
    return {
        "cases": list(cases.keys()),
        "count": len(cases)
    }


@app.post("/simulate", response_model=SimulationResponse)
async def run_simulation(request: SimulationRequest):
    try:
        config = _resolve_config(request.config_params, request.case_name)

        if request.case_name:
            scenario = _load_preset_case(request.case_name)
            if scenario is None:
                return SimulationResponse(
                    success=False,
                    message=f"Case '{request.case_name}' not found"
                )
            scenario = _apply_case_modifiers(scenario, request.scenario_params)
            config = _resolve_config(request.config_params, request.case_name, scenario)
        elif request.scenario_params:
            params = request.scenario_params
            scenario = _build_synthetic_scenario(
                params.load1, params.load2, params.load3,
                params.solar_scale, params.battery_wh,
                params.soc_init, config
            )
        else:
            scenario = _build_synthetic_scenario(100, 150, 200, 0.8, 300, 0.5, config)
        
        rule_result = simulate_rule_based(scenario.copy(), config)
        fuzzy_result = simulate_fuzzy(scenario.copy(), config)
        
        cost_comparison = compare_costs(
            scenario["Time"].to_numpy(),
            scenario["Grid"].to_numpy(),
            rule_result["Grid_rule"].to_numpy(),
            fuzzy_result["Grid_fuzzy"].to_numpy(),
            config
        )
        
        time_array = scenario["Time"].tolist()
        
        return SimulationResponse(
            success=True,
            message="Simulation completed successfully",
            data={
                "case_name": request.case_name or "synthetic",
                "time": time_array,
                "baseline": {
                    "grid": scenario["Grid"].tolist(),
                    "solar": scenario["Solar"].tolist(),
                    "load": scenario["Load"].tolist(),
                },
                "rule_based": {
                    "grid": rule_result["Grid_rule"].tolist(),
                    "battery": rule_result["Battery_rule"].tolist(),
                    "soc": rule_result["SOC_rule"].tolist(),
                },
                "fuzzy": {
                    "grid": fuzzy_result["Grid_fuzzy"].tolist(),
                    "battery": fuzzy_result["Battery_fuzzy"].tolist(),
                    "soc": fuzzy_result["SOC_fuzzy"].tolist(),
                },
                "cost_comparison": cost_comparison.to_dict(orient="records"),
                "config": {
                    "dt": config.dt,
                    "duration": config.sim_duration,
                    "battery_wh": config.battery_wh,
                    "battery_max_w": config.battery_max_w,
                    "soc_init": config.soc_init,
                }
            }
        )
    
    except Exception as e:
        return SimulationResponse(
            success=False,
            message=f"Simulation failed: {str(e)}"
        )


@app.post("/scenario/synthetic")
async def generate_synthetic_scenario(params: ScenarioParams):
    """Generate a synthetic demand/generation scenario"""
    try:
        config = EMSConfig()
        scenario = _build_synthetic_scenario(
            params.load1, params.load2, params.load3,
            params.solar_scale, params.battery_wh,
            params.soc_init, config
        )
        
        return {
            "success": True,
            "data": {
                "time": scenario["Time"].tolist(),
                "load": scenario["Load"].tolist(),
                "solar": scenario["Solar"].tolist(),
                "grid": scenario["Grid"].tolist(),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/scenario/preset")
async def load_preset_scenario(case_name: str):
    """Load a preset scenario from datasets"""
    try:
        scenario = _load_preset_case(case_name)
        if scenario is None:
            raise HTTPException(status_code=404, detail=f"Case '{case_name}' not found")
        
        return {
            "success": True,
            "data": {
                "time": scenario["Time"].tolist(),
                "load": scenario["Load"].tolist(),
                "solar": scenario["Solar"].tolist(),
                "grid": scenario["Grid"].tolist(),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/ems/rule-based")
async def run_rule_based_ems(request: SimulationRequest):
    """Run rule-based EMS on a scenario"""
    try:
        config = _resolve_config(request.config_params, request.case_name)
        
        if request.case_name:
            scenario = _load_preset_case(request.case_name)
            if scenario is None:
                raise HTTPException(status_code=404, detail=f"Case '{request.case_name}' not found")
            config = _resolve_config(request.config_params, request.case_name, scenario)
        else:
            params = request.scenario_params or ScenarioParams()
            scenario = _build_synthetic_scenario(
                params.load1, params.load2, params.load3,
                params.solar_scale, params.battery_wh,
                params.soc_init, config
            )
        
        result = simulate_rule_based(scenario, config)
        
        return {
            "success": True,
            "data": {
                "time": result["Time"].tolist(),
                "grid": result["Grid_rule"].tolist(),
                "battery": result["Battery_rule"].tolist(),
                "soc": result["SOC_rule"].tolist(),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/ems/fuzzy")
async def run_fuzzy_ems(request: SimulationRequest):
    """Run fuzzy EMS on a scenario"""
    try:
        config = _resolve_config(request.config_params, request.case_name)
        
        if request.case_name:
            scenario = _load_preset_case(request.case_name)
            if scenario is None:
                raise HTTPException(status_code=404, detail=f"Case '{request.case_name}' not found")
            config = _resolve_config(request.config_params, request.case_name, scenario)
        else:
            params = request.scenario_params or ScenarioParams()
            scenario = _build_synthetic_scenario(
                params.load1, params.load2, params.load3,
                params.solar_scale, params.battery_wh,
                params.soc_init, config
            )
        
        result = simulate_fuzzy(scenario, config)
        
        return {
            "success": True,
            "data": {
                "time": result["Time"].tolist(),
                "grid": result["Grid_fuzzy"].tolist(),
                "battery": result["Battery_fuzzy"].tolist(),
                "soc": result["SOC_fuzzy"].tolist(),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    
    # Get environment variables with defaults
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    reload = os.getenv("RELOAD", "False").lower() == "true"
    
    uvicorn.run(app, host=host, port=port, reload=reload)
