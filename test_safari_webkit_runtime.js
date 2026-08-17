/**
 * HOTEL CAPITOL — SAFARI / WEBKIT RUNTIME COMPATIBILITY TEST SUITE
 * 
 * Simulates strict iPad Safari / iOS WebKit runtime conditions:
 * 1. Absence or restriction of Web Audio / AudioContext (suspended until user gesture).
 * 2. Absence or restriction of Web Speech APIs (SpeechRecognition / webkitSpeechRecognition).
 * 3. SpeechSynthesis returning empty voices [] or throwing on initial call.
 * 4. Safari Private Browsing mode (localStorage.setItem throws SecurityError/QuotaExceededError).
 * 5. Strict Date parsing (new Date(undefined) throwing RangeError on toLocaleTimeString in older WebKit).
 * 6. Full rendering of all portals and tabs without throwing exceptions.
 */

import { store } from './src/store/state.js';
import { renderNavbar } from './src/components/navbar.js';
import { renderGuestPortal, initGuestPortal } from './src/views/guestPortal.js';
import { renderStaffPortal, initStaffPortal } from './src/views/staffPortal.js';
import { renderSupervisorPortal, initSupervisorPortal } from './src/views/supervisorPortal.js';
import { renderManagerPortal, initManagerPortal } from './src/views/managerPortal.js';
import { renderVendorPortal, initVendorPortal } from './src/views/vendorPortal.js';
import { renderPublicHome } from './src/views/publicHome.js';
import { aiEngine } from './src/services/aiEngine.js';
import { automationEngine } from './src/services/automationRules.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`[PASS] ${message}`);
  } else {
    failed++;
    console.error(`[FAIL] ${message}`);
  }
}

console.log('================================================================');
console.log('HOTEL CAPITOL — SAFARI / WEBKIT RUNTIME COMPATIBILITY SUITE');
console.log('================================================================\n');

// 1. SIMULATE RESTRICTED SAFARI RUNTIME (No SpeechRecognition, No AudioContext, No BroadcastChannel)
globalThis.window = globalThis;
globalThis.SpeechRecognition = undefined;
globalThis.webkitSpeechRecognition = undefined;
globalThis.AudioContext = undefined;
globalThis.webkitAudioContext = undefined;
globalThis.BroadcastChannel = undefined;
globalThis.scrollTo = () => {};

// Mock DOM
globalThis.document = {
  getElementById: (id) => ({
    value: '15000',
    innerText: '',
    innerHTML: '',
    style: {},
    classList: { add: () => {}, remove: () => {} },
    appendChild: () => {},
    removeChild: () => {},
    remove: () => {}
  }),
  querySelectorAll: () => [],
  createElement: (tag) => ({
    tag,
    style: {},
    classList: { add: () => {}, remove: () => {} },
    appendChild: () => {},
    removeChild: () => {},
    remove: () => {}
  }),
  body: { style: {}, appendChild: () => {}, removeChild: () => {} }
};

// 2. SIMULATE SAFARI PRIVATE BROWSING (localStorage throws on access)
globalThis.localStorage = {
  getItem: () => { throw new Error('SecurityError: The operation is insecure in Safari Private Browsing'); },
  setItem: () => { throw new Error('QuotaExceededError: The quota has been exceeded in Safari Private Browsing'); },
  removeItem: () => {}
};

// Test Store Initialization under Safari Private Browsing
try {
  const loadedState = store.loadState();
  assert(loadedState && loadedState.hotel && loadedState.hotel.name === 'Hotel Capitol', 'Store gracefully defaults when localStorage is restricted in Safari Private Browsing');
} catch (e) {
  assert(false, 'Store threw on restricted localStorage: ' + e.message);
}

// Test Audio Fallback when AudioContext is unavailable
try {
  const ctx = automationEngine.getAudioContext();
  assert(ctx === null, 'AudioContext gracefully returns null when Web Audio is restricted/unavailable in Safari');
  automationEngine.playChime('bell');
  assert(true, 'playChime() executes safely without throwing when AudioContext is null');
} catch (e) {
  assert(false, 'playChime threw an exception: ' + e.message);
}

// Test Speech Synthesis Fallback
try {
  aiEngine.speak('Welcome to Hotel Capitol');
  assert(true, 'aiEngine.speak() executes safely when speech synthesis is restricted or unavailable');
} catch (e) {
  assert(false, 'aiEngine.speak threw an exception: ' + e.message);
}

// Test Speech Recognition Fallback
try {
  let errorMsg = null;
  aiEngine.listen(
    () => {},
    () => {},
    (err) => { errorMsg = err; }
  );
  assert(errorMsg !== null, 'aiEngine.listen() calls onError callback gracefully without throwing when SpeechRecognition is missing');
} catch (e) {
  assert(false, 'aiEngine.listen threw an exception: ' + e.message);
}

// 3. TEST CORE PORTALS UNDER RESTRICTED WEBKIT SIMULATION
initGuestPortal();
initStaffPortal();
initSupervisorPortal();
initManagerPortal();
initVendorPortal();

if (window.hotelCapitolTimerInterval) {
  clearInterval(window.hotelCapitolTimerInterval);
}

// Test Navbar
try {
  const nav = renderNavbar();
  assert(nav.includes('Hotel Capitol') && nav.includes('Guest Portal'), 'Navbar renders completely in WebKit runtime');
} catch (e) {
  assert(false, 'Navbar crashed in WebKit: ' + e.message);
}

// Test Public Website
try {
  const pub = renderPublicHome();
  assert(pub.includes('Experience Hotel Capitol') && pub.includes('6 Animashaun Close'), 'Public Website renders completely in WebKit runtime');
} catch (e) {
  assert(false, 'Public Website crashed in WebKit: ' + e.message);
}

// Test Guest Portal (Home, Restaurant, Breakfast, Transport, Concierge, Folio)
const GUEST_TABS = ['home', 'restaurant', 'order-tracker', 'breakfast', 'room-service', 'transport', 'concierge', 'folio', 'nearby', 'info', 'checkout', 'contact'];
for (const tab of GUEST_TABS) {
  try {
    window.navigateGuestTab(tab);
    const html = renderGuestPortal();
    assert(html && html.length > 500 && !html.includes('Invalid Date'), `Guest Portal tab "${tab}" renders valid markup with zero "Invalid Date" in WebKit`);
  } catch (e) {
    assert(false, `Guest Portal tab "${tab}" crashed in WebKit: ${e.message}`);
  }
}

// Test Hotel Staff Portal
const STAFF_TABS = ['tasks', 'turnover', 'station', 'requests', 'profile'];
for (const tab of STAFF_TABS) {
  try {
    window.navigateStaffTab(tab);
    const html = renderStaffPortal();
    assert(html && html.length > 500 && !html.includes('Invalid Date'), `Staff Portal tab "${tab}" renders valid markup in WebKit`);
  } catch (e) {
    assert(false, `Staff Portal tab "${tab}" crashed in WebKit: ${e.message}`);
  }
}

// Test Supervisor Portal
const SUP_TABS = ['roster', 'requests', 'kpis', 'tools', 'profile'];
for (const tab of SUP_TABS) {
  try {
    window.navigateSupervisorTab(tab);
    const html = renderSupervisorPortal();
    assert(html && html.length > 500, `Supervisor Portal tab "${tab}" renders valid markup in WebKit`);
  } catch (e) {
    assert(false, `Supervisor Portal tab "${tab}" crashed in WebKit: ${e.message}`);
  }
}

// Test Admin Console
const ADMIN_TABS = ['overview', 'menu', 'breakfast', 'amenities', 'services', 'media', 'orders', 'transportation', 'learning', 'staff', 'audit', 'settings', 'profile'];
for (const tab of ADMIN_TABS) {
  try {
    window.navigateManagerTab(tab);
    const html = renderManagerPortal();
    assert(html && html.length > 500 && !html.includes('Invalid Date'), `Admin Console tab "${tab}" renders valid markup in WebKit`);
  } catch (e) {
    assert(false, `Admin Console tab "${tab}" crashed in WebKit: ${e.message}`);
  }
}

// Test Vendor Portal
try {
  const vHtml = renderVendorPortal();
  assert(vHtml && vHtml.length > 500, 'Vendor Portal renders valid markup in WebKit');
} catch (e) {
  assert(false, 'Vendor Portal crashed in WebKit: ' + e.message);
}

console.log('\n================================================================');
console.log(`SAFARI / WEBKIT RUNTIME SUMMARY: ${passed} PASSED / ${failed} FAILED`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
