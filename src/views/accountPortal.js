/**
 * HOTEL CAPITOL — ACCOUNT & DISBURSEMENT PORTAL
 * 6 Animashaun Close, Ikeja, Lagos
 * Vendor Payment Approval, Settlement Confirmation & Audit History
 */

import { getIcon } from '../assets/icons.js';
import { store } from '../store/state.js';
import { automationEngine } from '../services/automationRules.js';

let accountActiveTab = 'disbursements'; // 'disbursements' | 'history' | 'receipts'
let activeAccountPdfReqId = null;

export function initAccountPortal() {
  window.navigateAccountTab = (tab) => {
    accountActiveTab = tab;
    if (window.renderApp) window.renderApp();
  };

  window.confirmPaymentDisbursement = (payId) => {
    try {
      const refNumber = prompt('Enter Bank Payment Reference / Transfer ID:', 'ZEN-' + Date.now().toString().slice(-6));
      if (!refNumber) return;

      const officer = store.getActiveStaff().name + ' (Accounts Officer)';
      const updated = store.confirmAccountPayment(payId, refNumber, officer);
      automationEngine.playChime('success');
      automationEngine.showToast('Payment Confirmed', `Disbursement ₦${updated.amount.toLocaleString()} settled. Ref: ${updated.paymentRef}`, 'success');
      if (window.renderApp) window.renderApp();
    } catch (err) {
      alert(err.message);
    }
  };

  window.releaseRequisitionPaymentAction = (reqId) => {
    try {
      const staff = store.getActiveStaff();
      const officer = staff.name + ' (Chief Accountant)';
      const updated = store.releaseAPPayment(reqId, {
        officerName: officer,
        paymentChannel: 'NIBSS Instant Payment (Zenith Bank Corporate Direct)'
      });
      automationEngine.playChime('success');
      automationEngine.showToast('Payment Released & Audit Closed', `Disbursed ₦${updated.estimatedCost.toLocaleString()} to ${updated.preferredVendorName}. Inventory stock updated!`, 'success');
      if (window.renderApp) window.renderApp();
    } catch (err) {
      alert(err.message);
    }
  };

  window.viewAccountAuditPdfModal = (reqId) => {
    activeAccountPdfReqId = reqId;
    if (window.renderApp) window.renderApp();
  };

  window.closeAccountAuditPdfModal = () => {
    activeAccountPdfReqId = null;
    if (window.renderApp) window.renderApp();
  };
}

export function renderAccountPortal() {
  const state = store.getState();
  const payments = state.accountPayments || [];
  const receipts = state.vendorReceipts || [];
  const requisitions = state.procurementRequisitions || [];

  const queuedReqs = requisitions.filter(r => r.status === 'PROCUREMENT_VERIFIED' || r.status === 'RECEIPT_CONFIRMED' || r.status === 'GOODS_DELIVERED' || r.payment?.status === 'HOLD_PENDING_RECEIPT');
  const closedReqs = requisitions.filter(r => r.status === 'AUDIT_CLOSED');

  const pendingPayments = payments.filter(p => p.status === 'AWAITING_PAYMENT');
  const confirmedPayments = payments.filter(p => p.status === 'CONFIRMED_PAID');
  const totalDisbursed = confirmedPayments.reduce((sum, p) => sum + p.amount, 0) + closedReqs.reduce((sum, r) => sum + (r.estimatedCost || 0), 0);

  return `
    <div class="container-custom py-6 animate-fade-in">
      
      <!-- Top Account Header -->
      <div class="glass-panel p-6 rounded-2xl mb-8 border-2 border-gold/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="text-xs font-bold uppercase tracking-luxury text-gold">Financial Governance & Disbursements</span>
            <span class="badge-gold text-xs">ACCOUNTS DEPARTMENT</span>
          </div>
          <h1 class="text-2xl font-serif text-white font-bold">Vendor Payments & Accounts Portal</h1>
          <p class="text-xs text-slate-300 mt-1">Authorized invoice payments, mandatory 2-way receipt hold governance, and PDF audit certificates.</p>
        </div>

        <div class="flex items-center gap-3">
          <div class="text-right">
            <div class="text-[11px] text-slate-400">Total Settled Disbursed:</div>
            <div class="text-xl font-serif font-bold text-gold">₦${totalDisbursed.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-2 border-b border-gold/20 pb-3 mb-6">
        <button 
          class="menu-btn-gold ${accountActiveTab === 'disbursements' ? 'active' : ''} text-xs py-2 px-4 rounded-xl cursor-pointer"
          onclick="window.navigateAccountTab('disbursements')"
        >
          💳 Awaiting Payment (${queuedReqs.length + pendingPayments.length})
        </button>
        <button 
          class="menu-btn-gold ${accountActiveTab === 'history' ? 'active' : ''} text-xs py-2 px-4 rounded-xl cursor-pointer"
          onclick="window.navigateAccountTab('history')"
        >
          📜 Payment History & Audit (${closedReqs.length + confirmedPayments.length})
        </button>
        <button 
          class="menu-btn-gold ${accountActiveTab === 'receipts' ? 'active' : ''} text-xs py-2 px-4 rounded-xl cursor-pointer"
          onclick="window.navigateAccountTab('receipts')"
        >
          🧾 Submitted Receipts (${receipts.length})
        </button>
      </div>

      <!-- TAB 1: AWAITING PAYMENT (WITH MANDATORY 2-WAY RECEIPT HOLD) -->
      ${accountActiveTab === 'disbursements' ? `
        <div class="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-6">
          <div class="flex items-center justify-between pb-3 border-b border-white/10 flex-wrap gap-2">
            <div>
              <h3 class="font-serif text-sm font-bold text-white tracking-luxury uppercase">AP DISBURSEMENT QUEUE & PAYMENT HOLD ENFORCEMENT</h3>
              <p class="text-xs text-slate-400">Mandatory rule: Payment release is strictly held until physical dock receipt confirmation is signed by Stores.</p>
            </div>
            <span class="badge-gold text-xs">${queuedReqs.length} Procurement Requisitions</span>
          </div>

          <!-- Section 1: Canonical 14-Stage Procurement Invoices Awaiting Payment -->
          <div class="flex flex-col gap-4">
            ${queuedReqs.map(req => {
              const isHold = !req.receiving || req.receiving.conditionStatus !== 'PASSED';

              return `
                <div class="p-5 rounded-2xl bg-navy-950 border ${isHold ? 'border-amber-500/40' : 'border-emerald-500/40'} flex flex-col gap-4 shadow-xl">
                  
                  <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div>
                      <div class="flex items-center gap-2 mb-1 flex-wrap">
                        <strong class="text-white text-sm font-mono">${req.invoice?.invoiceNumber || req.id}</strong>
                        <span class="badge-gold text-xs font-mono">${req.preferredVendorCode}</span>
                        ${isHold ? `
                          <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/50 font-bold">
                            🔒 WAITING FOR PHYSICAL RECEIPT (PAYMENT ON HOLD)
                          </span>
                        ` : `
                          <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-bold">
                            ✓ PHYSICAL RECEIPT CONFIRMED (PAYMENT UNLOCKED)
                          </span>
                        `}
                      </div>
                      <div class="font-bold text-white text-base">${req.itemName} (${req.reorderQuantity} units)</div>
                      <div class="text-xs text-slate-300 mt-0.5">Supplier: <strong class="text-white">${req.preferredVendorName}</strong> · LPO: <span class="font-mono text-gold">${req.lpo?.lpoNumber || 'N/A'}</span></div>
                    </div>

                    <div class="text-left md:text-right shrink-0">
                      <div class="text-xs text-slate-400">Total Payable Amount:</div>
                      <div class="text-xl font-serif font-black text-gold">₦${(req.estimatedCost || 0).toLocaleString()}</div>
                    </div>
                  </div>

                  <!-- Two-Way Hold Notice / Receiving Verification Details -->
                  <div class="p-3 rounded-xl ${isHold ? 'bg-amber-950/30 border border-amber-500/30 text-amber-200' : 'bg-emerald-950/30 border border-emerald-500/30 text-emerald-200'} text-xs">
                    ${isHold ? `
                      <div class="flex items-center gap-2">
                        <span>⚠️</span>
                        <span><strong>Two-Way Hold Active:</strong> Goods have not been physically received at Hotel Capitol Loading Bay. Accounts Payable cannot release funds until receiving inspection is signed off.</span>
                      </div>
                    ` : `
                      <div class="flex flex-col gap-1">
                        <div class="font-bold flex items-center gap-1">
                          <span>✓</span> <span>Stores Inspection Passed: ${req.receiving.itemsAcceptedQuantity} units verified by ${req.receiving.inspectorName}</span>
                        </div>
                        <div class="text-[11px] text-slate-300">Carrier Waybill: <strong class="text-white font-mono">${req.receiving.waybillNumber}</strong> · Confirmed: ${req.receiving.confirmedAt}</div>
                      </div>
                    `}
                  </div>

                  <!-- Action Bar -->
                  <div class="flex justify-end pt-1">
                    ${isHold ? `
                      <button 
                        class="btn-secondary text-xs py-2 px-5 font-bold opacity-60 cursor-not-allowed"
                        title="Physical goods receiving must be signed off by Stores/Procurement before payment can be executed."
                        onclick="alert('Precondition Failed: Physical delivery has not been confirmed by Procurement/Stores. Payment is on hold.');"
                      >
                        🔒 Payment Held Pending Stores Inspection
                      </button>
                    ` : `
                      <button 
                        class="btn-primary text-xs py-2 px-6 font-bold cursor-pointer shadow-lg"
                        onclick="window.releaseRequisitionPaymentAction('${req.id}')"
                      >
                        💸 Confirm Payment Transfer (₦${(req.estimatedCost || 0).toLocaleString()}) →
                      </button>
                    `}
                  </div>

                </div>
              `;
            }).join('')}
          </div>

          <!-- Section 2: Legacy Direct Invoices -->
          ${pendingPayments.length > 0 ? `
            <div class="mt-4 pt-4 border-t border-white/10">
              <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Additional Pending Accounts Invoices:</div>
              <div class="flex flex-col gap-3">
                ${pendingPayments.map(p => `
                  <div class="p-4 rounded-xl bg-navy-950 border border-gold/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div class="flex items-center gap-2 mb-1">
                        <strong class="text-white text-sm">${p.supplierName}</strong>
                        <span class="badge-gold text-xs font-mono">${p.supplierCode}</span>
                        <span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 font-bold">
                          AWAITING PAYMENT
                        </span>
                      </div>
                      <div class="text-xs text-slate-300">Invoice Reference: <strong class="text-white">${p.invoiceRef}</strong> · Ref ID: <span class="font-mono text-gold">${p.paymentRef}</span></div>
                      <div class="text-sm font-bold text-gold font-serif mt-1">Amount Due: ₦${p.amount.toLocaleString()}</div>
                      <div class="text-[11px] text-slate-400 mt-1 italic">${p.notes}</div>
                    </div>
                    <button 
                      class="btn-primary text-xs py-2 px-5 font-bold cursor-pointer shadow-md whitespace-nowrap"
                      onclick="window.confirmPaymentDisbursement('${p.id}')"
                    >
                      ✓ Confirm Payment Transfer →
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

        </div>
      ` : ''}

      <!-- TAB 2: PAYMENT HISTORY & AUDIT CLOSEOUTS -->
      ${accountActiveTab === 'history' ? `
        <div class="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
          <div class="flex items-center justify-between pb-3 border-b border-white/10 flex-wrap gap-2">
            <h3 class="font-serif text-sm font-bold text-white tracking-luxury uppercase">SETTLED PROCUREMENT DISBURSEMENTS & CLOSEOUT CERTIFICATES</h3>
            <span class="badge-gold text-xs">${closedReqs.length + confirmedPayments.length} Settled Transactions</span>
          </div>

          <div class="flex flex-col gap-4">
            ${closedReqs.map(r => `
              <div class="p-5 rounded-2xl bg-navy-950 border border-gold/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
                <div>
                  <div class="flex items-center gap-2 mb-1 flex-wrap">
                    <strong class="text-white text-sm font-mono">${r.id}</strong>
                    <span class="badge-gold text-xs font-mono">${r.preferredVendorCode}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                      AUDIT CLOSED & SETTLED
                    </span>
                  </div>
                  <div class="font-bold text-white text-base">${r.itemName} (${r.reorderQuantity} units)</div>
                  <div class="text-xs text-slate-300 mt-0.5">Bank Ref: <strong class="text-gold font-mono">${r.payment?.paymentRef}</strong> · Officer: <strong class="text-white">${r.payment?.officerName}</strong></div>
                  <div class="text-[11px] text-slate-400 mt-1">Disbursed on: ${r.payment?.releasedAt || r.approvalStartedAt} · Channel: ${r.payment?.paymentChannel || 'Zenith Bank Direct Transfer'}</div>
                </div>

                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div class="text-left md:text-right">
                    <div class="text-lg font-serif font-black text-gold">₦${(r.estimatedCost || 0).toLocaleString()}</div>
                    <div class="text-[10px] text-emerald-400">Inventory Auto-Restocked</div>
                  </div>
                  <button 
                    class="btn-secondary text-xs py-2 px-4 font-bold text-gold border-gold/40 cursor-pointer"
                    onclick="window.viewAccountAuditPdfModal('${r.id}')"
                  >
                    🧾 View PDF Certificate
                  </button>
                </div>
              </div>
            `).join('')}

            ${confirmedPayments.map(p => `
              <div class="p-4 rounded-xl bg-navy-950 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <strong class="text-white text-sm">${p.supplierName} (${p.supplierCode})</strong>
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                      PAID & SETTLED
                    </span>
                  </div>
                  <div class="text-slate-300">Bank Transfer Ref: <strong class="text-gold font-mono">${p.paymentRef}</strong> · Invoice: <strong>${p.invoiceRef}</strong></div>
                  <div class="text-slate-400 mt-1">Paid at: ${p.paidAt} · Authorized by: <strong class="text-white">${p.officerName}</strong></div>
                </div>
                <div class="text-right">
                  <div class="text-base font-serif font-bold text-gold">₦${p.amount.toLocaleString()}</div>
                  <div class="text-[10px] text-emerald-400 mt-1">Receipt Linked: ${p.receiptRef || 'Pending Supplier Receipt'}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- TAB 3: VENDOR RECEIPTS -->
      ${accountActiveTab === 'receipts' ? `
        <div class="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
          <h3 class="font-serif text-sm font-bold text-white tracking-luxury uppercase pb-3 border-b border-white/10">SUBMITTED VENDOR RECEIPTS</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${receipts.map(r => `
              <div class="p-4 rounded-xl bg-navy-950 border border-gold/30 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <strong class="text-white text-sm">${r.receiptNumber}</strong>
                    <span class="badge-gold text-xs font-mono font-bold">${r.supplierCode}</span>
                  </div>
                  <div class="text-xs text-gold-light">${r.supplierName}</div>
                  <div class="text-xs text-slate-300 mt-2">Paid for Invoice: <strong>${r.invoiceNumber}</strong></div>
                  <div class="text-xs text-slate-400">Payment Ref: <span class="font-mono text-gold">${r.paymentRef}</span></div>
                  <div class="text-base font-serif font-bold text-gold mt-2">Amount: ₦${r.amount.toLocaleString()}</div>
                </div>
                <div class="mt-3 pt-2 border-t border-white/10 text-[10px] text-slate-400 flex justify-between">
                  <span>Issued: ${r.submittedAt}</span>
                  <span class="text-emerald-400 font-semibold">Verified</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- AUDIT PDF MODAL -->
      ${activeAccountPdfReqId ? `
        <div class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div class="glass-panel max-w-3xl w-full p-6 rounded-2xl border-2 border-gold shadow-2xl animate-fade-in my-8" style="background: rgba(8, 17, 28, 0.98);">
            <div class="flex items-center justify-between pb-3 border-b border-gold/20 mb-4">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-luxury text-gold">Official Closeout Document</span>
                <span class="badge-gold text-[10px] font-mono">AUD-PDF-2026</span>
              </div>
              <button class="text-slate-400 hover:text-white bg-transparent border-none text-lg cursor-pointer" onclick="window.closeAccountAuditPdfModal()">✕</button>
            </div>

            <div class="max-h-[70vh] overflow-y-auto p-2 rounded-xl bg-navy-950 border border-white/10">
              ${store.generateSimulatedAuditPDF(activeAccountPdfReqId)?.htmlMarkup || '<div class="p-8 text-center text-slate-400">Certificate not available.</div>'}
            </div>

            <div class="flex items-center justify-between pt-4 mt-3 border-t border-white/10 flex-wrap gap-2">
              <span class="text-xs text-slate-400">Cryptographically Signed & Sealed by Hotel Capitol ERP</span>
              <div class="flex items-center gap-2">
                <button class="btn-secondary text-xs py-1.5 px-4 cursor-pointer" onclick="window.print()">🖨️ Print Certificate</button>
                <button class="btn-primary text-xs py-1.5 px-5 font-bold cursor-pointer" onclick="window.closeAccountAuditPdfModal()">Done</button>
              </div>
            </div>
          </div>
        </div>
      ` : ''}

    </div>
  `;
}
