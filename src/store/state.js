/**
 * HOTEL CAPITOL — CENTRAL REACTIVE STATE STORE & DEMO DATA
 * 6 Animashaun Close, Ikeja, Lagos
 */

export const STORAGE_KEY = 'HOTEL_CAPITOL_STATE_V15';

// Authoritative Hotel Capitol Organizational Hierarchy Definition (gemini-code-1787251907996.json)
export const ORGANIZATIONAL_HIERARCHY = {
  executive_management: [
    {
      role_id: 'ROLE_CEO_COO',
      legacy_key: 'CEO',
      title: 'Chief Executive Officer / Chief Operating Officer',
      scope_of_work: 'Overall strategic leadership, financial governance, final executive sign-off for procurements > ₦5,000,000.',
      reports_to: null,
      approval_limit_ngn: null,
      min_approval_ngn: 5000001
    },
    {
      role_id: 'ROLE_HM',
      legacy_key: 'HOTEL_MANAGER',
      title: 'Hotel General Manager',
      scope_of_work: 'Operational leadership, departmental performance, cost controls, approval threshold ₦1,000,001 to ₦5,000,000.',
      reports_to: 'ROLE_CEO_COO',
      approval_limit_ngn: 5000000,
      min_approval_ngn: 1000001
    },
    {
      role_id: 'ROLE_AM',
      legacy_key: 'ADMIN_OPERATIONS_MANAGER',
      title: 'Admin & Operations Manager',
      scope_of_work: 'Administrative administration, routine supply chain oversight, approval threshold up to ₦1,000,000.',
      reports_to: 'ROLE_HM',
      approval_limit_ngn: 1000000,
      min_approval_ngn: 0
    }
  ],
  departments: [
    {
      department_id: 'DEP_FRONT_OFFICE',
      department_name: 'Front Office & Guest Services',
      executive_supervisor_role_id: 'ROLE_HM',
      direct_supervisor: { title: 'Front Desk Supervisor', role_id: 'ROLE_SUP_FRONT_DESK' },
      line_staff_roles: ['Front Desk Agents', 'Concierge', 'Night Auditors', 'Porters'],
      core_scope_of_work: 'Guest registration, concierge services, PMS maintenance, reservation lifecycle, front desk billing.'
    },
    {
      department_id: 'DEP_HOUSEKEEPING',
      department_name: 'Housekeeping & Laundry',
      executive_supervisor_role_id: 'ROLE_HM',
      direct_supervisor: { title: 'Executive Housekeeper', role_id: 'ROLE_SUP_HOUSEKEEPING' },
      line_staff_roles: ['Room Attendants', 'Public Area Cleaners', 'Laundry Staff'],
      core_scope_of_work: 'Room hygiene, linen turnaround, public sanitation, housekeeping supply logging.'
    },
    {
      department_id: 'DEP_FNB',
      department_name: 'Food & Beverage',
      executive_supervisor_role_id: 'ROLE_HM',
      direct_supervisor: { title: 'F&B Supervisor / Restaurant Manager', role_id: 'ROLE_SUP_FNB' },
      line_staff_roles: ['Waitstaff', 'Bartenders', 'Baristas', 'Room Service'],
      core_scope_of_work: 'Dining room service, beverage dispensing, banquet service, front-of-house consumables restock trigger.'
    },
    {
      department_id: 'DEP_KITCHEN',
      department_name: 'Culinary & Kitchen',
      executive_supervisor_role_id: 'ROLE_HM',
      direct_supervisor: { title: 'Executive Chef / Sous Chef', role_id: 'ROLE_SUP_CHEF' },
      line_staff_roles: ['Line Cooks', 'Prep Cooks', 'Kitchen Stewards'],
      core_scope_of_work: 'Menu production, food safety regulations, cold/dry storage monitoring, perishable usage logging.'
    },
    {
      department_id: 'DEP_PROCUREMENT',
      department_name: 'Procurement & Stores',
      executive_supervisor_role_id: 'ROLE_AM',
      direct_supervisor: { title: 'Procurement & Inventory Supervisor', role_id: 'ROLE_SUP_PROCUREMENT' },
      line_staff_roles: ['Storekeepers', 'Receiving Clerks'],
      core_scope_of_work: 'Stock physical count, receiving verification, invoice and LPO reconciliation, vendor portal coordination.'
    },
    {
      department_id: 'DEP_FINANCE',
      department_name: 'Finance & Accounts',
      executive_supervisor_role_id: 'ROLE_AM',
      direct_supervisor: { title: 'Chief Accountant', role_id: 'ROLE_SUP_ACCOUNTANT' },
      line_staff_roles: ['Accounts Payable Officer', 'Cashiers'],
      core_scope_of_work: 'Invoice 3-way match, payment disbursement, tax ledger, physical audit confirmation validation.'
    },
    {
      department_id: 'DEP_MAINTENANCE',
      department_name: 'Maintenance & Engineering',
      executive_supervisor_role_id: 'ROLE_HM',
      direct_supervisor: { title: 'Chief Engineer', role_id: 'ROLE_SUP_ENGINEER' },
      line_staff_roles: ['Maintenance Technicians', 'Electricians', 'Plumbers'],
      core_scope_of_work: 'Plant operations, HVAC maintenance, plumbing, electrical repairs, spare parts inventory control.'
    },
    {
      department_id: 'DEP_SECURITY',
      department_name: 'Security & Safety',
      executive_supervisor_role_id: 'ROLE_AM',
      direct_supervisor: { title: 'Chief Security Officer', role_id: 'ROLE_SUP_SECURITY' },
      line_staff_roles: ['Security Guards', 'CCTV Operators'],
      core_scope_of_work: 'Perimeter security, entry/exit logging, receiving gate passes, asset tracking.'
    }
  ]
};

// Authoritative Approval Matrix Configuration
export const APPROVAL_MATRIX_CONFIG = {
  stock_depletion_triggers: [
    { threshold_percentage: 30, severity: 'WARNING', target_alert_roles: ['ROLE_AM', 'ROLE_HM'] },
    { threshold_percentage: 20, severity: 'LOW', target_alert_roles: ['ROLE_AM', 'ROLE_HM'] },
    { threshold_percentage: 10, severity: 'CRITICAL', target_alert_roles: ['ROLE_AM', 'ROLE_HM'] },
    { threshold_percentage: 5, severity: 'EMERGENCY', target_alert_roles: ['ROLE_AM', 'ROLE_HM', 'ROLE_CEO_COO'] }
  ],
  financial_thresholds: [
    { tier_level: 1, approver_role_id: 'ROLE_AM', min_cost_ngn: 0, max_cost_ngn: 1000000, escalation_target_role_id: 'ROLE_HM', sla_hours: 2, title: 'Admin & Operations Manager' },
    { tier_level: 2, approver_role_id: 'ROLE_HM', min_cost_ngn: 1000001, max_cost_ngn: 5000000, escalation_target_role_id: 'ROLE_CEO_COO', sla_hours: 4, title: 'Hotel General Manager' },
    { tier_level: 3, approver_role_id: 'ROLE_CEO_COO', min_cost_ngn: 5000001, max_cost_ngn: null, escalation_target_role_id: null, sla_hours: 12, title: 'CEO / COO' }
  ]
};

// Real Role-Based Access Control Definitions
export const ADMIN_ROLES = {
  // Executive Tier
  CEO: 'ROLE_CEO_COO',
  COO: 'ROLE_CEO_COO',
  HOTEL_MANAGER: 'ROLE_HM',
  ADMIN_OPERATIONS_MANAGER: 'ROLE_AM',
  SUPER_ADMIN: 'SUPER_ADMIN',
  HOTEL_ADMIN: 'HOTEL_ADMIN',
  MANAGER: 'MANAGER',
  CONTENT_MANAGER: 'CONTENT_MANAGER',
  TRANSPORT_MANAGER: 'TRANSPORT_MANAGER',
  RESTAURANT_MANAGER: 'RESTAURANT_MANAGER',

  // Supervisory Tier
  FRONT_DESK_SUPERVISOR: 'ROLE_SUP_FRONT_DESK',
  EXECUTIVE_HOUSEKEEPER: 'ROLE_SUP_HOUSEKEEPING',
  FNB_SUPERVISOR: 'ROLE_SUP_FNB',
  EXECUTIVE_CHEF: 'ROLE_SUP_CHEF',
  SOUS_CHEF: 'ROLE_SUP_SOUS_CHEF',
  PROCUREMENT_INVENTORY_SUPERVISOR: 'ROLE_SUP_PROCUREMENT',
  CHIEF_ACCOUNTANT: 'ROLE_SUP_ACCOUNTANT',
  CHIEF_ENGINEER: 'ROLE_SUP_ENGINEER',
  MAINTENANCE_SUPERVISOR: 'ROLE_SUP_MAINTENANCE',
  CHIEF_SECURITY_OFFICER: 'ROLE_SUP_SECURITY',
  SUPERVISOR: 'SUPERVISOR',

  // Line Staff Tier
  STOREKEEPER: 'ROLE_WRK_STORE',
  RECEIVING_CLERK: 'ROLE_WRK_RECV',
  AP_OFFICER: 'ROLE_WRK_AP',
  CASHIER: 'ROLE_WRK_CASHIER',
  SECURITY_GUARD: 'ROLE_WRK_SEC_GUARD',
  CCTV_OPERATOR: 'ROLE_WRK_CCTV',
  LINE_STAFF: 'ROLE_WRK_LINE_STAFF',
  FRONT_DESK: 'FRONT_DESK',
  KITCHEN: 'KITCHEN',
  HOUSEKEEPING: 'HOUSEKEEPING',
  CONCIERGE: 'CONCIERGE',
  PORTER: 'PORTER',
  VIP_TRANSPORTATION: 'VIP_TRANSPORTATION',
  PROCUREMENT: 'PROCUREMENT',
  ACCOUNTS: 'ACCOUNTS',
  VENDOR: 'VENDOR'
};

export const ROLE_PERMISSIONS = {
  // Executive Management
  ROLE_CEO_COO: ['ALL', 'VIEW_DASHBOARD', 'APPROVE_HIGH_VALUE_PROCUREMENT', 'TERMINAL_APPROVAL', 'VIEW_AUDIT_LOGS', 'MANAGE_RBAC', 'EXPORT_AUDIT_PDF'],
  ROLE_HM: ['VIEW_DASHBOARD', 'APPROVE_MEDIUM_VALUE_PROCUREMENT', 'ESCALATE_PROCUREMENT', 'MANAGE_STAFF', 'VIEW_AUDIT_LOGS', 'MANAGE_MENU', 'EXPORT_AUDIT_PDF'],
  ROLE_AM: ['VIEW_DASHBOARD', 'APPROVE_LOW_VALUE_PROCUREMENT', 'ESCALATE_PROCUREMENT', 'REQUEST_ORDERS', 'GENERATE_LPO', 'MANAGE_PROCUREMENT', 'VIEW_AUDIT_LOGS', 'MANAGE_RBAC', 'EXPORT_AUDIT_PDF'],

  // Supervisory Roles
  ROLE_SUP_FRONT_DESK: ['VIEW_DASHBOARD', 'MANAGE_ORDERS', 'DISPATCH_TRANSPORT', 'MANAGE_INTERCOM', 'VIEW_GUESTS', 'VIEW_AUDIT_LOGS'],
  ROLE_SUP_HOUSEKEEPING: ['VIEW_DASHBOARD', 'MANAGE_ROOMS', 'MANAGE_TASKS', 'MANAGE_INTERCOM', 'REQUEST_RESTOCK', 'VIEW_AUDIT_LOGS'],
  ROLE_SUP_FNB: ['VIEW_DASHBOARD', 'MANAGE_MENU', 'PUBLISH_MENU', 'MANAGE_BREAKFAST', 'MANAGE_ORDERS', 'REQUEST_RESTOCK', 'VIEW_AUDIT_LOGS'],
  ROLE_SUP_CHEF: ['VIEW_DASHBOARD', 'MANAGE_ORDERS', 'MANAGE_BREAKFAST', 'MANAGE_INTERCOM', 'REQUEST_RESTOCK', 'VIEW_AUDIT_LOGS'],
  ROLE_SUP_SOUS_CHEF: ['VIEW_DASHBOARD', 'MANAGE_ORDERS', 'MANAGE_BREAKFAST', 'MANAGE_INTERCOM', 'REQUEST_RESTOCK'],
  ROLE_SUP_PROCUREMENT: ['VIEW_DASHBOARD', 'MANAGE_PROCUREMENT', 'ONBOARD_VENDORS', 'APPROVE_VENDORS', 'MANAGE_SUPPLIERS', 'VERIFY_INVOICES', 'CONFIRM_RECEIPT', 'VIEW_AUDIT_LOGS', 'MANAGE_INVENTORY', 'EXPORT_AUDIT_PDF'],
  ROLE_SUP_ACCOUNTANT: ['VIEW_DASHBOARD', 'MANAGE_ACCOUNTS', 'APPROVE_PAYMENTS', 'CONFIRM_PAYMENTS', 'RELEASE_PAYMENT', 'VIEW_PAYMENT_HISTORY', 'VIEW_AUDIT_LOGS', 'EXPORT_AUDIT_PDF'],
  ROLE_SUP_ENGINEER: ['VIEW_DASHBOARD', 'MANAGE_SERVICES', 'REQUEST_RESTOCK', 'VIEW_AUDIT_LOGS'],
  ROLE_SUP_MAINTENANCE: ['VIEW_DASHBOARD', 'MANAGE_SERVICES', 'REQUEST_RESTOCK'],
  ROLE_SUP_SECURITY: ['VIEW_DASHBOARD', 'MANAGE_SECURITY', 'LOG_GATE_RECEIVING', 'VIEW_AUDIT_LOGS'],

  // Line Staff Roles
  ROLE_WRK_STORE: ['VIEW_DASHBOARD', 'MANAGE_INVENTORY', 'COUNT_STOCK', 'INSPECT_DELIVERIES', 'CONFIRM_RECEIPT'],
  ROLE_WRK_RECV: ['VIEW_DASHBOARD', 'INSPECT_DELIVERIES', 'LOG_WAYBILL', 'CONFIRM_RECEIPT'],
  ROLE_WRK_AP: ['VIEW_DASHBOARD', 'MANAGE_ACCOUNTS', 'QUEUE_PAYMENT', 'RELEASE_PAYMENT', 'VIEW_PAYMENT_HISTORY'],
  ROLE_WRK_CASHIER: ['VIEW_DASHBOARD', 'RECORD_SETTLEMENT'],
  ROLE_WRK_SEC_GUARD: ['VIEW_DASHBOARD', 'GATE_ENTRY_PASS', 'LOG_GATE_RECEIVING'],
  ROLE_WRK_CCTV: ['VIEW_DASHBOARD', 'PERIMETER_MONITORING'],
  ROLE_WRK_LINE_STAFF: ['VIEW_DASHBOARD', 'MANAGE_TASKS'],

  // Backward Compatible Existing Roles
  SUPER_ADMIN: ['ALL'],
  HOTEL_ADMIN: [
    'VIEW_DASHBOARD', 'MANAGE_MENU', 'PUBLISH_MENU', 'MANAGE_BREAKFAST', 'MANAGE_AMENITIES',
    'MANAGE_MEDIA', 'MANAGE_SERVICES', 'MANAGE_TRANSPORT_PRICING', 'DISPATCH_TRANSPORT',
    'APPROVE_TOLANI_LEARNING', 'ROLLBACK_TOLANI_LEARNING', 'MANAGE_STAFF', 'VIEW_AUDIT_LOGS',
    'MANAGE_SETTINGS', 'MANAGE_PROCUREMENT', 'MANAGE_ACCOUNTS', 'MANAGE_RBAC', 'EXPORT_AUDIT_PDF'
  ],
  MANAGER: [
    'VIEW_DASHBOARD', 'MANAGE_MENU', 'PUBLISH_MENU', 'MANAGE_BREAKFAST', 'MANAGE_AMENITIES',
    'MANAGE_MEDIA', 'MANAGE_SERVICES', 'MANAGE_TRANSPORT_PRICING', 'DISPATCH_TRANSPORT',
    'MANAGE_STAFF', 'VIEW_AUDIT_LOGS', 'MANAGE_PROCUREMENT', 'APPROVE_INVOICES', 'EXPORT_AUDIT_PDF'
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
  SUPERVISOR: [
    'VIEW_DASHBOARD', 'MANAGE_STAFF', 'APPROVE_SWAPS', 'VIEW_KPIS', 'VIEW_REPORTS', 'VIEW_AUDIT_LOGS', 'MANAGE_INTERCOM'
  ],
  FRONT_DESK: [
    'VIEW_DASHBOARD', 'MANAGE_ORDERS', 'DISPATCH_TRANSPORT', 'MANAGE_INTERCOM', 'VIEW_GUESTS'
  ],
  KITCHEN: [
    'VIEW_DASHBOARD', 'MANAGE_ORDERS', 'MANAGE_BREAKFAST', 'MANAGE_INTERCOM'
  ],
  HOUSEKEEPING: [
    'VIEW_DASHBOARD', 'MANAGE_ROOMS', 'MANAGE_TASKS', 'MANAGE_INTERCOM'
  ],
  CONCIERGE: [
    'VIEW_DASHBOARD', 'MANAGE_SERVICES', 'MANAGE_INTERCOM', 'VIEW_NEARBY'
  ],
  PORTER: [
    'VIEW_DASHBOARD', 'MANAGE_TASKS', 'MANAGE_INTERCOM'
  ],
  VIP_TRANSPORTATION: [
    'VIEW_DASHBOARD', 'DISPATCH_TRANSPORT', 'MANAGE_INTERCOM'
  ],
  PROCUREMENT: [
    'VIEW_DASHBOARD', 'MANAGE_PROCUREMENT', 'ONBOARD_VENDORS', 'APPROVE_VENDORS', 'MANAGE_SUPPLIERS', 'REQUEST_ORDERS', 'APPROVE_INVOICES', 'CONFIRM_RECEIPT', 'VIEW_AUDIT_LOGS', 'EXPORT_AUDIT_PDF'
  ],
  ACCOUNTS: [
    'VIEW_DASHBOARD', 'MANAGE_ACCOUNTS', 'APPROVE_PAYMENTS', 'CONFIRM_PAYMENTS', 'RELEASE_PAYMENT', 'VIEW_PAYMENT_HISTORY', 'VIEW_AUDIT_LOGS', 'EXPORT_AUDIT_PDF'
  ],
  VENDOR: [
    'VIEW_VENDOR_PORTAL', 'GENERATE_INVOICE', 'CONFIRM_ORDER', 'UPDATE_DELIVERY_PROGRESS', 'CONFIRM_PAYMENT_RECEIVED', 'GENERATE_RECEIPT', 'UPDATE_PRICE'
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
      id: 'AMN-02',
      name: 'Executive Fitness Centre & Gym',
      category: 'Health & Fitness',
      description: 'State-of-the-art cardiovascular machines, Olympic free weights, resistance cables, and certified personal trainers.',
      openingHours: '24 Hours Daily (Keycard Access)',
      location: '2nd Floor West Wing',
      rules: 'Athletic footwear required. Wipe down equipment after use. Personal training upon booking.',
      guestInstructions: 'Complimentary chilled water and fresh sweat towels available in gym foyer.',
      contact: 'Ext 204 / Fitness Desk',
      image: './src/assets/amenity-fitness-gym.jpg',
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
      image: './src/assets/amenity-wifi-services.jpg',
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
      image: './src/assets/amenity-laundry-service.jpg',
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
      url: './src/assets/amenity-fitness-gym.jpg',
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
      avatar: './src/assets/housekeeping-amara.jpg',
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
      avatar: './src/assets/executive-chef-babatunde.jpg',
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
      avatar: './src/assets/transport-manager-bello.jpg',
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
      avatar: './src/assets/supervisor-tariq.jpg',
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
      avatar: './src/assets/general-manager-seyi.jpg',
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
      avatar: './src/assets/content-manager-chidinma.jpg',
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
      sku: 'RICE-PAR-50KG',
      category: 'Kitchen',
      departmentId: 'DEP_KITCHEN',
      name: 'Premium Long Grain Rice (50kg Bag)',
      quantity: 4,
      unit: 'bags',
      maxCapacity: 15,
      reorderThreshold: 5,
      criticalThreshold: 2,
      supplier: 'Lagos Farm Fresh Produce',
      supplierCode: 'LFF-002',
      unitCost: 78000,
      dailyConsumptionRate: 0.5,
      status: 'LOW STOCK' // 4/15 = 26.6% -> LOW STOCK (<=30% Warning)
    },
    {
      id: 'INV-02',
      sku: 'OIL-VEG-25L',
      category: 'Kitchen',
      departmentId: 'DEP_KITCHEN',
      name: 'Pure Vegetable Cooking Oil (25L Canister)',
      quantity: 2,
      unit: 'canisters',
      maxCapacity: 10,
      reorderThreshold: 3,
      criticalThreshold: 1,
      supplier: 'Lagos Farm Fresh Produce',
      supplierCode: 'LFF-002',
      unitCost: 45000,
      dailyConsumptionRate: 0.8,
      status: 'VERY LOW' // 2/10 = 20% -> VERY LOW (<=20% Low)
    },
    {
      id: 'INV-03',
      sku: 'TOWEL-LUX-WHT',
      category: 'Housekeeping',
      departmentId: 'DEP_HOUSEKEEPING',
      name: 'Capitol Egyptian Cotton Bath Towels (White)',
      quantity: 18,
      unit: 'pieces',
      maxCapacity: 100,
      reorderThreshold: 30,
      criticalThreshold: 10,
      supplier: 'Capitol Linen & Amenities Supplies',
      supplierCode: 'CLA-003',
      unitCost: 15000,
      dailyConsumptionRate: 6.0,
      status: 'VERY LOW' // 18/100 = 18% -> VERY LOW (<=20% Low)
    },
    {
      id: 'INV-04',
      sku: 'TOIL-BOT-KIT',
      category: 'Toiletries',
      departmentId: 'DEP_HOUSEKEEPING',
      name: 'Luxury Botanical Toiletry Kits (Bottles)',
      quantity: 34,
      unit: 'sets',
      maxCapacity: 200,
      reorderThreshold: 60,
      criticalThreshold: 20,
      supplier: 'Capitol Linen & Amenities Supplies',
      supplierCode: 'CLA-003',
      unitCost: 3500,
      dailyConsumptionRate: 15.0,
      status: 'VERY LOW' // 34/200 = 17% -> VERY LOW (<=20% Low)
    },
    {
      id: 'INV-05',
      sku: 'INSECT-HD-CAN',
      category: 'Housekeeping',
      departmentId: 'DEP_HOUSEKEEPING',
      name: 'Heavy-Duty Room Insecticide & Sanitizer Spray',
      quantity: 3,
      unit: 'cans',
      maxCapacity: 40,
      reorderThreshold: 12,
      criticalThreshold: 4,
      supplier: 'Capitol Linen & Amenities Supplies',
      supplierCode: 'CLA-003',
      unitCost: 6500,
      dailyConsumptionRate: 2.0,
      status: 'CRITICAL' // 3/40 = 7.5% -> CRITICAL (<=10% Critical)
    },
    {
      id: 'INV-06',
      sku: 'PRW-ATL-JUM',
      category: 'Restaurant',
      departmentId: 'DEP_FNB',
      name: 'Fresh Jumbo Atlantic Tiger Prawns',
      quantity: 14,
      unit: 'kg',
      maxCapacity: 20,
      reorderThreshold: 6,
      criticalThreshold: 2,
      supplier: 'Ikeja Prime Poultry & Seafood',
      supplierCode: 'IPP-004',
      unitCost: 16000,
      dailyConsumptionRate: 3.0,
      status: 'NORMAL' // 14/20 = 70%
    },
    {
      id: 'INV-07',
      sku: 'WINE-MOET-750',
      category: 'Bar',
      departmentId: 'DEP_FNB',
      name: 'Moët & Chandon Brut Champagne (750ml)',
      quantity: 12,
      unit: 'bottles',
      maxCapacity: 18,
      reorderThreshold: 5,
      criticalThreshold: 2,
      supplier: 'ABC Foods Limited',
      supplierCode: 'ABC-001',
      unitCost: 68000,
      dailyConsumptionRate: 1.5,
      status: 'NORMAL'
    },
    {
      id: 'INV-08',
      sku: 'GEN-DIESEL-ENG',
      category: 'Maintenance',
      departmentId: 'DEP_MAINTENANCE',
      name: 'Standby Power Generator Heavy Overhaul & Fuel Reserves',
      quantity: 1,
      unit: 'service sets',
      maxCapacity: 10,
      reorderThreshold: 3,
      criticalThreshold: 1,
      supplier: 'ABC Foods Limited',
      supplierCode: 'ABC-001',
      unitCost: 750000,
      dailyConsumptionRate: 0.1,
      status: 'CRITICAL' // 1/10 = 10% (Critical)
    }
  ],

  procurementRequisitions: [
    {
      id: 'REQ-2026-001',
      itemId: 'INV-02',
      sku: 'OIL-VEG-25L',
      itemName: 'Pure Vegetable Cooking Oil (25L Canister)',
      departmentId: 'DEP_KITCHEN',
      departmentName: 'Culinary & Kitchen',
      currentStock: 2,
      maxCapacity: 10,
      depletionPercentage: 20,
      severity: 'LOW',
      reorderQuantity: 8,
      unitPrice: 45000,
      estimatedCost: 360000, // 8 * 45,000 = ₦360,000 (Tier 1: Admin Manager)
      approverRoleId: 'ROLE_AM',
      assignedApproverTitle: 'Admin & Operations Manager',
      tierLevel: 1,
      slaHours: 2,
      approvalStartedAt: '2026-08-20 09:30 AM',
      approvalDeadline: '2026-08-20 11:30 AM',
      preferredVendorId: 'SUP-02',
      preferredVendorCode: 'LFF-002',
      preferredVendorName: 'Lagos Farm Fresh Produce',
      status: 'PENDING_APPROVAL',
      deliveryLocation: 'Hotel Capitol Main Kitchen Loading Bay',
      requiredEta: '2026-08-22',
      approvalHistory: [],
      lpo: null,
      invoice: null,
      delivery: {
        milestone: 'NOT_STARTED',
        history: []
      },
      receiving: null,
      payment: null,
      auditPdf: null
    },
    {
      id: 'REQ-2026-002',
      itemId: 'INV-03',
      sku: 'TOWEL-LUX-WHT',
      itemName: 'Capitol Egyptian Cotton Bath Towels (White)',
      departmentId: 'DEP_HOUSEKEEPING',
      departmentName: 'Housekeeping & Laundry',
      currentStock: 18,
      maxCapacity: 100,
      depletionPercentage: 18,
      severity: 'LOW',
      reorderQuantity: 82,
      unitPrice: 15000,
      estimatedCost: 1230000, // 82 * 15,000 = ₦1,230,000 (Tier 2: Hotel Manager, escalated from AM)
      approverRoleId: 'ROLE_HM',
      assignedApproverTitle: 'Hotel General Manager',
      tierLevel: 2,
      slaHours: 4,
      approvalStartedAt: '2026-08-20 08:45 AM',
      approvalDeadline: '2026-08-20 12:45 PM',
      preferredVendorId: 'SUP-03',
      preferredVendorCode: 'CLA-003',
      preferredVendorName: 'Capitol Linen & Amenities Supplies',
      status: 'ESCALATED_TO_HM',
      deliveryLocation: 'Hotel Capitol Central Linen Stores',
      requiredEta: '2026-08-23',
      approvalHistory: [
        { step: 'ESCALATION_EVALUATION', actor: 'System AI Monitor', role: 'AI_AGENT', decision: 'ESCALATED_TO_HM', timestamp: '2026-08-20 08:45 AM', notes: 'Estimated procurement cost (₦1,230,000) exceeds Admin Manager limit (₦1,000,000). Escalated to Hotel General Manager.' }
      ],
      lpo: null,
      invoice: null,
      delivery: {
        milestone: 'NOT_STARTED',
        history: []
      },
      receiving: null,
      payment: null,
      auditPdf: null
    },
    {
      id: 'REQ-2026-003',
      itemId: 'INV-08',
      sku: 'GEN-DIESEL-ENG',
      itemName: 'Standby Power Generator Heavy Overhaul & Fuel Reserves',
      departmentId: 'DEP_MAINTENANCE',
      departmentName: 'Maintenance & Engineering',
      currentStock: 1,
      maxCapacity: 10,
      depletionPercentage: 10,
      severity: 'CRITICAL',
      reorderQuantity: 9,
      unitPrice: 750000,
      estimatedCost: 6750000, // ₦6,750,000 (Tier 3: CEO / COO Terminal Approval)
      approverRoleId: 'ROLE_CEO_COO',
      assignedApproverTitle: 'CEO / COO',
      tierLevel: 3,
      slaHours: 12,
      approvalStartedAt: '2026-08-20 07:15 AM',
      approvalDeadline: '2026-08-20 07:15 PM',
      preferredVendorId: 'SUP-01',
      preferredVendorCode: 'ABC-001',
      preferredVendorName: 'ABC Foods Limited',
      status: 'ESCALATED_TO_CEO',
      deliveryLocation: 'Hotel Capitol Utility Bay & Power Plant',
      requiredEta: '2026-08-25',
      approvalHistory: [
        { step: 'ESCALATION_EVALUATION', actor: 'System AI Monitor', role: 'AI_AGENT', decision: 'ESCALATED_TO_CEO', timestamp: '2026-08-20 07:15 AM', notes: 'Estimated cost (₦6,750,000) exceeds ₦5,000,000. Executive CEO/COO terminal approval required.' }
      ],
      lpo: null,
      invoice: null,
      delivery: {
        milestone: 'NOT_STARTED',
        history: []
      },
      receiving: null,
      payment: null,
      auditPdf: null
    },
    {
      id: 'REQ-2026-004',
      itemId: 'INV-04',
      sku: 'TOIL-BOT-KIT',
      itemName: 'Luxury Botanical Toiletry Kits (Bottles)',
      departmentId: 'DEP_HOUSEKEEPING',
      departmentName: 'Housekeeping & Laundry',
      currentStock: 200,
      maxCapacity: 200,
      depletionPercentage: 100,
      severity: 'NORMAL',
      reorderQuantity: 150,
      unitPrice: 3500,
      estimatedCost: 525000,
      approverRoleId: 'ROLE_AM',
      assignedApproverTitle: 'Admin & Operations Manager',
      tierLevel: 1,
      slaHours: 2,
      approvalStartedAt: '2026-08-19 09:00 AM',
      approvalDeadline: '2026-08-19 11:00 AM',
      preferredVendorId: 'SUP-03',
      preferredVendorCode: 'CLA-003',
      preferredVendorName: 'Capitol Linen & Amenities Supplies',
      status: 'AUDIT_CLOSED',
      deliveryLocation: 'Hotel Capitol Housekeeping Central Depot',
      requiredEta: '2026-08-20',
      approvalHistory: [
        { step: 'APPROVAL_GATEWAY', actor: 'Seyi Adeyemi (AM)', role: 'ROLE_AM', decision: 'APPROVED', timestamp: '2026-08-19 09:40 AM', notes: 'Approved within ₦1M standard limit.' }
      ],
      lpo: {
        lpoNumber: 'LPO-CAPITOL-2026-0038',
        generatedAt: '2026-08-19 09:45 AM',
        dispatchedAt: '2026-08-19 10:00 AM',
        requestedBy: 'Seyi Adeyemi (Admin Manager)',
        sku: 'TOIL-BOT-KIT',
        quantity: 150,
        unitPrice: 3500,
        estimatedTotal: 525000,
        requiredEta: '2026-08-20',
        vendorContact: 'Mrs. Chidinma Eze (+234 803 776 2201)'
      },
      invoice: {
        invoiceNumber: 'INV-CLA-2026-092',
        generatedAt: '2026-08-19 10:30 AM',
        totalAmount: 525000,
        status: 'VERIFIED_ROUTED_TO_AP',
        procurementVerifiedAt: '2026-08-19 11:15 AM',
        procurementVerifiedBy: 'Kunle Adeleke (Procurement Supervisor)'
      },
      delivery: {
        milestone: 'Goods Delivered',
        updatedBy: 'Dispatch Driver #3 (Capitol Logistics)',
        updatedAt: '2026-08-19 02:30 PM',
        history: [
          { status: 'Order Confirmed', time: '10:35 AM', note: 'Vendor confirmed order' },
          { status: 'Palletized', time: '11:00 AM', note: '150 sets packed & sealed' },
          { status: 'Depot Dispatched', time: '11:45 AM', note: 'Departed Oregun Industrial Estate' },
          { status: 'In Transit', time: '12:30 PM', note: 'Along Mobolaji Bank Anthony Way' },
          { status: 'Near Hotel', time: '01:50 PM', note: 'Turning onto Animashaun Close' },
          { status: 'Arrived at Gate', time: '02:15 PM', note: 'Security gate clearance granted' },
          { status: 'Goods Delivered', time: '02:30 PM', note: 'Unloaded at Housekeeping Bay' }
        ]
      },
      receiving: {
        inspectorName: 'Amara Nwosu',
        inspectorRole: 'ROLE_SUP_HOUSEKEEPING',
        waybillNumber: 'WB-CLA-2026-883',
        itemsAcceptedQuantity: 150,
        conditionStatus: 'PASSED',
        dockNotes: 'All 150 luxury botanical bottles sealed and in perfect condition.',
        confirmedAt: '2026-08-19 02:45 PM'
      },
      payment: {
        paymentRef: 'NIP-TXN-20260819-7734',
        amount: 525000,
        status: 'RELEASED',
        releasedAt: '2026-08-19 03:30 PM',
        officerName: 'Ngozi Okonjo (Chief Accountant)',
        paymentChannel: 'NIBSS Instant Payment (Zenith Bank Corporate)'
      },
      auditPdf: {
        generatedAt: '2026-08-19 03:35 PM',
        pdfDocId: 'AUD-PDF-2026-0038',
        downloadUrl: '#audit-pdf-download',
        closeoutStatus: 'CLOSED'
      }
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

  
  intercomAlerts: [
    {
      id: 'ALT-101',
      serviceType: 'BREAKFAST',
      deptName: 'Kitchen',
      deptKey: 'kitchen-fb',
      roomNumber: '402',
      guestName: 'Chief Adeleke Babalola',
      status: 'CONNECTED',
      requestedAt: '08:00 AM',
      notifiedAt: '08:00:05 AM',
      acceptedAt: '08:00:25 AM',
      responseTimeMs: 20000,
      startedAt: '08:00:30 AM',
      completedAt: '08:04:00 AM',
      durationMs: 240000,
      staffId: 'STF-02',
      staffName: 'Chef Babatunde Adele',
      conversationSummary: 'Room 402 requested The English Royal Breakfast for 8:15 AM. Kitchen has acknowledged the request.',
      isEscalated: false
    }
  ],

  staffPerformanceRecords: [
    {
      id: 'PRF-01',
      requestId: 'ALT-101',
      serviceType: 'BREAKFAST',
      department: 'Kitchen',
      staffId: 'STF-02',
      staffName: 'Chef Babatunde Adele',
      requestTime: '2026-08-18 08:00:00',
      notifiedTime: '2026-08-18 08:00:05',
      acceptedTime: '2026-08-18 08:00:25',
      responseTimeMs: 20000,
      startTime: '2026-08-18 08:00:30',
      completedTime: '2026-08-18 08:04:00',
      durationMs: 240000,
      status: 'COMPLETED',
      escalated: false,
      summary: 'Delivered breakfast on time'
    },
    {
      id: 'PRF-02',
      requestId: 'ALT-100',
      serviceType: 'VIP_TRANSPORTATION',
      department: 'VIP Transportation',
      staffId: 'STF-03',
      staffName: 'Ibrahim Bello',
      requestTime: '2026-08-18 07:15:00',
      notifiedTime: '2026-08-18 07:15:04',
      acceptedTime: '2026-08-18 07:15:19',
      responseTimeMs: 15000,
      startTime: '2026-08-18 07:15:30',
      completedTime: '2026-08-18 07:22:00',
      durationMs: 410000,
      status: 'COMPLETED',
      escalated: false,
      summary: 'Confirmed SUV transfer to MMA2'
    },
    {
      id: 'PRF-03',
      requestId: 'ALT-099',
      serviceType: 'CONCIERGE',
      department: 'Concierge',
      staffId: 'STF-03',
      staffName: 'Ibrahim Bello',
      requestTime: '2026-08-18 06:45:00',
      notifiedTime: '2026-08-18 06:45:03',
      acceptedTime: '2026-08-18 06:45:15',
      responseTimeMs: 12000,
      startTime: '2026-08-18 06:45:20',
      completedTime: '2026-08-18 06:48:00',
      durationMs: 160000,
      status: 'COMPLETED',
      escalated: false,
      summary: 'Provided flight re-confirmation guidance'
    }
  ],

  rbacRoles: [
    { id: 'ROL-01', name: 'Super Admin', key: 'SUPER_ADMIN', department: 'Executive', permissions: ['ALL'], active: true, userCount: 1 },
    { id: 'ROL-02', name: 'Hotel Admin', key: 'HOTEL_ADMIN', department: 'Management', permissions: ['VIEW_DASHBOARD', 'MANAGE_MENU', 'PUBLISH_MENU', 'MANAGE_BREAKFAST', 'MANAGE_AMENITIES', 'MANAGE_MEDIA', 'MANAGE_SERVICES', 'MANAGE_TRANSPORT_PRICING', 'DISPATCH_TRANSPORT', 'APPROVE_TOLANI_LEARNING', 'ROLLBACK_TOLANI_LEARNING', 'MANAGE_STAFF', 'VIEW_AUDIT_LOGS', 'MANAGE_SETTINGS', 'MANAGE_PROCUREMENT', 'MANAGE_ACCOUNTS', 'MANAGE_RBAC'], active: true, userCount: 1 },
    { id: 'ROL-03', name: 'Procurement Manager', key: 'PROCUREMENT', department: 'Procurement', permissions: ['VIEW_DASHBOARD', 'MANAGE_PROCUREMENT', 'ONBOARD_VENDORS', 'APPROVE_VENDORS', 'MANAGE_SUPPLIERS', 'REQUEST_ORDERS', 'APPROVE_INVOICES', 'VIEW_AUDIT_LOGS'], active: true, userCount: 1 },
    { id: 'ROL-04', name: 'Accounts Officer', key: 'ACCOUNTS', department: 'Accounts', permissions: ['VIEW_DASHBOARD', 'MANAGE_ACCOUNTS', 'APPROVE_PAYMENTS', 'CONFIRM_PAYMENTS', 'VIEW_PAYMENT_HISTORY', 'VIEW_AUDIT_LOGS'], active: true, userCount: 1 },
    { id: 'ROL-05', name: 'Operations Supervisor', key: 'SUPERVISOR', department: 'Operations', permissions: ['VIEW_DASHBOARD', 'MANAGE_STAFF', 'APPROVE_SWAPS', 'VIEW_KPIS', 'VIEW_REPORTS', 'VIEW_AUDIT_LOGS', 'MANAGE_INTERCOM'], active: true, userCount: 1 },
    { id: 'ROL-06', name: 'Lead Concierge', key: 'CONCIERGE', department: 'Concierge', permissions: ['VIEW_DASHBOARD', 'MANAGE_SERVICES', 'MANAGE_INTERCOM', 'VIEW_NEARBY'], active: true, userCount: 1 },
    { id: 'ROL-07', name: 'Executive Chef', key: 'KITCHEN', department: 'Kitchen', permissions: ['VIEW_DASHBOARD', 'MANAGE_ORDERS', 'MANAGE_BREAKFAST', 'MANAGE_INTERCOM'], active: true, userCount: 1 },
    { id: 'ROL-08', name: 'Housekeeping Lead', key: 'HOUSEKEEPING', department: 'Housekeeping', permissions: ['VIEW_DASHBOARD', 'MANAGE_ROOMS', 'MANAGE_TASKS', 'MANAGE_INTERCOM'], active: true, userCount: 1 },
    { id: 'ROL-09', name: 'Lead Porter', key: 'PORTER', department: 'Porter', permissions: ['VIEW_DASHBOARD', 'MANAGE_TASKS', 'MANAGE_INTERCOM'], active: true, userCount: 1 },
    { id: 'ROL-10', name: 'VIP Chauffeur', key: 'VIP_TRANSPORTATION', department: 'VIP Transportation', permissions: ['VIEW_DASHBOARD', 'DISPATCH_TRANSPORT', 'MANAGE_INTERCOM'], active: true, userCount: 1 },
    { id: 'ROL-11', name: 'Front Desk Lead', key: 'FRONT_DESK', department: 'Front Desk', permissions: ['VIEW_DASHBOARD', 'MANAGE_ORDERS', 'DISPATCH_TRANSPORT', 'MANAGE_INTERCOM', 'VIEW_GUESTS'], active: true, userCount: 1 },
    { id: 'ROL-12', name: 'Supplier Partner', key: 'VENDOR', department: 'Supply Chain', permissions: ['VIEW_VENDOR_PORTAL', 'GENERATE_INVOICE', 'CONFIRM_PAYMENT_RECEIVED', 'GENERATE_RECEIPT', 'UPDATE_PRICE'], active: true, userCount: 3 }
  ],

  staffAccounts: [
    { id: 'ACC-01', name: 'Seyi Adeyemi', username: 'seyi.admin', roleKey: 'SUPER_ADMIN', roleName: 'Super Admin', department: 'Executive', email: 'seyi.adeyemi@hotelcapitol.ng', phone: '+234 803 111 2233', active: true, createdAt: '2026-08-01', lastLogin: '2026-08-18 08:30 AM' },
    { id: 'ACC-02', name: 'Tariq Alabi', username: 'tariq.supervisor', roleKey: 'SUPERVISOR', roleName: 'Operations Supervisor', department: 'Operations', email: 'tariq.alabi@hotelcapitol.ng', phone: '+234 803 222 3344', active: true, createdAt: '2026-08-01', lastLogin: '2026-08-18 07:45 AM' },
    { id: 'ACC-03', name: 'Kunle Adeleke', username: 'kunle.procurement', roleKey: 'PROCUREMENT', roleName: 'Procurement Manager', department: 'Procurement', email: 'procurement@hotelcapitol.ng', phone: '+234 803 333 4455', active: true, createdAt: '2026-08-05', lastLogin: '2026-08-18 08:15 AM' },
    { id: 'ACC-04', name: 'Ngozi Okonjo', username: 'ngozi.accounts', roleKey: 'ACCOUNTS', roleName: 'Accounts Officer', department: 'Accounts', email: 'accounts@hotelcapitol.ng', phone: '+234 803 444 5566', active: true, createdAt: '2026-08-05', lastLogin: '2026-08-18 08:45 AM' },
    { id: 'ACC-05', name: 'Lead Porter Ibrahim', username: 'Porter', roleKey: 'PORTER', roleName: 'Lead Porter', department: 'Porter', email: 'porter@hotelcapitol.ng', phone: '+234 803 555 6677', active: true, createdAt: '2026-08-10', lastLogin: '2026-08-18 08:00 AM' }
  ],

  vendorOnboardingSubmissions: [
    {
      id: 'VON-101',
      vendorName: 'Golden Star Beverages Nigeria Ltd',
      productCategory: 'Beverages & Soft Drinks',
      phone: '+234 802 998 7766',
      email: 'sales@goldenstarbev.ng',
      whatsapp: '+234 802 998 7766',
      address: '44 Commercial Avenue, Yaba, Lagos',
      contactPerson: 'Mrs. Funke Balogun',
      productsSupplied: 'Assorted Sodas, Chapman Syrups, Sparkling Waters, Juices',
      supplyCapability: '500+ Crates per week with same-day emergency dispatch',
      businessDescription: 'Registered major distributor for premium FMCG beverage lines in Greater Lagos.',
      submittedAt: '2026-08-18 09:30 AM',
      status: 'SUBMITTED', // 'SUBMITTED' | 'APPROVED' | 'REJECTED'
      reviewedAt: null,
      reviewedBy: null,
      notes: 'Initial registration application awaiting Procurement review'
    }
  ],

  suppliers: [
    {
      id: 'SUP-01',
      supplierCode: 'ABC-001',
      name: 'ABC Foods Limited',
      category: 'Kitchen Gourmet & Staples',
      contactPerson: 'Mr. Anthony Bassey',
      phone: '+234 802 334 5566',
      email: 'orders@abcfoods.ng',
      whatsapp: '+234 802 334 5566',
      address: '10 Industrial Avenue, Ikeja, Lagos',
      status: 'ACTIVE',
      temporaryPassword: null,
      passwordChanged: true,
      lastPriceUpdate: '2026-08-10',
      approvedPrices: [
        { productId: 'PRD-01', name: 'Premium Long Grain Parboiled Rice (50kg Bag)', unit: 'bags', approvedBulkPrice: 78000, lastApprovedDate: '2026-08-10', approvedBy: 'Kunle Adeleke (Procurement)' },
        { productId: 'PRD-02', name: 'Pure Refined Vegetable Oil (25L Jerrycan)', unit: 'canisters', approvedBulkPrice: 45000, lastApprovedDate: '2026-08-10', approvedBy: 'Kunle Adeleke (Procurement)' },
        { productId: 'PRD-03', name: 'All-Purpose Seasoning & Spice Blend (10kg Carton)', unit: 'cartons', approvedBulkPrice: 28000, lastApprovedDate: '2026-08-10', approvedBy: 'Kunle Adeleke (Procurement)' }
      ]
    },
    {
      id: 'SUP-02',
      supplierCode: 'LFF-002',
      name: 'Lagos Farm Fresh Produce',
      category: 'Kitchen Produce & Oils',
      contactPerson: 'Mr. Kunle Sanwo',
      phone: '+234 802 443 1190',
      email: 'orders@lagosfreshfarm.ng',
      whatsapp: '+234 802 443 1190',
      address: '22 Alausa Market Road, Ikeja, Lagos',
      status: 'ACTIVE',
      temporaryPassword: null,
      passwordChanged: true,
      lastPriceUpdate: '2026-08-12',
      approvedPrices: [
        { productId: 'PRD-04', name: 'Fresh Farm Tomatoes & Peppers (Basket)', unit: 'baskets', approvedBulkPrice: 22000, lastApprovedDate: '2026-08-12', approvedBy: 'Kunle Adeleke (Procurement)' },
        { productId: 'PRD-05', name: 'Fresh Farm Eggs (Crate of 30)', unit: 'crates', approvedBulkPrice: 4200, lastApprovedDate: '2026-08-12', approvedBy: 'Kunle Adeleke (Procurement)' }
      ]
    },
    {
      id: 'SUP-03',
      supplierCode: 'CLA-003',
      name: 'Capitol Linen & Amenities Supplies',
      category: 'Housekeeping & Toiletries',
      contactPerson: 'Mrs. Chidinma Eze',
      phone: '+234 803 776 2201',
      email: 'supply@capitollinen.ng',
      whatsapp: '+234 803 776 2201',
      address: '14 Oregun Industrial Estate, Ikeja, Lagos',
      status: 'ACTIVE',
      temporaryPassword: null,
      passwordChanged: true,
      lastPriceUpdate: '2026-08-08',
      approvedPrices: [
        { productId: 'PRD-06', name: 'Egyptian Cotton Luxury Bath Towels (Pair)', unit: 'pairs', approvedBulkPrice: 12000, lastApprovedDate: '2026-08-08', approvedBy: 'Kunle Adeleke (Procurement)' },
        { productId: 'PRD-07', name: 'Luxury Botanical Toiletry Kit (50 Sets)', unit: 'cartons', approvedBulkPrice: 85000, lastApprovedDate: '2026-08-08', approvedBy: 'Kunle Adeleke (Procurement)' },
        { productId: 'PRD-08', name: 'Room Air Sanitizer & Insecticide Spray (12 Cans)', unit: 'packs', approvedBulkPrice: 48000, lastApprovedDate: '2026-08-08', approvedBy: 'Kunle Adeleke (Procurement)' }
      ]
    }
  ],

  procurementOrders: [
    {
      id: 'PO-8801',
      supplierCode: 'ABC-001',
      supplierName: 'ABC Foods Limited',
      productId: 'PRD-01',
      productName: 'Premium Long Grain Parboiled Rice (50kg Bag)',
      quantity: 10,
      unit: 'bags',
      unitPrice: 78000,
      totalAmount: 780000,
      deliveryLocation: 'Hotel Capitol Main Kitchen Loading Bay',
      requiredDeliveryDate: '2026-08-20',
      notes: 'Urgent restocking for weekend diplomatic banquets',
      status: 'REQUESTED', // 'REQUESTED' | 'INVOICE_GENERATED' | 'APPROVED_BY_PROCUREMENT' | 'PAYMENT_CONFIRMED' | 'DELIVERED'
      createdAt: '2026-08-18 10:00 AM',
      createdBy: 'Kunle Adeleke (Procurement Manager)'
    }
  ],

  vendorInvoices: [
    {
      id: 'INV-8801',
      invoiceNumber: 'INV-ABC-2026-044',
      orderId: 'PO-8801',
      supplierCode: 'ABC-001',
      supplierName: 'ABC Foods Limited',
      items: [
        { productId: 'PRD-01', name: 'Premium Long Grain Parboiled Rice (50kg Bag)', quantity: 10, unit: 'bags', unitPrice: 78000, total: 780000 }
      ],
      totalAmount: 780000,
      issueDate: '2026-08-18',
      status: 'PENDING_APPROVAL', // 'PENDING_APPROVAL' | 'APPROVED' | 'ROUTED_TO_ACCOUNTS' | 'PAID'
      goodsReceivedConfirmed: false,
      procurementApprovedBy: null,
      procurementApprovedAt: null,
      paymentRef: null
    }
  ],

  accountPayments: [
    {
      id: 'PAY-7701',
      paymentRef: 'PAY-REF-2026-0899',
      supplierCode: 'CLA-003',
      supplierName: 'Capitol Linen & Amenities Supplies',
      invoiceRef: 'INV-CLA-2026-012',
      receiptRef: 'RCP-CLA-9901',
      amount: 480000,
      status: 'CONFIRMED_PAID', // 'AWAITING_PAYMENT' | 'CONFIRMED_PAID'
      paidAt: '2026-08-17 03:30 PM',
      paymentMethod: 'Direct Executive Bank Transfer (Zenith Bank)',
      officerName: 'Ngozi Okonjo (Accounts Officer)',
      notes: 'Payment for 40x Towels & Toiletry Kits replenishment'
    }
  ],

  vendorReceipts: [
    {
      id: 'RCP-CLA-9901',
      receiptNumber: 'RCPT-CLA-2026-088',
      supplierCode: 'CLA-003',
      supplierName: 'Capitol Linen & Amenities Supplies',
      invoiceNumber: 'INV-CLA-2026-012',
      paymentRef: 'PAY-REF-2026-0899',
      amount: 480000,
      submittedAt: '2026-08-17 04:00 PM',
      verifiedBy: 'Ngozi Okonjo (Accounts Officer)'
    }
  ],

  vendorPriceUpdateRequests: [
    {
      id: 'PUR-301',
      supplierCode: 'LFF-002',
      supplierName: 'Lagos Farm Fresh Produce',
      productId: 'PRD-04',
      productName: 'Fresh Farm Tomatoes & Peppers (Basket)',
      currentPrice: 22000,
      proposedPrice: 24500,
      reason: 'Interstate transport fuel tariffs & seasonal rainfall yield reduction',
      submittedAt: '2026-08-18 10:15 AM',
      status: 'PENDING_PROCUREMENT_APPROVAL', // 'PENDING_PROCUREMENT_APPROVAL' | 'APPROVED' | 'REJECTED'
      reviewedAt: null,
      reviewedBy: null
    }
  ],

  deliveryTrackings: [
    {
      id: 'TRK-901',
      orderId: 'PO-8801',
      supplierCode: 'ABC-001',
      supplierName: 'ABC Foods Limited',
      route: 'Ikeja Industrial Estate → 6 Animashaun Close',
      currentPosition: 'Allen Avenue Intersection (~1.2 km away)',
      destination: 'Hotel Capitol Loading Bay 1',
      etaMinutes: 12,
      expectedArrivalDate: '2026-08-18',
      expectedArrivalTime: '11:30 AM',
      actualArrivalTime: null,
      status: 'IN_TRANSIT', // 'ORDER_CONFIRMED' | 'PREPARING' | 'DISPATCHED' | 'IN_TRANSIT' | 'NEAR_HOTEL' | 'ARRIVED' | 'RECEIVED'
      statusHistory: [
        { status: 'ORDER_CONFIRMED', time: '10:05 AM', note: 'Purchase Order confirmed by supplier' },
        { status: 'PREPARING', time: '10:20 AM', note: 'Goods palletized at warehouse' },
        { status: 'DISPATCHED', time: '10:50 AM', note: 'Truck departed supplier depot' },
        { status: 'IN_TRANSIT', time: '11:18 AM', note: 'Approaching Ikeja GRA corridor' }
      ]
    }
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
      // Purge legacy outdated cache keys so browser loads fresh FSM configuration and latest portraits cleanly
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('HOTEL_CAPITOL_STATE_V1');
        localStorage.removeItem('HOTEL_CAPITOL_STATE_V2');
        localStorage.removeItem('HOTEL_CAPITOL_STATE_V3');
        localStorage.removeItem('HOTEL_CAPITOL_STATE_V4');
        localStorage.removeItem('HOTEL_CAPITOL_STATE_V5');
        localStorage.removeItem('HOTEL_CAPITOL_STATE_V9');
        localStorage.removeItem('HOTEL_CAPITOL_STATE_V10');
        localStorage.removeItem('HOTEL_CAPITOL_STATE_V11');
        localStorage.removeItem('HOTEL_CAPITOL_STATE_V12');
        localStorage.removeItem('HOTEL_CAPITOL_STATE_V13');
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Always ensure staff avatars are synced with current canonical assets
          if (parsed.staffMembers && defaultState.staffMembers) {
            parsed.staffMembers = parsed.staffMembers.map(s => {
              const def = defaultState.staffMembers.find(d => d.id === s.id);
              return def ? { ...s, avatar: def.avatar, name: def.name, role: def.role } : s;
            });
          }
          return parsed;
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

  setActiveStaff(id) {
    this.setActiveStaffId(id);
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

  
  // --- DIRECT INTERCOM SERVICE ALERTS & STAFF PERFORMANCE ---
  createIntercomAlert(serviceType, deptName, deptKey, roomNumber, guestName) {
    const alertId = 'ALT-' + Date.now().toString().slice(-4);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    
    const newAlert = {
      id: alertId,
      serviceType,
      deptName,
      deptKey: deptKey || (serviceType === 'BREAKFAST' ? 'kitchen-fb' : serviceType === 'VIP_TRANSPORTATION' ? 'concierge-frontdesk' : 'concierge-frontdesk'),
      roomNumber: String(roomNumber || '402'),
      guestName: guestName || 'Chief Adeleke Babalola',
      status: 'WAITING', // 'WAITING' | 'ACCEPTED' | 'CONNECTED' | 'COMPLETED'
      requestedAt: timeStr,
      notifiedAt: timeStr,
      acceptedAt: null,
      responseTimeMs: null,
      startedAt: null,
      completedAt: null,
      durationMs: null,
      staffId: null,
      staffName: null,
      conversationSummary: null,
      isEscalated: false,
      timestampCreated: now.toISOString()
    };

    this.setState(s => ({
      ...s,
      intercomAlerts: [newAlert, ...(s.intercomAlerts || [])]
    }));

    this.addAudit('INTERCOM_ALERT_CREATED', `Room ${newAlert.roomNumber} (${deptName})`, `Direct ${serviceType} alert issued by guest`, newAlert.guestName, 'Intercom System', null, newAlert, 'Guest pressed direct intercom CTA');
    return newAlert;
  }

  acceptIntercomAlert(alertId, staffId, staffName) {
    const existing = (this.state.intercomAlerts || []).find(a => a.id === alertId);
    if (!existing) return null;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const createdTime = new Date(existing.timestampCreated || Date.now());
    const responseTimeMs = Math.max(1000, now.getTime() - createdTime.getTime());

    const updated = {
      ...existing,
      status: 'CONNECTED',
      acceptedAt: timeStr,
      responseTimeMs,
      startedAt: timeStr,
      staffId: staffId || 'STF-01',
      staffName: staffName || 'Hotel Staff Attendant'
    };

    this.setState(s => ({
      ...s,
      intercomAlerts: (s.intercomAlerts || []).map(a => a.id === alertId ? updated : a)
    }));

    this.addAudit('INTERCOM_ALERT_ACCEPTED', `Room ${updated.roomNumber} (${updated.deptName})`, `Accepted by ${updated.staffName} in ${Math.round(responseTimeMs/1000)}s`, updated.staffName, 'Intercom System', existing, updated, 'Staff pickup');
    return updated;
  }

  completeIntercomAlert(alertId, summaryText = '') {
    const existing = (this.state.intercomAlerts || []).find(a => a.id === alertId);
    if (!existing) return null;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const createdTime = new Date(existing.timestampCreated || Date.now());
    const durationMs = Math.max(1000, now.getTime() - createdTime.getTime());

    const updated = {
      ...existing,
      status: 'COMPLETED',
      completedAt: timeStr,
      durationMs,
      conversationSummary: summaryText || `Room ${existing.roomNumber} requested ${existing.serviceType.toLowerCase()} assistance. ${existing.deptName} has acknowledged the request.`
    };

    const newPerfRecord = {
      id: 'PRF-' + Date.now().toString().slice(-4),
      requestId: existing.id,
      serviceType: existing.serviceType,
      department: existing.deptName,
      staffId: existing.staffId || 'STF-01',
      staffName: existing.staffName || 'Hotel Staff',
      requestTime: existing.timestampCreated || new Date().toISOString(),
      notifiedTime: existing.notifiedAt || timeStr,
      acceptedTime: existing.acceptedAt || timeStr,
      responseTimeMs: existing.responseTimeMs || 15000,
      startTime: existing.startedAt || timeStr,
      completedTime: timeStr,
      durationMs,
      status: 'COMPLETED',
      escalated: existing.isEscalated || false,
      summary: updated.conversationSummary
    };

    this.setState(s => ({
      ...s,
      intercomAlerts: (s.intercomAlerts || []).map(a => a.id === alertId ? updated : a),
      staffPerformanceRecords: [newPerfRecord, ...(s.staffPerformanceRecords || [])]
    }));

    this.addAudit('INTERCOM_ALERT_COMPLETED', `Room ${updated.roomNumber} (${updated.deptName})`, `Completed in ${Math.round(durationMs/1000)}s: ${updated.conversationSummary}`, updated.staffName, 'Intercom System', existing, updated, 'Service completed');
    return updated;
  }

  calculateStaffPerformanceMetrics(timeframe = 'weekly') {
    const records = this.state.staffPerformanceRecords || [];
    const total = records.length;
    if (total === 0) {
      return {
        totalRequests: 0,
        avgResponseTimeSec: 0,
        avgCompletionTimeMin: 0,
        completedCount: 0,
        delayedCount: 0,
        escalatedCount: 0,
        onTimeRate: '100%'
      };
    }

    const completed = records.filter(r => r.status === 'COMPLETED').length;
    const escalated = records.filter(r => r.escalated).length;
    const delayed = records.filter(r => (r.responseTimeMs || 0) > 60000).length;

    const totalResponseMs = records.reduce((acc, r) => acc + (r.responseTimeMs || 0), 0);
    const totalDurationMs = records.reduce((acc, r) => acc + (r.durationMs || 0), 0);

    const avgResponseSec = Math.round(totalResponseMs / total / 1000);
    const avgCompletionMin = Math.round((totalDurationMs / total / 60000) * 10) / 10;
    const onTimePercent = Math.round(((total - delayed) / total) * 100);

    return {
      totalRequests: total,
      avgResponseTimeSec: avgResponseSec,
      avgCompletionTimeMin: avgCompletionMin,
      completedCount: completed,
      delayedCount: delayed,
      escalatedCount: escalated,
      onTimeRate: `${onTimePercent}%`
    };
  }

  // --- RBAC MANAGEMENT ---
  createRbacRole(roleData, actor = null) {
    this.checkPermissionOrThrow('MANAGE_RBAC', actor);
    const staff = actor || this.getActiveStaff();
    const newId = 'ROL-' + String((this.state.rbacRoles || []).length + 1).padStart(2, '0');
    const newRole = {
      id: newId,
      name: roleData.name,
      key: roleData.key || roleData.name.toUpperCase().replace(/\s+/g, '_'),
      department: roleData.department || 'General Operations',
      permissions: roleData.permissions || ['VIEW_DASHBOARD'],
      active: roleData.active ?? true,
      userCount: 0
    };

    this.setState(s => ({
      ...s,
      rbacRoles: [...(s.rbacRoles || []), newRole]
    }));

    this.addAudit('RBAC_ROLE_CREATED', `${newRole.name} (${newRole.key})`, `Created RBAC role with ${newRole.permissions.length} permissions`, staff.name, 'RBAC Management', null, newRole, 'Admin role creation');
    return newRole;
  }

  updateRbacRole(roleId, updates, actor = null) {
    this.checkPermissionOrThrow('MANAGE_RBAC', actor);
    const staff = actor || this.getActiveStaff();
    const existing = (this.state.rbacRoles || []).find(r => r.id === roleId || r.key === roleId);
    if (!existing) throw new Error(`Role ${roleId} not found`);

    const updated = { ...existing, ...updates };

    this.setState(s => ({
      ...s,
      rbacRoles: (s.rbacRoles || []).map(r => (r.id === roleId || r.key === roleId) ? updated : r)
    }));

    this.addAudit('RBAC_ROLE_UPDATED', `${updated.name} (${updated.key})`, `Updated role permissions and active status`, staff.name, 'RBAC Management', existing, updated, 'Admin role update');
    return updated;
  }

  createStaffAccount(accountData, actor = null) {
    this.checkPermissionOrThrow('MANAGE_RBAC', actor);
    const staff = actor || this.getActiveStaff();
    const newId = 'ACC-' + String((this.state.staffAccounts || []).length + 1).padStart(2, '0');
    const newAccount = {
      id: newId,
      name: accountData.name,
      username: accountData.username,
      roleKey: accountData.roleKey || 'FRONT_DESK',
      roleName: accountData.roleName || accountData.roleKey,
      department: accountData.department || 'Front Desk',
      email: accountData.email,
      phone: accountData.phone,
      active: accountData.active ?? true,
      createdAt: new Date().toISOString().slice(0, 10),
      lastLogin: null
    };

    this.setState(s => ({
      ...s,
      staffAccounts: [...(s.staffAccounts || []), newAccount]
    }));

    this.addAudit('STAFF_ACCOUNT_CREATED', `${newAccount.username} (${newAccount.name})`, `Created staff login with role ${newAccount.roleKey}`, staff.name, 'RBAC Management', null, newAccount, 'Admin user account creation');
    return newAccount;
  }

  updateStaffAccountStatus(accountId, isActive, actor = null) {
    this.checkPermissionOrThrow('MANAGE_RBAC', actor);
    const staff = actor || this.getActiveStaff();
    const existing = (this.state.staffAccounts || []).find(a => a.id === accountId || a.username === accountId);
    if (!existing) return null;

    const updated = { ...existing, active: isActive };

    this.setState(s => ({
      ...s,
      staffAccounts: (s.staffAccounts || []).map(a => (a.id === accountId || a.username === accountId) ? updated : a)
    }));

    this.addAudit('STAFF_ACCOUNT_STATUS_CHANGED', `${existing.username}`, `Account status set to ${isActive ? 'ACTIVE' : 'DEACTIVATED'}`, staff.name, 'RBAC Management', existing, updated, 'Admin account status toggle');
    return updated;
  }

  resetStaffCredentials(accountId, newPassword = 'TemporaryPass123', actor = null) {
    this.checkPermissionOrThrow('MANAGE_RBAC', actor);
    const staff = actor || this.getActiveStaff();
    const existing = (this.state.staffAccounts || []).find(a => a.id === accountId || a.username === accountId);
    if (!existing) return null;

    this.addAudit('STAFF_CREDENTIALS_RESET', `${existing.username}`, `Reset password credentials for staff member`, staff.name, 'RBAC Management', null, null, 'Credential reset');
    return { success: true, username: existing.username, temporaryPassword: newPassword };
  }

  // --- VENDOR ONBOARDING & SUPPLIER CODES ---
  generateUniqueSupplierCode(companyName) {
    const initials = companyName
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .split(' ')
      .filter(w => w.length > 0)
      .map(w => w[0].toUpperCase())
      .slice(0, 3)
      .join('');
    const baseCode = (initials.length >= 2 ? initials : companyName.slice(0, 3).toUpperCase());
    const existingCount = (this.state.suppliers || []).filter(s => s.supplierCode && s.supplierCode.startsWith(baseCode)).length + 1;
    return `${baseCode}-${String(existingCount).padStart(3, '0')}`;
  }

  submitVendorOnboarding(formData) {
    const newId = 'VON-' + (100 + (this.state.vendorOnboardingSubmissions || []).length + 1);
    const submission = {
      id: newId,
      vendorName: formData.vendorName,
      productCategory: formData.productCategory,
      phone: formData.phone,
      email: formData.email,
      whatsapp: formData.whatsapp || formData.phone,
      address: formData.address,
      contactPerson: formData.contactPerson,
      productsSupplied: formData.productsSupplied,
      supplyCapability: formData.supplyCapability,
      businessDescription: formData.businessDescription,
      submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'SUBMITTED',
      reviewedAt: null,
      reviewedBy: null,
      notes: 'Submitted via public vendor onboarding form'
    };

    this.setState(s => ({
      ...s,
      vendorOnboardingSubmissions: [submission, ...(s.vendorOnboardingSubmissions || [])]
    }));

    this.addAudit('VENDOR_ONBOARDING_SUBMITTED', `${submission.vendorName} (${submission.id})`, 'Submitted vendor registration application', submission.contactPerson, 'Vendor Procurement', null, submission, 'Public registration');
    return submission;
  }

  reviewVendorOnboarding(submissionId, decision, reviewerName = 'Kunle Adeleke (Procurement)') {
    const existing = (this.state.vendorOnboardingSubmissions || []).find(s => s.id === submissionId);
    if (!existing) throw new Error(`Submission ${submissionId} not found`);

    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const isApproved = decision === 'APPROVE';

    const updatedSubmission = {
      ...existing,
      status: isApproved ? 'APPROVED' : 'REJECTED',
      reviewedAt: nowStr,
      reviewedBy: reviewerName,
      notes: isApproved ? 'Approved for official Hotel Capitol supplier network' : 'Application declined by procurement review'
    };

    let newSupplier = null;
    if (isApproved) {
      const supplierCode = this.generateUniqueSupplierCode(existing.vendorName);
      newSupplier = {
        id: 'SUP-' + String((this.state.suppliers || []).length + 1).padStart(2, '0'),
        supplierCode,
        name: existing.vendorName,
        category: existing.productCategory,
        contactPerson: existing.contactPerson,
        phone: existing.phone,
        email: existing.email,
        whatsapp: existing.whatsapp,
        address: existing.address,
        status: 'ACTIVE',
        temporaryPassword: 'CapitolTempPass2026',
        passwordChanged: false,
        lastPriceUpdate: new Date().toISOString().slice(0, 10),
        approvedPrices: [
          {
            productId: 'PRD-' + (this.state.suppliers || []).length + '01',
            name: existing.productsSupplied || 'Assorted Quality Supply Item',
            unit: 'units',
            approvedBulkPrice: 15000,
            lastApprovedDate: new Date().toISOString().slice(0, 10),
            approvedBy: reviewerName
          }
        ]
      };
    }

    this.setState(s => ({
      ...s,
      vendorOnboardingSubmissions: (s.vendorOnboardingSubmissions || []).map(sub => sub.id === submissionId ? updatedSubmission : sub),
      suppliers: newSupplier ? [...(s.suppliers || []), newSupplier] : (s.suppliers || [])
    }));

    this.addAudit('VENDOR_APPLICATION_REVIEWED', `${existing.vendorName} (${submissionId})`, `Decision: ${updatedSubmission.status} by ${reviewerName}`, reviewerName, 'Vendor Procurement', existing, updatedSubmission, 'Procurement onboarding review');
    return { submission: updatedSubmission, supplier: newSupplier };
  }

  // --- PRICE SOURCE OF TRUTH (AI NEVER GUESSES) ---
  getApprovedSupplierPrice(supplierCode, productId) {
    const supplier = (this.state.suppliers || []).find(s => s.supplierCode === supplierCode);
    if (!supplier || supplier.status !== 'ACTIVE') return null;
    const priceItem = (supplier.approvedPrices || []).find(p => p.productId === productId || p.name.toLowerCase() === productId.toLowerCase());
    return priceItem ? priceItem.approvedBulkPrice : null;
  }

  // --- PROCUREMENT ORDERS & INVOICES ---
  requestProcurementOrder(orderData, actorName = 'Kunle Adeleke (Procurement Manager)') {
    const supplier = (this.state.suppliers || []).find(s => s.supplierCode === orderData.supplierCode || s.name === orderData.supplierName);
    if (!supplier) throw new Error(`Supplier ${orderData.supplierCode || orderData.supplierName} not found`);

    const approvedPrice = this.getApprovedSupplierPrice(supplier.supplierCode, orderData.productId);
    if (approvedPrice === null) {
      throw new Error('No approved supplier price is available for this item. Procurement approval is required.');
    }

    const newId = 'PO-' + (8800 + (this.state.procurementOrders || []).length + 1);
    const qty = Number(orderData.quantity) || 1;
    const total = approvedPrice * qty;

    const newOrder = {
      id: newId,
      supplierCode: supplier.supplierCode,
      supplierName: supplier.name,
      productId: orderData.productId,
      productName: orderData.productName,
      quantity: qty,
      unit: orderData.unit || 'units',
      unitPrice: approvedPrice,
      totalAmount: total,
      deliveryLocation: orderData.deliveryLocation || 'Hotel Capitol Loading Bay 1',
      requiredDeliveryDate: orderData.requiredDeliveryDate || new Date().toISOString().slice(0, 10),
      notes: orderData.notes || 'Routine procurement stock request',
      status: 'REQUESTED',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      createdBy: actorName
    };

    this.setState(s => ({
      ...s,
      procurementOrders: [newOrder, ...(s.procurementOrders || [])]
    }));

    this.addAudit('PROCUREMENT_ORDER_REQUESTED', `${newOrder.id} (${supplier.supplierCode})`, `Requested ${newOrder.quantity} ${newOrder.unit} of ${newOrder.productName} (₦${total.toLocaleString()})`, actorName, 'Vendor Procurement', null, newOrder, 'Purchase order generation');
    return newOrder;
  }

  generateVendorInvoice(orderId) {
    const order = (this.state.procurementOrders || []).find(o => o.id === orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);

    const newInvId = 'INV-' + (8800 + (this.state.vendorInvoices || []).length + 1);
    const invoiceNumber = `INV-${order.supplierCode}-${new Date().getFullYear()}-${String((this.state.vendorInvoices || []).length + 1).padStart(3, '0')}`;

    const newInvoice = {
      id: newInvId,
      invoiceNumber,
      orderId: order.id,
      supplierCode: order.supplierCode,
      supplierName: order.supplierName,
      items: [
        { productId: order.productId, name: order.productName, quantity: order.quantity, unit: order.unit, unitPrice: order.unitPrice, total: order.totalAmount }
      ],
      totalAmount: order.totalAmount,
      issueDate: new Date().toISOString().slice(0, 10),
      status: 'PENDING_APPROVAL',
      goodsReceivedConfirmed: false,
      procurementApprovedBy: null,
      procurementApprovedAt: null,
      paymentRef: null
    };

    this.setState(s => ({
      ...s,
      vendorInvoices: [newInvoice, ...(s.vendorInvoices || [])],
      procurementOrders: (s.procurementOrders || []).map(o => o.id === orderId ? { ...o, status: 'INVOICE_GENERATED' } : o)
    }));

    this.addAudit('VENDOR_INVOICE_GENERATED', `${invoiceNumber} (${order.supplierCode})`, `Invoice generated for PO ${order.id} (₦${newInvoice.totalAmount.toLocaleString()})`, order.supplierName, 'Vendor Invoicing', null, newInvoice, 'Supplier invoice generation');
    return newInvoice;
  }

  approveProcurementInvoice(invoiceId, reviewerName = 'Kunle Adeleke (Procurement Manager)') {
    const existing = (this.state.vendorInvoices || []).find(i => i.id === invoiceId || i.invoiceNumber === invoiceId);
    if (!existing) throw new Error(`Invoice ${invoiceId} not found`);

    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const updatedInvoice = {
      ...existing,
      status: 'ROUTED_TO_ACCOUNTS',
      goodsReceivedConfirmed: true,
      procurementApprovedBy: reviewerName,
      procurementApprovedAt: nowStr
    };

    const newPayment = {
      id: 'PAY-' + (7700 + (this.state.accountPayments || []).length + 1),
      paymentRef: `PAY-REF-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`,
      supplierCode: existing.supplierCode,
      supplierName: existing.supplierName,
      invoiceRef: existing.invoiceNumber,
      receiptRef: null,
      amount: existing.totalAmount,
      status: 'AWAITING_PAYMENT',
      paidAt: null,
      paymentMethod: 'Direct Executive Bank Transfer',
      officerName: null,
      notes: `Procurement approved by ${reviewerName}. Ready for account disbursement.`
    };

    this.setState(s => ({
      ...s,
      vendorInvoices: (s.vendorInvoices || []).map(inv => (inv.id === invoiceId || inv.invoiceNumber === invoiceId) ? updatedInvoice : inv),
      accountPayments: [newPayment, ...(s.accountPayments || [])]
    }));

    this.addAudit('INVOICE_APPROVED_ROUTED_TO_ACCOUNTS', `${existing.invoiceNumber}`, `Approved and routed ₦${existing.totalAmount.toLocaleString()} to Account department`, reviewerName, 'Vendor Procurement', existing, updatedInvoice, 'Procurement invoice authorization');
    return { invoice: updatedInvoice, payment: newPayment };
  }

  // --- ACCOUNT PORTAL PAYMENT CONFIRMATION ---
  confirmAccountPayment(paymentId, refNumber = null, officerName = 'Ngozi Okonjo (Accounts Officer)') {
    const existing = (this.state.accountPayments || []).find(p => p.id === paymentId || p.paymentRef === paymentId);
    if (!existing) throw new Error(`Payment record ${paymentId} not found`);

    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const finalRef = refNumber || existing.paymentRef || `PAY-REF-${Date.now().toString().slice(-4)}`;

    const updatedPayment = {
      ...existing,
      paymentRef: finalRef,
      status: 'CONFIRMED_PAID',
      paidAt: nowStr,
      officerName
    };

    this.setState(s => ({
      ...s,
      accountPayments: (s.accountPayments || []).map(p => (p.id === paymentId || p.paymentRef === paymentId) ? updatedPayment : p),
      vendorInvoices: (s.vendorInvoices || []).map(inv => inv.invoiceNumber === existing.invoiceRef ? { ...inv, status: 'PAID', paymentRef: finalRef } : inv)
    }));

    this.addAudit('ACCOUNT_PAYMENT_CONFIRMED', `${finalRef} (${existing.supplierCode})`, `Confirmed disbursement of ₦${existing.amount.toLocaleString()} for Invoice ${existing.invoiceRef}`, officerName, 'Account Department', existing, updatedPayment, 'Vendor payment settlement');
    return updatedPayment;
  }

  // --- VENDOR RECEIPT GENERATION & SUBMISSION ---
  generateVendorReceipt(paymentId, actorName = 'Supplier Partner') {
    const payment = (this.state.accountPayments || []).find(p => p.id === paymentId || p.paymentRef === paymentId);
    if (!payment) throw new Error(`Payment ${paymentId} not found`);
    if (payment.status !== 'CONFIRMED_PAID') throw new Error('Payment has not yet been confirmed by Hotel Accounts.');

    const rcpNum = `RCPT-${payment.supplierCode}-${new Date().getFullYear()}-${String((this.state.vendorReceipts || []).length + 1).padStart(3, '0')}`;
    const newReceipt = {
      id: 'RCP-' + Date.now().toString().slice(-4),
      receiptNumber: rcpNum,
      supplierCode: payment.supplierCode,
      supplierName: payment.supplierName,
      invoiceNumber: payment.invoiceRef,
      paymentRef: payment.paymentRef,
      amount: payment.amount,
      submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      verifiedBy: payment.officerName || 'Hotel Capitol Accounts'
    };

    this.setState(s => ({
      ...s,
      vendorReceipts: [newReceipt, ...(s.vendorReceipts || [])],
      accountPayments: (s.accountPayments || []).map(p => p.id === payment.id ? { ...p, receiptRef: rcpNum } : p)
    }));

    this.addAudit('VENDOR_RECEIPT_SUBMITTED', `${rcpNum} (${payment.supplierCode})`, `Issued receipt for payment ${payment.paymentRef} (₦${payment.amount.toLocaleString()})`, actorName, 'Vendor Portal', null, newReceipt, 'Supplier receipt issuance');
    return newReceipt;
  }

  // --- VENDOR PRICE UPDATE WORKFLOW ---
  submitPriceUpdateRequest(updateData) {
    const newId = 'PUR-' + (300 + (this.state.vendorPriceUpdateRequests || []).length + 1);
    const newReq = {
      id: newId,
      supplierCode: updateData.supplierCode,
      supplierName: updateData.supplierName,
      productId: updateData.productId,
      productName: updateData.productName,
      currentPrice: Number(updateData.currentPrice),
      proposedPrice: Number(updateData.proposedPrice),
      reason: updateData.reason || 'Cost adjustment',
      submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'PENDING_PROCUREMENT_APPROVAL',
      reviewedAt: null,
      reviewedBy: null
    };

    this.setState(s => ({
      ...s,
      vendorPriceUpdateRequests: [newReq, ...(s.vendorPriceUpdateRequests || [])]
    }));

    this.addAudit('PRICE_UPDATE_SUBMITTED', `${newReq.productName} (${newReq.supplierCode})`, `Proposed price: ₦${newReq.currentPrice.toLocaleString()} → ₦${newReq.proposedPrice.toLocaleString()}. Status: PENDING_PROCUREMENT_APPROVAL`, newReq.supplierName, 'Vendor Portal', null, newReq, updateData.reason);
    return newReq;
  }

  reviewPriceUpdateRequest(requestId, decision, reviewerName = 'Kunle Adeleke (Procurement Manager)') {
    const existing = (this.state.vendorPriceUpdateRequests || []).find(r => r.id === requestId);
    if (!existing) throw new Error(`Price update request ${requestId} not found`);

    const isApproved = decision === 'APPROVE';
    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const updatedReq = {
      ...existing,
      status: isApproved ? 'APPROVED' : 'REJECTED',
      reviewedAt: nowStr,
      reviewedBy: reviewerName
    };

    let updatedSuppliers = this.state.suppliers || [];
    if (isApproved) {
      updatedSuppliers = updatedSuppliers.map(s => {
        if (s.supplierCode === existing.supplierCode) {
          return {
            ...s,
            lastPriceUpdate: new Date().toISOString().slice(0, 10),
            approvedPrices: (s.approvedPrices || []).map(p => {
              if (p.productId === existing.productId || p.name === existing.productName) {
                return {
                  ...p,
                  approvedBulkPrice: existing.proposedPrice,
                  lastApprovedDate: new Date().toISOString().slice(0, 10),
                  approvedBy: reviewerName
                };
              }
              return p;
            })
          };
        }
        return s;
      });
    }

    this.setState(s => ({
      ...s,
      vendorPriceUpdateRequests: (s.vendorPriceUpdateRequests || []).map(r => r.id === requestId ? updatedReq : r),
      suppliers: updatedSuppliers
    }));

    this.addAudit('PRICE_UPDATE_REVIEWED', `${existing.productName} (${existing.supplierCode})`, `Decision: ${updatedReq.status} by ${reviewerName}`, reviewerName, 'Vendor Procurement', existing, updatedReq, 'Procurement pricing decision');
    return updatedReq;
  }

  // --- DELIVERY TRACKING SIMULATION ---
  updateDeliveryTrackingStatus(trackingId, nextStatus, note = '') {
    const existing = (this.state.deliveryTrackings || []).find(t => t.id === trackingId || t.orderId === trackingId);
    if (!existing) return null;

    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const isArrived = nextStatus === 'ARRIVED' || nextStatus === 'RECEIVED';
    const updated = {
      ...existing,
      status: nextStatus,
      actualArrivalTime: isArrived ? (existing.actualArrivalTime || timeStr) : null,
      statusHistory: [
        ...(existing.statusHistory || []),
        { status: nextStatus, time: timeStr, note: note || `Status transitioned to ${nextStatus}` }
      ]
    };

    this.setState(s => ({
      ...s,
      deliveryTrackings: (s.deliveryTrackings || []).map(t => (t.id === trackingId || t.orderId === trackingId) ? updated : t)
    }));

    this.addAudit('DELIVERY_TRACKING_UPDATED', `Order ${existing.orderId} (${existing.supplierCode})`, `Delivery status transitioned: ${nextStatus}`, 'Automated Dispatch AI', 'Delivery Tracking', existing, updated, note);
    return updated;
  }

  // =========================================================================
  // --- END-TO-END AUTONOMOUS PROCUREMENT WORKFLOW ENGINE (14 STAGES) ---
  // =========================================================================

  getAppropriateApprover(estimatedCost) {
    const cost = Number(estimatedCost) || 0;
    if (cost <= 1000000) {
      return {
        roleId: 'ROLE_AM',
        title: 'Admin & Operations Manager',
        tierLevel: 1,
        slaHours: 2,
        maxLimit: 1000000,
        escalationTarget: 'ROLE_HM'
      };
    } else if (cost <= 5000000) {
      return {
        roleId: 'ROLE_HM',
        title: 'Hotel General Manager',
        tierLevel: 2,
        slaHours: 4,
        maxLimit: 5000000,
        escalationTarget: 'ROLE_CEO_COO'
      };
    } else {
      return {
        roleId: 'ROLE_CEO_COO',
        title: 'CEO / COO',
        tierLevel: 3,
        slaHours: 12,
        maxLimit: null,
        escalationTarget: null
      };
    }
  }

  // STAGE 1: AI Stock Depletion Evaluation & Alert Distribution
  evaluateAIStockDepletion() {
    const state = this.getState();
    const inventory = state.inventory || [];
    let updatedInventory = [];
    let newRequisitions = [...(state.procurementRequisitions || [])];
    let alertsTriggered = 0;

    inventory.forEach(item => {
      const ratio = item.quantity / item.maxCapacity;
      let severity = 'NORMAL';
      let status = 'NORMAL';

      if (ratio <= 0.05) {
        severity = 'EMERGENCY';
        status = 'EMERGENCY RESTOCK';
      } else if (ratio <= 0.10) {
        severity = 'CRITICAL';
        status = 'CRITICAL';
      } else if (ratio <= 0.20) {
        severity = 'LOW';
        status = 'VERY LOW';
      } else if (ratio <= 0.30) {
        severity = 'WARNING';
        status = 'LOW STOCK';
      }

      updatedInventory.push({ ...item, status });

      if (severity !== 'NORMAL') {
        const existingReq = newRequisitions.find(r => r.itemId === item.id && r.status !== 'AUDIT_CLOSED' && r.status !== 'REJECTED');
        if (!existingReq) {
          const reorderQty = item.maxCapacity - item.quantity;
          const estCost = reorderQty * item.unitCost;
          const approverInfo = this.getAppropriateApprover(estCost);
          const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
          const deadlineDate = new Date(Date.now() + (approverInfo.slaHours * 3600 * 1000));
          const deadlineStr = deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

          const newReq = {
            id: 'REQ-2026-' + String(newRequisitions.length + 1).padStart(3, '0'),
            itemId: item.id,
            sku: item.sku || 'SKU-' + item.id,
            itemName: item.name,
            departmentId: item.departmentId || 'DEP_PROCUREMENT',
            departmentName: item.category || 'General Hotel Operations',
            currentStock: item.quantity,
            maxCapacity: item.maxCapacity,
            depletionPercentage: Math.round(ratio * 100),
            severity,
            reorderQuantity: reorderQty,
            unitPrice: item.unitCost,
            estimatedCost: estCost,
            approverRoleId: approverInfo.roleId,
            assignedApproverTitle: approverInfo.title,
            tierLevel: approverInfo.tierLevel,
            slaHours: approverInfo.slaHours,
            approvalStartedAt: nowStr,
            approvalDeadline: deadlineStr,
            preferredVendorId: item.supplierCode || 'SUP-01',
            preferredVendorCode: item.supplierCode || 'SUP-01',
            preferredVendorName: item.supplier || 'Approved Hotel Supplier',
            status: approverInfo.tierLevel === 1 ? 'PENDING_APPROVAL' : (approverInfo.tierLevel === 2 ? 'ESCALATED_TO_HM' : 'ESCALATED_TO_CEO'),
            deliveryLocation: 'Hotel Capitol Main Loading Bay 1',
            requiredEta: new Date(Date.now() + (2 * 86400000)).toISOString().slice(0, 10),
            approvalHistory: [
              {
                step: 'STOCK_ALERT_TRIGGERED',
                actor: 'AI Stock Monitoring Agent',
                role: 'AI_AGENT',
                decision: 'ALERT_DISPATCHED',
                timestamp: nowStr,
                notes: `Depletion crossed ${Math.round(ratio * 100)}% threshold (${severity}). Reorder recommendation generated.`
              }
            ],
            lpo: null,
            invoice: null,
            delivery: { milestone: 'NOT_STARTED', history: [] },
            receiving: null,
            payment: null,
            auditPdf: null
          };

          newRequisitions.unshift(newReq);
          alertsTriggered++;
          this.addAudit('AI_STOCK_DEPLETION_ALERT', `${item.name} (${item.id})`, `Stock ratio ${Math.round(ratio*100)}% triggered ${severity} alert (Est: ₦${estCost.toLocaleString()})`, 'AI Stock Monitor', 'AI Automation', null, newReq, 'Autonomous depletion alert');
        }
      }
    });

    this.setState(s => ({
      ...s,
      inventory: updatedInventory,
      procurementRequisitions: newRequisitions
    }));

    return { alertsTriggered, count: newRequisitions.length };
  }

  // STAGE 2 & 3: Managerial Approval & Dynamic Escalation Evaluation
  processRequisitionApproval(reqId, action, actorRole = 'ROLE_AM', actorName = 'Admin Manager', notes = '') {
    const existing = (this.state.procurementRequisitions || []).find(r => r.id === reqId);
    if (!existing) throw new Error(`Requisition ${reqId} not found`);

    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const cost = existing.estimatedCost;
    let nextStatus = existing.status;
    let escalationReason = null;
    let generatedLpo = existing.lpo;

    if (action === 'APPROVE') {
      // Dynamic financial threshold & role boundary validation
      if ((actorRole === 'ROLE_AM' || actorRole === 'ADMIN_OPERATIONS_MANAGER') && cost > 1000000) {
        // Exceeds AM ₦1,000,000 threshold -> Escalate automatically to HM
        nextStatus = 'ESCALATED_TO_HM';
        escalationReason = `Total procurement value (₦${cost.toLocaleString()}) exceeds Admin Manager threshold of ₦1,000,000. System escalated to Hotel General Manager.`;
      } else if ((actorRole === 'ROLE_HM' || actorRole === 'HOTEL_MANAGER') && cost > 5000000) {
        // Exceeds HM ₦5,000,000 threshold -> Escalate automatically to CEO/COO
        nextStatus = 'ESCALATED_TO_CEO';
        escalationReason = `Total procurement value (₦${cost.toLocaleString()}) exceeds Hotel Manager threshold of ₦5,000,000. System escalated to CEO / COO for terminal sign-off.`;
      } else {
        // Authorized approval reached! Generate LPO draft autonomously (Stage 4)
        nextStatus = 'APPROVED';
        const lpoNumber = `LPO-CAPITOL-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`;
        generatedLpo = {
          lpoNumber,
          generatedAt: nowStr,
          dispatchedAt: null,
          requestedBy: null,
          sku: existing.sku,
          quantity: existing.reorderQuantity,
          unitPrice: existing.unitPrice,
          estimatedTotal: existing.estimatedCost,
          requiredEta: existing.requiredEta,
          vendorContact: `${existing.preferredVendorName} (${existing.preferredVendorCode})`
        };
      }
    } else if (action === 'ESCALATE') {
      if (existing.tierLevel === 1 || existing.status === 'PENDING_APPROVAL') {
        nextStatus = 'ESCALATED_TO_HM';
        escalationReason = notes || 'Manually escalated by Admin Manager for Hotel Manager departmental budget review.';
      } else {
        nextStatus = 'ESCALATED_TO_CEO';
        escalationReason = notes || 'Escalated to Chief Executive Officer / Chief Operating Officer for executive sign-off.';
      }
    } else if (action === 'REJECT') {
      nextStatus = 'REJECTED';
    }

    const updatedHistory = [
      ...(existing.approvalHistory || []),
      {
        step: escalationReason ? 'ESCALATION_EVALUATION' : 'APPROVAL_GATEWAY',
        actor: actorName,
        role: actorRole,
        decision: nextStatus,
        timestamp: nowStr,
        notes: escalationReason || notes || `Decision ${action} recorded by ${actorName} (${actorRole}).`
      }
    ];

    const updatedReq = {
      ...existing,
      status: nextStatus,
      lpo: generatedLpo,
      approvalHistory: updatedHistory
    };

    this.setState(s => ({
      ...s,
      procurementRequisitions: (s.procurementRequisitions || []).map(r => r.id === reqId ? updatedReq : r)
    }));

    this.addAudit('REQUISITION_APPROVAL_DECISION', `${reqId} (₦${cost.toLocaleString()})`, `Action: ${action} → New Status: ${nextStatus}`, actorName, 'Procurement Management', existing, updatedReq, escalationReason || notes);
    return updatedReq;
  }

  // STAGE 5: LPO Review & Order Dispatch
  dispatchLPOToVendor(reqId, actorName = 'Seyi Adeyemi (Admin Manager)') {
    const existing = (this.state.procurementRequisitions || []).find(r => r.id === reqId);
    if (!existing) throw new Error(`Requisition ${reqId} not found`);
    if (existing.status !== 'APPROVED' || !existing.lpo) {
      throw new Error(`Requisition ${reqId} must be in APPROVED state with generated LPO before dispatch.`);
    }

    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const updatedLpo = {
      ...existing.lpo,
      dispatchedAt: nowStr,
      requestedBy: actorName
    };

    const updatedReq = {
      ...existing,
      status: 'LPO_REQUESTED',
      lpo: updatedLpo,
      approvalHistory: [
        ...(existing.approvalHistory || []),
        {
          step: 'LPO_REVIEW_AND_DISPATCH',
          actor: actorName,
          role: 'ROLE_AM',
          decision: 'REQUEST_ORDER',
          timestamp: nowStr,
          notes: `LPO ${updatedLpo.lpoNumber} dispatched to official Vendor Portal (${existing.preferredVendorName}).`
        }
      ]
    };

    // Also sync to procurementOrders for vendor portal visibility
    const newOrder = {
      id: updatedLpo.lpoNumber,
      reqId: existing.id,
      supplierCode: existing.preferredVendorCode,
      supplierName: existing.preferredVendorName,
      productId: existing.itemId,
      productName: existing.itemName,
      quantity: existing.reorderQuantity,
      unit: 'units',
      unitPrice: existing.unitPrice,
      totalAmount: existing.estimatedCost,
      deliveryLocation: existing.deliveryLocation,
      requiredDeliveryDate: existing.requiredEta,
      notes: `Autonomously dispatched LPO ${updatedLpo.lpoNumber}`,
      status: 'REQUESTED',
      createdAt: nowStr,
      createdBy: actorName
    };

    this.setState(s => ({
      ...s,
      procurementRequisitions: (s.procurementRequisitions || []).map(r => r.id === reqId ? updatedReq : r),
      procurementOrders: [newOrder, ...(s.procurementOrders || []).filter(o => o.id !== newOrder.id)]
    }));

    this.addAudit('LPO_DISPATCHED_TO_VENDOR', `${updatedLpo.lpoNumber} (${existing.preferredVendorCode})`, `Dispatched LPO order to ${existing.preferredVendorName} (₦${existing.estimatedCost.toLocaleString()})`, actorName, 'Procurement Management', existing, updatedReq, 'Vendor dispatch');
    return updatedReq;
  }

  // STAGE 6: Vendor Generate Invoice & Dual-Stream Broadcast
  submitVendorInvoice(reqId, customInvoiceData = null) {
    const existing = (this.state.procurementRequisitions || []).find(r => r.id === reqId);
    if (!existing) throw new Error(`Requisition ${reqId} not found`);

    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const invNumber = customInvoiceData?.invoiceNumber || `INV-${existing.preferredVendorCode}-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`;

    const newInvoice = {
      invoiceNumber: invNumber,
      orderId: existing.lpo?.lpoNumber || existing.id,
      supplierCode: existing.preferredVendorCode,
      supplierName: existing.preferredVendorName,
      generatedAt: nowStr,
      lineItems: [
        {
          sku: existing.sku,
          description: existing.itemName,
          unitPrice: existing.unitPrice,
          quantity: existing.reorderQuantity,
          total: existing.estimatedCost
        }
      ],
      totalAmount: existing.estimatedCost,
      status: 'UNDER_REVIEW',
      procurementVerifiedAt: null,
      procurementVerifiedBy: null
    };

    const updatedReq = {
      ...existing,
      status: 'VENDOR_INVOICE_GENERATED',
      invoice: newInvoice,
      approvalHistory: [
        ...(existing.approvalHistory || []),
        {
          step: 'VENDOR_INVOICE_GENERATION',
          actor: existing.preferredVendorName,
          role: 'VENDOR_PORTAL_USER',
          decision: 'GENERATE_INVOICE',
          timestamp: nowStr,
          notes: `Vendor digital invoice ${invNumber} generated using contracted rate (₦${existing.estimatedCost.toLocaleString()}). Broadcasted to Management & Procurement.`
        }
      ]
    };

    this.setState(s => ({
      ...s,
      procurementRequisitions: (s.procurementRequisitions || []).map(r => r.id === reqId ? updatedReq : r),
      vendorInvoices: [
        {
          id: 'INV-' + Date.now().toString().slice(-4),
          invoiceNumber: invNumber,
          orderId: existing.lpo?.lpoNumber || existing.id,
          supplierCode: existing.preferredVendorCode,
          supplierName: existing.preferredVendorName,
          items: newInvoice.lineItems,
          totalAmount: newInvoice.totalAmount,
          issueDate: new Date().toISOString().slice(0, 10),
          status: 'PENDING_APPROVAL',
          goodsReceivedConfirmed: false,
          procurementApprovedBy: null,
          procurementApprovedAt: null,
          paymentRef: null
        },
        ...(s.vendorInvoices || [])
      ]
    }));

    this.addAudit('VENDOR_INVOICE_BROADCAST', `${invNumber} (${existing.preferredVendorCode})`, `Dual-stream invoice received: broadcasted simultaneously to Hotel Management & Procurement`, existing.preferredVendorName, 'Vendor Invoicing', null, updatedReq, 'Invoice acceptance');
    return updatedReq;
  }

  // STAGE 7: Vendor Order Confirmation & Logistics Initialization
  confirmVendorOrder(reqId, actorName = 'Supplier Partner') {
    const existing = (this.state.procurementRequisitions || []).find(r => r.id === reqId);
    if (!existing) throw new Error(`Requisition ${reqId} not found`);

    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const updatedDelivery = {
      milestone: 'Order Confirmed',
      updatedBy: actorName,
      updatedAt: nowStr,
      history: [
        { status: 'Order Confirmed', time: timeStr, note: 'Supplier confirmed production and delivery schedule.' }
      ]
    };

    const updatedReq = {
      ...existing,
      status: 'ORDER_CONFIRMED',
      delivery: updatedDelivery,
      approvalHistory: [
        ...(existing.approvalHistory || []),
        {
          step: 'VENDOR_ORDER_CONFIRMATION',
          actor: actorName,
          role: 'VENDOR_PORTAL_USER',
          decision: 'CONFIRM_ORDER',
          timestamp: nowStr,
          notes: 'Supplier acknowledged order and scheduled dispatch logistics.'
        }
      ]
    };

    this.setState(s => ({
      ...s,
      procurementRequisitions: (s.procurementRequisitions || []).map(r => r.id === reqId ? updatedReq : r)
    }));

    this.addAudit('VENDOR_ORDER_CONFIRMED', `${existing.lpo?.lpoNumber || reqId}`, `Vendor confirmed order. Logistics pipeline initialized.`, actorName, 'Vendor Portal', null, updatedReq, 'Order confirmation');
    return updatedReq;
  }

  // STAGE 8 & 9: Dual-Stream Invoice Verification by Procurement
  verifyProcurementInvoice(reqId, reviewerName = 'Kunle Adeleke (Procurement Supervisor)') {
    const existing = (this.state.procurementRequisitions || []).find(r => r.id === reqId);
    if (!existing) throw new Error(`Requisition ${reqId} not found`);

    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const updatedInvoice = existing.invoice ? {
      ...existing.invoice,
      status: 'PROCUREMENT_VERIFIED',
      procurementVerifiedAt: nowStr,
      procurementVerifiedBy: reviewerName
    } : null;

    const updatedReq = {
      ...existing,
      status: 'PROCUREMENT_VERIFIED', // Transitions to AP_PAYMENT_QUEUED with payment hold
      invoice: updatedInvoice,
      payment: {
        status: 'HOLD_PENDING_RECEIPT',
        amount: existing.estimatedCost,
        paymentRef: `PAY-REF-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`,
        queuedAt: nowStr,
        notes: 'Mandatory 2-way payment hold: awaiting physical dock receiving confirmation before payout execution.'
      },
      approvalHistory: [
        ...(existing.approvalHistory || []),
        {
          step: 'PROCUREMENT_AUDIT_REVIEW',
          actor: reviewerName,
          role: 'ROLE_SUP_PROCUREMENT',
          decision: 'SUBMIT_TO_AP',
          timestamp: nowStr,
          notes: '3-way match verified (LPO, contracted price, invoice qty). Queued for Accounts Payable with payment release hold.'
        }
      ]
    };

    this.setState(s => ({
      ...s,
      procurementRequisitions: (s.procurementRequisitions || []).map(r => r.id === reqId ? updatedReq : r)
    }));

    this.addAudit('PROCUREMENT_INVOICE_VERIFIED', `${existing.invoice?.invoiceNumber || reqId}`, `Invoice verified and queued to AP with mandatory receiving hold`, reviewerName, 'Vendor Procurement', existing, updatedReq, 'Procurement audit validation');
    return updatedReq;
  }

  // STAGE 11: Vendor Delivery Lifecycle Milestone Stepper (7 Stages)
  updateDeliveryMilestone(reqId, milestone, agentName = 'Logistics Partner', notes = '') {
    const existing = (this.state.procurementRequisitions || []).find(r => r.id === reqId);
    if (!existing) throw new Error(`Requisition ${reqId} not found`);

    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const currentHistory = existing.delivery?.history || [];
    const updatedDelivery = {
      milestone,
      updatedBy: agentName,
      updatedAt: nowStr,
      history: [
        ...currentHistory,
        { status: milestone, time: timeStr, note: notes || `Milestone reached: ${milestone}` }
      ]
    };

    // If milestone is 'Goods Delivered', flag for dock receiving
    let nextStatus = existing.status;
    if (milestone === 'Goods Delivered') {
      nextStatus = 'GOODS_DELIVERED';
    }

    const updatedReq = {
      ...existing,
      status: nextStatus,
      delivery: updatedDelivery,
      approvalHistory: [
        ...(existing.approvalHistory || []),
        {
          step: 'DELIVERY_FULFILLMENT',
          actor: agentName,
          role: 'VENDOR_LOGISTICS',
          decision: milestone,
          timestamp: nowStr,
          notes: notes || `Transit milestone: ${milestone}`
        }
      ]
    };

    this.setState(s => ({
      ...s,
      procurementRequisitions: (s.procurementRequisitions || []).map(r => r.id === reqId ? updatedReq : r)
    }));

    this.addAudit('DELIVERY_MILESTONE_UPDATED', `${existing.lpo?.lpoNumber || reqId} → ${milestone}`, notes || `Logistics progress updated to ${milestone}`, agentName, 'Vendor Logistics', null, updatedReq, 'Delivery tracking update');
    return updatedReq;
  }

  // STAGE 12: Physical Dock Receiving & Inspection Confirmation
  confirmPhysicalStoreReceipt(reqId, receiptData = {}) {
    const existing = (this.state.procurementRequisitions || []).find(r => r.id === reqId);
    if (!existing) throw new Error(`Requisition ${reqId} not found`);

    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const inspectorName = receiptData.inspectorName || 'Amara Nwosu (Head of Housekeeping)';
    const inspectorRole = receiptData.inspectorRole || 'ROLE_SUP_HOUSEKEEPING';
    const waybillNumber = receiptData.waybillNumber || `WB-${existing.preferredVendorCode}-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`;
    const itemsAcceptedQuantity = Number(receiptData.itemsAcceptedQuantity) || existing.reorderQuantity;
    const conditionStatus = receiptData.conditionStatus || 'PASSED';
    const dockNotes = receiptData.dockNotes || 'All delivered goods physically inspected and verified in pristine condition at Hotel Capitol loading dock.';

    const receivingRecord = {
      inspectorName,
      inspectorRole,
      waybillNumber,
      itemsAcceptedQuantity,
      conditionStatus,
      dockNotes,
      confirmedAt: nowStr
    };

    // RELEASE THE AP PAYMENT HOLD!
    const updatedPayment = existing.payment ? {
      ...existing.payment,
      status: 'READY_FOR_RELEASE',
      notes: `Physical receiving confirmed by ${inspectorName} (Waybill: ${waybillNumber}). Payout release unlocked.`
    } : {
      status: 'READY_FOR_RELEASE',
      amount: existing.estimatedCost,
      paymentRef: `PAY-REF-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`,
      notes: `Physical receiving confirmed. Payout release unlocked.`
    };

    const updatedReq = {
      ...existing,
      status: 'RECEIPT_CONFIRMED',
      receiving: receivingRecord,
      payment: updatedPayment,
      approvalHistory: [
        ...(existing.approvalHistory || []),
        {
          step: 'PHYSICAL_RECEIPT_CONFIRMATION',
          actor: inspectorName,
          role: inspectorRole,
          decision: 'CONFIRM_RECEIPT',
          timestamp: nowStr,
          notes: `Inspection PASSED (${itemsAcceptedQuantity} units accepted). Waybill: ${waybillNumber}. Accounts Payable payment release unlocked.`
        }
      ]
    };

    this.setState(s => ({
      ...s,
      procurementRequisitions: (s.procurementRequisitions || []).map(r => r.id === reqId ? updatedReq : r)
    }));

    this.addAudit('PHYSICAL_RECEIPT_CONFIRMED', `${waybillNumber} (${existing.itemName})`, `Physical inspection passed: ${itemsAcceptedQuantity} units accepted by ${inspectorName}`, inspectorName, 'Stores & Receiving', existing, updatedReq, dockNotes);
    return updatedReq;
  }

  // STAGE 13 & 14: Simulated AP Payment Release, Inventory Restock & PDF Closeout
  releaseAPPayment(reqId, paymentData = {}) {
    const existing = (this.state.procurementRequisitions || []).find(r => r.id === reqId);
    if (!existing) throw new Error(`Requisition ${reqId} not found`);

    // STRICT PRECONDITION ENFORCEMENT (Mandatory Two-Way Payment Release Hold)
    if (!existing.receiving || existing.receiving.conditionStatus !== 'PASSED') {
      throw new Error('Precondition Failed (412): Physical goods delivery has not been confirmed by Stores/Procurement. Accounts Payable payment release is strictly blocked.');
    }

    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const officerName = paymentData.officerName || 'Ngozi Okonjo (Chief Accountant)';
    const paymentRef = paymentData.paymentRef || existing.payment?.paymentRef || `NIP-TXN-${new Date().getFullYear()}${String(Math.floor(Math.random()*900000)+100000)}`;
    const paymentChannel = paymentData.paymentChannel || 'NIBSS Instant Payment (Zenith Bank Corporate Direct)';

    const finalPayment = {
      paymentRef,
      amount: existing.estimatedCost,
      status: 'RELEASED',
      releasedAt: nowStr,
      officerName,
      paymentChannel
    };

    const pdfDocId = `AUD-PDF-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`;
    const auditPdf = {
      generatedAt: nowStr,
      pdfDocId,
      downloadUrl: `#audit-pdf-cert-${reqId}`,
      closeoutStatus: 'CLOSED'
    };

    const updatedReq = {
      ...existing,
      status: 'AUDIT_CLOSED',
      payment: finalPayment,
      auditPdf,
      approvalHistory: [
        ...(existing.approvalHistory || []),
        {
          step: 'AP_PAYMENT_RELEASE',
          actor: officerName,
          role: 'ROLE_SUP_ACCOUNTANT',
          decision: 'RELEASE_PAYMENT',
          timestamp: nowStr,
          notes: `Simulated disbursement of ₦${existing.estimatedCost.toLocaleString()} released via ${paymentChannel}. Ref: ${paymentRef}.`
        },
        {
          step: 'CLOSEOUT_AUDIT_PDF_GENERATION',
          actor: 'System AI Audit Engine',
          role: 'AI_AGENT',
          decision: 'TRANSACTION_CLOSED',
          timestamp: nowStr,
          notes: `Official Certificate of Procurement Audit Closeout generated (${pdfDocId}). Inventory stock balance updated.`
        }
      ]
    };

    // Auto-update inventory quantity back to target capacity
    const updatedInventory = (this.state.inventory || []).map(inv => {
      if (inv.id === existing.itemId) {
        const newQty = Math.min(inv.maxCapacity, inv.quantity + existing.reorderQuantity);
        return {
          ...inv,
          quantity: newQty,
          status: 'NORMAL'
        };
      }
      return inv;
    });

    this.setState(s => ({
      ...s,
      procurementRequisitions: (s.procurementRequisitions || []).map(r => r.id === reqId ? updatedReq : r),
      inventory: updatedInventory,
      accountPayments: [
        {
          id: 'PAY-' + Date.now().toString().slice(-4),
          paymentRef,
          supplierCode: existing.preferredVendorCode,
          supplierName: existing.preferredVendorName,
          invoiceRef: existing.invoice?.invoiceNumber || existing.id,
          receiptRef: `RCPT-${existing.preferredVendorCode}-${Date.now().toString().slice(-4)}`,
          amount: existing.estimatedCost,
          status: 'CONFIRMED_PAID',
          paidAt: nowStr,
          paymentMethod: paymentChannel,
          officerName,
          notes: `End-to-end autonomous procurement workflow completed for ${existing.itemName}`
        },
        ...(s.accountPayments || [])
      ]
    }));

    this.addAudit('PAYMENT_RELEASED_AUDIT_CLOSED', `${paymentRef} (₦${existing.estimatedCost.toLocaleString()})`, `Payment disbursed to ${existing.preferredVendorName}. Inventory restocked and audit trail closed.`, officerName, 'Finance & Accounts', existing, updatedReq, 'Simulated financial settlement');
    return updatedReq;
  }

  // STAGE 14: Simulated PDF Audit Closeout Certificate Generator
  generateSimulatedAuditPDF(reqId) {
    const req = (this.state.procurementRequisitions || []).find(r => r.id === reqId);
    if (!req) return null;

    const certHtml = `
      <div style="font-family: Georgia, serif; max-width: 800px; margin: auto; padding: 32px; background: #070d18; color: #f8fafc; border: 2px solid #d4af37; border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
        
        <!-- SIMULATION BANNER -->
        <div style="background: rgba(212,175,55,0.15); border: 1px dashed rgba(212,175,55,0.6); padding: 6px 12px; border-radius: 8px; text-align: center; margin-bottom: 20px; font-size: 11px; font-weight: bold; letter-spacing: 2px; color: #d4af37; text-transform: uppercase;">
          🛡️ SIMULATION / DEMONSTRATION RECORD — NOT A REAL FINANCIAL OR BANKING DOCUMENT
        </div>

        <div style="border-bottom: 2px solid rgba(212,175,55,0.4); padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #d4af37; font-weight: bold;">HOTEL CAPITOL — 6 ANIMASHAUN CLOSE, IKEJA, LAGOS</div>
            <h1 style="font-size: 22px; margin: 4px 0; color: #ffffff;">CERTIFICATE OF PROCUREMENT AUDIT CLOSEOUT</h1>
            <div style="font-size: 12px; color: #94a3b8;">Autonomous AI Stock Monitoring & Two-Way Settlement Audit Trail</div>
          </div>
          <div style="text-align: right;">
            <div style="font-family: monospace; font-size: 14px; font-weight: bold; color: #d4af37;">${req.auditPdf?.pdfDocId || 'AUD-PDF-2026'}</div>
            <div style="font-size: 11px; color: #10b981; font-weight: bold;">● AUDIT CLOSED & VERIFIED</div>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(212,175,55,0.2); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <h3 style="font-size: 13px; color: #d4af37; text-transform: uppercase; margin-top: 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">1. Requisition & Item Specification</h3>
          <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
            <tr><td style="color: #94a3b8; padding: 4px 0; width: 35%;">Requisition ID:</td><td style="font-weight: bold; font-family: monospace;">${req.id}</td></tr>
            <tr><td style="color: #94a3b8; padding: 4px 0;">Item Name / SKU:</td><td style="font-weight: bold;">${req.itemName} (${req.sku})</td></tr>
            <tr><td style="color: #94a3b8; padding: 4px 0;">Department:</td><td>${req.departmentName} (${req.departmentId})</td></tr>
            <tr><td style="color: #94a3b8; padding: 4px 0;">Reorder Quantity:</td><td>${req.reorderQuantity} units</td></tr>
            <tr><td style="color: #94a3b8; padding: 4px 0;">Contracted Unit Price:</td><td style="color: #d4af37;">₦${(req.unitPrice || 0).toLocaleString()}</td></tr>
            <tr><td style="color: #94a3b8; padding: 4px 0;">Total Procurement Value:</td><td style="font-size: 14px; font-weight: bold; color: #d4af37;">₦${(req.estimatedCost || 0).toLocaleString()}</td></tr>
          </table>
        </div>

        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(212,175,55,0.2); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <h3 style="font-size: 13px; color: #d4af37; text-transform: uppercase; margin-top: 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">2. Managerial Approval & Financial Authority</h3>
          <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
            <tr><td style="color: #94a3b8; padding: 4px 0; width: 35%;">Approval Authority:</td><td style="font-weight: bold;">${req.assignedApproverTitle} (Tier ${req.tierLevel})</td></tr>
            <tr><td style="color: #94a3b8; padding: 4px 0;">Approval Started:</td><td>${req.approvalStartedAt}</td></tr>
            <tr><td style="color: #94a3b8; padding: 4px 0;">SLA Compliance:</td><td style="color: #10b981;">✓ Approved within ${req.slaHours}h SLA window</td></tr>
            <tr><td style="color: #94a3b8; padding: 4px 0;">LPO Generated:</td><td style="font-family: monospace; color: #d4af37;">${req.lpo?.lpoNumber || 'N/A'}</td></tr>
          </table>
        </div>

        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(212,175,55,0.2); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <h3 style="font-size: 13px; color: #d4af37; text-transform: uppercase; margin-top: 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">3. Physical Receiving & Accounts Settlement</h3>
          <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
            <tr><td style="color: #94a3b8; padding: 4px 0; width: 35%;">Supplier:</td><td style="font-weight: bold;">${req.preferredVendorName} (${req.preferredVendorCode})</td></tr>
            <tr><td style="color: #94a3b8; padding: 4px 0;">Vendor Invoice Ref:</td><td style="font-family: monospace;">${req.invoice?.invoiceNumber || 'N/A'}</td></tr>
            <tr><td style="color: #94a3b8; padding: 4px 0;">Waybill Number:</td><td style="font-family: monospace;">${req.receiving?.waybillNumber || 'N/A'}</td></tr>
            <tr><td style="color: #94a3b8; padding: 4px 0;">Stores Inspector:</td><td>${req.receiving?.inspectorName || 'Stores Receiving Clerk'}</td></tr>
            <tr><td style="color: #94a3b8; padding: 4px 0;">Inspection Status:</td><td style="color: #10b981; font-weight: bold;">✓ ${req.receiving?.conditionStatus || 'PASSED'} (${req.receiving?.itemsAcceptedQuantity || req.reorderQuantity} units verified)</td></tr>
            <tr><td style="color: #94a3b8; padding: 4px 0;">Synthetic Bank Reference:</td><td style="font-family: monospace; color: #d4af37; font-weight: bold;">${req.payment?.paymentRef || 'N/A'}</td></tr>
            <tr><td style="color: #94a3b8; padding: 4px 0;">Disbursement Method:</td><td>${req.payment?.paymentChannel || 'Simulated NIBSS Corporate Transfer'}</td></tr>
            <tr><td style="color: #94a3b8; padding: 4px 0;">Disbursement Officer:</td><td>${req.payment?.officerName || 'Chief Accountant'}</td></tr>
          </table>
        </div>

        <div style="border-top: 1px dashed rgba(212,175,55,0.4); padding-top: 16px; margin-top: 24px; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8;">
          <div>Simulation Signature: <strong style="color: #ffffff; font-family: monospace;">SHA256-SIM-HC-${req.id}-${Date.now().toString().slice(-6)}</strong></div>
          <div style="color: #d4af37;">Hotel Capitol ERP Simulation Engine · Lagos, Nigeria</div>
        </div>
      </div>
    `;

    return {
      docId: req.auditPdf?.pdfDocId || 'AUD-PDF-2026',
      reqId: req.id,
      htmlMarkup: certHtml
    };
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


