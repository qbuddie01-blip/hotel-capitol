/**
 * HOTEL CAPITOL — ADMIN & SUPPORT CONSOLE
 * 6 Animashaun Close, Ikeja, Lagos
 * 
 * Complete operational intelligence, content management, media library,
 * transportation pricing, Tolani learning centre, staff directory with RBAC,
 * and immutable audit logging.
 */

import { getIcon, renderIntercomRoundBadge } from '../assets/icons.js';
import { store, ADMIN_ROLES, ROLE_PERMISSIONS } from '../store/state.js';
import { aiEngine } from '../services/aiEngine.js';
import { automationEngine } from '../services/automationRules.js';
import { learningEngine } from '../services/learningEngine.js';

let managerActiveTab = 'overview'; 
// 'overview' | 'content-restaurant' | 'content-breakfast' | 'content-amenities' | 'content-services' | 'content-media' | 'orders' | 'transportation' | 'learning' | 'staff' | 'audit' | 'settings'

// Modal UI States
let activeEditMenuItemId = null;
let activeEditAmenityId = null;
let activeEditStaffId = null;
let activeVersionModal = null; // { entityType: 'MENU_ITEM', entityId: 'M-01', title: '...' }
let activeEvidenceModal = null; // sugId
let activeMediaUploadModal = false;

// Filter States
let logSearchFilter = '';
let logServiceFilter = 'ALL';
let logIntentFilter = 'ALL';
let logOutcomeFilter = 'ALL';
let menuCategoryFilter = 'ALL';
let auditSearchFilter = '';
let auditModuleFilter = 'ALL';

export function initManagerPortal() {
  window.navigateManagerTab = (tab) => {
    managerActiveTab = tab;
    if (window.renderApp) window.renderApp();
  };

  window.switchActiveAdminStaff = (staffId) => {
    store.setActiveStaffId(staffId);
    const staff = store.getActiveStaff();
    automationEngine.showToast('Administrator Switched', `Active user: ${staff.name} (${staff.adminRole || staff.role})`, 'info');
    if (window.renderApp) window.renderApp();
  };

  // --- CONTENT MANAGEMENT: RESTAURANT & DINING ---
  window.openCreateMenuModal = () => {
    activeEditMenuItemId = 'NEW';
    if (window.renderApp) window.renderApp();
  };

  window.openEditMenuModal = (itemId) => {
    activeEditMenuItemId = itemId;
    if (window.renderApp) window.renderApp();
  };

  window.closeMenuModal = () => {
    activeEditMenuItemId = null;
    if (window.renderApp) window.renderApp();
  };

  window.saveMenuItemForm = (e) => {
    if (e) e.preventDefault();
    try {
      const name = document.getElementById('menu-item-name')?.value?.trim();
      const category = document.getElementById('menu-item-category')?.value;
      const price = parseFloat(document.getElementById('menu-item-price')?.value);
      const prepTimeMinutes = parseInt(document.getElementById('menu-item-prep')?.value, 10) || 20;
      const estimatedDeliveryMinutes = parseInt(document.getElementById('menu-item-delivery')?.value, 10) || 15;
      const desc = document.getElementById('menu-item-desc')?.value?.trim();
      const image = document.getElementById('menu-item-image')?.value?.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
      const status = document.getElementById('menu-item-status')?.value || 'PUBLISHED';
      const available = document.getElementById('menu-item-available')?.checked ?? true;
      const featured = document.getElementById('menu-item-featured')?.checked ?? false;
      const reason = document.getElementById('menu-item-reason')?.value?.trim() || 'Administrative menu update';

      if (!name || isNaN(price)) {
        alert('Please provide a valid item name and price.');
        return;
      }

      const itemData = {
        name,
        category,
        price,
        prepTimeMinutes,
        estimatedDeliveryMinutes,
        desc,
        image,
        status,
        available,
        featured
      };

      if (activeEditMenuItemId === 'NEW') {
        store.addMenuItem(itemData);
        automationEngine.showToast('Menu Item Created', `"${name}" added to ${category} (₦${price.toLocaleString()})`, 'success');
      } else {
        store.updateMenuItem(activeEditMenuItemId, itemData, null, reason);
        automationEngine.showToast('Menu Item Updated', `"${name}" updated successfully.`, 'success');
      }

      activeEditMenuItemId = null;
      if (window.renderApp) window.renderApp();
    } catch (err) {
      automationEngine.showToast('Permission Denied', err.message, 'warning');
      alert(err.message);
    }
  };

  window.toggleMenuAvailability = (itemId) => {
    try {
      const state = store.getState();
      const item = state.menu.find(m => m.id === itemId);
      if (!item) return;
      store.updateMenuItem(itemId, { available: !item.available }, null, `Toggled availability to ${!item.available ? 'AVAILABLE' : 'UNAVAILABLE'}`);
      automationEngine.showToast('Availability Updated', `${item.name} is now ${!item.available ? 'AVAILABLE' : 'UNAVAILABLE'}.`, 'info');
      if (window.renderApp) window.renderApp();
    } catch (err) {
      automationEngine.showToast('Permission Denied', err.message, 'warning');
      alert(err.message);
    }
  };

  window.publishMenuItemAction = (itemId) => {
    try {
      store.publishMenuItem(itemId);
      automationEngine.showToast('Menu Item Published', 'Item is now live in Guest Portal and Tolani knowledge.', 'success');
      if (window.renderApp) window.renderApp();
    } catch (err) {
      automationEngine.showToast('Permission Denied', err.message, 'warning');
      alert(err.message);
    }
  };

  window.archiveMenuItemAction = (itemId) => {
    try {
      store.archiveMenuItem(itemId);
      automationEngine.showToast('Menu Item Archived', 'Item moved to archived status.', 'info');
      if (window.renderApp) window.renderApp();
    } catch (err) {
      automationEngine.showToast('Permission Denied', err.message, 'warning');
      alert(err.message);
    }
  };

  window.deleteMenuItemAction = (itemId) => {
    if (!confirm('Are you sure you want to delete this menu item completely?')) return;
    try {
      store.deleteMenuItem(itemId);
      automationEngine.showToast('Menu Item Deleted', 'Item removed from catalog.', 'info');
      if (window.renderApp) window.renderApp();
    } catch (err) {
      automationEngine.showToast('Permission Denied', err.message, 'warning');
      alert(err.message);
    }
  };

  // --- CONTENT MANAGEMENT: AMENITIES ---
  window.openCreateAmenityModal = () => {
    activeEditAmenityId = 'NEW';
    if (window.renderApp) window.renderApp();
  };

  window.openEditAmenityModal = (amenityId) => {
    activeEditAmenityId = amenityId;
    if (window.renderApp) window.renderApp();
  };

  window.closeAmenityModal = () => {
    activeEditAmenityId = null;
    if (window.renderApp) window.renderApp();
  };

  window.saveAmenityForm = (e) => {
    if (e) e.preventDefault();
    try {
      const name = document.getElementById('amenity-name')?.value?.trim();
      const category = document.getElementById('amenity-category')?.value;
      const openingHours = document.getElementById('amenity-hours')?.value?.trim();
      const location = document.getElementById('amenity-location')?.value?.trim();
      const description = document.getElementById('amenity-desc')?.value?.trim();
      const rules = document.getElementById('amenity-rules')?.value?.trim();
      const contact = document.getElementById('amenity-contact')?.value?.trim() || 'Ext 0 / Front Desk';
      const image = document.getElementById('amenity-image')?.value?.trim();
      const status = document.getElementById('amenity-status')?.value || 'PUBLISHED';
      const available = document.getElementById('amenity-available')?.checked ?? true;
      const featured = document.getElementById('amenity-featured')?.checked ?? false;
      const reason = document.getElementById('amenity-reason')?.value?.trim() || 'Amenity configuration update';

      if (!name || !openingHours || !location) {
        alert('Please fill in amenity name, opening hours, and location.');
        return;
      }

      const amenityData = {
        name,
        category,
        openingHours,
        location,
        description,
        rules,
        contact,
        image,
        status,
        available,
        featured
      };

      if (activeEditAmenityId === 'NEW') {
        store.addAmenity(amenityData);
        automationEngine.showToast('Amenity Created', `"${name}" added to property directory.`, 'success');
      } else {
        store.updateAmenity(activeEditAmenityId, amenityData, null, reason);
        automationEngine.showToast('Amenity Updated', `"${name}" updated successfully.`, 'success');
      }

      activeEditAmenityId = null;
      if (window.renderApp) window.renderApp();
    } catch (err) {
      automationEngine.showToast('Permission Denied', err.message, 'warning');
      alert(err.message);
    }
  };

  window.deleteAmenityAction = (amenityId) => {
    if (!confirm('Are you sure you want to delete this amenity listing?')) return;
    try {
      store.deleteAmenity(amenityId);
      automationEngine.showToast('Amenity Deleted', 'Amenity removed.', 'info');
      if (window.renderApp) window.renderApp();
    } catch (err) {
      automationEngine.showToast('Permission Denied', err.message, 'warning');
      alert(err.message);
    }
  };

  // --- CONTENT MANAGEMENT: BREAKFAST SERVICE ---
  window.saveBreakfastSettings = (e) => {
    if (e) e.preventDefault();
    try {
      const from = document.getElementById('b-serving-from')?.value?.trim() || '06:30 AM';
      const until = document.getElementById('b-serving-until')?.value?.trim() || '11:00 AM';
      const price = parseFloat(document.getElementById('b-standard-price')?.value) || 8500;
      const reason = document.getElementById('b-reason')?.value?.trim() || 'Breakfast hours updated';

      store.updateBreakfastConfig({
        servingFrom: from,
        servingUntil: until,
        standardPrice: price
      }, null, reason);

      automationEngine.showToast('Breakfast Hours Published', `Serving from ${from} to ${until} (₦${price.toLocaleString()})`, 'success');
      if (window.renderApp) window.renderApp();
    } catch (err) {
      automationEngine.showToast('Permission Denied', err.message, 'warning');
      alert(err.message);
    }
  };

  // --- CONTENT MANAGEMENT: SERVICE OPTIONS (PORTER & HOUSEKEEPING) ---
  window.saveServiceOptions = (serviceType) => {
    try {
      if (serviceType === 'porter') {
        const roomDesc = document.getElementById('porter-room-desc')?.value?.trim();
        const lobbyDesc = document.getElementById('porter-lobby-desc')?.value?.trim();
        store.updateServiceOptions('porter', {
          locations: [
            { id: 'LOC-ROOM', name: 'In Room', desc: roomDesc || 'Luggage assistance inside your private suite', available: true },
            { id: 'LOC-LOBBY', name: 'Main Lobby', desc: lobbyDesc || 'Luggage collection at front desk reception', available: true }
          ]
        }, null, 'Porter location instructions updated');
        automationEngine.showToast('Porter Options Saved', 'In Room and Main Lobby settings updated (No Storage Vault).', 'success');
      }
      if (window.renderApp) window.renderApp();
    } catch (err) {
      automationEngine.showToast('Permission Denied', err.message, 'warning');
      alert(err.message);
    }
  };

  // --- MEDIA LIBRARY MANAGEMENT ---
  window.openMediaModal = () => {
    activeMediaUploadModal = true;
    if (window.renderApp) window.renderApp();
  };

  window.closeMediaModal = () => {
    activeMediaUploadModal = false;
    if (window.renderApp) window.renderApp();
  };

  window.handleMediaFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // File Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file format. Please upload JPG, PNG, or WEBP images only.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds maximum limit of 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const previewImg = document.getElementById('upload-preview-img');
      const previewContainer = document.getElementById('upload-preview-container');
      if (previewImg && previewContainer) {
        previewImg.src = dataUrl;
        previewContainer.style.display = 'block';
      }
      window.currentUploadedBase64 = dataUrl;
      window.currentUploadedFileName = file.name;
      window.currentUploadedFileSize = `${Math.round(file.size / 1024)} KB`;
      window.currentUploadedFileType = file.type;
    };
    reader.readAsDataURL(file);
  };

  window.saveMediaAsset = (e) => {
    if (e) e.preventDefault();
    try {
      const title = document.getElementById('media-asset-title')?.value?.trim();
      const category = document.getElementById('media-asset-category')?.value || 'Restaurant';
      const customUrl = document.getElementById('media-asset-url')?.value?.trim();
      const finalUrl = window.currentUploadedBase64 || customUrl;

      if (!finalUrl) {
        alert('Please choose an image file or provide an image URL.');
        return;
      }

      store.addMediaAsset({
        title: title || window.currentUploadedFileName || 'New Asset',
        fileName: window.currentUploadedFileName || 'custom_image.jpg',
        fileType: window.currentUploadedFileType || 'image/jpeg',
        fileSize: window.currentUploadedFileSize || '220 KB',
        dimensions: '1200x800',
        url: finalUrl,
        category
      });

      automationEngine.showToast('Media Asset Uploaded', `Asset "${title || 'Image'}" added to Media Library.`, 'success');
      activeMediaUploadModal = false;
      window.currentUploadedBase64 = null;
      if (window.renderApp) window.renderApp();
    } catch (err) {
      automationEngine.showToast('Permission Denied', err.message, 'warning');
      alert(err.message);
    }
  };

  window.deleteMediaAssetAction = (mediaId) => {
    if (!confirm('Are you sure you want to delete this media asset?')) return;
    try {
      store.deleteMediaAsset(mediaId);
      automationEngine.showToast('Media Asset Deleted', 'Asset removed from library.', 'info');
      if (window.renderApp) window.renderApp();
    } catch (err) {
      automationEngine.showToast('Permission Denied', err.message, 'warning');
      alert(err.message);
    }
  };

  // --- VERSION HISTORY & ROLLBACK ---
  window.openVersionModal = (entityType, entityId, title) => {
    activeVersionModal = { entityType, entityId, title };
    if (window.renderApp) window.renderApp();
  };

  window.closeVersionModal = () => {
    activeVersionModal = null;
    if (window.renderApp) window.renderApp();
  };

  window.restoreVersionAction = (entityType, entityId, versionNum) => {
    if (!confirm(`Are you sure you want to restore Version #${versionNum}? This action will create a new audit record.`)) return;
    try {
      if (entityType === 'MENU_ITEM') {
        store.restoreMenuItemVersion(entityId, versionNum);
      } else if (entityType === 'AMENITY') {
        store.restoreAmenityVersion(entityId, versionNum);
      }
      automationEngine.showToast('Version Restored', `Restored ${entityId} to Version #${versionNum}`, 'success');
      activeVersionModal = null;
      if (window.renderApp) window.renderApp();
    } catch (err) {
      automationEngine.showToast('Restore Failed', err.message, 'warning');
      alert(err.message);
    }
  };

  // --- TRANSPORTATION MANAGEMENT ---
  window.saveZonePrice = (zoneId) => {
    try {
      const fareInput = document.getElementById(`zone-fare-${zoneId}`);
      const minsInput = document.getElementById(`zone-mins-${zoneId}`);
      const fare = parseFloat(fareInput?.value);
      const mins = parseInt(minsInput?.value, 10);
      const reason = prompt('Enter justification for transportation fare change:', 'Seasonal tariff review') || 'Tariff update';

      store.updateZonePricing(zoneId, fare, mins, null, reason);
      automationEngine.showToast('Fare Updated', `Zone ${zoneId} base fare updated to ₦${fare.toLocaleString()}`, 'success');
      if (window.renderApp) window.renderApp();
    } catch (err) {
      automationEngine.showToast('Permission Denied', err.message, 'warning');
      alert(err.message);
    }
  };

  // --- STAFF & RBAC DIRECTORY ---
  window.openCreateStaffModal = () => {
    activeEditStaffId = 'NEW';
    if (window.renderApp) window.renderApp();
  };

  window.openEditStaffModal = (staffId) => {
    activeEditStaffId = staffId;
    if (window.renderApp) window.renderApp();
  };

  window.closeStaffModal = () => {
    activeEditStaffId = null;
    if (window.renderApp) window.renderApp();
  };

  window.saveStaffForm = (e) => {
    if (e) e.preventDefault();
    try {
      const name = document.getElementById('staff-name')?.value?.trim();
      const role = document.getElementById('staff-role')?.value?.trim();
      const adminRole = document.getElementById('staff-admin-role')?.value;
      const department = document.getElementById('staff-dept')?.value;
      const shift = document.getElementById('staff-shift')?.value?.trim();
      const active = document.getElementById('staff-active')?.checked ?? true;

      if (!name || !role) {
        alert('Please fill in staff name and operational role.');
        return;
      }

      if (activeEditStaffId === 'NEW') {
        store.addStaffMember({ name, role, adminRole, department, shift, active });
        automationEngine.showToast('Staff Onboarded', `${name} added to staff directory.`, 'success');
      } else {
        store.updateStaffMember(activeEditStaffId, { name, role, adminRole, department, shift, active });
        automationEngine.showToast('Staff Profile Saved', `${name} credentials updated.`, 'success');
      }

      activeEditStaffId = null;
      if (window.renderApp) window.renderApp();
    } catch (err) {
      automationEngine.showToast('Permission Denied', err.message, 'warning');
      alert(err.message);
    }
  };

  window.toggleStaffStatusAction = (staffId) => {
    try {
      store.toggleStaffStatus(staffId);
      automationEngine.showToast('Status Toggled', 'Staff active status updated.', 'info');
      if (window.renderApp) window.renderApp();
    } catch (err) {
      automationEngine.showToast('Permission Denied', err.message, 'warning');
      alert(err.message);
    }
  };

  // --- TOLANI LEARNING CENTRE ACTIONS ---
  window.openEvidenceModal = (sugId) => {
    activeEvidenceModal = sugId;
    if (window.renderApp) window.renderApp();
  };

  window.closeEvidenceModal = () => {
    activeEvidenceModal = null;
    if (window.renderApp) window.renderApp();
  };

  window.approveLearningSuggestion = (sugId) => {
    try {
      const activeStaff = store.getActiveStaff();
      store.checkPermissionOrThrow('APPROVE_TOLANI_LEARNING', activeStaff);
      const res = learningEngine.approveSuggestion(sugId, `${activeStaff.name} (${activeStaff.adminRole})`);
      if (res.success) {
        automationEngine.playChime('success');
        automationEngine.showToast('Knowledge Update Approved', `${res.knowledgeUpdate.updateNumber} activated: "${res.knowledgeUpdate.title}"`, 'success');
        if (window.renderApp) window.renderApp();
      }
    } catch (err) {
      automationEngine.showToast('Approval Blocked', err.message, 'warning');
      alert(err.message);
    }
  };

  window.rejectLearningSuggestion = (sugId) => {
    try {
      const activeStaff = store.getActiveStaff();
      store.checkPermissionOrThrow('APPROVE_TOLANI_LEARNING', activeStaff);
      learningEngine.rejectSuggestion(sugId, `${activeStaff.name} (${activeStaff.adminRole})`);
      automationEngine.showToast('Suggestion Rejected', `Proposal ${sugId} dismissed.`, 'info');
      if (window.renderApp) window.renderApp();
    } catch (err) {
      automationEngine.showToast('Action Blocked', err.message, 'warning');
      alert(err.message);
    }
  };

  window.rollbackKnowledgeUpdate = (updateId) => {
    try {
      const activeStaff = store.getActiveStaff();
      store.checkPermissionOrThrow('ROLLBACK_TOLANI_LEARNING', activeStaff);
      const proceed = confirm(`Are you sure you want to rollback ${updateId}? This will remove the learned phrase mapping from production AI.`);
      if (!proceed) return;
      const res = learningEngine.rollbackKnowledgeUpdate(updateId, `${activeStaff.name} (${activeStaff.adminRole})`);
      if (res.success) {
        automationEngine.showToast('Knowledge Rolled Back', `Update ${updateId} reverted.`, 'warning');
        if (window.renderApp) window.renderApp();
      }
    } catch (err) {
      automationEngine.showToast('Rollback Blocked', err.message, 'warning');
      alert(err.message);
    }
  };

  window.clearLearningData = () => {
    try {
      const activeStaff = store.getActiveStaff();
      store.checkPermissionOrThrow('APPROVE_TOLANI_LEARNING', activeStaff);
      const proceed = confirm('Are you sure you want to clear all guest interaction logs and reset learning metrics? Approved production rules will remain intact.');
      if (!proceed) return;
      learningEngine.clearAllData(activeStaff.name);
      automationEngine.showToast('Data Cleared', 'Guest interaction logs wiped clean.', 'info');
      if (window.renderApp) window.renderApp();
    } catch (err) {
      automationEngine.showToast('Action Blocked', err.message, 'warning');
      alert(err.message);
    }
  };

  window.exportLearningAnalytics = () => {
    const data = learningEngine.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hotel-capitol-tolani-learning-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    automationEngine.showToast('Export Complete', 'Learning analytics JSON downloaded.', 'success');
  };

  // --- FILTERS & SEARCH ---
  window.updateLogSearch = (val) => {
    logSearchFilter = val;
    if (window.renderApp) window.renderApp();
  };

  window.updateLogServiceFilter = (val) => {
    logServiceFilter = val;
    if (window.renderApp) window.renderApp();
  };

  window.updateMenuCategoryFilter = (val) => {
    menuCategoryFilter = val;
    if (window.renderApp) window.renderApp();
  };

  window.updateAuditSearch = (val) => {
    auditSearchFilter = val;
    if (window.renderApp) window.renderApp();
  };

  window.updateAuditModule = (val) => {
    auditModuleFilter = val;
    if (window.renderApp) window.renderApp();
  };
}

export function renderManagerPortal() {
  const state = store.getState();
  const activeStaff = store.getActiveStaff();
  const currentRole = activeStaff?.adminRole || (activeStaff?.id === 'STF-05' ? 'SUPER_ADMIN' : 'HOTEL_ADMIN');

  // Metrics
  const activeOrders = (state.orders || []).filter(o => o.status !== 'DELIVERED');
  const restaurantOrders = (state.orders || []).filter(o => !o.items.some(i => i.name.includes('Breakfast')));
  const breakfastOrders = (state.orders || []).filter(o => o.items.some(i => i.name.includes('Breakfast')));
  const pendingRequests = (state.serviceRequests || []).filter(r => r.status === 'PENDING' || r.status === 'IN PROGRESS');
  const porterRequests = (state.serviceRequests || []).filter(r => r.type === 'Concierge' || r.title.toLowerCase().includes('porter') || r.title.toLowerCase().includes('luggage'));
  const hkRequests = (state.serviceRequests || []).filter(r => r.type === 'Housekeeping');
  const transportBookings = (state.transportBookings || []);
  const activeTransport = transportBookings.filter(b => b.status !== 'COMPLETED');
  const pendingSuggestions = (state.learningSuggestions || []).filter(s => s.status === 'PENDING_REVIEW');
  const interactionCount = (state.interactionLogs || []).length;
  const staffOnDuty = (state.staffMembers || []).filter(s => s.clockedIn).length;
  const totalRevenue = (state.orders || []).reduce((sum, o) => sum + o.totalAmount, 0) + transportBookings.reduce((sum, b) => sum + (b.price || 0), 0);

  let tabContent = '';
  if (managerActiveTab === 'overview') {
    tabContent = renderOverviewTab(state, activeOrders, pendingRequests, activeTransport, pendingSuggestions, staffOnDuty, totalRevenue);
  } else if (managerActiveTab === 'content-restaurant') {
    tabContent = renderRestaurantContentTab(state, currentRole);
  } else if (managerActiveTab === 'content-breakfast') {
    tabContent = renderBreakfastContentTab(state, currentRole);
  } else if (managerActiveTab === 'content-amenities') {
    tabContent = renderAmenitiesContentTab(state, currentRole);
  } else if (managerActiveTab === 'content-services') {
    tabContent = renderServiceOptionsTab(state, currentRole);
  } else if (managerActiveTab === 'content-media') {
    tabContent = renderMediaLibraryTab(state, currentRole);
  } else if (managerActiveTab === 'orders') {
    tabContent = renderOrdersManagementTab(state, activeOrders, pendingRequests);
  } else if (managerActiveTab === 'transportation') {
    tabContent = renderTransportationTab(state, currentRole);
  } else if (managerActiveTab === 'learning') {
    tabContent = renderLearningCentreTab(state, currentRole);
  } else if (managerActiveTab === 'staff') {
    tabContent = renderStaffDirectoryTab(state, currentRole);
  } else if (managerActiveTab === 'audit') {
    tabContent = renderAuditLogsTab(state);
  } else if (managerActiveTab === 'settings') {
    tabContent = renderSystemSettingsTab(state, currentRole);
  }

  return `
    <div class="container-custom py-6">
      
      <!-- TOP ADMIN COMMAND HEADER & RBAC USER SELECTOR -->
      <div class="glass-panel p-6 rounded-2xl mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-gold/40 shadow-xl" style="background: linear-gradient(135deg, rgba(12, 25, 42, 0.95) 0%, rgba(6, 13, 22, 0.95) 100%);">
        <div>
          <div class="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span class="text-[11px] font-bold uppercase tracking-luxury text-gold">Hotel Capitol Administration & Governance</span>
            <span class="badge-gold text-xs font-bold">${currentRole.replace(/_/g, ' ')}</span>
            <span class="text-xs text-slate-400">· Active Session: <strong>${activeStaff.name}</strong></span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-serif text-white font-bold">Admin & Support Console</h1>
          <p class="text-xs text-slate-300 mt-1">Centralized operational oversight, content publishing, media library, and AI governance.</p>
        </div>

        <!-- RBAC User Switcher & Actions -->
        <div class="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div class="flex flex-col text-right">
            <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Switch Admin Role:</span>
            <select 
              class="input-custom text-xs py-1.5 px-3 font-semibold bg-navy-950 border-gold/40 text-gold rounded-lg cursor-pointer"
              onchange="window.switchActiveAdminStaff(this.value)"
            >
              ${state.staffMembers.filter(s => s.adminRole || ['STF-05', 'STF-04', 'STF-02', 'STF-03', 'STF-06'].includes(s.id)).map(st => `
                <option value="${st.id}" ${st.id === state.activeStaffId ? 'selected' : ''}>
                  ${st.name} (${st.adminRole || st.role})
                </option>
              `).join('')}
            </select>
          </div>

          <button class="btn-primary text-xs py-2 px-4 font-bold" onclick="window.navigatePortal('guest')">
            Guest Portal View →
          </button>
        </div>
      </div>

      <!-- MAIN NAVIGATION TABS -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-thin border-b border-gold/20">
        ${[
          { id: 'overview', label: '📊 Dashboard' },
          { id: 'content-restaurant', label: '🍽️ Restaurant Menu' },
          { id: 'content-breakfast', label: '🍳 Breakfast Service' },
          { id: 'content-amenities', label: '🏊 Amenities' },
          { id: 'content-services', label: '🛎️ Service Options' },
          { id: 'content-media', label: '🖼️ Media Library' },
          { id: 'orders', label: '📦 Orders & Requests' },
          { id: 'transportation', label: '🚗 VIP Transportation' },
          { id: 'learning', label: '🧠 Tolani Learning' },
          { id: 'staff', label: '👥 Staff & RBAC' },
          { id: 'audit', label: '📜 Audit Logs' },
          { id: 'settings', label: '⚙️ Settings' }
        ].map(t => `
          <button 
            class="menu-btn-gold ${managerActiveTab === t.id ? 'active' : ''} whitespace-nowrap"
            style="padding: 7px 14px; font-size: 0.8rem;"
            onclick="window.navigateManagerTab('${t.id}')"
          >
            ${t.label}
          </button>
        `).join('')}
      </div>

      <!-- ACTIVE TAB BODY -->
      ${tabContent}

      <!-- MODALS -->
      ${renderModals(state, activeEditMenuItemId, activeEditAmenityId, activeEditStaffId, activeVersionModal, activeEvidenceModal, activeMediaUploadModal)}

    </div>
  `;
}

// ==========================================
// 1. OVERVIEW & OPERATIONS DASHBOARD TAB
// ==========================================
function renderOverviewTab(state, activeOrders, pendingRequests, activeTransport, pendingSuggestions, staffOnDuty, totalRevenue) {
  const criticalStockItems = state.inventory.filter(i => i.status === 'CRITICAL');
  const lowStockItems = state.inventory.filter(i => i.status !== 'NORMAL');
  const interactionCount = (state.interactionLogs || []).length;

  return `
    <div class="flex flex-col gap-6 animate-fade-in">
      
      <!-- OPERATIONAL KPI CARDS -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div class="glass-panel p-4 rounded-xl border border-gold/30 flex flex-col justify-between">
          <span class="text-[10px] uppercase font-bold text-slate-400">Active Guests</span>
          <div class="text-2xl font-serif font-bold text-white mt-1">${state.guests.length} Suites</div>
          <span class="text-[11px] text-emerald-400 mt-1">100% Occupancy</span>
        </div>

        <div class="glass-panel p-4 rounded-xl border border-gold/30 flex flex-col justify-between">
          <span class="text-[10px] uppercase font-bold text-slate-400">Active Orders</span>
          <div class="text-2xl font-serif font-bold text-gold mt-1">${activeOrders.length} Orders</div>
          <span class="text-[11px] text-slate-300 mt-1">Kitchen In-Progress</span>
        </div>

        <div class="glass-panel p-4 rounded-xl border border-gold/30 flex flex-col justify-between">
          <span class="text-[10px] uppercase font-bold text-slate-400">Pending Requests</span>
          <div class="text-2xl font-serif font-bold text-amber-400 mt-1">${pendingRequests.length} Tasks</div>
          <span class="text-[11px] text-slate-300 mt-1">Porter / HK Queue</span>
        </div>

        <div class="glass-panel p-4 rounded-xl border border-gold/30 flex flex-col justify-between">
          <span class="text-[10px] uppercase font-bold text-slate-400">Transport Dispatches</span>
          <div class="text-2xl font-serif font-bold text-white mt-1">${activeTransport.length} Rides</div>
          <span class="text-[11px] text-emerald-400 mt-1">Chauffeurs Active</span>
        </div>

        <div class="glass-panel p-4 rounded-xl border border-gold/30 flex flex-col justify-between">
          <span class="text-[10px] uppercase font-bold text-slate-400">Tolani Logs</span>
          <div class="text-2xl font-serif font-bold text-purple-300 mt-1">${interactionCount}</div>
          <span class="text-[11px] text-slate-300 mt-1">AI Interactions</span>
        </div>

        <div class="glass-panel p-4 rounded-xl border border-gold/30 flex flex-col justify-between">
          <span class="text-[10px] uppercase font-bold text-slate-400">Pending AI Approvals</span>
          <div class="text-2xl font-serif font-bold text-yellow-400 mt-1">${pendingSuggestions.length} Items</div>
          <span class="text-[11px] text-yellow-300 mt-1">Requires GM Sign-Off</span>
        </div>

      </div>

      <!-- PRIORITY ALERTS STRIP -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 rounded-xl border border-red-500/40 bg-red-950/30 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-3.5 h-3.5 rounded-full bg-red-500 animate-pulse"></div>
            <div>
              <div class="text-xs font-bold text-white uppercase">🔴 Critical Stock Alerts</div>
              <div class="text-xs text-red-300">${criticalStockItems.length} Inventory Breaches</div>
            </div>
          </div>
          <button class="btn-secondary text-xs py-1 px-3" onclick="window.navigateManagerTab('orders')">View →</button>
        </div>

        <div class="p-4 rounded-xl border border-amber-500/40 bg-amber-950/30 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-3.5 h-3.5 rounded-full bg-amber-500"></div>
            <div>
              <div class="text-xs font-bold text-white uppercase">🟠 Pending Staff Tasks</div>
              <div class="text-xs text-amber-300">${pendingRequests.length} Guest Service Tickets</div>
            </div>
          </div>
          <button class="btn-secondary text-xs py-1 px-3" onclick="window.navigateManagerTab('orders')">Review →</button>
        </div>

        <div class="p-4 rounded-xl border border-yellow-500/40 bg-yellow-950/30 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-3.5 h-3.5 rounded-full bg-yellow-500"></div>
            <div>
              <div class="text-xs font-bold text-white uppercase">🟡 AI Learning Queue</div>
              <div class="text-xs text-yellow-300">${pendingSuggestions.length} Suggestions Awaiting Gate</div>
            </div>
          </div>
          <button class="btn-primary text-xs py-1 px-3 font-bold" onclick="window.navigateManagerTab('learning')">Review AI →</button>
        </div>
      </div>

      <!-- RECENT ACTIVITY FEED & LIVE SUMMARY -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Live Orders Stream -->
        <div class="glass-panel p-5 rounded-2xl border border-gold/20 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-serif text-base font-bold text-white flex items-center gap-2">
                <span>🍽️</span> <span>Live Restaurant & Breakfast Tickets</span>
              </h3>
              <span class="badge-gold text-xs">${activeOrders.length} Active</span>
            </div>

            <div class="flex flex-col gap-2.5">
              ${activeOrders.length === 0 ? `
                <div class="p-4 text-center text-xs text-slate-400">No active kitchen orders.</div>
              ` : activeOrders.map(o => `
                <div class="p-3 rounded-xl bg-navy-950/80 border border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <div class="font-bold text-white">${o.id} · Suite #${o.roomNumber} (${o.guestName})</div>
                    <div class="text-slate-300 text-[11px]">${o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</div>
                  </div>
                  <div class="text-right">
                    <span class="badge-gold text-[10px]">${o.status}</span>
                    <div class="text-gold font-bold mt-0.5">₦${o.totalAmount.toLocaleString()}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="pt-4 mt-4 border-t border-white/10 flex justify-end">
            <button class="btn-secondary text-xs py-1.5 px-4" onclick="window.navigateManagerTab('orders')">
              Manage All Orders →
            </button>
          </div>
        </div>

        <!-- Recent Audit Log Trail -->
        <div class="glass-panel p-5 rounded-2xl border border-gold/20 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-serif text-base font-bold text-white flex items-center gap-2">
                <span>📜</span> <span>Recent Administrative & Policy Audits</span>
              </h3>
              <span class="badge-subtle text-xs text-slate-300">Live Trail</span>
            </div>

            <div class="flex flex-col gap-2.5">
              ${(state.auditLog || []).slice(0, 5).map(a => `
                <div class="p-2.5 rounded-xl bg-navy-950/80 border border-white/5 text-xs">
                  <div class="flex items-center justify-between text-slate-400 text-[10px] mb-0.5">
                    <span>${a.timestamp} · <strong>${a.actor}</strong></span>
                    <span class="text-gold">${a.action}</span>
                  </div>
                  <div class="text-white font-medium">${a.entity}</div>
                  <div class="text-slate-300 text-[11px]">${a.details}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="pt-4 mt-4 border-t border-white/10 flex justify-end">
            <button class="btn-secondary text-xs py-1.5 px-4" onclick="window.navigateManagerTab('audit')">
              View Full Audit Trail →
            </button>
          </div>
        </div>

      </div>

    </div>
  `;
}

// ==========================================
// 2. RESTAURANT MENU CONTENT MANAGEMENT TAB
// ==========================================
function renderRestaurantContentTab(state, currentRole) {
  const canManage = store.hasPermission('MANAGE_MENU');
  const canPublish = store.hasPermission('PUBLISH_MENU');
  const categories = ['ALL', 'Food', 'Drinks', 'Breakfast', 'Desserts', 'Snacks'];

  const filteredMenu = (state.menu || []).filter(item => {
    if (menuCategoryFilter !== 'ALL' && item.category !== menuCategoryFilter) return false;
    return true;
  });

  return `
    <div class="flex flex-col gap-6 animate-fade-in">
      
      <!-- Top Action Bar -->
      <div class="glass-panel p-5 rounded-2xl border border-gold/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-serif text-white font-bold">Restaurant & Dining Menu Catalog</h2>
          <p class="text-xs text-slate-300 mt-0.5">Directly publish, price, edit, or archive dining items. Published dishes immediately reflect in Guest Portal and Tolani AI.</p>
        </div>

        <div class="flex items-center gap-3">
          <button 
            class="btn-primary text-xs py-2 px-5 font-bold ${!canManage ? 'opacity-50 cursor-not-allowed' : ''}"
            onclick="${canManage ? 'window.openCreateMenuModal()' : 'alert(\'Permission Denied: Your role cannot add menu items.\')'}"
          >
            + Create New Dish / Beverage
          </button>
        </div>
      </div>

      <!-- Category Filter Tabs -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        ${categories.map(cat => `
          <button 
            class="px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
              menuCategoryFilter === cat 
                ? 'bg-gold text-navy-950 border-gold shadow-md' 
                : 'bg-navy-950/80 text-slate-300 border-white/10 hover:border-gold/50'
            }"
            onclick="window.updateMenuCategoryFilter('${cat}')"
          >
            ${cat} (${cat === 'ALL' ? state.menu.length : state.menu.filter(m => m.category === cat).length})
          </button>
        `).join('')}
      </div>

      <!-- Menu Items Data Table / Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${filteredMenu.map(item => `
          <div class="glass-panel rounded-2xl overflow-hidden border-2 ${item.available ? 'border-gold/30 hover:border-gold' : 'border-slate-700 opacity-75'} flex flex-col justify-between transition-all" style="box-shadow: 0 4px 20px rgba(0,0,0,0.4);">
            
            <!-- Image & Status Overlay -->
            <div class="h-44 w-full relative bg-navy-950 overflow-hidden">
              <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover" />
              <div class="absolute top-2.5 left-2.5 flex gap-1.5">
                <span class="bg-navy-950/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-200 border border-white/10">
                  ${item.category}
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  item.status === 'PUBLISHED' ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40' :
                  item.status === 'DRAFT' ? 'bg-amber-950/90 text-amber-300 border-amber-500/40' :
                  'bg-slate-900 text-slate-400 border-slate-700'
                }">
                  ${item.status || 'PUBLISHED'}
                </span>
              </div>

              <div class="absolute top-2.5 right-2.5">
                <span class="badge-gold text-[10px] font-bold">Ver #${item.version || 1}</span>
              </div>
            </div>

            <!-- Card Content -->
            <div class="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div class="flex items-start justify-between gap-2 mb-1.5">
                  <h3 class="font-serif text-base text-white font-bold">${item.name}</h3>
                  <div class="text-gold font-bold text-sm whitespace-nowrap">₦${item.price.toLocaleString()}</div>
                </div>

                <div class="flex items-center gap-3 text-xs text-slate-400 mb-2">
                  <span>⏱️ ${item.prepTimeMinutes || 20}m prep</span>
                  <span>🚀 ${item.estimatedDeliveryMinutes || 15}m delivery</span>
                </div>

                <p class="text-xs text-slate-300 leading-relaxed mb-4">${item.desc}</p>

                <!-- Addons Snippet -->
                ${item.addons && item.addons.length > 0 ? `
                  <div class="text-[11px] text-slate-400 mb-3 bg-navy-950/60 p-2.5 rounded-lg border border-white/5">
                    <strong class="text-gold font-medium">Extras (${item.addons.length}):</strong> 
                    ${item.addons.map(a => `${a.name} (+₦${a.price.toLocaleString()})`).slice(0, 2).join(', ')}${item.addons.length > 2 ? '...' : ''}
                  </div>
                ` : ''}
              </div>

              <!-- Action Buttons Strip -->
              <div class="pt-4 border-t border-white/10 flex flex-col gap-2">
                <div class="flex items-center justify-between gap-2">
                  <button 
                    class="btn-secondary text-xs py-1.5 px-3 flex-1 ${!canManage ? 'opacity-50 cursor-not-allowed' : ''}"
                    onclick="${canManage ? `window.openEditMenuModal('${item.id}')` : 'alert(\'Permission Denied\')'}"
                  >
                    ✏️ Edit Item
                  </button>

                  <button 
                    class="btn-secondary text-xs py-1.5 px-3 ${!canManage ? 'opacity-50 cursor-not-allowed' : ''}"
                    onclick="${canManage ? `window.toggleMenuAvailability('${item.id}')` : 'alert(\'Permission Denied\')'}"
                    title="Toggle guest availability"
                  >
                    ${item.available ? '🟢 In Stock' : '🔴 Sold Out'}
                  </button>

                  <button 
                    class="btn-secondary text-xs py-1.5 px-2.5"
                    onclick="window.openVersionModal('MENU_ITEM', '${item.id}', '${item.name}')"
                    title="View version history & restore"
                  >
                    📜 History
                  </button>
                </div>

                <div class="flex items-center justify-between gap-2 text-xs">
                  ${item.status !== 'PUBLISHED' ? `
                    <button 
                      class="text-xs text-emerald-400 underline font-semibold bg-transparent border-none cursor-pointer"
                      onclick="window.publishMenuItemAction('${item.id}')"
                    >
                      ✓ Publish Live
                    </button>
                  ` : `
                    <button 
                      class="text-xs text-slate-400 underline bg-transparent border-none cursor-pointer"
                      onclick="window.archiveMenuItemAction('${item.id}')"
                    >
                      Archive Item
                    </button>
                  `}

                  <button 
                    class="text-xs text-red-400 underline bg-transparent border-none cursor-pointer"
                    onclick="window.deleteMenuItemAction('${item.id}')"
                  >
                    Delete
                  </button>
                </div>
              </div>

            </div>
          </div>
        `).join('')}
      </div>

    </div>
  `;
}

// ==========================================
// 3. BREAKFAST SERVICE CONTENT MANAGEMENT
// ==========================================
function renderBreakfastContentTab(state, currentRole) {
  const bConf = state.breakfastConfig || {
    serviceName: 'Hotel Capitol Royal Breakfast Service',
    servingFrom: '06:30 AM',
    servingUntil: '11:00 AM',
    standardPrice: 8500
  };

  const breakfastDishes = (state.menu || []).filter(m => m.category === 'Breakfast');

  return `
    <div class="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto">
      
      <!-- Serving Window Settings Card -->
      <div class="glass-panel p-6 rounded-2xl border border-gold/30">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-luxury text-gold">Breakfast Policy & Schedule</span>
            <h2 class="text-xl font-serif text-white font-bold mt-0.5">Breakfast Service Configuration</h2>
          </div>
          <span class="badge-gold text-xs">Version #${bConf.version || 1}</span>
        </div>

        <form onsubmit="window.saveBreakfastSettings(event)" class="flex flex-col gap-4">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Serving From:</label>
              <input type="text" id="b-serving-from" class="input-custom text-xs" value="${bConf.servingFrom}" placeholder="e.g. 06:30 AM" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Serving Until:</label>
              <input type="text" id="b-serving-until" class="input-custom text-xs" value="${bConf.servingUntil}" placeholder="e.g. 11:00 AM" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Standard Folio Price (₦):</label>
              <input type="number" id="b-standard-price" class="input-custom text-xs" value="${bConf.standardPrice}" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5">Reason for Update (Audited):</label>
            <input type="text" id="b-reason" class="input-custom text-xs" placeholder="e.g., Extended weekend breakfast hours" />
          </div>

          <div class="flex justify-end pt-2">
            <button type="submit" class="btn-primary text-xs py-2 px-6 font-bold">
              Publish Breakfast Schedule →
            </button>
          </div>
        </form>
      </div>

      <!-- Published Breakfast Dishes -->
      <div class="glass-panel p-6 rounded-2xl border border-gold/20">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-serif text-base font-bold text-white">Active Breakfast Dishes</h3>
          <button class="btn-secondary text-xs py-1.5 px-3.5 font-semibold" onclick="window.openCreateMenuModal()">
            + Add Breakfast Dish
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${breakfastDishes.map(b => `
            <div class="p-4 rounded-xl bg-navy-950/80 border border-white/10 flex items-start justify-between gap-3">
              <img src="${b.image}" class="w-16 h-16 rounded-lg object-cover" alt="${b.name}" />
              <div class="flex-1">
                <div class="font-bold text-white text-xs">${b.name}</div>
                <div class="text-[11px] text-slate-300 mt-0.5 line-clamp-2">${b.desc}</div>
                <div class="text-gold text-xs font-bold mt-1">₦${b.price.toLocaleString()}</div>
              </div>
              <button class="btn-secondary text-xs py-1 px-2.5" onclick="window.openEditMenuModal('${b.id}')">Edit</button>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}

// ==========================================
// 4. AMENITIES CONTENT MANAGEMENT TAB
// ==========================================
function renderAmenitiesContentTab(state, currentRole) {
  const canManage = store.hasPermission('MANAGE_AMENITIES');
  const amenities = state.amenities || [];

  return `
    <div class="flex flex-col gap-6 animate-fade-in">
      
      <div class="glass-panel p-5 rounded-2xl border border-gold/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-serif text-white font-bold">Property Amenities & Facilities Catalog</h2>
          <p class="text-xs text-slate-300 mt-0.5">Manage operational hours, locations, resident rules, and concierge instructions.</p>
        </div>

        <button 
          class="btn-primary text-xs py-2 px-5 font-bold ${!canManage ? 'opacity-50 cursor-not-allowed' : ''}"
          onclick="${canManage ? 'window.openCreateAmenityModal()' : 'alert(\'Permission Denied\')'}"
        >
          + Add New Amenity
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${amenities.map(a => `
          <div class="glass-panel rounded-2xl overflow-hidden border-2 border-gold/30 flex flex-col justify-between">
            <div class="h-44 w-full relative bg-navy-950">
              <img src="${a.image}" alt="${a.name}" class="w-full h-full object-cover" />
              <div class="absolute top-2.5 left-2.5 bg-navy-950/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-200 border border-white/10">
                ${a.category}
              </div>
              <div class="absolute top-2.5 right-2.5">
                <span class="badge-gold text-[10px] font-bold">Ver #${a.version || 1}</span>
              </div>
            </div>

            <div class="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 class="font-serif text-base text-white font-bold mb-1">${a.name}</h3>
                <p class="text-xs text-slate-300 leading-relaxed mb-3">${a.description}</p>
                
                <div class="flex flex-col gap-1.5 p-3 rounded-xl bg-navy-950/70 border border-white/5 text-xs text-slate-300 mb-3">
                  <div class="flex justify-between">
                    <span class="text-slate-400">🕒 Hours:</span>
                    <strong class="text-gold">${a.openingHours}</strong>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">📍 Location:</span>
                    <strong class="text-white">${a.location}</strong>
                  </div>
                  ${a.rules ? `<div class="text-[11px] text-slate-400 pt-1 border-t border-white/5"><strong>Policy:</strong> ${a.rules}</div>` : ''}
                </div>
              </div>

              <div class="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                <button class="btn-secondary text-xs py-1.5 px-3 flex-1" onclick="window.openEditAmenityModal('${a.id}')">
                  ✏️ Edit Amenity
                </button>
                <button class="btn-secondary text-xs py-1.5 px-3" onclick="window.openVersionModal('AMENITY', '${a.id}', '${a.name}')">
                  📜 History
                </button>
                <button class="text-xs text-red-400 underline bg-transparent border-none cursor-pointer ml-2" onclick="window.deleteAmenityAction('${a.id}')">
                  Delete
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

    </div>
  `;
}

// ==========================================
// 5. SERVICE OPTIONS (PORTER & HOUSEKEEPING)
// ==========================================
function renderServiceOptionsTab(state, currentRole) {
  const serviceOptions = state.serviceOptions || {};
  const porter = serviceOptions.porter || { locations: [] };
  const housekeeping = serviceOptions.housekeeping || { items: [] };

  return `
    <div class="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto">
      
      <!-- Porter Configuration (Strict In Room & Main Lobby - Storage Vault Excluded) -->
      <div class="glass-panel p-6 rounded-2xl border border-gold/30">
        <div class="flex items-center justify-between mb-3">
          <div>
            <span class="text-xs font-bold uppercase tracking-luxury text-gold">Concierge & Luggage Routing</span>
            <h2 class="text-xl font-serif text-white font-bold">Porter Location Options</h2>
            <p class="text-xs text-slate-300 mt-0.5">Authoritative guest-facing Porter pickup stations. Storage Vault is strictly prohibited.</p>
          </div>
          <span class="badge-gold text-xs">Standard Locations</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
          <div class="p-4 rounded-xl bg-navy-950 border border-gold/30">
            <div class="font-bold text-white text-xs mb-1">1. IN ROOM</div>
            <textarea id="porter-room-desc" class="input-custom text-xs" rows="2">${porter.locations?.find(l => l.id === 'LOC-ROOM')?.desc || 'Luggage assistance inside your private suite'}</textarea>
          </div>

          <div class="p-4 rounded-xl bg-navy-950 border border-gold/30">
            <div class="font-bold text-white text-xs mb-1">2. MAIN LOBBY</div>
            <textarea id="porter-lobby-desc" class="input-custom text-xs" rows="2">${porter.locations?.find(l => l.id === 'LOC-LOBBY')?.desc || 'Luggage collection at front desk reception'}</textarea>
          </div>
        </div>

        <div class="flex justify-end">
          <button class="btn-primary text-xs py-2 px-5 font-bold" onclick="window.saveServiceOptions('porter')">
            Save Porter Options →
          </button>
        </div>
      </div>

      <!-- Housekeeping Request Types -->
      <div class="glass-panel p-6 rounded-2xl border border-gold/20">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-serif text-base font-bold text-white">Housekeeping & Amenity Items</h3>
          <span class="badge-subtle text-xs text-slate-300">Active Catalog</span>
        </div>

        <div class="flex flex-col gap-2.5">
          ${(housekeeping.items || []).map(hk => `
            <div class="p-3 rounded-xl bg-navy-950/80 border border-white/5 flex items-center justify-between text-xs">
              <div>
                <strong class="text-white">${hk.name}</strong>
                <span class="text-slate-400 ml-2">Category: ${hk.category}</span>
              </div>
              <span class="text-gold font-medium">~${hk.estMinutes} mins SLA</span>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}

// ==========================================
// 6. MEDIA & IMAGE LIBRARY MANAGEMENT
// ==========================================
function renderMediaLibraryTab(state, currentRole) {
  const canManage = store.hasPermission('MANAGE_MEDIA');
  const mediaItems = state.mediaLibrary || [];

  return `
    <div class="flex flex-col gap-6 animate-fade-in">
      
      <div class="glass-panel p-5 rounded-2xl border border-gold/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-serif text-white font-bold">Media & Photography Library</h2>
          <p class="text-xs text-slate-300 mt-0.5">Upload JPG, PNG, or WEBP luxury assets. Associate images with dining dishes, suites, amenities, or vehicles.</p>
        </div>

        <button 
          class="btn-primary text-xs py-2 px-5 font-bold ${!canManage ? 'opacity-50 cursor-not-allowed' : ''}"
          onclick="${canManage ? 'window.openMediaModal()' : 'alert(\'Permission Denied\')'}"
        >
          + Upload Media Asset
        </button>
      </div>

      <!-- Media Assets Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        ${mediaItems.map(item => `
          <div class="glass-panel rounded-xl overflow-hidden border border-white/10 flex flex-col justify-between hover:border-gold transition-all">
            <div class="h-36 w-full relative bg-navy-950 overflow-hidden">
              <img src="${item.url}" alt="${item.title}" class="w-full h-full object-cover" />
              <span class="absolute top-2 left-2 bg-navy-950/90 text-[10px] font-bold text-slate-200 px-2 py-0.5 rounded border border-white/10">
                ${item.category}
              </span>
            </div>

            <div class="p-3">
              <div class="font-bold text-white text-xs truncate" title="${item.title}">${item.title}</div>
              <div class="text-[10px] text-slate-400 mt-0.5">${item.fileSize} · ${item.dimensions}</div>
              <div class="text-[10px] text-slate-400 mt-0.5">By: ${item.uploadedBy || 'Admin'}</div>

              <div class="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <button 
                  class="text-[11px] text-gold font-medium bg-transparent border-none cursor-pointer underline"
                  onclick="navigator.clipboard.writeText('${item.url}'); automationEngine.showToast('Copied', 'Image URL copied to clipboard.', 'info');"
                >
                  Copy URL
                </button>
                <button 
                  class="text-[11px] text-red-400 bg-transparent border-none cursor-pointer underline"
                  onclick="window.deleteMediaAssetAction('${item.id}')"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

    </div>
  `;
}

// ==========================================
// 7. ORDERS & SERVICE REQUESTS QUEUE TAB
// ==========================================
function renderOrdersManagementTab(state, activeOrders, pendingRequests) {
  return `
    <div class="flex flex-col gap-6 animate-fade-in">
      
      <!-- Restaurant & Breakfast Orders Queue -->
      <div class="glass-panel p-6 rounded-2xl border border-gold/30">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-serif text-white font-bold">Active Kitchen & Dining Orders</h2>
          <span class="badge-gold text-xs">${activeOrders.length} In Progress</span>
        </div>

        <div class="flex flex-col gap-3">
          ${activeOrders.length === 0 ? `
            <div class="p-6 text-center text-xs text-slate-400">All orders delivered. Kitchen is clear.</div>
          ` : activeOrders.map(order => `
            <div class="p-4 rounded-xl bg-navy-950 border border-gold/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <strong class="text-white text-sm">${order.id}</strong>
                  <span class="badge-gold text-xs">Suite #${order.roomNumber} (${order.guestName})</span>
                  <span class="text-slate-400 text-xs">Placed: ${order.createdAt}</span>
                </div>
                <div class="text-xs text-slate-300">
                  ${order.items.map(i => `<span class="text-gold font-semibold">${i.quantity}x</span> ${i.name}`).join(' · ')}
                </div>
              </div>

              <div class="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <div class="text-right">
                  <div class="text-gold font-bold text-sm">₦${order.totalAmount.toLocaleString()}</div>
                  <span class="badge-subtle text-[10px] text-emerald-400 font-bold">${order.status}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Department Service Requests -->
      <div class="glass-panel p-6 rounded-2xl border border-gold/20">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-serif text-base font-bold text-white">Housekeeping & Porter Requests</h3>
          <span class="badge-subtle text-xs text-slate-300">${pendingRequests.length} Pending</span>
        </div>

        <div class="flex flex-col gap-3">
          ${pendingRequests.map(req => `
            <div class="p-3 rounded-xl bg-navy-950/80 border border-white/5 flex items-center justify-between text-xs">
              <div>
                <div class="font-bold text-white">${req.id} · ${req.title}</div>
                <div class="text-slate-400 text-[11px]">Suite #${req.roomNumber} (${req.guestName}) · Type: ${req.type}</div>
              </div>
              <span class="badge-gold text-[10px]">${req.status}</span>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}

// ==========================================
// 8. VIP TRANSPORTATION MANAGEMENT TAB
// ==========================================
function renderTransportationTab(state, currentRole) {
  const canManage = store.hasPermission('MANAGE_TRANSPORT_PRICING');
  const zones = state.lagosZones || [];
  const vehicles = state.vehicleClasses || [];
  const bookings = state.transportBookings || [];

  return `
    <div class="flex flex-col gap-6 animate-fade-in">
      
      <!-- Lagos Zonal Pricing Matrix -->
      <div class="glass-panel p-6 rounded-2xl border border-gold/30">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-luxury text-gold">Lagos Zonal Transportation</span>
            <h2 class="text-xl font-serif text-white font-bold">Zonal Pricing & Duration Matrix</h2>
          </div>
          <span class="badge-gold text-xs">${zones.length} Zonal Hubs</span>
        </div>

        <div class="flex flex-col gap-3">
          ${zones.map(zone => `
            <div class="p-4 rounded-xl bg-navy-950 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="badge-gold text-[10px] font-bold">${zone.id}</span>
                  <strong class="text-white text-sm">${zone.name}</strong>
                  <span class="text-slate-400 text-xs">(${zone.region})</span>
                </div>
                <div class="text-xs text-slate-300">${zone.locations}</div>
              </div>

              <div class="flex items-center gap-3">
                <div class="flex flex-col">
                  <label class="text-[10px] text-slate-400">Base Fare (₦):</label>
                  <input 
                    type="number" 
                    id="zone-fare-${zone.id}" 
                    class="input-custom text-xs py-1 px-2.5 w-28 text-gold font-bold" 
                    value="${zone.baseFare}" 
                  />
                </div>

                <div class="flex flex-col">
                  <label class="text-[10px] text-slate-400">Est. Mins:</label>
                  <input 
                    type="number" 
                    id="zone-mins-${zone.id}" 
                    class="input-custom text-xs py-1 px-2.5 w-16" 
                    value="${zone.estimatedMinutes}" 
                  />
                </div>

                <button 
                  class="btn-primary text-xs py-2 px-4 font-bold ${!canManage ? 'opacity-50 cursor-not-allowed' : ''}"
                  onclick="${canManage ? `window.saveZonePrice('${zone.id}')` : 'alert(\'Permission Denied\')'}"
                >
                  Save Fare
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Vehicle Classes & Fleet Multipliers -->
      <div class="glass-panel p-6 rounded-2xl border border-gold/20">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-serif text-base font-bold text-white">Chauffeur Fleet & Multipliers</h3>
          <span class="badge-subtle text-xs text-slate-300">4 Classes</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${vehicles.map(v => `
            <div class="p-4 rounded-xl bg-navy-950 border border-gold/20 flex flex-col justify-between">
              <div>
                <div class="font-serif font-bold text-white text-sm mb-1">${v.name}</div>
                <div class="text-xs text-slate-300 mb-2">${v.models}</div>
                <div class="text-xs text-gold font-bold">Multiplier: ${v.multiplier}x</div>
                <div class="text-xs text-slate-300">12-Hr Charter: ₦${v.charterDailyRate.toLocaleString()}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Active Bookings -->
      <div class="glass-panel p-6 rounded-2xl border border-gold/20">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-serif text-base font-bold text-white">Recent Chauffeur Dispatches & Bookings</h3>
          <span class="badge-gold text-xs">${bookings.length} Total</span>
        </div>

        <div class="flex flex-col gap-2.5">
          ${bookings.map(b => `
            <div class="p-3 rounded-xl bg-navy-950 border border-white/5 flex items-center justify-between text-xs">
              <div>
                <div class="font-bold text-white">${b.id} · ${b.destination}</div>
                <div class="text-slate-400 text-[11px]">Suite #${b.roomNumber} (${b.guestName}) · Departs: ${b.departureDate} at ${b.departureTime}</div>
              </div>
              <div class="text-right">
                <span class="badge-gold text-[10px]">${b.status}</span>
                <div class="text-gold font-bold mt-0.5">₦${b.price.toLocaleString()}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}

// ==========================================
// 9. TOLANI LEARNING CENTRE TAB
// ==========================================
function renderLearningCentreTab(state, currentRole) {
  const canApprove = store.hasPermission('APPROVE_TOLANI_LEARNING');
  const canRollback = store.hasPermission('ROLLBACK_TOLANI_LEARNING');
  const suggestions = state.learningSuggestions || [];
  const pendingSuggestions = suggestions.filter(s => s.status === 'PENDING_REVIEW');
  const approvedUpdates = state.approvedKnowledgeUpdates || [];
  const logs = state.interactionLogs || [];

  const filteredLogs = logs.filter(l => {
    if (logServiceFilter !== 'ALL' && l.activeService !== logServiceFilter) return false;
    if (logSearchFilter) {
      const q = logSearchFilter.toLowerCase();
      const matchMsg = l.guestMessage?.toLowerCase().includes(q);
      const matchResp = l.aiResponse?.toLowerCase().includes(q);
      if (!matchMsg && !matchResp) return false;
    }
    return true;
  });

  return `
    <div class="flex flex-col gap-6 animate-fade-in">
      
      <!-- Learning Overview Strip -->
      <div class="glass-panel p-6 rounded-2xl border border-gold/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-bold uppercase tracking-luxury text-gold">Continuous AI Improvement Engine</span>
            <span class="badge-gold text-xs">Human Approval Gate Active</span>
          </div>
          <h2 class="text-2xl font-serif text-white font-bold">Tolani Learning Centre</h2>
          <p class="text-xs text-slate-300 mt-1">Audit guest conversations, review AI proposals, and approve versioned knowledge updates.</p>
        </div>

        <div class="flex items-center gap-2">
          <button class="btn-secondary text-xs py-2 px-4" onclick="window.exportLearningAnalytics()">
            📥 Export Analytics (JSON)
          </button>
          <button class="btn-secondary text-xs py-2 px-3 text-red-400" onclick="window.clearLearningData()">
            🗑️ Wipe Conversation Logs
          </button>
        </div>
      </div>

      <!-- AI SUGGESTIONS QUEUE (HUMAN APPROVAL GATE) -->
      <div class="glass-panel p-6 rounded-2xl border-2 border-gold/40 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-serif text-base font-bold text-white flex items-center gap-2">
              <span>💡</span> <span>Pending Learning Proposals (${pendingSuggestions.length})</span>
            </h3>
            <p class="text-xs text-slate-300">Proposals detected from guest phrases. Requires human approval before entering production.</p>
          </div>
          <span class="badge-gold text-xs">Human Gate Enforced</span>
        </div>

        <div class="flex flex-col gap-3">
          ${pendingSuggestions.length === 0 ? `
            <div class="p-6 text-center text-xs text-slate-400">All learning proposals reviewed. Tolani is synchronized with approved knowledge.</div>
          ` : pendingSuggestions.map(sug => `
            <div class="p-4 rounded-xl bg-navy-950 border border-gold/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="badge-gold text-[10px] font-bold">${sug.id}</span>
                  <strong class="text-white text-xs">"${sug.phrase}"</strong>
                  <span class="text-slate-400 text-xs">→ ${sug.recommendedClassification}</span>
                </div>
                <div class="text-xs text-slate-300">${sug.recommendationText}</div>
                <div class="text-[11px] text-amber-300/90 mt-1">📊 Evidence: ${sug.evidenceSnippet} (${sug.occurrenceCount} occurrences)</div>
              </div>

              <div class="flex items-center gap-2 w-full md:w-auto justify-end">
                <button 
                  class="btn-secondary text-xs py-1.5 px-3"
                  onclick="window.openEvidenceModal('${sug.id}')"
                >
                  🔍 View Evidence
                </button>

                <button 
                  class="btn-primary text-xs py-1.5 px-4 font-bold ${!canApprove ? 'opacity-50 cursor-not-allowed' : ''}"
                  onclick="${canApprove ? `window.approveLearningSuggestion('${sug.id}')` : 'alert(\'Permission Denied: Only Super Admin and Hotel Admin can approve AI learning.\')'}"
                >
                  [ APPROVE ]
                </button>

                <button 
                  class="btn-secondary text-xs py-1.5 px-3 text-red-400 ${!canApprove ? 'opacity-50 cursor-not-allowed' : ''}"
                  onclick="${canApprove ? `window.rejectLearningSuggestion('${sug.id}')` : 'alert(\'Permission Denied\')'}"
                >
                  [ REJECT ]
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- APPROVED KNOWLEDGE UPDATES & ROLLBACK -->
      <div class="glass-panel p-6 rounded-2xl border border-gold/20">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-serif text-base font-bold text-white flex items-center gap-2">
              <span>✅</span> <span>Approved Production Knowledge Updates</span>
            </h3>
            <p class="text-xs text-slate-300">Live learned phrase mappings with instant rollback protection.</p>
          </div>
          <span class="badge-subtle text-xs text-emerald-400 font-bold">${approvedUpdates.length} Active Rules</span>
        </div>

        <div class="flex flex-col gap-2.5">
          ${approvedUpdates.length === 0 ? `
            <div class="p-4 text-center text-xs text-slate-400">No approved knowledge updates yet.</div>
          ` : approvedUpdates.map(kup => `
            <div class="p-3.5 rounded-xl bg-navy-950/80 border border-white/5 flex items-center justify-between text-xs">
              <div>
                <div class="flex items-center gap-2 mb-0.5">
                  <strong class="text-gold font-bold">${kup.updateCode}</strong>
                  <span class="text-white">"${kup.approvedPhrase}"</span>
                  <span class="text-slate-400">→ ${kup.mappedIntent} (${kup.service})</span>
                </div>
                <div class="text-[11px] text-slate-400">Approved by ${kup.approvedBy} on ${kup.dateFormatted || kup.timestamp} · Status: <strong class="text-emerald-400">${kup.status}</strong></div>
              </div>

              ${kup.status === 'ACTIVE' ? `
                <button 
                  class="btn-secondary text-xs py-1 px-3 text-red-400 ${!canRollback ? 'opacity-50 cursor-not-allowed' : ''}"
                  onclick="${canRollback ? `window.rollbackKnowledgeUpdate('${kup.id}')` : 'alert(\'Permission Denied\')'}"
                >
                  [ ROLLBACK ]
                </button>
              ` : `
                <span class="badge-subtle text-xs text-slate-400">ROLLED BACK</span>
              `}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- FILTERABLE GUEST INTERACTION LOGS -->
      <div class="glass-panel p-6 rounded-2xl border border-gold/20">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 class="font-serif text-base font-bold text-white flex items-center gap-2">
              <span>💬</span> <span>Live Guest Interaction Logs (${filteredLogs.length})</span>
            </h3>
            <p class="text-xs text-slate-300">Real-time transcripts of all guest voice & touch interactions with Tolani.</p>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <input 
              type="text" 
              class="input-custom text-xs py-1.5 px-3 w-48" 
              placeholder="Search conversation..." 
              value="${logSearchFilter}" 
              oninput="window.updateLogSearch(this.value)"
            />
            <select 
              class="input-custom text-xs py-1.5 px-2.5" 
              onchange="window.updateLogServiceFilter(this.value)"
            >
              <option value="ALL" ${logServiceFilter === 'ALL' ? 'selected' : ''}>All Services</option>
              <option value="RESTAURANT" ${logServiceFilter === 'RESTAURANT' ? 'selected' : ''}>Restaurant</option>
              <option value="BREAKFAST" ${logServiceFilter === 'BREAKFAST' ? 'selected' : ''}>Breakfast</option>
              <option value="HOUSEKEEPING" ${logServiceFilter === 'HOUSEKEEPING' ? 'selected' : ''}>Housekeeping</option>
              <option value="CONCIERGE_PORTER" ${logServiceFilter === 'CONCIERGE_PORTER' ? 'selected' : ''}>Porter</option>
              <option value="VIP_TRANSPORTATION" ${logServiceFilter === 'VIP_TRANSPORTATION' ? 'selected' : ''}>Transportation</option>
            </select>
          </div>
        </div>

        <div class="flex flex-col gap-2.5 max-h-96 overflow-y-auto scrollbar-thin">
          ${filteredLogs.length === 0 ? `
            <div class="p-6 text-center text-xs text-slate-400">No interaction logs match the filter.</div>
          ` : filteredLogs.map(log => `
            <div class="p-3 rounded-xl bg-navy-950/80 border border-white/5 text-xs">
              <div class="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>${log.timeFormatted || log.timestamp} · Suite #${log.roomNumber || '402'}</span>
                <span class="badge-gold text-[9px]">${log.activeService}</span>
              </div>
              <div class="text-slate-200"><strong>Guest:</strong> "${log.guestMessage}"</div>
              <div class="text-gold mt-0.5"><strong>Tolani:</strong> "${log.aiResponse}"</div>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}

// ==========================================
// 10. STAFF DIRECTORY & RBAC MANAGEMENT TAB
// ==========================================
function renderStaffDirectoryTab(state, currentRole) {
  const canManageStaff = store.hasPermission('MANAGE_STAFF');
  const staff = state.staffMembers || [];

  return `
    <div class="flex flex-col gap-6 animate-fade-in">
      
      <div class="glass-panel p-5 rounded-2xl border border-gold/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-serif text-white font-bold">Hotel Staff Directory & Role-Based Access Control</h2>
          <p class="text-xs text-slate-300 mt-0.5">Manage employee accounts, assign administrative privileges, and monitor duty attendance.</p>
        </div>

        <button 
          class="btn-primary text-xs py-2 px-5 font-bold ${!canManageStaff ? 'opacity-50 cursor-not-allowed' : ''}"
          onclick="${canManageStaff ? 'window.openCreateStaffModal()' : 'alert(\'Permission Denied: Only Super Admin and Hotel Admin can manage staff.\')'}"
        >
          + Onboard New Staff
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${staff.map(s => `
          <div class="glass-panel rounded-2xl p-5 border-2 ${s.active ? 'border-gold/30 hover:border-gold' : 'border-slate-800 opacity-60'} flex flex-col justify-between transition-all">
            <div>
              <div class="flex items-center gap-3 mb-3">
                <img src="${s.avatar}" class="w-12 h-12 rounded-full object-cover border-2 border-gold/40" alt="${s.name}" />
                <div>
                  <div class="font-serif font-bold text-white text-base">${s.name}</div>
                  <div class="text-gold text-xs font-semibold">${s.role}</div>
                  <span class="badge-gold text-[10px] mt-0.5">${s.adminRole || 'FRONT_DESK'}</span>
                </div>
              </div>

              <div class="flex flex-col gap-1.5 p-3 rounded-xl bg-navy-950 border border-white/5 text-xs text-slate-300 mb-3">
                <div class="flex justify-between">
                  <span class="text-slate-400">Department:</span>
                  <strong class="text-white uppercase">${s.department}</strong>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Shift:</span>
                  <strong class="text-white">${s.shift}</strong>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Status:</span>
                  <strong class="${s.clockedIn ? 'text-emerald-400' : 'text-slate-400'}">${s.clockedIn ? 'Clocked In' : 'Off Duty'}</strong>
                </div>
              </div>

              <div class="text-[11px] text-slate-300 italic mb-2">"${s.aiNotes}"</div>
            </div>

            <div class="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
              <button 
                class="btn-secondary text-xs py-1.5 px-3 flex-1 ${!canManageStaff ? 'opacity-50 cursor-not-allowed' : ''}"
                onclick="${canManageStaff ? `window.openEditStaffModal('${s.id}')` : 'alert(\'Permission Denied\')'}"
              >
                ✏️ Edit Profile
              </button>

              <button 
                class="btn-secondary text-xs py-1.5 px-3 ${!canManageStaff ? 'opacity-50 cursor-not-allowed' : ''}"
                onclick="${canManageStaff ? `window.toggleStaffStatusAction('${s.id}')` : 'alert(\'Permission Denied\')'}"
              >
                ${s.active ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        `).join('')}
      </div>

    </div>
  `;
}

// ==========================================
// 11. AUDIT LOGS TAB (IMMUTABLE STYLE)
// ==========================================
function renderAuditLogsTab(state) {
  const audits = state.auditLog || [];

  const filteredAudits = audits.filter(a => {
    if (auditModuleFilter !== 'ALL' && a.module !== auditModuleFilter) return false;
    if (auditSearchFilter) {
      const q = auditSearchFilter.toLowerCase();
      const matchAction = a.action?.toLowerCase().includes(q);
      const matchEntity = a.entity?.toLowerCase().includes(q);
      const matchDetails = a.details?.toLowerCase().includes(q);
      if (!matchAction && !matchEntity && !matchDetails) return false;
    }
    return true;
  });

  return `
    <div class="flex flex-col gap-6 animate-fade-in max-w-5xl mx-auto">
      
      <div class="glass-panel p-6 rounded-2xl border border-gold/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-serif text-white font-bold">Tamper-Evident System Audit Trail</h2>
          <p class="text-xs text-slate-300 mt-0.5">Chronological record of price changes, content publishes, AI learning approvals, and staff updates.</p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <input 
            type="text" 
            class="input-custom text-xs py-1.5 px-3 w-48" 
            placeholder="Search audit records..." 
            value="${auditSearchFilter}" 
            oninput="window.updateAuditSearch(this.value)"
          />
        </div>
      </div>

      <div class="glass-panel p-6 rounded-2xl border border-gold/20">
        <div class="flex flex-col gap-3">
          ${filteredAudits.length === 0 ? `
            <div class="p-6 text-center text-xs text-slate-400">No audit records found.</div>
          ` : filteredAudits.map(a => `
            <div class="p-4 rounded-xl bg-navy-950 border border-white/5 flex flex-col gap-1 text-xs">
              <div class="flex items-center justify-between text-[11px] text-slate-400">
                <span>🕒 ${a.timestamp} · Actor: <strong class="text-white">${a.actor}</strong></span>
                <span class="badge-gold text-[10px] font-bold">${a.action}</span>
              </div>
              <div class="text-white font-bold text-xs mt-0.5">${a.entity}</div>
              <div class="text-slate-300 text-xs">${a.details}</div>
              ${a.reason ? `<div class="text-[11px] text-gold/80 italic mt-0.5">Reason: "${a.reason}"</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}

// ==========================================
// 12. SYSTEM SETTINGS & AUTOMATION RULES TAB
// ==========================================
function renderSystemSettingsTab(state, currentRole) {
  const auto = state.automationSettings || {};

  return `
    <div class="flex flex-col gap-6 animate-fade-in max-w-3xl mx-auto">
      
      <div class="glass-panel p-6 rounded-2xl border border-gold/30">
        <div class="mb-4">
          <span class="text-xs font-bold uppercase tracking-luxury text-gold">Operational Parameters</span>
          <h2 class="text-xl font-serif text-white font-bold mt-0.5">System Automation & Policies</h2>
        </div>

        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Checkout Reminder (Minutes before 12 PM):</label>
              <input type="number" id="setting-co-mins" class="input-custom text-xs" value="${auto.checkoutReminderMinutes || 45}" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Food Delivery Warning (Minutes before delivery):</label>
              <input type="number" id="setting-del-mins" class="input-custom text-xs" value="${auto.foodDeliveryWarningMinutes || 5}" />
            </div>
          </div>

          <div class="flex flex-col gap-2 pt-2 border-t border-white/10">
            <label class="flex items-center gap-2.5 text-xs text-white cursor-pointer">
              <input type="checkbox" id="setting-sound-alerts" ${auto.soundAlertsEnabled ? 'checked' : ''} class="accent-gold-500" />
              <span>Enable Sound Alerts & Chimes for Kitchen / Chauffeur dispatches</span>
            </label>

            <label class="flex items-center gap-2.5 text-xs text-white cursor-pointer">
              <input type="checkbox" id="setting-voice-synth" ${auto.aiVoiceSynthesisEnabled ? 'checked' : ''} class="accent-gold-500" />
              <span>Enable Tolani Central Voice Synthesis (en-NG / 0.93 Rate / 1.08 Pitch)</span>
            </label>
          </div>

          <div class="flex justify-end pt-4">
            <button class="btn-primary text-xs py-2 px-6 font-bold" onclick="window.saveAutomationSettings()">
              Save Automation Rules →
            </button>
          </div>
        </div>
      </div>

    </div>
  `;
}

// ==========================================
// MODAL RENDERERS (CREATE/EDIT/MEDIA/HISTORY)
// ==========================================
function renderModals(state, editMenuId, editAmenityId, editStaffId, versionModal, evidenceId, mediaUploadOpen) {
  let modalHtml = '';

  // 1. MENU EDIT / CREATE MODAL
  if (editMenuId) {
    const isNew = editMenuId === 'NEW';
    const item = isNew ? {
      name: '',
      category: 'Food',
      price: 9500,
      prepTimeMinutes: 20,
      estimatedDeliveryMinutes: 15,
      desc: '',
      image: '',
      status: 'PUBLISHED',
      available: true,
      featured: false
    } : state.menu.find(m => m.id === editMenuId);

    modalHtml += `
      <div class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="glass-panel max-w-lg w-full p-6 rounded-2xl border-2 border-gold shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin animate-fade-in" style="background: rgba(8, 17, 28, 0.98);">
          <div class="flex items-center justify-between pb-3 border-b border-gold/20 mb-4">
            <h3 class="font-serif text-lg text-white font-bold">${isNew ? 'Create New Dining Item' : `Edit: ${item.name}`}</h3>
            <button class="text-slate-400 hover:text-white bg-transparent border-none text-lg cursor-pointer" onclick="window.closeMenuModal()">✕</button>
          </div>

          <form onsubmit="window.saveMenuItemForm(event)" class="flex flex-col gap-3.5">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Dish / Beverage Name:</label>
              <input type="text" id="menu-item-name" class="input-custom text-xs" value="${item?.name || ''}" required />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Category:</label>
                <select id="menu-item-category" class="input-custom text-xs">
                  ${['Food', 'Drinks', 'Breakfast', 'Desserts', 'Snacks'].map(cat => `
                    <option value="${cat}" ${item?.category === cat ? 'selected' : ''}>${cat}</option>
                  `).join('')}
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Price (₦):</label>
                <input type="number" id="menu-item-price" class="input-custom text-xs" value="${item?.price || 0}" required />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Preparation Time (Mins):</label>
                <input type="number" id="menu-item-prep" class="input-custom text-xs" value="${item?.prepTimeMinutes || 20}" />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Delivery Time (Mins):</label>
                <input type="number" id="menu-item-delivery" class="input-custom text-xs" value="${item?.estimatedDeliveryMinutes || 15}" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Description:</label>
              <textarea id="menu-item-desc" class="input-custom text-xs" rows="2">${item?.desc || ''}</textarea>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Image URL / Media Asset:</label>
              <input type="text" id="menu-item-image" class="input-custom text-xs" value="${item?.image || ''}" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Publication Status:</label>
                <select id="menu-item-status" class="input-custom text-xs">
                  <option value="PUBLISHED" ${item?.status === 'PUBLISHED' ? 'selected' : ''}>PUBLISHED (Live)</option>
                  <option value="DRAFT" ${item?.status === 'DRAFT' ? 'selected' : ''}>DRAFT (Hidden)</option>
                  <option value="ARCHIVED" ${item?.status === 'ARCHIVED' ? 'selected' : ''}>ARCHIVED</option>
                </select>
              </div>

              <div class="flex flex-col justify-end gap-1">
                <label class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input type="checkbox" id="menu-item-available" ${item?.available ? 'checked' : ''} class="accent-gold-500" />
                  <span>Available in Kitchen</span>
                </label>
                <label class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input type="checkbox" id="menu-item-featured" ${item?.featured ? 'checked' : ''} class="accent-gold-500" />
                  <span>Featured Dish</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Reason for Change (Audit Trail):</label>
              <input type="text" id="menu-item-reason" class="input-custom text-xs" placeholder="e.g. Adjusted price for seasonal market rates" />
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-white/10 mt-2">
              <button type="button" class="btn-secondary text-xs py-2 px-4" onclick="window.closeMenuModal()">Cancel</button>
              <button type="submit" class="btn-primary text-xs py-2 px-6 font-bold">Save & Publish Dish →</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // 2. AMENITY EDIT / CREATE MODAL
  if (editAmenityId) {
    const isNew = editAmenityId === 'NEW';
    const amenity = isNew ? {
      name: '',
      category: 'Recreation & Leisure',
      openingHours: '06:00 AM - 10:00 PM Daily',
      location: 'Main Concourse',
      description: '',
      rules: '',
      contact: 'Ext 0 / Front Desk',
      image: '',
      status: 'PUBLISHED',
      available: true
    } : state.amenities.find(a => a.id === editAmenityId);

    modalHtml += `
      <div class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="glass-panel max-w-lg w-full p-6 rounded-2xl border-2 border-gold shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin animate-fade-in" style="background: rgba(8, 17, 28, 0.98);">
          <div class="flex items-center justify-between pb-3 border-b border-gold/20 mb-4">
            <h3 class="font-serif text-lg text-white font-bold">${isNew ? 'Add Property Amenity' : `Edit: ${amenity.name}`}</h3>
            <button class="text-slate-400 hover:text-white bg-transparent border-none text-lg cursor-pointer" onclick="window.closeAmenityModal()">✕</button>
          </div>

          <form onsubmit="window.saveAmenityForm(event)" class="flex flex-col gap-3.5">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Amenity Name:</label>
              <input type="text" id="amenity-name" class="input-custom text-xs" value="${amenity?.name || ''}" required />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Category:</label>
                <select id="amenity-category" class="input-custom text-xs">
                  ${['Recreation & Leisure', 'Health & Fitness', 'Connectivity & Tech', 'Business & Events', 'Nightlife & Lounges', 'Wellness & Spa', 'Transportation & Access', 'Housekeeping & Valet'].map(c => `
                    <option value="${c}" ${amenity?.category === c ? 'selected' : ''}>${c}</option>
                  `).join('')}
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Opening Hours:</label>
                <input type="text" id="amenity-hours" class="input-custom text-xs" value="${amenity?.openingHours || ''}" required />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Location:</label>
                <input type="text" id="amenity-location" class="input-custom text-xs" value="${amenity?.location || ''}" required />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Contact Extension:</label>
                <input type="text" id="amenity-contact" class="input-custom text-xs" value="${amenity?.contact || ''}" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Description:</label>
              <textarea id="amenity-desc" class="input-custom text-xs" rows="2">${amenity?.description || ''}</textarea>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Resident Rules & Policies:</label>
              <textarea id="amenity-rules" class="input-custom text-xs" rows="2">${amenity?.rules || ''}</textarea>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Image URL:</label>
              <input type="text" id="amenity-image" class="input-custom text-xs" value="${amenity?.image || ''}" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Status:</label>
                <select id="amenity-status" class="input-custom text-xs">
                  <option value="PUBLISHED" ${amenity?.status === 'PUBLISHED' ? 'selected' : ''}>PUBLISHED</option>
                  <option value="DRAFT" ${amenity?.status === 'DRAFT' ? 'selected' : ''}>DRAFT</option>
                  <option value="ARCHIVED" ${amenity?.status === 'ARCHIVED' ? 'selected' : ''}>ARCHIVED</option>
                </select>
              </div>

              <div class="flex items-center gap-3 pt-4">
                <label class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input type="checkbox" id="amenity-available" ${amenity?.available ? 'checked' : ''} class="accent-gold-500" />
                  <span>Operational</span>
                </label>
                <label class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input type="checkbox" id="amenity-featured" ${amenity?.featured ? 'checked' : ''} class="accent-gold-500" />
                  <span>Featured</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Reason for Change (Audit Trail):</label>
              <input type="text" id="amenity-reason" class="input-custom text-xs" placeholder="e.g., Updated holiday schedule" />
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-white/10 mt-2">
              <button type="button" class="btn-secondary text-xs py-2 px-4" onclick="window.closeAmenityModal()">Cancel</button>
              <button type="submit" class="btn-primary text-xs py-2 px-6 font-bold">Save Amenity →</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // 3. MEDIA UPLOAD MODAL
  if (mediaUploadOpen) {
    modalHtml += `
      <div class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="glass-panel max-w-md w-full p-6 rounded-2xl border-2 border-gold shadow-2xl animate-fade-in" style="background: rgba(8, 17, 28, 0.98);">
          <div class="flex items-center justify-between pb-3 border-b border-gold/20 mb-4">
            <h3 class="font-serif text-lg text-white font-bold">Upload Media Asset</h3>
            <button class="text-slate-400 hover:text-white bg-transparent border-none text-lg cursor-pointer" onclick="window.closeMediaModal()">✕</button>
          </div>

          <form onsubmit="window.saveMediaAsset(event)" class="flex flex-col gap-3.5">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Asset Title:</label>
              <input type="text" id="media-asset-title" class="input-custom text-xs" placeholder="e.g. Seafood Okro Luxury Platter" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Category:</label>
              <select id="media-asset-category" class="input-custom text-xs">
                ${['Restaurant', 'Breakfast', 'Drinks', 'Amenities', 'Transportation', 'Suites', 'General'].map(c => `
                  <option value="${c}">${c}</option>
                `).join('')}
              </select>
            </div>

            <!-- Drag and Drop / File Input Box -->
            <div class="p-4 rounded-xl border-2 border-dashed border-gold/40 bg-navy-950 text-center flex flex-col items-center justify-center">
              <span class="text-2xl mb-1">📁</span>
              <div class="text-xs font-bold text-white">Choose Image File (JPG, PNG, WEBP)</div>
              <div class="text-[10px] text-slate-400 mt-0.5">Max size: 5MB</div>
              <input type="file" accept="image/jpeg,image/png,image/webp" onchange="window.handleMediaFileUpload(event)" class="mt-2 text-xs text-slate-300" />
            </div>

            <!-- Preview Box -->
            <div id="upload-preview-container" class="hidden p-2 rounded-xl bg-navy-950 border border-gold/30">
              <img id="upload-preview-img" src="" class="w-full h-32 object-cover rounded-lg" alt="Preview" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Or Paste Image URL directly:</label>
              <input type="text" id="media-asset-url" class="input-custom text-xs" placeholder="https://images.unsplash.com/..." />
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-white/10 mt-2">
              <button type="button" class="btn-secondary text-xs py-2 px-4" onclick="window.closeMediaModal()">Cancel</button>
              <button type="submit" class="btn-primary text-xs py-2 px-6 font-bold">Upload to Library →</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // 4. VERSION HISTORY MODAL
  if (versionModal) {
    const item = versionModal.entityType === 'MENU_ITEM' ? state.menu.find(m => m.id === versionModal.entityId) : state.amenities.find(a => a.id === versionModal.entityId);
    const history = item?.versionHistory || [];

    modalHtml += `
      <div class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="glass-panel max-w-lg w-full p-6 rounded-2xl border-2 border-gold shadow-2xl max-h-[85vh] overflow-y-auto scrollbar-thin animate-fade-in" style="background: rgba(8, 17, 28, 0.98);">
          <div class="flex items-center justify-between pb-3 border-b border-gold/20 mb-4">
            <div>
              <span class="text-[10px] text-gold font-bold uppercase tracking-luxury">Version History</span>
              <h3 class="font-serif text-lg text-white font-bold">${versionModal.title}</h3>
            </div>
            <button class="text-slate-400 hover:text-white bg-transparent border-none text-lg cursor-pointer" onclick="window.closeVersionModal()">✕</button>
          </div>

          <div class="flex flex-col gap-3">
            <div class="p-3 rounded-xl bg-gold/10 border border-gold/40 text-xs text-slate-200">
              Current Version: <strong class="text-gold font-bold">Version #${item?.version || 1}</strong>
            </div>

            ${history.length === 0 ? `
              <div class="p-4 text-center text-xs text-slate-400">No prior versions recorded for this item.</div>
            ` : history.map(v => `
              <div class="p-3.5 rounded-xl bg-navy-950 border border-white/10 flex flex-col gap-1 text-xs">
                <div class="flex items-center justify-between text-slate-400 text-[11px]">
                  <span class="badge-gold text-[10px] font-bold">Version #${v.version}</span>
                  <span>${v.dateFormatted || v.timestamp}</span>
                </div>
                <div class="text-white font-medium mt-1">Changed by: ${v.changedBy} (${v.role})</div>
                <div class="text-slate-300 text-xs italic">"${v.reason}"</div>

                <div class="flex justify-end pt-2 mt-1 border-t border-white/5">
                  <button 
                    class="btn-secondary text-xs py-1 px-3"
                    onclick="window.restoreVersionAction('${versionModal.entityType}', '${versionModal.entityId}', ${v.version})"
                  >
                    Restore This Version ↺
                  </button>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="flex justify-end pt-4 mt-2 border-t border-white/10">
            <button class="btn-secondary text-xs py-1.5 px-4" onclick="window.closeVersionModal()">Close</button>
          </div>
        </div>
      </div>
    `;
  }

  // 5. STAFF EDIT / CREATE MODAL
  if (editStaffId) {
    const isNew = editStaffId === 'NEW';
    const stf = isNew ? {
      name: '',
      role: 'Hotel Concierge',
      adminRole: 'FRONT_DESK',
      department: 'concierge',
      shift: 'Morning (08:00 - 16:30)',
      active: true
    } : state.staffMembers.find(s => s.id === editStaffId);

    modalHtml += `
      <div class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="glass-panel max-w-md w-full p-6 rounded-2xl border-2 border-gold shadow-2xl animate-fade-in" style="background: rgba(8, 17, 28, 0.98);">
          <div class="flex items-center justify-between pb-3 border-b border-gold/20 mb-4">
            <h3 class="font-serif text-lg text-white font-bold">${isNew ? 'Onboard New Staff' : `Edit: ${stf.name}`}</h3>
            <button class="text-slate-400 hover:text-white bg-transparent border-none text-lg cursor-pointer" onclick="window.closeStaffModal()">✕</button>
          </div>

          <form onsubmit="window.saveStaffForm(event)" class="flex flex-col gap-3.5">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Full Name:</label>
              <input type="text" id="staff-name" class="input-custom text-xs" value="${stf?.name || ''}" required />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Job Role / Title:</label>
              <input type="text" id="staff-role" class="input-custom text-xs" value="${stf?.role || ''}" required />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">RBAC System Role:</label>
                <select id="staff-admin-role" class="input-custom text-xs">
                  ${Object.values(ADMIN_ROLES).map(r => `
                    <option value="${r}" ${stf?.adminRole === r ? 'selected' : ''}>${r}</option>
                  `).join('')}
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Department:</label>
                <select id="staff-dept" class="input-custom text-xs">
                  ${['management', 'kitchen', 'housekeeping', 'concierge', 'marketing'].map(d => `
                    <option value="${d}" ${stf?.department === d ? 'selected' : ''}>${d}</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Shift Schedule:</label>
              <input type="text" id="staff-shift" class="input-custom text-xs" value="${stf?.shift || ''}" />
            </div>

            <div class="pt-2">
              <label class="flex items-center gap-2 text-xs text-white cursor-pointer">
                <input type="checkbox" id="staff-active" ${stf?.active ? 'checked' : ''} class="accent-gold-500" />
                <span>Account Active (Allowed Admin / Portal Access)</span>
              </label>
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-white/10 mt-2">
              <button type="button" class="btn-secondary text-xs py-2 px-4" onclick="window.closeStaffModal()">Cancel</button>
              <button type="submit" class="btn-primary text-xs py-2 px-6 font-bold">Save Staff Account →</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // 6. EVIDENCE MODAL (TOLANI LEARNING)
  if (evidenceId) {
    const sug = (state.learningSuggestions || []).find(s => s.id === evidenceId);
    modalHtml += `
      <div class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="glass-panel max-w-md w-full p-6 rounded-2xl border-2 border-gold shadow-2xl animate-fade-in" style="background: rgba(8, 17, 28, 0.98);">
          <div class="flex items-center justify-between pb-3 border-b border-gold/20 mb-4">
            <h3 class="font-serif text-lg text-white font-bold">Evidence: ${sug?.id}</h3>
            <button class="text-slate-400 hover:text-white bg-transparent border-none text-lg cursor-pointer" onclick="window.closeEvidenceModal()">✕</button>
          </div>

          <div class="flex flex-col gap-3 text-xs text-slate-300">
            <div>
              <strong class="text-white">Observed Phrase:</strong>
              <div class="p-2.5 rounded-lg bg-navy-950 border border-white/10 text-gold font-serif mt-1">
                "${sug?.phrase}"
              </div>
            </div>

            <div>
              <strong class="text-white">Recommended Mapping:</strong>
              <div class="text-slate-200 mt-0.5">Map to intent <strong class="text-emerald-400">${sug?.recommendedClassification}</strong> in service <strong class="text-gold">${sug?.service}</strong>.</div>
            </div>

            <div>
              <strong class="text-white">Statistical Evidence:</strong>
              <div class="text-slate-300 mt-0.5">${sug?.evidenceSnippet} (${sug?.occurrenceCount} occurrences).</div>
            </div>
          </div>

          <div class="flex justify-end pt-4 mt-2 border-t border-white/10">
            <button class="btn-primary text-xs py-1.5 px-5 font-bold" onclick="window.closeEvidenceModal()">Close</button>
          </div>
        </div>
      </div>
    `;
  }

  return modalHtml;
}
