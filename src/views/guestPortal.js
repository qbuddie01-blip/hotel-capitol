/**
 * HOTEL CAPITOL — GUEST PORTAL & MOBILE FIRST EXPERIENCE
 * 6 Animashaun Close, Ikeja, Lagos
 * 10 Service Workflows: Restaurant, Breakfast, Room Service, Transport, Folio, Concierge, AI, Nearby, Info, Contact
 */

import { getIcon, renderIntercomRoundBadge, renderIntercomBlackBadge } from '../assets/icons.js';
import { store } from '../store/state.js';
import { automationEngine } from '../services/automationRules.js';
import { aiEngine } from '../services/aiEngine.js';

let activeGuestTab = 'home'; // 'home' | 'restaurant' | 'breakfast' | 'room-service' | 'transport' | 'concierge' | 'folio' | 'nearby' | 'info' | 'contact'
let selectedCategory = 'Food';
let cart = []; // Cart items for restaurant ordering
let orderDraftExtras = {};
let isVoiceActiveForService = false;

export function initGuestPortal() {
  window.getActiveGuestTab = () => activeGuestTab;

  window.navigateGuestTab = (tab) => {
    activeGuestTab = tab;
    if (window.renderApp) window.renderApp();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      specialInstructions: specialNotes
    });

    // Reset extras for that item
    orderDraftExtras[menuId] = [];
    automationEngine.playChime('bell');
    automationEngine.showToast('Item Added to Order', `${item.name} added to your tray.`, 'success');
    if (window.renderApp) window.renderApp();
  };

  window.submitGuestRestaurantOrder = () => {
    if (cart.length === 0) {
      alert('Your tray is currently empty. Please select an item from the menu.');
      return;
    }

    const totalAmount = cart.reduce((sum, item) => {
      const extrasSum = item.extras.reduce((es, e) => es + e.price, 0);
      return sum + (item.basePrice + extrasSum) * item.quantity;
    }, 0);

    const newOrder = store.createOrder({
      items: [...cart],
      totalAmount,
      estimatedMinutes: 25
    });

    cart = [];
    automationEngine.playChime('order');
    automationEngine.showToast('Order Placed Successfully', `Order ${newOrder.id} has been dispatched to Executive Chef Babatunde.`, 'success');
    
    // Auto advance order simulation for demo
    setTimeout(() => {
      store.updateOrderStatus(newOrder.id, 'PREPARING');
      automationEngine.showToast('Kitchen Update', `Chef Babatunde is now preparing order ${newOrder.id}.`, 'info');
      if (window.renderApp) window.renderApp();
    }, 3000);

    activeGuestTab = 'restaurant';
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

  // Submit custom room service
  window.submitCustomRoomService = () => {
    const text = document.getElementById('room-service-custom-text')?.value.trim();
    if (!text) {
      alert('Please describe your room service request or use voice dictation.');
      return;
    }
    const req = store.createServiceRequest('Housekeeping', 'Custom Guest Request', text, 'HIGH');
    automationEngine.playChime('bell');
    automationEngine.showToast('Request Created', `Request ${req.id} created: "${text}"`, 'success');
    aiEngine.speak(`Thank you Chief Adeleke. Your request has been registered and dispatched.`);
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
  const guest = store.getActiveGuest();
  const totalFolio = guest.folio.reduce((sum, item) => sum + item.amount, 0);
  const activeOrders = state.orders.filter(o => o.guestId === guest.id && o.status !== 'DELIVERED');

  let tabContent = '';

  if (activeGuestTab === 'home') {
    tabContent = renderGuestHomeCards(guest, activeOrders);
  } else if (activeGuestTab === 'restaurant') {
    tabContent = renderRestaurantSection(guest, activeOrders);
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
            <strong class="text-white">Suite #${guest.roomNumber}</strong> · ${guest.roomType} · Stay: <strong>${guest.checkIn} to ${guest.checkOut}</strong>
          </p>
        </div>

        <!-- Instruction 1: Stack 'Ask Hotel Capitol AI' and 'Intercom' tabs vertically in Guest profile card -->
        <div class="flex flex-col items-stretch sm:items-end gap-2.5 w-full md:w-auto mt-3 md:mt-0">
          <button 
            class="floating-ai-btn-banner py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 w-full sm:w-auto" 
            onclick="window.toggleAIAssistant(true)"
            title="Ask Hotel Capitol AI"
          >
            <span class="floating-ai-pulse" aria-label="AI Online"></span>
            <div class="floating-ai-icon-wrapper">
              <svg width="18" height="18" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="modern-ai-icon">
                <defs>
                  <linearGradient id="aiBannerGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="25%" stop-color="#fff1b8"/>
                    <stop offset="60%" stop-color="#ffd700"/>
                    <stop offset="100%" stop-color="#c5a059"/>
                  </linearGradient>
                </defs>
                <path d="M14 2.5 L16.8 10.2 L24.5 13 L16.8 15.8 L14 23.5 L11.2 15.8 L3.5 13 L11.2 10.2 Z" fill="url(#aiBannerGoldGrad)" stroke="#ffffff" stroke-width="0.8"/>
                <circle cx="14" cy="13" r="2.2" fill="#ffffff"/>
                <path d="M21.5 4.5 L22.6 7.4 L25.5 8.5 L22.6 9.6 L21.5 12.5 L20.4 9.6 L17.5 8.5 L20.4 7.4 Z" fill="#ffd700"/>
                <path d="M6.5 16.5 L7.4 18.9 L9.8 19.8 L7.4 20.7 L6.5 23.1 L5.6 20.7 L3.2 19.8 L5.6 18.9 Z" fill="#ffd700"/>
              </svg>
            </div>
            <span class="floating-ai-text" style="font-size: 0.82rem;">Ask Hotel Capitol AI</span>
          </button>
          
          <button 
            class="menu-btn-gold py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 w-full sm:w-auto"
            onclick="window.openDirectIntercomCall('concierge-frontdesk', 'Front Desk Reception', 'Supervisor Tariq');"
            title="Open direct two-way intercom call to Hotel Capitol staff"
          >
            ${renderIntercomRoundBadge(20)}
            <span>Intercom Front Desk</span>
          </button>

          ${activeGuestTab !== 'home' ? `
            <button class="btn-secondary py-2 px-4 text-xs font-semibold w-full sm:w-auto text-center" onclick="window.navigateGuestTab('home')">
              ← Main Menu
            </button>
          ` : ''}
        </div>
      </div>

      <!-- ACTIVE ORDERS ALERT BAR (If any) -->
      ${activeOrders.length > 0 ? `
        <div class="glass-panel p-4 rounded-xl mb-6 border border-gold flex items-center justify-between gap-4 bg-navy-850">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full bg-gold animate-pulse"></div>
            <div>
              <div class="text-xs font-bold text-white">Active Culinary Order: ${activeOrders[0].id}</div>
              <div class="text-xs text-gold-light">Status: <strong class="uppercase">${activeOrders[0].status}</strong> (Est. 25 mins)</div>
            </div>
          </div>
          <button class="btn-secondary text-xs py-1.5 px-3" onclick="window.navigateGuestTab('restaurant')">
            Track Order →
          </button>
        </div>
      ` : ''}

      <!-- TAB CONTENT RENDER -->
      ${tabContent}

    </div>
  `;
}

// 1. GUEST PORTAL HOME - 10 LARGE SERVICE CARDS + DIRECT SUITE INTERCOM BAR
function renderGuestHomeCards(guest, activeOrders) {
  const cards = [
    { id: 'restaurant', icon: '🍽', title: 'Restaurant & Dining', badge: 'Popular', intercomChannel: 'kitchen-fb' },
    { id: 'breakfast', icon: '☕', title: 'Breakfast Service', badge: guest.breakfastEntitlement === 'Complimentary' ? 'Complimentary' : 'Available', intercomChannel: 'kitchen-fb' },
    { id: 'room-service', icon: '🛎', title: 'Room Service & Cleaning', badge: 'Voice<br/>Enabled', intercomChannel: 'housekeeping' },
    { id: 'transport', icon: '🚕', title: 'VIP Transportation', badge: 'Instant<br/>Quote', intercomChannel: 'concierge-frontdesk' },
    { id: 'concierge', icon: '🧳', title: 'Concierge & Porter', badge: '24/7<br/>Support', intercomChannel: 'concierge-frontdesk' },
    { id: 'folio', icon: '🧾', title: 'My Bill & Folio', badge: `₦${guest.folio.reduce((a, b) => a + b.amount, 0).toLocaleString()}` },
    { id: 'ai', icon: '🤖', title: 'Ask Hotel Capitol AI', badge: 'Instant<br/>AI', intercomChannel: null },
    { id: 'nearby', icon: '📍', title: 'Near Hotel Capitol', badge: 'Ikeja<br/>Guide', intercomChannel: null },
    { id: 'info', icon: '🏨', title: 'Hotel Amenities & WiFi', badge: 'Hotel<br/>Info', intercomChannel: null },
    { id: 'contact', icon: '📞', title: 'Contact Front Desk', badge: 'Live<br/>Desk', intercomChannel: 'general-operations' }
  ];

  return `
    <!-- DIRECT SUITE INTERCOM CARD (Vertically Stretched Length, Glowy Gold Background, Solid Black Contents, Stacked Tabs Vertically to Left Side) -->
    <div class="intercom-banner-gold p-6 sm:p-8 rounded-2xl mb-8 flex flex-col items-start justify-between min-h-[290px] gap-6">
      
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
              Instant two-way voice dispatch to Hotel Capitol staff departments.
            </p>
          </div>
        </div>

        <!-- Instruction 2: Line Live Label (Bold Black Font, Chocolate Brown Rounded Borders) -->
        <div class="line-live-badge self-start sm:self-auto">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-700 animate-pulse"></span>
          <span>Line Live</span>
        </div>
      </div>

      <!-- Instruction 1: Vertically Stacked Tabs to Left Side of Card -->
      <div class="flex flex-col items-start gap-3.5 w-full sm:w-auto pt-2 pb-1">
        <button class="intercom-gold-tab-btn" onclick="window.openDirectIntercomCall('concierge-frontdesk', 'Front Desk', 'Supervisor Tariq');" title="Direct 2-way voice to Front Desk">
          ${renderIntercomBlackBadge(20)} <span>Intercom Front Desk</span>
        </button>
        <button class="intercom-gold-tab-btn" onclick="window.openDirectIntercomCall('kitchen-fb', 'Kitchen', 'Chef Babatunde');" title="Direct 2-way voice to Kitchen">
          ${renderIntercomBlackBadge(20)} <span>Intercom Kitchen</span>
        </button>
        <button class="intercom-gold-tab-btn" onclick="window.openDirectIntercomCall('housekeeping', 'Housekeeping', 'Amara Nwosu');" title="Direct 2-way voice to Housekeeping">
          ${renderIntercomBlackBadge(20)} <span>Intercom Housekeeping</span>
        </button>
      </div>

    </div>

    <!-- Cards Container (Ends scroll cleanly in 1 light swipe while maintaining clear space from bottom menu) -->
    <div class="grid-responsive-cards mb-6">
      ${cards.map(c => `
        <div 
          class="service-card flex flex-col justify-between cursor-pointer transform hover:-translate-y-1 transition-all"
          onclick="${c.id === 'ai' ? 'window.toggleAIAssistant(true)' : `window.navigateGuestTab('${c.id}')`}"
          style="box-shadow: 0 4px 20px rgba(0,0,0,0.4), inset 0 0 10px rgba(220, 173, 84, 0.05);"
        >
          <div>
            ${c.id === 'breakfast' ? `
              <!-- Instruction 1: BREAKFAST SERVICE - Place Coffee cup icon above 'Complimentary' Label -->
              <div class="flex flex-col items-start gap-2 mb-3">
                <div class="service-card-icon">${c.icon}</div>
                ${c.badge ? `<span class="badge-gold" style="align-self: flex-start; margin-top: 2px;">${c.badge}</span>` : ''}
              </div>
            ` : `
              <!-- Centered Side-by-Side Icon & Badge Row with Balanced Spacing -->
              <div class="service-card-top-row">
                <div class="service-card-icon">${c.icon}</div>
                <!-- Instructions 2 & 3: Shift Concierge & Folio Badges to the Left for Visible Borders with Zero Lapping -->
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

          <!-- Instruction 4: Sleek Clean Footer with High-Visibility CTA Buttons for All Cards (Including Bottom Two Cards: Hotel Amenities & WiFi and Contact Front Desk) -->
          <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
            <span class="text-gold font-bold text-xs flex items-center gap-1.5 hover:text-white transition-colors">
              <span>${c.id === 'contact' ? 'Contact Desk' : c.id === 'info' ? 'Explore Amenities' : 'Explore'}</span> 
              <span class="text-sm font-bold">→</span>
            </span>
            
            ${c.intercomChannel ? `
              <button 
                class="intercom-icon-btn"
                onclick="event.stopPropagation(); window.openDirectIntercomCall('${c.intercomChannel}', '${c.title}');"
                title="Direct Intercom Call to ${c.title}"
              >
                ${renderIntercomRoundBadge(20)}
              </button>
            ` : ''}
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Modest structural buffer so scroll ends in 1 light swipe while keeping space above bottom navigation -->
    <div style="height: 20px; width: 100%; pointer-events: none;" aria-hidden="true"></div>
  `;
}

// 2. RESTAURANT & MENU SECTION
function renderRestaurantSection(guest, activeOrders) {
  const state = store.getState();
  const categories = ['Food', 'Drinks', 'Breakfast', 'Desserts', 'Snacks'];
  const filteredMenu = state.menu.filter(m => m.category === selectedCategory);

  const cartTotal = cart.reduce((sum, item) => {
    const extrasSum = item.extras.reduce((es, e) => es + e.price, 0);
    return sum + (item.basePrice + extrasSum) * item.quantity;
  }, 0);

  return `
    <div class="flex flex-col lg:flex-row gap-8">
      
      <!-- Left: Menu Browser -->
      <div class="flex-1">
        
        <div class="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <div>
            <h2 class="text-xl sm:text-2xl font-serif text-white">Hotel Capitol Restaurant</h2>
            <p class="text-xs text-slate-300">Gourmet culinary experiences prepared fresh by Executive Chef Babatunde.</p>
          </div>
          <button 
            class="intercom-pill-btn"
            onclick="window.openDirectIntercomCall('kitchen-fb', 'Kitchen & Dining', 'Chef Babatunde');"
            title="Direct intercom to Executive Chef Babatunde & Kitchen"
          >
            ${renderIntercomRoundBadge(18)}
            <span>Intercom Kitchen</span>
          </button>
        </div>

        <!-- Category Selector with Golden Outlay & Glowing Borders (Horizontal Smooth Scroll on Mobile) -->
        <div class="category-tabs-scroll">
          ${categories.map(cat => `
            <button 
              class="menu-btn-gold ${selectedCategory === cat ? 'active' : ''}"
              onclick="window.setMenuCategory('${cat}')"
            >
              <span>${cat === 'Food' ? '🍲' : cat === 'Drinks' ? '🍹' : cat === 'Breakfast' ? '🍳' : cat === 'Desserts' ? '🍰' : '🥨'}</span>
              <span>${cat}</span>
            </button>
          `).join('')}
        </div>

        <!-- Menu Items List -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${filteredMenu.map(item => {
            const selectedAddonIds = orderDraftExtras[item.id] || [];
            return `
              <div class="glass-panel rounded-2xl overflow-hidden flex flex-col justify-between border-2 border-gold/30 hover:border-gold transition-all" style="box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 0 15px rgba(220, 173, 84, 0.15);">
                
                <div class="h-44 w-full relative overflow-hidden bg-navy-950 rounded-t-2xl">
                  <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" />
                  <div class="absolute top-2.5 left-2.5 bg-navy-950/85 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-200 border border-white/10">
                    ${item.category || 'Specialty'}
                  </div>
                </div>

                <div class="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <!-- Title & Price Row (Fluid Flexbox - No Absolute Overlap) -->
                    <div class="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
                      <h3 class="font-serif text-base text-white font-bold flex-1 min-w-[140px]">${item.name}</h3>
                      <div class="bg-amber-500/15 border border-gold/40 px-2.5 py-1 rounded-full text-xs font-bold text-gold whitespace-nowrap shadow-sm">
                        ₦${item.price.toLocaleString()}
                      </div>
                    </div>

                    <!-- Preparation Time Metadata -->
                    <div class="flex items-center gap-2 mb-2 text-xs text-slate-300">
                      <span class="inline-flex items-center gap-1.5 bg-navy-950/90 px-2.5 py-0.5 rounded-md border border-white/10 text-[11px] text-slate-300 font-medium">
                        ${getIcon('clock', 12)} <span>~${item.prepTimeMinutes} mins prep</span>
                      </span>
                    </div>

                    <p class="text-xs text-slate-200 leading-relaxed mb-4">${item.desc}</p>
                    
                    <!-- Configurable Add-ons / Extras (Spec #10) -->
                    ${item.addons && item.addons.length > 0 ? `
                      <div class="mb-4 bg-navy-950/70 p-3 rounded-xl border border-white/5">
                        <div class="text-xs font-bold text-gold mb-2 flex items-center justify-between">
                          <span>Optional Extras & Add-ons:</span>
                          <span class="text-slate-400 font-normal">Select below</span>
                        </div>
                        <div class="flex flex-col gap-1.5">
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

                  <button class="btn-primary w-full py-2 text-xs font-bold mt-2" onclick="window.addToCart('${item.id}')">
                    Add to Tray (${item.addons && selectedAddonIds.length > 0 ? `${selectedAddonIds.length} extras` : 'Standard'})
                  </button>

                </div>

              </div>
            `;
          }).join('')}
        </div>

      </div>

      <!-- Right: Active Cart Tray & Live Orders -->
      <div class="w-full lg:w-80 flex flex-col gap-6">
        
        <!-- Cart Tray -->
        <div class="glass-panel-gold p-5 rounded-2xl">
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
                  ${c.extras.length > 0 ? `
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

            <button class="btn-primary w-full py-2.5 text-xs font-bold" onclick="window.submitGuestRestaurantOrder()">
              Confirm & Dispatch Order →
            </button>
          `}
        </div>

        <!-- Real-Time Order Tracking List (Spec #11 & #12) -->
        <div class="glass-panel p-5 rounded-2xl">
          <h3 class="font-serif text-sm font-bold text-white tracking-luxury mb-3">ACTIVE ORDERS & STATUS</h3>
          ${state.orders.filter(o => o.guestId === guest.id).length === 0 ? `
            <div class="text-xs text-slate-400">No recent orders for Suite ${guest.roomNumber}.</div>
          ` : `
            <div class="flex flex-col gap-3">
              ${state.orders.filter(o => o.guestId === guest.id).map(o => `
                <div class="p-3 rounded-xl bg-navy-950 border border-gold/30 text-xs">
                  <div class="flex items-center justify-between mb-1">
                    <strong class="text-white">${o.id}</strong>
                    <span class="badge-${o.status === 'DELIVERED' ? 'normal' : o.status === 'PREPARING' ? 'attention' : 'gold'} text-xs uppercase font-bold">
                      ${o.status}
                    </span>
                  </div>
                  <div class="text-slate-300 mb-2">${o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</div>
                  
                  <!-- Progress Bar -->
                  <div class="w-full bg-navy-800 h-1.5 rounded-full overflow-hidden mb-2">
                    <div class="bg-gold h-full transition-all duration-500" style="width: ${
                      o.status === 'PENDING' ? '25%' : o.status === 'PREPARING' ? '60%' : o.status === 'OUT FOR DELIVERY' ? '85%' : '100%'
                    };"></div>
                  </div>

                  <div class="flex items-center justify-between text-slate-400 text-xs">
                    <span>Placed: ${o.createdAt}</span>
                    <span class="text-gold font-semibold">₦${o.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
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

// 5. VIP TRANSPORTATION & PAYMENT (Spec #19 & #20)
function renderTransportSection(guest) {
  const state = store.getState();

  return `
    <div class="max-w-4xl mx-auto flex flex-col gap-8">
      
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <span class="text-xs font-bold uppercase tracking-luxury text-gold">Chauffeured Executive Fleet</span>
          <h2 class="text-2xl font-serif text-white mt-1">Hotel Capitol Transportation</h2>
          <p class="text-xs text-slate-300">Official luxury transit to Murtala Muhammed Airport, Victoria Island, and Lagos destinations.</p>
        </div>
        <button 
          class="intercom-pill-btn"
          onclick="window.openDirectIntercomCall('concierge-frontdesk', 'Concierge & Transport', 'Ibrahim Bello');"
          title="Direct intercom to Lead Concierge Ibrahim"
        >
          ${renderIntercomRoundBadge(18)}
          <span>Intercom Concierge</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${state.transportOptions.map(opt => `
          <div class="glass-panel p-6 rounded-2xl border border-gold/20 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-2">
                <div class="text-2xl">🚕</div>
                <span class="badge-gold text-xs">${opt.distanceEst}</span>
              </div>
              <h3 class="font-serif text-base text-white font-bold mb-1">${opt.destination}</h3>
              
              <div class="my-4 flex flex-col gap-2">
                ${opt.vehicles.map((v, vIdx) => `
                  <div class="p-3 rounded-xl bg-navy-950 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <div class="font-semibold text-white">${v.type}</div>
                      <div class="text-slate-400 text-[10px]">${v.seats} Passenger Capacity · Luggage Space</div>
                    </div>
                    <div class="text-right">
                      <div class="font-bold text-gold text-sm">₦${v.price.toLocaleString()}</div>
                      <button 
                        class="btn-primary text-[10px] py-1 px-2.5 mt-1 font-bold"
                        onclick="window.bookTransportation('${opt.id}', ${vIdx})"
                      >
                        Book & Pay
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
              <span>Pickup: Suite ${guest.roomNumber}</span>
              <span class="text-emerald-400">✓ Hotel Verified Vehicle</span>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Booking History -->
      <div class="glass-panel p-6 rounded-2xl">
        <h3 class="font-serif text-sm font-bold text-white tracking-luxury mb-4">YOUR TRANSPORTATION BOOKINGS</h3>
        ${state.transportBookings.filter(b => b.guestId === guest.id).length === 0 ? `
          <div class="text-xs text-slate-400">No active ride bookings.</div>
        ` : `
          <div class="flex flex-col gap-3">
            ${state.transportBookings.filter(b => b.guestId === guest.id).map(b => `
              <div class="p-3.5 rounded-xl bg-navy-950 border border-gold/30 flex items-center justify-between text-xs">
                <div>
                  <strong class="text-white">${b.destination}</strong>
                  <div class="text-slate-400 text-[11px]">${b.vehicle} · Pickup: ${b.pickupTime}</div>
                </div>
                <div class="text-right">
                  <span class="badge-normal text-[10px] py-0.5">${b.paymentStatus}</span>
                  <div class="text-gold font-bold mt-1">₦${b.price.toLocaleString()}</div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

    </div>
  `;
}

// 6. CONCIERGE & PORTER (Spec #21)
function renderConciergeSection(guest) {
  return `
    <div class="max-w-3xl mx-auto glass-panel p-6 sm:p-8 rounded-2xl">
      <div class="mb-6">
        <span class="text-xs font-bold uppercase tracking-luxury text-gold">24/7 Digital Concierge</span>
        <h2 class="text-2xl font-serif text-white mt-1">Concierge & Guest Assistance</h2>
        <p class="text-xs text-slate-300">Our concierge desk handles luggage assistance, flight check-in, city tours, and private reservations.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div class="glass-panel-subtle p-4 rounded-xl border border-white/10">
          <div class="text-xl mb-2">🧳 Luggage & Porter</div>
          <p class="text-xs text-slate-300 mb-3">Request safe luggage collection or baggage storage in our secure vault.</p>
          <button class="btn-primary text-xs py-2 px-3 w-full" onclick="window.submitQuickService('Concierge', 'Luggage Porter Assistance')">
            Request Porter to Suite ${guest.roomNumber}
          </button>
        </div>

        <div class="glass-panel-subtle p-4 rounded-xl border border-white/10">
          <div class="text-xl mb-2">⏰ Wake-Up Call</div>
          <p class="text-xs text-slate-300 mb-3">Schedule an automated pleasant morning chime & front desk call.</p>
          <button class="btn-secondary text-xs py-2 px-3 w-full" onclick="alert('Wake-up call scheduled for 06:30 AM.');">
            Set 06:30 AM Wake-up
          </button>
        </div>

        <div class="glass-panel-subtle p-4 rounded-xl border border-white/10">
          <div class="text-xl mb-2">🎭 Lagos Tours & Culture</div>
          <p class="text-xs text-slate-300 mb-3">VIP bookings for Kalakuta Shrine, Nike Art Gallery, and Lekki Conservation Centre.</p>
          <button class="btn-secondary text-xs py-2 px-3 w-full" onclick="window.navigateGuestTab('nearby')">
            Browse Cultural Spots →
          </button>
        </div>

        <div class="glass-panel-subtle p-4 rounded-xl border border-white/10">
          <div class="text-xl mb-2">👔 Dry Cleaning & Pressing</div>
          <p class="text-xs text-slate-300 mb-3">Same-day express dry cleaning and bespoke traditional attire pressing.</p>
          <button class="btn-primary text-xs py-2 px-3 w-full" onclick="window.submitQuickService('Concierge', 'Express Dry Cleaning Pickup')">
            Request Laundry Pickup
          </button>
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
          <div class="text-xs text-slate-300 mt-1">Guest: <strong class="text-white">${guest.name}</strong> · Stay: ${guest.checkIn} to ${guest.checkOut}</div>
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
  return `
    <div class="max-w-3xl mx-auto glass-panel p-6 sm:p-8 rounded-2xl">
      <div class="mb-6">
        <span class="text-xs font-bold uppercase tracking-luxury text-gold">Facility Directory</span>
        <h2 class="text-2xl font-serif text-white mt-1">Hotel Capitol Amenities</h2>
      </div>

      <div class="flex flex-col gap-4">
        <div class="p-4 rounded-xl bg-navy-950 border border-gold/30">
          <div class="font-serif font-bold text-white text-sm mb-1">📶 High-Speed Fiber WiFi</div>
          <div class="text-xs text-slate-300">Network: <strong class="text-white">Capitol-VIP-Guest</strong> | Pass: <strong class="text-gold">CapitolLagos2026</strong></div>
        </div>

        <div class="p-4 rounded-xl bg-navy-950 border border-white/10">
          <div class="font-serif font-bold text-white text-sm mb-1">🏊 Poolside Terrace & Cabanas</div>
          <div class="text-xs text-slate-300">Open daily 06:30 AM – 10:00 PM (1st Floor Terrace). Towels and cocktail service available poolside.</div>
        </div>

        <div class="p-4 rounded-xl bg-navy-950 border border-white/10">
          <div class="font-serif font-bold text-white text-sm mb-1">🏋️ Executive Fitness Center</div>
          <div class="text-xs text-slate-300">24/7 Access with room keycard (2nd Floor). Cardio machines, free weights, and chilled mineral water.</div>
        </div>

        <div class="p-4 rounded-xl bg-navy-950 border border-white/10">
          <div class="font-serif font-bold text-white text-sm mb-1">⏰ Check-In & Departure Times</div>
          <div class="text-xs text-slate-300">Standard Check-in: 02:00 PM | Standard Checkout: 12:00 PM. Late checkout can be requested via Hotel Capitol AI.</div>
        </div>
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
        Scheduled Checkout for Suite #${guest.roomNumber} is at <strong class="text-white">${guest.checkoutHour}</strong> on <strong class="text-white">${guest.checkOut}</strong>.
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
