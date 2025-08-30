'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  DollarSign, 
  User, 
  MapPin, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Edit3,
  MoreVertical,
  Star,
  Flag,
  Eye,
  MessageSquare
} from 'lucide-react';
import { Project } from '@/lib/types';
import { getCurrentCostRatio, getCostRatioColorClass } from '@/lib/utils';
import { colors, spacing, touchTargets, animations } from '@/lib/design-system';

interface EnhancedMobileProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onQuickEdit?: (project: Project) => void;
  onSchedule: (project: Project) => void;
  onEquipmentHistory: (project: Project) => void;
  onCostHistory: (project: Project) => void;
  onDelete: (id: string) => void;
  onFavorite?: (id: string) => void;
  onComment?: (project: Project) => void;
  isFavorite?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export default function EnhancedMobileProjectCard({
  project,
  onEdit,
  onQuickEdit,
  onSchedule,
  onEquipmentHistory,
  onCostHistory,
  onDelete,
  onFavorite,
  onComment,
  isFavorite = false,
  priority = 'medium'
}: EnhancedMobileProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // 상태별 색상 및 아이콘
  const getStatusConfig = (status: string) => {
    switch (status) {
      case '완료':
        return { 
          color: 'bg-green-100 text-green-800 border-green-200', 
          icon: CheckCircle2,
          bgGradient: 'from-green-50 to-emerald-50'
        };
      case '진행 중':
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-200', 
          icon: TrendingUp,
          bgGradient: 'from-blue-50 to-cyan-50'
        };
      case '진행 중(관리필요)':
        return { 
          color: 'bg-red-100 text-red-800 border-red-200', 
          icon: AlertTriangle,
          bgGradient: 'from-red-50 to-pink-50'
        };
      case '일시 중단':
        return { 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
          icon: Clock,
          bgGradient: 'from-yellow-50 to-amber-50'
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-200', 
          icon: Clock,
          bgGradient: 'from-gray-50 to-slate-50'
        };
    }
  };

  // 우선순위별 색상
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-blue-500';
      case 'low': return 'border-l-gray-400';
      default: return 'border-l-gray-400';
    }
  };

  const statusConfig = getStatusConfig(project.status);
  const StatusIcon = statusConfig.icon;
  const costRatio = getCurrentCostRatio(project);

  return (
    <Card 
      className={`mb-4 overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 ${getPriorityColor(priority)} ${
        isExpanded ? 'shadow-lg' : 'shadow-sm'
      }`}
      style={{
        background: `linear-gradient(135deg, ${statusConfig.bgGradient})`,
        transform: isExpanded ? 'scale(1.02)' : 'scale(1)',
        transition: animations.normal
      }}
    >
      <CardContent className="p-0">
        {/* 메인 콘텐츠 영역 */}
        <div className="p-4">
          {/* 헤더 영역 */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              {/* 프로젝트 번호 & 즐겨찾기 */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded-md">
                  {project.pjtNo}
                </span>
                {isFavorite && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
                {priority === 'high' && (
                  <Flag className="h-4 w-4 text-red-500" />
                )}
              </div>
              
              {/* 프로젝트명 */}
              <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 truncate">
                {project.name}
              </h3>
              
              {/* 상태 & 진행률 */}
              <div className="flex items-center gap-3 mb-3">
                <Badge className={`${statusConfig.color} flex items-center gap-1 px-3 py-1`}>
                  <StatusIcon className="h-3 w-3" />
                  {project.status}
                </Badge>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-semibold">{project.progress || 0}%</span>
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex items-center gap-1 ml-2">
              {onFavorite && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFavorite(project.id)}
                  className="p-2 h-8 w-8"
                >
                  <Star className={`h-4 w-4 ${isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowActions(!showActions)}
                className="p-2 h-8 w-8"
              >
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
          </div>

          {/* 진행률 바 */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  project.progress >= 100 ? 'bg-green-500' :
                  project.progress >= 80 ? 'bg-blue-500' :
                  project.progress >= 50 ? 'bg-yellow-500' : 'bg-gray-400'
                }`}
                style={{ 
                  width: `${project.progress || 0}%`,
                  boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)'
                }}
              />
            </div>
          </div>

          {/* 핵심 정보 그리드 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* 담당자 */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-500">담당자</div>
                <div className="text-sm font-semibold text-gray-800">{project.pm}</div>
              </div>
            </div>

            {/* 예산 현황 */}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                costRatio > 80 ? 'bg-red-100' : costRatio > 60 ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                <DollarSign className={`h-4 w-4 ${
                  costRatio > 80 ? 'text-red-600' : costRatio > 60 ? 'text-yellow-600' : 'text-green-600'
                }`} />
              </div>
              <div>
                <div className="text-xs text-gray-500">예산 사용률</div>
                <div className={`text-sm font-semibold ${
                  costRatio > 80 ? 'text-red-600' : costRatio > 60 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {costRatio.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* 확장 정보 */}
          {isExpanded && (
            <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
              {/* 위치 정보 */}
              {project.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{project.location}</span>
                </div>
              )}

              {/* 일정 정보 */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  {project.startDate && new Date(project.startDate).toLocaleDateString()} ~ 
                  {project.endDate && new Date(project.endDate).toLocaleDateString()}
                </span>
              </div>

              {/* 메모 */}
              {project.note && (
                <div className="bg-white bg-opacity-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">메모</div>
                  <div className="text-sm text-gray-700 line-clamp-2">{project.note}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 액션 영역 */}
        {showActions && (
          <div className="border-t border-gray-200 bg-white bg-opacity-50 p-3">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {onQuickEdit && (
                <Button
                  onClick={() => onQuickEdit(project)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white h-10"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  빠른수정
                </Button>
              )}
              
              <Button
                onClick={() => onEdit(project)}
                variant="outline"
                size="sm"
                className="h-10"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                상세편집
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => onSchedule(project)}
                variant="outline"
                size="sm"
                className="text-xs h-9"
              >
                <Calendar className="h-3 w-3 mr-1" />
                일정
              </Button>
              
              <Button
                onClick={() => onCostHistory(project)}
                variant="outline"
                size="sm"
                className="text-xs h-9"
              >
                <DollarSign className="h-3 w-3 mr-1" />
                투입률
              </Button>
              
              <Button
                onClick={() => onEquipmentHistory(project)}
                variant="outline"
                size="sm"
                className="text-xs h-9"
              >
                <Eye className="h-3 w-3 mr-1" />
                이력
              </Button>
            </div>
          </div>
        )}

        {/* 하단 인터랙션 바 */}
        <div className="border-t border-gray-200 bg-white bg-opacity-30 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-gray-600 h-8 px-2"
              >
                {isExpanded ? '접기' : '더보기'}
              </Button>
              
              {onComment && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onComment(project)}
                  className="text-xs text-gray-600 h-8 px-2 flex items-center gap-1"
                >
                  <MessageSquare className="h-3 w-3" />
                  댓글
                </Button>
              )}
            </div>

            <div className="text-xs text-gray-500">
              {new Date(project.updatedAt || Date.now()).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
