'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  NativeModal, 
  NativeModalHeader, 
  NativeModalTitle, 
  NativeModalContent, 
  NativeModalFooter,
  NativeModalActions,
  NativeModalSection
} from '@/components/ui/native-modal';
import { Button } from '@/components/ui/button';
import { useModalState, AutoSaveConfig } from '@/lib/modal-state-manager';
import { useModalAccessibility } from '@/lib/modal-accessibility';
import { useModalPerformance } from '@/lib/modal-performance';
import { animateElement, AnimationType } from '@/lib/modal-animations';
import { X, ChevronLeft, Save, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface UltimateNativeModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  modalId: string;
  title?: string;
  subtitle?: string;
  
  // 네이티브 기능
  showBackButton?: boolean;
  showCloseButton?: boolean;
  onBack?: () => void;
  fullScreen?: boolean;
  preventClose?: boolean;
  
  // 애니메이션
  animationType?: AnimationType;
  
  // 상태 관리
  initialData?: any;
  autoSaveConfig?: AutoSaveConfig;
  
  // 접근성
  ariaLabel?: string;
  ariaDescribedBy?: string;
  
  // 성능
  enablePerformanceMonitoring?: boolean;
  
  // 이벤트
  onSave?: (data: any) => Promise<void>;
  onDataChange?: (data: any) => void;
  onValidationError?: (errors: Record<string, string>) => void;
}

export default function UltimateNativeModal({
  open,
  onClose,
  children,
  modalId,
  title,
  subtitle,
  showBackButton = false,
  showCloseButton = true,
  onBack,
  fullScreen = true,
  preventClose = false,
  animationType = 'cinema',
  initialData = {},
  autoSaveConfig,
  ariaLabel,
  ariaDescribedBy,
  enablePerformanceMonitoring = true,
  onSave,
  onDataChange,
  onValidationError
}: UltimateNativeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  // 상태 관리
  const {
    data,
    updateData,
    isDirty,
    isSaving,
    hasUnsavedChanges,
    validationErrors,
    save: saveState,
    restore,
    reset
  } = useModalState(modalId, initialData, autoSaveConfig);

  // 접근성
  const { setupKeyboardNavigation, announce } = useModalAccessibility(
    open,
    modalRef,
    {
      ariaLabel: ariaLabel || title,
      ariaDescribedBy,
      announceOnOpen: true,
      announceOnClose: true,
      trapFocus: true,
      closeOnEscape: !preventClose
    }
  );

  // 성능 모니터링
  const {
    startRenderMeasurement,
    endRenderMeasurement,
    measureAnimationFPS,
    metrics
  } = useModalPerformance(modalId, open);

  // 데이터 변경 알림
  useEffect(() => {
    onDataChange?.(data);
  }, [data, onDataChange]);

  // 검증 에러 알림
  useEffect(() => {
    if (Object.keys(validationErrors).length > 0) {
      onValidationError?.(validationErrors);
    }
  }, [validationErrors, onValidationError]);

  // 성능 측정 시작
  useEffect(() => {
    if (open && enablePerformanceMonitoring) {
      startRenderMeasurement();
    }
  }, [open, enablePerformanceMonitoring, startRenderMeasurement]);

  // 렌더링 완료 후 성능 측정
  useEffect(() => {
    if (open && enablePerformanceMonitoring) {
      const timer = setTimeout(() => {
        endRenderMeasurement();
        measureAnimationFPS(1000);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open, enablePerformanceMonitoring, endRenderMeasurement, measureAnimationFPS]);

  // 키보드 네비게이션 설정
  useEffect(() => {
    if (open) {
      return setupKeyboardNavigation(
        handleClose, // Escape
        undefined, // Enter
        (direction) => {
          // 화살표 키 네비게이션
          console.log('Arrow key navigation:', direction);
        }
      );
    }
  }, [open, setupKeyboardNavigation]);

  // 애니메이션 처리
  const handleAnimatedClose = useCallback(async () => {
    if (!modalRef.current) return;

    setIsAnimating(true);
    
    try {
      await animateElement(modalRef.current, animationType, 'exit');
    } finally {
      setIsAnimating(false);
      onClose();
    }
  }, [animationType, onClose]);

  // 닫기 처리 (변경사항 확인)
  const handleClose = useCallback(() => {
    if (hasUnsavedChanges && !preventClose) {
      setShowUnsavedWarning(true);
      return;
    }
    
    handleAnimatedClose();
  }, [hasUnsavedChanges, preventClose, handleAnimatedClose]);

  // 저장 처리
  const handleSave = useCallback(async () => {
    const startTime = performance.now();
    
    try {
      if (onSave) {
        await onSave(data);
      } else {
        await saveState();
      }
      
      announce('저장이 완료되었습니다.', 'polite');
      
      // 성능 측정
      if (enablePerformanceMonitoring) {
        const saveTime = performance.now() - startTime;
        console.log(`Save operation took ${saveTime.toFixed(2)}ms`);
      }
      
    } catch (error) {
      announce('저장 중 오류가 발생했습니다.', 'assertive');
      console.error('Save failed:', error);
    }
  }, [data, onSave, saveState, announce, enablePerformanceMonitoring]);

  // 복구 처리
  const handleRestore = useCallback(() => {
    const restored = restore();
    if (restored) {
      announce('이전 상태로 복구되었습니다.', 'polite');
    }
  }, [restore, announce]);

  // 리셋 처리
  const handleReset = useCallback(() => {
    reset();
    announce('초기 상태로 재설정되었습니다.', 'polite');
  }, [reset, announce]);

  // 변경사항 없이 닫기
  const handleForceClose = useCallback(() => {
    setShowUnsavedWarning(false);
    reset(); // 변경사항 버림
    handleAnimatedClose();
  }, [reset, handleAnimatedClose]);

  // 저장 후 닫기
  const handleSaveAndClose = useCallback(async () => {
    setShowUnsavedWarning(false);
    try {
      await handleSave();
      handleAnimatedClose();
    } catch (error) {
      console.error('Save failed:', error);
    }
  }, [handleSave, handleAnimatedClose]);

  if (!open) return null;

  return (
    <>
      <NativeModal
        open={open}
        onClose={handleClose}
        fullScreen={fullScreen}
        preventClose={preventClose || hasUnsavedChanges}
        className="ultimate-native-modal"
      >
        <div ref={modalRef}>
          {/* 헤더 */}
          <NativeModalHeader>
            <NativeModalTitle
              showBackButton={showBackButton}
              showCloseButton={showCloseButton}
              onBack={onBack}
              onClose={handleClose}
            >
              <div className="flex flex-col items-center">
                <span>{title}</span>
                {subtitle && (
                  <span className="text-sm text-gray-500 font-normal">
                    {subtitle}
                  </span>
                )}
              </div>
            </NativeModalTitle>
            
            {/* 상태 표시 */}
            {(isDirty || isSaving) && (
              <div className="flex items-center justify-center mt-2 gap-2">
                {isSaving && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">저장 중...</span>
                  </div>
                )}
                {isDirty && !isSaving && (
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">저장되지 않은 변경사항</span>
                  </div>
                )}
              </div>
            )}
          </NativeModalHeader>

          {/* 콘텐츠 */}
          <NativeModalContent>
            {/* 성능 메트릭 (개발 모드) */}
            {enablePerformanceMonitoring && metrics && process.env.NODE_ENV === 'development' && (
              <NativeModalSection title="성능 메트릭 (개발 모드)">
                <div className="bg-gray-100 rounded-lg p-3 text-xs space-y-1">
                  <div>렌더링: {metrics.renderTime?.toFixed(2)}ms</div>
                  <div>애니메이션 FPS: {metrics.animationFPS?.toFixed(2)}</div>
                  <div>메모리: {metrics.memoryUsage?.toFixed(2)}MB</div>
                  <div>상호작용 지연: {metrics.interactionLatency?.toFixed(2)}ms</div>
                </div>
              </NativeModalSection>
            )}

            {/* 메인 콘텐츠 */}
            <div className="modal-content-wrapper">
              {React.cloneElement(children as React.ReactElement, {
                data,
                updateData,
                validationErrors
              })}
            </div>
          </NativeModalContent>

          {/* 푸터 */}
          <NativeModalFooter>
            <NativeModalActions>
              {/* 보조 액션들 */}
              <div className="flex gap-2 flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRestore}
                  disabled={!hasUnsavedChanges}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  복구
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={!isDirty}
                >
                  초기화
                </Button>
              </div>

              {/* 주요 액션들 */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  {hasUnsavedChanges ? '취소' : '닫기'}
                </Button>
                
                <Button
                  onClick={handleSave}
                  disabled={!isDirty || isSaving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      저장
                    </>
                  )}
                </Button>
              </div>
            </NativeModalActions>
          </NativeModalFooter>
        </div>
      </NativeModal>

      {/* 변경사항 경고 모달 */}
      <NativeModal
        open={showUnsavedWarning}
        onClose={() => setShowUnsavedWarning(false)}
        fullScreen={false}
        className="z-60"
      >
        <NativeModalHeader>
          <NativeModalTitle showCloseButton={false}>
            저장되지 않은 변경사항
          </NativeModalTitle>
        </NativeModalHeader>
        
        <NativeModalContent>
          <div className="text-center py-4">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
            <p className="text-gray-700 mb-2">
              저장하지 않은 변경사항이 있습니다.
            </p>
            <p className="text-sm text-gray-500">
              변경사항을 저장하지 않고 나가시겠습니까?
            </p>
          </div>
        </NativeModalContent>
        
        <NativeModalFooter>
          <NativeModalActions>
            <Button
              variant="outline"
              onClick={() => setShowUnsavedWarning(false)}
              className="flex-1"
            >
              계속 편집
            </Button>
            
            <Button
              variant="outline"
              onClick={handleSaveAndClose}
              className="flex-1 border-blue-200 text-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              저장 후 닫기
            </Button>
            
            <Button
              onClick={handleForceClose}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              변경사항 버림
            </Button>
          </NativeModalActions>
        </NativeModalFooter>
      </NativeModal>
    </>
  );
}
