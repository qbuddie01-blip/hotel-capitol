/**
 * HOTEL CAPITOL — AI AUTOMATION RULES ENGINE & AUDIO SYNTHESIZER
 * 6 Animashaun Close, Ikeja, Lagos
 * Timed Workflows, Proactive Guest Outreach & Web Audio Chimes
 */

import { store } from '../store/state.js';
import { aiEngine } from './aiEngine.js';

export class AutomationEngine {
  constructor() {
    this.audioCtx = null;
    this.startSLATimerTicker();
  }

  // Live 1-second SLA delivery timer ticker for prompt service delivery
  startSLATimerTicker() {
    if (typeof window === 'undefined') return;
    setInterval(() => {
      const timerElements = document.querySelectorAll('[data-sla-deadline]');
      const now = Date.now();
      timerElements.forEach(el => {
        const deadline = parseInt(el.dataset.slaDeadline, 10);
        if (isNaN(deadline)) return;
        const diffMs = deadline - now;
        if (diffMs <= 0) {
          el.innerText = '00:00 (Overdue)';
          el.className = 'badge-critical font-mono text-xs px-2 py-0.5';
        } else {
          const totalSecs = Math.floor(diffMs / 1000);
          const mins = Math.floor(totalSecs / 60);
          const secs = totalSecs % 60;
          el.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} Remaining`;
          if (totalSecs <= 300) {
            el.className = 'badge-attention font-mono text-xs px-2 py-0.5 animate-pulse';
          } else {
            el.className = 'badge-normal font-mono text-xs px-2 py-0.5';
          }
        }
      });
    }, 1000);
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    return this.audioCtx;
  }

  // Synthesize luxury hospitality chime using Web Audio API
  playChime(type = 'bell') {
    const settings = store.getState().automationSettings;
    if (!settings.soundAlertsEnabled) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      if (type === 'bell' || type === 'order') {
        // Luxury front desk silver bell chime
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1046.50, now); // C6
        osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 1.2);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(2093.00, now); // C7 harmonic
        osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.8);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.5);
        osc2.stop(now + 1.5);
      } else if (type === 'alarm' || type === 'critical') {
        // Subtle urgent double chime
        [0, 0.2].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, now + offset); // A5
          gain.gain.setValueAtTime(0.4, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.4);
        });
      } else if (type === 'intercom-beep' || type === 'intercom-open') {
        // Classic Walkie-Talkie / Intercom Mic-Open Squelch Chirp
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(740, now);
        osc.frequency.exponentialRampToValueAtTime(1480, now + 0.08);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
      } else if (type === 'intercom-roger' || type === 'intercom-sent') {
        // Classic Radio "Roger Beep" / Transmission Confirmed Tone
        [0, 0.08].forEach((offset, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(idx === 0 ? 1150 : 1720, now + offset);
          gain.gain.setValueAtTime(0.3, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.1);
        });
      } else if (type === 'intercom-broadcast' || type === 'pa-chime') {
        // Luxury 3-tone Hotel Capitol PA Broadcast Chime (G5 -> C6 -> E6)
        [783.99, 1046.50, 1318.51].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.14);
          gain.gain.setValueAtTime(0.3, now + i * 0.14);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.65);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.14);
          osc.stop(now + i * 0.14 + 0.7);
        });
      } else if (type === 'listen-start') {
        // Modern 2-tone pleasant AI listening earcon (C5 -> G5)
        [523.25, 783.99].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.11);
          gain.gain.setValueAtTime(0.28, now + i * 0.11);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.11 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.11);
          osc.stop(now + i * 0.11 + 0.4);
        });
      } else if (type === 'listen-stop') {
        // Falling acknowledgement tone
        [783.99, 523.25].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.09);
          gain.gain.setValueAtTime(0.25, now + i * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.09);
          osc.stop(now + i * 0.09 + 0.3);
        });
      }
    } catch (e) {
      console.warn('Audio synthesis warning:', e);
    }
  }

  showToast(title, message, type = 'info') {
    const toastRoot = document.getElementById('toast-root');
    if (!toastRoot) return;

    const toast = document.createElement('div');
    toast.className = 'toast-item';
    
    let borderColor = 'var(--gold-500)';
    let badgeColor = 'var(--gold-400)';
    if (type === 'critical') {
      borderColor = 'var(--critical)';
      badgeColor = 'var(--critical)';
    } else if (type === 'success') {
      borderColor = 'var(--normal)';
      badgeColor = 'var(--normal)';
    }

    toast.style.borderColor = borderColor;
    toast.innerHTML = `
      <div style="color: ${badgeColor}; font-size: 1.3rem;">●</div>
      <div style="flex: 1;">
        <div style="font-weight: 700; font-size: 0.9rem; color: #fff;">${title}</div>
        <div style="font-size: 0.82rem; color: #cbd5e1; margin-top: 2px;">${message}</div>
      </div>
      <button style="background:none; border:none; color:#94a3b8; cursor:pointer; font-size:1.1rem;" onclick="this.parentElement.remove()">✕</button>
    `;

    toastRoot.appendChild(toast);
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }
    }, 6000);
  }

  // --- AUTOMATION TRIGGERS (Can be triggered manually via Demo Bar or by time schedule) ---

  // Trigger 6:00 AM Breakfast Notification (Section 10)
  triggerBreakfastAutomation() {
    this.playChime('bell');
    const guest = store.getActiveGuest();
    const guestName = guest ? guest.name : 'Valued Guest';
    const isFree = guest?.breakfastEntitlement === 'Complimentary';
    const title = '☀️ 06:00 AM — Breakfast Service Available';
    const message = `Good morning, ${guestName}. This is Tolani from Hotel Capitol. Breakfast service is now available. Would you like to select your breakfast and preferred delivery time?`;

    this.showToast(title, message, 'info');
    store.addAudit('Breakfast Outreach Fired', `06:00 AM Rule for Suite ${guest?.roomNumber || '402'}`, message, 'AI Automation Engine');

    aiEngine.speak(message);

    if (window.onTriggerBreakfastModal) {
      window.onTriggerBreakfastModal();
    }
  }

  // Trigger 8:00 AM Room Service Outreach (Section 11)
  triggerRoomServiceAutomation() {
    this.playChime('bell');
    const guest = store.getActiveGuest();
    const guestName = guest ? guest.name : 'Valued Guest';
    const title = '🛎 08:00 AM — Hotel Capitol Housekeeping Outreach';
    const message = `Good morning, ${guestName}. I am Tolani from Hotel Capitol. Would you like to request housekeeping, fresh towels, or room cleaning for Suite ${guest?.roomNumber || '402'} today?`;

    this.showToast(title, message, 'info');
    store.addAudit('Room Service Outreach', `08:00 AM Rule for Suite ${guest?.roomNumber || '402'}`, message, 'AI Automation Engine');

    aiEngine.speak(message);

    if (window.onTriggerRoomServiceModal) {
      window.onTriggerRoomServiceModal();
    }
  }

  // Trigger 45-Minutes Before Checkout Reminder (Section 12/38)
  triggerCheckoutReminderAutomation() {
    this.playChime('bell');
    const guest = store.getActiveGuest();
    const guestName = guest ? guest.name : 'Valued Guest';
    const title = '🛫 Departure Outreach (45 Min to Checkout)';
    const message = `Good day, ${guestName}. This is Tolani. Your scheduled checkout is at ${guest?.checkoutHour || '12:00 PM'}. Would you like to extend your stay, request luggage assistance, or book airport transit?`;

    this.showToast(title, message, 'info');
    store.addAudit('Departure Outreach Fired', `45-min Checkout Rule for Suite ${guest?.roomNumber || '402'}`, message, 'AI Automation Engine');

    aiEngine.speak(message);

    if (window.onTriggerCheckoutModal) {
      window.onTriggerCheckoutModal();
    }
  }

  // Trigger 5-Minutes Food Delivery Warning (Section 7)
  triggerFoodDeliveryWarning(orderId) {
    this.playChime('success');
    const order = store.getState().orders.find(o => o.id === orderId) || store.getState().orders[0];
    const guest = store.getActiveGuest();
    const guestName = guest ? guest.name : 'Valued Guest';
    const title = '🍽 Food Arrival Notice (5 Minutes)';
    const message = `${guestName}, your order is ready and is now on its way to Suite ${order.roomNumber}. We hope you enjoy your meal.`;

    this.showToast(title, message, 'success');
    store.addAudit('Order 5-Min Arrival Notice', order.id, message, 'AI Kitchen Automation');

    aiEngine.speak(message);
  }

  // Trigger Automated Staff Voice Alert & Confirmation Protocol (Section 27)
  triggerStaffVoiceDispatch(request) {
    this.playChime('intercom-beep');
    window.activePendingVoiceRequest = request;

    const staffName = request.assignedStaffName || 'Designated Attendant';
    const dept = request.department || 'Operations';
    const roomNumber = request.roomNumber || '402';

    // Section 27: Audible Department Alert
    const staffNotice = dept === 'Kitchen & F&B' 
      ? `Attention. New restaurant order from Room ${roomNumber}.` 
      : dept === 'Housekeeping' 
      ? `New housekeeping request from Room ${roomNumber}.` 
      : dept === 'Concierge' 
      ? `New transportation request from Room ${roomNumber}.` 
      : `New guest service request from Room ${roomNumber}.`;

    this.showToast(`🛎️ Alert to ${staffName} (Suite #${roomNumber})`, `Department Alert: "${request.title}" (${dept}). Please confirm.`, 'info');
    
    setTimeout(() => {
      aiEngine.speak(staffNotice);
    }, 500);

    if (window.renderApp) window.renderApp();

    // Auto-simulate designated staff voice confirmation after 3.8s if not manually confirmed
    setTimeout(() => {
      if (window.activePendingVoiceRequest && window.activePendingVoiceRequest.id === request.id) {
        this.confirmStaffVoiceRequest(request.id, staffName);
      }
    }, 3800);
  }

  // Staff Confirms Receipt: "Request Confirmed" -> AI Notifies Guest (Section 28 & 29)
  confirmStaffVoiceRequest(requestId, staffName = null) {
    const updatedReq = store.confirmStaffServiceRequest(requestId, staffName);
    window.activePendingVoiceRequest = null;
    
    // Play Roger Beep
    this.playChime('intercom-roger');
    
    const activeStaff = staffName || (updatedReq ? updatedReq.assignedStaffName : store.getActiveStaff().name);
    const roomNumber = updatedReq ? updatedReq.roomNumber : '402';
    const guest = store.getActiveGuest();
    const guestName = guest ? guest.name : 'Valued Guest';

    // Section 29: Real-Time Guest Update by Amara
    const guestNotice = `${guestName}, your request for ${updatedReq ? updatedReq.title : 'service'} has been confirmed. Our team will attend to your room shortly.`;
    
    // Toast confirmation
    this.showToast(`✅ Request Confirmed by ${activeStaff}`, `Assigned to Suite #${roomNumber}. Staff is actively attending to request.`, 'success');
    
    // Amara announces confirmation to guest
    setTimeout(() => {
      aiEngine.speak(guestNotice);
    }, 400);

    if (window.renderApp) window.renderApp();
  }

  // Trigger Low Inventory Alert Check
  checkInventoryThresholds() {
    const state = store.getState();
    let hasAlerts = false;

    state.inventory.forEach(item => {
      const ratio = item.quantity / item.maxCapacity;
      if (ratio <= 0.1) {
        this.playChime('critical');
        this.showToast(`🔴 Critical Stock Alert: ${item.name}`, `Current stock: ${item.quantity} ${item.unit} (${Math.round(ratio * 100)}%). Emergency replenishment required.`, 'critical');
        store.addAudit('Critical Stock Breach', item.name, `Stock reached ${Math.round(ratio * 100)}%`, 'Inventory Sensor');
        hasAlerts = true;
      } else if (ratio <= 0.2) {
        this.showToast(`🟠 Very Low Stock: ${item.name}`, `Current stock: ${item.quantity} ${item.unit} (${Math.round(ratio * 100)}%). Escalate to department supervisor.`, 'info');
        hasAlerts = true;
      } else if (ratio <= 0.3) {
        this.showToast(`🟡 Low Stock: ${item.name}`, `Current stock: ${item.quantity} ${item.unit} (${Math.round(ratio * 100)}%).`, 'info');
        hasAlerts = true;
      }
    });

    return hasAlerts;
  }
}

export const automationEngine = new AutomationEngine();
if (typeof window !== 'undefined') {
  window.hotelCapitolAutomation = automationEngine;
}
