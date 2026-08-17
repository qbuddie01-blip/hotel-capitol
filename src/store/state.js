/**
 * HOTEL CAPITOL — CENTRAL REACTIVE STATE STORE & DEMO DATA
 * 6 Animashaun Close, Ikeja, Lagos
 */

export const STORAGE_KEY = 'HOTEL_CAPITOL_STATE_V10';

// Real Role-Based Access Control Definitions
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  HOTEL_ADMIN: 'HOTEL_ADMIN',
  CONTENT_MANAGER: 'CONTENT_MANAGER',
  TRANSPORT_MANAGER: 'TRANSPORT_MANAGER',
  RESTAURANT_MANAGER: 'RESTAURANT_MANAGER',
  FRONT_DESK: 'FRONT_DESK'
};

export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['ALL'],
  HOTEL_ADMIN: [
    'VIEW_DASHBOARD', 'MANAGE_MENU', 'PUBLISH_MENU', 'MANAGE_BREAKFAST', 'MANAGE_AMENITIES',
    'MANAGE_MEDIA', 'MANAGE_SERVICES', 'MANAGE_TRANSPORT_PRICING', 'DISPATCH_TRANSPORT',
    'APPROVE_TOLANI_LEARNING', 'ROLLBACK_TOLANI_LEARNING', 'MANAGE_STAFF', 'VIEW_AUDIT_LOGS', 'MANAGE_SETTINGS'
  ],
  CONTENT_MANAGER: [
    'VIEW_DASHBOARD', 'MANAGE_MENU', 'PUBLISH_MENU', 'MANAGE_BREAKFAST', 'MANAGE_AMENITIES',
    'MANAGE_MEDIA', 'MANAGE_SERVICES', 'VIEW_AUDIT_LOGS'
  ],
  TRANSPORT_MANAGER: [
    'VIEW_DASHBOARD', 'MANAGE_TRANSPORT_PRICING', 'DISPATCH_TRANSPORT', 'VIEW_AUDIT_LOGS'
  ],
  RESTAURANT_MANAGER: [
    'VIEW_DASHBOARD', 'MANAGE_MENU', 'PUBLISH_MENU', 'MANAGE_BREAKFAST', 'MANAGE_ORDERS', 'VIEW_AUDIT_LOGS'
  ],
  FRONT_DESK: [
    'VIEW_DASHBOARD', 'MANAGE_ORDERS', 'DISPATCH_TRANSPORT'
  ]
};

// Initial seed demo state
const defaultState = {
  hotel: {
    name: 'Hotel Capitol',
    tagline: 'Experience Hotel Capitol, Smarter.',
    subTagline: 'Your stay, your services, your requests — powered by Hotel Capitol AI (Tolani).',
    address: '6 Animashaun Close, Ikeja, Lagos, Nigeria',
    phone: '+234 1 890 2200',
    mobile: '+234 803 555 4020',
    email: 'guestservices@hotelcapitol.ng',
    managementEmail: 'management@hotelcapitol.ng',
    currency: '₦',
    checkinTime: '14:00',
    checkoutTime: '12:00',
  },

  activeRole: 'guest', // 'guest' | 'staff' | 'supervisor' | 'manager' | 'vendor'
  activeGuestId: 'GUEST-402',
  activeStaffId: 'STF-01',
  activeVendorId: 'VEN-01',

  guests: [
    {
      id: 'GUEST-402',
      name: 'Chief Adeleke Babalola',
      roomNumber: '402',
      roomType: 'Executive Presidential Deluxe Suite',
      checkIn: '2026-08-15',
      checkOut: '2026-08-18',
      checkoutHour: '12:00 PM',
      breakfastEntitlement: 'Complimentary', // 'Complimentary' | 'Paid' | 'None'
      breakfastSelected: false,
      breakfastTime: '07:30 AM',
      breakfastItems: [],
      phone: '+234 802 334 9911',
      email: 'a.babalola@capitolholdings.ng',
      vip: true,
      folio: [
        { id: 'FOL-01', date: '2026-08-15', desc: 'Room Charge - Night 1 (Executive Presidential Suite)', amount: 185000, category: 'Room', status: 'Posted' },
        { id: 'FOL-02', date: '2026-08-15', desc: 'Airport VIP Chauffeur Transfer (MMA2 to Hotel Capitol)', amount: 25000, category: 'Transportation', status: 'Posted' },
      ],
      aiConversations: [
        { id: 'C-1', sender: 'ai', time: '12:30 PM', text: 'Good day, Chief Adeleke. Welcome to Hotel Capitol. I am Tolani, your personal Hotel Capitol concierge. It is my pleasure to assist you. How may I make your stay more comfortable today?' }
      ]
    },
    {
      id: 'GUEST-205',
      name: 'Mrs. Folake Davies',
      roomNumber: '205',
      roomType: 'Deluxe King Room',
      checkIn: '2026-08-14',
      checkOut: '2026-08-17',
      checkoutHour: '12:00 PM',
      breakfastEntitlement: 'Complimentary',
      breakfastSelected: true,
      breakfastTime: '08:00 AM',
      breakfastItems: ['The English Royal Breakfast', 'Fresh Squeezed Orange Juice'],
      phone: '+234 809 112 3445',
      email: 'folake.davies@consulting.com',
      vip: false,
      folio: [
        { id: 'FOL-10', date: '2026-08-14', desc: 'Room Charge - Deluxe King (Night 1)', amount: 95000, category: 'Room', status: 'Posted' },
        { id: 'FOL-11', date: '2026-08-15', desc: 'Room Service: Jollof Fiesta & Chapman', amount: 13000, category: 'Restaurant', status: 'Posted' }
      ],
      aiConversations: [
        { id: 'C-2', sender: 'ai', time: '08:00 AM', text: 'Good morning, Mrs. Davies. I am Tolani, your personal Hotel Capitol concierge. Your complimentary breakfast is scheduled for 8:00 AM. Please let me know if there is anything else I may arrange for your stay.' }
      ]
    },
    {
      id: 'GUEST-310',
      name: 'Dr. Emeka Okafor',
      roomNumber: '310',
      roomType: 'Diplomatic Business Suite',
      checkIn: '2026-08-15',
      checkOut: '2026-08-16',
      checkoutHour: '11:00 AM',
      breakfastEntitlement: 'Paid',
      breakfastSelected: false,
      breakfastTime: '08:30 AM',
      breakfastItems: [],
      phone: '+234 803 998 7722',
      email: 'e.okafor@medtech.org',
      vip: false,
      folio: [
        { id: 'FOL-20', date: '2026-08-15', desc: 'Room Charge - Diplomatic Suite', amount: 135000, category: 'Room', status: 'Posted' }
      ],
      aiConversations: []
    }
  ],

  rooms: [
    { number: '101', type: 'Standard Deluxe', floor: 1, status: 'OCCUPIED', guest: 'Mr. Tunde Bakare', condition: 'Clean' },
    { number: '102', type: 'Standard Deluxe', floor: 1, status: 'VACANT_CLEAN', guest: null, condition: 'Inspected' },
    { number: '205', type: 'Deluxe King', floor: 2, status: 'OCCUPIED', guest: 'Mrs. Folake Davies', condition: 'Clean' },
    { number: '206', type: 'Deluxe King', floor: 2, status: 'IN_SERVICE', guest: 'Alhaji Sanusi', condition: 'Cleaning in progress' },
    { number: '310', type: 'Diplomatic Suite', floor: 3, status: 'OCCUPIED', guest: 'Dr. Emeka Okafor', condition: 'Clean' },
    { number: '401', type: 'Executive Suite', floor: 4, status: 'INSPECT', guest: null, condition: 'Needs Supervisor Inspection' },
    { number: '402', type: 'Executive Presidential Deluxe Suite', floor: 4, status: 'OCCUPIED', guest: 'Chief Adeleke Babalola', condition: 'Clean' },
    { number: '403', type: 'Executive Suite', floor: 4, status: 'DND', guest: 'Sen. Aliyu', condition: 'Do Not Disturb' },
  ],

  menu: [
    {
      id: 'M-01',
      category: 'Food',
      name: 'Capitol Signature Jollof Fiesta',
      desc: 'Authentic firewood-infused Nigerian smoky Jollof rice, served with fried sweet plantain (dodo), fresh coleslaw, and grilled choice protein.',
      price: 9500,
      prepTimeMinutes: 25,
      estimatedDeliveryMinutes: 15,
      image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: true,
      featured: true,
      dietary: ['Halal', 'Spicy'],
      status: 'PUBLISHED',
      version: 1,
      versionHistory: [],
      addons: [
        { id: 'ADD-01', name: 'Extra Fried Plantain (Dodo)', price: 1500 },
        { id: 'ADD-02', name: 'Extra Jumbo Tiger Prawn (1 pc)', price: 3500 },
        { id: 'ADD-03', name: 'Extra Grilled Peppered Chicken', price: 3000 },
        { id: 'ADD-04', name: 'Extra Fried Egg', price: 1000 },
        { id: 'ADD-05', name: 'Extra Beef Suya Skewer', price: 2800 }
      ]
    },
    {
      id: 'M-02',
      category: 'Food',
      name: 'Prime Grilled Suya Platter',
      desc: 'Succulent aged beef sirloin strips coated in authentic Yaji spice, served with sliced sweet onions, fresh plum tomatoes, cabbage, and fresh lime wedges.',
      price: 11000,
      prepTimeMinutes: 20,
      estimatedDeliveryMinutes: 15,
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: true,
      featured: true,
      dietary: ['Halal', 'Gluten-Free', 'Spicy'],
      status: 'PUBLISHED',
      version: 1,
      versionHistory: [],
      addons: [
        { id: 'ADD-01', name: 'Extra Fried Plantain (Dodo)', price: 1500 },
        { id: 'ADD-05', name: 'Extra Beef Suya Skewer', price: 2800 },
        { id: 'ADD-08', name: 'Extra Yam Fries with Pepper Dip', price: 2200 }
      ]
    },
    {
      id: 'M-03',
      category: 'Food',
      name: 'Lagos Island Seafood Okro with Poundo',
      desc: 'Rich traditional whipped okro delicacy packed with jumbo tiger prawns, Atlantic blue crab, calamari, fresh fish fillet, and served with smooth pounded yam.',
      price: 14500,
      prepTimeMinutes: 30,
      estimatedDeliveryMinutes: 15,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: true,
      featured: true,
      dietary: ['Halal', 'Seafood', 'Spicy'],
      status: 'PUBLISHED',
      version: 1,
      versionHistory: [],
      addons: [
        { id: 'ADD-02', name: 'Extra Jumbo Tiger Prawn (1 pc)', price: 3500 },
        { id: 'ADD-09', name: 'Extra Portion Pounded Yam', price: 1500 },
        { id: 'ADD-10', name: 'Extra Fresh Croaker Fish Chunk', price: 4000 }
      ]
    },
    {
      id: 'M-04',
      category: 'Food',
      name: 'Capitol Club Sandwich & Handcut Fries',
      desc: 'Triple-decker brioche with herb-roasted chicken breast, crispy beef bacon, fried farm egg, sharp aged cheddar, lettuce, tomato, and garlic truffle aioli.',
      price: 8500,
      prepTimeMinutes: 15,
      estimatedDeliveryMinutes: 15,
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: false,
      featured: false,
      dietary: ['Halal'],
      status: 'PUBLISHED',
      version: 1,
      versionHistory: [],
      addons: [
        { id: 'ADD-06', name: 'Extra Crispy Beef Bacon', price: 2200 },
        { id: 'ADD-07', name: 'Extra Gourmet Sausage', price: 2000 },
        { id: 'ADD-04', name: 'Extra Fried Egg', price: 1000 }
      ]
    },
    {
      id: 'M-05',
      category: 'Food',
      name: 'Charcoal Grilled Whole Croaker Fish',
      desc: 'Whole fresh Atlantic croaker marinated in Capitol secret aromatic spice rub, charcoal grilled to perfection, served with spicy pepper sauce and fried yam wedges.',
      price: 16000,
      prepTimeMinutes: 35,
      estimatedDeliveryMinutes: 15,
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: true,
      featured: true,
      dietary: ['Halal', 'Seafood', 'Spicy'],
      status: 'PUBLISHED',
      version: 1,
      versionHistory: [],
      addons: [
        { id: 'ADD-01', name: 'Extra Fried Plantain (Dodo)', price: 1500 },
        { id: 'ADD-08', name: 'Extra Yam Fries with Pepper Dip', price: 2200 }
      ]
    },
    {
      id: 'M-06',
      category: 'Drinks',
      name: 'Hotel Capitol Signature Chapman',
      desc: 'The quintessential Nigerian luxury cocktail: aromatic bitters, citrus blend, grenadine, cucumber slices, fresh mint, and orange wheels.',
      price: 3500,
      prepTimeMinutes: 5,
      estimatedDeliveryMinutes: 10,
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: true,
      featured: true,
      dietary: ['Vegetarian'],
      status: 'PUBLISHED',
      version: 1,
      versionHistory: [],
      addons: [
        { id: 'ADD-D1', name: 'Add Extra Shot of Spiced Rum', price: 2500 }
      ]
    },
    {
      id: 'M-07',
      category: 'Drinks',
      name: 'Freshly Squeezed Valencia Orange & Pineapple',
      desc: 'Cold-pressed 100% natural Valencia oranges and sweet ripe sweet pineapple. Zero added sugars or preservatives.',
      price: 3000,
      prepTimeMinutes: 5,
      estimatedDeliveryMinutes: 10,
      image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: true,
      featured: false,
      dietary: ['Vegan', 'Gluten-Free'],
      status: 'PUBLISHED',
      version: 1,
      versionHistory: [],
      addons: [
        { id: 'ADD-D2', name: 'Add Ginger & Turmeric Boost', price: 1000 }
      ]
    },
    {
      id: 'M-08',
      category: 'Drinks',
      name: 'Ikeja Sunset Spiced Cocktail',
      desc: 'Premium Aged Rum, Passionfruit purée, infused Hibiscus Zobo reduction, fresh lime, and ginger froth.',
      price: 6500,
      prepTimeMinutes: 8,
      estimatedDeliveryMinutes: 10,
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: true,
      featured: true,
      dietary: [],
      status: 'PUBLISHED',
      version: 1,
      versionHistory: [],
      addons: []
    },
    {
      id: 'M-09',
      category: 'Drinks',
      name: 'Moët & Chandon Brut Impérial (750ml)',
      desc: 'Classic French Champagne with vibrant apple and citrus notes, fine bubbles, and elegant finish. Chilled in silver ice bucket.',
      price: 95000,
      prepTimeMinutes: 10,
      estimatedDeliveryMinutes: 10,
      image: 'https://images.unsplash.com/photo-1584225064785-c62a8b43d148?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: false,
      featured: true,
      dietary: [],
      status: 'PUBLISHED',
      version: 1,
      versionHistory: [],
      addons: []
    },
    {
      id: 'M-10',
      category: 'Breakfast',
      name: 'The English Royal Breakfast',
      desc: 'Two farm eggs any style, Cumberland beef sausages, grilled beef bacon, baked beans, sautéed mushrooms, grilled herb tomato, golden hash browns, and toasted sourdough.',
      price: 8500,
      prepTimeMinutes: 20,
      estimatedDeliveryMinutes: 15,
      image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: true,
      featured: true,
      dietary: ['Halal'],
      status: 'PUBLISHED',
      version: 1,
      versionHistory: [],
      addons: [
        { id: 'ADD-06', name: 'Extra Crispy Beef Bacon', price: 2200 },
        { id: 'ADD-07', name: 'Extra Gourmet Sausage', price: 2000 },
        { id: 'ADD-04', name: 'Extra Fried Egg', price: 1000 },
        { id: 'ADD-B1', name: 'Artisan Barista Cappuccino', price: 2500 },
        { id: 'ADD-B2', name: 'Fresh Pressed Valencia Orange Juice', price: 2000 }
      ]
    },
    {
      id: 'M-11',
      category: 'Breakfast',
      name: 'The Naija Executive Breakfast',
      desc: 'Steamed yellow yam and golden fried plantains served with traditional spiced egg and bell pepper stew, tender beef suya skewer, and rich Nigerian spiced cocoa or tea.',
      price: 8500,
      prepTimeMinutes: 20,
      estimatedDeliveryMinutes: 15,
      image: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: true,
      featured: true,
      dietary: ['Halal', 'Spicy'],
      status: 'PUBLISHED',
      version: 1,
      versionHistory: [],
      addons: [
        { id: 'ADD-01', name: 'Extra Fried Plantain (Dodo)', price: 1500 },
        { id: 'ADD-05', name: 'Extra Beef Suya Skewer', price: 2800 },
        { id: 'ADD-04', name: 'Extra Egg Sauce Portion', price: 1800 }
      ]
    },
    {
      id: 'M-12',
      category: 'Desserts',
      name: 'Capitol Warm Chocolate Molten Lava Cake',
      desc: 'Decadent Belgian dark chocolate lava cake with warm molten center, accompanied by Madagascar Bourbon Vanilla bean gelato and berry compote.',
      price: 5500,
      prepTimeMinutes: 15,
      estimatedDeliveryMinutes: 10,
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: true,
      featured: true,
      dietary: ['Vegetarian'],
      status: 'PUBLISHED',
      version: 1,
      versionHistory: [],
      addons: [
        { id: 'ADD-D3', name: 'Extra Scoop Bourbon Vanilla Gelato', price: 1800 }
      ]
    },
    {
      id: 'M-13',
      category: 'Snacks',
      name: 'Spicy Peppered Gizzard & Plantain Bites (Gizdodo)',
      desc: 'Tender diced chicken gizzards sautéed with ripe plantain cubes in a rich habanero, sweet bell pepper, and onion glaze.',
      price: 6500,
      prepTimeMinutes: 18,
      estimatedDeliveryMinutes: 12,
      image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: true,
      featured: true,
      dietary: ['Halal', 'Spicy'],
      status: 'PUBLISHED',
      version: 1,
      versionHistory: [],
      addons: []
    }
  ],

  orders: [
    {
      id: 'ORD-101',
      guestId: 'GUEST-402',
      guestName: 'Chief Adeleke Babalola',
      roomNumber: '402',
      items: [
        {
          menuId: 'M-01',
          name: 'Capitol Signature Jollof Fiesta',
          quantity: 1,
          basePrice: 9500,
          extras: [
            { id: 'ADD-01', name: 'Extra Fried Plantain (Dodo)', price: 1500 },
            { id: 'ADD-02', name: 'Extra Jumbo Tiger Prawn (1 pc)', price: 3500 }
          ],
          specialInstructions: 'Please make the pepper medium, not too spicy.'
        },
        {
          menuId: 'M-06',
          name: 'Hotel Capitol Signature Chapman',
          quantity: 1,
          basePrice: 3500,
          extras: [],
          specialInstructions: 'Lots of ice and extra cucumber slices.'
        }
      ],
      totalAmount: 18000,
      status: 'PREPARING', // 'PENDING' | 'PREPARING' | 'READY' | 'OUT FOR DELIVERY' | 'DELIVERED'
      createdAt: '2026-08-15 12:45:00',
      preparationStartedAt: Date.now() - 18 * 60 * 1000,
      estimatedReadyAt: Date.now() + 2 * 60 * 1000,
      estimatedDeliveryAt: Date.now() + 7 * 60 * 1000,
      estimatedMinutes: 25,
      elapsedMinutes: 18,
      fiveMinWarningTriggered: false,
      assignedStaff: 'Chef Babatunde Adele',
      roomDeliveryStaff: 'Amara Nwosu'
    },
    {
      id: 'ORD-098',
      guestId: 'GUEST-205',
      guestName: 'Mrs. Folake Davies',
      roomNumber: '205',
      items: [
        {
          menuId: 'M-10',
          name: 'The English Royal Breakfast (Complimentary)',
          quantity: 1,
          basePrice: 0,
          extras: [
            { id: 'ADD-06', name: 'Extra Crispy Beef Bacon', price: 2200 }
          ],
          specialInstructions: 'Eggs sunny side up, brown toast.'
        }
      ],
      totalAmount: 2200,
      status: 'DELIVERED',
      createdAt: '2026-08-15 08:15:00',
      deliveredAt: '2026-08-15 08:42:00',
      assignedStaff: 'Chef Babatunde Adele',
      roomDeliveryStaff: 'Ibrahim Bello'
    }
  ],

  serviceRequests: [
    {
      id: 'REQ-301',
      guestId: 'GUEST-402',
      guestName: 'Chief Adeleke Babalola',
      roomNumber: '402',
      type: 'Housekeeping',
      title: 'Full Room Cleaning & 2 Extra Bath Towels',
      details: 'Spoken via AI: "I need two extra towels and room cleaning after 2 PM."',
      requestedAt: '2026-08-15 11:20:00',
      assignedStaffId: 'STF-01',
      assignedStaffName: 'Amara Nwosu',
      status: 'IN PROGRESS', // 'PENDING' | 'ASSIGNED' | 'IN PROGRESS' | 'COMPLETED' | 'ESCALATED'
      priority: 'HIGH',
      completedAt: null
    },
    {
      id: 'REQ-302',
      guestId: 'GUEST-310',
      guestName: 'Dr. Emeka Okafor',
      roomNumber: '310',
      type: 'Maintenance',
      title: 'AC Temperature Sensor Adjustment',
      details: 'Guest requested technician to check thermostat cooling calibration.',
      requestedAt: '2026-08-15 09:10:00',
      assignedStaffId: 'STF-04',
      assignedStaffName: 'Tariq Alabi',
      status: 'COMPLETED',
      priority: 'NORMAL',
      completedAt: '2026-08-15 09:45:00'
    },
    {
      id: 'REQ-303',
      guestId: 'GUEST-205',
      guestName: 'Mrs. Folake Davies',
      roomNumber: '205',
      type: 'Concierge',
      title: 'Luggage Assistance for 3:00 PM',
      details: 'Porter assistance requested for 2 medium suitcases.',
      requestedAt: '2026-08-15 12:05:00',
      assignedStaffId: 'STF-03',
      assignedStaffName: 'Ibrahim Bello',
      status: 'PENDING',
      priority: 'NORMAL',
      completedAt: null
    }
  ],

  // --- LAGOS ZONAL TRANSPORTATION CONFIGURATION (Hotel Configurable) ---
  lagosZones: [
    // Lagos Island Zones
    {
      id: 'I-1',
      region: 'ISLAND',
      category: 'Lagos Island',
      name: 'ZONE I-1 — Core Island',
      locations: [
        'Marina',
        'Broad Street',
        'CMS',
        'Apongbon',
        'Onikan',
        'Obalende',
        'Banana Island',
        'Parkview',
        'Awolowo Road',
        'Falomo',
        'Victoria Island (V.I.)',
        'Oniru',
        'Victoria Island Annex'
      ],
      baseFare: 25000,
      estimatedMinutes: 45,
      estMinutes: 45
    },
    {
      id: 'I-2',
      region: 'ISLAND',
      category: 'Lagos Island',
      name: 'ZONE I-2 — Lekki Phase 1 / Elegushi / Osapa Axis',
      locations: [
        'Lekki Phase 1',
        'Lekki Phase 2',
        'Ikate Elegushi',
        'Agungi',
        'Osapa',
        'Igbo Efon',
        'Ikota'
      ],
      baseFare: 30000,
      estimatedMinutes: 55,
      estMinutes: 55
    },
    {
      id: 'I-3',
      region: 'ISLAND',
      category: 'Lagos Island',
      name: 'ZONE I-3 — Extended Lekki / Chevron / VGC / Ajah',
      locations: [
        'Chevron',
        'VGC (Victoria Garden City)',
        'Ajah',
        'Sangotedo',
        'Awoyaya',
        'Abijo'
      ],
      baseFare: 35000,
      estimatedMinutes: 70,
      estMinutes: 70
    },
    {
      id: 'I-4',
      region: 'ISLAND',
      category: 'Lagos Island',
      name: 'ZONE I-4 — Remote Island / Ibeju-Lekki & Epe',
      locations: [
        'Ibeju-Lekki',
        'Epe',
        'Lakowe',
        'Free Trade Zone',
        'Eleko Beach Axis'
      ],
      baseFare: 50000,
      estimatedMinutes: 90,
      estMinutes: 90
    },
    // Lagos Mainland Zones
    {
      id: 'M-1',
      region: 'MAINLAND',
      category: 'Lagos Mainland',
      name: 'ZONE M-1 — Central Mainland (Yaba & Surulere)',
      locations: [
        'Adekunle',
        'Alagomeji',
        'Sabo',
        'Fadayi',
        'Iwaya',
        'Otto/Iddo',
        'Itire',
        'Ikate (Surulere)',
        'Aguda',
        'Ojuelegba',
        'Ebute Metta',
        'Jibowu'
      ],
      baseFare: 22000,
      estimatedMinutes: 30,
      estMinutes: 30
    },
    {
      id: 'M-2',
      region: 'MAINLAND',
      category: 'Lagos Mainland',
      name: 'ZONE M-2 — Ikeja Zone / Kosofe & Shomolu',
      locations: [
        'Ikeja GRA',
        'Alausa',
        'Oregun',
        'Ojodu',
        'Magodo',
        'Maryland',
        'Gbagada',
        'Bariga',
        'Ketu',
        'Alapere',
        'Oworonsoki',
        'Shomolu'
      ],
      baseFare: 25000,
      estimatedMinutes: 20,
      estMinutes: 20
    },
    {
      id: 'M-3',
      region: 'MAINLAND',
      category: 'Lagos Mainland',
      name: 'ZONE M-3 — Oshodi-Isolo, Mushin & Industrial Axis',
      locations: [
        'Ajao Estate',
        'Okota',
        'Ilasamaja',
        'Mushin',
        'Festac Town',
        'Amuwo-Odofin',
        'Ago Palace',
        'Apapa',
        'Mile 2'
      ],
      baseFare: 28000,
      estimatedMinutes: 40,
      estMinutes: 40
    },
    {
      id: 'M-4',
      region: 'MAINLAND',
      category: 'Lagos Mainland',
      name: 'ZONE M-4 — Alimosho, Western Outskirts & Ikorodu',
      locations: [
        'Ipaja',
        'Egbe',
        'Idimu',
        'Ikotun',
        'Ayobo',
        'Agege',
        'Ojo',
        'Ikorodu',
        'Alagbado',
        'Sango Ota',
        'Badagry'
      ],
      baseFare: 35000,
      estimatedMinutes: 60,
      estMinutes: 60
    },
    // Airport Transfer Hubs
    {
      id: 'AIR-1',
      region: 'AIRPORT',
      category: 'Airport Hub',
      name: 'Murtala Muhammed Domestic Terminal 1 (MMA1)',
      locations: [
        'MMA1 General Aviation Terminal',
        'Old Domestic Terminal',
        'Ikeja Aviation Hub'
      ],
      baseFare: 20000,
      estimatedMinutes: 15,
      estMinutes: 15
    },
    {
      id: 'AIR-2',
      region: 'AIRPORT',
      category: 'Airport Hub',
      name: 'Murtala Muhammed Domestic Terminal 2 (MMA2)',
      locations: [
        'MMA2 Bi-Courtney Aviation Terminal',
        'Domestic Arrivals & Departures',
        'Ikeja Terminal 2'
      ],
      baseFare: 22000,
      estimatedMinutes: 15,
      estMinutes: 15
    },
    {
      id: 'AIR-3',
      region: 'AIRPORT',
      category: 'Airport Hub',
      name: 'Murtala Muhammed International Airport (MMIA)',
      locations: [
        'MMIA International Departures',
        'MMIA International Arrivals',
        'Cargo Terminal',
        'VIP Protocol Terminal'
      ],
      baseFare: 25000,
      estimatedMinutes: 20,
      estMinutes: 20
    }
  ],

  vehicleClasses: [
    {
      id: 'VEH-SEDAN',
      name: 'Executive Sedan',
      models: 'Mercedes-Benz E-Class / Lexus ES350',
      multiplier: 1.00,
      charterDailyRate: 120000,
      capacity: 3,
      luggageCapacity: '2 Large + 2 Small'
    },
    {
      id: 'VEH-SUV',
      name: 'Executive SUV',
      models: 'Toyota Land Cruiser Prado / Lexus GX460',
      multiplier: 1.35,
      charterDailyRate: 160000,
      capacity: 4,
      luggageCapacity: '4 Large + 3 Small'
    },
    {
      id: 'VEH-PREMIUM-SUV',
      name: 'Premium SUV',
      models: 'Range Rover Vogue / Mercedes-Benz GLS',
      multiplier: 1.50,
      charterDailyRate: 180000,
      capacity: 4,
      luggageCapacity: '4 Large + 4 Small'
    },
    {
      id: 'VEH-SPRINTER',
      name: 'Executive Sprinter',
      models: 'Mercedes-Benz VIP Sprinter Luxury Van',
      multiplier: 2.00,
      charterDailyRate: 250000,
      capacity: 10,
      luggageCapacity: '10 Large Suitcases'
    }
  ],

  pricingConfig: {
    airportSurcharge: 0,
    nightSurcharge: 0,
    waitingChargePerHour: 5000,
    fuelSurcharge: 0
  },

  transportBookings: [
    {
      id: 'TBK-101',
      guestId: 'GUEST-402',
      guestName: 'Chief Adeleke Babalola',
      roomNumber: '402',
      serviceType: 'ONE_TIME_DROPOFF', // 'ONE_TIME_DROPOFF' | 'FULL_DAY_CHARTER'
      zoneId: 'AIR-2',
      destination: 'Murtala Muhammed Domestic Terminal 2 (MMA2)',
      zoneName: 'Murtala Muhammed Domestic Terminal 2 (MMA2)',
      departureDate: '2026-08-18',
      departureTime: '11:30 AM',
      departureTimestamp: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
      vehicleClassId: 'VEH-SEDAN',
      vehicle: 'Executive Sedan (Mercedes-Benz / Lexus ES)',
      passengers: 2,
      price: 25000,
      driverName: 'Ibrahim Bello',
      driverPhone: '+234 803 555 4020',
      vehiclePlate: 'KJA-402-CP',
      status: 'CONFIRMED', // 'PENDING_DRIVER_ACCEPTANCE' | 'DRIVER_ACCEPTED' | 'DESTINATION_CONFIRMED' | 'CONFIRMED' | 'IN_TRANSIT' | 'COMPLETED'
      createdAt: '2026-08-15 10:00:00',
      paymentStatus: 'POSTED_TO_FOLIO',
      reminder30Sent: false,
      reminder15Sent: false
    }
  ],

  // --- TOLANI LEARNING & CONTINUOUS IMPROVEMENT STORE STATE ---
  interactionLogs: [
    {
      id: 'EVT-1001',
      timestamp: '2026-08-15T12:30:00.000Z',
      timeFormatted: '12:30 PM',
      guestId: 'GUEST-402',
      roomNumber: '402',
      sessionId: 'SESS-2026-08-15-402',
      activeService: 'RESTAURANT',
      detectedIntent: 'ORDER_FOOD',
      guestMessage: 'I want to order smoky jollof and chicken',
      aiResponse: 'Wonderful choice, Chief Adeleke. I have opened our Capitol Restaurant Menu with Capitol Signature Jollof Fiesta ready.',
      uiAction: 'OPEN_RESTAURANT_MENU',
      selectedOptions: ['Capitol Signature Jollof Fiesta', 'Extra Fried Plantain'],
      rejectedOptions: [],
      conversationState: 'COMPLETED',
      outcome: 'SUCCESSFUL',
      correction: null,
      satisfactionSignal: 5
    },
    {
      id: 'EVT-1002',
      timestamp: '2026-08-15T13:10:00.000Z',
      timeFormatted: '01:10 PM',
      guestId: 'GUEST-205',
      roomNumber: '205',
      sessionId: 'SESS-2026-08-15-205',
      activeService: 'CONCIERGE_PORTER',
      detectedIntent: 'LUGGAGE_ASSISTANCE',
      guestMessage: 'Someone should come for my bags',
      aiResponse: 'Certainly, Mrs. Davies. I have received your request for porter assistance.',
      uiAction: 'OPEN_PORTER_OPTIONS',
      selectedOptions: ['In Room'],
      rejectedOptions: [],
      conversationState: 'COMPLETED',
      outcome: 'SUCCESSFUL',
      correction: null,
      satisfactionSignal: 5
    }
  ],

  learningSuggestions: [
    {
      id: 'SUG-001',
      category: 'MISUNDERSTOOD_REQUEST',
      service: 'CONCIERGE_PORTER',
      phrase: 'Someone should come for my bags',
      currentClassification: 'VIP_TRANSPORTATION',
      recommendedClassification: 'LUGGAGE_ASSISTANCE',
      recommendationText: 'Map phrase "Someone should come for my bags" to LUGGAGE_ASSISTANCE in Porter service.',
      evidenceSnippet: '17 guests used variations of this phrase seeking in-room luggage collection.',
      occurrenceCount: 17,
      firstObserved: '2026-08-14T09:00:00.000Z',
      lastObserved: '2026-08-15T13:10:00.000Z',
      status: 'PENDING_REVIEW',
      reviewedBy: null,
      reviewedAt: null,
      impact: 'HIGH'
    },
    {
      id: 'SUG-002',
      category: 'MISUNDERSTOOD_REQUEST',
      service: 'RESTAURANT',
      phrase: 'Can I get something to eat?',
      currentClassification: 'GENERAL_INQUIRY',
      recommendedClassification: 'ORDER_FOOD',
      recommendationText: 'Directly open Dining Menu when guest asks "Can I get something to eat?".',
      evidenceSnippet: 'Observed 12 times during late night hours (10:00 PM – 02:00 AM).',
      occurrenceCount: 12,
      firstObserved: '2026-08-14T22:30:00.000Z',
      lastObserved: '2026-08-15T11:45:00.000Z',
      status: 'PENDING_REVIEW',
      reviewedBy: null,
      reviewedAt: null,
      impact: 'MEDIUM'
    },
    {
      id: 'SUG-003',
      category: 'WORKFLOW_DISCOVERY',
      service: 'RESTAURANT',
      phrase: 'Where do I submit my food tray?',
      currentClassification: 'INSIGHT',
      recommendedClassification: 'REVIEW_ORDER_AT_TOP',
      recommendationText: 'Ensure Review Order CTA is prominent at the top of the restaurant menu.',
      evidenceSnippet: 'Guests frequently select items and search for review/place order button.',
      occurrenceCount: 24,
      firstObserved: '2026-08-13T14:00:00.000Z',
      lastObserved: '2026-08-15T12:40:00.000Z',
      status: 'PENDING_REVIEW',
      reviewedBy: null,
      reviewedAt: null,
      impact: 'HIGH'
    }
  ],

  approvedKnowledgeUpdates: [
    {
      id: 'KUP-0041',
      updateCode: 'LEARNING UPDATE #0041',
      suggestionId: 'SUG-000',
      category: 'MISUNDERSTOOD_REQUEST',
      service: 'CONCIERGE_PORTER',
      approvedPhrase: 'Help with my luggage',
      mappedIntent: 'LUGGAGE_ASSISTANCE',
      approvedBy: 'Tariq Alabi (Operations Supervisor)',
      timestamp: '2026-08-15T08:30:00.000Z',
      dateFormatted: 'Aug 15, 2026',
      status: 'ACTIVE'
    }
  ],

  approvedLearnedPhrases: [
    {
      phrase: 'help with my luggage',
      intent: 'LUGGAGE_ASSISTANCE',
      service: 'CONCIERGE_PORTER',
      updateCode: 'LEARNING UPDATE #0041'
    }
  ],

  guestPreferences: [
    {
      guestId: 'GUEST-402',
      category: 'DINING',
      item: 'Capitol Signature Jollof Fiesta',
      recordedAt: '2026-08-15T12:30:00.000Z'
    },
    {
      guestId: 'GUEST-205',
      category: 'BREAKFAST',
      item: 'The English Royal Breakfast',
      recordedAt: '2026-08-15T08:00:00.000Z'
    }
  ],

  abandonedWorkflows: [],

  serviceFeedbacks: [
    {
      id: 'FDB-001',
      timestamp: '2026-08-15T09:00:00.000Z',
      guestId: 'GUEST-205',
      guestName: 'Mrs. Folake Davies',
      roomNumber: '205',
      serviceType: 'BREAKFAST',
      rating: 5,
      satisfaction: 'YES',
      issue: null,
      comment: 'Breakfast was hot, delicious, and on time.'
    }
  ],

  learningSettings: {
    enabled: true,
    dataRetentionDays: 90,
    autoAnalyze: true
  },

  // --- AUTHORITATIVE HOTEL CONTENT & CONFIGURATION ---
  breakfastConfig: {
    serviceName: 'Hotel Capitol Royal Breakfast Service',
    servingFrom: '06:30 AM',
    servingUntil: '11:00 AM',
    standardPrice: 8500,
    complimentaryRooms: ['402', '205', '401', '310'],
    status: 'PUBLISHED',
    version: 1,
    versionHistory: []
  },

  amenities: [
    {
      id: 'AMN-01',
      name: 'Capitol Rooftop Infinity Pool',
      category: 'Recreation & Leisure',
      description: 'Heated open-air rooftop infinity pool overlooking Ikeja skyline with luxury daybeds and cocktail bar service.',
      openingHours: '06:00 AM - 10:00 PM Daily',
      location: '5th Floor Rooftop Pavilion',
      rules: 'Resident suites & members only. Proper swimwear required. Poolside attendant on duty.',
      guestInstructions: 'Pool towels are provided on-site. Room charging available for poolside cocktails.',
      contact: 'Ext 502 / Concierge',
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      status: 'PUBLISHED',
      available: true,
      featured: true,
      version: 1,
      versionHistory: []
    },
    {
      id: 'AMN-02',
      name: 'Executive Fitness Centre & Gym',
      category: 'Health & Fitness',
      description: 'State-of-the-art cardiovascular machines, Olympic free weights, resistance cables, and certified personal trainers.',
      openingHours: '24 Hours Daily (Keycard Access)',
      location: '2nd Floor West Wing',
      rules: 'Athletic footwear required. Wipe down equipment after use. Personal training upon booking.',
      guestInstructions: 'Complimentary chilled water and fresh sweat towels available in gym foyer.',
      contact: 'Ext 204 / Fitness Desk',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      status: 'PUBLISHED',
      available: true,
      featured: true,
      version: 1,
      versionHistory: []
    },
    {
      id: 'AMN-03',
      name: 'High-Speed Fiber VIP Wi-Fi (1Gbps)',
      category: 'Connectivity & Tech',
      description: 'Dedicated enterprise fiber-optic internet connection across all guest suites, lounges, and meeting rooms.',
      openingHours: '24/7 Always Active',
      location: 'Property-Wide Coverage',
      rules: 'Network Name: HotelCapitol_VIP_Guest. Password provided on keycard wallet.',
      guestInstructions: 'Connect to SSID and enter password "CapitolStay2026". 24/7 IT assistance available.',
      contact: 'Ext 0 / Front Desk',
      image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      status: 'PUBLISHED',
      available: true,
      featured: false,
      version: 1,
      versionHistory: []
    },
    {
      id: 'AMN-04',
      name: 'Diplomatic Business Centre & Boardrooms',
      category: 'Business & Events',
      description: 'Private 12-seat executive boardroom with 4K interactive teleconference screens, high-speed color printing, and secretarial support.',
      openingHours: '07:00 AM - 11:00 PM Daily',
      location: '1st Floor Executive Concourse',
      rules: 'Advance booking recommended for boardrooms. Walk-in workstations open for residents.',
      guestInstructions: 'Reserve boardroom through Concierge or Admin console. Audio/Visual setup included.',
      contact: 'Ext 108 / Business Desk',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      status: 'PUBLISHED',
      available: true,
      featured: true,
      version: 1,
      versionHistory: []
    },
    {
      id: 'AMN-05',
      name: 'The Capitol Penthouse Cigar & Whiskey Lounge',
      category: 'Nightlife & Lounges',
      description: 'Exclusive hotel-resident rooftop lounge offering rare single malt scotch, aged rum, authentic Cuban cigars, and live jazz.',
      openingHours: '05:00 PM - 02:00 AM Daily',
      location: '5th Floor Penthouse Deck',
      rules: 'Adults 21+ only. Smart casual dress code required. Resident signature charging permitted.',
      guestInstructions: 'Table reservations recommended on Friday and Saturday evenings.',
      contact: 'Ext 501 / Penthouse Bar',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      status: 'PUBLISHED',
      available: true,
      featured: true,
      version: 1,
      versionHistory: []
    },
    {
      id: 'AMN-06',
      name: 'Luxury Spa & Holistic Wellness Haven',
      category: 'Wellness & Spa',
      description: 'Therapeutic deep-tissue Swedish massage, Moroccan hammam rituals, hot stone treatments, and botanical skin therapies.',
      openingHours: '09:00 AM - 09:00 PM Daily',
      location: 'Ground Floor Garden Wing',
      rules: 'Appointments required. In-suite massage service available for Presidential Suite.',
      guestInstructions: 'Book through Tolani AI concierge or call Spa Reception at Ext 105.',
      contact: 'Ext 105 / Spa Desk',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      status: 'PUBLISHED',
      available: true,
      featured: true,
      version: 1,
      versionHistory: []
    },
    {
      id: 'AMN-07',
      name: 'Valet Parking & Secure Chauffeur Bay',
      category: 'Transportation & Access',
      description: '24-hour secured underground parking with CCTV surveillance, electric vehicle charging, and professional valet service.',
      openingHours: '24/7 Always Active',
      location: 'Basement & Main Porte-Cochère',
      rules: 'Complimentary for registered hotel guests. Hand keys to uniformed valet attendant.',
      guestInstructions: 'Call Front Desk 10 minutes prior to departure to have vehicle brought to front entrance.',
      contact: 'Ext 101 / Valet Bay',
      image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
      status: 'PUBLISHED',
      available: true,
      featured: false,
      version: 1,
      versionHistory: []
    },
    {
      id: 'AMN-08',
      name: 'Executive Express Laundry & Dry Cleaning',
      category: 'Housekeeping & Valet',
      description: 'Same-day luxury laundry, delicate dry cleaning, garment pressing, and shoe shine service.',
      openingHours: '07:00 AM - 08:00 PM Daily',
      location: 'Service Concourse / Suite Pickup',
      rules: 'Express 3-hour turnaround available upon request. Regular service delivered by 6:00 PM.',
      guestInstructions: 'Place laundry bag in wardrobe and request collection via Tolani or Room Attendant.',
      contact: 'Ext 102 / Valet Laundry',
      image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=80',
      status: 'PUBLISHED',
      available: true,
      featured: false,
      version: 1,
      versionHistory: []
    }
  ],

  serviceOptions: {
    porter: {
      locations: [
        { id: 'LOC-ROOM', name: 'In Room', desc: 'Luggage assistance inside your private suite', available: true },
        { id: 'LOC-LOBBY', name: 'Main Lobby', desc: 'Luggage collection at front desk reception', available: true }
      ],
      status: 'PUBLISHED',
      version: 1,
      versionHistory: []
    },
    housekeeping: {
      items: [
        { id: 'HK-01', name: 'Fresh Egyptian Cotton Bath Towels (Pair)', category: 'Towels', estMinutes: 10, available: true },
        { id: 'HK-02', name: 'Luxury Bed Linens & Duvet Restock', category: 'Linens', estMinutes: 15, available: true },
        { id: 'HK-03', name: 'Complimentary Bottled Spring Water (4 Bottles)', category: 'Water', estMinutes: 5, available: true },
        { id: 'HK-04', name: 'Full Suite Deep Cleaning & Turn-Down', category: 'Room Cleaning', estMinutes: 25, available: true },
        { id: 'HK-05', name: 'Luxury Botanical Toiletry Kit', category: 'Toiletries', estMinutes: 8, available: true },
        { id: 'HK-06', name: 'Insecticide & Room Fresh Air Sanitizer Spray', category: 'Sanitizer', estMinutes: 8, available: true }
      ],
      status: 'PUBLISHED',
      version: 1,
      versionHistory: []
    },
    concierge: {
      categories: ['Salons & Barbers', 'Supermarkets', 'Nightlife & Lounges', 'Tourist & Cultural'],
      status: 'PUBLISHED',
      version: 1,
      versionHistory: []
    }
  },

  mediaLibrary: [
    {
      id: 'MED-01',
      title: 'Capitol Signature Jollof Rice Fiesta',
      fileName: 'jollof_fiesta_platter.jpg',
      fileType: 'image/jpeg',
      fileSize: '245 KB',
      dimensions: '1200x800',
      url: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=600&q=80',
      category: 'Restaurant',
      uploadedAt: '2026-08-15 10:00 AM',
      uploadedBy: 'Chidinma Eze (Content Manager)',
      usedInCount: 1
    },
    {
      id: 'MED-02',
      title: 'Prime Grilled Beef Suya Skewers',
      fileName: 'suya_platter.jpg',
      fileType: 'image/jpeg',
      fileSize: '310 KB',
      dimensions: '1200x800',
      url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
      category: 'Restaurant',
      uploadedAt: '2026-08-15 10:15 AM',
      uploadedBy: 'Chidinma Eze (Content Manager)',
      usedInCount: 1
    },
    {
      id: 'MED-03',
      title: 'Lagos Island Seafood Okro with Poundo',
      fileName: 'seafood_okro.jpg',
      fileType: 'image/jpeg',
      fileSize: '280 KB',
      dimensions: '1200x800',
      url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      category: 'Restaurant',
      uploadedAt: '2026-08-15 10:20 AM',
      uploadedBy: 'Chidinma Eze (Content Manager)',
      usedInCount: 1
    },
    {
      id: 'MED-04',
      title: 'The English Royal Breakfast',
      fileName: 'english_breakfast.jpg',
      fileType: 'image/jpeg',
      fileSize: '290 KB',
      dimensions: '1200x800',
      url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80',
      category: 'Breakfast',
      uploadedAt: '2026-08-15 10:25 AM',
      uploadedBy: 'Chidinma Eze (Content Manager)',
      usedInCount: 1
    },
    {
      id: 'MED-05',
      title: 'The Naija Executive Breakfast',
      fileName: 'naija_breakfast.jpg',
      fileType: 'image/jpeg',
      fileSize: '325 KB',
      dimensions: '1200x800',
      url: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=600&q=80',
      category: 'Breakfast',
      uploadedAt: '2026-08-15 10:30 AM',
      uploadedBy: 'Chidinma Eze (Content Manager)',
      usedInCount: 1
    },
    {
      id: 'MED-06',
      title: 'Hotel Capitol Signature Chapman',
      fileName: 'signature_chapman.jpg',
      fileType: 'image/jpeg',
      fileSize: '190 KB',
      dimensions: '1200x800',
      url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
      category: 'Drinks',
      uploadedAt: '2026-08-15 10:35 AM',
      uploadedBy: 'Chidinma Eze (Content Manager)',
      usedInCount: 1
    },
    {
      id: 'MED-07',
      title: 'Capitol Rooftop Infinity Pool',
      fileName: 'rooftop_pool.jpg',
      fileType: 'image/jpeg',
      fileSize: '410 KB',
      dimensions: '1200x800',
      url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      category: 'Amenities',
      uploadedAt: '2026-08-15 10:40 AM',
      uploadedBy: 'Chidinma Eze (Content Manager)',
      usedInCount: 1
    },
    {
      id: 'MED-08',
      title: 'Executive Fitness Centre & Gym',
      fileName: 'fitness_gym.jpg',
      fileType: 'image/jpeg',
      fileSize: '380 KB',
      dimensions: '1200x800',
      url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      category: 'Amenities',
      uploadedAt: '2026-08-15 10:45 AM',
      uploadedBy: 'Chidinma Eze (Content Manager)',
      usedInCount: 1
    }
  ],

  contentVersions: [],

  nearbyRecommendations: [
    {
      id: 'LOC-01',
      category: 'Salons & Barbers',
      name: 'Karisma Executive Barber & Grooming Club',
      distance: '0.4 km (3 mins)',
      rating: 4.9,
      isHotelApproved: true,
      desc: 'Premium hot towel shaves, bespoke beard sculpting, manicure & scalp treatments. Official Hotel Capitol grooming partner.'
    },
    {
      id: 'LOC-02',
      category: 'Salons & Barbers',
      name: 'Tariq Luxury Hair & Nail Lounge',
      distance: '0.6 km (5 mins)',
      rating: 4.8,
      isHotelApproved: true,
      desc: 'Hairstyling, luxury silk press, wigs and bridal glam.'
    },
    {
      id: 'LOC-03',
      category: 'Supermarkets',
      name: 'Ikeja Supermart & Gourmet Deli',
      distance: '0.3 km (2 mins)',
      rating: 4.7,
      isHotelApproved: true,
      desc: 'Imported groceries, organic fruits, travel accessories, and fine wine.'
    },
    {
      id: 'LOC-04',
      category: 'Supermarkets',
      name: 'Spar Hypermarket Ikeja',
      distance: '1.4 km (8 mins)',
      rating: 4.5,
      isHotelApproved: false,
      desc: 'Large department store with electronics, pharmacy, and bakeries.'
    },
    {
      id: 'LOC-05',
      category: 'Nightlife & Lounges',
      name: 'The Capitol Penthouse Cigar & Whiskey Lounge',
      distance: 'On-Site (5th Floor)',
      rating: 5.0,
      isHotelApproved: true,
      desc: 'Exclusive hotel-resident rooftop lounge offering rare single malts, Cuban cigars, and jazz.'
    },
    {
      id: 'LOC-06',
      category: 'Nightlife & Lounges',
      name: 'Cubana Club & Lounge Ikeja',
      distance: '1.8 km (10 mins)',
      rating: 4.6,
      isHotelApproved: false,
      desc: 'Energetic upscale nightlife spot with celebrity DJs and bottle service.'
    },
    {
      id: 'LOC-07',
      category: 'Tourist & Cultural',
      name: 'Kalakuta Museum & New Afrika Shrine',
      distance: '2.5 km (12 mins)',
      rating: 4.8,
      isHotelApproved: true,
      desc: 'Historic home of Fela Anikulapo Kuti and the legendary Afrobeat live performance center.'
    }
  ],

  staffMembers: [
    {
      id: 'STF-01',
      name: 'Amara Nwosu',
      role: 'Head of Housekeeping',
      adminRole: 'FRONT_DESK',
      department: 'housekeeping',
      active: true,
      shift: 'Morning (07:00 - 15:30)',
      clockedIn: true,
      clockInTime: '06:52 AM',
      clockStatus: 'On Time',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      performanceScore: 94,
      tasksCompleted: 48,
      totalTasks: 50,
      onTimeRate: '96%',
      feedback: 'Excellent',
      aiNotes: 'Exceptional attention to detail in Suites 401-404. Average room turnaround is 22 mins.'
    },
    {
      id: 'STF-02',
      name: 'Chef Babatunde Adele',
      role: 'Executive Kitchen Chef',
      adminRole: 'RESTAURANT_MANAGER',
      department: 'kitchen',
      active: true,
      shift: 'Morning (06:00 - 14:30)',
      clockedIn: true,
      clockInTime: '05:50 AM',
      clockStatus: 'On Time',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=600&q=80',
      performanceScore: 96,
      tasksCompleted: 62,
      totalTasks: 64,
      onTimeRate: '97%',
      feedback: 'Outstanding',
      aiNotes: 'Breakfast ticket turnaround maintained at 14 mins under peak 8:00 AM rush.'
    },
    {
      id: 'STF-03',
      name: 'Ibrahim Bello',
      role: 'Lead Concierge & Transport',
      adminRole: 'TRANSPORT_MANAGER',
      department: 'concierge',
      active: true,
      shift: 'Morning (08:00 - 16:30)',
      clockedIn: true,
      clockInTime: '07:55 AM',
      clockStatus: 'On Time',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      performanceScore: 91,
      tasksCompleted: 35,
      totalTasks: 38,
      onTimeRate: '92%',
      feedback: 'Very Good',
      aiNotes: 'Handled 12 VIP airport transfers with 100% guest satisfaction rating.'
    },
    {
      id: 'STF-04',
      name: 'Tariq Alabi',
      role: 'Duty Operations Supervisor',
      adminRole: 'HOTEL_ADMIN',
      department: 'management',
      active: true,
      shift: 'Full Day (08:00 - 18:00)',
      clockedIn: true,
      clockInTime: '07:45 AM',
      clockStatus: 'On Time',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
      performanceScore: 95,
      tasksCompleted: 70,
      totalTasks: 72,
      onTimeRate: '97%',
      feedback: 'Excellent',
      aiNotes: 'Quick resolution of departmental escalations and stock monitoring.'
    },
    {
      id: 'STF-05',
      name: 'Seyi Adeyemi',
      role: 'General Operations Manager',
      adminRole: 'SUPER_ADMIN',
      department: 'management',
      active: true,
      shift: 'Executive (08:00 - 19:00)',
      clockedIn: true,
      clockInTime: '07:30 AM',
      clockStatus: 'On Time',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
      performanceScore: 98,
      tasksCompleted: 85,
      totalTasks: 85,
      onTimeRate: '100%',
      feedback: 'Outstanding',
      aiNotes: 'High leadership oversight; approved 3 supplier purchase orders on time.'
    },
    {
      id: 'STF-06',
      name: 'Chidinma Eze',
      role: 'Digital & Content Manager',
      adminRole: 'CONTENT_MANAGER',
      department: 'marketing',
      active: true,
      shift: 'Morning (09:00 - 17:30)',
      clockedIn: true,
      clockInTime: '08:50 AM',
      clockStatus: 'On Time',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
      performanceScore: 95,
      tasksCompleted: 42,
      totalTasks: 44,
      onTimeRate: '98%',
      feedback: 'Outstanding',
      aiNotes: 'Successfully curated luxury photography and updated seasonal dining menus.'
    }
  ],

  staffTasks: [
    {
      id: 'TSK-501',
      staffId: 'STF-01',
      staffName: 'Amara Nwosu',
      room: '402',
      guestName: 'Chief Adeleke',
      title: 'Full Suite Restock & Fresh Towel Delivery',
      priority: 'HIGH',
      assignedTime: '11:25 AM',
      status: 'IN PROGRESS', // 'PENDING' | 'IN PROGRESS' | 'COMPLETED'
      completedAt: null
    },
    {
      id: 'TSK-502',
      staffId: 'STF-01',
      staffName: 'Amara Nwosu',
      room: '206',
      guestName: 'Alhaji Sanusi',
      title: 'Daily Deep Cleaning & Linen Change',
      priority: 'MEDIUM',
      assignedTime: '09:00 AM',
      status: 'COMPLETED',
      completedAt: '09:35 AM'
    },
    {
      id: 'TSK-503',
      staffId: 'STF-02',
      staffName: 'Chef Babatunde Adele',
      room: '402',
      guestName: 'Chief Adeleke',
      title: 'Prepare Signature Jollof Fiesta + Extra Prawns + Chapman',
      priority: 'HIGH',
      assignedTime: '12:45 PM',
      status: 'IN PROGRESS',
      completedAt: null
    },
    {
      id: 'TSK-504',
      staffId: 'STF-03',
      staffName: 'Ibrahim Bello',
      room: '205',
      guestName: 'Mrs. Folake Davies',
      title: 'Porter Assistance: Collect 2 Suitcases at 3:00 PM',
      priority: 'NORMAL',
      assignedTime: '12:05 PM',
      status: 'PENDING',
      completedAt: null
    }
  ],

  schedule: [
    { id: 'SCH-1', staffId: 'STF-01', staffName: 'Amara Nwosu', dept: 'Housekeeping', day: 'Monday', shift: 'Morning (07:00 - 15:30)', status: 'Published' },
    { id: 'SCH-2', staffId: 'STF-01', staffName: 'Amara Nwosu', dept: 'Housekeeping', day: 'Tuesday', shift: 'Morning (07:00 - 15:30)', status: 'Published' },
    { id: 'SCH-3', staffId: 'STF-01', staffName: 'Amara Nwosu', dept: 'Housekeeping', day: 'Wednesday', shift: 'Morning (07:00 - 15:30)', status: 'Published' },
    { id: 'SCH-4', staffId: 'STF-01', staffName: 'Amara Nwosu', dept: 'Housekeeping', day: 'Thursday', shift: 'Off Duty', status: 'Published' },
    { id: 'SCH-5', staffId: 'STF-01', staffName: 'Amara Nwosu', dept: 'Housekeeping', day: 'Friday', shift: 'Morning (07:00 - 15:30)', status: 'Published' },
    { id: 'SCH-6', staffId: 'STF-02', staffName: 'Chef Babatunde Adele', dept: 'Kitchen', day: 'Monday', shift: 'Morning (06:00 - 14:30)', status: 'Published' },
    { id: 'SCH-7', staffId: 'STF-03', staffName: 'Ibrahim Bello', dept: 'Concierge', day: 'Monday', shift: 'Afternoon (14:00 - 22:30)', status: 'Published' }
  ],

  shiftSwapRequests: [
    {
      id: 'SWP-01',
      requesterId: 'STF-01',
      requesterName: 'Amara Nwosu',
      targetStaffId: 'STF-03',
      targetStaffName: 'Ibrahim Bello',
      date: '2026-08-17',
      reason: 'Family appointment on Wednesday morning',
      status: 'PENDING_APPROVAL', // 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'
      supervisorNote: 'Awaiting Tariq Alabi sign-off'
    }
  ],

  intercomMessages: [
    { id: 'INT-01', channel: 'housekeeping', sender: 'Amara Nwosu', role: 'Head of Housekeeping', time: '11:26 AM', text: 'Team, Room 402 VIP restock has commenced. Please ensure fresh Egyptian cotton towels are stocked.' },
    { id: 'INT-02', channel: 'kitchen-fb', sender: 'Chef Babatunde Adele', role: 'Executive Chef', time: '12:46 PM', text: 'Order ORD-101 for Suite 402 is in the pan. Est 7 mins to plating.' },
    { id: 'INT-03', channel: 'general-operations', sender: 'Tariq Alabi', role: 'Duty Supervisor', time: '12:15 PM', text: 'Reminder to all staff: VIP arrival expected at 4 PM for Presidential Suite 401.' },
  ],

  inventory: [
    {
      id: 'INV-01',
      category: 'Kitchen',
      name: 'Premium Long Grain Rice (50kg Bag)',
      quantity: 4,
      unit: 'bags',
      maxCapacity: 15,
      reorderThreshold: 5,
      criticalThreshold: 2,
      supplier: 'Lagos Farm Fresh Produce',
      unitCost: 78000,
      status: 'LOW STOCK' // Calculated: 4/15 = 26.6% -> LOW STOCK (<30%)
    },
    {
      id: 'INV-02',
      category: 'Kitchen',
      name: 'Pure Vegetable Cooking Oil (25L Canister)',
      quantity: 2,
      unit: 'canisters',
      maxCapacity: 10,
      reorderThreshold: 3,
      criticalThreshold: 1,
      supplier: 'Lagos Farm Fresh Produce',
      unitCost: 45000,
      status: 'VERY LOW' // 2/10 = 20% -> VERY LOW (<=20%)
    },
    {
      id: 'INV-03',
      category: 'Housekeeping',
      name: 'Capitol Egyptian Cotton Bath Towels (White)',
      quantity: 18,
      unit: 'pieces',
      maxCapacity: 100,
      reorderThreshold: 30,
      criticalThreshold: 10,
      supplier: 'Capitol Linen & Amenities Supplies',
      unitCost: 12000,
      status: 'VERY LOW' // 18/100 = 18% -> VERY LOW
    },
    {
      id: 'INV-04',
      category: 'Toiletries',
      name: 'Luxury Botanical Toiletry Kits (Bottles)',
      quantity: 34,
      unit: 'sets',
      maxCapacity: 200,
      reorderThreshold: 60,
      criticalThreshold: 20,
      supplier: 'Capitol Linen & Amenities Supplies',
      unitCost: 3500,
      status: 'VERY LOW' // 34/200 = 17% -> VERY LOW
    },
    {
      id: 'INV-05',
      category: 'Housekeeping',
      name: 'Heavy-Duty Room Insecticide & Sanitizer Spray',
      quantity: 3,
      unit: 'cans',
      maxCapacity: 40,
      reorderThreshold: 12,
      criticalThreshold: 4,
      supplier: 'Capitol Linen & Amenities Supplies',
      unitCost: 6500,
      status: 'CRITICAL' // 3/40 = 7.5% -> CRITICAL (<=10%)
    },
    {
      id: 'INV-06',
      category: 'Restaurant',
      name: 'Fresh Jumbo Atlantic Tiger Prawns',
      quantity: 14,
      unit: 'kg',
      maxCapacity: 20,
      reorderThreshold: 6,
      criticalThreshold: 2,
      supplier: 'Ikeja Prime Poultry & Seafood',
      unitCost: 16000,
      status: 'NORMAL' // 14/20 = 70%
    },
    {
      id: 'INV-07',
      category: 'Bar',
      name: 'Moët & Chandon Brut Champagne (750ml)',
      quantity: 12,
      unit: 'bottles',
      maxCapacity: 18,
      reorderThreshold: 5,
      criticalThreshold: 2,
      supplier: 'Golden Beverage Distributors',
      unitCost: 68000,
      status: 'NORMAL'
    }
  ],

  stockRequests: [
    {
      id: 'SR-201',
      itemId: 'INV-02',
      itemName: 'Pure Vegetable Cooking Oil (25L Canister)',
      quantity: 5,
      unit: 'canisters',
      estimatedCost: 225000,
      requestedBy: 'Chef Babatunde Adele',
      requestedAt: '2026-08-15 10:15 AM',
      vendor: 'Lagos Farm Fresh Produce',
      status: 'PENDING_APPROVAL', // 'PENDING_APPROVAL' | 'APPROVED' | 'ORDERED' | 'DELIVERED' | 'REJECTED'
      approvedBy: null,
      approvedAt: null
    },
    {
      id: 'SR-202',
      itemId: 'INV-05',
      itemName: 'Heavy-Duty Room Insecticide & Sanitizer Spray',
      quantity: 20,
      unit: 'cans',
      estimatedCost: 130000,
      requestedBy: 'Amara Nwosu',
      requestedAt: '2026-08-15 08:30 AM',
      vendor: 'Capitol Linen & Amenities Supplies',
      status: 'APPROVED',
      approvedBy: 'Seyi Adeyemi (Manager)',
      approvedAt: '2026-08-15 09:00 AM'
    }
  ],

  vendors: [
    {
      id: 'VEN-01',
      name: 'Lagos Farm Fresh Produce',
      category: 'Kitchen Produce & Oils',
      contactPerson: 'Mr. Kunle Sanwo',
      phone: '+234 802 443 1190',
      email: 'orders@lagosfreshfarm.ng',
      address: '22 Alausa Market Road, Ikeja, Lagos',
      orders: [
        { poNumber: 'PO-9081', date: '2026-08-15', items: '5x Vegetable Cooking Oil (25L)', total: 225000, status: 'PENDING_ACCEPTANCE' }
      ]
    },
    {
      id: 'VEN-02',
      name: 'Capitol Linen & Amenities Supplies',
      category: 'Housekeeping & Toiletries',
      contactPerson: 'Mrs. Chidinma Eze',
      phone: '+234 803 776 2201',
      email: 'supply@capitollinen.ng',
      address: '14 Oregun Industrial Estate, Ikeja, Lagos',
      orders: [
        { poNumber: 'PO-9078', date: '2026-08-15', items: '20x Room Insecticide Spray, 50x Towels', total: 730000, status: 'IN_TRANSIT' }
      ]
    },
    {
      id: 'VEN-03',
      name: 'Ikeja Prime Poultry & Seafood',
      category: 'Fresh Meats & Seafood',
      contactPerson: 'Alhaji Musa Dangote',
      phone: '+234 805 119 4433',
      email: 'sales@primepoultryikeja.com',
      address: '8 Allen Avenue, Ikeja, Lagos',
      orders: []
    }
  ],

  auditLog: [
    { id: 'AUD-01', timestamp: '2026-08-15 07:30:00', actor: 'System AI', action: 'Breakfast Automation Rule', entity: '6:00 AM Notification', details: 'Automated breakfast invitations delivered to 3 active suites.' },
    { id: 'AUD-02', timestamp: '2026-08-15 08:30:00', actor: 'Amara Nwosu', action: 'Stock Request Created', entity: 'SR-202 Insecticide Spray', details: 'Submitted emergency replenishment request for 20 cans.' },
    { id: 'AUD-03', timestamp: '2026-08-15 09:00:00', actor: 'Seyi Adeyemi (Manager)', action: 'Stock Request Approved', entity: 'SR-202 (₦130,000)', details: 'Authorized emergency PO generation to Capitol Linen.' },
    { id: 'AUD-04', timestamp: '2026-08-15 12:45:00', actor: 'Chief Adeleke (Guest 402)', action: 'Restaurant Order Placed', entity: 'ORD-101 (₦18,000)', details: 'Ordered Jollof Fiesta with extras and Chapman.' }
  ],

  automationSettings: {
    breakfastNotificationTime: '06:00 AM',
    breakfastDeliveryWindow: '06:00 AM - 10:00 AM',
    roomServicePromptTime: '08:00 AM',
    checkoutReminderMinutes: 45,
    foodDeliveryWarningMinutes: 5,
    lowStockThresholdPercent: 30,
    veryLowStockThresholdPercent: 20,
    criticalStockThresholdPercent: 10,
    soundAlertsEnabled: true,
    aiVoiceSynthesisEnabled: true
  }
};

class StateStore {
  constructor() {
    this.subscribers = [];
    this.state = this.loadState();
    this.initCrossTabSync();
  }

  initCrossTabSync() {
    if (typeof window !== 'undefined') {
      try {
        if ('BroadcastChannel' in window) {
          this.bc = new BroadcastChannel('hotel_capitol_sync_channel');
          this.bc.onmessage = (event) => {
            if (event.data && event.data.type === 'STATE_UPDATED') {
              this.state = event.data.state;
              this.notify(false);
            }
          };
        }

        window.addEventListener('storage', (e) => {
          if (e.key === STORAGE_KEY && e.newValue) {
            try {
              this.state = JSON.parse(e.newValue);
              this.notify(false);
            } catch (err) {
              console.warn('Storage sync error:', err);
            }
          }
        });
      } catch (e) {
        console.warn('Cross-tab sync initialization:', e);
      }
    }
  }

  loadState() {
    try {
      // Purge legacy outdated cache keys so browser loads fresh FSM configuration cleanly
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('HOTEL_CAPITOL_STATE_V1');
        localStorage.removeItem('HOTEL_CAPITOL_STATE_V2');
        localStorage.removeItem('HOTEL_CAPITOL_STATE_V3');
        localStorage.removeItem('HOTEL_CAPITOL_STATE_V4');
        localStorage.removeItem('HOTEL_CAPITOL_STATE_V5');
        localStorage.removeItem('HOTEL_CAPITOL_STATE_V9');
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch (e) {
      console.warn('Could not load stored state, using default:', e);
    }
    return JSON.parse(JSON.stringify(defaultState));
  }

  saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      }
      if (this.bc) {
        this.bc.postMessage({ type: 'STATE_UPDATED', state: this.state });
      }
    } catch (e) {
      // Ignore in non-browser env
    }
  }

  getState() {
    return this.state;
  }

  setState(updater) {
    if (typeof updater === 'function') {
      this.state = updater(this.state);
    } else {
      this.state = { ...this.state, ...updater };
    }
    this.saveState();
    this.notify(true);
  }

  resetToDefault() {
    this.state = JSON.parse(JSON.stringify(defaultState));
    this.saveState();
    this.notify(true);
  }

  subscribe(listener) {
    this.subscribers.push(listener);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== listener);
    };
  }

  notify(broadcast = true) {
    this.subscribers.forEach(listener => listener(this.state));
  }

  // --- Convenience Helper Actions ---

  addAudit(action, entity, details, actor = null, module = 'General', previousValue = null, newValue = null, reason = null, version = null) {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const date = new Date().toISOString().split('T')[0];
    const newEntry = {
      id: 'AUD-' + Date.now().toString().slice(-4),
      timestamp: `${date} ${time}`,
      actor: actor || (this.state.activeRole === 'guest' ? `Guest in Suite ${this.getActiveGuest()?.roomNumber || '402'}` : 'Staff/Supervisor'),
      action,
      entity,
      details,
      module,
      previousValue,
      newValue,
      reason,
      version
    };
    this.setState(s => ({
      ...s,
      auditLog: [newEntry, ...s.auditLog]
    }));
  }

  getActiveGuest() {
    return this.state.guests.find(g => g.id === this.state.activeGuestId) || this.state.guests[0];
  }

  getActiveStaff() {
    return this.state.staffMembers.find(s => s.id === this.state.activeStaffId) || this.state.staffMembers[0];
  }

  setActiveRole(role) {
    this.setState(s => ({ ...s, activeRole: role }));
  }

  setActiveGuestId(id) {
    this.setState(s => ({ ...s, activeGuestId: id }));
  }

  setActiveStaffId(id) {
    this.setState(s => ({ ...s, activeStaffId: id }));
  }

  // Add Restaurant Order (Genuine SUBMITTED state with exact timestamps)
  createOrder(orderData) {
    const orderId = 'ORD-' + (this.state.orders.length + 101);
    const guest = this.getActiveGuest();
    const now = Date.now();
    const prepMins = orderData.prepTimeMinutes || orderData.estimatedMinutes || 20;
    const deliveryMins = orderData.deliveryMinutes || 15;
    const totalMins = prepMins + deliveryMins;

    const newOrder = {
      id: orderId,
      guestId: guest.id,
      guestName: guest.name,
      roomNumber: guest.roomNumber,
      items: orderData.items || [],
      totalAmount: orderData.totalAmount || 0,
      status: 'SUBMITTED', // Initial genuine FSM state
      createdTimestamp: now,
      createdAt: new Date(now).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      preparationMinutes: prepMins,
      deliveryMinutes: deliveryMins,
      totalMinutes: totalMins,
      preparationStartedAt: null,
      estimatedReadyAt: null,
      readyAt: null,
      deliveryStartedAt: null,
      estimatedDeliveryAt: now + totalMins * 60 * 1000,
      revisedDeliveryAt: null,
      deliveredAt: null,
      fiveMinuteDeliveryNotificationSent: false,
      delayNotificationSent: false,
      assignedStaff: 'Chef Babatunde Adele',
      roomDeliveryStaff: 'Amara Nwosu',
      specialInstructions: orderData.specialInstructions || ''
    };

    // Add to guest folio
    const folioItem = {
      id: 'FOL-' + Date.now().toString().slice(-4),
      date: new Date().toISOString().split('T')[0],
      desc: `Restaurant Order: ${newOrder.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}`,
      amount: newOrder.totalAmount,
      category: 'Restaurant',
      status: 'Posted'
    };

    this.setState(s => ({
      ...s,
      orders: [newOrder, ...s.orders],
      guests: s.guests.map(g => g.id === guest.id ? { ...g, folio: [...g.folio, folioItem] } : g)
    }));

    this.addAudit('New Restaurant Order', `${orderId} (₦${newOrder.totalAmount.toLocaleString()})`, `Order placed for Room ${guest.roomNumber}.`);
    return newOrder;
  }

  // Update order status with realistic timestamp triggers
  updateOrderStatus(orderId, nextStatus, extraData = {}) {
    const now = Date.now();
    this.setState(s => ({
      ...s,
      orders: s.orders.map(o => {
        if (o.id !== orderId) return o;

        const updated = { ...o, status: nextStatus, ...extraData };

        if (nextStatus === 'PREPARING') {
          updated.preparationStartedAt = updated.preparationStartedAt || now;
          const prepMins = updated.preparationMinutes || 20;
          const deliveryMins = updated.deliveryMinutes || 15;
          updated.estimatedReadyAt = updated.preparationStartedAt + prepMins * 60 * 1000;
          updated.estimatedDeliveryAt = updated.estimatedReadyAt + deliveryMins * 60 * 1000;
        } else if (nextStatus === 'READY') {
          updated.readyAt = updated.readyAt || now;
        } else if (nextStatus === 'OUT_FOR_DELIVERY') {
          updated.deliveryStartedAt = updated.deliveryStartedAt || now;
          const deliveryMins = updated.deliveryMinutes || 15;
          updated.estimatedDeliveryAt = updated.deliveryStartedAt + deliveryMins * 60 * 1000;
        } else if (nextStatus === 'DELIVERED') {
          updated.deliveredAt = updated.deliveredAt || now;
        }

        return updated;
      })
    }));
    this.addAudit('Order Status Transition', orderId, `Status updated to ${nextStatus}`);
  }

  // Set revised delivery time from authorized staff action
  setOrderRevisedTime(orderId, additionalMinutes = 10) {
    const now = Date.now();
    this.setState(s => ({
      ...s,
      orders: s.orders.map(o => {
        if (o.id !== orderId) return o;
        const currentTarget = o.estimatedDeliveryAt || (now + 15 * 60 * 1000);
        const newTarget = currentTarget + additionalMinutes * 60 * 1000;
        return {
          ...o,
          revisedDeliveryAt: newTarget,
          delayNotificationSent: true
        };
      })
    }));
    this.addAudit('Order Delivery Time Revised', orderId, `Added +${additionalMinutes} mins`);
  }

  // Lookup designated staff member assigned to specific room and service area
  getDesignatedStaffForRoom(roomNumber, department = 'Housekeeping') {
    const state = this.getState();
    const deptLower = (department || '').toLowerCase();
    
    // 1. Kitchen & F&B -> Executive Chef Babatunde
    if (deptLower.includes('kitchen') || deptLower.includes('food') || deptLower.includes('f&b') || deptLower.includes('dining') || deptLower.includes('restaurant') || deptLower.includes('breakfast')) {
      return state.staffMembers.find(s => s.id === 'STF-02') || state.staffMembers[1];
    }
    
    // 2. Concierge & Transport -> Lead Concierge Ibrahim Bello
    if (deptLower.includes('concierge') || deptLower.includes('transport') || deptLower.includes('porter') || deptLower.includes('taxi') || deptLower.includes('luggage')) {
      return state.staffMembers.find(s => s.id === 'STF-03') || state.staffMembers[2];
    }

    // 3. Maintenance / Duty Supervisor -> Tariq Alabi
    if (deptLower.includes('maintenance') || deptLower.includes('facility') || deptLower.includes('supervis') || deptLower.includes('operations')) {
      return state.staffMembers.find(s => s.id === 'STF-04') || state.staffMembers[3];
    }

    // 4. Dedicated Housekeeping Specialist for Suite (Amara Nwosu)
    return state.staffMembers.find(s => s.id === 'STF-01') || state.staffMembers[0];
  }

  // Add Service Request with Voice Exchange Trail & Designated Staff Routing
  createServiceRequest(type, title, details, priority = 'NORMAL', assignedStaff = null, department = null) {
    const reqId = 'REQ-' + (this.state.serviceRequests.length + 301);
    const guest = this.getActiveGuest();
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    const targetDept = department || type || 'Housekeeping';
    const designatedStaff = this.getDesignatedStaffForRoom(guest.roomNumber, targetDept);
    const staffName = assignedStaff || designatedStaff.name;
    const staffId = designatedStaff.id;

    let targetMinutes = 15;
    const deptLower = targetDept.toLowerCase();
    const titleLower = title.toLowerCase();
    if (deptLower.includes('kitchen') || deptLower.includes('food') || deptLower.includes('dining') || deptLower.includes('breakfast')) {
      targetMinutes = 25;
    } else if (deptLower.includes('porter') || deptLower.includes('luggage')) {
      targetMinutes = 10;
    } else if (deptLower.includes('maintenance')) {
      targetMinutes = 20;
    } else if (titleLower.includes('deep clean')) {
      targetMinutes = 30;
    }

    const nowTs = Date.now();
    const deadlineTs = nowTs + targetMinutes * 60 * 1000;

    const newReq = {
      id: reqId,
      guestId: guest.id,
      guestName: guest.name,
      roomNumber: guest.roomNumber,
      type,
      department: targetDept,
      title,
      details,
      requestedAt: nowTime,
      assignedStaffId: staffId,
      assignedStaffName: staffName,
      status: 'AWAITING_STAFF_CONFIRMATION',
      priority,
      targetMinutes,
      createdAtTimestamp: nowTs,
      deadlineTimestamp: deadlineTs,
      completedAt: null,
      confirmedByStaff: null,
      confirmedAt: null,
      voiceExchangeTrail: [
        { time: nowTime, actor: `Guest (${guest.name} · Suite #${guest.roomNumber})`, text: details, phase: 'GUEST_REQUEST' },
        { time: nowTime, actor: 'Hotel Capitol AI', text: `Confirming request. Alerting designated room attendant ${staffName} (${targetDept}) for prompt delivery within ${targetMinutes} minutes.`, phase: 'AI_RECEIPT' }
      ]
    };

    // Synchronize into designated staff's active task list
    const taskId = 'TSK-' + (this.state.staffTasks.length + 501);
    const newTask = {
      id: taskId,
      requestId: reqId,
      staffId: staffId,
      staffName: staffName,
      room: guest.roomNumber,
      guestName: guest.name,
      title: title,
      department: targetDept,
      priority: priority,
      assignedTime: nowTime,
      status: 'IN PROGRESS',
      targetMinutes,
      createdAtTimestamp: nowTs,
      deadlineTimestamp: deadlineTs,
      completedAt: null
    };

    this.setState(s => ({
      ...s,
      serviceRequests: [newReq, ...s.serviceRequests],
      staffTasks: [newTask, ...s.staffTasks]
    }));

    this.addAudit('AI Voice Request Dispatched', `${reqId} - ${title}`, `Alerted designated staff ${staffName} for Suite #${guest.roomNumber} (Target SLA: ${targetMinutes} mins)`);
    return newReq;
  }

  // Staff Voice Confirmation of Request
  confirmStaffServiceRequest(reqId, staffName = null) {
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const staff = this.getActiveStaff();
    const activeStaffName = staffName || staff.name;

    let targetReq = null;
    this.setState(s => ({
      ...s,
      serviceRequests: s.serviceRequests.map(r => {
        if (r.id === reqId) {
          targetReq = {
            ...r,
            status: 'IN PROGRESS',
            confirmedByStaff: activeStaffName,
            confirmedAt: nowTime,
            voiceExchangeTrail: [
              ...(r.voiceExchangeTrail || []),
              { time: nowTime, actor: activeStaffName, text: 'Request confirmed.', phase: 'STAFF_CONFIRMATION' },
              { time: nowTime, actor: 'Hotel Capitol AI (to Guest)', text: `Your request for ${r.title} has been confirmed by ${activeStaffName} and is now being attended to.`, phase: 'GUEST_NOTIFICATION' }
            ]
          };
          return targetReq;
        }
        return r;
      })
    }));

    this.addAudit('Staff Voice Confirmation', reqId, `Confirmed by ${activeStaffName}: "Request confirmed"`);
    return targetReq;
  }

  // Update service request status
  updateServiceRequestStatus(reqId, status) {
    const completedAt = status === 'COMPLETED' ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : null;
    this.setState(s => ({
      ...s,
      serviceRequests: s.serviceRequests.map(r => r.id === reqId ? { ...r, status, completedAt: completedAt || r.completedAt } : r)
    }));
    this.addAudit('Service Request Updated', reqId, `Status changed to ${status}`);
  }

  // Submit stock replenishment request
  createStockRequest(itemId, quantity, vendor) {
    const item = this.state.inventory.find(i => i.id === itemId);
    if (!item) return;

    const srId = 'SR-' + (this.state.stockRequests.length + 201);
    const staff = this.getActiveStaff();
    const newSr = {
      id: srId,
      itemId,
      itemName: item.name,
      quantity,
      unit: item.unit,
      estimatedCost: item.unitCost * quantity,
      requestedBy: staff.name,
      requestedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      vendor: vendor || item.supplier,
      status: 'PENDING_APPROVAL',
      approvedBy: null,
      approvedAt: null
    };

    this.setState(s => ({
      ...s,
      stockRequests: [newSr, ...s.stockRequests]
    }));

    this.addAudit('Stock Request Submitted', `${srId} (${item.name})`, `Requested by ${staff.name} for ${quantity} ${item.unit}.`);
    return newSr;
  }

  // Manager Approve Stock Request
  approveStockRequest(srId) {
    const staff = this.getActiveStaff();
    this.setState(s => ({
      ...s,
      stockRequests: s.stockRequests.map(sr => sr.id === srId ? {
        ...sr,
        status: 'APPROVED',
        approvedBy: staff.name + ' (Manager)',
        approvedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      } : sr)
    }));
    this.addAudit('Stock Request Approved', srId, `Approved by ${staff.name}`);
  }

  // Vendor Record Delivery & Auto-update inventory
  recordStockDelivery(srId) {
    const sr = this.state.stockRequests.find(r => r.id === srId);
    if (!sr) return;

    this.setState(s => ({
      ...s,
      stockRequests: s.stockRequests.map(r => r.id === srId ? { ...r, status: 'DELIVERED' } : r),
      inventory: s.inventory.map(inv => {
        if (inv.id === sr.itemId) {
          const newQty = inv.quantity + sr.quantity;
          const ratio = newQty / inv.maxCapacity;
          let status = 'NORMAL';
          if (ratio <= 0.1) status = 'CRITICAL';
          else if (ratio <= 0.2) status = 'VERY LOW';
          else if (ratio <= 0.3) status = 'LOW STOCK';

          return {
            ...inv,
            quantity: newQty,
            status
          };
        }
        return inv;
      })
    }));

    this.addAudit('Inventory Restocked', `${sr.itemName} (+${sr.quantity} ${sr.unit})`, 'Stock delivered by vendor and automatically updated.');
  }

  // Clock In / Clock Out
  toggleClockIn(staffId) {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    this.setState(s => ({
      ...s,
      staffMembers: s.staffMembers.map(st => {
        if (st.id === staffId) {
          const isClockingIn = !st.clockedIn;
          return {
            ...st,
            clockedIn: isClockingIn,
            clockInTime: isClockingIn ? time : st.clockInTime,
            clockStatus: isClockingIn ? 'On Time' : 'Signed Out'
          };
        }
        return st;
      })
    }));
  }

  // Send Intercom Message
  sendIntercomMessage(channel, text) {
    const staff = this.getActiveStaff();
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const msg = {
      id: 'INT-' + Date.now().toString().slice(-4),
      channel,
      sender: staff.name,
      role: staff.role,
      time,
      text
    };

    this.setState(s => ({
      ...s,
      intercomMessages: [...s.intercomMessages, msg]
    }));
  }

  // --- TOLANI LEARNING STORE MUTATIONS ---
  addInteractionLog(log) {
    this.setState(s => ({
      ...s,
      interactionLogs: [log, ...(s.interactionLogs || [])].slice(0, 500)
    }));
  }

  addLearningSuggestion(suggestion) {
    this.setState(s => ({
      ...s,
      learningSuggestions: [suggestion, ...(s.learningSuggestions || [])]
    }));
  }

  updateLearningSuggestion(id, patch) {
    this.setState(s => ({
      ...s,
      learningSuggestions: (s.learningSuggestions || []).map(sug => sug.id === id ? { ...sug, ...patch } : sug)
    }));
  }

  addApprovedKnowledgeUpdate(update) {
    this.setState(s => ({
      ...s,
      approvedKnowledgeUpdates: [update, ...(s.approvedKnowledgeUpdates || [])]
    }));
    this.addAudit('Knowledge Update Approved', update.updateCode, `Approved by ${update.approvedBy}: "${update.approvedPhrase}" -> ${update.mappedIntent}`);
  }

  addApprovedLearnedPhrase(phraseObj) {
    this.setState(s => {
      const phrases = s.approvedLearnedPhrases || [];
      const filtered = phrases.filter(p => p.phrase !== phraseObj.phrase);
      return {
        ...s,
        approvedLearnedPhrases: [phraseObj, ...filtered]
      };
    });
  }

  rollbackKnowledgeUpdate(updateId, adminName = 'Hotel Administrator') {
    const update = (this.state.approvedKnowledgeUpdates || []).find(u => u.id === updateId);
    if (!update) return;

    this.setState(s => ({
      ...s,
      approvedKnowledgeUpdates: (s.approvedKnowledgeUpdates || []).map(u => u.id === updateId ? { ...u, status: 'ROLLED_BACK', rolledBackBy: adminName, rolledBackAt: new Date().toISOString() } : u),
      approvedLearnedPhrases: (s.approvedLearnedPhrases || []).filter(p => p.updateCode !== update.updateCode)
    }));

    this.addAudit('Knowledge Update Rolled Back', update.updateCode, `Rolled back by ${adminName}`);
  }

  addGuestPreference(guestId, pref) {
    this.setState(s => {
      const prefs = s.guestPreferences || [];
      return {
        ...s,
        guestPreferences: [pref, ...prefs.filter(p => !(p.guestId === guestId && p.category === pref.category && p.item === pref.item))]
      };
    });
  }

  recordAbandonedFlow(flow) {
    this.setState(s => ({
      ...s,
      abandonedWorkflows: [flow, ...(s.abandonedWorkflows || [])].slice(0, 100)
    }));
  }

  recordFeedback(feedback) {
    this.setState(s => ({
      ...s,
      serviceFeedbacks: [feedback, ...(s.serviceFeedbacks || [])]
    }));
    this.addAudit('Guest Service Feedback', `${feedback.serviceType} (Rating: ${feedback.rating}/5)`, `Guest #${feedback.roomNumber} feedback: "${feedback.comment || feedback.satisfaction}"`);
  }

  clearLearningData() {
    this.setState(s => ({
      ...s,
      interactionLogs: [],
      abandonedWorkflows: [],
      serviceFeedbacks: []
    }));
    this.addAudit('Learning Data Cleared', 'Admin Privacy Action', 'Cleared conversation interaction logs and feedback history.');
  }

  updateLearningSettings(settings) {
    this.setState(s => ({
      ...s,
      learningSettings: { ...(s.learningSettings || {}), ...settings }
    }));
  }

  // --- VIP TRANSPORTATION LIFECYCLE MUTATIONS ---
  createTransportRequest(bookingData) {
    const guest = this.getActiveGuest();
    const tbkId = 'TBK-' + (this.state.transportBookings.length + 101);
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Calculate departure timestamp
    let departureTimestamp = Date.now() + 3600000; // default 1 hr from now
    if (bookingData.departureDate && bookingData.departureTime) {
      const parsed = new Date(`${bookingData.departureDate} ${bookingData.departureTime}`);
      if (!isNaN(parsed.getTime())) {
        departureTimestamp = parsed.getTime();
      }
    }

    const newBooking = {
      id: tbkId,
      guestId: guest.id,
      guestName: guest.name,
      roomNumber: guest.roomNumber,
      serviceType: bookingData.serviceType || 'ONE_TIME_DROPOFF',
      zoneId: bookingData.zoneId,
      destination: bookingData.destination,
      zoneName: bookingData.zoneName,
      departureDate: bookingData.departureDate || new Date().toISOString().slice(0, 10),
      departureTime: bookingData.departureTime || 'Now',
      departureTimestamp: new Date(departureTimestamp).toISOString(),
      vehicleClassId: bookingData.vehicleClassId,
      vehicle: bookingData.vehicle,
      passengers: bookingData.passengers || 1,
      charterDuration: bookingData.charterDuration || null,
      price: bookingData.price,
      driverName: 'Ibrahim Bello',
      driverPhone: '+234 803 555 4020',
      vehiclePlate: 'KJA-402-CP',
      status: 'PENDING_DRIVER_ACCEPTANCE', // 'PENDING_DRIVER_ACCEPTANCE' | 'DRIVER_ACCEPTED' | 'DESTINATION_CONFIRMED' | 'CONFIRMED' | 'IN_TRANSIT' | 'COMPLETED'
      createdAt: nowTime,
      paymentStatus: 'POSTED_TO_FOLIO',
      reminder30Sent: false,
      reminder15Sent: false,
      rescheduleRequested: null
    };

    // Auto-post to folio
    const folioItem = {
      id: 'FOL-' + Date.now().toString().slice(-4),
      date: new Date().toISOString().split('T')[0],
      desc: `VIP Chauffeured Transportation (${newBooking.destination})`,
      amount: newBooking.price,
      category: 'Transportation',
      status: 'Posted'
    };

    this.setState(s => ({
      ...s,
      transportBookings: [newBooking, ...s.transportBookings],
      guests: s.guests.map(g => g.id === guest.id ? { ...g, folio: [...g.folio, folioItem] } : g)
    }));

    this.addAudit('VIP Transportation Booked', `${tbkId} (${newBooking.destination})`, `Booked by Suite #${guest.roomNumber} (₦${newBooking.price.toLocaleString()})`);
    return newBooking;
  }

  postToFolio(guestId, { desc, amount, category = 'General' }) {
    const folioItem = {
      id: 'FOL-' + Date.now().toString().slice(-4),
      date: new Date().toISOString().split('T')[0],
      desc,
      amount,
      category,
      status: 'Posted'
    };
    this.setState(s => ({
      ...s,
      guests: s.guests.map(g => g.id === guestId ? { ...g, folio: [...g.folio, folioItem] } : g)
    }));
    return folioItem;
  }

  driverAcceptTransport(bookingId, driverName = 'Ibrahim Bello') {
    this.setState(s => ({
      ...s,
      transportBookings: s.transportBookings.map(b => b.id === bookingId ? {
        ...b,
        status: 'DRIVER_ACCEPTED',
        driverAccepted: true,
        driverName
      } : b)
    }));
    this.addAudit('Driver Accepted Ride', bookingId, `Driver ${driverName} accepted transportation dispatch.`);
  }

  driverConfirmDestination(bookingId) {
    this.setState(s => ({
      ...s,
      transportBookings: s.transportBookings.map(b => b.id === bookingId ? {
        ...b,
        status: 'DESTINATION_CONFIRMED',
        routeConfirmed: true
      } : b)
    }));
    this.addAudit('Destination Confirmed', bookingId, 'Driver confirmed route and pickup destination.');
  }

  driverConfirmSchedule(bookingId) {
    this.setState(s => ({
      ...s,
      transportBookings: s.transportBookings.map(b => b.id === bookingId ? {
        ...b,
        status: 'CONFIRMED',
        scheduleConfirmed: true
      } : b)
    }));
    this.addAudit('Transportation Schedule Confirmed', bookingId, 'Driver confirmed departure schedule. Guest Portal updated with live departure countdown.');
  }

  rescheduleTransport(bookingId, newDate, newTime) {
    let newTs = Date.now() + 3600000;
    if (newDate && newTime) {
      const parsed = new Date(`${newDate} ${newTime}`);
      if (!isNaN(parsed.getTime())) {
        newTs = parsed.getTime();
      }
    }

    this.setState(s => ({
      ...s,
      transportBookings: s.transportBookings.map(b => b.id === bookingId ? {
        ...b,
        departureDate: newDate,
        departureTime: newTime,
        departureTimestamp: new Date(newTs).toISOString(),
        status: 'CONFIRMED',
        rescheduled: true,
        rescheduledAt: new Date().toISOString(),
        reminder30Sent: false,
        reminder15Sent: false
      } : b)
    }));

    this.addAudit('Transportation Rescheduled', bookingId, `Departure rescheduled to ${newDate} at ${newTime}`);
  }

  // --- REAL ROLE-BASED ACCESS CONTROL (RBAC) ---
  hasPermission(permissionKey, staff = null) {
    const currentStaff = staff || this.getActiveStaff();
    if (!currentStaff) return false;
    // Check if staff is active
    if (currentStaff.active === false) return false;
    const role = currentStaff.adminRole || (currentStaff.id === 'STF-05' ? 'SUPER_ADMIN' : 'HOTEL_ADMIN');
    const perms = ROLE_PERMISSIONS[role] || [];
    return perms.includes('ALL') || perms.includes(permissionKey);
  }

  checkPermissionOrThrow(permissionKey, staff = null) {
    if (!this.hasPermission(permissionKey, staff)) {
      const currentStaff = staff || this.getActiveStaff();
      throw new Error(`Access Denied: Role "${currentStaff?.adminRole || 'UNKNOWN'}" lacks permission "${permissionKey}".`);
    }
  }

  // --- CONTENT VERSIONING HELPER ---
  recordContentVersion(entityType, entityId, entityName, prevData, newData, actorName, actorRole, reason = 'Administrative update') {
    const nextVer = (prevData?.version || 1) + 1;
    const versionEntry = {
      id: `VER-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      version: nextVer,
      entityType,
      entityId,
      entityName: entityName || entityId,
      timestamp: new Date().toISOString(),
      dateFormatted: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      changedBy: actorName || 'Authorized Admin',
      role: actorRole || 'ADMIN',
      reason,
      previousSnapshot: prevData ? JSON.parse(JSON.stringify(prevData)) : null,
      newSnapshot: JSON.parse(JSON.stringify(newData))
    };
    return versionEntry;
  }

  // --- RESTAURANT & DINING CONTENT MANAGEMENT ---
  addMenuItem(itemData, staff = null) {
    this.checkPermissionOrThrow('MANAGE_MENU', staff);
    const actor = staff || this.getActiveStaff();
    const newId = itemData.id || `M-${String(this.state.menu.length + 1).padStart(2, '0')}`;
    const newItem = {
      id: newId,
      category: itemData.category || 'Food',
      name: itemData.name,
      desc: itemData.desc || '',
      price: Number(itemData.price) || 0,
      prepTimeMinutes: Number(itemData.prepTimeMinutes) || 20,
      estimatedDeliveryMinutes: Number(itemData.estimatedDeliveryMinutes) || 15,
      image: itemData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      available: itemData.available ?? true,
      popular: itemData.popular ?? false,
      featured: itemData.featured ?? false,
      dietary: itemData.dietary || [],
      status: itemData.status || 'PUBLISHED', // 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
      version: 1,
      versionHistory: [],
      addons: itemData.addons || []
    };

    this.setState(s => ({
      ...s,
      menu: [...s.menu, newItem]
    }));

    this.addAudit('MENU_ITEM_CREATED', `${newItem.name} (${newItem.id})`, `Created new menu item: ₦${newItem.price.toLocaleString()} [Status: ${newItem.status}]`, actor.name, 'Restaurant Menu', null, newItem, 'Created new dish');
    return newItem;
  }

  updateMenuItem(itemId, patchData, staff = null, reason = 'Menu item updated') {
    this.checkPermissionOrThrow('MANAGE_MENU', staff);
    const actor = staff || this.getActiveStaff();
    const existing = this.state.menu.find(m => m.id === itemId);
    if (!existing) throw new Error(`Menu item with ID ${itemId} not found.`);

    const versionEntry = this.recordContentVersion('MENU_ITEM', itemId, existing.name, existing, { ...existing, ...patchData }, actor.name, actor.adminRole, reason);

    const updatedItem = {
      ...existing,
      ...patchData,
      version: versionEntry.version,
      versionHistory: [versionEntry, ...(existing.versionHistory || [])]
    };

    this.setState(s => ({
      ...s,
      menu: s.menu.map(m => m.id === itemId ? updatedItem : m)
    }));

    this.addAudit('MENU_ITEM_UPDATED', `${updatedItem.name} (${itemId})`, `Updated item details. Reason: ${reason}`, actor.name, 'Restaurant Menu', existing, updatedItem, reason, versionEntry.version);
    return updatedItem;
  }

  publishMenuItem(itemId, staff = null) {
    this.checkPermissionOrThrow('PUBLISH_MENU', staff);
    return this.updateMenuItem(itemId, { status: 'PUBLISHED' }, staff, 'Published to Guest Portal and Tolani');
  }

  archiveMenuItem(itemId, staff = null) {
    this.checkPermissionOrThrow('MANAGE_MENU', staff);
    return this.updateMenuItem(itemId, { status: 'ARCHIVED', available: false }, staff, 'Archived menu item');
  }

  restoreMenuItemVersion(itemId, targetVersion, staff = null) {
    this.checkPermissionOrThrow('MANAGE_MENU', staff);
    const existing = this.state.menu.find(m => m.id === itemId);
    if (!existing) throw new Error(`Menu item ${itemId} not found.`);
    
    let targetSnapshot = null;
    for (const v of (existing.versionHistory || [])) {
      if (v.previousSnapshot && v.previousSnapshot.version === targetVersion) {
        targetSnapshot = v.previousSnapshot;
        break;
      }
      if (v.newSnapshot && v.newSnapshot.version === targetVersion) {
        targetSnapshot = v.newSnapshot;
        break;
      }
      if (v.version === targetVersion) {
        targetSnapshot = v.previousSnapshot || v.newSnapshot;
        break;
      }
    }

    if (!targetSnapshot) throw new Error(`Version ${targetVersion} not found in history for item ${itemId}.`);

    return this.updateMenuItem(itemId, {
      name: targetSnapshot.name,
      desc: targetSnapshot.desc,
      price: targetSnapshot.price,
      prepTimeMinutes: targetSnapshot.prepTimeMinutes,
      estimatedDeliveryMinutes: targetSnapshot.estimatedDeliveryMinutes,
      image: targetSnapshot.image,
      available: targetSnapshot.available,
      status: targetSnapshot.status,
      dietary: targetSnapshot.dietary,
      addons: targetSnapshot.addons
    }, staff, `Restored to Version #${targetVersion}`);
  }

  deleteMenuItem(itemId, staff = null) {
    this.checkPermissionOrThrow('MANAGE_MENU', staff);
    const actor = staff || this.getActiveStaff();
    const existing = this.state.menu.find(m => m.id === itemId);
    if (!existing) return;

    this.setState(s => ({
      ...s,
      menu: s.menu.filter(m => m.id !== itemId)
    }));

    this.addAudit('MENU_ITEM_DELETED', `${existing.name} (${itemId})`, `Deleted menu item from catalog`, actor.name, 'Restaurant Menu', existing, null, 'Administrative deletion');
  }

  // --- AMENITIES CONTENT MANAGEMENT ---
  addAmenity(amenityData, staff = null) {
    this.checkPermissionOrThrow('MANAGE_AMENITIES', staff);
    const actor = staff || this.getActiveStaff();
    const newId = amenityData.id || `AMN-${String((this.state.amenities || []).length + 1).padStart(2, '0')}`;
    const newAmenity = {
      id: newId,
      name: amenityData.name,
      category: amenityData.category || 'Recreation & Leisure',
      description: amenityData.description || '',
      openingHours: amenityData.openingHours || '06:00 AM - 10:00 PM Daily',
      location: amenityData.location || 'Main Concourse',
      rules: amenityData.rules || 'Resident suites only.',
      guestInstructions: amenityData.guestInstructions || '',
      contact: amenityData.contact || 'Ext 0 / Front Desk',
      image: amenityData.image || 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      status: amenityData.status || 'PUBLISHED',
      available: amenityData.available ?? true,
      featured: amenityData.featured ?? false,
      version: 1,
      versionHistory: []
    };

    this.setState(s => ({
      ...s,
      amenities: [...(s.amenities || []), newAmenity]
    }));

    this.addAudit('AMENITY_CREATED', `${newAmenity.name} (${newAmenity.id})`, `Created amenity listing [Status: ${newAmenity.status}]`, actor.name, 'Amenities', null, newAmenity, 'Created new amenity');
    return newAmenity;
  }

  updateAmenity(amenityId, patchData, staff = null, reason = 'Amenity updated') {
    this.checkPermissionOrThrow('MANAGE_AMENITIES', staff);
    const actor = staff || this.getActiveStaff();
    const existing = (this.state.amenities || []).find(a => a.id === amenityId);
    if (!existing) throw new Error(`Amenity with ID ${amenityId} not found.`);

    const versionEntry = this.recordContentVersion('AMENITY', amenityId, existing.name, existing, { ...existing, ...patchData }, actor.name, actor.adminRole, reason);

    const updatedAmenity = {
      ...existing,
      ...patchData,
      version: versionEntry.version,
      versionHistory: [versionEntry, ...(existing.versionHistory || [])]
    };

    this.setState(s => ({
      ...s,
      amenities: (s.amenities || []).map(a => a.id === amenityId ? updatedAmenity : a)
    }));

    this.addAudit('AMENITY_UPDATED', `${updatedAmenity.name} (${amenityId})`, `Updated amenity details. Reason: ${reason}`, actor.name, 'Amenities', existing, updatedAmenity, reason, versionEntry.version);
    return updatedAmenity;
  }

  publishAmenity(amenityId, staff = null) {
    this.checkPermissionOrThrow('MANAGE_AMENITIES', staff);
    return this.updateAmenity(amenityId, { status: 'PUBLISHED' }, staff, 'Published amenity to Guest Portal and Tolani');
  }

  archiveAmenity(amenityId, staff = null) {
    this.checkPermissionOrThrow('MANAGE_AMENITIES', staff);
    return this.updateAmenity(amenityId, { status: 'ARCHIVED', available: false }, staff, 'Archived amenity');
  }

  restoreAmenityVersion(amenityId, targetVersion, staff = null) {
    this.checkPermissionOrThrow('MANAGE_AMENITIES', staff);
    const existing = (this.state.amenities || []).find(a => a.id === amenityId);
    if (!existing) throw new Error(`Amenity ${amenityId} not found.`);
    
    let targetSnapshot = null;
    for (const v of (existing.versionHistory || [])) {
      if (v.previousSnapshot && v.previousSnapshot.version === targetVersion) {
        targetSnapshot = v.previousSnapshot;
        break;
      }
      if (v.newSnapshot && v.newSnapshot.version === targetVersion) {
        targetSnapshot = v.newSnapshot;
        break;
      }
      if (v.version === targetVersion) {
        targetSnapshot = v.previousSnapshot || v.newSnapshot;
        break;
      }
    }

    if (!targetSnapshot) throw new Error(`Version ${targetVersion} not found for amenity ${amenityId}.`);

    return this.updateAmenity(amenityId, targetSnapshot, staff, `Restored amenity to Version #${targetVersion}`);
  }

  deleteAmenity(amenityId, staff = null) {
    this.checkPermissionOrThrow('MANAGE_AMENITIES', staff);
    const actor = staff || this.getActiveStaff();
    const existing = (this.state.amenities || []).find(a => a.id === amenityId);
    if (!existing) return;

    this.setState(s => ({
      ...s,
      amenities: (s.amenities || []).filter(a => a.id !== amenityId)
    }));

    this.addAudit('AMENITY_DELETED', `${existing.name} (${amenityId})`, 'Deleted amenity listing', actor.name, 'Amenities', existing, null, 'Administrative deletion');
  }

  // --- BREAKFAST CONFIGURATION ---
  updateBreakfastConfig(configPatch, staff = null, reason = 'Breakfast config updated') {
    this.checkPermissionOrThrow('MANAGE_BREAKFAST', staff);
    const actor = staff || this.getActiveStaff();
    const existing = this.state.breakfastConfig || {};
    const versionEntry = this.recordContentVersion('BREAKFAST_CONFIG', 'CONF-BREAKFAST', existing.serviceName || 'Breakfast Service', existing, { ...existing, ...configPatch }, actor.name, actor.adminRole, reason);

    const updatedConfig = {
      ...existing,
      ...configPatch,
      version: versionEntry.version,
      versionHistory: [versionEntry, ...(existing.versionHistory || [])]
    };

    this.setState(s => ({
      ...s,
      breakfastConfig: updatedConfig
    }));

    this.addAudit('BREAKFAST_CONFIG_UPDATED', 'Breakfast Service', `Updated serving window: ${updatedConfig.servingFrom} - ${updatedConfig.servingUntil} (₦${updatedConfig.standardPrice})`, actor.name, 'Breakfast Management', existing, updatedConfig, reason, versionEntry.version);
    return updatedConfig;
  }

  // --- SERVICE OPTIONS MANAGEMENT (PORTER & HOUSEKEEPING) ---
  updateServiceOptions(serviceType, optionsPatch, staff = null, reason = 'Service options updated') {
    this.checkPermissionOrThrow('MANAGE_SERVICES', staff);
    const actor = staff || this.getActiveStaff();
    const currentServices = this.state.serviceOptions || {};
    const existingSection = currentServices[serviceType] || {};

    const updatedSection = {
      ...existingSection,
      ...optionsPatch
    };

    this.setState(s => ({
      ...s,
      serviceOptions: {
        ...(s.serviceOptions || {}),
        [serviceType]: updatedSection
      }
    }));

    this.addAudit('SERVICE_OPTIONS_UPDATED', `Service: ${serviceType.toUpperCase()}`, `Updated service options for ${serviceType}. Reason: ${reason}`, actor.name, 'Service Options', existingSection, updatedSection, reason);
    return updatedSection;
  }

  // --- MEDIA LIBRARY MANAGEMENT ---
  addMediaAsset(assetData, staff = null) {
    this.checkPermissionOrThrow('MANAGE_MEDIA', staff);
    const actor = staff || this.getActiveStaff();
    const newId = `MED-${String((this.state.mediaLibrary || []).length + 1).padStart(2, '0')}`;
    const newAsset = {
      id: newId,
      title: assetData.title || assetData.fileName || 'Untitled Asset',
      fileName: assetData.fileName || 'asset.jpg',
      fileType: assetData.fileType || 'image/jpeg',
      fileSize: assetData.fileSize || '150 KB',
      dimensions: assetData.dimensions || '1200x800',
      url: assetData.url,
      category: assetData.category || 'General',
      uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      uploadedBy: actor.name ? `${actor.name} (${actor.role || actor.adminRole})` : 'Authorized Admin',
      usedInCount: 0
    };

    this.setState(s => ({
      ...s,
      mediaLibrary: [newAsset, ...(s.mediaLibrary || [])]
    }));

    this.addAudit('MEDIA_ASSET_UPLOADED', `${newAsset.title} (${newAsset.id})`, `Uploaded new media asset: ${newAsset.fileName} (${newAsset.fileSize})`, actor.name, 'Media Library', null, newAsset, 'Asset uploaded');
    return newAsset;
  }

  deleteMediaAsset(mediaId, staff = null) {
    this.checkPermissionOrThrow('MANAGE_MEDIA', staff);
    const actor = staff || this.getActiveStaff();
    const existing = (this.state.mediaLibrary || []).find(m => m.id === mediaId);
    if (!existing) return;

    this.setState(s => ({
      ...s,
      mediaLibrary: (s.mediaLibrary || []).filter(m => m.id !== mediaId)
    }));

    this.addAudit('MEDIA_ASSET_DELETED', `${existing.title} (${mediaId})`, `Deleted media asset from library`, actor.name, 'Media Library', existing, null, 'Asset deleted');
  }

  // --- LAGOS ZONAL TRANSPORT PRICING MANAGEMENT ---
  updateZonePricing(zoneId, newBaseFare, estimatedMinutes, staff = null, reason = 'Zone pricing update') {
    this.checkPermissionOrThrow('MANAGE_TRANSPORT_PRICING', staff);
    const actor = staff || this.getActiveStaff();
    const existing = this.state.lagosZones.find(z => z.id === zoneId);
    if (!existing) throw new Error(`Zone ${zoneId} not found.`);

    const patch = {
      baseFare: Number(newBaseFare),
      ...(estimatedMinutes !== undefined ? { estimatedMinutes: Number(estimatedMinutes) } : {})
    };

    this.setState(s => ({
      ...s,
      lagosZones: s.lagosZones.map(z => z.id === zoneId ? { ...z, ...patch } : z)
    }));

    this.addAudit('TRANSPORT_FARE_CHANGED', `Zone ${zoneId} (${existing.name})`, `Fare updated: ₦${existing.baseFare.toLocaleString()} → ₦${Number(newBaseFare).toLocaleString()}`, actor.name, 'Transportation Management', { baseFare: existing.baseFare }, patch, reason);
  }

  updateVehicleClass(vehicleId, patchData, staff = null, reason = 'Vehicle pricing update') {
    this.checkPermissionOrThrow('MANAGE_TRANSPORT_PRICING', staff);
    const actor = staff || this.getActiveStaff();
    const existing = this.state.vehicleClasses.find(v => v.id === vehicleId);
    if (!existing) throw new Error(`Vehicle class ${vehicleId} not found.`);

    this.setState(s => ({
      ...s,
      vehicleClasses: s.vehicleClasses.map(v => v.id === vehicleId ? { ...v, ...patchData } : v)
    }));

    this.addAudit('VEHICLE_CLASS_UPDATED', `${existing.name} (${vehicleId})`, `Updated vehicle rate parameters. Reason: ${reason}`, actor.name, 'Transportation Management', existing, patchData, reason);
  }

  // --- STAFF DIRECTORY & RBAC MANAGEMENT ---
  addStaffMember(staffData, staff = null) {
    this.checkPermissionOrThrow('MANAGE_STAFF', staff);
    const actor = staff || this.getActiveStaff();
    const newId = `STF-${String(this.state.staffMembers.length + 1).padStart(2, '0')}`;
    const newStaff = {
      id: newId,
      name: staffData.name,
      role: staffData.role || 'Hotel Staff',
      adminRole: staffData.adminRole || 'FRONT_DESK',
      department: staffData.department || 'concierge',
      active: staffData.active ?? true,
      shift: staffData.shift || 'Morning (08:00 - 16:30)',
      clockedIn: false,
      clockInTime: null,
      clockStatus: 'Scheduled',
      avatar: staffData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      performanceScore: 90,
      tasksCompleted: 0,
      totalTasks: 0,
      onTimeRate: '100%',
      feedback: 'New Staff',
      aiNotes: 'Newly onboarded to Hotel Capitol operations.'
    };

    this.setState(s => ({
      ...s,
      staffMembers: [...s.staffMembers, newStaff]
    }));

    this.addAudit('STAFF_MEMBER_CREATED', `${newStaff.name} (${newStaff.id})`, `Created staff account: ${newStaff.role} [Role: ${newStaff.adminRole}]`, actor.name, 'Staff Directory', null, newStaff, 'Onboarded staff');
    return newStaff;
  }

  updateStaffMember(staffId, patchData, staff = null) {
    this.checkPermissionOrThrow('MANAGE_STAFF', staff);
    const actor = staff || this.getActiveStaff();
    const existing = this.state.staffMembers.find(s => s.id === staffId);
    if (!existing) throw new Error(`Staff member ${staffId} not found.`);

    const updated = { ...existing, ...patchData };

    this.setState(s => ({
      ...s,
      staffMembers: s.staffMembers.map(st => st.id === staffId ? updated : st)
    }));

    this.addAudit('STAFF_MEMBER_UPDATED', `${updated.name} (${staffId})`, `Updated staff profile and credentials`, actor.name, 'Staff Directory', existing, updated, 'Staff update');
    return updated;
  }

  toggleStaffStatus(staffId, staff = null) {
    this.checkPermissionOrThrow('MANAGE_STAFF', staff);
    const existing = this.state.staffMembers.find(s => s.id === staffId);
    if (!existing) return;
    const nextStatus = !existing.active;
    return this.updateStaffMember(staffId, { active: nextStatus }, staff);
  }

  assignStaffRole(staffId, newAdminRole, staff = null) {
    this.checkPermissionOrThrow('MANAGE_STAFF', staff);
    const actor = staff || this.getActiveStaff();
    const existing = this.state.staffMembers.find(s => s.id === staffId);
    if (!existing) return;

    const prevRole = existing.adminRole;
    this.updateStaffMember(staffId, { adminRole: newAdminRole }, staff);
    this.addAudit('STAFF_ROLE_CHANGED', `${existing.name} (${staffId})`, `Assigned RBAC role: ${prevRole} → ${newAdminRole}`, actor.name, 'Staff Directory', { role: prevRole }, { role: newAdminRole }, 'Role reassignment');
  }

  updatePricingConfig(newConfig) {
    this.setState(s => ({
      ...s,
      pricingConfig: { ...(s.pricingConfig || {}), ...newConfig }
    }));
    this.addAudit('Transportation Pricing Updated', 'Management Action', 'Modified base rates/surcharges.');
  }
}

export const store = new StateStore();
if (typeof window !== 'undefined') {
  window.hotelCapitolStore = store;
}


