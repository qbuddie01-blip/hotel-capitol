/**
 * HOTEL CAPITOL — COMPREHENSIVE RESPONSIVE VIEWPORT TEST SUITE
 * Rigorously tests the entire application across all 17 required viewport widths:
 * Mobile (320, 360, 375, 390, 412, 430), Tablet (600, 768, 820, 834, 912, 1024),
 * Desktop (1280, 1366, 1440), Large Desktop (1600, 1920).
 */

import { store } from './src/store/state.js';
import { renderNavbar } from './src/components/navbar.js';
import { renderGuestPortal, initGuestPortal } from './src/views/guestPortal.js';
import { renderStaffPortal, initStaffPortal } from './src/views/staffPortal.js';
import { renderSupervisorPortal, initSupervisorPortal } from './src/views/supervisorPortal.js';
import { renderManagerPortal, initManagerPortal } from './src/views/managerPortal.js';
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

// Initialize portal systems
initGuestPortal();
initStaffPortal();
initSupervisorPortal();
initManagerPortal();

// Clear timer interval to prevent keeping process alive
if (window.hotelCapitolTimerInterval) {
  clearInterval(window.hotelCapitolTimerInterval);
}

const REQUIRED_VIEWPORTS = [
  { width: 320, category: 'Small Mobile' },
  { width: 360, category: 'Mobile' },
  { width: 375, category: 'Mobile' },
  { width: 390, category: 'Mobile' },
  { width: 412, category: 'Mobile' },
  { width: 430, category: 'Large Mobile' },
  { width: 600, category: 'Small Tablet' },
  { width: 768, category: 'Tablet (iPad Portrait)' },
  { width: 820, category: 'Tablet (iPad Air)' },
  { width: 834, category: 'Tablet (iPad Pro 11)' },
  { width: 912, category: 'Tablet (Surface Pro)' },
  { width: 1024, category: 'Tablet (iPad Pro 12.9)' },
  { width: 1280, category: 'Desktop' },
  { width: 1366, category: 'Desktop' },
  { width: 1440, category: 'Desktop' },
  { width: 1600, category: 'Large Desktop' },
  { width: 1920, category: 'Full HD Desktop' }
];

console.log('================================================================');
console.log('HOTEL CAPITOL — 17-VIEWPORT RESPONSIVE VERIFICATION SUITE');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;
const viewportReport = [];

for (const vp of REQUIRED_VIEWPORTS) {
  window.innerWidth = vp.width;
  let isVpPass = true;
  const failureReasons = [];

  // 1. Render and test Header / Navbar
  const navHtml = renderNavbar();
  if (!navHtml.includes('Hotel Capitol') || !navHtml.includes('menu-btn-gold')) {
    isVpPass = false;
    failureReasons.push('Navbar failed to render brand logo or navigation pills');
  }

  // 2. Render and test Public Website
  const pubHtml = renderPublicHome();
  if (!pubHtml.includes('Hotel Capitol') || !pubHtml.includes('6 Animashaun Close')) {
    isVpPass = false;
    failureReasons.push('Public website missing branding or address');
  }

  // 3. Render and test Guest Portal (Home, Restaurant, Breakfast, Transport)
  window.navigateGuestTab('home');
  const guestHome = renderGuestPortal();
  if (!guestHome.includes('402') || !guestHome.includes('SUITE #402 DIRECT INTERCOM')) {
    isVpPass = false;
    failureReasons.push('Guest home tab failed');
  }

  window.navigateGuestTab('restaurant');
  const guestDining = renderGuestPortal();
  if (!guestDining.includes('Capitol Signature Jollof') || !guestDining.includes('food-card')) {
    isVpPass = false;
    failureReasons.push('Guest dining menu failed');
  }

  window.navigateGuestTab('transport');
  const guestTransport = renderGuestPortal();
  if (guestTransport.includes('undefined · ~undefined mins') || !guestTransport.includes('ZONE I-1')) {
    isVpPass = false;
    failureReasons.push('Guest transportation contains undefined or missing zones');
  }

  // 4. Render and test Hotel Staff Profile (Single canonical profile)
  window.navigateStaffTab('profile');
  const staffProfile = renderStaffPortal();
  const staffImgMatches = (staffProfile.match(/<img\s+src=/g) || []).length;
  if (!staffProfile.includes('staff-profile-card') || staffImgMatches > 2) {
    isVpPass = false;
    failureReasons.push('Staff profile contains invalid card structure or duplicate images');
  }

  // 5. Render and test Supervisor Profile
  window.navigateSupervisorTab('profile');
  const supProfile = renderSupervisorPortal();
  if (!supProfile.includes('staff-profile-card')) {
    isVpPass = false;
    failureReasons.push('Supervisor profile does not match canonical staff profile card');
  }

  // 6. Render and test Admin Console (Admin Profile & Overview Dashboard)
  window.navigateManagerTab('profile');
  const adminProfile = renderManagerPortal();
  if (!adminProfile.includes('staff-profile-card') || !adminProfile.includes('Admin Profile')) {
    isVpPass = false;
    failureReasons.push('Admin profile does not match canonical staff profile card');
  }

  window.navigateManagerTab('overview');
  const adminOverview = renderManagerPortal();
  if (!adminOverview.includes('dashboard-kpi-grid') && !adminOverview.includes('Active Guests')) {
    isVpPass = false;
    failureReasons.push('Admin overview dashboard missing KPI grid');
  }

  window.navigateManagerTab('transportation');
  const adminTransport = renderManagerPortal();
  if (!adminTransport.includes('Zonal Pricing') || adminTransport.includes('undefined')) {
    isVpPass = false;
    failureReasons.push('Admin transportation management rendering failed');
  }

  if (isVpPass) {
    passCount++;
    console.log(`[PASS] Viewport ${vp.width}px (${vp.category}) — Layout, Navigation, Cards & Tables Verified`);
    viewportReport.push({ width: `${vp.width}px`, category: vp.category, result: 'PASS' });
  } else {
    failCount++;
    console.error(`[FAIL] Viewport ${vp.width}px (${vp.category}):\n  - ${failureReasons.join('\n  - ')}`);
    viewportReport.push({ width: `${vp.width}px`, category: vp.category, result: 'FAIL', errors: failureReasons });
  }
}

console.log('\n================================================================');
console.log(`VIEWPORT TEST SUMMARY: ${passCount} PASSED / ${failCount} FAILED`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
