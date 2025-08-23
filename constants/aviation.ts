// constants/aviation.ts
export const AVIATION_COLORS = {
  // Primary Colors
  GREEN: '#00FF00',
  YELLOW: '#FFFF00',
  BLUE: '#00FFFF',
  RED: '#FF0000',
  MAGENTA: '#FF00FF',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  
  // Aviation-specific colors
  GOLD: '#FFD700',        // Bright gold for aircraft symbols
  ORANGE: '#FFA500',      // Orange for wing accents
  BROWN: '#B8860B',       // Dark goldenrod for horizon shadows
  
  // Background Colors
  DARK_BG: '#0a0a0a',
  PANEL_BG: '#1a1a1a',
  SECONDARY_BG: '#2a2a2a',
  TERTIARY_BG: '#0d1117',
  
  // Border Colors
  BORDER_PRIMARY: '#333',
  BORDER_SECONDARY: '#666',
  BORDER_ACCENT: '#444',
  
  // Status Colors
  SUCCESS: '#00A86B',
  WARNING: '#FFA500',
  ERROR: '#dc2626',
  INFO: '#3B82F6',
} as const;

export const AVIATION_DIMENSIONS = {
  // Display Sizes
  PFD_WIDTH: 800,
  PFD_HEIGHT: 700,
  ND_WIDTH: 1200,
  ND_HEIGHT: 700,
  
  // Component Sizes
  BUTTON_HEIGHT: 30,
  PANEL_PADDING: 16,
  BORDER_RADIUS: 10,
  
  // Font Sizes
  FONT_SMALL: 9,
  FONT_NORMAL: 12,
  FONT_MEDIUM: 16,
  FONT_LARGE: 20,
  FONT_XLARGE: 28,
} as const;

export const AVIATION_FONTS = {
  PRIMARY: 'monospace',
  SECONDARY: 'System',
  THIRD: 'sans-serif',
} as const;

export const AVIATION_OPACITIES = {
  LOW: 0.1,
  MEDIUM: 0.3,
  HIGH: 0.7,
  FULL: 1.0,
} as const;
