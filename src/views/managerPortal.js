/**
 * HOTEL CAPITOL — GENERAL MANAGER & EXECUTIVE PORTAL
 * 6 Animashaun Close, Ikeja, Lagos
 * 4 Priority Indicators, AI Hotel Insights, Approval Center & Automation Rules
 */

import { getIcon, renderIntercomRoundBadge } from '../assets/icons.js';
import { store } from '../store/state.js';
import { aiEngine } from '../services/aiEngine.js';
import { automationEngine } from '../services/automationRules.js';
import { learningEngine } from '../services/learningEngine.js';

let managerActiveTab = 'overview'; // 'overview' | 'learning' | 'approvals' | 'inventory' | 'automations' | 'audit'

export function initManagerPortal() {
  window.navigateManagerTab = (tab) => {
    managerActiveTab = tab;
    if (window.renderApp) window.renderApp();
  };

  window.approveManagerStockRequest = (srId) => {
    store.approveStockRequest(srId);
    automationEngine.playChime('success');
    automationEngine.showToast('Purchase Order Approved', `Stock request ${srId} approved. Vendor PO generated.`, 'success');
    if (window.renderApp) window.renderApp();
  };

  // Tolani Learning Engine Approval & Governance
  window.approveLearningSuggestion = (sugId) => {
    const res = learningEngine.approveSuggestion(sugId, 'Seyi Adeyemi (General Manager)');
    if (res.success) {
      automationEngine.playChime('success');
      automationEngine.showToast('Knowledge Update Approved', `${res.knowledgeUpdate.updateNumber} activated: "${res.knowledgeUpdate.title}"`, 'success');
      if (window.renderApp) window.renderApp();
    }
  };

  window.rejectLearningSuggestion = (sugId) => {
    learningEngine.rejectSuggestion(sugId, 'Seyi Adeyemi (General Manager)');
    automationEngine.showToast('Suggestion Rejected', `Learning proposal ${sugId} dismissed.`, 'info');
    if (window.renderApp) window.renderApp();
  };

  window.rollbackKnowledgeUpdate = (updateId) => {
    const proceed = confirm(`Are you sure you want to rollback ${updateId}? This will remove the learned intent mapping from production AI.`);
    if (!proceed) return;
    const res = learningEngine.rollbackKnowledgeUpdate(updateId, 'Seyi Adeyemi (General Manager)');
    if (res.success) {
      automationEngine.showToast('Knowledge Rolled Back', `Update ${updateId} reverted.`, 'warning');
      if (window.renderApp) window.renderApp();
    }
  };

  window.clearLearningData = () => {
    const proceed = confirm('Are you sure you want to clear all guest interaction logs and reset learning metrics? Approved production rules will remain intact.');
    if (!proceed) return;
    learningEngine.clearAllData('Seyi Adeyemi');
    automationEngine.showToast('Data Cleared', 'Guest interaction logs wiped clean.', 'info');
    if (window.renderApp) window.renderApp();
  };

  window.exportLearningAnalytics = () => {
    const data = learningEngine.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hotel-capitol-tolani-learning-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    automationEngine.showToast('Export Complete', 'Learning analytics JSON downloaded.', 'success');
  };

  window.toggleLearningActive = () => {
    const state = store.getState();
    const current = state.learningSettings?.learningActive ?? true;
    store.updateLearningSettings({ learningActive: !current });
    automationEngine.showToast('Settings Updated', `Tolani guest learning is now ${!current ? 'ACTIVE' : 'PAUSED'}.`, 'info');
    if (window.renderApp) window.renderApp();
  };

  window.saveAutomationSettings = () => {
    const bTime = document.getElementById('setting-breakfast-time')?.value || '06:00 AM';
    const rsTime = document.getElementById('setting-rs-time')?.value || '08:00 AM';
    const coMins = parseInt(document.getElementById('setting-co-mins')?.value || '45', 10);
    const delMins = parseInt(document.getElementById('setting-del-mins')?.value || '5', 10);
    const soundOn = document.getElementById('setting-sound-alerts')?.checked ?? true;
    const voiceOn = document.getElementById('setting-voice-synth')?.checked ?? true;

    store.setState(s => ({
      ...s,
      automationSettings: {
        ...s.automationSettings,
        breakfastNotificationTime: bTime,
        roomServicePromptTime: rsTime,
        checkoutReminderMinutes: coMins,
        foodDeliveryWarningMinutes: delMins,
        soundAlertsEnabled: soundOn,
        aiVoiceSynthesisEnabled: voiceOn
      }
    }));

    automationEngine.playChime('success');
    automationEngine.showToast('Automation Rules Saved', 'Operational schedules and AI automation parameters updated.', 'success');
    store.addAudit('Automation Rules Updated', 'System Config', `Updated by Manager Seyi Adeyemi`);
    if (window.renderApp) window.renderApp();
  };
}

export function renderManagerPortal() {
  const state = store.getState();
  const insights = aiEngine.getManagerInsights();
  
  const pendingApprovals = state.stockRequests.filter(sr => sr.status === 'PENDING_APPROVAL');
  const pendingSuggestions = (state.learningSuggestions || []).filter(s => s.status === 'PENDING_REVIEW');
  const lowStockItems = state.inventory.filter(i => i.status !== 'NORMAL');
  const criticalStockItems = state.inventory.filter(i => i.status === 'CRITICAL');
  const activeOrders = state.orders.filter(o => o.status !== 'DELIVERED');
  const staffOnDuty = state.staffMembers.filter(s => s.clockedIn).length;
  const totalRevenue = state.orders.reduce((sum, o) => sum + o.totalAmount, 0);

  let tabContent = '';
  if (managerActiveTab === 'overview') {
    tabContent = renderManagerOverviewTab(state, insights, criticalStockItems, pendingApprovals, activeOrders, staffOnDuty, totalRevenue);
  } else if (managerActiveTab === 'learning') {
    tabContent = renderManagerLearningTab(state);
  } else if (managerActiveTab === 'approvals') {
    tabContent = renderManagerApprovalsTab(state.stockRequests, state.shiftSwapRequests);
  } else if (managerActiveTab === 'inventory') {
    tabContent = renderManagerInventoryTab(state.inventory, state.stockRequests);
  } else if (managerActiveTab === 'automations') {
    tabContent = renderManagerAutomationsTab(state.automationSettings);
  } else if (managerActiveTab === 'audit') {
    tabContent = renderManagerAuditTab(state.auditLog);
  }

  return `
    <div class="container-custom py-6">
      
      <!-- MANAGER EXECUTIVE HEADER -->
      <div class="glass-panel p-6 rounded-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-gold/30">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-bold uppercase tracking-luxury text-gold">Executive Command Suite</span>
            <span class="badge-gold text-xs">Seyi Adeyemi (General Manager)</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-serif text-white font-bold">Hotel Capitol Operations Dashboard</h1>
          <p class="text-xs text-slate-300 mt-1">Live operational intelligence, automated alerts, and financial oversight.</p>
        </div>

        <div class="flex items-center gap-2 w-full md:w-auto">
          <button class="btn-primary text-xs py-2 px-4 font-bold flex-1 md:flex-initial" onclick="window.navigatePortal('guest')">
            Open Guest Portal View →
          </button>
          <button class="btn-secondary text-xs py-1.5 px-3.5 flex items-center gap-2" onclick="window.toggleIntercomModal(true)">
            ${renderIntercomRoundBadge(22)} <span>Intercom</span>
          </button>
        </div>
      </div>

      <!-- 4 PRIORITY HEALTH INDICATORS -->
      <div class="mb-8">
        <h2 class="text-xs font-bold uppercase tracking-luxury text-slate-400 mb-3">What Needs Attention Right Now:</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <!-- 🔴 Critical Indicator -->
          <div class="p-4 rounded-xl border border-red-500/40 bg-red-950/30 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
              <div>
                <div class="text-xs font-bold text-white uppercase">🔴 Critical Alerts</div>
                <div class="text-xs text-red-300">${criticalStockItems.length} Stock Breaches</div>
              </div>
            </div>
            <button class="text-xs text-red-300 underline font-semibold bg-transparent border-none cursor-pointer" onclick="window.navigateManagerTab('inventory')">
              Resolve →
            </button>
          </div>

          <!-- 🟠 Requires Attention -->
          <div class="p-4 rounded-xl border border-amber-500/40 bg-amber-950/30 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 rounded-full bg-amber-500"></div>
              <div>
                <div class="text-xs font-bold text-white uppercase">🟠 Attention Needed</div>
                <div class="text-xs text-amber-300">${lowStockItems.length} Low Inventory Items</div>
              </div>
            </div>
            <button class="text-xs text-amber-300 underline font-semibold bg-transparent border-none cursor-pointer" onclick="window.navigateManagerTab('inventory')">
              Review →
            </button>
          </div>

          <!-- 🟡 Pending Approvals -->
          <div class="p-4 rounded-xl border border-yellow-500/40 bg-yellow-950/30 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 rounded-full bg-yellow-500"></div>
              <div>
                <div class="text-xs font-bold text-white uppercase">🟡 Pending Actions</div>
                <div class="text-xs text-yellow-300">${pendingApprovals.length} POs · ${pendingSuggestions.length} AI Suggestions</div>
              </div>
            </div>
            <button class="text-xs text-yellow-300 underline font-semibold bg-transparent border-none cursor-pointer" onclick="window.navigateManagerTab('learning')">
              Authorize →
            </button>
          </div>

          <!-- 🟢 Normal Operations -->
          <div class="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/30 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 rounded-full bg-emerald-500"></div>
              <div>
                <div class="text-xs font-bold text-white uppercase">🟢 System Status</div>
                <div class="text-xs text-emerald-300">${staffOnDuty} Staff On Duty (96% Svc)</div>
              </div>
            </div>
            <span class="text-xs text-emerald-400 font-bold">Optimal</span>
          </div>

        </div>
      </div>

      <!-- MANAGER NAVIGATION TABS -->
      <div class="flex items-center gap-2.5 overflow-x-auto pb-3 mb-6">
        <button 
          class="menu-btn-gold ${managerActiveTab === 'overview' ? 'active' : ''}"
          onclick="window.navigateManagerTab('overview')"
        >
          <span>📊</span>
          <span>Operations Overview</span>
        </button>

        <button 
          class="menu-btn-gold ${managerActiveTab === 'learning' ? 'active' : ''}"
          onclick="window.navigateManagerTab('learning')"
        >
          <span>🧠</span>
          <span>Tolani Learning Centre ${pendingSuggestions.length > 0 ? `(${pendingSuggestions.length})` : ''}</span>
        </button>

        <button 
          class="menu-btn-gold ${managerActiveTab === 'approvals' ? 'active' : ''}"
          onclick="window.navigateManagerTab('approvals')"
        >
          <span>✍️</span>
          <span>Procurement Sign-off (${pendingApprovals.length})</span>
        </button>

        <button 
          class="menu-btn-gold ${managerActiveTab === 'inventory' ? 'active' : ''}"
          onclick="window.navigateManagerTab('inventory')"
        >
          <span>📦</span>
          <span>Inventory & Procurement</span>
        </button>

        <button 
          class="menu-btn-gold ${managerActiveTab === 'automations' ? 'active' : ''}"
          onclick="window.navigateManagerTab('automations')"
        >
          <span>⚙️</span>
          <span>AI Automation Rules</span>
        </button>

        <button 
          class="menu-btn-gold ${managerActiveTab === 'audit' ? 'active' : ''}"
          onclick="window.navigateManagerTab('audit')"
        >
          <span>📜</span>
          <span>Audit Trail</span>
        </button>
      </div>

      <!-- ACTIVE TAB CONTENT -->
      ${tabContent}

    </div>
  `;
}

// 1. OVERVIEW & AI INSIGHTS TAB (Spec #31)
function renderManagerOverviewTab(state, insights, criticalStock, pendingApprovals, activeOrders, staffOnDuty, totalRevenue) {
  return `
    <div class="flex flex-col gap-8">
      
      <!-- AI HOTEL INSIGHTS SECTION (Spec #31) -->
      <div class="glass-panel-gold p-6 rounded-2xl">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="text-xl">🤖</span>
            <h2 class="text-base font-serif font-bold text-white tracking-luxury">AI HOTEL OPERATIONAL INSIGHTS</h2>
          </div>
          <span class="badge-gold text-xs">Real-Time Synthesis</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${insights.map(ins => `
            <div class="p-4 rounded-xl bg-navy-950 border border-gold/30 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-1">
                  <strong class="text-xs text-white font-serif">${ins.title}</strong>
                  <span class="text-[10px] font-bold text-gold">${ins.impact}</span>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed mt-2 mb-3">${ins.detail}</p>
              </div>
              <div class="pt-2 border-t border-white/5 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <span>✦ Action:</span> <span>${ins.action}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- HOTEL METRICS GRID (Spec #31) -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div class="p-4 rounded-xl bg-navy-900 border border-white/10 text-center">
          <div class="text-xs text-slate-400 mb-1">Today's Arrivals</div>
          <div class="text-xl font-bold font-serif text-white">4 Suites</div>
        </div>

        <div class="p-4 rounded-xl bg-navy-900 border border-white/10 text-center">
          <div class="text-xs text-slate-400 mb-1">Departures</div>
          <div class="text-xl font-bold font-serif text-white">2 Suites</div>
        </div>

        <div class="p-4 rounded-xl bg-navy-900 border border-white/10 text-center">
          <div class="text-xs text-slate-400 mb-1">Active Occupancy</div>
          <div class="text-xl font-bold font-serif text-gold">87.5%</div>
        </div>

        <div class="p-4 rounded-xl bg-navy-900 border border-white/10 text-center">
          <div class="text-xs text-slate-400 mb-1">Dining Orders</div>
          <div class="text-xl font-bold font-serif text-white">${state.orders.length}</div>
        </div>

        <div class="p-4 rounded-xl bg-navy-900 border border-white/10 text-center">
          <div class="text-xs text-slate-400 mb-1">Staff on Duty</div>
          <div class="text-xl font-bold font-serif text-emerald-400">${staffOnDuty} / 5</div>
        </div>

        <div class="p-4 rounded-xl bg-navy-900 border border-white/10 text-center">
          <div class="text-xs text-slate-400 mb-1">F&B Revenue</div>
          <div class="text-xl font-bold font-serif text-gold">₦${totalRevenue.toLocaleString()}</div>
        </div>
      </div>

      <!-- ACTIVE GUESTS DIRECTORY -->
      <div class="glass-panel p-6 rounded-2xl">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <h2 class="text-base font-serif text-white font-bold">Active Resident Folios & Guest Profiles</h2>
          <span class="text-xs text-slate-400">${state.guests.length} Checked In</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${state.guests.map(g => {
            const guestFolio = g.folio.reduce((s, i) => s + i.amount, 0);
            return `
              <div class="p-4 rounded-xl bg-navy-950 border border-white/10 flex flex-col justify-between text-xs">
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <strong class="text-white text-sm font-serif">Suite #${g.roomNumber}</strong>
                    ${g.vip ? '<span class="badge-gold text-[10px]">VIP</span>' : ''}
                  </div>
                  <div class="text-slate-200 font-semibold mb-1">${g.name}</div>
                  <div class="text-slate-400 text-[11px] mb-2">${g.roomType}</div>
                  <div class="text-slate-300">Stay: ${g.checkIn} → ${g.checkOut}</div>
                  <div class="text-slate-300">Breakfast: <strong class="text-gold">${g.breakfastEntitlement}</strong></div>
                </div>

                <div class="pt-3 mt-3 border-t border-white/5 flex items-center justify-between">
                  <span class="text-slate-400">Total Folio:</span>
                  <span class="font-bold text-gold text-sm">₦${guestFolio.toLocaleString()}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

    </div>
  `;
}

// 2. APPROVALS & SIGN-OFF (Spec #34 & #36)
function renderManagerApprovalsTab(stockRequests, shiftSwaps) {
  const pendingStock = stockRequests.filter(s => s.status === 'PENDING_APPROVAL');
  const pendingSwaps = shiftSwaps.filter(s => s.status === 'PENDING_APPROVAL');

  return `
    <div class="max-w-4xl mx-auto flex flex-col gap-8">
      
      <!-- Stock Purchase Order Approvals (Spec #34) -->
      <div class="glass-panel p-6 rounded-2xl">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div>
            <h2 class="text-base font-serif text-white font-bold">Stock Purchase Order Authorizations</h2>
            <p class="text-xs text-slate-300">Authorize replenishment POs for kitchen, housekeeping, and bar vendors.</p>
          </div>
          <span class="badge-gold text-xs">${pendingStock.length} Pending</span>
        </div>

        ${pendingStock.length === 0 ? `
          <div class="text-xs text-slate-400 py-6 text-center">All stock requests authorized.</div>
        ` : `
          <div class="flex flex-col gap-3">
            ${pendingStock.map(sr => `
              <div class="p-4 rounded-xl bg-navy-950 border border-gold/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <strong class="text-white text-sm font-serif">${sr.id}</strong>
                    <span class="badge-attention text-[10px]">Awaiting Manager Sign-off</span>
                  </div>
                  <div class="text-white font-bold text-sm">${sr.itemName} (${sr.quantity} ${sr.unit})</div>
                  <div class="text-slate-400 text-[11px] mt-1">Requested by: <strong class="text-gold-light">${sr.requestedBy}</strong> at ${sr.requestedAt} · Vendor: ${sr.vendor}</div>
                </div>

                <div class="text-right">
                  <div class="text-base font-bold text-gold mb-2">₦${sr.estimatedCost.toLocaleString()}</div>
                  <div class="flex items-center gap-2">
                    <button class="btn-primary text-xs py-1.5 px-4 font-bold" onclick="window.approveManagerStockRequest('${sr.id}')">
                      Approve & Dispatch PO →
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

    </div>
  `;
}

// 3. INVENTORY & PROCUREMENT (Spec #32 & #33)
function renderManagerInventoryTab(inventory, stockRequests) {
  return `
    <div class="max-w-4xl mx-auto glass-panel p-6 rounded-2xl">
      <div class="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div>
          <h2 class="text-base font-serif text-white font-bold">Touchless Inventory & Stock Control</h2>
          <p class="text-xs text-slate-300">Automated threshold triggers: 30% Low Stock, 20% Very Low, 10% Critical.</p>
        </div>
        <button class="btn-secondary text-xs py-1.5 px-3" onclick="window.hotelCapitolAutomation.checkInventoryThresholds()">
          Run Threshold Sensor
        </button>
      </div>

      <div class="flex flex-col gap-3">
        ${inventory.map(item => {
          const ratio = item.quantity / item.maxCapacity;
          const pct = Math.round(ratio * 100);
          return `
            <div class="p-4 rounded-xl bg-navy-950 border border-white/10 text-xs">
              <div class="flex items-center justify-between mb-1">
                <div>
                  <span class="text-slate-400 text-[10px] uppercase font-semibold">${item.category}</span>
                  <div class="text-white font-bold text-sm">${item.name}</div>
                </div>
                <span class="badge-${item.status === 'CRITICAL' ? 'critical' : item.status === 'VERY LOW' ? 'attention' : item.status === 'LOW STOCK' ? 'pending' : 'normal'} text-xs font-bold">
                  ${pct}% (${item.status})
                </span>
              </div>

              <!-- Gauge bar -->
              <div class="w-full bg-navy-800 h-2 rounded-full overflow-hidden my-2">
                <div class="h-full ${pct <= 10 ? 'bg-red-500' : pct <= 20 ? 'bg-amber-500' : pct <= 30 ? 'bg-yellow-500' : 'bg-emerald-500'}" style="width: ${pct}%;"></div>
              </div>

              <div class="flex items-center justify-between text-slate-400 text-[11px] pt-1">
                <span>Current: <strong class="text-white">${item.quantity} ${item.unit}</strong> / Capacity: ${item.maxCapacity} ${item.unit}</span>
                <span>Supplier: <strong class="text-gold-light">${item.supplier}</strong></span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// 4. AI AUTOMATION RULES CONFIG (Spec #38 & #40)
function renderManagerAutomationsTab(settings) {
  return `
    <div class="max-w-3xl mx-auto glass-panel p-6 sm:p-8 rounded-2xl">
      <div class="mb-6 pb-3 border-b border-gold/30">
        <span class="text-xs font-bold uppercase tracking-luxury text-gold">Operational Automation Parameters</span>
        <h2 class="text-2xl font-serif text-white mt-1">AI Automation Schedules & Rules</h2>
        <p class="text-xs text-slate-300">Configure automated proactive outreach schedules and notification guardrails.</p>
      </div>

      <div class="flex flex-col gap-4 mb-6">
        
        <!-- Breakfast Rule -->
        <div class="p-4 rounded-xl bg-navy-950 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <strong class="text-white text-sm">☀️ Automated Breakfast Outreach Schedule</strong>
            <p class="text-slate-400 text-[11px] mt-0.5">Time of morning automated guest notification for breakfast selection.</p>
          </div>
          <input id="setting-breakfast-time" type="text" value="${settings.breakfastNotificationTime}" class="input-custom text-xs w-28 py-1.5 text-center font-bold" />
        </div>

        <!-- Room Service Outreach -->
        <div class="p-4 rounded-xl bg-navy-950 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <strong class="text-white text-sm">🛎 Proactive Room Service Outreach</strong>
            <p class="text-slate-400 text-[11px] mt-0.5">Time of daily AI call & prompt for fresh towels, cleaning, and toiletries.</p>
          </div>
          <input id="setting-rs-time" type="text" value="${settings.roomServicePromptTime}" class="input-custom text-xs w-28 py-1.5 text-center font-bold" />
        </div>

        <!-- Checkout Reminder -->
        <div class="p-4 rounded-xl bg-navy-950 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <strong class="text-white text-sm">🛫 Departure Outreach (Minutes before checkout)</strong>
            <p class="text-slate-400 text-[11px] mt-0.5">Lead time for stay extension, luggage assistance, and airport transit prompt.</p>
          </div>
          <div class="flex items-center gap-1">
            <input id="setting-co-mins" type="number" value="${settings.checkoutReminderMinutes}" class="input-custom text-xs w-20 py-1.5 text-center font-bold" />
            <span class="text-slate-400 text-xs">mins</span>
          </div>
        </div>

        <!-- Food Delivery Warning -->
        <div class="p-4 rounded-xl bg-navy-950 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <strong class="text-white text-sm">🍽 Food Pre-Arrival Warning Lead Time</strong>
            <p class="text-slate-400 text-[11px] mt-0.5">Minutes before estimated food delivery to alert resident suite.</p>
          </div>
          <div class="flex items-center gap-1">
            <input id="setting-del-mins" type="number" value="${settings.foodDeliveryWarningMinutes}" class="input-custom text-xs w-20 py-1.5 text-center font-bold" />
            <span class="text-slate-400 text-xs">mins</span>
          </div>
        </div>

        <!-- Audio & Voice Toggles -->
        <div class="p-4 rounded-xl bg-navy-950 border border-white/10 flex items-center justify-between text-xs">
          <div>
            <strong class="text-white text-sm">Audible Silver Bell & Alarm Chimes</strong>
            <p class="text-slate-400 text-[11px] mt-0.5">Play synthesized Web Audio chimes on orders and critical alerts.</p>
          </div>
          <input id="setting-sound-alerts" type="checkbox" ${settings.soundAlertsEnabled ? 'checked' : ''} class="w-5 h-5 accent-gold-500" />
        </div>

        <div class="p-4 rounded-xl bg-navy-950 border border-white/10 flex items-center justify-between text-xs">
          <div>
            <strong class="text-white text-sm">AI Voice Synthesis (Spoken Responses)</strong>
            <p class="text-slate-400 text-[11px] mt-0.5">Enable conversational voice synthesis on AI assistant interactions.</p>
          </div>
          <input id="setting-voice-synth" type="checkbox" ${settings.aiVoiceSynthesisEnabled ? 'checked' : ''} class="w-5 h-5 accent-gold-500" />
        </div>

      </div>

      <button class="btn-primary w-full py-3 text-xs font-bold shadow-lg" onclick="window.saveAutomationSettings()">
        Save Automation Rules & Configurations →
      </button>

    </div>
  `;
}

// 5. AUDIT RECORDS TAB (Spec #36)
function renderManagerAuditTab(auditLog) {
  return `
    <div class="max-w-4xl mx-auto glass-panel p-6 rounded-2xl">
      <div class="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div>
          <h2 class="text-base font-serif text-white font-bold">Operational & Financial Audit Trail</h2>
          <p class="text-xs text-slate-300">Tamper-evident logs of approvals, orders, inventory updates, and automations.</p>
        </div>
        <span class="badge-gold text-xs">${auditLog.length} Records</span>
      </div>

      <div class="flex flex-col gap-2 max-h-[550px] overflow-y-auto">
        ${auditLog.map(a => `
          <div class="p-3 rounded-xl bg-navy-950 border border-white/5 text-xs">
            <div class="flex items-center justify-between mb-1">
              <strong class="text-white">${a.action}</strong>
              <span class="text-slate-400 text-[10px]">${a.timestamp}</span>
            </div>
            <div class="text-gold-light font-medium text-[11px] mb-1">Actor: ${a.actor} · Target: ${a.entity}</div>
            <div class="text-slate-300 text-[11px]">${a.details}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// 6. TOLANI LEARNING CENTRE & CONTINUOUS IMPROVEMENT (Interaction Analytics, Suggestions, Human Review & Privacy)
function renderManagerLearningTab(state) {
  const summary = learningEngine.getAnalyticsSummary();
  const suggestions = state.learningSuggestions || [];
  const pendingSuggestions = suggestions.filter(s => s.status === 'PENDING_REVIEW');
  const pastUpdates = state.approvedKnowledgeUpdates || [];
  const interactionLogs = state.interactionLogs || [];
  const settings = state.learningSettings || { learningActive: true, retentionDays: 90 };

  return `
    <div class="max-w-5xl mx-auto flex flex-col gap-8 animate-fade-in">
      
      <!-- Top Title & Controls Header -->
      <div class="glass-panel-gold p-6 sm:p-8 rounded-2xl border-2 border-gold/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-bold uppercase tracking-luxury text-gold">Continuous Intelligence System</span>
            <span class="badge-${settings.learningActive ? 'normal' : 'attention'} text-xs">
              ${settings.learningActive ? '● LEARNING ENGINE ACTIVE' : '○ LEARNING PAUSED'}
            </span>
          </div>
          <h2 class="text-2xl font-serif text-white font-bold">Tolani Guest Response Learning Centre</h2>
          <p class="text-xs text-slate-300 mt-1 max-w-xl">
            Human-in-the-loop AI improvement engine. Analyzes guest corrections, intent misclassifications, and vocabulary evolution. Strict guardrails prevent unauthorized production modifications.
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button 
            class="btn-secondary text-xs py-2 px-3.5 font-semibold"
            onclick="window.toggleLearningActive()"
          >
            ${settings.learningActive ? '⏸ Pause Learning' : '▶ Resume Learning'}
          </button>

          <button 
            class="btn-secondary text-xs py-2 px-3.5 font-semibold"
            onclick="window.exportLearningAnalytics()"
          >
            📥 Export Data (JSON)
          </button>

          <button 
            class="btn-secondary text-xs py-2 px-3 font-semibold text-red-400 border-red-500/30 hover:bg-red-950/40"
            onclick="window.clearLearningData()"
            title="Privacy action: Clear guest logs"
          >
            🗑 Clear Logs
          </button>
        </div>
      </div>

      <!-- High-Level Metric Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div class="p-4 rounded-xl bg-navy-950 border border-white/10 text-center">
          <div class="text-xs text-slate-400 mb-1">Total Interactions</div>
          <div class="text-2xl font-serif font-bold text-white">${summary.totalLogs}</div>
          <div class="text-[10px] text-slate-400 mt-1">Logged Across Workflows</div>
        </div>

        <div class="p-4 rounded-xl bg-navy-950 border border-emerald-500/40 text-center">
          <div class="text-xs text-slate-400 mb-1">Success Rate</div>
          <div class="text-2xl font-serif font-bold text-emerald-400">${summary.successRate}%</div>
          <div class="text-[10px] text-slate-400 mt-1">Direct Guest Fulfillment</div>
        </div>

        <div class="p-4 rounded-xl bg-navy-950 border border-amber-500/40 text-center">
          <div class="text-xs text-slate-400 mb-1">Corrections Logged</div>
          <div class="text-2xl font-serif font-bold text-amber-300">${summary.totalCorrections}</div>
          <div class="text-[10px] text-slate-400 mt-1">Guest Clarifications</div>
        </div>

        <div class="p-4 rounded-xl bg-navy-950 border border-gold/40 text-center">
          <div class="text-xs text-slate-400 mb-1">Pending Proposals</div>
          <div class="text-2xl font-serif font-bold text-gold">${pendingSuggestions.length}</div>
          <div class="text-[10px] text-slate-400 mt-1">Awaiting Review</div>
        </div>

        <div class="p-4 rounded-xl bg-navy-950 border border-blue-500/40 text-center col-span-2 sm:col-span-1">
          <div class="text-xs text-slate-400 mb-1">Approved Updates</div>
          <div class="text-2xl font-serif font-bold text-blue-400">${pastUpdates.length}</div>
          <div class="text-[10px] text-slate-400 mt-1">Active in Production</div>
        </div>
      </div>

      <!-- Service Category Breakdown Matrix -->
      <div class="glass-panel p-6 rounded-2xl border border-white/10">
        <h3 class="font-serif text-sm font-bold text-white tracking-luxury uppercase mb-4">
          INTERACTION VOLUME & RESOLUTION BY SERVICE AREA
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          ${Object.entries(summary.serviceBreakdown).map(([service, count]) => `
            <div class="p-3.5 rounded-xl bg-navy-950 border border-white/5 flex flex-col justify-between">
              <span class="text-[11px] text-slate-400 uppercase font-semibold">${service}</span>
              <div class="text-xl font-bold font-serif text-gold mt-1">${count}</div>
              <div class="text-[10px] text-emerald-400 mt-0.5">● Operational</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- AI IMPROVEMENT SUGGESTIONS QUEUE (Pending Human Review) -->
      <div class="glass-panel-gold p-6 sm:p-8 rounded-2xl border-2 border-gold/40 shadow-2xl">
        <div class="flex items-center justify-between pb-4 border-b border-gold/30 mb-6 flex-wrap gap-2">
          <div>
            <span class="text-xs font-bold uppercase tracking-luxury text-gold">Human-in-the-Loop Governance</span>
            <h3 class="text-xl font-serif text-white font-bold mt-0.5">Pending AI Improvement Suggestions</h3>
            <p class="text-xs text-slate-300">Tolani identified these opportunities for knowledge refinement based on actual guest dialogue.</p>
          </div>
          <span class="badge-gold text-xs">${pendingSuggestions.length} Pending Review</span>
        </div>

        ${pendingSuggestions.length === 0 ? `
          <div class="p-8 rounded-2xl bg-navy-950/70 border border-white/5 text-center text-xs text-slate-400">
            <span class="text-3xl block mb-2">✨</span>
            All AI learning proposals have been processed. Tolani is operating smoothly across all 10 service workflows.
          </div>
        ` : `
          <div class="flex flex-col gap-4">
            ${pendingSuggestions.map(sug => `
              <div class="p-5 rounded-2xl bg-navy-950 border-2 border-gold/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                    <strong class="text-white text-base font-serif">${sug.title}</strong>
                    <span class="badge-attention text-[10px] uppercase font-bold">${sug.serviceArea}</span>
                    <span class="badge-normal text-[10px]">Confidence: ${Math.round(sug.confidenceScore * 100)}%</span>
                  </div>

                  <p class="text-xs text-slate-300 leading-relaxed mb-3">${sug.explanation}</p>

                  <!-- Evidence Snippet -->
                  <div class="p-3 rounded-xl bg-navy-900 border border-white/5 text-xs text-slate-300 flex flex-col gap-1">
                    <div class="text-[11px] text-slate-400 flex items-center justify-between">
                      <span><strong>Observed Input:</strong> "${sug.evidenceSnippet}"</span>
                      <span>From: Suite #${sug.roomNumber || '204'}</span>
                    </div>
                    <div class="flex items-center gap-4 text-[11px] mt-1 pt-1 border-t border-white/5">
                      <span>Previous: <del class="text-red-400">${sug.currentClassification}</del></span>
                      <span>Proposed Target: <strong class="text-emerald-400">${sug.proposedTargetIntent}</strong></span>
                    </div>
                  </div>
                </div>

                <!-- Action Controls: APPROVE vs REJECT -->
                <div class="flex flex-col sm:flex-row md:flex-col items-stretch gap-2.5 w-full md:w-48">
                  <button 
                    class="btn-primary py-2.5 px-4 text-xs font-bold shadow-lg flex items-center justify-center gap-1.5"
                    onclick="window.approveLearningSuggestion('${sug.id}')"
                  >
                    <span>✓</span> <span>APPROVE & ACTIVATE</span>
                  </button>

                  <button 
                    class="btn-secondary py-2 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 text-slate-300 hover:text-white"
                    onclick="window.rejectLearningSuggestion('${sug.id}')"
                  >
                    <span>✗</span> <span>REJECT / DISMISS</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- APPROVED PRODUCTION KNOWLEDGE UPDATES & AUDIT TRAIL -->
      <div class="glass-panel p-6 rounded-2xl border border-white/10">
        <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div>
            <h3 class="font-serif text-sm font-bold text-white tracking-luxury uppercase">
              APPROVED KNOWLEDGE UPDATES & ROLLBACK HISTORY
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">Immutable record of all changes promoted to production Tolani voice engine.</p>
          </div>
          <span class="badge-gold text-xs">${pastUpdates.length} Updates</span>
        </div>

        ${pastUpdates.length === 0 ? `
          <div class="text-xs text-slate-400 py-6 text-center">No knowledge updates have been approved yet.</div>
        ` : `
          <div class="flex flex-col gap-3">
            ${pastUpdates.map(upd => `
              <div class="p-4 rounded-xl bg-navy-950 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <strong class="text-gold font-mono font-bold">${upd.updateNumber}</strong>
                    <span class="text-white font-bold font-serif text-sm">${upd.title}</span>
                    <span class="badge-normal text-[10px]">${upd.serviceArea}</span>
                  </div>
                  <div class="text-slate-300 text-[11px]">${upd.appliedChangesSummary}</div>
                  <div class="text-slate-400 text-[10px] mt-1">Approved by: <strong class="text-white">${upd.approvedBy}</strong> at ${upd.timestamp}</div>
                </div>

                <button 
                  class="btn-secondary text-xs py-1.5 px-3 font-semibold text-amber-300 border-amber-500/30 hover:bg-amber-950/30 whitespace-nowrap"
                  onclick="window.rollbackKnowledgeUpdate('${upd.id}')"
                  title="Revert this learning update from production"
                >
                  ↩ Rollback
                </button>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- RECENT INTERACTION LOGS TABLE (Tamper-Evident Preview) -->
      <div class="glass-panel p-6 rounded-2xl border border-white/10">
        <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <h3 class="font-serif text-sm font-bold text-white tracking-luxury uppercase">
            LIVE GUEST INTERACTION LOG STREAM (${interactionLogs.length} Records)
          </h3>
          <span class="text-xs text-slate-400">90-Day Retention</span>
        </div>

        <div class="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
          ${interactionLogs.slice(0, 15).map(log => `
            <div class="p-3 rounded-xl bg-navy-950 border border-white/5 flex items-center justify-between text-xs">
              <div class="flex-1 pr-3">
                <div class="flex items-center gap-2">
                  <span class="text-gold font-mono text-[10px]">${log.serviceContext}</span>
                  <strong class="text-white font-mono text-[11px]">${log.guestInput}</strong>
                  <span class="badge-${log.successful ? 'normal' : 'attention'} text-[9px] py-0.2 px-1">
                    ${log.resolvedIntent}
                  </span>
                </div>
                <div class="text-slate-400 text-[10px] mt-0.5">Suite #${log.roomNumber || '204'} (${log.guestName}) · ${log.timestamp}</div>
              </div>
              <div class="text-right">
                <span class="text-emerald-400 text-[10px] font-bold">✓ Processed</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}
