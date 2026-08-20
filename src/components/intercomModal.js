/**
 * HOTEL CAPITOL — STAFF INTERCOM & OPERATIONS RADIO
 * 6 Animashaun Close, Ikeja, Lagos
 */

import { getIcon, renderIntercomRoundBadge } from '../assets/icons.js';
import { store } from '../store/state.js';
import { aiEngine } from '../services/aiEngine.js';
import { automationEngine } from '../services/automationRules.js';

let isIntercomOpen = false;
let activeChannel = 'general-operations';
let isIntercomListening = false;
let lastBroadcastStatus = null; // null | { text, time, channel }
let maryAlertInterval = null;
let currentActiveAlertId = null;

export function startRepeatedMaryAlert(roomNumber, deptName) {
  stopRepeatedMaryAlert();
  // Immediate Mary announcement
  aiEngine.speak(`Guest request from Room ${roomNumber}`);
  
  maryAlertInterval = setInterval(() => {
    const alerts = store.getState().intercomAlerts || [];
    const hasWaiting = alerts.some(a => a.roomNumber === String(roomNumber) && a.status === 'WAITING');
    if (hasWaiting) {
      automationEngine.playChime('intercom-beep');
      aiEngine.speak(`Guest request from Room ${roomNumber}`);
    } else {
      stopRepeatedMaryAlert();
    }
  }, 9000);
}

export function stopRepeatedMaryAlert() {
  if (maryAlertInterval) {
    clearInterval(maryAlertInterval);
    maryAlertInterval = null;
  }
}

if (typeof window !== 'undefined') {
  window.startRepeatedMaryAlert = startRepeatedMaryAlert;
  window.stopRepeatedMaryAlert = stopRepeatedMaryAlert;
}

export function initIntercom() {
  window.toggleIntercomModal = (forceOpen = null) => {
    isIntercomOpen = forceOpen !== null ? forceOpen : !isIntercomOpen;
    if (isIntercomOpen) {
      automationEngine.playChime('intercom-beep');
      setTimeout(() => {
        const inp = document.getElementById('intercom-text-input');
        if (inp) inp.focus();
      }, 100);
    }
    renderIntercomModal();
  };

  window.switchIntercomChannel = (chan) => {
    activeChannel = chan;
    automationEngine.playChime('intercom-beep');
    renderIntercomModal();
  };

  // Direct 2-Way Intercom Call with Mary's Context-Aware Voice Concierge (Section 4 & 5)
  window.openDirectIntercomCall = (channelId = 'general-operations', deptName = 'Concierge', attendantName = null, serviceType = 'CONCIERGE') => {
    activeChannel = channelId;
    isIntercomOpen = true;

    // Immediate Department Alert Chime
    automationEngine.playChime('intercom-beep');

    const guest = store.getActiveGuest();
    const guestName = guest ? guest.name : 'Valued Guest';
    const roomNumber = guest ? guest.roomNumber : '402';

    // Create the persistent alert record in StateStore
    const newAlert = store.createIntercomAlert(serviceType, deptName, channelId, roomNumber, guestName);
    currentActiveAlertId = newAlert.id;

    // Start repeated Mary announcement until staff accepts
    startRepeatedMaryAlert(roomNumber, deptName);

    let staffName = attendantName || 'Mary (Concierge)';
    let staffRole = 'Hotel Capitol Concierge';
    let greeting = `Good day, ${guestName}. I am Mary, your Hotel Capitol concierge. I will connect you with our ${deptName} team. How may we assist you today?`;

    if (channelId === 'kitchen-fb' || serviceType === 'BREAKFAST') {
      staffName = 'Chef Babatunde Adele';
      staffRole = 'Executive Head Chef';
      greeting = `Hello, ${guestName}. I see you're exploring our dining options. How may I assist you with your culinary order for Suite #${roomNumber}?`;
    } else if (channelId === 'housekeeping') {
      staffName = 'Amara Nwosu';
      staffRole = 'Head of Housekeeping';
      greeting = `I'm here to assist with your room, ${guestName}. Would you like to request housekeeping, fresh towels, or another room amenity?`;
    } else if (channelId === 'concierge-frontdesk' || serviceType === 'CONCIERGE') {
      staffName = 'Ibrahim Bello';
      staffRole = 'Lead Concierge';
      greeting = `Good day, ${guestName}. Your concierge team is at your service. What may I arrange for your stay at Hotel Capitol?`;
    } else if (serviceType === 'VIP_TRANSPORTATION') {
      staffName = 'Ibrahim Bello';
      staffRole = 'Lead Chauffeur';
      greeting = `Good day, ${guestName}. I'd be delighted to arrange your luxury VIP transportation. Where would you like to travel today?`;
    } else if (channelId === 'emergency-security') {
      staffName = 'Security Control Desk';
      staffRole = 'Duty Security Officer';
      greeting = `This is priority dispatch for Suite #${roomNumber}. What is your emergency? I am alerting Hotel Capitol security control immediately.`;
    }

    // Post operator greeting into channel transcript
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const operatorMsg = {
      id: 'INT-OP-' + Date.now().toString().slice(-4),
      channel: channelId,
      sender: staffName,
      role: staffRole,
      time,
      text: greeting,
      isRelayResponse: true
    };

    store.setState(s => ({
      ...s,
      intercomMessages: [...s.intercomMessages, operatorMsg]
    }));

    renderIntercomModal();

    // Mary speaks greeting aloud and opens microphone
    aiEngine.speak(greeting, () => {
      window.toggleIntercomVoice();
    });
  };

  // Staff accepts the pending guest request
  window.acceptIntercomRequest = (alertId) => {
    const staff = store.getActiveStaff();
    stopRepeatedMaryAlert();
    const updated = store.acceptIntercomAlert(alertId, staff.id, staff.name);
    automationEngine.playChime('intercom-roger');
    automationEngine.showToast('Request Connected', `Staff ${staff.name} accepted Room ${updated.roomNumber} request.`, 'success');
    aiEngine.speak(`${staff.name} has connected to Room ${updated.roomNumber}.`);
    renderIntercomModal();
    if (window.renderApp) window.renderApp();
  };

  // Complete intercom conversation & route to service page
  window.completeIntercomAndRoute = (alertId, routeTab) => {
    const alert = (store.getState().intercomAlerts || []).find(a => a.id === alertId);
    stopRepeatedMaryAlert();
    
    let summary = '';
    if (alert) {
      if (alert.serviceType === 'BREAKFAST') {
        summary = `Room ${alert.roomNumber} requested breakfast for 8:00 AM. Kitchen has acknowledged the request.`;
      } else if (alert.serviceType === 'VIP_TRANSPORTATION') {
        summary = `Room ${alert.roomNumber} requested VIP Chauffeur transfer. Transport desk has scheduled the vehicle.`;
      } else {
        summary = `Room ${alert.roomNumber} requested concierge assistance. Mary and team have acknowledged the request.`;
      }
      store.completeIntercomAlert(alertId, summary);
    }

    isIntercomOpen = false;
    renderIntercomModal();

    if (routeTab && window.navigateGuestTab) {
      window.navigatePortal('guest');
      window.navigateGuestTab(routeTab);
      automationEngine.showToast('Service Opened', `Opening ${routeTab.toUpperCase()} options for your suite.`, 'info');
    }
  };

  // Voice Input Speech-to-Text Dictation with Authentic Radio Beeps
  window.toggleIntercomVoice = () => {
    if (isIntercomListening) {
      aiEngine.stopListening();
      isIntercomListening = false;
      automationEngine.playChime('intercom-roger');
      renderIntercomModal();
    } else {
      isIntercomListening = true;
      automationEngine.playChime('intercom-beep');
      automationEngine.showToast('🔴 ON AIR — SPEAK NOW', `Microphone live. Broadcasting to ${activeChannel}...`, 'info');
      renderIntercomModal();

      aiEngine.listen(
        (transcript) => {
          isIntercomListening = false;
          const input = document.getElementById('intercom-text-input');
          if (input) {
            input.value = transcript;
            window.sendIntercomMsg();
          }
          renderIntercomModal();
        },
        () => {
          isIntercomListening = false;
          renderIntercomModal();
        },
        (err) => {
          isIntercomListening = false;
          automationEngine.showToast('Voice Notice', err, 'critical');
          renderIntercomModal();
        }
      );
    }
  };

  window.speakIntercomMsg = (text, sender) => {
    automationEngine.playChime('intercom-beep');
    aiEngine.speak(`${sender} states: ${text}`);
    automationEngine.showToast('Playing Dispatch', `${sender}: "${text}"`, 'info');
  };

  function simulateRadioRelayResponse(channel, originalText, senderName) {
    setTimeout(() => {
      let relaySender = 'Supervisor Tariq Alabi';
      let relayRole = 'Shift Supervisor';
      let replyText = `Received ${senderName}. Front Desk has logged your request and our team is attending to Suite #402 now.`;

      if (channel === 'kitchen-fb') {
        relaySender = 'Chef Babatunde Adele';
        relayRole = 'Executive Head Chef';
        replyText = `Kitchen station acknowledges ${senderName}. Please place your order selection in the dining tray to confirm.`;
      } else if (channel === 'housekeeping') {
        relaySender = 'Amara Nwosu';
        relayRole = 'Head of Housekeeping';
        replyText = `Housekeeping station copies ${senderName}. Attendants standing by for your room request.`;
      } else if (channel === 'concierge-frontdesk') {
        relaySender = 'Lead Concierge Ibrahim';
        relayRole = 'Chief Concierge';
        replyText = `Concierge desk copies ${senderName}. Standing by to assist with your suite needs.`;
      } else if (channel === 'emergency-security') {
        relaySender = 'Security Lead Officer';
        relayRole = 'Head of Security';
        replyText = `🚨 Security control center confirms priority dispatch for Suite #402.`;
      }

      const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      const replyMsg = {
        id: 'INT-RELAY-' + Date.now().toString().slice(-4),
        channel,
        sender: relaySender,
        role: relayRole,
        time,
        text: replyText,
        isRelayResponse: true
      };

      store.setState(s => ({
        ...s,
        intercomMessages: [...s.intercomMessages, replyMsg]
      }));

      automationEngine.playChime('intercom-beep');
      automationEngine.showToast(`📻 Relay from ${relaySender}`, replyText, 'info');
      aiEngine.speak(`${relaySender}: ${replyText}`);
      renderIntercomModal();

      setTimeout(() => {
        const el = document.getElementById('intercom-messages-list');
        if (el) el.scrollTop = el.scrollHeight;
      }, 60);

    }, 2200);
  }

  window.runIntercomRelayTest = () => {
    const staff = store.getActiveStaff();
    const testMsg = `Radio check from ${staff.name}. Testing two-way channel relay on #${activeChannel}. Do you copy?`;
    store.sendIntercomMessage(activeChannel, testMsg);
    automationEngine.playChime('intercom-roger');
    automationEngine.showToast('🧪 TEST BROADCAST TRANSMITTED', 'Simulating 2-way radio receiver on the other end...', 'info');
    renderIntercomModal();
    simulateRadioRelayResponse(activeChannel, testMsg, staff.name);
  };

  window.sendIntercomMsg = () => {
    const input = document.getElementById('intercom-text-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const staff = store.getActiveStaff();
    store.sendIntercomMessage(activeChannel, text);
    automationEngine.playChime('intercom-roger');
    
    lastBroadcastStatus = {
      text,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
      channel: activeChannel
    };

    automationEngine.showToast('📡 BROADCAST TRANSMITTED', `Dispatch sent to ${activeChannel}: "${text}"`, 'success');

    input.value = '';
    renderIntercomModal();

    setTimeout(() => {
      const el = document.getElementById('intercom-messages-list');
      if (el) el.scrollTop = el.scrollHeight;
      const inp = document.getElementById('intercom-text-input');
      if (inp) inp.focus();
    }, 50);

    simulateRadioRelayResponse(activeChannel, text, staff.name);

    setTimeout(() => {
      lastBroadcastStatus = null;
      renderIntercomModal();
    }, 6000);
  };

  window.sendEmergencyAlert = () => {
    const prompt = window.prompt('Enter urgent operations emergency broadcast message:');
    if (!prompt) return;

    store.sendIntercomMessage('emergency-security', `🚨 EMERGENCY BROADCAST: ${prompt}`);
    automationEngine.playChime('intercom-broadcast');
    automationEngine.showToast('🚨 EMERGENCY ALERT BROADCASTED', prompt, 'critical');
    aiEngine.speak(`Attention all hotel staff. Emergency radio broadcast: ${prompt}`);
    activeChannel = 'emergency-security';
    renderIntercomModal();
    simulateRadioRelayResponse('emergency-security', prompt, store.getActiveStaff().name);
  };

  renderIntercomModal();
}

export function renderIntercomModal() {
  const root = document.getElementById('intercom-root');
  if (!root) return;

  if (!isIntercomOpen) {
    root.innerHTML = '';
    return;
  }

  const state = store.getState();
  const staff = store.getActiveStaff();
  const guest = store.getActiveGuest();
  const channels = [
    { id: 'general-operations', name: '#operations', label: 'General Operations' },
    { id: 'housekeeping', name: '#housekeeping', label: 'Housekeeping' },
    { id: 'kitchen-fb', name: '#kitchen-fb', label: 'Kitchen & F&B' },
    { id: 'concierge-frontdesk', name: '#concierge', label: 'Concierge & Front Desk' },
    { id: 'emergency-security', name: '🚨 #emergency', label: 'Emergency & Security' }
  ];

  const messages = state.intercomMessages.filter(m => m.channel === activeChannel);
  
  // Find active alert for current room / channel
  const activeAlert = (state.intercomAlerts || []).find(a => 
    (a.status === 'WAITING' || a.status === 'CONNECTED') &&
    (currentActiveAlertId ? a.id === currentActiveAlertId : true)
  ) || (state.intercomAlerts || [])[0];

  const isWaiting = activeAlert && activeAlert.status === 'WAITING';
  const isConnected = activeAlert && activeAlert.status === 'CONNECTED';

  let targetRouteTab = 'concierge';
  if (activeAlert) {
    if (activeAlert.serviceType === 'BREAKFAST') targetRouteTab = 'breakfast';
    else if (activeAlert.serviceType === 'VIP_TRANSPORTATION') targetRouteTab = 'transport';
  }

  root.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" style="background: rgba(4, 9, 15, 0.85); backdrop-filter: blur(8px);" onclick="window.toggleIntercomModal(false)">
      <div class="w-full max-w-2xl bg-navy-900 border border-gold rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in max-h-[92vh] sm:max-h-[85vh]" style="height: min(640px, 92vh);" onclick="event.stopPropagation()">
        
        <!-- Header -->
        <div class="p-3.5 sm:p-4 bg-navy-950 border-b border-gold flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center gap-3">
            ${renderIntercomRoundBadge(36)}
            <div>
              <h3 class="font-serif text-xs sm:text-sm font-bold text-white tracking-luxury">STAFF INTERCOM & OPERATIONS RADIO</h3>
              <div class="text-[11px] text-gold-light">Active Operator: <strong>${staff.name}</strong> (${staff.role})</div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button 
              class="glass-panel text-[11px] py-1.5 px-3 flex items-center gap-1.5 border border-gold/40 hover:border-gold cursor-pointer transition-all text-gold hover:text-white rounded-xl hide-mobile"
              onclick="window.runIntercomRelayTest()"
              title="Test two-way radio message relay on both ends"
            >
              <span>🧪</span> <span>Test Relay</span>
            </button>
            <button class="btn-danger text-[11px] py-1.5 px-3 flex items-center gap-1" onclick="window.sendEmergencyAlert()">
              ${getIcon('alertTriangle', 14)} Alert
            </button>
            <button class="btn-icon" style="width:32px; height:32px;" onclick="window.toggleIntercomModal(false)">
              ${getIcon('x', 18)}
            </button>
          </div>
        </div>

        <!-- GUEST WAITING STATE BANNER (Section 4.3 & 5: Persistent Yellow Blinking Indicator) -->
        ${isWaiting ? `
          <div class="p-3 bg-amber-950/90 border-b-2 border-amber-400 flex items-center justify-between gap-3 animate-pulse">
            <div class="flex items-center gap-2.5">
              <span class="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-lg animate-ping"></span>
              <div>
                <div class="text-xs font-bold text-amber-200 uppercase tracking-luxury">
                  🟡 CONNECTING ROOM ${activeAlert.roomNumber} TO ${(activeAlert.deptName || 'DEPARTMENT').toUpperCase()}
                </div>
                <div class="text-[11px] text-slate-300">
                  Waiting for staff attendant pickup... Mary is broadcasting audio notification.
                </div>
              </div>
            </div>
            <button 
              class="btn-primary text-xs py-1.5 px-3.5 font-bold whitespace-nowrap bg-amber-500 hover:bg-amber-400 text-black cursor-pointer shadow-md"
              onclick="window.acceptIntercomRequest('${activeAlert.id}')"
            >
              ✓ Accept Request
            </button>
          </div>
        ` : ''}

        <!-- CONNECTED STATE BANNER (Section 4.4 & 7: Staff Accepted) -->
        ${isConnected ? `
          <div class="p-3 bg-emerald-950/90 border-b-2 border-emerald-500 flex items-center justify-between gap-3 animate-fade-in">
            <div class="flex items-center gap-2.5">
              <span class="w-3 h-3 rounded-full bg-emerald-400 shadow-md"></span>
              <div>
                <div class="text-xs font-bold text-white uppercase tracking-wider">
                  🟢 CONNECTED · Suite #${activeAlert.roomNumber} & ${(activeAlert.deptName || 'Attendant').toUpperCase()}
                </div>
                <div class="text-[11px] text-emerald-300">
                  Attendant: <strong>${activeAlert.staffName || 'Staff Member'}</strong> · Responded in ${Math.round((activeAlert.responseTimeMs || 15000)/1000)}s
                </div>
              </div>
            </div>
            <button 
              class="btn-secondary text-xs py-1.5 px-3 font-semibold whitespace-nowrap cursor-pointer text-gold hover:text-white"
              onclick="window.completeIntercomAndRoute('${activeAlert.id}', '${targetRouteTab}')"
            >
              Open ${targetRouteTab.toUpperCase()} Options →
            </button>
          </div>
        ` : ''}

        <!-- Body with Channel Sidebar + Chat Area -->
        <div class="flex-1 flex overflow-hidden">
          
          <!-- Channels Sidebar -->
          <div class="w-36 sm:w-48 bg-navy-950 border-r border-white/10 p-2.5 flex flex-col gap-1 overflow-y-auto shrink-0">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Channels</div>
            ${channels.map(c => `
              <button 
                class="w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium border-none cursor-pointer flex items-center justify-between transition-all ${
                  activeChannel === c.id 
                    ? 'bg-gold text-navy-950 font-bold shadow' 
                    : 'text-slate-300 hover:text-white bg-transparent hover:bg-white/5'
                }"
                onclick="window.switchIntercomChannel('${c.id}')"
              >
                <span class="truncate">${c.name}</span>
                ${c.id === 'emergency-security' ? '<span class="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></span>' : ''}
              </button>
            `).join('')}
          </div>

          <!-- Messages Area -->
          <div class="flex-1 flex flex-col bg-navy-900 min-w-0">
            
            <!-- Channel Header & Live Status -->
            <div class="p-2.5 sm:p-3 bg-navy-850 border-b border-white/5 flex items-center justify-between text-xs font-semibold text-gold">
              <div class="flex items-center gap-2">
                <span class="truncate">Channel: ${channels.find(c => c.id === activeChannel)?.label || activeChannel}</span>
                <span class="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Radio Active
                </span>
              </div>
              <span class="text-slate-400 font-normal text-[11px] hide-mobile">Encrypted Voice/Data</span>
            </div>

            <!-- BROADCAST CONFIRMATION BANNER (When message transmitted) -->
            ${lastBroadcastStatus ? `
              <div class="p-2.5 bg-emerald-950/80 border-b border-emerald-500/50 flex items-center justify-between animate-fade-in text-xs">
                <div class="flex items-center gap-2">
                  <span class="text-emerald-400 font-bold">✓</span>
                  <div>
                    <div class="font-bold text-white uppercase text-[11px]">📡 Broadcast Transmitted & Confirmed</div>
                    <div class="text-[10px] text-emerald-300">"${lastBroadcastStatus.text}" · ${lastBroadcastStatus.time}</div>
                  </div>
                </div>
                <span class="badge-normal text-[9px] py-0.5">Roger Beep Sent</span>
              </div>
            ` : ''}

            <!-- ON AIR — SPEAK NOW BANNER (When Microphone is Live) -->
            ${isIntercomListening ? `
              <div class="p-2.5 bg-red-950/80 border-b-2 border-red-500 flex items-center justify-between animate-pulse text-xs">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-red-500 shadow-lg animate-ping"></span>
                  <div>
                    <div class="font-bold text-white uppercase tracking-luxury text-[11px]">🔴 ON AIR — SPEAK NOW</div>
                    <div class="text-[10px] text-amber-200">Listening to voice... Speak clearly.</div>
                  </div>
                </div>
                <div class="voice-wave flex items-center gap-1">
                  <span></span><span></span><span></span><span></span>
                </div>
              </div>
            ` : ''}

            <!-- Messages List -->
            <div id="intercom-messages-list" class="flex-1 p-3 sm:p-4 overflow-y-auto flex flex-col gap-2.5">
              ${messages.length === 0 ? `
                <div class="text-center text-slate-400 text-xs py-8">
                  No messages in this channel yet. Tap <strong class="text-gold">🎙️ Speak</strong> or type below.
                </div>
              ` : ''}

              ${messages.map((m, idx) => {
                const isLatest = idx === messages.length - 1;
                return `
                  <div class="p-2.5 sm:p-3 rounded-xl ${m.channel === 'emergency-security' ? 'bg-red-950/60 border border-red-500/50' : 'bg-navy-850 border border-white/10'} transition-all hover:border-gold/40">
                    <div class="flex items-center justify-between mb-1">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <strong class="text-xs text-white">${m.sender}</strong>
                        <span class="text-[10px] text-gold-light opacity-75">· ${m.role}</span>
                        ${isLatest ? '<span class="text-[9px] px-1.5 py-0.2 rounded bg-gold/20 text-gold border border-gold/40 font-bold">📡 TRANSMITTED</span>' : ''}
                      </div>
                      <div class="flex items-center gap-1.5">
                        <span class="text-[10px] text-slate-400">${m.time}</span>
                        <button 
                          class="bg-transparent border-none text-gold hover:text-white cursor-pointer p-0.5 transition-transform hover:scale-110 flex items-center gap-1" 
                          onclick="window.speakIntercomMsg('${m.text.replace(/'/g, "\\'")}', '${m.sender}')"
                          title="Listen aloud"
                        >
                          ${getIcon('volume2', 13)}
                        </button>
                      </div>
                    </div>
                    <div class="text-xs sm:text-sm text-slate-200">${m.text}</div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Input Controls Area (Stacked per Section 1 requirements) -->
            <div class="p-3 bg-navy-950 border-t border-white/10 flex flex-col gap-2">
              
              <!-- Row 1 & 2: TYPE OR SPEAK + SPEAK Push-to-Talk Button -->
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                <input 
                  id="intercom-text-input"
                  type="text" 
                  class="input-custom text-xs py-2.5 px-3 flex-1 w-full min-w-0" 
                  placeholder="${isIntercomListening ? 'Listening to voice... Speak now' : `Type or speak broadcast to #${activeChannel}...`}" 
                  onkeydown="if (event.key === 'Enter') window.sendIntercomMsg();"
                />
                
                <!-- Voice Microphone Push-to-Talk Button (Beside on wide, stacked on mobile) -->
                <button 
                  class="${isIntercomListening ? 'bg-red-500 text-white font-bold animate-pulse' : 'menu-btn-gold'} text-xs py-2.5 px-4 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap min-h-[44px]"
                  onclick="window.toggleIntercomVoice()"
                  title="Tap to speak broadcast into Intercom"
                  type="button"
                >
                  ${getIcon('mic', 16)}
                  <span>${isIntercomListening ? '⏹ Stop' : '🎙️ Speak'}</span>
                </button>
              </div>

              <!-- Row 3: BROADCAST (Centered underneath Type/Speak controls) -->
              <div class="flex items-center justify-center pt-0.5">
                <button 
                  class="btn-primary text-xs py-2.5 px-8 font-bold flex items-center justify-center gap-2 shadow-lg min-h-[44px] w-full sm:w-auto min-w-[200px] cursor-pointer"
                  onclick="window.sendIntercomMsg()"
                  type="button"
                >
                  <span>📡</span>
                  <span>BROADCAST</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  `;
}
