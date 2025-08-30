'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileDialog, MobileDialogContent, MobileDialogHeader, MobileDialogTitle, MobileDialogFooter } from '@/components/ui/mobile-dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Zap, Edit, Clock, User, AlertTriangle } from 'lucide-react';

interface Project {
  id: string;
  pjtNo: string;
  name: string;
  status: string;
  pm: string;
  progress: number;
  startDate: string;
  endDate: string;
}

interface QuickProjectEditFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  project: Project | null;
}

export default function QuickProjectEditForm({
  open,
  onClose,
  onSave,
  project
}: QuickProjectEditFormProps) {
  const [formData, setFormData] = useState<Project>(() => 
    project || {
      id: '',
      pjtNo: '',
      name: '',
      status: '계획',
      pm: '',
      progress: 0,
      startDate: '',
      endDate: ''
    }
  );

  const [currentMode, setCurrentMode] = useState<'quick' | 'detailed'>('quick');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 폼 데이터 업데이트
  const handleInputChange = (field: keyof Project, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 실시간 검증
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 폼 검증
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.pjtNo.trim()) {
      newErrors.pjtNo = '프로젝트 번호는 필수입니다';
    }
    if (!formData.name.trim()) {
      newErrors.name = '프로젝트명은 필수입니다';
    }
    if (!formData.pm.trim()) {
      newErrors.pm = '담당자는 필수입니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 저장 처리
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // 실제 저장 로직 (시뮬레이션)
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSave(formData);
      onClose();
    } catch (error) {
      console.error('저장 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 프로젝트 데이터 업데이트
  React.useEffect(() => {
    if (project) {
      setFormData(project);
    }
  }, [project]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '완료': return 'bg-green-100 text-green-700 border-green-200';
      case '진행 중': return 'bg-blue-100 text-blue-700 border-blue-200';
      case '진행 중(관리필요)': return 'bg-red-100 text-red-700 border-red-200';
      case '일시 중단': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <MobileDialog open={open} onOpenChange={onClose}>
      <MobileDialogContent>
        <MobileDialogHeader>
          <MobileDialogTitle>
            {currentMode === 'quick' ? '⚡ 빠른 수정' : '📝 상세 편집'}
          </MobileDialogTitle>
        </MobileDialogHeader>

        <div className="mobile-modal-content">
          {/* 모드 선택 */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={currentMode === 'quick' ? 'default' : 'outline'}
              onClick={() => setCurrentMode('quick')}
              className="flex-1"
              size="sm"
            >
              <Zap className="h-4 w-4 mr-2" />
              빠른 수정
            </Button>
            <Button
              variant={currentMode === 'detailed' ? 'default' : 'outline'}
              onClick={() => setCurrentMode('detailed')}
              className="flex-1"
              size="sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              상세 편집
            </Button>
          </div>

          {/* 프로젝트 정보 헤더 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                {formData.pjtNo || '프로젝트 번호'}
              </span>
              <Badge className={getStatusColor(formData.status)}>
                {formData.status}
              </Badge>
            </div>
            <h3 className="font-semibold text-gray-800">
              {formData.name || '프로젝트명'}
            </h3>
          </div>

          {/* 빠른 수정 모드 */}
          {currentMode === 'quick' && (
            <div className="space-y-4">
              <div className="mobile-input-group">
                <Label className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  상태 변경
                </Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="계획">📋 계획</SelectItem>
                    <SelectItem value="진행 중">🔄 진행 중</SelectItem>
                    <SelectItem value="진행 중(관리필요)">⚠️ 진행 중(관리필요)</SelectItem>
                    <SelectItem value="일시 중단">⏸️ 일시 중단</SelectItem>
                    <SelectItem value="완료">✅ 완료</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mobile-input-group">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  담당자 변경
                </Label>
                <Input
                  value={formData.pm}
                  onChange={(e) => handleInputChange('pm', e.target.value)}
                  placeholder="담당자 이름"
                  className={errors.pm ? 'border-red-500' : ''}
                />
                {errors.pm && (
                  <p className="text-xs text-red-500 mt-1">{errors.pm}</p>
                )}
              </div>

              <div className="mobile-input-group">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  진행률 조정
                </Label>
                <div className="flex items-center gap-3">
                  <input
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
              </div>
            </div>
          )}

          {/* 상세 편집 모드 */}
          {currentMode === 'detailed' && (
            <div className="space-y-4">
              <div className="mobile-input-group">
                <Label>프로젝트 번호 <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.pjtNo}
                  onChange={(e) => handleInputChange('pjtNo', e.target.value)}
                  placeholder="예: PJT-25001"
                  className={errors.pjtNo ? 'border-red-500' : ''}
                />
                {errors.pjtNo && (
                  <p className="text-xs text-red-500 mt-1">{errors.pjtNo}</p>
                )}
              </div>

              <div className="mobile-input-group">
                <Label>프로젝트명 <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="프로젝트 이름"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="mobile-input-group">
                  <Label>시작일</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>
                <div className="mobile-input-group">
                  <Label>종료일</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <MobileDialogFooter>
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="flex-1 mobile-modal-button"
            disabled={isLoading}
          >
            <XCircle className="h-5 w-5 mr-2" />
            취소
          </Button>
          <Button 
            onClick={handleSave} 
            className="flex-1 mobile-modal-button bg-blue-600 hover:bg-blue-700 text-white"
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
                {currentMode === 'quick' ? '빠른 저장' : '저장하기'}
              </>
            )}
          </Button>
        </MobileDialogFooter>
      </MobileDialogContent>
    </MobileDialog>
  );
}
