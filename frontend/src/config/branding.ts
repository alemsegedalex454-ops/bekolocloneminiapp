/**
 * BRANDING CONFIGURATION
 * =====================
 * Change this file to customize your store's appearance.
 * This is the ONLY file you need to modify for branding.
 */

export const branding = {
  // Store identity
  storeName: 'Bekollo',
  storeTagline: 'ዋጋው! Online Shop',
  botUsername: '@bekollo_bot',
  welcomeEmoji: '🤩',
  
  // Welcome screen
  welcomeTitle: 'Welcome',
  welcomeSubtitle: 'Continue with your Telegram account to shop, save items, and track your orders.',
  welcomeButton: 'CONTINUE WITH TELEGRAM',
  welcomeDisclaimer: 'We only use your Telegram name and photo to personalize your experience.',

  // Currency
  currency: {
    symbol: 'Br',
    code: 'ETB',
    position: 'after' as 'before' | 'after', // 'before' or 'after'
  },

  // Colors
  colors: {
    primary: '#F5A623',        // Yellow/gold — CTA buttons
    primaryHover: '#E09510',
    primaryText: '#1A1A1A',    // Text on primary buttons
    secondary: '#1A1A1A',      // Dark elements
    secondaryHover: '#333333',
    accent: '#4A90D9',         // Links, active elements
    background: '#FFFFFF',     // Page background
    surface: '#F8F9FA',        // Card/section backgrounds
    surfaceHover: '#F1F3F5',
    border: '#EEEEEE',
    borderDark: '#DDDDDD',
    text: '#1A1A1A',           // Primary text
    textSecondary: '#6B7280',  // Secondary text
    textMuted: '#9CA3AF',      // Muted text
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },

  // Typography
  fonts: {
    heading: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },

  // Cart button style
  cartButton: {
    text: 'Cart',
    showIcon: true,
  },

  // Product card
  productCard: {
    buttonText: 'Select options',
    pricePrefix: 'From',
  },
} as const;

export type Branding = typeof branding;
