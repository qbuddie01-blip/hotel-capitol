/**
 * HOTEL CAPITOL — PRODUCT WALKTHROUGH VIDEO MODAL COMPONENT
 * 6 Animashaun Close, Ikeja, Lagos
 * Allows hotel managers, investors, and stakeholders to watch the
 * comprehensive SaaS product demonstration video directly inside the app.
 */

import { getIcon } from '../assets/icons.js';

let isVideoModalOpen = false;

export function initVideoWalkthroughModal() {
  window.toggleVideoWalkthrough = (open) => {
    isVideoModalOpen = open !== undefined ? open : !isVideoModalOpen;
    renderVideoWalkthroughModal();
  };

  window.seekWalkthroughVideo = (seconds) => {
    const video = document.getElementById('walkthrough-video-el');
    if (video) {
      video.currentTime = seconds;
      video.play();
    }
  };

  renderVideoWalkthroughModal();
}

export function renderVideoWalkthroughModal() {
  const root = document.getElementById('video-walkthrough-root');
  if (!root) return;

  if (!isVideoModalOpen) {
    root.innerHTML = '';
    return;
  }

  const chapters = [
    { title: '1. Platform Intro', time: 0, label: '00:00' },
    { title: '2. Staff Portal', time: 5, label: '00:05' },
    { title: '3. Operations Dashboard', time: 10, label: '00:10' },
    { title: '4. RBAC & Organization', time: 16, label: '00:16' },
    { title: '5. AI Stock Surveillance', time: 22, label: '00:22' },
    { title: '6. Autonomous LPO & Approval', time: 28, label: '00:28' },
    { title: '7. Vendor & 7 Milestones', time: 33, label: '00:33' },
    { title: '8. AP Hold & Receiving', time: 38, label: '00:38' },
    { title: '9. Payment & Audit PDF', time: 42, label: '00:42' }
  ];

  root.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" style="background: rgba(4, 9, 15, 0.90); backdrop-filter: blur(10px);" onclick="window.toggleVideoWalkthrough(false)">
      <div class="w-full max-w-4xl bg-navy-950 border-2 border-gold rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in max-h-[95vh] sm:max-h-[90vh]" onclick="event.stopPropagation()">
        
        <!-- Header -->
        <div class="p-3.5 sm:p-4 bg-navy-900 border-b border-gold/40 flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gold/20 border border-gold/60 flex items-center justify-center text-gold text-lg">
              🎬
            </div>
            <div>
              <h3 class="font-serif text-sm sm:text-base font-bold text-white tracking-luxury">HOTEL CAPITOL — PRODUCT WALKTHROUGH VIDEO</h3>
              <div class="text-[11px] text-gold-light">Autonomous Procurement, RBAC Hierarchy & Operations Demonstration</div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <a 
              href="./hotel_capitol_product_walkthrough.webm" 
              download="Hotel_Capitol_Product_Walkthrough.webm"
              class="btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1 cursor-pointer no-underline text-gold hover:text-white"
              title="Download HD Video File"
            >
              📥 Download WebM
            </a>
            <button class="btn-icon" style="width:32px; height:32px;" onclick="window.toggleVideoWalkthrough(false)">
              ${getIcon('x', 18)}
            </button>
          </div>
        </div>

        <!-- Video Player Frame -->
        <div class="relative bg-black flex items-center justify-center overflow-hidden" style="aspect-ratio: 16/10; max-height: 58vh;">
          <video 
            id="walkthrough-video-el" 
            controls 
            autoplay 
            playsinline 
            class="w-full h-full object-contain"
            style="background: #000;"
          >
            <source src="./hotel_capitol_product_walkthrough.webm" type="video/webm">
            Your browser does not support the video tag.
          </video>
        </div>

        <!-- Chapter Jumps & Workflow Highlights Bar -->
        <div class="p-3 bg-navy-900/90 border-t border-white/10 flex flex-col gap-2">
          <div class="flex items-center justify-between text-[11px] text-slate-300">
            <strong class="text-gold uppercase tracking-wider flex items-center gap-1">
              ⚡ Quick Chapter Jumps:
            </strong>
            <span class="text-slate-400">Click any chapter to jump directly to that section</span>
          </div>

          <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
            ${chapters.map(ch => `
              <button 
                class="glass-panel text-[11px] py-1 px-2.5 rounded-lg border border-gold/30 hover:border-gold text-slate-200 hover:text-white whitespace-nowrap cursor-pointer transition-all flex items-center gap-1"
                onclick="window.seekWalkthroughVideo(${ch.time})"
              >
                <span class="text-gold font-mono">${ch.label}</span>
                <span>${ch.title}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Footer Simulation Banner -->
        <div class="px-4 py-2 bg-navy-950 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 flex-wrap gap-1">
          <span>🔒 Simulation Safe & Deterministic Demonstration Environment</span>
          <span class="font-mono text-gold-light">Hotel Capitol MVP · 6 Animashaun Close, Ikeja, Lagos</span>
        </div>

      </div>
    </div>
  `;
}
