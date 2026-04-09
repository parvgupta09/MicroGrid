"""
Advanced styling module for Streamlit dashboard
Contains CSS and styling constants used by simulator.py
"""

# CSS styles for Streamlit dashboard
ADVANCED_STYLES = """
<style>
/* Animated gradient background */
@keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

@keyframes floatAnimation {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
}

@keyframes slideIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
}

@keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 5px rgba(66, 165, 245, 0.3); }
    50% { box-shadow: 0 0 20px rgba(66, 165, 245, 0.6); }
}

/* Main background */
.main {
    background: linear-gradient(-45deg, #f5f7fa 0%, #e8f1f8 25%, #f0e8f8 50%, #f8f0e8 75%, #f5f7fa 100%);
    background-size: 400% 400%;
    animation: gradientShift 15s ease infinite;
    position: relative;
}

.main::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 20% 50%, rgba(66, 165, 245, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(102, 187, 106, 0.05) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
}

/* Adjust main content z-index */
.stMain > div {
    position: relative;
    z-index: 1;
}

/* Header styling */
.stTitle {
    animation: slideIn 0.8s ease-out;
    color: #1a237e !important;
    font-weight: 700 !important;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stSubtitle, .stCaption {
    color: #455a64 !important;
    animation: slideIn 0.8s ease-out 0.1s both;
}

/* Tabs styling */
.stTabs [data-baseweb="tab-list"] {
    background: linear-gradient(90deg, rgba(66, 165, 245, 0.05) 0%, rgba(102, 187, 106, 0.05) 100%);
    border-radius: 8px;
    padding: 4px;
    gap: 8px;
}

/* Button styling */
.stButton > button {
    background: linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%) !important;
    color: white !important;
    border: none !important;
    font-weight: 600 !important;
    border-radius: 8px !important;
    padding: 10px 24px !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 4px 15px rgba(66, 165, 245, 0.3) !important;
}

.stButton > button:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(66, 165, 245, 0.4) !important;
}

/* Metrics styling */
.stMetric {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 248, 255, 0.9) 100%) !important;
    border-left: 4px solid #42a5f5 !important;
    border-radius: 8px !important;
    padding: 16px !important;
    box-shadow: 0 4px 12px rgba(66, 165, 245, 0.15) !important;
}
</style>
"""
