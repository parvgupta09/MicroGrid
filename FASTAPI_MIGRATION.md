# FastAPI Backend Setup Guide

## 🔄 Architecture Overview: Separated Backend & Frontend

### System Design

**Backend:**
- `backend/app.py` - FastAPI REST API server
- Handles all EMS logic, simulations, and data processing
- RESTful architecture for scalability and flexibility

**Frontend:**
- `frontend-showcase/` - Modern HTML/CSS/JS dashboard
- Communicates with backend via REST API
- Separated concerns: Backend logic vs Frontend UI

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Core Dependencies:**
- `fastapi>=0.104.0` - REST API framework
- `uvicorn>=0.24.0` - ASGI web server
- `pydantic` - Data validation
- Additional packages for EMS algorithms and data processing

### Step 2: Run the FastAPI Backend

```bash
cd backend
python app.py
```

Or using Uvicorn directly:
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend will start at `http://localhost:8000`

### Step 3: Open the Frontend

Open your browser and go to:
```
file:///path/to/microgrid/frontend-showcase/index.html
```

Or serve it with a local server:
```bash
cd frontend-showcase
python -m http.server 8080
# Then open http://localhost:8080/index.html
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
  "cases": ["residential", "industrial", "high_solar", ...],
  "count": 6
}
```

### POST /simulate
Run full simulation with all EMS methods
```json
{
  "case_name": "residential",  // Optional: use preset case
  "scenario_params": {          // OR use synthetic scenario
    "load1": 100,
    "load2": 150,
    "load3": 200,
    "solar_scale": 0.8,
    "battery_wh": 300,
    "soc_init": 0.5
  },
  "config_params": {}  // Optional: override default config
}
```

**Response:**
```json
{
  "success": true,
  "message": "Simulation completed successfully",
  "data": {
    "time": [0.0, 0.001, ...],
    "baseline": {
      "grid": [...],
      "solar": [...],
      "load": [...]
    },
    "rule_based": {
      "grid": [...],
      "battery": [...],
      "soc": [...]
    },
    "fuzzy": {
      "grid": [...],
      "battery": [...],
      "soc": [...]
    },
    "cost_comparison": [...]
  }
}
```

### POST /ems/rule-based
Run only rule-based EMS

### POST /ems/fuzzy
Run only fuzzy EMS

### POST /scenario/synthetic
Generate synthetic scenario without running full simulation

### POST /scenario/preset
Load preset scenario data

---

## 📊 Frontend Features

### Control Panel
- **Preset Cases**: Load pre-configured scenarios
- **Load Parameters**: Adjust load1, load2, load3 (kW)
- **Solar Scale**: Control solar generation intensity
- **Battery Capacity**: Set battery wh capacity
- **Playback Controls**: Play, Pause, Reset animation

### Visualizations
1. **Energy Generation vs Demand**
   - Solar generation, Load demand, Grid power

2. **EMS Comparison Chart**
   - Rule-based grid power vs Fuzzy grid power
   - Shows effectiveness of each algorithm

3. **Battery SOC Profiles**
   - State of Charge comparison
   - Rule-based vs Fuzzy EMS

### Performance Metrics
- Average grid power (lower = better)
- Peak SOC levels
- Improvement percentage vs baseline

---

## � Project Structure

```
microgrid/
├── backend/
│   ├── app.py                    ← FastAPI server
│   ├── requirements.txt          ← Dependencies
│   ├── config.py                 ← Configuration
│   ├── cost_model.py             ← Cost calculation
│   ├── ems_fuzzy.py              ← Fuzzy logic EMS
│   ├── ems_rule.py               ← Rule-based EMS
│   ├── load_allocator.py         ← Load distribution
│   ├── data_loader.py            ← Data utilities
│   ├── advanced_styles.py        ← Styling utilities
│   └── __init__.py
├── frontend-showcase/
│   ├── index.html                ← Main dashboard
│   ├── script.js                 ← API integration
│   └── styles.css                ← Styling
└── Datasets/
    └── *.csv                     ← Test datasets
```

---

## 🐛 Troubleshooting

### Port 8000 already in use?
```bash
python app.py --port 8001
```

### "Connection refused" error?
- Make sure FastAPI is running: `python app.py`
- Check API is accessible: `curl http://localhost:8000/`

### CORS errors?
- Frontend should access via `http://localhost:8000`
- Check your browser console for details

### Preset cases not loading?
- Ensure Datasets/ folder exists and has CSV files
- Check file names match: `{case}_data.csv`

---

## 🔮 Next Steps

### For Development:
1. Add WebSocket for real-time updates
2. Implement database for result caching
3. Create authenticated API endpoints
4. Add batch simulation support

### For Production:
1. Deploy backend on AWS/GCP/Azure
2. Deploy frontend on CDN (Vercel/Netlify)
3. Set up HTTPS/SSL certificates
4. Add monitoring & logging
5. Configure auto-scaling

---

## ❓ Questions?

Refer to:
- API docs: `http://localhost:8000/docs` (Swagger UI)
- ReDoc: `http://localhost:8000/redoc`
