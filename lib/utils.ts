import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { CostHistory, Project } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 숫자 문자열에서 숫자 추출 (쉼표, 원화 등 제거)
export function parseNumberFromString(value: string): number {
  if (!value || typeof value !== 'string') return 0;
  
  // 쉼표, 원화, 공백 제거 후 숫자만 추출
  const cleaned = value.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
}

// 안전한 배열 계산 함수들
export function safeMax(values: number[]): number {
  if (!Array.isArray(values) || values.length === 0) {
    return 0;
  }
  
  const validValues = values.filter(v => typeof v === 'number' && !isNaN(v));
  return validValues.length > 0 ? Math.max(...validValues) : 0;
}

export function safeMin(values: number[]): number {
  if (!Array.isArray(values) || values.length === 0) {
    return 0;
  }
  
  const validValues = values.filter(v => typeof v === 'number' && !isNaN(v));
  return validValues.length > 0 ? Math.min(...validValues) : 0;
}

export function safeAverage(values: number[]): number {
  if (!Array.isArray(values) || values.length === 0) {
    return 0;
  }
  
  const validValues = values.filter(v => typeof v === 'number' && !isNaN(v));
  if (validValues.length === 0) return 0;
  
  const sum = validValues.reduce((acc, val) => acc + val, 0);
  return sum / validValues.length;
}

export function safeNumber(value: any, defaultValue: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return !isNaN(parsed) ? parsed : defaultValue;
  }
  
  return defaultValue;
}

// =============================================================================
// 데이터 동기화 유틸리티 함수들
// =============================================================================

/**
 * costHistory 배열에서 최신 이력을 가져오는 함수
 * 모든 컴포넌트에서 일관된 방식으로 사용
 */
export function getLatestCostHistory(costHistory?: CostHistory[]): CostHistory | null {
  if (!costHistory || costHistory.length === 0) return null;
  
  // 날짜순으로 정렬하여 가장 최근 이력 반환
  const sorted = [...costHistory].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return sorted[0];
}

/**
 * 투입률 계산 함수
 */
export function calculateCostRatio(budget: number, actualCost: number): number {
  if (budget <= 0) return 0;
  return (actualCost / budget) * 100;
}

/**
 * 투입률에 따른 프로젝트 상태 자동 결정
 */
export function determineProjectStatus(costRatio: number, currentStatus: string): string {
  // 완료된 프로젝트는 상태 변경하지 않음
  if (currentStatus === "완료") return currentStatus;
  
  if (costRatio >= 95) {
    return "진행 중(관리필요)";
  } else if (costRatio >= 70) {
    return "진행 중";
  } else if (costRatio > 0) {
    return "진행 중";
  } else {
    return "계획";
  }
}

/**
 * 프로젝트의 현재 예산과 실제비용을 costHistory와 동기화
 */
export function syncProjectWithCostHistory(project: Project): Project {
  const latestHistory = getLatestCostHistory(project.costHistory);
  
  if (!latestHistory) {
    return project;
  }
  
  const costRatio = calculateCostRatio(latestHistory.budget, latestHistory.actualCost);
  const newStatus = determineProjectStatus(costRatio, project.status);
  
  return {
    ...project,
    budget: latestHistory.budget,
    actualCost: latestHistory.actualCost,
    status: newStatus
  };
}

/**
 * 투입률에 따른 색상 클래스 반환
 */
export function getCostRatioColorClass(costRatio: number): string {
  if (costRatio > 100) return "text-red-600";
  if (costRatio >= 95) return "text-red-500";
  if (costRatio >= 80) return "text-orange-500";
  if (costRatio >= 70) return "text-yellow-600";
  return "text-green-600";
}

/**
 * 투입률에 따른 배경색 반환 (지도용)
 */
export function getCostRatioColor(costRatio: number): string {
  if (costRatio > 100) return '#DC2626'; // 빨간색
  if (costRatio >= 95) return '#EF4444'; // 연빨간색
  if (costRatio >= 80) return '#F97316'; // 주황색
  if (costRatio >= 70) return '#EAB308'; // 노란색
  return '#16A34A'; // 초록색
}

/**
 * 프로젝트의 현재 투입률 가져오기
 */
export function getCurrentCostRatio(project: Project): number {
  const latestHistory = getLatestCostHistory(project.costHistory);
  if (!latestHistory) return 0;
  
  return calculateCostRatio(latestHistory.budget, latestHistory.actualCost);
}

/**
 * 프로젝트의 현재 투입률을 문자열로 반환
 */
export function getCurrentCostRatioString(project: Project): string {
  const ratio = getCurrentCostRatio(project);
  return ratio > 0 ? `${ratio.toFixed(1)}%` : '-';
}