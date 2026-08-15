/**
 * HOTEL CAPITOL — MOBILE APP BOTTOM NAVIGATION
 * 6 Animashaun Close, Ikeja, Lagos
 */

import { getIcon } from '../assets/icons.js';
import { store } from '../store/state.js';

export function renderMobileNav() {
  const root = document.getElementById('mobile-nav-root');
  if (!root) return;

  const state = store.getState();
  if (state.activeRole !== 'guest') {
    root.innerHTML = '';
    return;
  }

  const activeTab = window.getActiveGuestTab ? window.getActiveGuestTab() : 'home';

  root.innerHTML = `
    <div class="bottom-nav show-mobile-only">
      
      <button class="bottom-nav-item ${activeTab === 'home' ? 'active' : ''}" onclick="window.navigateGuestTab('home')">
        ${getIcon('building', 20)}
        <span>Home</span>
      </button>

      <button class="bottom-nav-item ${activeTab === 'restaurant' ? 'active' : ''}" onclick="window.navigateGuestTab('restaurant')">
        ${getIcon('utensils', 20)}
        <span>Dining</span>
      </button>

      <button class="bottom-nav-item ${activeTab === 'breakfast' ? 'active' : ''}" onclick="window.navigateGuestTab('breakfast')">
        ${getIcon('coffee', 20)}
        <span>Breakfast</span>
      </button>

      <button class="bottom-nav-item ${activeTab === 'room-service' ? 'active' : ''}" onclick="window.navigateGuestTab('room-service')">
        ${getIcon('bell', 20)}
        <span>Service</span>
      </button>

      <button class="bottom-nav-item ${activeTab === 'folio' ? 'active' : ''}" onclick="window.navigateGuestTab('folio')">
        ${getIcon('fileText', 20)}
        <span>Folio</span>
      </button>

      <button class="bottom-nav-item ${activeTab === 'ai' ? 'active' : ''}" onclick="window.toggleAIAssistant(true)">
        ${getIcon('bot', 22)}
        <span>AI</span>
      </button>

    </div>
  `;
}
