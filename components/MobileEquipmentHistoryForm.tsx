'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileDialog, MobileDialogContent, MobileDialogHeader, MobileDialogTitle, MobileDialogFooter } from '@/components/ui/mobile-dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Camera, Zap } from 'lucide-react';

interface EquipmentHistory {
  id: string;
  date: string;
  part: string;
  content: string;
  action: string;
  manager: string;
  status?: 'completed' | 'in-progress' | 'pending';
}

interface MobileEquipmentHistoryFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (history: EquipmentHistory) => void;
  editingHistory?: EquipmentHistory | null;
  isQuickAdd?: boolean;
}

export default function MobileEquipmentHistoryForm({
  open,
  onClose,
  onSave,
  editingHistory,
  isQuickAdd = false
}: MobileEquipmentHistoryFormProps) {
  const [formData, setFormData] = useState<EquipmentHistory>(() => ({
    id: editingHistory?.id || Math.random().toString(36).slice(2),
    date: editingHistory?.date || new Date().toISOString().split('T')[0],
    part: editingHistory?.part || '',
    content: editingHistory?.content || '',
    action: editingHistory?.action || '',
    manager: editingHistory?.manager || '',
    status: editingHistory?.status || 'pending'
  }));

  const [currentStep, setCurrentStep] = useState(0);

  const steps = isQuickAdd 
    ? [
        { title: '🚨 긴급 상황', fields: ['part', 'content'] },
        { title: '📝 기본 정보', fields: ['date', 'manager'] }
      ]
    : [
        { title: '📋 기본 정보', fields: ['date', 'part', 'manager'] },
        { title: '❗ 문제 상황', fields: ['content'] },
        { title: '🔧 조치 내용', fields: ['action', 'status'] }
      ];

  const handleInputChange = (field: keyof EquipmentHistory, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
    setCurrentStep(0);
  };

  const isStepValid = () => {
    const currentFields = steps[currentStep].fields;
    return currentFields.every(field => {
      if (field === 'content' || field === 'part') return formData[field as keyof EquipmentHistory]?.trim();
      return true;
    });
  };

  const renderField = (field: string) => {
    switch (field) {
      case 'date':
        return (
          <div className="mobile-input-group">
            <Label>📅 발생 날짜</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
          </div>
        );
      
      case 'part':
        return (
          <div className="mobile-input-group">
            <Label>🔧 설비 구분 <span className="text-red-500">*</span></Label>
            <Select value={formData.part} onValueChange={(value) => handleInputChange('part', value)}>
              <SelectTrigger>
                <SelectValue placeholder="설비 종류를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="기구">⚙️ 기계 부품</SelectItem>
                <SelectItem value="제어">🔌 전기/제어</SelectItem>
                <SelectItem value="기타">🔧 기타</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      
      case 'manager':
        return (
          <div className="mobile-input-group">
            <Label>👤 담당자</Label>
            <Input
              value={formData.manager}
              onChange={(e) => handleInputChange('manager', e.target.value)}
              placeholder="담당자 이름"
            />
          </div>
        );
      
      case 'content':
        return (
          <div className="mobile-input-group">
            <Label>❗ 문제 상황 <span className="text-red-500">*</span></Label>
            <Textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="어떤 문제가 발생했나요? 구체적으로 설명해주세요."
              className="min-h-[100px]"
            />
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                사진 첨부
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Zap className="h-4 w-4 mr-2" />
                템플릿
              </Button>
            </div>
          </div>
        );
      
      case 'action':
        return (
          <div className="mobile-input-group">
            <Label>🔧 조치 내용</Label>
            <Textarea
              value={formData.action}
              onChange={(e) => handleInputChange('action', e.target.value)}
              placeholder="어떤 조치를 취했나요? (선택사항)"
              className="min-h-[80px]"
            />
          </div>
        );
      
      case 'status':
        return (
          <div className="mobile-input-group">
            <Label>📊 처리 상태</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'pending', label: '대기', color: 'bg-red-100 text-red-700 border-red-200' },
                { value: 'in-progress', label: '진행중', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
                { value: 'completed', label: '완료', color: 'bg-green-100 text-green-700 border-green-200' }
              ].map(status => (
                <Button
                  key={status.value}
                  variant={formData.status === status.value ? "default" : "outline"}
                  onClick={() => handleInputChange('status', status.value)}
                  className={formData.status === status.value ? '' : 'border-gray-200'}
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <MobileDialog open={open} onOpenChange={onClose}>
      <MobileDialogContent>
        <MobileDialogHeader>
          <MobileDialogTitle>
            {editingHistory ? '설비 이력 수정' : isQuickAdd ? '긴급 이력 추가' : '설비 이력 추가'}
          </MobileDialogTitle>
        </MobileDialogHeader>

        <div className="mobile-modal-content">
          {/* 진행 단계 표시 */}
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* 현재 단계 제목 */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              {steps[currentStep].title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {currentStep + 1} / {steps.length} 단계
            </p>
          </div>

          {/* 현재 단계 필드들 */}
          <div className="space-y-4">
            {steps[currentStep].fields.map(field => (
              <div key={field}>
                {renderField(field)}
              </div>
            ))}
          </div>
        </div>

        <MobileDialogFooter>
          <div className="flex gap-3 w-full">
            {currentStep > 0 && (
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                className="flex-1 mobile-modal-button"
              >
                이전
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button 
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex-1 mobile-modal-button bg-blue-600 hover:bg-blue-700 text-white"
              >
                다음
              </Button>
            ) : (
              <Button 
                onClick={handleSave}
                className="flex-1 mobile-modal-button bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                저장하기
              </Button>
            )}
          </div>
        </MobileDialogFooter>
      </MobileDialogContent>
    </MobileDialog>
  );
}
