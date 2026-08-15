/**
 * HOTEL CAPITOL AI — AMARA: GUEST VOICE CONCIERGE & SERVICE ORCHESTRATION ENGINE
 * 6 Animashaun Close, Ikeja, Lagos
 * Master AI Prompt, Voice Persona, 10 Service Workflows & Audio Alerts
 */

import { store } from '../store/state.js';

export class HotelCapitolAI {
  constructor() {
    this.speechSynth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.isListening = false;
    this.recognition = null;
    this.currentVoice = null;
    this.lastContext = 'general';
    this.clarificationAttempts = 0;
    this.upsellOffered = {}; // Tracks 1 upsell per session/order
    this.setupSpeechRecognition();
    this.setupVoiceSelection();
  }

  setupSpeechRecognition() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-NG'; // Nigerian English context
      }
    }
  }

  setupVoiceSelection() {
    if (!this.speechSynth) return;
    const loadVoices = () => {
      this.currentVoice = this.getNigerianFemaleVoice();
    };
    loadVoices();
    if (this.speechSynth.onvoiceschanged !== undefined) {
      this.speechSynth.onvoiceschanged = loadVoices;
    }
  }

  // Authentic Soft Female Nigerian English Voice Selector
  getNigerianFemaleVoice() {
    if (!this.speechSynth) return null;
    const voices = this.speechSynth.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. Prioritize official Nigerian English Female voices (e.g. en-NG, Ebele, Blessing, Nigeria)
    const ngFemale = voices.find(v => 
      (v.lang === 'en-NG' || v.lang === 'en_NG' || v.name.toLowerCase().includes('nigeria') || v.name.toLowerCase().includes('en-ng')) &&
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('ebele') || v.name.toLowerCase().includes('blessing') || !v.name.toLowerCase().includes('male'))
    );
    if (ngFemale) return ngFemale;

    // 2. Any en-NG voice
    const anyNg = voices.find(v => v.lang === 'en-NG' || v.lang === 'en_NG' || v.name.toLowerCase().includes('nigeria'));
    if (anyNg) return anyNg;

    // 3. African / Commonwealth warm female voices (en-ZA, en-GH, en-GB, en-KE)
    const regionalFemale = voices.find(v => 
      (v.lang.startsWith('en-ZA') || v.lang.startsWith('en-GB') || v.lang.startsWith('en-IE') || v.lang.startsWith('en-AU')) &&
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('victoria') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('karen') || v.name.toLowerCase().includes('moira'))
    );
    if (regionalFemale) return regionalFemale;

    // 4. Natural female English voice fallback
    const femaleFallback = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('karen') || v.name.toLowerCase().includes('hazel') || v.name.toLowerCase().includes('susan'))
    );
    return femaleFallback || voices.find(v => v.lang.startsWith('en')) || voices[0];
  }

  // Voice synthesis speaking out responses with Amara's acoustic profile (concise, warm, composed)
  speak(text, onEnd = null) {
    if (!this.speechSynth) {
      onEnd && onEnd();
      return;
    }
    const settings = store.getState().automationSettings;
    if (!settings.aiVoiceSynthesisEnabled) {
      onEnd && onEnd();
      return;
    }

    try {
      this.speechSynth.cancel();
      // Clean markdown and symbols for pure, natural acoustic diction
      const cleanText = text
        .replace(/[*#•_`]/g, '')
        .replace(/₦/g, 'Naira ')
        .replace(/Ext 0/gi, 'Extension zero')
        .replace(/MMA2/gi, 'M M A Two Airport');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voice = this.currentVoice || this.getNigerianFemaleVoice();
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.lang = 'en-NG';
      utterance.rate = 0.94;   // Calm, articulate pace
      utterance.pitch = 1.12;  // Soft, warm feminine pitch

      if (onEnd) {
        utterance.onend = () => { onEnd(); };
        utterance.onerror = () => { onEnd(); };
      }

      this.speechSynth.speak(utterance);
    } catch (e) {
      console.warn('Amara Speech Synthesis exception:', e);
      onEnd && onEnd();
    }
  }

  // Start voice dictation
  listen(onResult, onEnd, onError) {
    if (!this.recognition) {
      onError && onError('Speech recognition not supported in this browser. Please use text input.');
      return;
    }

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult && onResult(transcript);
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      onError && onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd && onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition start exception:', e);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Section 3 & 20/21: Dynamic Context-Aware Core Greeting
  getGreeting(context = null) {
    const guest = store.getActiveGuest();
    const guestName = guest ? guest.name : 'Valued Guest';
    const hour = new Date().getHours();
    
    // 1. Context-Aware Card Intercom Greetings
    if (context === 'restaurant') {
      return `Hello, ${guestName}. I see you're exploring our dining options. How may I assist you with your order?`;
    } else if (context === 'breakfast') {
      return `Good morning, ${guestName}. I see you're arranging breakfast. Would you like me to assist you with your selection?`;
    } else if (context === 'room-service' || context === 'housekeeping') {
      return `I'm here to assist with your room, ${guestName}. Would you like to request housekeeping, fresh towels, or another room amenity?`;
    } else if (context === 'transport') {
      return `I'd be happy to assist with your transportation arrangements, ${guestName}. Where would you like to go?`;
    } else if (context === 'concierge') {
      return `Good day, ${guestName}. Your concierge team is at your service. What may I arrange for you?`;
    } else if (context === 'folio') {
      return `I can help you review your current Hotel Capitol folio, ${guestName}. What would you like to know?`;
    } else if (context === 'nearby') {
      return `Certainly, ${guestName}. I can help you discover places and services around Hotel Capitol.`;
    } else if (context === 'info') {
      return `I'd be delighted to help you with information about Hotel Capitol's facilities and amenities, ${guestName}.`;
    } else if (context === 'contact') {
      return `Certainly, ${guestName}. I'll help you contact our front desk team.`;
    }

    // 2. Standard Time-Adjusted Greetings
    if (hour < 12) {
      return `Good morning, ${guestName}. Welcome to Hotel Capitol. I'm Amara, your personal concierge. It is my pleasure to assist you this morning. How may I help you?`;
    } else if (hour < 17) {
      return `Good afternoon, ${guestName}. Welcome back. I'm Amara, your Hotel Capitol concierge. How may I assist you this afternoon?`;
    } else {
      return `Good evening, ${guestName}. I'm Amara, your Hotel Capitol concierge. It is my pleasure to assist you this evening. What may I arrange for you?`;
    }
  }

  // Automated Voice Welcome when Guest launches Amara
  startGuestVoiceWelcome(context = null, onSpeechReady = null) {
    this.lastContext = context || 'general';
    const welcomeText = this.getGreeting(context);
    const guest = store.getActiveGuest();
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Append greeting to conversation if brand new or context switched
    if (guest) {
      const welcomeMsg = { id: 'msg-' + Date.now(), sender: 'ai', time: nowTime, text: welcomeText };
      store.setState(s => ({
        ...s,
        guests: s.guests.map(g => g.id === guest.id ? {
          ...g,
          aiConversations: [...(g.aiConversations || []), welcomeMsg]
        } : g)
      }));
    }

    // Speak welcome prompt and trigger listening when finished
    this.speak(welcomeText, () => {
      if (typeof window !== 'undefined' && window.hotelCapitolAutomation) {
        window.hotelCapitolAutomation.playChime('listen-start');
      }
      onSpeechReady && onSpeechReady();
    });
  }

  // Section 23: Multi-Intent Parser & Service Orchestrator
  processGuestQuery(userQuery) {
    const state = store.getState();
    const guest = store.getActiveGuest();
    const q = userQuery.toLowerCase().trim();
    const guestName = guest ? guest.name : 'Guest';
    const roomNumber = guest ? guest.roomNumber : '402';

    let response = {
      text: '',
      voiceText: '',
      actionType: null,
      actionPayload: null,
      serviceRequest: null,
      secondaryRequests: []
    };

    // --- Section 34: GUEST FRUSTRATION PROTOCOL ---
    if (q.includes('frustrat') || q.includes('angry') || q.includes('annoyed') || q.includes('stupid') || q.includes('useless') || q.includes('terrible') || q.includes('bad service')) {
      const resp = `I'm sorry this has been frustrating, ${guestName}. Let me make this easier for you. I can connect you directly with our Hotel Capitol team, or I can continue assisting you here. Which would you prefer?`;
      response.text = resp;
      response.voiceText = resp;
      response.actionType = 'NAV_CONTACT';
      return response;
    }

    // --- Section 31: THANK YOU HANDLING ---
    if (q === 'thank you' || q === 'thanks' || q === 'thank you amara' || q === 'thanks amara' || q === 'appreciate it') {
      const responses = [
        `It is my pleasure, ${guestName}. Please let me know if there is anything else I may arrange for you.`,
        `You're most welcome, ${guestName}. I'm always happy to assist you.`,
        `My pleasure. I am here whenever you need me during your stay at Hotel Capitol.`
      ];
      const resp = responses[Math.floor(Math.random() * responses.length)];
      response.text = resp;
      response.voiceText = resp;
      return response;
    }

    // --- Section 30: IF GUEST SAYS NO ---
    if (q === 'no' || q === 'no thanks' || q === 'nope' || q === 'not now' || q === 'leave it') {
      const resp = `Of course, ${guestName}. No problem at all. Your current request will remain unchanged. Please let me know if you need anything else.`;
      response.text = resp;
      response.voiceText = resp;
      return response;
    }

    // --- Section 33: HUMAN HANDOFF ---
    if (q.includes('human') || q.includes('speak to reception') || q.includes('talk to someone') || q.includes('manager') || q.includes('front desk') || q.includes('operator')) {
      const resp = `Certainly, ${guestName}. I am connecting you directly with the Hotel Capitol Front Desk team now.`;
      response.text = `Certainly, ${guestName}. I am connecting you directly with the **Hotel Capitol Front Desk** team (Extension 0 / Reception Supervisor Tariq). A staff member is on standby to assist you.`;
      response.voiceText = resp;
      response.actionType = 'NAV_CONTACT';
      
      if (typeof window !== 'undefined' && window.openDirectIntercomCall) {
        setTimeout(() => {
          window.openDirectIntercomCall('concierge-frontdesk', 'Front Desk Reception', 'Supervisor Tariq');
        }, 1200);
      }
      return response;
    }

    // --- Section 23: MULTI-REQUEST DETECTION ---
    const isMultiRequest = (q.includes(' and ') || q.includes(' also ') || q.includes(' then ')) && 
      (q.includes('breakfast') || q.includes('towel') || q.includes('taxi') || q.includes('water') || q.includes('clean') || q.includes('food'));

    if (isMultiRequest) {
      const createdRequests = [];

      // Check sub-intents
      if (q.includes('breakfast')) {
        createdRequests.push(store.createServiceRequest('Kitchen & F&B', 'Gourmet Breakfast Service', `Multi-Intent Request: Breakfast for Suite #${roomNumber}`, 'NORMAL', 'Chef Babatunde Adele', 'Kitchen'));
      }
      if (q.includes('towel') || q.includes('water') || q.includes('clean') || q.includes('housekeeping')) {
        const itemTitle = q.includes('towel') ? 'Fresh Luxury Towels' : q.includes('water') ? 'Bottled Spring Water' : 'Suite Refresh';
        createdRequests.push(store.createServiceRequest('Housekeeping', itemTitle, `Multi-Intent Request: ${itemTitle} for Suite #${roomNumber}`, 'HIGH', 'Amara Nwosu', 'Housekeeping'));
      }
      if (q.includes('taxi') || q.includes('airport') || q.includes('transport') || q.includes('car')) {
        createdRequests.push(store.createServiceRequest('Concierge', 'VIP Chauffeur Transfer', `Multi-Intent Request: Airport Transit for Suite #${roomNumber}`, 'HIGH', 'Ibrahim Bello', 'Concierge'));
      }

      if (createdRequests.length > 1) {
        const summary = createdRequests.map(r => `• **${r.title}** (${r.department} - ${r.id})`).join('\n');
        const voiceResp = `Certainly, ${guestName}. I have arranged each of your requests for Suite ${roomNumber}, and notified the responsible hotel departments.`;
        
        response.text = `Certainly, ${guestName}. I have organized your requests and dispatched tickets to the respective departments:\n${summary}\n\nOur team is attending to each one promptly.`;
        response.voiceText = voiceResp;
        response.serviceRequest = createdRequests[0];
        response.secondaryRequests = createdRequests.slice(1);
        response.actionType = 'SERVICE_CREATED';

        if (typeof window !== 'undefined' && window.hotelCapitolAutomation) {
          window.hotelCapitolAutomation.showToast('✅ Multi-Service Dispatched', `${createdRequests.length} requests confirmed and sent to staff departments.`, 'success');
        }
        return response;
      }
    }

    // --- Section 7 & 8 & 9: RESTAURANT & DINING ---
    if (q.includes('food') || q.includes('menu') || q.includes('hungry') || q.includes('dinner') || q.includes('lunch') || q.includes('restaurant') || q.includes('order') || q.includes('jollof') || q.includes('suya') || q.includes('soup') || q.includes('drink') || q.includes('chapman') || q.includes('sandwich') || q.includes('eat')) {
      const itemTitle = q.includes('suya') ? 'Prime Grilled Suya Platter' : q.includes('jollof') ? 'Capitol Smoky Jollof Fiesta' : q.includes('chapman') ? 'Hotel Capitol Signature Chapman' : 'Gourmet In-Room Dining Order';
      
      const newReq = store.createServiceRequest(
        'Kitchen & F&B',
        itemTitle,
        `Guest Order via Amara: "${userQuery}" for Suite #${roomNumber}`,
        'HIGH',
        'Chef Babatunde Adele',
        'Kitchen'
      );

      // Section 8: 1 Complementary Suggestion / Upsell Logic
      let upsellText = '';
      let voiceUpsell = '';
      if (!this.upsellOffered[roomNumber] && !q.includes('chapman') && !q.includes('drink')) {
        this.upsellOffered[roomNumber] = true;
        upsellText = `\n\n💡 *Would you like to add a refreshing Hotel Capitol Signature Chapman or dessert to your order?*`;
        voiceUpsell = ` Would you like to add a refreshing drink or dessert?`;
      }

      const voiceResp = `Thank you, ${guestName}. I have received your order for ${itemTitle} and confirmed it with our kitchen. Estimated preparation time is ${newReq.targetMinutes} minutes.${voiceUpsell}`;
      
      response.text = `Thank you, ${guestName}. I have received your order for **${itemTitle}** for Suite **#${roomNumber}**. I have confirmed it with **Executive Chef Babatunde** (**${newReq.id}**). Estimated preparation time is **${newReq.targetMinutes} minutes**.${upsellText}`;
      response.voiceText = voiceResp;
      response.actionType = 'SERVICE_CREATED';
      response.actionPayload = newReq;
      response.serviceRequest = newReq;
      
      if (typeof window !== 'undefined' && window.hotelCapitolAutomation) {
        window.hotelCapitolAutomation.showToast('🍽️ Kitchen Alert Dispatched', `Attention: New restaurant order from Room ${roomNumber}.`, 'success');
        window.hotelCapitolAutomation.triggerStaffVoiceDispatch(newReq);
      }
      return response;
    }

    // --- Section 10: BREAKFAST SERVICE ---
    if (q.includes('breakfast') || q.includes('morning meal') || q.includes('pancake') || q.includes('tea') || q.includes('coffee') || q.includes('egg')) {
      const isFree = guest?.breakfastEntitlement === 'Complimentary';
      
      const newReq = store.createServiceRequest(
        'Kitchen & F&B',
        'Daily Gourmet Breakfast Service',
        `Guest Breakfast Request via Amara: "${userQuery}" for Suite #${roomNumber}`,
        'NORMAL',
        'Chef Babatunde Adele',
        'Kitchen'
      );

      const voiceResp = `Thank you, ${guestName}. Your breakfast request for Suite ${roomNumber} has been confirmed with our kitchen for prompt delivery.`;
      
      response.text = `Thank you, ${guestName}. I have logged your breakfast request for Suite **#${roomNumber}** (` + (isFree ? 'Complimentary' : 'Standard Folio') + `) and confirmed it with **Executive Chef Babatunde** (**${newReq.id}**). Delivery window is active between **06:00 AM and 10:00 AM**.`;
      response.voiceText = voiceResp;
      response.actionType = 'SERVICE_CREATED';
      response.actionPayload = newReq;
      response.serviceRequest = newReq;

      if (typeof window !== 'undefined' && window.hotelCapitolAutomation) {
        window.hotelCapitolAutomation.showToast('☕ Breakfast Confirmed', `Dispatched to Kitchen for Suite #${roomNumber}.`, 'success');
        window.hotelCapitolAutomation.triggerStaffVoiceDispatch(newReq);
      }
      return response;
    }

    // --- Section 11: ROOM SERVICE & CLEANING ---
    if (q.includes('clean') || q.includes('towel') || q.includes('toilet') || q.includes('sheet') || q.includes('linen') || q.includes('insecticide') || q.includes('room service') || q.includes('housekeeping') || q.includes('water') || q.includes('pillow') || q.includes('soap')) {
      let targetDept = 'Housekeeping';
      let targetStaff = 'Amara Nwosu';
      let reqTitle = 'Extra Fresh Bath Towels & Room Refresh';

      if (q.includes('water')) {
        reqTitle = 'Chilled Premium Bottled Spring Water (2 Bottles)';
      } else if (q.includes('clean') || q.includes('housekeeping')) {
        reqTitle = 'Full Suite Deep Cleaning & Turn-Down';
      } else if (q.includes('linen') || q.includes('sheet') || q.includes('bed')) {
        reqTitle = 'Fresh Egyptian Cotton Linen Change';
      } else if (q.includes('pillow')) {
        reqTitle = 'Extra Orthopedic Luxury Pillows';
      } else if (q.includes('toilet') || q.includes('soap')) {
        reqTitle = 'Premium Botanical Toiletries Kit';
      }

      const newReq = store.createServiceRequest(
        targetDept,
        reqTitle,
        `Guest Housekeeping Request via Amara: "${userQuery}" for Suite #${roomNumber}`,
        'HIGH',
        targetStaff,
        targetDept
      );

      const voiceResp = `Certainly, ${guestName}. I have arranged ${reqTitle} for Suite ${roomNumber}. Our housekeeping team will attend to your room shortly.`;
      
      response.text = `Certainly, ${guestName}. Your housekeeping ticket **${newReq.id}** for **${reqTitle}** has been dispatched to designated attendant **${targetStaff}**. Target delivery: **${newReq.targetMinutes} minutes**.`;
      response.voiceText = voiceResp;
      response.actionType = 'SERVICE_CREATED';
      response.actionPayload = newReq;
      response.serviceRequest = newReq;

      if (typeof window !== 'undefined' && window.hotelCapitolAutomation) {
        window.hotelCapitolAutomation.showToast('🛎️ Housekeeping Dispatched', `Attendant ${targetStaff} is attending to Suite #${roomNumber}.`, 'success');
        window.hotelCapitolAutomation.triggerStaffVoiceDispatch(newReq);
      }
      return response;
    }

    // --- Section 12: VIP TRANSPORTATION ---
    if (q.includes('airport') || q.includes('taxi') || q.includes('transport') || q.includes('car') || q.includes('driver') || q.includes('uber') || q.includes('ride') || q.includes('mma2') || q.includes('flight') || q.includes('transfer')) {
      const newReq = store.createServiceRequest(
        'Concierge',
        'VIP Chauffeur Transfer (MMA2 Airport / Island)',
        `Guest Transit Request via Amara: "${userQuery}" for Suite #${roomNumber}`,
        'HIGH',
        'Ibrahim Bello',
        'Concierge'
      );

      const voiceResp = `Certainly, ${guestName}. I have submitted your VIP transportation request to Lead Concierge Ibrahim Bello. Our team will confirm vehicle and pickup details shortly.`;
      
      response.text = `Certainly, ${guestName}. I have submitted your **VIP Chauffeur Transfer** request (**${newReq.id}**) to **Lead Concierge Ibrahim Bello**. Our transportation team will confirm availability and driver details with you shortly.`;
      response.voiceText = voiceResp;
      response.actionType = 'SERVICE_CREATED';
      response.actionPayload = newReq;
      response.serviceRequest = newReq;

      if (typeof window !== 'undefined' && window.hotelCapitolAutomation) {
        window.hotelCapitolAutomation.showToast('🚕 VIP Transit Dispatched', `Coordinating with Lead Concierge Ibrahim Bello.`, 'success');
        window.hotelCapitolAutomation.triggerStaffVoiceDispatch(newReq);
      }
      return response;
    }

    // --- Section 13: CONCIERGE & PORTER ---
    if (q.includes('bag') || q.includes('luggage') || q.includes('porter') || q.includes('bell') || q.includes('carry') || q.includes('wake up') || q.includes('recommendation')) {
      const reqTitle = q.includes('wake') ? 'Scheduled Wake-up Call' : 'Porter Luggage & Bell Service';
      
      const newReq = store.createServiceRequest(
        'Concierge',
        reqTitle,
        `Guest Porter Assistance via Amara: "${userQuery}" for Suite #${roomNumber}`,
        'HIGH',
        'Ibrahim Bello',
        'Concierge'
      );

      const voiceResp = `Certainly, ${guestName}. I'll arrange porter assistance for you. A member of our team will attend to Room ${roomNumber} shortly.`;
      
      response.text = `Certainly, ${guestName}. I have notified our porter team that **${reqTitle}** is requested for Suite **#${roomNumber}** (**${newReq.id}**). Lead Concierge Ibrahim Bello is dispatching a team member now.`;
      response.voiceText = voiceResp;
      response.actionType = 'SERVICE_CREATED';
      response.actionPayload = newReq;
      response.serviceRequest = newReq;

      if (typeof window !== 'undefined' && window.hotelCapitolAutomation) {
        window.hotelCapitolAutomation.showToast('🧳 Porter Assistance Dispatched', `Porter assistance requested from Room ${roomNumber}.`, 'success');
        window.hotelCapitolAutomation.triggerStaffVoiceDispatch(newReq);
      }
      return response;
    }

    // --- Section 14: MY BILL & FOLIO ---
    if (q.includes('bill') || q.includes('folio') || q.includes('charge') || q.includes('pay') || q.includes('cost') || q.includes('invoice') || q.includes('receipt') || q.includes('balance') || q.includes('spent') || q.includes('owe')) {
      const folioItems = guest?.folio || [];
      const totalFolio = folioItems.reduce((sum, item) => sum + item.amount, 0);

      // Dispute handling
      if (q.includes('dispute') || q.includes('wrong') || q.includes('mistake') || q.includes('unfamiliar') || q.includes('overcharged')) {
        const resp = `I'm sorry that a charge appears unfamiliar, ${guestName}. I have flagged this item for our Front Desk Supervisor Tariq to review with you.`;
        response.text = `I'm sorry that a charge appears unfamiliar, ${guestName}. I have flagged this item for our Front Desk team to review immediately. A duty supervisor will contact Suite #${roomNumber} to clarify.`;
        response.voiceText = resp;
        response.actionType = 'NAV_FOLIO';
        return response;
      }

      const voiceResp = `Your current outstanding balance is Naira ${totalFolio.toLocaleString()}. I have displayed your itemized folio for you to review.`;
      
      response.text = `Certainly, ${guestName}. Your current outstanding balance for Suite **#${roomNumber}** is **₦${totalFolio.toLocaleString()}** across ${folioItems.length} posted transactions:\n` +
        folioItems.map(f => `• ${f.description}: **₦${f.amount.toLocaleString()}** (${f.date})`).join('\n') +
        `\n\nYou can review full tax invoices in your Digital Folio.`;
      response.voiceText = voiceResp;
      response.actionType = 'NAV_FOLIO';
      return response;
    }

    // --- Section 17: NEAR HOTEL CAPITOL (IKEJA GUIDE) ---
    if (q.includes('barber') || q.includes('salon') || q.includes('hair') || q.includes('supermarket') || q.includes('shop') || q.includes('mall') || q.includes('nightlife') || q.includes('club') || q.includes('shrine') || q.includes('nearby') || q.includes('ikeja') || q.includes('around') || q.includes('hospital') || q.includes('pharmacy') || q.includes('atm')) {
      const voiceResp = `I'd be happy to help, ${guestName}. Here are Hotel Capitol approved recommendations in Ikeja around Animashaun Close.`;
      
      response.text = `Here are Hotel Capitol approved recommendations in Ikeja for you, ${guestName}:\n` +
        `• 💈 **Grooming**: *Karisma Executive Barber* (0.4 km away · Open till 9 PM)\n` +
        `• 🛒 **Shopping**: *Ikeja Supermart & Gourmet Deli* (0.3 km away)\n` +
        `• 🍸 **Nightlife**: *The Capitol Penthouse Lounge* (5th Floor) or *Cubana Lounge* (1.8 km)\n` +
        `• 🎷 **Culture**: *Kalakuta Fela Museum & Shrine* (2.5 km)\n` +
        `• 🏥 **Medical & Pharmacy**: *Ikeja Medical Center & HealthPlus* (0.8 km)\n` +
        `Opening the Nearby Ikeja Guide now.`;
      response.voiceText = voiceResp;
      response.actionType = 'NAV_NEARBY';
      return response;
    }

    // --- Section 18: HOTEL AMENITIES & WIFI ---
    if (q.includes('wifi') || q.includes('password') || q.includes('gym') || q.includes('pool') || q.includes('swimming') || q.includes('fitness') || q.includes('spa') || q.includes('address') || q.includes('amenities') || q.includes('checkin') || q.includes('checkout') || q.includes('time')) {
      const voiceResp = `Certainly, ${guestName}. I have displayed the Hotel Capitol WiFi credentials and hotel facility hours on your screen.`;
      
      response.text = `**Hotel Capitol Amenities & Facilities Information**:\n` +
        `• 📶 **High-Speed WiFi**: Network: \`Capitol-VIP-Guest\` | Password: \`CapitolLagos2026\`\n` +
        `• 🏊 **Swimming Pool & Cabana**: Open daily 06:30 AM – 10:00 PM (1st Floor Terrace)\n` +
        `• 🏋️ **Executive Fitness Center**: Open 24/7 (2nd Floor, keycard access)\n` +
        `• 📍 **Hotel Address**: 6 Animashaun Close, Ikeja, Lagos\n` +
        `• 🕒 **Check-In**: 02:00 PM | **Check-Out**: 12:00 PM\n` +
        `• 📞 **Front Desk**: Dial Extension 0 from Suite #${roomNumber}`;
      response.voiceText = voiceResp;
      response.actionType = 'NAV_INFO';
      return response;
    }

    // --- Section 32: CLARIFICATION & GRACEFUL FALLBACK ---
    this.clarificationAttempts++;
    if (this.clarificationAttempts >= 2) {
      const voiceResp = `I want to make sure I assist you correctly, ${guestName}. Would you like me to connect you with our front desk team?`;
      response.text = `I want to make sure I assist you correctly, ${guestName}. Would you like me to connect you directly with our Front Desk team at Extension 0?`;
      response.voiceText = voiceResp;
      response.actionType = 'NAV_CONTACT';
      this.clarificationAttempts = 0;
      return response;
    }

    const fallbackVoice = `I'd be delighted to help, ${guestName}. Could you please tell me a little more about what you'd like arranged?`;
    response.text = `I'd be delighted to help, ${guestName}. Could you please tell me a little more about what you'd like arranged for Suite #${roomNumber}? You can also select any service card below or speak directly to Front Desk.`;
    response.voiceText = fallbackVoice;
    return response;
  }

  // Generate dynamic AI Insights for General Manager & Supervisors
  getManagerInsights() {
    const state = store.getState();
    const lowStockItems = state.inventory.filter(i => i.status !== 'NORMAL');

    return [
      {
        id: 'INS-01',
        type: 'revenue',
        title: 'Dining & Room Service Surge',
        impact: '+18.4% Revenue',
        detail: `Restaurant orders have generated ₦${state.orders.reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString()} today. Signature Jollof Fiesta & Chapman are top sellers.`,
        action: 'Kitchen team prepared for evening dinner rush.'
      },
      {
        id: 'INS-02',
        type: 'workload',
        title: 'Housekeeping Peak Velocity',
        impact: 'High Efficiency (96% On-time)',
        detail: `Housekeeping staff turned around 4 suites with an average duration of 21 minutes. Peak workload forecasted between 09:00 AM and 11:30 AM.`,
        action: 'Sufficient linens currently in circulation.'
      },
      {
        id: 'INS-03',
        type: 'inventory',
        title: `${lowStockItems.length} Inventory Items Require Replenishment`,
        impact: 'Critical Stock Alert',
        detail: `Cooking Oil (20% remaining) and Room Insecticide Spray (7.5% remaining) have breached reorder thresholds.`,
        action: '1 stock request pending manager approval.'
      }
    ];
  }
}

export const aiEngine = new HotelCapitolAI();
window.hotelCapitolAI = aiEngine;

