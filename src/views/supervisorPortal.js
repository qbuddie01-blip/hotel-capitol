/**
 * HOTEL CAPITOL — SUPERVISOR PORTAL
 * 6 Animashaun Close, Ikeja, Lagos
 * Shift Oversight, Escalations, Task Reassignment & Shift Swap Approvals
 * Standardized to match the canonical Hotel Staff Profile layout
 */

import { getIcon, renderIntercomRoundBadge } from '../assets/icons.js';
import { store } from '../store/state.js';
import { automationEngine } from '../services/automationRules.js';

let activeSupervisorTab = 'profile'; // 'profile' | 'overview' | 'requests' | 'swaps' | 'inventory'
let supervisorIntercomState = 'ready'; // 'ready' | 'active' | 'delivered'

export function initSupervisorPortal() {
  window.navigateSupervisorTab = (tab) => {
    activeSupervisorTab = tab;
    if (window.renderApp) window.renderApp();
  };

  window.triggerSupervisorIntercom = () => {
    supervisorIntercomState = 'active';
    if (window.renderApp) window.renderApp();
    automationEngine.playChime('bell');
    
    // Open Intercom modal
    window.toggleIntercomModal(true);

    // Simulate active transition to delivered upon transmission
    setTimeout(() => {
      supervisorIntercomState = 'delivered';
      if (window.renderApp) window.renderApp();
      automationEngine.showToast('Intercom Connected', 'Supervisor Radio link established on secure operations channel.', 'success');
      
      setTimeout(() => {
        supervisorIntercomState = 'ready';
        if (window.renderApp) window.renderApp();
      }, 3000);
    }, 2000);
  };

  window.reassignTaskStaff = (taskId, newStaffId) => {
    const newStaff = store.getState().staffMembers.find(s => s.id === newStaffId);
    if (!newStaff) return;

    store.setState(s => ({
      ...s,
      staffTasks: s.staffTasks.map(t => t.id === taskId ? {
        ...t,
        staffId: newStaff.id,
        staffName: newStaff.name
      } : t)
    }));

    automationEngine.playChime('bell');
    automationEngine.showToast('Task Reassigned', `Task ${taskId} reassigned to ${newStaff.name}`, 'info');
    store.addAudit('Task Reassigned', taskId, `Assigned to ${newStaff.name} by Supervisor`);
    if (window.renderApp) window.renderApp();
  };

  window.approveSupervisorShiftSwap = (swapId) => {
    store.setState(s => ({
      ...s,
      shiftSwapRequests: s.shiftSwapRequests.map(sw => sw.id === swapId ? { ...sw, status: 'APPROVED' } : sw)
    }));
    automationEngine.playChime('success');
    automationEngine.showToast('Shift Swap Approved', `Shift swap ${swapId} approved and schedule updated.`, 'success');
    store.addAudit('Shift Swap Approved', swapId, 'Authorized by Supervisor Tariq Alabi');
    if (window.renderApp) window.renderApp();
  };

  window.escalateRequest = (reqId) => {
    store.updateServiceRequestStatus(reqId, 'ESCALATED');
    automationEngine.playChime('critical');
    automationEngine.showToast('Request Escalated', `Request ${reqId} marked as high priority escalation.`, 'critical');
    if (window.renderApp) window.renderApp();
  };
}

export function renderSupervisorPortal() {
  const state = store.getState();
  const supervisor = state.staffMembers.find(s => s.id === 'STF-05') || store.getActiveStaff();
  const pendingRequests = state.serviceRequests.filter(r => r.status !== 'COMPLETED');
  const activeOrders = state.orders.filter(o => o.status !== 'DELIVERED');
  const pendingSwaps = state.shiftSwapRequests.filter(sw => sw.status === 'PENDING_APPROVAL');
  const lowStockItems = state.inventory.filter(i => i.status !== 'NORMAL');

  let tabContent = '';
  if (activeSupervisorTab === 'profile') {
    tabContent = renderSupervisorPersonalProfileTab(supervisor, state, pendingRequests, activeOrders, pendingSwaps, lowStockItems);
  } else if (activeSupervisorTab === 'overview') {
    tabContent = renderSupervisorOverviewTab(state, pendingRequests, activeOrders, pendingSwaps, lowStockItems);
  } else if (activeSupervisorTab === 'requests') {
    tabContent = renderSupervisorRequestsTab(state, pendingRequests);
  } else if (activeSupervisorTab === 'swaps') {
    tabContent = renderSupervisorSwapsTab(pendingSwaps);
  } else if (activeSupervisorTab === 'inventory') {
    tabContent = renderSupervisorInventoryTab(lowStockItems);
  }

  return `
    <div class="container-custom py-4 sm:py-6">
      
      <!-- NAVIGATION TABS with Golden Outlay & Glowing Borders (Canonical Layout) -->
      <div class="category-tabs-scroll mb-6">
        <button 
          class="menu-btn-gold ${activeSupervisorTab === 'profile' ? 'active' : ''}"
          onclick="window.navigateSupervisorTab('profile')"
        >
          <span>👤</span>
          <span>My Profile</span>
        </button>

        <button 
          class="menu-btn-gold ${activeSupervisorTab === 'overview' ? 'active' : ''}"
          onclick="window.navigateSupervisorTab('overview')"
        >
          <span>📊</span>
          <span>Operations Command</span>
        </button>

        <button 
          class="menu-btn-gold ${activeSupervisorTab === 'requests' ? 'active' : ''}"
          onclick="window.navigateSupervisorTab('requests')"
        >
          <span>🛎</span>
          <span>Service Requests (${pendingRequests.length})</span>
        </button>

        <button 
          class="menu-btn-gold ${activeSupervisorTab === 'swaps' ? 'active' : ''}"
          onclick="window.navigateSupervisorTab('swaps')"
        >
          <span>📅</span>
          <span>Shift Swaps (${pendingSwaps.length})</span>
        </button>

        <button 
          class="menu-btn-gold ${activeSupervisorTab === 'inventory' ? 'active' : ''}"
          onclick="window.navigateSupervisorTab('inventory')"
        >
          <span>📦</span>
          <span>Stock Watchlist (${lowStockItems.length})</span>
        </button>
      </div>

      <!-- ACTIVE TAB CONTENT -->
      ${tabContent}

    </div>
  `;
}

// 1. SINGLE AUTHORITATIVE SUPERVISOR PERSONAL PROFILE TAB (Standardized to Hotel Staff Profile)
function renderSupervisorPersonalProfileTab(supervisor, state, pendingRequests, activeOrders, pendingSwaps, lowStockItems) {
  const isListening = supervisorIntercomState === 'active';
  const isDelivered = supervisorIntercomState === 'delivered';
  const ringColor = isListening ? '#ef4444' : '#10b981';
  const glowColor = isListening ? 'rgba(239, 68, 68, 0.75)' : 'rgba(16, 185, 129, 0.75)';

  return `
    <div class="staff-profile-container animate-fade-in">
      
      <!-- Single Authoritative Supervisor Profile Card -->
      <div class="staff-profile-card">
        
        <!-- 1. Profile Image with Gold Frame -->
        <div class="relative mb-4">
          <img 
            src="${supervisor.avatar}" 
            alt="${supervisor.name}" 
            class="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-2 border-gold shadow-2xl" 
            style="object-fit: cover; object-position: center; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.7), 0 0 25px rgba(220, 173, 84, 0.3);"
          />
          <div class="absolute -bottom-2 -right-2 bg-navy-950 px-2.5 py-1 rounded-full border border-gold/40 text-[10px] font-bold text-gold">
            ${supervisor.adminRole || 'SUPERVISOR'}
          </div>
        </div>

        <!-- 2. Supervisor Name, Job Title & Department -->
        <h2 class="text-2xl sm:text-3xl font-serif text-white font-bold mb-1">${supervisor.name}</h2>
        <div class="text-xs sm:text-sm font-semibold text-gold mb-1">${supervisor.role}</div>
        <div class="text-xs text-slate-300 uppercase tracking-wider mb-5">
          Department: <strong class="text-white">${supervisor.department}</strong>
        </div>

        <!-- 3. Clock In CTA -->
        <div class="w-full max-w-xs mb-3">
          <button 
            class="${supervisor.clockedIn ? 'btn-danger' : 'btn-primary'} w-full py-3 text-sm font-bold shadow-xl cursor-pointer"
            onclick="window.hotelCapitolStore.toggleClockIn('${supervisor.id}'); renderSupervisorPortal();"
          >
            ${supervisor.clockedIn ? '⏰ Clock Out of Duty' : '⏰ Clock In for Duty'}
          </button>
        </div>

        <!-- 4. Large Prominent Intercom Control Directly Below Clock In -->
        <div class="my-3 flex flex-col items-center">
          <button 
            class="staff-large-intercom-btn ${isListening ? 'active' : ''}"
            onclick="window.triggerSupervisorIntercom()"
            title="Open Live 2-Way Supervisor Intercom Radio"
          >
            <div class="relative flex items-center justify-center" style="width: 44px; height: 44px;">
              <div class="absolute inset-0 rounded-full ${isListening ? 'intercom-ring-active' : 'intercom-ring-ready'}" style="border: 2.5px solid ${ringColor}; box-shadow: 0 0 16px ${glowColor}, inset 0 0 8px ${glowColor};"></div>
              ${renderIntercomRoundBadge(28)}
            </div>
            <div class="flex flex-col text-left">
              <span class="text-xs font-bold ${isListening ? 'text-red-400' : 'text-emerald-300'} flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-ping' : 'bg-emerald-400 animate-pulse'}"></span>
                ${isListening ? 'LISTENING / ACTIVE' : isDelivered ? 'MESSAGE DELIVERED' : '2-WAY INTERCOM READY'}
              </span>
              <span class="text-[10px] text-slate-300">Push-to-Talk Supervisor Radio</span>
            </div>
          </button>
        </div>

        <!-- 5. Profile Information & Operational Details (Compact, Moved Upward) -->
        <div class="w-full mt-4 text-left p-4 rounded-2xl bg-navy-950/80 border border-white/10">
          <div class="text-xs font-bold uppercase tracking-luxury text-gold pb-2 border-b border-white/10 mb-3 flex items-center justify-between">
            <span>Supervisor Profile & Scope</span>
            <span class="text-slate-400 text-[11px]">ID: ${supervisor.id}</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
            <div class="flex items-center justify-between p-2 rounded-lg bg-navy-900 border border-white/5">
              <span class="text-slate-400">Shift Schedule:</span>
              <strong class="text-white">${supervisor.shift}</strong>
            </div>

            <div class="flex items-center justify-between p-2 rounded-lg bg-navy-900 border border-white/5">
              <span class="text-slate-400">Attendance:</span>
              <strong class="${supervisor.clockedIn ? 'text-emerald-400' : 'text-slate-400'}">
                ${supervisor.clockedIn ? `In (${supervisor.clockInTime})` : 'Off Duty'}
              </strong>
            </div>

            <div class="flex items-center justify-between p-2 rounded-lg bg-navy-900 border border-white/5">
              <span class="text-slate-400">Appraisal Score:</span>
              <strong class="text-gold font-bold">${supervisor.performanceScore}%</strong>
            </div>

            <div class="flex items-center justify-between p-2 rounded-lg bg-navy-900 border border-white/5">
              <span class="text-slate-400">Open Tickets:</span>
              <strong class="text-white">${pendingRequests.length} Tasks</strong>
            </div>

            <div class="flex items-center justify-between p-2 rounded-lg bg-navy-900 border border-white/5">
              <span class="text-slate-400">Swaps Pending:</span>
              <strong class="text-emerald-400">${pendingSwaps.length} Requests</strong>
            </div>

            <div class="flex items-center justify-between p-2 rounded-lg bg-navy-900 border border-white/5">
              <span class="text-slate-400">Inventory Alerts:</span>
              <strong class="${lowStockItems.length > 0 ? 'text-red-400 font-bold' : 'text-slate-400'}">${lowStockItems.length} Low Stock</strong>
            </div>
          </div>

          <!-- AI Operational Coaching Note -->
          <div class="mt-3 pt-3 border-t border-white/10 text-xs">
            <span class="text-gold font-semibold">Leadership & Operations Note:</span>
            <p class="text-slate-300 mt-1 italic leading-relaxed">"${supervisor.aiNotes || 'Maintains executive guest satisfaction, oversees staff task progression, and ensures rapid escalation response.'}"</p>
          </div>
        </div>

      </div>

    </div>
  `;
}

// 2. SUPERVISOR OPERATIONS OVERVIEW TAB
function renderSupervisorOverviewTab(state, pendingRequests, activeOrders, pendingSwaps, lowStockItems) {
  return `
    <div class="flex flex-col gap-6 animate-fade-in">
      
      <!-- 4 METRIC SUMMARY BADGES -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="p-4 rounded-xl bg-navy-900 border border-white/10 text-center">
          <div class="text-xs text-slate-400 mb-1">Active Requests</div>
          <div class="text-2xl font-serif font-bold text-gold">${pendingRequests.length}</div>
        </div>

        <div class="p-4 rounded-xl bg-navy-900 border border-white/10 text-center">
          <div class="text-xs text-slate-400 mb-1">Live Kitchen Orders</div>
          <div class="text-2xl font-serif font-bold text-amber-400">${activeOrders.length}</div>
        </div>

        <div class="p-4 rounded-xl bg-navy-900 border border-white/10 text-center">
          <div class="text-xs text-slate-400 mb-1">Shift Swaps Pending</div>
          <div class="text-2xl font-serif font-bold text-emerald-400">${pendingSwaps.length}</div>
        </div>

        <div class="p-4 rounded-xl bg-navy-900 border border-white/10 text-center">
          <div class="text-xs text-slate-400 mb-1">Stock Alerts</div>
          <div class="text-2xl font-serif font-bold text-red-400">${lowStockItems.length}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Live Service Requests -->
        <div class="glass-panel p-6 rounded-2xl">
          <h2 class="text-base font-serif text-white font-bold mb-4 flex items-center justify-between">
            <span>Department Service Requests</span>
            <span class="badge-gold text-xs">${pendingRequests.length} Open</span>
          </h2>

          <div class="flex flex-col gap-3">
            ${pendingRequests.length === 0 ? `
              <div class="text-xs text-slate-400 py-4 text-center">All service requests completed.</div>
            ` : pendingRequests.slice(0, 4).map(req => `
              <div class="p-4 rounded-xl bg-navy-950 border border-white/10 text-xs">
                <div class="flex items-center justify-between mb-1">
                  <strong class="text-white text-sm">Suite #${req.roomNumber} (${req.guestName})</strong>
                  <span class="badge-${req.status === 'ESCALATED' ? 'critical' : req.status === 'IN PROGRESS' ? 'attention' : 'pending'} text-[10px]">
                    ${req.status}
                  </span>
                </div>
                
                <div class="text-slate-300 font-medium mb-1">${req.title}</div>
                <div class="text-slate-400 text-[11px] mb-3">${req.details} · Logged: ${req.requestedAt}</div>

                <div class="flex items-center justify-between pt-2 border-t border-white/5">
                  <div class="flex items-center gap-1">
                    <span class="text-slate-400">Assigned:</span>
                    <select 
                      class="bg-navy-800 text-white text-[11px] rounded px-2 py-1 border border-white/10"
                      onchange="window.reassignTaskStaff('${req.id}', this.value)"
                    >
                      ${state.staffMembers.map(s => `
                        <option value="${s.id}" ${s.name === req.assignedStaffName ? 'selected' : ''}>${s.name}</option>
                      `).join('')}
                    </select>
                  </div>

                  <div class="flex items-center gap-2">
                    <button class="btn-secondary text-[10px] py-1 px-2 text-red-400" onclick="window.escalateRequest('${req.id}')">
                      Escalate
                    </button>
                    <button class="btn-primary text-[10px] py-1 px-2.5 font-bold" onclick="window.hotelCapitolStore.updateServiceRequestStatus('${req.id}', 'COMPLETED'); renderSupervisorPortal();">
                      Mark Done
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Shift Swaps & Low Inventory -->
        <div class="flex flex-col gap-6">
          
          <!-- Shift Swap Approvals -->
          <div class="glass-panel p-6 rounded-2xl">
            <h2 class="text-base font-serif text-white font-bold mb-3 flex items-center justify-between">
              <span>Shift Swap Approvals</span>
              <span class="badge-gold text-xs">${pendingSwaps.length} Requests</span>
            </h2>

            ${pendingSwaps.length === 0 ? `
              <div class="text-xs text-slate-400 py-4 text-center">No pending shift swaps.</div>
            ` : pendingSwaps.map(sw => `
              <div class="p-3.5 rounded-xl bg-navy-950 border border-gold/30 text-xs mb-2">
                <div class="flex items-center justify-between mb-1">
                  <strong class="text-white">${sw.requesterName} ↔ ${sw.targetStaffName}</strong>
                  <span class="text-gold font-semibold">${sw.date}</span>
                </div>
                <div class="text-slate-300 mb-2">Reason: "${sw.reason}"</div>
                <button class="btn-primary text-xs py-1 px-3 w-full font-bold" onclick="window.approveSupervisorShiftSwap('${sw.id}')">
                  Approve & Update Roster
                </button>
              </div>
            `).join('')}
          </div>

          <!-- Inventory Alerts -->
          <div class="glass-panel p-6 rounded-2xl">
            <h2 class="text-base font-serif text-white font-bold mb-3 flex items-center justify-between">
              <span>Low Inventory Watchlist</span>
              <button class="text-xs text-gold underline bg-transparent border-none cursor-pointer" onclick="window.navigatePortal('inventory')">
                View Full Inventory →
              </button>
            </h2>

            <div class="flex flex-col gap-2">
              ${lowStockItems.map(item => `
                <div class="p-3 rounded-xl bg-navy-950 border border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <strong class="text-white">${item.name}</strong>
                    <div class="text-slate-400 text-[11px]">Stock: ${item.quantity} / ${item.maxCapacity} ${item.unit}</div>
                  </div>
                  <div class="text-right">
                    <span class="badge-${item.status === 'CRITICAL' ? 'critical' : 'attention'} text-[10px] py-0.5">
                      ${item.status}
                    </span>
                    <button class="btn-secondary text-[10px] py-1 px-2 mt-1 block" onclick="window.hotelCapitolStore.createStockRequest('${item.id}', 5, '${item.supplier}'); renderSupervisorPortal();">
                      Order Restock
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

      </div>

    </div>
  `;
}

// 3. SUPERVISOR REQUESTS TAB
function renderSupervisorRequestsTab(state, pendingRequests) {
  return `
    <div class="glass-panel p-6 rounded-2xl max-w-4xl mx-auto animate-fade-in">
      <h2 class="text-lg font-serif text-white font-bold mb-4 flex items-center justify-between">
        <span>Department Service Requests Queue</span>
        <span class="badge-gold text-xs">${pendingRequests.length} Active</span>
      </h2>

      <div class="flex flex-col gap-3">
        ${pendingRequests.length === 0 ? `
          <div class="text-xs text-slate-400 py-6 text-center">All service requests completed.</div>
        ` : pendingRequests.map(req => `
          <div class="p-4 rounded-xl bg-navy-950 border border-white/10 text-xs">
            <div class="flex items-center justify-between mb-1">
              <strong class="text-white text-sm">Suite #${req.roomNumber} (${req.guestName})</strong>
              <span class="badge-${req.status === 'ESCALATED' ? 'critical' : req.status === 'IN PROGRESS' ? 'attention' : 'pending'} text-[10px]">
                ${req.status}
              </span>
            </div>
            
            <div class="text-slate-300 font-medium mb-1">${req.title}</div>
            <div class="text-slate-400 text-[11px] mb-3">${req.details} · Logged: ${req.requestedAt}</div>

            <div class="flex items-center justify-between pt-2 border-t border-white/5">
              <div class="flex items-center gap-1">
                <span class="text-slate-400">Assigned:</span>
                <select 
                  class="bg-navy-800 text-white text-[11px] rounded px-2 py-1 border border-white/10"
                  onchange="window.reassignTaskStaff('${req.id}', this.value)"
                >
                  ${state.staffMembers.map(s => `
                    <option value="${s.id}" ${s.name === req.assignedStaffName ? 'selected' : ''}>${s.name}</option>
                  `).join('')}
                </select>
              </div>

              <div class="flex items-center gap-2">
                <button class="btn-secondary text-[10px] py-1 px-2 text-red-400" onclick="window.escalateRequest('${req.id}')">
                  Escalate
                </button>
                <button class="btn-primary text-[10px] py-1 px-2.5 font-bold" onclick="window.hotelCapitolStore.updateServiceRequestStatus('${req.id}', 'COMPLETED'); renderSupervisorPortal();">
                  Mark Done
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// 4. SUPERVISOR SHIFT SWAPS TAB
function renderSupervisorSwapsTab(pendingSwaps) {
  return `
    <div class="glass-panel p-6 rounded-2xl max-w-4xl mx-auto animate-fade-in">
      <h2 class="text-lg font-serif text-white font-bold mb-4 flex items-center justify-between">
        <span>Shift Swap Approval Requests</span>
        <span class="badge-gold text-xs">${pendingSwaps.length} Requests</span>
      </h2>

      ${pendingSwaps.length === 0 ? `
        <div class="text-xs text-slate-400 py-6 text-center">No pending shift swaps.</div>
      ` : pendingSwaps.map(sw => `
        <div class="p-4 rounded-xl bg-navy-950 border border-gold/30 text-xs mb-3">
          <div class="flex items-center justify-between mb-1">
            <strong class="text-white text-sm">${sw.requesterName} ↔ ${sw.targetStaffName}</strong>
            <span class="text-gold font-bold">${sw.date}</span>
          </div>
          <div class="text-slate-300 mb-3">Reason for Swap: "${sw.reason}"</div>
          <button class="btn-primary text-xs py-2 px-4 w-full font-bold" onclick="window.approveSupervisorShiftSwap('${sw.id}')">
            Approve & Update Roster →
          </button>
        </div>
      `).join('')}
    </div>
  `;
}

// 5. SUPERVISOR INVENTORY TAB
function renderSupervisorInventoryTab(lowStockItems) {
  return `
    <div class="glass-panel p-6 rounded-2xl max-w-4xl mx-auto animate-fade-in">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-serif text-white font-bold">Low Inventory Watchlist</h2>
        <button class="text-xs text-gold underline bg-transparent border-none cursor-pointer" onclick="window.navigatePortal('inventory')">
          View Full Inventory Catalog →
        </button>
      </div>

      <div class="flex flex-col gap-3">
        ${lowStockItems.map(item => `
          <div class="p-4 rounded-xl bg-navy-950 border border-white/10 flex items-center justify-between text-xs">
            <div>
              <strong class="text-white text-sm">${item.name}</strong>
              <div class="text-slate-400 text-xs mt-0.5">Stock Level: ${item.quantity} / ${item.maxCapacity} ${item.unit}</div>
              <div class="text-[11px] text-slate-500">Supplier: ${item.supplier || 'Standard F&B Supply'}</div>
            </div>
            <div class="text-right">
              <span class="badge-${item.status === 'CRITICAL' ? 'critical' : 'attention'} text-[10px] py-0.5">
                ${item.status}
              </span>
              <button class="btn-secondary text-xs py-1.5 px-3 mt-2 block" onclick="window.hotelCapitolStore.createStockRequest('${item.id}', 5, '${item.supplier}'); renderSupervisorPortal();">
                Order Restock
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
