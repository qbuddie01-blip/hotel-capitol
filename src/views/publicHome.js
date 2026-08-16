/**
 * HOTEL CAPITOL — PUBLIC WEBSITE LANDING PAGE
 * 6 Animashaun Close, Ikeja, Lagos
 */

import { renderHotelCapitolLogo } from '../assets/logo.js';
import { getIcon } from '../assets/icons.js';
import { store } from '../store/state.js';

export function renderPublicHome() {
  const state = store.getState();

  return `
    <div class="w-full">
      
      <!-- HERO SECTION -->
      <section class="relative min-h-[85vh] flex items-center justify-center text-center px-4 py-16 overflow-hidden">
        
        <!-- Background Ambience & Grid Pattern -->
        <div class="absolute inset-0 bg-cover bg-center opacity-25" style="background-image: url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80'); filter: saturate(1.2);"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-950/95 to-navy-950"></div>

        <div class="relative z-10 container-custom max-w-4xl flex flex-col items-center">
          
          <!-- Monogram Crest -->
          <div class="mb-4 animate-fade-in">
            ${renderHotelCapitolLogo({ variant: 'full', height: 120, color: 'var(--gold-400)' })}
          </div>

          <!-- Headline -->
          <h1 class="text-3xl sm:text-5xl md:text-6xl font-serif text-white font-bold leading-tight mb-4 tracking-tight-head">
            Experience Hotel Capitol, <br/>
            <span class="text-gold" style="text-shadow: 0 0 25px rgba(197, 160, 89, 0.4);">Smarter.</span>
          </h1>

          <!-- Subtitle -->
          <p class="text-base sm:text-xl text-slate-300 max-w-2xl mb-8 font-normal leading-relaxed">
            Your stay, your services, your requests — powered by <strong class="text-gold-light">Hotel Capitol AI</strong>.
          </p>

          <!-- Action CTAs -->
          <div class="flex flex-wrap items-center justify-center gap-4 mb-12">
            <button class="btn-primary py-3.5 px-7 text-base font-bold shadow-lg" onclick="window.toggleAIAssistant(true)">
              <span>🤖</span> Talk to Hotel Capitol AI
            </button>
            <button class="btn-secondary py-3.5 px-7 text-base font-semibold" onclick="window.navigatePortal('guest')">
              Explore Hotel Services & Guest Portal →
            </button>
          </div>

          <!-- Live Check-in Demo Link Generator (From Spec #7) -->
          <div class="glass-panel-gold p-6 rounded-2xl w-full max-w-xl text-left">
            <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
              <span class="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
                ${getIcon('sparkles', 16)} Instant Guest Access Link
              </span>
              <!-- Recognizable Social Contact Icons -->
              <div class="flex items-center gap-1.5">
                <span class="social-contact-pill" title="WhatsApp Instant Access Link">
                  ${getIcon('whatsapp', 16)}
                </span>
                <span class="social-contact-pill" title="SMS Access Link">
                  ${getIcon('sms', 16)}
                </span>
                <span class="social-contact-pill" title="Email Reservation Key">
                  ${getIcon('mail', 16)}
                </span>
              </div>
            </div>
            
            <p class="text-xs text-slate-300 mb-3">
              Upon reservation, guests receive a secure, 1-click personalized AI portal link without tedious app downloads.
            </p>

            <div class="flex flex-col sm:flex-row gap-2">
              <select id="instant-guest-selector" class="input-custom text-xs py-2 flex-1">
                ${state.guests.map(g => `
                  <option value="${g.id}">
                    Suite ${g.roomNumber} · ${g.name} (${g.roomType})
                  </option>
                `).join('')}
              </select>
              <button 
                class="btn-primary text-xs py-2 px-4 whitespace-nowrap"
                onclick="
                  const sel = document.getElementById('instant-guest-selector').value;
                  window.hotelCapitolStore.setActiveGuestId(sel);
                  window.navigatePortal('guest');
                "
              >
                Open My Guest Portal
              </button>
            </div>
          </div>

        </div>

      </section>

      <!-- LUXURY HOTEL AMENITIES & FEATURES -->
      <section class="py-16 bg-navy-900 border-t border-b border-gold/20">
        <div class="container-custom">
          
          <div class="text-center max-w-2xl mx-auto mb-12">
            <span class="text-xs font-bold uppercase tracking-luxury text-gold">Refined Hospitality</span>
            <h2 class="text-2xl sm:text-4xl font-serif text-white mt-1 mb-3">A New Standard in Lagos Hospitality</h2>
            <p class="text-sm text-slate-300">Situated in the prestigious heart of Ikeja, blending five-star comfort with next-generation digital concierge automation.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <!-- Feature 1 -->
            <div class="glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div class="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mb-4">
                  ${getIcon('utensils', 24)}
                </div>
                <h3 class="text-lg font-serif text-white mb-2">Gourmet Dining & Room Service</h3>
                <p class="text-xs text-slate-300 leading-relaxed mb-6">
                  Experience authentic Nigerian specialties including our Firewood Jollof Fiesta and Prime Grilled Suya, alongside international gourmet cuisine delivered directly to your suite.
                </p>
              </div>
              <div>
                <button class="public-feature-pill-btn w-full justify-between" onclick="window.navigatePortal('guest')">
                  <span>View Digital Menu</span>
                  <span class="text-gold font-bold">→</span>
                </button>
              </div>
            </div>

            <!-- Feature 2 -->
            <div class="glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div class="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mb-4">
                  ${getIcon('bot', 24)}
                </div>
                <h3 class="text-lg font-serif text-white mb-2">24/7 Hotel Capitol AI Concierge</h3>
                <p class="text-xs text-slate-300 leading-relaxed mb-6">
                  Speak or text with our native AI concierge. Request extra towels, schedule 6:00 AM breakfast, book VIP airport transit, or discover curated Ikeja hotspots.
                </p>
              </div>
              <div>
                <button class="public-feature-pill-btn w-full justify-between" onclick="window.toggleAIAssistant(true)">
                  <span>Start AI Voice Chat</span>
                  <span class="text-gold font-bold">→</span>
                </button>
              </div>
            </div>

            <!-- Feature 3 -->
            <div class="glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div class="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold mb-4">
                  ${getIcon('car', 24)}
                </div>
                <h3 class="text-lg font-serif text-white mb-2">VIP Airport Chauffeur</h3>
                <p class="text-xs text-slate-300 leading-relaxed mb-6">
                  Seamless executive transfers to Murtala Muhammed Airport (MMA2) in luxury sedans and armored SUVs with transparent upfront pricing.
                </p>
              </div>
              <div>
                <button class="public-feature-pill-btn w-full justify-between" onclick="window.navigatePortal('guest')">
                  <span>Book Executive Transit</span>
                  <span class="text-gold font-bold">→</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- HOTEL LOCATION & CONTACT -->
      <section class="py-16">
        <div class="container-custom">
          <div class="glass-panel p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div class="max-w-md">
              <span class="text-xs font-bold uppercase tracking-luxury text-gold">Prime Location</span>
              <h2 class="text-2xl font-serif text-white mt-1 mb-3">Hotel Capitol Ikeja</h2>
              <p class="text-sm text-slate-300 leading-relaxed mb-4">
                <strong>Address:</strong> 6 Animashaun Close, Ikeja, Lagos, Nigeria<br/>
                <strong>Front Desk:</strong> +234 1 890 2200 / +234 803 555 4020<br/>
                <strong>Email:</strong> guestservices@hotelcapitol.ng
              </p>
              <div class="flex items-center gap-3">
                <button class="btn-primary text-xs py-2 px-4" onclick="window.navigatePortal('guest')">
                  Access Guest Portal
                </button>
                <button class="btn-secondary text-xs py-2 px-4" onclick="window.navigatePortal('manager')">
                  Management Portal
                </button>
              </div>
            </div>

            <div class="w-full md:w-1/2 rounded-xl overflow-hidden border border-gold/30 h-56 relative bg-navy-950 flex items-center justify-center text-center p-4">
              <div class="absolute inset-0 opacity-40 bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80');"></div>
              <div class="relative z-10 glass-panel p-4 rounded-lg">
                <div class="font-serif text-white font-bold text-sm mb-1">📍 6 Animashaun Close, Ikeja</div>
                <div class="text-xs text-gold-light">15 Minutes from Murtala Muhammed Airport (MMA2)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  `;
}
