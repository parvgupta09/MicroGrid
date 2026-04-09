# 🔋 Intelligent Microgrid Energy Management System (EMS)

## Project Overview

This is an **AI-powered Energy Management System** designed to optimize power distribution in microgrids using two intelligent algorithms: **Rule-Based Logic** and **Fuzzy Logic**. The system intelligently manages the flow of energy between solar panels, batteries, loads, and the main grid to minimize costs and maximize efficiency.

---

## 🎯 Key Features

### 1. **Dual Intelligent Control Algorithms** (NOT Machine Learning)
   - **Rule-Based EMS**: Uses predefined decision rules based on power deficit and battery state-of-charge (SOC)
     - Simple IF-THEN logic optimized for energy management
   - **Fuzzy Logic EMS**: Uses soft membership functions for smoother, more nuanced decision-making
     - Calculates weighted outputs instead of hard-coded thresholds
   - **Comparative Analysis**: Both methods are evaluated to show which performs better

### 2. **Real-Time Energy Optimization**
   - **Solar Power Management**: Utilizes renewable solar generation efficiently
   - **Battery Dispatch**: Intelligently charges/discharges battery based on demand and tariffs
   - **Grid Interaction**: Minimizes grid purchases during peak hours (high tariff) and maximizes grid supply during off-peak
   - **Load Priority Allocation**: Serves critical loads first, sheds non-essential loads if needed

### 3. **Cost Analysis & Savings Calculation**
   - **Time-Based Tariffs**: Peak hours (₹8/kWh) vs Off-peak (₹5/kWh)
   - **Cost Comparison**: Shows savings achieved by AI-optimized methods vs baseline grid purchase
   - **Annualized Reports**: Calculates yearly cost savings potential

### 4. **Dynamic Scenario Testing**
   - **6 Preset Test Cases**:
     - Residential microgrid
     - Industrial microgrid
     - High solar capacity scenario
     - Low solar capacity scenario
     - Small battery scenario
     - Large battery scenario
   - **Synthetic Scenario Generation**: Create custom scenarios with adjustable parameters

### 5. **Interactive Web Dashboard**
   - Real-time visualization of power flows
   - Live charts showing generation vs demand
   - Battery SOC (State of Charge) tracking
   - EMS decision logs showing algorithm decision-making process
   - Responsive, animated UI with smooth interactions

---

## ⚠️ **Important Note: What This IS and ISN'T**

### **This is NOT:**
- ❌ Machine Learning or Deep Learning
- ❌ Neural Networks or AI Training
- ❌ Self-improving algorithms (no historical learning)
- ❌ Black-box prediction systems

### **This IS:**
- ✅ **Optimization Logic** - Mathematical algorithms to minimize cost
- ✅ **Control Engineering** - Real-time response to system state
- ✅ **Intelligent Heuristics** - Expert-designed decision rules
- ✅ **Fuzzy Control Systems** - Handles uncertainty with membership functions
- ✅ **Deterministic & Explainable** - Every decision has a clear reason

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MICROGRID SYSTEM                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ☀️ SOLAR PANELS ─────┐                                     │
│                       ├─→ [Power Router] ─→ 🏠 LOADS        │
│  🔋 BATTERY ──────────┤                    (Houses/       │
│                       ├─→                   Industries)    │
│  🔌 GRID ─────────────┘                                     │
│                       ▲                                     │
│            EMS AI    [Algorithm decides optimal flow]       │
│        Rule-Based &  ├─ How much solar to use?             │
│        Fuzzy Logic   ├─ Charge or discharge battery?       │
│                      ├─ Buy from grid or sell to grid?     │
│                      └─ Which loads to prioritize?         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Electrical Engineering Design

### System Parameters & Specifications

The microgrid operates at standard electrical specifications designed for practical deployment:

**Grid Interface:**
- **Grid Voltage**: 230V AC (single-phase)
- **Frequency**: 50 Hz (standard in many countries)
- **Maximum Power Rating**: 5000W+ (soft limit, expandable)

**Battery Storage System:**
- **Chemistry**: 48V DC nominal
- **Capacities (Configurable)**:
  - Small scenario: 150 Wh
  - Standard scenario: 300 Wh
  - Large scenario: 800 Wh
- **Maximum Discharge Power**: 1500W
- **Maximum Charge Power**: 1500W
- **Round-trip Efficiency**: 90%
- **SOC Operating Range**: 20% - 90% (protected window)

**Solar PV Array:**
- **Peak Capacity**: 2000W (nominal, scalable)
- **Voltage Output**: Suitable for DC-DC conversion to 48V battery bus
- **Generation Profile**: Dynamic based on time-of-day and weather scenarios
  - Low-irradiance scenario: 0.5× nominal
  - High-irradiance scenario: 1.5× nominal

**Loads (Demand Profiles):**
- **Residential Clusters**:
  - Load 1: 1500W peak (distributed heating, cooling)
  - Load 2: 1200W peak (appliances, lighting)
  - Total: ~2700W peak residential demand
- **Industrial Clusters**:
  - Load 1: 3000W peak (industrial equipment)
  - Load 2: 2500W peak (machinery, motors)
  - Total: ~5500W peak industrial demand

### Power Flow Architecture

```
                    ┌─────────────────────────────┐
                    │   MICROGRID POWER BUS       │
                    │      (DC 48V primary)       │
                    └─────────────┬───────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
            ┌───────────────┐ ┌─────────┐ ┌──────────────┐
            │  PV Array     │ │ Battery │ │   Grid Tie   │
            │   (2000W)     │ │ (48V)   │ │  Inverter    │
            │   ~250V DC    │ │ Bidirectional
            │     or        │ │   DC-DC │ │  (AC 230V)   │
            │   10 Panels   │ │ Converter│ │              │
            └───────────────┘ └─────────┘ └──────────────┘
                    │             │             │
                    └─────────────┼─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │   EMS Control Signals    │
                    │  (via microcontroller or │
                    │   Power Electronics)     │
                    └─────────────╤─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │  DISTRIBUTION SYSTEM     │
                    │  (AC 230V to Loads)      │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
            ┌───────────────┐ ┌─────────┐ ┌──────────────┐
            │   Residential │ │Industrial│ │  Critical    │
            │    Loads      │ │  Loads  │ │    Loads     │
            │  (1.5-1.2kW)  │ │(3-2.5kW)│ │   (Priority) │
            └───────────────┘ └─────────┘ └──────────────┘
```

### Electrical Operating Scenarios

**Scenario 1: Residential Microgrid (Low-Demand)**
- Peak load demand: ~2700W
- Solar generation (optimal): 2000W
- Battery capacity: 300Wh
- Grid role: Peak shaving & emergency backup
- Typical cost savings: 35-45%

**Scenario 2: Industrial Microgrid (High-Demand)**
- Peak load demand: ~5500W
- Solar generation: 2000W (insufficient)
- Battery capacity: 300Wh (standard)
- Grid role: Primary power source with demand management
- Typical cost savings: 20-30%

**Scenario 3: High Solar Availability**
- Solar multiplier: 1.5× (3000W peak)
- Increased battery charging opportunity
- Potential grid injection (export earnings)
- Cost reductions: 45-55%

**Scenario 4: Low Solar Availability**
- Solar multiplier: 0.5× (1000W peak)
- Heavy grid dependency
- Battery as emergency buffer
- Cost impacts: Minimal savings (10-15%)

### Battery State Management

The system implements intelligent battery SOC (State-of-Charge) protection:

```
100% ┌──────────────────────────────┐
     │      ⚠️ Over-charge Zone    │
     │   (>90% - charging inhibited)│
 90% ├──────────────────────────────┤
     │                              │
     │    ✅ SAFE OPERATING WINDOW   │
     │    (20% - 90% optimized)     │
     │                              │
 20% ├──────────────────────────────┤
     │    ⚠️  Deep-discharge Zone    │
     │   (<20% - discharging blocked)│
  0% └──────────────────────────────┘
```

**Protection Logic:**
- When SOC ≥ 90%: Battery charging stops (protects longevity)
- When SOC ≤ 20%: Battery discharging stops (prevents deep discharge damage)
- Efficiency factor: 0.9 accounts for charge/discharge conversion losses

### Power Calculations

**Battery Power Requirement (Per EMS Decision):**
```
P_required = 0.6 × (Load_Demand - Solar_Generation)
```
- 60% of power deficit sourced from battery
- Remaining 40% from grid (cost optimization)
- Efficiency applied: P_adj = P_req / η (discharge) or P_req × η (charge)

**Grid Power Flow:**
```
P_grid = Load_Total - (P_solar + P_battery)
```
- Positive P_grid: Power imported from grid (cost incurred)
- Negative P_grid: Power exported to grid (potential revenue)

### Time-Based Tariff Integration

The system operates under realistic tariff structures:

- **Peak Hours (8 AM - 8 PM)**: ₹8.00/kWh
- **Off-peak Hours**: ₹5.00/kWh
- **Export Rate (to grid)**: ₹3.00/kWh (wholesale rate)

**EMS Optimization Objective:**
- Minimize peak-hour grid imports
- Maximize solar utilization
- Manage battery dispatch for cost reduction
- Timing-aware load prioritization

---

### MATLAB/Simulink Implementation

**Source Code Reference:** [Microgrid_code.m.txt](Microgrid_code.m.txt)

The MATLAB code generates synthetic realistic electrical scenarios:

```matlab
% Key electrical parameters
V = 230;           % Grid voltage (Volts)
V_batt = 48;       % Battery voltage (Volts)
dt = 0.001;        % Simulation timestep (seconds)
E_batt = 300;      % Battery energy (Wh)
P_batt_max = 1500; % Battery power limit (Watts)
eta = 0.9;         % Battery efficiency (90%)
```

**Simulink Model:** [Microgrid_System.slx](Microgrid_System.slx/)

The Simulink model provides:
- Real-time electrical measurements visualization
- Power flow simulation across all components
- Dynamic load and solar profile generation
- Battery SOC tracking and protection
- Grid interaction analysis
- Harmonic and stability analysis capabilities

**Outputs Generated:**
- 15-second simulation windows (0.001s resolution = 15,000 timesteps)
- 6 preset scenarios with varying electrical characteristics
- CSV datasets with Time, Load, Solar, Battery, Grid, SOC columns
- Voltage/current waveforms (from Simulink)
- Power quality metrics (THD, power factor, etc.)

### Equipment Specifications (Practical Deployment)

**Recommended Components for 3kW Residential System:**

| Component | Specification | Typical Cost |
|-----------|--------------|-------------|
| **PV Panels** | 2kW (8-10 × 250W modules) | $2,000-3,000 |
| **Inverter** | 3.5kW hybrid inverter (48V DC in) | $1,500-2,500 |
| **Battery Pack** | 300Wh LiFePO₄ (48V 6S) | $1,800-2,500 |
| **DC-DC Charger** | 60A MPPT controller | $300-500 |
| **Wiring & Protection** | DC/AC breakers, cables | $500-800 |
| **Installation Labor** | Professional setup | $1,000-2,000 |
| **TOTAL SYSTEM** | Turnkey 3kW microgrid | **$7,100-11,300** |

**Expected Payback Period:** 4-7 years (depending on location and tariffs)

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Step 1: Clone/Navigate to Project

```bash
cd d:\Projects\microgrid
```

### Step 2: Create Virtual Environment (Recommended)

```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 4: Start the FastAPI Backend

```bash
python app.py
```

Or using Uvicorn with live reload:
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend will start at `http://localhost:8000`

### Step 5: Access the Frontend

**Option A: Direct File Access**
```
Open: file:///d:\Projects\microgrid\frontend-showcase\index.html
```

**Option B: Local HTTP Server (Recommended)**
```bash
cd frontend-showcase
python -m http.server 8080
# Then open: http://localhost:8080/index.html
```

---

## 📚 API Endpoints

### GET /
Health check endpoint
```json
{
  "status": "running",
  "service": "Microgrid EMS API",
  "version": "1.0.0"
}
```

### GET /cases
List available preset cases
```json
{
  "cases": ["residential", "industrial", "high_solar", "low_solar", "small_battery", "large_battery"],
  "count": 6
}
```

### POST /simulate
Run full simulation with all EMS methods
```json
{
  "case_name": "residential",
  "scenario_params": {
    "load1": 100,
    "load2": 150,
    "load3": 200,
    "solar_scale": 0.8,
    "battery_wh": 300,
    "soc_init": 0.5
  },
  "config_params": {}
}
```

**Response:**
```json
{
  "success": true,
  "message": "Simulation completed successfully",
  "data": {
    "time": [0.0, 0.001, ...],
    "baseline": {...},
    "rule_based": {...},
    "fuzzy": {...},
    "cost_comparison": [...]
  }
}
```

### POST /ems/rule-based
Run only rule-based EMS algorithm

### POST /ems/fuzzy
Run only fuzzy EMS algorithm

### POST /scenario/synthetic
Generate synthetic scenario without running full simulation

### POST /scenario/preset
Load preset scenario data

For complete API documentation, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 📊 Dashboard Features

### Control Panel
- **Preset Cases**: Load pre-configured scenarios
- **Load Parameters**: Adjust load1, load2, load3 (kW)
- **Solar Scale**: Control solar generation intensity
- **Battery Capacity**: Set battery wh capacity
- **Playback Controls**: Play, Pause, Reset simulation

### Visualizations
1. **Energy Generation vs Demand**
   - Solar generation, Load demand, Grid power

2. **EMS Comparison Chart**
   - Rule-based grid power vs Fuzzy grid power
   - Shows effectiveness of each algorithm

3. **Battery SOC Profiles**
   - State of Charge comparison
   - Rule-based vs Fuzzy EMS performance

### Performance Metrics
- Average grid power (lower = better)
- Peak SOC levels
- Improvement percentage vs baseline

---

## 📁 Project Structure

```
microgrid/
├── backend/
│   ├── app.py                    ← FastAPI server
│   ├── requirements.txt          ← Dependencies
│   ├── config.py                 ← Configuration
│   ├── cost_model.py             ← Cost calculation engine
│   ├── ems_fuzzy.py              ← Fuzzy logic EMS
│   ├── ems_rule.py               ← Rule-based EMS
│   ├── load_allocator.py         ← Load distribution
│   ├── data_loader.py            ← Data loading utilities
│   ├── advanced_styles.py        ← UI styling
│   └── __init__.py
├── frontend-showcase/
│   ├── index.html                ← Main dashboard
│   ├── script.js                 ← Frontend logic
│   └── styles.css                ← Styling
├── Datasets/
│   ├── residential_data.csv
│   ├── industrial_data.csv
│   ├── high_solar_data.csv
│   ├── low_solar_data.csv
│   ├── small_battery_data.csv
│   └── large_battery_data.csv
├── README.md                     ← This file
├── .gitignore                    ← Git ignore rules
└── Microgrid_System.slx/         ← Simulink model
```

---

## 🔧 Configuration

Edit `backend/config.py` to customize:
- Time-based tariff rates
- Battery parameters
- Load thresholds
- EMS algorithm parameters
- Simulation duration

---

## 🐛 Troubleshooting

### Port 8000 already in use?
```bash
python app.py --port 8001
```

### "Connection refused" error?
- Ensure FastAPI is running
- Check API is accessible: `curl http://localhost:8000/`

### CORS errors?
- Frontend should access via `http://localhost:8000`
- Check browser console for error details

### Preset cases not loading?
- Verify Datasets/ folder exists
- Confirm file names match: `{case_name}_data.csv`

### Import errors?
- Activate virtual environment
- Reinstall dependencies: `pip install -r requirements.txt`

---

## 🔮 Future Enhancements

### Planned Features:
- WebSocket support for real-time updates
- Database integration for result caching
- Authentication & authorization
- Batch simulation support
- Historical data analysis
- Predictive battery management
- Multi-microgrid coordination

### Deployment Options:
- Cloud platforms (AWS, GCP, Azure)
- Docker containerization
- Kubernetes orchestration
- CDN frontend hosting (Vercel, Netlify)

---

## 📖 Additional Resources

- **FASTAPI_MIGRATION.md** - Detailed backend setup guide
- **PROJECT_EXPLANATION.md** - In-depth project documentation
- FastAPI Docs: https://fastapi.tiangolo.com/
- Fuzzy Logic Theory: https://en.wikipedia.org/wiki/Fuzzy_logic

---

## 📝 License

This project is part of the Microgrid Energy Management System research and development.

---

## 🤝 Contributing

For improvements, bug reports, or feature requests, please review the code structure and refer to the setup documentation.

---

## ❓ Support

Refer to:
- This README for setup and features
- FASTAPI_MIGRATION.md for backend details
- API documentation at `http://localhost:8000/docs`
