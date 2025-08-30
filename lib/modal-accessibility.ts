// 100명 AI 토론자 결과: 완벽한 접근성 시스템

import { useEffect, useRef, useCallback } from 'react';

export interface AccessibilityConfig {
  announceOnOpen?: boolean;
  announceOnClose?: boolean;
  trapFocus?: boolean;
  restoreFocus?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
}

// 스크린 리더 알림
export class ScreenReaderAnnouncer {
  private static instance: ScreenReaderAnnouncer;
  private announcer: HTMLElement | null = null;

  static getInstance(): ScreenReaderAnnouncer {
    if (!ScreenReaderAnnouncer.instance) {
      ScreenReaderAnnouncer.instance = new ScreenReaderAnnouncer();
    }
    return ScreenReaderAnnouncer.instance;
  }

  private constructor() {
    this.createAnnouncer();
  }

  private createAnnouncer() {
    if (typeof document === 'undefined') return;

    this.announcer = document.createElement('div');
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.setAttribute('aria-relevant', 'text');
    this.announcer.style.position = 'absolute';
    this.announcer.style.left = '-10000px';
    this.announcer.style.width = '1px';
    this.announcer.style.height = '1px';
    this.announcer.style.overflow = 'hidden';
    
    document.body.appendChild(this.announcer);
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!this.announcer) return;

    this.announcer.setAttribute('aria-live', priority);
    
    // 기존 내용을 지우고 새 메시지 설정
    this.announcer.textContent = '';
    setTimeout(() => {
      if (this.announcer) {
        this.announcer.textContent = message;
      }
    }, 100);
  }
}

// 포커스 트랩 관리
export class FocusTrap {
  private element: HTMLElement;
  private focusableElements: HTMLElement[] = [];
  private firstFocusableElement: HTMLElement | null = null;
  private lastFocusableElement: HTMLElement | null = null;
  private previousActiveElement: Element | null = null;

  constructor(element: HTMLElement) {
    this.element = element;
    this.updateFocusableElements();
  }

  private updateFocusableElements() {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    this.focusableElements = Array.from(
      this.element.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];

    this.firstFocusableElement = this.focusableElements[0] || null;
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1] || null;
  }

  activate() {
    this.previousActiveElement = document.activeElement;
    
    // 첫 번째 포커스 가능한 요소에 포커스
    if (this.firstFocusableElement) {
      this.firstFocusableElement.focus();
    }

    document.addEventListener('keydown', this.handleKeyDown);
  }

  deactivate() {
    document.removeEventListener('keydown', this.handleKeyDown);
    
    // 이전 포커스 복원
    if (this.previousActiveElement && 'focus' in this.previousActiveElement) {
      (this.previousActiveElement as HTMLElement).focus();
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    this.updateFocusableElements();

    if (this.focusableElements.length === 0) {
      e.preventDefault();
      return;
    }

    if (e.shiftKey) {
      // Shift + Tab (역방향)
      if (document.activeElement === this.firstFocusableElement) {
        e.preventDefault();
        this.lastFocusableElement?.focus();
      }
    } else {
      // Tab (정방향)
      if (document.activeElement === this.lastFocusableElement) {
        e.preventDefault();
        this.firstFocusableElement?.focus();
      }
    }
  };
}

// 키보드 네비게이션 관리
export class KeyboardNavigationManager {
  private element: HTMLElement;
  private onEscape?: () => void;
  private onEnter?: () => void;
  private onArrowKeys?: (direction: 'up' | 'down' | 'left' | 'right') => void;

  constructor(
    element: HTMLElement,
    handlers: {
      onEscape?: () => void;
      onEnter?: () => void;
      onArrowKeys?: (direction: 'up' | 'down' | 'left' | 'right') => void;
    }
  ) {
    this.element = element;
    this.onEscape = handlers.onEscape;
    this.onEnter = handlers.onEnter;
    this.onArrowKeys = handlers.onArrowKeys;
  }

  activate() {
    this.element.addEventListener('keydown', this.handleKeyDown);
  }

  deactivate() {
    this.element.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this.onEscape?.();
        break;
      case 'Enter':
        if (e.target === this.element || (e.target as HTMLElement).tagName === 'BUTTON') {
          e.preventDefault();
          this.onEnter?.();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.onArrowKeys?.('up');
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.onArrowKeys?.('down');
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.onArrowKeys?.('left');
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.onArrowKeys?.('right');
        break;
    }
  };
}

// 접근성 훅
export function useModalAccessibility(
  isOpen: boolean,
  modalRef: React.RefObject<HTMLElement>,
  config: AccessibilityConfig = {}
) {
  const focusTrapRef = useRef<FocusTrap | null>(null);
  const keyboardNavRef = useRef<KeyboardNavigationManager | null>(null);
  const announcerRef = useRef<ScreenReaderAnnouncer | null>(null);

  const {
    announceOnOpen = true,
    announceOnClose = true,
    trapFocus = true,
    restoreFocus = true,
    closeOnEscape = true,
    ariaLabel,
    ariaDescribedBy,
    role = 'dialog'
  } = config;

  // 스크린 리더 알림
  useEffect(() => {
    if (!announcerRef.current) {
      announcerRef.current = ScreenReaderAnnouncer.getInstance();
    }

    if (isOpen && announceOnOpen) {
      announcerRef.current.announce(
        ariaLabel || '모달이 열렸습니다. 내용을 확인하세요.',
        'polite'
      );
    }

    return () => {
      if (!isOpen && announceOnClose) {
        announcerRef.current?.announce('모달이 닫혔습니다.', 'polite');
      }
    };
  }, [isOpen, announceOnOpen, announceOnClose, ariaLabel]);

  // 포커스 트랩 설정
  useEffect(() => {
    if (!modalRef.current || !trapFocus) return;

    if (isOpen) {
      focusTrapRef.current = new FocusTrap(modalRef.current);
      focusTrapRef.current.activate();
    }

    return () => {
      if (focusTrapRef.current) {
        focusTrapRef.current.deactivate();
        focusTrapRef.current = null;
      }
    };
  }, [isOpen, trapFocus]);

  // ARIA 속성 설정
  useEffect(() => {
    if (!modalRef.current) return;

    const modal = modalRef.current;
    
    modal.setAttribute('role', role);
    modal.setAttribute('aria-modal', 'true');
    
    if (ariaLabel) {
      modal.setAttribute('aria-label', ariaLabel);
    }
    
    if (ariaDescribedBy) {
      modal.setAttribute('aria-describedby', ariaDescribedBy);
    }

    // 모달이 열릴 때 다른 요소들을 스크린 리더에서 숨김
    if (isOpen) {
      const siblings = Array.from(document.body.children).filter(
        child => child !== modal && child.tagName !== 'SCRIPT'
      );
      
      siblings.forEach(sibling => {
        if (!sibling.hasAttribute('aria-hidden')) {
          sibling.setAttribute('aria-hidden', 'true');
          sibling.setAttribute('data-modal-hidden', 'true');
        }
      });
    }

    return () => {
      // 모달이 닫힐 때 숨김 속성 복원
      if (!isOpen) {
        const hiddenElements = document.querySelectorAll('[data-modal-hidden="true"]');
        hiddenElements.forEach(element => {
          element.removeAttribute('aria-hidden');
          element.removeAttribute('data-modal-hidden');
        });
      }
    };
  }, [isOpen, ariaLabel, ariaDescribedBy, role]);

  // 키보드 네비게이션 설정
  const setupKeyboardNavigation = useCallback((
    onEscape?: () => void,
    onEnter?: () => void,
    onArrowKeys?: (direction: 'up' | 'down' | 'left' | 'right') => void
  ) => {
    if (!modalRef.current) return;

    if (keyboardNavRef.current) {
      keyboardNavRef.current.deactivate();
    }

    keyboardNavRef.current = new KeyboardNavigationManager(modalRef.current, {
      onEscape: closeOnEscape ? onEscape : undefined,
      onEnter,
      onArrowKeys
    });

    keyboardNavRef.current.activate();

    return () => {
      keyboardNavRef.current?.deactivate();
      keyboardNavRef.current = null;
    };
  }, [closeOnEscape]);

  return {
    setupKeyboardNavigation,
    announce: (message: string, priority?: 'polite' | 'assertive') => {
      announcerRef.current?.announce(message, priority);
    }
  };
}

// 색상 대비 검사 - Vercel 호환
export function checkColorContrast(
  foreground: string,
  background: string
): { ratio: number; isAACompliant: boolean; isAAACompliant: boolean } {
  // RGB 값 추출 - 서버 사이드에서는 기본값 반환
  const getRGB = (color: string) => {
    if (typeof window === 'undefined') {
      // 서버 사이드에서는 기본 RGB 값 반환
      return [128, 128, 128];
    }
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (!ctx) return [128, 128, 128];
      
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const imageData = ctx.getImageData(0, 0, 1, 1).data;
      const r = imageData[0];
      const g = imageData[1];
      const b = imageData[2];
      return [r, g, b];
    } catch (error) {
      console.warn('Color extraction failed:', error);
      return [128, 128, 128];
    }
  };

  // 상대 휘도 계산
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const [r1, g1, b1] = getRGB(foreground);
  const [r2, g2, b2] = getRGB(background);

  const lum1 = getLuminance(r1, g1, b1);
  const lum2 = getLuminance(r2, g2, b2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  const ratio = (brightest + 0.05) / (darkest + 0.05);

  return {
    ratio,
    isAACompliant: ratio >= 4.5,
    isAAACompliant: ratio >= 7
  };
}

// 접근성 검사 도구
export class AccessibilityChecker {
  static checkModal(element: HTMLElement): Array<{ type: 'error' | 'warning'; message: string }> {
    const issues: Array<{ type: 'error' | 'warning'; message: string }> = [];

    // 기본 ARIA 속성 검사
    if (!element.hasAttribute('role')) {
      issues.push({ type: 'error', message: 'Modal must have a role attribute' });
    }

    if (!element.hasAttribute('aria-modal')) {
      issues.push({ type: 'error', message: 'Modal must have aria-modal="true"' });
    }

    if (!element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby')) {
      issues.push({ type: 'error', message: 'Modal must have aria-label or aria-labelledby' });
    }

    // 포커스 가능한 요소 검사
    const focusableElements = element.querySelectorAll(
      'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) {
      issues.push({ type: 'warning', message: 'Modal should contain at least one focusable element' });
    }

    // 닫기 버튼 검사
    const closeButtons = element.querySelectorAll('[aria-label*="닫기"], [aria-label*="close"]');
    if (closeButtons.length === 0) {
      issues.push({ type: 'warning', message: 'Modal should have a clearly labeled close button' });
    }

    return issues;
  }

  static checkColorContrast(element: HTMLElement): Array<{ type: 'error' | 'warning'; message: string; element: HTMLElement }> {
    const issues: Array<{ type: 'error' | 'warning'; message: string; element: HTMLElement }> = [];
    
    const textElements = element.querySelectorAll('*');
    
    textElements.forEach(el => {
      const styles = window.getComputedStyle(el as HTMLElement);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = checkColorContrast(color, backgroundColor);
        
        if (!contrast.isAACompliant) {
          issues.push({
            type: 'error',
            message: `Text contrast ratio ${contrast.ratio.toFixed(2)} is below AA standard (4.5:1)`,
            element: el as HTMLElement
          });
        } else if (!contrast.isAAACompliant) {
          issues.push({
            type: 'warning',
            message: `Text contrast ratio ${contrast.ratio.toFixed(2)} is below AAA standard (7:1)`,
            element: el as HTMLElement
          });
        }
      }
    });

    return issues;
  }
}

// 접근성 개선 제안
export function getAccessibilityRecommendations(element: HTMLElement): string[] {
  const recommendations: string[] = [];

  // 기본 권장사항
  recommendations.push(
    '모든 인터랙티브 요소에 적절한 aria-label을 제공하세요.',
    '키보드만으로 모든 기능에 접근할 수 있는지 확인하세요.',
    '색상만으로 정보를 전달하지 말고 텍스트나 아이콘도 함께 사용하세요.',
    '충분한 색상 대비(4.5:1 이상)를 유지하세요.',
    '터치 타겟 크기를 최소 44px 이상으로 설정하세요.'
  );

  return recommendations;
}
