/**
 * HOTEL CAPITOL — VENDOR & SUPPLIER PORTAL
 * 6 Animashaun Close, Ikeja, Lagos
 * Supplier Invoicing, Payment Confirmation, Receipt Issuance & Price Adjustments
 */

import { getIcon } from '../assets/icons.js';
import { store } from '../store/state.js';
import { automationEngine } from '../services/automationRules.js';

let vendorActiveTab = 'orders'; // 'orders' | 'invoicing' | 'receipts' | 'price-updates' | 'onboarding'
let showOnboardingModal = false;

export function initVendorPortal() {
  window.navigateVendorTab = (tab) => {
    vendorActiveTab = tab;
    if (window.renderApp) window.renderApp();
  };

  window.switchSupplier = (code) => {
    const suppliers = store.getState().suppliers || [];
    const sup = suppliers.find(s => s.supplierCode === code);
    if (sup) {
      automationEngine.showToast('Supplier Switched', `Active Supplier: ${sup.name} (${sup.supplierCode})`, 'info');
      if (window.renderApp) window.renderApp();
    }
  };

  window.submitVendorOnboardingForm = (e) => {
    e.preventDefault();
    try {
      const vendorName = document.getElementById('von-name').value.trim();
      const productCategory = document.getElementById('von-category').value;
      const phone = document.getElementById('von-phone').value.trim();
      const email = document.getElementById('von-email').value.trim();
      const whatsapp = document.getElementById('von-whatsapp').value.trim();
      const address = document.getElementById('von-address').value.trim();
      const contactPerson = document.getElementById('von-contact').value.trim();
      const productsSupplied = document.getElementById('von-products').value.trim();
      const supplyCapability = document.getElementById('von-capability').value.trim();
      const businessDescription = document.getElementById('von-desc').value.trim();

      const sub = store.submitVendorOnboarding({
        vendorName, productCategory, phone, email, whatsapp, address, contactPerson, productsSupplied, supplyCapability, businessDescription
      });

      automationEngine.playChime('success');
      alert('Hotel Capitol has received your submission and will respond in 24 hours.');
      vendorActiveTab = 'orders';
      if (window.renderApp) window.renderApp();
    } catch (err) {
      alert(err.message);
    }
  };

  window.generateInvoiceForOrder = (orderId) => {
    try {
      const inv = store.generateVendorInvoice(orderId);
      automationEngine.playChime('success');
      alert(`Invoice ${inv.invoiceNumber} generated for PO ${orderId} (₦${inv.totalAmount.toLocaleString()}) and submitted to Procurement for approval.`);
      if (window.renderApp) window.renderApp();
    } catch (err) {
      alert(err.message);
    }
  };

  window.generateAndSubmitReceipt = (paymentId) => {
    try {
      const rcp = store.generateVendorReceipt(paymentId);
      automationEngine.playChime('success');
      alert(`Official Receipt ${rcp.receiptNumber} generated for Payment ${rcp.paymentRef} (₦${rcp.amount.toLocaleString()}) and submitted to Hotel Capitol Accounts.`);
      if (window.renderApp) window.renderApp();
    } catch (err) {
      alert(err.message);
    }
  };

  window.submitPriceUpdateRequestForm = (e) => {
    e.preventDefault();
    try {
      const supplierCode = document.getElementById('pur-supplier-code').value;
      const supplierName = document.getElementById('pur-supplier-name').value;
      const productId = document.getElementById('pur-product-id').value;
      const productName = document.getElementById('pur-product-name').value;
      const currentPrice = Number(document.getElementById('pur-curr-price').value);
      const proposedPrice = Number(document.getElementById('pur-prop-price').value);
      const reason = document.getElementById('pur-reason').value.trim();

      const req = store.submitPriceUpdateRequest({
        supplierCode, supplierName, productId, productName, currentPrice, proposedPrice, reason
      });

      automationEngine.playChime('success');
      alert(`Proposed price update for ${productName} (₦${proposedPrice.toLocaleString()}) submitted. Status: PENDING PROCUREMENT APPROVAL.`);
      if (window.renderApp) window.renderApp();
    } catch (err) {
      alert(err.message);
    }
  };
}

export function renderVendorPortal() {
  const state = store.getState();
  const suppliers = state.suppliers || [];
  const activeSupplier = suppliers[0] || {
    supplierCode: 'ABC-001',
    name: 'ABC Foods Limited',
    category: 'Kitchen Gourmet & Staples',
    contactPerson: 'Mr. Anthony Bassey',
    phone: '+234 802 334 5566',
    email: 'orders@abcfoods.ng',
    approvedPrices: []
  };

  const myOrders = (state.procurementOrders || []).filter(o => o.supplierCode === activeSupplier.supplierCode);
  const myInvoices = (state.vendorInvoices || []).filter(i => i.supplierCode === activeSupplier.supplierCode);
  const myPayments = (state.accountPayments || []).filter(p => p.supplierCode === activeSupplier.supplierCode);
  const myReceipts = (state.vendorReceipts || []).filter(r => r.supplierCode === activeSupplier.supplierCode);
  const myPriceRequests = (state.vendorPriceUpdateRequests || []).filter(r => r.supplierCode === activeSupplier.supplierCode);

  return `
    <div class="container-custom py-6 animate-fade-in">
      
      <!-- Top Header -->
      <div class="glass-panel p-6 rounded-2xl mb-8 border-2 border-gold/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="text-xs font-bold uppercase tracking-luxury text-gold">Official Supplier Network</span>
            <span class="badge-gold text-xs font-mono font-bold">${activeSupplier.supplierCode}</span>
          </div>
          <h1 class="text-2xl font-serif text-white font-bold">${activeSupplier.name}</h1>
          <p class="text-xs text-slate-300 mt-1">Category: <strong>${activeSupplier.category}</strong> · Contact: ${activeSupplier.contactPerson} (${activeSupplier.phone})</p>
        </div>

        <div class="flex items-center gap-3">
          <button class="btn-secondary text-xs py-2 px-4 cursor-pointer" onclick="window.navigateVendorTab('onboarding')">
            📋 New Supplier Registration
          </button>
          <button class="btn-primary text-xs py-2 px-4 font-bold cursor-pointer" onclick="if(window.openDeliveryTracker) window.openDeliveryTracker();">
            🚚 Track Live Dispatch
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-2 border-b border-gold/20 pb-3 mb-6 flex-wrap">
        <button 
          class="menu-btn-gold ${vendorActiveTab === 'orders' ? 'active' : ''} text-xs py-2 px-4 rounded-xl cursor-pointer"
          onclick="window.navigateVendorTab('orders')"
        >
          📦 Purchase Orders (${myOrders.length})
        </button>
        <button 
          class="menu-btn-gold ${vendorActiveTab === 'invoicing' ? 'active' : ''} text-xs py-2 px-4 rounded-xl cursor-pointer"
          onclick="window.navigateVendorTab('invoicing')"
        >
          🧾 Invoices & Billing (${myInvoices.length})
        </button>
        <button 
          class="menu-btn-gold ${vendorActiveTab === 'receipts' ? 'active' : ''} text-xs py-2 px-4 rounded-xl cursor-pointer"
          onclick="window.navigateVendorTab('receipts')"
        >
          💳 Payments & Receipts (${myReceipts.length})
        </button>
        <button 
          class="menu-btn-gold ${vendorActiveTab === 'price-updates' ? 'active' : ''} text-xs py-2 px-4 rounded-xl cursor-pointer"
          onclick="window.navigateVendorTab('price-updates')"
        >
          💲 Price Adjustment Requests (${myPriceRequests.length})
        </button>
        <button 
          class="menu-btn-gold ${vendorActiveTab === 'onboarding' ? 'active' : ''} text-xs py-2 px-4 rounded-xl cursor-pointer"
          onclick="window.navigateVendorTab('onboarding')"
        >
          📝 Supplier Registration Form
        </button>
      </div>

      <!-- TAB 1: PURCHASE ORDERS -->
      ${vendorActiveTab === 'orders' ? `
        <div class="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 class="font-serif text-sm font-bold text-white tracking-luxury uppercase">DOCUMENTED PURCHASE ORDERS (HOTEL CAPITOL)</h3>
            <span class="badge-gold text-xs">${myOrders.length} Orders</span>
          </div>

          ${myOrders.length === 0 ? `
            <div class="p-8 text-center text-xs text-slate-400">No active purchase orders issued.</div>
          ` : `
            <div class="flex flex-col gap-3">
              ${myOrders.map(o => `
                <div class="p-4 rounded-xl bg-navy-950 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <strong class="text-white text-sm font-mono">${o.id}</strong>
                      <span class="badge-gold text-xs font-mono">${o.supplierCode}</span>
                      <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                        ${o.status}
                      </span>
                    </div>
                    <div class="text-xs text-slate-300">Item: <strong class="text-white">${o.productName}</strong> (${o.quantity} ${o.unit} @ ₦${o.unitPrice.toLocaleString()})</div>
                    <div class="text-sm font-bold text-gold font-serif mt-1">Total Order Value: ₦${o.totalAmount.toLocaleString()}</div>
                    <div class="text-[11px] text-slate-400 mt-1">Required Delivery: ${o.requiredDeliveryDate} · Location: ${o.deliveryLocation}</div>
                  </div>

                  <div>
                    ${!myInvoices.some(i => i.orderId === o.id) ? `
                      <button 
                        class="btn-primary text-xs py-2 px-5 font-bold cursor-pointer shadow-md"
                        onclick="window.generateInvoiceForOrder('${o.id}')"
                      >
                        📄 Generate Invoice →
                      </button>
                    ` : `
                      <div class="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <span>✓</span> <span>Invoice Generated</span>
                      </div>
                    `}
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      ` : ''}

      <!-- TAB 2: INVOICES -->
      ${vendorActiveTab === 'invoicing' ? `
        <div class="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
          <h3 class="font-serif text-sm font-bold text-white tracking-luxury uppercase pb-3 border-b border-white/10">SUBMITTED INVOICES & PROCUREMENT STATUS</h3>
          <div class="flex flex-col gap-3">
            ${myInvoices.map(inv => `
              <div class="p-4 rounded-xl bg-navy-950 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <strong class="text-white text-sm font-mono">${inv.invoiceNumber}</strong>
                    <span class="badge-gold text-xs">${inv.supplierCode}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full ${inv.status === 'PENDING_APPROVAL' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'} font-bold">
                      ${inv.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div class="text-xs text-slate-300">Linked Purchase Order: <strong class="text-white font-mono">${inv.orderId}</strong> · Date: ${inv.issueDate}</div>
                  <div class="text-sm font-bold text-gold font-serif mt-1">Invoice Total: ₦${inv.totalAmount.toLocaleString()}</div>
                </div>
                <div class="text-right text-xs text-slate-400">
                  ${inv.procurementApprovedBy ? `<span class="text-emerald-400 font-bold">Approved by ${inv.procurementApprovedBy}</span>` : '<span class="text-amber-400 font-semibold">Under Procurement Verification</span>'}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- TAB 3: RECEIPTS -->
      ${vendorActiveTab === 'receipts' ? `
        <div class="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-6">
          <div>
            <h3 class="font-serif text-sm font-bold text-white tracking-luxury uppercase pb-3 border-b border-white/10">CONFIRMED PAYMENTS FROM HOTEL ACCOUNTS</h3>
            <div class="flex flex-col gap-3 mt-3">
              ${myPayments.map(p => `
                <div class="p-4 rounded-xl bg-navy-950 border border-gold/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <strong class="text-white text-sm">Payment Ref: ${p.paymentRef}</strong>
                      <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                        ${p.status}
                      </span>
                    </div>
                    <div class="text-xs text-slate-300">Invoice: <strong>${p.invoiceRef}</strong> · Amount: <strong class="text-gold font-serif">₦${p.amount.toLocaleString()}</strong></div>
                    <div class="text-[11px] text-slate-400 mt-0.5">Paid at: ${p.paidAt} · Authorized by: ${p.officerName}</div>
                  </div>

                  <div>
                    ${!p.receiptRef ? `
                      <button 
                        class="btn-primary text-xs py-2 px-5 font-bold cursor-pointer shadow-md"
                        onclick="window.generateAndSubmitReceipt('${p.id}')"
                      >
                        🧾 Issue & Submit Receipt →
                      </button>
                    ` : `
                      <div class="text-xs text-emerald-400 font-semibold font-mono">
                        ✓ Receipt Issued: ${p.receiptRef}
                      </div>
                    `}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- TAB 4: PRICE ADJUSTMENT REQUESTS -->
      ${vendorActiveTab === 'price-updates' ? `
        <div class="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-6">
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-white/10">
            <div>
              <h3 class="font-serif text-sm font-bold text-white tracking-luxury uppercase">SUPPLIER PRICE UPDATE WORKFLOW</h3>
              <p class="text-xs text-slate-300">Submit proposed price adjustments. Prices remain pending until Procurement approval.</p>
            </div>
          </div>

          <!-- Price Update Submission Form -->
          <form onsubmit="window.submitPriceUpdateRequestForm(event)" class="p-4 rounded-xl bg-navy-950 border border-gold/40 flex flex-col gap-3">
            <div class="text-xs font-bold text-gold uppercase">Propose New Product Price:</div>
            <input type="hidden" id="pur-supplier-code" value="${activeSupplier.supplierCode}" />
            <input type="hidden" id="pur-supplier-name" value="${activeSupplier.name}" />

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Product Name / Description:</label>
                <input type="text" id="pur-product-name" class="input-custom text-xs" value="${activeSupplier.approvedPrices[0]?.name || 'Premium Long Grain Parboiled Rice (50kg Bag)'}" required />
                <input type="hidden" id="pur-product-id" value="${activeSupplier.approvedPrices[0]?.productId || 'PRD-01'}" />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">Current Price (₦):</label>
                  <input type="number" id="pur-curr-price" class="input-custom text-xs" value="${activeSupplier.approvedPrices[0]?.approvedBulkPrice || 78000}" readonly />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">Proposed Price (₦):</label>
                  <input type="number" id="pur-prop-price" class="input-custom text-xs" value="${(activeSupplier.approvedPrices[0]?.approvedBulkPrice || 78000) + 3000}" required />
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Reason for Price Adjustment:</label>
              <textarea id="pur-reason" class="input-custom text-xs p-2 h-16" placeholder="e.g. Import tariff changes, transportation fuel inflation..." required></textarea>
            </div>

            <div class="flex justify-end">
              <button type="submit" class="btn-primary text-xs py-2 px-6 font-bold cursor-pointer">
                Submit Price Adjustment Request →
              </button>
            </div>
          </form>

          <!-- History of Requests -->
          <div class="flex flex-col gap-3">
            ${myPriceRequests.map(r => `
              <div class="p-4 rounded-xl bg-navy-950 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <strong class="text-white text-sm">${r.productName}</strong>
                    <span class="text-[10px] px-2 py-0.5 rounded-full ${r.status === 'PENDING_PROCUREMENT_APPROVAL' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'} font-bold">
                      ${r.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div class="text-slate-300">Adjustment: ₦${r.currentPrice.toLocaleString()} → <strong class="text-gold font-serif">₦${r.proposedPrice.toLocaleString()}</strong></div>
                  <div class="text-slate-400 italic mt-0.5">"${r.reason}" · Submitted ${r.submittedAt}</div>
                </div>
                <div class="text-right text-[11px] text-slate-400">
                  Status: <strong class="text-white">${r.status}</strong>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- TAB 5: PUBLIC ONBOARDING REGISTRATION FORM (Section 18) -->
      ${vendorActiveTab === 'onboarding' ? `
        <div class="max-w-2xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl border-2 border-gold/40 shadow-2xl flex flex-col gap-6">
          <div>
            <span class="text-xs font-bold uppercase tracking-luxury text-gold">Supplier Partnership Application</span>
            <h2 class="text-2xl font-serif text-white font-bold mt-1">Vendor Onboarding Registration</h2>
            <p class="text-xs text-slate-300 mt-1">Join the official Hotel Capitol Approved Supplier Network for hospitality, F&B, and amenities procurement.</p>
          </div>

          <form onsubmit="window.submitVendorOnboardingForm(event)" class="flex flex-col gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Company / Vendor Name:</label>
              <input type="text" id="von-name" class="input-custom text-xs" placeholder="e.g. Golden Star Beverages Nigeria Ltd" required />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Product Category:</label>
                <select id="von-category" class="input-custom text-xs">
                  <option value="Kitchen Produce & Oils">Kitchen Produce & Oils</option>
                  <option value="Fresh Meats & Seafood">Fresh Meats & Seafood</option>
                  <option value="Beverages & Soft Drinks">Beverages & Soft Drinks</option>
                  <option value="Housekeeping & Toiletries">Housekeeping & Toiletries</option>
                  <option value="Linen & Bedding Supplies">Linen & Bedding Supplies</option>
                  <option value="Engineering & Maintenance">Engineering & Maintenance</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Contact Person Name:</label>
                <input type="text" id="von-contact" class="input-custom text-xs" placeholder="Mrs. Funke Balogun" required />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Phone Number:</label>
                <input type="tel" id="von-phone" class="input-custom text-xs" placeholder="+234 802 000 1122" required />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Email Address:</label>
                <input type="email" id="von-email" class="input-custom text-xs" placeholder="sales@company.ng" required />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">WhatsApp Dispatch:</label>
                <input type="tel" id="von-whatsapp" class="input-custom text-xs" placeholder="+234 802 000 1122" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Registered Office & Depot Address:</label>
              <input type="text" id="von-address" class="input-custom text-xs" placeholder="44 Commercial Avenue, Yaba, Lagos" required />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Products Supplied & Specifications:</label>
              <textarea id="von-products" class="input-custom text-xs p-2 h-16" placeholder="List itemized products and package sizes..." required></textarea>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Weekly Supply Capability & Logistics Fleet:</label>
              <input type="text" id="von-capability" class="input-custom text-xs" placeholder="e.g. 500+ crates per week, 3 refrigerated vans in Lagos" required />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Company Description & References:</label>
              <textarea id="von-desc" class="input-custom text-xs p-2 h-16" placeholder="Brief company history, CAC registration details..."></textarea>
            </div>

            <div class="flex justify-end pt-3 border-t border-white/10">
              <button type="submit" class="btn-primary py-3 px-8 text-xs font-bold shadow-xl cursor-pointer">
                Submit Registration Application →
              </button>
            </div>
          </form>
        </div>
      ` : ''}

    </div>
  `;
}
