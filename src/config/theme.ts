import { I18nManager, StyleProp, ViewStyle } from 'react-native';

export const COLORS = {
  primary: '#0B4F3A',         // Emerald Green (اللون الرئسي للمجلس البلدي)
  primaryDark: '#063527',     // Dark Emerald
  primaryLight: '#E8F5E9',    // Soft Light Emerald
  accent: '#D4AF37',          // Warm Gold (الذهبي الملكي)
  accentLight: '#FFF9E6',
  background: '#F8FAFC',      // Premium Soft Gray/White
  surface: '#FFFFFF',         // Card surface
  textPrimary: '#0F172A',     // Slate Dark
  textSecondary: '#475569',   // Slate Medium
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  inputBg: '#F1F5F9',
  
  // Status Colors
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Dark Overlay
  overlay: 'rgba(15, 23, 42, 0.6)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const GRADIENTS = {
  primary: ['#0B4F3A', '#137F5E'], // Rich Emerald to Vibrant Green
  accent: ['#D4AF37', '#F2D46F'],  // Classic Gold to Bright Gold
  glass: ['rgba(255,255,255,0.85)', 'rgba(255,255,255,0.4)'], // Glassmorphism base
  darkGlass: ['rgba(15,23,42,0.8)', 'rgba(15,23,42,0.6)'],
  quickAction1: ['#3B82F6', '#2563EB'], // Blue
  quickAction2: ['#EF4444', '#DC2626'], // Red
  quickAction3: ['#10B981', '#059669'], // Green
  quickAction4: ['#F59E0B', '#D97706'], // Amber
};

export const SHADOWS = {
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: {
    shadowColor: '#0B4F3A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  }
};

export const isRTL = I18nManager.isRTL;

export const RTL_FLEX_ROW: StyleProp<ViewStyle> = {
  flexDirection: isRTL ? 'row' : 'row-reverse',
};

export const RTL_TEXT_ALIGN = 'right' as const;
