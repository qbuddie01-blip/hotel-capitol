/**
 * HOTEL CAPITOL — GUEST PORTAL & MOBILE FIRST EXPERIENCE (TOLANI AI)
 * 6 Animashaun Close, Ikeja, Lagos
 * 10 Service Workflows: Restaurant, Breakfast, Room Service, Transport, Folio, Concierge, AI, Nearby, Info, Contact
 */

import { getIcon, renderIntercomRoundBadge, renderIntercomBlackBadge } from '../assets/icons.js';
import { store } from '../store/state.js';
import { automationEngine } from '../services/automationRules.js';
import { aiEngine, AMARA_ACTIONS, SERVICES, TOLANI_VOICE_CONFIG } from '../services/aiEngine.js';

let activeGuestTab = 'home'; // 'home' | 'restaurant' | 'breakfast' | 'room-service' | 'transport' | 'concierge' | 'folio' | 'nearby' | 'info' | 'contact' | 'order-tracker'
let selectedCategory = 'Food';
let cart = []; // Cart items for restaurant ordering
let orderDraftExtras = {};
let isVoiceActiveForService = false;
let showPorterLocationModal = false;
let restaurantFlowStep = 'MENU'; // 'MENU' | 'UPSELL_PROMPT' | 'UPSELL_OPTIONS' | 'REVIEW' | 'CONFIRMED'
let activeTrackedOrderId = null;

// Transportation state
let selectedTransportMode = 'ONE_TIME_DROPOFF'; // 'ONE_TIME_DROPOFF' | 'FULL_DAY_CHARTER'
let selectedZoneId = 'AIR-2';
let selectedDestinationLocation = 'MMA2 Bi-Courtney Aviation Terminal';
let selectedVehicleId = 'VEH-SEDAN';
let selectedDepartureDate = new Date().toISOString().slice(0, 10);
let selectedDepartureTime = '11:30 AM';
let selectedPassengers = 2;
let showTransportReviewModal = false;
let showTransportRescheduleModal = null; // tbkId
let showFeedbackModal = null; // { serviceType: 'RESTAURANT' }

// Alphabetic month date formatter (e.g. "15 August 2026")
export function formatStayDate(dateStr) {
  if (!dateStr) return '';
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (monthIdx >= 0 && monthIdx < 12 && !isNaN(day)) {
      return `${day} ${months[monthIdx]} ${year}`;
    }
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }
  return dateStr;
}

export function initGuestPortal() {
  window.getActiveGuestTab = () => activeGuestTab;

  // Master Order Tracker & Transportation Live Countdown Engine
  if (window.hotelCapitolTimerInterval) {
    clearInterval(window.hotelCapitolTimerInterval);
  }

  window.hotelCapitolTimerInterval = setInterval(() => {
    const state = store.getState();
    const guest = store.getActiveGuest();
    if (!guest) return;

    const currentOrder = (activeTrackedOrderId && state.orders.find(o => o.id === activeTrackedOrderId)) ||
                         state.orders.find(o => o.guestId === guest.id && o.status !== 'DELIVERED') ||
                         state.orders[0];

    const now = Date.now();

    if (currentOrder) {
      // 1. Update PREPARING countdown & progress bar
      if (currentOrder.status === 'PREPARING') {
        const prepStarted = currentOrder.preparationStartedAt || (currentOrder.createdTimestamp || now);
        const prepTotalMs = (currentOrder.preparationMinutes || 20) * 60 * 1000;
        const estReady = currentOrder.estimatedReadyAt || (prepStarted + prepTotalMs);
        const remainingPrepMs = Math.max(0, estReady - now);
        const pMins = Math.floor(remainingPrepMs / 60000);
        const pSecs = Math.floor((remainingPrepMs % 60000) / 1000);
        const str = `${pMins.toString().padStart(2, '0')}:${pSecs.toString().padStart(2, '0')} REMAINING`;
        const el = document.getElementById('prep-countdown-value');
        if (el) el.innerText = str;

        const elapsed = Math.max(0, now - prepStarted);
        const prepPct = Math.min(99, Math.max(5, Math.round((elapsed / prepTotalMs) * 100)));
        const pBar = document.getElementById('prep-progress-bar');
        if (pBar) pBar.style.width = prepPct + '%';
      }

      // 2. Update DELIVERY countdown & progress bar
      if (currentOrder.status === 'OUT_FOR_DELIVERY') {
        const delStarted = currentOrder.deliveryStartedAt || now;
        const delTotalMs = (currentOrder.deliveryMinutes || 15) * 60 * 1000;
        const targetDelivery = currentOrder.revisedDeliveryAt || currentOrder.estimatedDeliveryAt || (delStarted + delTotalMs);
        const remainingDeliveryMs = targetDelivery - now;
        const el = document.getElementById('delivery-countdown-value');

        if (remainingDeliveryMs > 0) {
          const dMins = Math.floor(remainingDeliveryMs / 60000);
          const dSecs = Math.floor((remainingDeliveryMs % 60000) / 1000);
          const str = `${dMins.toString().padStart(2, '0')}:${dSecs.toString().padStart(2, '0')} REMAINING`;
          if (el) el.innerText = str;

          const elapsed = Math.max(0, now - delStarted);
          const delPct = Math.min(99, Math.max(10, Math.round((elapsed / delTotalMs) * 100)));
          const dBar = document.getElementById('delivery-progress-bar');
          if (dBar) dBar.style.width = delPct + '%';
        }

        // Check 5-minute notification (Triggers ONCE only)
        const diffMins = remainingDeliveryMs / 60000;
        if (diffMins <= 5 && diffMins > 0 && !currentOrder.fiveMinuteDeliveryNotificationSent) {
          store.setState(s => ({
            ...s,
            orders: s.orders.map(o => o.id === currentOrder.id ? { ...o, fiveMinuteDeliveryNotificationSent: true } : o)
          }));
          aiEngine.speak(`Good day, ${guest.name}. Just a quick update — your order is approximately five minutes away. We hope you enjoy your meal.`);
          automationEngine.showToast('🔔 Order 5 Mins Away', `Your meal is arriving in ~5 minutes to Suite #${guest.roomNumber}.`, 'info');
        }

        // Check Delay notification (Triggers ONCE only when target expires)
        if (remainingDeliveryMs <= 0 && !currentOrder.delayNotificationSent) {
          store.setState(s => ({
            ...s,
            orders: s.orders.map(o => o.id === currentOrder.id ? { ...o, delayNotificationSent: true } : o)
          }));
          aiEngine.speak(`Mr./Mrs. ${guest.name}, I sincerely apologize for the delay. Your order is taking a little longer than expected. We are following up with our team and I'll keep you updated with the revised delivery time.`);
          automationEngine.showToast('⚠️ Delivery Delay', `Concierge is actively following up on Suite #${guest.roomNumber} order.`, 'critical');
          if (window.renderApp) window.renderApp();
        }
      }
    }

    // 3. Update TRANSPORTATION countdowns & departure reminders
    (state.transportBookings || []).filter(b => b.guestId === guest.id && b.status === 'CONFIRMED').forEach(tbk => {
      const depTs = new Date(tbk.departureTimestamp || (Date.now() + 3600000)).getTime();
      const remainingTs = depTs - now;
      const el = document.getElementById(`transport-countdown-${tbk.id}`);
      if (el) {
        if (remainingTs > 0) {
          const hrs = Math.floor(remainingTs / 3600000);
          const mins = Math.floor((remainingTs % 3600000) / 60000);
          const secs = Math.floor((remainingTs % 60000) / 1000);
          el.innerText = `DEPARTURE IN ${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
          el.innerText = 'DEPARTURE READY · CHAUFFEUR ON STANDBY';
        }
      }

      // 30-min reminder (triggers once)
      const remMins = remainingTs / 60000;
      if (remMins <= 30 && remMins > 15 && !tbk.reminder30Sent) {
        store.setState(s => ({
          ...s,
          transportBookings: s.transportBookings.map(b => b.id === tbk.id ? { ...b, reminder30Sent: true } : b)
        }));
        aiEngine.speak(`Good day, ${guest.name}. This is a reminder that your transportation is scheduled to depart in approximately 30 minutes.`);
        automationEngine.showToast('🚗 Transportation Reminder', `Chauffeured vehicle to ${tbk.destination} departs in ~30 minutes.`, 'info');
      }

      // 15-min reminder (triggers once)
      if (remMins <= 15 && remMins > 0 && !tbk.reminder15Sent) {
        store.setState(s => ({
          ...s,
          transportBookings: s.transportBookings.map(b => b.id === tbk.id ? { ...b, reminder15Sent: true } : b)
        }));
        aiEngine.speak(`Hello, ${guest.name}. Your transportation is scheduled to depart in approximately 15 minutes. Your driver is preparing for your departure.`);
        automationEngine.showToast('🚗 Driver Preparing', `Your driver ${tbk.driverName || 'Ibrahim'} is preparing for departure at the main entrance.`, 'info');
      }
    });
  }, 1000);

  // 1. ABSOLUTE EXPLORE ACTION: Opens UI without triggering voice, drafts, or requests
  window.navigateGuestTab = (tab) => {
    activeGuestTab = tab;
    if (tab === 'restaurant') {
      restaurantFlowStep = 'MENU';
    }
    if (window.renderApp) window.renderApp();
    if (typeof window.scrollTo === 'function') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.setRestaurantFlowStep = (step) => {
    restaurantFlowStep = step;
    if (window.renderApp) window.renderApp();
    if (typeof window.scrollTo === 'function') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. INTERCOM ACTION: Explicitly activates Tolani with isolated card context
  window.activateTolaniIntercom = (serviceKey, cardTitle) => {
    aiEngine.setServiceContext(serviceKey, cardTitle);
    window.toggleAIAssistant(true, true, serviceKey);
  };
  window.activateAmaraIntercom = window.activateTolaniIntercom;

  // 2b. DEDICATED SUITE DIRECT INTERCOM SERVICE ROUTING (Breakfast, VIP Transport, Concierge Mary)
  window.activateGuestServiceIntercom = (serviceType) => {
    const guest = store.getActiveGuest();
    const suiteNum = guest ? guest.roomNumber : '402';
    automationEngine.playChime('bell');
    
    if (serviceType === 'BREAKFAST') {
      automationEngine.showToast('☕ Breakfast Service Intercom', `Connecting Suite #${suiteNum} to Breakfast & Kitchen queue...`, 'info');
      activeGuestTab = 'breakfast';
      if (window.renderApp) window.renderApp();
      if (typeof window.scrollTo === 'function') window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (serviceType === 'TRANSPORT') {
      automationEngine.showToast('🚕 VIP Transportation Intercom', `Connecting Suite #${suiteNum} to VIP Chauffeur & Transit desk...`, 'info');
      activeGuestTab = 'transport';
      if (window.renderApp) window.renderApp();
      if (typeof window.scrollTo === 'function') window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (serviceType === 'CONCIERGE') {
      automationEngine.showToast('🧳 Mary Concierge Intercom', `Connecting Suite #${suiteNum} to Mary (Concierge & Porter)...`, 'info');
      activeGuestTab = 'concierge';
      if (window.renderApp) window.renderApp();
      if (typeof window.scrollTo === 'function') window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 3. TOLANI UI ACTION EXECUTOR: Translates AI intent into real visible UI state changes
  window.amaraActionExecutor = (actionType, payload = {}) => {
    if (!actionType) return;

    if (actionType === AMARA_ACTIONS.OPEN_RESTAURANT_MENU) {
      activeGuestTab = 'restaurant';
      restaurantFlowStep = 'MENU';
      if (payload && payload.preselectItem) {
        const item = store.getState().menu.find(m => m.name.toLowerCase().includes(payload.preselectItem.toLowerCase()));
        if (item) {
          window.addToCart(item.id);
        }
      }
      automationEngine.showToast('🍽️ Restaurant & Dining', 'Opened Hotel Capitol dining menu for Suite.', 'success');
    } else if (actionType === AMARA_ACTIONS.OPEN_ORDER_TRACKER) {
      activeGuestTab = 'order-tracker';
      if (payload && payload.orderId) {
        activeTrackedOrderId = payload.orderId;
      }
      automationEngine.showToast('🚀 Live Order Tracking', 'Viewing active order preparation and delivery.', 'info');
    } else if (actionType === AMARA_ACTIONS.OPEN_BREAKFAST_MENU) {
      activeGuestTab = 'breakfast';
      automationEngine.showToast('☕ Breakfast Service', 'Opened daily breakfast selection.', 'success');
    } else if (actionType === AMARA_ACTIONS.OPEN_PORTER_OPTIONS) {
      activeGuestTab = 'concierge';
      showPorterLocationModal = true;
      automationEngine.showToast('🧳 Porter Assistance', 'Please choose In Room or Main Lobby.', 'info');
    } else if (actionType === AMARA_ACTIONS.OPEN_TRANSPORTATION_OPTIONS) {
      activeGuestTab = 'transport';
      automationEngine.showToast('🚕 VIP Transportation', 'Viewing chauffeur transit destinations.', 'info');
    } else if (actionType === AMARA_ACTIONS.OPEN_HOUSEKEEPING_OPTIONS) {
      activeGuestTab = 'room-service';
      automationEngine.showToast('🛎️ Housekeeping', 'Viewing housekeeping and room amenities.', 'info');
    } else if (actionType === AMARA_ACTIONS.OPEN_FOLIO) {
      activeGuestTab = 'folio';
    } else if (actionType === AMARA_ACTIONS.OPEN_AMENITIES) {
      activeGuestTab = 'info';
    } else if (actionType === AMARA_ACTIONS.OPEN_NEARBY) {
      activeGuestTab = 'nearby';
    } else if (actionType === AMARA_ACTIONS.OPEN_FRONT_DESK) {
      activeGuestTab = 'contact';
    }

    if (window.renderApp) window.renderApp();
    if (typeof window.scrollTo === 'function') window.scrollTo({ top: 0, behavior: 'smooth' });

    // Auto-minimize AI Assistant Modal after 1.8s so guest immediately sees and interacts with the opened menu
    setTimeout(() => {
      if (typeof window.toggleAIAssistant === 'function') {
        window.toggleAIAssistant(false);
      }
    }, 1800);
  };
  window.tolaniActionExecutor = window.amaraActionExecutor;

  window.setMenuCategory = (cat) => {
    selectedCategory = cat;
    if (window.renderApp) window.renderApp();
  };

  window.toggleAddonSelection = (itemId, addonId) => {
    if (!orderDraftExtras[itemId]) {
      orderDraftExtras[itemId] = [];
    }
    const idx = orderDraftExtras[itemId].indexOf(addonId);
    if (idx > -1) {
      orderDraftExtras[itemId].splice(idx, 1);
    } else {
      orderDraftExtras[itemId].push(addonId);
    }
    if (window.renderApp) window.renderApp();
  };

  window.addToCart = (menuId) => {
    const state = store.getState();
    const item = state.menu.find(m => m.id === menuId);
    if (!item) return;

    const selectedAddonIds = orderDraftExtras[menuId] || [];
    const chosenAddons = item.addons.filter(a => selectedAddonIds.includes(a.id));
    const specialNotes = document.getElementById(`notes-${menuId}`)?.value || '';

    cart.push({
      menuId: item.id,
      name: item.name,
      basePrice: item.price,
      quantity: 1,
      extras: chosenAddons,
      specialInstructions: specialNotes,
      prepTimeMinutes: item.prepTimeMinutes || 20
    });

    orderDraftExtras[menuId] = [];
    automationEngine.playChime('bell');
    automationEngine.showToast('Item Added to Order', `${item.name} added to your order tray.`, 'success');
    if (window.renderApp) window.renderApp();
  };

  // Section 2: Restaurant Selection -> Tolani Follow-Up (Offer Drinks/Snacks/Desserts)
  window.proceedToRestaurantUpsellOrReview = () => {
    if (cart.length === 0) {
      alert('Your order tray is currently empty. Please select an item from the menu.');
      return;
    }

    const guest = store.getActiveGuest();

    // Tolani immediately acknowledges selection and asks prompt
    aiEngine.speak(`Thank you, ${guest.name}. I've received your selection. Would you like to add a drink, snack or dessert to your order?`);

    restaurantFlowStep = 'UPSELL_PROMPT';

    if (window.renderApp) window.renderApp();
    if (typeof window.scrollTo === 'function') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Guest clicks YES to add drinks/snacks/desserts
  window.onSelectUpsellYes = () => {
    const guest = store.getActiveGuest();
    aiEngine.speak(`Certainly, ${guest.name}. I'll show you the available options.`);
    restaurantFlowStep = 'UPSELL_OPTIONS';
    if (window.renderApp) window.renderApp();
    if (typeof window.scrollTo === 'function') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Guest clicks NO to continue to review
  window.onSelectUpsellNo = () => {
    const guest = store.getActiveGuest();
    aiEngine.speak(`Certainly, ${guest.name}. Let me show you your order for confirmation.`);
    restaurantFlowStep = 'REVIEW';
    if (window.renderApp) window.renderApp();
    if (typeof window.scrollTo === 'function') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When adding upsell item
  window.addUpsellItemToCart = (menuId) => {
    const guest = store.getActiveGuest();
    window.addToCart(menuId);
    aiEngine.speak(`Thank you, ${guest.name}. I've added your selections. Let me show you your updated order.`);
    restaurantFlowStep = 'REVIEW';
    if (window.renderApp) window.renderApp();
    if (typeof window.scrollTo === 'function') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Section 3: Open Order Review
  window.openRestaurantOrderReview = () => {
    if (cart.length === 0) return;
    const guest = store.getActiveGuest();
    restaurantFlowStep = 'REVIEW';

    aiEngine.speak(`Please review your order, ${guest.name}. Once you're happy with your selection, I'll send it to our kitchen.`);

    if (window.renderApp) window.renderApp();
    if (typeof window.scrollTo === 'function') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Edit current order
  window.editRestaurantOrder = () => {
    restaurantFlowStep = 'MENU';
    activeGuestTab = 'restaurant';
    if (window.renderApp) window.renderApp();
    if (typeof window.scrollTo === 'function') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Section 4: Final Order Confirmation & Kitchen Routing
  window.confirmAndDispatchRestaurantOrder = () => {
    if (cart.length === 0) return;

    const guest = store.getActiveGuest();
    const totalAmount = cart.reduce((sum, item) => {
      const extrasSum = (item.extras || []).reduce((es, e) => es + e.price, 0);
      return sum + (item.basePrice + extrasSum) * item.quantity;
    }, 0);

    const maxPrepTime = Math.max(...cart.map(c => c.prepTimeMinutes || 20), 20);

    // Create Genuine Order with STATUS = SUBMITTED
    const newOrder = store.createOrder({
      items: [...cart],
      totalAmount,
      prepTimeMinutes: maxPrepTime,
      deliveryMinutes: 15,
      estimatedMinutes: maxPrepTime + 15
    });

    cart = [];
    restaurantFlowStep = 'CONFIRMED';
    activeTrackedOrderId = newOrder.id;

    // Kitchen receives order alert
    automationEngine.playChime('order');
    automationEngine.showToast('👨‍🍳 Kitchen Alert', `Attention: New restaurant order from Room ${guest.roomNumber}.`, 'info');

    const formattedDeliveryTime = (newOrder.estimatedDeliveryAt && !isNaN(new Date(newOrder.estimatedDeliveryAt).getTime()))
      ? new Date(newOrder.estimatedDeliveryAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      : `~${newOrder.estimatedMinutes || 25} mins`;

    // Tolani speaks configured preparation and delivery timing sequentially
    aiEngine.speakSequence([
      `Thank you, ${guest.name}. Your order has been confirmed and sent to our kitchen. Your order is expected to be prepared in approximately ${newOrder.preparationMinutes} minutes and delivered to your room by approximately ${formattedDeliveryTime}.`,
      `Is there anything else I can assist you with while we prepare your order?`
    ]);

    // Automatically navigate to dedicated isolated Order Tracker page
    activeGuestTab = 'order-tracker';
    if (window.renderApp) window.renderApp();
    if (typeof window.scrollTo === 'function') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dedicated Isolated Tracker Navigation
  window.navigateToOrderTracker = (orderId = null) => {
    activeGuestTab = 'order-tracker';
    if (orderId) {
      activeTrackedOrderId = orderId;
    }
    if (window.renderApp) window.renderApp();
    if (typeof window.scrollTo === 'function') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Additional Order: Allows placing an additional order without destroying current active orders
  window.startAdditionalRestaurantOrder = () => {
    cart = [];
    restaurantFlowStep = 'MENU';
    activeGuestTab = 'restaurant';
    if (window.renderApp) window.renderApp();
    if (typeof window.scrollTo === 'function') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- VIP TRANSPORTATION STATE HANDLERS ---
  window.setTransportMode = (mode) => {
    selectedTransportMode = mode;
    if (window.renderApp) window.renderApp();
  };

  window.setTransportZone = (zoneId) => {
    selectedZoneId = zoneId;
    const state = store.getState();
    const zone = (state.lagosZones || []).find(z => z.id === zoneId);
    if (zone && Array.isArray(zone.locations) && zone.locations.length > 0) {
      selectedDestinationLocation = zone.locations[0];
    }
    if (window.renderApp) window.renderApp();
  };

  window.setTransportLocation = (loc) => {
    selectedDestinationLocation = loc;
    if (window.renderApp) window.renderApp();
  };

  window.setTransportVehicle = (vehId) => {
    selectedVehicleId = vehId;
    if (window.renderApp) window.renderApp();
  };

  window.setTransportDate = (d) => {
    selectedDepartureDate = d;
  };

  window.setTransportTime = (t) => {
    selectedDepartureTime = t;
  };

  window.setTransportPassengers = (p) => {
    selectedPassengers = parseInt(p, 10) || 1;
    if (window.renderApp) window.renderApp();
  };

  window.openTransportBookingReview = () => {
    showTransportReviewModal = true;
    const guest = store.getActiveGuest();
    aiEngine.speak(`Certainly, ${guest.name}. Please review your transportation details before confirmation.`);
    if (window.renderApp) window.renderApp();
  };

  window.closeTransportBookingReview = () => {
    showTransportReviewModal = false;
    if (window.renderApp) window.renderApp();
  };

  window.confirmTransportBooking = () => {
    const state = store.getState();
    const guest = store.getActiveGuest();
    const isCharter = selectedTransportMode === 'FULL_DAY_CHARTER';
    const zone = state.lagosZones.find(z => z.id === selectedZoneId) || state.lagosZones[0];
    const veh = state.vehicleClasses.find(v => v.id === selectedVehicleId) || state.vehicleClasses[0];

    const locList = Array.isArray(zone.locations) ? zone.locations : (typeof zone.locations === 'string' ? zone.locations.split(',').map(s => s.trim()) : []);
    const destinationLabel = isCharter 
      ? `Full-Day Luxury Charter (${zone.name})` 
      : (selectedDestinationLocation ? `${selectedDestinationLocation} (${zone.name})` : (locList[0] || zone.name));

    const fare = isCharter ? veh.charterDailyRate : Math.round(zone.baseFare * veh.multiplier);

    const booking = store.createTransportRequest({
      serviceType: selectedTransportMode,
      zoneId: zone.id,
      destination: destinationLabel,
      zoneName: zone.name,
      departureDate: selectedDepartureDate,
      departureTime: selectedDepartureTime,
      vehicleClassId: veh.id,
      vehicle: `${veh.name} (${veh.models})`,
      passengers: selectedPassengers,
      price: fare
    });

    showTransportReviewModal = false;
    automationEngine.playChime('bell');
    automationEngine.showToast('🚗 Transportation Confirmed', `Chauffeured ${veh.name} booked for ${booking.departureTime}.`, 'success');
    
    aiEngine.speakSequence([
      `Thank you, ${guest.name}. Your luxury transportation to ${booking.destination} has been scheduled for ${booking.departureDate} at ${booking.departureTime}.`,
      `Lead Driver Ibrahim Bello has been assigned and will meet you at the hotel entrance.`
    ]);

    if (window.renderApp) window.renderApp();
  };

  window.openTransportRescheduleModal = (bookingId) => {
    showTransportRescheduleModal = bookingId;
    if (window.renderApp) window.renderApp();
  };

  window.closeTransportRescheduleModal = () => {
    showTransportRescheduleModal = null;
    if (window.renderApp) window.renderApp();
  };

  window.submitTransportReschedule = (bookingId) => {
    const newDate = document.getElementById(`resched-date-${bookingId}`)?.value;
    const newTime = document.getElementById(`resched-time-${bookingId}`)?.value;
    if (!newDate || !newTime) {
      alert('Please select both a new date and time for departure.');
      return;
    }
    const guest = store.getActiveGuest();
    store.rescheduleTransport(bookingId, newDate, newTime);
    showTransportRescheduleModal = null;
    automationEngine.showToast('📅 Ride Rescheduled', `Departure time updated to ${newDate} at ${newTime}.`, 'success');
    aiEngine.speak(`Certainly, ${guest.name}. Your transportation departure has been rescheduled to ${newDate} at ${newTime}. Your countdown has been updated.`);
    if (window.renderApp) window.renderApp();
  };

  // --- SERVICE EXPERIENCE FEEDBACK HANDLERS ---
  window.openServiceFeedbackModal = (serviceType) => {
    showFeedbackModal = { serviceType };
    if (window.renderApp) window.renderApp();
  };

  window.closeServiceFeedbackModal = () => {
    showFeedbackModal = null;
    if (window.renderApp) window.renderApp();
  };

  window.submitServiceFeedback = (serviceType, rating, satisfaction, issue = null, comment = '') => {
    const guest = store.getActiveGuest();
    store.recordFeedback({
      id: `FDB-${Date.now()}`,
      timestamp: new Date().toISOString(),
      guestId: guest.id,
      guestName: guest.name,
      roomNumber: guest.roomNumber,
      serviceType,
      rating: parseInt(rating, 10) || 5,
      satisfaction,
      issue,
      comment
    });
    showFeedbackModal = null;
    automationEngine.showToast('⭐ Thank You', 'Your feedback has been recorded by Hotel Capitol management.', 'success');
    if (rating >= 4 || satisfaction === 'YES') {
      aiEngine.speak(`Thank you for your kind feedback, ${guest.name}. It is our honor to serve you.`);
    } else {
      aiEngine.speak(`I apologize for any inconvenience, ${guest.name}. I have shared your feedback directly with our duty supervisor to ensure we improve.`);
    }
    if (window.renderApp) window.renderApp();
  };

  // Breakfast selection submission
  window.submitBreakfastSelection = (isPaid = false) => {
    const guest = store.getActiveGuest();
    const selectedOption = document.querySelector('input[name="breakfast-option"]:checked')?.value || 'The English Royal Breakfast';
    const deliveryTime = document.getElementById('breakfast-delivery-time')?.value || '07:30 AM';
    
    // Check upsell add-ons
    const upsellItems = [];
    let extraCharge = 0;
    document.querySelectorAll('.breakfast-upsell-checkbox:checked').forEach(cb => {
      upsellItems.push(cb.dataset.name);
      extraCharge += parseInt(cb.dataset.price || '0', 10);
    });

    store.setState(s => ({
      ...s,
      guests: s.guests.map(g => g.id === guest.id ? {
        ...g,
        breakfastSelected: true,
        breakfastTime: deliveryTime,
        breakfastItems: [selectedOption, ...upsellItems]
      } : g)
    }));

    if (extraCharge > 0) {
      const folioItem = {
        id: 'FOL-' + Date.now().toString().slice(-4),
        date: new Date().toISOString().split('T')[0],
        desc: `Breakfast Add-on: ${upsellItems.join(', ')}`,
        amount: extraCharge,
        category: 'Restaurant',
        status: 'Posted'
      };
      store.setState(s => ({
        ...s,
        guests: s.guests.map(g => g.id === guest.id ? { ...g, folio: [...g.folio, folioItem] } : g)
      }));
    }

    store.createServiceRequest('Breakfast', `Breakfast Delivery for ${deliveryTime}`, `${selectedOption} + Extras: ${upsellItems.join(', ') || 'None'} for Suite ${guest.roomNumber}`, 'NORMAL');

    automationEngine.playChime('bell');
    automationEngine.showToast('Breakfast Confirmed', `Scheduled for delivery at ${deliveryTime} to Suite ${guest.roomNumber}.`, 'success');
    aiEngine.speak(`Your breakfast selection has been confirmed for ${deliveryTime} delivery to Suite ${guest.roomNumber}.`);
    if (window.renderApp) window.renderApp();
  };

  // Voice speech input for room service
  window.toggleServiceVoiceInput = () => {
    const input = document.getElementById('room-service-custom-text');
    if (!input) return;

    if (isVoiceActiveForService) {
      aiEngine.stopListening();
      isVoiceActiveForService = false;
      if (window.renderApp) window.renderApp();
    } else {
      isVoiceActiveForService = true;
      if (window.renderApp) window.renderApp();
      aiEngine.listen(
        (transcript) => {
          isVoiceActiveForService = false;
          const targetInput = document.getElementById('room-service-custom-text');
          if (targetInput) targetInput.value = transcript;
          if (window.renderApp) window.renderApp();
        },
        () => {
          isVoiceActiveForService = false;
          if (window.renderApp) window.renderApp();
        },
        (err) => {
          isVoiceActiveForService = false;
          automationEngine.showToast('Voice Notice', 'Speech recognition: ' + err, 'info');
          if (window.renderApp) window.renderApp();
        }
      );
    }
  };

  // Submit quick service request
  window.submitQuickService = (serviceType, title) => {
    const req = store.createServiceRequest('Housekeeping', title, `Quick Guest Request from Portal for Suite ${store.getActiveGuest().roomNumber}`, 'HIGH');
    automationEngine.playChime('bell');
    automationEngine.showToast('Service Request Dispatched', `${title} registered (${req.id}). Housekeeping notified.`, 'success');
    aiEngine.speak(`Your request for ${title} has been logged and assigned to housekeeping.`);
    if (window.renderApp) window.renderApp();
  };

  // Submit Porter Luggage Request (Section 19 - Strictly PORTER)
  window.submitPorterRequest = (location) => {
    const guest = store.getActiveGuest();
    const req = store.createServiceRequest(
      'Porter',
      `Luggage Porter Assistance (${location})`,
      `Guest Luggage Assistance Request for Suite #${guest.roomNumber} (${location})`,
      'HIGH',
      'Lead Porter Ibrahim',
      'Porter'
    );
    automationEngine.playChime('bell');
    automationEngine.showToast('🧳 Porter Dispatched', `Luggage assistance requested for ${location}. Ticket ${req.id} sent to Porter Department.`, 'success');
    
    // Porter department audible alert and guest confirmation
    aiEngine.speak(`New porter assistance request from Room ${guest.roomNumber}.`);
    
    setTimeout(() => {
      aiEngine.speak(`Your porter assistance request has been confirmed. Mary and our concierge team will be with you shortly.`);
    }, 2400);

    showPorterLocationModal = false;
    if (window.renderApp) window.renderApp();
  };

  // Submit custom room service
  window.submitCustomRoomService = () => {
    const text = document.getElementById('room-service-custom-text')?.value.trim();
    if (!text) {
      alert('Please describe your room service request or use voice dictation.');
      return;
    }
    const guest = store.getActiveGuest();
    const req = store.createServiceRequest('Housekeeping', 'Custom Housekeeping Request', text, 'HIGH', 'Amara Nwosu', 'Housekeeping');
    automationEngine.playChime('bell');
    automationEngine.showToast('Request Created', `Housekeeping ticket ${req.id} created: "${text}"`, 'success');
    aiEngine.speak(`New housekeeping request from Room ${guest.roomNumber}.`);
    const customInp = document.getElementById('room-service-custom-text');
    if (customInp) customInp.value = '';
    if (window.renderApp) window.renderApp();
  };

  // Transport Booking & Simulated Payment
  window.bookTransportation = (destId, vehicleIdx) => {
    const state = store.getState();
    const dest = state.transportOptions.find(t => t.id === destId);
    if (!dest) return;
    const vehicle = dest.vehicles[vehicleIdx];
    const guest = store.getActiveGuest();
    const pickupTime = document.getElementById(`pickup-${destId}`)?.value || 'Immediate (15 mins)';

    const bookingId = 'TBK-' + (state.transportBookings.length + 101);
    
    // Simulate payment modal
    const proceed = confirm(`Confirm booking for ${vehicle.type} to ${dest.destination}?\nTotal: ₦${vehicle.price.toLocaleString()}\nPayment will be processed via Hotel Capitol Pay.`);
    if (!proceed) return;

    // Simulate payment states
    const newBooking = {
      id: bookingId,
      guestId: guest.id,
      guestName: guest.name,
      roomNumber: guest.roomNumber,
      destination: dest.destination,
      pickupTime,
      vehicle: vehicle.type,
      passengers: 2,
      price: vehicle.price,
      paymentStatus: 'PAYMENT SUCCESS', // Simulated verified payment
      status: 'CONFIRMED'
    };

    // Add to folio
    const folioItem = {
      id: 'FOL-' + Date.now().toString().slice(-4),
      date: new Date().toISOString().split('T')[0],
      desc: `Chauffeur Transit: ${dest.destination} (${vehicle.type})`,
      amount: vehicle.price,
      category: 'Transportation',
      status: 'Posted'
    };

    store.setState(s => ({
      ...s,
      transportBookings: [newBooking, ...s.transportBookings],
      guests: s.guests.map(g => g.id === guest.id ? { ...g, folio: [...g.folio, folioItem] } : g)
    }));

    store.createServiceRequest('Concierge', `VIP Chauffeur Transfer: ${dest.destination}`, `${vehicle.type} booked for ${pickupTime}. Payment Verified: ₦${vehicle.price.toLocaleString()}`, 'HIGH');

    automationEngine.playChime('success');
    automationEngine.showToast('Ride Confirmed (Payment Success)', `Your executive transfer to ${dest.destination} is confirmed. Driver dispatched.`, 'success');
    aiEngine.speak(`Your transportation to ${dest.destination} has been booked and charged to your folio.`);
    if (window.renderApp) window.renderApp();
  };

  // Register global triggers for automation modals
  window.onTriggerBreakfastModal = () => {
    window.navigateGuestTab('breakfast');
  };
  window.onTriggerRoomServiceModal = () => {
    window.navigateGuestTab('room-service');
  };
  window.onTriggerCheckoutModal = () => {
    window.navigateGuestTab('checkout');
  };
}

export function renderGuestPortal() {
  const state = store.getState();
  const guest = store.getActiveGuest() || store.getState().guests[0];
  const totalFolio = (guest?.folio || []).reduce((sum, item) => sum + item.amount, 0);
  const activeOrders = state.orders.filter(o => o.guestId === (guest ? guest.id : '') && o.status !== 'DELIVERED');

  let tabContent = '';

  if (activeGuestTab === 'home') {
    tabContent = renderGuestHomeCards(guest, activeOrders);
  } else if (activeGuestTab === 'restaurant') {
    tabContent = renderRestaurantSection(guest);
  } else if (activeGuestTab === 'order-tracker') {
    tabContent = renderIsolatedOrderTrackerPage(guest, activeTrackedOrderId);
  } else if (activeGuestTab === 'breakfast') {
    tabContent = renderBreakfastSection(guest);
  } else if (activeGuestTab === 'room-service') {
    tabContent = renderRoomServiceSection(guest);
  } else if (activeGuestTab === 'transport') {
    tabContent = renderTransportSection(guest);
  } else if (activeGuestTab === 'concierge') {
    tabContent = renderConciergeSection(guest);
  } else if (activeGuestTab === 'folio') {
    tabContent = renderFolioSection(guest, totalFolio);
  } else if (activeGuestTab === 'nearby') {
    tabContent = renderNearbySection();
  } else if (activeGuestTab === 'info') {
    tabContent = renderHotelInfoSection();
  } else if (activeGuestTab === 'checkout') {
    tabContent = renderCheckoutSection(guest);
  } else if (activeGuestTab === 'contact') {
    tabContent = renderContactSection();
  }

  // Safe arrival time computation for active order alert banner (WebKit compliant)
  let activeOrderArrivalStr = '';
  if (activeOrders.length > 0) {
    const firstOrd = activeOrders[0];
    const targetTime = firstOrd.revisedDeliveryAt || firstOrd.estimatedDeliveryAt;
    if (targetTime) {
      const d = new Date(targetTime);
      activeOrderArrivalStr = !isNaN(d.getTime()) ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : `~${firstOrd.estimatedMinutes || 25} mins`;
    } else {
      activeOrderArrivalStr = `~${firstOrd.estimatedMinutes || 25} mins`;
    }
  }

  return `
    <div class="container-custom py-6">
      
      <!-- GUEST PERSONALIZED WELCOME BANNER -->
      <div class="glass-panel-gold p-6 rounded-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-bold uppercase tracking-luxury text-gold">Hotel Capitol Resident</span>
            ${guest.vip ? '<span class="badge-gold text-xs">⭐ VIP GUEST</span>' : ''}
          </div>
          <h1 class="text-2xl sm:text-3xl font-serif text-white font-bold">
            Welcome, ${guest.name}
          </h1>
          <p class="text-xs sm:text-sm text-slate-300 mt-1">
            <strong class="text-white">Suite #${guest.roomNumber}</strong> · ${guest.roomType} · Stay: <strong>${formatStayDate(guest.checkIn)} to ${formatStayDate(guest.checkOut)}</strong>
          </p>
        </div>

        ${activeGuestTab !== 'home' ? `
          <div class="flex items-center gap-2.5 w-full sm:w-auto mt-3 sm:mt-0">
            <button class="btn-secondary py-2 px-4 text-xs font-semibold w-full sm:w-auto text-center" onclick="window.navigateGuestTab('home')">
              ← Main Menu
            </button>
          </div>
        ` : ''}
      </div>

      <!-- ACTIVE ORDERS ALERT BAR (Visible on any tab except isolated order-tracker) -->
      ${activeOrders.length > 0 && activeGuestTab !== 'order-tracker' ? `
        <div class="glass-panel p-4 rounded-xl mb-6 border-2 border-gold/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-navy-950/90 shadow-lg">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full bg-gold animate-ping"></div>
            <div>
              <div class="text-xs font-bold text-white">Active Restaurant Order: ${activeOrders[0].id} (${activeOrders[0].items.map(i => `${i.quantity}x ${i.name}`).join(', ')})</div>
              <div class="text-xs text-gold mt-0.5">Status: <strong class="uppercase">${(activeOrders[0].status || 'PREPARING').replace(/_/g, ' ')}</strong> · Est. Room Arrival: <strong>${activeOrderArrivalStr}</strong></div>
            </div>
          </div>
          <button class="btn-primary text-xs py-1.5 px-4 font-bold whitespace-nowrap shadow-md" onclick="window.navigateToOrderTracker('${activeOrders[0].id}')">
            Track Active Order →
          </button>
        </div>
      ` : ''}

      <!-- TAB CONTENT RENDER -->
      ${tabContent}

    </div>
  `;
}

// 1. GUEST PORTAL HOME - SERVICE CARDS + SUITE DIRECT INTERCOM BAR
function renderGuestHomeCards(guest, activeOrders) {
  const cards = [
    { id: 'restaurant', icon: '🍽', title: 'Restaurant & Dining', badge: 'Popular', serviceKey: 'RESTAURANT' },
    { id: 'breakfast', icon: '☕', title: 'Breakfast Service', badge: guest.breakfastEntitlement === 'Complimentary' ? 'Complimentary' : 'Available', serviceKey: 'BREAKFAST' },
    { id: 'room-service', icon: '🛎', title: 'Room Service & Cleaning', badge: 'On Demand', serviceKey: 'HOUSEKEEPING' },
    { id: 'transport', icon: '🚕', title: 'VIP Transportation', badge: 'Instant Quote', serviceKey: 'VIP_TRANSPORTATION' },
    { id: 'concierge', icon: '🧳', title: 'Mary · Concierge & Porter', badge: '24/7 Support', serviceKey: 'CONCIERGE_PORTER' },
    { id: 'folio', icon: '🧾', title: 'My Bill & Folio', badge: `₦${guest.folio.reduce((a, b) => a + b.amount, 0).toLocaleString()}`, serviceKey: 'FOLIO' },
    { id: 'nearby', icon: '📍', title: 'Near Hotel Capitol', badge: 'Ikeja Guide', serviceKey: 'NEAR_HOTEL' },
    { id: 'info', icon: '🏨', title: 'Hotel Amenities & WiFi', badge: 'Hotel Info', serviceKey: 'AMENITIES' },
    { id: 'contact', icon: '📞', title: 'Contact Front Desk', badge: 'Live Desk', serviceKey: 'FRONT_DESK' }
  ];

  return `
    <!-- SUITE DIRECT INTERCOM CARD (3 Dedicated Service Entry Points) -->
    <div class="intercom-banner-gold p-6 sm:p-8 rounded-2xl mb-8 flex flex-col items-start justify-between min-h-[260px] gap-6">
      
      <!-- Top Row: Icon + Title + Line Live Label -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full border-b border-black/20 pb-5">
        <div class="flex items-center gap-3.5">
          <div class="p-2.5 rounded-xl bg-black/10 border border-black/25 flex items-center justify-center">
            ${renderIntercomBlackBadge(28)}
          </div>
          <div>
            <h3 class="font-serif text-lg sm:text-xl font-black tracking-luxury uppercase" style="color: #000000 !important;">
              SUITE #${guest.roomNumber} DIRECT INTERCOM
            </h3>
            <p class="text-xs sm:text-sm font-bold mt-1" style="color: #000000 !important;">
              Instant dedicated service communication dispatch to Hotel Capitol staff departments.
            </p>
          </div>
        </div>

        <!-- Line Live Label -->
        <div class="line-live-badge self-start sm:self-auto">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-700 animate-pulse"></span>
          <span>Line Live</span>
        </div>
      </div>

      <!-- Exactly Three Service Intercom CTAs (Touch friendly, >=44px, wrap naturally) -->
      <div class="flex flex-col sm:flex-row items-stretch gap-3.5 w-full pt-2 pb-1 flex-wrap">
        <button 
          class="intercom-gold-tab-btn flex-1 min-h-[44px] justify-center sm:justify-start" 
          onclick="window.activateGuestServiceIntercom('BREAKFAST');" 
          title="Intercom Breakfast Service"
        >
          ${renderIntercomBlackBadge(20)} <span>INTERCOM BREAKFAST SERVICE</span>
        </button>
        <button 
          class="intercom-gold-tab-btn flex-1 min-h-[44px] justify-center sm:justify-start" 
          onclick="window.activateGuestServiceIntercom('TRANSPORT');" 
          title="Intercom VIP Transportation"
        >
          ${renderIntercomBlackBadge(20)} <span>INTERCOM VIP TRANSPORTATION</span>
        </button>
        <button 
          class="intercom-gold-tab-btn flex-1 min-h-[44px] justify-center sm:justify-start" 
          onclick="window.activateGuestServiceIntercom('CONCIERGE');" 
          title="Intercom Mary Concierge"
        >
          ${renderIntercomBlackBadge(20)} <span>INTERCOM CONCIERGE</span>
        </button>
      </div>

    </div>

    <!-- Cards Container -->
    <div class="grid-responsive-cards mb-6">
      ${cards.map(c => `
        <div 
          class="service-card flex flex-col justify-between cursor-pointer transform hover:-translate-y-1 transition-all"
          onclick="window.navigateGuestTab('${c.id}')"
          style="box-shadow: 0 4px 20px rgba(0,0,0,0.4), inset 0 0 10px rgba(220, 173, 84, 0.05);"
        >
          <div>
            ${c.id === 'breakfast' ? `
              <!-- BREAKFAST SERVICE - Coffee cup icon above label -->
              <div class="flex flex-col items-start gap-2 mb-3">
                <div class="service-card-icon">${c.icon}</div>
                ${c.badge ? `<span class="badge-gold" style="align-self: flex-start; margin-top: 2px;">${c.badge}</span>` : ''}
              </div>
            ` : `
              <!-- Centered Side-by-Side Icon & Badge Row -->
              <div class="service-card-top-row">
                <div class="service-card-icon">${c.icon}</div>
                ${c.badge ? `
                  <span 
                    class="badge-gold ${c.id === 'concierge' || c.id === 'folio' ? 'badge-shifted-left' : ''}" 
                    style="${c.id === 'concierge' || c.id === 'folio' ? 'margin-right: 10px; box-sizing: border-box;' : ''}"
                  >
                    ${c.badge}
                  </span>
                ` : ''}
              </div>
            `}
            <h3 class="font-serif text-base text-white font-bold tracking-wide">${c.title}</h3>
          </div>

          <!-- Explore CTA (No Intercom Icon) -->
          <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
            <span class="text-gold font-bold text-xs flex items-center gap-1.5 hover:text-white transition-colors">
              <span>EXPLORE</span> 
              <span class="text-sm font-bold">→</span>
            </span>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Modest structural buffer so scroll ends in 1 light swipe while keeping space above bottom navigation -->
    <div style="height: 20px; width: 100%; pointer-events: none;" aria-hidden="true"></div>
  `;
}

// 2. RESTAURANT & MENU SECTION (Dedicated Menu & Creation Flow - NOT attached to Tracker)
function renderRestaurantSection(guest) {
  const state = store.getState();
  const categories = ['Food', 'Drinks', 'Breakfast', 'Desserts', 'Snacks'];
  const filteredMenu = state.menu.filter(m => m.category === selectedCategory);

  const cartTotal = cart.reduce((sum, item) => {
    const extrasSum = (item.extras || []).reduce((es, e) => es + e.price, 0);
    return sum + (item.basePrice + extrasSum) * item.quantity;
  }, 0);

  // If currently in UPSELL_PROMPT step
  if (restaurantFlowStep === 'UPSELL_PROMPT') {
    return renderRestaurantUpsellPrompt(guest, cart, cartTotal);
  }

  // If currently in UPSELL_OPTIONS step
  if (restaurantFlowStep === 'UPSELL_OPTIONS') {
    return renderRestaurantUpsellOptions(guest, cart, cartTotal);
  }

  // If currently in REVIEW step
  if (restaurantFlowStep === 'REVIEW') {
    return renderRestaurantReviewStep(guest, cart, cartTotal);
  }

  // If currently in CONFIRMED step
  if (restaurantFlowStep === 'CONFIRMED') {
    const confirmedOrder = (activeTrackedOrderId && state.orders.find(o => o.id === activeTrackedOrderId)) ||
                           state.orders.find(o => o.guestId === guest.id) ||
                           state.orders[0];
    return renderRestaurantConfirmationStep(guest, confirmedOrder);
  }

  const totalItemCount = cart.reduce((acc, itm) => acc + itm.quantity, 0);

  return `
    <div class="flex flex-col gap-6 animate-fade-in">
      
      <!-- TOP REVIEW ORDER CTA (Visible at top across all categories) -->
      <div class="glass-panel-gold p-4 rounded-2xl border-2 border-gold/50 flex items-center justify-between gap-4 shadow-xl flex-wrap">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-2xl text-gold">
            🛒
          </div>
          <div>
            <div class="font-serif font-bold text-white text-sm sm:text-base tracking-wide">RESTAURANT ORDER TRAY</div>
            <div class="text-xs text-slate-300">
              ${totalItemCount === 0 ? 'Your tray is currently empty — select dishes below' : `<strong class="text-gold font-bold">${totalItemCount} items selected</strong> · ₦${cartTotal.toLocaleString()}`}
            </div>
          </div>
        </div>

        <button 
          class="btn-primary py-3 px-6 text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2 ${totalItemCount === 0 ? 'opacity-60 cursor-not-allowed' : ''}"
          onclick="if(${totalItemCount} > 0) { window.openRestaurantOrderReview(); } else { alert('Please select menu items into your tray first.'); }"
          title="Review full itemized tray and place kitchen order"
        >
          <span>REVIEW ORDER (${totalItemCount} ITEMS · ₦${cartTotal.toLocaleString()})</span>
          <span>→</span>
        </button>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        
        <!-- Left: Menu Browser -->
        <div class="flex-1">
          
          <div class="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <div>
              <h2 class="text-xl sm:text-2xl font-serif text-white font-bold">Hotel Capitol Restaurant</h2>
              <p class="text-xs text-slate-300">Gourmet culinary experiences prepared fresh by Executive Chef Babatunde.</p>
            </div>
            <button 
              class="intercom-pill-btn"
              onclick="window.activateTolaniIntercom('RESTAURANT', 'Kitchen & Dining');"
              title="Direct intercom to Executive Chef Babatunde & Kitchen"
            >
              ${renderIntercomRoundBadge(18)}
              <span>Intercom Kitchen</span>
            </button>
          </div>

          <!-- Category Selector -->
          <div class="category-pills-bar mb-6">
            ${categories.map(cat => `
              <button 
                class="category-pill-btn ${selectedCategory === cat ? 'active' : ''}"
                onclick="window.setMenuCategory('${cat}')"
              >
                <span>${cat === 'Food' ? '🍲' : cat === 'Drinks' ? '🍹' : cat === 'Breakfast' ? '🍳' : cat === 'Desserts' ? '🍰' : '🥨'}</span>
                <span>${cat}</span>
              </button>
            `).join('')}
          </div>

          <!-- Menu Items List -->
          <div class="menu-catalog-grid">
            ${filteredMenu.map(item => {
              const selectedAddonIds = orderDraftExtras[item.id] || [];
              return `
                <div class="food-card">
                  
                  <!-- 1. Dedicated Image Container -->
                  <div class="food-card-media">
                    <img src="${item.image}" alt="${item.name}" class="food-card-img" />
                    <div class="food-card-media-badges-left">
                      <span class="food-pill-badge food-pill-category">
                        ${item.category || 'Specialty'}
                      </span>
                      <span class="food-pill-badge food-pill-published">Available</span>
                    </div>
                  </div>

                  <!-- 2. Strict Vertical Hierarchy Body -->
                  <div class="food-card-body">
                    <div>
                      <!-- Header: Title & Price -->
                      <div class="food-card-header">
                        <h3 class="food-card-title">${item.name}</h3>
                        <div class="food-card-price">
                          ₦${item.price.toLocaleString()}
                        </div>
                      </div>

                      <!-- Preparation Time & Delivery SLA -->
                      <div class="food-card-meta">
                        <span class="food-card-meta-item">
                          ${getIcon('clock', 12)} ~${item.prepTimeMinutes || 20}m prep
                        </span>
                        <span class="food-card-meta-item">
                          🚴 ~${item.estimatedDeliveryMinutes || 15}m delivery
                        </span>
                      </div>

                      <!-- Description -->
                      <p class="food-card-desc">${item.desc}</p>
                      
                      <!-- Configurable Add-ons / Extras -->
                      ${item.addons && item.addons.length > 0 ? `
                        <div class="food-card-extras-box">
                          <div class="food-card-extras-header">
                            <span>Optional Extras & Add-ons:</span>
                            <span class="text-slate-400 font-normal text-[10px]">Select below</span>
                          </div>
                          <div class="food-card-extras-list">
                            ${item.addons.map(addon => {
                              const isChecked = selectedAddonIds.includes(addon.id);
                              return `
                                <label class="flex items-center justify-between text-xs text-slate-300 cursor-pointer hover:text-white p-1 rounded hover:bg-white/5">
                                  <span class="flex items-center gap-2">
                                    <input 
                                      type="checkbox" 
                                      ${isChecked ? 'checked' : ''} 
                                      onchange="window.toggleAddonSelection('${item.id}', '${addon.id}')"
                                      class="accent-gold-500"
                                    />
                                    <span>${addon.name}</span>
                                  </span>
                                  <span class="text-gold font-medium">+₦${addon.price.toLocaleString()}</span>
                                </label>
                              `;
                            }).join('')}
                          </div>
                        </div>
                      ` : ''}

                      <!-- Special instructions input -->
                      <input 
                        id="notes-${item.id}"
                        type="text" 
                        placeholder="Special instructions (e.g. less pepper, extra lime)..." 
                        class="input-custom text-xs py-1.5 mb-3"
                      />
                    </div>

                    <!-- Action Button -->
                    <div class="food-card-actions">
                      <button class="btn-primary w-full py-2.5 text-xs font-bold" onclick="window.addToCart('${item.id}')">
                        + Add to Tray (${item.addons && selectedAddonIds.length > 0 ? `${selectedAddonIds.length} extras` : 'Standard'})
                      </button>
                    </div>

                  </div>

                </div>
              `;
            }).join('')}
          </div>

        </div>

        <!-- Right: Active Cart Tray & Live Orders -->
        <div class="w-full lg:w-80 flex flex-col gap-6">
          
          <!-- Cart Tray -->
          <div class="glass-panel-gold p-5 rounded-2xl border border-gold/40 shadow-xl">
            <div class="flex items-center justify-between pb-3 border-b border-gold/30 mb-3">
              <h3 class="font-serif text-sm font-bold text-white tracking-luxury">YOUR ORDER TRAY</h3>
              <span class="badge-gold text-xs">${cart.length} items</span>
            </div>

            ${cart.length === 0 ? `
              <div class="text-center py-8 text-xs text-slate-400">
                Your tray is currently empty.<br/>Select menu items to customize your order.
              </div>
            ` : `
              <div class="flex flex-col gap-3 max-h-60 overflow-y-auto mb-4 pr-1">
                ${cart.map((c, idx) => `
                  <div class="p-2.5 rounded-lg bg-navy-950 border border-white/5 text-xs">
                    <div class="flex items-center justify-between font-semibold text-white">
                      <span>${c.quantity}x ${c.name}</span>
                      <span class="text-gold">₦${c.basePrice.toLocaleString()}</span>
                    </div>
                    ${c.extras && c.extras.length > 0 ? `
                      <div class="text-slate-400 text-xs mt-1 pl-2 border-l border-gold/40">
                        ${c.extras.map(e => `+ ${e.name} (₦${e.price.toLocaleString()})`).join('<br/>')}
                      </div>
                    ` : ''}
                    ${c.specialInstructions ? `
                      <div class="text-slate-400 italic text-xs mt-1">Note: "${c.specialInstructions}"</div>
                    ` : ''}
                    <button class="text-red-400 text-xs mt-1 bg-transparent border-none cursor-pointer" onclick="window.cart.splice(${idx}, 1); renderGuestPortal();">
                      Remove
                    </button>
                  </div>
                `).join('')}
              </div>

              <div class="pt-3 border-t border-gold/30 flex items-center justify-between text-sm font-bold text-white mb-4">
                <span>Total Bill:</span>
                <span class="text-gold text-base">₦${cartTotal.toLocaleString()}</span>
              </div>

              <!-- Proceed with Selection Button -->
              <button class="btn-primary w-full py-2.5 text-xs font-bold shadow-lg" onclick="window.proceedToRestaurantUpsellOrReview()">
                Proceed with Order Selection →
              </button>
            `}
          </div>

          <!-- Recent Suite Orders -->
          <div class="glass-panel p-5 rounded-2xl border border-white/10">
            <h3 class="font-serif text-sm font-bold text-white tracking-luxury mb-3">RECENT SUITE ORDERS</h3>
            ${state.orders.filter(o => o.guestId === guest.id).length === 0 ? `
              <div class="text-xs text-slate-400">No recent orders for Suite ${guest.roomNumber}.</div>
            ` : `
              <div class="flex flex-col gap-3">
                ${state.orders.filter(o => o.guestId === guest.id).map(o => `
                  <div class="p-3 rounded-xl bg-navy-950 border border-gold/30 text-xs">
                    <div class="flex items-center justify-between mb-1">
                      <strong class="text-white">${o.id}</strong>
                      <button class="badge-${o.status === 'DELIVERED' ? 'normal' : o.status === 'PREPARING' ? 'attention' : 'gold'} text-[11px] uppercase font-bold cursor-pointer hover:opacity-80 border-none" onclick="window.navigateToOrderTracker('${o.id}')">
                        ${o.status.replace(/_/g, ' ')} →
                      </button>
                    </div>
                    <div class="text-slate-300 mb-2">${o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</div>
                    
                    <div class="flex items-center justify-between text-slate-400 text-xs pt-2 border-t border-white/5">
                      <span>${o.createdAt}</span>
                      <span class="text-gold font-semibold">₦${o.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

        </div>

      </div>

      <!-- Mobile Sticky Review Order CTA Bar -->
      ${cart.length > 0 ? `
        <div class="mobile-review-order-bar show-mobile-only">
          <button class="mobile-review-order-btn" onclick="window.proceedToRestaurantUpsellOrReview()">
            <span>🛒 REVIEW ORDER • ${cart.length} ${cart.length === 1 ? 'ITEM' : 'ITEMS'}</span>
            <span>₦${cartTotal.toLocaleString()} →</span>
          </button>
        </div>
      ` : ''}

    </div>
  `;
}

// Section 2A: Complementary Item Suggestion Prompt (YES / NO)
function renderRestaurantUpsellPrompt(guest, cart, cartTotal) {
  return `
    <div class="max-w-2xl mx-auto glass-panel p-6 sm:p-8 rounded-2xl border-2 border-gold/50 shadow-2xl text-center animate-fade-in">
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/40 text-gold text-xs font-bold mb-4">
        <span>🤖</span> <span>Tolani Service Assistant</span>
      </div>
      
      <h2 class="text-2xl sm:text-3xl font-serif text-white font-bold mb-2">
        Would you like to add a drink, snack or dessert to your order?
      </h2>
      <p class="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mb-6">
        "Thank you, ${guest.name}. I've received your selection. Would you like to pair your meal with our chef's signature refreshments or artisan sweets?"
      </p>

      <!-- Current Selected Items Tray Snippet -->
      <div class="p-4 rounded-xl bg-navy-950/80 border border-white/10 mb-8 text-left text-xs">
        <div class="font-bold text-gold uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Current Selection Tray:</span>
          <span>${cart.length} items · ₦${cartTotal.toLocaleString()}</span>
        </div>
        <div class="flex flex-col gap-1 text-slate-300">
          ${cart.map(c => `
            <div class="flex items-center justify-between">
              <span>${c.quantity}x ${c.name}</span>
              <span class="text-slate-400">₦${c.basePrice.toLocaleString()}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Two Clear Required Options: YES vs NO -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button 
          class="btn-primary py-3.5 px-6 text-xs sm:text-sm font-bold shadow-xl flex items-center justify-center gap-2"
          onclick="window.onSelectUpsellYes()"
        >
          <span>🍹</span> <span>YES, ADD DRINKS / DESSERTS</span>
        </button>

        <button 
          class="btn-secondary py-3.5 px-6 text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
          onclick="window.onSelectUpsellNo()"
        >
          <span>→</span> <span>NO, CONTINUE TO ORDER REVIEW</span>
        </button>
      </div>

      <div class="mt-4 pt-4 border-t border-white/10 text-center">
        <button class="text-xs text-slate-400 hover:text-white bg-transparent border-none cursor-pointer" onclick="window.editRestaurantOrder()">
          ← Edit Current Food Selection
        </button>
      </div>
    </div>
  `;
}

// Section 2B: Complementary Items Selection Grid (When Guest Clicks YES)
function renderRestaurantUpsellOptions(guest, cart, cartTotal) {
  const state = store.getState();
  const upsellItems = state.menu.filter(m => m.category === 'Drinks' || m.category === 'Desserts' || m.category === 'Snacks').slice(0, 6);

  return `
    <div class="max-w-3xl mx-auto glass-panel p-6 sm:p-8 rounded-2xl border border-gold/40 shadow-2xl animate-fade-in">
      <div class="text-center mb-6 pb-4 border-b border-gold/20">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-bold mb-2">
          <span>🍹</span> <span>Available Drinks, Snacks & Desserts</span>
        </div>
        <h2 class="text-2xl font-serif text-white font-bold">Select Complementary Items</h2>
        <p class="text-xs text-slate-300 mt-1 max-w-lg mx-auto">
          "Certainly. I'll show you the available options. Select any items below to add them to your order."
        </p>
      </div>

      <!-- Quick Add-ons Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        ${upsellItems.map(item => `
          <div class="glass-panel-subtle p-4 rounded-xl border border-white/10 flex items-center justify-between gap-3 hover:border-gold transition-all">
            <div class="flex items-center gap-3">
              <img src="${item.image}" alt="${item.name}" class="w-14 h-14 rounded-xl object-cover border border-white/10" />
              <div>
                <div class="font-serif font-bold text-white text-xs">${item.name}</div>
                <div class="text-gold font-bold text-xs mt-0.5">₦${item.price.toLocaleString()}</div>
                <div class="text-[10px] text-slate-400">${item.category}</div>
              </div>
            </div>
            <button 
              class="btn-primary text-xs py-1.5 px-3 font-bold whitespace-nowrap"
              onclick="window.addUpsellItemToCart('${item.id}');"
            >
              + Add to Order
            </button>
          </div>
        `).join('')}
      </div>

      <!-- Tray Status & Navigation Buttons -->
      <div class="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button 
          class="btn-secondary py-2.5 px-5 text-xs font-semibold w-full sm:w-auto"
          onclick="window.editRestaurantOrder();"
        >
          ← Back to Main Menu
        </button>

        <div class="text-center sm:text-right w-full sm:w-auto">
          <div class="text-xs text-slate-300 mb-1.5">Current Order Tray: <strong class="text-white">${cart.length} items</strong> (₦${cartTotal.toLocaleString()})</div>
          <button 
            class="btn-primary py-2.5 px-6 text-xs font-bold w-full sm:w-auto shadow-lg"
            onclick="window.openRestaurantOrderReview();"
          >
            Continue to Order Review →
          </button>
        </div>
      </div>
    </div>
  `;
}

// Section 3: Order Review Summary Step
function renderRestaurantReviewStep(guest, cart, cartTotal) {
  const maxPrepTime = Math.max(...cart.map(c => {
    const item = store.getState().menu.find(m => m.id === c.menuId);
    return item?.prepTimeMinutes || 20;
  }), 20);

  const deliveryTimeEst = new Date(Date.now() + (maxPrepTime + 15) * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return `
    <div class="max-w-2xl mx-auto glass-panel p-6 sm:p-8 rounded-2xl border-2 border-gold/50 shadow-2xl animate-fade-in">
      
      <div class="flex items-center justify-between pb-4 border-b border-gold/30 mb-6 gap-2 flex-wrap">
        <div>
          <span class="text-xs font-bold uppercase tracking-luxury text-gold">Order Review & Kitchen Dispatch</span>
          <h2 class="text-2xl font-serif text-white font-bold mt-1">Restaurant Order Summary</h2>
          <p class="text-xs text-slate-300">Review your culinary selection before sending to Executive Chef Babatunde.</p>
        </div>
        <span class="badge-gold text-xs">Suite #${guest.roomNumber}</span>
      </div>

      <!-- Guest & Timing Metadata Card -->
      <div class="p-4 rounded-xl bg-navy-950/80 border border-gold/30 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div>
          <div class="text-slate-400">Resident Guest:</div>
          <div class="font-bold text-white text-sm font-serif">${guest.name} · Suite #${guest.roomNumber}</div>
        </div>
        <div class="flex items-center gap-4">
          <div>
            <div class="text-slate-400">Preparation Time:</div>
            <div class="font-bold text-amber-400">~${maxPrepTime} mins</div>
          </div>
          <div>
            <div class="text-slate-400">Est. Room Delivery:</div>
            <div class="font-bold text-gold">~${maxPrepTime + 15} mins (${deliveryTimeEst})</div>
          </div>
        </div>
      </div>

      <!-- Itemized Bill Table (Food, Drinks, Snacks, Desserts, Extras) -->
      <div class="flex flex-col gap-3 mb-6">
        ${cart.map((item, idx) => {
          const extrasTotal = (item.extras || []).reduce((sum, e) => sum + e.price, 0);
          const itemSubtotal = (item.basePrice + extrasTotal) * item.quantity;
          return `
            <div class="p-3.5 rounded-xl bg-navy-950 border border-white/10 flex items-start justify-between gap-3 text-xs">
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <strong class="text-white text-sm">${item.quantity}x ${item.name}</strong>
                  <span class="text-gold font-bold">₦${itemSubtotal.toLocaleString()}</span>
                </div>
                ${item.extras && item.extras.length > 0 ? `
                  <div class="text-slate-400 text-xs mt-1 pl-2 border-l border-gold/40">
                    ${item.extras.map(e => `+ ${e.name} (₦${e.price.toLocaleString()})`).join('<br/>')}
                  </div>
                ` : ''}
                ${item.specialInstructions ? `
                  <div class="text-slate-400 italic text-[11px] mt-1">Special note: "${item.specialInstructions}"</div>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Bill Total -->
      <div class="pt-4 border-t border-gold/30 flex items-center justify-between text-base font-bold text-white mb-6">
        <span>Total Amount (Posted to Folio):</span>
        <span class="text-gold text-xl font-serif">₦${cartTotal.toLocaleString()}</span>
      </div>

      <!-- Tolani Review Prompt Note -->
      <div class="p-3.5 rounded-xl bg-gold/10 border border-gold/30 text-xs text-slate-200 mb-6 flex items-center gap-2.5">
        <span class="text-xl">🤖</span>
        <span>Tolani: <em>"Please review your order, ${guest.name}. Once you're happy with your selection, I'll send it to our kitchen."</em></span>
      </div>

      <!-- Review Action Buttons at Bottom -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
        <button 
          class="btn-secondary py-3 px-5 text-xs font-semibold w-full sm:w-auto"
          onclick="window.editRestaurantOrder();"
        >
          ✏️ EDIT ORDER
        </button>

        <button 
          class="btn-primary py-3 px-8 text-xs font-bold w-full sm:w-auto shadow-xl"
          onclick="window.confirmAndDispatchRestaurantOrder();"
        >
          ✓ PLACE ORDER →
        </button>
      </div>

    </div>
  `;
}

// Section 4: Final Order Confirmed Step
function renderRestaurantConfirmationStep(guest, order) {
  if (!order) {
    return `
      <div class="max-w-xl mx-auto glass-panel p-8 rounded-2xl text-center border border-gold/40 my-8">
        <h2 class="text-xl font-serif text-white font-bold mb-4">Order Received</h2>
        <button class="btn-primary py-2.5 px-6 text-xs font-bold" onclick="window.navigateToOrderTracker()">
          Track Order →
        </button>
      </div>
    `;
  }

  const formattedDeliveryTime = (order.estimatedDeliveryAt && !isNaN(new Date(order.estimatedDeliveryAt).getTime()))
    ? new Date(order.estimatedDeliveryAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    : `~${order.estimatedMinutes || 25} mins`;

  return `
    <div class="max-w-2xl mx-auto glass-panel p-6 sm:p-8 rounded-2xl border-2 border-gold/60 shadow-2xl text-center animate-fade-in my-4">
      <div class="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 text-3xl flex items-center justify-center mx-auto mb-4">
        ✓
      </div>

      <span class="text-xs font-bold uppercase tracking-luxury text-gold">Order Confirmed & Sent to Kitchen</span>
      <h2 class="text-2xl sm:text-3xl font-serif text-white font-bold mt-1 mb-2">
        Thank You, ${guest.name}
      </h2>
      <p class="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mb-6">
        Your order <strong>#${order.id}</strong> has been transmitted directly to Executive Chef Babatunde.
      </p>

      <!-- Tolani Confirmed Dialogue Box -->
      <div class="p-4 rounded-xl bg-navy-950/80 border border-gold/30 mb-6 text-left text-xs text-slate-200">
        <div class="flex items-center gap-2 mb-2 font-bold text-gold">
          <span>🤖</span> <span>Tolani Voice Confirmation:</span>
        </div>
        <p class="leading-relaxed">
          <em>"Thank you, ${guest.name}. Your order has been confirmed and sent to our kitchen. Your order is expected to be prepared in approximately ${order.preparationMinutes} minutes and delivered to your room by approximately ${formattedDeliveryTime}."</em>
        </p>
        <p class="text-slate-400 mt-2">
          <em>"Is there anything else I can assist you with while we prepare your order?"</em>
        </p>
      </div>

      <!-- Quick Details Matrix -->
      <div class="grid grid-cols-2 gap-3 mb-8 text-xs">
        <div class="p-3 rounded-xl bg-navy-950 border border-white/10 text-left">
          <div class="text-slate-400 text-[11px]">Preparation Time:</div>
          <div class="font-bold text-amber-400 text-sm mt-0.5">~${order.preparationMinutes} minutes</div>
        </div>
        <div class="p-3 rounded-xl bg-navy-950 border border-white/10 text-left">
          <div class="text-slate-400 text-[11px]">Estimated Room Delivery:</div>
          <div class="font-bold text-gold text-sm mt-0.5">${formattedDeliveryTime}</div>
        </div>
      </div>

      <!-- Dedicated Tracker CTA Button -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button 
          class="btn-primary py-3.5 px-8 text-xs sm:text-sm font-bold w-full sm:w-auto shadow-2xl flex items-center justify-center gap-2"
          onclick="window.navigateToOrderTracker('${order.id}')"
        >
          <span>🚀</span> <span>TRACK ACTIVE ORDER →</span>
        </button>

        <button 
          class="btn-secondary py-3.5 px-6 text-xs sm:text-sm font-bold w-full sm:w-auto"
          onclick="window.navigateGuestTab('home')"
        >
          🏠 Return to Home
        </button>
      </div>
    </div>
  `;
}

// 5. DEDICATED ISOLATED ORDER TRACKER PAGE (Spec: 100% Standalone view with no menu behind it)
function renderIsolatedOrderTrackerPage(guest, orderId) {
  const state = store.getState();
  let order = (orderId && state.orders.find(o => o.id === orderId)) ||
              state.orders.find(o => o.guestId === guest.id && o.status !== 'DELIVERED') ||
              state.orders.find(o => o.guestId === guest.id) ||
              state.orders[0];

  if (!order) {
    return `
      <div class="max-w-2xl mx-auto glass-panel p-8 rounded-2xl text-center border border-gold/30 my-8 animate-fade-in">
        <span class="text-4xl mb-3 block">🍽️</span>
        <h2 class="text-xl font-serif text-white font-bold mb-2">No Active Order Found</h2>
        <p class="text-xs text-slate-300 mb-6">There are currently no active restaurant orders being tracked for Suite #${guest.roomNumber}.</p>
        <button class="btn-primary py-2.5 px-6 text-xs font-bold" onclick="window.navigateGuestTab('restaurant')">
          Browse Restaurant Menu →
        </button>
      </div>
    `;
  }

  const now = Date.now();
  const isSubmitted = order.status === 'SUBMITTED' || order.status === 'ACCEPTED';
  const isPreparing = order.status === 'PREPARING';
  const isReady = order.status === 'READY';
  const isOutForDelivery = order.status === 'OUT_FOR_DELIVERY';
  const isDelivered = order.status === 'DELIVERED';

  // Step indices
  const stepIdx = isDelivered ? 5 : isOutForDelivery ? 4 : isReady ? 3 : isPreparing ? 2 : 1;

  // Timestamps
  const prepStartedAt = order.preparationStartedAt || (order.createdTimestamp || now);
  const prepTotalMs = (order.preparationMinutes || 20) * 60 * 1000;
  const estimatedReadyAt = order.estimatedReadyAt || (prepStartedAt + prepTotalMs);
  const readyFormatted = (estimatedReadyAt && !isNaN(new Date(estimatedReadyAt).getTime()))
    ? new Date(estimatedReadyAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    : `~${order.preparationMinutes || 20} mins`;

  const deliveryStartedAt = order.deliveryStartedAt || estimatedReadyAt;
  const deliveryTotalMs = (order.deliveryMinutes || 15) * 60 * 1000;
  const targetDeliveryAt = order.revisedDeliveryAt || order.estimatedDeliveryAt || (estimatedReadyAt + deliveryTotalMs);
  const deliveryFormatted = (targetDeliveryAt && !isNaN(new Date(targetDeliveryAt).getTime()))
    ? new Date(targetDeliveryAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    : `~${order.totalMinutes || 35} mins`;

  const isDelayed = now > targetDeliveryAt && !isDelivered;

  // Real countdown calculations
  const remainingPrepMs = Math.max(0, estimatedReadyAt - now);
  const pMins = Math.floor(remainingPrepMs / 60000);
  const pSecs = Math.floor((remainingPrepMs % 60000) / 1000);
  const prepCountdownStr = `${pMins.toString().padStart(2, '0')}:${pSecs.toString().padStart(2, '0')}`;

  const remainingDeliveryMs = Math.max(0, targetDeliveryAt - now);
  const dMins = Math.floor(remainingDeliveryMs / 60000);
  const dSecs = Math.floor((remainingDeliveryMs % 60000) / 1000);
  const deliveryCountdownStr = `${dMins.toString().padStart(2, '0')}:${dSecs.toString().padStart(2, '0')}`;

  // Actual progress bar percentages based on real elapsed time
  let prepProgressPct = 0;
  if (isReady || isOutForDelivery || isDelivered) {
    prepProgressPct = 100;
  } else if (isPreparing) {
    const elapsed = Math.max(0, now - prepStartedAt);
    prepProgressPct = Math.min(99, Math.max(5, Math.round((elapsed / prepTotalMs) * 100)));
  } else {
    prepProgressPct = 10;
  }

  let deliveryProgressPct = 0;
  if (isDelivered) {
    deliveryProgressPct = 100;
  } else if (isOutForDelivery) {
    const elapsed = Math.max(0, now - deliveryStartedAt);
    deliveryProgressPct = Math.min(99, Math.max(10, Math.round((elapsed / deliveryTotalMs) * 100)));
  } else if (isReady) {
    deliveryProgressPct = 30;
  } else {
    deliveryProgressPct = 0;
  }

  return `
    <div class="max-w-3xl mx-auto flex flex-col gap-6 animate-fade-in">
      
      <!-- Top Isolated Header Card -->
      <div class="glass-panel-gold p-6 sm:p-8 rounded-2xl border-2 border-gold/60 shadow-2xl">
        
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-gold/30 mb-6 gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-luxury text-gold">HOTEL CAPITOL · RESTAURANT ORDER TRACKING</span>
              <span class="badge-gold text-xs">Room ${order.roomNumber}</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-serif text-white font-bold mt-1">
              RESTAURANT ORDER TRACKING
            </h1>
            <p class="text-xs text-slate-300 mt-1">
              Order <strong class="text-white">#${order.id}</strong> · Placed at ${order.createdAt} · Resident: <strong class="text-gold">${order.guestName}</strong>
            </p>
          </div>

          <div>
            <span class="badge-${isDelivered ? 'normal' : isDelayed ? 'critical' : isPreparing || isOutForDelivery ? 'attention' : 'gold'} text-xs uppercase font-bold py-1.5 px-3.5 shadow-md">
              ${isDelivered ? '✓ DELIVERED' : isDelayed ? '⚠️ DELIVERY DELAY' : order.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <!-- 5-Stage Stepper Component -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-8 text-xs font-bold">
          
          <!-- Step 1: Confirmed -->
          <div class="p-3 rounded-xl ${stepIdx >= 1 ? 'bg-emerald-950/80 border border-emerald-500/70 text-emerald-300' : 'bg-navy-950 border border-white/10 text-slate-400'} flex items-center gap-2">
            <span class="text-sm font-bold">${stepIdx >= 1 ? '✓' : '○'}</span>
            <span>ORDER CONFIRMED</span>
          </div>

          <!-- Step 2: Preparing -->
          <div class="p-3 rounded-xl ${stepIdx > 2 ? 'bg-emerald-950/80 border border-emerald-500/70 text-emerald-300' : stepIdx === 2 ? 'bg-amber-950/80 border-2 border-amber-400 text-amber-300 animate-pulse' : 'bg-navy-950 border border-white/10 text-slate-400'} flex items-center gap-2">
            <span class="text-sm font-bold">${stepIdx > 2 ? '✓' : stepIdx === 2 ? '●' : '○'}</span>
            <span>PREPARING</span>
          </div>

          <!-- Step 3: Ready -->
          <div class="p-3 rounded-xl ${stepIdx > 3 ? 'bg-emerald-950/80 border border-emerald-500/70 text-emerald-300' : stepIdx === 3 ? 'bg-amber-950/80 border-2 border-amber-400 text-amber-300 animate-pulse' : 'bg-navy-950 border border-white/10 text-slate-400'} flex items-center gap-2">
            <span class="text-sm font-bold">${stepIdx > 3 ? '✓' : stepIdx === 3 ? '●' : '○'}</span>
            <span>READY</span>
          </div>

          <!-- Step 4: Out for Delivery -->
          <div class="p-3 rounded-xl ${stepIdx > 4 ? 'bg-emerald-950/80 border border-emerald-500/70 text-emerald-300' : stepIdx === 4 ? 'bg-amber-950/80 border-2 border-amber-400 text-amber-300 animate-pulse' : 'bg-navy-950 border border-white/10 text-slate-400'} flex items-center gap-2">
            <span class="text-sm font-bold">${stepIdx > 4 ? '✓' : stepIdx === 4 ? '●' : '○'}</span>
            <span>OUT FOR DELIVERY</span>
          </div>

          <!-- Step 5: Delivered -->
          <div class="p-3 rounded-xl ${isDelivered ? 'bg-emerald-950/80 border border-emerald-500/70 text-emerald-300' : 'bg-navy-950 border border-white/10 text-slate-400'} flex items-center gap-2 col-span-2 sm:col-span-1">
            <span class="text-sm font-bold">${isDelivered ? '✓' : '○'}</span>
            <span>DELIVERED</span>
          </div>

        </div>

        <!-- Preparation & Delivery Status Blocks -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          
          <!-- PREPARATION CARD -->
          <div class="p-6 rounded-2xl bg-navy-950/90 border ${isPreparing ? 'border-amber-400 shadow-xl' : 'border-white/10'} flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <span>👨‍🍳</span> <span>PREPARATION</span>
                </span>
                <span class="text-xs font-bold ${isReady || isOutForDelivery || isDelivered ? 'text-emerald-400' : isPreparing ? 'text-amber-400' : 'text-slate-400'}">
                  ${isReady || isOutForDelivery || isDelivered ? '✓ Preparation Complete' : isPreparing ? 'In Progress' : 'Awaiting Kitchen'}
                </span>
              </div>

              <div class="my-4">
                ${isPreparing ? `
                  <div class="font-mono text-3xl sm:text-4xl font-black text-amber-300 tracking-wider" id="prep-countdown-value">
                    ${prepCountdownStr} REMAINING
                  </div>
                  <div class="text-xs text-slate-300 mt-2">
                    Estimated Ready: <strong class="text-white">${readyFormatted}</strong>
                  </div>
                ` : isReady || isOutForDelivery || isDelivered ? `
                  <div class="text-lg font-bold text-emerald-400 flex items-center gap-2">
                    <span>✓ Staged at Kitchen Pass</span>
                  </div>
                  <div class="text-xs text-slate-300 mt-1">Prepared by Executive Chef Babatunde</div>
                ` : `
                  <div class="text-sm font-semibold text-slate-300">
                    Order received. Awaiting chef station pickup.
                  </div>
                `}
              </div>
            </div>

            <!-- Preparation Progress Bar -->
            <div>
              <div class="w-full bg-navy-900 h-2.5 rounded-full overflow-hidden">
                <div 
                  id="prep-progress-bar"
                  class="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-1000"
                  style="width: ${prepProgressPct}%;"
                ></div>
              </div>
            </div>
          </div>

          <!-- DELIVERY CARD -->
          <div class="p-6 rounded-2xl bg-navy-950/90 border ${isOutForDelivery ? 'border-gold shadow-xl' : isDelayed ? 'border-red-500' : 'border-white/10'} flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <span>🚀</span> <span>DELIVERY</span>
                </span>
                <span class="text-xs font-bold ${isDelivered ? 'text-emerald-400' : isDelayed ? 'text-red-400' : isOutForDelivery ? 'text-gold' : 'text-slate-400'}">
                  ${isDelivered ? '✓ Delivered' : isDelayed ? '⚠️ Delivery Delay' : isOutForDelivery ? 'In Transit' : 'Scheduled'}
                </span>
              </div>

              <div class="my-4">
                ${isDelivered ? `
                  <div class="text-lg font-bold text-emerald-400 flex items-center gap-2">
                    <span>✓ Delivered to Suite #${order.roomNumber}</span>
                  </div>
                  <div class="text-xs text-slate-300 mt-1">Attendant: Amara Nwosu</div>
                ` : isDelayed ? `
                  <div class="text-xl font-bold text-red-400 flex items-center gap-2">
                    <span>⚠️ DELIVERY DELAY</span>
                  </div>
                  <div class="text-xs text-slate-200 mt-1">
                    ${order.revisedDeliveryAt ? `Revised Delivery Time: <strong class="text-gold">${deliveryFormatted}</strong>` : 'We are following up with the kitchen station.'}
                  </div>
                ` : isOutForDelivery ? `
                  <div class="font-mono text-3xl sm:text-4xl font-black text-gold tracking-wider" id="delivery-countdown-value">
                    ${deliveryCountdownStr} REMAINING
                  </div>
                  <div class="text-xs text-slate-300 mt-2">
                    Estimated Delivery: <strong class="text-white">${deliveryFormatted}</strong>
                  </div>
                ` : `
                  <div class="text-sm font-semibold text-slate-300">
                    Estimated Delivery: <strong class="text-gold">${deliveryFormatted}</strong>
                  </div>
                  <div class="text-xs text-slate-400 mt-1">Delivery Attendant: Amara Nwosu</div>
                `}
              </div>
            </div>

            <!-- Delivery Progress Bar -->
            <div>
              <div class="w-full bg-navy-900 h-2.5 rounded-full overflow-hidden">
                <div 
                  id="delivery-progress-bar"
                  class="bg-gradient-to-r from-gold to-emerald-400 h-full transition-all duration-1000"
                  style="width: ${deliveryProgressPct}%;"
                ></div>
              </div>
            </div>
          </div>

        </div>

        <!-- Ordered Items Summary -->
        <div class="p-4 rounded-xl bg-navy-950/70 border border-white/10 mb-8 text-xs">
          <div class="text-xs font-bold text-gold uppercase tracking-wider mb-2">Order Items:</div>
          <div class="flex flex-col gap-1.5 text-slate-200">
            ${order.items.map(item => `
              <div class="flex items-center justify-between">
                <span>${item.quantity}x ${item.name} ${item.extras && item.extras.length > 0 ? `<span class="text-slate-400">(+${item.extras.map(e => e.name).join(', ')})</span>` : ''}</span>
                <span class="text-gold font-semibold">₦${((item.basePrice + (item.extras || []).reduce((s,e) => s + e.price, 0)) * item.quantity).toLocaleString()}</span>
              </div>
            `).join('')}
          </div>
          <div class="pt-2 mt-2 border-t border-white/10 flex items-center justify-between font-bold text-white text-sm">
            <span>Total Bill:</span>
            <span class="text-gold font-serif">₦${order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <!-- REQUIRED TRACKER CTA BUTTONS (Spec #6 & #7) -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
          <button 
            class="btn-secondary py-3 px-5 text-xs font-bold w-full sm:w-auto"
            onclick="window.navigateGuestTab('home')"
          >
            🏠 BACK TO HOME
          </button>

          <button 
            class="btn-secondary py-3 px-5 text-xs font-bold w-full sm:w-auto"
            onclick="window.navigateGuestTab('restaurant')"
          >
            🍽️ BACK TO MENU
          </button>

          <button 
            class="btn-primary py-3 px-6 text-xs font-bold w-full sm:w-auto shadow-xl"
            onclick="window.startAdditionalRestaurantOrder()"
          >
            ➕ ADDITIONAL ORDER
          </button>
        </div>

      </div>

      <!-- Quick Kitchen Testing Station Controls (Bottom of tracker) -->
      <div class="glass-panel p-4 rounded-xl border border-gold/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <span class="text-slate-400 font-semibold">⚡ Staff Stage Testing Simulator:</span>
        <div class="flex items-center gap-2 flex-wrap">
          ${isSubmitted ? `
            <button class="btn-primary text-xs py-1 px-3 font-bold" onclick="window.hotelCapitolStore.updateOrderStatus('${order.id}', 'PREPARING'); renderGuestPortal();">
              👨‍🍳 Kitchen Accept (Start Prep)
            </button>
          ` : ''}

          ${isPreparing ? `
            <button class="btn-primary text-xs py-1 px-3 font-bold" onclick="window.hotelCapitolStore.updateOrderStatus('${order.id}', 'READY'); renderGuestPortal();">
              🍽️ Mark Ready
            </button>
          ` : ''}

          ${isReady ? `
            <button class="btn-primary text-xs py-1 px-3 font-bold" onclick="window.hotelCapitolStore.updateOrderStatus('${order.id}', 'OUT_FOR_DELIVERY'); renderGuestPortal();">
              🚀 Dispatch Out for Delivery
            </button>
          ` : ''}

          ${isOutForDelivery || isDelayed ? `
            <button class="btn-secondary text-xs py-1 px-2.5" onclick="window.hotelCapitolStore.setOrderRevisedTime('${order.id}', 10); renderGuestPortal();">
              ⏱️ +10m Revised Delay
            </button>
            <button class="btn-primary text-xs py-1 px-3 font-bold" onclick="window.hotelCapitolStore.updateOrderStatus('${order.id}', 'DELIVERED'); renderGuestPortal();">
              ✓ Mark Delivered
            </button>
          ` : ''}

          ${isDelivered ? `
            <span class="text-emerald-400 font-bold text-xs">✓ Order Completed</span>
          ` : ''}
        </div>
      </div>

    </div>
  `;
}

// 3. BREAKFAST SERVICE SECTION (Spec #13 & #14)
function renderBreakfastSection(guest) {
  const isFree = guest.breakfastEntitlement === 'Complimentary';

  return `
    <div class="max-w-3xl mx-auto glass-panel p-6 sm:p-8 rounded-2xl">
      
      <div class="flex items-center justify-between pb-4 border-b border-gold/20 mb-6 gap-4 flex-wrap">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-bold uppercase tracking-luxury text-gold">☀️ 06:00 AM – 10:00 AM</span>
            <span class="badge-${isFree ? 'normal' : 'gold'} text-xs">
              ${isFree ? '✓ Complimentary Breakfast Included' : 'Paid Dining'}
            </span>
          </div>
          <h2 class="text-2xl font-serif text-white">Daily Breakfast Service</h2>
          <p class="text-xs text-slate-300 mt-1">Select your gourmet morning entrée, preferred suite delivery window, and optional artisan extras.</p>
        </div>
        <button 
          class="intercom-pill-btn"
          onclick="window.openDirectIntercomCall('kitchen-fb', 'Breakfast Kitchen', 'Chef Babatunde');"
          title="Direct intercom to Executive Chef Babatunde & Kitchen"
        >
          ${renderIntercomRoundBadge(18)}
          <span>Intercom Kitchen</span>
        </button>
      </div>

      <!-- Breakfast Options -->
      <div class="flex flex-col gap-4 mb-6">
        <label class="glass-panel-subtle p-4 rounded-xl border border-white/10 flex items-start gap-4 cursor-pointer hover:border-gold transition-all">
          <input type="radio" name="breakfast-option" value="The English Royal Breakfast" checked class="mt-1 accent-gold-500" />
          <div class="flex-1">
            <div class="flex items-center justify-between font-serif text-white font-bold text-sm">
              <span>The English Royal Breakfast</span>
              <span class="text-gold">${isFree ? 'FREE' : '₦8,500'}</span>
            </div>
            <p class="text-xs text-slate-300 mt-1">
              Two farm eggs any style, Cumberland beef sausages, crispy beef bacon, baked beans, sautéed mushrooms, grilled tomato, hash brown, toasted sourdough.
            </p>
          </div>
        </label>

        <label class="glass-panel-subtle p-4 rounded-xl border border-white/10 flex items-start gap-4 cursor-pointer hover:border-gold transition-all">
          <input type="radio" name="breakfast-option" value="The Naija Executive Breakfast" class="mt-1 accent-gold-500" />
          <div class="flex-1">
            <div class="flex items-center justify-between font-serif text-white font-bold text-sm">
              <span>The Naija Executive Breakfast</span>
              <span class="text-gold">${isFree ? 'FREE' : '₦8,500'}</span>
            </div>
            <p class="text-xs text-slate-300 mt-1">
              Steamed yam and golden fried dodo plantain, spiced Nigerian egg & pepper stew, tender beef suya skewer, spiced hot cocoa or tea.
            </p>
          </div>
        </label>

        <label class="glass-panel-subtle p-4 rounded-xl border border-white/10 flex items-start gap-4 cursor-pointer hover:border-gold transition-all">
          <input type="radio" name="breakfast-option" value="Continental Fresh Baker's Basket" class="mt-1 accent-gold-500" />
          <div class="flex-1">
            <div class="flex items-center justify-between font-serif text-white font-bold text-sm">
              <span>Continental Fresh Baker's Basket</span>
              <span class="text-gold">${isFree ? 'FREE' : '₦7,500'}</span>
            </div>
            <p class="text-xs text-slate-300 mt-1">
              Warm butter croissant, Danish pastries, artisan rolls, seasonal tropical fruit bowl, Greek yoghurt, raw honeycomb.
            </p>
          </div>
        </label>
      </div>

      <!-- Preferred Delivery Time -->
      <div class="glass-panel-subtle p-4 rounded-xl mb-6 border border-white/10">
        <label class="block text-xs font-bold text-gold uppercase tracking-wider mb-2">
          Select Preferred Delivery Time (6:00 AM – 10:00 AM):
        </label>
        <select id="breakfast-delivery-time" class="input-custom text-xs py-2">
          <option value="06:30 AM">06:30 AM</option>
          <option value="07:00 AM">07:00 AM</option>
          <option value="07:30 AM" selected>07:30 AM (Recommended)</option>
          <option value="08:00 AM">08:00 AM</option>
          <option value="08:30 AM">08:30 AM</option>
          <option value="09:00 AM">09:00 AM</option>
          <option value="09:30 AM">09:30 AM</option>
        </select>
      </div>

      <!-- Breakfast AI Upsell Engine (Spec #14) -->
      <div class="glass-panel-gold p-4 rounded-xl mb-6">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-gold font-bold">🤖 AI Suggestion:</span>
          <span class="text-xs text-slate-200">Would you like to complement your breakfast with these fresh additions?</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
          <label class="flex items-center justify-between p-2 rounded-lg bg-navy-950 text-xs text-slate-300 cursor-pointer hover:bg-navy-900 border border-white/5">
            <span class="flex items-center gap-2">
              <input type="checkbox" class="breakfast-upsell-checkbox accent-gold-500" data-name="Extra Crispy Beef Bacon" data-price="2200" />
              <span>Extra Crispy Beef Bacon</span>
            </span>
            <span class="text-gold font-semibold">+₦2,200</span>
          </label>

          <label class="flex items-center justify-between p-2 rounded-lg bg-navy-950 text-xs text-slate-300 cursor-pointer hover:bg-navy-900 border border-white/5">
            <span class="flex items-center gap-2">
              <input type="checkbox" class="breakfast-upsell-checkbox accent-gold-500" data-name="Gourmet Beef Sausage" data-price="2000" />
              <span>Gourmet Beef Sausage</span>
            </span>
            <span class="text-gold font-semibold">+₦2,000</span>
          </label>

          <label class="flex items-center justify-between p-2 rounded-lg bg-navy-950 text-xs text-slate-300 cursor-pointer hover:bg-navy-900 border border-white/5">
            <span class="flex items-center gap-2">
              <input type="checkbox" class="breakfast-upsell-checkbox accent-gold-500" data-name="Cold-Pressed Orange Juice" data-price="2500" />
              <span>Cold-Pressed Orange Juice</span>
            </span>
            <span class="text-gold font-semibold">+₦2,500</span>
          </label>

          <label class="flex items-center justify-between p-2 rounded-lg bg-navy-950 text-xs text-slate-300 cursor-pointer hover:bg-navy-900 border border-white/5">
            <span class="flex items-center gap-2">
              <input type="checkbox" class="breakfast-upsell-checkbox accent-gold-500" data-name="Artisan Barista Cappuccino" data-price="2500" />
              <span>Artisan Barista Cappuccino</span>
            </span>
            <span class="text-gold font-semibold">+₦2,500</span>
          </label>
        </div>
      </div>

      <button class="btn-primary w-full py-3 text-sm font-bold shadow-lg" onclick="window.submitBreakfastSelection(${!isFree})">
        Confirm Breakfast Delivery Window →
      </button>

    </div>
  `;
}

// 4. ROOM SERVICE & HOUSEKEEPING (Spec #15, #16, #17)
function renderRoomServiceSection(guest) {
  const state = store.getState();
  const guestRequests = state.serviceRequests.filter(r => r.guestId === guest.id);

  const quickButtons = [
    { title: '2 Fresh Bath Towels', icon: '🛁' },
    { title: 'Full Suite Deep Cleaning', icon: '🧹' },
    { title: 'Luxury Toiletries Kit Restock', icon: '🧴' },
    { title: 'Fresh Bed Linen Change', icon: '🛏' },
    { title: 'Room Insecticide Application', icon: '🌿' },
    { title: 'Laundry & Ironing Collection', icon: '👔' },
    { title: 'AC / Thermostat Inspection', icon: '❄️' },
    { title: 'Minibar Restock', icon: '🍾' }
  ];

  return `
    <div class="max-w-4xl mx-auto flex flex-col gap-8">
      
      <!-- Top Action: Speak or Type Request -->
      <div class="glass-panel-gold p-6 rounded-2xl">
        <div class="flex items-center justify-between mb-3 gap-4 flex-wrap">
          <div>
            <span class="text-xs font-bold uppercase tracking-luxury text-gold">🛎 08:00 AM Daily Outreach & On-Demand</span>
            <h2 class="text-xl sm:text-2xl font-serif text-white mt-0.5">Room Service & Housekeeping</h2>
          </div>
          <div class="flex items-center gap-2">
            <button 
              class="intercom-pill-btn"
              onclick="window.openDirectIntercomCall('housekeeping', 'Housekeeping', 'Amara Nwosu');"
              title="Direct intercom to Housekeeping Specialist"
            >
              ${renderIntercomRoundBadge(16)}
              <span>Intercom Housekeeping</span>
            </button>
            <button class="btn-secondary text-xs py-1.5 px-3" onclick="window.hotelCapitolAutomation.triggerRoomServiceAutomation()">
              Simulate 08:00 AM Call
            </button>
          </div>
        </div>

        <p class="text-xs text-slate-300 mb-4">
          Speak your request naturally (e.g. <em>"I need two extra towels and room cleaning"</em>) or choose from rapid service cards below.
        </p>

        <!-- Voice / Type Input Box -->
        <div class="flex flex-col sm:flex-row items-center gap-2 mb-2">
          <input 
            id="room-service-custom-text"
            type="text" 
            placeholder="Type or speak what you need (e.g. 2 extra towels, water, cleaning)..." 
            class="input-custom text-xs py-2.5 flex-1"
            onkeydown="if(event.key === 'Enter') window.submitCustomRoomService();"
          />
          
          <button 
            class="btn-icon ${isVoiceActiveForService ? 'bg-red-600 border-red-500 animate-pulse text-white' : ''}"
            onclick="window.toggleServiceVoiceInput()"
            title="Speak Request via Microphone"
          >
            ${getIcon('mic', 18)}
          </button>

          <button class="btn-primary text-xs py-2.5 px-5 font-bold" onclick="window.submitCustomRoomService()">
            Dispatch Request
          </button>
        </div>

        ${isVoiceActiveForService ? `
          <div class="text-xs text-gold flex items-center gap-2 mt-2">
            <div class="voice-wave"><span></span><span></span><span></span><span></span></div>
            <span>Listening... Speak your room service request now.</span>
          </div>
        ` : ''}
      </div>

      <!-- Quick Service Action Cards (Spec #15) -->
      <div>
        <h3 class="text-sm font-serif font-bold text-white uppercase tracking-wider mb-3">1-Tap Service Dispatch:</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          ${quickButtons.map(qb => `
            <button 
              class="quick-service-btn"
              onclick="window.submitQuickService('Housekeeping', '${qb.title}')"
            >
              <div class="text-2xl mb-1">${qb.icon}</div>
              <div class="quick-service-title">${qb.title}</div>
              <div class="quick-service-action"><span>Tap to Request</span> <span>→</span></div>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Service Request Log (Spec #17) -->
      <div class="glass-panel p-6 rounded-2xl">
        <h3 class="font-serif text-sm font-bold text-white tracking-luxury mb-4">YOUR SERVICE LOG (SUITE ${guest.roomNumber})</h3>
        
        ${guestRequests.length === 0 ? `
          <div class="text-xs text-slate-400">No active service tickets.</div>
        ` : `
          <div class="flex flex-col gap-3">
            ${guestRequests.map(r => `
              <div class="p-3.5 rounded-xl bg-navy-950 border ${r.status === 'AWAITING_STAFF_CONFIRMATION' ? 'border-amber-400' : 'border-white/10'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <strong class="text-white">${r.title}</strong>
                    <span class="badge-${r.status === 'COMPLETED' ? 'normal' : r.status === 'AWAITING_STAFF_CONFIRMATION' ? 'attention' : 'pending'} text-[10px] py-0.5">
                      ${r.status === 'AWAITING_STAFF_CONFIRMATION' ? '⏳ Dispatching...' : r.status}
                    </span>
                  </div>
                  <div class="text-slate-400 text-[11px]">${r.details} · Logged at ${r.requestedAt}</div>
                </div>

                <div class="text-slate-300 text-left sm:text-right">
                  <div>Attendant: <strong class="text-gold-light">${r.assignedStaffName}</strong></div>
                  ${r.completedAt ? `
                    <div class="text-emerald-400 text-[10px] font-bold mt-0.5">✓ Completed at ${r.completedAt}</div>
                  ` : `
                    <div class="flex items-center gap-1.5 justify-start sm:justify-end mt-1">
                      <span class="text-[10px] text-slate-400">⏱️ Est. Arrival:</span>
                      <span 
                        class="badge-normal font-mono text-[10px] px-2 py-0.5" 
                        data-sla-deadline="${r.deadlineTimestamp || (Date.now() + (r.targetMinutes || 15)*60*1000)}"
                      >
                        ${r.targetMinutes || 15}:00 Remaining
                      </span>
                    </div>
                  `}
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

    </div>
  `;
}

// 5. VIP TRANSPORTATION & PAYMENT (Lagos Zonal Pricing, One-Time vs Charter, Live Tickers & Rescheduling)
function renderTransportSection(guest) {
  const state = store.getState();
  const zones = state.lagosZones || [];
  const vehicles = state.vehicleClasses || [];
  const activeBookings = (state.transportBookings || []).filter(b => b.guestId === guest.id);

  const selectedZone = zones.find(z => z.id === selectedZoneId) || zones[0];
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  const isCharter = selectedTransportMode === 'FULL_DAY_CHARTER';
  const calculatedFare = isCharter 
    ? selectedVehicle.charterDailyRate 
    : Math.round(selectedZone.baseFare * selectedVehicle.multiplier);

  return `
    <div class="max-w-4xl mx-auto flex flex-col gap-8 animate-fade-in">
      
      <!-- Top Header & Intercom Dispatch -->
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <span class="text-xs font-bold uppercase tracking-luxury text-gold">Chauffeured Executive Fleet & Transit</span>
          <h2 class="text-2xl font-serif text-white mt-1">VIP Transportation & Chauffeur Services</h2>
          <p class="text-xs text-slate-300">Dedicated luxury transfer across Lagos Island, Mainland & Murtala Muhammed Airport.</p>
        </div>
        <button 
          class="intercom-pill-btn"
          onclick="window.activateTolaniIntercom('VIP_TRANSPORTATION', 'VIP Transportation');"
          title="Direct intercom to Lead Concierge & Transport Chauffeur"
        >
          ${renderIntercomRoundBadge(18)}
          <span>Intercom Transport</span>
        </button>
      </div>

      <!-- Service Mode Switcher: One-Time Drop-off vs Full-Day Charter -->
      <div class="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-navy-950/80 border border-gold/40">
        <button 
          class="py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${selectedTransportMode === 'ONE_TIME_DROPOFF' ? 'bg-gold text-black shadow-lg' : 'text-slate-300 hover:text-white'}"
          onclick="window.setTransportMode('ONE_TIME_DROPOFF')"
        >
          <span>📍</span> <span>ONE-TIME DROP-OFF / TRANSFER</span>
        </button>
        <button 
          class      <!-- Booking Configuration Panel -->
      <div class="glass-panel-gold p-6 sm:p-8 rounded-2xl border-2 border-gold/50 shadow-2xl">
        <h3 class="font-serif text-lg text-white font-bold mb-4 flex items-center gap-2">
          <span>🚗</span> <span>Customize Your Executive Journey</span>
        </h3>

        <!-- Step A: Destination / Zonal Selector -->
        <div class="mb-6">
          <label class="block text-xs font-bold text-gold uppercase tracking-wider mb-2">
            ${isCharter ? 'Primary Operating Region:' : '1. Select Lagos Destination Zone:'}
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
            ${zones.map(z => {
              const catStr = z.category || (z.region === 'ISLAND' ? 'Lagos Island' : z.region === 'MAINLAND' ? 'Lagos Mainland' : 'Airport Hub');
              const estMins = z.estimatedMinutes || z.estMinutes || 30;
              const locs = Array.isArray(z.locations) ? z.locations : (typeof z.locations === 'string' ? z.locations.split(',').map(s => s.trim()) : []);
              const previewLocs = locs.slice(0, 3).join(', ') + (locs.length > 3 ? '...' : '');
              const isSelected = selectedZoneId === z.id;
              
              return `
                <div 
                  class="p-3.5 rounded-xl border cursor-pointer transition-all text-xs flex flex-col justify-between ${isSelected ? 'bg-gold/20 border-2 border-gold shadow-md text-white' : 'bg-navy-950/70 border-white/10 text-slate-300 hover:border-gold/50'}"
                  onclick="window.setTransportZone('${z.id}')"
                >
                  <div>
                    <div class="font-bold ${isSelected ? 'text-gold' : 'text-white'}">${z.name}</div>
                    <div class="text-[11px] text-slate-400 mt-0.5">${catStr} · ~${estMins} mins</div>
                    <div class="text-[10px] text-slate-400 mt-1 italic line-clamp-1">${previewLocs}</div>
                  </div>
                  <div class="mt-2.5 pt-1.5 border-t border-white/10 flex items-center justify-between">
                    <span class="text-[10px] text-slate-400">${locs.length} locations</span>
                    <span class="font-bold text-gold font-serif text-xs">Base: ₦${z.baseFare.toLocaleString()}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Step A2: Specific Location Selector (When not Full-Day Charter) -->
        ${!isCharter ? `
          <div class="mb-6 p-4 rounded-xl bg-navy-950/90 border border-gold/40">
            <div class="flex items-center justify-between mb-2.5 flex-wrap gap-2">
              <label class="block text-xs font-bold text-gold uppercase tracking-wider">
                2. Select Specific Drop-Off Location in ${selectedZone.name}:
              </label>
              <span class="text-[11px] text-slate-400">
                ${(Array.isArray(selectedZone.locations) ? selectedZone.locations : []).length} Available Locations
              </span>
            </div>

            <div class="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
              ${(Array.isArray(selectedZone.locations) ? selectedZone.locations : (typeof selectedZone.locations === 'string' ? selectedZone.locations.split(',').map(s => s.trim()) : [])).map(loc => {
                const isLocSelected = selectedDestinationLocation === loc;
                return `
                  <button 
                    class="py-1.5 px-3 rounded-lg text-xs transition-all cursor-pointer ${isLocSelected ? 'bg-gold text-navy-950 font-bold shadow-md' : 'bg-navy-900 text-slate-300 border border-white/10 hover:border-gold/50 hover:text-white'}"
                    onclick="window.setTransportLocation('${loc.replace(/'/g, "\\'")}')"
                    type="button"
                  >
                    ${isLocSelected ? '✓ ' : ''}${loc}
                  </button>
                `;
              }).join('')}
            </div>
            
            <div class="mt-2.5 pt-2 border-t border-white/10 text-[11px] text-slate-300">
              Selected Destination: <strong class="text-gold font-semibold">${selectedDestinationLocation || (Array.isArray(selectedZone.locations) ? selectedZone.locations[0] : selectedZone.name)}</strong>
            </div>
          </div>
        ` : ''}

        <!-- Step B: Vehicle Class Selector -->
        <div class="mb-6">
          <label class="block text-xs font-bold text-gold uppercase tracking-wider mb-2">
            ${isCharter ? '2.' : '3.'} Select Chauffeur Vehicle Class:
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            ${vehicles.map(v => {
              const vFare = isCharter ? v.charterDailyRate : Math.round(selectedZone.baseFare * v.multiplier);
              const isSelected = selectedVehicleId === v.id;
              return `
                <div 
                  class="p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${isSelected ? 'bg-gold/20 border-2 border-gold shadow-lg' : 'bg-navy-950/70 border-white/10 hover:border-gold/40'}"
                  onclick="window.setTransportVehicle('${v.id}')"
                >
                  <div>
                    <div class="text-2xl mb-1">${v.icon || '🚘'}</div>
                    <div class="font-serif font-bold text-white text-sm">${v.name}</div>
                    <div class="text-[11px] text-slate-300 mt-0.5">${v.models}</div>
                    <div class="text-[10px] text-slate-400 mt-1">${v.capacity} Passengers · AC & WiFi</div>
                  </div>
                  <div class="mt-4 pt-2 border-t border-white/10">
                    <div class="text-xs text-slate-400">${isCharter ? 'Full Day (12h):' : 'Fixed Fare:'}</div>
                    <div class="font-bold text-gold text-base font-serif">₦${vFare.toLocaleString()}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Step C: Departure Timing & Passengers -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-xs font-bold text-gold uppercase tracking-wider mb-1.5">Departure Date:</label>
            <input 
              type="date" 
              value="${selectedDepartureDate}" 
              class="input-custom text-xs py-2" 
              onchange="window.setTransportDate(this.value)"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-gold uppercase tracking-wider mb-1.5">Departure Time:</label>
            <select class="input-custom text-xs py-2" onchange="window.setTransportTime(this.value)">
              <option value="Immediate (15 mins)">Immediate (15 mins)</option>
              <option value="08:00 AM">08:00 AM</option>
              <option value="09:30 AM">09:30 AM</option>
              <option value="11:30 AM" selected>11:30 AM</option>
              <option value="02:00 PM">02:00 PM</option>
              <option value="04:30 PM">04:30 PM</option>
              <option value="07:00 PM">07:00 PM</option>
              <option value="09:30 PM">09:30 PM</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gold uppercase tracking-wider mb-1.5">Passengers:</label>
            <select class="input-custom text-xs py-2" onchange="window.setTransportPassengers(this.value)">
              <option value="1">1 Passenger</option>
              <option value="2" selected>2 Passengers</option>
              <option value="3">3 Passengers</option>
              <option value="4">4 Passengers</option>
              <option value="6">5-8 Passengers (Sprinter)</option>
            </select>
          </div>
        </div>

        <!-- Summary & CTA Bar -->
        <div class="p-4 rounded-xl bg-navy-950 border border-gold/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div class="text-xs text-slate-300">
              Destination: <strong class="text-white">${isCharter ? 'Full-Day Charter (' + selectedZone.name + ')' : (selectedDestinationLocation || selectedZone.name)}</strong> · Vehicle: <strong class="text-gold">${selectedVehicle.name}</strong>
            </div>
            <div class="text-base font-serif font-bold text-white mt-0.5">
              Calculated Total: <span class="text-gold">₦${calculatedFare.toLocaleString()}</span> <span class="text-xs text-slate-400 font-normal font-sans">(Billed to Suite Folio)</span>
            </div>
          </div>

          <button 
            class="btn-primary py-3 px-8 text-xs font-bold shadow-xl whitespace-nowrap w-full sm:w-auto cursor-pointer"
            onclick="window.openTransportBookingReview()"
          >
            Review & Confirm Transit →
          </button>
        </div>

      </div>

      <!-- Active Bookings & Live Departure Countdowns -->
      <div class="glass-panel p-6 rounded-2xl border border-white/10">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-serif text-sm font-bold text-white tracking-luxury uppercase">YOUR TRANSPORTATION BOOKINGS</h3>
          <span class="badge-gold text-xs">${activeBookings.length} Bookings</span>
        </div>

        ${activeBookings.length === 0 ? `
          <div class="text-xs text-slate-400 py-4 text-center">No active or past rides for Suite ${guest.roomNumber}.</div>
        ` : `
          <div class="flex flex-col gap-4">
            ${activeBookings.map(b => {
              return `
                <div class="p-5 rounded-2xl bg-navy-950 border-2 ${b.status === 'CONFIRMED' ? 'border-gold/50' : 'border-white/10'} flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                      <strong class="text-white text-base font-serif">${b.destination}</strong>
                      <span class="badge-gold text-[10px]">${b.serviceType === 'FULL_DAY_CHARTER' ? 'FULL-DAY CHARTER' : 'ONE-TIME TRANSFER'}</span>
                      <span class="badge-normal text-[10px]">${b.paymentStatus || 'POSTED TO FOLIO'}</span>
                    </div>
                    
                    <div class="text-xs text-slate-300">
                      Vehicle: <strong class="text-gold">${b.vehicle}</strong> · Departure: <strong>${b.departureDate} at ${b.departureTime}</strong> (${b.passengers} pax)
                    </div>

                    <div class="text-[11px] text-slate-400 mt-1">
                      Assigned Chauffeur: <strong class="text-white">${b.driverName || 'Lead Driver Ibrahim Bello'}</strong> (${b.driverVehiclePlate || 'LAG-889-CAP'})
                    </div>

                    <!-- Live Departure Countdown Ticker -->
                    <div class="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gold/10 border border-gold/30 text-gold font-mono text-xs font-bold" id="transport-countdown-${b.id}">
                      DEPARTURE IN CALCULATING...
                    </div>
                  </div>

                  <div class="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
                    <div class="font-serif font-bold text-gold text-lg">₦${b.price.toLocaleString()}</div>
                    
                    <div class="flex items-center gap-2 flex-wrap">
                      <button 
                        class="btn-secondary text-xs py-1.5 px-3 font-semibold"
                        onclick="window.openTransportRescheduleModal('${b.id}')"
                      >
                        📅 Reschedule
                      </button>

                      <button 
                        class="btn-secondary text-xs py-1.5 px-3 font-semibold"
                        onclick="window.openServiceFeedbackModal('TRANSPORTATION')"
                      >
                        ⭐ Rate Ride
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- Reschedule Modal -->
      ${showTransportRescheduleModal ? `
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="glass-panel-gold max-w-md w-full p-6 rounded-2xl border-2 border-gold shadow-2xl animate-fade-in">
            <h3 class="font-serif text-lg text-white font-bold mb-2">Reschedule Departure</h3>
            <p class="text-xs text-slate-300 mb-4">Select your updated departure date and time for booking <strong>#${showTransportRescheduleModal}</strong>.</p>
            
            <div class="flex flex-col gap-3 mb-6">
              <div>
                <label class="block text-xs font-bold text-gold mb-1">New Departure Date:</label>
                <input type="date" id="resched-date-${showTransportRescheduleModal}" value="${new Date().toISOString().slice(0, 10)}" class="input-custom text-xs py-2" />
              </div>
              <div>
                <label class="block text-xs font-bold text-gold mb-1">New Departure Time:</label>
                <select id="resched-time-${showTransportRescheduleModal}" class="input-custom text-xs py-2">
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="11:30 AM" selected>11:30 AM</option>
                  <option value="01:30 PM">01:30 PM</option>
                  <option value="03:30 PM">03:30 PM</option>
                  <option value="05:30 PM">05:30 PM</option>
                  <option value="08:00 PM">08:00 PM</option>
                </select>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3">
              <button class="btn-secondary text-xs py-2 px-4" onclick="window.closeTransportRescheduleModal()">Cancel</button>
              <button class="btn-primary text-xs py-2 px-5 font-bold" onclick="window.submitTransportReschedule('${showTransportRescheduleModal}')">Confirm New Time</button>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Transport Review Modal -->
      ${showTransportReviewModal ? `
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="glass-panel-gold max-w-lg w-full p-6 sm:p-8 rounded-2xl border-2 border-gold shadow-2xl animate-fade-in">
            <div class="flex items-center justify-between pb-3 border-b border-gold/30 mb-4">
              <h3 class="font-serif text-lg text-white font-bold">Review Chauffeur Booking</h3>
              <span class="badge-gold text-xs">Suite #${guest.roomNumber}</span>
            </div>

            <div class="flex flex-col gap-2.5 text-xs text-slate-300 mb-6">
              <div class="flex justify-between p-2 rounded bg-navy-950 border border-white/5">
                <span>Journey Type:</span>
                <strong class="text-white">${isCharter ? 'Full-Day Charter (12 Hours)' : 'One-Time Transfer'}</strong>
              </div>
              <div class="flex justify-between p-2 rounded bg-navy-950 border border-white/5">
                <span>Destination:</span>
                <strong class="text-gold">${isCharter ? selectedZone.name + ' (Charter Base)' : (selectedDestinationLocation ? selectedDestinationLocation + ' (' + selectedZone.name + ')' : selectedZone.name)}</strong>
              </div>
              <div class="flex justify-between p-2 rounded bg-navy-950 border border-white/5">
                <span>Vehicle Class:</span>
                <strong class="text-white">${selectedVehicle.name} (${selectedVehicle.models})</strong>
              <div class="flex justify-between p-2 rounded bg-navy-950 border border-white/5">
                <span>Departure Schedule:</span>
                <strong class="text-white">${selectedDepartureDate} at ${selectedDepartureTime}</strong>
              </div>
              <div class="flex justify-between p-2 rounded bg-navy-950 border border-white/5">
                <span>Passengers:</span>
                <strong class="text-white">${selectedPassengers} Guests</strong>
              </div>
              <div class="flex justify-between p-3 rounded-xl bg-navy-950 border border-gold/40 text-sm font-bold text-white mt-2">
                <span>Total Fare (Charged to Folio):</span>
                <span class="text-gold text-base">₦${calculatedFare.toLocaleString()}</span>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3">
              <button class="btn-secondary text-xs py-2.5 px-4 cursor-pointer" onclick="window.closeTransportBookingReview()">Back to Edit</button>
              <button class="btn-primary text-xs py-2.5 px-6 font-bold cursor-pointer" onclick="window.confirmTransportBooking()">Confirm & Dispatch Driver →</button>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Service Feedback Modal -->
      ${showFeedbackModal ? `
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="glass-panel-gold max-w-md w-full p-6 rounded-2xl border-2 border-gold shadow-2xl animate-fade-in">
            <h3 class="font-serif text-lg text-white font-bold mb-2">Guest Service Feedback</h3>
            <p class="text-xs text-slate-300 mb-4">How was your ${showFeedbackModal.serviceType.toLowerCase()} experience today?</p>
            
            <div class="flex justify-center gap-2 text-2xl mb-4" id="rating-stars">
              <button class="cursor-pointer bg-transparent border-none" onclick="window.submitServiceFeedback('${showFeedbackModal.serviceType}', 5, 'YES')">⭐⭐⭐⭐⭐</button>
            </div>

            <div class="flex flex-col gap-3 mb-4">
              <textarea id="feedback-comment" class="input-custom text-xs py-2" rows="3" placeholder="Any comments, compliments or areas of improvement for Tolani and management..."></textarea>
            </div>

            <div class="flex items-center justify-between gap-3">
              <button class="btn-secondary text-xs py-2 px-4" onclick="window.closeServiceFeedbackModal()">Close</button>
              <button class="btn-primary text-xs py-2 px-5 font-bold" onclick="window.submitServiceFeedback('${showFeedbackModal.serviceType}', 5, 'YES', null, document.getElementById('feedback-comment')?.value)">Submit Feedback</button>
            </div>
          </div>
        </div>
      ` : ''}

    </div>
  `;
}

// 6. CONCIERGE & PORTER (Clean Luggage Handling & Polished Tolani Voice Language)
function renderConciergeSection(guest) {
  return `
    <div class="max-w-3xl mx-auto flex flex-col gap-6 animate-fade-in">
      
      <div class="glass-panel p-6 sm:p-8 rounded-2xl">
        <div class="flex items-center justify-between pb-4 border-b border-gold/20 mb-6 gap-4 flex-wrap">
          <div>
            <span class="text-xs font-bold uppercase tracking-luxury text-gold">24/7 Mary · Concierge & Porter Services</span>
            <h2 class="text-2xl font-serif text-white mt-1">Mary · Concierge & Porter Assistance</h2>
            <p class="text-xs text-slate-300">Dedicated luggage handling, city cultural tours, pressing, and front desk coordination with Mary.</p>
          </div>
          <button 
            class="intercom-pill-btn"
            onclick="window.activateGuestServiceIntercom('CONCIERGE')"
            title="Direct Intercom for Mary Concierge"
          >
            ${renderIntercomRoundBadge(18)}
            <span>INTERCOM CONCIERGE</span>
          </button>
        </div>

        <!-- LUXURY PORTER SERVICE CARDS -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-3.5">
            <h3 class="font-serif text-sm font-bold text-white tracking-luxury uppercase flex items-center gap-2">
              <span>🧳</span> <span>Select Luggage Assistance Location</span>
            </h3>
            <span class="badge-gold text-[10px]">24/7 Porter Dispatch</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <!-- Card 1: REQUEST IN ROOM -->
            <div 
              class="glass-panel p-5 rounded-2xl border-2 border-gold/30 hover:border-gold transition-all duration-300 flex flex-col justify-between cursor-pointer group"
              style="box-shadow: 0 4px 20px rgba(0,0,0,0.4), inset 0 0 15px rgba(220, 173, 84, 0.08);"
              onclick="window.submitPorterRequest('In Room (Suite #' + '${guest.roomNumber}' + ')')"
            >
              <div>
                <div class="flex items-center justify-between gap-2 mb-3">
                  <div class="w-10 h-10 rounded-xl bg-gold/10 border border-gold/40 flex items-center justify-center text-xl text-gold group-hover:scale-110 transition-transform">
                    🛎️
                  </div>
                  <span class="badge-gold text-[10px]">Suite #${guest.roomNumber}</span>
                </div>
                <h4 class="font-serif text-base text-white font-bold tracking-wide mb-1">REQUEST IN ROOM</h4>
                <p class="text-xs text-slate-300 leading-relaxed mb-3">
                  Request porter assistance directly at your room.
                </p>
                <div class="text-[11px] text-slate-400">
                  Our porter team will arrive at Suite #${guest.roomNumber} for luggage collection and handling.
                </div>
              </div>

              <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span class="text-gold font-bold flex items-center gap-1 group-hover:text-white transition-colors">
                  <span>Dispatch to Room</span> <span>→</span>
                </span>
                <span class="text-[11px] text-emerald-400 font-medium">✓ Immediate Attendant</span>
              </div>
            </div>

            <!-- Card 2: REQUEST IN LOBBY -->
            <div 
              class="glass-panel p-5 rounded-2xl border-2 border-white/10 hover:border-gold transition-all duration-300 flex flex-col justify-between cursor-pointer group"
              style="box-shadow: 0 4px 20px rgba(0,0,0,0.4), inset 0 0 15px rgba(220, 173, 84, 0.04);"
              onclick="window.submitPorterRequest('Main Lobby Reception')"
            >
              <div>
                <div class="flex items-center justify-between gap-2 mb-3">
                  <div class="w-10 h-10 rounded-xl bg-white/5 border border-white/20 flex items-center justify-center text-xl text-white group-hover:scale-110 transition-transform">
                    🏛️
                  </div>
                  <span class="badge-normal text-[10px]">Ground Floor</span>
                </div>
                <h4 class="font-serif text-base text-white font-bold tracking-wide mb-1">REQUEST IN LOBBY</h4>
                <p class="text-xs text-slate-300 leading-relaxed mb-3">
                  Request porter assistance at the Main Lobby.
                </p>
                <div class="text-[11px] text-slate-400">
                  Our porter team will meet you at the ground floor entrance and reception desk for luggage handling.
                </div>
              </div>

              <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span class="text-gold font-bold flex items-center gap-1 group-hover:text-white transition-colors">
                  <span>Dispatch to Lobby</span> <span>→</span>
                </span>
                <span class="text-[11px] text-emerald-400 font-medium">✓ Main Entrance Standby</span>
              </div>
            </div>

          </div>
        </div>

        <!-- Other Concierge Services -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="glass-panel-subtle p-4 rounded-xl border border-white/10 flex flex-col justify-between">
            <div>
              <div class="text-xl mb-1">🍽️ Dining & Room Service</div>
              <p class="text-xs text-slate-300 mb-3">Order Chef Babatunde's signature Nigerian & continental dishes.</p>
            </div>
            <button class="btn-primary text-xs py-2 px-3 w-full" onclick="window.navigateGuestTab('restaurant')">
              Open Dining Menu →
            </button>
          </div>

          <div class="glass-panel-subtle p-4 rounded-xl border border-white/10 flex flex-col justify-between">
            <div>
              <div class="text-xl mb-1">⏰ Wake-Up Call</div>
              <p class="text-xs text-slate-300 mb-3">Schedule a pleasant morning chime & phone call.</p>
            </div>
            <button class="btn-secondary text-xs py-2 px-3 w-full" onclick="alert('Wake-up call scheduled for 06:30 AM.');">
              Set 06:30 AM Wake-up
            </button>
          </div>

          <div class="glass-panel-subtle p-4 rounded-xl border border-white/10 flex flex-col justify-between">
            <div>
              <div class="text-xl mb-1">🎭 Lagos Tours</div>
              <p class="text-xs text-slate-300 mb-3">VIP bookings for Kalakuta Shrine and art galleries.</p>
            </div>
            <button class="btn-secondary text-xs py-2 px-3 w-full" onclick="window.navigateGuestTab('nearby')">
              Browse Spots →
            </button>
          </div>

          <div class="glass-panel-subtle p-4 rounded-xl border border-white/10 flex flex-col justify-between">
            <div>
              <div class="text-xl mb-1">👔 Dry Cleaning</div>
              <p class="text-xs text-slate-300 mb-3">Express dry cleaning & traditional attire pressing.</p>
            </div>
            <button class="btn-secondary text-xs py-2 px-3 w-full" onclick="window.submitQuickService('Concierge', 'Express Dry Cleaning Pickup')">
              Request Laundry
            </button>
          </div>
        </div>

      </div>

    </div>
  `;
}

// 7. MY BILL & DIGITAL FOLIO (Spec #8 & #36)
function renderFolioSection(guest, totalFolio) {
  return `
    <div class="max-w-3xl mx-auto glass-panel p-6 sm:p-8 rounded-2xl">
      
      <div class="flex items-center justify-between pb-4 border-b border-gold/30 mb-6">
        <div>
          <span class="text-xs font-bold uppercase tracking-luxury text-gold">Consolidated Guest Folio</span>
          <h2 class="text-2xl font-serif text-white mt-1">Suite #${guest.roomNumber} Invoicing</h2>
          <div class="text-xs text-slate-300 mt-1">Guest: <strong class="text-white">${guest.name}</strong> · Stay: ${formatStayDate(guest.checkIn)} to ${formatStayDate(guest.checkOut)}</div>
        </div>
        <div class="text-right">
          <span class="text-xs text-slate-400">Total Outstanding</span>
          <div class="text-2xl font-serif font-bold text-gold">₦${totalFolio.toLocaleString()}</div>
        </div>
      </div>

      <!-- Itemized Table -->
      <div class="flex flex-col gap-2 mb-6">
        ${guest.folio.map((item, idx) => `
          <div class="p-3 rounded-xl bg-navy-950 border border-white/5 flex items-center justify-between text-xs">
            <div>
              <div class="font-semibold text-white">${item.desc}</div>
              <div class="text-slate-400 text-[10px]">${item.date} · Category: ${item.category}</div>
            </div>
            <div class="text-right">
              <div class="font-bold text-gold">₦${item.amount.toLocaleString()}</div>
              <span class="badge-normal text-[9px] py-0.2 px-1">${item.status}</span>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Digital Invoicing Actions -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
        <div class="text-xs text-slate-400">
          Charges are verified and posted in real-time. Payment may be settled upon checkout or charged to pre-authorized card.
        </div>
        <div class="flex items-center gap-2">
          <button class="btn-secondary text-xs py-2 px-4 whitespace-nowrap" onclick="window.print()">
            🖨 Print Invoice
          </button>
          <button class="btn-primary text-xs py-2 px-4 whitespace-nowrap" onclick="alert('Digital PDF receipt sent to ${guest.email}')">
            📧 Email Folio PDF
          </button>
        </div>
      </div>

    </div>
  `;
}

// 8. NEARBY SUGGESTIONS ("Near Hotel Capitol") (Spec #22)
function renderNearbySection() {
  const state = store.getState();
  const categories = ['All', 'Salons & Barbers', 'Supermarkets', 'Nightlife & Lounges', 'Tourist & Cultural'];

  return `
    <div class="max-w-4xl mx-auto flex flex-col gap-6">
      
      <div>
        <span class="text-xs font-bold uppercase tracking-luxury text-gold">Curated Ikeja & Lagos Directory</span>
        <h2 class="text-2xl font-serif text-white mt-1">Near Hotel Capitol</h2>
        <p class="text-xs text-slate-300">Discover trusted grooming, shopping, nightlife, and cultural destinations.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${state.nearbyRecommendations.map(loc => `
          <div class="glass-panel p-5 rounded-2xl border ${loc.isHotelApproved ? 'border-gold shadow-gold' : 'border-white/10'} flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-slate-400">${loc.category}</span>
                ${loc.isHotelApproved ? '<span class="badge-gold text-xs">⭐ Hotel Capitol Approved</span>' : '<span class="badge-subtle text-xs text-slate-400">Nearby Option</span>'}
              </div>
              <h3 class="font-serif text-base text-white font-bold mb-1">${loc.name}</h3>
              <p class="text-xs text-slate-300 leading-relaxed mb-3">${loc.desc}</p>
            </div>

            <div class="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span class="text-gold font-medium">📍 ${loc.distance}</span>
              <span class="text-amber-400">★ ${loc.rating} / 5.0</span>
            </div>
          </div>
        `).join('')}
      </div>

    </div>
  `;
}

// 9. HOTEL AMENITIES & INFO
function renderHotelInfoSection() {
  const state = store.getState();
  const publishedAmenities = (state.amenities || []).filter(a => a.status === 'PUBLISHED' && a.available !== false);

  return `
    <div class="max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in">
      <div class="glass-panel p-6 sm:p-8 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
        <div>
          <span class="text-xs font-bold uppercase tracking-luxury text-gold">Facility Directory & Guest Privileges</span>
          <h2 class="text-2xl font-serif text-white mt-1">Hotel Capitol Amenities</h2>
          <p class="text-xs text-slate-300">Live operational hours, location guides, and instructions for hotel resident facilities.</p>
        </div>
        <button 
          class="intercom-pill-btn"
          onclick="window.activateTolaniIntercom('AMENITIES', 'Amenities & Facilities')"
          title="Ask Tolani about amenities"
        >
          ${renderIntercomRoundBadge(18)}
          <span>Ask Tolani</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${publishedAmenities.map(amenity => `
          <div class="glass-panel rounded-2xl overflow-hidden border-2 border-gold/30 flex flex-col justify-between" style="box-shadow: 0 4px 20px rgba(0,0,0,0.4);">
            ${amenity.image ? `
              <div class="h-40 w-full relative overflow-hidden bg-navy-950">
                <img src="${amenity.image}" alt="${amenity.name}" class="w-full h-full object-cover" />
                <div class="absolute top-2.5 left-2.5 bg-navy-950/85 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-200 border border-white/10">
                  ${amenity.category}
                </div>
                ${amenity.featured ? '<div class="absolute top-2.5 right-2.5 badge-gold text-[10px]">⭐ Featured</div>' : ''}
              </div>
            ` : ''}

            <div class="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 class="font-serif text-base text-white font-bold mb-1">${amenity.name}</h3>
                <p class="text-xs text-slate-300 leading-relaxed mb-3">${amenity.description}</p>
                
                <div class="flex flex-col gap-1.5 p-3 rounded-xl bg-navy-950/70 border border-white/5 text-xs text-slate-300 mb-3">
                  <div class="flex items-center justify-between">
                    <span class="text-slate-400">🕒 Hours:</span>
                    <strong class="text-gold font-medium">${amenity.openingHours}</strong>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-slate-400">📍 Location:</span>
                    <strong class="text-white">${amenity.location}</strong>
                  </div>
                  ${amenity.rules ? `
                    <div class="pt-1.5 border-t border-white/5 text-[11px] text-slate-300">
                      <strong>Policy:</strong> ${amenity.rules}
                    </div>
                  ` : ''}
                </div>
              </div>

              <div class="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span>📞 ${amenity.contact || 'Ext 0 / Front Desk'}</span>
                <span class="text-emerald-400 font-medium">✓ Complimentary Resident Access</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// 10. CHECKOUT WORKFLOW (Spec #18)
function renderCheckoutSection(guest) {
  return `
    <div class="max-w-2xl mx-auto glass-panel-gold p-6 sm:p-8 rounded-2xl text-center">
      <div class="text-3xl mb-2">🛫</div>
      <span class="text-xs font-bold uppercase tracking-luxury text-gold">45-Minute Pre-Departure Outreach</span>
      <h2 class="text-2xl font-serif text-white mt-1 mb-2">Departure Assistance</h2>
      <p class="text-xs text-slate-300 max-w-md mx-auto mb-6">
        Scheduled Checkout for Suite #${guest.roomNumber} is at <strong class="text-white">${guest.checkoutHour}</strong> on <strong class="text-white">${formatStayDate(guest.checkOut)}</strong>.
      </p>

      <div class="flex flex-col gap-3 max-w-md mx-auto">
        <button class="btn-primary py-3 text-xs font-bold" onclick="alert('Late checkout extension request submitted to management for Suite ${guest.roomNumber}.');">
          Request Late Checkout (Extend to 03:00 PM)
        </button>

        <button class="btn-secondary py-3 text-xs font-semibold" onclick="window.submitQuickService('Concierge', 'Luggage Assistance for Departure'); window.navigateGuestTab('transport');">
          Request Luggage Assistance & Book Airport Taxi
        </button>

        <button class="btn-secondary py-3 text-xs font-semibold" onclick="window.navigateGuestTab('folio')">
          View & Settle Digital Folio (₦${guest.folio.reduce((a,b)=>a+b.amount,0).toLocaleString()})
        </button>
      </div>
    </div>
  `;
}

// 11. CONTACT FRONT DESK
function renderContactSection() {
  return `
    <div class="max-w-2xl mx-auto glass-panel p-6 sm:p-8 rounded-2xl text-center">
      <div class="text-3xl mb-2">📞</div>
      <h2 class="text-2xl font-serif text-white mb-2">Contact Hotel Capitol</h2>
      <p class="text-xs text-slate-300 mb-6">Our front desk concierge and duty managers are on standby 24/7.</p>

      <div class="flex flex-col gap-3 max-w-sm mx-auto text-left text-xs text-slate-300">
        <div class="p-3 bg-navy-950 rounded-xl border border-gold/30 flex items-center justify-between">
          <span>In-Room Extension:</span>
          <strong class="text-gold text-sm">Ext 0 (Front Desk)</strong>
        </div>
        <div class="p-3 bg-navy-950 rounded-xl border border-white/10 flex items-center justify-between">
          <span>Telephone:</span>
          <strong class="text-white">+234 1 890 2200</strong>
        </div>
        <div class="p-3 bg-navy-950 rounded-xl border border-white/10 flex items-center justify-between">
          <span>Mobile / WhatsApp:</span>
          <strong class="text-white">+234 803 555 4020</strong>
        </div>
      </div>

      <div class="mt-6 flex justify-center">
        <button 
          class="btn-primary py-3 px-6 text-xs font-bold flex items-center gap-2"
          onclick="window.openDirectIntercomCall('general-operations', 'Front Desk & Reception', 'Supervisor Tariq');"
          title="Direct two-way voice call to Front Desk"
        >
          ${renderIntercomRoundBadge(20)}
          <span>Intercom Front Desk & Reception</span>
        </button>
      </div>
    </div>
  `;
}
