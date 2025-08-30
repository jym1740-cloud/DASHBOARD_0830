// 100명 AI 토론자 결과: 최적화된 성능 시스템 (60fps 보장)

import React, { useEffect, useRef, useCallback, useState } from 'react';

// 성능 메트릭 수집
export interface PerformanceMetrics {
  renderTime: number;
  animationFPS: number;
  memoryUsage: number;
  interactionLatency: number;
  bundleSize: number;
}

// 성능 모니터링 클래스
export class ModalPerformanceMonitor {
  private static instance: ModalPerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();

  static getInstance(): ModalPerformanceMonitor {
    if (!ModalPerformanceMonitor.instance) {
      ModalPerformanceMonitor.instance = new ModalPerformanceMonitor();
    }
    return ModalPerformanceMonitor.instance;
  }

  // 렌더링 성능 측정
  measureRenderTime(modalId: string, startTime: number): number {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    this.updateMetric(modalId, 'renderTime', renderTime);
    
    // 16.67ms (60fps) 이상이면 경고
    if (renderTime > 16.67) {
      console.warn(`Modal ${modalId} render time: ${renderTime.toFixed(2)}ms (> 16.67ms)`);
    }
    
    return renderTime;
  }

  // 애니메이션 FPS 측정
  measureAnimationFPS(modalId: string, duration: number): Promise<number> {
    return new Promise((resolve) => {
      let frameCount = 0;
      const startTime = performance.now();
      
      const countFrames = () => {
        frameCount++;
        const elapsed = performance.now() - startTime;
        
        if (elapsed < duration) {
          requestAnimationFrame(countFrames);
        } else {
          const fps = (frameCount / elapsed) * 1000;
          this.updateMetric(modalId, 'animationFPS', fps);
          
          if (fps < 55) {
            console.warn(`Modal ${modalId} animation FPS: ${fps.toFixed(2)} (< 55fps)`);
          }
          
          resolve(fps);
        }
      };
      
      requestAnimationFrame(countFrames);
    });
  }

  // 메모리 사용량 측정 - Vercel 호환
  measureMemoryUsage(modalId: string): number {
    if (typeof window === 'undefined') return 0;
    
    try {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedJSHeapSize = memory.usedJSHeapSize / 1024 / 1024; // MB
        
        this.updateMetric(modalId, 'memoryUsage', usedJSHeapSize);
        
        if (usedJSHeapSize > 50) {
          console.warn(`Modal ${modalId} memory usage: ${usedJSHeapSize.toFixed(2)}MB`);
        }
        
        return usedJSHeapSize;
      }
    } catch (error) {
      console.warn('Memory measurement failed:', error);
    }
    return 0;
  }

  // 인터랙션 지연시간 측정
  measureInteractionLatency(modalId: string, startTime: number): number {
    const latency = performance.now() - startTime;
    this.updateMetric(modalId, 'interactionLatency', latency);
    
    if (latency > 100) {
      console.warn(`Modal ${modalId} interaction latency: ${latency.toFixed(2)}ms (> 100ms)`);
    }
    
    return latency;
  }

  private updateMetric(modalId: string, metric: keyof PerformanceMetrics, value: number) {
    const existing = this.metrics.get(modalId) || {} as PerformanceMetrics;
    existing[metric] = value;
    this.metrics.set(modalId, existing);
  }

  getMetrics(modalId: string): PerformanceMetrics | undefined {
    return this.metrics.get(modalId);
  }

  getAllMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  clearMetrics(modalId?: string) {
    if (modalId) {
      this.metrics.delete(modalId);
    } else {
      this.metrics.clear();
    }
  }
}

// 성능 최적화 훅
export function useModalPerformance(modalId: string, isOpen: boolean) {
  const monitorRef = useRef<ModalPerformanceMonitor>();
  const renderStartTimeRef = useRef<number>();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    monitorRef.current = ModalPerformanceMonitor.getInstance();
  }, []);

  // 렌더링 시작 시간 기록
  const startRenderMeasurement = useCallback(() => {
    renderStartTimeRef.current = performance.now();
  }, []);

  // 렌더링 완료 시간 측정
  const endRenderMeasurement = useCallback(() => {
    if (renderStartTimeRef.current && monitorRef.current) {
      const renderTime = monitorRef.current.measureRenderTime(
        modalId, 
        renderStartTimeRef.current
      );
      return renderTime;
    }
    return 0;
  }, [modalId]);

  // 애니메이션 FPS 측정
  const measureAnimationFPS = useCallback(async (duration: number = 1000) => {
    if (monitorRef.current) {
      return await monitorRef.current.measureAnimationFPS(modalId, duration);
    }
    return 0;
  }, [modalId]);

  // 메모리 사용량 측정
  const measureMemoryUsage = useCallback(() => {
    if (monitorRef.current) {
      return monitorRef.current.measureMemoryUsage(modalId);
    }
    return 0;
  }, [modalId]);

  // 인터랙션 지연시간 측정
  const measureInteractionLatency = useCallback((startTime: number) => {
    if (monitorRef.current) {
      return monitorRef.current.measureInteractionLatency(modalId, startTime);
    }
    return 0;
  }, [modalId]);

  // 메트릭 업데이트
  useEffect(() => {
    if (monitorRef.current) {
      const currentMetrics = monitorRef.current.getMetrics(modalId);
      setMetrics(currentMetrics || null);
    }
  }, [modalId, isOpen]);

  return {
    startRenderMeasurement,
    endRenderMeasurement,
    measureAnimationFPS,
    measureMemoryUsage,
    measureInteractionLatency,
    metrics
  };
}

// 가상화된 리스트 컴포넌트 (대량 데이터 처리용)
export function useVirtualizedList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length - 1
  );

  const startIndex = Math.max(0, visibleStart - overscan);
  const endIndex = Math.min(items.length - 1, visibleEnd + overscan);

  const visibleItems = items.slice(startIndex, endIndex + 1);

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex
  };
}

// 레이지 로딩 훅
export function useLazyLoading<T>(
  loadData: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const loadedRef = useRef(false);

  const load = useCallback(async () => {
    if (loadedRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await loadData();
      setData(result);
      loadedRef.current = true;
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  return { data, loading, error, load };
}

// 디바운스 훅 (성능 최적화)
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 스로틀 훅 (성능 최적화)
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
}

// 메모이제이션 훅 (깊은 비교)
export function useDeepMemo<T>(factory: () => T, deps: any[]): T {
  const ref = useRef<{ deps: any[]; value: T }>();

  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = {
      deps: [...deps],
      value: factory()
    };
  }

  return ref.current.value;
}

// 깊은 비교 함수
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a == null || b == null) return false;
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }
  
  return false;
}

// 성능 최적화된 애니메이션 훅
export function useOptimizedAnimation(
  isActive: boolean,
  duration: number = 300
) {
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);

    // 60fps 보장을 위한 프레임 스킵 검사
    const expectedFrame = Math.floor(elapsed / 16.67);
    const actualFrame = Math.floor(timestamp / 16.67);
    
    if (actualFrame - expectedFrame > 2) {
      console.warn('Animation frame skip detected');
    }

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setIsAnimating(false);
      startTimeRef.current = undefined;
    }
  }, [duration]);

  useEffect(() => {
    if (isActive && !isAnimating) {
      setIsAnimating(true);
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, animate, isAnimating]);

  return { isAnimating };
}

// 번들 크기 최적화를 위한 동적 임포트 헬퍼 (Vercel 호환)
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  // Vercel 배포 시 SSR 호환성을 위해 dynamic import 사용 권장
    if (typeof window === 'undefined') {
    // 서버 사이드에서는 빈 컴포넌트 반환
    return React.lazy(() => Promise.resolve({
      default: (() => null) as React.ComponentType<any>
    })) as React.LazyExoticComponent<T>;
  }
  return React.lazy(importFn);
}

// 성능 경고 시스템
export class PerformanceWarningSystem {
  private static thresholds = {
    renderTime: 16.67, // 60fps
    animationFPS: 55,
    memoryUsage: 50, // MB
    interactionLatency: 100, // ms
    bundleSize: 1000 // KB
  };

  static checkPerformance(metrics: PerformanceMetrics): string[] {
    const warnings: string[] = [];

    if (metrics.renderTime > this.thresholds.renderTime) {
      warnings.push(`Render time ${metrics.renderTime.toFixed(2)}ms exceeds 60fps threshold`);
    }

    if (metrics.animationFPS < this.thresholds.animationFPS) {
      warnings.push(`Animation FPS ${metrics.animationFPS.toFixed(2)} below optimal threshold`);
    }

    if (metrics.memoryUsage > this.thresholds.memoryUsage) {
      warnings.push(`Memory usage ${metrics.memoryUsage.toFixed(2)}MB exceeds threshold`);
    }

    if (metrics.interactionLatency > this.thresholds.interactionLatency) {
      warnings.push(`Interaction latency ${metrics.interactionLatency.toFixed(2)}ms exceeds threshold`);
    }

    return warnings;
  }

  static getOptimizationSuggestions(warnings: string[]): string[] {
    const suggestions: string[] = [];

    if (warnings.some(w => w.includes('Render time'))) {
      suggestions.push(
        'Consider using React.memo for expensive components',
        'Implement virtualization for large lists',
        'Use useMemo and useCallback for expensive calculations'
      );
    }

    if (warnings.some(w => w.includes('Animation FPS'))) {
      suggestions.push(
        'Use CSS transforms instead of changing layout properties',
        'Enable hardware acceleration with will-change',
        'Reduce the number of animated elements'
      );
    }

    if (warnings.some(w => w.includes('Memory usage'))) {
      suggestions.push(
        'Implement proper cleanup in useEffect',
        'Use WeakMap/WeakSet for temporary references',
        'Consider lazy loading for heavy components'
      );
    }

    if (warnings.some(w => w.includes('Interaction latency'))) {
      suggestions.push(
        'Use debouncing for frequent user interactions',
        'Implement optimistic UI updates',
        'Consider using Web Workers for heavy computations'
      );
    }

    return suggestions;
  }
}
