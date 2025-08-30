// 100명 AI 토론자 결과: 시네마틱 전환 애니메이션 시스템

export type AnimationType = 
  | 'slideUp' 
  | 'slideDown' 
  | 'slideLeft' 
  | 'slideRight'
  | 'fade'
  | 'scale'
  | 'flip'
  | 'elastic'
  | 'bounce'
  | 'cinema';

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  fillMode?: 'forwards' | 'backwards' | 'both' | 'none';
}

// 시네마틱 애니메이션 프리셋
export const animationPresets: Record<AnimationType, AnimationConfig> = {
  slideUp: {
    duration: 350,
    easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
  },
  slideDown: {
    duration: 300,
    easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
  },
  slideLeft: {
    duration: 300,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  slideRight: {
    duration: 300,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  fade: {
    duration: 250,
    easing: 'ease-out',
  },
  scale: {
    duration: 200,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  flip: {
    duration: 600,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  elastic: {
    duration: 800,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  bounce: {
    duration: 500,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  cinema: {
    duration: 400,
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  }
};

// 키프레임 정의
export const keyframes = {
  slideUp: {
    enter: [
      { transform: 'translateY(100%)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1 }
    ],
    exit: [
      { transform: 'translateY(0)', opacity: 1 },
      { transform: 'translateY(100%)', opacity: 0 }
    ]
  },
  slideDown: {
    enter: [
      { transform: 'translateY(-100%)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1 }
    ],
    exit: [
      { transform: 'translateY(0)', opacity: 1 },
      { transform: 'translateY(-100%)', opacity: 0 }
    ]
  },
  slideLeft: {
    enter: [
      { transform: 'translateX(100%)', opacity: 0 },
      { transform: 'translateX(0)', opacity: 1 }
    ],
    exit: [
      { transform: 'translateX(0)', opacity: 1 },
      { transform: 'translateX(-100%)', opacity: 0 }
    ]
  },
  slideRight: {
    enter: [
      { transform: 'translateX(-100%)', opacity: 0 },
      { transform: 'translateX(0)', opacity: 1 }
    ],
    exit: [
      { transform: 'translateX(0)', opacity: 1 },
      { transform: 'translateX(100%)', opacity: 0 }
    ]
  },
  fade: {
    enter: [
      { opacity: 0 },
      { opacity: 1 }
    ],
    exit: [
      { opacity: 1 },
      { opacity: 0 }
    ]
  },
  scale: {
    enter: [
      { transform: 'scale(0.8)', opacity: 0 },
      { transform: 'scale(1)', opacity: 1 }
    ],
    exit: [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(0.8)', opacity: 0 }
    ]
  },
  flip: {
    enter: [
      { transform: 'rotateY(-90deg)', opacity: 0 },
      { transform: 'rotateY(0deg)', opacity: 1 }
    ],
    exit: [
      { transform: 'rotateY(0deg)', opacity: 1 },
      { transform: 'rotateY(90deg)', opacity: 0 }
    ]
  },
  elastic: {
    enter: [
      { transform: 'scale(0) rotate(180deg)', opacity: 0 },
      { transform: 'scale(1.1) rotate(0deg)', opacity: 1, offset: 0.8 },
      { transform: 'scale(1) rotate(0deg)', opacity: 1 }
    ],
    exit: [
      { transform: 'scale(1) rotate(0deg)', opacity: 1 },
      { transform: 'scale(0) rotate(-180deg)', opacity: 0 }
    ]
  },
  bounce: {
    enter: [
      { transform: 'translateY(100%) scale(0.8)', opacity: 0 },
      { transform: 'translateY(-20%) scale(1.05)', opacity: 1, offset: 0.6 },
      { transform: 'translateY(0) scale(1)', opacity: 1 }
    ],
    exit: [
      { transform: 'translateY(0) scale(1)', opacity: 1 },
      { transform: 'translateY(100%) scale(0.8)', opacity: 0 }
    ]
  },
  cinema: {
    enter: [
      { 
        transform: 'translateY(50px) scale(0.95)', 
        opacity: 0,
        filter: 'blur(10px)'
      },
      { 
        transform: 'translateY(0) scale(1)', 
        opacity: 1,
        filter: 'blur(0px)'
      }
    ],
    exit: [
      { 
        transform: 'translateY(0) scale(1)', 
        opacity: 1,
        filter: 'blur(0px)'
      },
      { 
        transform: 'translateY(-50px) scale(1.05)', 
        opacity: 0,
        filter: 'blur(10px)'
      }
    ]
  }
};

// 오버레이 애니메이션
export const overlayKeyframes = {
  enter: [
    { opacity: 0, backdropFilter: 'blur(0px)' },
    { opacity: 1, backdropFilter: 'blur(8px)' }
  ],
  exit: [
    { opacity: 1, backdropFilter: 'blur(8px)' },
    { opacity: 0, backdropFilter: 'blur(0px)' }
  ]
};

// 애니메이션 실행 함수
export function animateElement(
  element: HTMLElement,
  type: AnimationType,
  direction: 'enter' | 'exit'
): Promise<void> {
  return new Promise((resolve) => {
    const config = animationPresets[type];
    const frames = keyframes[type][direction];
    
    const animation = element.animate(frames, {
      duration: config.duration,
      easing: config.easing,
      delay: config.delay || 0,
      fill: config.fillMode || 'forwards'
    });

    animation.addEventListener('finish', () => resolve());
    animation.addEventListener('cancel', () => resolve());
  });
}

// 오버레이 애니메이션 실행
export function animateOverlay(
  element: HTMLElement,
  direction: 'enter' | 'exit',
  duration = 300
): Promise<void> {
  return new Promise((resolve) => {
    const frames = overlayKeyframes[direction];
    
    const animation = element.animate(frames, {
      duration,
      easing: 'ease-out',
      fill: 'forwards'
    });

    animation.addEventListener('finish', () => resolve());
    animation.addEventListener('cancel', () => resolve());
  });
}

// 연속 애니메이션 (스태거 효과)
export async function staggerAnimation(
  elements: HTMLElement[],
  type: AnimationType,
  direction: 'enter' | 'exit',
  staggerDelay = 50
): Promise<void> {
  const promises = elements.map((element, index) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        animateElement(element, type, direction).then(resolve);
      }, index * staggerDelay);
    });
  });

  await Promise.all(promises);
}

// 제스처 기반 애니메이션
export function createGestureAnimation(
  element: HTMLElement,
  progress: number, // 0-1
  type: AnimationType = 'slideDown'
): void {
  const frames = keyframes[type];
  const enterFrame = frames.enter[0] as any;
  const exitFrame = frames.enter[1] as any;

  // 진행률에 따라 중간 상태 계산
  const interpolate = (start: number, end: number, progress: number) => {
    return start + (end - start) * progress;
  };

  // Transform 값 계산
  let transform = '';
  
  if (type === 'slideUp' || type === 'slideDown') {
    const startY = type === 'slideUp' ? 100 : -100;
    const currentY = interpolate(startY, 0, progress);
    transform = `translateY(${currentY}%)`;
  } else if (type === 'slideLeft' || type === 'slideRight') {
    const startX = type === 'slideLeft' ? 100 : -100;
    const currentX = interpolate(startX, 0, progress);
    transform = `translateX(${currentX}%)`;
  } else if (type === 'scale') {
    const currentScale = interpolate(0.8, 1, progress);
    transform = `scale(${currentScale})`;
  }

  // 스타일 적용
  element.style.transform = transform;
  element.style.opacity = progress.toString();
}

// 성능 최적화를 위한 애니메이션 감지
export function supportsWebAnimations(): boolean {
  return typeof Element !== 'undefined' && 'animate' in Element.prototype;
}

// 60fps 보장을 위한 애니메이션 모니터링
export class AnimationPerformanceMonitor {
  private frameCount = 0;
  private startTime = 0;
  private isMonitoring = false;

  start() {
    this.frameCount = 0;
    this.startTime = performance.now();
    this.isMonitoring = true;
    this.tick();
  }

  stop(): number {
    this.isMonitoring = false;
    const duration = performance.now() - this.startTime;
    return (this.frameCount / duration) * 1000; // FPS
  }

  private tick() {
    if (!this.isMonitoring) return;
    
    this.frameCount++;
    requestAnimationFrame(() => this.tick());
  }
}

// CSS 변수를 통한 동적 애니메이션 제어
export function setAnimationVariables(element: HTMLElement, variables: Record<string, string>) {
  Object.entries(variables).forEach(([key, value]) => {
    element.style.setProperty(`--${key}`, value);
  });
}

// 프리로드된 애니메이션 클래스
export const animationClasses = {
  'slide-up-enter': 'animate-slide-up-enter',
  'slide-up-exit': 'animate-slide-up-exit',
  'slide-down-enter': 'animate-slide-down-enter',
  'slide-down-exit': 'animate-slide-down-exit',
  'fade-enter': 'animate-fade-enter',
  'fade-exit': 'animate-fade-exit',
  'scale-enter': 'animate-scale-enter',
  'scale-exit': 'animate-scale-exit',
  'cinema-enter': 'animate-cinema-enter',
  'cinema-exit': 'animate-cinema-exit'
};
