// 100명 AI 토론자 결과: 스마트 상태 관리 시스템

import { useCallback, useEffect, useRef, useState } from 'react';

export interface ModalState {
  id: string;
  data: any;
  isDirty: boolean;
  lastSaved: Date;
  autoSaveEnabled: boolean;
  validationErrors: Record<string, string>;
}

export interface AutoSaveConfig {
  enabled: boolean;
  interval: number; // milliseconds
  onSave: (data: any) => Promise<void>;
  onError: (error: Error) => void;
}

// 로컬 스토리지 키 생성
function getStorageKey(modalId: string): string {
  return `modal_state_${modalId}`;
}

// 상태 저장 - Vercel 호환
function saveStateToStorage(modalId: string, state: any): void {
  if (typeof window === 'undefined') return;
  
  try {
    const stateWithTimestamp = {
      ...state,
      timestamp: Date.now(),
      version: '1.0'
    };
    localStorage.setItem(getStorageKey(modalId), JSON.stringify(stateWithTimestamp));
  } catch (error) {
    console.warn('Failed to save modal state to localStorage:', error);
  }
}

// 상태 복구 - Vercel 호환
function loadStateFromStorage(modalId: string): any | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(getStorageKey(modalId));
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    
    // 24시간 이상 된 데이터는 무시
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - parsed.timestamp > maxAge) {
      localStorage.removeItem(getStorageKey(modalId));
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn('Failed to load modal state from localStorage:', error);
    return null;
  }
}

// 상태 삭제 - Vercel 호환
function clearStateFromStorage(modalId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(getStorageKey(modalId));
  } catch (error) {
    console.warn('Failed to clear modal state from localStorage:', error);
  }
}

// 스마트 모달 상태 관리 훅
export function useModalState<T = any>(
  modalId: string,
  initialData: T,
  autoSaveConfig?: AutoSaveConfig
) {
  const [data, setData] = useState<T>(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const initialDataRef = useRef(initialData);

  // 데이터 변경 감지
  const updateData = useCallback((newData: Partial<T> | ((prev: T) => T)) => {
    setData(prev => {
      const updated = typeof newData === 'function' ? newData(prev) : { ...prev, ...newData };
      
      // 변경사항 감지
      const hasChanges = JSON.stringify(updated) !== JSON.stringify(initialDataRef.current);
      setIsDirty(hasChanges);
      setHasUnsavedChanges(hasChanges);

      // 자동 저장 스케줄링
      if (autoSaveConfig?.enabled && hasChanges) {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        
        autoSaveTimeoutRef.current = setTimeout(() => {
          performAutoSave(updated);
        }, autoSaveConfig.interval);
      }

      // 로컬 스토리지에 임시 저장
      saveStateToStorage(modalId, updated);

      return updated;
    });
  }, [modalId, autoSaveConfig]);

  // 자동 저장 실행
  const performAutoSave = useCallback(async (dataToSave: T) => {
    if (!autoSaveConfig?.onSave) return;

    try {
      setIsSaving(true);
      await autoSaveConfig.onSave(dataToSave);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      // 성공적으로 저장되면 로컬 스토리지 클리어
      clearStateFromStorage(modalId);
    } catch (error) {
      console.error('Auto-save failed:', error);
      autoSaveConfig.onError?.(error as Error);
    } finally {
      setIsSaving(false);
    }
  }, [autoSaveConfig, modalId]);

  // 수동 저장
  const save = useCallback(async (): Promise<boolean> => {
    if (!autoSaveConfig?.onSave) return false;

    try {
      setIsSaving(true);
      await autoSaveConfig.onSave(data);
      setLastSaved(new Date());
      setIsDirty(false);
      setHasUnsavedChanges(false);
      initialDataRef.current = data;
      
      // 성공적으로 저장되면 로컬 스토리지 클리어
      clearStateFromStorage(modalId);
      return true;
    } catch (error) {
      console.error('Save failed:', error);
      autoSaveConfig.onError?.(error as Error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [data, autoSaveConfig, modalId]);

  // 상태 복구
  const restore = useCallback(() => {
    const savedState = loadStateFromStorage(modalId);
    if (savedState) {
      setData(savedState);
      setIsDirty(true);
      setHasUnsavedChanges(true);
      return true;
    }
    return false;
  }, [modalId]);

  // 상태 리셋
  const reset = useCallback(() => {
    setData(initialDataRef.current);
    setIsDirty(false);
    setHasUnsavedChanges(false);
    setValidationErrors({});
    clearStateFromStorage(modalId);
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
  }, [modalId]);

  // 검증 에러 설정
  const setFieldError = useCallback((field: string, error: string) => {
    setValidationErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  // 검증 에러 클리어
  const clearFieldError = useCallback((field: string) => {
    setValidationErrors(prev => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  // 모든 검증 에러 클리어
  const clearAllErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // 페이지 이탈 시 경고
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '저장하지 않은 변경사항이 있습니다. 정말 나가시겠습니까?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return {
    data,
    updateData,
    isDirty,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    validationErrors,
    save,
    restore,
    reset,
    setFieldError,
    clearFieldError,
    clearAllErrors
  };
}

// 모달 히스토리 관리
export class ModalHistoryManager {
  private history: Array<{ modalId: string; data: any; timestamp: Date }> = [];
  private maxHistorySize = 10;

  addToHistory(modalId: string, data: any) {
    this.history.unshift({
      modalId,
      data: JSON.parse(JSON.stringify(data)), // 딥 클론
      timestamp: new Date()
    });

    // 히스토리 크기 제한
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }
  }

  getHistory(modalId?: string) {
    if (modalId) {
      return this.history.filter(item => item.modalId === modalId);
    }
    return this.history;
  }

  getLastState(modalId: string) {
    const modalHistory = this.getHistory(modalId);
    return modalHistory.length > 0 ? modalHistory[0].data : null;
  }

  clearHistory(modalId?: string) {
    if (modalId) {
      this.history = this.history.filter(item => item.modalId !== modalId);
    } else {
      this.history = [];
    }
  }
}

// 전역 히스토리 매니저 인스턴스
export const modalHistoryManager = new ModalHistoryManager();

// 모달 간 데이터 공유
export class ModalDataBridge {
  private sharedData: Map<string, any> = new Map();
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();

  setSharedData(key: string, data: any) {
    this.sharedData.set(key, data);
    
    // 구독자들에게 알림
    const subs = this.subscribers.get(key);
    if (subs) {
      subs.forEach(callback => callback(data));
    }
  }

  getSharedData(key: string) {
    return this.sharedData.get(key);
  }

  subscribe(key: string, callback: (data: any) => void) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback);

    // 구독 해제 함수 반환
    return () => {
      const subs = this.subscribers.get(key);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  clearSharedData(key?: string) {
    if (key) {
      this.sharedData.delete(key);
      this.subscribers.delete(key);
    } else {
      this.sharedData.clear();
      this.subscribers.clear();
    }
  }
}

// 전역 데이터 브릿지 인스턴스
export const modalDataBridge = new ModalDataBridge();

// 모달 상태 복구 훅
export function useModalRestore(modalId: string) {
  const [hasRestorableState, setHasRestorableState] = useState(false);

  useEffect(() => {
    const savedState = loadStateFromStorage(modalId);
    setHasRestorableState(!!savedState);
  }, [modalId]);

  const restoreState = useCallback(() => {
    return loadStateFromStorage(modalId);
  }, [modalId]);

  const clearSavedState = useCallback(() => {
    clearStateFromStorage(modalId);
    setHasRestorableState(false);
  }, [modalId]);

  return {
    hasRestorableState,
    restoreState,
    clearSavedState
  };
}
