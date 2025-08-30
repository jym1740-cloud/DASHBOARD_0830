'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  Plus,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  MoreHorizontal,
  Zap
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';

interface MobileGanttChartProps {
  scheduleItems: any[];
  people: Array<{ id: string; name: string; affiliation: string; department: string }>;
  managerStatuses: Record<string, Record<string, string>>;
  onScheduleItemUpdate: (id: string, field: string, value: any) => void;
  onScheduleItemDelete: (id: string) => void;
  onScheduleItemAdd: () => void;
  onPersonUpdate: (index: number, field: string, value: string) => void;
  onPersonAdd: () => void;
  onStatusUpdate: (managerId: string, dateKey: string, status: string) => void;
  onSave: () => void;
}

export default function MobileGanttChart({
  scheduleItems,
  people,
  managerStatuses,
  onScheduleItemUpdate,
  onScheduleItemDelete,
  onScheduleItemAdd,
  onPersonUpdate,
  onPersonAdd,
  onStatusUpdate,
  onSave
}: MobileGanttChartProps) {
  const [activeTab, setActiveTab] = useState<'schedule' | 'personnel'>('schedule');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  // 현재 월의 날짜들 (간단한 버전)
  const monthDays = useMemo(() => {
    return [];
  }, [currentMonth]);

  // 현재 월의 일정 항목들
  const currentMonthSchedule = useMemo(() => {
    return scheduleItems.filter(item => {
      if (!item.startDate) return false;
      const itemDate = new Date(item.startDate);
      return itemDate.getMonth() === currentMonth.getMonth() && 
             itemDate.getFullYear() === currentMonth.getFullYear();
    }).sort((a, b) => {
      const dateA = new Date(a.startDate || '');
      const dateB = new Date(b.startDate || '');
      return dateA.getTime() - dateB.getTime();
    });
  }, [scheduleItems, currentMonth]);

  // 진행률에 따른 색상
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 80) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  // 상태에 따른 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case '출근': return 'bg-green-500';
      case '휴무': return 'bg-red-500';
      case '이동': return 'bg-yellow-500';
      default: return 'bg-gray-300';
    }
  };

  // 빠른 액션 핸들러
  const handleQuickAction = (item: any, action: string) => {
    switch (action) {
      case 'complete':
        onScheduleItemUpdate(item.id, 'progress', 100);
        break;
      case 'delay':
        const newEndDate = new Date(item.endDate);
        newEndDate.setDate(newEndDate.getDate() + 7);
        onScheduleItemUpdate(item.id, 'endDate', format(newEndDate, 'yyyy-MM-dd'));
        break;
      case 'pause':
        onScheduleItemUpdate(item.id, 'status', 'paused');
        break;
    }
    setQuickActionOpen(false);
  };

  // 월 네비게이션 (간단한 버전)
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  return (
    <div className="space-y-4">
      {/* 탭 네비게이션 */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <Button
          variant={activeTab === 'schedule' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('schedule')}
          className="flex-1 h-10"
        >
          <Calendar className="h-4 w-4 mr-2" />
          프로젝트 일정
        </Button>
        <Button
          variant={activeTab === 'personnel' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('personnel')}
          className="flex-1 h-10"
        >
          <User className="h-4 w-4 mr-2" />
          인원 투입
        </Button>
      </div>

      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('prev')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800">
            {format(currentMonth, 'yyyy년 M월')}
          </h3>
          <p className="text-sm text-gray-500">
            {activeTab === 'schedule' 
              ? `${currentMonthSchedule.length}개 일정` 
              : `${people.length}명 투입`
            }
          </p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('next')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 프로젝트 일정 탭 */}
      {activeTab === 'schedule' && (
        <div className="mobile-gantt-tab-content space-y-3">
          {currentMonthSchedule.length > 0 ? (
            currentMonthSchedule.map((item) => (
              <Card key={item.id} className="mobile-gantt-card shadow-sm">
                <CardContent className="p-4">
                  {/* 헤더 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">
                        {item.name || '제목 없음'}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {item.startDate && format(new Date(item.startDate), 'M/d')}
                          {item.endDate && ` ~ ${format(new Date(item.endDate), 'M/d')}`}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedItem(item);
                        setQuickActionOpen(true);
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* 진행률 표시 */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">진행률</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {item.progress || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`mobile-gantt-progress h-2 rounded-full ${getProgressColor(item.progress || 0)}`}
                        style={{ width: `${item.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* 빠른 액션 버튼들 */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleQuickAction(item, 'complete')}
                      disabled={item.progress >= 100}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      완료
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleQuickAction(item, 'delay')}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      지연
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleQuickAction(item, 'pause')}
                    >
                      <Pause className="h-4 w-4 mr-1" />
                      중단
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 mb-4">
                {format(currentMonth, 'M월')}에 예정된 일정이 없습니다
              </p>
              <Button onClick={onScheduleItemAdd} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                일정 추가하기
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 인원 투입 탭 */}
      {activeTab === 'personnel' && (
        <div className="mobile-gantt-tab-content space-y-3">
          {people.length > 0 ? (
            people.map((person, index) => (
              <Card key={person.id || index} className="shadow-sm">
                <CardContent className="p-4">
                  {/* 인원 정보 */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {person.name || '이름 없음'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {person.affiliation} • {person.department}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // 인원 상세 편집
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* 주간 상태 표시 */}
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      이번 주 상태
                    </div>
                    <div className="flex gap-1">
                      {['월', '화', '수', '목', '금', '토', '일'].map((day, dayIndex) => {
                        const today = new Date();
                        const weekStart = new Date(today);
                        weekStart.setDate(today.getDate() - today.getDay() + dayIndex);
                        const dateKey = format(weekStart, 'yyyy-MM-dd');
                        const status = managerStatuses[person.id]?.[dateKey] || '미정';
                        
                        return (
                          <div key={day} className="flex-1 text-center">
                            <div className="text-xs text-gray-600 mb-1">{day}</div>
                            <div
                              className={`mobile-gantt-status-dot h-8 rounded-md flex items-center justify-center text-xs font-medium text-white ${getStatusColor(status)}`}
                              onClick={() => {
                                // 상태 변경 로직
                                const newStatus = status === '출근' ? '휴무' : 
                                                status === '휴무' ? '이동' : 
                                                status === '이동' ? '미정' : '출근';
                                onStatusUpdate(person.id, dateKey, newStatus);
                              }}
                            >
                              {status === '출근' ? '✓' : 
                               status === '휴무' ? '✕' : 
                               status === '이동' ? '→' : '?'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 상태 범례 */}
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-green-500"></div>
                      <span>출근</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-red-500"></div>
                      <span>휴무</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-yellow-500"></div>
                      <span>이동</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-gray-300"></div>
                      <span>미정</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 mb-4">
                등록된 인원이 없습니다
              </p>
              <Button onClick={onPersonAdd} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                인원 추가하기
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 하단 액션 바 */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4">
        <div className="flex gap-2">
          {activeTab === 'schedule' ? (
            <>
              <Button
                onClick={onScheduleItemAdd}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                일정 추가
              </Button>
              <Button
                onClick={onSave}
                variant="outline"
                className="flex-1"
              >
                💾 저장
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={onPersonAdd}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                인원 추가
              </Button>
              <Button
                onClick={() => {
                  // 일괄 상태 변경
                }}
                variant="outline"
                className="flex-1"
              >
                <Zap className="h-4 w-4 mr-2" />
                일괄 변경
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 오늘 할 일 요약 (상단 고정) */}
      <div className="fixed top-20 left-4 right-4 z-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">오늘의 할 일</h3>
            <p className="text-sm opacity-90">
              {scheduleItems.filter(item => {
                if (!item.startDate) return false;
                const today = new Date();
                const itemDate = new Date(item.startDate);
                return itemDate.toDateString() === today.toDateString();
              }).length}개 일정 • {people.filter(person => {
                const today = format(new Date(), 'yyyy-MM-dd');
                return managerStatuses[person.id]?.[today] === '출근';
              }).length}명 출근
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={() => setCurrentMonth(new Date())}
          >
            오늘로
          </Button>
        </div>
      </div>
    </div>
  );
}
