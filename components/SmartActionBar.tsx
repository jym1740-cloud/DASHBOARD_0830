'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  AlertTriangle, 
  Zap, 
  ChevronRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  Filter,
  Plus,
  Eye,
  Settings
} from 'lucide-react';

interface SmartActionBarProps {
  onOverviewOpen: () => void;
  onScheduleOpen: () => void;
  onPersonnelOpen: () => void;
  onUrgentOpen: () => void;
  onQuickActionsOpen: () => void;
  
  // 실시간 데이터
  totalProjects?: number;
  urgentCount?: number;
  todayTasks?: number;
  activePersonnel?: number;
  
  // 상태
  isLoading?: boolean;
}

interface ActionItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  borderColor: string;
  count?: number;
  description: string;
  onClick: () => void;
  isUrgent?: boolean;
  pulse?: boolean;
}

export default function SmartActionBar({
  onOverviewOpen,
  onScheduleOpen,
  onPersonnelOpen,
  onUrgentOpen,
  onQuickActionsOpen,
  totalProjects = 0,
  urgentCount = 0,
  todayTasks = 0,
  activePersonnel = 0,
  isLoading = false
}: SmartActionBarProps) {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [showExpanded, setShowExpanded] = useState(false);

  // 액션 아이템 정의
  const actionItems: ActionItem[] = [
    {
      id: 'quick',
      label: '빠른작업',
      icon: Zap,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: '자주 사용하는 작업',
      onClick: onQuickActionsOpen,
      pulse: true
    },
    {
      id: 'overview',
      label: '전체보기',
      icon: BarChart3,
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      count: totalProjects,
      description: `${totalProjects}개 프로젝트 현황`,
      onClick: onOverviewOpen
    },
    {
      id: 'schedule',
      label: '일정관리',
      icon: Calendar,
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      count: todayTasks,
      description: `오늘 ${todayTasks}개 작업`,
      onClick: onScheduleOpen
    },
    {
      id: 'personnel',
      label: '인원관리',
      icon: Users,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      count: activePersonnel,
      description: `${activePersonnel}명 투입 중`,
      onClick: onPersonnelOpen
    },
    {
      id: 'urgent',
      label: '긴급',
      icon: AlertTriangle,
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      count: urgentCount,
      description: `${urgentCount}개 긴급 사항`,
      onClick: onUrgentOpen,
      isUrgent: true,
      pulse: urgentCount > 0
    }
  ];

  // 버튼 클릭 핸들러
  const handleActionClick = (item: ActionItem) => {
    setActiveAction(item.id);
    
    // 햅틱 피드백 (모바일) - Vercel 호환
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(50);
      } catch (error) {
        console.warn('Vibration failed:', error);
      }
    }
    
    // 클릭 애니메이션 후 실행
    setTimeout(() => {
      item.onClick();
      setActiveAction(null);
    }, 150);
  };

  // 확장 모드 토글
  const toggleExpanded = () => {
    setShowExpanded(!showExpanded);
  };

  return (
    <div className="bg-white border-b border-gray-100">
      {/* 메인 액션 바 */}
      <div className="px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {actionItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeAction === item.id;
            
            return (
              <Button
                key={item.id}
                size="sm"
                variant="outline"
                onClick={() => handleActionClick(item)}
                disabled={isLoading}
                className={`
                  flex-shrink-0 h-12 px-4 text-sm font-medium transition-all duration-200
                  ${item.color} ${item.bgColor} ${item.borderColor}
                  ${isActive ? 'scale-95 shadow-inner' : 'hover:scale-105 hover:shadow-md'}
                  ${item.pulse ? 'animate-pulse' : ''}
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  relative group
                `}
                style={{ minWidth: '90px' }}
              >
                {/* 아이콘 */}
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${item.pulse ? 'animate-bounce' : ''}`} />
                  
                  {/* 라벨 */}
                  <span className="font-semibold">{item.label}</span>
                  
                  {/* 카운트 배지 */}
                  {item.count !== undefined && item.count > 0 && (
                    <Badge 
                      className={`
                        ml-1 h-5 px-1.5 text-xs font-bold
                        ${item.isUrgent 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'bg-gray-600 text-white'
                        }
                      `}
                    >
                      {item.count > 99 ? '99+' : item.count}
                    </Badge>
                  )}
                </div>

                {/* 호버 툴팁 */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  {item.description}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>

                {/* 로딩 인디케이터 */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </Button>
            );
          })}

          {/* 확장 버튼 */}
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleExpanded}
            className="flex-shrink-0 h-12 w-12 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${showExpanded ? 'rotate-90' : ''}`} />
          </Button>
        </div>
      </div>

      {/* 확장 영역 */}
      {showExpanded && (
        <div className="px-4 pb-3 border-t border-gray-100 bg-gray-50">
          <div className="flex gap-2 pt-3">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-10 text-xs font-medium bg-white hover:bg-gray-50"
            >
              <Filter className="h-3 w-3 mr-2" />
              필터
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-10 text-xs font-medium bg-white hover:bg-gray-50"
            >
              <Plus className="h-3 w-3 mr-2" />
              새로 만들기
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-10 text-xs font-medium bg-white hover:bg-gray-50"
            >
              <Eye className="h-3 w-3 mr-2" />
              보기 설정
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-10 text-xs font-medium bg-white hover:bg-gray-50"
            >
              <Settings className="h-3 w-3 mr-2" />
              설정
            </Button>
          </div>
        </div>
      )}

      {/* 실시간 상태 인디케이터 */}
      <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>실시간 동기화</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>방금 업데이트됨</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {urgentCount > 0 && (
              <div className="flex items-center gap-1 text-red-600 font-semibold">
                <AlertTriangle className="h-3 w-3 animate-bounce" />
                <span>{urgentCount}개 긴급</span>
              </div>
            )}
            
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span>정상 운영</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
