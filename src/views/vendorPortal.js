/**
 * HOTEL CAPITOL — VENDOR & SUPPLIER PORTAL
 * 6 Animashaun Close, Ikeja, Lagos
 * Simple Purchase Order Management, Dispatch & Invoicing
 */

import { getIcon } from '../assets/icons.js';
import { store } from '../store/state.js';
import { automationEngine } from '../services/automationRules.js';

export function initVendorPortal() {
  window.switchVendor = (venId) => {
    store.setState(s => ({ ...s, activeVendorId: venId }));
    if (window.renderApp) window.renderApp();
  };

  window.vendorAcceptPO = (poId, srId) => {
    automationEngine.playChime('success');
    automationEngine.showToast('PO Accepted', `Vendor accepted Purchase Order ${poId}. Kitchen notified.`, 'success');
    store.addAudit('Vendor PO Accepted', poId, `Accepted by approved supplier`);
    if (window.renderApp) window.renderApp();
  };

  window.vendorDeliverPO = (srId) => {
    store.recordStockDelivery(srId);
    automationEngine.playChime('success');
    automationEngine.showToast('Delivery Recorded & Stock Updated', `Purchase order items delivered and inventory automatically updated.`, 'success');
    if (window.renderApp) window.renderApp();
  };
}

export function renderVendorPortal() {
  const state = store.getState();
  const activeVendor = state.vendors.find(v => v.id === state.activeVendorId) || state.vendors[0];
  const approvedRequestsForVendor = state.stockRequests.filter(sr => sr.vendor === activeVendor.name && sr.status === 'APPROVED');
  const deliveredRequests = state.stockRequests.filter(sr => sr.vendor === activeVendor.name && sr.status === 'DELIVERED');

  return `
    <div class="container-custom py-6">
      
      <!-- VENDOR HEADER -->
      <div class="glass-panel p-6 rounded-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-gold/30">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-bold uppercase tracking-luxury text-gold">Approved Supplier Network</span>
            <span class="badge-gold text-xs">${activeVendor.category}</span>
          </div>
          <h1 class="text-2xl font-serif text-white font-bold">${activeVendor.name}</h1>
          <p class="text-xs text-slate-300 mt-1">Contact: <strong>${activeVendor.contactPerson}</strong> (${activeVendor.phone}) · ${activeVendor.address}</p>
        </div>

        <!-- Vendor Profile Switcher -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-400">Vendor:</span>
          <select 
            class="input-custom text-xs py-1.5"
            onchange="window.switchVendor(this.value)"
          >
            ${state.vendors.map(v => `
              <option value="${v.id}" ${v.id === activeVendor.id ? 'selected' : ''}>
                ${v.name}
              </option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- PURCHASE ORDERS SECTION -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Incoming Purchase Orders -->
        <div class="glass-panel p-6 rounded-2xl">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div>
              <h2 class="text-base font-serif text-white font-bold">Incoming Hotel Capitol Orders</h2>
              <p class="text-xs text-slate-300">Authorized by Hotel Capitol General Manager Seyi Adeyemi.</p>
            </div>
            <span class="badge-gold text-xs">${approvedRequestsForVendor.length} Active</span>
          </div>

          ${approvedRequestsForVendor.length === 0 ? `
            <div class="text-xs text-slate-400 py-6 text-center">No outstanding purchase orders for this supplier.</div>
          ` : `
            <div class="flex flex-col gap-3">
              ${approvedRequestsForVendor.map(sr => `
                <div class="p-4 rounded-xl bg-navy-950 border border-gold/40 text-xs">
                  <div class="flex items-center justify-between mb-1">
                    <strong class="text-white text-sm font-serif">PO Ref: ${sr.id}</strong>
                    <span class="badge-normal text-[10px]">AUTHORIZED</span>
                  </div>
                  <div class="text-white font-bold text-sm mb-1">${sr.itemName}</div>
                  <div class="text-slate-300 mb-2">Quantity: <strong>${sr.quantity} ${sr.unit}</strong> · Total: <strong class="text-gold">₦${sr.estimatedCost.toLocaleString()}</strong></div>
                  <div class="text-slate-400 text-[11px] mb-3">Approved By: ${sr.approvedBy} (${sr.approvedAt})</div>

                  <div class="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button class="btn-secondary text-xs py-1.5 px-3 flex-1" onclick="window.vendorAcceptPO('${sr.id}', '${sr.id}')">
                      ✓ Confirm Order
                    </button>
                    <button class="btn-primary text-xs py-1.5 px-3 flex-1 font-bold" onclick="window.vendorDeliverPO('${sr.id}')">
                      🚚 Mark Dispatched & Delivered
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Supplier Delivery & Invoicing History -->
        <div class="glass-panel p-6 rounded-2xl">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div>
              <h2 class="text-base font-serif text-white font-bold">Fulfillment History & Invoices</h2>
              <p class="text-xs text-slate-300">Delivered stock items automatically updated in hotel system.</p>
            </div>
          </div>

          ${deliveredRequests.length === 0 ? `
            <div class="text-xs text-slate-400 py-6 text-center">No completed deliveries yet.</div>
          ` : `
            <div class="flex flex-col gap-2">
              ${deliveredRequests.map(sr => `
                <div class="p-3 rounded-xl bg-navy-950 border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <strong class="text-white">${sr.itemName}</strong>
                    <div class="text-slate-400 text-[10px]">Qty: ${sr.quantity} ${sr.unit} · PO: ${sr.id}</div>
                  </div>
                  <div class="text-right">
                    <span class="badge-normal text-[9px]">DELIVERED & RESTOCKED</span>
                    <div class="text-gold font-bold text-xs mt-0.5">₦${sr.estimatedCost.toLocaleString()}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}

          <div class="mt-6 p-4 rounded-xl bg-navy-950/60 border border-white/10 text-xs">
            <div class="font-bold text-white mb-1">Submit Digital Supplier Invoice</div>
            <p class="text-slate-400 text-[11px] mb-3">Upload your tax invoice or receipt reference for Finance clearance.</p>
            <div class="flex gap-2">
              <input type="text" placeholder="Invoice Number (e.g. INV-9021)..." class="input-custom text-xs py-1.5 flex-1" />
              <button class="btn-primary text-xs py-1.5 px-4" onclick="alert('Invoice submitted to Hotel Capitol accounts department.')">
                Submit
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  `;
}
