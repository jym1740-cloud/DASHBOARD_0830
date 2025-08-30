'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Bell, 
  User, 
  Menu,
  X,
  Settings,
  LogOut,
  HelpCircle,
  Zap,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { colors, spacing, touchTargets, animations } from '@/lib/design-system';
import SmartActionBar from '@/components/SmartActionBar';

interface MobileHeaderProps {
  onSearchOpen: () => void;
  onMenuOpen: () => void;
  onNotificationOpen: () => void;
  notifications?: number;
  userName?: string;
  // 스마트 액션 바 관련
  onOverviewOpen?: () => void;
  onScheduleOpen?: () => void;
  onPersonnelOpen?: () => void;
  onUrgentOpen?: () => void;
  onQuickActionsOpen?: () => void;
  totalProjects?: number;
  urgentCount?: number;
  todayTasks?: number;
  activePersonnel?: number;
}

export default function MobileHeader({ 
  onSearchOpen, 
  onMenuOpen, 
  onNotificationOpen,
  notifications = 0,
  userName = "사용자",
  // 스마트 액션 바 관련
  onOverviewOpen,
  onScheduleOpen,
  onPersonnelOpen,
  onUrgentOpen,
  onQuickActionsOpen,
  totalProjects = 0,
  urgentCount = 0,
  todayTasks = 0,
  activePersonnel = 0
}: MobileHeaderProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [quickStatsOpen, setQuickStatsOpen] = useState(false);

  return (
    <>
      {/* 메인 헤더 */}
      <header 
        className="sticky top-0 z-50 bg-white border-b border-gray-200"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* 좌측: 로고 & 메뉴 */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuOpen}
              className="p-2"
              style={{ minHeight: touchTargets.comfortable }}
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">PNT</h1>
                <p className="text-xs text-gray-500 -mt-1">Dashboard</p>
              </div>
            </div>
          </div>

          {/* 우측: 액션 버튼들 */}
          <div className="flex items-center gap-2">
            {/* 빠른 통계 토글 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuickStatsOpen(!quickStatsOpen)}
              className="p-2 relative"
            >
              <TrendingUp className="h-5 w-5 text-gray-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </Button>

            {/* 검색 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onSearchOpen}
              className="p-2"
              style={{ minHeight: touchTargets.comfortable }}
            >
              <Search className="h-5 w-5 text-gray-600" />
            </Button>

            {/* 알림 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onNotificationOpen}
              className="p-2 relative"
              style={{ minHeight: touchTargets.comfortable }}
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {notifications > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white animate-pulse"
                >
                  {notifications > 9 ? '9+' : notifications}
                </Badge>
              )}
            </Button>

            {/* 프로필 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="p-2 relative"
              style={{ minHeight: touchTargets.comfortable }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {userName.charAt(0)}
                </span>
              </div>
            </Button>
          </div>
        </div>

        {/* 빠른 통계 패널 */}
        {quickStatsOpen && (
          <div 
            className="border-t border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3"
            style={{ animation: `${animations.fast} ease-out` }}
          >
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">5</div>
                <div className="text-xs text-gray-600">진행중</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">12</div>
                <div className="text-xs text-gray-600">완료</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">2</div>
                <div className="text-xs text-gray-600">지연</div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 프로필 드롭다운 메뉴 */}
      {profileMenuOpen && (
        <>
          {/* 오버레이 */}
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-20"
            onClick={() => setProfileMenuOpen(false)}
          />
          
          {/* 메뉴 */}
          <div 
            className="fixed top-16 right-4 z-50 bg-white rounded-xl shadow-xl border border-gray-200 py-2 min-w-48"
            style={{ 
              animation: `${animations.fast} ease-out`,
              marginTop: 'env(safe-area-inset-top)'
            }}
          >
            {/* 사용자 정보 */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {userName.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{userName}</div>
                  <div className="text-sm text-gray-500">관리자</div>
                </div>
              </div>
            </div>

            {/* 메뉴 항목들 */}
            <div className="py-2">
              <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">프로필 설정</span>
              </button>
              
              <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors">
                <Settings className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">환경 설정</span>
              </button>
              
              <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors">
                <HelpCircle className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">도움말</span>
              </button>
              
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 transition-colors text-red-600">
                  <LogOut className="h-5 w-5" />
                  <span>로그아웃</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 스마트 액션 바 */}
      <SmartActionBar
        onOverviewOpen={onOverviewOpen || (() => {})}
        onScheduleOpen={onScheduleOpen || (() => {})}
        onPersonnelOpen={onPersonnelOpen || (() => {})}
        onUrgentOpen={onUrgentOpen || (() => {})}
        onQuickActionsOpen={onQuickActionsOpen || (() => {})}
        totalProjects={totalProjects}
        urgentCount={urgentCount}
        todayTasks={todayTasks}
        activePersonnel={activePersonnel}
      />
    </>
  );
}
