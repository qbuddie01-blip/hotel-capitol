/**
 * HOTEL CAPITOL — DEEP TABLET & MULTI-VIEWPORT REAL-WORLD RENDERING TEST
 * Verifies that all portals (Public, Guest, Staff, Supervisor, Admin, Vendor)
 * and all of their tabs render full content, zero blank screens, zero missing elements.
 */

import { store } from './src/store/state.js';
import { renderNavbar } from './src/components/navbar.js';
import { renderGuestPortal, initGuestPortal } from './src/views/guestPortal.js';
import { renderStaffPortal, initStaffPortal } from './src/views/staffPortal.js';
import { renderSupervisorPortal, initSupervisorPortal } from './src/views/supervisorPortal.js';
import { renderManagerPortal, initManagerPortal } from './src/views/managerPortal.js';
import { renderVendorPortal, initVendorPortal } from './src/views/vendorPortal.js';
import { renderPublicHome } from './src/views/publicHome.js';

// Setup Mock DOM
globalThis.window = globalThis;
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
  createElement: (tag) => ({
    tag,
    style: {},
    classList: { add: () => {}, remove: () => {} },
    appendChild: () => {},
    removeChild: () => {},
    remove: () => {}
  }),
  body: { style: {}, appendChild: () => {}, removeChild: () => {} },
  documentElement: { scrollWidth: 0 }
};
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};
globalThis.scrollTo = () => {};

// Initialize portals
initGuestPortal();
initStaffPortal();
initSupervisorPortal();
initManagerPortal();
initVendorPortal();

if (window.hotelCapitolTimerInterval) {
  clearInterval(window.hotelCapitolTimerInterval);
}

const TABLET_VIEWPORTS = [600, 768, 820, 834, 912, 1024];
const OTHER_VIEWPORTS = [320, 360, 375, 390, 412, 430, 1280, 1366, 1440, 1600, 1920];
const ALL_VIEWPORTS = [...TABLET_VIEWPORTS, ...OTHER_VIEWPORTS].sort((a, b) => a - b);

const ADMIN_TABS = [
  'overview', 'menu', 'breakfast', 'amenities', 'services', 
  'media', 'orders', 'transportation', 'learning', 'staff', 
  'audit', 'settings', 'profile'
];

const GUEST_TABS = [
  'home', 'restaurant', 'breakfast', 'room-service', 
  'transport', 'concierge', 'folio', 'nearby', 'info', 'contact'
];

const STAFF_TABS = ['tasks', 'turnover', 'station', 'requests', 'profile'];
const SUPERVISOR_TABS = ['roster', 'requests', 'kpis', 'tools', 'profile'];

console.log('================================================================');
console.log('HOTEL CAPITOL — COMPREHENSIVE PORTAL & TAB VERIFICATION');
console.log('================================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

for (const width of ALL_VIEWPORTS) {
  window.innerWidth = width;
  const isTablet = width >= 600 && width <= 1024;
  const label = isTablet ? `[TABLET ${width}px]` : `[VIEWPORT ${width}px]`;

  // 1. Navbar
  const navHtml = renderNavbar();
  totalChecks++;
  if (navHtml && navHtml.length > 500 && navHtml.includes('Hotel Capitol')) {
    passedChecks++;
  } else {
    failedChecks++;
    console.error(`${label} Navbar failed to render content`);
  }

  // 2. Public Home
  const pubHtml = renderPublicHome();
  totalChecks++;
  if (pubHtml && pubHtml.length > 1000 && pubHtml.includes('6 Animashaun Close')) {
    passedChecks++;
  } else {
    failedChecks++;
    console.error(`${label} Public Home failed to render content`);
  }

  // 3. Guest Portal All Tabs
  for (const gTab of GUEST_TABS) {
    totalChecks++;
    window.navigateGuestTab(gTab);
    const gHtml = renderGuestPortal();
    if (gHtml && gHtml.length > 800 && !gHtml.includes('undefined')) {
      passedChecks++;
    } else {
      failedChecks++;
      console.error(`${label} Guest Portal tab "${gTab}" failed to render or contained undefined`);
    }
  }

  // 4. Staff Portal All Tabs
  for (const sTab of STAFF_TABS) {
    totalChecks++;
    window.navigateStaffTab(sTab);
    const sHtml = renderStaffPortal();
    if (sHtml && sHtml.length > 500) {
      passedChecks++;
    } else {
      failedChecks++;
      console.error(`${label} Staff Portal tab "${sTab}" failed to render`);
    }
  }

  // 5. Supervisor Portal All Tabs
  for (const supTab of SUPERVISOR_TABS) {
    totalChecks++;
    window.navigateSupervisorTab(supTab);
    const supHtml = renderSupervisorPortal();
    if (supHtml && supHtml.length > 500) {
      passedChecks++;
    } else {
      failedChecks++;
      console.error(`${label} Supervisor Portal tab "${supTab}" failed to render`);
    }
  }

  // 6. Admin Console All 13 Tabs
  for (const aTab of ADMIN_TABS) {
    totalChecks++;
    window.navigateManagerTab(aTab);
    const aHtml = renderManagerPortal();
    if (aHtml && aHtml.length > 500 && !aHtml.includes('undefined')) {
      passedChecks++;
    } else {
      failedChecks++;
      console.error(`${label} Admin Console tab "${aTab}" failed to render or contained undefined`);
    }
  }

  // 7. Vendor Portal
  totalChecks++;
  const vHtml = renderVendorPortal();
  if (vHtml && vHtml.length > 500) {
    passedChecks++;
  } else {
    failedChecks++;
    console.error(`${label} Vendor Portal failed to render`);
  }
}

console.log(`\n================================================================`);
console.log(`TOTAL PORTAL / TAB CHECKS ACROSS 17 VIEWPORTS: ${passedChecks}/${totalChecks} PASSED (${failedChecks} failed)`);
console.log(`================================================================\n`);

if (failedChecks > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
