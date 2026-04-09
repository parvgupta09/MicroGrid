// ============================================================
// INTELLIGENT MICROGRID — FRONTEND SCRIPT
// Chart.js + API Integration + Live Clock
// ============================================================

// Use current origin for API calls (works for both localhost and production)
const API_URL = window.location.origin;

// State
let simulationData = null;
let currentTimeIndex = 0;
let isAnimating = false;
let animationInterval = null;
const animationSpeed = 80;

// Chart instances
let energyChart, comparisonChart, socChart;

// Available cases
let availableCases = [];

// ===================== ANTIGRAVITY CANVAS LAUNCH SCREEN =====================

function initElectricalGrid() {
    // Handled by initSplashCanvas below
}

// ===================== HELP MODAL =====================
function openHelpModal() {
    const modal = document.getElementById('help-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeHelpModal() {
    const modal = document.getElementById('help-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// ===================== CANVAS PARTICLE SYSTEM =====================
function initSplashCanvas() {
    const canvas = document.getElementById('splash-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    });

    // ── Stars ──────────────────────────────────────────────────────
    const STAR_COUNT = 220;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 0.3,
        speed: Math.random() * 0.15 + 0.03,
        alpha: Math.random() * 0.25 + 0.08,
        twinkleSpeed: Math.random() * 0.015 + 0.004,
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
    }));

    // ── Energy nodes (connected by arcs) ──────────────────────────
    const NODE_COUNT = 18;
    const nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 3 + 1.5,
        hue: [240, 260, 280, 160][Math.floor(Math.random() * 4)], // indigo, purple, violet, teal
        alpha: Math.random() * 0.5 + 0.25,
    }));

    // ── Electric arc class ─────────────────────────────────────────
    const arcs = [];
    class Arc {
        constructor(x1, y1, x2, y2, hue) {
            this.x1 = x1; this.y1 = y1;
            this.x2 = x2; this.y2 = y2;
            this.hue = hue;
            this.life = 1;
            this.decay = Math.random() * 0.04 + 0.02;
            this.segments = Math.floor(Math.random() * 5) + 4;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.life * 0.45;
            ctx.strokeStyle = `hsl(${this.hue}, 75%, 45%)`;
            ctx.shadowColor = `hsl(${this.hue}, 80%, 45%)`;
            ctx.shadowBlur = 8;
            ctx.lineWidth = Math.random() * 0.8 + 0.3;
            ctx.beginPath();
            ctx.moveTo(this.x1, this.y1);
            const dx = this.x2 - this.x1;
            const dy = this.y2 - this.y1;
            for (let i = 1; i < this.segments; i++) {
                const t = i / this.segments;
                const jitter = (Math.random() - 0.5) * 28 * (1 - Math.abs(t - 0.5) * 2);
                ctx.lineTo(
                    this.x1 + dx * t + jitter,
                    this.y1 + dy * t + jitter
                );
            }
            ctx.lineTo(this.x2, this.y2);
            ctx.stroke();
            ctx.restore();
            this.life -= this.decay;
        }
        get dead() { return this.life <= 0; }
    }

    let frameCount = 0;

    function animate() {
        ctx.clearRect(0, 0, W, H);
        frameCount++;

        // ── Draw stars ────────────────────────────────────────────
        for (const s of stars) {
            s.alpha += s.twinkleSpeed * s.twinkleDir;
            if (s.alpha > 1) { s.alpha = 1; s.twinkleDir = -1; }
            if (s.alpha < 0.1) { s.alpha = 0.1; s.twinkleDir = 1; }
            s.y += s.speed;
            if (s.y > H) { s.y = 0; s.x = Math.random() * W; }

            ctx.save();
            ctx.globalAlpha = s.alpha;
            ctx.fillStyle = `hsl(240, 60%, 35%)`;
            ctx.shadowColor = `hsla(240, 80%, 50%, 0.3)`;
            ctx.shadowBlur = 3;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // ── Move & draw nodes ─────────────────────────────────────
        for (const n of nodes) {
            n.x += n.vx; n.y += n.vy;
            if (n.x < 0 || n.x > W) n.vx *= -1;
            if (n.y < 0 || n.y > H) n.vy *= -1;

            ctx.save();
            ctx.globalAlpha = n.alpha * 0.75;
            ctx.fillStyle = `hsl(${n.hue}, 80%, 45%)`;
            ctx.shadowColor = `hsl(${n.hue}, 80%, 40%)`;
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // ── Draw connection lines between nearby nodes ─────────────
        const CONNECT_DIST = 200;
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECT_DIST) {
                    const alpha = (1 - dist / CONNECT_DIST) * 0.18;
                    const hue = (nodes[i].hue + nodes[j].hue) / 2;
                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.strokeStyle = `hsl(${hue}, 75%, 45%)`;
                    ctx.shadowColor = `hsl(${hue}, 75%, 45%)`;
                    ctx.shadowBlur = 4;
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }

        // ── Spawn electric arcs randomly ──────────────────────────
        if (frameCount % 8 === 0 && Math.random() < 0.7) {
            const a = nodes[Math.floor(Math.random() * nodes.length)];
            const b = nodes[Math.floor(Math.random() * nodes.length)];
            if (a !== b) {
                const dist = Math.hypot(a.x - b.x, a.y - b.y);
                if (dist < 350) {
                    arcs.push(new Arc(a.x, a.y, b.x, b.y, a.hue));
                }
            }
        }

        // ── Draw & cull arcs ──────────────────────────────────────
        for (let i = arcs.length - 1; i >= 0; i--) {
            arcs[i].draw();
            if (arcs[i].dead) arcs.splice(i, 1);
        }

        requestAnimationFrame(animate);
    }

    animate();
}

// ===================== BOOT TERMINAL TYPEWRITER =====================
function runBootTerminal() {
    const lines = [
        'Loading fuzzy_controller.py ... OK',
        'MATLAB dataset linked ... 15,001 pts ready',
    ];
    const el1 = document.getElementById('term-1');
    const el2 = document.getElementById('term-2');
    if (!el1 || !el2) return;

    function typeText(el, text, delay, speed = 30) {
        return new Promise(resolve => {
            setTimeout(() => {
                let i = 0;
                const iv = setInterval(() => {
                    el.textContent = text.slice(0, i + 1);
                    i++;
                    if (i >= text.length) { clearInterval(iv); resolve(); }
                }, speed);
            }, delay);
        });
    }

    setTimeout(async () => {
        await typeText(el1, lines[0], 0, 28);
        await typeText(el2, lines[1], 200, 28);
    }, 2400);
}

// ===================== SPLASH SCREEN =====================
function initSplashScreen() {
    initSplashCanvas();
    runBootTerminal();

    const splashBtn    = document.getElementById('splash-btn');
    const splashScreen = document.getElementById('splash-screen');

    function closeSplash() {
        splashScreen.classList.add('hidden');
        setTimeout(() => { splashScreen.style.display = 'none'; }, 1200);
    }

    if (splashBtn) splashBtn.addEventListener('click', closeSplash);
}

function showSyntheticModal() {
    const modal = document.getElementById('scenario-modal');
    const values = {
        load1: parseFloat(document.getElementById('load1').value),
        load2: parseFloat(document.getElementById('load2').value),
        load3: parseFloat(document.getElementById('load3').value),
        solar: parseFloat(document.getElementById('solar-scale').value),
        battery: parseFloat(document.getElementById('battery-wh').value)
    };
    
    // Update modal table with current values
    document.getElementById('modal-load1').textContent = values.load1.toFixed(0);
    document.getElementById('modal-load2').textContent = values.load2.toFixed(0);
    document.getElementById('modal-load3').textContent = values.load3.toFixed(0);
    document.getElementById('modal-solar').textContent = values.solar.toFixed(2);
    document.getElementById('modal-battery').textContent = values.battery.toFixed(0);
    document.getElementById('modal-total').textContent = (values.load1 + values.load2 + values.load3).toFixed(0);
    
    modal.classList.add('active');
}

function hideSyntheticModal() {
    const modal = document.getElementById('scenario-modal');
    modal.classList.remove('active');
}

function initSyntheticModal() {
    const modal = document.getElementById('scenario-modal');
    const modalClose = document.getElementById('modal-close');
    const modalEditBtn = document.getElementById('modal-edit-btn');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    
    if (modalClose) {
        modalClose.addEventListener('click', hideSyntheticModal);
    }
    
    if (modalEditBtn) {
        modalEditBtn.addEventListener('click', hideSyntheticModal);
    }
    
    if (modalConfirmBtn) {
        modalConfirmBtn.addEventListener('click', () => {
            hideSyntheticModal();
            document.getElementById('run-simulation-btn').click();
        });
    }
    
    // Close modal when clicking overlay
    const overlay = modal.querySelector('.modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', hideSyntheticModal);
    }
}

// ===================== INIT =====================
function initManualControls() {
    const caseSelector = document.getElementById('case-selector');
    const manualControls = document.getElementById('manual-controls');
    if (caseSelector && manualControls) {
        // Default: synthetic scenario is selected, so show controls
        const isSynthetic = caseSelector.value === '';
        if (isSynthetic) {
            manualControls.classList.remove('hidden');
        } else {
            manualControls.classList.add('hidden');
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    initElectricalGrid();
    initSplashScreen();
    initSyntheticModal();
    startClock();
    await loadCases();
    initCharts();
    setupEvents();
    initManualControls();
    await runDefaultSimulation();
});

// ===================== CLOCK =====================
function startClock() {
    const el = document.getElementById('header-clock');
    if (!el) return;
    function tick() {
        const now = new Date();
        el.textContent = now.toLocaleTimeString('en-US', { hour12: false });
    }
    tick();
    setInterval(tick, 1000);
}

// ===================== CASES =====================
async function loadCases() {
    try {
        const res = await fetch(`${API_URL}/cases`);
        const data = await res.json();
        availableCases = data.cases;
        updateCaseSelector();
        log('System ready — cases loaded', 'info');
    } catch (err) {
        console.warn('Could not load cases:', err);
        log('Warning: Could not reach backend', 'warning');
    }
}

function updateCaseSelector() {
    const sel = document.getElementById('case-selector');
    if (!sel) return;
    sel.innerHTML = `<option value="">— Synthetic Scenario —</option>` +
        availableCases.map(c =>
            `<option value="${c}">${c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>`
        ).join('');
}

// ===================== NAV ACTIVE STATE =====================
function setActiveNav(id) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
}

// ===================== EVENTS =====================
function setupEvents() {
    document.getElementById('run-simulation-btn')?.addEventListener('click', runSimulationFromUI);
    document.getElementById('play-btn')?.addEventListener('click', startAnimation);
    document.getElementById('pause-btn')?.addEventListener('click', pauseAnimation);
    document.getElementById('reset-btn')?.addEventListener('click', resetAnimation);

    // Case selector with synthetic scenario modal
    const caseSelector = document.getElementById('case-selector');
    const manualControls = document.getElementById('manual-controls');
    if (caseSelector) {
        caseSelector.addEventListener('change', (e) => {
            const isSynthetic = e.target.value === '';
            if (isSynthetic) {
                // Synthetic scenario: show manual controls and modal
                if (manualControls) manualControls.classList.remove('hidden');
                showSyntheticModal();
            } else {
                // Preset case: hide manual controls
                if (manualControls) manualControls.classList.add('hidden');
                log(`Preset case selected: ${e.target.value}`, 'info');
            }
        });
    }

    // Time slot selection handlers
    const timeSlotConfigs = {
        morning:   0.4,
        afternoon: 0.9,
        evening:   0.3,
        night:     0.0
    };

    Object.keys(timeSlotConfigs).forEach(slot => {
        const btn = document.getElementById(`slot-${slot}`);
        if (!btn) return;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.time-slot').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            log(`Time period selected: ${slot.charAt(0).toUpperCase() + slot.slice(1)}`, 'info');
            const solarInput = document.getElementById('solar-scale');
            if (solarInput) {
                solarInput.value = timeSlotConfigs[slot];
                solarInput.dispatchEvent(new Event('input'));
            }
        });
    });

    // Set morning as default
    const morningBtn = document.getElementById('slot-morning');
    if (morningBtn) morningBtn.click();

    // Sidebar nav scroll-tracking (smooth active state)
    const sections = ['control-section', 'metrics-section', 'charts-section', 'log-section', 'help-section'];
    const navMap = {
        'control-section':  'nav-control',
        'metrics-section':  'nav-metrics',
        'charts-section':   'nav-charts',
        'log-section':      'nav-log',
        'help-section':     'nav-help',
    };
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setActiveNav(navMap[entry.target.id]);
            }
        });
    }, { threshold: 0.4 });

    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
    });
}

// ===================== SIMULATION =====================
async function runDefaultSimulation() {
    log('Starting default simulation…', 'info');
    await executeSimulation({});
}

async function runSimulationFromUI() {
    const caseName = document.getElementById('case-selector')?.value;
    const body = {};

    if (caseName) {
        body.case_name = caseName;
        log(`Loading preset: ${caseName}`, 'info');
    } else {
        body.scenario_params = {
            load1:       parseFloat(document.getElementById('load1')?.value || 100),
            load2:       parseFloat(document.getElementById('load2')?.value || 150),
            load3:       parseFloat(document.getElementById('load3')?.value || 200),
            solar_scale: parseFloat(document.getElementById('solar-scale')?.value || 0.8),
            battery_wh:  parseFloat(document.getElementById('battery-wh')?.value || 300),
            soc_init:    0.5,
        };
        log(`Synthetic scenario → Load [${body.scenario_params.load1}, ${body.scenario_params.load2}, ${body.scenario_params.load3}]`, 'info');
    }

    await executeSimulation(body);
}

async function executeSimulation(body) {
    const btn = document.getElementById('run-simulation-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Simulating…';
    }

    try {
        const res = await fetch(`${API_URL}/simulate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const result = await res.json();

        if (result.success) {
            simulationData = result.data;
            currentTimeIndex = 0;
            updateAllUI();
            toast('Simulation completed successfully!', 'success');
            log('Simulation completed ✓', 'success');
        } else {
            toast(result.message || 'Simulation failed', 'error');
            log(`Error: ${result.message}`, 'error');
        }
    } catch (err) {
        console.error('Simulation error:', err);
        toast('Cannot reach backend server', 'error');
        log(`Connection error: ${err.message}`, 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-play"></i> Run Simulation';
        }
    }
}

// ===================== UPDATE UI =====================
function updateAllUI() {
    if (!simulationData) return;

    const { time, baseline, rule_based, fuzzy, cost_comparison } = simulationData;

    // Down-sample for charts (15001 points is too many)
    const step   = Math.max(1, Math.floor(time.length / 500));
    const sTime  = downsample(time, step).map(t => t.toFixed(1));
    const sSolar = downsample(baseline.solar, step);
    const sLoad  = downsample(baseline.load, step);
    const sBGrid = downsample(baseline.grid, step);
    const sRGrid = downsample(rule_based.grid, step);
    const sFGrid = downsample(fuzzy.grid, step);
    const sRSoc  = downsample(rule_based.soc, step).map(s => s * 100);
    const sFSoc  = downsample(fuzzy.soc, step).map(s => s * 100);

    // Energy Chart
    if (energyChart) {
        energyChart.data.labels = sTime;
        energyChart.data.datasets[0].data = sSolar;
        energyChart.data.datasets[1].data = sLoad;
        energyChart.data.datasets[2].data = sBGrid;
        energyChart.update('none');
    }

    // Comparison Chart
    if (comparisonChart) {
        comparisonChart.data.labels = sTime;
        comparisonChart.data.datasets[0].data = sRGrid;
        comparisonChart.data.datasets[1].data = sFGrid;
        comparisonChart.update('none');
    }

    // SOC Chart
    if (socChart) {
        socChart.data.labels = sTime;
        socChart.data.datasets[0].data = sRSoc;
        socChart.data.datasets[1].data = sFSoc;
        socChart.update('none');
    }

    updateKPIs();
    updateCostPanel(cost_comparison);
}

function downsample(arr, step) {
    const out = [];
    for (let i = 0; i < arr.length; i += step) out.push(arr[i]);
    return out;
}

function updateKPIs() {
    if (!simulationData) return;
    const { baseline, rule_based, fuzzy } = simulationData;

    const avgSolar = avg(baseline.solar);
    const avgLoad  = avg(baseline.load);
    const avgRGrid = avg(rule_based.grid);
    const avgFGrid = avg(fuzzy.grid);
    const avgBGrid = avg(baseline.grid);

    const peakRSoc = Math.max(...rule_based.soc) * 100;
    const peakFSoc = Math.max(...fuzzy.soc) * 100;

    // Solar
    setText('solar-out', `${avgSolar.toFixed(1)} <span class="metric-unit">kW</span>`);

    // Battery
    setText('battery-soc', `${peakFSoc.toFixed(1)} <span class="metric-unit">%</span>`);
    const isBatteryCharging = avgSolar > avgLoad && peakFSoc < 95;
    const batteryModeEl = document.getElementById('battery-mode');
    if (batteryModeEl) {
        batteryModeEl.textContent = isBatteryCharging ? 'Charging' : 'Discharging';
    }
    const batteryTrendEl = document.getElementById('battery-trend');
    if (batteryTrendEl) {
        batteryTrendEl.className = `metric-trend ${isBatteryCharging ? 'up' : 'down'}`;
        batteryTrendEl.innerHTML = isBatteryCharging
            ? '<i class="fa-solid fa-arrow-up"></i>'
            : '<i class="fa-solid fa-arrow-down"></i>';
    }

    // Grid
    const gridFlowDirection = avgBGrid < -0.5 ? 'Exporting' : (avgBGrid > 0.5 ? 'Importing' : 'Balanced');
    setText('grid-power', `${Math.abs(avgBGrid).toFixed(2)} <span class="metric-unit">kW</span>`);
    const gridModeEl = document.getElementById('grid-mode');
    if (gridModeEl) gridModeEl.textContent = gridFlowDirection;

    // Load
    setText('load-demand', `${avgLoad.toFixed(2)} <span class="metric-unit">kW</span>`);

    // EMS Metrics
    const ruleImp  = avgBGrid > 0.01 ? ((avgBGrid - avgRGrid) / avgBGrid * 100) : 0;
    const fuzzyImp = avgBGrid > 0.01 ? ((avgBGrid - avgFGrid) / avgBGrid * 100) : 0;

    setText('rule-grid-power',  avgRGrid.toFixed(2));
    setText('fuzzy-grid-power', avgFGrid.toFixed(2));
    setText('rule-soc',         peakRSoc.toFixed(1));
    setText('fuzzy-soc',        peakFSoc.toFixed(1));
    setText('rule-improvement',  ruleImp.toFixed(1));
    setText('fuzzy-improvement', fuzzyImp.toFixed(1));

    const surplus = avgSolar - avgLoad;
    if (surplus > 1) {
        log(`Surplus: ${surplus.toFixed(1)} kW → Battery charging & grid export`, 'success');
    } else if (surplus < -1) {
        log(`Deficit: ${Math.abs(surplus).toFixed(1)} kW → Battery discharging & grid import`, 'warning');
    } else {
        log('Balanced system: generation ≈ demand', 'info');
    }
    log(`EMS: Rule-Based saves ${ruleImp.toFixed(1)}% | Fuzzy saves ${fuzzyImp.toFixed(1)}%`, 'info');
}

function updateCostPanel(costData) {
    if (!costData || costData.length === 0) return;

    const baseline = costData.find(c => c.Mode === 'baseline');
    const fuzzy    = costData.find(c => c.Mode === 'fuzzy');

    if (baseline) {
        setText('current-cost', `₹${baseline.cost_rs.toFixed(2)} / cycle`);
    }
    if (fuzzy && baseline) {
        const saving = baseline.cost_rs - fuzzy.cost_rs;
        setText('savings', `+₹${saving.toFixed(2)} saved`);
        const pct = baseline.cost_rs > 0 ? (saving / baseline.cost_rs * 100) : 0;
        const fillEl = document.getElementById('eff-fill');
        const pctEl  = document.getElementById('eff-pct');
        if (fillEl) fillEl.style.width = Math.max(0, Math.min(100, pct)) + '%';
        if (pctEl)  pctEl.textContent  = pct.toFixed(0) + '%';
    }
}

// ===================== ANIMATION =====================
function startAnimation() {
    if (!simulationData || isAnimating) return;
    isAnimating = true;
    log('Animation started ▶', 'info');
    animateStep();
}

function animateStep() {
    if (!isAnimating || !simulationData) return;
    const len = simulationData.time.length;
    if (currentTimeIndex < len - 1) {
        currentTimeIndex += Math.max(1, Math.floor(len / 200));
        if (currentTimeIndex >= len) currentTimeIndex = len - 1;
        animateKPIsAtFrame();
        animationInterval = setTimeout(animateStep, animationSpeed);
    } else {
        isAnimating = false;
        log('Animation complete ■', 'info');
    }
}

function animateKPIsAtFrame() {
    if (!simulationData) return;
    const i = currentTimeIndex;
    const { baseline, fuzzy } = simulationData;

    setText('solar-out',   `${baseline.solar[i].toFixed(1)} <span class="metric-unit">kW</span>`);
    setText('battery-soc', `${(fuzzy.soc[i] * 100).toFixed(1)} <span class="metric-unit">%</span>`);
    setText('load-demand', `${baseline.load[i].toFixed(2)} <span class="metric-unit">kW</span>`);
    setText('grid-power',  `${Math.abs(baseline.grid[i]).toFixed(2)} <span class="metric-unit">kW</span>`);
}

function pauseAnimation() {
    isAnimating = false;
    clearTimeout(animationInterval);
    log('Animation paused ⏸', 'info');
}

function resetAnimation() {
    pauseAnimation();
    currentTimeIndex = 0;
    if (simulationData) updateAllUI();
    log('Animation reset ↺', 'info');
}

// ===================== CHARTS INIT =====================
function initCharts() {
    Chart.defaults.color = '#64748b';
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.font.size = 11;

    const gridColor = 'rgba(226, 232, 240, 0.8)';

    // — Energy Chart —
    const eCtx = document.getElementById('energyChart');
    if (eCtx) {
        const ctx = eCtx.getContext('2d');
        const solarGrad = ctx.createLinearGradient(0, 0, 0, 260);
        solarGrad.addColorStop(0, 'rgba(249, 115, 22, 0.18)');
        solarGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');

        const loadGrad = ctx.createLinearGradient(0, 0, 0, 260);
        loadGrad.addColorStop(0, 'rgba(220, 38, 38, 0.12)');
        loadGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');

        energyChart = new Chart(eCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    { label: 'Solar (kW)', data: [], borderColor: '#f97316', backgroundColor: solarGrad,     borderWidth: 2, tension: 0.35, fill: true,  pointRadius: 0 },
                    { label: 'Load (kW)',  data: [], borderColor: '#dc2626', backgroundColor: loadGrad,      borderWidth: 2, tension: 0.35, fill: true,  pointRadius: 0 },
                    { label: 'Grid (kW)',  data: [], borderColor: '#3b5bdb', backgroundColor: 'transparent', borderWidth: 1.5, tension: 0.35, fill: false, pointRadius: 0, borderDash: [5, 3] },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                },
                scales: {
                    y: {
                        grid: { color: gridColor, drawBorder: false },
                        beginAtZero: true,
                        ticks: { padding: 6 },
                        border: { display: false },
                    },
                    x: {
                        grid: { display: false },
                        ticks: { maxTicksLimit: 10, maxRotation: 0 },
                        border: { display: false },
                    },
                },
                interaction: { mode: 'index', intersect: false },
            },
        });
    }

    // — Comparison Chart —
    const cCtx = document.getElementById('comparisonChart');
    if (cCtx) {
        const ctx2 = cCtx.getContext('2d');
        const rGrad = ctx2.createLinearGradient(0, 0, 0, 220);
        rGrad.addColorStop(0, 'rgba(59, 91, 219, 0.15)');
        rGrad.addColorStop(1, 'rgba(59, 91, 219, 0)');

        const fGrad = ctx2.createLinearGradient(0, 0, 0, 220);
        fGrad.addColorStop(0, 'rgba(22, 163, 74, 0.15)');
        fGrad.addColorStop(1, 'rgba(22, 163, 74, 0)');

        comparisonChart = new Chart(cCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    { label: 'Rule-Based Grid (kW)', data: [], borderColor: '#3b5bdb', backgroundColor: rGrad, borderWidth: 2, tension: 0.35, fill: true, pointRadius: 0 },
                    { label: 'Fuzzy Grid (kW)',      data: [], borderColor: '#16a34a', backgroundColor: fGrad, borderWidth: 2, tension: 0.35, fill: true, pointRadius: 0 },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { boxWidth: 8, usePointStyle: true, padding: 14 } },
                },
                scales: {
                    y: { grid: { color: gridColor, drawBorder: false }, ticks: { padding: 6 }, border: { display: false } },
                    x: { grid: { display: false }, ticks: { maxTicksLimit: 8, maxRotation: 0 }, border: { display: false } },
                },
                interaction: { mode: 'index', intersect: false },
            },
        });
    }

    // — SOC Chart —
    const sCtx = document.getElementById('socChart');
    if (sCtx) {
        const ctx3 = sCtx.getContext('2d');
        const rsocGrad = ctx3.createLinearGradient(0, 0, 0, 220);
        rsocGrad.addColorStop(0, 'rgba(124, 58, 237, 0.15)');
        rsocGrad.addColorStop(1, 'rgba(124, 58, 237, 0)');

        const fsocGrad = ctx3.createLinearGradient(0, 0, 0, 220);
        fsocGrad.addColorStop(0, 'rgba(217, 119, 6, 0.15)');
        fsocGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');

        socChart = new Chart(sCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    { label: 'Rule SOC (%)',  data: [], borderColor: '#7c3aed', backgroundColor: rsocGrad, borderWidth: 2, tension: 0.35, fill: true, pointRadius: 0 },
                    { label: 'Fuzzy SOC (%)', data: [], borderColor: '#d97706', backgroundColor: fsocGrad, borderWidth: 2, tension: 0.35, fill: true, pointRadius: 0 },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { boxWidth: 8, usePointStyle: true, padding: 14 } },
                },
                scales: {
                    y: { min: 0, max: 100, grid: { color: gridColor, drawBorder: false }, ticks: { padding: 6 }, border: { display: false } },
                    x: { grid: { display: false }, ticks: { maxTicksLimit: 8, maxRotation: 0 }, border: { display: false } },
                },
                interaction: { mode: 'index', intersect: false },
            },
        });
    }
}

// ===================== TOAST =====================
function toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
        success: 'fa-circle-check',
        error:   'fa-circle-xmark',
        info:    'fa-circle-info',
        warning: 'fa-triangle-exclamation'
    };

    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${message}`;
    container.appendChild(el);

    el.addEventListener('click', () => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 200);
    });
    setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 200);
    }, 4000);
}

// ===================== LOG =====================
function log(message, level = 'info') {
    const list = document.getElementById('log-list');
    if (!list) return;

    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
    const li = document.createElement('li');
    li.className = `log-entry log-${level}`;
    li.innerHTML = `<span class="log-ts">${ts}</span><span class="log-msg">${message}</span>`;
    list.insertBefore(li, list.firstChild);

    // Keep max 20 entries
    while (list.children.length > 20) list.removeChild(list.lastChild);
}

// ===================== HELPERS =====================
function avg(arr) {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function setText(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
}
