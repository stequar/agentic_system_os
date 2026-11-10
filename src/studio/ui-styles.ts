/**
 * Studio dashboard CSS (extracted from ui.ts to decompose the god-object).
 * Static stylesheet, inlined into the single-page dashboard.
 */
export const STUDIO_CSS = `
    :root {
      --bg: #0f172a;
      --card: #1e293b;
      --card-hover: #273549;
      --border: #334155;
      --text: #f8fafc;
      --muted: #94a3b8;
      --accent: #38bdf8;
      --green: #22c55e;
      --yellow: #eab308;
      --red: #ef4444;
      --purple: #a855f7;
      --emerald: #10b981;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); padding: 24px; min-height: 100vh; display: flex; flex-direction: column; gap: 24px; }
    header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 16px; }
    h1 { font-size: 20px; font-weight: 700; color: var(--accent); display: flex; align-items: center; gap: 8px; }
    .status-badge { padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; background: var(--border); }
    .status-connected { background: rgba(34, 197, 94, 0.2); color: var(--green); border: 1px solid var(--green); }
    
    /* War Room Emergency Banner */
    .warroom-banner { background: rgba(239, 68, 68, 0.15); border: 2px solid var(--red); border-radius: 8px; padding: 14px 18px; display: none; flex-direction: column; gap: 8px; animation: pulse 2s infinite; }
    @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
    .btn-resolve { background: var(--red); color: #fff; padding: 6px 14px; border-radius: 6px; border: none; font-weight: 700; cursor: pointer; transition: 0.2s; font-size: 12px; }
    .btn-resolve:hover { opacity: 0.9; }

    /* Metrics Row */
    .metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .metrics-row-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
    .metric-card { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 14px 18px; display: flex; flex-direction: column; gap: 4px; position: relative; }
    .metric-title { font-size: 11px; text-transform: uppercase; color: var(--muted); letter-spacing: 0.5px; font-weight: 600; }
    .metric-value { font-size: 24px; font-weight: 700; color: var(--accent); }
    .metric-value.success { color: var(--green); }
    .metric-value.savings { color: var(--emerald); }
    .metric-value.warn { color: var(--yellow); }
    .metric-value.error { color: var(--red); }
    .metric-sub { font-size: 11px; color: var(--muted); }

    /* Health Gauge Bar */
    .health-bar-container { width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; margin-top: 4px; }
    .health-bar-fill { height: 100%; width: 100%; background: var(--green); transition: width 0.3s, background 0.3s; }
    .health-bar-fill.nominal { background: var(--accent); }
    .health-bar-fill.risk { background: var(--yellow); }
    .health-bar-fill.critical { background: var(--red); }

    /* Kanban Board */
    .kanban-section { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 18px; }
    .kanban-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .kanban-header h2 { font-size: 14px; text-transform: uppercase; color: var(--muted); letter-spacing: 0.5px; }
    .kanban-board { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; min-height: 340px; }
    .kanban-column { background: rgba(15, 23, 42, 0.6); border: 1px dashed var(--border); border-radius: 6px; padding: 12px; display: flex; flex-direction: column; gap: 10px; transition: border-color 0.2s, background 0.2s; }
    .kanban-column.drag-over { border-color: var(--accent); background: rgba(56, 189, 248, 0.08); }
    .column-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--muted); display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: 6px; margin-bottom: 4px; }
    .column-count { background: var(--border); padding: 1px 6px; border-radius: 999px; font-size: 11px; color: var(--text); }
    .tickets-container { display: flex; flex-direction: column; gap: 8px; flex: 1; overflow-y: auto; max-height: 420px; }
    .ticket-card { background: var(--card); border: 1px solid var(--border); border-radius: 6px; padding: 10px; cursor: grab; transition: transform 0.15s, box-shadow 0.15s; display: flex; flex-direction: column; gap: 6px; user-select: none; }
    .ticket-card:active { cursor: grabbing; transform: scale(0.98); }
    .ticket-card:hover { border-color: var(--accent); background: var(--card-hover); }
    .ticket-id { font-size: 11px; font-weight: 700; color: var(--accent); font-family: ui-monospace, monospace; }
    .ticket-title { font-size: 12px; font-weight: 500; line-height: 1.4; color: var(--text); }
    .ticket-meta { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 2px; }
    .badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; background: rgba(255, 255, 255, 0.08); color: var(--muted); }
    .badge-assignee { background: rgba(56, 189, 248, 0.15); color: var(--accent); }
    .badge-epic { background: rgba(168, 85, 247, 0.15); color: var(--purple); }

    /* Agile Ceremony Board Section (Sprint 16) */
    .ceremonies-section { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 18px; }
    .ceremonies-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .ceremonies-header h2 { font-size: 14px; text-transform: uppercase; color: var(--muted); letter-spacing: 0.5px; }
    .ceremonies-feed { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; max-height: 420px; overflow-y: auto; }
    .ceremony-card { background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border); border-radius: 6px; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; border-left: 3px solid var(--accent); }
    .ceremony-card.BRAINSTORMING_KICKOFF { border-left-color: var(--purple); }
    .ceremony-card.BACKLOG_REFINEMENT_1ON1 { border-left-color: var(--accent); }
    .ceremony-card.ARCHITECTURE_REVIEW_ROUNDTABLE { border-left-color: var(--yellow); }
    .ceremony-card.INCIDENT_WAR_ROOM { border-left-color: var(--red); }
    .ceremony-card.SPRINT_RETROSPECTIVE { border-left-color: var(--emerald); }
    .ceremony-top { display: flex; justify-content: space-between; align-items: center; font-size: 11px; }
    .ceremony-badge { font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
    .badge-BRAINSTORMING_KICKOFF { background: rgba(168, 85, 247, 0.2); color: var(--purple); }
    .badge-BACKLOG_REFINEMENT_1ON1 { background: rgba(56, 189, 248, 0.2); color: var(--accent); }
    .badge-ARCHITECTURE_REVIEW_ROUNDTABLE { background: rgba(234, 179, 8, 0.2); color: var(--yellow); }
    .badge-INCIDENT_WAR_ROOM { background: rgba(239, 68, 68, 0.2); color: var(--red); }
    .badge-SPRINT_RETROSPECTIVE { background: rgba(16, 185, 129, 0.2); color: var(--emerald); }
    .ceremony-summary { font-size: 12px; color: var(--text); line-height: 1.4; font-weight: 500; }
    .ceremony-meta { font-size: 10px; color: var(--muted); display: flex; flex-wrap: wrap; gap: 6px; margin-top: auto; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 6px; }

    /* Breadcrumb Trajectory Section */
    .trajectory-section { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 18px; }
    .trajectory-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .trajectory-header h2 { font-size: 14px; text-transform: uppercase; color: var(--muted); letter-spacing: 0.5px; }
    .filter-chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .chip { padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; cursor: pointer; border: 1px solid var(--border); background: rgba(15, 23, 42, 0.6); color: var(--muted); transition: 0.15s; }
    .chip.active { border-color: var(--accent); color: var(--text); background: rgba(56, 189, 248, 0.15); }
    .trajectory-timeline { display: flex; gap: 12px; overflow-x: auto; padding: 8px 4px 14px 4px; scrollbar-width: thin; }
    .trajectory-node { min-width: 220px; max-width: 260px; background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border); border-radius: 6px; padding: 10px 12px; cursor: pointer; transition: transform 0.15s, border-color 0.15s; display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; }
    .trajectory-node:hover { transform: translateY(-2px); border-color: var(--accent); background: var(--card-hover); }
    .node-header { display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: var(--muted); }
    .node-badge { font-size: 9px; padding: 2px 5px; border-radius: 4px; font-weight: 700; text-transform: uppercase; }
    .badge-FSM_TRANSITION { background: rgba(168, 85, 247, 0.2); color: var(--purple); }
    .badge-QUALITY_GATE { background: rgba(34, 197, 94, 0.2); color: var(--green); }
    .badge-SELF_HEALING { background: rgba(234, 179, 8, 0.2); color: var(--yellow); }
    .badge-FINOPS_ALERT { background: rgba(239, 68, 68, 0.2); color: var(--red); }
    .badge-TOOL_EXECUTION { background: rgba(56, 189, 248, 0.2); color: var(--accent); }
    .badge-STEERING_ACTION { background: rgba(234, 179, 8, 0.2); color: var(--yellow); }
    .badge-SYSTEM_EVENT { background: rgba(255, 255, 255, 0.1); color: var(--muted); }
    .node-summary { font-size: 12px; font-weight: 500; color: var(--text); line-height: 1.3; }

    /* Trajectory Inspector Modal / Drawer */
    #inspector-drawer { display: none; position: fixed; right: 0; top: 0; width: 440px; height: 100vh; background: #0b1120; border-left: 1px solid var(--border); padding: 20px; z-index: 999; box-shadow: -10px 0 30px rgba(0,0,0,0.6); flex-direction: column; gap: 14px; overflow-y: auto; }
    .drawer-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 10px; }
    .drawer-close { background: none; border: none; font-size: 18px; color: var(--muted); cursor: pointer; }
    .drawer-content { font-family: ui-monospace, monospace; font-size: 11px; color: var(--text); background: #020617; padding: 12px; border-radius: 6px; overflow-x: auto; max-height: 500px; white-space: pre-wrap; word-break: break-all; }

    /* Telemetry & Steering Grid */
    .grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; }
    .panel { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 18px; }
    .panel h2 { font-size: 14px; text-transform: uppercase; color: var(--muted); margin-bottom: 12px; letter-spacing: 0.5px; }
    #events-feed { height: 280px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; font-family: ui-monospace, monospace; font-size: 12px; }
    .event-card { padding: 8px 12px; border-radius: 4px; background: rgba(15, 23, 42, 0.6); border-left: 3px solid var(--accent); }
    .event-card.warn { border-left-color: var(--yellow); }
    .event-card.error { border-left-color: var(--red); }
    .event-time { color: var(--muted); font-size: 10px; margin-bottom: 2px; }
    .controls { display: flex; flex-direction: column; gap: 12px; }
    button { padding: 10px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 13px; }
    .btn-pause { background: var(--yellow); color: #000; }
    .btn-resume { background: var(--green); color: #fff; }
    .btn-abort { background: var(--red); color: #fff; }
    .btn-pause:hover, .btn-resume:hover, .btn-abort:hover { opacity: 0.9; }
    textarea { width: 100%; height: 70px; background: #0f172a; border: 1px solid var(--border); border-radius: 6px; padding: 8px; color: #fff; font-size: 13px; resize: none; }
    .btn-hint { background: var(--accent); color: #000; margin-top: 6px; width: 100%; }
`;
