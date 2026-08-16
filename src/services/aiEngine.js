/**
 * HOTEL CAPITOL AI — TOLANI: ISOLATED FINITE-STATE MACHINE & SERVICE ORCHESTRATION ENGINE
 * 6 Animashaun Close, Ikeja, Lagos
 * 
 * CORE PRINCIPLE:
 * TOLANI LISTENS → UNDERSTANDS → OPENS REAL UI → GUEST SELECTS → REVIEW → CONFIRM → DISPATCH → REAL BACKEND STATUS
 */

import { store } from '../store/state.js';
import { learningEngine } from './learningEngine.js';

// Central Tolani UI Action Constants
export const AMARA_ACTIONS = {
  OPEN_RESTAURANT_MENU: 'OPEN_RESTAURANT_MENU',
  OPEN_ORDER_TRACKER: 'OPEN_ORDER_TRACKER',
  OPEN_BREAKFAST_MENU: 'OPEN_BREAKFAST_MENU',
  OPEN_DRINKS: 'OPEN_DRINKS',
  OPEN_SNACKS: 'OPEN_SNACKS',
  OPEN_DESSERTS: 'OPEN_DESSERTS',
  OPEN_EXTRAS: 'OPEN_EXTRAS',
  OPEN_PORTER_OPTIONS: 'OPEN_PORTER_OPTIONS',
  OPEN_CONCIERGE_OPTIONS: 'OPEN_CONCIERGE_OPTIONS',
  OPEN_TRANSPORTATION_OPTIONS: 'OPEN_TRANSPORTATION_OPTIONS',
  OPEN_HOUSEKEEPING_OPTIONS: 'OPEN_HOUSEKEEPING_OPTIONS',
  OPEN_FOLIO: 'OPEN_FOLIO',
  OPEN_AMENITIES: 'OPEN_AMENITIES',
  OPEN_NEARBY: 'OPEN_NEARBY',
  OPEN_FRONT_DESK: 'OPEN_FRONT_DESK',
  SHOW_ORDER_SUMMARY: 'SHOW_ORDER_SUMMARY',
  SHOW_REQUEST_SUMMARY: 'SHOW_REQUEST_SUMMARY',
  ADD_ITEM_TO_DRAFT: 'ADD_ITEM_TO_DRAFT',
  REMOVE_ITEM_FROM_DRAFT: 'REMOVE_ITEM_FROM_DRAFT',
  SUBMIT_REQUEST: 'SUBMIT_REQUEST'
};

export const TOLANI_ACTIONS = AMARA_ACTIONS;

// Isolated Service Keys
export const SERVICES = {
  GENERAL: 'GENERAL',
  RESTAURANT: 'RESTAURANT',
  BREAKFAST: 'BREAKFAST',
  HOUSEKEEPING: 'HOUSEKEEPING',
  CONCIERGE_PORTER: 'CONCIERGE_PORTER',
  VIP_TRANSPORTATION: 'VIP_TRANSPORTATION',
  FOLIO: 'FOLIO',
  AMENITIES: 'AMENITIES',
  NEAR_HOTEL: 'NEAR_HOTEL',
  FRONT_DESK: 'FRONT_DESK'
};

// Conversation Lifecycle States
export const CONV_STATES = {
  IDLE: 'IDLE',
  ACTIVATED: 'ACTIVATED',
  GREETING: 'GREETING',
  LISTENING: 'LISTENING',
  UNDERSTANDING: 'UNDERSTANDING',
  SHOWING_OPTIONS: 'SHOWING_OPTIONS',
  COLLECTING_SELECTION: 'COLLECTING_SELECTION',
  REVIEWING: 'REVIEWING',
  AWAITING_CONFIRMATION: 'AWAITING_CONFIRMATION',
  SUBMITTING: 'SUBMITTING',
  WAITING_FOR_DEPARTMENT: 'WAITING_FOR_DEPARTMENT',
  IN_PROGRESS: 'IN_PROGRESS',
  READY: 'READY',
  COMPLETED: 'COMPLETED'
};

// --- CENTRALIZED TOLANI VOICE CONFIGURATION ---
export const TOLANI_VOICE_CONFIG = {
  voiceName: 'Tolani (Hotel Capitol AI Concierge)',
  gender: 'female',
  locale: 'en-NG',
  preferredLocales: ['en-NG', 'en_NG', 'en-GB', 'en-ZA', 'en-IE'],
  rate: 0.93,
  pitch: 1.08,
  volume: 1.0
};

export class HotelCapitolAI {
  constructor() {
    this.speechSynth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.isListening = false;
    this.recognition = null;
    this.currentVoice = null;
    this.speechQueue = [];
    this.isSpeaking = false;
    
    // Explicit Isolated Service Context Object
    this.context = {
      currentGuest: 'Chief Adeleke Babalola',
      currentRoom: '402',
      currentCard: 'General Portal',
      currentService: SERVICES.GENERAL,
      currentIntent: null,
      currentRequest: null,
      currentRequestId: null,
      currentDepartment: 'FRONT_DESK',
      currentStatus: 'IDLE',
      conversationState: CONV_STATES.IDLE
    };

    this.upsellOffered = {}; // Tracks 1 upsell per dining session
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
        this.recognition.lang = 'en-NG'; // Nigerian English
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

  getNigerianFemaleVoice() {
    if (!this.speechSynth) return null;
    const voices = this.speechSynth.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. Official en-NG female voice
    const ngFemale = voices.find(v => 
      (v.lang === 'en-NG' || v.lang === 'en_NG' || v.name.toLowerCase().includes('nigeria')) &&
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('ebele') || v.name.toLowerCase().includes('blessing') || !v.name.toLowerCase().includes('male'))
    );
    if (ngFemale) return ngFemale;

    // 2. Any en-NG
    const anyNg = voices.find(v => v.lang === 'en-NG' || v.lang === 'en_NG' || v.name.toLowerCase().includes('nigeria'));
    if (anyNg) return anyNg;

    // 3. African / Commonwealth warm female
    const regionalFemale = voices.find(v => 
      (v.lang.startsWith('en-ZA') || v.lang.startsWith('en-GB') || v.lang.startsWith('en-IE') || v.lang.startsWith('en-AU')) &&
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('victoria') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('karen'))
    );
    if (regionalFemale) return regionalFemale;

    // 4. Fallback female
    const femaleFallback = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('hazel'))
    );
    return femaleFallback || voices.find(v => v.lang.startsWith('en')) || voices[0];
  }

  speak(text, onEnd = null, options = { cancelPrevious: true }) {
    if (!this.speechSynth) {
      onEnd && onEnd();
      return;
    }
    const settings = store.getState().automationSettings;
    if (settings && settings.aiVoiceSynthesisEnabled === false) {
      onEnd && onEnd();
      return;
    }

    try {
      if (options.cancelPrevious !== false) {
        this.speechSynth.cancel();
      }

      const cleanText = text
        .replace(/[*#•_`]/g, '')
        .replace(/₦/g, 'Naira ')
        .replace(/Ext 0/gi, 'Extension zero')
        .replace(/MMA2/gi, 'M M A Two Airport')
        .replace(/MMA1/gi, 'M M A One Airport')
        .replace(/MMIA/gi, 'M M I A International Airport');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voice = this.currentVoice || this.getNigerianFemaleVoice();
      if (voice) utterance.voice = voice;
      
      utterance.lang = TOLANI_VOICE_CONFIG.locale;
      utterance.rate = TOLANI_VOICE_CONFIG.rate;
      utterance.pitch = TOLANI_VOICE_CONFIG.pitch;
      utterance.volume = TOLANI_VOICE_CONFIG.volume;

      this.isSpeaking = true;

      utterance.onend = () => { 
        this.isSpeaking = false;
        onEnd && onEnd(); 
      };
      utterance.onerror = () => { 
        this.isSpeaking = false;
        onEnd && onEnd(); 
      };

      this.speechSynth.speak(utterance);
    } catch (e) {
      console.warn('Tolani Speech Synthesis exception:', e);
      this.isSpeaking = false;
      onEnd && onEnd();
    }
  }

  speakSequence(texts = [], onComplete = null) {
    if (!texts || texts.length === 0) {
      onComplete && onComplete();
      return;
    }
    const [first, ...rest] = texts;
    this.speak(first, () => {
      if (rest.length > 0) {
        setTimeout(() => {
          this.speakSequence(rest, onComplete);
        }, 300);
      } else {
        onComplete && onComplete();
      }
    }, { cancelPrevious: true });
  }

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

  // --- SERVICE ISOLATION & CONTEXT INITIALIZATION ---

  /**
   * Sets the active isolated service context when guest clicks an Intercom or card AI trigger.
   * Completely resets any prior foreign service state.
   */
  setServiceContext(serviceKey = SERVICES.GENERAL, cardTitle = 'General Portal') {
    const guest = store.getActiveGuest();
    const guestName = guest ? guest.name : 'Valued Guest';
    const roomNumber = guest ? guest.roomNumber : '402';

    let department = 'FRONT_DESK';
    if (serviceKey === SERVICES.RESTAURANT || serviceKey === SERVICES.BREAKFAST) {
      department = 'KITCHEN';
    } else if (serviceKey === SERVICES.HOUSEKEEPING) {
      department = 'HOUSEKEEPING';
    } else if (serviceKey === SERVICES.CONCIERGE_PORTER) {
      department = 'PORTER';
    } else if (serviceKey === SERVICES.VIP_TRANSPORTATION) {
      department = 'TRANSPORTATION';
    }

    this.context = {
      currentGuest: guestName,
      currentRoom: roomNumber,
      currentCard: cardTitle,
      currentService: serviceKey,
      currentIntent: null,
      currentRequest: null,
      currentRequestId: null,
      currentDepartment: department,
      currentStatus: 'IDLE',
      conversationState: CONV_STATES.ACTIVATED
    };

    return this.context;
  }

  // --- GREETING ENGINE (Context-Aware, Luxury Concierge Delivery) ---
  getGreetingForContext(serviceKey = null) {
    const guest = store.getActiveGuest();
    const guestName = guest ? guest.name : 'Valued Guest';
    const hour = new Date().getHours();
    const s = serviceKey || this.context.currentService;

    if (s === SERVICES.RESTAURANT) {
      return `Hello, ${guestName}. I'm Tolani, your Hotel Capitol concierge. It would be my pleasure to assist you with your dining selection. How may I help you today?`;
    }
    if (s === SERVICES.BREAKFAST) {
      return `Good morning, ${guestName}. I'm Tolani, your Hotel Capitol concierge. I see you're arranging breakfast. How may I assist you?`;
    }
    if (s === SERVICES.HOUSEKEEPING) {
      return `I'm here to assist with your room, ${guestName}. Would you like to request housekeeping, fresh towels, or another room amenity?`;
    }
    if (s === SERVICES.CONCIERGE_PORTER) {
      return `Hello, ${guestName}. I'm Tolani, your Hotel Capitol concierge. Certainly, I'll be happy to arrange porter assistance for you.`;
    }
    if (s === SERVICES.VIP_TRANSPORTATION) {
      return `Good day, ${guestName}. I'd be delighted to arrange your transportation. Where would you like to go?`;
    }
    if (s === SERVICES.FOLIO) {
      return `I can help you review your current Hotel Capitol folio, ${guestName}. What would you like to know?`;
    }
    if (s === SERVICES.AMENITIES) {
      return `I'd be delighted to help you with information about Hotel Capitol's facilities and WiFi amenities, ${guestName}.`;
    }
    if (s === SERVICES.NEAR_HOTEL) {
      return `Certainly, ${guestName}. I can help you discover verified restaurants, nightlife, and cultural spots around Ikeja.`;
    }
    if (s === SERVICES.FRONT_DESK) {
      return `Good day, ${guestName}. I am Tolani, your Hotel Capitol concierge. Certainly, please tell me how I may assist you.`;
    }

    if (hour < 12) {
      return `Good morning, ${guestName}. Welcome to Hotel Capitol. I'm Tolani, your personal concierge. It is my pleasure to assist you this morning. How may I help you?`;
    } else if (hour < 17) {
      return `Good afternoon, ${guestName}. Welcome back. I'm Tolani, your Hotel Capitol concierge. How may I assist you this afternoon?`;
    } else {
      return `Good evening, ${guestName}. I'm Tolani, your Hotel Capitol concierge. It is my pleasure to assist you this evening. What may I arrange for you?`;
    }
  }

  // --- INTENT CLASSIFICATION LAYER (With Additive Dynamic Learned Phrases) ---
  classifyIntent(query, currentService) {
    const q = query.toLowerCase().trim();

    // 0. Check for approved learned phrases from state store
    const approvedLearned = (store.getState().approvedLearnedPhrases || []).find(p => q.includes(p.phrase.toLowerCase()));
    if (approvedLearned) {
      let dept = this.context.currentDepartment;
      if (approvedLearned.service === SERVICES.CONCIERGE_PORTER) dept = 'PORTER';
      else if (approvedLearned.service === SERVICES.RESTAURANT || approvedLearned.service === SERVICES.BREAKFAST) dept = 'KITCHEN';
      else if (approvedLearned.service === SERVICES.VIP_TRANSPORTATION) dept = 'TRANSPORTATION';
      else if (approvedLearned.service === SERVICES.HOUSEKEEPING) dept = 'HOUSEKEEPING';

      return { 
        intent: approvedLearned.intent, 
        service: approvedLearned.service, 
        department: dept,
        isLearned: true
      };
    }

    // Frustration
    if (q.includes('frustrat') || q.includes('angry') || q.includes('annoyed') || q.includes('stupid') || q.includes('useless') || q.includes('terrible') || q.includes('bad service')) {
      return { intent: 'FRUSTRATION', service: SERVICES.FRONT_DESK, department: 'FRONT_DESK' };
    }

    // Human Handoff / Reception
    if (q.includes('human') || q.includes('speak to reception') || q.includes('talk to someone') || q.includes('front desk') || q.includes('operator')) {
      return { intent: 'HUMAN_HANDOFF', service: SERVICES.FRONT_DESK, department: 'FRONT_DESK' };
    }

    // Gratitude / Thank you
    if (q === 'thank you' || q === 'thanks' || q === 'thank you tolani' || q === 'thanks tolani' || q === 'appreciate it' || q === 'thank you amara' || q === 'thanks amara') {
      return { intent: 'THANK_YOU', service: currentService, department: this.context.currentDepartment };
    }

    // Negative / No thanks
    if (q === 'no' || q === 'no thanks' || q === 'nope' || q === 'not now' || q === 'leave it' || q.includes('dont want') || q.includes("don't want")) {
      return { intent: 'NO_THANKS', service: currentService, department: this.context.currentDepartment };
    }

    // Positive / Yes
    if (q === 'yes' || q === 'yes please' || q === 'sure' || q === 'yeah' || q === 'ok' || q === 'okay' || q === 'add drink' || q === 'add dessert') {
      return { intent: 'YES_PLEASE', service: currentService, department: this.context.currentDepartment };
    }

    // 1. Luggage Assistance / Porter (Strictly PORTER, Never Transportation)
    if (
      q.includes('luggage') || q.includes('bag') || q.includes('carry bag') || 
      q.includes('carry my bags') || q.includes('come for my bags') || q.includes('someone should help me with my bags') ||
      q.includes('porter') || q.includes('suitcase') || q.includes('help with my luggage') ||
      q.includes('help with luggage')
    ) {
      return { intent: 'LUGGAGE_ASSISTANCE', service: SERVICES.CONCIERGE_PORTER, department: 'PORTER' };
    }

    // 2. VIP Transportation / Car / Driver
    if (
      q.includes('taxi') || q.includes('airport') || q.includes('airport pickup') || q.includes('airport drop') || 
      q.includes('driver') || q.includes('car to') || q.includes('need a car') || q.includes('ride') ||
      q.includes('uber') || q.includes('mma2') || q.includes('mma1') || q.includes('mmia') || q.includes('chauffeur') || 
      q.includes('transfer') || q.includes('charter') || q.includes('book a car') || q.includes('transport')
    ) {
      return { intent: 'VIP_TRANSPORTATION', service: SERVICES.VIP_TRANSPORTATION, department: 'TRANSPORTATION' };
    }

    // 3. Breakfast Request
    if (q.includes('breakfast') || q.includes('morning meal') || q.includes('pancake') || q.includes('egg and yam') || q.includes('order breakfast')) {
      return { intent: 'ORDER_BREAKFAST', service: SERVICES.BREAKFAST, department: 'KITCHEN' };
    }

    // 3b. Order Status / Food Tracking
    if (
      q.includes('where is my food') || q.includes('order status') || q.includes('check my order') ||
      q.includes('is my food ready') || q.includes('when is my food coming') || q.includes('when is my meal') ||
      q.includes('status of my order') || q.includes('track my order') || q.includes('kitchen status')
    ) {
      return { intent: 'CHECK_ORDER_STATUS', service: SERVICES.RESTAURANT, department: 'KITCHEN' };
    }

    // 4. Restaurant & Dining / Food Request (Comprehensive matching)
    if (
      q.includes('food') || q.includes('dining') || q.includes('dinner') || q.includes('lunch') ||
      q.includes('menu') || q.includes('hungry') || q.includes('eat') || q.includes('order') ||
      q.includes('meal') || q.includes('dish') || q.includes('cuisine') || q.includes('restaurant') ||
      q.includes('kitchen') || q.includes('jollof') || q.includes('suya') || q.includes('chapman') ||
      q.includes('drink') || q.includes('beverage') || q.includes('dessert') || q.includes('snack') ||
      q.includes('wine') || q.includes('cocktail') || q.includes('pepper soup') || q.includes('peppersoup') ||
      q.includes('starters') || q.includes('appetizer') || q.includes('in-suite dining') || q.includes('room dining') ||
      q.includes('something to eat') || q.includes('show me the food')
    ) {
      return { intent: 'ORDER_FOOD', service: SERVICES.RESTAURANT, department: 'KITCHEN' };
    }

    // 5. Housekeeping & Room Cleaning / Towels
    if (q.includes('towel') || q.includes('clean') || q.includes('linen') || q.includes('bed sheet') || q.includes('water') || q.includes('pillow') || q.includes('toiletries') || q.includes('soap') || q.includes('insecticide') || q.includes('room service')) {
      return { intent: 'HOUSEKEEPING_REQUEST', service: SERVICES.HOUSEKEEPING, department: 'HOUSEKEEPING' };
    }

    // 6. Folio / Bill Check
    if (q.includes('bill') || q.includes('folio') || q.includes('balance') || q.includes('charge') || q.includes('receipt') || q.includes('invoice')) {
      return { intent: 'VIEW_FOLIO', service: SERVICES.FOLIO, department: 'FRONT_DESK' };
    }

    // 7. WiFi & Amenities
    if (q.includes('wifi') || q.includes('password') || q.includes('internet') || q.includes('pool') || q.includes('gym') || q.includes('fitness')) {
      return { intent: 'VIEW_AMENITIES', service: SERVICES.AMENITIES, department: 'FRONT_DESK' };
    }

    // 8. Near Hotel / Local Ikeja Recommendations
    if (q.includes('nearby') || q.includes('ikeja') || q.includes('barber') || q.includes('salon') || q.includes('nightlife') || q.includes('fela') || q.includes('shrine') || q.includes('supermarket')) {
      return { intent: 'VIEW_NEARBY', service: SERVICES.NEAR_HOTEL, department: 'CONCIERGE' };
    }

    // Default: contextual continuation or general inquiry
    return { intent: 'GENERAL_INQUIRY', service: currentService, department: this.context.currentDepartment };
  }

  // --- WORKFLOW EXECUTION ENGINE ---

  /**
   * Main conversational turn processor.
   * Enforces MENU-FIRST / OPTIONS-FIRST principle.
   * Returns text response, voiceText, actionType, and actionPayload to execute visible UI changes.
   */
  processGuestQuery(userQuery) {
    const guest = store.getActiveGuest();
    const guestName = guest ? guest.name : 'Valued Guest';
    const roomNumber = guest ? guest.roomNumber : '402';
    const q = userQuery.toLowerCase().trim();

    // 1. Intent Detection
    const { intent, service, department } = this.classifyIntent(userQuery, this.context.currentService);
    
    // Update active service context to match detected intent
    this.context.currentService = service;
    this.context.currentDepartment = department;
    this.context.currentIntent = intent;

    let response = {
      text: '',
      voiceText: '',
      actionType: null,
      actionPayload: null,
      serviceContext: { ...this.context }
    };

    // --- A. FRUSTRATION PROTOCOL ---
    if (intent === 'FRUSTRATION') {
      const msg = `I'm sorry this has been frustrating, ${guestName}. Let me make this easier for you. I can connect you directly with our Hotel Capitol Front Desk team (Ext 0), or assist you step-by-step here. Which would you prefer?`;
      response.text = msg;
      response.voiceText = msg;
      response.actionType = AMARA_ACTIONS.OPEN_FRONT_DESK;
      this.logAndReturn(userQuery, response);
      return response;
    }

    // --- B. HUMAN HANDOFF ---
    if (intent === 'HUMAN_HANDOFF') {
      const voiceMsg = `Certainly, ${guestName}. I am connecting you directly with the Hotel Capitol Front Desk team now.`;
      response.text = `Certainly, ${guestName}. I am connecting you directly with the **Hotel Capitol Front Desk** team (Extension 0 / Reception Supervisor Tariq). A staff member is on standby to assist Suite #${roomNumber}.`;
      response.voiceText = voiceMsg;
      response.actionType = AMARA_ACTIONS.OPEN_FRONT_DESK;
      this.logAndReturn(userQuery, response);
      return response;
    }

    // --- C. THANK YOU ---
    if (intent === 'THANK_YOU') {
      const msg = `It is my pleasure, ${guestName}. Please let me know if there is anything else I may arrange for your stay.`;
      response.text = msg;
      response.voiceText = msg;
      this.logAndReturn(userQuery, response);
      return response;
    }

    // --- D. NO THANKS (Voice Confirmation) ---
    if (intent === 'NO_THANKS') {
      const voiceMsg = `Certainly, ${guestName}. Let me show you your order for confirmation.`;
      response.text = `Certainly, ${guestName}. Let me show you your order for confirmation.`;
      response.voiceText = voiceMsg;
      response.actionType = AMARA_ACTIONS.SHOW_ORDER_SUMMARY;
      this.logAndReturn(userQuery, response);
      return response;
    }

    // --- E. YES PLEASE (Voice Confirmation) ---
    if (intent === 'YES_PLEASE') {
      const voiceMsg = `Certainly, ${guestName}. I'll show you the available options.`;
      response.text = `Certainly, ${guestName}. I'll show you the available complementary pairings and refreshments.`;
      response.voiceText = voiceMsg;
      response.actionType = AMARA_ACTIONS.OPEN_DRINKS;
      this.logAndReturn(userQuery, response);
      return response;
    }

    // --- 0. ORDER STATUS & LIVE TRACKING INQUIRY ---
    if (intent === 'CHECK_ORDER_STATUS') {
      const activeOrders = store.getState().orders.filter(o => o.guestId === (guest ? guest.id : '') && o.status !== 'DELIVERED');
      if (activeOrders.length === 0) {
        const msg = `You currently have no active restaurant orders for Suite #${roomNumber}, ${guestName}. Would you like me to open the dining menu?`;
        response.text = msg;
        response.voiceText = msg;
        response.actionType = AMARA_ACTIONS.OPEN_RESTAURANT_MENU;
        this.logAndReturn(userQuery, response);
        return response;
      }

      const active = activeOrders[0];
      const now = Date.now();
      const status = active.status;
      const targetDelivery = active.revisedDeliveryAt || active.estimatedDeliveryAt || (now + 15 * 60000);
      const deliveryFormatted = new Date(targetDelivery).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      let voiceMsg = '';
      if (status === 'SUBMITTED' || status === 'ACCEPTED') {
        voiceMsg = `${guestName}, your order for ${active.items.map(i => i.name).join(', ')} has been received by Executive Chef Babatunde and is awaiting kitchen station start. It is scheduled for delivery around ${deliveryFormatted}.`;
      } else if (status === 'PREPARING') {
        const remPrep = Math.max(1, Math.round(((active.estimatedReadyAt || (now + 20 * 60000)) - now) / 60000));
        voiceMsg = `${guestName}, your order is currently being prepared fresh in the kitchen. It is estimated to be ready in approximately ${remPrep} minutes and delivered to your suite by ${deliveryFormatted}.`;
      } else if (status === 'READY') {
        voiceMsg = `${guestName}, your meal is freshly prepared and is staged for in-room delivery to Suite #${roomNumber}.`;
      } else if (status === 'OUT_FOR_DELIVERY') {
        const remDel = Math.max(1, Math.round((targetDelivery - now) / 60000));
        voiceMsg = `${guestName}, your order is out for delivery to Suite #${roomNumber}. Your attendant is en route and will arrive in approximately ${remDel} minutes.`;
      } else {
        voiceMsg = `${guestName}, your order status is currently ${status.replace(/_/g, ' ')}. Delivery is scheduled for ${deliveryFormatted}.`;
      }

      response.text = voiceMsg;
      response.voiceText = voiceMsg;
      response.actionType = AMARA_ACTIONS.OPEN_ORDER_TRACKER;
      response.payload = { orderId: active.id };
      this.logAndReturn(userQuery, response);
      return response;
    }

    // --- 1. RESTAURANT & DINING WORKFLOW ---
    if (service === SERVICES.RESTAURANT || intent === 'ORDER_FOOD') {
      this.context.conversationState = CONV_STATES.SHOWING_OPTIONS;
      this.context.currentStatus = 'IDLE';

      // Check if specific items are named
      let specificItem = null;
      if (q.includes('jollof')) specificItem = 'Capitol Signature Jollof Fiesta';
      else if (q.includes('suya')) specificItem = 'Prime Grilled Beef Suya Skewers';
      else if (q.includes('chapman')) specificItem = 'Hotel Capitol Signature Chapman';

      if (specificItem) {
        this.context.currentRequest = { item: specificItem, status: 'DRAFT' };
        this.context.conversationState = CONV_STATES.COLLECTING_SELECTION;
        
        const voiceMsg = `Wonderful choice, ${guestName}. I've opened our dining menu with ${specificItem} ready. Please feel free to add drinks, sides or desserts to your tray.`;
        response.text = `Wonderful choice, ${guestName}. I have opened our **Hotel Capitol Restaurant Menu** with **${specificItem}** selected. Please review your order tray, select any desired extras, and confirm when you are ready to send to our kitchen.`;
        response.voiceText = voiceMsg;
        response.actionType = AMARA_ACTIONS.OPEN_RESTAURANT_MENU;
        response.actionPayload = { preselectItem: specificItem };
      } else {
        const voiceMsg = `It would be my pleasure to assist you with your dining selection, ${guestName}. I'm opening our restaurant menu for you now.`;
        response.text = `It would be my pleasure, ${guestName}. I have opened our **Hotel Capitol Restaurant Menu** for Suite **#${roomNumber}**.\n\nPlease select your preferred dishes from the menu below, add any artisan extras, and confirm when you are ready to dispatch your order to Executive Chef Babatunde.`;
        response.voiceText = voiceMsg;
        response.actionType = AMARA_ACTIONS.OPEN_RESTAURANT_MENU;
      }
      this.logAndReturn(userQuery, response);
      return response;
    }

    // --- 2. BREAKFAST SERVICE WORKFLOW ---
    if (service === SERVICES.BREAKFAST || intent === 'ORDER_BREAKFAST') {
      this.context.conversationState = CONV_STATES.SHOWING_OPTIONS;
      this.context.currentStatus = 'IDLE';
      const isFree = guest?.breakfastEntitlement === 'Complimentary';

      const voiceMsg = `Certainly, ${guestName}. I've opened our breakfast service. Please select your preferred breakfast entrée and delivery window between 6 and 10 AM.`;
      response.text = `Certainly, ${guestName}. I have opened our **Daily Breakfast Service** for Suite **#${roomNumber}** (` + (isFree ? 'Complimentary' : 'Standard Folio') + `).\n\nPlease choose from **The English Royal Breakfast**, **The Naija Executive Breakfast**, or **Continental Basket**, select your delivery window (06:00 AM – 10:00 AM), and confirm your order.`;
      response.voiceText = voiceMsg;
      response.actionType = AMARA_ACTIONS.OPEN_BREAKFAST_MENU;
      this.logAndReturn(userQuery, response);
      return response;
    }

    // --- 3. CONCIERGE & PORTER WORKFLOW (Strictly In Room & Main Lobby Only) ---
    if (service === SERVICES.CONCIERGE_PORTER || intent === 'LUGGAGE_ASSISTANCE') {
      this.context.conversationState = CONV_STATES.SHOWING_OPTIONS;
      this.context.currentStatus = 'IDLE';
      this.context.currentDepartment = 'PORTER';

      // If location is already specified in the speech/text
      if (q.includes('in room') || q.includes('my room') || q.includes('to room') || q.includes('inside room')) {
        const voiceMsg = `Certainly, ${guestName}. I've arranged porter assistance directly to Suite #${roomNumber}. A member of our team is on the way.`;
        response.text = `Certainly, ${guestName}. I have arranged **Porter Luggage Assistance** for **Suite #${roomNumber} (In Room)**.\n\nLead Porter Ibrahim has been notified and will be with you shortly.`;
        response.voiceText = voiceMsg;
        response.actionType = AMARA_ACTIONS.OPEN_PORTER_OPTIONS;
        response.actionPayload = { location: 'In Room', roomNumber };
        this.logAndReturn(userQuery, response);
        return response;
      } else if (q.includes('lobby') || q.includes('reception') || q.includes('entrance')) {
        const voiceMsg = `Certainly, ${guestName}. I've arranged porter assistance for you at the Main Lobby. A member of our team will meet you there.`;
        response.text = `Certainly, ${guestName}. I have arranged **Porter Luggage Assistance** at the **Main Lobby Reception**.\n\nLead Porter Ibrahim has been notified and will meet you at the lobby.`;
        response.voiceText = voiceMsg;
        response.actionType = AMARA_ACTIONS.OPEN_PORTER_OPTIONS;
        response.actionPayload = { location: 'Main Lobby', roomNumber };
        this.logAndReturn(userQuery, response);
        return response;
      }

      // Complete luxury wording
      const voiceMsg = `Certainly, ${guestName}. I've received your request for porter assistance. Would you like our porter to assist you in your room or at the main lobby?`;
      response.text = `Certainly, ${guestName}. I've received your request for porter assistance.\n\nWould you like our porter to assist you **in your room (Suite #${roomNumber})** or **at the Main Lobby**? Please select below:`;
      response.voiceText = voiceMsg;
      response.actionType = AMARA_ACTIONS.OPEN_PORTER_OPTIONS;
      response.actionPayload = { roomNumber };
      this.logAndReturn(userQuery, response);
      return response;
    }

    // --- 4. VIP TRANSPORTATION WORKFLOW ---
    if (service === SERVICES.VIP_TRANSPORTATION || intent === 'VIP_TRANSPORTATION') {
      this.context.conversationState = CONV_STATES.SHOWING_OPTIONS;
      this.context.currentStatus = 'IDLE';
      this.context.currentDepartment = 'TRANSPORTATION';

      const voiceMsg = `Certainly, ${guestName}. I'd be delighted to arrange your transportation. Where would you like to go?`;
      response.text = `Certainly, ${guestName}. I'd be delighted to arrange your transportation.\n\nI have opened our **VIP Chauffeured Transportation** selector below. Please choose your destination zone (Lagos Island, Lagos Mainland, or Airport) and preferred departure time.`;
      response.voiceText = voiceMsg;
      response.actionType = AMARA_ACTIONS.OPEN_TRANSPORTATION_OPTIONS;
      this.logAndReturn(userQuery, response);
      return response;
    }

    // --- 5. HOUSEKEEPING WORKFLOW ---
    if (service === SERVICES.HOUSEKEEPING || intent === 'HOUSEKEEPING_REQUEST') {
      this.context.conversationState = CONV_STATES.SHOWING_OPTIONS;
      this.context.currentStatus = 'IDLE';
      this.context.currentDepartment = 'HOUSEKEEPING';

      let specificItem = 'Fresh Bath Towels';
      if (q.includes('water')) specificItem = 'Chilled Premium Bottled Spring Water';
      else if (q.includes('clean') || q.includes('cleaning')) specificItem = 'Full Suite Deep Cleaning';
      else if (q.includes('linen') || q.includes('sheet')) specificItem = 'Fresh Egyptian Cotton Linen Change';
      else if (q.includes('pillow')) specificItem = 'Extra Luxury Orthopedic Pillows';

      const voiceMsg = `Of course, ${guestName}. I'll arrange that for you. I've opened our room service options for Suite ${roomNumber}.`;
      response.text = `Of course, ${guestName}. I'll arrange that for you.\n\nI have opened our **Room Service & Housekeeping** dispatch options for Suite **#${roomNumber}**. Please select what you need (towels, bottled water, deep cleaning, or linen change):`;
      response.voiceText = voiceMsg;
      response.actionType = AMARA_ACTIONS.OPEN_HOUSEKEEPING_OPTIONS;
      response.actionPayload = { suggestedItem: specificItem };
      this.logAndReturn(userQuery, response);
      return response;
    }

    // --- 6. DIGITAL FOLIO WORKFLOW ---
    if (service === SERVICES.FOLIO || intent === 'VIEW_FOLIO') {
      this.context.conversationState = CONV_STATES.SHOWING_OPTIONS;
      const totalFolio = guest ? guest.folio.reduce((a, b) => a + b.amount, 0) : 0;
      
      const voiceMsg = `Certainly, ${guestName}. Your current outstanding balance for Suite ${roomNumber} is ${totalFolio.toLocaleString()} Naira. I have opened your itemized folio.`;
      response.text = `Certainly, ${guestName}. Your current outstanding folio balance for Suite **#${roomNumber}** is **₦${totalFolio.toLocaleString()}** across **${guest?.folio?.length || 0} items**.\n\nI have opened your itemized folio statement for review.`;
      response.voiceText = voiceMsg;
      response.actionType = AMARA_ACTIONS.OPEN_FOLIO;
      this.logAndReturn(userQuery, response);
      return response;
    }

    // --- 7. AMENITIES & WIFI WORKFLOW ---
    if (service === SERVICES.AMENITIES || intent === 'VIEW_AMENITIES') {
      const voiceMsg = `High-speed WiFi is complimentary, ${guestName}. Network name is Capitol-VIP-Guest, and password is CapitolLagos2026.`;
      response.text = `High-speed Fiber WiFi is complimentary throughout Hotel Capitol:\n• **Network**: \`Capitol-VIP-Guest\`\n• **Password**: \`CapitolLagos2026\`\n\nPool terrace is open daily 06:30 AM – 10:00 PM on the 1st Floor, and the Fitness Center is accessible 24/7 on the 2nd Floor.`;
      response.voiceText = voiceMsg;
      response.actionType = AMARA_ACTIONS.OPEN_AMENITIES;
      this.logAndReturn(userQuery, response);
      return response;
    }

    // --- 8. NEARBY IKEJA WORKFLOW ---
    if (service === SERVICES.NEAR_HOTEL || intent === 'VIEW_NEARBY') {
      const voiceMsg = `I'd be delighted to help you explore Ikeja, ${guestName}. I have opened our curated guide for salons, dining, and nightlife near Hotel Capitol.`;
      response.text = `I'd be delighted to help you explore Ikeja, ${guestName}.\n\nI have opened our **Curated Ikeja Directory** featuring verified spots like **Karisma Executive Barber** (350m), **The Capitol Penthouse Lounge** (5th Floor), and the historic **Kalakuta Museum / Fela Shrine**.`;
      response.voiceText = voiceMsg;
      response.actionType = AMARA_ACTIONS.OPEN_NEARBY;
      this.logAndReturn(userQuery, response);
      return response;
    }

    // --- DEFAULT CONVERSATIONAL RESPONSE ---
    const defaultVoice = `I am at your service, ${guestName}. Would you like to explore dining, breakfast, housekeeping, porter assistance, or transportation?`;
    response.text = `I am at your service, ${guestName}. How may I make your stay in Suite **#${roomNumber}** more comfortable today?\n\nYou may ask me to open our **Dining Menu**, arrange **Breakfast**, request **Fresh Towels / Housekeeping**, dispatch **Porter Luggage Assistance**, or book **Airport Transportation**.`;
    response.voiceText = defaultVoice;
    this.logAndReturn(userQuery, response);
    return response;
  }

  logAndReturn(userQuery, response) {
    try {
      learningEngine.logInteractionEvent({
        activeService: this.context.currentService,
        detectedIntent: this.context.currentIntent,
        guestMessage: userQuery,
        aiResponse: response.voiceText || response.text,
        uiAction: response.actionType,
        conversationState: this.context.conversationState,
        outcome: 'SUCCESSFUL'
      });
    } catch (e) {
      console.warn('Learning Engine log exception:', e);
    }
  }
}

export const aiEngine = new HotelCapitolAI();

