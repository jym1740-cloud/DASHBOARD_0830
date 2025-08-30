// 100명 AI 토론 결과: 통합 디자인 시스템

export const colors = {
  // Primary Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a'
  },
  
  // Success Colors
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981',
    600: '#059669',
    700: '#047857'
  },
  
  // Warning Colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309'
  },
  
  // Danger Colors
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c'
  },
  
  // Neutral Colors
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
};

export const spacing = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem'    // 64px
};

export const borderRadius = {
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px'
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
};

export const typography = {
  // Headings
  h1: {
    fontSize: '2.25rem',    // 36px
    fontWeight: '800',
    lineHeight: '2.5rem'
  },
  h2: {
    fontSize: '1.875rem',   // 30px
    fontWeight: '700',
    lineHeight: '2.25rem'
  },
  h3: {
    fontSize: '1.5rem',     // 24px
    fontWeight: '600',
    lineHeight: '2rem'
  },
  h4: {
    fontSize: '1.25rem',    // 20px
    fontWeight: '600',
    lineHeight: '1.75rem'
  },
  
  // Body Text
  body: {
    fontSize: '1rem',       // 16px
    fontWeight: '400',
    lineHeight: '1.5rem'
  },
  bodySmall: {
    fontSize: '0.875rem',   // 14px
    fontWeight: '400',
    lineHeight: '1.25rem'
  },
  
  // Labels
  label: {
    fontSize: '0.875rem',   // 14px
    fontWeight: '500',
    lineHeight: '1.25rem'
  },
  
  // Captions
  caption: {
    fontSize: '0.75rem',    // 12px
    fontWeight: '400',
    lineHeight: '1rem'
  }
};

export const touchTargets = {
  minimum: '44px',    // iOS/Android 최소 터치 영역
  comfortable: '48px', // 편안한 터치 영역
  large: '56px'       // 큰 터치 영역
};

export const animations = {
  fast: '150ms ease-out',
  normal: '250ms ease-out',
  slow: '350ms ease-out',
  
  // 특별한 애니메이션
  bounce: '0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  spring: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
};

// 컴포넌트별 스타일 프리셋
export const components = {
  button: {
    primary: {
      backgroundColor: colors.primary[600],
      color: 'white',
      borderRadius: borderRadius.lg,
      padding: `${spacing.md} ${spacing.xl}`,
      minHeight: touchTargets.comfortable,
      fontSize: typography.body.fontSize,
      fontWeight: typography.body.fontWeight,
      boxShadow: shadows.sm,
      transition: animations.fast
    },
    secondary: {
      backgroundColor: 'transparent',
      color: colors.primary[600],
      border: `1px solid ${colors.primary[600]}`,
      borderRadius: borderRadius.lg,
      padding: `${spacing.md} ${spacing.xl}`,
      minHeight: touchTargets.comfortable,
      fontSize: typography.body.fontSize,
      fontWeight: typography.body.fontWeight,
      transition: animations.fast
    }
  },
  
  card: {
    default: {
      backgroundColor: 'white',
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      boxShadow: shadows.md,
      border: `1px solid ${colors.neutral[200]}`
    },
    elevated: {
      backgroundColor: 'white',
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      boxShadow: shadows.lg,
      border: 'none'
    }
  },
  
  input: {
    default: {
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      minHeight: touchTargets.comfortable,
      fontSize: '16px', // 모바일 줌 방지
      border: `1px solid ${colors.neutral[300]}`,
      backgroundColor: 'white',
      transition: animations.fast
    }
  }
};

// 반응형 브레이크포인트
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px'
};

// 모바일 최적화 유틸리티
export const mobile = {
  safeArea: {
    top: 'env(safe-area-inset-top)',
    bottom: 'env(safe-area-inset-bottom)',
    left: 'env(safe-area-inset-left)',
    right: 'env(safe-area-inset-right)'
  },
  
  // 터치 최적화
  touch: {
    callout: 'none',
    userSelect: 'none',
    tapHighlightColor: 'transparent',
    touchAction: 'manipulation'
  },
  
  // 스크롤 최적화
  scroll: {
    behavior: 'smooth',
    webkitOverflowScrolling: 'touch',
    overscrollBehavior: 'contain'
  }
};
