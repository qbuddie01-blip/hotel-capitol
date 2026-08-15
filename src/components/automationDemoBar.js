/**
 * HOTEL CAPITOL — AI AUTOMATION DEMO CONTROLS & TIME MACHINE
 * 6 Animashaun Close, Ikeja, Lagos
 * Allows stakeholders to trigger all automated time-based workflows on demand
 */

import { getIcon } from '../assets/icons.js';
import { automationEngine } from '../services/automationRules.js';
import { store } from '../store/state.js';

let isBarCollapsed = true;

export function initDemoControls() {
  window.toggleDemoBar = () => {
    isBarCollapsed = !isBarCollapsed;
    renderDemoControls();
  };

  renderDemoControls();
}

export function renderDemoControls() {
  const root = document.getElementById('demo-controls-root');
  if (!root) return;

  if (isBarCollapsed) {
    root.innerHTML = `
      <div class="fixed bottom-2 left-4 z-40">
        <button 
          class="demo-chip shadow-lg text-xs" 
          onclick="window.toggleDemoBar()"
          title="Open AI Automation Triggers"
          style="background: rgba(11, 23, 36, 0.95); border: 1px solid var(--gold-500); padding: 6px 12px;"
        >
          ⚡ <strong>AI Automations & Time Machine</strong> (Expand)
        </button>
      </div>
    `;
    return;
  }

  root.innerHTML = `
    <div class="fixed bottom-0 left-0 right-0 z-30 demo-bar flex items-center justify-between">
      
      <div class="flex items-center gap-2 overflow-x-auto py-1">
        <span class="text-gold font-bold text-xs flex items-center gap-1 uppercase tracking-wider pl-1">
          ⚡ Demo Time Machine:
        </span>

        <!-- Test AI Voice Concierge Protocol -->
        <button 
          class="demo-chip" 
          style="background: linear-gradient(135deg, rgba(220, 173, 84, 0.25) 0%, rgba(10, 22, 38, 0.95) 100%); border-color: var(--gold-500); color: #fff;"
          onclick="window.runFullAIVoiceConciergeDemo ? window.runFullAIVoiceConciergeDemo() : window.toggleAIAssistant(true)"
        >
          🎙️ Test AI Voice Concierge Flow
        </button>

        <!-- 6:00 AM Breakfast -->
        <button class="demo-chip" onclick="window.hotelCapitolAutomation.triggerBreakfastAutomation()">
          ☀️ 06:00 AM Breakfast
        </button>

        <!-- 8:00 AM Room Service -->
        <button class="demo-chip" onclick="window.hotelCapitolAutomation.triggerRoomServiceAutomation()">
          🛎 08:00 AM Room Service
        </button>

        <!-- 45-Min Checkout -->
        <button class="demo-chip" onclick="window.hotelCapitolAutomation.triggerCheckoutReminderAutomation()">
          🛫 45-Min Checkout Alert
        </button>

        <!-- 5-Min Food Delivery -->
        <button class="demo-chip" onclick="window.hotelCapitolAutomation.triggerFoodDeliveryWarning()">
          🍽 5-Min Order Notice
        </button>

        <!-- Inventory Stock Check -->
        <button class="demo-chip" onclick="window.hotelCapitolAutomation.checkInventoryThresholds()">
          📦 Check Stock Alerts
        </button>

        <!-- Kitchen Bell -->
        <button class="demo-chip" onclick="window.hotelCapitolAutomation.playChime('bell')">
          🔔 Silver Bell
        </button>
      </div>

      <div class="flex items-center gap-2 pr-2">
        <button 
          class="text-xs text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"
          onclick="if(confirm('Reset all demo orders, requests, and inventory to factory state?')) { window.hotelCapitolStore.resetToDefault(); location.reload(); }"
          title="Reset Demo Data"
        >
          🔄 Reset State
        </button>

        <button 
          class="text-xs text-gold hover:text-white bg-transparent border-none cursor-pointer pl-2"
          onclick="window.toggleDemoBar()"
          title="Minimize Demo Toolbar"
        >
          ✕ Hide
        </button>
      </div>

    </div>
  `;
}
