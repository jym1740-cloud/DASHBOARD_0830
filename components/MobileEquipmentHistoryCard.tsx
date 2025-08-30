'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Calendar, User, Wrench, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface EquipmentHistory {
  id: string;
  date: string;
  part: string;
  content: string;
  action: string;
  manager: string;
  status?: 'completed' | 'in-progress' | 'pending';
}

interface MobileEquipmentHistoryCardProps {
  history: EquipmentHistory;
  onEdit: (history: EquipmentHistory) => void;
  onDelete: (id: string) => void;
}

export default function MobileEquipmentHistoryCard({ 
  history, 
  onEdit, 
  onDelete 
}: MobileEquipmentHistoryCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusInfo = (status: string = 'pending') => {
    switch (status) {
      case 'completed':
        return { 
          icon: CheckCircle, 
          color: 'bg-green-100 text-green-700 border-green-200', 
          text: '완료' 
        };
      case 'in-progress':
        return { 
          icon: Clock, 
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200', 
          text: '진행중' 
        };
      default:
        return { 
          icon: AlertCircle, 
          color: 'bg-red-100 text-red-700 border-red-200', 
          text: '대기' 
        };
    }
  };

  const statusInfo = getStatusInfo(history.status);
  const StatusIcon = statusInfo.icon;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MM월 dd일', { locale: ko });
    } catch {
      return dateString;
    }
  };

  const getPartEmoji = (part: string) => {
    switch (part) {
      case '기구': return '⚙️';
      case '제어': return '🔌';
      default: return '🔧';
    }
  };

  return (
    <Card className="mb-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {formatDate(history.date)}
            </span>
          </div>
          <Badge className={`${statusInfo.color} border`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusInfo.text}
          </Badge>
        </div>

        {/* 파트 및 담당자 */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1">
            <span className="text-lg">{getPartEmoji(history.part)}</span>
            <span className="text-sm text-gray-600">{history.part}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{history.manager || '미지정'}</span>
          </div>
        </div>

        {/* 문제 내용 (요약) */}
        <div className="mb-3">
          <div className="text-sm font-medium text-gray-800 mb-1">문제 상황</div>
          <p className="text-sm text-gray-600" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {history.content || '내용이 입력되지 않았습니다.'}
          </p>
        </div>

        {/* 상세 정보 (접기/펼치기) */}
        {showDetails && (
          <div className="mb-3 pt-3 border-t border-gray-100">
            <div className="text-sm font-medium text-gray-800 mb-1">조치 내용</div>
            <p className="text-sm text-gray-600">
              {history.action || '조치 내용이 입력되지 않았습니다.'}
            </p>
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            {showDetails ? '간단히 보기' : '자세히 보기'}
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(history)}
              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('이 이력을 삭제하시겠습니까?')) {
                  onDelete(history.id);
                }
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
