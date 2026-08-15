/**
 * HOTEL CAPITOL AI — AMARA: GUEST VOICE CONCIERGE & MODAL
 * 6 Animashaun Close, Ikeja, Lagos
 */

import { getIcon, renderIntercomRoundBadge } from '../assets/icons.js';
import { renderHotelCapitolLogo } from '../assets/logo.js';
import { store } from '../store/state.js';
import { aiEngine } from '../services/aiEngine.js';
import { automationEngine } from '../services/automationRules.js';

let isAssistantOpen = false;
let isRecording = false;
let currentContext = 'general';

export function initAIAssistant() {
  window.toggleAIAssistant = (forceOpen = null, triggerVoiceWelcome = true, context = 'general') => {
    isAssistantOpen = forceOpen !== null ? forceOpen : !isAssistantOpen;
    currentContext = context || 'general';
    renderAIAssistant();
    
    if (isAssistantOpen) {
      setTimeout(() => {
        const input = document.getElementById('ai-chat-input');
        if (input) input.focus();
        scrollChatToBottom();
      }, 100);

      // Automated Amara Voice Welcome if opening
      if (triggerVoiceWelcome) {
        aiEngine.startGuestVoiceWelcome(currentContext, () => {
          window.toggleAIVoiceInput();
        });
      }
    }
  };

  // 1-Click Amara Voice Concierge End-to-End Demo Runner
  window.runFullAIVoiceConciergeDemo = () => {
    window.toggleAIAssistant(true, false, 'general');
    
    const guest = store.getActiveGuest();
    const guestName = guest ? guest.name : 'Valued Guest';
    const welcome = `Good day, ${guestName}. Welcome to Hotel Capitol. I am Amara, your personal concierge. It is my pleasure to assist you. How may I make your stay more comfortable today?`;
    
    aiEngine.speak(welcome);
    automationEngine.showToast('🎙️ Amara Voice Concierge', welcome, 'info');

    // Guest makes multi-request after 3.2s
    setTimeout(() => {
      const guestText = "Please send 2 extra bath towels, cold bottled water and order Jollof rice for Suite " + (guest?.roomNumber || '402');
      window.sendAIMessage(guestText);
    }, 3500);
  };

  window.sendAIMessage = (customText = null) => {
    const input = document.getElementById('ai-chat-input');
    const text = customText || (input ? input.value.trim() : '');
    if (!text) return;

    if (input) input.value = '';

    const guest = store.getActiveGuest();
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Append user message
    const userMsg = { id: 'msg-' + Date.now(), sender: 'user', time: nowTime, text };
    
    store.setState(s => ({
      ...s,
      guests: s.guests.map(g => g.id === guest.id ? {
        ...g,
        aiConversations: [...(g.aiConversations || []), userMsg]
      } : g)
    }));

    renderAIAssistant();
    scrollChatToBottom();

    // Amara thinking & response
    setTimeout(() => {
      const response = aiEngine.processGuestQuery(text);
      const aiMsg = { 
        id: 'msg-' + (Date.now() + 1), 
        sender: 'ai', 
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }), 
        text: response.text,
        serviceRequest: response.serviceRequest,
        actionType: response.actionType
      };

      store.setState(s => ({
        ...s,
        guests: s.guests.map(g => g.id === guest.id ? {
          ...g,
          aiConversations: [...(g.aiConversations || []), aiMsg]
        } : g)
      }));

      renderAIAssistant();
      scrollChatToBottom();

      // Speak Amara's concise, composed voice response (1-3 sentences)
      const spokenText = response.voiceText || response.text;
      aiEngine.speak(spokenText);

      // Actionable contextual routing if appropriate
      if (response.actionType) {
        if (response.actionType === 'NAV_RESTAURANT') {
          setTimeout(() => { window.navigateGuestTab && window.navigateGuestTab('restaurant'); }, 1200);
        } else if (response.actionType === 'NAV_BREAKFAST') {
          setTimeout(() => { window.navigateGuestTab && window.navigateGuestTab('breakfast'); }, 1200);
        } else if (response.actionType === 'NAV_ROOM_SERVICE') {
          setTimeout(() => { window.navigateGuestTab && window.navigateGuestTab('room-service'); }, 1200);
        } else if (response.actionType === 'NAV_TRANSPORT') {
          setTimeout(() => { window.navigateGuestTab && window.navigateGuestTab('transport'); }, 1200);
        } else if (response.actionType === 'NAV_FOLIO') {
          setTimeout(() => { window.navigateGuestTab && window.navigateGuestTab('folio'); }, 1200);
        } else if (response.actionType === 'NAV_NEARBY') {
          setTimeout(() => { window.navigateGuestTab && window.navigateGuestTab('nearby'); }, 1200);
        } else if (response.actionType === 'NAV_INFO') {
          setTimeout(() => { window.navigateGuestTab && window.navigateGuestTab('info'); }, 1200);
        } else if (response.actionType === 'NAV_CONTACT') {
          setTimeout(() => { window.navigateGuestTab && window.navigateGuestTab('contact'); }, 1200);
        }
      }
    }, 400);
  };

  window.toggleAIVoiceInput = () => {
    if (isRecording) {
      aiEngine.stopListening();
      isRecording = false;
      renderAIAssistant();
    } else {
      isRecording = true;
      renderAIAssistant();
      aiEngine.listen(
        (transcript) => {
          isRecording = false;
          window.sendAIMessage(transcript);
        },
        () => {
          isRecording = false;
          renderAIAssistant();
        },
        (err) => {
          isRecording = false;
          automationEngine.showToast('Voice Notice', 'Speech recognition: ' + err, 'info');
          renderAIAssistant();
        }
      );
    }
  };

  renderAIAssistant();
}

function scrollChatToBottom() {
  const container = document.getElementById('ai-chat-messages');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

export function renderAIAssistant() {
  const root = document.getElementById('ai-assistant-root');
  if (!root) return;

  const state = store.getState();
  const guest = store.getActiveGuest();
  const messages = guest?.aiConversations || [];

  const quickChips = [
    '🍽 Order Smoky Jollof Fiesta',
    '☕ What time is breakfast?',
    '🛎 Bring 2 fresh bath towels',
    '🚕 Car to MMA2 Airport',
    '🧳 Help with my luggage',
    '🧾 What is my current balance?',
    '📶 What is the WiFi password?',
    '💈 Barber & nightlife near hotel'
  ];

  root.innerHTML = `
    <!-- Floating AI Trigger Button (Spherical Glowy Golden Lines, Modern AI Icon, Lemon Green Pulsing Dot) -->
    <button 
      class="floating-ai-btn" 
      onclick="window.toggleAIAssistant()"
      title="Ask Hotel Capitol AI (Amara)"
    >
      <span class="floating-ai-pulse" aria-label="Amara Online"></span>
      <!-- Modern Polished AI Neural Core Icon -->
      <div class="floating-ai-icon-wrapper">
        <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="modern-ai-icon">
          <defs>
            <linearGradient id="aiIconGoldLuster" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="25%" stop-color="#fff1b8"/>
              <stop offset="60%" stop-color="#ffd700"/>
              <stop offset="100%" stop-color="#c5a059"/>
            </linearGradient>
            <linearGradient id="aiSparkCore" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="100%" stop-color="#ffd700"/>
            </linearGradient>
          </defs>
          <!-- Central Diamond Neural Core -->
          <path d="M14 2.5 L16.8 10.2 L24.5 13 L16.8 15.8 L14 23.5 L11.2 15.8 L3.5 13 L11.2 10.2 Z" 
                fill="url(#aiIconGoldLuster)" stroke="#ffffff" stroke-width="0.8"/>
          <!-- Core Light Center -->
          <circle cx="14" cy="13" r="2.2" fill="#ffffff"/>
          <!-- Satellite Sparkles -->
          <path d="M21.5 4.5 L22.6 7.4 L25.5 8.5 L22.6 9.6 L21.5 12.5 L20.4 9.6 L17.5 8.5 L20.4 7.4 Z" fill="url(#aiSparkCore)"/>
          <path d="M6.5 16.5 L7.4 18.9 L9.8 19.8 L7.4 20.7 L6.5 23.1 L5.6 20.7 L3.2 19.8 L5.6 18.9 Z" fill="url(#aiSparkCore)"/>
        </svg>
      </div>
      <span class="floating-ai-text">Ask Hotel Capitol AI</span>
    </button>

    <!-- Amara AI Modal / Drawer -->
    ${isAssistantOpen ? `
      <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style="background: rgba(4, 9, 15, 0.88); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);">
        
        <div class="w-full sm:max-w-lg bg-navy-900 border border-gold rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden" style="height: 90vh; max-height: 680px; box-shadow: 0 10px 40px rgba(0,0,0,0.9), 0 0 35px rgba(197, 160, 89, 0.35);">
          
          <!-- Header (Amara Branding & Live Status) -->
          <div class="p-4 bg-navy-950 border-b border-gold flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-navy-950 font-black text-base shadow-md border border-white/30">
                A
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-serif text-sm font-bold text-white tracking-luxury">AMARA · CONCIERGE</h3>
                  <span class="badge-gold text-xs py-0.5 px-1.5 font-mono">Suite #${guest.roomNumber}</span>
                </div>
                <div class="text-xs text-gold-light opacity-90 flex items-center gap-1.5 mt-0.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Soft Nigerian Voice · 24/7 Personal Service</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-1">
              <button 
                class="btn-icon text-xs px-2 py-1 flex items-center gap-1 text-gold hover:text-white" 
                onclick="window.runFullAIVoiceConciergeDemo()"
                title="Run Voice Concierge Demo"
                style="border: 1px solid rgba(220, 173, 84, 0.4); border-radius: 6px;"
              >
                <span>⚡ Voice Demo</span>
              </button>
              <button class="btn-icon" style="width:34px; height:34px;" onclick="window.toggleAIAssistant(false)">
                ${getIcon('x', 18)}
              </button>
            </div>
          </div>

          <!-- Active Guest Context Bar -->
          <div class="px-4 py-2 bg-navy-850 border-b border-white/10 flex items-center justify-between text-xs text-slate-300">
            <div>
              Guest: <strong class="text-white">${guest.name}</strong> · ${guest.roomType}
            </div>
            <div class="text-gold font-semibold">
              Breakfast: ${guest.breakfastEntitlement}
            </div>
          </div>

          <!-- Chat Conversation Log -->
          <div id="ai-chat-messages" class="flex-1 p-4 overflow-y-auto flex flex-col gap-3" style="background: radial-gradient(circle at 50% 0%, #0d1e30 0%, #08111c 100%);">
            ${messages.map(msg => `
              <div class="flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}">
                <div class="max-w-[88%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-navy-950 font-semibold rounded-tr-none shadow-md' 
                    : 'glass-panel border border-gold/30 text-white rounded-tl-none shadow-md'
                }">
                  ${formatAIMarkdown(msg.text)}
                  
                  ${msg.serviceRequest ? `
                    <div class="mt-3 pt-2.5 border-t border-white/15 text-xs flex items-center justify-between gap-2">
                      <div class="flex items-center gap-1.5 text-gold-light">
                        <span>🎫</span>
                        <span>Ticket: <strong>${msg.serviceRequest.id}</strong> (${msg.serviceRequest.department})</span>
                      </div>
                      <span class="badge-normal text-[10px] px-1.5 py-0.5">Dispatched</span>
                    </div>
                  ` : ''}
                </div>
                <span class="text-[11px] text-slate-400 mt-1 px-1">${msg.time}</span>
              </div>
            `).join('')}

            ${isRecording ? `
              <div class="p-3.5 rounded-2xl border-2 border-emerald-400 flex items-center justify-between gap-3 shadow-2xl animate-fade-in" style="background: linear-gradient(135deg, rgba(6, 44, 28, 0.95) 0%, rgba(12, 28, 48, 0.95) 100%); box-shadow: 0 0 30px rgba(52, 211, 153, 0.45);">
                <div class="flex items-center gap-3">
                  <div class="relative flex items-center justify-center">
                    <span class="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping absolute"></span>
                    <span class="w-3 h-3 rounded-full bg-emerald-400 relative"></span>
                  </div>
                  <div>
                    <div class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span>🎙️ AMARA IS LISTENING — SPEAK NOW</span>
                    </div>
                    <div class="text-[11px] text-emerald-200 mt-0.5">Speak naturally in Nigerian English...</div>
                  </div>
                </div>
                <div class="voice-wave">
                  <span></span><span></span><span></span><span></span><span></span>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Quick Action Chips -->
          <div class="p-2.5 bg-navy-950/90 border-t border-white/5 overflow-x-auto flex items-center gap-2 whitespace-nowrap">
            ${quickChips.map(chip => `
              <button 
                class="demo-chip text-xs"
                onclick="window.sendAIMessage('${chip.replace(/['"]/g, '')}')"
              >
                ${chip}
              </button>
            `).join('')}
          </div>

          <!-- Input Footer -->
          <div class="p-3 bg-navy-950 border-t border-gold flex items-center gap-2">
            
            <!-- Voice Dictation Button -->
            <button 
              class="btn-icon ${isRecording ? 'border-2 border-emerald-400 bg-emerald-950 text-emerald-400 shadow-lg' : ''}" 
              style="${isRecording ? 'box-shadow: 0 0 20px rgba(52, 211, 153, 0.7);' : ''}"
              onclick="window.toggleAIVoiceInput()"
              title="${isRecording ? 'Listening active — click to stop' : 'Speak to Amara'}"
            >
              ${getIcon('mic', 18)}
            </button>

            <!-- Text Input -->
            <input 
              id="ai-chat-input"
              type="text" 
              class="input-custom flex-1 text-sm py-2.5"
              placeholder="${isRecording ? '🔴 Listening to your voice... Speak now' : 'Ask Amara anything or request a service...'}"
              onkeydown="if (event.key === 'Enter') window.sendAIMessage();"
            />

            <!-- Send Button -->
            <button 
              class="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-1"
              onclick="window.sendAIMessage()"
            >
              <span>Send</span>
              <span>→</span>
            </button>
          </div>

        </div>

      </div>
    ` : ''}
  `;
}

function formatAIMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-black/40 border border-gold/40 text-gold font-mono text-xs">$1</code>')
    .replace(/\n/g, '<br/>')
    .replace(/• (.*?)(<br\/>|$)/g, '<div class="flex items-start gap-1.5 my-1"><span class="text-gold">✦</span><span>$1</span></div>');
}

