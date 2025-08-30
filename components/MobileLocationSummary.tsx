"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe } from "lucide-react";
import { Project } from "@/lib/types";

interface MobileLocationSummaryProps {
  projects: Project[];
}

export default function MobileLocationSummary({ projects }: MobileLocationSummaryProps) {
  // 국가별 프로젝트 집계
  const countryStats = projects.reduce((acc, project) => {
    const country = project.country || "기타";
    if (!acc[country]) {
      acc[country] = { total: 0, active: 0 };
    }
    acc[country].total++;
    if (project.status === "진행 중" || project.status === "진행 중(관리필요)") {
      acc[country].active++;
    }
    return acc;
  }, {} as Record<string, { total: number; active: number }>);

  const countries = Object.entries(countryStats)
    .sort(([,a], [,b]) => b.total - a.total)
    .slice(0, 4); // 상위 4개 국가만 표시

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">지역별 현황</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {countries.map(([country, stats]) => (
            <div
              key={country}
              className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center"
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <MapPin className="h-3 w-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-700 truncate">
                  {country}
                </span>
              </div>
              <div className="flex justify-center gap-2">
                <Badge variant="outline" className="text-xs px-1 py-0">
                  전체 {stats.total}
                </Badge>
                {stats.active > 0 && (
                  <Badge className="text-xs px-1 py-0 bg-green-100 text-green-700 border-green-200">
                    진행 {stats.active}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {countries.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            프로젝트가 없습니다
          </div>
        )}
      </CardContent>
    </Card>
  );
}
