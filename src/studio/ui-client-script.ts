/**
 * Studio dashboard client-side script (extracted from ui.ts to decompose the
 * god-object). The only interpolation is the ephemeral auth ${token}.
 */
export function renderStudioClientScript(token: string): string {
  return `
    const token = new URLSearchParams(window.location.search).get('token') || "${token}";
    const feed = document.getElementById('events-feed');
    const connStatus = document.getElementById('conn-status');
    const syncStatus = document.getElementById('board-sync-status');
    let currentTrajectoryFilter = 'ALL';
    let currentActiveIncidentId = null;

    // 1. SSE Stream
    const evtSource = new EventSource('/api/events?token=' + encodeURIComponent(token));

    evtSource.onopen = () => {
      connStatus.textContent = 'CONNECTED (127.0.0.1)';
      connStatus.className = 'status-badge status-connected';
    };

    evtSource.onerror = () => {
      connStatus.textContent = 'DISCONNECTED';
      connStatus.className = 'status-badge';
    };

    evtSource.onmessage = (e) => {
      try {
        const ev = JSON.parse(e.data);
        const div = document.createElement('div');
        div.className = 'event-card ' + (ev.level || 'info');
        // XSS hardening (P3R-1): event fields come from the in-process bus and are
        // agent/repo-controlled — escape every interpolated value before innerHTML.
        div.innerHTML = '<div class="event-time">' + escapeHtml(new Date(ev.timestamp).toLocaleTimeString()) + ' [' + escapeHtml(ev.sourceAgent) + ']</div><div><strong>' + escapeHtml(ev.type) + '</strong> ' + escapeHtml(JSON.stringify(ev.payload || {})) + '</div>';
        feed.prepend(div);

        // Reattività in tempo reale
        if (ev.type === 'TICKET_STATUS_CHANGED') {
          loadKanban();
          loadTrajectory();
        } else if (['GATEKEEPER_PASSED', 'GATEKEEPER_FAILED', 'SELF_HEALING_ITERATION', 'CONTRACT_VIOLATION', 'METRICS_CALCULATED'].includes(ev.type)) {
          loadMetrics();
          loadTrajectory();
        } else if (['BUDGET_WARNING', 'BUDGET_EXCEEDED', 'FINOPS_ALERT'].includes(ev.type)) {
          loadFinOps();
        } else if (ev.type === 'CONTEXT_HEALTH_ALERT') {
          loadContextHealth();
        } else if (['CEREMONY_STARTED', 'CEREMONY_CONCLUDED', 'CONSENSUS_REACHED', 'TIE_BREAK_INVOKED'].includes(ev.type)) {
          loadAgileCeremonies();
          loadFluffTelemetry();
        } else if (['WAR_ROOM_TRIGGERED', 'WAR_ROOM_RESOLVED'].includes(ev.type)) {
          loadWarRoomStatus();
          loadAgileCeremonies();
        }
      } catch (err) {}
    };

    // 2. Drag-and-Drop Kanban Board
    function allowDrop(ev) {
      ev.preventDefault();
      ev.currentTarget.classList.add('drag-over');
    }

    function clearDrag(ev) {
      ev.currentTarget.classList.remove('drag-over');
    }

    function handleDragStart(ev) {
      ev.dataTransfer.setData('text/plain', ev.currentTarget.dataset.ticketId);
    }

    async function handleDrop(ev, targetColumn) {
      ev.preventDefault();
      ev.currentTarget.classList.remove('drag-over');
      const ticketId = ev.dataTransfer.getData('text/plain');
      if (!ticketId) return;

      syncStatus.textContent = 'Moving ' + ticketId + '...';
      syncStatus.className = 'status-badge';

      try {
        const res = await fetch('/api/kanban/move?token=' + encodeURIComponent(token), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticketId, targetColumn })
        });
        const data = await res.json();
        if (data.success) {
          syncStatus.textContent = 'Synced with backlog.md';
          syncStatus.className = 'status-badge status-connected';
          loadKanban();
        } else {
          syncStatus.textContent = 'Move failed: ' + (data.message || 'error');
        }
      } catch (err) {
        syncStatus.textContent = 'Network error';
      }
    }

    // 3. Caricamento e rendering della Kanban Board
    async function loadKanban() {
      try {
        const res = await fetch('/api/kanban?token=' + encodeURIComponent(token));
        const board = await res.json();
        renderKanban(board.tickets || []);
      } catch (err) {
        console.error('Error loading kanban:', err);
      }
    }

    function renderKanban(tickets) {
      const columns = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
      const counts = { BACKLOG: 0, TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 };

      columns.forEach(col => {
        const container = document.getElementById('col-' + col);
        container.innerHTML = '';
      });

      tickets.forEach(ticket => {
        if (!counts.hasOwnProperty(ticket.status)) return;
        counts[ticket.status]++;

        const card = document.createElement('div');
        card.className = 'ticket-card';
        card.draggable = true;
        card.dataset.ticketId = ticket.id;
        card.ondragstart = handleDragStart;

        card.innerHTML = 
          '<div class="ticket-id">' + escapeHtml(ticket.id) + '</div>' +
          '<div class="ticket-title">' + escapeHtml(ticket.title) + '</div>' +
          '<div class="ticket-meta">' +
            (ticket.assignedTo ? '<span class="badge badge-assignee">' + escapeHtml(ticket.assignedTo) + '</span>' : '') +
            (ticket.epic ? '<span class="badge badge-epic">' + escapeHtml(ticket.epic) + '</span>' : '') +
          '</div>';

        document.getElementById('col-' + ticket.status).appendChild(card);
      });

      columns.forEach(col => {
        document.getElementById('count-' + col).textContent = counts[col];
      });
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // 4. Caricamento Metriche di Cooperazione
    async function loadMetrics() {
      try {
        const res = await fetch('/api/metrics?token=' + encodeURIComponent(token));
        const metrics = await res.json();

        document.getElementById('kpi-fpy').textContent = metrics.firstPassYieldPercentage + '%';
        document.getElementById('kpi-healing').textContent = metrics.meanSelfHealingCycles;
        document.getElementById('kpi-compliance').textContent = metrics.contractCompliancePercentage + '%';
        document.getElementById('kpi-audit').textContent = metrics.auditTrailIntegrity ? 'INTEGRA ✅' : 'CORROTTA ❌';
      } catch (err) {}
    }

    // 5. Caricamento FinOps
    async function loadFinOps() {
      try {
        const res = await fetch('/api/finops?token=' + encodeURIComponent(token));
        const finops = await res.json();

        document.getElementById('kpi-finops-spend').textContent = '$' + finops.totalCostUsd.toFixed(4);
        document.getElementById('kpi-finops-tokens').textContent = finops.totalTokens.toLocaleString() + ' total tokens';
        document.getElementById('kpi-finops-savings').textContent = '+$' + finops.promptCacheSavingsUsd.toFixed(4);
        document.getElementById('kpi-finops-ratio').textContent = finops.cacheSavingsRatioPercentage.toFixed(1) + '% saved vs uncached';
        document.getElementById('kpi-cache-read-rate').textContent = finops.promptCacheHitRatePercentage.toFixed(1) + '%';
        document.getElementById('kpi-cache-reads').textContent = finops.cacheReadTokens.toLocaleString() + ' cache-read tokens';
      } catch (err) {}
    }

    // 6. Caricamento Context Health Meter
    async function loadContextHealth() {
      try {
        const res = await fetch('/api/context-health?token=' + encodeURIComponent(token));
        const health = await res.json();

        const scoreEl = document.getElementById('kpi-health-score');
        if (scoreEl) {
          scoreEl.textContent = health.healthScore + '%';

          const bar = document.getElementById('health-bar');
          bar.style.width = Math.min(100, Math.max(0, health.healthScore)) + '%';
          bar.className = 'health-bar-fill ' + (health.healthScore >= 90 ? '' : health.healthScore >= 70 ? 'nominal' : health.healthScore >= 40 ? 'risk' : 'critical');

          const msgEl = document.getElementById('kpi-health-msg');
          msgEl.textContent = health.status + ' • ' + health.recommendedAction;
        }
      } catch (err) {}
    }

    // 7. Caricamento Fluff Telemetry (Sprint 16)
    async function loadFluffTelemetry() {
      try {
        const res = await fetch('/api/fluff-telemetry?token=' + encodeURIComponent(token));
        const report = await res.json();

        document.getElementById('kpi-fluff-ratio').textContent = report.fluffReductionPercentage.toFixed(1) + '%';
        document.getElementById('kpi-fluff-tokens').textContent = 
          report.fluffTokensEliminated.toLocaleString() + ' tokens cut ($' + report.estimatedDollarsSavedUsd.toFixed(4) + ' saved)';
      } catch (err) {}
    }

    // 8. Caricamento Agile Ceremony Board (Sprint 16)
    async function loadAgileCeremonies() {
      try {
        const res = await fetch('/api/ceremonies?token=' + encodeURIComponent(token));
        const data = await res.json();
        renderCeremonies(data.ceremonies || [], data.retrospectives || []);
      } catch (err) {
        console.error('Error loading ceremonies:', err);
      }
    }

    function renderCeremonies(ceremonies, retrospectives) {
      const feedEl = document.getElementById('ceremonies-feed');
      const countEl = document.getElementById('ceremonies-count');
      countEl.textContent = ceremonies.length + ' ceremonies';
      feedEl.innerHTML = '';

      if (!ceremonies || ceremonies.length === 0) {
        feedEl.innerHTML = '<div style="color: var(--muted); font-size: 12px; padding: 12px;">Nessuna cerimonia registrata in .company-os/ceremonies/</div>';
        return;
      }

      ceremonies.forEach(c => {
        const card = document.createElement('div');
        card.className = 'ceremony-card ' + c.type;

        const timeStr = new Date(c.startedAt).toLocaleTimeString();
        let retroBadge = '';

        if (c.type === 'SPRINT_RETROSPECTIVE') {
          const matchingRetro = retrospectives.find(r => r.sprintId && c.summary.includes(r.sprintId));
          if (matchingRetro) {
            retroBadge = '<div style="margin-top: 4px; font-size: 11px; color: var(--emerald); font-weight: 600;">' +
                         '🎯 FPY: ' + matchingRetro.fpyPercentage + '% • ' + matchingRetro.actionItems.length + ' action items' +
                         '</div>';
          }
        }

        card.innerHTML = 
          '<div class="ceremony-top">' +
            '<span class="ceremony-badge badge-' + escapeHtml(c.type) + '">' + escapeHtml(c.type.replace(/_/g, ' ')) + '</span>' +
            '<span class="badge">' + escapeHtml(c.status) + ' • ' + timeStr + '</span>' +
          '</div>' +
          '<div class="ceremony-summary">' + escapeHtml(c.summary) + '</div>' +
          retroBadge +
          '<div class="ceremony-meta">' +
            '<span>👑 Chair: <strong>' + escapeHtml(c.chairRole) + '</strong></span>' +
            '<span>👥 ' + (c.attendeeRoles ? c.attendeeRoles.map(escapeHtml).join(', ') : '') + '</span>' +
          '</div>';

        feedEl.appendChild(card);
      });
    }

    // 9. Caricamento e gestione Live War Room Cockpit (Sprint 16)
    async function loadWarRoomStatus() {
      try {
        const res = await fetch('/api/war-room?token=' + encodeURIComponent(token));
        const warRoom = await res.json();
        const banner = document.getElementById('warroom-banner');
        const details = document.getElementById('warroom-details');

        if (warRoom.isWriteLocked && warRoom.activeIncidents && warRoom.activeIncidents.length > 0) {
          const inc = warRoom.activeIncidents[0];
          currentActiveIncidentId = inc.incidentId;
          banner.style.display = 'flex';
          details.innerHTML = 
            '<div><strong>Incident:</strong> ' + escapeHtml(inc.incidentId) + ' | <strong>Trigger:</strong> ' + escapeHtml(inc.trigger) + ' | <strong>Ticket:</strong> ' + escapeHtml(inc.targetTicketId) + '</div>' +
            '<div><strong>Causa:</strong> ' + escapeHtml(inc.rootCause) + '</div>' +
            '<div><strong>Rollback Snapshot SHA:</strong> <code style="font-family: monospace; font-size: 11px;">' + inc.rollbackSnapshotSha256.slice(0, 16) + '...</code></div>' +
            '<div><strong>Contenimento:</strong> ' + escapeHtml(inc.containmentAction) + '</div>';
        } else {
          banner.style.display = 'none';
          currentActiveIncidentId = null;
        }
      } catch (err) {}
    }

    async function resolveWarRoomPrompt() {
      if (!currentActiveIncidentId) return;
      const notes = prompt('Inserisci note di risoluzione per revocare il blocco di scrittura:');
      if (!notes || notes.trim().length < 5) {
        alert('Note di risoluzione obbligatorie (almeno 5 caratteri).');
        return;
      }

      try {
        const res = await fetch('/api/war-room/resolve?token=' + encodeURIComponent(token), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            incidentId: currentActiveIncidentId,
            resolutionNotes: notes.trim()
          })
        });
        const data = await res.json();
        if (data.success) {
          alert('Incident resolved successfully! Write lock released.');
          loadWarRoomStatus();
        } else {
          alert('Resolution error: ' + (data.error || 'sconosciuto'));
        }
      } catch (err) {
        alert('Network error during resolution.');
      }
    }

    // 10. Caricamento e rendering Breadcrumb Trajectory
    async function loadTrajectory() {
      try {
        let url = '/api/trajectory?limit=30&token=' + encodeURIComponent(token);
        if (currentTrajectoryFilter !== 'ALL') {
          url += '&category=' + encodeURIComponent(currentTrajectoryFilter);
        }
        const res = await fetch(url);
        const data = await res.json();
        renderTrajectory(data.nodes || []);
      } catch (err) {
        console.error('Error loading trajectory:', err);
      }
    }

    function renderTrajectory(nodes) {
      const timeline = document.getElementById('trajectory-timeline');
      timeline.innerHTML = '';

      if (!nodes || nodes.length === 0) {
        timeline.innerHTML = '<div style="color: var(--muted); font-size: 12px; padding: 12px;">No node found for the selected category.</div>';
        return;
      }

      nodes.forEach(node => {
        const div = document.createElement('div');
        div.className = 'trajectory-node';
        div.onclick = () => openDrawer(node);

        const timeStr = new Date(node.timestamp).toLocaleTimeString();
        div.innerHTML = '<div class="node-header">' +
                        '<span>#' + escapeHtml(node.sequenceNumber) + ' • ' + timeStr + '</span>' +
                        '<span class="node-badge badge-' + escapeHtml(node.category) + '">' + escapeHtml(node.category.replace('_', ' ')) + '</span>' +
                        '</div>' +
                        '<div class="node-summary">' + escapeHtml(node.summary) + '</div>' +
                        '<div style="font-size: 10px; color: var(--muted); margin-top: auto;">' + escapeHtml(node.sourceAgent) + '</div>';
        timeline.appendChild(div);
      });
    }

    function filterTrajectory(cat) {
      currentTrajectoryFilter = cat;
      document.querySelectorAll('.filter-chips .chip').forEach(el => {
        el.classList.toggle('active', el.textContent === cat);
      });
      loadTrajectory();
    }

    function openDrawer(node) {
      document.getElementById('drawer-title').textContent = node.summary;
      document.getElementById('drawer-seq').textContent = node.sequenceNumber;
      document.getElementById('drawer-cat').textContent = node.category;
      document.getElementById('drawer-agent').textContent = node.sourceAgent + ' (' + new Date(node.timestamp).toLocaleString() + ')';
      document.getElementById('drawer-hash').textContent = node.merkleHash || 'N/A';
      document.getElementById('drawer-payload').textContent = JSON.stringify(node.payload || {}, null, 2);
      document.getElementById('inspector-drawer').style.display = 'flex';
    }

    function closeDrawer() {
      document.getElementById('inspector-drawer').style.display = 'none';
    }

    // 11. Steering Commands
    async function sendSteer(action) {
      await fetch('/api/steer?token=' + encodeURIComponent(token), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
    }

    async function sendHint() {
      const msg = document.getElementById('hint-msg').value;
      if (!msg.trim()) return;
      await fetch('/api/steer?token=' + encodeURIComponent(token), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'hint', message: msg })
      });
      document.getElementById('hint-msg').value = '';
    }

    // Inizializzazione automatica
    loadKanban();
    loadMetrics();
    loadFinOps();
    loadContextHealth();
    loadFluffTelemetry();
    loadAgileCeremonies();
    loadWarRoomStatus();
    loadTrajectory();
`;
}
