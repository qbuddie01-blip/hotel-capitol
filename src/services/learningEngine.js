/**
 * HOTEL CAPITOL AI — TOLANI GUEST RESPONSE LEARNING ENGINE
 * 6 Animashaun Close, Ikeja, Lagos
 * 
 * ADDITIVE ARCHITECTURE:
 * GUEST INTERACTION → CONVERSATION EVENT → INTENT DETECTION → SERVICE ACTION → GUEST RESPONSE → OUTCOME
 * → LEARNING SIGNAL → PATTERN ANALYSIS → AI IMPROVEMENT SUGGESTION → HOTEL ADMIN REVIEW (APPROVE/REJECT)
 * → PRODUCTION KNOWLEDGE UPDATE
 * 
 * STRICT PROTECTED RULE:
 * Guest conversations NEVER directly rewrite production business rules, prices, menus, or service routing.
 * All production knowledge updates require explicit Hotel Capitol Administrator approval.
 */

import { store } from '../store/state.js';

export class TolaniLearningEngine {
  constructor() {
    this.sessionCache = new Map();
  }

  /**
   * Log an interaction event into the state store
   */
  logInteractionEvent(data) {
    const settings = store.getState().learningSettings || { enabled: true };
    if (!settings.enabled) return;

    const guest = store.getActiveGuest();
    const guestId = data.guestId || (guest ? guest.id : 'GUEST-ANON');
    const roomNumber = data.roomNumber || (guest ? guest.roomNumber : '402');
    const sessionId = data.sessionId || `SESS-${new Date().toISOString().slice(0, 10)}-${roomNumber}`;

    const event = {
      id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      timeFormatted: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      guestId,
      roomNumber,
      sessionId,
      activeService: data.activeService || 'GENERAL',
      detectedIntent: data.detectedIntent || 'GENERAL_INQUIRY',
      guestMessage: data.guestMessage || '',
      aiResponse: data.aiResponse || '',
      uiAction: data.uiAction || null,
      selectedOptions: data.selectedOptions || [],
      rejectedOptions: data.rejectedOptions || [],
      conversationState: data.conversationState || 'COMPLETED',
      outcome: data.outcome || 'SUCCESSFUL', // 'SUCCESSFUL' | 'CORRECTED' | 'ABANDONED' | 'FAILED' | 'ESCALATED'
      correction: data.correction || null,
      satisfactionSignal: data.satisfactionSignal || null, // 1-5 or 'YES'/'NO'
      isAnalyzed: false
    };

    // Store in global state
    store.addInteractionLog(event);

    // Auto-analyze pattern if enabled
    if (settings.autoAnalyze !== false) {
      this.analyzeInteraction(event);
    }

    return event;
  }

  /**
   * Record a guest correction
   */
  recordCorrection(guestMessage, wrongIntent, correctIntent, service, roomNumber) {
    const log = {
      guestMessage,
      detectedIntent: wrongIntent,
      outcome: 'CORRECTED',
      activeService: service,
      roomNumber,
      correction: {
        wrongIntent,
        correctIntent,
        correctionPhrase: guestMessage,
        service
      }
    };

    this.logInteractionEvent(log);
    this.createCorrectionSuggestion(guestMessage, wrongIntent, correctIntent, service);
  }

  /**
   * Create an improvement suggestion for Administrator review
   */
  createCorrectionSuggestion(phraseOrObj, wrongIntent, correctIntent, service) {
    let phrase, currentClass, targetIntent, serv, evidence, reason, roomNumber;
    if (typeof phraseOrObj === 'object' && phraseOrObj !== null) {
      phrase = phraseOrObj.phrase;
      currentClass = phraseOrObj.observedIntent || phraseOrObj.wrongIntent || phraseOrObj.currentClassification;
      targetIntent = phraseOrObj.correctedIntent || phraseOrObj.correctIntent || phraseOrObj.proposedTargetIntent || phraseOrObj.recommendedClassification;
      serv = phraseOrObj.serviceArea || phraseOrObj.service || 'GENERAL';
      evidence = phraseOrObj.evidenceSnippet;
      reason = phraseOrObj.reason || phraseOrObj.explanation;
      roomNumber = phraseOrObj.roomNumber;
    } else {
      phrase = phraseOrObj;
      currentClass = wrongIntent;
      targetIntent = correctIntent;
      serv = service;
    }

    if (!phrase) return null;

    const existing = (store.getState().learningSuggestions || []).find(
      s => s.phrase && s.phrase.toLowerCase() === phrase.toLowerCase() && s.status === 'PENDING_REVIEW'
    );

    if (existing) {
      // Increment count and evidence
      store.updateLearningSuggestion(existing.id, {
        occurrenceCount: (existing.occurrenceCount || 1) + 1,
        lastObserved: new Date().toISOString()
      });
      return existing;
    }

    const suggestion = {
      id: `SUG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      category: 'MISUNDERSTOOD_REQUEST',
      service: serv,
      serviceArea: serv,
      title: `Learned Phrase: "${phrase}"`,
      phrase,
      currentClassification: typeof currentClass === 'object' && currentClass !== null ? (currentClass.intent || JSON.stringify(currentClass)) : (currentClass || 'UNKNOWN'),
      recommendedClassification: targetIntent,
      proposedTargetIntent: targetIntent,
      explanation: reason || `Guest phrase "${phrase}" should be routed to ${targetIntent}.`,
      recommendationText: reason || `Add phrase "${phrase}" to ${targetIntent} intent in ${serv} service.`,
      evidenceSnippet: evidence || `Guest correction observed: "${phrase}" (Previously matched as ${currentClass}).`,
      confidenceScore: 0.94,
      roomNumber: roomNumber || '204',
      occurrenceCount: 1,
      firstObserved: new Date().toISOString(),
      lastObserved: new Date().toISOString(),
      status: 'PENDING_REVIEW', // 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'
      reviewedBy: null,
      reviewedAt: null,
      impact: 'HIGH'
    };

    store.addLearningSuggestion(suggestion);
    return suggestion;
  }

  /**
   * Pattern analysis on logged interaction
   */
  analyzeInteraction(event) {
    const q = (event.guestMessage || '').toLowerCase().trim();
    if (!q) return;

    // Pattern 1: Luggage vs Transportation Confusion Detection
    if ((q.includes('bag') || q.includes('luggage') || q.includes('suitcase') || q.includes('carry')) && 
        (event.detectedIntent === 'VIP_TRANSPORTATION' || event.activeService === 'VIP_TRANSPORTATION')) {
      this.createCorrectionSuggestion(event.guestMessage, 'VIP_TRANSPORTATION', 'LUGGAGE_ASSISTANCE', 'CONCIERGE_PORTER');
    }

    // Pattern 2: Food intent variations
    if ((q.includes('hungry') || q.includes('something to eat') || q.includes('dinner') || q.includes('lunch') || q.includes('see the menu')) &&
        event.detectedIntent !== 'ORDER_FOOD') {
      this.createCorrectionSuggestion(event.guestMessage, event.detectedIntent, 'ORDER_FOOD', 'RESTAURANT');
    }

    // Pattern 3: Breakfast early timing pattern
    if (q.includes('breakfast') && (q.includes('early') || q.includes('5am') || q.includes('5:30') || q.includes('6am'))) {
      this.createObservationSuggestion(
        'EARLY_BREAKFAST_DEMAND',
        'BREAKFAST',
        event.guestMessage,
        'Guests frequently request early breakfast preparation before standard 06:00 AM window.'
      );
    }
  }

  /**
   * Create an observation / insight suggestion for management
   */
  createObservationSuggestion(category, service, phrase, recommendationText) {
    const existing = (store.getState().learningSuggestions || []).find(
      s => s.category === category && s.status === 'PENDING_REVIEW'
    );

    if (existing) {
      store.updateLearningSuggestion(existing.id, {
        occurrenceCount: (existing.occurrenceCount || 1) + 1,
        lastObserved: new Date().toISOString()
      });
      return;
    }

    const suggestion = {
      id: `SUG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      category,
      service,
      phrase,
      currentClassification: 'INSIGHT',
      recommendedClassification: 'ACTION_RECOMMENDED',
      recommendationText,
      evidenceSnippet: `Observed query: "${phrase}".`,
      occurrenceCount: 1,
      firstObserved: new Date().toISOString(),
      lastObserved: new Date().toISOString(),
      status: 'PENDING_REVIEW',
      reviewedBy: null,
      reviewedAt: null,
      impact: 'MEDIUM'
    };

    store.addLearningSuggestion(suggestion);
  }

  /**
   * Record guest preference signal
   */
  recordGuestPreference(guestId, category, preferenceItem) {
    const guest = store.getState().guests.find(g => g.id === guestId);
    if (!guest) return;

    store.addGuestPreference(guestId, {
      category, // 'BREAKFAST' | 'DRINK' | 'VEHICLE' | 'DINING'
      item: preferenceItem,
      recordedAt: new Date().toISOString()
    });
  }

  /**
   * Record an abandoned workflow
   */
  recordAbandonedWorkflow(workflowType, lastStep, guestId, details = '') {
    const guest = store.getActiveGuest();
    const gid = guestId || (guest ? guest.id : 'GUEST-402');
    const roomNumber = guest ? guest.roomNumber : '402';

    store.recordAbandonedFlow({
      id: `ABN-${Date.now()}`,
      timestamp: new Date().toISOString(),
      guestId: gid,
      roomNumber,
      workflowType, // 'RESTAURANT_ORDER' | 'VIP_TRANSPORTATION' | 'BREAKFAST' | 'PORTER'
      lastStep,
      details,
      possibleUxIssue: workflowType === 'RESTAURANT_ORDER' ? 'REVIEW_ORDER_DISCOVERY' : 'STEP_ABANDONMENT'
    });
  }

  /**
   * Record guest post-service feedback
   */
  recordServiceFeedback(serviceType, rating, satisfaction, issue = null, comment = '') {
    const guest = store.getActiveGuest();
    const guestId = guest ? guest.id : 'GUEST-402';
    const roomNumber = guest ? guest.roomNumber : '402';

    const feedback = {
      id: `FDB-${Date.now()}`,
      timestamp: new Date().toISOString(),
      guestId,
      guestName: guest ? guest.name : 'Resident Guest',
      roomNumber,
      serviceType, // 'RESTAURANT' | 'VIP_TRANSPORTATION' | 'BREAKFAST' | 'PORTER' | 'HOUSEKEEPING'
      rating, // 1-5
      satisfaction, // 'YES' | 'NO' | 'SATISFIED' | 'UNSATISFIED'
      issue, // 'DELIVERY_DELAY' | 'COLD_FOOD' | 'DRIVER_DELAY' | 'MISSING_ITEM' | null
      comment
    };

    store.recordFeedback(feedback);

    // If negative feedback, log learning signal for management
    if (rating <= 2 || satisfaction === 'NO' || issue) {
      this.createObservationSuggestion(
        'SERVICE_COMPLAINT',
        serviceType,
        comment || issue || 'Service dissatisfaction',
        `Guest in Suite #${roomNumber} reported ${issue || 'service dissatisfaction'} for ${serviceType}. Staff escalation recommended.`
      );
    }
  }

  /**
   * Administrator Approval Action: Approves a suggestion and creates a Version-Controlled Knowledge Update
   */
  approveSuggestion(suggestionId, adminName = 'Hotel Administrator') {
    const state = store.getState();
    const suggestion = (state.learningSuggestions || []).find(s => s.id === suggestionId);
    if (!suggestion) return false;

    const updateCount = (state.approvedKnowledgeUpdates || []).length + 1;
    const updateCode = `LEARNING UPDATE #${String(updateCount).padStart(4, '0')}`;

    const updateRecord = {
      id: `KUP-${Date.now()}`,
      updateCode,
      suggestionId: suggestion.id,
      category: suggestion.category,
      service: suggestion.service,
      approvedPhrase: suggestion.phrase,
      mappedIntent: suggestion.recommendedClassification,
      approvedBy: adminName,
      timestamp: new Date().toISOString(),
      dateFormatted: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'ACTIVE'
    };

    // Update suggestion status
    store.updateLearningSuggestion(suggestionId, {
      status: 'APPROVED',
      reviewedBy: adminName,
      reviewedAt: new Date().toISOString(),
      knowledgeUpdateCode: updateCode
    });

    // Add to approved updates list
    store.addApprovedKnowledgeUpdate(updateRecord);

    // If it's an intent variation, add to state's active approved phrases
    if (suggestion.category === 'MISUNDERSTOOD_REQUEST' || suggestion.recommendedClassification) {
      store.addApprovedLearnedPhrase({
        phrase: suggestion.phrase.toLowerCase().trim(),
        intent: suggestion.recommendedClassification,
        service: suggestion.service,
        updateCode
      });
    }

    return {
      success: true,
      knowledgeUpdate: {
        id: updateRecord.id,
        updateNumber: updateRecord.updateCode,
        ...updateRecord
      }
    };
  }

  /**
   * Administrator Reject Action
   */
  rejectSuggestion(suggestionId, adminName = 'Hotel Administrator', reason = 'Does not align with hotel policy') {
    store.updateLearningSuggestion(suggestionId, {
      status: 'REJECTED',
      reviewedBy: adminName,
      reviewedAt: new Date().toISOString(),
      rejectionReason: reason
    });
    return { success: true };
  }

  /**
   * Administrator Rollback Action
   */
  rollbackKnowledgeUpdate(updateId, adminName = 'Hotel Administrator') {
    const state = store.getState();
    const update = (state.approvedKnowledgeUpdates || []).find(u => u.id === updateId);
    if (!update) return { success: false, error: 'Update not found' };

    store.rollbackKnowledgeUpdate(updateId, adminName);
    return { success: true, updateId };
  }

  /**
   * Interaction Analytics Aggregator
   */
  getAnalyticsSummary() {
    const state = store.getState();
    const logs = state.interactionLogs || [];
    const suggestions = state.learningSuggestions || [];
    const updates = state.approvedKnowledgeUpdates || [];
    const feedbacks = state.serviceFeedbacks || [];
    const abandoned = state.abandonedWorkflows || [];

    const totalConversations = logs.length;
    const successfulConversations = logs.filter(l => l.outcome === 'SUCCESSFUL').length;
    const correctedConversations = logs.filter(l => l.outcome === 'CORRECTED').length;
    const failedConversations = logs.filter(l => l.outcome === 'FAILED').length;
    const escalatedConversations = logs.filter(l => l.outcome === 'ESCALATED').length;

    // Service Breakdown
    const serviceBreakdown = {
      RESTAURANT: logs.filter(l => l.activeService === 'RESTAURANT').length,
      BREAKFAST: logs.filter(l => l.activeService === 'BREAKFAST').length,
      CONCIERGE_PORTER: logs.filter(l => l.activeService === 'CONCIERGE_PORTER').length,
      VIP_TRANSPORTATION: logs.filter(l => l.activeService === 'VIP_TRANSPORTATION').length,
      HOUSEKEEPING: logs.filter(l => l.activeService === 'HOUSEKEEPING').length,
      FRONT_DESK: logs.filter(l => l.activeService === 'FRONT_DESK').length
    };

    // Feedback score
    const avgRating = feedbacks.length > 0 
      ? (feedbacks.reduce((acc, f) => acc + (f.rating || 5), 0) / feedbacks.length).toFixed(1)
      : '4.9';

    return {
      totalConversations,
      totalLogs: totalConversations,
      successfulConversations,
      correctedConversations,
      totalCorrections: correctedConversations,
      failedConversations,
      escalatedConversations,
      successRate: totalConversations > 0 ? Math.round((successfulConversations / totalConversations) * 100) : 98,
      abandonedWorkflowsCount: abandoned.length,
      serviceBreakdown,
      pendingSuggestionsCount: suggestions.filter(s => s.status === 'PENDING_REVIEW').length,
      approvedUpdatesCount: updates.length,
      averageSatisfactionScore: avgRating,
      totalFeedbackResponses: feedbacks.length
    };
  }

  exportData() {
    const state = store.getState();
    const data = {
      exportedAt: new Date().toISOString(),
      hotelName: 'Hotel Capitol',
      address: '6 Animashaun Close, Surulere / Ikeja, Lagos',
      engineVersion: 'Tolani Continuous Intelligence V2.0',
      interactionLogs: state.interactionLogs || [],
      learningSuggestions: state.learningSuggestions || [],
      approvedKnowledgeUpdates: state.approvedKnowledgeUpdates || [],
      approvedLearnedPhrases: state.approvedLearnedPhrases || [],
      serviceFeedbacks: state.serviceFeedbacks || [],
      abandonedWorkflows: state.abandonedWorkflows || [],
      analyticsSummary: this.getAnalyticsSummary()
    };
    return JSON.stringify(data, null, 2);
  }
}

export const learningEngine = new TolaniLearningEngine();
