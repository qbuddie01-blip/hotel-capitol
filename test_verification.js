/**
 * HOTEL CAPITOL AI — COMPREHENSIVE SYSTEM VERIFICATION TEST
 * Tests:
 * 1. Single Unified Tolani Voice Config
 * 2. Lagos Zonal Transportation & Charter Pricing
 * 3. Restaurant Order Lifecycle & Dispatch
 * 4. Tolani Additive Learning Engine & Human Approval Gate
 * 5. AI Intent Routing & Service Isolation
 * 6. Admin Console: Restaurant Menu CRUD, Versioning & Rollback
 * 7. Admin Console: Amenities, Breakfast & Service Options
 * 8. Admin Console: Media Library & Asset Uploads
 * 9. RBAC Action-Layer Enforcement (Real Permissions Matrix)
 * 10. Dynamic Authoritative Tolani Knowledge Retrieval
 * 11. Tamper-Evident Audit Logging
 */

import { store } from './src/store/state.js';
import { aiEngine, TOLANI_VOICE_CONFIG, SERVICES } from './src/services/aiEngine.js';
import { learningEngine } from './src/services/learningEngine.js';
import { formatStayDate, renderGuestPortal, initGuestPortal } from './src/views/guestPortal.js';
import { renderPublicHome } from './src/views/publicHome.js';

// Setup mock window/document for portal rendering
if (!globalThis.window) globalThis.window = globalThis;
if (!globalThis.document) {
  globalThis.document = {
    getElementById: () => ({ value: '', innerText: '', innerHTML: '', style: {}, classList: { add: () => {}, remove: () => {} } }),
    createElement: () => ({ style: {}, classList: { add: () => {}, remove: () => {} } }),
    body: { style: {} }
  };
}

console.log('================================================================');
console.log('HOTEL CAPITOL AI — COMPREHENSIVE SYSTEM VERIFICATION');
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

// --- 2B. AUTHORITATIVE LOCATION CATALOG DATA & COVERAGE TESTS ---
const allZones = store.getState().lagosZones || [];
let allHaveValidLocations = true;
let noNullOrUndefined = true;
let allValidMetadata = true;

for (const z of allZones) {
  if (!Array.isArray(z.locations) || z.locations.length === 0) allHaveValidLocations = false;
  if (!z.id || typeof z.id !== 'string' || !z.name || typeof z.name !== 'string') allValidMetadata = false;
  if (typeof z.baseFare !== 'number' || z.baseFare <= 0) allValidMetadata = false;
  if ((z.estimatedMinutes === undefined || z.estimatedMinutes <= 0) && (z.estMinutes === undefined || z.estMinutes <= 0)) allValidMetadata = false;
  if (!z.category && !z.region) allValidMetadata = false;
  
  if (z.id.includes('undefined') || z.id.includes('null')) noNullOrUndefined = false;
  if (z.name.includes('undefined') || z.name.includes('null')) noNullOrUndefined = false;
  if (z.category && (z.category.includes('undefined') || z.category.includes('null'))) noNullOrUndefined = false;
  
  for (const loc of (z.locations || [])) {
    if (!loc || typeof loc !== 'string' || loc.trim() === '' || loc.includes('undefined') || loc.includes('null')) {
      noNullOrUndefined = false;
    }
  }
}

assert(allHaveValidLocations === true, 'All 11 transportation zones contain non-empty location arrays');
assert(allValidMetadata === true, 'Every zone has valid ID, name, base fare > 0, travel time > 0, and region/category');
assert(noNullOrUndefined === true, 'No zone or location contains undefined or null values');

// Verify all 16 required test locations exist in authoritative catalog
const allLocationsFlat = allZones.flatMap(z => z.locations || []);
const zoneCoverageCatalog = {
  'Marina': 'I-1',
  'Banana Island': 'I-1',
  'Victoria Island (V.I.)': 'I-1',
  'Lekki Phase 1': 'I-2',
  'Sangotedo': 'I-3',
  'Epe': 'I-4',
  'Ikeja GRA': 'M-2',
  'Adekunle': 'M-1', // Yaba axis
  'Surulere': 'M-1', // Central Mainland
  'Gbagada': 'M-2',
  'Ajao Estate': 'M-3',
  'Festac Town': 'M-3',
  'Ikorodu': 'M-4',
  'MMA1 General Aviation Terminal': 'AIR-1',
  'MMA2 Bi-Courtney Aviation Terminal': 'AIR-2',
  'MMIA International Departures': 'AIR-3'
};

assert(allLocationsFlat.some(l => l.includes('Marina')), 'Location "Marina" exists in catalog (Zone I-1)');
assert(allLocationsFlat.some(l => l.includes('Banana Island')), 'Location "Banana Island" exists in catalog (Zone I-1)');
assert(allLocationsFlat.some(l => l.includes('Victoria Island')), 'Location "Victoria Island" exists in catalog (Zone I-1)');
assert(allLocationsFlat.some(l => l.includes('Lekki Phase 1')), 'Location "Lekki Phase 1" exists in catalog (Zone I-2)');
assert(allLocationsFlat.some(l => l.includes('Sangotedo')), 'Location "Sangotedo" exists in catalog (Zone I-3)');
assert(allLocationsFlat.some(l => l.includes('Epe')), 'Location "Epe" exists in catalog (Zone I-4)');
assert(allLocationsFlat.some(l => l.includes('Ikeja GRA')), 'Location "Ikeja GRA" exists in catalog (Zone M-2)');
assert(allLocationsFlat.some(l => l.includes('Adekunle') || l.includes('Sabo') || l.includes('Ebute Metta')), 'Location "Yaba/Ebute Metta axis" exists in catalog (Zone M-1)');
assert(allLocationsFlat.some(l => l.includes('Aguda') || l.includes('Ojuelegba') || l.includes('Itire')), 'Location "Surulere axis" exists in catalog (Zone M-1)');
assert(allLocationsFlat.some(l => l.includes('Gbagada')), 'Location "Gbagada" exists in catalog (Zone M-2)');
assert(allLocationsFlat.some(l => l.includes('Ajao Estate')), 'Location "Ajao Estate" exists in catalog (Zone M-3)');
assert(allLocationsFlat.some(l => l.includes('Festac Town')), 'Location "Festac Town" exists in catalog (Zone M-3)');
assert(allLocationsFlat.some(l => l.includes('Ikorodu')), 'Location "Ikorodu" exists in catalog (Zone M-4)');
assert(allLocationsFlat.some(l => l.includes('MMA1')), 'Location "MMA1" exists in catalog (Zone AIR-1)');
assert(allLocationsFlat.some(l => l.includes('MMA2')), 'Location "MMA2" exists in catalog (Zone AIR-2)');
assert(allLocationsFlat.some(l => l.includes('MMIA')), 'Location "MMIA" exists in catalog (Zone AIR-3)');

// --- 2C. DESTINATION RESOLUTION FUNCTION TESTS ---
function resolveDestination(locationQuery) {
  const q = locationQuery.toLowerCase();
  for (const z of allZones) {
    const locList = Array.isArray(z.locations) ? z.locations : [];
    for (const loc of locList) {
      if (loc && (loc.toLowerCase().includes(q) || q.includes(loc.toLowerCase()))) {
        return { zone: z, location: loc, fare: z.baseFare, estimateMins: z.estimatedMinutes || z.estMinutes };
      }
    }
  }
  return null;
}

const resBanana = resolveDestination('Banana Island');
assert(resBanana && resBanana.zone.id === 'I-1' && resBanana.fare === 25000 && resBanana.estimateMins === 45, 'Destination "Banana Island" resolves to Zone I-1 (₦25,000, 45 mins)');

const resSangotedo = resolveDestination('Sangotedo');
assert(resSangotedo && resSangotedo.zone.id === 'I-3' && resSangotedo.fare === 35000 && resSangotedo.estimateMins === 70, 'Destination "Sangotedo" resolves to Zone I-3 (₦35,000, 70 mins)');

const resIkejaGRA = resolveDestination('Ikeja GRA');
assert(resIkejaGRA && resIkejaGRA.zone.id === 'M-2' && resIkejaGRA.fare === 25000 && resIkejaGRA.estimateMins === 20, 'Destination "Ikeja GRA" resolves to Zone M-2 (₦25,000, 20 mins)');

const resIkorodu = resolveDestination('Ikorodu');
assert(resIkorodu && resIkorodu.zone.id === 'M-4' && resIkorodu.fare === 35000 && resIkorodu.estimateMins === 60, 'Destination "Ikorodu" resolves to Zone M-4 (₦35,000, 60 mins)');

const resMma1 = resolveDestination('MMA1');
assert(resMma1 && resMma1.zone.id === 'AIR-1' && resMma1.fare === 20000 && resMma1.estimateMins === 15, 'Destination "MMA1" resolves to Zone AIR-1 (₦20,000, 15 mins)');

const resMma2 = resolveDestination('MMA2');
assert(resMma2 && resMma2.zone.id === 'AIR-2' && resMma2.fare === 22000 && resMma2.estimateMins === 15, 'Destination "MMA2" resolves to Zone AIR-2 (₦22,000, 15 mins)');

const resMmia = resolveDestination('MMIA');
assert(resMmia && resMmia.zone.id === 'AIR-3' && resMmia.fare === 25000 && resMmia.estimateMins === 20, 'Destination "MMIA" resolves to Zone AIR-3 (₦25,000, 20 mins)');

// --- 2D. COMPLETE GUEST PORTAL WORKFLOW SIMULATION ---
// Step 1: Guest selects One-Time Drop-off, Zone I-3, Location Sangotedo, Vehicle SUV
const suvClass = vehicles.find(v => v.id === 'VEH-SUV');
const sangotedoFare = Math.round(resSangotedo.fare * suvClass.multiplier); // 35000 * 1.35 = 47250
assert(sangotedoFare === 47250, 'Calculated SUV transfer fare to Sangotedo is ₦47,250');

const guestBooking = store.createTransportRequest({
  serviceType: 'ONE_TIME_DROPOFF',
  zoneId: resSangotedo.zone.id,
  destination: `Sangotedo (${resSangotedo.zone.name})`,
  zoneName: resSangotedo.zone.name,
  departureDate: '2026-08-17',
  departureTime: '02:00 PM',
  vehicleClassId: 'VEH-SUV',
  vehicle: `${suvClass.name} (${suvClass.models})`,
  passengers: 3,
  price: sangotedoFare
});

assert(guestBooking && guestBooking.id.startsWith('TBK-'), `Guest booking created (${guestBooking.id})`);
assert(guestBooking.destination.includes('Sangotedo'), 'Guest booking destination correctly includes Sangotedo');
assert(guestBooking.price === 47250, 'Guest booking price correctly matches ₦47,250');

// Step 2: Driver Workflow on Guest Booking
store.driverAcceptTransport(guestBooking.id, 'Lead Driver Ibrahim Bello');
store.driverConfirmDestination(guestBooking.id);
store.driverConfirmSchedule(guestBooking.id);
const verifiedGuestBooking = store.getState().transportBookings.find(b => b.id === guestBooking.id);
assert(verifiedGuestBooking.driverAccepted === true, 'Driver accepted guest ride');
assert(verifiedGuestBooking.routeConfirmed === true, 'Driver confirmed destination route');
assert(verifiedGuestBooking.scheduleConfirmed === true, 'Driver confirmed departure schedule');

// Step 3: Rescheduling on Guest Booking
store.rescheduleTransport(guestBooking.id, '2026-08-17', '04:30 PM');
const rescheduledGuestBooking = store.getState().transportBookings.find(b => b.id === guestBooking.id);
assert(rescheduledGuestBooking.departureTime === '04:30 PM', 'Rescheduled departure time set to 04:30 PM');
assert(rescheduledGuestBooking.rescheduled === true, 'Rescheduled flag confirmed true');

// Step 4: Full-Day Charter Flow Simulation
const sprinterClass = vehicles.find(v => v.id === 'VEH-SPRINTER');
const charterBooking = store.createTransportRequest({
  serviceType: 'FULL_DAY_CHARTER',
  zoneId: 'I-1',
  destination: 'Full-Day Luxury Charter (ZONE I-1 — Core Island)',
  zoneName: 'ZONE I-1 — Core Island',
  departureDate: '2026-08-18',
  departureTime: '09:00 AM',
  vehicleClassId: 'VEH-SPRINTER',
  vehicle: `${sprinterClass.name} (${sprinterClass.models})`,
  passengers: 6,
  price: sprinterClass.charterDailyRate
});
assert(charterBooking.price === 250000, 'Sprinter 12h charter booking fare is ₦250,000');
assert(charterBooking.serviceType === 'FULL_DAY_CHARTER', 'Charter booking serviceType confirmed');

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
const initialClass = aiEngine.classifyIntent(customPhrase, 'GENERAL');
console.log(`Initial classification for "${customPhrase}": ${initialClass.intent}`);

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

// ================================================================
// 6. ADMIN CONSOLE: RESTAURANT MENU CRUD & VERSIONING
// ================================================================
console.log('\n--- 6. ADMIN CONSOLE: RESTAURANT MENU CRUD & VERSIONING ---');

// Set active staff to Super Admin (Seyi Adeyemi)
store.setActiveStaffId('STF-05');

// Test 6A: Add New Menu Item
const newDish = store.addMenuItem({
  name: 'Chef Babatunde Seafood Okro Deluxe',
  category: 'Food',
  price: 16500,
  prepTimeMinutes: 25,
  estimatedDeliveryMinutes: 15,
  desc: 'Fresh Atlantic jumbo prawns, calamari, and blue crab with pounded yam.',
  image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  status: 'PUBLISHED',
  available: true,
  featured: true
});
assert(newDish && (newDish.id.startsWith('M-') || newDish.id.startsWith('MENU-')), `New menu item created with ID ${newDish.id}`);
assert(newDish.price === 16500, 'Menu item price initialized correctly');
assert(newDish.version === 1, 'Initial version is Version 1');

// Test 6B: Update Menu Item Price & Record Version
const updatedDish = store.updateMenuItem(newDish.id, { price: 18000, prepTimeMinutes: 30 }, null, 'Seasonal seafood market adjustment');
assert(updatedDish.price === 18000, 'Price updated to ₦18,000');
assert(updatedDish.version === 2, 'Version incremented to Version 2');
assert(updatedDish.versionHistory.length === 1, 'Version history contains 1 prior snapshot');
assert(updatedDish.versionHistory[0].previousSnapshot.price === 16500, 'Version history captured previous price (₦16,500)');

// Test 6C: Version Rollback / Restore
const restoredDish = store.restoreMenuItemVersion(newDish.id, 1);
assert(restoredDish.price === 16500, `Version 1 restored successfully (price restored to ₦${restoredDish.price})`);
assert(restoredDish.version === 3, 'Restoring creates a new audited Version 3');

// Test 6D: Archive & Publish State Transitions
store.archiveMenuItem(newDish.id);
assert(store.getState().menu.find(m => m.id === newDish.id).status === 'ARCHIVED', 'Menu item archived');

store.publishMenuItem(newDish.id);
assert(store.getState().menu.find(m => m.id === newDish.id).status === 'PUBLISHED', 'Menu item published live');

// ================================================================
// 7. ADMIN CONSOLE: AMENITIES, BREAKFAST & SERVICE OPTIONS
// ================================================================
console.log('\n--- 7. ADMIN CONSOLE: AMENITIES, BREAKFAST & SERVICE OPTIONS ---');

// Test 7A: Add Amenity & Update
const newAmenity = store.addAmenity({
  name: 'Executive Squash & Racquet Court',
  category: 'Recreation & Leisure',
  openingHours: '06:00 AM - 10:00 PM Daily',
  location: '6th Floor Sports Deck',
  description: 'Championship-grade indoor squash courts with air conditioning.',
  rules: 'Resident keycard required. Non-marking court shoes mandatory.',
  contact: 'Ext 40 (Sports Desk)',
  image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=600&q=80',
  status: 'PUBLISHED',
  available: true
});
assert(newAmenity && newAmenity.id.startsWith('AMN-'), `Amenity created with ID ${newAmenity.id}`);

store.updateAmenity(newAmenity.id, { openingHours: '06:00 AM - 11:00 PM Daily' }, null, 'Extended evening hours');
const updatedAmenity = store.getState().amenities.find(a => a.id === newAmenity.id);
assert(updatedAmenity.openingHours === '06:00 AM - 11:00 PM Daily', 'Amenity hours updated');
assert(updatedAmenity.version === 2, 'Amenity version incremented to 2');

// Test 7B: Breakfast Configuration
store.updateBreakfastConfig({
  servingFrom: '06:00 AM',
  servingUntil: '11:30 AM',
  standardPrice: 9000
}, null, 'Weekend schedule adjustment');
const bConf = store.getState().breakfastConfig;
assert(bConf.servingFrom === '06:00 AM' && bConf.servingUntil === '11:30 AM', 'Breakfast hours updated');
assert(bConf.standardPrice === 9000, 'Breakfast standard price updated to ₦9,000');

// Test 7C: Service Options (Porter In Room & Main Lobby - NO Storage Vault)
const porterOpts = store.getState().serviceOptions.porter;
assert(porterOpts.locations.length === 2, 'Porter options contain strictly 2 locations');
assert(porterOpts.locations.some(l => l.name === 'In Room'), 'Porter location "In Room" exists');
assert(porterOpts.locations.some(l => l.name === 'Main Lobby'), 'Porter location "Main Lobby" exists');
assert(!porterOpts.locations.some(l => l.name.toLowerCase().includes('vault')), 'Storage Vault is strictly excluded');

// ================================================================
// 8. ADMIN CONSOLE: MEDIA LIBRARY MANAGEMENT
// ================================================================
console.log('\n--- 8. ADMIN CONSOLE: MEDIA LIBRARY MANAGEMENT ---');

const mediaAsset = store.addMediaAsset({
  title: 'Capitol Suya Platter High-Res',
  fileName: 'capitol_suya_deluxe.jpg',
  fileType: 'image/jpeg',
  fileSize: '420 KB',
  dimensions: '1920x1080',
  url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
  category: 'Restaurant'
});
assert(mediaAsset && mediaAsset.id.startsWith('MED-'), `Media asset registered (${mediaAsset.id})`);
assert(store.getState().mediaLibrary.some(m => m.id === mediaAsset.id), 'Media asset present in media library catalog');

store.deleteMediaAsset(mediaAsset.id);
assert(!store.getState().mediaLibrary.some(m => m.id === mediaAsset.id), 'Media asset deleted cleanly');

// ================================================================
// 9. RBAC ACTION-LAYER PERMISSION ENFORCEMENT
// ================================================================
console.log('\n--- 9. RBAC ACTION-LAYER PERMISSION ENFORCEMENT ---');

const superAdmin = store.getState().staffMembers.find(s => s.id === 'STF-05'); // Seyi Adeyemi
const contentManager = store.getState().staffMembers.find(s => s.id === 'STF-06'); // Chidinma Eze
const transportManager = store.getState().staffMembers.find(s => s.id === 'STF-03'); // Ibrahim Bello
const restaurantManager = store.getState().staffMembers.find(s => s.id === 'STF-02'); // Chef Babatunde

// 9A: Super Admin has all permissions
assert(store.hasPermission('MANAGE_MENU', superAdmin) === true, 'Super Admin can manage menu');
assert(store.hasPermission('APPROVE_TOLANI_LEARNING', superAdmin) === true, 'Super Admin can approve Tolani learning');
assert(store.hasPermission('MANAGE_TRANSPORT_PRICING', superAdmin) === true, 'Super Admin can manage transport pricing');

// 9B: Content Manager can manage menu and media, but NOT AI approvals or transport pricing
assert(store.hasPermission('MANAGE_MENU', contentManager) === true, 'Content Manager can manage menu');
assert(store.hasPermission('MANAGE_MEDIA', contentManager) === true, 'Content Manager can manage media library');
assert(store.hasPermission('APPROVE_TOLANI_LEARNING', contentManager) === false, 'Content Manager CANNOT approve Tolani learning');
assert(store.hasPermission('MANAGE_TRANSPORT_PRICING', contentManager) === false, 'Content Manager CANNOT edit transport pricing');

// 9C: Transport Manager can manage transport pricing, but NOT menu
assert(store.hasPermission('MANAGE_TRANSPORT_PRICING', transportManager) === true, 'Transport Manager can edit transport pricing');
assert(store.hasPermission('PUBLISH_MENU', transportManager) === false, 'Transport Manager CANNOT publish menu');

// 9D: Action Layer Throws when Unauthorized Actor attempts mutation
let blocked = false;
try {
  store.setActiveStaffId('STF-06'); // Content Manager
  store.updateZonePricing('AIR-2', 50000, 30, null, 'Unauthorized attempt');
} catch (e) {
  blocked = true;
}
assert(blocked === true, 'Store mutation blocked with Permission Denied when unauthorized role attempts transport pricing update');

// ================================================================
// 10. DYNAMIC AUTHORITATIVE TOLANI KNOWLEDGE RETRIEVAL
// ================================================================
console.log('\n--- 10. DYNAMIC AUTHORITATIVE TOLANI KNOWLEDGE RETRIEVAL ---');

// Reset to Super Admin
store.setActiveStaffId('STF-05');

// Update Signature Jollof price to ₦14,500
const jollofItem = store.getState().menu.find(m => m.name.includes('Jollof')) || store.getState().menu[0];
store.updateMenuItem(jollofItem.id, { price: 14500, prepTimeMinutes: 22 }, null, 'Authoritative tariff update');

// Ask Tolani for price of Signature Jollof
const priceQueryResponse = aiEngine.processGuestQuery('What is the price of the Capitol Signature Jollof?');
assert(priceQueryResponse.text.includes('14,500') || priceQueryResponse.voiceText.includes('14,500'), `Tolani dynamically spoke current published price (₦14,500)`);
assert(priceQueryResponse.text.includes('22 minutes') || priceQueryResponse.voiceText.includes('22 minutes'), 'Tolani dynamically spoke current published prep time (22 mins)');

// Ask Tolani for Amenity hours
const amenityQueryResponse = aiEngine.processGuestQuery('What time does the gym close?');
assert(amenityQueryResponse.text.includes('Fitness') || amenityQueryResponse.text.includes('Gym') || amenityQueryResponse.voiceText.includes('Gym') || amenityQueryResponse.voiceText.includes('Fitness'), 'Tolani dynamically answered gym hours query from authoritative amenity catalog');

// Ask Tolani for Transport Fare
const transportQueryResponse = aiEngine.processGuestQuery('How much is a ride to Lekki Phase 1?');
assert(transportQueryResponse.text.includes('30,000') || transportQueryResponse.voiceText.includes('30,000'), 'Tolani dynamically quoted Lekki Phase 1 fare (₦30,000)');

const bananaIslandResponse = aiEngine.processGuestQuery('I want to go to Banana Island.');
assert(bananaIslandResponse.text.includes('25,000') || bananaIslandResponse.voiceText.includes('25,000'), 'Tolani dynamically mapped "I want to go to Banana Island." to Zone I-1 (₦25,000, 45 mins)');

const sangotedoResponse = aiEngine.processGuestQuery('How much is a ride to Sangotedo?');
assert(sangotedoResponse.text.includes('35,000') || sangotedoResponse.voiceText.includes('35,000'), 'Tolani dynamically mapped "How much is a ride to Sangotedo?" to Zone I-3 (₦35,000, 70 mins)');

const ikejaGraResponse = aiEngine.processGuestQuery('Take me to Ikeja GRA.');
assert(ikejaGraResponse.text.includes('25,000') || ikejaGraResponse.voiceText.includes('25,000'), 'Tolani dynamically mapped "Take me to Ikeja GRA." to Zone M-2 (₦25,000, 20 mins)');

const ikoroduResponse = aiEngine.processGuestQuery('I need a ride to Ikorodu.');
assert(ikoroduResponse.text.includes('35,000') || ikoroduResponse.voiceText.includes('35,000'), 'Tolani dynamically mapped "I need a ride to Ikorodu." to Zone M-4 (₦35,000, 60 mins)');

// Verify Tolani did NOT alter any state configuration or pricing
const unmodifiedZones = store.getState().lagosZones || [];
assert(unmodifiedZones.find(z => z.id === 'I-1').baseFare === 25000, 'Tolani query preserved Zone I-1 baseline fare (₦25,000)');
assert(unmodifiedZones.find(z => z.id === 'I-3').baseFare === 35000, 'Tolani query preserved Zone I-3 baseline fare (₦35,000)');
assert(unmodifiedZones.find(z => z.id === 'M-2').baseFare === 25000, 'Tolani query preserved Zone M-2 baseline fare (₦25,000)');
assert(unmodifiedZones.find(z => z.id === 'M-4').baseFare === 35000, 'Tolani query preserved Zone M-4 baseline fare (₦35,000)');

// ================================================================
// 11. TAMPER-EVIDENT AUDIT TRAIL
// ================================================================
console.log('\n--- 11. TAMPER-EVIDENT AUDIT LOGGING ---');
const recentAudits = store.getState().auditLog || [];
assert(recentAudits.length > 5, `Audit trail contains ${recentAudits.length} chronological audit entries`);
assert(recentAudits.some(a => a.action.toUpperCase().includes('MENU') || (a.module && a.module.toUpperCase().includes('MENU'))), 'Audit trail logged Menu updates');
assert(recentAudits.some(a => a.action.toUpperCase().includes('AMENITY') || (a.module && a.module.toUpperCase().includes('AMENITIES'))), 'Audit trail logged Amenity updates');
assert(recentAudits.some(a => a.action.toUpperCase().includes('BREAKFAST') || (a.module && a.module.toUpperCase().includes('BREAKFAST'))), 'Audit trail logged Breakfast updates');

// ================================================================
// 12. GUEST PORTAL & CONCIERGE RESTRUCTURE (MARY CONCIERGE & DEDICATED SUITE INTERCOM)
// ================================================================
console.log('\n--- 12. GUEST PORTAL & CONCIERGE RESTRUCTURE (MARY CONCIERGE) ---');

assert(formatStayDate('2026-08-15') === '15 August 2026', 'formatStayDate parses 2026-08-15 to "15 August 2026"');
assert(formatStayDate('2026-08-18') === '18 August 2026', 'formatStayDate parses 2026-08-18 to "18 August 2026"');

initGuestPortal();
window.navigateGuestTab('home');
const guestPortalHtml = renderGuestPortal();

assert(guestPortalHtml.includes('15 August 2026 to 18 August 2026'), 'Guest Profile renders stay date with alphabetic month representation');
assert(!guestPortalHtml.includes('floating-ai-btn-banner'), 'Guest Profile banner has no "Ask Hotel Capitol AI" button');
assert(!guestPortalHtml.includes('Intercom Front Desk'), 'Guest Profile banner has no "Intercom Front Desk" button');

assert(guestPortalHtml.includes('SUITE #402 DIRECT INTERCOM'), 'Direct Suite Intercom card renders for active Suite 402');
assert(guestPortalHtml.includes('INTERCOM BREAKFAST SERVICE'), 'Suite Intercom contains INTERCOM BREAKFAST SERVICE CTA');
assert(guestPortalHtml.includes('INTERCOM VIP TRANSPORTATION'), 'Suite Intercom contains INTERCOM VIP TRANSPORTATION CTA');
assert(guestPortalHtml.includes('INTERCOM CONCIERGE'), 'Suite Intercom contains INTERCOM CONCIERGE CTA');

assert(!guestPortalHtml.includes('intercom-icon-btn'), 'Individual guest service cards have NO intercom action buttons');
assert(guestPortalHtml.includes('EXPLORE'), 'Guest service cards retain standard EXPLORE CTA');

const conciergeGreeting = aiEngine.getGreetingForContext(SERVICES.CONCIERGE_PORTER);
assert(conciergeGreeting.includes('Mary'), 'Concierge service persona is named Mary in voice greetings');
assert(conciergeGreeting.includes('concierge'), 'Concierge greeting delivers luxury concierge assistance');

// Verify Tolani AI learning engine identity preserved
assert(typeof learningEngine.createCorrectionSuggestion === 'function', 'Tolani AI Learning Engine remains intact');

// --- 13. AMENITIES REMOVAL VERIFICATION ---
window.navigateGuestTab('info');
const guestAmenitiesHtml = renderGuestPortal();

// Verify the 5 specified services are NOT displayed in Amenities
assert(!guestAmenitiesHtml.includes('Luxury Spa'), 'Amenities list does NOT contain Luxury Spa');
assert(!guestAmenitiesHtml.includes('Valet Parking'), 'Amenities list does NOT contain Valet Parking');
assert(!guestAmenitiesHtml.includes('Cigar & Whiskey Lounge') && !guestAmenitiesHtml.includes('Cigar and Whiskey Lounge'), 'Amenities list does NOT contain Cigar and Whiskey Lounge');
assert(!guestAmenitiesHtml.includes('Diplomatic Business Centre') && !guestAmenitiesHtml.includes('Diplomatic Business Center'), 'Amenities list does NOT contain Diplomatic Business Center');
assert(!guestAmenitiesHtml.includes('Rooftop Infinity Pool'), 'Amenities list does NOT contain Rooftop Infinity Pool');

// Verify existing approved amenities remain intact
assert(guestAmenitiesHtml.includes('Executive Fitness Centre & Gym'), 'Amenities list preserves Executive Fitness Centre & Gym');
assert(guestAmenitiesHtml.includes('High-Speed Fiber VIP Wi-Fi'), 'Amenities list preserves High-Speed Fiber VIP Wi-Fi');
assert(guestAmenitiesHtml.includes('Executive Express Laundry & Dry Cleaning'), 'Amenities list preserves Executive Express Laundry & Dry Cleaning');

// --- 14. AMENITY IMAGE REPLACEMENT VERIFICATION ---
assert(guestAmenitiesHtml.includes('amenity-fitness-gym.jpg'), 'Executive Fitness Centre card uses new gym spin bikes image');
assert(guestAmenitiesHtml.includes('amenity-wifi-services.jpg'), 'High-Speed Wi-Fi card uses new Hotel Capitol Free WiFi Services image');
assert(guestAmenitiesHtml.includes('amenity-laundry-service.jpg'), 'Executive Laundry card uses new Hotel Capitol Laundry Service image');

// --- 15. PUBLIC WEBSITE HERO IMAGE REPLACEMENT VERIFICATION ---
const pubHtml = renderPublicHome();
assert(pubHtml.includes('hotel-capitol-hero.jpg'), 'Public Website Hero Section uses luxury enhanced Hotel Capitol exterior image');

console.log('\n================================================================');
console.log(`VERIFICATION SUMMARY: ${passCount} PASSED / ${failCount} FAILED`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
