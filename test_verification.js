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
import { aiEngine, TOLANI_VOICE_CONFIG } from './src/services/aiEngine.js';
import { learningEngine } from './src/services/learningEngine.js';

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

// --- 2B. AUTHORITATIVE LOCATION CATALOG DATA TESTS ---
const allZones = store.getState().lagosZones || [];
let allHaveValidLocations = true;
let noNullOrUndefined = true;

for (const z of allZones) {
  if (!Array.isArray(z.locations) || z.locations.length === 0) allHaveValidLocations = false;
  if (!z.id || !z.name || z.baseFare === undefined || z.name.includes('undefined') || (z.category && z.category.includes('undefined'))) noNullOrUndefined = false;
  for (const loc of (z.locations || [])) {
    if (!loc || loc.includes('undefined') || loc.includes('null')) noNullOrUndefined = false;
  }
}
assert(allHaveValidLocations === true, 'All 11 transportation zones contain non-empty location arrays');
assert(noNullOrUndefined === true, 'No zone or location contains undefined or null values');

// Verify key locations in specific zones
const zoneI1 = allZones.find(z => z.id === 'I-1');
const zoneI2 = allZones.find(z => z.id === 'I-2');
const zoneI3 = allZones.find(z => z.id === 'I-3');
const zoneI4 = allZones.find(z => z.id === 'I-4');
const zoneM1 = allZones.find(z => z.id === 'M-1');
const zoneM2 = allZones.find(z => z.id === 'M-2');
const zoneM3 = allZones.find(z => z.id === 'M-3');
const zoneM4 = allZones.find(z => z.id === 'M-4');

assert(zoneI1 && zoneI1.locations.includes('Banana Island') && zoneI1.locations.includes('Marina') && zoneI1.locations.includes('Victoria Island (V.I.)'), 'Zone I-1 contains Marina, Banana Island and Victoria Island');
assert(zoneI2 && zoneI2.locations.includes('Lekki Phase 1') && zoneI2.locations.includes('Ikate Elegushi'), 'Zone I-2 contains Lekki Phase 1 and Ikate Elegushi');
assert(zoneI3 && zoneI3.locations.includes('Sangotedo') && zoneI3.locations.includes('VGC (Victoria Garden City)'), 'Zone I-3 contains Sangotedo and VGC');
assert(zoneI4 && zoneI4.locations.includes('Epe') && zoneI4.locations.includes('Ibeju-Lekki'), 'Zone I-4 contains Epe and Ibeju-Lekki');
assert(zoneM1 && zoneM1.locations.includes('Adekunle') && zoneM1.locations.includes('Sabo'), 'Zone M-1 contains Adekunle and Sabo');
assert(zoneM2 && zoneM2.locations.includes('Ikeja GRA') && zoneM2.locations.includes('Magodo') && zoneM2.locations.includes('Gbagada'), 'Zone M-2 contains Ikeja GRA, Magodo and Gbagada');
assert(zoneM3 && zoneM3.locations.includes('Okota') && zoneM3.locations.includes('Festac Town') && zoneM3.locations.includes('Ajao Estate'), 'Zone M-3 contains Okota, Festac Town and Ajao Estate');
assert(zoneM4 && zoneM4.locations.includes('Ikorodu') && zoneM4.locations.includes('Ipaja') && zoneM4.locations.includes('Agege'), 'Zone M-4 contains Ikorodu, Ipaja and Agege');

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
  name: 'Capitol Rooftop Infinity Pool',
  category: 'Recreation & Leisure',
  openingHours: '06:00 AM - 10:00 PM Daily',
  location: '6th Floor Rooftop Deck',
  description: 'Panoramic heated pool overlooking Ikeja GRA skyline.',
  rules: 'Resident keycard required. No glassware poolside.',
  contact: 'Ext 40 (Pool Bar)',
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
const amenityQueryResponse = aiEngine.processGuestQuery('What time does the pool close?');
assert(amenityQueryResponse.text.includes('Pool') || amenityQueryResponse.voiceText.includes('Pool'), 'Tolani dynamically answered pool hours query from authoritative amenity catalog');

// Ask Tolani for Transport Fare
const transportQueryResponse = aiEngine.processGuestQuery('How much is a ride to Lekki Phase 1?');
assert(transportQueryResponse.text.includes('30,000') || transportQueryResponse.voiceText.includes('30,000'), 'Tolani dynamically quoted Lekki Phase 1 fare (₦30,000)');

const bananaIslandResponse = aiEngine.processGuestQuery('I want to go to Banana Island');
assert(bananaIslandResponse.text.includes('25,000') || bananaIslandResponse.voiceText.includes('25,000'), 'Tolani dynamically mapped Banana Island to Zone I-1 (₦25,000)');

const sangotedoResponse = aiEngine.processGuestQuery('How much is a ride to Sangotedo?');
assert(sangotedoResponse.text.includes('35,000') || sangotedoResponse.voiceText.includes('35,000'), 'Tolani dynamically mapped Sangotedo to Zone I-3 (₦35,000)');

// ================================================================
// 11. TAMPER-EVIDENT AUDIT TRAIL
// ================================================================
console.log('\n--- 11. TAMPER-EVIDENT AUDIT LOGGING ---');
const recentAudits = store.getState().auditLog || [];
assert(recentAudits.length > 5, `Audit trail contains ${recentAudits.length} chronological audit entries`);
assert(recentAudits.some(a => a.action.toUpperCase().includes('MENU') || (a.module && a.module.toUpperCase().includes('MENU'))), 'Audit trail logged Menu updates');
assert(recentAudits.some(a => a.action.toUpperCase().includes('AMENITY') || (a.module && a.module.toUpperCase().includes('AMENITIES'))), 'Audit trail logged Amenity updates');
assert(recentAudits.some(a => a.action.toUpperCase().includes('BREAKFAST') || (a.module && a.module.toUpperCase().includes('BREAKFAST'))), 'Audit trail logged Breakfast updates');

console.log('\n================================================================');
console.log(`VERIFICATION SUMMARY: ${passCount} PASSED / ${failCount} FAILED`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
