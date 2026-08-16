/**
 * HOTEL CAPITOL — STAFF INTERCOM & RADIO CHANNELS
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

  // Direct 2-Way Intercom Call with Amara's Context-Aware Voice Concierge (Section 20 & 21)
  window.openDirectIntercomCall = (channelId = 'general-operations', deptName = null, attendantName = null) => {
    activeChannel = channelId;
    isIntercomOpen = true;
    renderIntercomModal();

    // Walkie-talkie Luxury Squelch Chime
    automationEngine.playChime('intercom-beep');

    const guest = store.getActiveGuest();
    const guestName = guest ? guest.name : 'Valued Guest';
    const roomNumber = guest ? guest.roomNumber : '402';

    let staffName = attendantName || 'Tolani (Concierge)';
    let staffRole = 'Hotel Capitol Concierge';
    let greeting = `Good day, ${guestName}. I am Tolani, your Hotel Capitol concierge. I will connect you with our Front Desk team. How may we assist you today?`;

    if (channelId === 'kitchen-fb') {
      staffName = 'Chef Babatunde Adele';
      staffRole = 'Executive Head Chef';
      greeting = `Hello, ${guestName}. I see you're exploring our dining options. How may I assist you with your culinary order for Suite #${roomNumber}?`;
    } else if (channelId === 'housekeeping') {
      staffName = 'Amara Nwosu';
      staffRole = 'Head of Housekeeping';
      greeting = `I'm here to assist with your room, ${guestName}. Would you like to request housekeeping, fresh towels, or another room amenity?`;
    } else if (channelId === 'concierge-frontdesk') {
      staffName = 'Ibrahim Bello';
      staffRole = 'Lead Concierge';
      greeting = `Good day, ${guestName}. Your concierge team is at your service. What may I arrange for your stay at Hotel Capitol?`;
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

    // Amara speaks the official Section 21 context-aware voice greeting aloud and opens mic
    aiEngine.speak(greeting, () => {
      window.toggleIntercomVoice();
    });
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
      // Authentic walkie-talkie mic open squelch chirp
      automationEngine.playChime('intercom-beep');
      automationEngine.showToast('🔴 ON AIR — SPEAK NOW', `Microphone live. Broadcasting to ${activeChannel}...`, 'info');
      renderIntercomModal();

      aiEngine.listen(
        (transcript) => {
          isIntercomListening = false;
          const input = document.getElementById('intercom-text-input');
          if (input) {
            input.value = transcript;
            // Broadcast message immediately with radio roger confirmation
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

  // Play audio broadcast aloud
  window.speakIntercomMsg = (text, sender) => {
    automationEngine.playChime('intercom-beep');
    aiEngine.speak(`${sender} states: ${text}`);
    automationEngine.showToast('Playing Dispatch', `${sender}: "${text}"`, 'info');
  };

  // Two-way automated radio relay response matrix (Refined luxury hotel staff responses)
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

      // Play incoming radio squelch chirp
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

  // Quick 1-Click Two-Way Radio Relay Test
  window.runIntercomRelayTest = () => {
    const staff = store.getActiveStaff();
    const testMsg = `Radio check from ${staff.name}. Testing two-way channel relay on #${activeChannel}. Do you copy?`;
    
    // Transmit test
    store.sendIntercomMessage(activeChannel, testMsg);
    automationEngine.playChime('intercom-roger');
    automationEngine.showToast('🧪 TEST BROADCAST TRANSMITTED', 'Simulating 2-way radio receiver on the other end...', 'info');
    renderIntercomModal();

    // Trigger target receiver response on the other end
    simulateRadioRelayResponse(activeChannel, testMsg, staff.name);
  };

  // Send Broadcast with Authentic Intercom Sound & Two-Way Relay
  window.sendIntercomMsg = () => {
    const input = document.getElementById('intercom-text-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const staff = store.getActiveStaff();
    store.sendIntercomMessage(activeChannel, text);
    
    // Play authentic Walkie-Talkie Roger Beep
    automationEngine.playChime('intercom-roger');
    
    // Set visual confirmation HUD
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

    // Trigger simulated two-way response from receiving department
    simulateRadioRelayResponse(activeChannel, text, staff.name);

    // Reset temporary confirmation badge after 6 seconds
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
  const channels = [
    { id: 'general-operations', name: '#operations', label: 'General Operations' },
    { id: 'housekeeping', name: '#housekeeping', label: 'Housekeeping' },
    { id: 'kitchen-fb', name: '#kitchen-fb', label: 'Kitchen & F&B' },
    { id: 'concierge-frontdesk', name: '#concierge', label: 'Concierge & Front Desk' },
    { id: 'emergency-security', name: '🚨 #emergency', label: 'Emergency & Security' }
  ];

  const messages = state.intercomMessages.filter(m => m.channel === activeChannel);

  root.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(4, 9, 15, 0.85); backdrop-filter: blur(8px);" onclick="window.toggleIntercomModal(false)">
      <div class="w-full max-w-2xl bg-navy-900 border border-gold rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in" style="height: 600px;" onclick="event.stopPropagation()">
        
        <!-- Header -->
        <div class="p-4 bg-navy-950 border-b border-gold flex items-center justify-between">
          <div class="flex items-center gap-3">
            ${renderIntercomRoundBadge(38)}
            <div>
              <h3 class="font-serif text-sm font-bold text-white tracking-luxury">STAFF INTERCOM & OPERATIONS RADIO</h3>
              <div class="text-xs text-gold-light">Active Operator: <strong>${staff.name}</strong> (${staff.role})</div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button 
              class="glass-panel text-xs py-1.5 px-3 flex items-center gap-1.5 border border-gold/40 hover:border-gold cursor-pointer transition-all text-gold hover:text-white rounded-xl hide-mobile"
              onclick="window.runIntercomRelayTest()"
              title="Test two-way radio message relay on both ends"
            >
              <span>🧪</span> <span>Test 2-Way Relay</span>
            </button>
            <button class="btn-danger text-xs py-1.5 px-3 flex items-center gap-1" onclick="window.sendEmergencyAlert()">
              ${getIcon('alertTriangle', 14)} Broadcast Alert
            </button>
            <button class="btn-icon" style="width:32px; height:32px;" onclick="window.toggleIntercomModal(false)">
              ${getIcon('x', 18)}
            </button>
          </div>
        </div>

        <!-- Body with Channel Sidebar + Chat Area -->
        <div class="flex-1 flex overflow-hidden">
          
          <!-- Channels Sidebar -->
          <div class="w-48 bg-navy-950 border-r border-white/10 p-3 flex flex-col gap-1 overflow-y-auto">
            <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Channels</div>
            ${channels.map(c => `
              <button 
                class="w-full text-left px-3 py-2 rounded-lg text-xs font-medium border-none cursor-pointer flex items-center justify-between transition-all ${
                  activeChannel === c.id 
                    ? 'bg-gold text-navy-950 font-bold shadow' 
                    : 'text-slate-300 hover:text-white bg-transparent hover:bg-white/5'
                }"
                onclick="window.switchIntercomChannel('${c.id}')"
              >
                <span>${c.name}</span>
                ${c.id === 'emergency-security' ? '<span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>' : ''}
              </button>
            `).join('')}
          </div>

          <!-- Messages Area -->
          <div class="flex-1 flex flex-col bg-navy-900">
            
            <!-- Channel Header & Live Status -->
            <div class="p-3 bg-navy-850 border-b border-white/5 flex items-center justify-between text-xs font-semibold text-gold">
              <div class="flex items-center gap-2">
                <span>Channel: ${channels.find(c => c.id === activeChannel)?.label || activeChannel}</span>
                <span class="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Radio Active
                </span>
              </div>
              <span class="text-slate-400 font-normal hide-mobile">Encrypted 2.4GHz Voice/Data</span>
            </div>

            <!-- BROADCAST CONFIRMATION BANNER (When message transmitted) -->
            ${lastBroadcastStatus ? `
              <div class="p-3 bg-emerald-950/80 border-b border-emerald-500/50 flex items-center justify-between animate-fade-in">
                <div class="flex items-center gap-2">
                  <span class="text-emerald-400 text-sm font-bold">✓</span>
                  <div>
                    <div class="text-xs font-bold text-white uppercase tracking-wider">📡 Broadcast Transmitted & Confirmed</div>
                    <div class="text-[11px] text-emerald-300">"${lastBroadcastStatus.text}" · Logged at ${lastBroadcastStatus.time}</div>
                  </div>
                </div>
                <span class="badge-normal text-[10px] py-0.5">Roger Beep Sent</span>
              </div>
            ` : ''}

            <!-- ON AIR — SPEAK NOW BANNER (When Microphone is Live) -->
            ${isIntercomListening ? `
              <div class="p-3 bg-red-950/80 border-b-2 border-red-500 flex items-center justify-between animate-pulse">
                <div class="flex items-center gap-2.5">
                  <span class="w-3 h-3 rounded-full bg-red-500 shadow-lg animate-ping"></span>
                  <div>
                    <div class="text-xs font-bold text-white uppercase tracking-luxury">🔴 ON AIR — SPEAK NOW</div>
                    <div class="text-[11px] text-amber-200">Listening to your voice... Speak your dispatch clearly.</div>
                  </div>
                </div>
                <div class="voice-wave flex items-center gap-1">
                  <span></span><span></span><span></span><span></span><span></span>
                </div>
              </div>
            ` : ''}

            <!-- Messages List -->
            <div id="intercom-messages-list" class="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
              ${messages.length === 0 ? `
                <div class="text-center text-slate-400 text-xs py-8">
                  No messages in this channel yet. Tap <strong class="text-gold">🎙️ Voice Broadcast</strong> or type below.
                </div>
              ` : ''}

              ${messages.map((m, idx) => {
                const isLatest = idx === messages.length - 1;
                return `
                  <div class="p-3 rounded-xl ${m.channel === 'emergency-security' ? 'bg-red-950/60 border border-red-500/50' : 'bg-navy-850 border border-white/10'} transition-all hover:border-gold/40">
                    <div class="flex items-center justify-between mb-1.5">
                      <div class="flex items-center gap-2">
                        <strong class="text-xs text-white">${m.sender}</strong>
                        <span class="text-xs text-gold-light opacity-75">· ${m.role}</span>
                        ${isLatest ? '<span class="text-[9px] px-1.5 py-0.5 rounded bg-gold/20 text-gold border border-gold/40 font-bold">📡 TRANSMITTED</span>' : ''}
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-[11px] text-slate-400">${m.time}</span>
                        <button 
                          class="bg-transparent border-none text-gold hover:text-white cursor-pointer p-1 transition-transform hover:scale-110 flex items-center gap-1" 
                          onclick="window.speakIntercomMsg('${m.text.replace(/'/g, "\\'")}', '${m.sender}')"
                          title="Listen to radio dispatch aloud"
                        >
                          ${getIcon('volume2', 14)} <span class="text-[10px] hide-mobile">Play</span>
                        </button>
                      </div>
                    </div>
                    <div class="text-sm text-slate-200">${m.text}</div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Input Bar with Voice Broadcast & Squelch Controls -->
            <div class="p-3 bg-navy-950 border-t border-white/10 flex items-center gap-2">
              <input 
                id="intercom-text-input"
                type="text" 
                class="input-custom text-xs py-2.5 flex-1" 
                placeholder="${isIntercomListening ? 'Listening to voice... Speak now' : `Type or speak broadcast to #${activeChannel}...`}" 
                onkeydown="if (event.key === 'Enter') window.sendIntercomMsg();"
              />
              
              <!-- Voice Microphone Push-to-Talk Button -->
              <button 
                class="${isIntercomListening ? 'bg-red-500 text-white font-bold animate-pulse' : 'menu-btn-gold'} text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
                onclick="window.toggleIntercomVoice()"
                title="Tap to speak broadcast into Intercom"
              >
                ${getIcon('mic', 16)}
                <span>${isIntercomListening ? '⏹ Stop' : '🎙️ Speak'}</span>
              </button>

              <button class="btn-primary text-xs py-2 px-4 font-bold flex items-center gap-1" onclick="window.sendIntercomMsg()">
                <span>Broadcast</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  `;
}
