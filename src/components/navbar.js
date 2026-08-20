/**
 * HOTEL CAPITOL — NAVIGATION BAR & PORTAL SWITCHER
 * 6 Animashaun Close, Ikeja, Lagos
 */

import { renderHotelCapitolLogo } from '../assets/logo.js';
import { getIcon, renderIntercomRoundBadge } from '../assets/icons.js';
import { store } from '../store/state.js';

export function renderNavbar() {
  const state = store.getState();
  const guest = store.getActiveGuest();
  const staff = store.getActiveStaff();

  const roleLabels = {
    guest: 'Guest Portal',
    staff: 'Hotel Staff',
    supervisor: 'Supervisor',
    manager: 'Admin Console',
    vendor: 'Vendor Portal',
    account: 'Accounts',
    public: 'Public Website'
  };

  return `
    <header class="sticky top-0 z-40 w-full glass-panel" style="border-radius: 0; border-top: none; border-left: none; border-right: none; background: rgba(7, 14, 23, 0.92);">
      <div class="container-custom py-3 flex items-center justify-between gap-4">
        
        <!-- Left: Hotel Capitol Logo -->
        <a href="#public" class="flex items-center text-decoration-none" style="margin-top: 2px;" onclick="window.navigatePortal('public'); return false;">
          ${renderHotelCapitolLogo({ variant: 'horizontal', height: 36, color: 'var(--gold-400)' })}
        </a>

        <!-- Center: Quick Portal Switcher Tabs (Desktop & Tablet) -->
        <nav class="hide-mobile flex items-center gap-1 p-1 rounded-full glass-panel-subtle flex-wrap justify-center" style="border: 1.5px solid rgba(220, 173, 84, 0.4); box-shadow: 0 0 15px rgba(220, 173, 84, 0.2); max-width: 100%;">
          ${['guest', 'staff', 'supervisor', 'manager', 'vendor', 'account', 'public'].map(role => `
            <button 
              class="menu-btn-gold ${state.activeRole === role ? 'active' : ''}"
              style="padding: clamp(3px, 0.6vw, 6px) clamp(8px, 1.1vw, 14px); font-size: clamp(0.72rem, 0.9vw, 0.8rem); min-height: 36px;"
              onclick="window.navigatePortal('${role}')"
              title="Switch to ${roleLabels[role]}"
            >
              ${roleLabels[role]}
            </button>
          `).join('')}
        </nav>

        <!-- Right: Role Details / Guest Switcher / Intercom / Actions -->
        <div class="flex items-center gap-2">
          
          <!-- Guest Switcher (Spherical Pill Thin Gold Border with Inside Arrow & Dropdown Menu) -->
          ${state.activeRole === 'guest' ? `
            <div class="relative inline-flex items-center" id="guest-switcher-container">
              
              <!-- Spherical Pill Trigger Button with Inside Arrow -->
              <button 
                class="cursor-pointer font-semibold outline-none transition-all flex items-center gap-2"
                style="
                  background: rgba(8, 17, 28, 0.95);
                  color: #fce8b3;
                  border: 1px solid rgba(220, 173, 84, 0.75);
                  border-radius: 9999px;
                  padding: 5px 14px 5px 16px;
                  font-size: 0.78rem;
                  letter-spacing: 0.02em;
                  box-shadow: 0 0 14px rgba(220, 173, 84, 0.25), inset 0 0 8px rgba(220, 173, 84, 0.08);
                  backdrop-filter: blur(10px);
                "
                onclick="window.toggleGuestDropdown(event)"
                title="Click to switch resident suite"
              >
                <span class="truncate max-w-[120px] sm:max-w-none">${guest.roomNumber}- ${guest.name.split(' ')[0]}- ⭐ -VIP</span>
                <svg 
                  width="11" 
                  height="7" 
                  viewBox="0 0 11 7" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  style="transition: transform 0.2s ease; transform: ${window.isGuestDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'};"
                >
                  <path d="M1 1.5L5.5 5.5L10 1.5" stroke="#dcad54" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>

              <!-- Dropdown Menu List -->
              ${window.isGuestDropdownOpen ? `
                <div 
                  class="absolute right-0 top-[calc(100%+8px)] w-72 rounded-2xl p-2 z-50 animate-fade-in"
                  style="
                    background: linear-gradient(165deg, rgba(12, 25, 42, 0.98) 0%, rgba(6, 13, 22, 0.98) 100%);
                    border: 1.5px solid rgba(220, 173, 84, 0.6);
                    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.85), 0 0 20px rgba(220, 173, 84, 0.3);
                    backdrop-filter: blur(16px);
                  "
                  onclick="event.stopPropagation()"
                >
                  <div class="px-3 py-2 text-[10px] font-bold text-gold uppercase tracking-luxury border-b border-gold/20 flex items-center justify-between">
                    <span>Active Resident Suites</span>
                    <span>👑 VIP Portal</span>
                  </div>

                  <div class="flex flex-col gap-1 mt-1.5">
                    ${state.guests.map(g => {
                      const isSelected = g.id === state.activeGuestId;
                      return `
                        <button 
                          class="w-full text-left p-2.5 rounded-xl border-none cursor-pointer transition-all flex items-center justify-between ${
                            isSelected 
                              ? 'bg-gold/20 border border-gold/50 text-white' 
                              : 'bg-transparent text-slate-300 hover:bg-gold/10 hover:text-white'
                          }"
                          onclick="window.selectGuestSuite('${g.id}')"
                        >
                          <div class="flex flex-col">
                            <span class="text-xs font-bold ${isSelected ? 'text-[#fff4d0]' : 'text-[#fce8b3]'}">
                              ${g.roomNumber}- ${g.name.split(' ')[0]}- ⭐ -VIP
                            </span>
                            <span class="text-[10px] text-slate-300 opacity-80 mt-0.5">
                              ${g.roomType} · ${g.name}
                            </span>
                          </div>
                          ${isSelected ? '<span class="text-xs font-bold text-gold ml-2">✓</span>' : ''}
                        </button>
                      `;
                    }).join('')}
                  </div>
                </div>
              ` : ''}

            </div>
          ` : ''}

          <!-- Universal Operational Back Button (Staff / Supervisor / Manager) -->
          ${['staff', 'supervisor', 'manager'].includes(state.activeRole) ? `
            <button class="btn-admin-back hide-mobile" onclick="window.navigatePortal('guest')">
              <span>←</span> <span>Back</span>
            </button>
          ` : ''}

          <!-- Watch Product Walkthrough Video Modal Trigger -->
          <button 
            class="glass-panel text-xs py-1.5 px-3 flex items-center gap-1.5 border border-gold/40 hover:border-gold cursor-pointer transition-all text-gold hover:text-white rounded-xl hide-mobile"
            onclick="window.toggleVideoWalkthrough(true)"
            title="Watch Hotel Capitol Product Walkthrough Video"
          >
            <span>🎬</span> <span>Video Tour</span>
          </button>

          <!-- Floating Staff Intercom Trigger (Visible in Staff / Supervisor / Manager / Vendor / Public Modes, Hidden in Guest Mode) -->
          ${state.activeRole !== 'guest' ? `
            <button 
              class="intercom-trigger" 
              onclick="window.toggleIntercomModal()" 
              title="Open Staff Intercom & Radio"
            >
              ${renderIntercomRoundBadge(36)}
            </button>
          ` : ''}

          <!-- Mobile Menu Dropdown Selector -->
          <div class="show-mobile-only">
            <select 
              class="glass-panel text-gold text-xs font-semibold px-2 py-1.5 rounded-md outline-none"
              onchange="window.navigatePortal(this.value)"
            >
              ${Object.entries(roleLabels).map(([key, label]) => `
                <option value="${key}" ${state.activeRole === key ? 'selected' : ''} class="bg-navy-900 text-white">
                  ${label}
                </option>
              `).join('')}
            </select>
          </div>

        </div>

      </div>
    </header>
  `;
}
