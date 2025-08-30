'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  X, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  DollarSign,
  Settings,
  Trash2,
  MoreHorizontal,
  Filter
} from 'lucide-react';
import { MobileDialog, MobileDialogContent, MobileDialogHeader, MobileDialogTitle } from '@/components/ui/mobile-dialog';
import { colors, animations } from '@/lib/design-system';

interface Notification {
  id: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  category: 'project' | 'schedule' | 'budget' | 'system';
  actionUrl?: string;
  relatedId?: string;
}

interface MobileNotificationCenterProps {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onNotificationAction: (notification: Notification) => void;
}

export default function MobileNotificationCenter({
  open,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onNotificationAction
}: MobileNotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 알림 타입별 아이콘 및 색상
  const getNotificationConfig = (type: string) => {
    switch (type) {
      case 'urgent':
        return { 
          icon: AlertTriangle, 
          color: 'bg-red-100 text-red-700 border-red-200',
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600'
        };
      case 'warning':
        return { 
          icon: Clock, 
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          bgColor: 'bg-yellow-50',
          iconColor: 'text-yellow-600'
        };
      case 'success':
        return { 
          icon: CheckCircle2, 
          color: 'bg-green-100 text-green-700 border-green-200',
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600'
        };
      default:
        return { 
          icon: Bell, 
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600'
        };
    }
  };

  // 카테고리별 아이콘
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'project': return User;
      case 'schedule': return Calendar;
      case 'budget': return DollarSign;
      case 'system': return Settings;
      default: return Bell;
    }
  };

  // 필터링된 알림
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.isRead) return false;
    if (filter === 'urgent' && notification.type !== 'urgent') return false;
    if (selectedCategory !== 'all' && notification.category !== selectedCategory) return false;
    return true;
  });

  // 시간 포맷팅
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentCount = notifications.filter(n => n.type === 'urgent').length;

  return (
    <MobileDialog open={open} onOpenChange={onClose}>
      <MobileDialogContent className="h-full">
        <MobileDialogHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between w-full">
            <MobileDialogTitle className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-blue-600" />
              알림센터
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white h-6 w-6 p-0 flex items-center justify-center text-xs">
                  {unreadCount}
                </Badge>
              )}
            </MobileDialogTitle>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* 필터 버튼들 */}
          <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="flex-shrink-0 h-8"
            >
              전체 ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
              className="flex-shrink-0 h-8"
            >
              읽지않음 ({unreadCount})
            </Button>
            <Button
              variant={filter === 'urgent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('urgent')}
              className="flex-shrink-0 h-8 bg-red-50 text-red-700 border-red-200"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              긴급 ({urgentCount})
            </Button>
          </div>
        </MobileDialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* 액션 바 */}
          {filteredNotifications.length > 0 && (
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 z-10">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {filteredNotifications.length}개의 알림
                </div>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onMarkAllAsRead}
                      className="h-8 px-3 text-xs"
                    >
                      모두 읽음
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 알림 리스트 */}
          <div className="p-4 space-y-3">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => {
                const config = getNotificationConfig(notification.type);
                const NotificationIcon = config.icon;
                const CategoryIcon = getCategoryIcon(notification.category);

                return (
                  <div
                    key={notification.id}
                    className={`relative p-4 rounded-xl border transition-all duration-200 ${
                      notification.isRead 
                        ? 'bg-white border-gray-200' 
                        : `${config.bgColor} border-gray-300 shadow-sm`
                    }`}
                    onClick={() => onNotificationAction(notification)}
                  >
                    {/* 읽지 않음 표시 */}
                    {!notification.isRead && (
                      <div className="absolute top-3 right-3 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    )}

                    <div className="flex items-start gap-3">
                      {/* 아이콘 */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.color}`}>
                        <NotificationIcon className="h-5 w-5" />
                      </div>

                      {/* 내용 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold text-sm ${
                            notification.isRead ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h4>
                          <CategoryIcon className="h-3 w-3 text-gray-400" />
                        </div>
                        
                        <p className={`text-sm leading-relaxed ${
                          notification.isRead ? 'text-gray-500' : 'text-gray-700'
                        }`}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {formatTime(notification.timestamp)}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMarkAsRead(notification.id);
                                }}
                                className="h-6 px-2 text-xs text-blue-600 hover:bg-blue-50"
                              >
                                읽음
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteNotification(notification.id);
                              }}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  알림이 없습니다
                </h3>
                <p className="text-gray-500">
                  {filter === 'unread' 
                    ? '모든 알림을 확인했습니다' 
                    : filter === 'urgent'
                    ? '긴급 알림이 없습니다'
                    : '새로운 알림이 도착하면 여기에 표시됩니다'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 하단 액션 */}
        {filteredNotifications.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  // 알림 설정 페이지로 이동
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                알림 설정
              </Button>
              
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  // 모든 알림 삭제 확인
                  if (confirm('모든 알림을 삭제하시겠습니까?')) {
                    filteredNotifications.forEach(n => onDeleteNotification(n.id));
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                전체 삭제
              </Button>
            </div>
          </div>
        )}
      </MobileDialogContent>
    </MobileDialog>
  );
}
