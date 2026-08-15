/**
 * HOTEL CAPITOL — GENERAL MANAGER & EXECUTIVE PORTAL
 * 6 Animashaun Close, Ikeja, Lagos
 * 4 Priority Indicators, AI Hotel Insights, Approval Center & Automation Rules
 */

import { getIcon, renderIntercomRoundBadge } from '../assets/icons.js';
import { store } from '../store/state.js';
import { aiEngine } from '../services/aiEngine.js';
import { automationEngine } from '../services/automationRules.js';

let managerActiveTab = 'overview'; // 'overview' | 'approvals' | 'inventory' | 'automations' | 'audit'

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
  const lowStockItems = state.inventory.filter(i => i.status !== 'NORMAL');
  const criticalStockItems = state.inventory.filter(i => i.status === 'CRITICAL');
  const activeOrders = state.orders.filter(o => o.status !== 'DELIVERED');
  const staffOnDuty = state.staffMembers.filter(s => s.clockedIn).length;
  const totalRevenue = state.orders.reduce((sum, o) => sum + o.totalAmount, 0);

  let tabContent = '';
  if (managerActiveTab === 'overview') {
    tabContent = renderManagerOverviewTab(state, insights, criticalStockItems, pendingApprovals, activeOrders, staffOnDuty, totalRevenue);
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

      <!-- 4 PRIORITY HEALTH INDICATORS (Spec #45) -->
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
                <div class="text-xs text-yellow-300">${pendingApprovals.length} Purchase Orders</div>
              </div>
            </div>
            <button class="text-xs text-yellow-300 underline font-semibold bg-transparent border-none cursor-pointer" onclick="window.navigateManagerTab('approvals')">
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

      <!-- MANAGER NAVIGATION TABS with Golden Outlay & Glowing Borders -->
      <div class="flex items-center gap-2.5 overflow-x-auto pb-3 mb-6">
        <button 
          class="menu-btn-gold ${managerActiveTab === 'overview' ? 'active' : ''}"
          onclick="window.navigateManagerTab('overview')"
        >
          <span>🤖</span>
          <span>Operations & AI Insights</span>
        </button>

        <button 
          class="menu-btn-gold ${managerActiveTab === 'approvals' ? 'active' : ''}"
          onclick="window.navigateManagerTab('approvals')"
        >
          <span>✍️</span>
          <span>Approvals & Sign-off (${pendingApprovals.length})</span>
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
          <span>AI Automation Rules Config</span>
        </button>

        <button 
          class="menu-btn-gold ${managerActiveTab === 'audit' ? 'active' : ''}"
          onclick="window.navigateManagerTab('audit')"
        >
          <span>📜</span>
          <span>Audit Records & Trail</span>
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
