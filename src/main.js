/**
 * HOTEL CAPITOL — MAIN APPLICATION ORCHESTRATOR
 * 6 Animashaun Close, Ikeja, Lagos
 */

import { store } from './store/state.js';
import { renderNavbar } from './components/navbar.js';
import { initAIAssistant, renderAIAssistant } from './components/aiAssistantModal.js';
import { initIntercom, renderIntercomModal } from './components/intercomModal.js';
import { initDemoControls, renderDemoControls } from './components/automationDemoBar.js';
import { renderMobileNav } from './components/mobileNav.js';
import { automationEngine } from './services/automationRules.js';

// Views
import { renderPublicHome } from './views/publicHome.js';
import { initGuestPortal, renderGuestPortal } from './views/guestPortal.js';
import { initStaffPortal, renderStaffPortal } from './views/staffPortal.js';
import { initSupervisorPortal, renderSupervisorPortal } from './views/supervisorPortal.js';
import { initManagerPortal, renderManagerPortal } from './views/managerPortal.js';
import { initVendorPortal, renderVendorPortal } from './views/vendorPortal.js';

// Global Navigation Router
window.isGuestDropdownOpen = false;

window.toggleGuestDropdown = (e) => {
  if (e) e.stopPropagation();
  window.isGuestDropdownOpen = !window.isGuestDropdownOpen;
  renderApp();
};

window.selectGuestSuite = (guestId) => {
  window.isGuestDropdownOpen = false;
  window.switchGuestProfile(guestId);
};

// Close dropdown on outside clicks
document.addEventListener('click', (e) => {
  if (window.isGuestDropdownOpen && !e.target.closest('#guest-switcher-container')) {
    window.isGuestDropdownOpen = false;
    renderApp();
  }
});

window.navigatePortal = (role) => {
  window.isGuestDropdownOpen = false;
  store.setActiveRole(role);
  window.location.hash = role;
  renderApp();
};

window.switchGuestProfile = (guestId) => {
  store.setActiveGuestId(guestId);
  automationEngine.showToast('Resident Switched', `Active view set to ${store.getActiveGuest().name} (Suite #${store.getActiveGuest().roomNumber})`, 'info');
  renderApp();
};

function renderApp() {
  const state = store.getState();
  const navbarRoot = document.getElementById('navbar-root');
  const appRoot = document.getElementById('app-root');

  if (navbarRoot) {
    navbarRoot.innerHTML = renderNavbar();
  }

  if (appRoot) {
    if (state.activeRole === 'public') {
      appRoot.innerHTML = renderPublicHome();
    } else if (state.activeRole === 'guest') {
      appRoot.innerHTML = renderGuestPortal();
    } else if (state.activeRole === 'staff') {
      appRoot.innerHTML = renderStaffPortal();
    } else if (state.activeRole === 'supervisor') {
      appRoot.innerHTML = renderSupervisorPortal();
    } else if (state.activeRole === 'manager' || state.activeRole === 'inventory') {
      appRoot.innerHTML = renderManagerPortal();
    } else if (state.activeRole === 'vendor') {
      appRoot.innerHTML = renderVendorPortal();
    } else {
      appRoot.innerHTML = renderGuestPortal();
    }
  }

  renderAIAssistant();
  renderIntercomModal();
  renderDemoControls();
  renderMobileNav();
}

window.renderApp = renderApp;

// Initial Bootstrapping
function init() {
  // Sync initial hash route if present
  const hash = window.location.hash.replace('#', '');
  if (['public', 'guest', 'staff', 'supervisor', 'manager', 'vendor'].includes(hash)) {
    store.setActiveRole(hash);
  }

  // Initialize sub-controllers
  initGuestPortal();
  initStaffPortal();
  initSupervisorPortal();
  initManagerPortal();
  initVendorPortal();
  initAIAssistant();
  initIntercom();
  initDemoControls();

  // Subscribe to state updates
  store.subscribe(() => {
    renderApp();
  });

  // Initial render
  renderApp();

  console.log('%c HOTEL CAPITOL AI OPERATIONS INITIALIZED ', 'background: #c5a059; color: #070e17; font-weight: bold; padding: 4px 8px; border-radius: 4px;');
}

document.addEventListener('DOMContentLoaded', init);
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init();
}
