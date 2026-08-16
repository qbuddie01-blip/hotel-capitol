/**
 * HOTEL CAPITOL — HOTEL STAFF PORTAL
 * 6 Animashaun Close, Ikeja, Lagos
 * Tasks, Rooms, Attendance, Schedule, Shift Swap & AI Performance
 */

import { getIcon, renderIntercomRoundBadge } from '../assets/icons.js';
import { store } from '../store/state.js';
import { automationEngine } from '../services/automationRules.js';

let activeStaffTab = 'tasks'; // 'tasks' | 'rooms' | 'requests' | 'schedule' | 'performance' | 'profile'
let staffIntercomState = 'ready'; // 'ready' | 'active' | 'delivered'

export function initStaffPortal() {
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
  const myTasks = state.staffTasks.filter(t => t.staffId === staff.id || t.staffName === staff.name);
  const myPendingCount = myTasks.filter(t => t.status !== 'COMPLETED').length;

  let tabContent = '';
  if (activeStaffTab === 'tasks') {
    tabContent = renderStaffTasksTab(myTasks, staff);
  } else if (activeStaffTab === 'rooms') {
    tabContent = renderStaffRoomsTab(state.rooms);
  } else if (activeStaffTab === 'requests') {
    tabContent = renderStaffRequestsTab(state.serviceRequests);
  } else if (activeStaffTab === 'schedule') {
    tabContent = renderStaffScheduleTab(state.schedule, state.shiftSwapRequests, staff);
  } else if (activeStaffTab === 'performance') {
    tabContent = renderStaffPerformanceTab(staff);
  } else if (activeStaffTab === 'profile') {
    tabContent = renderStaffPersonalProfileTab(staff);
  }

  return `
    <div class="container-custom py-6">
      
      <!-- TOP NAVIGATION BAR WITH BACK BUTTON -->
      <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold uppercase tracking-luxury text-gold">Hotel Capitol Operations</span>
          <span class="badge-gold text-[10px]">${staff.department.toUpperCase()}</span>
        </div>

        <button class="btn-admin-back" onclick="window.navigatePortal('guest')">
          <span>←</span> <span>Back to Guest Portal</span>
        </button>
      </div>

      <!-- REAL-TIME VOICE REQUEST CONFIRMATION PROMPT BANNER -->
      ${state.serviceRequests.filter(r => r.status === 'AWAITING_STAFF_CONFIRMATION').map(pendingReq => `
        <div class="glass-panel-gold p-4 sm:p-5 rounded-2xl mb-6 border-2 border-gold flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in" style="background: linear-gradient(135deg, rgba(32, 18, 4, 0.95) 0%, rgba(10, 22, 38, 0.95) 100%); box-shadow: 0 0 25px rgba(220, 173, 84, 0.35);">
          <div class="flex items-start gap-3.5">
            <div class="p-2.5 rounded-2xl bg-amber-500/20 text-gold border border-gold/60 text-2xl">
              🛎️
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-bold uppercase tracking-luxury text-amber-400 flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> 
                  ${pendingReq.assignedStaffName === staff.name ? '🎯 Designated Room Attendant Alert (You)' : `🎙️ Dispatched to ${pendingReq.assignedStaffName}`}
                </span>
                <span class="badge-gold text-[10px] py-0.5">Suite #${pendingReq.roomNumber}</span>
              </div>
              <h3 class="text-sm sm:text-base font-bold text-white font-serif">"${pendingReq.title}"</h3>
              <p class="text-xs text-slate-300 mt-0.5">${pendingReq.details} · Designated Attendant: <strong class="text-gold">${pendingReq.assignedStaffName}</strong> (${pendingReq.department})</p>
              <div class="text-[11px] text-amber-200 mt-1">AI Voice Prompt: <em>"Attention ${pendingReq.assignedStaffName}, you have a guest request for Suite #${pendingReq.roomNumber}. Please confirm request."</em></div>
            </div>
          </div>

          <div class="flex items-center gap-2 w-full md:w-auto">
            <button 
              class="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer"
              onclick="window.hotelCapitolAutomation.confirmStaffVoiceRequest('${pendingReq.id}', '${staff.name}')"
              title="Confirm receipt of guest request"
            >
              <span>🎙️</span>
              <span>Say "Request Confirmed"</span>
            </button>
          </div>
        </div>
      `).join('')}

      <!-- STAFF HEADER & TIMECLOCK CARD (Omitted on Profile Tab to prevent duplicate presentation) -->
      ${activeStaffTab !== 'profile' ? `
        <div class="glass-panel p-6 rounded-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-gold/30">
          
          <div class="flex items-center gap-4">
            <img src="${staff.avatar}" class="w-16 h-16 rounded-2xl object-cover border-2 border-gold shadow-lg" alt="${staff.name}" />
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-xl sm:text-2xl font-serif text-white font-bold">${staff.name}</h1>
                <span class="badge-gold text-xs">${staff.role}</span>
              </div>
              <p class="text-xs text-slate-300 mt-1">
                Department: <strong class="text-gold uppercase">${staff.department}</strong> · Shift: <strong>${staff.shift}</strong>
              </p>
            </div>
          </div>

          <!-- Attendance & Timeclock Box -->
          <div class="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div class="text-left md:text-right">
              <div class="text-xs text-slate-400">Attendance Status:</div>
              <div class="flex items-center gap-1 text-xs font-bold text-emerald-400">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ${staff.clockedIn ? `Signed In (${staff.clockInTime}) · ${staff.clockStatus}` : 'Signed Out'}
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button 
                class="glass-panel text-xs py-1.5 px-3 flex items-center gap-2 border border-gold/40 hover:border-gold cursor-pointer transition-all rounded-xl"
                onclick="window.triggerStaffIntercom()"
                title="Open Staff Intercom & Radio"
              >
                ${renderIntercomRoundBadge(22)} <span class="text-slate-200 font-semibold hide-mobile">Intercom</span>
              </button>
              <button 
                class="${staff.clockedIn ? 'btn-danger' : 'btn-primary'} text-xs py-2 px-4 font-bold"
                onclick="window.hotelCapitolStore.toggleClockIn('${staff.id}'); renderStaffPortal();"
              >
                ${staff.clockedIn ? 'Clock Out' : 'Clock In'}
              </button>
            </div>
          </div>

        </div>
      ` : ''}

      <!-- NAVIGATION TABS with Golden Outlay & Glowing Borders (Horizontal Smooth Scroll on Mobile) -->
      <div class="category-tabs-scroll">
        <button 
          class="menu-btn-gold ${activeStaffTab === 'profile' ? 'active' : ''}"
          onclick="window.navigateStaffTab('profile')"
        >
          <span>👤</span>
          <span>My Profile</span>
        </button>

        <button 
          class="menu-btn-gold ${activeStaffTab === 'tasks' ? 'active' : ''}"
          onclick="window.navigateStaffTab('tasks')"
        >
          <span>📋</span>
          <span>My Tasks (${myPendingCount} Pending)</span>
        </button>

        <button 
          class="menu-btn-gold ${activeStaffTab === 'rooms' ? 'active' : ''}"
          onclick="window.navigateStaffTab('rooms')"
        >
          <span>🛏</span>
          <span>My Rooms & Turnover</span>
        </button>

        <button 
          class="menu-btn-gold ${activeStaffTab === 'requests' ? 'active' : ''}"
          onclick="window.navigateStaffTab('requests')"
        >
          <span>🛎</span>
          <span>Live Service Requests</span>
        </button>

        <button 
          class="menu-btn-gold ${activeStaffTab === 'schedule' ? 'active' : ''}"
          onclick="window.navigateStaffTab('schedule')"
        >
          <span>📅</span>
          <span>Roster & Shift Swap</span>
        </button>

        <button 
          class="menu-btn-gold ${activeStaffTab === 'performance' ? 'active' : ''}"
          onclick="window.navigateStaffTab('performance')"
        >
          <span>📊</span>
          <span>AI Performance (${staff.performanceScore}%)</span>
        </button>
      </div>

      <!-- TAB VIEW -->
      ${tabContent}

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
function renderStaffScheduleTab(schedule, shiftSwaps, staff) {
  const colleagues = store.getState().staffMembers.filter(s => s.id !== staff.id);

  return `
    <div class="max-w-4xl mx-auto flex flex-col gap-8">
      
      <!-- Weekly Schedule -->
      <div class="glass-panel p-6 rounded-2xl">
        <div class="mb-4 pb-3 border-b border-white/10">
          <span class="text-xs font-bold uppercase tracking-luxury text-gold">AI-Generated Weekly Roster</span>
          <h2 class="text-lg font-serif text-white font-bold mt-1">My Weekly Shifts</h2>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          ${schedule.filter(s => s.staffId === staff.id).map(sch => `
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
  return `
    <div class="max-w-3xl mx-auto glass-panel p-6 sm:p-8 rounded-2xl">
      <div class="flex items-center justify-between pb-4 border-b border-gold/30 mb-6">
        <div>
          <span class="text-xs font-bold uppercase tracking-luxury text-gold">AI Operational Appraisal</span>
          <h2 class="text-2xl font-serif text-white mt-1">Weekly Performance Summary</h2>
          <div class="text-xs text-slate-300 mt-0.5">Staff Member: <strong class="text-white">${staff.name}</strong> (${staff.role})</div>
        </div>
        <div class="text-right">
          <span class="text-xs text-slate-400">Score</span>
          <div class="text-3xl font-serif font-bold text-gold">${staff.performanceScore}%</div>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div class="p-4 rounded-xl bg-navy-950 border border-white/10 text-center">
          <div class="text-xs text-slate-400 mb-1">Tasks Completed</div>
          <div class="text-xl font-bold text-white">${staff.tasksCompleted} / ${staff.totalTasks}</div>
        </div>

        <div class="p-4 rounded-xl bg-navy-950 border border-white/10 text-center">
          <div class="text-xs text-slate-400 mb-1">On-Time Rate</div>
          <div class="text-xl font-bold text-emerald-400">${staff.onTimeRate}</div>
        </div>

        <div class="p-4 rounded-xl bg-navy-950 border border-white/10 text-center">
          <div class="text-xs text-slate-400 mb-1">Attendance</div>
          <div class="text-xl font-bold text-emerald-400">100%</div>
        </div>

        <div class="p-4 rounded-xl bg-navy-950 border border-white/10 text-center">
          <div class="text-xs text-slate-400 mb-1">Guest Feedback</div>
          <div class="text-xl font-bold text-gold">${staff.feedback}</div>
        </div>
      </div>

      <!-- AI Recommendation -->
      <div class="glass-panel-gold p-4 rounded-xl">
        <div class="font-bold text-gold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
          ${getIcon('sparkles', 16)} AI Operational Coaching Note:
        </div>
        <p class="text-xs text-slate-200 leading-relaxed">${staff.aiNotes}</p>
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
