'use client';

import React, { useState, useMemo } from 'react';
import { NativeModal, NativeModalHeader, NativeModalTitle, NativeModalContent } from '@/components/ui/native-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  DollarSign,
  Users,
  Calendar,
  MapPin,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface OverviewModalProps {
  open: boolean;
  onClose: () => void;
  projects: any[];
}

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  description: string;
}

export default function OverviewModal({ open, onClose, projects }: OverviewModalProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'trends' | 'alerts'>('stats');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');

  // 통계 계산
  const stats = useMemo(() => {
    const total = projects.length;
    const inProgress = projects.filter(p => p.status === '진행 중').length;
    const completed = projects.filter(p => p.status === '완료').length;
    const delayed = projects.filter(p => p.status === '진행 중(관리필요)').length;
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalActual = projects.reduce((sum, p) => sum + (p.actualCost || 0), 0);
    const avgProgress = projects.reduce((sum, p) => sum + (p.progress || 0), 0) / total;

    return {
      total,
      inProgress,
      completed,
      delayed,
      totalBudget,
      totalActual,
      avgProgress: Math.round(avgProgress),
      budgetUtilization: Math.round((totalActual / totalBudget) * 100)
    };
  }, [projects]);

  // 상태 카드 데이터
  const statCards: StatCard[] = [
    {
      title: '전체 프로젝트',
      value: stats.total,
      change: 12,
      changeType: 'increase',
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: '이번 달 신규 프로젝트'
    },
    {
      title: '진행 중',
      value: stats.inProgress,
      change: 8,
      changeType: 'increase',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: '활발히 진행 중인 프로젝트'
    },
    {
      title: '완료',
      value: stats.completed,
      change: 15,
      changeType: 'increase',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: '성공적으로 완료된 프로젝트'
    },
    {
      title: '관리 필요',
      value: stats.delayed,
      change: -5,
      changeType: 'decrease',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: '즉시 관리가 필요한 프로젝트'
    },
    {
      title: '예산 활용률',
      value: `${stats.budgetUtilization}%`,
      change: 3,
      changeType: 'increase',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: '전체 예산 대비 사용률'
    },
    {
      title: '평균 진행률',
      value: `${stats.avgProgress}%`,
      change: 7,
      changeType: 'increase',
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: '모든 프로젝트 평균 진행률'
    }
  ];

  // 지역별 통계
  const locationStats = useMemo(() => {
    const locationMap = new Map();
    projects.forEach(project => {
      const location = project.location || '미지정';
      const current = locationMap.get(location) || { count: 0, budget: 0 };
      locationMap.set(location, {
        count: current.count + 1,
        budget: current.budget + (project.budget || 0)
      });
    });
    return Array.from(locationMap.entries()).map(([location, data]) => ({
      location,
      ...data
    }));
  }, [projects]);

  // 긴급 알림
  const alerts = useMemo(() => {
    const urgentProjects = projects.filter(p => 
      p.status === '진행 중(관리필요)' || 
      (p.actualCost / p.budget) > 0.9
    );
    
    return urgentProjects.map(project => ({
      id: project.id,
      title: project.name,
      type: (project.actualCost / project.budget) > 0.9 ? 'budget' : 'schedule',
      message: (project.actualCost / project.budget) > 0.9 
        ? '예산 90% 초과' 
        : '일정 지연 위험',
      severity: 'high' as const
    }));
  }, [projects]);

  return (
    <NativeModal open={open} onClose={onClose} fullScreen>
      <NativeModalHeader>
        <NativeModalTitle showCloseButton onClose={onClose}>
          📊 전체 현황 대시보드
        </NativeModalTitle>
        
        {/* 탭 네비게이션 */}
        <div className="flex mt-4 bg-gray-100 rounded-lg p-1">
          <Button
            variant={activeTab === 'stats' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('stats')}
            className="flex-1 h-8"
          >
            📈 통계
          </Button>
          <Button
            variant={activeTab === 'trends' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('trends')}
            className="flex-1 h-8"
          >
            📊 트렌드
          </Button>
          <Button
            variant={activeTab === 'alerts' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('alerts')}
            className="flex-1 h-8"
          >
            🚨 알림 ({alerts.length})
          </Button>
        </div>

        {/* 시간 범위 선택 */}
        <div className="flex gap-2 mt-3">
          {(['today', 'week', 'month'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="flex-1 h-8 text-xs"
            >
              {range === 'today' ? '오늘' : range === 'week' ? '이번 주' : '이번 달'}
            </Button>
          ))}
        </div>
      </NativeModalHeader>

      <NativeModalContent>
        {/* 통계 탭 */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* 주요 지표 카드들 */}
            <div className="grid grid-cols-2 gap-3">
              {statCards.map((card, index) => {
                const Icon = card.icon;
                const TrendIcon = card.changeType === 'increase' ? TrendingUp : 
                                 card.changeType === 'decrease' ? TrendingDown : Clock;
                
                return (
                  <div
                    key={index}
                    className={`${card.bgColor} rounded-xl p-4 border border-gray-200`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`h-5 w-5 ${card.color}`} />
                      <div className={`flex items-center gap-1 text-xs ${
                        card.changeType === 'increase' ? 'text-green-600' :
                        card.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        <TrendIcon className="h-3 w-3" />
                        <span>{Math.abs(card.change)}%</span>
                      </div>
                    </div>
                    
                    <div className="mb-1">
                      <div className={`text-2xl font-bold ${card.color}`}>
                        {card.value}
                      </div>
                      <div className="text-xs font-medium text-gray-700">
                        {card.title}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {card.description}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 지역별 현황 */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">지역별 현황</h3>
              </div>
              
              <div className="space-y-3">
                {locationStats.map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">{location.location}</div>
                      <div className="text-sm text-gray-500">{location.count}개 프로젝트</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">
                        ₩{(location.budget / 100000000).toFixed(1)}억
                      </div>
                      <div className="text-xs text-gray-500">총 예산</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 트렌드 탭 */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">트렌드 분석</h3>
              <p className="text-sm text-gray-600 mb-4">
                지난 {timeRange === 'today' ? '24시간' : timeRange === 'week' ? '7일' : '30일'} 동안의 프로젝트 동향
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">+{stats.inProgress}</div>
                  <div className="text-sm text-gray-600">신규 시작</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">+{stats.completed}</div>
                  <div className="text-sm text-gray-600">완료</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 알림 탭 */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <div
                  key={index}
                  className="bg-red-50 border border-red-200 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-semibold text-red-800">{alert.title}</div>
                      <div className="text-sm text-red-600 mt-1">{alert.message}</div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                          즉시 확인
                        </Button>
                        <Button size="sm" variant="outline">
                          나중에
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">모든 것이 정상입니다!</h3>
                <p className="text-gray-600">현재 긴급하게 처리할 사항이 없습니다.</p>
              </div>
            )}
          </div>
        )}
      </NativeModalContent>
    </NativeModal>
  );
}
