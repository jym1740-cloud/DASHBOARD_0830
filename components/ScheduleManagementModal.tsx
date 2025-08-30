'use client';

import React, { useState, useMemo } from 'react';
import { NativeModal, NativeModalHeader, NativeModalTitle, NativeModalContent } from '@/components/ui/native-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Square,
  RotateCcw
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isToday, isPast, isFuture } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ScheduleManagementModalProps {
  open: boolean;
  onClose: () => void;
  projects: any[];
  onScheduleUpdate?: (projectId: string, scheduleData: any) => void;
}

interface TaskItem {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  progress: number;
}

export default function ScheduleManagementModal({ 
  open, 
  onClose, 
  projects,
  onScheduleUpdate 
}: ScheduleManagementModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [filterStatus, setFilterStatus] = useState<'all' | 'today' | 'overdue' | 'upcoming'>('all');

  // 샘플 작업 데이터 생성
  const tasks: TaskItem[] = useMemo(() => {
    const sampleTasks: TaskItem[] = [];
    
    projects.forEach((project, projectIndex) => {
      // 각 프로젝트마다 3-5개의 작업 생성
      const taskCount = Math.floor(Math.random() * 3) + 3;
      
      for (let i = 0; i < taskCount; i++) {
        const startDate = addDays(new Date(), Math.floor(Math.random() * 14) - 7);
        const duration = Math.floor(Math.random() * 10) + 1;
        const endDate = addDays(startDate, duration);
        
        sampleTasks.push({
          id: `task-${projectIndex}-${i}`,
          projectId: project.id,
          projectName: project.name,
          title: [
            '요구사항 분석',
            '설계 검토',
            '개발 진행',
            '테스트 수행',
            '배포 준비',
            '문서 작성',
            '품질 검증',
            '사용자 교육'
          ][i % 8],
          startDate,
          endDate,
          status: ['pending', 'in-progress', 'completed', 'delayed'][Math.floor(Math.random() * 4)] as any,
          priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)] as any,
          assignee: ['김개발', '이설계', '박테스트', '최관리'][Math.floor(Math.random() * 4)],
          progress: Math.floor(Math.random() * 100)
        });
      }
    });
    
    return sampleTasks;
  }, [projects]);

  // 필터링된 작업
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      switch (filterStatus) {
        case 'today':
          return isToday(task.startDate) || isToday(task.endDate) || 
                 (task.startDate <= new Date() && task.endDate >= new Date());
        case 'overdue':
          return isPast(task.endDate) && task.status !== 'completed';
        case 'upcoming':
          return isFuture(task.startDate);
        default:
          return true;
      }
    });
  }, [tasks, filterStatus]);

  // 상태별 통계
  const stats = useMemo(() => {
    const today = filteredTasks.filter(task => 
      isToday(task.startDate) || isToday(task.endDate) || 
      (task.startDate <= new Date() && task.endDate >= new Date())
    ).length;
    
    const overdue = filteredTasks.filter(task => 
      isPast(task.endDate) && task.status !== 'completed'
    ).length;
    
    const completed = filteredTasks.filter(task => task.status === 'completed').length;
    const inProgress = filteredTasks.filter(task => task.status === 'in-progress').length;

    return { today, overdue, completed, inProgress };
  }, [filteredTasks]);

  // 작업 상태 업데이트
  const updateTaskStatus = (taskId: string, newStatus: TaskItem['status']) => {
    // 실제 구현에서는 상태 업데이트 로직
    console.log(`Task ${taskId} status updated to ${newStatus}`);
  };

  // 우선순위 색상
  const getPriorityColor = (priority: TaskItem['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // 상태 색상
  const getStatusColor = (status: TaskItem['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delayed': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 상태 아이콘
  const getStatusIcon = (status: TaskItem['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'in-progress': return <Play className="h-4 w-4" />;
      case 'delayed': return <AlertTriangle className="h-4 w-4" />;
      case 'pending': return <Pause className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <NativeModal open={open} onClose={onClose} fullScreen>
      <NativeModalHeader>
        <NativeModalTitle showCloseButton onClose={onClose}>
          📅 일정 관리 센터
        </NativeModalTitle>
        
        {/* 통계 요약 */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-600">{stats.today}</div>
            <div className="text-xs text-blue-600">오늘</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-red-600">{stats.overdue}</div>
            <div className="text-xs text-red-600">지연</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-green-600">완료</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-purple-600">{stats.inProgress}</div>
            <div className="text-xs text-purple-600">진행중</div>
          </div>
        </div>

        {/* 필터 버튼들 */}
        <div className="flex gap-2 mt-4 overflow-x-auto">
          {[
            { key: 'all', label: '전체', count: tasks.length },
            { key: 'today', label: '오늘', count: stats.today },
            { key: 'overdue', label: '지연', count: stats.overdue },
            { key: 'upcoming', label: '예정', count: tasks.filter(t => isFuture(t.startDate)).length }
          ].map(filter => (
            <Button
              key={filter.key}
              variant={filterStatus === filter.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(filter.key as any)}
              className="flex-shrink-0 h-8"
            >
              {filter.label}
              {filter.count > 0 && (
                <Badge className="ml-2 h-4 px-1 text-xs">
                  {filter.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </NativeModalHeader>

      <NativeModalContent>
        <div className="space-y-4">
          {/* 빠른 액션 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3">빠른 액션</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                새 작업 추가
              </Button>
              <Button size="sm" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                일정 보기
              </Button>
              <Button size="sm" variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                고급 필터
              </Button>
              <Button size="sm" variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                새로고침
              </Button>
            </div>
          </div>

          {/* 작업 목록 */}
          <div className="space-y-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-800">{task.title}</h4>
                        <Badge className={`text-xs px-2 py-0.5 ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{task.projectName}</div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>👤 {task.assignee}</span>
                        <span>📅 {format(task.startDate, 'MM/dd', { locale: ko })} - {format(task.endDate, 'MM/dd', { locale: ko })}</span>
                        <span>📊 {task.progress}%</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`text-xs px-2 py-1 border ${getStatusColor(task.status)}`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(task.status)}
                          <span>
                            {task.status === 'completed' ? '완료' :
                             task.status === 'in-progress' ? '진행중' :
                             task.status === 'delayed' ? '지연' : '대기'}
                          </span>
                        </div>
                      </Badge>
                    </div>
                  </div>

                  {/* 진행률 바 */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>진행률</span>
                      <span>{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'delayed' ? 'bg-red-500' :
                          task.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex gap-2">
                    {task.status !== 'completed' && (
                      <Button
                        size="sm"
                        onClick={() => updateTaskStatus(task.id, 'completed')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        완료
                      </Button>
                    )}
                    
                    {task.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateTaskStatus(task.id, 'in-progress')}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        시작
                      </Button>
                    )}
                    
                    {task.status === 'in-progress' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateTaskStatus(task.id, 'pending')}
                      >
                        <Pause className="h-3 w-3 mr-1" />
                        일시정지
                      </Button>
                    )}
                    
                    <Button size="sm" variant="ghost">
                      편집
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {filterStatus === 'all' ? '등록된 작업이 없습니다' : 
                   filterStatus === 'today' ? '오늘 할 작업이 없습니다' :
                   filterStatus === 'overdue' ? '지연된 작업이 없습니다' :
                   '예정된 작업이 없습니다'}
                </h3>
                <p className="text-gray-500 mb-4">새로운 작업을 추가해보세요.</p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  작업 추가하기
                </Button>
              </div>
            )}
          </div>
        </div>
      </NativeModalContent>
    </NativeModal>
  );
}
