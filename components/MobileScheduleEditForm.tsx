'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MobileDialog, MobileDialogContent, MobileDialogHeader, MobileDialogTitle, MobileDialogFooter } from '@/components/ui/mobile-dialog';
import { Calendar, CheckCircle2, XCircle, Edit3 } from 'lucide-react';

interface MobileScheduleEditFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  editingItem: any | null;
  isNew?: boolean;
}

export default function MobileScheduleEditForm({
  open,
  onClose,
  onSave,
  editingItem,
  isNew = false
}: MobileScheduleEditFormProps) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    startDate: '',
    endDate: '',
    progress: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 폼 데이터 초기화
  useEffect(() => {
    if (editingItem) {
      setFormData({
        id: editingItem.id || '',
        name: editingItem.name || '',
        startDate: editingItem.startDate || '',
        endDate: editingItem.endDate || '',
        progress: editingItem.progress || 0
      });
    } else if (isNew) {
      setFormData({
        id: `schedule_${Date.now()}`,
        name: '',
        startDate: '',
        endDate: '',
        progress: 0
      });
    }
  }, [editingItem, isNew]);

  // 입력 변경 핸들러
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 폼 검증
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '일정명은 필수입니다';
    }
    if (!formData.startDate) {
      newErrors.startDate = '시작일은 필수입니다';
    }
    if (!formData.endDate) {
      newErrors.endDate = '종료일은 필수입니다';
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = '종료일은 시작일보다 늦어야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 저장 핸들러
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // 저장 시뮬레이션
      onSave(formData);
      onClose();
    } catch (error) {
      console.error('저장 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileDialog open={open} onOpenChange={onClose}>
      <MobileDialogContent>
        <MobileDialogHeader>
          <MobileDialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            {isNew ? '새 일정 추가' : '일정 편집'}
          </MobileDialogTitle>
        </MobileDialogHeader>

        <div className="space-y-4 px-4">
          {/* 일정명 */}
          <div className="space-y-2">
            <Label htmlFor="name">
              일정명 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="예: 설비 점검, 회의 등"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* 날짜 입력 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">
                시작일 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && (
                <p className="text-xs text-red-500">{errors.startDate}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">
                종료일 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && (
                <p className="text-xs text-red-500">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* 진행률 */}
          <div className="space-y-2">
            <Label htmlFor="progress">
              진행률 ({formData.progress}%)
            </Label>
            <div className="flex items-center gap-3">
              <input
                id="progress"
                type="range"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => handleInputChange('progress', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium w-12 text-right">
                {formData.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  formData.progress >= 100 ? 'bg-green-500' :
                  formData.progress >= 80 ? 'bg-blue-500' :
                  formData.progress >= 50 ? 'bg-yellow-500' : 'bg-gray-400'
                }`}
                style={{ width: `${formData.progress}%` }}
              />
            </div>
          </div>

          {/* 기간 정보 */}
          {formData.startDate && formData.endDate && (
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm text-blue-700">
                <strong>기간:</strong> {(() => {
                  const start = new Date(formData.startDate);
                  const end = new Date(formData.endDate);
                  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  return `${days}일`;
                })()}
              </div>
            </div>
          )}
        </div>

        <MobileDialogFooter>
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="flex-1"
            disabled={isLoading}
          >
            <XCircle className="h-5 w-5 mr-2" />
            취소
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                저장 중...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                {isNew ? '추가하기' : '저장하기'}
              </>
            )}
          </Button>
        </MobileDialogFooter>
      </MobileDialogContent>
    </MobileDialog>
  );
}
