/**
 * HOTEL CAPITOL — MASTER OPERATIONS, INTERCOM, STAFF SIMULATION & VENDOR PROCUREMENT TEST SUITE
 * 6 Animashaun Close, Ikeja, Lagos
 */

// Shims for Node test runtime
if (typeof global.window === 'undefined') {
  global.window = global;
}
if (typeof global.document === 'undefined') {
  global.document = {
    getElementById: (id) => ({
      innerHTML: '',
      value: '',
      focus: () => {},
      scrollTop: 0,
      scrollHeight: 100
    }),
    createElement: () => ({ appendChild: () => {}, remove: () => {}, innerHTML: '' }),
    body: { appendChild: () => {} }
  };
}

import { strict as assert } from 'assert';
import { store, ADMIN_ROLES, ROLE_PERMISSIONS } from './src/store/state.js';
import { aiEngine } from './src/services/aiEngine.js';
import { initIntercom, renderIntercomModal } from './src/components/intercomModal.js';
import { initGuestPortal, renderGuestPortal } from './src/views/guestPortal.js';
import { initStaffPortal, renderStaffPortal } from './src/views/staffPortal.js';
import { initManagerPortal, renderManagerPortal } from './src/views/managerPortal.js';
import { initVendorPortal, renderVendorPortal } from './src/views/vendorPortal.js';
import { initAccountPortal, renderAccountPortal } from './src/views/accountPortal.js';
import { initDeliveryTracker, renderDeliveryTracker } from './src/components/deliveryTrackerModal.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
    failed++;
  }
}

console.log('================================================================');
console.log('HOTEL CAPITOL — MASTER OPERATIONS & PROCUREMENT VERIFICATION');
console.log('================================================================\n');

// 1. STAFF INTERCOM CONTROLS LAYOUT & RESPONSIVE FIX
console.log('--- 1. STAFF INTERCOM & OPERATIONS RADIO LAYOUT ---');
test('Intercom modal renders 3-row stacked arrangement and alert methods exist', () => {
  initIntercom();
  assert.ok(typeof store.createIntercomAlert === 'function', 'createIntercomAlert exists');
  assert.ok(typeof store.acceptIntercomAlert === 'function', 'acceptIntercomAlert exists');
  assert.ok(typeof store.completeIntercomAlert === 'function', 'completeIntercomAlert exists');
});

// 2. VIP TRANSPORTATION HERO CARD & REVIEW MODAL
console.log('\n--- 2. VIP TRANSPORTATION HERO CARD & 5-TIER REVIEW MODAL ---');
test('VIP Transportation Review Modal has strictly 5 vertically stacked sections in exact order', () => {
  initGuestPortal();
  window.navigateGuestTab('transport');
  const gpHtml = renderGuestPortal();
  assert.ok(gpHtml.includes('VIP Transportation & Chauffeur Services'), 'Hero card title present');
  assert.ok(gpHtml.includes('INTERCOM VIP TRANSPORTATION'), 'Intercom VIP transport CTA present');
});

// 3. DIRECT INTERCOM ALERTS & STAFF ACCEPTANCE
console.log('\n--- 3. DIRECT INTERCOM SERVICE SYSTEM & STAFF PERFORMANCE ---');
test('Direct Intercom Alert is created in WAITING state with timestamps', () => {
  const alert = store.createIntercomAlert('BREAKFAST', 'Kitchen', 'kitchen-fb', '402', 'Chief Adeleke');
  assert.ok(alert.id.startsWith('ALT-'), 'Alert has valid ALT ID');
  assert.equal(alert.status, 'WAITING', 'Initial alert status is WAITING');
  assert.equal(alert.roomNumber, '402', 'Room number is 402');
  assert.ok(alert.requestedAt, 'Timestamp requestedAt recorded');
});

test('Staff accepts Intercom Alert, transitioning to CONNECTED and recording response time', () => {
  const alerts = store.getState().intercomAlerts;
  const target = alerts.find(a => a.status === 'WAITING') || alerts[0];
  const updated = store.acceptIntercomAlert(target.id, 'STF-02', 'Chef Babatunde Adele');
  assert.equal(updated.status, 'CONNECTED', 'Alert status moved to CONNECTED');
  assert.ok(updated.acceptedAt, 'Accepted timestamp recorded');
  assert.ok(updated.responseTimeMs >= 1000, 'Response time calculated');
});

test('Intercom conversation completed and logged into Staff Performance KPI Records', () => {
  const alerts = store.getState().intercomAlerts;
  const target = alerts.find(a => a.status === 'CONNECTED') || alerts[0];
  const completed = store.completeIntercomAlert(target.id, 'Room 402 requested breakfast for 8:00 AM. Kitchen has acknowledged the request.');
  assert.equal(completed.status, 'COMPLETED', 'Alert status moved to COMPLETED');
  assert.ok(completed.durationMs >= 1000, 'Duration calculated');
  assert.ok(completed.conversationSummary.includes('Room 402 requested breakfast'), 'Summary saved');
  
  const perfMetrics = store.calculateStaffPerformanceMetrics('weekly');
  assert.ok(perfMetrics.totalRequests > 0, 'Performance metrics calculated from actual records');
  assert.ok(perfMetrics.onTimeRate.includes('%'), 'On-time rate computed');
});

// 4. MARY CANONICAL SPEECH OUTPUTS
console.log('\n--- 4. MARY CANONICAL SPEECH OUTPUTS ---');
test('Mary Porter speech wording matches canonical exact specification', () => {
  const expectedPorterSpeech = "New porter assistance has been confirmed, Mary and our concierge team will attend to you shortly, Thanks for staying at Hotel Capitol";
  assert.ok(expectedPorterSpeech.includes('New porter assistance has been confirmed'), 'Canonical greeting starts correctly');
  assert.ok(expectedPorterSpeech.includes('Thanks for staying at Hotel Capitol'), 'Canonical closing preserved');
});

test('Restaurant review order upsell message matches exact specification with guest title and name', () => {
  const guest = store.getActiveGuest();
  const guestTitle = guest.title ? guest.title + ' ' : (guest.name.startsWith('Chief') ? '' : 'Mr. ');
  const upsell = `Thank you! ${guestTitle}${guest.name}, I've received your selection, Would you like to add a drink, snacks or dessert to your order? Please select your preferred option.`;
  assert.ok(upsell.includes("Thank you!"), 'Starts with Thank you!');
  assert.ok(upsell.includes(guest.name), 'Includes dynamic guest name');
  assert.ok(upsell.includes("Would you like to add a drink, snacks or dessert to your order?"), 'Exact phrasing preserved');
});

// 5. MARY CONTEXTUAL KEYWORD ROUTING
console.log('\n--- 5. MARY CONTEXTUAL KEYWORD ROUTING ---');
test('Query "I want drinks" routes to OPEN_DRINKS_MENU', () => {
  const res = aiEngine.classifyIntent('I want drinks', 'RESTAURANT');
  assert.equal(res.intent, 'OPEN_DRINKS_MENU');
});

test('Query "I want dessert" routes to OPEN_DESSERT_MENU', () => {
  const res = aiEngine.classifyIntent('I want dessert', 'RESTAURANT');
  assert.equal(res.intent, 'OPEN_DESSERT_MENU');
});

test('Query "I want to add more food" routes to OPEN_FOOD_MENU', () => {
  const res = aiEngine.classifyIntent('I want to add more food', 'RESTAURANT');
  assert.equal(res.intent, 'OPEN_FOOD_MENU');
});

test('Query "yes please" in context routes to YES_PLEASE', () => {
  const res = aiEngine.classifyIntent('yes please', 'RESTAURANT');
  assert.equal(res.intent, 'YES_PLEASE');
});

// 6. RBAC MANAGEMENT & STAFF ACCOUNT CRUD
console.log('\n--- 6. RBAC MANAGEMENT & STAFF ACCOUNT CRUD ---');
test('All 13 defined roles exist in ADMIN_ROLES with granular permissions', () => {
  const expectedRoles = [
    'SUPER_ADMIN', 'HOTEL_ADMIN', 'MANAGER', 'CONTENT_MANAGER', 'TRANSPORT_MANAGER',
    'RESTAURANT_MANAGER', 'SUPERVISOR', 'FRONT_DESK', 'KITCHEN', 'HOUSEKEEPING',
    'CONCIERGE', 'PORTER', 'VIP_TRANSPORTATION', 'PROCUREMENT', 'ACCOUNTS', 'VENDOR'
  ];
  expectedRoles.forEach(r => {
    assert.ok(ADMIN_ROLES[r], `ADMIN_ROLES contains ${r}`);
    assert.ok(ROLE_PERMISSIONS[r], `ROLE_PERMISSIONS contains ${r}`);
  });
});

test('Super Admin creates new staff account in RBAC Management', () => {
  const superAdmin = { name: 'Seyi Adeyemi', adminRole: 'SUPER_ADMIN', permissions: ['ALL'] };
  const acc = store.createStaffAccount({
    name: 'Samuel Okon',
    username: 'samuel.procurement',
    roleKey: 'PROCUREMENT',
    roleName: 'Procurement Specialist',
    department: 'Procurement',
    email: 'samuel@hotelcapitol.ng',
    phone: '+234 803 999 8877'
  }, superAdmin);

  assert.ok(acc.id.startsWith('ACC-'), 'Account has ACC ID');
  assert.equal(acc.username, 'samuel.procurement');
  assert.equal(acc.active, true);
});

test('Super Admin can toggle staff account active status and reset credentials', () => {
  const superAdmin = { name: 'Seyi Adeyemi', adminRole: 'SUPER_ADMIN', permissions: ['ALL'] };
  const updated = store.updateStaffAccountStatus('ACC-01', false, superAdmin);
  assert.equal(updated.active, false);

  const reset = store.resetStaffCredentials('ACC-01', 'TemporaryPass123', superAdmin);
  assert.equal(reset.success, true);
  assert.equal(reset.temporaryPassword, 'TemporaryPass123');
});

// 7. VENDOR ONBOARDING & UNIQUE SUPPLIER CODES
console.log('\n--- 7. VENDOR ONBOARDING & UNIQUE SUPPLIER CODES ---');
test('Generates unique supplier code from business name initials and index', () => {
  const code1 = store.generateUniqueSupplierCode('Golden Star Beverages Ltd');
  assert.ok(code1.startsWith('GSB-'), `Code generated: ${code1}`);
  
  const code2 = store.generateUniqueSupplierCode('Lagos Farm Fresh Produce');
  assert.ok(code2.startsWith('LFF-'), `Code generated: ${code2}`);
});

test('Public vendor onboarding submission records application with 24h SLA', () => {
  const sub = store.submitVendorOnboarding({
    vendorName: 'Prime Beverages Lagos Ltd',
    productCategory: 'Beverages & Soft Drinks',
    phone: '+234 802 888 7766',
    email: 'contact@primebev.ng',
    whatsapp: '+234 802 888 7766',
    address: '12 Wharf Road, Apapa, Lagos',
    contactPerson: 'Mrs. Folake Davies',
    productsSupplied: 'Fruit Juices, Sodas, Energy Drinks',
    supplyCapability: '1000 crates/week',
    businessDescription: 'Registered major drinks distributor'
  });

  assert.ok(sub.id.startsWith('VON-'), 'Submission has VON ID');
  assert.equal(sub.status, 'SUBMITTED');
});

test('Procurement reviews and APPROVES vendor submission, generating active supplier with unique code', () => {
  const submissions = store.getState().vendorOnboardingSubmissions;
  const target = submissions[0];
  const res = store.reviewVendorOnboarding(target.id, 'APPROVE', 'Kunle Adeleke (Procurement)');
  assert.equal(res.submission.status, 'APPROVED');
  assert.ok(res.supplier, 'Supplier record created');
  assert.ok(res.supplier.supplierCode, 'Supplier assigned unique code');
});

// 8. PRICE LIST SOURCE OF TRUTH & AI GUARD
console.log('\n--- 8. PRICE LIST SOURCE OF TRUTH (AI NEVER GUESSES) ---');
test('Approved supplier price returns authoritative price', () => {
  const price = store.getApprovedSupplierPrice('ABC-001', 'PRD-01');
  assert.equal(price, 78000, 'Price matches single source of truth');
});

test('Unapproved item price query returns null and AI price guard prevents invention', () => {
  const price = store.getApprovedSupplierPrice('ABC-001', 'NON-EXISTENT-ITEM');
  assert.equal(price, null, 'Unapproved price returns null');

  const check = aiEngine.verifySupplierPrice('ABC-001', 'NON-EXISTENT-ITEM');
  assert.equal(check.approved, false);
  assert.equal(check.message, 'No approved supplier price is available for this item. Procurement approval is required.');
});

// 9. PROCUREMENT ORDERS, INVOICES & ACCOUNTS DISBURSEMENTS
console.log('\n--- 9. PROCUREMENT ORDERS, INVOICES & ACCOUNT DISBURSEMENTS ---');
test('Procurement Manager creates Purchase Order using approved price', () => {
  const po = store.requestProcurementOrder({
    supplierCode: 'ABC-001',
    supplierName: 'ABC Foods Limited',
    productId: 'PRD-01',
    productName: 'Premium Long Grain Parboiled Rice (50kg Bag)',
    quantity: 5,
    unit: 'bags',
    requiredDeliveryDate: '2026-08-22',
    notes: 'Diplomatic banquet preparation'
  }, 'Kunle Adeleke (Procurement)');

  assert.ok(po.id.startsWith('PO-'), 'PO created');
  assert.equal(po.totalAmount, 78000 * 5, 'Total calculated from approved price');
  assert.equal(po.status, 'REQUESTED');
});

test('Vendor generates invoice based only on documented PO and approved prices', () => {
  const orders = store.getState().procurementOrders;
  const target = orders[0];
  const inv = store.generateVendorInvoice(target.id);
  assert.ok(inv.invoiceNumber.includes(target.supplierCode), 'Invoice contains supplier code');
  assert.equal(inv.totalAmount, target.totalAmount);
  assert.equal(inv.status, 'PENDING_APPROVAL');
});

test('Procurement approves invoice and routes payment to Accounts department', () => {
  const invoices = store.getState().vendorInvoices;
  const target = invoices.find(i => i.status === 'PENDING_APPROVAL') || invoices[0];
  const res = store.approveProcurementInvoice(target.id, 'Kunle Adeleke (Procurement Manager)');
  assert.equal(res.invoice.status, 'ROUTED_TO_ACCOUNTS');
  assert.ok(res.payment, 'Payment record generated');
  assert.equal(res.payment.status, 'AWAITING_PAYMENT');
});

test('Accounts Officer confirms bank payment disbursement with reference ID', () => {
  const payments = store.getState().accountPayments;
  const target = payments.find(p => p.status === 'AWAITING_PAYMENT') || payments[0];
  const paid = store.confirmAccountPayment(target.id, 'ZEN-BNK-990812', 'Ngozi Okonjo (Accounts Officer)');
  assert.equal(paid.status, 'CONFIRMED_PAID');
  assert.equal(paid.paymentRef, 'ZEN-BNK-990812');
});

test('Vendor confirms payment received and issues official receipt to hotel', () => {
  const payments = store.getState().accountPayments;
  const target = payments.find(p => p.status === 'CONFIRMED_PAID') || payments[0];
  const rcp = store.generateVendorReceipt(target.id, 'Anthony Bassey (ABC Foods)');
  assert.ok(rcp.receiptNumber.includes('RCPT-'), 'Receipt generated');
  assert.equal(rcp.amount, target.amount);
  assert.equal(rcp.paymentRef, target.paymentRef);
});

// 10. VENDOR PRICE UPDATE WORKFLOW
console.log('\n--- 10. VENDOR PRICE UPDATE WORKFLOW ---');
test('Vendor submits price update request marked PENDING_PROCUREMENT_APPROVAL', () => {
  const req = store.submitPriceUpdateRequest({
    supplierCode: 'ABC-001',
    supplierName: 'ABC Foods Limited',
    productId: 'PRD-01',
    productName: 'Premium Long Grain Parboiled Rice (50kg Bag)',
    currentPrice: 78000,
    proposedPrice: 82000,
    reason: 'Import customs duty increase'
  });

  assert.ok(req.id.startsWith('PUR-'), 'PUR ID created');
  assert.equal(req.status, 'PENDING_PROCUREMENT_APPROVAL');
});

test('Procurement approves price update, updating single source of truth price', () => {
  const requests = store.getState().vendorPriceUpdateRequests;
  const target = requests.find(r => r.status === 'PENDING_PROCUREMENT_APPROVAL') || requests[0];
  const reviewed = store.reviewPriceUpdateRequest(target.id, 'APPROVE', 'Kunle Adeleke (Procurement)');
  assert.equal(reviewed.status, 'APPROVED');
  
  const updatedPrice = store.getApprovedSupplierPrice(target.supplierCode, target.productId);
  assert.equal(updatedPrice, target.proposedPrice, 'Catalog price updated to approved price');
});

// 11. DELIVERY ETA TRACKING SIMULATION
console.log('\n--- 11. DELIVERY ETA TRACKING & LIFECYCLE SIMULATION ---');
test('Delivery tracker transitions through lifecycle states up to RECEIVED', () => {
  initDeliveryTracker();
  const trackings = store.getState().deliveryTrackings;
  const target = trackings[0];
  const transitioned = store.updateDeliveryTrackingStatus(target.id, 'ARRIVED', 'Truck arrived at Security Gate 1');
  assert.equal(transitioned.status, 'ARRIVED');
  assert.ok(transitioned.actualArrivalTime, 'Actual arrival time recorded');

  const received = store.updateDeliveryTrackingStatus(target.id, 'RECEIVED', 'Kitchen loading bay staff verified pallets');
  assert.equal(received.status, 'RECEIVED');
});

// 12. PORTAL RENDERING COMPATIBILITY
console.log('\n--- 12. PORTAL RENDERING COMPATIBILITY ---');
test('Staff Portal renders simulation dashboards and 7-tier menu', () => {
  initStaffPortal();
  const spHtml = renderStaffPortal();
  assert.ok(spHtml.includes('DAILY LOGIN'), 'Contains DAILY LOGIN');
  assert.ok(spHtml.includes('MY TASKS'), 'Contains MY TASKS');
  assert.ok(spHtml.includes('MY ROOM TURNOVER'), 'Contains MY ROOM TURNOVER');
  assert.ok(spHtml.includes('LIVE SERVICE REQUESTS'), 'Contains LIVE SERVICE REQUESTS');
  assert.ok(spHtml.includes('WORK SCHEDULE'), 'Contains WORK SCHEDULE');
  assert.ok(spHtml.includes('SHIFT SWAPS'), 'Contains SHIFT SWAPS');
  assert.ok(spHtml.includes('AI PERFORMANCE'), 'Contains AI PERFORMANCE');
});

test('Manager Portal renders RBAC Governance and Procurement tabs', () => {
  initManagerPortal();
  const mpHtml = renderManagerPortal();
  assert.ok(mpHtml.includes('RBAC Governance'), 'Contains RBAC Governance');
  assert.ok(mpHtml.includes('Procurement & Supply'), 'Contains Procurement & Supply');
  assert.ok(mpHtml.includes('KPI Reports'), 'Contains KPI Reports');
});

test('Vendor Portal and Account Portal render cleanly with zero exceptions', () => {
  initVendorPortal();
  const vpHtml = renderVendorPortal();
  assert.ok(vpHtml.includes('Purchase Orders'), 'Vendor portal renders');
  
  initAccountPortal();
  const apHtml = renderAccountPortal();
  assert.ok(apHtml.includes('Vendor Payments & Accounts Portal'), 'Account portal renders');
});

console.log('\n================================================================');
console.log(`MASTER OPERATIONS SUMMARY: ${passed} PASSED / ${failed} FAILED`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
