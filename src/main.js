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
  try {
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
  } catch (err) {
    console.error('Error rendering core application portal:', err);
  }

  // Render auxiliary overlays independently
  try { renderAIAssistant(); } catch (e) { console.warn('renderAIAssistant error:', e); }
  try { renderIntercomModal(); } catch (e) { console.warn('renderIntercomModal error:', e); }
  try { renderDemoControls(); } catch (e) { console.warn('renderDemoControls error:', e); }
  try { renderMobileNav(); } catch (e) { console.warn('renderMobileNav error:', e); }
}

window.renderApp = renderApp;

// Initial Bootstrapping with Safari/WebKit Single-Run Guard
let isInitialized = false;

function init() {
  if (isInitialized) return;
  isInitialized = true;

  try {
    // 1. Sync initial hash route if present
    const hash = (window.location.hash || '').replace('#', '');
    if (['public', 'guest', 'staff', 'supervisor', 'manager', 'vendor'].includes(hash)) {
      store.setActiveRole(hash);
    }
  } catch (e) {
    console.warn('Hash routing error:', e);
  }

  // 2. Immediate core UI render
  renderApp();

  // 3. Initialize sub-controllers in isolated try/catch blocks
  try { initGuestPortal(); } catch (e) { console.warn('initGuestPortal error:', e); }
  try { initStaffPortal(); } catch (e) { console.warn('initStaffPortal error:', e); }
  try { initSupervisorPortal(); } catch (e) { console.warn('initSupervisorPortal error:', e); }
  try { initManagerPortal(); } catch (e) { console.warn('initManagerPortal error:', e); }
  try { initVendorPortal(); } catch (e) { console.warn('initVendorPortal error:', e); }
  try { initAIAssistant(); } catch (e) { console.warn('initAIAssistant error:', e); }
  try { initIntercom(); } catch (e) { console.warn('initIntercom error:', e); }
  try { initDemoControls(); } catch (e) { console.warn('initDemoControls error:', e); }

  // 4. Subscribe to state updates
  try {
    store.subscribe(() => {
      renderApp();
    });
  } catch (e) {
    console.warn('store.subscribe error:', e);
  }

  // 5. Final render to ensure all controller bindings are attached
  renderApp();

  console.log('%c HOTEL CAPITOL AI OPERATIONS INITIALIZED ', 'background: #c5a059; color: #070e17; font-weight: bold; padding: 4px 8px; border-radius: 4px;');
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}
