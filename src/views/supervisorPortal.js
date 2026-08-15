/**
 * HOTEL CAPITOL — SUPERVISOR PORTAL
 * 6 Animashaun Close, Ikeja, Lagos
 * Shift Oversight, Escalations, Task Reassignment & Shift Swap Approvals
 */

import { getIcon, renderIntercomRoundBadge } from '../assets/icons.js';
import { store } from '../store/state.js';
import { automationEngine } from '../services/automationRules.js';

export function initSupervisorPortal() {
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
  const pendingRequests = state.serviceRequests.filter(r => r.status !== 'COMPLETED');
  const activeOrders = state.orders.filter(o => o.status !== 'DELIVERED');
  const pendingSwaps = state.shiftSwapRequests.filter(sw => sw.status === 'PENDING_APPROVAL');
  const lowStockItems = state.inventory.filter(i => i.status !== 'NORMAL');

  return `
    <div class="container-custom py-6">
      
      <!-- SUPERVISOR HEADER -->
      <div class="glass-panel p-6 rounded-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-gold/30">
        <div>
          <span class="text-xs font-bold uppercase tracking-luxury text-gold">Operational Command</span>
          <h1 class="text-2xl font-serif text-white font-bold mt-1">Supervisor Control Center</h1>
          <p class="text-xs text-slate-300">Supervisor: <strong>Tariq Alabi</strong> · Departmental Oversight & Task Allocation</p>
        </div>

        <div class="flex items-center gap-2">
          <button class="btn-primary text-xs py-1.5 px-3.5 font-bold flex items-center gap-2" onclick="window.toggleIntercomModal(true)">
            ${renderIntercomRoundBadge(22)} <span>Operations Intercom</span>
          </button>
          <button class="btn-secondary text-xs py-2 px-4" onclick="window.navigatePortal('manager')">
            Manager View →
          </button>
        </div>
      </div>

      <!-- 4 METRIC SUMMARY BADGES -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
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

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Column 1: Live Service Requests & Escalations -->
        <div class="flex flex-col gap-6">
          <div class="glass-panel p-6 rounded-2xl">
            <h2 class="text-base font-serif text-white font-bold mb-4 flex items-center justify-between">
              <span>Department Service Requests</span>
              <span class="badge-gold text-xs">${pendingRequests.length} Open</span>
            </h2>

            <div class="flex flex-col gap-3">
              ${pendingRequests.length === 0 ? `
                <div class="text-xs text-slate-400 py-4 text-center">All service requests completed.</div>
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
        </div>

        <!-- Column 2: Shift Swap Approvals & Stock Oversight -->
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
