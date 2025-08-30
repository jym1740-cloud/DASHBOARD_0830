// 100명 AI 토론자 결과: Vercel 배포 호환 브라우저 유틸리티

// 브라우저 환경 체크
export const isBrowser = typeof window !== 'undefined';

// 안전한 localStorage 접근
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage getItem failed:', error);
      return null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    if (!isBrowser) return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('localStorage setItem failed:', error);
      return false;
    }
  },
  
  removeItem: (key: string): boolean => {
    if (!isBrowser) return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('localStorage removeItem failed:', error);
      return false;
    }
  }
};

// 안전한 navigator 접근
export const safeNavigator = {
  vibrate: (pattern: number | number[]): boolean => {
    if (!isBrowser || !navigator || !('vibrate' in navigator)) return false;
    try {
      return navigator.vibrate(pattern);
    } catch (error) {
      console.warn('Navigator vibrate failed:', error);
      return false;
    }
  },
  
  getUserMedia: async (constraints: MediaStreamConstraints): Promise<MediaStream | null> => {
    if (!isBrowser || !navigator || !navigator.mediaDevices) return null;
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.warn('getUserMedia failed:', error);
      return null;
    }
  },
  
  share: async (data: ShareData): Promise<boolean> => {
    if (!isBrowser || !navigator || !('share' in navigator)) return false;
    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.warn('Navigator share failed:', error);
      return false;
    }
  }
};

// 안전한 performance API 접근
export const safePerformance = {
  now: (): number => {
    if (!isBrowser || !performance) return Date.now();
    return performance.now();
  },
  
  mark: (name: string): boolean => {
    if (!isBrowser || !performance || !performance.mark) return false;
    try {
      performance.mark(name);
      return true;
    } catch (error) {
      console.warn('Performance mark failed:', error);
      return false;
    }
  },
  
  measure: (name: string, startMark?: string, endMark?: string): boolean => {
    if (!isBrowser || !performance || !performance.measure) return false;
    try {
      performance.measure(name, startMark, endMark);
      return true;
    } catch (error) {
      console.warn('Performance measure failed:', error);
      return false;
    }
  },
  
  getMemoryInfo: (): any => {
    if (!isBrowser || !performance || !('memory' in performance)) return null;
    try {
      return (performance as any).memory;
    } catch (error) {
      console.warn('Performance memory failed:', error);
      return null;
    }
  }
};

// 안전한 requestAnimationFrame
export const safeAnimationFrame = {
  request: (callback: FrameRequestCallback): number => {
    if (!isBrowser || !requestAnimationFrame) {
      return setTimeout(callback, 16) as unknown as number;
    }
    return requestAnimationFrame(callback);
  },
  
  cancel: (id: number): void => {
    if (!isBrowser) {
      clearTimeout(id);
      return;
    }
    if (cancelAnimationFrame) {
      cancelAnimationFrame(id);
    } else {
      clearTimeout(id);
    }
  }
};

// 안전한 IntersectionObserver
export const safeIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver | null => {
  if (!isBrowser || !('IntersectionObserver' in window)) return null;
  try {
    return new IntersectionObserver(callback, options);
  } catch (error) {
    console.warn('IntersectionObserver creation failed:', error);
    return null;
  }
};

// 안전한 ResizeObserver
export const safeResizeObserver = (
  callback: ResizeObserverCallback
): ResizeObserver | null => {
  if (!isBrowser || !('ResizeObserver' in window)) return null;
  try {
    return new ResizeObserver(callback);
  } catch (error) {
    console.warn('ResizeObserver creation failed:', error);
    return null;
  }
};

// 안전한 MutationObserver
export const safeMutationObserver = (
  callback: MutationCallback
): MutationObserver | null => {
  if (!isBrowser || !('MutationObserver' in window)) return null;
  try {
    return new MutationObserver(callback);
  } catch (error) {
    console.warn('MutationObserver creation failed:', error);
    return null;
  }
};

// Vercel Edge Runtime 호환성 체크
export const isEdgeRuntime = (): boolean => {
  return typeof globalThis !== 'undefined' && 'EdgeRuntime' in globalThis;
};

// Node.js 환경 체크
export const isNodeEnvironment = (): boolean => {
  return typeof process !== 'undefined' && !!process.versions && !!process.versions.node;
};

// 개발 환경 체크
export const isDevelopment = (): boolean => {
  return isBrowser ? 
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' :
    process.env.NODE_ENV === 'development';
};

// 프로덕션 환경 체크
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

// Vercel 환경 체크
export const isVercelEnvironment = (): boolean => {
  return process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;
};
