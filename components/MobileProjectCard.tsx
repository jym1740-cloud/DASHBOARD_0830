"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit3, Calendar, FileText, DollarSign, Trash2, MapPin, Zap } from "lucide-react";
import { Project } from "@/lib/types";
import { getCurrentCostRatio, getCostRatioColorClass } from "@/lib/utils";

interface MobileProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onQuickEdit?: (project: Project) => void;
  onSchedule: (project: Project) => void;
  onEquipmentHistory: (project: Project) => void;
  onCostHistory: (project: Project) => void;
  onDelete: (id: string) => void;
}

function StatusBadge({ status }: { status: string }) {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "계획":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "진행 중":
        return "bg-green-100 text-green-700 border-green-200";
      case "진행 중(관리필요)":
        return "bg-red-100 text-red-700 border-red-200";
      case "일시 중단":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "완료":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <Badge className={`rounded-full px-3 py-1 text-xs border ${getStatusColor(status)}`}>
      {status}
    </Badge>
  );
}

function CostRatio({ project }: { project: Project }) {
  const ratio = getCurrentCostRatio(project);
  
  if (ratio === 0) {
    return <span className="text-zinc-400">-</span>;
  }
  
  const colorClass = getCostRatioColorClass(ratio);
  
  return (
    <span className={`${colorClass} ${ratio > 100 ? 'font-semibold' : ''} text-sm`}>
      {ratio.toFixed(1)}%
    </span>
  );
}

export default function MobileProjectCard({
  project,
  onEdit,
  onQuickEdit,
  onSchedule,
  onEquipmentHistory,
  onCostHistory,
  onDelete
}: MobileProjectCardProps) {
  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-base">
              {project.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {project.pjtNo}
            </p>
          </div>
          <StatusBadge status={project.status} />
        </div>

        {/* 위치 정보 */}
        {(project.city || project.country) && (
          <div className="flex items-center gap-1 mb-3">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {project.city && project.country 
                ? `${project.city}, ${project.country}`
                : project.city || project.country
              }
            </span>
          </div>
        )}

        {/* 주요 정보 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">PM</div>
            <div className="text-sm font-medium text-gray-900">
              {project.pm || "-"}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">투입률</div>
            <div className="text-sm font-medium">
              <CostRatio project={project} />
            </div>
          </div>
        </div>

        {/* 영업 담당자 */}
        {project.salesManagers && project.salesManagers.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-1">영업 담당자</div>
            <div className="text-sm text-gray-700">
              {project.salesManagers.join(", ")}
            </div>
          </div>
        )}

        {/* 비고 */}
        {project.note && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-1">비고</div>
            <div className="text-sm text-gray-700 line-clamp-2">
              {project.note}
            </div>
          </div>
        )}

        {/* 주요 액션 버튼들 */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          {onQuickEdit && (
            <Button
              onClick={() => onQuickEdit(project)}
              variant="default"
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              빠른수정
            </Button>
          )}
          
          <Button
            onClick={() => onEdit(project)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            상세편집
          </Button>
          
          <Button
            onClick={() => onCostHistory(project)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            투입률
          </Button>
        </div>
        
        {/* 추가 액션들 (작은 버튼들) */}
        <div className="flex justify-center gap-4 pt-2">
          <Button
            onClick={() => onSchedule(project)}
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs text-gray-600"
          >
            <Calendar className="h-3 w-3 mr-1" />
            일정
          </Button>
          
          <Button
            onClick={() => onEquipmentHistory(project)}
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs text-gray-600"
          >
            <FileText className="h-3 w-3 mr-1" />
            이력
          </Button>
          
          <Button
            onClick={() => onDelete(project.id)}
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            삭제
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
