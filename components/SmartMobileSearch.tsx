'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  X, 
  Filter,
  Clock,
  TrendingUp,
  Star,
  MapPin,
  User,
  Calendar,
  DollarSign,
  Zap,
  ArrowRight,
  History
} from 'lucide-react';
import { MobileDialog, MobileDialogContent, MobileDialogHeader, MobileDialogTitle } from '@/components/ui/mobile-dialog';
import { colors, animations } from '@/lib/design-system';

interface SmartMobileSearchProps {
  open: boolean;
  onClose: () => void;
  onSearch: (query: string, filters: any) => void;
  recentSearches?: string[];
  popularSearches?: string[];
  suggestions?: string[];
}

export default function SmartMobileSearch({
  open,
  onClose,
  onSearch,
  recentSearches = ['설비 점검', '건조기 프로젝트', '김팀장'],
  popularSearches = ['진행중 프로젝트', '예산 초과', '이번 주 일정'],
  suggestions = ['컨베이어 벨트', '온도 센서', '제어 시스템']
}: SmartMobileSearchProps) {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 검색 필터 옵션
  const filterOptions = [
    { id: 'status-progress', label: '진행중', icon: TrendingUp, color: 'blue' },
    { id: 'status-complete', label: '완료', icon: Star, color: 'green' },
    { id: 'status-urgent', label: '긴급', icon: Zap, color: 'red' },
    { id: 'this-week', label: '이번 주', icon: Calendar, color: 'purple' },
    { id: 'budget-over', label: '예산초과', icon: DollarSign, color: 'orange' },
    { id: 'my-projects', label: '내 프로젝트', icon: User, color: 'indigo' }
  ];

  // 자동 포커스
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // 실시간 검색
  useEffect(() => {
    if (query.length > 1) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        // 실제 검색 로직
        performSearch(query);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    // 모의 검색 결과
    const mockResults = [
      {
        type: 'project',
        title: '건조기 개조 프로젝트',
        subtitle: 'PJT-25001 • 진행중 80%',
        icon: TrendingUp,
        color: 'blue'
      },
      {
        type: 'person',
        title: '김기술 팀장',
        subtitle: '개발팀 • 5개 프로젝트 담당',
        icon: User,
        color: 'green'
      },
      {
        type: 'equipment',
        title: '컨베이어 벨트 점검',
        subtitle: '2024-03-15 • 완료',
        icon: Star,
        color: 'yellow'
      }
    ];
    
    setSearchResults(mockResults);
    setIsSearching(false);
  };

  const handleFilterToggle = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleQuickSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    onSearch(searchTerm, { filters: activeFilters });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, { filters: activeFilters });
      onClose();
    }
  };

  const getFilterColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
      indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <MobileDialog open={open} onOpenChange={onClose}>
      <MobileDialogContent className="h-full">
        <MobileDialogHeader className="border-b border-gray-200">
          <div className="flex items-center gap-3 w-full">
            {/* 검색 입력 */}
            <form onSubmit={handleSubmit} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="프로젝트, 담당자, 설비 검색..."
                  className="pl-10 pr-4 h-12 text-base border-0 bg-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                  style={{ fontSize: '16px' }} // 모바일 줌 방지
                />
                {query && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuery('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>

            {/* 필터 버튼 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-12 px-4 ${activeFilters.length > 0 ? 'bg-blue-50 border-blue-200' : ''}`}
            >
              <Filter className="h-5 w-5" />
              {activeFilters.length > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-blue-500">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>

            {/* 닫기 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-12 w-12 p-0"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </MobileDialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* 필터 패널 */}
          {showFilters && (
            <div className="border-b border-gray-200 p-4 bg-gray-50">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">빠른 필터</h3>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map((filter) => {
                    const isActive = activeFilters.includes(filter.id);
                    const FilterIcon = filter.icon;
                    
                    return (
                      <Button
                        key={filter.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleFilterToggle(filter.id)}
                        className={`h-9 px-3 ${
                          isActive 
                            ? getFilterColor(filter.color)
                            : 'bg-white border-gray-200 text-gray-600'
                        }`}
                      >
                        <FilterIcon className="h-4 w-4 mr-2" />
                        {filter.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {activeFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveFilters([])}
                  className="text-gray-500 h-8 px-2"
                >
                  필터 초기화
                </Button>
              )}
            </div>
          )}

          {/* 검색 결과 */}
          {query.length > 1 && (
            <div className="p-4">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">검색 중...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">검색 결과</h3>
                  {searchResults.map((result, index) => {
                    const ResultIcon = result.icon;
                    return (
                      <button
                        key={index}
                        className="w-full p-3 text-left bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        onClick={() => handleQuickSearch(result.title)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getFilterColor(result.color)}`}>
                            <ResultIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 truncate">
                              {result.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {result.subtitle}
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">검색 결과가 없습니다</p>
                </div>
              )}
            </div>
          )}

          {/* 기본 상태 (검색어 없을 때) */}
          {query.length <= 1 && (
            <div className="p-4 space-y-6">
              {/* 최근 검색어 */}
              {recentSearches.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <History className="h-4 w-4" />
                    최근 검색어
                  </h3>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        className="w-full p-3 text-left bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        onClick={() => handleQuickSearch(search)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">{search}</span>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 인기 검색어 */}
              {popularSearches.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    인기 검색어
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickSearch(search)}
                        className="h-9 px-3 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-purple-100"
                      >
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* 추천 검색어 */}
              {suggestions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">추천 검색어</h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickSearch(suggestion)}
                        className="h-9 px-3 text-gray-600 hover:bg-gray-50"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </MobileDialogContent>
    </MobileDialog>
  );
}
