import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";

const API = "https://ledger-app-production-6224.up.railway.app"; // ← replace with your Railway URL


// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// THEMES
// ─────────────────────────────────────────────────────────────────────────────
const THEMES = {
  "Obsidian": {
    bg:"#0f0f11",surface:"#17171b",surface2:"#1e1e24",surface3:"#26262f",
    border:"#2e2e38",border2:"#3a3a48",
    accent:"#c8f135",accent2:"#9de02a",
    text:"#f0f0f4",text2:"#9898a8",text3:"#5c5c70",
    red:"#ff5252",green:"#4ade80",blue:"#60a5fa",amber:"#fbbf24",purple:"#a78bfa",
  },
  "Midnight Blue": {
    bg:"#0d1117",surface:"#161b22",surface2:"#1c2330",surface3:"#21293a",
    border:"#30363d",border2:"#444c56",
    accent:"#58a6ff",accent2:"#79c0ff",
    text:"#e6edf3",text2:"#8b949e",text3:"#484f58",
    red:"#ff7b72",green:"#3fb950",blue:"#58a6ff",amber:"#e3b341",purple:"#bc8cff",
  },
  "Warm Slate": {
    bg:"#13100e",surface:"#1c1714",surface2:"#251f1b",surface3:"#2e2622",
    border:"#3a302a",border2:"#4a3d35",
    accent:"#f4a35a",accent2:"#f08c3a",
    text:"#f2ede8",text2:"#9e8e82",text3:"#5c4e45",
    red:"#e05252",green:"#6dbf67",blue:"#6ab0d4",amber:"#f4a35a",purple:"#b994c8",
  },
  "Forest": {
    bg:"#0d120e",surface:"#141a14",surface2:"#1a231b",surface3:"#202b21",
    border:"#2a3a2b",border2:"#3a4e3c",
    accent:"#6fcf7e",accent2:"#4db85e",
    text:"#e8f0e9",text2:"#8fa890",text3:"#4e5e4f",
    red:"#e05252",green:"#6fcf7e",blue:"#68b5c8",amber:"#d4a853",purple:"#a88eca",
  },
  "Light": {
    bg:"#f4f5f7",surface:"#ffffff",surface2:"#f0f1f3",surface3:"#e8eaed",
    border:"#d9dde6",border2:"#c4c9d4",
    accent:"#2563eb",accent2:"#1d4ed8",
    text:"#111827",text2:"#4b5563",text3:"#9ca3af",
    red:"#dc2626",green:"#16a34a",blue:"#2563eb",amber:"#d97706",purple:"#7c3aed",
  },
};

function themeVars(t) {
  return `:root{--bg:${t.bg};--surface:${t.surface};--surface2:${t.surface2};--surface3:${t.surface3};--border:${t.border};--border2:${t.border2};--accent:${t.accent};--accent2:${t.accent2};--text:${t.text};--text2:${t.text2};--text3:${t.text3};--red:${t.red};--green:${t.green};--blue:${t.blue};--amber:${t.amber};--purple:${t.purple};--radius:8px;--radius-lg:14px;}`;
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
  /* :root injected dynamically via themeVars() */
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;font-size:14px;line-height:1.5;}
  .app{display:flex;height:100vh;overflow:hidden;}

  /* Sidebar */
  .sidebar{width:230px;min-width:230px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:20px 0;overflow-y:auto;}
  .sidebar-logo{padding:0 20px 20px;border-bottom:1px solid var(--border);margin-bottom:12px;}
  .logo-text{font-family:'DM Serif Display',serif;font-size:20px;color:var(--accent);letter-spacing:-0.5px;}
  .logo-sub{font-size:11px;color:var(--text3);font-family:'DM Mono',monospace;}
  .nav-section{font-size:10px;color:var(--text3);letter-spacing:1.5px;text-transform:uppercase;padding:14px 20px 5px;font-family:'DM Mono',monospace;}
  .nav-item{display:flex;align-items:center;gap:9px;padding:8px 20px;cursor:pointer;color:var(--text2);font-size:13px;font-weight:500;border-left:2px solid transparent;transition:all .15s;user-select:none;}
  .nav-item:hover{color:var(--text);background:var(--surface2);}
  .nav-item.active{color:var(--accent);border-left-color:var(--accent);background:rgba(200,241,53,.05);}
  .nav-item.sub{padding-left:38px;font-size:12px;}
  .nav-icon{font-size:14px;width:16px;text-align:center;flex-shrink:0;}
  .nav-badge{margin-left:auto;background:var(--amber);color:#0f0f11;font-size:10px;font-weight:700;font-family:'DM Mono',monospace;padding:1px 6px;border-radius:10px;}
  .sidebar-footer{margin-top:auto;padding:14px 20px;border-top:1px solid var(--border);}
  .txn-count{font-size:12px;color:var(--text3);font-family:'DM Mono',monospace;}
  .txn-count span{color:var(--accent);font-weight:500;}

  /* Main */
  .main{flex:1;overflow-y:auto;background:var(--bg);min-width:0;}
  .page{padding:24px 28px;max-width:100%;}
  .page-title{font-family:'DM Serif Display',serif;font-size:26px;color:var(--text);margin-bottom:3px;}
  .page-sub{color:var(--text2);font-size:13px;margin-bottom:22px;}

  /* Cards */
  .card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:18px;margin-bottom:14px;}
  .card-title{font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:1.2px;font-family:'DM Mono',monospace;margin-bottom:10px;}

  /* Upload */
  .upload-zone{border:2px dashed var(--border2);border-radius:var(--radius-lg);padding:44px;text-align:center;cursor:pointer;transition:all .2s;background:var(--surface);}
  .upload-zone:hover,.upload-zone.drag{border-color:var(--accent);background:rgba(200,241,53,.04);}
  .upload-icon{font-size:36px;margin-bottom:10px;}
  .upload-title{font-size:15px;font-weight:600;color:var(--text);margin-bottom:5px;}
  .upload-hint{font-size:13px;color:var(--text2);}
  .upload-format{font-size:11px;color:var(--text3);font-family:'DM Mono',monospace;margin-top:6px;}

  /* Buttons */
  .btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:var(--radius);border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;transition:all .15s;white-space:nowrap;}
  .btn-primary{background:var(--accent);color:#0f0f11;}
  .btn-primary:hover{background:var(--accent2);}
  .btn-ghost{background:transparent;color:var(--text2);border:1px solid var(--border);}
  .btn-ghost:hover{border-color:var(--border2);color:var(--text);background:var(--surface2);}
  .btn-danger{background:transparent;color:var(--red);border:1px solid rgba(255,82,82,.3);}
  .btn-danger:hover{background:rgba(255,82,82,.1);}
  .btn-sm{padding:4px 10px;font-size:12px;}
  .btn:disabled{opacity:.4;cursor:not-allowed;}

  /* Tables */
  .table-wrap{overflow-x:auto;border-radius:var(--radius-lg);border:1px solid var(--border);}
  table{width:100%;border-collapse:collapse;}
  th{background:var(--surface2);color:var(--text3);font-size:11px;text-transform:uppercase;letter-spacing:1px;padding:10px 13px;text-align:left;font-family:'DM Mono',monospace;font-weight:400;border-bottom:1px solid var(--border);}
  th.check-col{width:34px;padding-left:14px;}
  td{padding:8px 13px;border-bottom:1px solid var(--border);color:var(--text2);font-size:13px;vertical-align:middle;}
  tr:last-child td{border-bottom:none;}
  tr:hover td{background:rgba(255,255,255,.015);}
  tr.selected td{background:rgba(200,241,53,.04);}
  .amount{font-family:'DM Mono',monospace;font-size:13px;}
  .amount.pos{color:var(--green);}
  .amount.neg{color:var(--red);}
  .cb{width:14px;height:14px;accent-color:var(--accent);cursor:pointer;}

  /* Badges */
  .badge{display:inline-flex;align-items:center;padding:2px 7px;border-radius:20px;font-size:11px;font-weight:500;font-family:'DM Mono',monospace;}
  .badge-asset{background:rgba(96,165,250,.15);color:var(--blue);}
  .badge-liability{background:rgba(255,82,82,.15);color:var(--red);}
  .badge-equity{background:rgba(167,139,250,.15);color:var(--purple);}
  .badge-revenue{background:rgba(74,222,128,.15);color:var(--green);}
  .badge-expense{background:rgba(251,191,36,.15);color:var(--amber);}

  /* Select / Input */
  select{background:var(--surface2);color:var(--text);border:1px solid var(--border);border-radius:var(--radius);padding:5px 9px;font-family:'DM Sans',sans-serif;font-size:12px;cursor:pointer;outline:none;}
  select:focus{border-color:var(--accent);}
  select option{background:var(--surface2);}
  input[type="text"],input[type="number"],input[type="date"]{background:var(--surface2);color:var(--text);border:1px solid var(--border);border-radius:var(--radius);padding:6px 11px;font-family:'DM Sans',sans-serif;font-size:13px;outline:none;width:100%;}
  input:focus{border-color:var(--accent);}
  input[type="date"]{color-scheme:dark;}

  /* Combobox */
  .combo-wrap{position:relative;width:210px;}
  .combo-input{background:var(--surface2);color:var(--text);border:1px solid var(--border);border-radius:var(--radius);padding:4px 26px 4px 9px;font-family:'DM Sans',sans-serif;font-size:12px;outline:none;width:100%;cursor:text;}
  .combo-input:focus{border-color:var(--accent);}
  .combo-dropdown{position:fixed;z-index:9999;background:var(--surface);border:1px solid var(--border2);border-radius:var(--radius-lg);box-shadow:0 8px 32px rgba(0,0,0,.55);min-width:230px;max-height:270px;overflow-y:auto;}
  .combo-group{font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:1.2px;padding:7px 11px 3px;font-family:'DM Mono',monospace;}
  .combo-option{padding:7px 11px;cursor:pointer;font-size:13px;color:var(--text2);display:flex;align-items:center;justify-content:space-between;}
  .combo-option:hover,.combo-option.hi{background:var(--surface2);color:var(--text);}
  .combo-option .opt-id{font-size:10px;font-family:'DM Mono',monospace;color:var(--text3);}
  .combo-clear{position:absolute;right:5px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text3);cursor:pointer;font-size:13px;line-height:1;padding:2px 3px;}
  .combo-clear:hover{color:var(--text);}

  /* Inline row editor (tab-to-fill + accept) */
  .row-editing td{background:rgba(200,241,53,.04) !important;}
  .row-pending{background:var(--surface2);}
  .row-pending td{background:var(--surface2) !important;}
  .accept-btn{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:5px;border:none;background:var(--accent);color:#0f0f11;font-size:12px;font-weight:600;cursor:pointer;transition:all .12s;white-space:nowrap;}
  .accept-btn:hover{background:var(--accent2);}
  .cancel-btn{display:inline-flex;align-items:center;padding:3px 8px;border-radius:5px;border:1px solid var(--border);background:transparent;color:var(--text3);font-size:12px;cursor:pointer;}
  .cancel-btn:hover{color:var(--text);border-color:var(--border2);}
  .tab-hint{font-size:10px;color:var(--text3);font-family:'DM Mono',monospace;margin-left:4px;}

  /* Transfer match banner */
  .match-banner{display:flex;align-items:center;gap:10px;background:rgba(96,165,250,.08);border:1px solid rgba(96,165,250,.25);border-radius:var(--radius-lg);padding:10px 14px;margin-bottom:12px;}
  .match-banner-icon{font-size:18px;}
  .match-banner-text{flex:1;font-size:13px;color:var(--text2);}
  .match-banner-text strong{color:var(--blue);}
  .match-btn{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:var(--radius);border:1px solid rgba(96,165,250,.4);background:rgba(96,165,250,.1);color:var(--blue);font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;}
  .match-btn:hover{background:rgba(96,165,250,.2);}
  .matched-badge{display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--blue);font-family:'DM Mono',monospace;background:rgba(96,165,250,.1);padding:2px 7px;border-radius:10px;border:1px solid rgba(96,165,250,.2);}

  /* Date range bar */
  .date-bar{display:flex;align-items:center;gap:10px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:10px 16px;margin-bottom:20px;flex-wrap:wrap;}
  .date-bar label{font-size:12px;color:var(--text3);font-family:'DM Mono',monospace;}
  .date-bar input{width:140px;}
  .date-sep{color:var(--text3);font-size:13px;}
  .date-preset{font-size:12px;color:var(--text2);cursor:pointer;padding:3px 8px;border-radius:5px;border:1px solid var(--border);}
  .date-preset:hover,.date-preset.on{background:var(--surface2);color:var(--text);border-color:var(--border2);}

  /* Bulk bar */
  .bulk-bar{display:flex;align-items:center;gap:10px;background:rgba(200,241,53,.07);border:1px solid rgba(200,241,53,.18);border-radius:var(--radius-lg);padding:9px 14px;margin-bottom:10px;}
  .bulk-count{font-size:13px;color:var(--accent);font-weight:600;}

  /* Tabs */
  .tabs{display:flex;gap:2px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:3px;width:fit-content;margin-bottom:18px;}
  .tab{padding:5px 16px;border-radius:6px;cursor:pointer;font-size:13px;color:var(--text2);font-weight:500;transition:all .15s;display:flex;align-items:center;gap:6px;}
  .tab.active{background:var(--surface3);color:var(--text);}
  .tab:hover:not(.active){color:var(--text);}
  .tab-badge{background:var(--amber);color:#0f0f11;font-size:10px;font-weight:700;font-family:'DM Mono',monospace;padding:1px 5px;border-radius:8px;}

  /* Stats */
  .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:11px;margin-bottom:20px;}
  .stat-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:14px 16px;}
  .stat-label{font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;font-family:'DM Mono',monospace;margin-bottom:5px;}
  .stat-value{font-family:'DM Serif Display',serif;font-size:21px;color:var(--text);}
  .stat-value.green{color:var(--green);}
  .stat-value.red{color:var(--red);}

  /* Financial statements */
  .statement{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;margin-bottom:16px;}
  .statement-header{background:var(--surface2);padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
  .statement-title{font-family:'DM Serif Display',serif;font-size:15px;}
  .statement-date{font-size:11px;color:var(--text3);font-family:'DM Mono',monospace;}
  .stmt-group-header{padding:9px 18px;background:var(--surface2);font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:1.2px;font-family:'DM Mono',monospace;border-top:1px solid var(--border);}
  .stmt-row{display:flex;justify-content:space-between;align-items:center;padding:7px 18px;border-top:1px solid rgba(46,46,56,.5);}
  .stmt-row.clickable{cursor:pointer;}
  .stmt-row.clickable:hover{background:var(--surface2);}
  .stmt-row.total{border-top:1px solid var(--border2);font-weight:600;background:rgba(200,241,53,.04);}
  .stmt-row.grand-total{background:rgba(200,241,53,.08);border-top:2px solid var(--accent);}
  .stmt-name{color:var(--text2);font-size:13px;display:flex;align-items:center;gap:6px;}
  .stmt-name.bold{color:var(--text);font-weight:600;}
  .stmt-drill{font-size:10px;color:var(--text3);opacity:0;}
  .stmt-row.clickable:hover .stmt-drill{opacity:1;}
  .stmt-amount{font-family:'DM Mono',monospace;font-size:13px;color:var(--text);}
  .stmt-amount.green{color:var(--green);}
  .stmt-amount.red{color:var(--red);}
  .stmt-indent{padding-left:34px;}

  /* Drill-down modal */
  .drill-modal{background:var(--surface);border:1px solid var(--border2);border-radius:var(--radius-lg);padding:0;width:min(900px,96vw);max-height:92vh;overflow:hidden;display:flex;flex-direction:column;}
  .drill-header{padding:18px 22px;border-bottom:1px solid var(--border);display:flex;align-items:flex-start;justify-content:space-between;}
  .drill-title{font-family:'DM Serif Display',serif;font-size:18px;}
  .drill-sub{font-size:12px;color:var(--text3);margin-top:3px;font-family:'DM Mono',monospace;}
  .drill-body{overflow-y:auto;flex:1;}
  .drill-total{padding:12px 22px;border-top:1px solid var(--border);background:var(--surface2);display:flex;justify-content:space-between;align-items:center;}
  .drill-edit-btn{background:none;border:none;color:var(--blue);font-size:12px;cursor:pointer;padding:2px 4px;opacity:.7;font-family:'DM Sans',sans-serif;}
  .drill-edit-btn:hover{opacity:1;text-decoration:underline;}
  .drill-je-btn{background:none;border:none;color:var(--purple);font-size:12px;cursor:pointer;padding:2px 4px;opacity:.7;font-family:'DM Sans',sans-serif;}
  .drill-je-btn:hover{opacity:1;text-decoration:underline;}

  /* Modal */
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:200;display:flex;align-items:center;justify-content:center;}
  .modal{background:var(--surface);border:1px solid var(--border2);border-radius:var(--radius-lg);padding:26px;width:480px;max-width:96vw;max-height:92vh;overflow-y:auto;}
  .modal-title{font-family:'DM Serif Display',serif;font-size:19px;margin-bottom:18px;}
  .field{margin-bottom:13px;}
  .field label{display:block;font-size:12px;color:var(--text2);margin-bottom:4px;font-weight:500;}

  /* Toolbar */
  .toolbar{display:flex;align-items:center;gap:9px;margin-bottom:13px;flex-wrap:wrap;}
  .toolbar-spacer{flex:1;}

  /* Bank tabs row */
  .bank-tabs{display:flex;gap:0;border-bottom:1px solid var(--border);margin-bottom:18px;overflow-x:auto;}
  .bank-tab{padding:9px 18px;cursor:pointer;font-size:13px;color:var(--text2);font-weight:500;border-bottom:2px solid transparent;transition:all .15s;white-space:nowrap;display:flex;align-items:center;gap:6px;}
  .bank-tab:hover{color:var(--text);}
  .bank-tab.active{color:var(--accent);border-bottom-color:var(--accent);}
  .bank-tab-badge{background:rgba(200,241,53,.15);color:var(--accent);font-size:10px;font-family:'DM Mono',monospace;padding:1px 5px;border-radius:6px;}

  /* Section divider */
  .section-divider{font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:1.4px;font-family:'DM Mono',monospace;padding:12px 0 8px;display:flex;align-items:center;gap:10px;}
  .section-divider::after{content:'';flex:1;height:1px;background:var(--border);}

  /* Pagination */
  .pagination{display:flex;align-items:center;gap:8px;margin-top:12px;justify-content:flex-end;}
  .page-info{font-size:12px;color:var(--text3);font-family:'DM Mono',monospace;}

  /* Empty */
  .empty{text-align:center;padding:50px 20px;color:var(--text3);}
  .empty-icon{font-size:32px;margin-bottom:10px;}
  .empty-title{font-size:14px;color:var(--text2);margin-bottom:5px;}

  /* Utils */
  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px;}
  .flex{display:flex;}.gap-8{gap:8px;}.gap-12{gap:12px;}.items-center{align-items:center;}
  .mt-8{margin-top:8px;}.mt-14{margin-top:14px;}.ml-auto{margin-left:auto;}
  .font-mono{font-family:'DM Mono',monospace;}
  .text-muted{color:var(--text2);}

  /* Theme picker */
  .theme-picker{display:flex;align-items:center;gap:8px;padding:10px 20px;border-top:1px solid var(--border);}
  .theme-label{font-size:11px;color:var(--text3);font-family:'DM Mono',monospace;}
  .theme-select{background:var(--surface2);color:var(--text);border:1px solid var(--border);border-radius:6px;padding:4px 8px;font-size:12px;cursor:pointer;outline:none;flex:1;}
  .theme-select:focus{border-color:var(--accent);}
  .theme-swatch{width:14px;height:14px;border-radius:50%;flex-shrink:0;}

  /* Pending-classify row highlight */
  .row-pending-classify td{background:rgba(var(--accent-rgb,200,241,53),.06) !important;}

  /* Bulk accept bar */
  .bulk-accept-bar{display:flex;align-items:center;gap:10px;background:rgba(74,222,128,.08);border:1px solid rgba(74,222,128,.22);border-radius:var(--radius-lg);padding:10px 16px;margin-bottom:12px;}
  .bulk-accept-count{font-size:13px;color:var(--green);font-weight:600;}
  .bulk-accept-btn{display:inline-flex;align-items:center;gap:5px;padding:5px 14px;border-radius:var(--radius);border:none;background:var(--green);color:#0f0f11;font-size:12px;font-weight:700;cursor:pointer;}
  .bulk-accept-btn:hover{filter:brightness(1.1);}
  .bulk-discard-btn{display:inline-flex;align-items:center;padding:5px 10px;border-radius:var(--radius);border:1px solid var(--border);background:transparent;color:var(--text3);font-size:12px;cursor:pointer;}
  .bulk-discard-btn:hover{color:var(--text);border-color:var(--border2);}

  /* Bank feed badge */
  .feed-badge{display:inline-flex;align-items:center;gap:3px;font-size:10px;color:var(--blue);font-family:'DM Mono',monospace;background:rgba(96,165,250,.1);padding:1px 6px;border-radius:8px;border:1px solid rgba(96,165,250,.2);}
  .coa-inactive td{opacity:.42;}
  .inactive-badge{display:inline-flex;align-items:center;font-size:10px;color:var(--text3);font-family:'DM Mono',monospace;background:var(--surface3);padding:1px 6px;border-radius:6px;margin-left:5px;}
  .recon-row{cursor:pointer;}
  .recon-row:hover td{background:var(--surface2);}
  .recon-row.cleared td{background:rgba(74,222,128,.05);}
  .recon-diff.ok{color:var(--green);font-weight:700;}
  .recon-diff.off{color:var(--red);font-weight:700;}
  .last-reconciled{font-size:11px;color:var(--blue);font-family:'DM Mono',monospace;}
  /* Reconciliation modal — full-screen flex layout so body scrolls independently */
  .recon-modal{
    background:var(--surface);border:1px solid var(--border2);border-radius:var(--radius-lg);
    width:760px;max-width:96vw;
    height:90vh;max-height:90vh;
    display:flex;flex-direction:column;overflow:hidden;
  }
  .recon-header{
    flex-shrink:0;
    padding:16px 22px 12px;border-bottom:1px solid var(--border);background:var(--surface2);
  }
  .recon-body{
    flex:1;overflow-y:auto;overflow-x:hidden;
    /* Ensure body actually scrolls — not the modal-overlay */
    min-height:0;
  }
  .recon-footer{
    flex-shrink:0;
    padding:12px 22px;border-top:1px solid var(--border);background:var(--surface2);
    display:flex;align-items:center;gap:16px;flex-wrap:wrap;
  }
  .recon-row td{border-bottom:1px solid rgba(46,46,56,.35);cursor:pointer;}
  .recon-row:hover td{background:var(--surface2);}
  .recon-row.cleared td{background:rgba(74,222,128,.05);}
  .recon-diff.ok{color:var(--green);font-weight:700;}
  .recon-diff.off{color:var(--red);font-weight:700;}
  /* Make the modal-overlay itself not scroll — the recon-body handles scrolling */
  .modal-overlay{align-items:center;justify-content:center;}
  /* CoA actions dropdown */
  .coa-menu-wrap{position:relative;display:inline-block;}
  .coa-menu-btn{display:inline-flex;align-items:center;gap:3px;padding:4px 10px;border-radius:var(--radius);border:1px solid var(--border);background:transparent;color:var(--text2);font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s;}
  .coa-menu-btn:hover{border-color:var(--border2);color:var(--text);background:var(--surface2);}
  .coa-menu-btn .caret{font-size:9px;opacity:.6;transition:transform .15s;}
  .coa-menu-btn.open .caret{transform:rotate(180deg);}
  .coa-menu-dropdown{position:fixed;z-index:9999;background:var(--surface);border:1px solid var(--border2);border-radius:var(--radius-lg);box-shadow:0 8px 24px rgba(0,0,0,.4);min-width:160px;overflow:hidden;padding:4px;}
  .coa-menu-item{display:flex;align-items:center;gap:8px;padding:8px 12px;cursor:pointer;font-size:13px;color:var(--text2);border-radius:6px;transition:all .1s;border:none;background:none;width:100%;text-align:left;font-family:'DM Sans',sans-serif;}
  .coa-menu-item:hover{background:var(--surface2);color:var(--text);}
  .coa-menu-item.danger{color:var(--red);}
  .coa-menu-item.danger:hover{background:rgba(255,82,82,.1);}
  .coa-menu-item.success{color:var(--green);}
  .coa-menu-item.success:hover{background:rgba(74,222,128,.1);}
  .coa-menu-item.accent{color:var(--blue);}
  .coa-menu-item.accent:hover{background:rgba(96,165,250,.1);}
  .coa-menu-divider{height:1px;background:var(--border);margin:4px 0;}
  .theme-editor-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px;}
  .qb-parent-row .qb-label{font-weight:600;color:var(--text) !important;}
  .theme-swatch-input{display:flex;align-items:center;gap:8px;}
  .theme-swatch-input input[type=color]{width:34px;height:28px;border:none;border-radius:4px;cursor:pointer;padding:1px;background:var(--surface2);}
  .theme-swatch-input label{font-size:12px;color:var(--text2);}

  /* Journal Entry page */
  .je-table{width:100%;border-collapse:collapse;background:var(--surface);border-radius:var(--radius-lg);overflow:hidden;border:1px solid var(--border);}
  .je-table th{background:var(--surface2);color:var(--text3);font-size:11px;text-transform:uppercase;letter-spacing:1px;padding:10px 14px;text-align:left;font-family:'DM Mono',monospace;font-weight:400;border-bottom:1px solid var(--border);}
  .je-table th.num{text-align:right;}
  .je-table td{padding:7px 10px;border-bottom:1px solid var(--border);vertical-align:middle;}
  .je-table tr:last-child td{border-bottom:none;}
  .je-table tr.je-total td{background:var(--surface2);font-weight:600;font-family:'DM Mono',monospace;font-size:13px;}
  .je-num-input{background:transparent;border:none;border-bottom:1px solid var(--border);border-radius:0;padding:4px 6px;font-family:'DM Mono',monospace;font-size:13px;width:120px;text-align:right;color:var(--text);outline:none;}
  .je-num-input:focus{border-bottom-color:var(--accent);}
  .je-balanced{color:var(--green);font-size:12px;font-family:'DM Mono',monospace;display:flex;align-items:center;gap:5px;}
  .je-unbalanced{color:var(--red);font-size:12px;font-family:'DM Mono',monospace;display:flex;align-items:center;gap:5px;}
  .je-entry-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);margin-bottom:12px;overflow:hidden;}
  .je-entry-header{background:var(--surface2);padding:10px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);}
  .je-entry-date{font-size:11px;color:var(--text3);font-family:'DM Mono',monospace;margin-top:2px;}
  .je-entry-memo{font-size:13px;color:var(--text);font-weight:500;}

  /* Trend report */
  .trend-wrap{overflow-x:auto;border-radius:var(--radius-lg);border:1px solid var(--border);}
  .trend-table{width:100%;border-collapse:collapse;font-size:12px;}
  .trend-table th{background:var(--surface2);color:var(--text3);font-size:10px;text-transform:uppercase;letter-spacing:.8px;padding:8px 10px;text-align:right;font-family:'DM Mono',monospace;border-bottom:1px solid var(--border);white-space:nowrap;}
  .trend-table th:first-child{text-align:left;min-width:140px;}
  .trend-table td{padding:7px 10px;border-bottom:1px solid rgba(46,46,56,.4);text-align:right;font-family:'DM Mono',monospace;color:var(--text2);white-space:nowrap;}
  .trend-table td:first-child{text-align:left;color:var(--text);font-family:'DM Sans',sans-serif;font-size:13px;}
  .trend-table tr:hover td{background:var(--surface2);}
  .trend-table tr.trend-group td{background:var(--surface2);font-weight:600;color:var(--text);}
  .trend-table tr.trend-total td{background:rgba(200,241,53,.06);font-weight:700;border-top:1px solid var(--border2);}
  .trend-table tr.trend-grand td{background:rgba(200,241,53,.1);font-weight:700;border-top:2px solid var(--accent);}
  .trend-table td.pos{color:var(--green);} .trend-table td.neg{color:var(--red);}
  .trend-indent td:first-child{padding-left:26px;}

  /* View toggle */
  .view-toggle{display:flex;gap:2px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:3px;width:fit-content;margin-bottom:18px;}
  .vt-btn{padding:4px 14px;border-radius:5px;border:none;background:none;cursor:pointer;font-size:12px;font-weight:500;color:var(--text2);font-family:'DM Sans',sans-serif;}
  .vt-btn.on{background:var(--surface3);color:var(--text);}
  .period-row{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap;}
  .period-label{font-size:12px;color:var(--text3);font-family:'DM Mono',monospace;}

  /* Resizable no-wrap transaction table */
  .txn-table-wrap{overflow-x:auto;border-radius:var(--radius-lg);border:1px solid var(--border);}
  .txn-table{width:100%;border-collapse:collapse;table-layout:fixed;}
  .txn-table th{background:var(--surface2);color:var(--text3);font-size:11px;text-transform:uppercase;letter-spacing:1px;padding:10px 10px;text-align:left;font-family:'DM Mono',monospace;font-weight:400;border-bottom:1px solid var(--border);white-space:nowrap;overflow:hidden;position:relative;user-select:none;}
  .txn-table td{padding:8px 10px;border-bottom:1px solid var(--border);color:var(--text2);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;vertical-align:middle;}
  .txn-table tr:last-child td{border-bottom:none;}
  .txn-table tr:hover td{background:rgba(255,255,255,.015);}
  .txn-table tr.selected td{background:rgba(200,241,53,.04);}
  .txn-table tr.row-editing td{background:rgba(200,241,53,.04) !important;}
  .txn-table tr.row-pending-classify td{background:rgba(200,241,53,.06) !important;}
  .col-resize{position:absolute;right:0;top:0;bottom:0;width:5px;cursor:col-resize;background:transparent;z-index:1;}
  .col-resize:hover,.col-resize:active{background:var(--accent);}
  .sort-th{cursor:pointer;user-select:none;}
  .sort-th:hover{color:var(--text) !important;}
  .sort-arrow{font-size:9px;margin-left:4px;opacity:.5;}
  .sort-arrow.active{opacity:1;color:var(--accent);}

  /* ── QuickBooks Desktop-style financial reports (white paper look) ── */
  .qb-report{background:#fff;border:1px solid #c8c8c8;border-radius:4px;overflow:hidden;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,.18);}
  /* Centered header block */
  .qb-header{text-align:center;padding:18px 40px 12px;background:#fff;border-bottom:1px solid #ddd;}
  .qb-co{display:block;font-size:13px;color:#333;font-family:'DM Sans',sans-serif;margin-bottom:3px;font-weight:400;}
  .qb-title{display:block;font-size:18px;color:#111;font-family:'DM Sans',sans-serif;font-weight:700;margin-bottom:3px;}
  .qb-date{font-size:12px;color:#555;font-family:'DM Sans',sans-serif;}
  /* Column header bar */
  .qb-col-heads{display:flex;justify-content:flex-end;padding:5px 32px;background:#f0f0f0;border-bottom:1px solid #bbb;}
  .qb-col-head{font-size:11px;font-weight:700;color:#333;min-width:140px;text-align:right;text-decoration:underline;}
  /* Section heading (INCOME, EXPENSE, ASSETS...) */
  .qb-section{padding:10px 32px 3px;font-size:12px;font-weight:700;color:var(--rpt-section-text,#111);background:var(--rpt-section-bg,#fff);border-top:none;}
  /* Sub-section label */
  .qb-subsection{padding:4px 32px 1px;font-size:12px;font-weight:700;color:var(--rpt-section-text,#111);background:var(--rpt-section-bg,#fff);padding-left:44px;}
  /* Account row */
  .qb-row{display:flex;align-items:baseline;padding:2px 32px;cursor:pointer;background:var(--rpt-bg,#fff);}
  .qb-row:hover{background:var(--rpt-row-even,#f5f5f5);}
  .qb-row.l1{padding-left:48px;}
  .qb-row.l2{padding-left:64px;}
  .qb-row.l3{padding-left:80px;}
  .qb-row.no-click{cursor:default;}
  .qb-row.no-click:hover{background:#fff;}
  /* Name and value */
  .qb-label{flex:1;font-size:12px;color:#111;font-family:'DM Sans',sans-serif;line-height:1.7;display:flex;align-items:center;gap:4px;}
  .qb-label.italic{font-style:italic;color:#888;}
  .qb-hint{font-size:10px;color:#aaa;opacity:0;transition:opacity .1s;}
  .qb-row:hover .qb-hint{opacity:1;}
  .qb-val{min-width:140px;text-align:right;font-size:12px;font-family:'DM Mono',monospace;color:#111;white-space:nowrap;padding-right:4px;}
  .qb-val.pos{color:#1a7c3a;}
  .qb-val.neg{color:#c0392b;}
  /* Spacer */
  .qb-space{height:4px;background:#fff;}
  /* Subtotal row — underlined amount */
  .qb-subtotal{display:flex;align-items:baseline;padding:3px 32px;background:#fff;}
  .qb-subtotal.l1{padding-left:48px;}
  .qb-subtotal.l2{padding-left:64px;}
  .qb-subtotal-label{flex:1;font-size:12px;font-weight:700;color:#111;font-family:'DM Sans',sans-serif;}
  .qb-subtotal-val{min-width:140px;text-align:right;font-size:12px;font-family:'DM Mono',monospace;font-weight:700;color:#111;border-top:1px solid #111;padding-top:2px;white-space:nowrap;padding-right:4px;}
  .qb-subtotal-val.pos{color:#1a7c3a;}
  .qb-subtotal-val.neg{color:#c0392b;}
  /* Grand total — double underline */
  .qb-grand{display:flex;align-items:baseline;padding:4px 32px 8px;background:#fff;border-top:1px solid #ccc;margin-top:4px;}
  .qb-grand-label{flex:1;font-size:12px;font-weight:700;color:#111;font-family:'DM Sans',sans-serif;}
  .qb-grand-val{min-width:140px;text-align:right;font-size:12px;font-family:'DM Mono',monospace;font-weight:700;color:#111;border-bottom:3px double #111;padding-bottom:3px;white-space:nowrap;padding-right:4px;}
  .qb-grand-val.pos{color:#1a7c3a;}
  .qb-grand-val.neg{color:#c0392b;}
  /* Legacy compat */
  .qb-report-header,.qb-report-col-heads,.qb-section-label{background:#f0f0f0;}
  .qb-report-co{font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;font-family:'DM Sans',sans-serif;display:block;}
  .qb-report-title{font-size:18px;font-weight:700;color:#111;display:block;}
  .qb-report-date{font-size:12px;color:#555;}
  .qb-name{flex:1;font-size:12px;color:#111;display:flex;align-items:center;gap:6px;}
  .qb-name.bold{font-weight:700;}
  .qb-amt{min-width:120px;text-align:right;font-family:'DM Mono',monospace;font-size:12px;color:#111;}
  .qb-amt.pos{color:#1a7c3a;}.qb-amt.neg{color:#c0392b;}.qb-amt.bold{font-weight:700;}

  /* Report toolbar (date + view controls inline) */
  .report-toolbar{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:10px 14px;}
  .report-toolbar-sep{width:1px;height:20px;background:var(--border);flex-shrink:0;}
  .view-col-label{font-size:12px;color:var(--text3);font-family:'DM Mono',monospace;white-space:nowrap;}
  .view-col-select{background:var(--surface2);color:var(--text);border:1px solid var(--border2);border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;outline:none;font-family:'DM Sans',sans-serif;}
  .view-col-select:focus{border-color:var(--accent);}

  /* ═══════════════════════════════════════════════════════
     MOBILE RESPONSIVE  (<= 768px)
     ═══════════════════════════════════════════════════════ */

  /* Mobile bottom nav bar */
  .mobile-nav{
    display:none;position:fixed;bottom:0;left:0;right:0;z-index:150;
    background:var(--surface);border-top:1px solid var(--border);
    padding:6px 0 max(6px, env(safe-area-inset-bottom));
  }
  .mobile-nav-items{display:flex;justify-content:space-around;align-items:stretch;}
  .mob-nav-item{
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    gap:3px;padding:4px 6px;flex:1;cursor:pointer;
    color:var(--text3);font-size:10px;font-weight:500;
    border:none;background:none;transition:color .15s;
    -webkit-tap-highlight-color:transparent;
  }
  .mob-nav-item.active{color:var(--accent);}
  .mob-nav-item:active{opacity:.7;}
  .mob-nav-icon{font-size:19px;line-height:1;}
  .mob-nav-badge{
    position:absolute;top:-2px;right:-4px;
    background:var(--amber);color:#0f0f11;
    font-size:9px;font-weight:700;font-family:'DM Mono',monospace;
    padding:0 4px;border-radius:8px;line-height:16px;
  }
  .mob-nav-icon-wrap{position:relative;display:inline-block;}

  /* Mobile top header */
  .mobile-header{
    display:none;position:sticky;top:0;z-index:100;
    background:var(--surface);border-bottom:1px solid var(--border);
    padding:12px 16px 10px;
  }
  .mobile-header-row{display:flex;align-items:center;justify-content:space-between;}
  .mobile-logo{font-family:'DM Serif Display',serif;font-size:18px;color:var(--accent);}
  .mobile-page-label{font-size:13px;font-weight:600;color:var(--text);}
  .mobile-theme-btn{
    background:none;border:1px solid var(--border);border-radius:6px;
    color:var(--text2);font-size:11px;padding:4px 9px;cursor:pointer;
    display:flex;align-items:center;gap:5px;
  }

  /* Mobile account sub-tabs (scrollable horizontal strip) */
  .mobile-acct-strip{
    display:flex;overflow-x:auto;gap:6px;padding:10px 16px 0;
    scrollbar-width:none;-webkit-overflow-scrolling:touch;
  }
  .mobile-acct-strip::-webkit-scrollbar{display:none;}
  .mobile-acct-chip{
    flex-shrink:0;padding:5px 12px;border-radius:20px;
    border:1px solid var(--border);background:var(--surface2);
    font-size:12px;color:var(--text2);cursor:pointer;white-space:nowrap;
    -webkit-tap-highlight-color:transparent;
  }
  .mobile-acct-chip.active{
    background:rgba(var(--accent-r,200),var(--accent-g,241),var(--accent-b,53),.12);
    border-color:var(--accent);color:var(--accent);
  }

  @media (max-width: 768px) {
    /* Show/hide */
    .sidebar          { display:none !important; }
    .mobile-nav       { display:block; }
    .mobile-header    { display:block; }

    /* Layout */
    .app              { flex-direction:column; height:100%; min-height:100svh; }
    .main             { overflow-y:auto; padding-bottom:80px; }
    .page             { padding:16px 14px; max-width:100%; }

    /* Typography scale-down */
    .page-title       { font-size:20px; margin-bottom:2px; }
    .page-sub         { font-size:12px; margin-bottom:16px; }

    /* Stats: 2 columns on mobile */
    .stats-grid       { grid-template-columns:repeat(2,1fr) !important; gap:8px; margin-bottom:14px; }
    .stat-card        { padding:12px 13px; }
    .stat-value       { font-size:17px; }

    /* Cards */
    .card             { padding:14px; }

    /* Tables: horizontal scroll on mobile */
    .table-wrap       { border-radius:10px; }
    table             { font-size:12px; min-width:420px; }
    th,td             { padding:8px 10px; }

    /* Transaction rows: make category column wider, description truncated */
    td:nth-child(3)   { max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .combo-wrap       { width:150px; }
    .combo-input      { font-size:11px; }

    /* Tabs */
    .tabs             { width:100%; }
    .tab              { flex:1; justify-content:center; padding:6px 8px; font-size:12px; }

    /* Bank tabs: horizontal scroll */
    .bank-tabs        { flex-wrap:nowrap; overflow-x:auto; scrollbar-width:none; padding-bottom:1px; }
    .bank-tabs::-webkit-scrollbar { display:none; }
    .bank-tab         { flex-shrink:0; font-size:12px; padding:8px 12px; }

    /* Date range bar: stack vertically */
    .date-bar         { flex-direction:column; align-items:flex-start; gap:8px; padding:12px; }
    .date-bar input   { width:100% !important; }
    .date-sep         { display:none; }
    .date-preset      { font-size:11px; padding:3px 7px; }

    /* Financial statement */
    .stmt-row         { padding:7px 12px; flex-wrap:wrap; gap:4px; }
    .stmt-indent      { padding-left:22px; }
    .stmt-name        { font-size:12px; }
    .stmt-amount      { font-size:12px; }
    .stmt-group-header{ padding:8px 12px; font-size:10px; }
    .statement-header { padding:12px 14px; }

    /* Balance sheet 2-col → 1-col */
    div[style*="grid-template-columns: 1fr 1fr"] {
      display:block !important;
    }

    /* Bulk/match bars */
    .bulk-bar         { flex-wrap:wrap; gap:8px; }
    .bulk-accept-bar  { flex-wrap:wrap; }
    .match-banner     { flex-wrap:wrap; gap:6px; }

    /* Modals: full-screen bottom sheet */
    .modal-overlay    { align-items:flex-end; padding:0; }
    .modal            {
      width:100% !important; max-width:100% !important;
      border-radius:18px 18px 0 0 !important;
      padding:22px 18px max(18px,env(safe-area-inset-bottom)) !important;
      max-height:92svh;
    }
    .drill-modal      {
      width:100% !important; max-width:100% !important;
      border-radius:18px 18px 0 0 !important;
      max-height:94svh;
    }
    .mob-hide-on-mobile { display:none !important; }

    /* Upload zone */
    .upload-zone      { padding:28px 16px; }

    /* Toolbar wrap */
    .toolbar          { flex-wrap:wrap; }

    /* Journal entry table */
    .je-table         { min-width:340px; }
    .je-num-input     { width:80px; }

    /* Rules table */
    .rule-row         { flex-wrap:wrap; }

    /* Page-specific: import account list */
    .stats-grid[style*="repeat(3"] {
      grid-template-columns:repeat(2,1fr) !important;
    }

    /* Inline editor in table: tighter */
    .accept-btn       { padding:3px 7px; font-size:11px; }
    .cancel-btn       { padding:3px 6px; font-size:11px; }
  }

  @media (max-width:768px){ .mob-hide-on-mobile{ display:none !important; } }

  @media (max-width: 380px) {
    .page             { padding:12px 10px; }
    .combo-wrap       { width:130px; }
    table             { font-size:11px; }
    .stats-grid       { grid-template-columns:1fr 1fr !important; }
    .stat-value       { font-size:15px; }
  }

`;

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const ACCOUNT_TYPES = ["Asset","Liability","Equity","Revenue","Expense"];
const CF_SECTIONS   = ["Operating","Investing","Financing"];
const PAGE_SIZE     = 25;

const MOBILE_NAV = [
  { id:"import",   icon:"⬆", label:"Import"  },
  { id:"classify", icon:"⊞", label:"Txns"    },
  { id:"je",       icon:"✎", label:"Journal" },
  { id:"pnl",      icon:"↑", label:"P&L"     },
  { id:"balance",  icon:"⊖", label:"Balance" },
];

const DEFAULT_ACCOUNTS = [
  {id:"1001",name:"Checking Account",  type:"Asset",    cashFlow:"Operating", isDefault:true, isBankFeed:true},
  {id:"1002",name:"Savings Account",   type:"Asset",    cashFlow:"Investing",  isDefault:true, isBankFeed:true},
  {id:"2001",name:"Credit Card",       type:"Liability",cashFlow:"Financing",  isDefault:true, isBankFeed:true},
  {id:"3001",name:"Owner Equity",      type:"Equity",   cashFlow:null,         isDefault:true},
  {id:"4001",name:"Income / Salary",   type:"Revenue",  cashFlow:"Operating",  isDefault:true},
  {id:"5001",name:"Rent Expense",    type:"Expense",  cashFlow:"Operating",  isDefault:true},
  {id:"5002",name:"Groceries",         type:"Expense",  cashFlow:"Operating",  isDefault:true},
  {id:"5003",name:"Utilities",         type:"Expense",  cashFlow:"Operating",  isDefault:true},
  {id:"5004",name:"Transportation",    type:"Expense",  cashFlow:"Operating",  isDefault:true},
  {id:"5005",name:"Dining & Entertainment",type:"Expense",cashFlow:"Operating",isDefault:true},
  {id:"5006",name:"Health Expense",        type:"Expense",  cashFlow:"Operating",  isDefault:true},
  {id:"5007",name:"Supplies",     type:"Expense",  cashFlow:"Operating",  isDefault:true},
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function parseCSV(text, sourceId) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g,"").toLowerCase());
  return lines.slice(1).map((line,i) => {
    const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g) || line.split(",");
    const clean = cols.map(c => c.trim().replace(/^"|"$/g,""));
    const row = {};
    headers.forEach((h,idx) => { row[h] = clean[idx] || ""; });
    const date = row.date || row["transaction date"] || row["posting date"] || "";
    const desc = row.description || row.memo || row.name || row.payee || "";
    const amtRaw = row.amount || row.credit || row.debit || "0";
    const amount = parseFloat(amtRaw.replace(/[$,]/g,"")) || 0;
    return {id:`txn-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`, date, description:desc, amount, accountId:null, sourceId, rawRow:row};
  }).filter(r => r.description || r.amount);
}

function fmt(n) {
  const abs = Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,",");
  return n < 0 ? `-$${abs}` : `$${abs}`;
}

function applyRules(txn, rules) {
  for (const rule of rules) {
    const p = rule.pattern.toLowerCase(), d = txn.description.toLowerCase();
    if (rule.matchType==="contains"   && d.includes(p))   return rule.accountId;
    if (rule.matchType==="startsWith" && d.startsWith(p)) return rule.accountId;
    if (rule.matchType==="exact"      && d === p)          return rule.accountId;
  }
  return null;
}

function inRange(dateStr, start, end) {
  if (!dateStr) return true;
  if (!start && !end) return true;
  const d = dateStr.replace(/-/g,"");
  if (start && d < start.replace(/-/g,"")) return false;
  if (end   && d > end.replace(/-/g,""))   return false;
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// PERIOD BUCKETING (module scope — used by TrendReport)
// ─────────────────────────────────────────────────────────────────────────────
function getPeriodKey(dateStr, period) {
  if (!dateStr) return "Unknown";
  const [y,m,d] = dateStr.split("-").map(Number);
  if (period==="year")  return String(y);
  if (period==="month") return `${y}-${String(m).padStart(2,"0")}`;
  if (period==="week") {
    const dt=new Date(Date.UTC(y,m-1,d)), dow=dt.getUTCDay();
    const mon=new Date(dt); mon.setUTCDate(d-(dow===0?6:dow-1));
    return mon.toISOString().slice(0,10);
  }
  return dateStr;
}
function formatPeriodKey(key, period) {
  if (period==="year") return key;
  if (period==="month"){const [y,m]=key.split("-");return new Date(Number(y),Number(m)-1,1).toLocaleString("default",{month:"short",year:"2-digit"});}
  if (period==="week") return "Wk "+key.slice(5);
  return key;
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSFER MATCHING
// ─────────────────────────────────────────────────────────────────────────────
// Returns the date as ms since epoch for arithmetic
function dateMs(str) {
  if (!str) return 0;
  const [y,m,d] = str.split("-").map(Number);
  return Date.UTC(y, m-1, d);
}
const MATCH_WINDOW_DAYS = 4;

// Given a transaction (the "anchor") that has been classified to another
// bank/asset/liability account, find the best unmatched candidate in
// allTransactions that lives in that counterpart account (sourceId == categoryId
// of anchor) and has the opposite amount within ±4 days.
function findTransferMatch(anchor, allTransactions) {
  if (!anchor.accountId || !anchor.sourceId) return null;
  const counterpartSourceId = anchor.accountId; // the account it was classified TO
  const anchorMs = dateMs(anchor.date);
  const absAmt   = Math.abs(anchor.amount);

  return allTransactions.find(t =>
    t.id !== anchor.id &&
    t.sourceId === counterpartSourceId &&        // lives in the counterpart account
    !t.transferMatchId &&                        // not already matched
    Math.abs(Math.abs(t.amount) - absAmt) < 0.01 && // same absolute amount
    Math.abs(dateMs(t.date) - anchorMs) <= MATCH_WINDOW_DAYS * 86400000
  ) || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOUBLE-ENTRY ACCOUNTING
// ─────────────────────────────────────────────────────────────────────────────
// Normal balance by account type:
//   Debit-normal  (increases with a debit):  Asset, Expense
//   Credit-normal (increases with a credit): Liability, Equity, Revenue
const DEBIT_NORMAL = new Set(["Asset","Expense"]);

// Given a transaction from the bank feed of a source account, produce the
// two legs of the journal entry.
//
// Rules (matching real accounting software like QuickBooks):
//   Source account is an Asset (bank/checking/savings):
//     Money IN  (amount > 0): Debit source (asset up),  Credit category
//     Money OUT (amount < 0): Credit source (asset down), Debit category
//
//   Source account is a Liability (credit card):
//     Charge     (amount < 0): Credit source (liability up), Debit category
//     Payment    (amount > 0): Debit source (liability down), Credit category
//
// Returns { debitAcctId, creditAcctId, absAmount }
function journalEntry(txn, sourceAcct, categoryAcct) {
  const abs = Math.abs(txn.amount);
  const srcIsAsset = sourceAcct && DEBIT_NORMAL.has(sourceAcct.type);
  const moneyIn    = txn.amount > 0;

  if (srcIsAsset) {
    // Asset source (bank account)
    if (moneyIn) return { debitAcctId: sourceAcct.id, creditAcctId: categoryAcct?.id, absAmount: abs };
    else         return { debitAcctId: categoryAcct?.id, creditAcctId: sourceAcct.id, absAmount: abs };
  } else {
    // Liability source (credit card)
    if (moneyIn) return { debitAcctId: sourceAcct?.id, creditAcctId: categoryAcct?.id, absAmount: abs };
    else         return { debitAcctId: categoryAcct?.id, creditAcctId: sourceAcct?.id, absAmount: abs };
  }
}

// Net balance for an account from a list of journal entries.
// Debit-normal accounts: balance = sum of debits - sum of credits
// Credit-normal accounts: balance = sum of credits - sum of debits
function accountBalance(acctId, acctType, entries) {
  let debits = 0, credits = 0;
  entries.forEach(e => {
    if (e.debitAcctId  === acctId) debits  += e.absAmount;
    if (e.creditAcctId === acctId) credits += e.absAmount;
  });
  return DEBIT_NORMAL.has(acctType) ? debits - credits : credits - debits;
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT COMBOBOX  (used in ImportModal and other non-table contexts)
// For the transaction register, use InlineEditor instead.
// ─────────────────────────────────────────────────────────────────────────────
function AccountCombo({ value, accounts, onChange }) {
  const [query,   setQuery]   = useState("");
  const [open,    setOpen]    = useState(false);
  const [hiIdx,   setHiIdx]   = useState(0);
  const [dropPos, setDropPos] = useState({top:0,left:0,width:220});
  const wrapRef = useRef(), dropRef = useRef();
  const selected = accounts.find(a => a.id === value);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return q ? accounts.filter(a => a.name.toLowerCase().includes(q) || a.id.includes(q)) : accounts;
  }, [query, accounts]);

  const grouped = useMemo(() => {
    const m = {}; ACCOUNT_TYPES.forEach(t => { m[t]=[]; });
    filtered.forEach(a => { if(m[a.type]) m[a.type].push(a); });
    return m;
  }, [filtered]);

  const flat = useMemo(() => {
    const f=[]; ACCOUNT_TYPES.forEach(t => grouped[t].forEach(a => f.push(a))); return f;
  }, [grouped]);

  const openDrop = () => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    setDropPos({top:r.bottom+4,left:r.left,width:Math.max(r.width,230)});
    setQuery(""); setHiIdx(0); setOpen(true);
  };
  const pick = id => { onChange(id); setOpen(false); };
  const clear = e => { e.stopPropagation(); onChange(null); setOpen(false); };

  useEffect(() => {
    if (!open) return;
    const h = e => { if (!wrapRef.current?.contains(e.target) && !dropRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const onKey = e => {
    if (e.key==="ArrowDown"){ e.preventDefault(); setHiIdx(i=>Math.min(i+1,flat.length-1)); }
    if (e.key==="ArrowUp")  { e.preventDefault(); setHiIdx(i=>Math.max(i-1,0)); }
    if (e.key==="Enter" && flat[hiIdx]) pick(flat[hiIdx].id);
    if (e.key==="Escape") setOpen(false);
  };

  return (
    <div className="combo-wrap" ref={wrapRef}>
      <input className="combo-input"
        placeholder={selected ? selected.name : "Type to search…"}
        value={open ? query : (selected ? selected.name : "")}
        style={{color: open?"var(--text)":selected?"var(--text)":"var(--text3)"}}
        onFocus={openDrop} onChange={e=>{setQuery(e.target.value);setHiIdx(0);}} onKeyDown={onKey}/>
      {value && !open && <button className="combo-clear" onClick={clear}>×</button>}
      {open && (
        <div ref={dropRef} className="combo-dropdown"
          style={{position:"fixed",top:dropPos.top,left:dropPos.left,width:dropPos.width}}>
          {flat.length===0 && <div className="combo-option" style={{color:"var(--text3)",fontStyle:"italic"}}>No accounts found</div>}
          {ACCOUNT_TYPES.map(type => {
            const opts = grouped[type]; if(!opts.length) return null;
            return (<div key={type}>
              <div className="combo-group">{type}</div>
              {opts.map(a => { const gi=flat.indexOf(a); return (
                <div key={a.id} className={`combo-option${gi===hiIdx?" hi":""}`}
                  onMouseDown={()=>pick(a.id)} onMouseEnter={()=>setHiIdx(gi)}>
                  <span>{a.name}</span><span className="opt-id">{a.id}</span>
                </div>);})}
            </div>);
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INLINE ROW EDITOR — reliable click-to-select
// onBlur with 150ms delay lets option clicks register before close
// onMouseDown e.preventDefault() on options keeps input focused during click
// ─────────────────────────────────────────────────────────────────────────────
function InlineEditor({ txnId, currentValue, accounts, onAccept, onCancel, onEnterNext, hideAcceptButton }) {
  const [query,  setQuery]  = useState(() => accounts.find(a=>a.id===currentValue)?.name || "");
  const [hiIdx,  setHiIdx]  = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [dropPos,setDropPos]= useState({top:0,left:0,width:240});
  const inputRef = useRef();
  const wrapRef  = useRef();

  const filtered = useMemo(()=>{
    const q=query.toLowerCase();
    return q ? accounts.filter(a=>a.name.toLowerCase().includes(q)||a.id.includes(q)) : accounts;
  },[query,accounts]);

  const grouped = useMemo(()=>{
    const m={}; ACCOUNT_TYPES.forEach(t=>{m[t]=[];}); filtered.forEach(a=>{if(m[a.type])m[a.type].push(a);}); return m;
  },[filtered]);

  const flat = useMemo(()=>{const f=[];ACCOUNT_TYPES.forEach(t=>grouped[t].forEach(a=>f.push(a)));return f;},[grouped]);

  const ghost = useMemo(()=>{
    if (!query) return "";
    const q=query.toLowerCase();
    const m=accounts.find(a=>a.name.toLowerCase().startsWith(q));
    return m ? m.name.slice(query.length) : "";
  },[query,accounts]);

  const calcPos = () => {
    if (!wrapRef.current) return;
    const r=wrapRef.current.getBoundingClientRect();
    setDropPos({top:r.bottom+2,left:r.left,width:Math.max(r.width,240)});
  };

  useEffect(()=>{ calcPos(); inputRef.current?.focus(); inputRef.current?.select(); },[]);

  const commit = id => { setIsOpen(false); onAccept(id); if(onEnterNext) onEnterNext(); };

  const onKey = e => {
    if (e.key==="Tab") {
      e.preventDefault();
      const q=query.toLowerCase();
      const m=accounts.find(a=>a.name.toLowerCase().startsWith(q));
      if (m) { setQuery(m.name); setHiIdx(flat.indexOf(m)); }
      else if (flat[hiIdx]) setQuery(flat[hiIdx].name);
      return;
    }
    if (e.key==="ArrowDown"){ e.preventDefault(); setHiIdx(i=>Math.min(i+1,flat.length-1)); return; }
    if (e.key==="ArrowUp")  { e.preventDefault(); setHiIdx(i=>Math.max(i-1,0)); return; }
    if (e.key==="Enter") {
      e.preventDefault();
      const t=flat[hiIdx]||(query?accounts.find(a=>a.name.toLowerCase().includes(query.toLowerCase())):null);
      if(t) commit(t.id);
      return;
    }
    if (e.key==="Escape") onCancel();
  };

  return (
    <div ref={wrapRef} style={{display:"flex",alignItems:"center",gap:6,position:"relative"}}>
      <div style={{position:"relative",minWidth:180,flex:1}}>
        <input ref={inputRef} className="combo-input" value={query} placeholder="Type to search…"
          onChange={e=>{setQuery(e.target.value);setHiIdx(0);setIsOpen(true);calcPos();}}
          onKeyDown={onKey}
          onFocus={()=>{setIsOpen(true);calcPos();}}
          onBlur={()=>setTimeout(()=>setIsOpen(false),150)}
          style={{width:"100%"}} autoComplete="off"
        />
        {ghost&&query&&(
          <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",
            fontFamily:"DM Sans,sans-serif",fontSize:12,color:"var(--text3)",whiteSpace:"nowrap",overflow:"hidden"}}>
            <span style={{opacity:0}}>{query}</span>{ghost}
            <span style={{marginLeft:6,fontSize:10,color:"var(--text3)",fontFamily:"DM Mono,monospace"}}>[Tab]</span>
          </span>
        )}
      </div>
      {!hideAcceptButton&&query&&(
        <div style={{display:"flex",gap:4}}>
          <button className="accept-btn" onMouseDown={e=>e.preventDefault()}
            onClick={()=>{const t=flat[hiIdx]||accounts.find(a=>a.name.toLowerCase().includes(query.toLowerCase()));if(t)commit(t.id);}}>
            ✓ Accept
          </button>
          <button className="cancel-btn" onMouseDown={e=>e.preventDefault()} onClick={onCancel}>✕</button>
        </div>
      )}
      {isOpen&&flat.length>0&&(
        <div className="combo-dropdown" style={{position:"fixed",top:dropPos.top,left:dropPos.left,width:dropPos.width,zIndex:9999}}>
          {ACCOUNT_TYPES.map(type=>{
            const opts=grouped[type]; if(!opts.length) return null;
            return (
              <div key={type}>
                <div className="combo-group">{type}</div>
                {opts.map(a=>{
                  const gi=flat.indexOf(a);
                  return (
                    <div key={a.id} className={`combo-option${gi===hiIdx?" hi":""}`}
                      onMouseDown={e=>e.preventDefault()}
                      onClick={()=>commit(a.id)}
                      onMouseEnter={()=>setHiIdx(gi)}>
                      <span>{a.name}</span><span className="opt-id">{a.id}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DATE RANGE BAR
// ─────────────────────────────────────────────────────────────────────────────
function DateRangeBar({ startDate, endDate, onChange }) {
  const presets = [
    { label:"This Month",  fn:()=>{ const n=new Date(); return [fmtD(new Date(n.getFullYear(),n.getMonth(),1)),fmtD(new Date(n.getFullYear(),n.getMonth()+1,0))]; }},
    { label:"Last Month",  fn:()=>{ const n=new Date(); return [fmtD(new Date(n.getFullYear(),n.getMonth()-1,1)),fmtD(new Date(n.getFullYear(),n.getMonth(),0))]; }},
    { label:"This Year",   fn:()=>{ const y=new Date().getFullYear(); return [`${y}-01-01`,`${y}-12-31`]; }},
    { label:"Last Year",   fn:()=>{ const y=new Date().getFullYear()-1; return [`${y}-01-01`,`${y}-12-31`]; }},
    { label:"All Time",    fn:()=>[null,null]},
  ];
  function fmtD(d){ return d.toISOString().slice(0,10); }
  const active = presets.find(p=>{ const [s,e]=p.fn(); return s===startDate && e===endDate; });
  return (
    <div className="date-bar">
      <label>From</label>
      <input type="date" value={startDate||""} onChange={e=>onChange(e.target.value||null,endDate)} style={{width:140}}/>
      <span className="date-sep">→</span>
      <input type="date" value={endDate||""} onChange={e=>onChange(startDate,e.target.value||null)} style={{width:140}}/>
      <div style={{marginLeft:6,display:"flex",gap:5,flexWrap:"wrap"}}>
        {presets.map(p=>(
          <span key={p.label} className={`date-preset${active?.label===p.label?" on":""}`}
            onClick={()=>{ const [s,e]=p.fn(); onChange(s,e); }}>{p.label}</span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL ENTRY EDIT POPUP (opened from drill-down)
// ─────────────────────────────────────────────────────────────────────────────
function JEEditModal({ je, accounts, onSave, onDelete, onClose }) {
  const mkLine=()=>({id:Math.random().toString(36).slice(2),accountId:"",debit:"",credit:""});
  const [date,setDate]=useState(je.date||"");
  const [memo,setMemo]=useState(je.memo||"");
  const [lines,setLines]=useState(je.lines.map(l=>({...l,id:l.id||Math.random().toString(36).slice(2)})));
  const [confirmDel,setConfirmDel]=useState(false);
  const setLine=(id,f,v)=>setLines(prev=>prev.map(l=>l.id===id?{...l,[f]:v}:l));
  const addLine=()=>setLines(prev=>[...prev,mkLine()]);
  const dropLine=id=>setLines(prev=>prev.length>2?prev.filter(l=>l.id!==id):prev);
  const totalDr=lines.reduce((s,l)=>s+(parseFloat(l.debit)||0),0);
  const totalCr=lines.reduce((s,l)=>s+(parseFloat(l.credit)||0),0);
  const balanced=Math.abs(totalDr-totalCr)<0.005&&totalDr>0;
  const save=()=>{
    if(!balanced) return;
    const valid=lines.filter(l=>l.accountId&&(parseFloat(l.debit)||0)+(parseFloat(l.credit)||0)>0);
    if(valid.length<2) return;
    onSave({...je,date,memo,lines:valid}); onClose();
  };
  const thS={padding:"8px 12px",background:"var(--surface2)",borderBottom:"1px solid var(--border)",
    fontSize:11,color:"var(--text3)",fontFamily:"DM Mono,monospace",textTransform:"uppercase",letterSpacing:"1px"};
  return (
    <div className="modal-overlay" style={{zIndex:10000}} onClick={onClose}>
      <div className="modal" style={{width:580,maxWidth:"96vw"}} onClick={e=>e.stopPropagation()}>
        <div className="modal-title">Edit Journal Entry</div>
        <div style={{display:"flex",gap:12,marginBottom:14,flexWrap:"wrap"}}>
          <div style={{flex:"0 0 150px"}}>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:4,fontFamily:"DM Mono,monospace",textTransform:"uppercase",letterSpacing:"1px"}}>Date</div>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:150}}/>
          </div>
          <div style={{flex:1,minWidth:180}}>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:4,fontFamily:"DM Mono,monospace",textTransform:"uppercase",letterSpacing:"1px"}}>Memo</div>
            <input type="text" value={memo} onChange={e=>setMemo(e.target.value)} placeholder="Description…"
              style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:"var(--radius)",
                padding:"7px 11px",fontFamily:"DM Sans,sans-serif",fontSize:13,color:"var(--text)",outline:"none",width:"100%"}}/>
          </div>
        </div>
        <table className="je-table" style={{marginBottom:10}}>
          <thead><tr>
            <th style={{...thS,width:"44%",textAlign:"left"}}>Account</th>
            <th style={{...thS,width:"22%",textAlign:"right"}}>Debit</th>
            <th style={{...thS,width:"22%",textAlign:"right"}}>Credit</th>
            <th style={{...thS,width:"12%"}}></th>
          </tr></thead>
          <tbody>
            {lines.map((line,idx)=>{
              const isLast=idx===lines.length-1;
              return (
                <tr key={line.id}>
                  <td><AccountCombo value={line.accountId||null} accounts={accounts}
                    onChange={id=>setLine(line.id,"accountId",id||"")}/></td>
                  <td style={{textAlign:"right"}}>
                    <input className="je-num-input" type="number" min="0" step="0.01" value={line.debit} placeholder="0.00"
                      onChange={e=>{setLine(line.id,"debit",e.target.value);if(e.target.value)setLine(line.id,"credit","");}}
                      onKeyDown={e=>{if(e.key==="Tab"&&isLast&&!e.shiftKey){e.preventDefault();addLine();}}}/>
                  </td>
                  <td style={{textAlign:"right"}}>
                    <input className="je-num-input" type="number" min="0" step="0.01" value={line.credit} placeholder="0.00"
                      onChange={e=>{setLine(line.id,"credit",e.target.value);if(e.target.value)setLine(line.id,"debit","");}}
                      onKeyDown={e=>{if(e.key==="Tab"&&isLast&&!e.shiftKey){e.preventDefault();addLine();}}}/>
                  </td>
                  <td style={{textAlign:"center"}}>
                    <button onClick={()=>dropLine(line.id)}
                      style={{background:"none",border:"none",color:"var(--text3)",cursor:"pointer",fontSize:16,padding:"2px 5px"}}>×</button>
                  </td>
                </tr>
              );
            })}
            <tr className="je-total">
              <td><button className="btn btn-ghost btn-sm" style={{fontSize:11}} onClick={addLine}>+ Add Line</button></td>
              <td style={{textAlign:"right",color:totalDr>0?"var(--blue)":"var(--text3)"}}>{totalDr.toFixed(2)}</td>
              <td style={{textAlign:"right",color:totalCr>0?"var(--purple)":"var(--text3)"}}>{totalCr.toFixed(2)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
        {(totalDr>0||totalCr>0)&&(
          <div style={{marginBottom:12}}>
            {balanced
              ? <span className="je-balanced">✓ Balanced</span>
              : <span className="je-unbalanced">✗ Out of balance by {fmt(Math.abs(totalDr-totalCr))}</span>}
          </div>
        )}
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {confirmDel
            ? <>
                <span style={{fontSize:12,color:"var(--text2)"}}>Delete this entry?</span>
                <button className="del-btn" style={{color:"var(--red)",borderColor:"rgba(255,82,82,.4)"}}
                  onClick={()=>{onDelete(je.id);onClose();}}>Yes, delete</button>
                <button className="cancel-btn" onClick={()=>setConfirmDel(false)}>No</button>
              </>
            : <button className="del-btn" style={{color:"var(--red)",borderColor:"rgba(255,82,82,.3)"}}
                onClick={()=>setConfirmDel(true)}>Delete Entry</button>
          }
          <div style={{marginLeft:"auto",display:"flex",gap:8}}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={!balanced} onClick={save}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DRILL-DOWN MODAL  (click an account line to see transactions)
// ─────────────────────────────────────────────────────────────────────────────
function DrillRowEditable({ t, isDebit, isCredit, abs, counterpart, running, isExcluded, onUpdate, onDelete, onExclude, onEditJE }) {
  const [editing, setEditing] = useState(false);
  const [editDate, setEditDate] = useState(t.date||"");
  const [editDesc, setEditDesc] = useState(t.description||"");
  const [editAmt,  setEditAmt]  = useState(String(Math.abs(t.amount)||""));

  const save = () => {
    if (onUpdate) {
      const sign = t.amount < 0 ? -1 : 1;
      onUpdate(t.id, { date:editDate, description:editDesc, amount:sign*Math.abs(parseFloat(editAmt)||0) });
    }
    setEditing(false);
  };

  const p = {padding:"7px 11px",borderBottom:"1px solid var(--border)"};
  if (editing) return (
    <tr style={{background:"rgba(200,241,53,.05)"}}>
      <td style={p}><input className="drill-edit-input" type="date" value={editDate} onChange={e=>setEditDate(e.target.value)} style={{width:130}}/></td>
      <td style={p} colSpan={2}><input className="drill-edit-input" type="text" value={editDesc} onChange={e=>setEditDesc(e.target.value)} style={{width:"100%",minWidth:160}}/></td>
      <td style={{...p,textAlign:"right"}} colSpan={2}><input className="drill-edit-input" type="number" value={editAmt} onChange={e=>setEditAmt(e.target.value)} style={{width:90,textAlign:"right"}}/></td>
      <td style={p}></td>
      <td style={{...p,whiteSpace:"nowrap"}}>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          <button className="accept-btn" onClick={save}>✓</button>
          <button className="cancel-btn" onClick={()=>setEditing(false)}>✕</button>
          {onDelete&&<button className="drill-edit-btn" style={{color:"var(--red)"}} onClick={()=>onDelete(t.id)}>Delete</button>}
        </div>
      </td>
    </tr>
  );

  return (
    <tr style={{borderBottom:"1px solid var(--border)",opacity:isExcluded?.85:1,background:isExcluded?"rgba(255,82,82,.03)":""}}>
      <td style={{...p,fontSize:12,color:"var(--text3)",fontFamily:"DM Mono,monospace",whiteSpace:"nowrap"}}>{t.date}</td>
      <td style={{...p,fontSize:13,color:"var(--text)",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.description}</td>
      <td className="mob-hide-on-mobile" style={{...p,fontSize:12,color:"var(--text2)"}}>{counterpart?.name||"—"}</td>
      <td style={{...p,textAlign:"right",fontFamily:"DM Mono,monospace",fontSize:13,color:isDebit?"var(--blue)":"var(--text3)"}}>{isDebit?fmt(abs):""}</td>
      <td style={{...p,textAlign:"right",fontFamily:"DM Mono,monospace",fontSize:13,color:isCredit?"var(--purple)":"var(--text3)"}}>{isCredit?fmt(abs):""}</td>
      <td style={{...p,textAlign:"right",fontFamily:"DM Mono,monospace",fontSize:13,color:running>=0?"var(--green)":"var(--red)"}}>{fmt(running)}</td>
      <td style={{...p,whiteSpace:"nowrap"}}>
        {t.isJE
          ? <button className="drill-je-btn" onClick={()=>onEditJE&&onEditJE(t.jeId)}>✎ JE</button>
          : onUpdate&&<button className="drill-edit-btn" onClick={()=>setEditing(true)}>Edit</button>
        }
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function DrillModal({ account, transactions, manualJEs, allAccounts, startDate, endDate, onClose, onUpdate, onDelete, onExclude, excludedTxns, onEditJE }) {
  const acctById = Object.fromEntries(allAccounts.map(a=>[a.id,a]));
  const [editingJE, setEditingJE] = useState(null);

  // Regular bank transactions for this account
  const txns = transactions.filter(t =>
    (t.accountId === account.id || t.sourceId === account.id) &&
    inRange(t.date, startDate, endDate)
  );

  // Synthetic transactions from manual journal entries
  // Each JE line that touches this account becomes a pseudo-transaction
  const jeTxns = (manualJEs||[])
    .filter(je=>inRange(je.date,startDate,endDate))
    .flatMap(je=>
      je.lines
        .filter(l=>l.accountId===account.id)
        .map(l=>{
          const dr=parseFloat(l.debit)||0, cr=parseFloat(l.credit)||0;
          // For drill display: debit line = money in for debit-normal accounts
          const amount = dr>0 ? dr : -cr;
          return {
            id: `${je.id}-${l.id||Math.random()}`,
            date: je.date,
            description: je.memo || "Journal Entry",
            amount,
            accountId: account.id,
            sourceId:  null,
            isJE: true,
            jeId: je.id,
          };
        })
    );

  const allTxns = [...txns, ...jeTxns].sort((a,b)=>a.date>b.date?1:a.date<b.date?-1:0);

  // For each txn compute the journal entry and the debit/credit impact on this account
  const rows = allTxns.map(t => {
    if (t.isJE) {
      // Journal entry line — amount sign tells us debit vs credit
      const isDebit  = t.amount > 0;
      const isCredit = t.amount < 0;
      const abs = Math.abs(t.amount);
      return { t, isDebit, isCredit, abs, counterpart: null };
    }
    const srcAcct = acctById[t.sourceId];
    const catAcct = acctById[t.accountId];
    const entry   = (srcAcct && catAcct) ? journalEntry(t, srcAcct, catAcct) : null;
    const isDebit  = entry?.debitAcctId  === account.id;
    const isCredit = entry?.creditAcctId === account.id;
    const abs      = entry ? entry.absAmount : Math.abs(t.amount);
    const counterpart = entry
      ? acctById[isDebit ? entry.creditAcctId : entry.debitAcctId]
      : null;
    return { t, isDebit, isCredit, abs, counterpart };
  });

  // Running balance
  let running = 0;
  const rowsWithBalance = rows.map(r => {
    if (DEBIT_NORMAL.has(account.type)) {
      running += r.isDebit ? r.abs : -r.abs;
    } else {
      running += r.isCredit ? r.abs : -r.abs;
    }
    return { ...r, running };
  });

  const totalDebits  = rows.filter(r=>r.isDebit).reduce((s,r)=>s+r.abs,0);
  const totalCredits = rows.filter(r=>r.isCredit).reduce((s,r)=>s+r.abs,0);
  const netBalance   = DEBIT_NORMAL.has(account.type) ? totalDebits - totalCredits : totalCredits - totalDebits;

  const th = (label, align="left") => (
    <th style={{padding:"9px 14px",background:"var(--surface2)",borderBottom:"1px solid var(--border)",
      fontSize:11,color:"var(--text3)",fontFamily:"DM Mono,monospace",textTransform:"uppercase",textAlign:align}}>{label}</th>
  );

  const handleEditJE = (jeId) => {
    const je = (manualJEs||[]).find(e=>e.id===jeId);
    if (je) setEditingJE(je);
  };

  return (
    <React.Fragment>
      {editingJE && (
        <JEEditModal
          je={editingJE}
          accounts={allAccounts}
          onSave={je=>{ if(onEditJE) onEditJE(je); setEditingJE(null); }}
          onDelete={id=>{ if(onEditJE) onEditJE({_delete:true,id}); setEditingJE(null); }}
          onClose={()=>setEditingJE(null)}
        />
      )}
      <div className="modal-overlay" onClick={onClose}>
      <div className="drill-modal" onClick={e=>e.stopPropagation()}>
        <div className="drill-header">
          <div>
            <div className="drill-title">{account.name}</div>
            <div className="drill-sub">
              {rows.length} entries · {startDate||"all"} → {endDate||"present"} ·&nbsp;
              <span style={{color:"var(--text3)"}}>normal balance: </span>
              <span style={{color:DEBIT_NORMAL.has(account.type)?"var(--blue)":"var(--purple)"}}>
                {DEBIT_NORMAL.has(account.type)?"Debit":"Credit"}
              </span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
        </div>
        <div className="drill-body">
          {rows.length===0
            ? <div className="empty"><div className="empty-icon">🔍</div><div className="empty-title">No entries in this range</div></div>
            : <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>
                  {th("Date")}
                  {th("Description")}
                  <th className="mob-hide-on-mobile" style={{padding:"9px 14px",background:"var(--surface2)",borderBottom:"1px solid var(--border)",fontSize:11,color:"var(--text3)",fontFamily:"DM Mono,monospace",textTransform:"uppercase"}}>Counterpart</th>
                  {th("Debit","right")}
                  {th("Credit","right")}
                  {th("Balance","right")}
                  {th("","right")}
                </tr></thead>
                <tbody>
                  {rowsWithBalance.map(({t, isDebit, isCredit, abs, counterpart, running})=>(
                    <DrillRowEditable key={t.id}
                      t={t} isDebit={isDebit} isCredit={isCredit} abs={abs}
                      counterpart={counterpart} running={running}
                      isExcluded={excludedTxns?.has(t.id)}
                      onUpdate={onUpdate} onDelete={onDelete} onExclude={onExclude}
                      onEditJE={handleEditJE}
                    />
                  ))}
                </tbody>
              </table>
          }
        </div>
        <div className="drill-total">
          <span style={{fontSize:12,color:"var(--text3)",fontFamily:"DM Mono,monospace",display:"flex",gap:24}}>
            <span>Debits: <span style={{color:"var(--blue)"}}>{fmt(totalDebits)}</span></span>
            <span>Credits: <span style={{color:"var(--purple)"}}>{fmt(totalCredits)}</span></span>
          </span>
          <span style={{fontSize:13,color:"var(--text2)",fontWeight:600}}>
            Net Balance: <span className={`amount ${netBalance>=0?"pos":"neg"}`} style={{fontSize:14,marginLeft:6}}>{fmt(netBalance)}</span>
          </span>
        </div>
      </div>
    </div>
    </React.Fragment>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT MODAL
// ─────────────────────────────────────────────────────────────────────────────
function AccountModal({ account, accounts, onSave, onClose }) {
  const genId = (n) => (n||"").toLowerCase().replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"")||("acct-"+Date.now());
  const [form, setForm] = useState(account||{id:"",name:"",type:"Expense",cashFlow:"Operating",isBankFeed:false,parentId:"",inactive:false});
  const s = (k,v) => setForm(p=>({...p,[k]:v}));
  const showFeed = form.type==="Asset" || form.type==="Liability";
  // Only allow parents of the same type, excluding self and descendants (to avoid cycles)
  const getDescendants = (id, accts) => {
    const children = accts.filter(a => a.parentId === id);
    return children.flatMap(c => [c.id, ...getDescendants(c.id, accts)]);
  };
  const excluded = new Set([form.id, ...getDescendants(form.id, accounts||[])]);
  const parentCandidates = (accounts||[]).filter(a => a.type === form.type && !excluded.has(a.id));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-title">{account?"Edit Account":"New Account"}</div>
        <div className="field"><label>Account Name</label>
          <input type="text" value={form.name} onChange={e=>{ s("name",e.target.value); if(!account) s("id",genId(e.target.value)); }} placeholder="e.g. Insurance"/>
        </div>
        <div className="field"><label>Type</label>
          <select value={form.type} onChange={e=>{ s("type",e.target.value); s("parentId",""); if(e.target.value!=="Asset"&&e.target.value!=="Liability") s("isBankFeed",false); }} style={{width:"100%",padding:"7px 11px"}}>
            {ACCOUNT_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="field"><label>Parent Account <span style={{fontSize:11,color:"var(--text3)"}}>— optional, creates a sub-account</span></label>
          <select value={form.parentId||""} onChange={e=>s("parentId",e.target.value||"")} style={{width:"100%",padding:"7px 11px"}}>
            <option value="">— None (top-level account) —</option>
            {parentCandidates.map(a=>{
              // Build path label e.g. "Parent > Child"
              const path = [];
              let cur = a;
              while(cur){ path.unshift(cur.name); cur = (accounts||[]).find(x=>x.id===cur.parentId); }
              return <option key={a.id} value={a.id}>{path.join(" > ")}</option>;
            })}
          </select>
        </div>
        <div className="field"><label>Cash Flow Category</label>
          <select value={form.cashFlow||""} onChange={e=>s("cashFlow",e.target.value||null)} style={{width:"100%",padding:"7px 11px"}}>
            <option value="">-- None --</option>
            {CF_SECTIONS.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        {showFeed && (
          <div className="field">
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",userSelect:"none"}}>
              <input type="checkbox" checked={!!form.isBankFeed} onChange={e=>s("isBankFeed",e.target.checked)}
                style={{width:15,height:15,accentColor:"var(--accent)",cursor:"pointer"}}/>
              <span>Bank feed account</span>
              <span style={{fontSize:11,color:"var(--text3)"}}>— shows in transaction register even with no imports</span>
            </label>
          </div>
        )}
        <div className="field">
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",userSelect:"none"}}>
            <input type="checkbox" checked={!!form.inactive} onChange={e=>s("inactive",e.target.checked)}
              style={{width:15,height:15,accentColor:"var(--accent)",cursor:"pointer"}}/>
            <span>Mark as inactive</span>
            <span style={{fontSize:11,color:"var(--text3)"}}>— hides from dropdowns and reports</span>
          </label>
        </div>
        <div className="flex gap-8 mt-14">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary ml-auto" onClick={()=>form.name&&onSave({...form,id:form.id||genId(form.name)})}>Save Account</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RULE MODAL
// ─────────────────────────────────────────────────────────────────────────────
function RuleModal({ rule, accounts, onSave, onClose }) {
  const [form, setForm] = useState(rule||{id:Date.now(),pattern:"",matchType:"contains",accountId:""});
  const s = (k,v) => setForm(p=>({...p,[k]:v}));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-title">{rule?"Edit Rule":"New Rule"}</div>
        <div className="field"><label>Description Pattern</label>
          <input type="text" value={form.pattern} onChange={e=>s("pattern",e.target.value)} placeholder="e.g. Netflix, Paycheck…"/>
        </div>
        <div className="field"><label>Match Type</label>
          <select value={form.matchType} onChange={e=>s("matchType",e.target.value)} style={{width:"100%",padding:"7px 11px"}}>
            <option value="contains">Contains</option>
            <option value="startsWith">Starts with</option>
            <option value="exact">Exact match</option>
          </select>
        </div>
        <div className="field"><label>Assign to Account</label>
          <select value={form.accountId} onChange={e=>s("accountId",e.target.value)} style={{width:"100%",padding:"7px 11px"}}>
            <option value="">-- Select account --</option>
            {ACCOUNT_TYPES.map(type=>(
              <optgroup key={type} label={type}>
                {accounts.filter(a=>a.type===type).map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="flex gap-8 mt-14">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary ml-auto" disabled={!form.pattern||!form.accountId} onClick={()=>onSave(form)}>Save Rule</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BULK CLASSIFY MODAL
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// PRE-CATEGORIZED IMPORT MODAL
// ─────────────────────────────────────────────────────────────────────────────
function PreCatImportModal({ accounts, onImport, onClose }) {
  const bankAccts = accounts.filter(a=>a.type==="Asset"||a.type==="Liability");
  const [step,     setStep]     = useState("upload");   // "upload" | "map" | "confirm"
  const [file,     setFile]     = useState(null);
  const [rows,     setRows]     = useState([]);          // parsed rows
  const [sourceId, setSourceId] = useState("");
  const [mapping,  setMapping]  = useState({});          // catName → accountId
  const [error,    setError]    = useState("");
  const fileRef = useRef();

  const parseCSV = (text) => {
    const lines = text.trim().split("\n").filter(l=>l.trim());
    if (lines.length < 2) { setError("CSV must have a header row and at least one data row."); return; }
    const headers = lines[0].split(",").map(h=>h.trim().toLowerCase().replace(/['"]/g,""));
    const idx = (names) => { for (const n of names) { const i=headers.indexOf(n); if(i>=0) return i; } return -1; };
    const dateIdx = idx(["date","txn date","transaction date"]);
    const descIdx = idx(["description","desc","name","merchant","memo","payee"]);
    const amtIdx  = idx(["amount","amt","value","debit"]);
    const catIdx  = idx(["category","account","cat","classification"]);
    if (dateIdx<0||descIdx<0||amtIdx<0) {
      setError("Could not find date, description, or amount columns."); return;
    }
    const parsed = [];
    for (let i=1; i<lines.length; i++) {
      const parts = lines[i].match(/(".*?"|[^,]+)/g) || lines[i].split(",");
      const clean = parts.map(p=>p.replace(/^"|"$/g,"").trim());
      const date    = clean[dateIdx]||"";
      const desc    = clean[descIdx]||"";
      const rawAmt  = (clean[amtIdx]||"0").replace(/[$, ]/g,"");
      const amount  = parseFloat(rawAmt)||0;
      const catName = catIdx>=0 ? (clean[catIdx]||"").trim() : "";
      let normDate = date;
      if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(date)) {
        const [m,d,y] = date.split("/");
        normDate = `${y.length===2?"20"+y:y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`;
      }
      parsed.push({ date:normDate, desc, amount, catName });
    }
    // Auto-match exact names
    const initMapping = {};
    const uniqueCats = [...new Set(parsed.map(r=>r.catName).filter(Boolean))];
    uniqueCats.forEach(cat => {
      const match = accounts.find(a =>
        a.name.toLowerCase()===cat.toLowerCase() ||
        a.id.toLowerCase()===cat.toLowerCase()
      );
      initMapping[cat] = match?.id || "";
    });
    setRows(parsed);
    setMapping(initMapping);
    setError("");
  };

  const handleFile = (f) => {
    setFile(f); setRows([]); setError("");
    const reader = new FileReader();
    reader.onload = e => parseCSV(e.target.result);
    reader.readAsText(f);
  };

  const uniqueCats = [...new Set(rows.map(r=>r.catName).filter(Boolean))];
  const unmappedCats = uniqueCats.filter(c=>!mapping[c]);
  const mappedRows = rows.filter(r=>r.catName && mapping[r.catName]);
  const unmappedRows = rows.filter(r=>!r.catName || !mapping[r.catName]);

  const doImport = () => {
    if (!sourceId) { setError("Please select a bank account first."); return; }
    const toImport = mappedRows.map(r=>({
      id:          `precat-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      date:        r.date,
      description: r.desc,
      amount:      r.amount,
      sourceId,
      accountId:   mapping[r.catName],
    }));
    onImport(toImport);
    onClose();
  };

  // ── STEP: UPLOAD ──
  if (step==="upload") return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{width:560,maxWidth:"96vw"}} onClick={e=>e.stopPropagation()}>
        <div className="modal-title">Import Pre-Categorized Transactions</div>
        <p style={{fontSize:12,color:"var(--text3)",marginBottom:14}}>
          Upload a CSV with a category column. You'll map any unrecognized categories on the next screen.
        </p>
        <div style={{background:"var(--surface2)",borderRadius:"var(--radius)",padding:"10px 14px",marginBottom:14,fontFamily:"DM Mono,monospace",fontSize:11,color:"var(--text3)"}}>
          Expected: <span style={{color:"var(--accent)"}}>date, description, amount, category</span><br/>
          Example:&nbsp;&nbsp;2024-01-15, Fuel Stop, -45.00, Fuel Expense
        </div>
        <div className="field" style={{marginBottom:12}}>
          <label>Bank / Credit Card Account (source)</label>
          <select value={sourceId} onChange={e=>setSourceId(e.target.value)} style={{width:"100%",padding:"7px 11px"}}>
            <option value="">— Select account —</option>
            {bankAccts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="upload-zone" style={{marginBottom:12,cursor:"pointer"}}
          onClick={()=>fileRef.current?.click()}
          onDragOver={e=>e.preventDefault()}
          onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)handleFile(f);}}>
          <div className="upload-icon">📂</div>
          <div className="upload-text">{file?file.name:"Click or drag a CSV file here"}</div>
          <input ref={fileRef} type="file" accept=".csv" style={{display:"none"}}
            onChange={e=>e.target.files[0]&&handleFile(e.target.files[0])}/>
        </div>
        {error&&<div style={{color:"var(--red)",fontSize:12,marginBottom:10}}>{error}</div>}
        {rows.length>0&&(
          <div style={{fontSize:12,color:"var(--text2)",marginBottom:10,display:"flex",gap:16}}>
            <span style={{color:"var(--green)"}}>✓ {rows.length} rows parsed</span>
            <span style={{color:unmappedCats.length>0?"var(--amber)":"var(--green)"}}>{uniqueCats.length} unique categories</span>
          </div>
        )}
        <div className="flex gap-8 mt-14">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary ml-auto"
            disabled={!file||rows.length===0||!sourceId}
            onClick={()=>setStep("map")}>
            Next: Map Categories →
          </button>
        </div>
      </div>
    </div>
  );

  // ── STEP: MAP CATEGORIES ──
  if (step==="map") return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{width:640,maxWidth:"96vw",maxHeight:"92vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div className="modal-title">Map Categories to Accounts</div>
        <p style={{fontSize:12,color:"var(--text3)",marginBottom:14}}>
          Match each category from your CSV to an account in your Chart of Accounts.
          Auto-matched categories are pre-filled — review and adjust as needed.
        </p>
        <div style={{border:"1px solid var(--border)",borderRadius:"var(--radius)",overflow:"hidden",marginBottom:16}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{background:"var(--surface2)"}}>
                <th style={{padding:"8px 14px",textAlign:"left",fontSize:11,color:"var(--text3)",fontFamily:"DM Mono,monospace",textTransform:"uppercase",letterSpacing:"1px",fontWeight:600}}>
                  Category in CSV
                </th>
                <th style={{padding:"8px 14px",textAlign:"left",fontSize:11,color:"var(--text3)",fontFamily:"DM Mono,monospace",textTransform:"uppercase",letterSpacing:"1px",fontWeight:600}}>
                  Rows
                </th>
                <th style={{padding:"8px 14px",textAlign:"left",fontSize:11,color:"var(--text3)",fontFamily:"DM Mono,monospace",textTransform:"uppercase",letterSpacing:"1px",fontWeight:600}}>
                  Map to Account
                </th>
              </tr>
            </thead>
            <tbody>
              {uniqueCats.map((cat,i)=>{
                const count = rows.filter(r=>r.catName===cat).length;
                const mapped = !!mapping[cat];
                return (
                  <tr key={cat} style={{borderTop:"1px solid var(--border)",background:i%2===0?"":"var(--surface)"}}>
                    <td style={{padding:"8px 14px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{width:8,height:8,borderRadius:"50%",background:mapped?"var(--green)":"var(--amber)",flexShrink:0,display:"inline-block"}}/>
                        <span style={{color:"var(--text)",fontWeight:500}}>{cat}</span>
                      </div>
                    </td>
                    <td style={{padding:"8px 14px",color:"var(--text3)",fontFamily:"DM Mono,monospace",fontSize:12}}>{count}</td>
                    <td style={{padding:"8px 14px"}}>
                      <select
                        value={mapping[cat]||""}
                        onChange={e=>setMapping(p=>({...p,[cat]:e.target.value}))}
                        style={{width:"100%",padding:"5px 9px",background:"var(--surface2)",color:"var(--text)",border:"1px solid var(--border)",borderRadius:6,fontSize:12}}>
                        <option value="">— Skip these transactions —</option>
                        {ACCOUNT_TYPES.map(type=>(
                          <optgroup key={type} label={type}>
                            {accounts.filter(a=>a.type===type).map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
                          </optgroup>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{fontSize:12,color:"var(--text2)",marginBottom:14,display:"flex",gap:16,flexWrap:"wrap"}}>
          <span style={{color:"var(--green)"}}>✓ {mappedRows.length} transactions will be imported</span>
          {unmappedRows.length>0&&<span style={{color:"var(--amber)"}}>⚠ {unmappedRows.length} will be skipped (unmapped)</span>}
        </div>
        <div className="flex gap-8 mt-14">
          <button className="btn btn-ghost" onClick={()=>setStep("upload")}>← Back</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary ml-auto"
            disabled={mappedRows.length===0}
            onClick={doImport}>
            Import {mappedRows.length} Transaction{mappedRows.length!==1?"s":""}
          </button>
        </div>
      </div>
    </div>
  );

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SPLIT MODAL — split a transaction across multiple categories
// ─────────────────────────────────────────────────────────────────────────────
function SplitModal({ transaction, accounts, onSave, onClose }) {
  const total = Math.abs(transaction.amount);
  const mkSplit = () => ({ id: Math.random().toString(36).slice(2), accountId: "", amount: "" });
  const [splits, setSplits] = useState(() => {
    if (transaction.splits && transaction.splits.length > 0) {
      return transaction.splits.map(s => ({ ...s, id: s.id || Math.random().toString(36).slice(2) }));
    }
    return [
      { id: Math.random().toString(36).slice(2), accountId: transaction.accountId || "", amount: fmt(total).replace(/[^0-9.]/g,"") },
      mkSplit(),
    ];
  });

  const setField = (id, field, val) => setSplits(p => p.map(s => s.id===id ? {...s,[field]:val} : s));
  const addLine  = () => setSplits(p => [...p, mkSplit()]);
  const dropLine = id => setSplits(p => p.length > 1 ? p.filter(s => s.id!==id) : p);

  const splitTotal = splits.reduce((s,l) => s + (parseFloat(l.amount)||0), 0);
  const remaining  = Math.round((total - splitTotal) * 100) / 100;
  const balanced   = Math.abs(remaining) < 0.005;

  const save = () => {
    const valid = splits.filter(s => s.accountId && parseFloat(s.amount) > 0);
    if (!balanced || valid.length === 0) return;
    onSave(transaction.id, valid);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{width:560,maxWidth:"96vw"}} onClick={e=>e.stopPropagation()}>
        <div className="modal-title">Split Transaction</div>
        <div style={{fontSize:12,color:"var(--text2)",marginBottom:14}}>
          <b>{transaction.description}</b> &nbsp;·&nbsp;
          <span style={{fontFamily:"DM Mono,monospace"}}>{fmt(transaction.amount)}</span>
          &nbsp;on {transaction.date}
        </div>
        <table style={{width:"100%",borderCollapse:"collapse",marginBottom:12}}>
          <thead>
            <tr style={{background:"var(--surface2)"}}>
              <th style={{padding:"7px 10px",textAlign:"left",fontSize:11,color:"var(--text3)",fontFamily:"DM Mono,monospace",textTransform:"uppercase"}}>Account</th>
              <th style={{padding:"7px 10px",textAlign:"right",fontSize:11,color:"var(--text3)",fontFamily:"DM Mono,monospace",textTransform:"uppercase",width:110}}>Amount</th>
              <th style={{width:34}}></th>
            </tr>
          </thead>
          <tbody>
            {splits.map(s => (
              <tr key={s.id} style={{borderBottom:"1px solid var(--border)"}}>
                <td style={{padding:"6px 8px"}}>
                  <AccountCombo value={s.accountId||null} accounts={accounts} onChange={id=>setField(s.id,"accountId",id||"")}/>
                </td>
                <td style={{padding:"6px 8px"}}>
                  <input type="number" min="0" step="0.01" value={s.amount} placeholder="0.00"
                    onChange={e=>setField(s.id,"amount",e.target.value)}
                    style={{width:"100%",textAlign:"right",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:6,padding:"5px 8px",color:"var(--text)",fontFamily:"DM Mono,monospace",fontSize:13}}/>
                </td>
                <td style={{padding:"6px 4px",textAlign:"center"}}>
                  <button onClick={()=>dropLine(s.id)} style={{background:"none",border:"none",color:"var(--text3)",cursor:"pointer",fontSize:16}}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <button className="btn btn-ghost btn-sm" onClick={addLine}>+ Add Line</button>
          <span style={{marginLeft:"auto",fontSize:12,fontFamily:"DM Mono,monospace",
            color:balanced?"var(--green)":remaining<0?"var(--red)":"var(--amber)"}}>
            {balanced ? "✓ Balanced" : remaining > 0 ? `${fmt(remaining)} remaining` : `Over by ${fmt(Math.abs(remaining))}`}
          </span>
        </div>
        <div className="flex gap-8 mt-14">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary ml-auto" disabled={!balanced} onClick={save}>Save Split</button>
        </div>
      </div>
    </div>
  );
}

function BulkModal({ count, accounts, onApply, onClose }) {
  const [accountId, setAccountId] = useState("");
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-title">Bulk Classify</div>
        <p style={{color:"var(--text2)",fontSize:13,marginBottom:18}}>
          Assign <strong style={{color:"var(--accent)"}}>{count} transaction{count!==1?"s":""}</strong> to an account.
        </p>
        <div className="field"><label>Assign to Account</label>
          <select value={accountId} onChange={e=>setAccountId(e.target.value)} style={{width:"100%",padding:"7px 11px"}}>
            <option value="">-- Select account --</option>
            {ACCOUNT_TYPES.map(type=>(
              <optgroup key={type} label={type}>
                {accounts.filter(a=>a.type===type).map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="flex gap-8 mt-14">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary ml-auto" disabled={!accountId} onClick={()=>onApply(accountId)}>Apply to {count}</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BANK ACCOUNT IMPORT MODAL
// ─────────────────────────────────────────────────────────────────────────────
function ImportModal({ accounts, onImport, onClose }) {
  const bankAccounts = accounts.filter(a => a.type === "Asset" || a.type === "Liability");
  const [selectedAcctId, setSelectedAcctId] = useState("");
  const [file,           setFile]           = useState(null);
  const fileRef = useRef();

  const selectedAcct = bankAccounts.find(a => a.id === selectedAcctId);
  const canSubmit    = file && selectedAcctId;

  const handleFile = (f) => setFile(f);

  const submit = () => {
    if (!canSubmit) return;
    const reader = new FileReader();
    reader.onload = e => { onImport(e.target.result, selectedAcctId, selectedAcct.name); onClose(); };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{width:520,maxWidth:"96vw"}} onClick={e=>e.stopPropagation()}>
        <div className="modal-title">Import CSV</div>
        <p style={{fontSize:12,color:"var(--text3)",marginBottom:14}}>
          Select which account this CSV came from, then upload the file. Transactions will appear in the register ready to classify.
        </p>

        <div style={{background:"var(--surface2)",borderRadius:"var(--radius)",padding:"10px 14px",marginBottom:14,fontFamily:"DM Mono,monospace",fontSize:11,color:"var(--text3)"}}>
          Expected: <span style={{color:"var(--accent)"}}>date, description, amount</span> (plus any extra columns — they are ignored)
        </div>

        {/* Account picker */}
        <div className="field" style={{marginBottom:12}}>
          <label>Bank / Credit Card Account</label>
          <select value={selectedAcctId} onChange={e=>setSelectedAcctId(e.target.value)}
            style={{width:"100%",padding:"7px 11px"}}>
            <option value="">— Select account —</option>
            {["Asset","Liability"].map(type=>{
              const accts = bankAccounts.filter(a=>a.type===type);
              if (!accts.length) return null;
              return (
                <optgroup key={type} label={type==="Asset"?"Bank Accounts":"Credit Cards & Liabilities"}>
                  {accts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
                </optgroup>
              );
            })}
          </select>
          {bankAccounts.length===0&&(
            <div style={{fontSize:12,color:"var(--text3)",marginTop:6}}>
              No accounts found. Add one in Chart of Accounts first.
            </div>
          )}
        </div>

        {/* File drop zone */}
        <div className="upload-zone" style={{marginBottom:12,cursor:"pointer"}}
          onClick={()=>fileRef.current?.click()}
          onDragOver={e=>e.preventDefault()}
          onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)handleFile(f);}}>
          <div className="upload-icon">📂</div>
          <div className="upload-text">{file ? file.name : "Click or drag a CSV file here"}</div>
          <input ref={fileRef} type="file" accept=".csv" style={{display:"none"}}
            onChange={e=>e.target.files[0]&&handleFile(e.target.files[0])}/>
        </div>

        <div className="flex gap-8 mt-14">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary ml-auto" disabled={!canSubmit} onClick={submit}>
            Import{selectedAcct?` into ${selectedAcct.name}`:""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSACTION TABLE  (single bank tab, split uncategorized / categorized)
// ─────────────────────────────────────────────────────────────────────────────
// RESIZABLE COLUMN HEADER
// ─────────────────────────────────────────────────────────────────────────────
function ResizeTh({ width, onResize, children, style={} }) {
  const startX=useRef(null), startW=useRef(null);
  const onMouseDown = e => {
    e.preventDefault();
    startX.current=e.clientX; startW.current=width;
    const move=ev=>onResize(Math.max(40,startW.current+(ev.clientX-startX.current)));
    const up=()=>{document.removeEventListener("mousemove",move);document.removeEventListener("mouseup",up);};
    document.addEventListener("mousemove",move);
    document.addEventListener("mouseup",up);
  };
  return (
    <th style={{...style,width,minWidth:width,maxWidth:width,position:"relative",overflow:"hidden",whiteSpace:"nowrap"}}>
      {children}
      <span className="col-resize" onMouseDown={onMouseDown}/>
    </th>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSACTION TABLE
// ─────────────────────────────────────────────────────────────────────────────
function TxnTable({ transactions, allTransactions, accounts, sourceAccount, onClassify, onSplit, onMatchTransfer, onDelete, onUpdate, rules, onApplyRules }) {
  const [selected,      setSelected]      = useState(new Set());
  const [search,        setSearch]        = useState("");
  const [section,       setSection]       = useState("uncategorized");
  const [currentPage,   setCurrentPage]   = useState(1);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingId,     setEditingId]     = useState(null);
  const [pendingQueue,  setPendingQueue]  = useState({});
  const [confirmDelId,  setConfirmDelId]  = useState(null);
  const [editingDescId, setEditingDescId] = useState(null);
  const [editDescVal,   setEditDescVal]   = useState("");
  const [colWidths,     setColWidths]     = useState({date:90,desc:220,amt:90,cat:200,transfer:110,del:70});
  const [sortKey,       setSortKey]       = useState("date");
  const [sortDir,       setSortDir]       = useState("desc");
  const setCW = (k,w) => setColWidths(p=>({...p,[k]:w}));

  const cycleSort = (key) => {
    if (sortKey===key) setSortDir(d=>d==="asc"?"desc":"asc");
    else { setSortKey(key); setSortDir(key==="amount"?"desc":"asc"); }
    setCurrentPage(1);
  };

  const uncategorized = useMemo(()=>transactions.filter(t=>!t.accountId&&!pendingQueue[t.id]),[transactions,pendingQueue]);
  const categorized   = useMemo(()=>transactions.filter(t=> t.accountId || !!pendingQueue[t.id]),[transactions,pendingQueue]);
  const pool = section==="uncategorized" ? uncategorized : categorized;

  const filtered = useMemo(()=>{
    const q = search.toLowerCase();
    const base = q ? pool.filter(t=>(t.description||"").toLowerCase().includes(q)) : [...pool];
    return base.sort((a,b)=>{
      let av,bv;
      if      (sortKey==="date")  { av=a.date||""; bv=b.date||""; }
      else if (sortKey==="desc")  { av=(a.description||"").toLowerCase(); bv=(b.description||"").toLowerCase(); }
      else                        { av=Math.abs(a.amount||0); bv=Math.abs(b.amount||0); }
      if(av<bv) return sortDir==="asc"?-1:1;
      if(av>bv) return sortDir==="asc"?1:-1;
      return 0;
    });
  },[pool,search,sortKey,sortDir]);

  const totalPages = Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  const pg = Math.min(currentPage,totalPages);
  const paged = filtered.slice((pg-1)*PAGE_SIZE, pg*PAGE_SIZE);
  const allPageSelected = paged.length>0 && paged.every(t=>selected.has(t.id));

  const toggleAll = () => {
    if (allPageSelected) setSelected(s=>{ const n=new Set(s); paged.forEach(t=>n.delete(t.id)); return n; });
    else                 setSelected(s=>{ const n=new Set(s); paged.forEach(t=>n.add(t.id)); return n; });
  };
  const toggleOne = id => setSelected(s=>{ const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n; });

  const applyBulk = accountId => {
    selected.forEach(id=>onClassify(id,accountId));
    setSelected(new Set()); setShowBulkModal(false);
  };

  // Stage a classification without immediately committing (Enter-to-advance flow)
  const stageClassify = (id, accountId) => {
    setPendingQueue(q=>({...q,[id]:accountId}));
  };

  // Commit all staged items at once
  const acceptAllPending = () => {
    Object.entries(pendingQueue).forEach(([id,acctId])=>onClassify(id,acctId));
    setPendingQueue({});
    setEditingId(null);
  };

  const discardPending = () => { setPendingQueue({}); setEditingId(null); };

  // Move editing focus to the next unclassified+unstaged row, handling pagination
  const advanceToNext = (currentId) => {
    // Build the ordered list of still-uncategorized rows (same order as the table)
    const available = transactions.filter(t => !t.accountId && !pendingQueue[t.id]);
    const idx = available.findIndex(t => t.id === currentId);
    const next = available[idx + 1] || null;
    setEditingId(next ? next.id : null);
    if (next) {
      // Jump to the page that contains the next item
      const nextPosInAll = available.indexOf(next);
      const targetPage = Math.floor(nextPosInAll / PAGE_SIZE) + 1;
      setCurrentPage(targetPage);
    }
  };

  const acctById = Object.fromEntries(accounts.map(a=>[a.id,a]));

  const getEntry = (t) => {
    if (!t.accountId || !t.sourceId) return null;
    const src = acctById[t.sourceId], cat = acctById[t.accountId];
    if (!src || !cat) return null;
    return journalEntry(t, src, cat);
  };

  const showJournal = !!sourceAccount;

  // Find transfer match candidates for uncategorized txns classified to another asset/liability
  const matchCandidates = useMemo(()=>{
    const map = {};
    if (!sourceAccount) return map;
    categorized.forEach(t => {
      const catAcct = acctById[t.accountId];
      if (!catAcct || !["Asset","Liability"].includes(catAcct.type)) return;
      if (t.transferMatchId) return; // already matched
      const candidate = findTransferMatch(t, allTransactions);
      if (candidate) map[t.id] = candidate;
    });
    return map;
  },[categorized, allTransactions, acctById, sourceAccount]);

  const matchBannerCount = Object.keys(matchCandidates).length;

  return (
    <div>
      {/* Section tabs */}
      <div className="tabs">
        <div className={`tab${section==="uncategorized"?" active":""}`} onClick={()=>{setSection("uncategorized");setCurrentPage(1);setSelected(new Set());setEditingId(null);}}>
          Uncategorized
          {uncategorized.length>0&&<span className="tab-badge">{uncategorized.length}</span>}
        </div>
        <div className={`tab${section==="categorized"?" active":""}`} onClick={()=>{setSection("categorized");setCurrentPage(1);setSelected(new Set());setEditingId(null);}}>
          Categorized
          <span className="tab-badge" style={{background:"rgba(74,222,128,.15)",color:"var(--green)"}}>{categorized.length}</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <input type="text" placeholder="Search descriptions…" value={search}
          onChange={e=>{setSearch(e.target.value);setCurrentPage(1);}} style={{width:200}}/>
        <div className="toolbar-spacer"/>
        {selected.size>0 && <button className="btn btn-primary btn-sm" onClick={()=>setShowBulkModal(true)}>Classify {selected.size} Selected</button>}
        {rules.length>0 && <button className="btn btn-ghost btn-sm" onClick={onApplyRules}>⚡ Apply Rules</button>}
      </div>

      {/* Pending-queue bulk accept bar */}
      {Object.keys(pendingQueue).length>0 && (
        <div className="bulk-accept-bar">
          <span className="bulk-accept-count">{Object.keys(pendingQueue).length} staged</span>
          <span style={{fontSize:13,color:"var(--text2)"}}>— press Enter on each row or click Accept All when done</span>
          <div style={{marginLeft:"auto",display:"flex",gap:8}}>
            <button className="bulk-accept-btn" onClick={acceptAllPending}>✓ Accept All</button>
            <button className="bulk-discard-btn" onClick={discardPending}>Discard</button>
          </div>
        </div>
      )}

      {/* Transfer match banner — shown in categorized view when matches exist */}
      {section==="categorized" && matchBannerCount>0 && (
        <div className="match-banner">
          <span className="match-banner-icon">🔗</span>
          <span className="match-banner-text">
            <strong>{matchBannerCount} transfer{matchBannerCount>1?"s":""}</strong> can be matched to counterpart transactions below.
          </span>
        </div>
      )}

      {showJournal && section==="categorized" && (
        <div style={{fontSize:11,color:"var(--text3)",fontFamily:"DM Mono,monospace",marginBottom:10,padding:"6px 12px",background:"var(--surface2)",borderRadius:6,display:"inline-block"}}>
          Source: <span style={{color:"var(--text2)"}}>{sourceAccount.name}</span>
          &nbsp;·&nbsp;Normal balance:&nbsp;
          <span style={{color:DEBIT_NORMAL.has(sourceAccount.type)?"var(--blue)":"var(--purple)"}}>
            {DEBIT_NORMAL.has(sourceAccount.type)?"Debit (Asset)":"Credit (Liability)"}
          </span>
        </div>
      )}

      {pool.length===0
        ? <div className="empty">
            <div className="empty-icon">{section==="uncategorized"?"✅":"📋"}</div>
            <div className="empty-title">{section==="uncategorized"?"All transactions are categorized!":"No categorized transactions yet."}</div>
          </div>
        : <>
            <div className="txn-table-wrap">
              <table className="txn-table">
                <colgroup>
                  <col style={{width:34}}/>
                  <col style={{width:colWidths.date}}/>
                  <col style={{width:colWidths.desc}}/>
                  {showJournal&&section==="categorized"?<>
                    <col style={{width:colWidths.amt}}/><col style={{width:colWidths.amt}}/><col style={{width:colWidths.cat}}/><col style={{width:colWidths.transfer}}/><col style={{width:colWidths.del}}/>
                  </>:<>
                    <col style={{width:colWidths.amt}}/><col style={{width:colWidths.cat}}/><col style={{width:colWidths.del}}/>
                  </>}
                </colgroup>
                <thead><tr>
                  <th style={{width:34,paddingLeft:10,whiteSpace:"nowrap"}}><input type="checkbox" className="cb" checked={allPageSelected} onChange={toggleAll}/></th>
                  <ResizeTh width={colWidths.date} onResize={w=>setCW("date",w)}>
                    <span className="sort-th" onClick={()=>cycleSort("date")}>Date<span className={`sort-arrow${sortKey==="date"?" active":""}`}>{sortKey==="date"?(sortDir==="asc"?"▲":"▼"):"⇅"}</span></span>
                  </ResizeTh>
                  <ResizeTh width={colWidths.desc} onResize={w=>setCW("desc",w)}>
                    <span className="sort-th" onClick={()=>cycleSort("desc")}>Description<span className={`sort-arrow${sortKey==="desc"?" active":""}`}>{sortKey==="desc"?(sortDir==="asc"?"▲":"▼"):"⇅"}</span></span>
                  </ResizeTh>
                  {showJournal&&section==="categorized"
                    ? <><ResizeTh width={colWidths.amt} onResize={w=>setCW("amt",w)} style={{textAlign:"right",color:"var(--blue)"}}>Debit</ResizeTh>
                        <ResizeTh width={colWidths.amt} onResize={w=>setCW("amt",w)} style={{textAlign:"right",color:"var(--purple)"}}>Credit</ResizeTh>
                        <ResizeTh width={colWidths.cat} onResize={w=>setCW("cat",w)}>Category</ResizeTh>
                        <ResizeTh width={colWidths.transfer} onResize={w=>setCW("transfer",w)}>Transfer</ResizeTh>
                        <th style={{width:colWidths.del}}></th></>
                    : <><ResizeTh width={colWidths.amt} onResize={w=>setCW("amt",w)}>
                        <span className="sort-th" onClick={()=>cycleSort("amount")}>Amount<span className={`sort-arrow${sortKey==="amount"?" active":""}`}>{sortKey==="amount"?(sortDir==="asc"?"▲":"▼"):"⇅"}</span></span>
                      </ResizeTh>
                        <ResizeTh width={colWidths.cat} onResize={w=>setCW("cat",w)}>Category</ResizeTh>
                        <th style={{width:colWidths.del}}></th></>
                  }
                </tr></thead>
                <tbody>
                  {paged.map(t => {
                    const entry        = getEntry(t);
                    const catAcct      = t.accountId ? acctById[t.accountId] : null;
                    const isDebitOnSrc = entry?.debitAcctId  === sourceAccount?.id;
                    const isCreditOnSrc= entry?.creditAcctId === sourceAccount?.id;
                    const isEditing    = editingId === t.id;
                    const matchCandidate = matchCandidates[t.id];
                    const isMatched    = !!t.transferMatchId;

                    return (
                      <tr key={t.id}
                        className={`${selected.has(t.id)?"selected":""} ${isEditing?"row-editing":""} ${pendingQueue[t.id]?"row-pending-classify":""}`}
                      >
                        <td style={{paddingLeft:14}} onClick={e=>e.stopPropagation()}>
                          <input type="checkbox" className="cb" checked={selected.has(t.id)} onChange={()=>toggleOne(t.id)}/>
                        </td>
                        <td className="font-mono" style={{color:"var(--text3)",fontSize:12,whiteSpace:"nowrap"}}>{t.date}</td>
                        <td style={{color:"var(--text)",maxWidth:200}} onDoubleClick={e=>{e.stopPropagation();setEditingDescId(t.id);setEditDescVal(t.description||"");}}>
                          {editingDescId===t.id
                            ? <input autoFocus type="text" value={editDescVal}
                                onChange={e=>setEditDescVal(e.target.value)}
                                onBlur={()=>{if(onUpdate)onUpdate(t.id,{description:editDescVal});setEditingDescId(null);}}
                                onKeyDown={e=>{if(e.key==="Enter"){if(onUpdate)onUpdate(t.id,{description:editDescVal});setEditingDescId(null);}if(e.key==="Escape")setEditingDescId(null);}}
                                onClick={e=>e.stopPropagation()}
                                style={{width:"100%",fontSize:13,padding:"2px 6px",background:"var(--surface2)",border:"1px solid var(--accent)",borderRadius:4,color:"var(--text)"}}/>
                            : <>{t.description}{isMatched && <span className="matched-badge" style={{marginLeft:8}}>🔗 matched</span>}</>
                          }
                        </td>

                        {showJournal && section==="categorized"
                          ? <>
                              <td style={{textAlign:"right",fontFamily:"DM Mono,monospace",fontSize:13,color:"var(--blue)"}}>
                                {entry && isDebitOnSrc ? fmt(entry.absAmount) : ""}
                              </td>
                              <td style={{textAlign:"right",fontFamily:"DM Mono,monospace",fontSize:13,color:"var(--purple)"}}>
                                {entry && isCreditOnSrc ? fmt(entry.absAmount) : ""}
                              </td>
                              <td style={{cursor:"pointer"}} onClick={e=>{e.stopPropagation();if(!isEditing)setEditingId(t.id);}}>
                                {isEditing
                                  ? <InlineEditor
                                      txnId={t.id}
                                      currentValue={t.accountId}
                                      accounts={accounts}
                                      onAccept={id=>{ stageClassify(t.id,id); }}
                                      onCancel={()=>setEditingId(null)}
                                      onEnterNext={()=>advanceToNext(t.id)}
                                      hideAcceptButton={true}
                                    />
                                  : pendingQueue[t.id]
                                    ? (()=>{ const pa=accounts.find(a=>a.id===pendingQueue[t.id]); return (
                                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                                          {pa&&<span className={`badge badge-${pa.type.toLowerCase()}`} style={{fontSize:10}}>{pa.type}</span>}
                                          <span style={{fontSize:12,color:"var(--text2)"}}>{pa?.name}</span>
                                          <span style={{fontSize:10,color:"var(--amber)",marginLeft:2}}>● pending</span>
                                        </div>); })()
                                  : <div style={{display:"flex",alignItems:"center",gap:6}}>
                                      {catAcct && <span className={`badge badge-${catAcct.type.toLowerCase()}`} style={{fontSize:10}}>{catAcct.type}</span>}
                                      <span style={{fontSize:12,color:"var(--text2)"}}>{catAcct?.name || <span style={{color:"var(--text3)"}}>—</span>}</span>
                                      <span style={{fontSize:10,color:"var(--text3)"}}>✎</span>
                                    </div>
                                }
                              </td>
                              <td onClick={e=>e.stopPropagation()}>
                                {isMatched
                                  ? <span className="matched-badge">🔗 matched</span>
                                  : matchCandidate
                                    ? <button className="match-btn" onClick={()=>onMatchTransfer(t.id, matchCandidate.id)}>
                                        🔗 Match
                                      </button>
                                    : null
                                }
                              </td>
                            </>
                          : <>
                              <td><span className={`amount ${t.amount>=0?"pos":"neg"}`}>{fmt(t.amount)}</span></td>
                              <td style={{cursor:"pointer"}} onClick={e=>{e.stopPropagation();if(!isEditing)setEditingId(t.id);}}>
                                {isEditing
                                  ? <InlineEditor
                                      txnId={t.id}
                                      currentValue={t.accountId}
                                      accounts={accounts}
                                      onAccept={id=>{ stageClassify(t.id,id); }}
                                      onCancel={()=>setEditingId(null)}
                                      onEnterNext={()=>advanceToNext(t.id)}
                                      hideAcceptButton={true}
                                    />
                                  : pendingQueue[t.id]
                                    ? (()=>{ const pa=accounts.find(a=>a.id===pendingQueue[t.id]); return (
                                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                                          {pa&&<span className={`badge badge-${pa.type.toLowerCase()}`} style={{fontSize:10}}>{pa.type}</span>}
                                          <span style={{fontSize:12,color:"var(--text2)"}}>{pa?.name}</span>
                                          <span style={{fontSize:10,color:"var(--amber)",marginLeft:2}}>● pending</span>
                                        </div>); })()
                                  : <div style={{display:"flex",alignItems:"center",gap:6}}>
                                      {t.splits && t.splits.length > 1
                                        ? <><span className="badge" style={{background:"rgba(167,139,250,.15)",color:"var(--purple)",fontSize:10}}>Split</span>
                                            <span style={{fontSize:12,color:"var(--text2)"}}>{t.splits.length} categories</span>
                                            <span style={{fontSize:10,color:"var(--text3)"}}>✎</span></>
                                        : catAcct
                                          ? <><span className={`badge badge-${catAcct.type.toLowerCase()}`} style={{fontSize:10}}>{catAcct.type}</span>
                                              <span style={{fontSize:12,color:"var(--text2)"}}>{catAcct.name}</span>
                                              <span style={{fontSize:10,color:"var(--text3)"}}>✎</span></>
                                          : <span style={{fontSize:12,color:"var(--text3)"}}>Click to classify…</span>
                                      }
                                    </div>
                                }
                              </td>
                              <td style={{paddingLeft:2,whiteSpace:"nowrap"}} onClick={e=>e.stopPropagation()}>
                                {t.accountId && onSplit && (
                                  <button className="btn btn-ghost btn-sm" style={{fontSize:10,padding:"2px 6px",opacity:.6}}
                                    onClick={()=>onSplit(t)} title="Split across categories">⑂</button>
                                )}
                              </td>
                            </>
                        }
                        <td style={{paddingLeft:4,whiteSpace:"nowrap"}} onClick={e=>e.stopPropagation()}>
                          {confirmDelId===t.id
                            ? <span style={{display:"flex",alignItems:"center",gap:5}}>
                                <span style={{fontSize:11,color:"var(--text2)"}}>Sure?</span>
                                <button className="del-btn" style={{color:"var(--red)",borderColor:"rgba(255,82,82,.4)"}}
                                  onClick={()=>{ onDelete&&onDelete(t.id); setConfirmDelId(null); }}>Yes</button>
                                <button className="del-btn" onClick={()=>setConfirmDelId(null)}>No</button>
                              </span>
                            : <button className="del-btn" onClick={()=>setConfirmDelId(t.id)}>Delete</button>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span className="page-info">{filtered.length} transactions</span>
              <button className="btn btn-ghost btn-sm" disabled={pg===1} onClick={()=>setCurrentPage(p=>p-1)}>←</button>
              <span className="page-info">Page {pg} / {totalPages}</span>
              <button className="btn btn-ghost btn-sm" disabled={pg>=totalPages} onClick={()=>setCurrentPage(p=>p+1)}>→</button>
            </div>
          </>
      }

      {showBulkModal&&<BulkModal count={selected.size} accounts={accounts} onApply={applyBulk} onClose={()=>setShowBulkModal(false)}/>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TREND REPORT
// ─────────────────────────────────────────────────────────────────────────────
function TrendReport({ type, accounts, transactions, excludedTxns, startDate, endDate, period, onDrill, rTheme, reportNames }) {
  const rt = rTheme || DEFAULT_REPORT_THEME;
  const acctById = Object.fromEntries(accounts.map(a=>[a.id,a]));
  const [colWidths, setColWidths] = useState({});
  const COL_W = 110; // default column width

  const txns = useMemo(()=>
    transactions.filter(t=>t.accountId&&!excludedTxns?.has(t.id)&&inRange(t.date,startDate,endDate))
  ,[transactions,excludedTxns,startDate,endDate]);

  const periods = useMemo(()=>{
    const keys = new Set(txns.map(t=>getPeriodKey(t.date,period)));
    return [...keys].sort();
  },[txns,period]);

  // acctId -> periodKey -> balance
  const balMap = useMemo(()=>{
    const m={};
    accounts.forEach(a=>{m[a.id]={};});
    txns.forEach(t=>{
      const pkey=getPeriodKey(t.date,period);
      const src=acctById[t.sourceId],cat=acctById[t.accountId];
      if(!src||!cat) return;
      const e=journalEntry(t,src,cat);
      if(!e.debitAcctId||!e.creditAcctId) return;
      const add=(id,v)=>{if(m[id]!==undefined) m[id][pkey]=(m[id][pkey]||0)+v;};
      const drType=acctById[e.debitAcctId]?.type, crType=acctById[e.creditAcctId]?.type;
      add(e.debitAcctId,  DEBIT_NORMAL.has(drType)? e.absAmount:-e.absAmount);
      add(e.creditAcctId, DEBIT_NORMAL.has(crType)?-e.absAmount: e.absAmount);
    });
    return m;
  },[txns,period,accounts,acctById]);

  const colVal  = (id,p) => balMap[id]?.[p]||0;
  const subtreeCol = (id,p) => {
    const own = colVal(id,p);
    const childTotal = accounts.filter(a=>(a.parentId||"")===id).reduce((s,c)=>s+subtreeColFn(c.id,p),0);
    return own + childTotal;
  };
  // Need a named function for recursion
  const subtreeColFn = (id,p) => {
    const own = colVal(id,p);
    const childTotal = accounts.filter(a=>(a.parentId||"")===id).reduce((s,c)=>s+subtreeColFn(c.id,p),0);
    return own + childTotal;
  };
  const subtreeTotal = (id) => periods.reduce((s,p)=>s+subtreeColFn(id,p),0);
  const grpRootCol   = (rootAccts,p) => rootAccts.reduce((s,a)=>s+subtreeColFn(a.id,p),0);
  const grpRootTotal = (rootAccts)   => periods.reduce((s,p)=>s+grpRootCol(rootAccts,p),0);

  const resizeCol = (p, startX, startW) => {
    const onMove = e => setColWidths(prev=>({...prev,[p]:Math.max(60,startW+(e.clientX-startX))}));
    const onUp   = () => { document.removeEventListener("mousemove",onMove); document.removeEventListener("mouseup",onUp); };
    document.addEventListener("mousemove",onMove);
    document.addEventListener("mouseup",onUp);
  };

  const thStyle = (p) => ({
    background:rt.subtotalBg, color:rt.subtotalText, borderColor:rt.border,
    textAlign:"right", fontFamily:"DM Mono,monospace", fontSize:11,
    fontWeight:700, padding:"8px 10px", whiteSpace:"nowrap",
    width: colWidths[p]||COL_W, minWidth: colWidths[p]||COL_W,
    position:"relative", userSelect:"none",
  });

  const valStyle = (n, neg) => ({
    textAlign:"right", fontFamily:"DM Mono,monospace", fontSize:12, padding:"4px 10px",
    borderBottom:`1px solid ${rt.border}`, borderColor:rt.border,
    color: n===0 ? rt.rowText : (n>0 ? (neg?rt.neg:rt.pos) : (neg?rt.pos:rt.neg)),
  });

  const subtotalValStyle = (n, neg) => ({
    ...valStyle(n,neg), fontWeight:700, color: n===0 ? rt.subtotalText : (n>0?(neg?rt.neg:rt.pos):(neg?rt.pos:rt.neg)),
  });

  const noParent = v => !v || v === "null" || v === "undefined";

  // Render tree rows for trend view
  const renderTrendTree = (typeAccts, parentId, depth, neg) => {
    return typeAccts
      .filter(a => depth === 0 ? noParent(a.parentId) : (a.parentId||"") === (parentId||""))
      .flatMap(a => {
        const total = subtreeTotal(a.id);
        if (periods.every(p=>subtreeColFn(a.id,p)===0) && total===0) return [];
        const hasChildren = typeAccts.some(c=>(c.parentId||"")===a.id);
        const indent = depth * 14;
        const nameStyle = {
          color: hasChildren ? rt.sectionText : rt.rowText,
          fontWeight: hasChildren ? 600 : 400,
          paddingLeft: 32 + indent,
          fontSize: 12, padding: `4px 10px 4px ${32+indent}px`,
          borderBottom:`1px solid ${rt.border}`,
          cursor:"pointer", fontFamily:"DM Sans,sans-serif",
        };
        return [
          <tr key={a.id} onClick={()=>onDrill&&onDrill(a)} style={{background:depth===0&&hasChildren?rt.sectionBg:rt.bg}}>
            <td style={nameStyle}>{depth>0?"└ ":""}{a.name}</td>
            {periods.map(p=>{const v=subtreeColFn(a.id,p);return <td key={p} style={valStyle(v,neg)}>{v!==0?fmt(Math.abs(v)):""}</td>;})}
            <td style={valStyle(total,neg)}>{total!==0?fmt(Math.abs(total)):""}</td>
          </tr>,
          ...renderTrendTree(typeAccts, a.id, depth+1, neg),
        ];
      });
  };

  const groups = type==="pnl"
    ? [{lbl:"Income",   typeKey:"Revenue", neg:false, tot:"Total Income"},
       {lbl:"Expenses", typeKey:"Expense", neg:true,  tot:"Total Expenses"}]
    : [{lbl:"Assets",   typeKey:"Asset",    neg:false, tot:"Total Assets"},
       {lbl:"Liabilities",typeKey:"Liability",neg:true, tot:"Total Liabilities"},
       {lbl:"Net Worth",typeKey:"Equity",   neg:false, tot:"Total Net Worth"}];

  if(periods.length===0) return <div className="empty"><div className="empty-icon">📊</div><div className="empty-title">No data in selected range</div></div>;

  const dateLabel = startDate||endDate ? `${startDate||"start"} → ${endDate||"today"}` : "All Periods";

  return (
    <div className="qb-report" style={{background:rt.bg,borderColor:rt.border,overflowX:"auto"}}>
      <div className="qb-header" style={{background:rt.headerBg,borderColor:rt.border}}>
        <div className="qb-co" style={{color:rt.headerText}}>{reportNames?.company||"My Company"}</div>
        <div className="qb-title" style={{color:rt.headerText}}>{reportNames?.[type==="pnl"?"pnl":"balance"]||""}</div>
        <div className="qb-date" style={{color:rt.headerText}}>{dateLabel}</div>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse",background:rt.bg}}>
        <thead>
          <tr>
            <th style={{...thStyle("name"),textAlign:"left",width:"auto",minWidth:160,paddingLeft:32}}>Account</th>
            {periods.map(p=>(
              <th key={p} style={thStyle(p)}>
                {formatPeriodKey(p,period)}
                <div style={{position:"absolute",right:0,top:0,bottom:0,width:5,cursor:"col-resize",zIndex:1}}
                  onMouseDown={e=>{e.preventDefault();resizeCol(p,e.clientX,colWidths[p]||COL_W);}}/>
              </th>
            ))}
            <th style={{...thStyle("total"),position:"relative"}}>
              Total
              <div style={{position:"absolute",right:0,top:0,bottom:0,width:5,cursor:"col-resize",zIndex:1}}
                onMouseDown={e=>{e.preventDefault();resizeCol("total",e.clientX,colWidths["total"]||COL_W);}}/>
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.map(g=>{
            const typeAccts = accounts.filter(a=>a.type===g.typeKey&&!a.inactive);
            const rootAccts = typeAccts.filter(a=>noParent(a.parentId));
            const totP = p => grpRootCol(rootAccts,p);
            const totAll = grpRootTotal(rootAccts);
            return (
              <React.Fragment key={g.lbl}>
                <tr style={{background:rt.sectionBg}}>
                  <td colSpan={periods.length+2} style={{padding:"8px 32px",fontSize:12,fontWeight:700,color:rt.sectionText,borderBottom:`1px solid ${rt.border}`}}>{g.lbl}</td>
                </tr>
                {renderTrendTree(typeAccts,"",0,g.neg)}
                <tr style={{background:rt.subtotalBg}}>
                  <td style={{padding:"5px 10px 5px 32px",fontSize:12,fontWeight:700,color:rt.subtotalText,borderBottom:`1px solid ${rt.border}`}}>{g.tot}</td>
                  {periods.map(p=>{const v=totP(p);return <td key={p} style={subtotalValStyle(v,g.neg)}>{v!==0?fmt(Math.abs(v)):""}</td>;})}
                  <td style={subtotalValStyle(totAll,g.neg)}>{totAll!==0?fmt(Math.abs(totAll)):""}</td>
                </tr>
                <tr style={{background:rt.bg}}><td colSpan={periods.length+2} style={{height:8}}></td></tr>
              </React.Fragment>
            );
          })}
          {type==="pnl"&&(()=>{
            const revAccts = accounts.filter(a=>a.type==="Revenue"&&!a.inactive&&noParent(a.parentId));
            const expAccts = accounts.filter(a=>a.type==="Expense"&&!a.inactive&&noParent(a.parentId));
            return (
              <tr style={{background:rt.grandBg}}>
                <td style={{padding:"6px 10px 6px 32px",fontSize:12,fontWeight:700,color:rt.grandText,borderTop:`1px solid ${rt.border}`}}>Net Income</td>
                {periods.map(p=>{
                  const ni=grpRootCol(revAccts,p)-grpRootCol(expAccts,p);
                  return <td key={p} style={{...valStyle(ni,false),fontWeight:700,borderTop:`1px solid ${rt.border}`,color:ni>=0?rt.pos:rt.neg}}>{fmt(Math.abs(ni))}</td>;
                })}
                {(()=>{const ni=grpRootTotal(revAccts)-grpRootTotal(expAccts);return <td style={{...valStyle(ni,false),fontWeight:700,borderTop:`1px solid ${rt.border}`,color:ni>=0?rt.pos:rt.neg}}>{fmt(Math.abs(ni))}</td>;})()}
              </tr>
            );
          })()}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL ENTRY PAGE
// ─────────────────────────────────────────────────────────────────────────────
function JournalEntryPage({ accounts, postedEntries, onPost, onEdit, onDelete }) {
  const mkLine = () => ({ id: Math.random().toString(36).slice(2), accountId: "", debit: "", credit: "", memo: "" });
  const [date,      setDate]      = useState(() => new Date().toISOString().slice(0,10));
  const [memo,      setMemo]      = useState("");
  const [lines,     setLines]     = useState([mkLine(), mkLine()]);
  const [flash,     setFlash]     = useState(false);
  const [editingId, setEditingId] = useState(null); // id of JE being edited

  // Expose a way for parent to trigger editing an existing entry
  // (called via ref or by lifting state — we use a passed-in editTarget prop)

  const setLine = (id, field, val) =>
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: val } : l));

  const addLine   = () => setLines(prev => [...prev, mkLine()]);
  const dropLine  = id => setLines(prev => prev.length > 2 ? prev.filter(l => l.id !== id) : prev);

  const totalDr = lines.reduce((s,l) => s + (parseFloat(l.debit)  || 0), 0);
  const totalCr = lines.reduce((s,l) => s + (parseFloat(l.credit) || 0), 0);
  const balanced = Math.abs(totalDr - totalCr) < 0.005 && totalDr > 0;

  const post = () => {
    if (!balanced) return;
    const valid = lines.filter(l => l.accountId && (parseFloat(l.debit)||0) + (parseFloat(l.credit)||0) > 0);
    if (valid.length < 2) return;
    onPost({ id: editingId || `je-${Date.now()}`, date, memo, lines: valid, isManual: true });
    setEditingId(null);
    setDate(new Date().toISOString().slice(0,10));
    setMemo(""); setLines([mkLine(), mkLine()]);
    setFlash(true); setTimeout(() => setFlash(false), 2000);
  };

  const startEdit = (je) => {
    setEditingId(je.id);
    setDate(je.date);
    setMemo(je.memo||"");
    setLines(je.lines.map(l=>({...l, id:l.id||Math.random().toString(36).slice(2)})));
    window.scrollTo({top:0, behavior:"smooth"});
  };

  const acctById = Object.fromEntries(accounts.map(a => [a.id, a]));
  const thStyle = (align="left") => ({padding:"10px 14px",background:"var(--surface2)",borderBottom:"1px solid var(--border)",fontSize:11,color:"var(--text3)",fontFamily:"DM Mono,monospace",textTransform:"uppercase",letterSpacing:"1px",textAlign:align});

  return (
    <div>
      <div className="page-title">Journal Entries</div>
      <div className="page-sub">Manually record multi-line debits and credits. Debits must equal credits to post.</div>

      <div className="card" style={{marginBottom:14}}>
        {/* Header row: date + memo */}
        <div style={{display:"flex",gap:12,marginBottom:12,flexWrap:"wrap",alignItems:"flex-end"}}>
          <div style={{flex:"0 0 150px"}}>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:3,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.5px"}}>Date</div>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:150}}/>
          </div>
          <div style={{flex:1,minWidth:200}}>
            <div style={{fontSize:11,color:"var(--text3)",marginBottom:3,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.5px"}}>Entry Memo</div>
            <input type="text" value={memo} onChange={e=>setMemo(e.target.value)}
              placeholder="e.g. Depreciation, opening balance…"
              style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:"var(--radius)",padding:"6px 10px",fontFamily:"DM Sans,sans-serif",fontSize:13,color:"var(--text)",outline:"none",width:"100%"}}
              onFocus={e=>e.target.style.borderColor="var(--accent)"}
              onBlur={e=>e.target.style.borderColor="var(--border)"}
            />
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,paddingBottom:2}}>
            {(totalDr > 0 || totalCr > 0) && (
              balanced
                ? <span className="je-balanced">✓ Balanced</span>
                : <span className="je-unbalanced">✗ {fmt(Math.abs(totalDr-totalCr))} off</span>
            )}
            {editingId&&<button className="btn btn-ghost btn-sm" onClick={()=>{setEditingId(null);setDate(new Date().toISOString().slice(0,10));setMemo("");setLines([mkLine(),mkLine()]);}}>Cancel</button>}
            {flash && <span style={{color:"var(--green)",fontSize:12,fontFamily:"DM Mono,monospace"}}>✓ {editingId?"Updated!":"Posted!"}</span>}
            <button className="btn btn-primary btn-sm" disabled={!balanced} onClick={post}>{editingId?"Update":"Post Entry"}</button>
          </div>
        </div>

        {/* Lines table */}
        <table className="je-table">
          <thead>
            <tr>
              <th style={{...thStyle(),width:"32%"}}>Account</th>
              <th style={{...thStyle(),width:"28%"}}>Memo / Description</th>
              <th style={{...thStyle("right"),width:"17%"}}>Debit</th>
              <th style={{...thStyle("right"),width:"17%"}}>Credit</th>
              <th style={{...thStyle("center"),width:"6%"}}></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => {
              const isLast = idx === lines.length - 1;
              return (
                <tr key={line.id}>
                  <td>
                    <AccountCombo
                      value={line.accountId || null}
                      accounts={accounts}
                      onChange={id => setLine(line.id, "accountId", id || "")}
                    />
                  </td>
                  <td>
                    <input type="text" value={line.memo||""} placeholder="optional…"
                      onChange={e=>setLine(line.id,"memo",e.target.value)}
                      style={{width:"100%",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:"var(--radius)",padding:"7px 10px",fontFamily:"DM Sans,sans-serif",fontSize:12,color:"var(--text)",outline:"none"}}
                      onFocus={e=>e.target.style.borderColor="var(--accent)"}
                      onBlur={e=>e.target.style.borderColor="var(--border)"}
                    />
                  </td>
                  <td style={{textAlign:"right"}}>
                    <input className="je-num-input" type="number" min="0" step="0.01"
                      value={line.debit} placeholder="0.00"
                      onChange={e => { setLine(line.id,"debit",e.target.value); if(e.target.value) setLine(line.id,"credit",""); }}
                      onKeyDown={e => { if(e.key==="Tab"&&isLast&&!e.shiftKey){e.preventDefault();addLine();} }}
                    />
                  </td>
                  <td style={{textAlign:"right"}}>
                    <input className="je-num-input" type="number" min="0" step="0.01"
                      value={line.credit} placeholder="0.00"
                      onChange={e => { setLine(line.id,"credit",e.target.value); if(e.target.value) setLine(line.id,"debit",""); }}
                      onKeyDown={e => { if(e.key==="Tab"&&isLast&&!e.shiftKey){e.preventDefault();addLine();} }}
                    />
                  </td>
                  <td style={{textAlign:"center"}}>
                    <button onClick={()=>dropLine(line.id)}
                      style={{background:"none",border:"none",color:"var(--text3)",cursor:"pointer",fontSize:16,padding:"2px 5px"}}
                      title="Remove line">×</button>
                  </td>
                </tr>
              );
            })}
            {/* Totals row */}
            <tr className="je-total">
              <td>
                <button className="btn btn-ghost btn-sm" onClick={addLine} style={{fontSize:11}}>+ Add Line</button>
              </td>
              <td style={{textAlign:"right",color:totalDr>0?"var(--blue)":"var(--text3)"}}>{totalDr.toFixed(2)}</td>
              <td style={{textAlign:"right",color:totalCr>0?"var(--purple)":"var(--text3)"}}>{totalCr.toFixed(2)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* History */}
      {postedEntries.length > 0 && (
        <div style={{marginTop:28}}>
          <div style={{fontSize:13,color:"var(--text2)",fontWeight:600,marginBottom:14}}>Posted Entries</div>
          {[...postedEntries].reverse().map(je => {
            const dr = je.lines.reduce((s,l)=>s+(parseFloat(l.debit)||0),0);
            return (
              <div key={je.id} className="je-entry-card">
                <div className="je-entry-header">
                  <div>
                    <div className="je-entry-memo">{je.memo||<span style={{color:"var(--text3)",fontStyle:"italic"}}>No memo</span>}</div>
                    <div className="je-entry-date">{je.date}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:12,color:"var(--green)",fontFamily:"DM Mono,monospace"}}>{fmt(dr)}</span>
                    <button className="btn btn-ghost btn-sm" onClick={()=>startEdit(je)}>Edit</button>
                    {onDelete&&<button className="del-btn" onClick={()=>onDelete(je.id)}>Delete</button>}
                  </div>
                </div>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <tbody>
                    {je.lines.map((l,i)=>{
                      const acct = acctById[l.accountId];
                      const dr2 = parseFloat(l.debit)||0, cr2 = parseFloat(l.credit)||0;
                      return (
                        <tr key={i} style={{borderBottom:"1px solid var(--border)"}}>
                          <td style={{padding:"7px 16px",paddingLeft:cr2>0?40:16,fontSize:13,color:"var(--text2)"}}>
                            {acct
                              ? <><span className={`badge badge-${acct.type.toLowerCase()}`} style={{fontSize:10,marginRight:6}}>{acct.type}</span>{acct.name}</>
                              : <span style={{color:"var(--text3)"}}>Unknown</span>}
                            {l.memo && <span style={{fontSize:11,color:"var(--text3)",marginLeft:8,fontStyle:"italic"}}>— {l.memo}</span>}
                          </td>
                          <td style={{padding:"7px 16px",textAlign:"right",fontFamily:"DM Mono,monospace",fontSize:13,color:"var(--blue)"}}>
                            {dr2>0?fmt(dr2):""}
                          </td>
                          <td style={{padding:"7px 16px",textAlign:"right",fontFamily:"DM Mono,monospace",fontSize:13,color:"var(--purple)"}}>
                            {cr2>0?fmt(cr2):""}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RECONCILIATION MODAL
// ─────────────────────────────────────────────────────────────────────────────
function ReconcileModal({ account, transactions, manualJEs, accounts, onComplete, onUpdate, onClose }) {
  const [endBalance,   setEndBalance]   = useState("");
  const [endDate,      setEndDate]      = useState(()=>new Date().toISOString().slice(0,10));
  const [includeAfter, setIncludeAfter] = useState(false);
  const [step,         setStep]         = useState(1);
  const [cleared,      setCleared]      = useState(new Set());
  const [editingId,    setEditingId]    = useState(null);
  const [editFields,   setEditFields]   = useState({});

  const acctById = Object.fromEntries((accounts||[]).map(a=>[a.id,a]));

  const normDate = (d) => {
    if (!d) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(d)) {
      const [m, day, y] = d.split("/");
      return `${y.length===2?"20"+y:y}-${m.padStart(2,"0")}-${day.padStart(2,"0")}`;
    }
    const parsed = new Date(d);
    if (!isNaN(parsed)) return parsed.toISOString().slice(0,10);
    return d;
  };

  // Combine bank transactions + JE lines for this account
  const allItems = useMemo(()=>{
    const txnItems = transactions
      .filter(t=>(t.sourceId===account.id||t.accountId===account.id) && t.accountId && !t.reconciled)
      .filter(t=>{ if(!t.date) return true; const nd=normDate(t.date); return nd<=endDate||(includeAfter&&nd>endDate); })
      .map(t=>({
        id: t.id,
        type: "txn",
        date: t.date,
        description: t.description,
        amount: t.amount,
        accountId: t.accountId,
        sourceId: t.sourceId,
        _raw: t,
      }));

    const jeItems = (manualJEs||[])
      .filter(je=>{ if(!je.date) return true; const nd=normDate(je.date); return nd<=endDate||(includeAfter&&nd>endDate); })
      .flatMap(je => je.lines
        .filter(l=>l.accountId===account.id)
        .map(l => ({
          id: `${je.id}::${l.id||l.accountId}`,
          type: "je",
          date: je.date,
          description: je.memo || "Journal Entry",
          amount: (parseFloat(l.debit)||0) - (parseFloat(l.credit)||0),
          debit:  parseFloat(l.debit)||0,
          credit: parseFloat(l.credit)||0,
          _je: je,
          _line: l,
        }))
      );

    return [...txnItems, ...jeItems].sort((a,b)=>normDate(a.date)>normDate(b.date)?1:-1);
  },[transactions,manualJEs,account.id,endDate,includeAfter]);

  // Determine debit/credit for a txn item based on account type
  const getDebitCredit = (item) => {
    if (item.type==="je") return { debit: item.debit||0, credit: item.credit||0 };
    const acct = acctById[account.id];
    const isDebitNormal = acct && ["Asset","Expense"].includes(acct.type);
    if (isDebitNormal) {
      return item.amount >= 0
        ? { debit: Math.abs(item.amount), credit: 0 }
        : { debit: 0, credit: Math.abs(item.amount) };
    } else {
      return item.amount >= 0
        ? { debit: 0, credit: Math.abs(item.amount) }
        : { debit: Math.abs(item.amount), credit: 0 };
    }
  };

  const clearedTotal = allItems.filter(i=>cleared.has(i.id)).reduce((s,i)=>s+i.amount,0);
  const endBal = parseFloat(endBalance)||0;
  const diff   = endBal - clearedTotal;
  const isBalanced = Math.abs(diff)<0.005;
  const toggle = id => setCleared(s=>{ const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n; });

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditFields({ date: item.date||"", description: item.description||"", amount: String(item.amount||"") });
  };
  const saveEdit = (item) => {
    if (item.type==="txn" && onUpdate) {
      onUpdate(item.id, { date: editFields.date, description: editFields.description, amount: parseFloat(editFields.amount)||item.amount });
    }
    setEditingId(null);
  };

  if (step===1) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-title">Reconcile — {account.name}</div>
        <div className="field"><label>Statement Ending Date</label>
          <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)}/>
        </div>
        <div className="field"><label>Ending Balance (from statement)</label>
          <input type="number" value={endBalance} onChange={e=>setEndBalance(e.target.value)} placeholder="e.g. 4250.00" step="0.01"/>
        </div>
        <div className="field">
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",userSelect:"none"}}>
            <input type="checkbox" checked={includeAfter} onChange={e=>setIncludeAfter(e.target.checked)} style={{width:15,height:15,accentColor:"var(--accent)"}}/>
            <span>Include transactions after statement date</span>
          </label>
        </div>
        <div className="flex gap-8 mt-14">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary ml-auto" disabled={!endBalance||!endDate} onClick={()=>setStep(2)}>Continue →</button>
        </div>
      </div>
    </div>
  );

  const thS = {padding:"8px 10px",background:"var(--surface2)",borderBottom:"1px solid var(--border)",fontSize:11,color:"var(--text3)",fontFamily:"DM Mono,monospace",textTransform:"uppercase"};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="recon-modal" onClick={e=>e.stopPropagation()}>
        <div className="recon-header">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontFamily:"DM Serif Display,serif",fontSize:17,color:"var(--text)"}}>{account.name} — Reconcile</div>
              <div style={{fontSize:11,color:"var(--text3)",fontFamily:"DM Mono,monospace",marginTop:3}}>Statement date: {endDate} · Target: {fmt(endBal)}</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginTop:10,flexWrap:"wrap"}}>
            <button className="btn btn-ghost btn-sm" onClick={()=>setCleared(new Set(allItems.map(i=>i.id)))}>Select All</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>setCleared(new Set())}>Clear All</button>
            <div style={{marginLeft:"auto",display:"flex",gap:14}}>
              <span style={{fontSize:12,color:"var(--text3)"}}>Cleared: <b style={{fontFamily:"DM Mono,monospace",color:"var(--text)"}}>{fmt(clearedTotal)}</b></span>
              <span style={{fontSize:12,color:"var(--text3)"}}>Difference: <b className={`recon-diff ${isBalanced?"ok":"off"}`}>{fmt(diff)}</b></span>
            </div>
          </div>
        </div>
        <div className="recon-body">
          {allItems.length===0
            ? <div className="empty"><div className="empty-icon">✓</div><div className="empty-title">No unreconciled items</div></div>
            : <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>
                  <th style={{...thS,width:40}}></th>
                  <th style={{...thS,width:95}}>Date</th>
                  <th style={thS}>Description</th>
                  <th style={{...thS,textAlign:"right",width:100}}>Debit</th>
                  <th style={{...thS,textAlign:"right",width:100}}>Credit</th>
                  <th style={{...thS,width:60}}>Edit</th>
                </tr></thead>
                <tbody>
                  {allItems.map(item=>{
                    const c = cleared.has(item.id);
                    const isJE = item.type==="je";
                    const isEditing = editingId===item.id;
                    const {debit,credit} = getDebitCredit(item);
                    return (
                      <tr key={item.id} className={`recon-row${c?" cleared":""}`} onClick={()=>toggle(item.id)}>
                        <td style={{paddingLeft:18,paddingTop:8,paddingBottom:8}}>
                          <input type="checkbox" className="cb" checked={c} onChange={()=>toggle(item.id)} onClick={e=>e.stopPropagation()}/>
                        </td>
                        <td style={{padding:"7px 10px",fontSize:12,color:"var(--text3)",fontFamily:"DM Mono,monospace",whiteSpace:"nowrap"}}>
                          {isEditing && !isJE
                            ? <input type="date" value={editFields.date} onChange={e=>setEditFields(p=>({...p,date:e.target.value}))}
                                onClick={e=>e.stopPropagation()}
                                style={{width:120,fontSize:11,padding:"2px 4px",background:"var(--surface2)",border:"1px solid var(--accent)",borderRadius:4,color:"var(--text)"}}/>
                            : item.date}
                        </td>
                        <td style={{padding:"7px 10px",fontSize:13,color:"var(--text)"}}>
                          {isEditing && !isJE
                            ? <input value={editFields.description} onChange={e=>setEditFields(p=>({...p,description:e.target.value}))}
                                onClick={e=>e.stopPropagation()}
                                style={{width:"100%",fontSize:12,padding:"2px 6px",background:"var(--surface2)",border:"1px solid var(--accent)",borderRadius:4,color:"var(--text)"}}/>
                            : <span>{item.description}{isJE && <span style={{fontSize:10,color:"var(--purple)",marginLeft:6}}>JE</span>}</span>}
                        </td>
                        <td style={{padding:"7px 10px",textAlign:"right",fontFamily:"DM Mono,monospace",fontSize:13,color:"var(--blue)"}}>
                          {isEditing && !isJE
                            ? <input type="number" value={editFields.amount} onChange={e=>setEditFields(p=>({...p,amount:e.target.value}))}
                                onClick={e=>e.stopPropagation()}
                                style={{width:80,textAlign:"right",fontSize:12,padding:"2px 4px",background:"var(--surface2)",border:"1px solid var(--accent)",borderRadius:4,color:"var(--text)"}}/>
                            : debit > 0 ? fmt(debit) : ""}
                        </td>
                        <td style={{padding:"7px 10px",textAlign:"right",fontFamily:"DM Mono,monospace",fontSize:13,color:"var(--purple)"}}>
                          {credit > 0 && !isEditing ? fmt(credit) : ""}
                        </td>
                        <td style={{padding:"7px 10px"}} onClick={e=>e.stopPropagation()}>
                          {!isJE && (isEditing
                            ? <button className="btn btn-ghost btn-sm" style={{fontSize:10,padding:"2px 6px"}} onClick={()=>saveEdit(item)}>✓</button>
                            : <button className="btn btn-ghost btn-sm" style={{fontSize:10,padding:"2px 6px",opacity:.5}} onClick={()=>startEdit(item)}>✎</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
          }
        </div>
        <div className="recon-footer">
          <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:13,color:"var(--text2)"}}>
            <input type="checkbox" checked={includeAfter} onChange={e=>setIncludeAfter(e.target.checked)} style={{width:14,height:14,accentColor:"var(--accent)"}}/>
            Include after statement date
          </label>
          <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
            {!isBalanced&&<span style={{fontSize:12,color:"var(--red)"}}>Off by {fmt(Math.abs(diff))}</span>}
            <button className="btn btn-ghost" onClick={()=>setStep(1)}>← Back</button>
            <button className="btn btn-primary" disabled={!isBalanced}
              onClick={()=>onComplete(account.id,endDate,endBal,[...cleared].filter(id=>!id.includes("::")))}>
              ✓ Finish Reconciliation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM THEME EDITOR
// ─────────────────────────────────────────────────────────────────────────────
function CustomThemeModal({ currentTheme, onSave, onClose }) {
  const fields = [
    {k:"bg",label:"Background"},{k:"surface",label:"Surface"},{k:"surface2",label:"Surface 2"},
    {k:"accent",label:"Accent"},{k:"text",label:"Text"},{k:"text2",label:"Text 2"},
    {k:"text3",label:"Text 3"},{k:"green",label:"Positive"},{k:"red",label:"Negative"},
    {k:"blue",label:"Blue"},{k:"amber",label:"Amber"},{k:"border",label:"Border"},
  ];
  const [draft, setDraft] = useState({...currentTheme});
  const set = (k,v) => { const nd={...draft,[k]:v}; setDraft(nd); onSave(nd); };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{width:520,maxWidth:"96vw"}} onClick={e=>e.stopPropagation()}>
        <div className="modal-title">Custom Theme</div>
        <p style={{fontSize:12,color:"var(--text3)",marginBottom:14}}>Colours update live as you pick.</p>
        <div className="theme-editor-grid">
          {fields.map(f=>(
            <div key={f.k} className="theme-swatch-input">
              <input type="color" value={draft[f.k]||"#000000"} onChange={e=>set(f.k,e.target.value)}/>
              <label>{f.label}</label>
              <span style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"var(--text3)",marginLeft:"auto"}}>{draft[f.k]}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-8 mt-14">
          <button className="btn btn-ghost" style={{color:"var(--text3)"}} onClick={()=>{ onSave(null); onClose(); }}>Reset</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary ml-auto" onClick={()=>{ onSave(draft); onClose(); }}>Save Theme</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORT THEME MODAL
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_REPORT_THEME = {
  bg:          "#ffffff",
  headerBg:    "#ffffff",
  headerText:  "#111111",
  sectionBg:   "#ffffff",
  sectionText: "#111111",
  rowEven:     "#f9f9f9",
  rowText:     "#222222",
  subtotalBg:  "#f0f0f0",
  subtotalText:"#111111",
  grandBg:     "#e8e8e8",
  grandText:   "#000000",
  border:      "#cccccc",
  pos:         "#15803d",
  neg:         "#b91c1c",
};

function ReportThemeModal({ currentTheme, onSave, onClose }) {
  const fields = [
    {k:"bg",           label:"Report Background"},
    {k:"headerBg",     label:"Header Background"},
    {k:"headerText",   label:"Header Text"},
    {k:"sectionBg",    label:"Section Background"},
    {k:"sectionText",  label:"Section Text"},
    {k:"rowEven",      label:"Row (Even) Background"},
    {k:"rowText",      label:"Row Text"},
    {k:"subtotalBg",   label:"Subtotal Background"},
    {k:"subtotalText", label:"Subtotal Text"},
    {k:"grandBg",      label:"Grand Total Background"},
    {k:"grandText",    label:"Grand Total Text"},
    {k:"border",       label:"Border Color"},
    {k:"pos",          label:"Positive Value"},
    {k:"neg",          label:"Negative Value"},
  ];
  const base = {...DEFAULT_REPORT_THEME, ...(currentTheme||{})};
  const [draft, setDraft] = useState(base);
  const set = (k,v) => setDraft(p=>({...p,[k]:v}));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{width:540,maxWidth:"96vw"}} onClick={e=>e.stopPropagation()}>
        <div className="modal-title">Report Theme</div>
        <p style={{fontSize:12,color:"var(--text3)",marginBottom:14}}>Customise the colours used on printed reports.</p>
        <div className="theme-editor-grid">
          {fields.map(f=>(
            <div key={f.k} className="theme-swatch-input">
              <input type="color" value={draft[f.k]||"#000000"} onChange={e=>set(f.k,e.target.value)}/>
              <label>{f.label}</label>
              <span style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"var(--text3)",marginLeft:"auto"}}>{draft[f.k]}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-8 mt-14">
          <button className="btn btn-ghost" style={{color:"var(--text3)"}} onClick={()=>{ onSave(null); onClose(); }}>Reset</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary ml-auto" onClick={()=>{ onSave(draft); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
}


function CoaActionsMenu({ account, isReconType, onEdit, onReconcile, onToggleInactive }) {
  const [open, setOpen]   = useState(false);
  const [pos,  setPos]    = useState({top:0,left:0});
  const btnRef = useRef();
  const menuRef = useRef();

  const openMenu = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    // Open below, align right edge to button right edge
    setPos({ top: r.bottom + 4, left: r.right - 160 });
    setOpen(true);
  };

  useEffect(()=>{
    if (!open) return;
    const h = e => {
      if (!btnRef.current?.contains(e.target) && !menuRef.current?.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  },[open]);

  const pick = fn => { setOpen(false); fn(); };

  return (
    <div className="coa-menu-wrap">
      <button ref={btnRef} className={`coa-menu-btn${open?" open":""}`} onClick={open?()=>setOpen(false):openMenu}>
        Actions <span className="caret">▾</span>
      </button>
      {open && (
        <div ref={menuRef} className="coa-menu-dropdown"
          style={{position:"fixed", top:pos.top, left:Math.max(4,pos.left)}}>
          <button className="coa-menu-item" onClick={()=>pick(onEdit)}>
            ✎ &nbsp;Edit
          </button>
          {isReconType && !account.inactive && (
            <button className="coa-menu-item accent" onClick={()=>pick(onReconcile)}>
              ✓ &nbsp;Reconcile
            </button>
          )}
          <div className="coa-menu-divider"/>
          <button className={`coa-menu-item ${account.inactive?"success":"danger"}`}
            onClick={()=>pick(onToggleInactive)}>
            {account.inactive ? "● Activate" : "○ Deactivate"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EDITABLE FIELD — click to rename inline
// ─────────────────────────────────────────────────────────────────────────────
function EditableField({ value, onChange, style={}, className="" }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value);
  const ref = useRef();
  useEffect(()=>{ if(editing) ref.current?.select(); },[editing]);
  const save = () => { onChange(draft.trim()||value); setEditing(false); };
  if (editing) return (
    <input ref={ref} value={draft}
      onChange={e=>setDraft(e.target.value)}
      onBlur={save}
      onKeyDown={e=>{ if(e.key==="Enter")save(); if(e.key==="Escape"){setDraft(value);setEditing(false);} }}
      style={{background:"transparent",border:"none",borderBottom:"1px solid var(--accent)",outline:"none",
        fontFamily:"inherit",fontSize:"inherit",fontWeight:"inherit",color:"inherit",
        letterSpacing:"inherit",textTransform:"inherit",width:Math.max((draft.length||1)*0.65+2,6)+"em",...style}}
    />
  );
  return (
    <span className={className} style={{cursor:"text",...style}} title="Click to rename"
      onClick={()=>{setDraft(value);setEditing(true);}}>
      {value}<span style={{fontSize:10,opacity:.35,marginLeft:5,fontFamily:"DM Mono,monospace",fontWeight:"normal",textTransform:"none",letterSpacing:"normal"}}>✎</span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function FinanceApp() {
  const [page,           setPage]          = useState("classify");
  const [transactions,   setTransactions]  = useState([]);
  const [sources,        setSources]       = useState([]);
  const [activeSrcId,    setActiveSrcId]   = useState("all");
  const [accounts,       setAccounts]      = useState(DEFAULT_ACCOUNTS);
  const [rules,          setRules]         = useState([]);
  const [startDate,      setStartDate]     = useState(null);
  const [endDate,        setEndDate]       = useState(null);
  const [drillAccount,   setDrillAccount]  = useState(null);
  const [themeName,      setThemeName]     = useState("Obsidian");
  const [manualJEs,      setManualJEs]     = useState([]);
  const [accountOrder,   setAccountOrder]  = useState(null);
  const [coaDragId,      setCoaDragId]     = useState(null);
  const [coaDragOverId,  setCoaDragOverId] = useState(null);
  const [showCoaInactive,setShowCoaInactive]= useState(false);
  const [trendMode,      setTrendMode]     = useState("standard");
  const [trendPeriod,    setTrendPeriod]   = useState("month");
  const [reportColWidth, setReportColWidth] = useState(140);
  const [excludedTxns,   setExcludedTxns]  = useState(new Set());
  const [reconciliations, setReconciliations] = useState({});
  const [reconAccount,    setReconAccount]    = useState(null);
  const [customTheme,     setCustomTheme]     = useState(null);
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [customReportTheme,     setCustomReportTheme]     = useState({...DEFAULT_REPORT_THEME});
  const [dataLoaded,            setDataLoaded]            = useState(false);
  const [splitTxn,        setSplitTxn]        = useState(null);   // transaction being split
  const [globalSearch,    setGlobalSearch]    = useState("");
  const [showSearch,      setShowSearch]      = useState(false);
  const [showReportThemeEditor, setShowReportThemeEditor] = useState(false);
  const [reportNames,    setReportNames]   = useState({
    company: "My Company",
    pnl:     "Income Statement",
    balance: "Balance Sheet",
    cashflow:"Statement of Cash Flows",
  });

  // modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPreCatModal, setShowPreCatModal] = useState(false);
  const [showAcctModal,   setShowAcctModal]   = useState(false);
  const [modalAccount,    setModalAccount]    = useState(null);
  const [showRuleModal,   setShowRuleModal]   = useState(false);
  const [modalRule,       setModalRule]       = useState(null);

  // ── Import ────────────────────────────────────────────────────────────────
  // sourceId = chart-of-accounts account id (e.g. "1001")
  // sourceName = display name for the tab
  const handleImport = useCallback((csvText, sourceId, sourceName) => {
    const parsed = parseCSV(csvText, sourceId);
    const withRules = parsed.map(t => {
      const matched = applyRules(t, rules);
      return matched ? {...t, accountId: matched} : t;
    });
    // Add/update the sources list (keyed by account id)
    setSources(prev => {
      const exists = prev.find(s => s.id === sourceId);
      if (exists) {
        setTransactions(pr => {
          const ids = new Set(pr.map(t => t.description + t.amount + t.date + t.sourceId));
          return [...pr, ...withRules.filter(t => !ids.has(t.description + t.amount + t.date + t.sourceId))];
        });
        return prev;
      }
      setTransactions(pr => {
        const ids = new Set(pr.map(t => t.description + t.amount + t.date));
        return [...pr, ...withRules.filter(t => !ids.has(t.description + t.amount + t.date))];
      });
      return [...prev, { id: sourceId, name: sourceName }];
    });
    setActiveSrcId(sourceId);
    setPage("classify");
  }, [rules]);

  // ── Classify ──────────────────────────────────────────────────────────────
  const classify = useCallback((txnId, accountId) => {
    setTransactions(prev => prev.map(t => t.id===txnId ? {...t, accountId: accountId||null, splits: null} : t));
  }, []);

  const saveSplit = useCallback((txnId, splits) => {
    // Primary accountId = first split's account; splits array stored for display & accounting
    setTransactions(prev => prev.map(t =>
      t.id===txnId ? {...t, accountId: splits[0].accountId, splits} : t
    ));
  }, []);

  const applyAllRules = useCallback(() => {
    setTransactions(prev => prev.map(t => {
      const m = applyRules(t, rules);
      return m ? {...t, accountId:m} : t;
    }));
  }, [rules]);

  // ── Transfer matching ─────────────────────────────────────────────────────
  const matchTransfer = useCallback((anchorId, counterpartId) => {
    const matchId = `match-${Date.now()}`;
    setTransactions(prev => {
      const anchor      = prev.find(t => t.id === anchorId);
      const counterpart = prev.find(t => t.id === counterpartId);
      if (!anchor || !counterpart) return prev;
      return prev.map(t => {
        if (t.id === anchorId)      return { ...t, transferMatchId: matchId };
        if (t.id === counterpartId) return { ...t, accountId: anchor.sourceId, transferMatchId: matchId };
        return t;
      });
    });
  }, []);

  // ── Accounts ──────────────────────────────────────────────────────────────
  const saveAccount = acct => {
    setAccounts(prev => {
      const e = prev.find(a=>a.id===acct.id);
      return e ? prev.map(a=>a.id===acct.id?acct:a) : [...prev,acct];
    });
    setShowAcctModal(false); setModalAccount(null);
  };
  const toggleAccountInactive = id => setAccounts(prev=>prev.map(a=>a.id===id?{...a,inactive:!a.inactive}:a));

  const completeReconciliation = useCallback((acctId,date,balance,clearedIds)=>{
    setReconciliations(prev=>({...prev,[acctId]:{lastDate:date,lastBalance:balance}}));
    setTransactions(prev=>prev.map(t=>clearedIds.includes(t.id)?{...t,reconciled:true}:t));
    setReconAccount(null);
  },[]);

  // ── Rules ─────────────────────────────────────────────────────────────────
  const saveRule = rule => {
    setRules(prev=>{ const e=prev.find(r=>r.id===rule.id); return e?prev.map(r=>r.id===rule.id?rule:r):[...prev,rule]; });
    setShowRuleModal(false); setModalRule(null);
  };

  const postJournalEntry = useCallback((je) => {
    setManualJEs(prev => {
      const exists = prev.find(e=>e.id===je.id);
      return exists ? prev.map(e=>e.id===je.id?je:e) : [...prev, je];
    });
  }, []);

  const orderedAccounts = useMemo(()=>{
    if (!accountOrder) return accounts;
    const map=Object.fromEntries(accounts.map(a=>[a.id,a]));
    const ordered=accountOrder.filter(id=>map[id]).map(id=>map[id]);
    const rest=accounts.filter(a=>!accountOrder.includes(a.id));
    return [...ordered,...rest];
  },[accounts,accountOrder]);

  const activeAccounts = useMemo(()=>accounts.filter(a=>!a.inactive),[accounts]);

  const excludeTxn  = useCallback((id)=>setExcludedTxns(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;}),[]);
  const deleteTxn   = useCallback((id)=>setTransactions(prev=>prev.filter(t=>t.id!==id)),[]);

  const handlePreCatImport = useCallback((rows) => {
    setTransactions(prev => {
      const ids = new Set(prev.map(t=>t.id));
      return [...prev, ...rows.filter(r=>!ids.has(r.id))];
    });
  }, []);
  const updateTxn   = useCallback((id,changes)=>setTransactions(prev=>prev.map(t=>t.id===id?{...t,...changes}:t)),[]);

  // ── Computed ──────────────────────────────────────────────────────────────
  const acctById = useMemo(()=>Object.fromEntries(accounts.map(a=>[a.id,a])),[accounts]);

  // All bank-feed accounts (always shown as tabs even with no imports)
  const bankFeedAccounts = useMemo(()=>accounts.filter(a=>a.isBankFeed),[accounts]);

  // Merged tab list: bank-feed accounts + any imported source not already covered
  const tabList = useMemo(()=>{
    const feedIds = new Set(bankFeedAccounts.map(a=>a.id));
    const extraSources = sources.filter(s=>!feedIds.has(s.id));
    return [
      ...bankFeedAccounts.map(a=>({id:a.id, name:a.name})),
      ...extraSources,
    ];
  },[bankFeedAccounts, sources]);

  // Auto-select first tab when tabList is available and nothing is selected
  useEffect(()=>{
    if (tabList.length>0 && activeSrcId==="all") {
      setActiveSrcId(tabList[0].id);
    }
  },[tabList]);

  // Transactions scoped to active source
  const sourceTxns = useMemo(()=>{
    if (activeSrcId==="all") return transactions;
    return transactions.filter(t=>t.sourceId===activeSrcId);
  },[transactions, activeSrcId]);

  // All classified txns filtered by date range (for reports)
  const reportTxns = useMemo(()=>{
    return transactions.filter(t=>t.accountId&&!excludedTxns.has(t.id)&&inRange(t.date,startDate,endDate));
  },[transactions,startDate,endDate,excludedTxns]);

  // Build journal entries for all classified+dated transactions + manual JEs
  const journalEntries = useMemo(()=>{
    const txnEntries = [];

    reportTxns.filter(t => t.accountId).forEach(t => {
      const srcAcct = t.sourceId ? acctById[t.sourceId] : null;

      // Split transaction — each split line posts independently
      if (t.splits && t.splits.length > 1) {
        t.splits.forEach(sp => {
          const catAcct = acctById[sp.accountId];
          if (!catAcct) return;
          const abs = Math.abs(parseFloat(sp.amount)||0);
          if (srcAcct) {
            const sign = t.amount < 0 ? -1 : 1;
            const fakeTxn = {...t, amount: sign * abs, accountId: sp.accountId};
            const e = journalEntry(fakeTxn, srcAcct, catAcct);
            if (e.debitAcctId && e.creditAcctId) txnEntries.push(e);
          } else {
            if (DEBIT_NORMAL.has(catAcct.type)) {
              txnEntries.push(t.amount < 0
                ? { debitAcctId: catAcct.id, creditAcctId: null, absAmount: abs }
                : { debitAcctId: null, creditAcctId: catAcct.id, absAmount: abs });
            } else {
              txnEntries.push(t.amount > 0
                ? { debitAcctId: null, creditAcctId: catAcct.id, absAmount: abs }
                : { debitAcctId: catAcct.id, creditAcctId: null, absAmount: abs });
            }
          }
        });
        return;
      }

      const catAcct = acctById[t.accountId];
      if (!catAcct) return;

      if (srcAcct) {
        // Full double-entry when source account is known
        const e = journalEntry(t, srcAcct, catAcct);
        if (e.debitAcctId && e.creditAcctId) {
          txnEntries.push(e);
        }
      } else {
        // No source account — post directly to the category account.
        // Use the sign of the amount to determine debit vs credit.
        // Negative amount = spending (expense) or outflow; positive = income or deposit.
        const abs = Math.abs(t.amount);
        if (DEBIT_NORMAL.has(catAcct.type)) {
          // Asset / Expense: negative amount increases balance (spending raises expense)
          if (t.amount < 0) {
            txnEntries.push({ debitAcctId: catAcct.id, creditAcctId: null, absAmount: abs });
          } else {
            txnEntries.push({ debitAcctId: null, creditAcctId: catAcct.id, absAmount: abs });
          }
        } else {
          // Revenue / Liability / Equity: positive amount increases balance (income raises revenue)
          if (t.amount > 0) {
            txnEntries.push({ debitAcctId: null, creditAcctId: catAcct.id, absAmount: abs });
          } else {
            txnEntries.push({ debitAcctId: catAcct.id, creditAcctId: null, absAmount: abs });
          }
        }
      }
    });

    // Manual journal entry lines — each debit/credit line becomes a half-entry
    manualJEs.filter(je => inRange(je.date, startDate, endDate)).forEach(je => {
      je.lines.forEach(line => {
        const dr = parseFloat(line.debit)  || 0;
        const cr = parseFloat(line.credit) || 0;
        if (dr > 0) txnEntries.push({ debitAcctId: line.accountId, creditAcctId: null,           absAmount: dr });
        if (cr > 0) txnEntries.push({ debitAcctId: null,            creditAcctId: line.accountId, absAmount: cr });
      });
    });

    return txnEntries;
  },[reportTxns, acctById, manualJEs, startDate, endDate]);

  // Account balances using proper double-entry debit/credit logic
  const totals = useMemo(()=>{
    const m={};
    accounts.forEach(a=>{ m[a.id] = accountBalance(a.id, a.type, journalEntries); });
    return m;
  },[journalEntries, accounts]);

  const orderedActiveAccounts = useMemo(()=>orderedAccounts.filter(a=>!a.inactive),[orderedAccounts]);
  const byType = type => orderedActiveAccounts.filter(a=>a.type===type).map(a=>({...a,balance:totals[a.id]||0}));
  const revenues    = byType("Revenue"),   expenses  = byType("Expense");
  const assets      = byType("Asset"),     liabilities = byType("Liability"), equity = byType("Equity");
  // For totals, sum ALL accounts of that type (not just roots) to avoid double-counting with subtreeBalance
  const totalRevenue    = revenues.reduce((s,a)=>s+a.balance,0);
  const totalExpenses   = expenses.reduce((s,a)=>s+a.balance,0);
  const netIncome       = totalRevenue - totalExpenses;
  const totalAssets     = assets.reduce((s,a)=>s+a.balance,0);
  const totalLiabilities= liabilities.reduce((s,a)=>s+a.balance,0);
  const totalEquity     = equity.reduce((s,a)=>s+a.balance,0);
  const cfSections      = CF_SECTIONS.map(sec=>({name:sec,items:activeAccounts.filter(a=>a.cashFlow===sec).map(a=>({...a,balance:totals[a.id]||0})).filter(a=>a.balance!==0)}));

  const unclassifiedCount = transactions.filter(t=>!t.accountId).length;

  // Clickable account row helper
  const DrillRow = ({a, displayAmt, amtClass, indent}) => (
    <div className={`stmt-row clickable${indent?" stmt-indent":""}`} onClick={()=>setDrillAccount(a)}>
      <span className="stmt-name">{a.name}<span className="stmt-drill">▸ view</span></span>
      <span className={`stmt-amount${amtClass?" "+amtClass:""}`}>{displayAmt}</span>
    </div>
  );

  const dateLabel = startDate||endDate ? `${startDate||"start"} → ${endDate||"today"}` : "All Periods";

  // ── Render ────────────────────────────────────────────────────────────────
  const theme = customTheme || THEMES[themeName] || THEMES["Obsidian"];
  const rTheme = {...DEFAULT_REPORT_THEME, ...(customReportTheme||{})};
  const rColStyle = {minWidth:reportColWidth, width:reportColWidth};

  // Recursive tree renderer for reports
  // Computes subtree balance (own + all descendants) so parents show even if own balance is 0
  const subtreeBalance = (allAccounts, id) => {
    const acct = allAccounts.find(a => a.id === id);
    if (!acct) return 0;
    const childTotal = allAccounts
      .filter(a => (a.parentId||"") === id)
      .reduce((s, c) => s + subtreeBalance(allAccounts, c.id), 0);
    return (acct.balance || 0) + childTotal;
  };

  const noParentId = v => !v || v === "null" || v === "undefined";

  const renderAccountTree = (allAccounts, parentId, depth, posClass, negClass) => {
    const children = depth === 0
      ? allAccounts.filter(a => noParentId(a.parentId))
      : allAccounts.filter(a => (a.parentId||"") === (parentId||""));
    return children.flatMap(a => {
      const sub = subtreeBalance(allAccounts, a.id);
      if (sub === 0) return [];
      const hasVisibleChildren = allAccounts
        .filter(c => (c.parentId||"") === a.id)
        .some(c => subtreeBalance(allAccounts, c.id) !== 0);
      const indent = depth * 14;
      return [
        <div key={a.id} className={`qb-row l${Math.min(depth+1,3)}${hasVisibleChildren?" qb-parent-row":""}`}
          style={{cursor:"pointer"}} onClick={()=>setDrillAccount(a)}>
          <span className="qb-label" style={indent?{paddingLeft:indent}:{}}>
            {depth>0?"└ ":""}{a.name}<span className="qb-hint">▸</span>
          </span>
          <span style={rColStyle} className={`qb-val${sub>0?` ${posClass}`:sub<0?` ${negClass}`:""}`}>{fmt(sub)}</span>
        </div>,
        ...renderAccountTree(allAccounts, a.id, depth+1, posClass, negClass),
      ];
    });
  };

  const PAGE_LABELS = {
    import:"Import Data", classify:"Transactions", je:"Journal Entries",
    rules:"Rules", accounts:"Chart of Accounts",
    pnl:reportNames.pnl, balance:reportNames.balance, cashflow:reportNames.cashflow,
  };

  // ── Load from server on startup, fall back to localStorage ──────────────
  useEffect(() => {
    const applyData = (d) => {
      if (d.transactions)    setTransactions(d.transactions);
      if (d.accounts)        setAccounts(d.accounts.map(a=>({
        ...a,
        parentId: (!a.parentId || a.parentId === "null" || a.parentId === "undefined") ? "" : a.parentId,
      })));
      if (d.sources)         setSources(d.sources);
      if (d.rules)           setRules(d.rules);
      if (d.manualJEs)       setManualJEs(d.manualJEs);
      if (d.accountOrder)    setAccountOrder(d.accountOrder);
      if (d.reportNames)     setReportNames(d.reportNames);
      if (d.reconciliations) setReconciliations(d.reconciliations);
      if (d.customTheme)     setCustomTheme(d.customTheme);
      if (d.themeName)       setThemeName(d.themeName);
      if (d.showCoaInactive !== undefined) setShowCoaInactive(d.showCoaInactive);
      if (d.excludedTxns)    setExcludedTxns(new Set(d.excludedTxns));
      if (d.customReportTheme) setCustomReportTheme(d.customReportTheme);
      setDataLoaded(true);
    };
    fetch(`${API}/api/data`)
      .then(r => r.json())
      .then(d => applyData(d))
      .catch(() => {
        try {
          const saved = localStorage.getItem("ledger_data");
          if (saved) applyData(JSON.parse(saved));
          else setDataLoaded(true);
        } catch(e) { setDataLoaded(true); console.warn("Could not load saved data:", e); }
      });
  }, []);

  // ── Save to server (debounced 1s) + localStorage backup ──────────────────
  useEffect(() => {
    if (!dataLoaded) return; // don't save until data has been loaded
    const payload = {
      transactions, accounts, sources, rules, manualJEs,
      accountOrder, reportNames, reconciliations, customTheme,
      themeName, showCoaInactive, excludedTxns: [...excludedTxns],
      customReportTheme,
    };
    try { localStorage.setItem("ledger_data", JSON.stringify(payload)); } catch(e) {}
    const tid = setTimeout(() => {
      fetch(`${API}/api/data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(e => console.warn("Could not save to server:", e));
    }, 1000);
    return () => clearTimeout(tid);
  }, [dataLoaded, transactions, accounts, sources, rules, manualJEs, accountOrder,
      reportNames, reconciliations, customTheme, themeName, showCoaInactive, excludedTxns, customReportTheme]);
  // Close search on outside click
  useEffect(()=>{
    if (!showSearch) return;
    const h = ()=>setShowSearch(false);
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[showSearch]);

  // Ensure correct viewport on mobile
  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    meta.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
  }, []);

  return (
    <>
      <style>{themeVars(theme)}{styles}{`
        :root {
          --rpt-bg: ${rTheme.bg};
          --rpt-section-bg: ${rTheme.sectionBg};
          --rpt-section-text: ${rTheme.sectionText};
          --rpt-row-text: ${rTheme.rowText};
          --rpt-row-even: ${rTheme.rowEven};
        }
        .qb-report{background:${rTheme.bg};border-color:${rTheme.border};}
        .qb-header{background:${rTheme.headerBg} !important;border-color:${rTheme.border};}
        .qb-co{color:${rTheme.headerText} !important;}
        .qb-title{color:${rTheme.headerText} !important;}
        .qb-date{color:${rTheme.headerText} !important;}
        .qb-section{background:${rTheme.sectionBg} !important;color:${rTheme.sectionText} !important;}
        .qb-subsection{background:${rTheme.sectionBg} !important;color:${rTheme.sectionText} !important;}
        .qb-row{color:${rTheme.rowText} !important;border-color:${rTheme.border};}
        .qb-row:nth-child(even){background:${rTheme.rowEven};}
        .qb-label{color:${rTheme.rowText} !important;}
        .qb-val{color:${rTheme.rowText} !important;}
        .qb-subtotal{background:${rTheme.subtotalBg} !important;border-color:${rTheme.border};}
        .qb-subtotal-label,.qb-subtotal-val{color:${rTheme.subtotalText} !important;}
        .qb-grand{background:${rTheme.grandBg} !important;border-color:${rTheme.border};}
        .qb-grand-label,.qb-grand-val{color:${rTheme.grandText} !important;}
        .qb-col-heads{background:${rTheme.subtotalBg};border-color:${rTheme.border};}
        .qb-report .pos{color:${rTheme.pos} !important;}
        .qb-report .neg{color:${rTheme.neg} !important;}
        .qb-parent-row .qb-label{color:${rTheme.sectionText} !important;}
      `}</style>
      <div className="app">

        {/* ── MOBILE HEADER ── */}
        <header className="mobile-header">
          <div className="mobile-header-row">
            <span className="mobile-logo">Ledger</span>
            <span className="mobile-page-label">{PAGE_LABELS[page]||""}</span>
            <button className="mobile-theme-btn" onClick={()=>{
              const keys=Object.keys(THEMES);
              setThemeName(k=>keys[(keys.indexOf(k)+1)%keys.length]);
            }}>
              <div style={{width:10,height:10,borderRadius:"50%",background:theme.accent}}/>
              {themeName.split(" ")[0]}
            </button>
          </div>
          {/* Account chips strip for Transactions page */}
          {page==="classify" && tabList.length>0 && (
            <div className="mobile-acct-strip">
              {tabList.map(s=>(
                <div key={s.id} className={`mobile-acct-chip${activeSrcId===s.id?" active":""}`} onClick={()=>setActiveSrcId(s.id)}>
                  {s.name}
                </div>
              ))}
            </div>
          )}
        </header>

        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-text">Ledger</div>
            <div className="logo-sub">Personal Finance</div>
          </div>

          <span className="nav-section">Workspace</span>
          <div className={`nav-item${page==="import"?" active":""}`} onClick={()=>setPage("import")}>
            <span className="nav-icon">⬆</span>Import Data
          </div>

          {/* Transactions with bank sub-tabs */}
          <div className={`nav-item${page==="classify"?" active":""}`} onClick={()=>setPage("classify")}>
            <span className="nav-icon">⊞</span>Transactions
            {unclassifiedCount>0&&<span className="nav-badge">{unclassifiedCount}</span>}
          </div>


          <div className={`nav-item${page==="rules"?" active":""}`} onClick={()=>setPage("rules")}>
            <span className="nav-icon">⚡</span>Rules
          </div>
          <div className={`nav-item${page==="je"?" active":""}`} onClick={()=>setPage("je")}>
            <span className="nav-icon">✎</span>Journal Entries
          </div>
          <div className={`nav-item${page==="accounts"?" active":""}`} onClick={()=>setPage("accounts")}>
            <span className="nav-icon">≡</span>Chart of Accounts
          </div>

          <span className="nav-section" style={{marginTop:8}}>Reports</span>
          {[
            {id:"pnl",    icon:"↑", label:reportNames.pnl},
            {id:"balance",icon:"⊖", label:"Balance Sheet"},
            {id:"cashflow",icon:"⇄",label:"Cash Flows"},
          ].map(n=>(
            <div key={n.id} className={`nav-item${page===n.id?" active":""}`} onClick={()=>setPage(n.id)}>
              <span className="nav-icon">{n.icon}</span>{n.label}
            </div>
          ))}

          <div className="sidebar-footer">
            <div className="txn-count"><span>{transactions.length}</span> transactions</div>
            <div className="txn-count" style={{marginTop:2}}>
              <span style={{color:unclassifiedCount>0?"var(--amber)":"var(--green)"}}>{unclassifiedCount}</span> uncategorized
            </div>
            <div style={{display:"flex",gap:6,marginTop:10}}>
              <button className="btn" style={{flex:1,fontSize:11,padding:"5px 0"}} onClick={()=>{
                const payload = {
                  transactions, accounts, sources, rules, manualJEs,
                  accountOrder, reportNames, reconciliations, customTheme,
                  themeName, showCoaInactive, excludedTxns: [...excludedTxns],
                  customReportTheme,
                };
                const blob = new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href=url; a.download=`ledger-backup-${new Date().toISOString().slice(0,10)}.json`;
                a.click(); URL.revokeObjectURL(url);
              }} title="Download a backup of all your data">⬇ Export</button>
              <label className="btn" style={{flex:1,fontSize:11,padding:"5px 0",textAlign:"center",cursor:"pointer"}} title="Restore from a previous backup">
                ⬆ Import
                <input type="file" accept=".json" style={{display:"none"}} onChange={e=>{
                  const file=e.target.files[0]; if(!file) return;
                  const reader=new FileReader();
                  reader.onload=ev=>{
                    try {
                      const d=JSON.parse(ev.target.result);
                      if(d.transactions)    setTransactions(d.transactions);
                      if(d.accounts)        setAccounts(d.accounts);
                      if(d.sources)         setSources(d.sources);
                      if(d.rules)           setRules(d.rules);
                      if(d.manualJEs)       setManualJEs(d.manualJEs);
                      if(d.accountOrder)    setAccountOrder(d.accountOrder);
                      if(d.reportNames)     setReportNames(d.reportNames);
                      if(d.reconciliations) setReconciliations(d.reconciliations);
                      if(d.customTheme)     setCustomTheme(d.customTheme);
                      if(d.themeName)       setThemeName(d.themeName);
                      if(d.showCoaInactive!==undefined) setShowCoaInactive(d.showCoaInactive);
                      if(d.excludedTxns)    setExcludedTxns(new Set(d.excludedTxns));
                      if(d.customReportTheme) setCustomReportTheme(d.customReportTheme);
                      alert("Data imported successfully!");
                    } catch(err){ alert("Could not read file. Make sure it's a valid ledger backup."); }
                  };
                  reader.readAsText(file); e.target.value="";
                }}/>
              </label>
            </div>
          </div>
          <div className="theme-picker">
            <span className="theme-label">App Theme</span>
            <select className="theme-select" value={customTheme?"Custom":themeName}
              onChange={e=>{ if(e.target.value==="Custom"){setShowThemeEditor(true);}else{setCustomTheme(null);setThemeName(e.target.value);} }}>
              {Object.keys(THEMES).map(t=><option key={t}>{t}</option>)}
              <option value="Custom">Custom…</option>
            </select>
            <div style={{width:14,height:14,borderRadius:"50%",background:theme.accent,cursor:"pointer",flexShrink:0,border:"1px solid var(--border2)"}} title="Edit colours" onClick={()=>setShowThemeEditor(true)}/>
          </div>
          <div className="theme-picker" style={{marginTop:4}}>
            <span className="theme-label">Report Theme</span>
            <button className="btn btn-ghost" style={{fontSize:11,padding:"3px 10px",flex:1}} onClick={()=>setShowReportThemeEditor(true)}>
              {customReportTheme?"Custom ✎":"Customise…"}
            </button>
            {customReportTheme && <button className="btn btn-ghost" style={{fontSize:11,padding:"3px 8px",color:"var(--text3)"}} onClick={()=>setCustomReportTheme({...DEFAULT_REPORT_THEME})} title="Reset report theme">✕</button>}
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">
          <div className="page">
            {/* ── GLOBAL SEARCH ── */}
            <div style={{position:"relative",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:8,background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"6px 12px"}}>
                <span style={{color:"var(--text3)",fontSize:14}}>🔍</span>
                <input
                  value={globalSearch}
                  onChange={e=>{setGlobalSearch(e.target.value);setShowSearch(!!e.target.value);}}
                  onFocus={()=>{if(globalSearch)setShowSearch(true);}}
                  placeholder="Search transactions by description or amount…"
                  style={{flex:1,background:"transparent",border:"none",outline:"none",color:"var(--text)",fontSize:13,fontFamily:"DM Sans,sans-serif"}}
                />
                {globalSearch && <button onClick={()=>{setGlobalSearch("");setShowSearch(false);}}
                  style={{background:"none",border:"none",color:"var(--text3)",cursor:"pointer",fontSize:16,lineHeight:1}}>×</button>}
              </div>
              {showSearch && globalSearch && (()=>{
                const q = globalSearch.toLowerCase();
                const results = transactions.filter(t=>{
                  const descMatch = (t.description||"").toLowerCase().includes(q);
                  const amtMatch  = String(Math.abs(t.amount||0)).includes(q) || fmt(t.amount).includes(q);
                  return descMatch || amtMatch;
                }).slice(0,25);
                const acctById2 = Object.fromEntries(accounts.map(a=>[a.id,a]));
                return (
                  <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,boxShadow:"0 8px 32px rgba(0,0,0,.25)",zIndex:200,maxHeight:360,overflowY:"auto"}}>
                    {results.length===0
                      ? <div style={{padding:"16px 18px",color:"var(--text3)",fontSize:13}}>No transactions match "{globalSearch}"</div>
                      : <>
                          <div style={{padding:"8px 14px 4px",fontSize:10,color:"var(--text3)",fontFamily:"DM Mono,monospace",textTransform:"uppercase",letterSpacing:"1px",borderBottom:"1px solid var(--border)"}}>
                            {results.length} result{results.length!==1?"s":""}
                          </div>
                          {results.map(t=>{
                            const acct = t.accountId ? acctById2[t.accountId] : null;
                            return (
                              <div key={t.id} style={{padding:"9px 16px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}
                                onClick={()=>{setActiveSrcId(t.sourceId||"all");setPage("classify");setShowSearch(false);setGlobalSearch("");}}>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{fontSize:13,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.description}</div>
                                  <div style={{fontSize:11,color:"var(--text3)",fontFamily:"DM Mono,monospace",marginTop:1}}>{t.date}</div>
                                </div>
                                <div style={{textAlign:"right",flexShrink:0}}>
                                  <div style={{fontSize:13,fontFamily:"DM Mono,monospace",color:t.amount>=0?"var(--green)":"var(--red)"}}>{fmt(t.amount)}</div>
                                  {acct && <div style={{fontSize:10,color:"var(--text3)",marginTop:1}}>{acct.name}</div>}
                                </div>
                              </div>
                            );
                          })}
                        </>
                    }
                  </div>
                );
              })()}
            </div>
            {page==="import" && (
              <>
                <div className="page-title">Import Bank Data</div>
                <div className="page-sub">Upload CSV exports from your bank accounts and credit cards.</div>

                <div className="upload-zone" onClick={()=>setShowImportModal(true)}>
                  <div className="upload-icon">📂</div>
                  <div className="upload-title">Click to import a CSV file</div>
                  <div className="upload-hint">You'll name the account (e.g. Chase Checking, Amex Gold)</div>
                  <div className="upload-format">Supports: date, description, amount columns</div>
                </div>

                {sources.length>0 && (
                  <div className="card" style={{marginTop:20}}>
                    <div className="card-title">Imported Accounts</div>
                    <div className="table-wrap">
                      <table>
                        <thead><tr><th>Account</th><th>Transactions</th><th>Uncategorized</th><th></th></tr></thead>
                        <tbody>
                          {sources.map(s=>{
                            const stxns = transactions.filter(t=>t.sourceId===s.id);
                            const unc   = stxns.filter(t=>!t.accountId).length;
                            return (
                              <tr key={s.id}>
                                <td style={{color:"var(--text)",fontWeight:500}}>{s.name}</td>
                                <td className="font-mono">{stxns.length}</td>
                                <td><span style={{color:unc>0?"var(--amber)":"var(--green)"}}>{unc}</span></td>
                                <td>
                                  <button className="btn btn-ghost btn-sm" onClick={()=>{setActiveSrcId(s.id);setPage("classify");}}>View →</button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="card" style={{marginTop:14}}>
                  <div className="card-title">Expected CSV Format</div>
                  <div style={{fontFamily:"DM Mono,monospace",fontSize:12,color:"var(--text2)",background:"var(--surface2)",padding:"11px 14px",borderRadius:8,lineHeight:1.8}}>
                    date, description, amount<br/>
                    2024-01-15, Grocery Store, -87.43<br/>
                    2024-01-16, Paycheck Direct Deposit, 3500.00
                  </div>
                </div>
              </>
            )}

            {/* ── TRANSACTIONS ── */}
            {page==="classify" && (
              <>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
                  <div>
                    <div className="page-title">
                      {(()=>{ const s=tabList.find(t=>t.id===activeSrcId); return s?s.name:"Transactions"; })()}
                    </div>
                    <div className="page-sub">Classify transactions, or use bulk actions and rules.</div>
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:6}}>
                  <button className="btn btn-primary btn-sm" onClick={()=>setShowImportModal(true)}>+ Import CSV</button>
                  <button className="btn btn-ghost btn-sm" onClick={()=>setShowPreCatModal(true)}>+ Import Pre-Categorized</button>
                </div>
                </div>

                {/* Bank tabs — show if there are feed accounts OR imported sources */}
                {tabList.length>0 && (
                  <div className="bank-tabs mob-hide-on-mobile">
                    {tabList.map(s=>{
                      const unc = transactions.filter(t=>t.sourceId===s.id&&!t.accountId).length;
                      return (
                        <div key={s.id} className={`bank-tab${activeSrcId===s.id?" active":""}`} onClick={()=>setActiveSrcId(s.id)}>
                          {s.name}
                          {unc>0&&<span className="bank-tab-badge" style={{background:"rgba(251,191,36,.15)",color:"var(--amber)"}}>{unc}</span>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {sourceTxns.length===0
                  ? <div className="empty"><div className="empty-icon">📋</div><div className="empty-title">No transactions yet</div><div style={{fontSize:13,color:"var(--text3)"}}>Import a CSV file to get started.</div></div>
                  : <TxnTable
                      key={activeSrcId}
                      transactions={sourceTxns}
                      allTransactions={transactions}
                      accounts={orderedActiveAccounts}
                      sourceAccount={activeSrcId !== "all" ? acctById[activeSrcId] : null}
                      onClassify={classify}
                      onSplit={txn=>setSplitTxn(txn)}
                      onMatchTransfer={matchTransfer}
                      onDelete={deleteTxn}
                      onUpdate={updateTxn}
                      rules={rules}
                      onApplyRules={applyAllRules}
                    />
                }
              </>
            )}

            {/* ── JOURNAL ENTRIES ── */}
            {page==="je" && (
              <JournalEntryPage
                accounts={accounts}
                postedEntries={manualJEs}
                onPost={postJournalEntry}
                onDelete={(id)=>setManualJEs(prev=>prev.filter(je=>je.id!==id))}
              />
            )}

            {/* ── RULES ── */}
            {page==="rules" && (
              <>
                <div className="page-title">Classification Rules</div>
                <div className="page-sub">Rules auto-assign accounts to transactions based on description patterns. First match wins.</div>
                <div className="toolbar"><div className="toolbar-spacer"/>
                  <button className="btn btn-primary" onClick={()=>{setModalRule(null);setShowRuleModal(true);}}>+ New Rule</button>
                </div>
                {rules.length===0
                  ? <div className="empty"><div className="empty-icon">⚡</div><div className="empty-title">No rules yet</div></div>
                  : <div className="table-wrap">
                      <table>
                        <thead><tr><th>Pattern</th><th>Match Type</th><th>Assign To</th><th style={{width:100}}>Actions</th></tr></thead>
                        <tbody>
                          {rules.map(r=>{
                            const acct = acctById[r.accountId];
                            return (
                              <tr key={r.id}>
                                <td><span style={{fontFamily:"DM Mono,monospace",fontSize:12,color:"var(--accent)",background:"rgba(200,241,53,.08)",padding:"2px 7px",borderRadius:4}}>{r.pattern}</span></td>
                                <td style={{color:"var(--text3)",fontSize:12}}>{r.matchType}</td>
                                <td>{acct?<span className="flex items-center gap-8"><span className={`badge badge-${acct.type.toLowerCase()}`}>{acct.type}</span><span style={{color:"var(--text)"}}>{acct.name}</span></span>:<span style={{color:"var(--text3)"}}>deleted</span>}</td>
                                <td><div className="flex gap-8">
                                  <button className="btn btn-ghost btn-sm" onClick={()=>{setModalRule(r);setShowRuleModal(true);}}>Edit</button>
                                  <button className="btn btn-danger btn-sm" onClick={()=>setRules(p=>p.filter(x=>x.id!==r.id))}>Del</button>
                                </div></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                }
              </>
            )}



            {/* ── CHART OF ACCOUNTS ── */}
            {page==="accounts" && (
              <>
                <div className="page-title">Chart of Accounts</div>
                <div className="page-sub">Drag ⠿ to reorder. Reconcile bank and card accounts from here.</div>
                <div className="toolbar">
                  <button className="btn btn-ghost btn-sm" onClick={()=>setShowCoaInactive(v=>!v)}>
                    {showCoaInactive ? "Hide Inactive" : "Show Inactive"}
                  </button>
                  <div className="toolbar-spacer"/>
                  <button className="btn btn-primary" onClick={()=>{setModalAccount(null);setShowAcctModal(true);}}>+ New Account</button>
                </div>
                {ACCOUNT_TYPES.map(type=>{
                  const allOfType   = orderedAccounts.filter(a=>a.type===type);
                  const visible     = showCoaInactive ? allOfType : allOfType.filter(a=>!a.inactive);
                  if (visible.length===0) return null;
                  const inactiveCount = allOfType.filter(a=>a.inactive).length;
                  const isReconType   = type==="Asset" || type==="Liability";

                  // Recursive tree flatten: each entry gets {a, depth}
                  const noParent = v => !v || v === "null" || v === "undefined";
                  const flattenTree = (parentId, depth) => {
                    return visible
                      .filter(a => depth === 0 ? noParent(a.parentId) : (a.parentId||"") === (parentId||""))
                      .flatMap(a => [
                        {a, depth},
                        ...flattenTree(a.id, depth+1),
                      ]);
                  };
                  const tree = flattenTree("", 0);

                  const doDrop = targetId => {
                    if (!coaDragId || coaDragId===targetId) return;
                    // Always derive from the currently displayed order, not the raw accounts array
                    const ids = orderedAccounts.map(a=>a.id);
                    const f=ids.indexOf(coaDragId), t2=ids.indexOf(targetId);
                    if(f<0||t2<0) return;
                    const next=[...ids]; next.splice(f,1); next.splice(t2,0,coaDragId);
                    setAccountOrder(next);
                  };
                  return (
                    <div key={type} style={{marginBottom:16}}>
                      <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:7,flexWrap:"wrap"}}>
                        <span className={`badge badge-${type.toLowerCase()}`}>{type}</span>
                        <span style={{fontSize:12,color:"var(--text3)"}}>
                          {visible.filter(a=>!a.inactive).length} active
                          {inactiveCount>0 && ` · ${inactiveCount} inactive ${showCoaInactive?"(visible)":"(hidden)"}`}
                        </span>
                      </div>
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th style={{width:28}}></th>
                              <th>Name</th>
                              <th>Cash Flow</th>
                              <th>Balance</th>
                              {isReconType && <th>Last Reconciled</th>}
                              <th style={{width:110}}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tree.map(({a, depth})=>(
                              <tr key={a.id}
                                className={[
                                  depth>0 ? "coa-sub" : "",
                                  coaDragOverId===a.id ? "coa-drag-over" : "",
                                  a.inactive ? "coa-inactive" : "",
                                ].filter(Boolean).join(" ")}
                                draggable
                                onDragStart={()=>setCoaDragId(a.id)}
                                onDragOver={e=>{e.preventDefault();setCoaDragOverId(a.id);}}
                                onDrop={e=>{e.preventDefault();doDrop(a.id);setCoaDragId(null);setCoaDragOverId(null);}}
                                onDragEnd={()=>{setCoaDragId(null);setCoaDragOverId(null);}}
                              >
                                <td><span className="coa-drag-handle">⠿</span></td>
                                <td style={{color:"var(--text)"}}>
                                  <div style={{display:"flex",alignItems:"center",gap:5,paddingLeft:depth*16}}>
                                    {depth>0 && <span style={{color:"var(--text3)",fontSize:12}}>└</span>}
                                    {a.name}
                                    {a.inactive && <span className="inactive-badge">inactive</span>}
                                  </div>
                                </td>
                                <td style={{fontSize:12,color:"var(--text3)"}}>{a.cashFlow||"—"}</td>
                                <td>
                                  <span className={`amount ${(totals[a.id]||0)>=0?"pos":"neg"}`}>
                                    {fmt(totals[a.id]||0)}
                                  </span>
                                </td>
                                {isReconType && (
                                  <td style={{fontSize:11,color:"var(--text3)",fontFamily:"DM Mono,monospace"}}>
                                    {reconciliations[a.id]?.lastDate
                                      ? <span className="last-reconciled">✓ {reconciliations[a.id].lastDate}</span>
                                      : <span>Never</span>}
                                  </td>
                                )}
                                <td>
                                  <CoaActionsMenu
                                    account={a}
                                    isReconType={isReconType}
                                    onEdit={()=>{setModalAccount(a);setShowAcctModal(true);}}
                                    onReconcile={()=>setReconAccount(a)}
                                    onToggleInactive={()=>toggleAccountInactive(a.id)}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* ── P&L ── */}
            {page==="pnl" && (
              <>
                <div className="page-title">{reportNames.pnl}</div>
                <div className="page-sub">Click any account to see its transactions.</div>

                {/* Single toolbar: date range + view columns by */}
                <div className="report-toolbar">
                  <label style={{fontSize:12,color:"var(--text3)",fontFamily:"DM Mono,monospace"}}>From</label>
                  <input type="date" value={startDate||""} onChange={e=>setStartDate(e.target.value||null)} style={{width:140}}/>
                  <span style={{color:"var(--text3)"}}>→</span>
                  <input type="date" value={endDate||""} onChange={e=>setEndDate(e.target.value||null)} style={{width:140}}/>
                  {["This Month","Last Month","This Year","All Time"].map(lbl=>{
                    const n=new Date(), y=n.getFullYear(), m=n.getMonth();
                    const ranges={"This Month":[new Date(y,m,1),new Date(y,m+1,0)],"Last Month":[new Date(y,m-1,1),new Date(y,m,0)],"This Year":[new Date(y,0,1),new Date(y,11,31)],"All Time":[null,null]};
                    const [rs,re]=ranges[lbl];
                    const fmtD=d=>d?d.toISOString().slice(0,10):null;
                    const active=startDate===fmtD(rs)&&endDate===fmtD(re);
                    return <button key={lbl} className={`date-preset${active?" on":""}`} onClick={()=>{setStartDate(fmtD(rs));setEndDate(fmtD(re));}}>{lbl}</button>;
                  })}
                  <div className="report-toolbar-sep"/>
                  <span className="view-col-label">View columns by</span>
                  <select className="view-col-select" value={trendMode==="trend"?trendPeriod:"none"}
                    onChange={e=>{ if(e.target.value==="none"){setTrendMode("standard");}else{setTrendMode("trend");setTrendPeriod(e.target.value);} }}>
                    <option value="none">Total only</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                  </select>
                </div>

                {trendMode==="standard" ? (
                  <div className="qb-report">
                    <div className="qb-header">
                      <EditableField value={reportNames.company} className="qb-co" onChange={v=>setReportNames(p=>({...p,company:v}))}/>
                      <EditableField value={reportNames.pnl} className="qb-title" onChange={v=>setReportNames(p=>({...p,pnl:v}))}/>
                      <div className="qb-date">{dateLabel}</div>
                    </div>
                    <div className="qb-col-heads"><div className="qb-col-head" style={{minWidth:reportColWidth,cursor:"col-resize",userSelect:"none"}} onMouseDown={e=>{e.preventDefault();const sx=e.clientX,sw=reportColWidth;const mm=e=>setReportColWidth(Math.max(80,sw+(e.clientX-sx)));const mu=()=>{document.removeEventListener("mousemove",mm);document.removeEventListener("mouseup",mu);};document.addEventListener("mousemove",mm);document.addEventListener("mouseup",mu);}}>Total ⟺</div></div>

                    <div className="qb-section">Income</div>
                    {renderAccountTree(revenues, "", 0, "pos", "neg")}
                    {revenues.filter(a=>a.balance!==0).length===0&&(
                      <div className="qb-row l1 no-click"><span className="qb-label italic">No income recorded</span><span className="qb-val">—</span></div>
                    )}
                    <div className="qb-subtotal l1">
                      <span className="qb-subtotal-label">Total Income</span>
                      <span style={rColStyle} className={`qb-subtotal-val${totalRevenue>0?" pos":""}`}>{fmt(totalRevenue)}</span>
                    </div>

                    <div className="qb-space"/>
                    <div className="qb-section">Expenses</div>
                    {renderAccountTree(expenses, "", 0, "neg", "pos")}
                    {expenses.filter(a=>a.balance!==0).length===0&&(
                      <div className="qb-row l1 no-click"><span className="qb-label italic">No expenses recorded</span><span className="qb-val">—</span></div>
                    )}
                    <div className="qb-subtotal l1">
                      <span className="qb-subtotal-label">Total Expenses</span>
                      <span style={rColStyle} className={`qb-subtotal-val${totalExpenses>0?" neg":""}`}>{fmt(totalExpenses)}</span>
                    </div>

                    <div className="qb-space"/>
                    <div className="qb-grand">
                      <span className="qb-grand-label">Net Income</span>
                      <span style={rColStyle} className={`qb-grand-val${netIncome>=0?" pos":" neg"}`}>{fmt(netIncome)}</span>
                    </div>
                  </div>
                ) : (
                  <TrendReport type="pnl" accounts={accounts} transactions={transactions}
                    excludedTxns={excludedTxns} startDate={startDate} endDate={endDate}
                    period={trendPeriod} onDrill={setDrillAccount} rTheme={rTheme} reportNames={reportNames}/>
                )}
              </>
            )}

            {/* ── BALANCE SHEET ── */}
            {page==="balance" && (
              <>
                <div className="page-title">{reportNames.balance}</div>
                <div className="page-sub">Click any account to see its transactions.</div>

                {/* Single toolbar */}
                <div className="report-toolbar">
                  <label style={{fontSize:12,color:"var(--text3)",fontFamily:"DM Mono,monospace"}}>As of</label>
                  <input type="date" value={endDate||""} onChange={e=>setEndDate(e.target.value||null)} style={{width:150}}/>
                  {["This Month","This Year","All Time"].map(lbl=>{
                    const n=new Date(), y=n.getFullYear(), m=n.getMonth();
                    const ends={"This Month":new Date(y,m+1,0),"This Year":new Date(y,11,31),"All Time":null};
                    const fmtD=d=>d?d.toISOString().slice(0,10):null;
                    const active=endDate===fmtD(ends[lbl]);
                    return <button key={lbl} className={`date-preset${active?" on":""}`} onClick={()=>setEndDate(fmtD(ends[lbl]))}>{lbl}</button>;
                  })}
                  <div className="report-toolbar-sep"/>
                  <span className="view-col-label">View columns by</span>
                  <select className="view-col-select" value={trendMode==="trend"?trendPeriod:"none"}
                    onChange={e=>{ if(e.target.value==="none"){setTrendMode("standard");}else{setTrendMode("trend");setTrendPeriod(e.target.value);} }}>
                    <option value="none">Total only</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                  </select>
                </div>

                {trendMode==="standard" ? (
                  <div className="qb-report">
                    <div className="qb-header">
                      <EditableField value={reportNames.company} className="qb-co" onChange={v=>setReportNames(p=>({...p,company:v}))}/>
                      <EditableField value={reportNames.balance} className="qb-title" onChange={v=>setReportNames(p=>({...p,balance:v}))}/>
                      <div className="qb-date">{endDate?`As of ${endDate}`:"All Periods"}</div>
                    </div>
                    <div className="qb-col-heads"><div className="qb-col-head" style={{minWidth:reportColWidth,cursor:"col-resize",userSelect:"none"}} onMouseDown={e=>{e.preventDefault();const sx=e.clientX,sw=reportColWidth;const mm=e=>setReportColWidth(Math.max(80,sw+(e.clientX-sx)));const mu=()=>{document.removeEventListener("mousemove",mm);document.removeEventListener("mouseup",mu);};document.addEventListener("mousemove",mm);document.addEventListener("mouseup",mu);}}>Total ⟺</div></div>

                    {/* ASSETS */}
                    <div className="qb-section">Assets</div>
                    {renderAccountTree(assets, "", 0, "pos", "neg")}
                    <div className="qb-subtotal">
                      <span className="qb-subtotal-label" style={{fontWeight:700,textTransform:"uppercase",fontSize:12}}>Total Assets</span>
                      <span style={rColStyle} className={`qb-subtotal-val${totalAssets>0?" pos":""}`}>{fmt(totalAssets)}</span>
                    </div>

                    <div className="qb-space"/><div className="qb-space"/>

                    {/* LIABILITIES & NET WORTH */}
                    <div className="qb-section">Liabilities &amp; Net Worth</div>
                    <div className="qb-section" style={{fontSize:11,fontWeight:600,paddingTop:4,paddingBottom:2}}>Liabilities</div>
                    {renderAccountTree(liabilities, "", 0, "neg", "pos")}
                    <div className="qb-subtotal l1">
                      <span className="qb-subtotal-label">Total Liabilities</span>
                      <span style={rColStyle} className={`qb-subtotal-val${totalLiabilities>0?" neg":""}`}>{fmt(totalLiabilities)}</span>
                    </div>

                    <div className="qb-space"/>
                    <div className="qb-section" style={{fontSize:11,fontWeight:600,paddingTop:4,paddingBottom:2}}>Net Worth</div>
                    {renderAccountTree(equity, "", 0, "pos", "neg")}
                    <div className="qb-row l2 no-click">
                      <span className="qb-label">Net Income</span>
                      <span className={`qb-val${netIncome>=0?" pos":" neg"}`}>{fmt(netIncome)}</span>
                    </div>
                    <div className="qb-subtotal l1">
                      <span className="qb-subtotal-label">Total Net Worth</span>
                      <span className="qb-subtotal-val">{fmt(totalEquity+netIncome)}</span>
                    </div>

                    <div className="qb-space"/>
                    <div className="qb-grand">
                      <span className="qb-grand-label">Total Liabilities &amp; Net Worth</span>
                      <span className="qb-grand-val">{fmt(totalLiabilities+totalEquity+netIncome)}</span>
                    </div>
                  </div>
                ) : (
                  <TrendReport type="balance" accounts={accounts} transactions={transactions}
                    excludedTxns={excludedTxns} startDate={startDate} endDate={endDate}
                    period={trendPeriod} onDrill={setDrillAccount} rTheme={rTheme} reportNames={reportNames}/>
                )}
              </>
            )}

            {/* ── CASH FLOWS ── */}
            {page==="cashflow" && (
              <>
                <div className="page-title">{reportNames.cashflow}</div>
                <div className="page-sub">Cash movements organized by activity type.</div>
                <DateRangeBar startDate={startDate} endDate={endDate} onChange={(s,e)=>{setStartDate(s);setEndDate(e);}}/>
                <div className="qb-report">
                  <div className="qb-header">
                    <EditableField value={reportNames.company} className="qb-co" onChange={v=>setReportNames(p=>({...p,company:v}))}/>
                    <EditableField value={reportNames.cashflow} className="qb-title" onChange={v=>setReportNames(p=>({...p,cashflow:v}))}/>
                    <div className="qb-date">{dateLabel}</div>
                  </div>
                  <div className="qb-col-heads"><div className="qb-col-head">Amount</div></div>

                  {cfSections.map(sec=>{
                    const total=sec.items.reduce((s,a)=>s+a.balance,0);
                    return (
                      <React.Fragment key={sec.name}>
                        <div className="qb-section">{sec.name} Activities</div>
                        {sec.items.length===0
                          ? <div className="qb-row l1 no-click"><span className="qb-label italic">No accounts assigned to {sec.name}</span><span className="qb-val">—</span></div>
                          : sec.items.map(a=>(
                              <div key={a.id} className="qb-row l1" onClick={()=>setDrillAccount(a)}>
                                <span className="qb-label">{a.name}<span className="qb-hint">▸</span></span>
                                <span className={`qb-val${a.balance>0?" pos":a.balance<0?" neg":""}`}>{fmt(a.balance)}</span>
                              </div>
                            ))
                        }
                        <div className="qb-subtotal l1">
                          <span className="qb-subtotal-label">Net Cash — {sec.name} Activities</span>
                          <span style={rColStyle} className={`qb-subtotal-val${total>=0?" pos":" neg"}`}>{fmt(total)}</span>
                        </div>
                        <div className="qb-space"/>
                      </React.Fragment>
                    );
                  })}
                  {(()=>{
                    const nc=cfSections.reduce((s,sec)=>s+sec.items.reduce((ss,a)=>ss+a.balance,0),0);
                    return (
                      <div className="qb-grand">
                        <span className="qb-grand-label">Net Change in Cash</span>
                        <span style={rColStyle} className={`qb-grand-val${nc>=0?" pos":" neg"}`}>{fmt(nc)}</span>
                      </div>
                    );
                  })()}
                </div>
              </>
            )}



          </div>
        </main>

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav className="mobile-nav">
          <div className="mobile-nav-items">
            {MOBILE_NAV.map(n=>(
              <button key={n.id} className={`mob-nav-item${page===n.id?" active":""}`}
                onClick={()=>setPage(n.id)}>
                <div className="mob-nav-icon-wrap">
                  <span className="mob-nav-icon">{n.icon}</span>
                  {n.id==="classify" && unclassifiedCount>0 && (
                    <span className="mob-nav-badge">{unclassifiedCount}</span>
                  )}
                </div>
                <span>{n.label}</span>
              </button>
            ))}
          </div>
        </nav>

      </div>

      {/* MODALS */}
      {showImportModal  && <ImportModal  accounts={activeAccounts} onImport={handleImport} onClose={()=>setShowImportModal(false)}/>}
      {showPreCatModal  && <PreCatImportModal accounts={activeAccounts} onImport={handlePreCatImport} onClose={()=>setShowPreCatModal(false)}/>}
      {showAcctModal    && <AccountModal account={modalAccount}  accounts={accounts} onSave={saveAccount}  onClose={()=>{setShowAcctModal(false);setModalAccount(null);}}/>}
      {showRuleModal    && <RuleModal    rule={modalRule}        accounts={activeAccounts}   onSave={saveRule}    onClose={()=>{setShowRuleModal(false);setModalRule(null);}}/>}
      {reconAccount     && <ReconcileModal account={reconAccount} transactions={transactions}
        manualJEs={manualJEs} accounts={accounts}
        onUpdate={(id,fields)=>setTransactions(prev=>prev.map(t=>t.id===id?{...t,...fields}:t))}
        onComplete={completeReconciliation} onClose={()=>setReconAccount(null)}/>}
      {showThemeEditor  && <CustomThemeModal currentTheme={theme}
        onSave={t=>{ if(t){setCustomTheme(t);setThemeName("Custom");}else{setCustomTheme(null);setThemeName("Obsidian");} }}
        onClose={()=>setShowThemeEditor(false)}/>}
      {showReportThemeEditor && <ReportThemeModal currentTheme={customReportTheme}
        onSave={t=>{ setCustomReportTheme(t || {...DEFAULT_REPORT_THEME}); }}
        onClose={()=>setShowReportThemeEditor(false)}/>}
      {splitTxn && <SplitModal transaction={splitTxn} accounts={activeAccounts}
        onSave={saveSplit} onClose={()=>setSplitTxn(null)}/>}
      {drillAccount     && <DrillModal   account={drillAccount}  transactions={transactions} manualJEs={manualJEs} allAccounts={accounts} startDate={startDate} endDate={endDate} onClose={()=>setDrillAccount(null)} onUpdate={updateTxn} onDelete={deleteTxn} onExclude={(id)=>setExcludedTxns(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;})} excludedTxns={excludedTxns}
        onEditJE={jeOrAction=>{
          if (jeOrAction?._delete) {
            setManualJEs(prev=>prev.filter(e=>e.id!==jeOrAction.id));
          } else {
            setManualJEs(prev=>{ const ex=prev.find(e=>e.id===jeOrAction.id); return ex?prev.map(e=>e.id===jeOrAction.id?jeOrAction:e):[...prev,jeOrAction]; });
          }
        }}/>}
    </>
  );
}
