/**
 * HOTEL CAPITOL AI — COMPREHENSIVE SYSTEM VERIFICATION TEST
 * Tests Tolani Learning Engine, Intent Classification, Lagos Zonal Pricing,
 * Restaurant Lifecycle, Voice Config, and Human Review Approvals.
 */

import { store } from './src/store/state.js';
import { aiEngine, TOLANI_VOICE_CONFIG } from './src/services/aiEngine.js';
import { learningEngine } from './src/services/learningEngine.js';

console.log('================================================================');
console.log('HOTEL CAPITOL AI — TOLANI ADDITIVE SYSTEM VERIFICATION');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, name, details = '') {
  if (condition) {
    console.log(`[PASS] ${name}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${name} — ${details}`);
    failCount++;
  }
}

// 1. TOLANI VOICE CONFIGURATION
console.log('\n--- 1. SINGLE UNIFIED TOLANI VOICE CONFIGURATION ---');
assert(TOLANI_VOICE_CONFIG.rate === 0.93, 'Voice rate is configured to 0.93');
assert(TOLANI_VOICE_CONFIG.pitch === 1.08, 'Voice pitch is configured to 1.08');
assert(TOLANI_VOICE_CONFIG.locale === 'en-NG' || (TOLANI_VOICE_CONFIG.preferredLocales && TOLANI_VOICE_CONFIG.preferredLocales.includes('en-NG')), 'Voice language is en-NG / en-GB');

// 2. LAGOS ZONAL TRANSPORTATION & CHARTER PRICING
console.log('\n--- 2. LAGOS ZONAL TRANSPORTATION & CHARTER PRICING ---');
const state = store.getState();
const zones = state.lagosZones || [];
const vehicles = state.vehicleClasses || [];

assert(zones.length >= 11, `Lagos zones populated (${zones.length} zones found)`);
assert(vehicles.length === 4, `4 Vehicle classes populated (${vehicles.length} found)`);

const mma2 = zones.find(z => z.id === 'AIR-2');
const sedan = vehicles.find(v => v.id === 'VEH-SEDAN');
const suv = vehicles.find(v => v.id === 'VEH-SUV');
const sprinter = vehicles.find(v => v.id === 'VEH-SPRINTER');

assert(mma2 && mma2.baseFare === 22000, 'MMA2 Hub base fare is ₦22,000');
assert(sedan && sedan.multiplier === 1.0, 'Executive Sedan multiplier is 1.0x');
assert(suv && suv.multiplier === 1.35, 'Executive SUV multiplier is 1.35x');

// Test fare calculation
const mma2SedanFare = Math.round(mma2.baseFare * sedan.multiplier);
const mma2SuvFare = Math.round(mma2.baseFare * suv.multiplier);
assert(mma2SedanFare === 22000, `MMA2 Sedan fare is ₦22,000 (calculated: ₦${mma2SedanFare})`);
assert(mma2SuvFare === 29700, `MMA2 SUV fare is ₦29,700 (calculated: ₦${mma2SuvFare})`);

// Test charter rates
assert(sedan.charterDailyRate === 120000, 'Sedan 12-hour Charter rate is ₦120,000');
assert(sprinter.charterDailyRate === 250000, 'Sprinter 12-hour Charter rate is ₦250,000');

// Test transport booking creation and driver acceptance
const booking = store.createTransportRequest({
  serviceType: 'ONE_TIME_DROPOFF',
  zoneId: 'AIR-2',
  destination: 'MMA2 Domestic Airport Terminal',
  zoneName: 'MMA2 Hub',
  departureDate: '2026-08-16',
  departureTime: '11:30 AM',
  vehicleClassId: 'VEH-SEDAN',
  vehicle: 'Executive Sedan (Mercedes E-Class)',
  passengers: 2,
  price: 22000
});
assert(booking && booking.id.startsWith('TBK-'), `Transport booking created with ID ${booking.id}`);
assert(booking.price === 22000, 'Booking price matches zonal fare');

// Test driver lifecycle
store.driverAcceptTransport(booking.id, 'Lead Driver Ibrahim Bello');
store.driverConfirmDestination(booking.id);
store.driverConfirmSchedule(booking.id);
const updatedBooking = store.getState().transportBookings.find(b => b.id === booking.id);
assert(updatedBooking.driverAccepted === true, 'Driver accepted dispatch');
assert(updatedBooking.routeConfirmed === true, 'Driver confirmed route');
assert(updatedBooking.scheduleConfirmed === true, 'Driver confirmed schedule');

// Test rescheduling
store.rescheduleTransport(booking.id, '2026-08-16', '02:30 PM');
const reschedBooking = store.getState().transportBookings.find(b => b.id === booking.id);
assert(reschedBooking.departureTime === '02:30 PM', 'Rescheduled departure time updated');
assert(reschedBooking.rescheduled === true, 'Rescheduled flag set');

// 3. RESTAURANT ORDER LIFECYCLE & ISOLATED ORDER TRACKER
console.log('\n--- 3. RESTAURANT ORDER LIFECYCLE & DISPATCH ---');
const newOrder = store.createOrder({
  items: [
    { menuId: 'MENU-01', name: 'Smoky Jollof Rice Fiesta', basePrice: 8500, quantity: 1, prepTimeMinutes: 20 },
    { menuId: 'MENU-04', name: 'Zobo Hibiscus Elixir', basePrice: 3500, quantity: 2, prepTimeMinutes: 5 }
  ],
  totalAmount: 15500,
  prepTimeMinutes: 20,
  deliveryMinutes: 15,
  estimatedMinutes: 35
});

assert(newOrder && newOrder.id.startsWith('ORD-'), `Restaurant order created (${newOrder.id})`);
assert(newOrder.status === 'SUBMITTED', 'Initial order status is SUBMITTED');
assert(newOrder.totalAmount === 15500, 'Order total amount is ₦15,500');

// Status progression
store.updateOrderStatus(newOrder.id, 'PREPARING');
assert(store.getState().orders.find(o => o.id === newOrder.id).status === 'PREPARING', 'Order status moved to PREPARING');

store.updateOrderStatus(newOrder.id, 'READY');
assert(store.getState().orders.find(o => o.id === newOrder.id).status === 'READY', 'Order status moved to READY');

store.updateOrderStatus(newOrder.id, 'OUT_FOR_DELIVERY');
assert(store.getState().orders.find(o => o.id === newOrder.id).status === 'OUT_FOR_DELIVERY', 'Order status moved to OUT_FOR_DELIVERY');

store.updateOrderStatus(newOrder.id, 'DELIVERED');
assert(store.getState().orders.find(o => o.id === newOrder.id).status === 'DELIVERED', 'Order status moved to DELIVERED');

// 4. TOLANI ADDITIVE LEARNING ENGINE & HUMAN APPROVAL GATE
console.log('\n--- 4. TOLANI ADDITIVE LEARNING ENGINE & HUMAN APPROVAL ---');

// Test 4A: Interaction Logging
const logEntry = learningEngine.logInteractionEvent({
  serviceContext: 'RESTAURANT',
  guestInput: 'bring me cold zobo and chin chin snack',
  resolvedIntent: 'ORDER_FOOD',
  successful: true
});
assert(logEntry && (logEntry.id.startsWith('LOG-') || logEntry.id.startsWith('EVT-')), `Interaction event logged (${logEntry.id})`);

// Test 4B: Guest Correction Suggestion Generation
const customPhrase = 'can i get fresh bed sheets and pillowcases';
// Before learning: let's see current classification
const initialClass = aiEngine.classifyIntent(customPhrase, 'GENERAL');
console.log(`Initial classification for "${customPhrase}": ${initialClass.intent}`);

// Create correction suggestion
const sug = learningEngine.createCorrectionSuggestion({
  phrase: customPhrase,
  observedIntent: initialClass.intent,
  correctedIntent: 'HOUSEKEEPING_OPTIONS',
  reason: 'Guest specifically requested fresh bedding linens for room cleaning',
  serviceArea: 'Housekeeping',
  roomNumber: '204'
});
assert(sug && sug.id.startsWith('SUG-'), `AI learning suggestion created (${sug.id})`);
assert(sug.status === 'PENDING_REVIEW', 'Suggestion status is PENDING_REVIEW (not auto-promoted to production)');

// Safety Rule: Production AI classification must NOT have changed yet before approval!
const preApprovalClass = aiEngine.classifyIntent(customPhrase, 'GENERAL');
assert(store.getState().approvedKnowledgeUpdates.filter(u => u.title && u.title.includes(customPhrase)).length === 0, 'No production knowledge update exists prior to administrator approval');

// Test 4C: Human Administrator Approval Gate
const approveRes = learningEngine.approveSuggestion(sug.id, 'Seyi Adeyemi (General Manager)');
assert(approveRes.success === true, 'Administrator approval executed successfully');
assert(approveRes.knowledgeUpdate.updateNumber.startsWith('LEARNING UPDATE #'), `Knowledge update issued (${approveRes.knowledgeUpdate.updateNumber})`);

// Verify dynamic matching now works in production AI Engine!
const postApprovalResult = aiEngine.classifyIntent(customPhrase, 'GENERAL');
assert(postApprovalResult.intent === 'HOUSEKEEPING_OPTIONS', `Production AI Engine now correctly classifies dynamic learned phrase to HOUSEKEEPING_OPTIONS (result: ${postApprovalResult.intent})`);

// Test 4D: Rollback Safety Control
const rollbackRes = learningEngine.rollbackKnowledgeUpdate(approveRes.knowledgeUpdate.id, 'Seyi Adeyemi');
assert(rollbackRes.success === true, 'Rollback executed cleanly');
assert(store.getState().approvedKnowledgeUpdates.find(u => u.id === approveRes.knowledgeUpdate.id).status === 'ROLLED_BACK', 'Knowledge update marked ROLLED_BACK');

// Test 4E: Analytics Summary
const analytics = learningEngine.getAnalyticsSummary();
assert(analytics.totalLogs > 0, `Analytics summary computed (${analytics.totalLogs} logs, ${analytics.successRate}% success rate)`);

// Test 4F: Privacy Data Export & Clearing
const exportedJSON = learningEngine.exportData();
assert(typeof exportedJSON === 'string' && exportedJSON.includes('interactionLogs'), 'Privacy JSON export is valid and comprehensive');

// 5. INTENT CLASSIFICATION FOR KEY WORKFLOWS
console.log('\n--- 5. AI ENGINE INTENT ROUTING & EXPLORE/INTERCOM SEPARATION ---');
assert(aiEngine.classifyIntent('I want to order lunch', 'RESTAURANT').intent === 'ORDER_FOOD', 'Food order routes to ORDER_FOOD');
assert(aiEngine.classifyIntent('I need a ride to Ikeja airport', 'VIP_TRANSPORTATION').intent === 'VIP_TRANSPORTATION', 'Ride query routes to VIP_TRANSPORTATION');
assert(aiEngine.classifyIntent('Help with my bags', 'FRONT_DESK').intent === 'LUGGAGE_ASSISTANCE', 'Luggage query routes to LUGGAGE_ASSISTANCE');
assert(aiEngine.classifyIntent('What time is breakfast served?', 'BREAKFAST').intent === 'ORDER_BREAKFAST', 'Breakfast query routes to ORDER_BREAKFAST');

console.log('\n================================================================');
console.log(`VERIFICATION SUMMARY: ${passCount} PASSED / ${failCount} FAILED`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
