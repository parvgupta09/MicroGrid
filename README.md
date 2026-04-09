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
