"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/lib/types";

interface MobileStatusOverviewProps {
  projects: Project[];
}

const STATUS_CONFIG = [
  { key: "계획", color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  { key: "진행 중", color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" },
  { key: "진행 중(관리필요)", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200" },
  { key: "일시 중단", color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" },
  { key: "완료", color: "text-gray-600", bgColor: "bg-gray-50", borderColor: "border-gray-200" }
];

export default function MobileStatusOverview({ projects }: MobileStatusOverviewProps) {
  const totalProjects = projects.length;
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">프로젝트 현황</h3>
          <Badge variant="outline" className="text-xs">
            총 {totalProjects}개
          </Badge>
        </div>
        
        {/* 컴팩트 상태 그리드 */}
        <div className="grid grid-cols-3 gap-2">
          {STATUS_CONFIG.map(({ key, color, bgColor, borderColor }) => {
            const count = projects.filter((p) => p.status === key).length;
            const percentage = totalProjects > 0 ? Math.round((count / totalProjects) * 100) : 0;
            
            return (
              <div
                key={key}
                className={`${bgColor} ${borderColor} border rounded-lg p-2 text-center`}
              >
                <div className={`text-lg font-bold ${color}`}>
                  {count}
                </div>
                <div className="text-xs text-gray-600 truncate" title={key}>
                  {key === "진행 중(관리필요)" ? "관리필요" : key}
                </div>
                <div className="text-xs text-gray-500">
                  {percentage}%
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 요약 정보 */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-600">
            <span>진행률 평균</span>
            <span className="font-medium">
              {totalProjects > 0 
                ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / totalProjects)
                : 0}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
