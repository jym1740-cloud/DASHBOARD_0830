'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { NativeModal, NativeModalHeader, NativeModalTitle, NativeModalContent } from '@/components/ui/native-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Users, 
  Calendar,
  Phone,
  MessageCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
  Bell,
  Shield,
  Activity,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface UrgentModalProps {
  open: boolean;
  onClose: () => void;
  projects: any[];
  onUrgentAction?: (actionType: string, itemId: string) => void;
}

interface UrgentItem {
  id: string;
  type: 'budget' | 'schedule' | 'quality' | 'resource' | 'security' | 'system';
  severity: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  projectId?: string;
  projectName?: string;
  timestamp: Date;
  status: 'active' | 'acknowledged' | 'resolved' | 'escalated';
  assignee?: string;
  estimatedImpact: string;
  suggestedActions: string[];
  relatedData?: any;
}

export default function UrgentModal({ 
  open, 
  onClose, 
  projects,
  onUrgentAction 
}: UrgentModalProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'unresolved'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // 긴급 상황 데이터 생성
  const urgentItems: UrgentItem[] = useMemo(() => {
    const items: UrgentItem[] = [];
    
    projects.forEach((project, index) => {
      // 예산 초과 경고
      if (project.actualCost && project.budget && (project.actualCost / project.budget) > 0.85) {
        items.push({
          id: `budget-${project.id}`,
          type: 'budget',
          severity: (project.actualCost / project.budget) > 0.95 ? 'critical' : 'high',
          title: '예산 초과 경고',
          description: `${project.name} 프로젝트의 예산 사용률이 ${Math.round((project.actualCost / project.budget) * 100)}%에 도달했습니다.`,
          projectId: project.id,
          projectName: project.name,
          timestamp: new Date(Date.now() - Math.random() * 3600000), // 1시간 내 랜덤
          status: 'active',
          assignee: '최관리',
          estimatedImpact: '프로젝트 중단 위험',
          suggestedActions: [
            '예산 재검토 및 승인 요청',
            '불필요한 비용 항목 제거',
            '추가 예산 확보 방안 검토'
          ],
          relatedData: {
            currentBudget: project.budget,
            usedBudget: project.actualCost,
            remainingBudget: project.budget - project.actualCost
          }
        });
      }

      // 일정 지연 경고
      if (project.status === '진행 중(관리필요)') {
        items.push({
          id: `schedule-${project.id}`,
          type: 'schedule',
          severity: 'high',
          title: '일정 지연 위험',
          description: `${project.name} 프로젝트가 예정된 일정보다 지연되고 있습니다.`,
          projectId: project.id,
          projectName: project.name,
          timestamp: new Date(Date.now() - Math.random() * 7200000), // 2시간 내 랜덤
          status: 'active',
          assignee: '김개발',
          estimatedImpact: '납기 지연 가능성',
          suggestedActions: [
            '일정 재조정 및 리소스 재배치',
            '우선순위 작업 식별',
            '추가 인력 투입 검토'
          ]
        });
      }
    });

    // 시스템 관련 긴급 상황 추가
    items.push(
      {
        id: 'system-1',
        type: 'system',
        severity: 'critical',
        title: '서버 성능 저하',
        description: '메인 서버의 CPU 사용률이 95%를 초과했습니다.',
        timestamp: new Date(Date.now() - 300000), // 5분 전
        status: 'active',
        assignee: '박시스템',
        estimatedImpact: '서비스 중단 위험',
        suggestedActions: [
          '서버 리소스 확장',
          '불필요한 프로세스 종료',
          '로드 밸런싱 재구성'
        ]
      },
      {
        id: 'security-1',
        type: 'security',
        severity: 'high',
        title: '보안 위협 감지',
        description: '비정상적인 접근 시도가 감지되었습니다.',
        timestamp: new Date(Date.now() - 900000), // 15분 전
        status: 'acknowledged',
        assignee: '이보안',
        estimatedImpact: '데이터 유출 위험',
        suggestedActions: [
          'IP 차단 및 접근 제한',
          '보안 로그 상세 분석',
          '관련 시스템 점검'
        ]
      },
      {
        id: 'resource-1',
        type: 'resource',
        severity: 'medium',
        title: '인력 부족 경고',
        description: '개발팀의 업무량이 평균 90%를 초과했습니다.',
        timestamp: new Date(Date.now() - 1800000), // 30분 전
        status: 'active',
        assignee: '최관리',
        estimatedImpact: '품질 저하 위험',
        suggestedActions: [
          '업무 재분배',
          '외부 인력 충원 검토',
          '우선순위 재조정'
        ]
      }
    );

    return items.sort((a, b) => {
      // 심각도 순으로 정렬
      const severityOrder = { critical: 3, high: 2, medium: 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      // 시간 순으로 정렬
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }, [projects]);

  // 필터링된 항목
  const filteredItems = useMemo(() => {
    return urgentItems.filter(item => {
      switch (activeFilter) {
        case 'critical':
          return item.severity === 'critical';
        case 'unresolved':
          return item.status === 'active';
        default:
          return true;
      }
    });
  }, [urgentItems, activeFilter]);

  // 통계
  const stats = useMemo(() => {
    const critical = urgentItems.filter(item => item.severity === 'critical').length;
    const high = urgentItems.filter(item => item.severity === 'high').length;
    const unresolved = urgentItems.filter(item => item.status === 'active').length;
    const total = urgentItems.length;

    return { critical, high, unresolved, total };
  }, [urgentItems]);

  // 자동 새로고침
  useEffect(() => {
    if (!autoRefresh || !open) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // 30초마다

    return () => clearInterval(interval);
  }, [autoRefresh, open]);

  // 타입별 아이콘
  const getTypeIcon = (type: UrgentItem['type']) => {
    switch (type) {
      case 'budget': return <DollarSign className="h-5 w-5" />;
      case 'schedule': return <Calendar className="h-5 w-5" />;
      case 'quality': return <Shield className="h-5 w-5" />;
      case 'resource': return <Users className="h-5 w-5" />;
      case 'security': return <Shield className="h-5 w-5" />;
      case 'system': return <Activity className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  // 심각도 색상
  const getSeverityColor = (severity: UrgentItem['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // 상태 색상
  const getStatusColor = (status: UrgentItem['status']) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800 border-red-200';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'escalated': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 액션 처리
  const handleAction = (actionType: string, itemId: string) => {
    onUrgentAction?.(actionType, itemId);
    
    // 햅틱 피드백 - Vercel 호환
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(100);
      } catch (error) {
        console.warn('Vibration failed:', error);
      }
    }
  };

  return (
    <NativeModal open={open} onClose={onClose} fullScreen>
      <NativeModalHeader>
        <NativeModalTitle showCloseButton onClose={onClose}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600 animate-pulse" />
            <span>🚨 긴급 상황 센터</span>
          </div>
        </NativeModalTitle>
        
        {/* 실시간 상태 */}
        <div className="flex items-center justify-between mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-red-800">실시간 모니터링</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`h-8 ${autoRefresh ? 'text-green-600' : 'text-gray-600'}`}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
              자동새로고침
            </Button>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(lastUpdate, { addSuffix: true, locale: ko })} 업데이트
            </span>
          </div>
        </div>

        {/* 통계 요약 */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-red-600">{stats.critical}</div>
            <div className="text-xs text-red-600">치명적</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-orange-600">{stats.high}</div>
            <div className="text-xs text-orange-600">높음</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-yellow-600">{stats.unresolved}</div>
            <div className="text-xs text-yellow-600">미해결</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-gray-600">{stats.total}</div>
            <div className="text-xs text-gray-600">전체</div>
          </div>
        </div>

        {/* 필터 버튼 */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('all')}
            className="flex-1"
          >
            전체 ({stats.total})
          </Button>
          <Button
            variant={activeFilter === 'critical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('critical')}
            className="flex-1"
          >
            치명적 ({stats.critical})
          </Button>
          <Button
            variant={activeFilter === 'unresolved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('unresolved')}
            className="flex-1"
          >
            미해결 ({stats.unresolved})
          </Button>
        </div>
      </NativeModalHeader>

      <NativeModalContent>
        <div className="space-y-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const TypeIcon = () => getTypeIcon(item.type);
              
              return (
                <div
                  key={item.id}
                  className={`rounded-xl p-4 border-2 ${
                    item.severity === 'critical' 
                      ? 'bg-red-50 border-red-200' 
                      : item.severity === 'high'
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-yellow-50 border-yellow-200'
                  } ${item.severity === 'critical' ? 'animate-pulse' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {/* 아이콘 */}
                    <div className={`p-2 rounded-lg ${getSeverityColor(item.severity)}`}>
                      <TypeIcon />
                    </div>

                    {/* 내용 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-800">{item.title}</h4>
                        <Badge className={`text-xs px-2 py-0.5 ${getSeverityColor(item.severity)}`}>
                          {item.severity === 'critical' ? '치명적' :
                           item.severity === 'high' ? '높음' : '보통'}
                        </Badge>
                        <Badge className={`text-xs px-2 py-0.5 border ${getStatusColor(item.status)}`}>
                          {item.status === 'active' ? '활성' :
                           item.status === 'acknowledged' ? '확인됨' :
                           item.status === 'resolved' ? '해결됨' : '에스컬레이션'}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-700 mb-2">{item.description}</p>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        {item.projectName && (
                          <span>📁 {item.projectName}</span>
                        )}
                        <span>👤 {item.assignee}</span>
                        <span>⏰ {formatDistanceToNow(item.timestamp, { addSuffix: true, locale: ko })}</span>
                      </div>

                      {/* 예상 영향 */}
                      <div className="bg-white rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingDown className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium text-gray-700">예상 영향</span>
                        </div>
                        <p className="text-sm text-red-600">{item.estimatedImpact}</p>
                      </div>

                      {/* 제안 액션 */}
                      <div className="bg-white rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-700">제안 액션</span>
                        </div>
                        <ul className="space-y-1">
                          {item.suggestedActions.map((action, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 액션 버튼들 */}
                      <div className="flex gap-2">
                        {item.status === 'active' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAction('acknowledge', item.id)}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              확인
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAction('resolve', item.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              해결
                            </Button>
                          </>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction('escalate', item.id)}
                        >
                          <AlertCircle className="h-3 w-3 mr-1" />
                          에스컬레이션
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction('contact', item.id)}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          연락
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {activeFilter === 'all' ? '긴급 상황이 없습니다!' :
                 activeFilter === 'critical' ? '치명적인 상황이 없습니다!' :
                 '미해결 상황이 없습니다!'}
              </h3>
              <p className="text-gray-600">모든 시스템이 정상적으로 운영되고 있습니다.</p>
            </div>
          )}
        </div>
      </NativeModalContent>
    </NativeModal>
  );
}
