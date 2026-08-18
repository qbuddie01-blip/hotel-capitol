/**
 * HOTEL CAPITOL — ACCOUNT & DISBURSEMENT PORTAL
 * 6 Animashaun Close, Ikeja, Lagos
 * Vendor Payment Approval, Settlement Confirmation & Audit History
 */

import { getIcon } from '../assets/icons.js';
import { store } from '../store/state.js';
import { automationEngine } from '../services/automationRules.js';

let accountActiveTab = 'disbursements'; // 'disbursements' | 'history' | 'receipts'

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
}

export function renderAccountPortal() {
  const state = store.getState();
  const payments = state.accountPayments || [];
  const receipts = state.vendorReceipts || [];
  const invoices = state.vendorInvoices || [];

  const pendingPayments = payments.filter(p => p.status === 'AWAITING_PAYMENT');
  const confirmedPayments = payments.filter(p => p.status === 'CONFIRMED_PAID');
  const totalDisbursed = confirmedPayments.reduce((sum, p) => sum + p.amount, 0);

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
          <p class="text-xs text-slate-300 mt-1">Authorized invoice payments, executive bank transfers, and supplier receipt verification.</p>
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
          💳 Awaiting Payment (${pendingPayments.length})
        </button>
        <button 
          class="menu-btn-gold ${accountActiveTab === 'history' ? 'active' : ''} text-xs py-2 px-4 rounded-xl cursor-pointer"
          onclick="window.navigateAccountTab('history')"
        >
          📜 Payment History (${confirmedPayments.length})
        </button>
        <button 
          class="menu-btn-gold ${accountActiveTab === 'receipts' ? 'active' : ''} text-xs py-2 px-4 rounded-xl cursor-pointer"
          onclick="window.navigateAccountTab('receipts')"
        >
          🧾 Submitted Receipts (${receipts.length})
        </button>
      </div>

      <!-- TAB 1: AWAITING PAYMENT -->
      ${accountActiveTab === 'disbursements' ? `
        <div class="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 class="font-serif text-sm font-bold text-white tracking-luxury uppercase">PROCUREMENT-APPROVED INVOICES AWAITING SETTLEMENT</h3>
            <span class="badge-gold text-xs">${pendingPayments.length} Pending</span>
          </div>

          ${pendingPayments.length === 0 ? `
            <div class="p-8 text-center text-xs text-slate-400">
              No outstanding vendor payments awaiting disbursement. All approved invoices are settled.
            </div>
          ` : `
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
          `}
        </div>
      ` : ''}

      <!-- TAB 2: PAYMENT HISTORY -->
      ${accountActiveTab === 'history' ? `
        <div class="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
          <h3 class="font-serif text-sm font-bold text-white tracking-luxury uppercase pb-3 border-b border-white/10">CONFIRMED VENDOR DISBURSEMENTS AUDIT</h3>
          <div class="flex flex-col gap-3">
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

    </div>
  `;
}
