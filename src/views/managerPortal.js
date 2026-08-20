/**
 * HOTEL CAPITOL — ADMIN & SUPPORT CONSOLE
 * 6 Animashaun Close, Ikeja, Lagos
 * 
 * Complete operational intelligence, content management, media library,
 * transportation pricing, Tolani learning centre, staff directory with RBAC,
 * and immutable audit logging.
 */

import { getIcon, renderIntercomRoundBadge } from '../assets/icons.js';
import { store, ADMIN_ROLES, ROLE_PERMISSIONS, ORGANIZATIONAL_HIERARCHY, APPROVAL_MATRIX_CONFIG } from '../store/state.js';
import { aiEngine } from '../services/aiEngine.js';
import { automationEngine } from '../services/automationRules.js';
import { learningEngine } from '../services/learningEngine.js';

let managerActiveTab = 'profile'; 
// 'profile' | 'overview' | 'content-restaurant' | 'content-breakfast' | 'content-amenities' | 'content-services' | 'content-media' | 'orders' | 'transportation' | 'learning' | 'staff' | 'rbac-management' | 'procurement' | 'performance-reports' | 'audit' | 'settings'
let adminIntercomState = 'ready'; // 'ready' | 'active' | 'delivered'

// Modal UI States
let activeEditMenuItemId = null;
let activeEditAmenityId = null;
let activeEditStaffId = null;
let activeVersionModal = null; // { entityType: 'MENU_ITEM', entityId: 'M-01', title: '...' }
let activeEvidenceModal = null; // sugId
let activeMediaUploadModal = false;
let activeDockReceivingReqId = null;
let activeAuditPdfReqId = null;

// Filter States
let logSearchFilter = '';
let logServiceFilter = 'ALL';
let logIntentFilter = 'ALL';
let logOutcomeFilter = 'ALL';
let menuCategoryFilter = 'ALL';
let auditSearchFilter = '';
let auditModuleFilter = 'ALL';
let procurementReqFilter = 'ALL';

export function initManagerPortal() {
  window.navigateManagerTab = (tab) => {
    managerActiveTab = tab;
    if (window.renderApp) window.renderApp();
  };

  window.triggerAdminIntercom = () => {
    adminIntercomState = 'active';
    if (window.renderApp) window.renderApp();
    automationEngine.playChime('bell');
    
    // Open Intercom modal
    window.toggleIntercomModal(true);

    // Simulate active transition to delivered upon transmission
    setTimeout(() => {
      adminIntercomState = 'delivered';
      if (window.renderApp) window.renderApp();
      automationEngine.showToast('Intercom Connected', 'Executive Radio link established on secure operations channel.', 'success');
      
      setTimeout(() => {
        adminIntercomState = 'ready';
        if (window.renderApp) window.renderApp();
      }, 3000);
    }, 2000);
  };

  window.switchActiveAdminStaff = (staffId) => {
    store.setActiveStaffId(staffId);
    const staff = store.getActiveStaff();
    automationEngine.showToast('Administrator Switched', `Active user: ${staff.name} (${staff.adminRole || staff.role})`, 'info');
    if (window.renderApp) window.renderApp();
  };

  // --- AUTONOMOUS PROCUREMENT WORKFLOW ACTIONS ---
  window.triggerStockDepletionEvaluation = () => {
    try {
      const res = store.evaluateAIStockDepletion();
      automationEngine.playChime('success');
      automationEngine.showToast('AI Stock Scan Complete', `Evaluated all items against depletion matrix (30%, 20%, 10%, 5%). ${res.alertsTriggered} new requisitions generated.`, 'success');
      if (window.renderApp) window.renderApp();
    } catch (err) {
      alert(err.message);
    }
  };

  window.setProcurementFilter = (filter) => {
    procurementReqFilter = filter;
    if (window.renderApp) window.renderApp();
  };

  window.approveRequisitionAction = (reqId) => {
    try {
      const staff = store.getActiveStaff();
      const role = staff.adminRole || 'ROLE_AM';
      const updated = store.processRequisitionApproval(reqId, 'APPROVE', role, staff.name);
      automationEngine.playChime('success');
      if (updated.status === 'APPROVED') {
        automationEngine.showToast('Requisition Approved', `Approved! LPO ${updated.lpo?.lpoNumber} generated autonomously. Ready for order dispatch.`, 'success');
      } else {
        automationEngine.showToast('Requisition Escalated', `Procurement value exceeds approval authority. Automatically escalated to ${updated.assignedApproverTitle}.`, 'warning');
      }
      if (window.renderApp) window.renderApp();
    } catch (err) {
      alert(err.message);
    }
  };

  window.escalateRequisitionAction = (reqId) => {
    try {
      const staff = store.getActiveStaff();
      const role = staff.adminRole || 'ROLE_AM';
      const updated = store.processRequisitionApproval(reqId, 'ESCALATE', role, staff.name, 'Manually escalated for executive budget review');
      automationEngine.playChime('bell');
      automationEngine.showToast('Requisition Escalated', `Requisition escalated to ${updated.assignedApproverTitle}.`, 'info');
      if (window.renderApp) window.renderApp();
    } catch (err) {
      alert(err.message);
    }
  };

  window.rejectRequisitionAction = (reqId) => {
    try {
      const reason = prompt('Reason for declining this procurement requisition:', 'Budget constraint / non-essential period');
      if (!reason) return;
      const staff = store.getActiveStaff();
      const role = staff.adminRole || 'ROLE_AM';
      store.processRequisitionApproval(reqId, 'REJECT', role, staff.name, reason);
      automationEngine.playChime('bell');
      automationEngine.showToast('Requisition Declined', `Requisition ${reqId} marked as REJECTED.`, 'info');
      if (window.renderApp) window.renderApp();
    } catch (err) {
      alert(err.message);
    }
  };

  window.dispatchLPOAction = (reqId) => {
    try {
      const staff = store.getActiveStaff();
      const updated = store.dispatchLPOToVendor(reqId, staff.name);
      automationEngine.playChime('success');
      automationEngine.showToast('LPO Dispatched', `LPO ${updated.lpo?.lpoNumber} transmitted to official Vendor Portal (${updated.preferredVendorName}).`, 'success');
      if (window.renderApp) window.renderApp();
    } catch (err) {
      alert(err.message);
    }
  };

  window.verifyInvoiceAction = (reqId) => {
    try {
      const staff = store.getActiveStaff();
      const updated = store.verifyProcurementInvoice(reqId, staff.name + ' (Procurement Supervisor)');
      automationEngine.playChime('success');
      automationEngine.showToast('Invoice Verified', `Invoice verified against LPO and queued to AP with mandatory receiving hold.`, 'success');
      if (window.renderApp) window.renderApp();
    } catch (err) {
      alert(err.message);
    }
  };

  window.openDockReceivingModal = (reqId) => {
    activeDockReceivingReqId = reqId;
    if (window.renderApp) window.renderApp();
  };

  window.closeDockReceivingModal = () => {
    activeDockReceivingReqId = null;
    if (window.renderApp) window.renderApp();
  };

  window.submitDockReceivingForm = (e) => {
    if (e) e.preventDefault();
    try {
      const reqId = activeDockReceivingReqId;
      if (!reqId) return;
      const waybillNumber = document.getElementById('dock-waybill')?.value?.trim();
      const itemsAcceptedQuantity = parseInt(document.getElementById('dock-qty')?.value, 10);
      const conditionStatus = document.getElementById('dock-condition')?.value;
      const dockNotes = document.getElementById('dock-notes')?.value?.trim();
      const staff = store.getActiveStaff();

      const updated = store.confirmPhysicalStoreReceipt(reqId, {
        inspectorName: staff.name,
        inspectorRole: staff.adminRole || 'ROLE_SUP_PROCUREMENT',
        waybillNumber,
        itemsAcceptedQuantity,
        conditionStatus,
        dockNotes
      });

      automationEngine.playChime('success');
      automationEngine.showToast('Dock Receiving Confirmed', `Physical inspection PASSED! Accounts Payable payment release unlocked.`, 'success');
      activeDockReceivingReqId = null;
      if (window.renderApp) window.renderApp();
    } catch (err) {
      alert(err.message);
    }
  };

  window.viewAuditPDFModal = (reqId) => {
    activeAuditPdfReqId = reqId;
    if (window.renderApp) window.renderApp();
  };

  window.closeAuditPDFModal = () => {
    activeAuditPdfReqId = null;
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

  
  window.submitRbacAccountForm = (e) => {
    e.preventDefault();
    try {
      const name = document.getElementById('rbac-acc-name').value.trim();
      const username = document.getElementById('rbac-acc-username').value.trim();
      const roleKey = document.getElementById('rbac-acc-role').value;
      const department = document.getElementById('rbac-acc-dept').value;
      const email = document.getElementById('rbac-acc-email').value.trim();
      const phone = document.getElementById('rbac-acc-phone').value.trim();

      const newAcc = store.createStaffAccount({ name, username, roleKey, roleName: roleKey.replace(/_/g, ' '), department, email, phone });
      automationEngine.showToast('Staff Account Created', `Created ${newAcc.username} with role ${newAcc.roleKey}.`, 'success');
      window.closeRbacModals();
      if (window.renderApp) window.renderApp();
    } catch (err) {
      alert(err.message);
    }
  };

  window.toggleStaffAccountStatus = (accId, currentActive) => {
    try {
      store.updateStaffAccountStatus(accId, !currentActive);
      automationEngine.showToast('Account Status Updated', `Account is now ${!currentActive ? 'ACTIVE' : 'DEACTIVATED'}.`, 'info');
      if (window.renderApp) window.renderApp();
    } catch (err) {
      alert(err.message);
    }
  };

  window.resetStaffAccountPassword = (accId) => {
    try {
      const res = store.resetStaffCredentials(accId, 'CapitolTempPass2026');
      alert(`Temporary login credentials for ${res.username}:\nPassword: ${res.temporaryPassword}\n\nThe user will be prompted to set a permanent password upon first login.`);
      if (window.renderApp) window.renderApp();
    } catch (err) {
      alert(err.message);
    }
  };

  window.reviewVendorSubmission = (submissionId, decision) => {
    try {
      const reviewer = store.getActiveStaff().name + ' (Procurement)';
      const res = store.reviewVendorOnboarding(submissionId, decision, reviewer);
      if (decision === 'APPROVE') {
        alert(`Vendor ${res.submission.vendorName} APPROVED!\nAssigned Unique Supplier Code: ${res.supplier.supplierCode}\nInitial login password: ${res.supplier.temporaryPassword}`);
      } else {
        alert(`Vendor application for ${res.submission.vendorName} declined.`);
      }
      if (window.renderApp) window.renderApp();
    } catch (err) {
      alert(err.message);
    }
  };

  window.submitProcurementOrderForm = (e) => {
    e.preventDefault();
    try {
      const supplierCode = document.getElementById('po-supplier-code').value;
      const productId = document.getElementById('po-product-id').value;
      const productName = document.getElementById('po-product-name').value;
      const quantity = Number(document.getElementById('po-quantity').value);
      const unit = document.getElementById('po-unit').value;
      const requiredDeliveryDate = document.getElementById('po-delivery-date').value;
      const notes = document.getElementById('po-notes').value;

      const order = store.requestProcurementOrder({ supplierCode, productId, productName, quantity, unit, requiredDeliveryDate, notes });
      automationEngine.showToast('Purchase Order Created', `PO ${order.id} requested for ${order.supplierCode}.`, 'success');
      window.closeProcurementModals();
      if (window.renderApp) window.renderApp();
    } catch (err) {
      alert(err.message);
    }
  };

  window.approveInvoiceAction = (invoiceId) => {
    try {
      const reviewer = store.getActiveStaff().name + ' (Procurement Manager)';
      const res = store.approveProcurementInvoice(invoiceId, reviewer);
      alert(`Invoice ${res.invoice.invoiceNumber} approved!\nPayment ref ${res.payment.paymentRef} routed to Accounts department for disbursement.`);
      if (window.renderApp) window.renderApp();
    } catch (err) {
      alert(err.message);
    }
  };

  window.closeRbacModals = () => {
    const el = document.getElementById('rbac-create-modal');
    if (el) el.remove();
  };

  window.openRbacCreateModal = () => {
    const root = document.getElementById('app');
    const modal = document.createElement('div');
    modal.id = 'rbac-create-modal';
    modal.innerHTML = `
      <div class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="glass-panel max-w-md w-full p-6 rounded-2xl border-2 border-gold shadow-2xl animate-fade-in" style="background: rgba(8, 17, 28, 0.98);">
          <div class="flex items-center justify-between pb-3 border-b border-gold/20 mb-4">
            <h3 class="font-serif text-lg text-white font-bold">Create Staff Account</h3>
            <button class="text-slate-400 hover:text-white bg-transparent border-none text-lg cursor-pointer" onclick="window.closeRbacModals()">✕</button>
          </div>
          <form onsubmit="window.submitRbacAccountForm(event)" class="flex flex-col gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Staff Full Name:</label>
              <input type="text" id="rbac-acc-name" class="input-custom text-xs" placeholder="e.g. Samuel Okon" required />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Username:</label>
                <input type="text" id="rbac-acc-username" class="input-custom text-xs" placeholder="samuel.okon" required />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Department:</label>
                <input type="text" id="rbac-acc-dept" class="input-custom text-xs" placeholder="Kitchen" required />
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">RBAC System Role:</label>
              <select id="rbac-acc-role" class="input-custom text-xs">
                ${Object.values(ADMIN_ROLES).map(r => `<option value="${r}">${r.replace(/_/g, ' ')}</option>`).join('')}
              </select>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Email:</label>
                <input type="email" id="rbac-acc-email" class="input-custom text-xs" placeholder="samuel@hotelcapitol.ng" required />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Phone:</label>
                <input type="tel" id="rbac-acc-phone" class="input-custom text-xs" placeholder="+234 803 000 1122" required />
              </div>
            </div>
            <div class="flex justify-end gap-2 pt-3 border-t border-white/10 mt-2">
              <button type="button" class="btn-secondary text-xs py-2 px-4 cursor-pointer" onclick="window.closeRbacModals()">Cancel</button>
              <button type="submit" class="btn-primary text-xs py-2 px-5 font-bold cursor-pointer">Create Account →</button>
            </div>
          </form>
        </div>
      </div>
    `;
    root.appendChild(modal);
  };

  window.closeProcurementModals = () => {
    const el = document.getElementById('procurement-po-modal');
    if (el) el.remove();
  };

  window.openRequestOrderModal = () => {
    const state = store.getState();
    const suppliers = state.suppliers || [];
    const root = document.getElementById('app');
    const modal = document.createElement('div');
    modal.id = 'procurement-po-modal';
    modal.innerHTML = `
      <div class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="glass-panel max-w-lg w-full p-6 rounded-2xl border-2 border-gold shadow-2xl animate-fade-in" style="background: rgba(8, 17, 28, 0.98);">
          <div class="flex items-center justify-between pb-3 border-b border-gold/20 mb-4">
            <div>
              <span class="text-[10px] text-gold font-bold uppercase tracking-luxury">Procurement Order Form</span>
              <h3 class="font-serif text-lg text-white font-bold">Request Supplier Purchase Order</h3>
            </div>
            <button class="text-slate-400 hover:text-white bg-transparent border-none text-lg cursor-pointer" onclick="window.closeProcurementModals()">✕</button>
          </div>
          <form onsubmit="window.submitProcurementOrderForm(event)" class="flex flex-col gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Select Approved Supplier:</label>
              <select id="po-supplier-code" class="input-custom text-xs" onchange="window.updatePoProducts(this.value)">
                ${suppliers.map(s => `<option value="${s.supplierCode}">${s.name} (${s.supplierCode})</option>`).join('')}
              </select>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Product / Item:</label>
                <select id="po-product-id" class="input-custom text-xs" onchange="window.updatePoProductPrice(this.value)">
                  ${(suppliers[0]?.approvedPrices || []).map(p => `<option value="${p.productId}" data-name="${p.name}" data-unit="${p.unit}" data-price="${p.approvedBulkPrice}">${p.name} (₦${p.approvedBulkPrice.toLocaleString()}/${p.unit})</option>`).join('')}
                </select>
                <input type="hidden" id="po-product-name" value="${suppliers[0]?.approvedPrices[0]?.name || ''}" />
                <input type="hidden" id="po-unit" value="${suppliers[0]?.approvedPrices[0]?.unit || 'units'}" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Quantity:</label>
                <input type="number" id="po-quantity" min="1" value="5" class="input-custom text-xs" required />
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Required Delivery Date:</label>
              <input type="date" id="po-delivery-date" value="${new Date().toISOString().slice(0, 10)}" class="input-custom text-xs" required />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Delivery Bay / Notes:</label>
              <textarea id="po-notes" class="input-custom text-xs p-2 h-16" placeholder="Loading bay instructions..."></textarea>
            </div>
            <div class="flex justify-end gap-2 pt-3 border-t border-white/10 mt-2">
              <button type="button" class="btn-secondary text-xs py-2 px-4 cursor-pointer" onclick="window.closeProcurementModals()">Cancel</button>
              <button type="submit" class="btn-primary text-xs py-2 px-5 font-bold cursor-pointer">Submit Purchase Order →</button>
            </div>
          </form>
        </div>
      </div>
    `;
    root.appendChild(modal);
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
  if (managerActiveTab === 'profile') {
    tabContent = renderAdminPersonalProfileTab(state, activeStaff, currentRole);
  } else if (managerActiveTab === 'overview') {
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
  } else if (managerActiveTab === 'rbac-management') {
    tabContent = renderRbacManagementTab(state, currentRole);
  } else if (managerActiveTab === 'suppliers-vendors' || managerActiveTab === 'vendors') {
    tabContent = renderSuppliersAndVendorsTab(state, currentRole);
  } else if (managerActiveTab === 'procurement-ai-requisitions' || managerActiveTab === 'procurement') {
    tabContent = renderProcurementAiRequisitionsTab(state, currentRole);
  } else if (managerActiveTab === 'performance-reports') {
    tabContent = renderStaffPerformanceReportsTab(state);
  } else if (managerActiveTab === 'settings') {
    tabContent = renderSystemSettingsTab(state, currentRole);
  }

  return `
    <div class="container-custom py-4 sm:py-6">
      
      <!-- TOP ADMIN COMMAND SUB-BAR WITH RBAC SWITCHER -->
      <div class="glass-panel p-4 sm:p-5 rounded-2xl mb-6 border border-gold/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" style="background: linear-gradient(135deg, rgba(12, 25, 42, 0.95) 0%, rgba(6, 13, 22, 0.95) 100%);">
        <div>
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="text-[11px] font-bold uppercase tracking-luxury text-gold">Hotel Capitol Administration & Governance</span>
            <span class="badge-gold text-xs font-bold">${currentRole.replace(/_/g, ' ')}</span>
          </div>
          <h1 class="text-xl sm:text-2xl font-serif text-white font-bold">Admin & Support Console</h1>
          <p class="text-xs text-slate-300 mt-0.5">Centralized operational oversight, content publishing, media library, and AI governance.</p>
        </div>

        <div class="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end flex-wrap">
          <div class="flex items-center gap-2">
            <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Switch Admin:</span>
            <select 
              class="input-custom text-xs py-1.5 px-2.5 font-semibold bg-navy-950 border-gold/40 text-gold rounded-lg cursor-pointer"
              onchange="window.switchActiveAdminStaff(this.value)"
            >
              ${state.staffMembers.filter(s => s.adminRole || ['STF-05', 'STF-04', 'STF-02', 'STF-03', 'STF-06'].includes(s.id)).map(st => `
                <option value="${st.id}" ${st.id === state.activeStaffId ? 'selected' : ''}>
                  ${st.name} (${st.adminRole || st.role})
                </option>
              `).join('')}
            </select>
          </div>
        </div>
      </div>

      <!-- MAIN NAVIGATION TABS (2-ROW RESPONSIVE GRID) -->
      <div class="glass-panel p-3 sm:p-4 rounded-2xl mb-6 border border-gold/30 bg-navy-950/80 w-full max-w-full overflow-hidden shadow-lg">
        <div class="flex items-center justify-between pb-2 mb-2.5 border-b border-gold/20 px-1">
          <span class="text-[10px] sm:text-xs font-bold uppercase tracking-luxury text-gold">Console Navigation & Modules</span>
          <span class="badge-gold text-[10px] font-bold">17 Modules Active</span>
        </div>
        <div class="admin-menu-tabs-grid w-full max-w-full">
          ${[
            { id: 'profile', label: '👤 Admin Profile' },
            { id: 'overview', label: '📊 Dashboard' },
            { id: 'content-restaurant', label: '🍽️ Restaurant Menu' },
            { id: 'content-breakfast', label: '🍳 Breakfast Service' },
            { id: 'content-amenities', label: '🏊 Amenities' },
            { id: 'content-services', label: '🛎️ Service Options' },
            { id: 'content-media', label: '🖼️ Media Library' },
            { id: 'orders', label: '📦 Orders & Requests' },
            { id: 'transportation', label: '🚗 VIP Transportation' },
            { id: 'learning', label: '🧠 Tolani Learning' },
            { id: 'staff', label: '👥 Staff Directory' },
            { id: 'rbac-management', label: '🔐 RBAC Governance' },
            { id: 'suppliers-vendors', label: '🏢 Suppliers & Vendors' },
            { id: 'procurement-ai-requisitions', label: '📦 Procurement & AI Requisitions' },
            { id: 'performance-reports', label: '📈 KPI Reports' },
            { id: 'audit', label: '📜 Audit Logs' },
            { id: 'settings', label: '⚙️ Settings' }
          ].map(t => `
            <button 
              class="menu-btn-gold ${managerActiveTab === t.id ? 'active' : ''} text-center justify-center w-full min-w-0"
              style="padding: 6px 6px; font-size: clamp(0.68rem, 0.75vw, 0.76rem); min-height: 38px; white-space: normal; line-height: 1.2; border-radius: 12px; box-sizing: border-box;"
              onclick="window.navigateManagerTab('${t.id}')"
              title="${t.label}"
            >
              <span class="truncate block max-w-full text-center">${t.label}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- ACTIVE TAB BODY -->
      ${tabContent}

      <!-- MODALS -->
      ${renderModals(state, activeEditMenuItemId, activeEditAmenityId, activeEditStaffId, activeVersionModal, activeEvidenceModal, activeMediaUploadModal, activeDockReceivingReqId, activeAuditPdfReqId)}

    </div>
  `;
}

// ==========================================
// 0. SINGLE AUTHORITATIVE ADMIN PROFILE TAB
// ==========================================
function renderAdminPersonalProfileTab(state, activeStaff, currentRole) {
  const isListening = adminIntercomState === 'active';
  const isDelivered = adminIntercomState === 'delivered';
  const ringColor = isListening ? '#ef4444' : '#10b981';
  const glowColor = isListening ? 'rgba(239, 68, 68, 0.75)' : 'rgba(16, 185, 129, 0.75)';
  const staffOnDuty = state.staffMembers.filter(s => s.clockedIn).length;
  const activeOrdersCount = state.orders.filter(o => o.status !== 'DELIVERED').length;

  return `
    <div class="staff-profile-container animate-fade-in">
      
      <!-- Single Authoritative Admin Profile Card -->
      <div class="staff-profile-card">
        
        <!-- 1. Profile Image with Gold Frame -->
        <div class="relative mb-4">
          <img 
            src="${activeStaff.avatar}" 
            alt="${activeStaff.name}" 
            class="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-2 border-gold shadow-2xl" 
            style="object-fit: cover; object-position: center; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.7), 0 0 25px rgba(220, 173, 84, 0.3);"
          />
          <div class="absolute -bottom-2 -right-2 bg-navy-950 px-2.5 py-1 rounded-full border border-gold/40 text-[10px] font-bold text-gold">
            ${currentRole.replace(/_/g, ' ')}
          </div>
        </div>

        <!-- 2. Admin Name, Job Title & Department -->
        <h2 class="text-2xl sm:text-3xl font-serif text-white font-bold mb-1">${activeStaff.name}</h2>
        <div class="text-xs sm:text-sm font-semibold text-gold mb-1">${activeStaff.role}</div>
        <div class="text-xs text-slate-300 uppercase tracking-wider mb-5">
          Department: <strong class="text-white">${activeStaff.department}</strong> · Role: <strong class="text-gold">${currentRole.replace(/_/g, ' ')}</strong>
        </div>

        <!-- 3. Clock In CTA -->
        <div class="w-full max-w-xs mb-3">
          <button 
            class="${activeStaff.clockedIn ? 'btn-danger' : 'btn-primary'} w-full py-3 text-sm font-bold shadow-xl cursor-pointer"
            onclick="window.hotelCapitolStore.toggleClockIn('${activeStaff.id}'); renderManagerPortal();"
          >
            ${activeStaff.clockedIn ? '⏰ Clock Out of Duty' : '⏰ Clock In for Duty'}
          </button>
        </div>

        <!-- 4. Large Prominent Intercom Control Directly Below Clock In -->
        <div class="my-3 flex flex-col items-center">
          <button 
            class="staff-large-intercom-btn ${isListening ? 'active' : ''}"
            onclick="window.triggerAdminIntercom()"
            title="Open Live 2-Way Executive Intercom Radio"
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
              <span class="text-[10px] text-slate-300">Push-to-Talk Executive Radio</span>
            </div>
          </button>
        </div>

        <!-- 5. Profile Information & Operational Details (Compact, Moved Upward) -->
        <div class="w-full mt-4 text-left p-4 rounded-2xl bg-navy-950/80 border border-white/10">
          <div class="text-xs font-bold uppercase tracking-luxury text-gold pb-2 border-b border-white/10 mb-3 flex items-center justify-between">
            <span>Executive Profile & Governance</span>
            <span class="text-slate-400 text-[11px]">ID: ${activeStaff.id}</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
            <div class="flex items-center justify-between p-2 rounded-lg bg-navy-900 border border-white/5">
              <span class="text-slate-400">Shift Schedule:</span>
              <strong class="text-white">${activeStaff.shift || 'Executive Operations'}</strong>
            </div>

            <div class="flex items-center justify-between p-2 rounded-lg bg-navy-900 border border-white/5">
              <span class="text-slate-400">Attendance:</span>
              <strong class="${activeStaff.clockedIn ? 'text-emerald-400' : 'text-slate-400'}">
                ${activeStaff.clockedIn ? `In (${activeStaff.clockInTime || '08:00 AM'})` : 'Off Duty'}
              </strong>
            </div>

            <div class="flex items-center justify-between p-2 rounded-lg bg-navy-900 border border-white/5">
              <span class="text-slate-400">Governance Scope:</span>
              <strong class="text-gold font-bold">${currentRole === 'SUPER_ADMIN' ? 'Full Authority' : 'Restricted Scope'}</strong>
            </div>

            <div class="flex items-center justify-between p-2 rounded-lg bg-navy-900 border border-white/5">
              <span class="text-slate-400">Staff on Duty:</span>
              <strong class="text-white">${staffOnDuty} / ${state.staffMembers.length} Active</strong>
            </div>

            <div class="flex items-center justify-between p-2 rounded-lg bg-navy-900 border border-white/5">
              <span class="text-slate-400">Active Orders:</span>
              <strong class="text-emerald-400">${activeOrdersCount} in Progress</strong>
            </div>

            <div class="flex items-center justify-between p-2 rounded-lg bg-navy-900 border border-white/5">
              <span class="text-slate-400">Audit Trail:</span>
              <strong class="text-white">${(state.auditLog || []).length} Logged Events</strong>
            </div>
          </div>

          <!-- AI Operational Coaching Note -->
          <div class="mt-3 pt-3 border-t border-white/10 text-xs">
            <span class="text-gold font-semibold">Governance & Oversight Responsibilities:</span>
            <p class="text-slate-300 mt-1 italic leading-relaxed">"${activeStaff.aiNotes || 'Authoritative oversight over dining menus, property amenities, Lagos transportation pricing, and Tolani AI learning proposals.'}"</p>
          </div>
        </div>

      </div>

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
      <div class="dashboard-kpi-grid">
        
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

      <!-- RECENT ACTIVITY FEED & LIVE SUMMARY (Spec #5: Spaced CTA Buttons) -->
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

          <!-- Spaced Section-Level CTA Button -->
          <div class="pt-5 mt-6 border-t border-white/10 flex justify-end">
            <button class="btn-secondary text-xs py-2 px-5 font-bold shadow-md" onclick="window.navigateManagerTab('orders')">
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

          <!-- Spaced Section-Level CTA Button -->
          <div class="pt-5 mt-6 border-t border-white/10 flex justify-end">
            <button class="btn-secondary text-xs py-2 px-5 font-bold shadow-md" onclick="window.navigateManagerTab('audit')">
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
      <div class="category-pills-bar">
        ${categories.map(cat => `
          <button 
            class="category-pill-btn ${menuCategoryFilter === cat ? 'active' : ''}"
            onclick="window.updateMenuCategoryFilter('${cat}')"
          >
            ${cat} (${cat === 'ALL' ? state.menu.length : state.menu.filter(m => m.category === cat).length})
          </button>
        `).join('')}
      </div>

      <!-- Menu Items Data Table / Grid -->
      <div class="menu-catalog-grid">
        ${filteredMenu.map(item => `
          <div class="food-card ${!item.available ? 'unavailable' : ''}">
            
            <!-- 1. Dedicated Image Container -->
            <div class="food-card-media">
              <img src="${item.image}" alt="${item.name}" class="food-card-img" />
              
              <!-- Badges Over Media -->
              <div class="food-card-media-badges-left">
                <span class="food-pill-badge food-pill-category">
                  ${item.category}
                </span>
                <span class="food-pill-badge food-pill-${(item.status || 'PUBLISHED').toLowerCase()}">
                  ${item.status || 'PUBLISHED'}
                </span>
              </div>

              <div class="food-card-media-badges-right">
                <span class="food-pill-badge food-pill-version">Ver #${item.version || 1}</span>
              </div>
            </div>

            <!-- 2. Strict Vertical Hierarchy Body -->
            <div class="food-card-body">
              
              <!-- Dish Name & Price Header Row -->
              <div class="food-card-header">
                <h3 class="food-card-title">${item.name}</h3>
                <div class="food-card-price">₦${item.price.toLocaleString()}</div>
              </div>

              <!-- Preparation & Delivery Metadata Row -->
              <div class="food-card-meta">
                <span class="food-card-meta-item">⏱️ ${item.prepTimeMinutes || 20}m prep</span>
                <span class="food-card-meta-item">🚴 ${item.estimatedDeliveryMinutes || 15}m delivery</span>
              </div>

              <!-- Description -->
              <p class="food-card-desc">${item.desc}</p>

              <!-- Extras / Addons Snippet -->
              ${item.addons && item.addons.length > 0 ? `
                <div class="food-card-extras-box">
                  <div class="food-card-extras-header">
                    <span>Extras & Add-ons (${item.addons.length}):</span>
                  </div>
                  <div class="food-card-extras-list">
                    ${item.addons.slice(0, 3).map(a => `
                      <div class="food-card-extras-item">
                        <span>• ${a.name}</span>
                        <span class="text-gold font-medium">+₦${a.price.toLocaleString()}</span>
                      </div>
                    `).join('')}
                    ${item.addons.length > 3 ? `<div class="text-[10px] text-slate-400 italic">+${item.addons.length - 3} more options available</div>` : ''}
                  </div>
                </div>
              ` : ''}

              <!-- Action Buttons Footer -->
              <div class="food-card-actions">
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

                <div class="flex items-center justify-between gap-2 text-xs pt-1">
                  ${item.status !== 'PUBLISHED' ? `
                    <button 
                      class="btn-link-green"
                      onclick="window.publishMenuItemAction('${item.id}')"
                    >
                      ✓ Publish Live
                    </button>
                  ` : `
                    <button 
                      class="btn-link-blue"
                      onclick="window.archiveMenuItemAction('${item.id}')"
                    >
                      Archive Item
                    </button>
                  `}

                  <button 
                    class="btn-link-red"
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
          <div class="food-card">
            <div class="food-card-media">
              <img src="${a.image}" alt="${a.name}" class="food-card-img" />
              <div class="food-card-media-badges-left">
                <span class="food-pill-badge food-pill-category">
                  ${a.category}
                </span>
              </div>
              <div class="food-card-media-badges-right">
                <span class="food-pill-badge food-pill-version">Ver #${a.version || 1}</span>
              </div>
            </div>

            <div class="food-card-body">
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
                <button class="btn-link-red ml-2" onclick="window.deleteAmenityAction('${a.id}')">
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
                  class="btn-link-blue"
                  onclick="navigator.clipboard.writeText('${item.url}'); automationEngine.showToast('Copied', 'Image URL copied to clipboard.', 'info');"
                >
                  Copy URL
                </button>
                <button 
                  class="btn-link-red"
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
          ${zones.map(zone => {
            const locList = Array.isArray(zone.locations) ? zone.locations : (typeof zone.locations === 'string' ? zone.locations.split(',').map(s => s.trim()) : []);
            const formattedLocs = locList.join(' • ');
            const regionStr = zone.category || (zone.region === 'ISLAND' ? 'Lagos Island' : zone.region === 'MAINLAND' ? 'Lagos Mainland' : 'Airport Hub');
            
            return `
              <div class="p-4 rounded-xl bg-navy-950 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span class="badge-gold text-[10px] font-bold">${zone.id}</span>
                    <strong class="text-white text-sm">${zone.name}</strong>
                    <span class="text-slate-400 text-xs">(${regionStr})</span>
                  </div>
                  
                  <div class="text-xs text-slate-300 mt-1">
                    <span class="text-gold font-semibold">Locations:</span> ${formattedLocs || 'Standard coverage area'}
                  </div>
                </div>

                <div class="flex items-center gap-3 flex-wrap">
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
                      value="${zone.estimatedMinutes || zone.estMinutes || 30}" 
                    />
                  </div>

                  <button 
                    class="btn-primary text-xs py-2 px-4 font-bold cursor-pointer ${!canManage ? 'opacity-50 cursor-not-allowed' : ''}"
                    onclick="${canManage ? `window.saveZonePrice('${zone.id}')` : 'alert(\'Permission Denied\')'}"
                  >
                    Save Fare
                  </button>
                </div>
              </div>
            `;
          }).join('')}
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
// 13. STAFF AI PERFORMANCE & KPI REPORTS TAB
// ==========================================
function renderStaffPerformanceReportsTab(state) {
  const staffList = state.staffMembers || [];
  
  // Calculate aggregate hotel staff averages
  const avgScore = staffList.length > 0 ? Math.round(staffList.reduce((acc, s) => acc + (s.performanceScore || 90), 0) / staffList.length) : 95;
  const totalCompleted = staffList.reduce((acc, s) => acc + (s.tasksCompleted || 0), 0);
  const totalTasks = staffList.reduce((acc, s) => acc + (s.totalTasks || 0), 0);
  const aggregateRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 97;

  return `
    <div class="flex flex-col gap-6 animate-fade-in max-w-6xl mx-auto">
      
      <!-- TOP EXECUTIVE KPI PERFORMANCE BANNER -->
      <div class="glass-panel p-5 sm:p-6 rounded-2xl border-2 border-gold/30 bg-navy-900/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[11px] font-bold uppercase tracking-luxury text-gold">Executive Intelligence</span>
            <span class="badge-gold text-[10px] font-bold">Week 34 Assessment</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-serif text-white font-bold">Staff Performance & AI Appraisal Matrix</h2>
          <p class="text-xs text-slate-300 mt-0.5">Centralized operational appraisal, SLA execution rates, guest feedback, and AI operational coaching across all 6 departments.</p>
        </div>

        <div class="flex items-center gap-4 bg-navy-950/80 p-3 rounded-xl border border-gold/30 shrink-0">
          <div class="text-center px-2">
            <div class="text-xs text-slate-400 font-semibold uppercase">Hotel Average</div>
            <div class="text-2xl font-serif font-black text-gold">${avgScore}%</div>
          </div>
          <div class="h-8 w-px bg-white/15"></div>
          <div class="text-center px-2">
            <div class="text-xs text-slate-400 font-semibold uppercase">SLA Execution</div>
            <div class="text-2xl font-serif font-black text-emerald-400">${aggregateRate}%</div>
          </div>
        </div>
      </div>

      <!-- ALL STAFF PERFORMANCE CARDS GRID -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${staffList.map(s => {
          const score = s.performanceScore || 95;
          const tasksDone = s.tasksCompleted ?? 42;
          const tasksTot = s.totalTasks ?? 44;
          const pct = tasksTot > 0 ? Math.round((tasksDone / tasksTot) * 100) : 100;
          const tier = score >= 96 ? '🏆 Top Tier' : score >= 93 ? '⭐ Exceptional' : '✨ High Standard';

          return `
            <div class="glass-panel p-5 rounded-2xl border border-white/10 hover:border-gold/50 transition-all flex flex-col justify-between shadow-xl bg-navy-950/90">
              <div>
                
                <!-- Staff Profile Header -->
                <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-3 gap-2">
                  <div class="flex items-center gap-3 min-w-0">
                    <img src="${s.avatar}" alt="${s.name}" class="w-12 h-12 rounded-xl object-cover border border-gold/40 shrink-0" />
                    <div class="min-w-0">
                      <div class="font-serif font-bold text-white text-base truncate" title="${s.name}">${s.name}</div>
                      <div class="text-gold text-xs font-semibold truncate" title="${s.role}">${s.role}</div>
                      <div class="text-[10px] text-slate-400 capitalize">${s.department} · ${s.shift || 'Shift Duty'}</div>
                    </div>
                  </div>
                  <div class="text-right shrink-0">
                    <div class="text-lg font-serif font-black text-gold">${score}%</div>
                    <span class="text-[9px] font-bold text-emerald-400">${tier}</span>
                  </div>
                </div>

                <!-- 4 KPI Metrics Row -->
                <div class="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-navy-900/90 border border-white/5 text-xs mb-3">
                  <div class="p-1.5 rounded-lg bg-navy-950/60 flex flex-col">
                    <span class="text-[10px] text-slate-400">Tasks Completed:</span>
                    <strong class="text-white text-xs mt-0.5">${tasksDone} / ${tasksTot} (${pct}%)</strong>
                  </div>
                  <div class="p-1.5 rounded-lg bg-navy-950/60 flex flex-col">
                    <span class="text-[10px] text-slate-400">On-Time SLA:</span>
                    <strong class="text-emerald-400 text-xs mt-0.5">${s.onTimeRate || '98%'}</strong>
                  </div>
                  <div class="p-1.5 rounded-lg bg-navy-950/60 flex flex-col">
                    <span class="text-[10px] text-slate-400">Attendance:</span>
                    <strong class="${s.clockedIn ? 'text-emerald-400' : 'text-slate-300'} text-xs mt-0.5">
                      ${s.clockedIn ? '🟢 Active' : '⚪ Scheduled'}
                    </strong>
                  </div>
                  <div class="p-1.5 rounded-lg bg-navy-950/60 flex flex-col">
                    <span class="text-[10px] text-slate-400">Guest Feedback:</span>
                    <strong class="text-gold text-xs mt-0.5 truncate" title="${s.feedback || 'Outstanding'}">${s.feedback || 'Outstanding'}</strong>
                  </div>
                </div>

                <!-- AI Operational Coaching Note -->
                <div class="p-3 rounded-xl bg-gold/10 border border-gold/25 text-xs mb-3">
                  <div class="text-[10px] text-gold font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span>✨</span> <span>AI Coaching Insight:</span>
                  </div>
                  <p class="text-slate-200 text-[11px] italic leading-relaxed">"${s.aiNotes || 'Maintains high standard of service and operational efficiency.'}"</p>
                </div>

              </div>

              <!-- Action Buttons -->
              <div class="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <button 
                  class="btn-secondary text-[11px] py-1 px-3 flex-1"
                  onclick="store.setActiveStaff('${s.id}'); window.navigateStaffTab && window.navigateStaffTab('performance');"
                >
                  📊 Inspect Profile
                </button>
                <button 
                  class="btn-secondary text-[11px] py-1 px-3 flex-1"
                  onclick="window.openEditStaffModal('${s.id}')"
                >
                  ✏️ Edit Record
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
}

// ==========================================
// 14. RBAC GOVERNANCE & ORGANIZATIONAL HIERARCHY TAB
// ==========================================
function renderRbacManagementTab(state, currentRole) {
  const staffList = state.staffMembers || [];
  const execs = ORGANIZATIONAL_HIERARCHY.executive_management || [];
  const depts = ORGANIZATIONAL_HIERARCHY.departments || [];

  // Canonical Executive Portraits
  const execAvatars = {
    'ROLE_CEO_COO': './src/assets/wga.jpg',
    'ROLE_HM': './src/assets/general-manager-seyi.jpg',
    'ROLE_AM': './src/assets/supervisor-tariq.jpg'
  };

  // Canonical Department Supervisor Portraits
  const deptSupervisorAvatars = {
    'DEP_FRONT_OFFICE': './src/assets/transport-manager-bello.jpg',
    'DEP_HOUSEKEEPING': './src/assets/housekeeping-amara.jpg',
    'DEP_FNB': './src/assets/content-manager-chidinma.jpg',
    'DEP_KITCHEN': './src/assets/executive-chef-babatunde.jpg',
    'DEP_PROCUREMENT': './src/assets/supervisor-tariq.jpg',
    'DEP_FINANCE': './src/assets/BBB.jpg',
    'DEP_MAINTENANCE': './src/assets/wga.jpg',
    'DEP_SECURITY': './src/assets/supervisor-tariq.jpg'
  };

  return `
    <div class="flex flex-col gap-6 sm:gap-8 animate-fade-in max-w-6xl w-full mx-auto px-1 sm:px-2 overflow-hidden">
      
      <!-- TOP EXECUTIVE HEADER -->
      <div class="glass-panel p-4 sm:p-6 rounded-2xl border-2 border-gold/40 bg-navy-950/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full max-w-full overflow-hidden">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="text-xs font-bold uppercase tracking-luxury text-gold">Institutional Governance</span>
            <span class="badge-gold text-xs font-bold">8 Departments · 3 Executive Tiers</span>
          </div>
          <h1 class="text-xl sm:text-2xl font-serif text-white font-bold leading-tight">Hotel Capitol Organizational Structure & RBAC</h1>
          <p class="text-xs text-slate-300 mt-1 leading-relaxed">Authoritative organizational hierarchy, reporting chains, supervisory oversight, and financial approval limits.</p>
        </div>

        <div class="flex items-center gap-2.5 sm:gap-3 flex-wrap shrink-0">
          <button class="glass-panel text-xs py-2 px-3.5 border border-gold/40 hover:border-gold text-gold hover:text-white rounded-xl cursor-pointer flex items-center gap-1.5 transition-all" onclick="window.toggleVideoWalkthrough(true)">
            <span>🎬</span> <span>Watch Video Tour</span>
          </button>
          <button class="btn-secondary text-xs py-2 px-4 cursor-pointer" onclick="window.navigateManagerTab('procurement')">
            📦 View Approval Matrix →
          </button>
        </div>
      </div>

      <!-- SECTION 1: EXECUTIVE MANAGEMENT HIERARCHY (3 TIERS) -->
      <div class="w-full max-w-full overflow-hidden">
        <div class="flex items-center justify-between mb-3.5 sm:mb-4 flex-wrap gap-2">
          <div>
            <h3 class="font-serif text-base sm:text-lg font-bold text-white tracking-wide uppercase">1. Executive Management & Financial Governance</h3>
            <p class="text-xs text-slate-400">Authoritative sign-off authorities according to total procurement valuation.</p>
          </div>
          <span class="badge-gold text-xs">Approval Thresholds</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 w-full max-w-full">
          ${execs.map((exec, idx) => {
            const isHigh = exec.role_id === 'ROLE_CEO_COO';
            const isMed = exec.role_id === 'ROLE_HM';
            const isLow = exec.role_id === 'ROLE_AM';
            const borderCol = isHigh ? 'border-gold shadow-lg shadow-gold/10' : isMed ? 'border-blue-400/50' : 'border-emerald-400/50';
            const badgeCol = isHigh ? 'bg-gold/20 text-gold border-gold/40' : isMed ? 'bg-blue-900/40 text-blue-300 border-blue-400/40' : 'bg-emerald-900/40 text-emerald-300 border-emerald-400/40';
            const limitText = isHigh ? '₦5,000,001 and above (Terminal Authority)' : isMed ? '₦1,000,001 – ₦5,000,000' : 'Up to ₦1,000,000 (Routine Governance)';
            const photoUrl = execAvatars[exec.role_id] || './src/assets/general-manager-seyi.jpg';

            return `
              <div class="glass-panel p-4 sm:p-5 rounded-2xl border-2 ${borderCol} flex flex-col justify-between bg-navy-900/90 w-full max-w-full overflow-hidden">
                <div>
                  
                  <!-- Executive Profile Card Header with Portrait -->
                  <div class="flex items-center gap-3 pb-3 border-b border-white/10 mb-3 min-w-0">
                    <img 
                      src="${photoUrl}" 
                      alt="${exec.title}" 
                      class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover shrink-0 border-2 border-gold/50 shadow-md"
                      style="width: 52px; height: 52px; min-width: 52px; max-width: 52px; min-height: 52px; max-height: 52px; object-fit: cover; border-radius: 14px; flex-shrink: 0;" 
                    />
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center justify-between gap-1 mb-0.5">
                        <span class="text-[9px] sm:text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${badgeCol}">TIER ${idx + 1}</span>
                        <span class="text-[10px] text-slate-400 truncate">${exec.reports_to ? 'Reports: ' + exec.reports_to.replace('ROLE_', '') : 'Top Tier'}</span>
                      </div>
                      <h4 class="font-serif text-sm sm:text-base font-bold text-white leading-tight truncate" title="${exec.title}">${exec.title}</h4>
                      <div class="text-[10px] text-gold-light font-mono truncate">${exec.role_id}</div>
                    </div>
                  </div>

                  <div class="p-2.5 rounded-xl bg-navy-950/80 border border-white/5 mb-3">
                    <div class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Financial Sign-off Authority</div>
                    <div class="text-xs font-mono font-bold text-gold mt-0.5 break-words">${limitText}</div>
                  </div>

                  <p class="text-xs text-slate-300 leading-relaxed break-words">${exec.scope_of_work}</p>
                </div>

                <div class="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between gap-2 flex-wrap">
                  <span>Role ID: <strong class="text-white font-mono text-[10px]">${exec.role_id}</strong></span>
                  <span class="text-emerald-400 font-semibold text-[10px] flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Active Executive
                  </span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- SECTION 2: 8 CANONICAL OPERATIONAL DEPARTMENTS -->
      <div class="w-full max-w-full overflow-hidden" style="max-width: 100%; box-sizing: border-box;">
        <div class="flex items-center justify-between mb-3.5 sm:mb-4 flex-wrap gap-2">
          <div>
            <h3 class="font-serif text-base sm:text-lg font-bold text-white tracking-wide uppercase">2. Departmental Hierarchy & Supervisory Chains</h3>
            <p class="text-xs text-slate-400">Supervisory relationships, line-staff allocations, and departmental scopes of work.</p>
          </div>
          <span class="badge-gold text-xs">8 Core Departments</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 w-full max-w-full overflow-hidden" style="width: 100%; max-width: 100%; box-sizing: border-box;">
          ${depts.map(dept => {
            const supervisorPhoto = deptSupervisorAvatars[dept.department_id] || './src/assets/supervisor-tariq.jpg';

            return `
              <div class="glass-panel p-4 rounded-2xl border border-white/10 hover:border-gold/40 transition-all flex flex-col justify-between bg-navy-950/90 w-full max-w-full overflow-hidden" style="min-width: 0; max-width: 100%; box-sizing: border-box;">
                <div class="w-full max-w-full overflow-hidden">
                  <div class="flex items-center justify-between pb-2 border-b border-white/10 mb-2.5 min-w-0">
                    <span class="font-mono text-[10px] text-gold font-bold">${dept.department_id}</span>
                    <span class="text-[10px] text-slate-400 truncate">Exec: <strong class="text-white">${dept.executive_supervisor_role_id.replace('ROLE_', '')}</strong></span>
                  </div>

                  <h4 class="font-serif text-sm font-bold text-white mb-2.5 leading-snug break-words">${dept.department_name}</h4>
                  
                  <!-- Direct Supervisor with Profile Avatar -->
                  <div class="p-2 sm:p-2.5 rounded-xl bg-navy-900/90 border border-white/5 flex items-center gap-2.5 mb-2.5 min-w-0 overflow-hidden" style="max-width: 100%;">
                    <img 
                      src="${supervisorPhoto}" 
                      alt="${dept.direct_supervisor.title}" 
                      class="w-10 h-10 rounded-xl object-cover shrink-0 border border-gold/40 shadow-sm"
                      style="width: 40px; height: 40px; min-width: 40px; max-width: 40px; min-height: 40px; max-height: 40px; object-fit: cover; border-radius: 10px; flex-shrink: 0;" 
                    />
                    <div class="min-w-0 flex-1 overflow-hidden">
                      <div class="text-[9px] text-slate-400 uppercase tracking-wider font-semibold truncate">Direct Supervisor</div>
                      <div class="font-bold text-gold text-xs leading-tight truncate" title="${dept.direct_supervisor.title}">${dept.direct_supervisor.title}</div>
                      <div class="font-mono text-[9px] text-slate-400 truncate">${dept.direct_supervisor.role_id}</div>
                    </div>
                  </div>

                  <div class="text-xs mb-2 overflow-hidden">
                    <div class="text-[10px] text-slate-400 mb-1 font-semibold uppercase tracking-wider">Line Staff Roles:</div>
                    <div class="flex flex-wrap gap-1 max-w-full">
                      ${dept.line_staff_roles.map(r => `<span class="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-200 border border-white/10 truncate max-w-full">${r}</span>`).join('')}
                    </div>
                  </div>

                  <p class="text-[11px] text-slate-300 italic leading-snug mt-2 break-words max-w-full">"${dept.core_scope_of_work}"</p>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- SECTION 3: STAFF ACCOUNT & ROLE ASSIGNMENT TABLE -->
      <div class="glass-panel p-4 sm:p-6 rounded-2xl border border-gold/30 w-full max-w-full overflow-hidden">
        <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 class="font-serif text-base sm:text-lg font-bold text-white tracking-wide uppercase">3. Staff Account RBAC & Module Authority</h3>
            <p class="text-xs text-slate-300">Active personnel accounts, assigned departmental roles, and access privileges.</p>
          </div>
          <span class="badge-gold text-xs">${staffList.length} Active Accounts</span>
        </div>

        <div class="overflow-x-auto w-full max-w-full scrollbar-thin rounded-xl border border-white/10" style="-webkit-overflow-scrolling: touch;">
          <table class="w-full text-left text-xs border-collapse min-w-[640px]">
            <thead>
              <tr class="border-b border-white/10 text-gold uppercase tracking-wider text-[10px] bg-navy-950/80">
                <th class="py-3 px-3">Staff Member</th>
                <th class="py-3 px-3">Department</th>
                <th class="py-3 px-3">Assigned Role ID</th>
                <th class="py-3 px-3">Supervisory Scope</th>
                <th class="py-3 px-3">Status</th>
                <th class="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5 text-slate-200">
              ${staffList.map(s => `
                <tr class="hover:bg-white/5 transition-colors">
                  <td class="py-3 px-3 font-semibold text-white">
                    <div class="flex items-center gap-2.5">
                      <img src="${s.avatar}" class="w-8 h-8 rounded-full object-cover shrink-0 border border-gold/40 shadow-sm" style="width: 32px; height: 32px; min-width: 32px; max-width: 32px; min-height: 32px; max-height: 32px; object-fit: cover; border-radius: 9999px; flex-shrink: 0;" alt="${s.name}" />
                      <div class="min-w-0">
                        <div class="font-medium text-white truncate">${s.name}</div>
                        <div class="text-[10px] text-slate-400 font-mono">${s.id}</div>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-3 capitalize">${s.department}</td>
                  <td class="py-3 px-3">
                    <span class="badge-gold text-[10px] font-bold font-mono">${s.adminRole || 'FRONT_DESK'}</span>
                  </td>
                  <td class="py-3 px-3 text-slate-300">${s.role}</td>
                  <td class="py-3 px-3">
                    <span class="${s.active !== false ? 'text-emerald-400' : 'text-red-400'} font-semibold text-[11px] flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full ${s.active !== false ? 'bg-emerald-400' : 'bg-red-400'}"></span>
                      ${s.active !== false ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td class="py-3 px-3 text-right">
                    <button class="btn-secondary text-[10px] py-1 px-2.5 cursor-pointer hover:border-gold transition-all" onclick="window.openEditStaffModal('${s.id}')">
                      Configure →
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}

// ==========================================
// 15. AI STOCK MONITORING & 14-STAGE AUTONOMOUS PROCUREMENT TAB
// ==========================================
function renderProcurementManagerTab(state, currentRole) {
  const inventory = state.inventory || [];
  const requisitions = state.procurementRequisitions || [];
  const filteredReqs = procurementReqFilter === 'ALL' ? requisitions :
    procurementReqFilter === 'APPROVAL' ? requisitions.filter(r => r.status === 'PENDING_APPROVAL' || r.status.startsWith('ESCALATED')) :
    procurementReqFilter === 'LOGISTICS' ? requisitions.filter(r => r.status === 'LPO_REQUESTED' || r.status === 'ORDER_CONFIRMED' || r.status === 'IN_TRANSIT' || r.status === 'VENDOR_INVOICE_GENERATED') :
    procurementReqFilter === 'RECEIVING' ? requisitions.filter(r => r.status === 'GOODS_DELIVERED' || r.status === 'PROCUREMENT_VERIFIED') :
    procurementReqFilter === 'CLOSED' ? requisitions.filter(r => r.status === 'AUDIT_CLOSED' || r.status === 'RECEIPT_CONFIRMED') : requisitions;

  const lowCount = inventory.filter(i => i.status !== 'NORMAL').length;

  return `
    <div class="flex flex-col gap-8 animate-fade-in max-w-6xl mx-auto">
      
      <!-- TOP BANNER -->
      <div class="glass-panel p-6 rounded-2xl border-2 border-gold/40 bg-navy-950/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="text-xs font-bold uppercase tracking-luxury text-gold">Autonomous Supply Chain Engine</span>
            <span class="badge-gold text-xs font-bold">14-Stage Workflow</span>
          </div>
          <h1 class="text-2xl font-serif text-white font-bold">AI Stock Monitoring & Autonomous Procurement</h1>
          <p class="text-xs text-slate-300 mt-1">Multi-tier financial approval matrix (≤₦1M AM, ₦1M–₦5M HM, >₦5M CEO), dual-stream invoice verification, two-way payment release hold, and PDF closeout.</p>
        </div>

        <div class="flex items-center gap-3">
          <button class="btn-primary text-xs py-2.5 px-4 font-bold cursor-pointer shadow-lg" onclick="window.triggerStockDepletionEvaluation()">
            🤖 Run AI Stock Scan
          </button>
        </div>
      </div>

      <!-- SECTION 1: AI STOCK MONITORING & DEPLETION MATRIX -->
      <div class="glass-panel p-6 rounded-2xl border border-white/10 bg-navy-900/90">
        <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-4 flex-wrap gap-2">
          <div>
            <div class="text-xs font-bold uppercase tracking-luxury text-gold">Real-Time Inventory Surveillance</div>
            <h3 class="font-serif text-lg font-bold text-white">Stock Depletion Watchlist (30% Warning, 20% Low, 10% Critical, 5% Emergency)</h3>
          </div>
          <span class="badge-gold text-xs">${lowCount} Items Requiring Replenishment</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${inventory.map(item => {
            const pct = Math.round((item.quantity / item.maxCapacity) * 100);
            const isCrit = pct <= 10;
            const isLow = pct <= 20;
            const isWarn = pct <= 30;
            const barCol = isCrit ? 'bg-red-500' : isLow ? 'bg-amber-500' : isWarn ? 'bg-yellow-500' : 'bg-emerald-500';
            const badgeClass = isCrit ? 'bg-red-950 text-red-300 border-red-500/50' : isLow ? 'bg-amber-950 text-amber-300 border-amber-500/50' : isWarn ? 'bg-yellow-950 text-yellow-300 border-yellow-500/50' : 'bg-emerald-950 text-emerald-300 border-emerald-500/50';

            return `
              <div class="p-4 rounded-xl bg-navy-950 border ${isCrit ? 'border-red-500/40' : isLow ? 'border-amber-500/40' : 'border-white/5'} flex flex-col justify-between text-xs">
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-mono text-[10px] text-slate-400">${item.sku || item.id}</span>
                    <span class="text-[9px] font-bold px-2 py-0.5 rounded border ${badgeClass}">${pct}% (${item.status})</span>
                  </div>
                  <div class="font-bold text-white text-sm mb-1">${item.name}</div>
                  <div class="text-slate-400 text-[11px] capitalize">${item.category} · ${item.supplier || item.supplierCode}</div>
                  
                  <div class="w-full bg-navy-900 rounded-full h-2 my-2.5 overflow-hidden">
                    <div class="${barCol} h-full rounded-full transition-all" style="width: ${pct}%"></div>
                  </div>

                  <div class="flex justify-between text-[11px] text-slate-300">
                    <span>Stock: <strong class="text-white">${item.quantity} ${item.unit}</strong></span>
                    <span>Max: ${item.maxCapacity} ${item.unit}</span>
                  </div>
                </div>

                <div class="mt-3 pt-2 border-t border-white/10 flex justify-between items-center text-[11px]">
                  <span class="text-gold font-bold">₦${(item.unitCost || 0).toLocaleString()}/unit</span>
                  <span class="text-slate-400">${item.dailyConsumptionRate ? item.dailyConsumptionRate + '/day usage' : 'Active'}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- SECTION 2: 14-STAGE AUTONOMOUS REQUISITIONS QUEUE & APPROVAL MATRIX -->
      <div class="glass-panel p-6 rounded-2xl border border-gold/30">
        <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-4 flex-wrap gap-3">
          <div>
            <div class="text-xs font-bold uppercase tracking-luxury text-gold">Autonomous Procurement State Machine</div>
            <h3 class="font-serif text-lg font-bold text-white">Requisition Approval & Lifecycle Queue (${requisitions.length})</h3>
          </div>

          <!-- Filter Pills -->
          <div class="flex items-center gap-1.5 flex-wrap text-xs">
            <button class="menu-btn-gold ${procurementReqFilter === 'ALL' ? 'active' : ''} text-xs py-1 px-3 rounded-lg cursor-pointer" onclick="window.setProcurementFilter('ALL')">All (${requisitions.length})</button>
            <button class="menu-btn-gold ${procurementReqFilter === 'APPROVAL' ? 'active' : ''} text-xs py-1 px-3 rounded-lg cursor-pointer" onclick="window.setProcurementFilter('APPROVAL')">Pending Approval</button>
            <button class="menu-btn-gold ${procurementReqFilter === 'LOGISTICS' ? 'active' : ''} text-xs py-1 px-3 rounded-lg cursor-pointer" onclick="window.setProcurementFilter('LOGISTICS')">In Logistics</button>
            <button class="menu-btn-gold ${procurementReqFilter === 'RECEIVING' ? 'active' : ''} text-xs py-1 px-3 rounded-lg cursor-pointer" onclick="window.setProcurementFilter('RECEIVING')">Dock Receiving</button>
            <button class="menu-btn-gold ${procurementReqFilter === 'CLOSED' ? 'active' : ''} text-xs py-1 px-3 rounded-lg cursor-pointer" onclick="window.setProcurementFilter('CLOSED')">Settled & Closed</button>
          </div>
        </div>

        ${filteredReqs.length === 0 ? `
          <div class="p-8 text-center text-xs text-slate-400">
            No procurement requisitions matching the selected filter.
          </div>
        ` : `
          <div class="flex flex-col gap-4">
            ${filteredReqs.map(req => {
              const isPending = req.status === 'PENDING_APPROVAL' || req.status === 'ESCALATED_TO_HM' || req.status === 'ESCALATED_TO_CEO';
              const isApproved = req.status === 'APPROVED';
              const isDispatched = req.status === 'LPO_REQUESTED' || req.status === 'SENT_TO_VENDOR';
              const isInvoiceGenerated = req.status === 'VENDOR_INVOICE_GENERATED';
              const isLogistics = req.status === 'ORDER_CONFIRMED' || req.status === 'IN_TRANSIT' || req.status === 'GOODS_DELIVERED';
              const isVerified = req.status === 'PROCUREMENT_VERIFIED';
              const isReceiptConfirmed = req.status === 'RECEIPT_CONFIRMED';
              const isClosed = req.status === 'AUDIT_CLOSED';

              const tierBadge = req.tierLevel === 1 ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' : req.tierLevel === 2 ? 'bg-blue-950 text-blue-300 border-blue-500/40' : 'bg-purple-950 text-purple-300 border-purple-500/40';

              return `
                <div class="p-5 rounded-2xl bg-navy-950 border border-gold/30 flex flex-col gap-4 shadow-xl">
                  
                  <!-- Top Card Info -->
                  <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div>
                      <div class="flex items-center gap-2 mb-1 flex-wrap">
                        <span class="font-mono text-xs font-bold text-gold">${req.id}</span>
                        <span class="badge-gold text-[10px] font-mono">${req.sku}</span>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded border ${tierBadge}">
                          TIER ${req.tierLevel}: ${req.assignedApproverTitle}
                        </span>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-navy-900 text-slate-300 border border-white/10">
                          SLA: ⏱ ${req.slaHours}h (${req.approvalDeadline})
                        </span>
                      </div>
                      <h4 class="font-serif text-base font-bold text-white">${req.itemName}</h4>
                      <div class="text-xs text-slate-300 mt-0.5">
                        Department: <strong>${req.departmentName}</strong> · Supplier: <strong class="text-gold">${req.preferredVendorName} (${req.preferredVendorCode})</strong>
                      </div>
                    </div>

                    <div class="text-left md:text-right shrink-0">
                      <div class="text-xs text-slate-400">Total Procurement Value:</div>
                      <div class="text-xl font-serif font-black text-gold">₦${(req.estimatedCost || 0).toLocaleString()}</div>
                      <div class="text-[11px] text-slate-400">${req.reorderQuantity} units @ ₦${(req.unitPrice || 0).toLocaleString()}</div>
                    </div>
                  </div>

                  <!-- Workflow State Stepper Pipeline -->
                  <div class="p-3 rounded-xl bg-navy-900/80 border border-white/5 flex items-center justify-between gap-2 overflow-x-auto text-[10px]">
                    <div class="flex items-center gap-1 shrink-0 ${isPending ? 'text-amber-400 font-bold' : 'text-emerald-400'}">
                      <span>${isPending ? '⏳' : '✓'}</span> <span>1. AI Alert</span>
                    </div>
                    <span class="text-white/20">→</span>
                    <div class="flex items-center gap-1 shrink-0 ${req.status === 'APPROVED' ? 'text-amber-400 font-bold' : isPending ? 'text-slate-500' : 'text-emerald-400'}">
                      <span>${req.status === 'APPROVED' ? '⏳' : isPending ? '○' : '✓'}</span> <span>2. Approval</span>
                    </div>
                    <span class="text-white/20">→</span>
                    <div class="flex items-center gap-1 shrink-0 ${isDispatched ? 'text-amber-400 font-bold' : (isInvoiceGenerated || isLogistics || isVerified || isReceiptConfirmed || isClosed) ? 'text-emerald-400' : 'text-slate-500'}">
                      <span>${isDispatched ? '⏳' : (isInvoiceGenerated || isLogistics || isVerified || isReceiptConfirmed || isClosed) ? '✓' : '○'}</span> <span>3. LPO Dispatched</span>
                    </div>
                    <span class="text-white/20">→</span>
                    <div class="flex items-center gap-1 shrink-0 ${isInvoiceGenerated ? 'text-amber-400 font-bold' : (isLogistics || isVerified || isReceiptConfirmed || isClosed) ? 'text-emerald-400' : 'text-slate-500'}">
                      <span>${isInvoiceGenerated ? '⏳' : (isLogistics || isVerified || isReceiptConfirmed || isClosed) ? '✓' : '○'}</span> <span>4. Invoice Verified</span>
                    </div>
                    <span class="text-white/20">→</span>
                    <div class="flex items-center gap-1 shrink-0 ${(isLogistics || isVerified) ? 'text-amber-400 font-bold' : (isReceiptConfirmed || isClosed) ? 'text-emerald-400' : 'text-slate-500'}">
                      <span>${(isLogistics || isVerified) ? '⏳' : (isReceiptConfirmed || isClosed) ? '✓' : '○'}</span> <span>5. Dock Receiving</span>
                    </div>
                    <span class="text-white/20">→</span>
                    <div class="flex items-center gap-1 shrink-0 ${isClosed ? 'text-emerald-400 font-bold' : 'text-slate-500'}">
                      <span>${isClosed ? '✓' : '○'}</span> <span>6. Payout & PDF</span>
                    </div>
                  </div>

                  <!-- Details & Action Buttons Bar -->
                  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                    <div class="text-xs text-slate-300">
                      Current State: <strong class="text-gold font-mono">${req.status}</strong>
                      ${req.lpo ? `· LPO: <span class="font-mono text-white font-bold">${req.lpo.lpoNumber}</span>` : ''}
                      ${req.invoice ? `· Inv: <span class="font-mono text-white">${req.invoice.invoiceNumber}</span>` : ''}
                      ${req.delivery?.milestone ? `· Milestone: <span class="text-emerald-400 font-semibold">${req.delivery.milestone}</span>` : ''}
                    </div>

                    <div class="flex items-center gap-2 flex-wrap">
                      ${isPending ? `
                        <button class="btn-primary text-xs py-1.5 px-3.5 font-bold cursor-pointer" onclick="window.approveRequisitionAction('${req.id}')">
                          ✓ Approve (${req.assignedApproverTitle.split(' ')[0]})
                        </button>
                        <button class="btn-secondary text-xs py-1.5 px-3 cursor-pointer" onclick="window.escalateRequisitionAction('${req.id}')">
                          ⬆ Escalate
                        </button>
                        <button class="btn-secondary text-xs py-1.5 px-3 text-red-400 hover:text-red-300 cursor-pointer" onclick="window.rejectRequisitionAction('${req.id}')">
                          ✕ Reject
                        </button>
                      ` : ''}

                      ${isApproved ? `
                        <button class="btn-primary text-xs py-1.5 px-4 font-bold cursor-pointer" onclick="window.dispatchLPOAction('${req.id}')">
                          📦 Request Order & Dispatch LPO →
                        </button>
                      ` : ''}

                      ${isInvoiceGenerated ? `
                        <button class="btn-primary text-xs py-1.5 px-4 font-bold cursor-pointer" onclick="window.verifyInvoiceAction('${req.id}')">
                          🔍 3-Way Match & Submit to AP →
                        </button>
                      ` : ''}

                      ${(req.status === 'GOODS_DELIVERED' || req.status === 'IN_TRANSIT' || isVerified) && !req.receiving ? `
                        <button class="btn-primary text-xs py-1.5 px-4 font-bold cursor-pointer" onclick="window.openDockReceivingModal('${req.id}')">
                          📋 Inspect & Confirm Dock Receipt →
                        </button>
                      ` : ''}

                      ${(isClosed || isReceiptConfirmed) ? `
                        <button class="btn-secondary text-xs py-1.5 px-3 font-bold text-gold border-gold/40 cursor-pointer" onclick="window.viewAuditPDFModal('${req.id}')">
                          🧾 View Audit PDF Certificate
                        </button>
                      ` : ''}
                    </div>
                  </div>

                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

    </div>
  `;
}

// ==========================================
// 16. SUPPLIERS & VENDORS TAB
// ==========================================
function renderSuppliersAndVendorsTab(state, currentRole) {
  const suppliers = state.suppliers || [];

  return `
    <div class="flex flex-col gap-6 animate-fade-in max-w-6xl w-full mx-auto px-1 sm:px-2">
      <!-- HEADER -->
      <div class="glass-panel p-6 rounded-2xl border-2 border-gold/40 bg-navy-950/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="text-xs font-bold uppercase tracking-luxury text-gold">Vendor Management System</span>
            <span class="badge-gold text-xs font-bold">${suppliers.length} Approved Suppliers</span>
          </div>
          <h1 class="text-xl sm:text-2xl font-serif text-white font-bold">Suppliers & Vendors</h1>
          <p class="text-xs text-slate-300 mt-1">Centralized supplier network directory, onboarding applications, product categories, and approved contract price lists.</p>
        </div>
        <div class="flex items-center gap-3">
          <button class="btn-primary text-xs py-2 px-4 font-bold cursor-pointer" onclick="window.navigatePortal('vendor')">
            Open Vendor Portal →
          </button>
        </div>
      </div>

      <!-- SUPPLIERS DIRECTORY -->
      <div class="glass-panel p-6 rounded-2xl border border-white/10">
        <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-4 flex-wrap gap-2">
          <h3 class="font-serif text-sm font-bold text-white tracking-luxury uppercase">Active Supplier Network & Catalog</h3>
          <span class="badge-gold text-xs">${suppliers.length} Registered</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${suppliers.map(sup => `
            <div class="p-4 rounded-xl bg-navy-900/90 border border-white/10 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="badge-gold text-[10px] font-mono">${sup.supplierCode}</span>
                  <span class="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active
                  </span>
                </div>
                <h4 class="font-serif text-sm font-bold text-white mb-1">${sup.name}</h4>
                <div class="text-xs text-gold mb-2">${sup.category}</div>
                <div class="text-[11px] text-slate-300">Contact: ${sup.contactPerson} (${sup.phone})</div>
                <div class="text-[11px] text-slate-400 mt-0.5">${sup.email}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// 17. PROCUREMENT & AI REQUISITIONS TAB
// ==========================================
function renderProcurementAiRequisitionsTab(state, currentRole) {
  return renderProcurementManagerTab(state, currentRole);
}

// ==========================================
// MODAL RENDERERS (CREATE/EDIT/MEDIA/HISTORY)
// ==========================================
function renderModals(state, editMenuId, editAmenityId, editStaffId, versionModal, evidenceId, mediaUploadOpen, dockReceivingReqId, auditPdfReqId) {
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
            <button class="btn-primary text-xs py-1.5 px-5 font-bold cursor-pointer" onclick="window.closeEvidenceModal()">Close</button>
          </div>
        </div>
      </div>
    `;
  }

  // 7. DOCK RECEIVING & PHYSICAL INSPECTION MODAL
  if (dockReceivingReqId) {
    const req = (state.procurementRequisitions || []).find(r => r.id === dockReceivingReqId);
    modalHtml += `
      <div class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
        <div class="glass-panel max-w-lg w-full p-4 sm:p-6 rounded-2xl border-2 border-gold shadow-2xl animate-fade-in max-h-[92vh] overflow-y-auto" style="background: rgba(8, 17, 28, 0.98);">
          <div class="flex items-center justify-between pb-3 border-b border-gold/20 mb-4">
            <div>
              <span class="text-[10px] text-gold font-bold uppercase tracking-luxury">Stores & Receiving Gate</span>
              <h3 class="font-serif text-lg text-white font-bold">Physical Dock Receiving Inspection</h3>
            </div>
            <button class="text-slate-400 hover:text-white bg-transparent border-none text-lg cursor-pointer" onclick="window.closeDockReceivingModal()">✕</button>
          </div>

          <form onsubmit="window.submitDockReceivingForm(event)" class="flex flex-col gap-3.5 text-xs">
            <div class="p-3 rounded-xl bg-navy-950 border border-white/10">
              <div class="font-bold text-white text-sm mb-1">${req?.itemName} (${req?.sku})</div>
              <div class="text-slate-300">Requisition: <strong class="text-gold font-mono">${req?.id}</strong> · Supplier: <strong class="text-white">${req?.preferredVendorName}</strong></div>
              <div class="text-slate-300 mt-1">Expected Quantity: <strong class="text-emerald-400">${req?.reorderQuantity} units</strong> (₦${(req?.estimatedCost || 0).toLocaleString()})</div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Carrier Waybill / Delivery Note Number:</label>
              <input type="text" id="dock-waybill" class="input-custom text-xs" value="WB-${req?.preferredVendorCode || 'SUP'}-${new Date().getFullYear()}-${Math.floor(Math.random()*9000)+1000}" required />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Physical Quantity Accepted:</label>
                <input type="number" id="dock-qty" class="input-custom text-xs" value="${req?.reorderQuantity || 1}" min="1" max="${req?.reorderQuantity || 10000}" required />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Condition Inspection:</label>
                <select id="dock-condition" class="input-custom text-xs">
                  <option value="PASSED" selected>✓ PASSED (Pristine & Sealed)</option>
                  <option value="PARTIAL_ACCEPTANCE">⚠️ PARTIAL ACCEPTANCE</option>
                  <option value="DAMAGED_REJECTED">✕ DAMAGED / REJECTED</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Dock Inspection Notes:</label>
              <textarea id="dock-notes" class="input-custom text-xs h-20 resize-none">Delivered to Hotel Capitol Loading Bay 1. Seals intact, expiry dates verified, batch inspection passed.</textarea>
            </div>

            <div class="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-[11px] text-emerald-300">
              ℹ️ Confirming receipt verifies physical possession and <strong>releases the Accounts Payable payment hold</strong>.
            </div>

            <div class="flex items-center justify-end gap-3 pt-3 border-t border-white/10 mt-2">
              <button type="button" class="btn-secondary text-xs py-2 px-4 cursor-pointer" onclick="window.closeDockReceivingModal()">Cancel</button>
              <button type="submit" class="btn-primary text-xs py-2 px-6 font-bold cursor-pointer">✓ Sign & Confirm Receipt →</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // 8. SIMULATED PDF AUDIT CLOSEOUT CERTIFICATE MODAL
  if (auditPdfReqId) {
    const cert = store.generateSimulatedAuditPDF(auditPdfReqId);
    modalHtml += `
      <div class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div class="glass-panel max-w-3xl w-full p-6 rounded-2xl border-2 border-gold shadow-2xl animate-fade-in my-8" style="background: rgba(8, 17, 28, 0.98);">
          <div class="flex items-center justify-between pb-3 border-b border-gold/20 mb-4">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-luxury text-gold">Official Closeout Document</span>
              <span class="badge-gold text-[10px] font-mono">${cert?.docId}</span>
            </div>
            <button class="text-slate-400 hover:text-white bg-transparent border-none text-lg cursor-pointer" onclick="window.closeAuditPDFModal()">✕</button>
          </div>

          <div class="max-h-[70vh] overflow-y-auto p-2 rounded-xl bg-navy-950 border border-white/10">
            ${cert?.htmlMarkup || '<div class="p-8 text-center text-slate-400">Certificate not available.</div>'}
          </div>

          <div class="flex items-center justify-between pt-4 mt-3 border-t border-white/10 flex-wrap gap-2">
            <span class="text-xs text-slate-400">Cryptographically Signed & Sealed by Hotel Capitol ERP</span>
            <div class="flex items-center gap-2">
              <button class="btn-secondary text-xs py-1.5 px-4 cursor-pointer" onclick="window.print()">🖨️ Print Certificate</button>
              <button class="btn-primary text-xs py-1.5 px-5 font-bold cursor-pointer" onclick="window.closeAuditPDFModal()">Done</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return modalHtml;
}
