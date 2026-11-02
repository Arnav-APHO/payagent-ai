// PayAgent AI Frontend Controller (PayPal + AG Grid)

let gridApi = null;
let currentPlan = null;

// Status Badge Cell Renderer
function StatusCellRenderer(params) {
  const status = params.value || 'PENDING';
  let badgeClass = 'bg-slate-800 text-slate-300';
  let icon = 'fa-clock';

  if (status === 'COMPLETED') {
    badgeClass = 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    icon = 'fa-check';
  } else if (status === 'REQUIRES_APPROVAL') {
    badgeClass = 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    icon = 'fa-triangle-exclamation';
  } else if (status === 'REJECTED') {
    badgeClass = 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
    icon = 'fa-ban';
  }

  return `
    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${badgeClass}">
      <i class="fa-solid ${icon}"></i> ${status}
    </span>
  `;
}

// Risk / Anomaly Cell Renderer
function RiskCellRenderer(params) {
  const risk = params.data.riskLevel || 'LOW';
  const score = params.data.anomalyScore !== undefined ? params.data.anomalyScore.toFixed(2) : '0.00';
  let badgeClass = 'text-emerald-400';
  let icon = 'fa-shield-halved';

  if (risk === 'HIGH' || risk === 'CRITICAL') {
    badgeClass = 'text-rose-400 font-bold';
    icon = 'fa-triangle-exclamation';
  } else if (risk === 'MEDIUM') {
    badgeClass = 'text-amber-400';
  }

  return `
    <span class="inline-flex items-center gap-1 text-[11px] ${badgeClass}">
      <i class="fa-solid ${icon}"></i> ${score} (${risk})
    </span>
  `;
}

// Amount Cell Renderer
function AmountCellRenderer(params) {
  const val = Number(params.value || 0).toFixed(2);
  return `<span class="font-bold text-slate-100">$${val} <span class="text-[10px] text-slate-400 font-normal">USD</span></span>`;
}

// Timestamp Cell Renderer
function TimeCellRenderer(params) {
  if (!params.value) return '';
  const d = new Date(params.value);
  return `<span class="text-slate-400 text-[11px]">${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; ${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>`;
}

// AG Grid Column Definitions
const columnDefs = [
  { field: 'id', headerName: 'Tx ID', width: 105, pinned: 'left', cellClass: 'font-mono text-indigo-400 text-xs font-semibold' },
  { field: 'timestamp', headerName: 'Timestamp', width: 130, cellRenderer: TimeCellRenderer },
  { 
    field: 'agentName', 
    headerName: 'Agent Source', 
    width: 160,
    cellRenderer: (p) => `<span class="flex items-center gap-1.5 text-slate-200"><i class="fa-solid fa-robot text-indigo-400 text-[11px]"></i> ${p.value || 'Agent'}</span>`
  },
  { field: 'vendor', headerName: 'Vendor', width: 150 },
  { field: 'category', headerName: 'Category', width: 135 },
  { field: 'amountPaid', headerName: 'Amount', width: 120, cellRenderer: AmountCellRenderer },
  { field: 'status', headerName: 'Status', width: 165, cellRenderer: StatusCellRenderer },
  { field: 'riskLevel', headerName: 'Anomaly Guard', width: 145, cellRenderer: RiskCellRenderer },
  { field: 'paypalOrderId', headerName: 'PayPal Order ID', width: 190, cellClass: 'font-mono text-[11px] text-slate-400' }
];

// Grid Options
const gridOptions = {
  columnDefs: columnDefs,
  rowData: [],
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: false,
  },
  rowHeight: 44,
  headerHeight: 40,
  animateRows: true,
  pagination: true,
  paginationPageSize: 10,
  paginationPageSizeSelector: [10, 20, 50],
  onGridReady: (params) => {
    gridApi = params.api;
    gridApi.sizeColumnsToFit();
    loadLedgerData();
  }
};

// Fetch Ledger Data & Update Metrics
async function loadLedgerData() {
  try {
    const res = await fetch('/api/ledger');
    const json = await res.json();
    if (gridApi) {
      gridApi.setGridOption('rowData', json.data);
    }

    // Update Top Stat Badges
    document.getElementById('stat-volume').innerText = `$${json.metrics.totalVolume.toFixed(2)}`;
    document.getElementById('stat-completed').innerText = json.metrics.completedCount;
    document.getElementById('stat-pending').innerText = json.metrics.pendingCount;
    document.getElementById('stat-anomaly').innerText = json.metrics.avgAnomalyScore;
  } catch (err) {
    console.error('Failed to load ledger data:', err);
  }
}

// Log message to Agent Terminal with timestamp
function logToTerminal(msg, type = 'info') {
  const terminal = document.getElementById('agent-terminal');
  const div = document.createElement('div');
  const now = new Date().toLocaleTimeString();

  let color = 'text-slate-300';
  if (type === 'warn') color = 'text-amber-400 font-medium';
  if (type === 'success') color = 'text-emerald-400 font-bold';
  if (type === 'error') color = 'text-rose-400 font-bold';
  if (type === 'step') color = 'text-indigo-400 font-semibold';

  div.className = `${color} leading-relaxed`;
  div.innerHTML = `<span class="text-slate-500">[${now}]</span> ${msg}`;
  terminal.appendChild(div);
  terminal.scrollTop = terminal.scrollHeight;
}

// Execute Agent Planning
async function runAgent() {
  const prompt = document.getElementById('agent-prompt').value.trim();
  const maxBudget = document.getElementById('agent-budget').value;
  if (!prompt) return;

  const btn = document.getElementById('btn-run-agent');
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Reasoning...`;

  logToTerminal(`🚀 Received instruction: "${prompt}"`, 'step');
  logToTerminal(`🔍 Inspecting authorized budget ceiling: $${maxBudget}`, 'info');

  try {
    const res = await fetch('/api/agent/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, maxBudget })
    });
    const data = await res.json();
    currentPlan = data.plan;

    // Simulated reasoning progression
    setTimeout(() => {
      logToTerminal(`🤖 AI Agent classified domain: [${currentPlan.parsedCategory}]`, 'info');
      logToTerminal(`📊 Vendor evaluation: Selected "${currentPlan.vendor}" ($${currentPlan.totalAmount.toFixed(2)})`, 'info');
    }, 400);

    setTimeout(() => {
      if (currentPlan.riskLevel === 'HIGH' || currentPlan.riskLevel === 'CRITICAL') {
        logToTerminal(`⚠️ Anomaly Guard Alert! Score: ${currentPlan.anomalyScore} (${currentPlan.riskLevel})`, 'error');
        logToTerminal(`🛑 ${currentPlan.explanation}`, 'warn');
        displayPlan(currentPlan, true);
      } else {
        logToTerminal(`✅ Anomaly Guard passed: Risk score ${currentPlan.anomalyScore} (Nominal)`, 'success');
        logToTerminal(`💳 Prepared PayPal Orders v2 payload for settlement.`, 'step');
        displayPlan(currentPlan, false);
      }
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Run Agent`;
    }, 900);

  } catch (err) {
    logToTerminal(`❌ Agent execution error: ${err.message}`, 'error');
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Run Agent`;
  }
}

// Display Plan in Card
function displayPlan(plan, isAnomaly) {
  const planDetails = document.getElementById('plan-details');
  const badge = document.getElementById('plan-status-badge');
  const vendorEl = document.getElementById('plan-vendor');
  const totalEl = document.getElementById('plan-total');
  const riskScoreEl = document.getElementById('risk-score');
  const riskBadgeEl = document.getElementById('risk-badge');
  const riskIconEl = document.getElementById('risk-icon');
  const paymentGate = document.getElementById('payment-gate-section');

  planDetails.classList.remove('hidden');
  vendorEl.innerText = plan.vendor;
  totalEl.innerText = `$${plan.totalAmount.toFixed(2)} USD`;
  riskScoreEl.innerText = plan.anomalyScore.toFixed(2);

  if (isAnomaly) {
    badge.className = 'px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30';
    badge.innerText = 'Approval Blocked';
    riskBadgeEl.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 uppercase';
    riskBadgeEl.innerText = `${plan.riskLevel} RISK`;
    riskIconEl.className = 'fa-solid fa-triangle-exclamation text-rose-400';
    paymentGate.innerHTML = `
      <div class="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300">
        <strong class="text-rose-200">Security Guard Intervention:</strong> This order exceeds authorized thresholds or triggered adversarial patterns. Manual compliance override required.
      </div>
    `;
  } else {
    badge.className = 'px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    badge.innerText = 'Ready For Settlement';
    riskBadgeEl.className = 'px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase';
    riskBadgeEl.innerText = 'Low Risk';
    riskIconEl.className = 'fa-solid fa-shield-check text-emerald-400';

    paymentGate.innerHTML = `
      <div id="paypal-button-container" class="w-full"></div>
      <button id="btn-mock-approve" class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition">
        <i class="fa-solid fa-bolt"></i> Instant Autonomous Settle (PayPal Sandbox)
      </button>
    `;

    // Render PayPal Button
    renderPayPalButtons(plan);

    // Re-bind Instant Settle Button
    document.getElementById('btn-mock-approve').addEventListener('click', () => {
      executeSettlement(plan);
    });
  }
}

// Render Real PayPal JS SDK Buttons
function renderPayPalButtons(plan) {
  const container = document.getElementById('paypal-button-container');
  if (!container || !window.paypal) return;

  container.innerHTML = ''; // clear

  try {
    window.paypal.Buttons({
      style: {
        layout: 'horizontal',
        color: 'gold',
        shape: 'rect',
        label: 'paypal',
        height: 38
      },
      createOrder: async function() {
        const res = await fetch('/api/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: plan.totalAmount.toFixed(2),
            currency: "USD",
            description: `${plan.vendor} - ${plan.userPrompt}`
          })
        });
        const order = await res.json();
        return order.id;
      },
      onApprove: async function(data) {
        logToTerminal(`✅ PayPal Checkout Approved! Capturing order ${data.orderID}...`, 'step');
        const res = await fetch('/api/paypal/capture-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: data.orderID,
            planDetails: plan
          })
        });
        const result = await res.json();
        logToTerminal(`🎉 Funds Settled! Transferred to ${plan.vendor}. Recorded in AG Grid Ledger.`, 'success');
        loadLedgerData();
      },
      onError: function(err) {
        logToTerminal(`⚠️ PayPal SDK notice: ${err.message || 'Sandbox simulated fallback active'}`, 'warn');
      }
    }).render('#paypal-button-container');
  } catch (err) {
    console.warn('PayPal Buttons rendering fallback:', err);
  }
}

// Instant Settlement Execution (Server-side PayPal v2 Simulation/Live)
async function executeSettlement(plan) {
  const settleBtn = document.getElementById('btn-mock-approve');
  if (settleBtn) {
    settleBtn.disabled = true;
    settleBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Settling via PayPal Rails...`;
  }

  logToTerminal(`⚡ Initiating automated PayPal Orders v2 creation for $${plan.totalAmount.toFixed(2)}...`, 'step');

  try {
    const createRes = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: plan.totalAmount.toFixed(2),
        currency: "USD",
        description: `${plan.vendor} - ${plan.userPrompt}`
      })
    });
    const orderData = await createRes.json();
    logToTerminal(`📝 Created PayPal Order: [${orderData.id}] (Status: ${orderData.status})`, 'info');

    // Step 2: Capture
    logToTerminal(`🔐 Executing autonomous payment capture...`, 'step');
    const captureRes = await fetch('/api/paypal/capture-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: orderData.id,
        planDetails: plan
      })
    });
    const captureData = await captureRes.json();

    logToTerminal(`🎉 Settlement Complete! Tx ID: ${captureData.transaction.id} recorded into AG Grid.`, 'success');
    
    // Refresh Grid immediately
    await loadLedgerData();

    if (settleBtn) {
      settleBtn.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-300"></i> Settled Successfully!`;
    }
  } catch (err) {
    logToTerminal(`❌ Settlement failed: ${err.message}`, 'error');
    if (settleBtn) {
      settleBtn.disabled = false;
      settleBtn.innerHTML = `<i class="fa-solid fa-bolt"></i> Instant Autonomous Settle`;
    }
  }
}

// Event Listeners Initialization
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector('#myGrid');
  agGrid.createGrid(gridDiv, gridOptions);

  // Run Agent Button
  document.getElementById('btn-run-agent').addEventListener('click', runAgent);

  // Enter key in prompt
  document.getElementById('agent-prompt').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      runAgent();
    }
  });

  // Preset Action Buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('agent-prompt').value = btn.getAttribute('data-prompt');
      document.getElementById('agent-budget').value = btn.getAttribute('data-budget');
      runAgent();
    });
  });

  // Quick Search for AG Grid
  document.getElementById('grid-search').addEventListener('input', (e) => {
    if (gridApi) {
      gridApi.setGridOption('quickFilterText', e.target.value);
    }
  });

  // Filter Chips
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => {
        c.className = 'filter-chip px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300';
      });
      chip.className = 'filter-chip px-2.5 py-1 rounded-md bg-indigo-600 text-white font-medium';

      const filter = chip.getAttribute('data-filter');
      if (!gridApi) return;

      if (filter === 'ALL') {
        gridApi.setFilterModel(null);
      } else if (filter === 'COMPLETED') {
        gridApi.setFilterModel({
          status: { filterType: 'text', type: 'equals', filter: 'COMPLETED' }
        });
      } else if (filter === 'REQUIRES_APPROVAL') {
        gridApi.setFilterModel({
          status: { filterType: 'text', type: 'equals', filter: 'REQUIRES_APPROVAL' }
        });
      } else if (filter === 'HIGH_RISK') {
        gridApi.setFilterModel({
          riskLevel: { filterType: 'text', type: 'contains', filter: 'HIGH' }
        });
      }
    });
  });

  // Export CSV
  document.getElementById('btn-export-csv').addEventListener('click', () => {
    if (gridApi) {
      gridApi.exportDataAsCsv({ fileName: 'payagent-commerce-ledger.csv' });
    }
  });

  // Refresh Grid
  document.getElementById('btn-refresh-grid').addEventListener('click', () => {
    loadLedgerData();
  });

  // Info Modal
  const modal = document.getElementById('modal-info');
  document.getElementById('btn-api-info').addEventListener('click', () => modal.classList.remove('hidden'));
  document.getElementById('btn-close-modal').addEventListener('click', () => modal.classList.add('hidden'));
  document.getElementById('btn-close-modal-2').addEventListener('click', () => modal.classList.add('hidden'));
});
