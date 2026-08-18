/**
 * HOTEL CAPITOL — DELIVERY ETA TRACKING MODAL
 * 6 Animashaun Close, Ikeja, Lagos
 */

import { getIcon } from '../assets/icons.js';
import { store } from '../store/state.js';
import { automationEngine } from '../services/automationRules.js';

let isTrackerOpen = false;
let activeTrackingId = 'TRK-901';

export function initDeliveryTracker() {
  window.openDeliveryTracker = (trkId = 'TRK-901') => {
    activeTrackingId = trkId;
    isTrackerOpen = true;
    renderDeliveryTracker();
  };

  window.closeDeliveryTracker = () => {
    isTrackerOpen = false;
    renderDeliveryTracker();
  };

  window.advanceDeliveryStatus = (trkId, nextStatus) => {
    store.updateDeliveryTrackingStatus(trkId, nextStatus);
    automationEngine.playChime('intercom-roger');
    automationEngine.showToast('Dispatch Updated', `Delivery status transitioned to ${nextStatus}`, 'info');
    renderDeliveryTracker();
  };

  renderDeliveryTracker();
}

export function renderDeliveryTracker() {
  let root = document.getElementById('tracker-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'tracker-root';
    document.body.appendChild(root);
  }

  if (!isTrackerOpen) {
    root.innerHTML = '';
    return;
  }

  const state = store.getState();
  const tracking = (state.deliveryTrackings || []).find(t => t.id === activeTrackingId || t.orderId === activeTrackingId) || (state.deliveryTrackings || [])[0] || {
    id: 'TRK-901',
    orderId: 'PO-8801',
    supplierCode: 'ABC-001',
    supplierName: 'ABC Foods Limited',
    route: 'Ikeja Industrial Depot → 6 Animashaun Close',
    currentPosition: 'Allen Avenue / Toyin Junction (~1.2 km)',
    destination: 'Hotel Capitol Loading Bay 1',
    etaMinutes: 12,
    status: 'IN_TRANSIT',
    statusHistory: []
  };

  const steps = [
    { key: 'ORDER_CONFIRMED', label: 'Order Confirmed', icon: '📝' },
    { key: 'PREPARING', label: 'Palletized', icon: '📦' },
    { key: 'DISPATCHED', label: 'Depot Dispatched', icon: '🚚' },
    { key: 'IN_TRANSIT', label: 'In Transit', icon: '🛣️' },
    { key: 'NEAR_HOTEL', label: 'Near Hotel', icon: '📍' },
    { key: 'ARRIVED', label: 'Arrived at Gate', icon: '🏨' },
    { key: 'RECEIVED', label: 'Goods Received', icon: '✅' }
  ];

  const currentStepIdx = steps.findIndex(s => s.key === tracking.status);

  root.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" style="background: rgba(4, 9, 15, 0.88); backdrop-filter: blur(8px);" onclick="window.closeDeliveryTracker()">
      <div class="w-full max-w-2xl bg-navy-900 border-2 border-gold rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in max-h-[92vh]" onclick="event.stopPropagation()">
        
        <!-- Header -->
        <div class="p-4 bg-navy-950 border-b border-gold flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gold/20 border border-gold flex items-center justify-center text-xl">
              🚚
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold text-gold uppercase tracking-luxury">Live Logistics Dispatch</span>
                <span class="badge-gold text-xs font-mono font-bold">${tracking.supplierCode}</span>
              </div>
              <h3 class="font-serif text-sm sm:text-base font-bold text-white">${tracking.supplierName} · Dispatch #${tracking.orderId}</h3>
            </div>
          </div>
          <button class="btn-icon" style="width:32px; height:32px;" onclick="window.closeDeliveryTracker()">
            ✕
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto flex flex-col gap-6">
          
          <!-- Route & Dynamic ETA Banner -->
          <div class="p-4 rounded-2xl bg-navy-950/90 border border-gold/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div class="text-xs text-slate-400">Transit Route Corridor:</div>
              <div class="text-sm font-bold text-white mt-0.5">${tracking.route}</div>
              <div class="text-xs text-emerald-400 mt-1">📍 Position: <strong>${tracking.currentPosition}</strong></div>
            </div>
            <div class="text-left sm:text-right">
              <div class="text-xs text-slate-400">Estimated Arrival (ETA):</div>
              <div class="text-2xl font-serif font-bold text-gold mt-0.5">~${tracking.etaMinutes} Mins</div>
              <div class="text-[11px] text-slate-400">Target Gate: ${tracking.destination}</div>
            </div>
          </div>

          <!-- Lifecycle Stepper -->
          <div>
            <div class="text-xs font-bold text-slate-400 uppercase tracking-luxury mb-3">Delivery Lifecycle Progress</div>
            <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center">
              ${steps.map((step, idx) => {
                const isPast = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return `
                  <div class="p-2.5 rounded-xl border flex flex-col items-center justify-between gap-1 transition-all ${
                    isCurrent 
                      ? 'bg-gold text-navy-950 border-gold font-bold shadow-lg scale-105' 
                      : isPast 
                      ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300' 
                      : 'bg-navy-950/60 border-white/10 text-slate-400'
                  }">
                    <span class="text-lg">${step.icon}</span>
                    <span class="text-[10px] leading-tight font-semibold">${step.label}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Quick Simulation Advance Controls -->
          <div class="p-4 rounded-xl bg-navy-950 border border-white/10 flex flex-col gap-2">
            <div class="text-xs font-bold text-gold uppercase">Simulate Next Dispatch Checkpoint:</div>
            <div class="flex flex-wrap gap-2">
              ${steps.map((step) => `
                <button 
                  class="btn-secondary text-[11px] py-1.5 px-3 cursor-pointer ${tracking.status === step.key ? 'border-gold text-gold font-bold' : ''}"
                  onclick="window.advanceDeliveryStatus('${tracking.id}', '${step.key}')"
                >
                  ${step.icon} ${step.label}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Status Event History -->
          <div class="p-4 rounded-xl bg-navy-950 border border-white/10 text-xs">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-luxury mb-2">Transit Timestamp History:</div>
            <div class="flex flex-col gap-1.5 text-slate-300">
              ${(tracking.statusHistory || []).map(h => `
                <div class="flex items-center justify-between border-b border-white/5 pb-1">
                  <span><strong class="text-white">${h.status}</strong>: ${h.note}</span>
                  <span class="text-slate-400 font-mono text-[11px]">${h.time}</span>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

      </div>
    </div>
  `;
}
