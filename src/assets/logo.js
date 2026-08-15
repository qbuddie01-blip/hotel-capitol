/**
 * HOTEL CAPITOL — Official Branding Assets
 * 6 Animashaun Close, Ikeja, Lagos
 * Authentic High-Resolution Brand Identity Logo
 */

export function renderHotelCapitolLogo(options = {}) {
  const { 
    variant = 'full', // 'full' | 'monogram' | 'horizontal'
    height = 48,
    color = '#c5a059',
    textColor = '#ffffff',
    className = ''
  } = options;

  const baseHeight = Math.round(height * 1.5);

  if (variant === 'horizontal') {
    const navLogoHeight = Math.min(height, 36);
    return `
      <div class="inline-flex items-center ${className}" style="padding-top: 4px; padding-bottom: 2px;">
        <img 
          src="/src/assets/hotel-capitol-logo.png" 
          alt="Hotel Capitol Logo" 
          style="height: ${navLogoHeight}px; max-height: 36px; width: auto; object-fit: contain; filter: drop-shadow(0 2px 8px rgba(220, 173, 84, 0.5)); display: block;"
        />
      </div>
    `;
  }

  if (variant === 'monogram') {
    return `
      <div class="inline-flex items-center justify-center ${className}" style="height: ${baseHeight}px;">
        <img 
          src="/src/assets/hotel-capitol-logo.png" 
          alt="Hotel Capitol Monogram" 
          style="height: ${baseHeight}px; width: auto; object-fit: contain; filter: drop-shadow(0 4px 16px rgba(220, 173, 84, 0.6));"
        />
      </div>
    `;
  }

  // Default 'full' stacked luxury logo without extra text
  return `
    <div class="flex flex-col items-center text-center ${className}">
      <img 
        src="/src/assets/hotel-capitol-logo.png" 
        alt="Hotel Capitol Official Logo" 
        style="height: ${baseHeight}px; max-width: 92vw; width: auto; object-fit: contain; filter: drop-shadow(0 8px 25px rgba(220, 173, 84, 0.65));"
      />
    </div>
  `;
}
