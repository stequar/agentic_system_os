/**
 * Renderizza l'interfaccia web responsive in vanilla HTML/CSS/JS
 * per il Local Web Studio Dashboard, Visual Kanban Board,
 * Live FinOps Cockpit, Context Health Meter, Breadcrumb Trajectory,
 * Agile Ceremony Board, Live War Room Cockpit e Fluff Telemetry Gauge (zero dipendenze esterne).
 */
import { STUDIO_CSS } from "./ui-styles.js";
import { renderStudioClientScript } from "./ui-client-script.js";
export function renderStudioHtml(token) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agentic Company OS — Studio Pro, Agile & FinOps</title>
  <style>
${STUDIO_CSS}
  </style>
</head>
<body>
  <header>
    <h1>🏢 Agentic Company OS — Studio Pro, Agile & FinOps</h1>
    <div id="conn-status" class="status-badge">Connecting SSE...</div>
  </header>

  <!-- Live Incident War Room Emergency Cockpit Banner (Sprint 16) -->
  <div id="warroom-banner" class="warroom-banner">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h3 style="color: var(--red); font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
        🚨 INCIDENT WAR ROOM ACTIVE — WRITE LOCK ENGAGED
      </h3>
      <button class="btn-resolve" onclick="resolveWarRoomPrompt()">🛡️ Resolve Incident & Unlock</button>
    </div>
    <div id="warroom-details" style="font-size: 12px; color: var(--text);"></div>
  </div>

  <!-- Process & Cooperation Metrics KPI Row -->
  <div class="metrics-row">
    <div class="metric-card">
      <div class="metric-title">First-Pass Yield (FPY)</div>
      <div id="kpi-fpy" class="metric-value success">--%</div>
      <div class="metric-sub">Closed without corrective cycles</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Mean Self-Healing Cycles</div>
      <div id="kpi-healing" class="metric-value">--</div>
      <div class="metric-sub">AST Closed-loop convergence</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Contract Compliance</div>
      <div id="kpi-compliance" class="metric-value success">--%</div>
      <div class="metric-sub">Zod runtime strict guard</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Merkle Audit Integrity</div>
      <div id="kpi-audit" class="metric-value success">INTEGRA ✅</div>
      <div class="metric-sub">HMAC-SHA256 verified trail</div>
    </div>
  </div>

  <!-- FinOps & Context Health Cockpit Row (Sprint 11 & Sprint 16 Fluff Telemetry) -->
  <div class="metrics-row-5">
    <div class="metric-card">
      <div class="metric-title">Live Token FinOps Spend</div>
      <div id="kpi-finops-spend" class="metric-value">$0.0000</div>
      <div id="kpi-finops-tokens" class="metric-sub">0 total tokens</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Net Prompt Caching Savings</div>
      <div id="kpi-finops-savings" class="metric-value savings">+$0.0000</div>
      <div id="kpi-finops-ratio" class="metric-sub">0.0% saved vs uncached</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Prompt Cache Read Ratio</div>
      <div id="kpi-cache-read-rate" class="metric-value">--%</div>
      <div id="kpi-cache-reads" class="metric-sub">0 cache-read tokens</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Context Health Score</div>
      <div id="kpi-health-score" class="metric-value success">100%</div>
      <div class="health-bar-container">
        <div id="health-bar" class="health-bar-fill" style="width: 100%;"></div>
      </div>
      <div id="kpi-health-msg" class="metric-sub" style="margin-top: 4px;">EXCELLENT • RAM fresca</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">Caveman Fluff Reduction</div>
      <div id="kpi-fluff-ratio" class="metric-value savings">0.0%</div>
      <div id="kpi-fluff-tokens" class="metric-sub">0 tokens cut ($0.00 saved)</div>
    </div>
  </div>

  <!-- Interactive Sprint Kanban Board -->
  <div class="kanban-section">
    <div class="kanban-header">
      <h2>📋 Sprint Kanban Board (Drag-and-Drop & Atomic Sync)</h2>
      <div id="board-sync-status" class="status-badge">Synced with backlog.md</div>
    </div>
    <div class="kanban-board">
      <div class="kanban-column" data-column="BACKLOG" ondragover="allowDrop(event)" ondragleave="clearDrag(event)" ondrop="handleDrop(event, 'BACKLOG')">
        <div class="column-title"><span>📦 Backlog</span><span id="count-BACKLOG" class="column-count">0</span></div>
        <div id="col-BACKLOG" class="tickets-container"></div>
      </div>
      <div class="kanban-column" data-column="TODO" ondragover="allowDrop(event)" ondragleave="clearDrag(event)" ondrop="handleDrop(event, 'TODO')">
        <div class="column-title"><span>📋 To Do</span><span id="count-TODO" class="column-count">0</span></div>
        <div id="col-TODO" class="tickets-container"></div>
      </div>
      <div class="kanban-column" data-column="IN_PROGRESS" ondragover="allowDrop(event)" ondragleave="clearDrag(event)" ondrop="handleDrop(event, 'IN_PROGRESS')">
        <div class="column-title"><span>⏳ In Progress</span><span id="count-IN_PROGRESS" class="column-count">0</span></div>
        <div id="col-IN_PROGRESS" class="tickets-container"></div>
      </div>
      <div class="kanban-column" data-column="REVIEW" ondragover="allowDrop(event)" ondragleave="clearDrag(event)" ondrop="handleDrop(event, 'REVIEW')">
        <div class="column-title"><span>🔍 Review</span><span id="count-REVIEW" class="column-count">0</span></div>
        <div id="col-REVIEW" class="tickets-container"></div>
      </div>
      <div class="kanban-column" data-column="DONE" ondragover="allowDrop(event)" ondragleave="clearDrag(event)" ondrop="handleDrop(event, 'DONE')">
        <div class="column-title"><span>✅ Done</span><span id="count-DONE" class="column-count">0</span></div>
        <div id="col-DONE" class="tickets-container"></div>
      </div>
    </div>
  </div>

  <!-- Agile Ceremony Board & Meeting Timeline (Sprint 16) -->
  <div class="ceremonies-section">
    <div class="ceremonies-header">
      <h2>🤝 Agile Ceremony Board & Meeting Timeline (RFC-005)</h2>
      <div id="ceremonies-count" class="status-badge">0 ceremonies</div>
    </div>
    <div id="ceremonies-feed" class="ceremonies-feed">
      <div style="color: var(--muted); font-size: 12px; padding: 12px;">Waiting for agile-ceremony minutes...</div>
    </div>
  </div>

  <!-- Interactive Breadcrumb Trajectory Section -->
  <div class="trajectory-section">
    <div class="trajectory-header">
      <h2>🧭 Cognitive Breadcrumb Trajectory (Audit Decision Nodes)</h2>
      <div class="filter-chips">
        <span class="chip active" onclick="filterTrajectory('ALL')">ALL</span>
        <span class="chip" onclick="filterTrajectory('FSM_TRANSITION')">FSM</span>
        <span class="chip" onclick="filterTrajectory('QUALITY_GATE')">GATEKEEPER</span>
        <span class="chip" onclick="filterTrajectory('SELF_HEALING')">HEALING</span>
        <span class="chip" onclick="filterTrajectory('FINOPS_ALERT')">FINOPS/HEALTH</span>
      </div>
    </div>
    <div id="trajectory-timeline" class="trajectory-timeline">
      <div style="color: var(--muted); font-size: 12px; padding: 12px;">In attesa di nodi decisionali...</div>
    </div>
  </div>

  <!-- Telemetry & Steering Grid -->
  <div class="grid">
    <div class="panel">
      <h2>Live Telemetry & Event Stream (SSE)</h2>
      <div id="events-feed"></div>
    </div>

    <div class="panel">
      <h2>Safe-Point Steering</h2>
      <div class="controls">
        <button class="btn-pause" onclick="sendSteer('pause')">⏸️ Safe Pause</button>
        <button class="btn-resume" onclick="sendSteer('resume')">▶️ Resume</button>
        <div>
          <textarea id="hint-msg" placeholder="Send operational hint (preserve tests)..."></textarea>
          <button class="btn-hint" onclick="sendHint()">💡 Send Human Hint</button>
        </div>
        <button class="btn-abort" onclick="sendSteer('abort')">🛑 Abort</button>
      </div>
    </div>
  </div>

  <!-- Trajectory Inspection Drawer -->
  <div id="inspector-drawer">
    <div class="drawer-header">
      <h3 id="drawer-title" style="font-size: 14px; color: var(--accent);">Node Details</h3>
      <button class="drawer-close" onclick="closeDrawer()">✕</button>
    </div>
    <div style="font-size: 11px; color: var(--muted); display: flex; flex-direction: column; gap: 4px;">
      <div><strong>Seq:</strong> <span id="drawer-seq">-</span> | <strong>Category:</strong> <span id="drawer-cat">-</span></div>
      <div><strong>Agent:</strong> <span id="drawer-agent">-</span></div>
      <div><strong>Merkle Hash:</strong> <span id="drawer-hash" style="font-family: monospace; font-size: 9px;">-</span></div>
    </div>
    <div style="font-size: 11px; text-transform: uppercase; color: var(--muted); font-weight: 700; margin-top: 6px;">Payload</div>
    <pre id="drawer-payload" class="drawer-content"></pre>
  </div>

  <script>
${renderStudioClientScript(token)}
  </script>
</body>
</html>`;
}
//# sourceMappingURL=ui.js.map