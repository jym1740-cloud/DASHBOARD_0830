'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NativeModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  showCloseButton?: boolean;
  showMoreButton?: boolean;
  onBack?: () => void;
  onMore?: () => void;
  fullScreen?: boolean;
  preventClose?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
}

interface NativeModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface NativeModalContentProps {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
}

interface NativeModalFooterProps {
  children: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

// 제스처 감지를 위한 훅
function useSwipeGesture(onSwipeDown: () => void, threshold = 100) {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setCurrentY(e.touches[0].clientY);
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    
    const deltaY = currentY - startY;
    if (deltaY > threshold) {
      onSwipeDown();
    }
    
    setIsDragging(false);
    setStartY(0);
    setCurrentY(0);
  }, [isDragging, currentY, startY, threshold, onSwipeDown]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isDragging,
    dragOffset: isDragging ? Math.max(0, currentY - startY) : 0
  };
}

// 메인 모달 컴포넌트
export function NativeModal({
  open,
  onClose,
  children,
  title,
  subtitle,
  showBackButton = false,
  showCloseButton = true,
  showMoreButton = false,
  onBack,
  onMore,
  fullScreen = true,
  preventClose = false,
  className = '',
  headerClassName = '',
  contentClassName = '',
  footerClassName = ''
}: NativeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 스와이프 제스처
  const { handleTouchStart, handleTouchMove, handleTouchEnd, isDragging, dragOffset } = useSwipeGesture(() => {
    if (!preventClose) {
      onClose();
    }
  });

  // 마운트 체크
  useEffect(() => {
    setMounted(true);
  }, []);

  // 키보드 이벤트 처리
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventClose) {
        onClose();
      }
      if (e.key === 'ArrowLeft' && showBackButton && onBack) {
        onBack();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, onBack, showBackButton, preventClose]);

  // 포커스 트랩
  useEffect(() => {
    if (!open || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => document.removeEventListener('keydown', handleTabKey);
  }, [open]);

  // 바디 스크롤 방지
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // 스크롤바 보정
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [open]);

  // 애니메이션 처리
  useEffect(() => {
    if (open) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!mounted || !open) return null;

  const modalContent = (
    <div
      className={`fixed inset-0 z-50 flex flex-col ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={subtitle ? 'modal-subtitle' : undefined}
    >
      {/* 오버레이 */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'opacity-0' : 'opacity-30'
        }`}
        onClick={!preventClose ? onClose : undefined}
      />

      {/* 모달 컨테이너 */}
      <div
        ref={modalRef}
        className={`relative flex flex-col bg-white transition-all duration-300 ease-out ${
          fullScreen 
            ? 'h-full w-full' 
            : 'mx-4 my-8 rounded-t-3xl flex-1'
        } ${
          isAnimating 
            ? 'transform translate-y-full opacity-0' 
            : 'transform translate-y-0 opacity-100'
        }`}
        style={{
          transform: isDragging 
            ? `translateY(${Math.min(dragOffset, 200)}px)` 
            : isAnimating 
              ? 'translateY(100%)' 
              : 'translateY(0)',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 스와이프 인디케이터 */}
        {!fullScreen && (
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
        )}

        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// 헤더 컴포넌트
export function NativeModalHeader({ 
  children, 
  className = '' 
}: NativeModalHeaderProps) {
  return (
    <div className={`flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white ${className}`}>
      {children}
    </div>
  );
}

// 헤더 타이틀 컴포넌트
export function NativeModalTitle({ 
  children,
  showBackButton = false,
  showCloseButton = true,
  showMoreButton = false,
  onBack,
  onClose,
  onMore,
  className = ''
}: {
  children: React.ReactNode;
  showBackButton?: boolean;
  showCloseButton?: boolean;
  showMoreButton?: boolean;
  onBack?: () => void;
  onClose?: () => void;
  onMore?: () => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* 좌측 버튼 */}
      <div className="flex items-center">
        {showBackButton && onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 -ml-2 mr-2"
            aria-label="뒤로가기"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* 중앙 타이틀 */}
      <div className="flex-1 text-center">
        <h2 id="modal-title" className="text-lg font-semibold text-gray-900 truncate">
          {children}
        </h2>
      </div>

      {/* 우측 버튼들 */}
      <div className="flex items-center gap-1">
        {showMoreButton && onMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMore}
            className="p-2"
            aria-label="더보기"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        )}
        
        {showCloseButton && onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 -mr-2"
            aria-label="닫기"
          >
            <X className="h-6 w-6" />
          </Button>
        )}
      </div>
    </div>
  );
}

// 콘텐츠 컴포넌트
export function NativeModalContent({ 
  children, 
  className = '',
  scrollable = true 
}: NativeModalContentProps) {
  return (
    <div className={`flex-1 ${scrollable ? 'overflow-y-auto' : 'overflow-hidden'} ${className}`}>
      <div className="px-4 py-4">
        {children}
      </div>
    </div>
  );
}

// 푸터 컴포넌트
export function NativeModalFooter({ 
  children, 
  className = '',
  sticky = true 
}: NativeModalFooterProps) {
  return (
    <div className={`flex-shrink-0 px-4 py-4 bg-white border-t border-gray-200 ${
      sticky ? 'sticky bottom-0' : ''
    } ${className}`}>
      {children}
    </div>
  );
}

// 편의 컴포넌트들
export function NativeModalActions({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`flex gap-3 ${className}`}>
      {children}
    </div>
  );
}

export function NativeModalSection({ 
  title, 
  children, 
  className = '' 
}: { 
  title?: string; 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`mb-6 ${className}`}>
      {title && (
        <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      )}
      {children}
    </div>
  );
}
