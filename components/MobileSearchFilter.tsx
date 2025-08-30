"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, Check } from "lucide-react";

interface MobileSearchFilterProps {
  searchOpen: boolean;
  filterOpen: boolean;
  onSearchClose: () => void;
  onFilterClose: () => void;
  query: string;
  onQueryChange: (query: string) => void;
  statusFilter: string | undefined;
  onStatusFilterChange: (status: string | undefined) => void;
}

const STATUS_OPTIONS = [
  { value: undefined, label: '전체', color: 'bg-gray-100 text-gray-700' },
  { value: '계획', label: '계획', color: 'bg-blue-100 text-blue-700' },
  { value: '진행 중', label: '진행 중', color: 'bg-green-100 text-green-700' },
  { value: '진행 중(관리필요)', label: '관리필요', color: 'bg-red-100 text-red-700' },
  { value: '일시 중단', label: '일시 중단', color: 'bg-yellow-100 text-yellow-700' },
  { value: '완료', label: '완료', color: 'bg-gray-100 text-gray-700' }
];

export default function MobileSearchFilter({
  searchOpen,
  filterOpen,
  onSearchClose,
  onFilterClose,
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange
}: MobileSearchFilterProps) {
  const [tempQuery, setTempQuery] = useState(query);
  const [tempStatusFilter, setTempStatusFilter] = useState(statusFilter);

  const handleSearchApply = () => {
    onQueryChange(tempQuery);
    onSearchClose();
  };

  const handleFilterApply = () => {
    onStatusFilterChange(tempStatusFilter);
    onFilterClose();
  };

  const handleSearchClear = () => {
    setTempQuery('');
    onQueryChange('');
  };

  const handleFilterClear = () => {
    setTempStatusFilter(undefined);
    onStatusFilterChange(undefined);
  };

  return (
    <>
      {/* 검색 다이얼로그 */}
      <Dialog open={searchOpen} onOpenChange={onSearchClose}>
        <DialogContent className="mx-4 w-[calc(100vw-2rem)] max-w-none">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              프로젝트 검색
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={tempQuery}
                onChange={(e) => setTempQuery(e.target.value)}
                placeholder="프로젝트명, 번호, PM 이름으로 검색..."
                className="pl-10 text-base"
                autoFocus
              />
              {tempQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSearchClear}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* 최근 검색어 (향후 구현) */}
            <div className="text-sm text-gray-500">
              최근 검색: "Busan", "Seoul", "진행 중"
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={onSearchClose} variant="outline" className="flex-1">
                취소
              </Button>
              <Button onClick={handleSearchApply} className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                검색
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 필터 다이얼로그 */}
      <Dialog open={filterOpen} onOpenChange={onFilterClose}>
        <DialogContent className="mx-4 w-[calc(100vw-2rem)] max-w-none">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              필터 설정
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">프로젝트 상태</h3>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map((option) => (
                  <Button
                    key={option.label}
                    variant="outline"
                    onClick={() => setTempStatusFilter(option.value)}
                    className={`justify-start h-12 ${
                      tempStatusFilter === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {tempStatusFilter === option.value && (
                        <Check className="h-4 w-4" />
                      )}
                      <Badge className={`${option.color} border-0`}>
                        {option.label}
                      </Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
            
            {/* 추가 필터 옵션들 (향후 구현) */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">투입률</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-12 justify-start">
                  70% 이상
                </Button>
                <Button variant="outline" className="h-12 justify-start">
                  95% 이상
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={handleFilterClear} variant="outline" className="flex-1">
                초기화
              </Button>
              <Button onClick={handleFilterApply} className="flex-1">
                <Filter className="h-4 w-4 mr-2" />
                적용
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
