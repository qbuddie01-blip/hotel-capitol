/**
 * HOTEL CAPITOL — CENTRAL REACTIVE STATE STORE & DEMO DATA
 * 6 Animashaun Close, Ikeja, Lagos
 */

const STORAGE_KEY = 'HOTEL_CAPITOL_STATE_V5';

// Initial seed demo state
const defaultState = {
  hotel: {
    name: 'Hotel Capitol',
    tagline: 'Experience Hotel Capitol, Smarter.',
    subTagline: 'Your stay, your services, your requests — powered by Hotel Capitol AI.',
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
        { id: 'C-1', sender: 'ai', time: '12:30 PM', text: 'Good day, Chief Adeleke. Welcome to Hotel Capitol. I am Amara, your personal Hotel Capitol concierge. It is my pleasure to assist you. How may I make your stay more comfortable today?' }
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
        { id: 'C-2', sender: 'ai', time: '08:00 AM', text: 'Good morning, Mrs. Davies. I am Amara, your personal Hotel Capitol concierge. Your complimentary breakfast is scheduled for 8:00 AM. Please let me know if there is anything else I may arrange for your stay.' }
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
      image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: true,
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
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: true,
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
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: true,
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
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: false,
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
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: true,
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
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: true,
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
      image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: true,
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
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: true,
      addons: []
    },
    {
      id: 'M-09',
      category: 'Drinks',
      name: 'Moët & Chandon Brut Impérial (750ml)',
      desc: 'Classic French Champagne with vibrant apple and citrus notes, fine bubbles, and elegant finish. Chilled in silver ice bucket.',
      price: 95000,
      prepTimeMinutes: 10,
      image: 'https://images.unsplash.com/photo-1584225064785-c62a8b43d148?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: false,
      addons: []
    },
    {
      id: 'M-10',
      category: 'Breakfast',
      name: 'The English Royal Breakfast',
      desc: 'Two farm eggs any style, Cumberland beef sausages, grilled beef bacon, baked beans, sautéed mushrooms, grilled herb tomato, golden hash browns, and toasted sourdough.',
      price: 8500,
      prepTimeMinutes: 20,
      image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: true,
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
      image: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: true,
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
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: true,
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
      image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
      available: true,
      popular: true,
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

  transportOptions: [
    {
      id: 'TR-01',
      destination: 'Murtala Muhammed Int\'l Airport (MMA2 / Terminal 1)',
      distanceEst: '15 - 20 mins',
      vehicles: [
        { type: 'Luxury Executive Sedan (Mercedes / Lexus ES)', price: 25000, seats: 3 },
        { type: 'VIP Armored SUV (Prado / GX460)', price: 45000, seats: 4 }
      ]
    },
    {
      id: 'TR-02',
      destination: 'Victoria Island / Ikoyi Business District',
      distanceEst: '35 - 55 mins',
      vehicles: [
        { type: 'Luxury Executive Sedan', price: 35000, seats: 3 },
        { type: 'VIP Executive SUV', price: 55000, seats: 4 }
      ]
    },
    {
      id: 'TR-03',
      destination: 'Ikeja City Mall (ICM) & Alausa Secretariat',
      distanceEst: '8 - 12 mins',
      vehicles: [
        { type: 'Standard Premium Sedan', price: 8000, seats: 3 },
        { type: 'Luxury Executive SUV', price: 15000, seats: 4 }
      ]
    },
    {
      id: 'TR-04',
      destination: 'Lekki Phase 1 & Admiralty Way',
      distanceEst: '45 - 65 mins',
      vehicles: [
        { type: 'Luxury Executive Sedan', price: 40000, seats: 3 },
        { type: 'VIP Executive SUV', price: 65000, seats: 4 }
      ]
    }
  ],

  transportBookings: [
    {
      id: 'TBK-101',
      guestId: 'GUEST-402',
      guestName: 'Chief Adeleke Babalola',
      roomNumber: '402',
      destination: 'Murtala Muhammed Int\'l Airport (MMA2)',
      pickupTime: '2026-08-18 11:30 AM',
      vehicle: 'Luxury Executive Sedan',
      passengers: 2,
      price: 25000,
      paymentStatus: 'PAYMENT SUCCESS', // 'PENDING' | 'PAYMENT SUCCESS' | 'PAYMENT FAILED'
      status: 'CONFIRMED'
    }
  ],

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
      department: 'housekeeping',
      shift: 'Morning (07:00 - 15:30)',
      clockedIn: true,
      clockInTime: '06:52 AM',
      clockStatus: 'On Time',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
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
      department: 'kitchen',
      shift: 'Morning (06:00 - 14:30)',
      clockedIn: true,
      clockInTime: '05:50 AM',
      clockStatus: 'On Time',
      avatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=200&q=80',
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
      department: 'concierge',
      shift: 'Morning (08:00 - 16:30)',
      clockedIn: true,
      clockInTime: '07:55 AM',
      clockStatus: 'On Time',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
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
      department: 'management',
      shift: 'Full Day (08:00 - 18:00)',
      clockedIn: true,
      clockInTime: '07:45 AM',
      clockStatus: 'On Time',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
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
      department: 'management',
      shift: 'Executive (08:00 - 19:00)',
      clockedIn: true,
      clockInTime: '07:30 AM',
      clockStatus: 'On Time',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
      performanceScore: 98,
      tasksCompleted: 85,
      totalTasks: 85,
      onTimeRate: '100%',
      feedback: 'Outstanding',
      aiNotes: 'High leadership oversight; approved 3 supplier purchase orders on time.'
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      if (this.bc) {
        this.bc.postMessage({ type: 'STATE_UPDATED', state: this.state });
      }
    } catch (e) {
      console.warn('Could not save state to localStorage:', e);
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

  addAudit(action, entity, details, actor = null) {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const date = new Date().toISOString().split('T')[0];
    const newEntry = {
      id: 'AUD-' + Date.now().toString().slice(-4),
      timestamp: `${date} ${time}`,
      actor: actor || (this.state.activeRole === 'guest' ? `Guest in Suite ${this.getActiveGuest()?.roomNumber || '402'}` : 'Staff/Supervisor'),
      action,
      entity,
      details
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

  // Add Restaurant Order
  createOrder(orderData) {
    const orderId = 'ORD-' + (this.state.orders.length + 101);
    const guest = this.getActiveGuest();
    const newOrder = {
      id: orderId,
      guestId: guest.id,
      guestName: guest.name,
      roomNumber: guest.roomNumber,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      status: 'PENDING',
      createdAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      estimatedMinutes: orderData.estimatedMinutes || 25,
      elapsedMinutes: 0,
      fiveMinWarningTriggered: false,
      assignedStaff: 'Chef Babatunde Adele',
      roomDeliveryStaff: 'Amara Nwosu'
    };

    // Add to folio
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

  // Update order status
  updateOrderStatus(orderId, nextStatus) {
    this.setState(s => ({
      ...s,
      orders: s.orders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o)
    }));
    this.addAudit('Order Status Transition', orderId, `Status updated to ${nextStatus}`);
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
}

export const store = new StateStore();
window.hotelCapitolStore = store;
