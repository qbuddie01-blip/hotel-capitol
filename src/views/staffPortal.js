/**
 * HOTEL CAPITOL — HOTEL STAFF PORTAL
 * 6 Animashaun Close, Ikeja, Lagos
 * Tasks, Rooms, Attendance, Schedule, Shift Swap & AI Performance
 */

import { getIcon, renderIntercomRoundBadge } from '../assets/icons.js';
import { store } from '../store/state.js';
import { automationEngine } from '../services/automationRules.js';


let isSimulationLoggedIn = true;
let simulationLoginError = '';
let activeDepartmentFilter = 'ALL';

let activeStaffTab = 'tasks'; // 'profile' | 'tasks' | 'rooms' | 'requests' | 'schedule' | 'performance'
let staffIntercomState = 'ready'; // 'ready' | 'active' | 'delivered'

export function initStaffPortal() {
  
  window.submitSimulationLogin = (e) => {
    e.preventDefault();
    const user = document.getElementById('sim-username')?.value.trim();
    const pass = document.getElementById('sim-password')?.value.trim();

    if ((user.toLowerCase() === 'porter' && pass === 'Capitol 123') || (user && pass)) {
      isSimulationLoggedIn = true;
      simulationLoginError = '';
      automationEngine.playChime('success');
      automationEngine.showToast('Demo Login Verified', `Logged in as ${user} (Simulation Mode)`, 'success');
      if (window.renderApp) window.renderApp();
    } else {
      simulationLoginError = 'Invalid credentials. Use Username: Porter / Password: Capitol 123';
      if (window.renderApp) window.renderApp();
    }
  };

  window.simulationLogout = () => {
    isSimulationLoggedIn = false;
    if (window.renderApp) window.renderApp();
  };

  window.setStaffDepartmentFilter = (dept) => {
    activeDepartmentFilter = dept;
    if (window.renderApp) window.renderApp();
  };

  window.navigateStaffTab = (tab) => {
    activeStaffTab = tab;
    if (window.renderApp) window.renderApp();
  };

  window.triggerStaffIntercom = () => {
    staffIntercomState = 'active';
    if (window.renderApp) window.renderApp();
    automationEngine.playChime('bell');
    
    // Open Intercom modal
    window.toggleIntercomModal(true);

    // Simulate active transition to delivered upon transmission
    setTimeout(() => {
      staffIntercomState = 'delivered';
      if (window.renderApp) window.renderApp();
      automationEngine.showToast('Intercom Connected', 'Tolani Radio link established on secure staff channel.', 'success');
      
      setTimeout(() => {
        staffIntercomState = 'ready';
        if (window.renderApp) window.renderApp();
      }, 3000);
    }, 2000);
  };

  window.toggleTaskStatus = (taskId) => {
    const state = store.getState();
    const task = state.staffTasks.find(t => t.id === taskId);
    if (!task) return;

    let nextStatus = 'IN PROGRESS';
    if (task.status === 'PENDING') nextStatus = 'IN PROGRESS';
    else if (task.status === 'IN PROGRESS') nextStatus = 'COMPLETED';
    else if (task.status === 'COMPLETED') nextStatus = 'PENDING';

    const completedAt = nextStatus === 'COMPLETED' ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : null;

    store.setState(s => ({
      ...s,
      staffTasks: s.staffTasks.map(t => t.id === taskId ? { ...t, status: nextStatus, completedAt } : t)
    }));

    automationEngine.playChime(nextStatus === 'COMPLETED' ? 'success' : 'bell');
    automationEngine.showToast('Task Updated', `Task ${taskId} updated to ${nextStatus}`, 'success');
    store.addAudit('Task Progression', `${taskId} (${nextStatus})`, `Updated by ${store.getActiveStaff().name}`);
    if (window.renderApp) window.renderApp();
  };

  window.updateRoomCondition = (roomNumber, condition, status) => {
    store.setState(s => ({
      ...s,
      rooms: s.rooms.map(r => r.number === roomNumber ? { ...r, condition, status: status || r.status } : r)
    }));
    automationEngine.playChime('bell');
    automationEngine.showToast('Room Status Updated', `Room ${roomNumber} set to: ${condition}`, 'info');
    store.addAudit('Room Condition Updated', `Room ${roomNumber}`, `Status changed to ${condition} by ${store.getActiveStaff().name}`);
    if (window.renderApp) window.renderApp();
  };

  window.submitShiftSwap = () => {
    const targetStaffId = document.getElementById('swap-target-staff')?.value;
    const swapDate = document.getElementById('swap-date')?.value || '2026-08-18';
    const reason = document.getElementById('swap-reason')?.value || 'Personal emergency';

    const staff = store.getActiveStaff();
    const targetStaff = store.getState().staffMembers.find(s => s.id === targetStaffId) || store.getState().staffMembers[1];

    const newSwap = {
      id: 'SWP-' + (store.getState().shiftSwapRequests.length + 101),
      requesterId: staff.id,
      requesterName: staff.name,
      targetStaffId: targetStaff.id,
      targetStaffName: targetStaff.name,
      date: swapDate,
      reason,
      status: 'PENDING_APPROVAL',
      supervisorNote: 'Awaiting Supervisor Tariq Alabi approval'
    };

    store.setState(s => ({
      ...s,
      shiftSwapRequests: [newSwap, ...s.shiftSwapRequests]
    }));

    automationEngine.playChime('bell');
    automationEngine.showToast('Swap Request Submitted', `Submitted shift swap request with ${targetStaff.name}. Sent to supervisor for review.`, 'success');
    store.addAudit('Shift Swap Requested', newSwap.id, `${staff.name} requested swap with ${targetStaff.name}`);
    if (window.renderApp) window.renderApp();
  };

  // Driver & VIP Chauffeur Actions
  window.driverAcceptTransport = (bookingId) => {
    store.driverAcceptTransport(bookingId, store.getActiveStaff().name);
    automationEngine.playChime('success');
    automationEngine.showToast('Dispatch Accepted', `Chauffeur transfer ${bookingId} accepted.`, 'success');
    if (window.renderApp) window.renderApp();
  };

  window.driverConfirmDestination = (bookingId) => {
    store.driverConfirmDestination(bookingId);
    automationEngine.showToast('Route Verified', `Destination verified for ${bookingId}.`, 'info');
    if (window.renderApp) window.renderApp();
  };

  window.driverConfirmSchedule = (bookingId) => {
    store.driverConfirmSchedule(bookingId);
    automationEngine.showToast('Schedule Confirmed', `Pickup schedule confirmed for ${bookingId}.`, 'success');
    if (window.renderApp) window.renderApp();
  };
}

export function renderStaffPortal() {
  const state = store.getState();
  const staff = store.getActiveStaff();

  // If Simulation Login is logged out, render the Demo Authentication screen (Section 17)
  if (!isSimulationLoggedIn) {
    return `
      <div class="container-custom py-12 max-w-md mx-auto animate-fade-in">
        <div class="glass-panel-gold p-8 rounded-3xl border-2 border-gold shadow-2xl text-center">
          <div class="w-16 h-16 rounded-2xl bg-gold/20 border border-gold flex items-center justify-center text-3xl mx-auto mb-4">
            🏨
          </div>
          <h2 class="text-2xl font-serif text-white font-bold mb-1">Hotel Capitol Staff Portal</h2>
          <div class="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs font-bold mb-6 tracking-wide">
            DEMO / SIMULATION LOGIN — NOT PRODUCTION AUTHENTICATION
          </div>

          <form onsubmit="window.submitSimulationLogin(event)" class="flex flex-col gap-4 text-left">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Username:</label>
              <input type="text" id="sim-username" class="input-custom text-sm" value="Porter" required />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Password:</label>
              <input type="password" id="sim-password" class="input-custom text-sm" value="Capitol 123" required />
            </div>

            ${simulationLoginError ? `
              <div class="text-xs text-red-400 font-semibold">${simulationLoginError}</div>
            ` : ''}

            <button type="submit" class="btn-primary py-3 px-6 text-sm font-bold shadow-xl mt-2 cursor-pointer">
              LOGIN TO SIMULATION →
            </button>
          </form>

          <div class="mt-6 pt-4 border-t border-white/10 text-xs text-slate-400">
            Demo Credentials: <strong class="text-gold">Porter</strong> / <strong class="text-gold">Capitol 123</strong>
          </div>
        </div>
      </div>
    `;
  }

  // Filter Tasks & Requests for active department
  const myTasks = (state.staffTasks || []).filter(t => t.staffId === staff.id || staff.role.includes('Head') || staff.role.includes('Supervisor') || staff.role.includes('Lead'));
  const myPendingCount = myTasks.filter(t => t.status !== 'COMPLETED').length;
  const myRooms = (state.rooms || []).filter(r => r.assignedTo === staff.name || staff.role.includes('Head') || staff.role.includes('Supervisor') || staff.role.includes('Lead'));
  const activeAlerts = (state.intercomAlerts || []).filter(a => a.status === 'WAITING');
  const schedule = state.schedule || [];
  const shiftSwaps = state.shiftSwaps || [];

  let tabContent = '';
  if (activeStaffTab === 'profile') {
    tabContent = renderStaffPersonalProfileTab(staff, state);
  } else if (activeStaffTab === 'tasks') {
    tabContent = renderStaffTasksTab(myTasks, staff);
  } else if (activeStaffTab === 'rooms') {
    tabContent = renderStaffRoomsTab(myRooms, staff);
  } else if (activeStaffTab === 'requests') {
    tabContent = renderStaffLiveRequestsTab(state, activeAlerts);
  } else if (activeStaffTab === 'schedule') {
    tabContent = renderStaffScheduleTab(schedule, shiftSwaps, staff);
  } else if (activeStaffTab === 'performance') {
    tabContent = renderStaffPerformanceTab(staff);
  }

  return `
    <div class="container-custom py-6">
      
      <!-- Top Staff Header -->
      <div class="glass-panel p-5 rounded-2xl mb-6 border border-gold/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="text-xs font-bold uppercase tracking-luxury text-gold">Department Operations Simulation</span>
            <span class="badge-gold text-xs font-bold">${staff.role}</span>
          </div>
          <h1 class="text-xl sm:text-2xl font-serif text-white font-bold">${staff.name} · Staff Dashboard</h1>
          <p class="text-xs text-slate-300 mt-0.5">Assigned Shift: <strong>${staff.shift}</strong> · Department: <strong class="capitalize text-gold">${staff.department}</strong></p>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-400 font-bold">Switch Role:</span>
            <select 
              class="input-custom text-xs py-1.5 px-3 bg-navy-950 text-gold border-gold/40 rounded-lg cursor-pointer"
              onchange="store.setActiveStaff(this.value); if(window.renderApp) window.renderApp();"
            >
              ${state.staffMembers.map(s => `
                <option value="${s.id}" ${s.id === staff.id ? 'selected' : ''}>
                  ${s.name} (${s.role})
                </option>
              `).join('')}
            </select>
          </div>
          <button class="btn-secondary text-xs py-1.5 px-3 text-red-400 cursor-pointer" onclick="window.simulationLogout()">
            Logout Demo
          </button>
        </div>
      </div>

      <!-- ACTIVE INCOMING INTERCOM ALERT BANNER (Section 16: Immediate Staff Acceptance) -->
      ${activeAlerts.length > 0 ? `
        <div class="glass-panel p-4 rounded-2xl mb-6 border-2 border-amber-400 bg-amber-950/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse shadow-2xl">
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 rounded-full bg-amber-400 animate-ping"></div>
            <div>
              <div class="text-xs font-bold text-amber-200 uppercase tracking-luxury">
                🚨 LIVE GUEST REQUEST: SUITE #${activeAlerts[0].roomNumber} (${activeAlerts[0].serviceType})
              </div>
              <div class="text-xs text-slate-200 mt-0.5">
                Guest: <strong>${activeAlerts[0].guestName}</strong> · Requested at ${activeAlerts[0].requestedAt}
              </div>
            </div>
          </div>
          <button 
            class="btn-primary py-2 px-6 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black cursor-pointer shadow-lg whitespace-nowrap"
            onclick="window.acceptIntercomRequest('${activeAlerts[0].id}')"
          >
            ✓ ACCEPT & CONNECT CALL
          </button>
        </div>
      ` : ''}

      <!-- NAVIGATION ON MOBILE & TABLET (Horizontal luxury scrolling bar) -->
      <div class="category-tabs-scroll show-mobile-tablet mb-5">
        <button 
          class="menu-btn-gold ${activeStaffTab === 'profile' ? 'active' : ''} whitespace-nowrap"
          onclick="window.navigateStaffTab('profile')"
        >
          <span>👤</span> <span>DAILY LOGIN</span>
        </button>

        <button 
          class="menu-btn-gold ${activeStaffTab === 'tasks' ? 'active' : ''} whitespace-nowrap"
          onclick="window.navigateStaffTab('tasks')"
        >
          <span>📋</span> <span>MY TASKS</span>
          ${myPendingCount > 0 ? `<span class="badge-gold text-[10px] ml-1.5">${myPendingCount}</span>` : ''}
        </button>

        <button 
          class="menu-btn-gold ${activeStaffTab === 'rooms' ? 'active' : ''} whitespace-nowrap"
          onclick="window.navigateStaffTab('rooms')"
        >
          <span>🛏️</span> <span>MY ROOM TURNOVER</span>
        </button>

        <button 
          class="menu-btn-gold ${activeStaffTab === 'requests' ? 'active' : ''} whitespace-nowrap"
          onclick="window.navigateStaffTab('requests')"
        >
          <span>🛎️</span> <span>LIVE SERVICE REQUESTS</span>
          ${activeAlerts.length > 0 ? `<span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping ml-1"></span>` : ''}
        </button>

        <button 
          class="menu-btn-gold ${activeStaffTab === 'schedule' ? 'active' : ''} whitespace-nowrap"
          onclick="window.navigateStaffTab('schedule')"
        >
          <span>📅</span> <span>WORK SCHEDULE</span>
        </button>

        <button 
          class="menu-btn-gold ${activeStaffTab === 'swaps' ? 'active' : ''} whitespace-nowrap"
          onclick="window.navigateStaffTab('swaps')"
        >
          <span>🔄</span> <span>SHIFT SWAPS</span>
        </button>

        <button 
          class="menu-btn-gold ${activeStaffTab === 'performance' ? 'active' : ''} whitespace-nowrap"
          onclick="window.navigateStaffTab('performance')"
        >
          <span>📊</span> <span>AI PERFORMANCE</span>
        </button>
      </div>

      <!-- MAIN WORKSPACE GRID: Vertically Stacked Navigation (Desktop Left) + Content (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        <!-- Left Sidebar: Vertically Stacked 7-Tier Menu (Desktop Only) -->
        <div class="lg:col-span-1 hidden lg:flex flex-col gap-2">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-luxury px-3 mb-1">Navigation Menu</div>
          
          <button 
            class="menu-btn-gold ${activeStaffTab === 'profile' ? 'active' : ''} text-left py-3 px-4 rounded-xl flex items-center gap-3 cursor-pointer min-h-[44px]"
            onclick="window.navigateStaffTab('profile')"
          >
            <span>👤</span> <span>DAILY LOGIN</span>
          </button>

          <button 
            class="menu-btn-gold ${activeStaffTab === 'tasks' ? 'active' : ''} text-left py-3 px-4 rounded-xl flex items-center justify-between gap-2 cursor-pointer min-h-[44px]"
            onclick="window.navigateStaffTab('tasks')"
          >
            <div class="flex items-center gap-3">
              <span>📋</span> <span>MY TASKS</span>
            </div>
            ${myPendingCount > 0 ? `<span class="badge-gold text-[10px]">${myPendingCount}</span>` : ''}
          </button>

          <button 
            class="menu-btn-gold ${activeStaffTab === 'rooms' ? 'active' : ''} text-left py-3 px-4 rounded-xl flex items-center gap-3 cursor-pointer min-h-[44px]"
            onclick="window.navigateStaffTab('rooms')"
          >
            <span>🛏️</span> <span>MY ROOM TURNOVER</span>
          </button>

          <button 
            class="menu-btn-gold ${activeStaffTab === 'requests' ? 'active' : ''} text-left py-3 px-4 rounded-xl flex items-center justify-between gap-2 cursor-pointer min-h-[44px]"
            onclick="window.navigateStaffTab('requests')"
          >
            <div class="flex items-center gap-3">
              <span>🛎️</span> <span>LIVE SERVICE REQUESTS</span>
            </div>
            ${activeAlerts.length > 0 ? `<span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>` : ''}
          </button>

          <button 
            class="menu-btn-gold ${activeStaffTab === 'schedule' ? 'active' : ''} text-left py-3 px-4 rounded-xl flex items-center gap-3 cursor-pointer min-h-[44px]"
            onclick="window.navigateStaffTab('schedule')"
          >
            <span>📅</span> <span>WORK SCHEDULE</span>
          </button>

          <button 
            class="menu-btn-gold ${activeStaffTab === 'swaps' ? 'active' : ''} text-left py-3 px-4 rounded-xl flex items-center gap-3 cursor-pointer min-h-[44px]"
            onclick="window.navigateStaffTab('swaps')"
          >
            <span>🔄</span> <span>SHIFT SWAPS</span>
          </button>

          <button 
            class="menu-btn-gold ${activeStaffTab === 'performance' ? 'active' : ''} text-left py-3 px-4 rounded-xl flex items-center gap-3 cursor-pointer min-h-[44px]"
            onclick="window.navigateStaffTab('performance')"
          >
            <span>📊</span> <span>AI PERFORMANCE</span>
          </button>
        </div>

        <!-- Right Main Workspace -->
        <div class="lg:col-span-3">
          ${tabContent}
        </div>

      </div>

    </div>
  `;
}


// 1. MY TASKS TAB (Spec #24)
function renderStaffTasksTab(myTasks, staff) {
  return `
    <div class="max-w-4xl mx-auto glass-panel p-6 rounded-2xl">
      <div class="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div>
          <h2 class="text-lg font-serif text-white font-bold">Today's Assigned Tasks</h2>
          <p class="text-xs text-slate-300">Tap status button to progress from PENDING → IN PROGRESS → COMPLETED.</p>
        </div>
        <button class="btn-secondary text-xs py-1.5 px-3" onclick="window.toggleIntercomModal(true)">
          📻 Call Supervisor
        </button>
      </div>

      <div class="flex flex-col gap-3">
        ${myTasks.map(t => `
          <div class="p-4 rounded-xl bg-navy-950 border ${t.status === 'COMPLETED' ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-white/10'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="badge-${t.priority === 'HIGH' ? 'critical' : 'gold'} text-[10px] py-0.5">
                  ${t.priority} PRIORITY
                </span>
                <strong class="text-white text-sm">Suite #${t.room} (${t.guestName})</strong>
              </div>
              <div class="text-slate-200 text-xs font-medium mb-1">${t.title}</div>
              
              <div class="flex items-center gap-3 text-[11px] text-slate-400 mt-1 flex-wrap">
                <span>Assigned: ${t.assignedTime}</span>
                ${t.completedAt ? `
                  <span class="text-emerald-400 font-semibold">· Completed at ${t.completedAt}</span>
                ` : `
                  <span class="flex items-center gap-1">
                    <span>⏱️ Prompt SLA (${t.targetMinutes || 15}m):</span>
                    <span 
                      class="badge-normal font-mono text-[10px] px-2 py-0.5" 
                      data-sla-deadline="${t.deadlineTimestamp || (Date.now() + (t.targetMinutes || 15)*60*1000)}"
                    >
                      ${t.targetMinutes || 15}:00 Remaining
                    </span>
                  </span>
                `}
              </div>
            </div>

            <button 
              class="${t.status === 'COMPLETED' ? 'badge-normal' : t.status === 'IN PROGRESS' ? 'badge-attention' : 'badge-pending'} px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer uppercase transition-all"
              onclick="window.toggleTaskStatus('${t.id}')"
              title="Click to advance status"
            >
              ${t.status === 'COMPLETED' ? '✓ COMPLETED' : t.status === 'IN PROGRESS' ? '⏳ IN PROGRESS' : '● PENDING'}
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// 2. ROOMS CHECKLIST TAB
function renderStaffRoomsTab(rooms) {
  return `
    <div class="max-w-4xl mx-auto glass-panel p-6 rounded-2xl">
      <div class="mb-4 pb-3 border-b border-white/10">
        <h2 class="text-lg font-serif text-white font-bold">Room Turnover & Cleanliness Log</h2>
        <p class="text-xs text-slate-300">Update suite condition directly after housekeeping.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${rooms.map(r => `
          <div class="p-4 rounded-xl bg-navy-950 border border-white/10 flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <div>
                <strong class="text-white text-base font-serif">Suite #${r.number}</strong>
                <span class="text-xs text-slate-400 ml-1">· ${r.type}</span>
              </div>
              <span class="badge-${r.status === 'OCCUPIED' ? 'gold' : r.status === 'VACANT_CLEAN' ? 'normal' : 'attention'} text-[10px]">
                ${r.status}
              </span>
            </div>

            <div class="text-xs text-slate-300 mb-3">
              Condition: <strong class="text-gold-light">${r.condition}</strong> ${r.guest ? `(${r.guest})` : ''}
            </div>

            <div class="flex items-center gap-2 pt-2 border-t border-white/5">
              <button 
                class="btn-secondary text-[11px] py-1 px-2.5 flex-1"
                onclick="window.updateRoomCondition('${r.number}', 'Clean & Inspected', 'VACANT_CLEAN')"
              >
                Mark Cleaned
              </button>
              <button 
                class="btn-secondary text-[11px] py-1 px-2.5 flex-1"
                onclick="window.updateRoomCondition('${r.number}', 'Cleaning in Progress', 'IN_SERVICE')"
              >
                Mark In-Service
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// 3. LIVE SERVICE REQUESTS & KITCHEN ORDERS QUEUE
function renderStaffRequestsTab(requests) {
  const orders = store.getState().orders || [];

  return `
    <div class="max-w-4xl mx-auto flex flex-col gap-6">

      <!-- KITCHEN & CULINARY ORDERS SECTION -->
      <div class="glass-panel p-6 rounded-2xl border border-gold/30">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-luxury text-gold">Kitchen Pass Station</span>
              <span class="badge-gold text-xs">${orders.filter(o => o.status !== 'DELIVERED').length} Active</span>
            </div>
            <h2 class="text-lg font-serif text-white font-bold mt-1">Live Restaurant & In-Suite Orders</h2>
          </div>
        </div>

        ${orders.length === 0 ? `
          <div class="text-xs text-slate-400">No active kitchen orders.</div>
        ` : `
          <div class="flex flex-col gap-3">
            ${orders.map(order => `
              <div class="p-4 rounded-xl bg-navy-950 border ${order.status === 'PREPARING' ? 'border-amber-400/80 shadow-md' : 'border-white/10'} flex flex-col gap-3 text-xs">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="badge-gold text-[10px]">Room ${order.roomNumber}</span>
                      <span class="badge-${order.status === 'DELIVERED' ? 'normal' : order.status === 'PREPARING' ? 'attention' : 'gold'} text-[10px]">
                        ${order.status.replace(/_/g, ' ')}
                      </span>
                      <strong class="text-white text-sm">${order.id} · ${order.guestName}</strong>
                    </div>
                    <div class="text-slate-300 font-semibold mb-1">
                      ${order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                    <div class="flex items-center gap-3 text-slate-400 text-[11px] flex-wrap">
                      <span>Placed: ${order.createdAt}</span>
                      <span>Total: <strong class="text-gold">₦${order.totalAmount.toLocaleString()}</strong></span>
                      <span>Est. Ready: ${order.estimatedReadyAt ? new Date(order.estimatedReadyAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : `~${order.preparationMinutes || 20}m`}</span>
                      <span>Est. Delivery: ${order.revisedDeliveryAt || order.estimatedDeliveryAt ? new Date(order.revisedDeliveryAt || order.estimatedDeliveryAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : `~${order.totalMinutes || 35}m`}</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 flex-wrap">
                    ${order.status === 'SUBMITTED' || order.status === 'ACCEPTED' ? `
                      <button 
                        class="btn-primary text-xs py-1.5 px-3 font-bold"
                        onclick="window.hotelCapitolStore.updateOrderStatus('${order.id}', 'PREPARING'); renderStaffPortal();"
                      >
                        👨‍🍳 Accept & Start Prep
                      </button>
                    ` : ''}

                    ${order.status === 'PREPARING' ? `
                      <button 
                        class="btn-primary text-xs py-1.5 px-3 font-bold"
                        onclick="window.hotelCapitolStore.updateOrderStatus('${order.id}', 'READY'); renderStaffPortal();"
                      >
                        🍽️ Mark Ready
                      </button>
                    ` : ''}

                    ${order.status === 'READY' ? `
                      <button 
                        class="btn-primary text-xs py-1.5 px-3 font-bold"
                        onclick="window.hotelCapitolStore.updateOrderStatus('${order.id}', 'OUT_FOR_DELIVERY'); renderStaffPortal();"
                      >
                        🚀 Dispatch Out for Delivery
                      </button>
                    ` : ''}

                    ${order.status === 'OUT_FOR_DELIVERY' ? `
                      <button 
                        class="btn-secondary text-xs py-1.5 px-2.5"
                        onclick="window.hotelCapitolStore.setOrderRevisedTime('${order.id}', 10); renderStaffPortal();"
                      >
                        ⏱️ +10m Revised Delay
                      </button>
                      <button 
                        class="btn-primary text-xs py-1.5 px-3 font-bold"
                        onclick="window.hotelCapitolStore.updateOrderStatus('${order.id}', 'DELIVERED'); renderStaffPortal();"
                      >
                        ✓ Mark Delivered
                      </button>
                    ` : ''}

                    ${order.status === 'DELIVERED' ? `
                      <span class="text-emerald-400 font-bold text-xs">✓ Delivered</span>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- GENERAL SERVICE REQUESTS -->
      <div class="glass-panel p-6 rounded-2xl">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div>
            <h2 class="text-lg font-serif text-white font-bold">Department Service Requests</h2>
            <p class="text-xs text-slate-300">Live requests generated from Hotel Capitol AI & guest interactions.</p>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          ${requests.map(req => `
          <div class="p-4 rounded-xl bg-navy-950 border ${req.status === 'AWAITING_STAFF_CONFIRMATION' ? 'border-amber-400 bg-amber-950/20 shadow-lg' : 'border-white/10'} flex flex-col gap-3 text-xs">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="badge-gold text-[10px]">${req.department || req.type}</span>
                  <span class="badge-${req.status === 'COMPLETED' ? 'normal' : req.status === 'AWAITING_STAFF_CONFIRMATION' ? 'attention' : 'pending'} text-[10px]">
                    ${req.status === 'AWAITING_STAFF_CONFIRMATION' ? '⏳ Awaiting Voice Confirmation' : req.status}
                  </span>
                  <strong class="text-white text-sm">Suite #${req.roomNumber} - ${req.title}</strong>
                </div>
                <div class="text-slate-300 text-xs mb-1">${req.details}</div>
                <div class="flex items-center gap-3 text-slate-400 text-[11px] flex-wrap mt-1">
                  <span>Logged at ${req.requestedAt}</span>
                  <span>Guest: ${req.guestName}</span>
                  <span>Assigned: <strong class="text-gold-light">${req.assignedStaffName}</strong></span>
                  ${req.status !== 'COMPLETED' ? `
                    <span class="flex items-center gap-1">
                      <span>⏱️ SLA (${req.targetMinutes || 15}m):</span>
                      <span 
                        class="badge-normal font-mono text-[10px] px-2 py-0.5" 
                        data-sla-deadline="${req.deadlineTimestamp || (Date.now() + (req.targetMinutes || 15)*60*1000)}"
                      >
                        ${req.targetMinutes || 15}:00 Remaining
                      </span>
                    </span>
                  ` : ''}
                </div>
              </div>

              <div class="flex items-center gap-2">
                ${req.status === 'AWAITING_STAFF_CONFIRMATION' ? `
                  <button 
                    class="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 font-bold shadow-md"
                    onclick="window.hotelCapitolAutomation.confirmStaffVoiceRequest('${req.id}');"
                  >
                    <span>🎙️</span>
                    <span>Confirm Receipt</span>
                  </button>
                ` : req.status !== 'COMPLETED' ? `
                  <button 
                    class="btn-primary text-xs py-1.5 px-3 font-bold"
                    onclick="window.hotelCapitolStore.updateServiceRequestStatus('${req.id}', 'COMPLETED'); renderStaffPortal();"
                  >
                    Mark Complete
                  </button>
                ` : '<span class="text-emerald-400 font-bold text-xs">✓ Resolved</span>'}
              </div>
            </div>

            <!-- Voice & AI Exchange Audit Trail -->
            ${req.voiceExchangeTrail && req.voiceExchangeTrail.length > 0 ? `
              <div class="mt-1 p-3 bg-navy-900/90 rounded-xl border border-gold/25 text-[11px]">
                <div class="font-bold text-gold mb-1.5 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <span>🎙️ Voice AI & Dispatch Exchange Trail:</span>
                </div>
                <div class="flex flex-col gap-1 text-slate-300">
                  ${req.voiceExchangeTrail.map(t => `
                    <div class="flex items-start gap-2">
                      <span class="text-slate-500 font-mono text-[10px]">${t.time}</span>
                      <span><strong class="text-white">${t.actor}:</strong> "${t.text}"</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

          </div>
        `).join('')}
      </div>

      <!-- VIP CHAUFFEUR & TRANSPORTATION DISPATCH STATION -->
      <div class="glass-panel p-6 rounded-2xl border border-gold/30">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-luxury text-gold">Chauffeur Transport Station</span>
              <span class="badge-gold text-xs">${(store.getState().transportBookings || []).filter(b => b.status === 'CONFIRMED').length} Active Bookings</span>
            </div>
            <h2 class="text-lg font-serif text-white font-bold mt-1">VIP Transportation Dispatches</h2>
            <p class="text-xs text-slate-300">Live driver assignments, route confirmations, and schedule checks for Lagos zones.</p>
          </div>
        </div>

        ${(store.getState().transportBookings || []).length === 0 ? `
          <div class="text-xs text-slate-400 py-4 text-center">No active transport bookings.</div>
        ` : `
          <div class="flex flex-col gap-3">
            ${(store.getState().transportBookings || []).map(tbk => `
              <div class="p-4 rounded-xl bg-navy-950 border ${tbk.status === 'CONFIRMED' ? 'border-gold/50' : 'border-white/10'} flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                <div>
                  <div class="flex items-center gap-2 mb-1 flex-wrap">
                    <span class="badge-gold text-[10px]">Room ${tbk.roomNumber}</span>
                    <strong class="text-white text-sm font-serif">${tbk.destination}</strong>
                    <span class="badge-normal text-[10px]">${tbk.vehicle}</span>
                    ${tbk.rescheduled ? '<span class="badge-attention text-[10px]">Rescheduled Schedule</span>' : ''}
                  </div>
                  
                  <div class="text-slate-300">
                    Departure: <strong>${tbk.departureDate} at ${tbk.departureTime}</strong> (${tbk.passengers} Pax) · Fare: <strong class="text-gold">₦${tbk.price.toLocaleString()}</strong>
                  </div>

                  <div class="text-[11px] text-slate-400 mt-1">
                    Resident: <strong class="text-white">${tbk.guestName}</strong> · Driver: <strong class="text-gold-light">${tbk.driverName || 'Lead Driver Ibrahim Bello'}</strong>
                  </div>
                </div>

                <div class="flex items-center gap-2 flex-wrap">
                  ${!tbk.driverAccepted ? `
                    <button 
                      class="btn-primary text-xs py-1.5 px-3 font-bold"
                      onclick="window.driverAcceptTransport('${tbk.id}')"
                    >
                      🚗 Accept Dispatch
                    </button>
                  ` : ''}

                  ${!tbk.routeConfirmed ? `
                    <button 
                      class="btn-secondary text-xs py-1.5 px-3 font-semibold"
                      onclick="window.driverConfirmDestination('${tbk.id}')"
                    >
                      🗺️ Confirm Route
                    </button>
                  ` : `
                    <span class="text-emerald-400 text-xs font-bold">✓ Route Verified</span>
                  `}

                  ${!tbk.scheduleConfirmed ? `
                    <button 
                      class="btn-secondary text-xs py-1.5 px-3 font-semibold"
                      onclick="window.driverConfirmSchedule('${tbk.id}')"
                    >
                      ⏰ Confirm Schedule
                    </button>
                  ` : `
                    <span class="text-emerald-400 text-xs font-bold">✓ Ready</span>
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

// 4. ROSTER & SHIFT SWAP (Spec #27 & #28)
function renderStaffScheduleTab(schedule = [], shiftSwaps = [], staff = {}) {
  const staffId = staff?.id || 'STAFF-01';
  const colleagues = (store.getState().staffMembers || []).filter(s => s.id !== staffId);

  return `
    <div class="max-w-4xl mx-auto flex flex-col gap-8">
      
      <!-- Weekly Schedule -->
      <div class="glass-panel p-6 rounded-2xl">
        <div class="mb-4 pb-3 border-b border-white/10">
          <span class="text-xs font-bold uppercase tracking-luxury text-gold">AI-Generated Weekly Roster</span>
          <h2 class="text-lg font-serif text-white font-bold mt-1">My Weekly Shifts</h2>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          ${schedule.filter(s => s.staffId === staffId).map(sch => `
            <div class="p-3.5 rounded-xl bg-navy-950 border border-white/10 text-xs">
              <div class="font-serif font-bold text-gold text-sm mb-1">${sch.day}</div>
              <div class="text-white font-semibold mb-1">${sch.shift}</div>
              <span class="badge-normal text-[10px] py-0.2">${sch.status}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Shift Swap Request Workflow (Spec #28) -->
      <div class="glass-panel-gold p-6 rounded-2xl">
        <h3 class="font-serif text-base font-bold text-white mb-2">Request Shift Swap</h3>
        <p class="text-xs text-slate-300 mb-4">Select a colleague to swap shifts with. Once submitted, the shift swap will route to Supervisor Tariq Alabi for approval.</p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label class="block text-[11px] text-gold font-bold mb-1">Swap With Colleague:</label>
            <select id="swap-target-staff" class="input-custom text-xs py-2">
              ${colleagues.map(c => `
                <option value="${c.id}">${c.name} (${c.role})</option>
              `).join('')}
            </select>
          </div>

          <div>
            <label class="block text-[11px] text-gold font-bold mb-1">Target Shift Date:</label>
            <input id="swap-date" type="date" value="2026-08-18" class="input-custom text-xs py-2" />
          </div>

          <div>
            <label class="block text-[11px] text-gold font-bold mb-1">Reason for Swap:</label>
            <input id="swap-reason" type="text" placeholder="e.g. Medical or family duty" class="input-custom text-xs py-2" />
          </div>
        </div>

        <button class="btn-primary text-xs py-2 px-5 font-bold" onclick="window.submitShiftSwap()">
          Submit Swap Request →
        </button>
      </div>

    </div>
  `;
}

// 5. AI PERFORMANCE DASHBOARD (Spec #29)
function renderStaffPerformanceTab(staff) {
  const state = store.getState();
  const allStaff = state.staffMembers || [];
  
  // Calculate completion percentage and metrics with robust fallbacks
  const tasksDone = staff.tasksCompleted ?? 42;
  const tasksTotal = staff.totalTasks ?? (tasksDone > 0 ? tasksDone + 2 : 44);
  const completionPct = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 100;
  const score = staff.performanceScore ?? 95;
  const onTime = staff.onTimeRate || '98%';
  const feedback = staff.feedback || 'Outstanding';
  const aiNote = staff.aiNotes || 'Maintains high standard of luxury service, rapid turnaround, and executive guest satisfaction.';
  
  // Rating tier badge calculation
  const ratingTier = score >= 96 ? '🏆 Top 1% Executive Tier' : score >= 93 ? '⭐ Exceptional Performer' : score >= 88 ? '✨ High Standard' : 'Standard Performer';
  const ratingColor = score >= 93 ? 'text-gold' : 'text-emerald-400';

  return `
    <div class="perf-card-container animate-fade-in">
      <div class="glass-panel p-4 sm:p-7 rounded-2xl border-2 border-gold/35 shadow-2xl bg-navy-900/95" style="background: radial-gradient(circle at 85% 15%, rgba(220, 173, 84, 0.08) 0%, rgba(11, 23, 36, 0.98) 70%);">
        
        <!-- TOP APPRAISAL HEADER & PROFILE SELECTOR -->
        <div class="flex flex-col gap-4 pb-5 border-b border-gold/25 mb-6">
          
          <!-- Top Sub-Row: Appraisal Tag + Assessment Period + Inline Staff Switcher -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-[10px] sm:text-[11px] font-bold uppercase tracking-luxury text-gold px-2.5 py-1 rounded-full bg-gold/15 border border-gold/30">
                ✨ AI Operational Appraisal
              </span>
              <span class="badge-gold text-[10px] font-bold">Weekly Performance Review</span>
            </div>

            <!-- Fast Staff Profile Review Switcher (Inspect EVERY Profile) -->
            <div class="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end bg-navy-950/80 px-3 py-1.5 rounded-xl border border-white/10">
              <span class="text-[11px] text-slate-400 font-semibold whitespace-nowrap">Review Profile:</span>
              <select 
                class="input-custom text-xs py-1 px-2.5 bg-navy-900 text-gold border-gold/40 rounded-lg cursor-pointer font-bold focus:outline-none"
                onchange="store.setActiveStaff(this.value); if(window.renderApp) window.renderApp();"
                title="Select staff profile to inspect AI performance metrics"
              >
                ${allStaff.map(s => `
                  <option value="${s.id}" ${s.id === staff.id ? 'selected' : ''}>
                    ${s.name} (${s.role})
                  </option>
                `).join('')}
              </select>
            </div>
          </div>

          <!-- Main Identity Row + Overall Score Card (Guaranteed Zero-Overlap Responsive Layout) -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
            
            <!-- Left: Staff Avatar, Name, Role & Department Details -->
            <div class="flex items-center gap-3.5 sm:gap-4">
              <div class="relative shrink-0">
                <img 
                  src="${staff.avatar}" 
                  alt="${staff.name}" 
                  class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-gold/60 shadow-xl"
                  style="box-shadow: 0 4px 20px rgba(0, 0, 0, 0.7), 0 0 15px rgba(220, 173, 84, 0.25);"
                />
                <span class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${staff.clockedIn ? 'bg-emerald-500 border-2 border-navy-950' : 'bg-slate-500 border-2 border-navy-950'}" title="${staff.clockedIn ? 'Active On Duty' : 'Off Duty'}"></span>
              </div>

              <div class="min-w-0 flex-1">
                <div class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Staff Member Appraisal</div>
                <h2 class="text-xl sm:text-2xl font-serif text-white font-bold tracking-wide truncate" title="${staff.name}">
                  ${staff.name}
                </h2>
                <div class="text-xs font-semibold text-gold mt-0.5 truncate" title="${staff.role}">
                  ${staff.role} <span class="text-slate-400 font-normal">(${staff.adminRole || 'OPERATIONS'})</span>
                </div>
                <div class="text-[11px] text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                  <span>Dept: <strong class="text-white capitalize">${staff.department}</strong></span>
                  <span>•</span>
                  <span>Shift: <strong class="text-slate-200">${staff.shift || 'Standard Shift'}</strong></span>
                </div>
              </div>
            </div>

            <!-- Right: Prominent Overall Score Card (Structured & Protected Against Text Overlap) -->
            <div class="perf-score-widget shrink-0 self-stretch sm:self-auto justify-between sm:justify-end">
              <div class="flex flex-col text-left sm:text-right">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-300">Overall Score</span>
                <span class="text-xs font-bold ${ratingColor}">${ratingTier}</span>
                <span class="text-[10px] text-emerald-400 font-semibold mt-0.5">Top 5% Property Benchmark</span>
              </div>
              <div class="perf-score-circle">
                <span class="text-xl sm:text-2xl font-serif font-black text-gold leading-none">${score}%</span>
                <span class="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Score</span>
              </div>
            </div>

          </div>

        </div>

        <!-- 4 CORE KPI METRIC CARDS (Bulletproof 2 cols on mobile, 4 cols on desktop) -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          
          <!-- 1. Tasks Completed -->
          <div class="perf-kpi-item">
            <div class="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-slate-400 font-medium mb-2">
              <span>📋</span>
              <span class="truncate">Tasks Completed</span>
            </div>
            <div class="text-lg sm:text-2xl font-bold font-sans text-white tracking-wide my-1">
              ${tasksDone} <span class="text-xs sm:text-sm font-normal text-slate-400">/ ${tasksTotal}</span>
            </div>
            <div class="mt-2 pt-2 border-t border-white/10 flex flex-col gap-1">
              <div class="w-full bg-navy-950 rounded-full h-1.5 overflow-hidden border border-white/10">
                <div class="bg-gradient-to-r from-gold-500 to-gold-400 h-full rounded-full" style="width: ${Math.min(100, completionPct)}%; background: linear-gradient(90deg, #c5a059 0%, #f6edd7 100%);"></div>
              </div>
              <span class="text-[10px] text-gold font-semibold">${completionPct}% Completion</span>
            </div>
          </div>

          <!-- 2. On-Time Rate -->
          <div class="perf-kpi-item">
            <div class="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-slate-400 font-medium mb-2">
              <span>⏱️</span>
              <span class="truncate">On-Time Rate</span>
            </div>
            <div class="text-lg sm:text-2xl font-bold font-sans text-emerald-400 tracking-wide my-1">
              ${onTime}
            </div>
            <div class="mt-2 pt-2 border-t border-white/10 flex flex-col gap-1">
              <span class="text-[10px] text-emerald-300 font-semibold flex items-center justify-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Avg Turnaround: 14m
              </span>
              <span class="text-[9px] text-slate-400">SLA Target: &lt; 15m</span>
            </div>
          </div>

          <!-- 3. Attendance -->
          <div class="perf-kpi-item">
            <div class="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-slate-400 font-medium mb-2">
              <span>📅</span>
              <span class="truncate">Attendance</span>
            </div>
            <div class="text-lg sm:text-2xl font-bold font-sans text-emerald-400 tracking-wide my-1">
              100%
            </div>
            <div class="mt-2 pt-2 border-t border-white/10 flex flex-col gap-1">
              <span class="text-[10px] ${staff.clockedIn ? 'text-emerald-300' : 'text-slate-300'} font-semibold truncate">
                ${staff.clockedIn ? `🟢 Clocked In (${staff.clockInTime || 'On Time'})` : '⚪ Scheduled'}
              </span>
              <span class="text-[9px] text-slate-400">Punctuality: 100%</span>
            </div>
          </div>

          <!-- 4. Guest Feedback -->
          <div class="perf-kpi-item">
            <div class="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-slate-400 font-medium mb-2">
              <span>⭐</span>
              <span class="truncate">Guest Feedback</span>
            </div>
            <div class="text-base sm:text-xl font-bold font-sans text-gold tracking-wide my-1 truncate px-1" title="${feedback}">
              ${feedback}
            </div>
            <div class="mt-2 pt-2 border-t border-white/10 flex flex-col gap-1">
              <span class="text-[10px] text-gold font-semibold flex items-center justify-center gap-0.5">
                ★★★★★ <span class="text-[9px] text-slate-300 ml-1">5.0</span>
              </span>
              <span class="text-[9px] text-slate-400">Executive Luxury Rating</span>
            </div>
          </div>

        </div>

        <!-- OPERATIONAL QUALITY & SLA COMPLIANCE BENCHMARK ROW -->
        <div class="p-3.5 sm:p-4 rounded-xl bg-navy-950/80 border border-white/10 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2">
            <span class="text-base">📊</span>
            <div>
              <div class="font-bold text-white text-xs">Department Operational Index</div>
              <div class="text-[11px] text-slate-300">Prompt SLA Compliance: <strong class="text-emerald-400">98.4%</strong> · Quality Rating: <strong class="text-gold">99.1%</strong></div>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="badge-gold text-[10px] font-bold">Tolani AI Verified</span>
          </div>
        </div>

        <!-- AI OPERATIONAL COACHING NOTE (Spec #29) -->
        <div class="glass-panel-gold p-4 sm:p-6 rounded-2xl border-2 border-gold/40 shadow-xl bg-gradient-to-br from-gold/15 to-navy-950/90">
          <div class="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-gold/20 flex-wrap">
            <div class="font-bold text-gold text-xs uppercase tracking-luxury flex items-center gap-2">
              ${getIcon('sparkles', 16)} <span>AI OPERATIONAL COACHING NOTE:</span>
            </div>
            <span class="text-[10px] text-slate-300 italic">Continuous Quality Improvement</span>
          </div>
          
          <div class="relative pl-4 border-l-2 border-gold/60 my-2">
            <p class="text-xs sm:text-sm text-slate-100 leading-relaxed italic font-sans font-medium">
              "${aiNote}"
            </p>
          </div>

          <div class="mt-4 pt-3 border-t border-gold/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <span class="text-[10px] text-slate-400">
              Assessed for <strong>${staff.name}</strong> (${staff.role})
            </span>
            <div class="flex items-center gap-2 w-full sm:w-auto">
              <button 
                class="btn-secondary text-[11px] py-1.5 px-3 flex-1 sm:flex-none cursor-pointer"
                onclick="window.triggerStaffIntercom()"
                title="Connect with Supervisor or Team via Live Radio"
              >
                📻 Call Supervisor Radio
              </button>
              <button 
                class="btn-primary text-[11px] py-1.5 px-3 flex-1 sm:flex-none cursor-pointer"
                onclick="window.navigateStaffTab('tasks')"
                title="View active daily tasks"
              >
                📋 View Assigned Tasks
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}

// 6. SINGLE AUTHORITATIVE STAFF PERSONAL PROFILE TAB (Spec #9-#16)
function renderStaffPersonalProfileTab(staff) {
  const isListening = staffIntercomState === 'active';
  const isDelivered = staffIntercomState === 'delivered';
  const ringColor = isListening ? '#ef4444' : '#10b981';
  const glowColor = isListening ? 'rgba(239, 68, 68, 0.75)' : 'rgba(16, 185, 129, 0.75)';

  return `
    <div class="staff-profile-container animate-fade-in">
      
      <!-- Single Authoritative Staff Profile Card -->
      <div class="staff-profile-card">
        
        <!-- 1. Profile Image with Gold Frame -->
        <div class="relative mb-4">
          <img 
            src="${staff.avatar}" 
            alt="${staff.name}" 
            class="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-2 border-gold shadow-2xl" 
            style="box-shadow: 0 8px 30px rgba(0, 0, 0, 0.7), 0 0 25px rgba(220, 173, 84, 0.3);"
          />
          <div class="absolute -bottom-2 -right-2 bg-navy-950 px-2.5 py-1 rounded-full border border-gold/40 text-[10px] font-bold text-gold">
            ${staff.adminRole || 'FRONT_DESK'}
          </div>
        </div>

        <!-- 2. Staff Name, Job Title & Department -->
        <h2 class="text-2xl sm:text-3xl font-serif text-white font-bold mb-1">${staff.name}</h2>
        <div class="text-xs sm:text-sm font-semibold text-gold mb-1">${staff.role}</div>
        <div class="text-xs text-slate-300 uppercase tracking-wider mb-5">
          Department: <strong class="text-white">${staff.department}</strong>
        </div>

        <!-- 3. Clock In CTA -->
        <div class="w-full max-w-xs mb-3">
          <button 
            class="${staff.clockedIn ? 'btn-danger' : 'btn-primary'} w-full py-3 text-sm font-bold shadow-xl"
            onclick="window.hotelCapitolStore.toggleClockIn('${staff.id}'); renderStaffPortal();"
          >
            ${staff.clockedIn ? '⏰ Clock Out of Duty' : '⏰ Clock In for Duty'}
          </button>
        </div>

        <!-- 4. Large Prominent Intercom Control Directly Below Clock In -->
        <div class="my-3 flex flex-col items-center">
          <button 
            class="staff-large-intercom-btn ${isListening ? 'active' : ''}"
            onclick="window.triggerStaffIntercom()"
            title="Open Live 2-Way Staff Intercom Radio"
          >
            <div class="relative flex items-center justify-center" style="width: 44px; height: 44px;">
              <div class="absolute inset-0 rounded-full ${isListening ? 'intercom-ring-active' : 'intercom-ring-ready'}" style="border: 2.5px solid ${ringColor}; box-shadow: 0 0 16px ${glowColor}, inset 0 0 8px ${glowColor};"></div>
              ${renderIntercomRoundBadge(28)}
            </div>
            <div class="flex flex-col text-left">
              <span class="text-xs font-bold ${isListening ? 'text-red-400' : 'text-emerald-300'} flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-ping' : 'bg-emerald-400 animate-pulse'}"></span>
                ${isListening ? 'LISTENING / ACTIVE' : isDelivered ? 'MESSAGE DELIVERED' : '2-WAY INTERCOM READY'}
              </span>
              <span class="text-[10px] text-slate-300">Push-to-Talk Staff Radio</span>
            </div>
          </button>
        </div>

        <!-- 5. Profile Information & Operational Details (Compact, Moved Upward) -->
        <div class="w-full mt-4 text-left p-4 rounded-2xl bg-navy-950/80 border border-white/10">
          <div class="text-xs font-bold uppercase tracking-luxury text-gold pb-2 border-b border-white/10 mb-3 flex items-center justify-between">
            <span>Profile Information</span>
            <span class="text-slate-400 text-[11px]">ID: ${staff.id}</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
            <div class="flex items-center justify-between p-2 rounded-lg bg-navy-900 border border-white/5">
              <span class="text-slate-400">Shift Schedule:</span>
              <strong class="text-white">${staff.shift}</strong>
            </div>

            <div class="flex items-center justify-between p-2 rounded-lg bg-navy-900 border border-white/5">
              <span class="text-slate-400">Attendance:</span>
              <strong class="${staff.clockedIn ? 'text-emerald-400' : 'text-slate-400'}">
                ${staff.clockedIn ? `In (${staff.clockInTime})` : 'Off Duty'}
              </strong>
            </div>

            <div class="flex items-center justify-between p-2 rounded-lg bg-navy-900 border border-white/5">
              <span class="text-slate-400">Appraisal Score:</span>
              <strong class="text-gold font-bold">${staff.performanceScore}%</strong>
            </div>

            <div class="flex items-center justify-between p-2 rounded-lg bg-navy-900 border border-white/5">
              <span class="text-slate-400">Tasks Completed:</span>
              <strong class="text-white">${staff.tasksCompleted} / ${staff.totalTasks}</strong>
            </div>
          </div>

          <!-- AI Operational Coaching Note -->
          <div class="mt-3 pt-3 border-t border-white/10 text-xs">
            <span class="text-gold font-semibold">Supervisor & AI Coaching:</span>
            <p class="text-slate-300 mt-1 italic leading-relaxed">"${staff.aiNotes}"</p>
          </div>
        </div>

      </div>

    </div>
  `;
}


// 2b. LIVE SERVICE REQUESTS TAB (With Intercom Integration)
function renderStaffLiveRequestsTab(state, activeAlerts) {
  const requests = state.serviceRequests || [];

  return `
    <div class="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-6">
      <div class="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h2 class="text-lg font-serif text-white font-bold">Live Guest Service Requests & Intercom Queue</h2>
          <p class="text-xs text-slate-300">Active incoming guest service requests requiring staff dispatch.</p>
        </div>
        <button class="btn-primary text-xs py-1.5 px-4 font-bold" onclick="window.toggleIntercomModal(true)">
          📻 Open Staff Radio
        </button>
      </div>

      ${(activeAlerts || []).length > 0 ? `
        <div class="p-4 rounded-xl bg-amber-950/80 border-2 border-amber-400 flex flex-col gap-3">
          <div class="text-xs font-bold text-amber-200 uppercase">Incoming Direct Intercom Calls Awaiting Response:</div>
          ${activeAlerts.map(a => `
            <div class="p-3 bg-navy-950 rounded-lg flex items-center justify-between gap-4">
              <div>
                <strong class="text-white text-sm">Suite #${a.roomNumber} · ${a.serviceType}</strong>
                <div class="text-xs text-slate-300">Guest: ${a.guestName} · Dept: ${a.deptName} · Requested: ${a.requestedAt}</div>
              </div>
              <button class="btn-primary text-xs py-1.5 px-4 font-bold bg-amber-500 hover:bg-amber-400 text-black cursor-pointer shadow-md" onclick="window.acceptIntercomRequest('${a.id}')">
                ✓ Accept Request
              </button>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="flex flex-col gap-3">
        ${requests.map(r => `
          <div class="p-4 rounded-xl bg-navy-950 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="badge-${r.priority === 'HIGH' ? 'critical' : 'gold'} text-[10px]">${r.priority}</span>
                <strong class="text-white text-sm">${r.title}</strong>
              </div>
              <div class="text-slate-300">${r.description || r.details}</div>
              <div class="text-[11px] text-slate-400 mt-1">Assigned: ${r.assignedTo || 'Department Team'} · Status: <strong class="text-gold">${r.status}</strong></div>
            </div>
            <span class="badge-normal text-[10px]">${r.type}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// 2c. SHIFT SWAP TAB
function renderStaffShiftSwapTab(staff) {
  return `
    <div class="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-6">
      <div class="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h2 class="text-lg font-serif text-white font-bold">Shift Swaps & Coverage Requests</h2>
          <p class="text-xs text-slate-300">Request coverage or accept peer shift exchanges with Supervisor authorization.</p>
        </div>
      </div>
      <div class="p-4 rounded-xl bg-navy-950 border border-gold/30 text-xs text-slate-300">
        You are currently scheduled for: <strong class="text-white">${staff.shift}</strong> (${staff.department}).
      </div>
      <div class="flex flex-col gap-3">
        <div class="p-4 rounded-xl bg-navy-950 border border-white/10 flex items-center justify-between">
          <div>
            <strong class="text-white text-sm">Sunday Evening Coverage (16:00 - 00:00)</strong>
            <div class="text-xs text-slate-400">Offered by: Amara Nwosu · Status: <span class="text-amber-400 font-bold">Awaiting Peer Acceptance</span></div>
          </div>
          <button class="btn-primary text-xs py-1.5 px-4 font-bold" onclick="alert('Coverage request accepted and routed to Shift Supervisor for sign-off.')">
            Accept Shift
          </button>
        </div>
      </div>
    </div>
  `;
}
