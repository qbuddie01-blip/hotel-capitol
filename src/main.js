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
import { initAccountPortal, renderAccountPortal } from './views/accountPortal.js';
import { initDeliveryTracker, renderDeliveryTracker } from './components/deliveryTrackerModal.js';
import { initVideoWalkthroughModal, renderVideoWalkthroughModal } from './components/videoWalkthroughModal.js';

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

  try {
    if (navbarRoot) {
      navbarRoot.innerHTML = renderNavbar();
    }
  } catch (err) {
    console.warn('Navbar render warning:', err);
  }

  try {
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
      } else if (state.activeRole === 'account' || state.activeRole === 'accounts') {
        appRoot.innerHTML = renderAccountPortal();
      } else {
        appRoot.innerHTML = renderGuestPortal();
      }
    }
  } catch (err) {
    console.error('Error rendering core application portal:', err);
    if (appRoot && !appRoot.innerHTML) {
      appRoot.innerHTML = `
        <div class="container-custom py-12 text-center">
          <div class="glass-panel p-8 rounded-2xl max-w-lg mx-auto border border-gold/40">
            <h2 class="text-xl font-serif text-white font-bold mb-2">Hotel Capitol</h2>
            <p class="text-sm text-slate-300 mb-4">Initializing resident services...</p>
            <button class="btn-primary py-2 px-6 text-xs font-bold" onclick="window.location.reload()">
              Reload Portal
            </button>
          </div>
        </div>
      `;
    }
  }

  // Render auxiliary overlays independently
  try { renderAIAssistant(); } catch (e) { console.warn('renderAIAssistant error:', e); }
  try { renderIntercomModal(); } catch (e) { console.warn('renderIntercomModal error:', e); }
  try { renderDemoControls(); } catch (e) { console.warn('renderDemoControls error:', e); }
  try { renderMobileNav(); } catch (e) { console.warn('renderMobileNav error:', e); }
  try { renderDeliveryTracker(); } catch (e) { console.warn('renderDeliveryTracker error:', e); }
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
    if (['public', 'guest', 'staff', 'supervisor', 'manager', 'vendor', 'account'].includes(hash)) {
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
  try { initAccountPortal(); } catch (e) { console.warn('initAccountPortal error:', e); }
  try { initDeliveryTracker(); } catch (e) { console.warn('initDeliveryTracker error:', e); }
  try { initAIAssistant(); } catch (e) { console.warn('initAIAssistant error:', e); }
  try { initIntercom(); } catch (e) { console.warn('initIntercom error:', e); }
  try { initDemoControls(); } catch (e) { console.warn('initDemoControls error:', e); }
  try { initVideoWalkthroughModal(); } catch (e) { console.warn('initVideoWalkthroughModal error:', e); }

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
