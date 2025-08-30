"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import dynamic from 'next/dynamic';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { FileText, TrendingUp, AlertTriangle, Clock, DollarSign, Map, HelpCircle, Calendar, Plus, XCircle, CheckCircle2, RefreshCw, Loader2, Search, ChevronDown } from "lucide-react";
// 핵심 컴포넌트는 정적 로딩
import ProjectTable from "@/components/ProjectTable";
import MobileProjectCard from "@/components/MobileProjectCard";
import EnhancedMobileProjectCard from "@/components/EnhancedMobileProjectCard";
import MobileHeader from "@/components/MobileHeader";
const SmartMobileSearch = dynamic(() => import("@/components/SmartMobileSearch"), { ssr: false });
const MobileNotificationCenter = dynamic(() => import("@/components/MobileNotificationCenter"), { ssr: false });
const OverviewModal = dynamic(() => import("@/components/OverviewModal"), { ssr: false });
const ScheduleManagementModal = dynamic(() => import("@/components/ScheduleManagementModal"), { ssr: false });
const PersonnelManagementModal = dynamic(() => import("@/components/PersonnelManagementModal"), { ssr: false });
const UrgentModal = dynamic(() => import("@/components/UrgentModal"), { ssr: false });
import MobileBottomNavigation from "@/components/MobileBottomNavigation";
import MobileSearchFilter from "@/components/MobileSearchFilter";
import MobileStatusOverview from "@/components/MobileStatusOverview";
import MobileLocationSummary from "@/components/MobileLocationSummary";
const MobileEquipmentHistoryCard = dynamic(() => import("@/components/MobileEquipmentHistoryCard"), { ssr: false });
const MobileEquipmentHistoryForm = dynamic(() => import("@/components/MobileEquipmentHistoryForm"), { ssr: false });
const QuickProjectEditForm = dynamic(() => import("@/components/QuickProjectEditForm"), { ssr: false });
const SimpleMobileGanttChart = dynamic(() => import("@/components/SimpleMobileGanttChart"), { ssr: false });
import StatusOverview from "@/components/StatusOverview";
import DashboardHeader from "@/components/DashboardHeader";
const FloatingActions = dynamic(() => import("@/components/FloatingActions"), { ssr: false });
const EquipmentHistoryTable = dynamic(() => import("@/components/EquipmentHistoryTable"), { ssr: false });
const GanttChart = dynamic(() => import("@/components/GanttChart"), { ssr: false });
const LocationManager = dynamic(() => import("@/components/LocationManager"), { ssr: false });
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MobileDialog, MobileDialogContent, MobileDialogHeader, MobileDialogTitle, MobileDialogFooter } from "@/components/ui/mobile-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

import { filterProjects, calculateStats } from "@/lib/projectUtils";
import { seedProjects } from "@/lib/sampleData";
import { Project, ProjectStatus } from "@/lib/types";
import CostHistoryManager from "@/components/CostHistoryManager";
import { parseNumberFromString, syncProjectWithCostHistory, determineProjectStatus, calculateCostRatio, getLatestCostHistory } from "@/lib/utils";

// WorldMap을 동적 import로 변경 (SSR 비활성화)
const WorldMap = dynamic(() => import("@/components/WorldMap"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <div className="text-gray-600 font-medium">지도를 불러오는 중...</div>
      </div>
    </div>
  )
});

export default function CompanyOpsDashboard() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [projects, setProjects] = useState(seedProjects);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [equipmentHistory, setEquipmentHistory] = useState<any[]>([
    {
      id: 'eq1',
      date: '2024-03-15',
      part: '기구',
      content: '컨베이어 벨트에서 이상 소음 발생. 작업 중단 필요.',
      action: '벨트 장력 조정 및 베어링 교체 완료',
      manager: '김기술',
      status: 'completed'
    },
    {
      id: 'eq2', 
      date: '2024-03-14',
      part: '제어',
      content: '온도 센서 오류로 인한 자동 제어 불가',
      action: '센서 점검 중',
      manager: '이전기',
      status: 'in-progress'
    }
  ]);
  const [equipmentHistoryOpen, setEquipmentHistoryOpen] = useState(false);
  const [equipmentFormOpen, setEquipmentFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<any | null>(null);
  const [isQuickAdd, setIsQuickAdd] = useState(false);
  
  // 모바일 UX 상태
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [smartSearchOpen, setSmartSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  
  // 스마트 액션 바 모달 상태들
  const [overviewModalOpen, setOverviewModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [personnelModalOpen, setPersonnelModalOpen] = useState(false);
  const [urgentModalOpen, setUrgentModalOpen] = useState(false);
  
  // 프로젝트 편집을 위한 상태
  const [selected, setSelected] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [quickEditOpen, setQuickEditOpen] = useState(false);
  
  // 모바일 섹션 접기/펼치기 상태
  const [expandedSections, setExpandedSections] = useState({
    basic: true,      // 기본 정보는 항상 열림
    manager: true,    // 담당자 정보도 기본 열림
    info: false,      // 추가 정보는 접힘
    location: false,  // 위치 정보는 접힘
    cost: false       // 비용 정보는 접힘
  });
  
  // 영업 담당자 입력을 위한 별도 상태
  const [salesManagersInput, setSalesManagersInput] = useState("");
  
  // 일정 관리를 위한 상태
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);
  const [scheduleItems, setScheduleItems] = useState<any[]>([]);
  const [people, setPeople] = useState<Array<{ id: string; name: string; affiliation: string; department: string }>>([]);
  const [managerStatuses, setManagerStatuses] = useState<Record<string, Record<string, string>>>({});

  // 투입률 이력 관리를 위한 상태
  const [costHistoryOpen, setCostHistoryOpen] = useState(false);
  const [selectedCostHistory, setSelectedCostHistory] = useState<any | null>(null);

  // 업데이트 시간 관리
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  // 컴포넌트 마운트 확인 및 모바일 감지
  useEffect(() => {
    setMounted(true);
    setLastUpdateTime(new Date());
    
    // 모바일 감지
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // 업데이트 시간 갱신 함수
  const updateLastUpdateTime = useCallback(() => {
    setLastUpdateTime(new Date());
  }, []);

  // 섹션 토글 함수
  const toggleSection = useCallback((sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey as keyof typeof prev]
    }));
  }, []);

  // 프로젝트 편집 핸들러 (상세 편집)
  function onEdit(p: any) {
    setSelected({ ...p });
    setSalesManagersInput(p.salesManagers?.join(", ") || "");
    setEquipmentHistory(p.equipmentHistory || []);
    setOpen(true);
    updateLastUpdateTime();
  }

  // 빠른 편집 핸들러
  function onQuickEdit(p: any) {
    setSelected({ ...p });
    setQuickEditOpen(true);
    updateLastUpdateTime();
  }

  // 빠른 편집 저장 핸들러
  function onQuickSave(updatedProject: any) {
    setProjects(prev => 
      prev.map(p => p.id === updatedProject.id ? updatedProject : p)
    );
    setQuickEditOpen(false);
    setSelected(null);
    updateLastUpdateTime();
  }

  // 스마트 검색 핸들러
  function handleSmartSearch(query: string, filters: any) {
    setQuery(query);
    // 필터 적용 로직
    console.log('Smart search:', query, filters);
  }

  // 알림 데이터 (실제로는 API에서 가져옴)
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'urgent' as const,
      title: '예산 초과 경고',
      message: '건조기 개조 프로젝트의 예산 사용률이 85%를 초과했습니다. 즉시 확인이 필요합니다.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30분 전
      isRead: false,
      category: 'budget' as const,
      relatedId: 'project-1'
    },
    {
      id: '2',
      type: 'warning' as const,
      title: '일정 지연 알림',
      message: '컨베이어 설치 작업이 예정보다 2일 지연되고 있습니다.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2시간 전
      isRead: false,
      category: 'schedule' as const,
      relatedId: 'project-2'
    },
    {
      id: '3',
      type: 'info' as const,
      title: '새로운 설비 이력 등록',
      message: '김기술님이 온도 센서 점검 이력을 등록했습니다.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4시간 전
      isRead: false,
      category: 'project' as const,
      relatedId: 'equipment-1'
    }
  ]);

  // 알림 핸들러들
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationAction = (notification: any) => {
    // 알림 클릭 시 관련 페이지로 이동
    handleMarkAsRead(notification.id);
    
    if (notification.category === 'budget' && notification.relatedId) {
      const project = projects.find(p => p.id === notification.relatedId);
      if (project) {
        onCostHistory(project);
      }
    } else if (notification.category === 'schedule' && notification.relatedId) {
      const project = projects.find(p => p.id === notification.relatedId);
      if (project) {
        onSchedule(project);
      }
    }
    
    setNotificationOpen(false);
  };

  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

  // 일정 관리 핸들러
  function onSchedule(p: any) {
    setSelectedSchedule({ ...p });
    setScheduleItems(p.scheduleItems || []);
    const initialPeople: Array<{ id: string; name: string; affiliation: string; department: string }> = (p.people && Array.isArray(p.people))
      ? p.people
      : [];
    setPeople(initialPeople);
    setScheduleOpen(true);
    updateLastUpdateTime();
  }

  // 장비 이력 핸들러
  function onEquipmentHistory(p: any) {
    setSelected({ ...p });
    setEquipmentHistory(p.equipmentHistory || []);
    setEquipmentHistoryOpen(true);
    updateLastUpdateTime();
  }

  // 설비 이력 편집 핸들러
  function onEditEquipment(equipment: any) {
    setEditingEquipment(equipment);
    setIsQuickAdd(false);
    setEquipmentFormOpen(true);
  }

  // 설비 이력 추가 핸들러 (긴급/일반)
  function onAddEquipment(isQuick: boolean = false) {
    setEditingEquipment(null);
    setIsQuickAdd(isQuick);
    setEquipmentFormOpen(true);
  }

  // 설비 이력 저장 핸들러
  function onSaveEquipment(equipment: any) {
    if (editingEquipment) {
      // 수정
      setEquipmentHistory(prev => 
        prev.map(item => item.id === equipment.id ? equipment : item)
      );
    } else {
      // 새로 추가
      setEquipmentHistory(prev => [equipment, ...prev]);
    }
    setEquipmentFormOpen(false);
    setEditingEquipment(null);
    updateLastUpdateTime();
  }

  // 투입률 이력 관리 핸들러
  function onCostHistory(p: any) {
    setSelectedCostHistory({ ...p });
    setCostHistoryOpen(true);
    updateLastUpdateTime();
  }

  // 신규 프로젝트 생성 핸들러
  function onCreate() {
    const newProject = {
      id: `project_${Date.now()}`,
      pjtNo: `PJT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}`,
      name: "",
      status: "계획",
      pm: "",
      salesManagers: [],
      techManager: "",
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      note: "",
      lat: 37.5665,
      lng: 126.9780,
      country: "Korea",
      city: "Seoul",
      address: "",
      equipmentHistory: [],
      scheduleItems: [],
      people: [],
      costHistory: []
    };
    setSelected(newProject);
    setSalesManagersInput("");
    setEquipmentHistory([]);
    setOpen(true);
    updateLastUpdateTime();
  }

  // 투입률 이력 저장 핸들러 (통합된 로직 사용)
  const onCostHistorySave = useCallback((history: any[]) => {
    if (selectedCostHistory) {
      let updatedProject = { ...selectedCostHistory, costHistory: history };

      // 새로운 동기화 유틸리티 함수 사용
      updatedProject = syncProjectWithCostHistory(updatedProject);

      setProjects((prev) => {
        const newProjects = prev.map((p) =>
          p.id === selectedCostHistory.id ? updatedProject : p
        );
        return newProjects;
      });

      setSelectedCostHistory(updatedProject);
      updateLastUpdateTime();
    }
  }, [selectedCostHistory, updateLastUpdateTime]);

  // 프로젝트 삭제 핸들러
  function onDelete(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    updateLastUpdateTime();
  }

  // 프로젝트 저장 핸들러
  function onSave() {
    let updatedProject = { ...selected, equipmentHistory };
    
    const isNewProject = !projects.some(p => p.id === selected.id);
    
    if (isNewProject) {
      setProjects(prev => [updatedProject, ...prev]);
    } else {
      setProjects(prev => prev.map(p => p.id === selected.id ? updatedProject : p));
    }
    
    setOpen(false);
    setSelected(null);
    setEquipmentHistory([]);
    updateLastUpdateTime();
  }

  // 일정 저장 핸들러
  function saveSchedule() {
    if (selectedSchedule) {
      const updatedProject = { ...selectedSchedule, scheduleItems, people };
      setProjects((prev) => 
        prev.map((p) => (p.id === selectedSchedule.id ? updatedProject : p))
      );
      setScheduleOpen(false);
      updateLastUpdateTime();
    }
  }

  // 일정 항목 추가
  function addScheduleItem() {
    const newItem = {
      id: Math.random().toString(36).slice(2),
      name: "새 일정",
      startDate: "",
      endDate: "",
      progress: 0
    };
    setScheduleItems(prev => [...prev, newItem]);
    updateLastUpdateTime();
  }

  // 일정 항목 업데이트
  function updateScheduleItem(id: string, field: string, value: any) {
    setScheduleItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
    updateLastUpdateTime();
  }

  // 일정 항목 삭제
  function deleteScheduleItem(id: string) {
    setScheduleItems(prev => prev.filter(item => item.id !== id));
    updateLastUpdateTime();
  }

  // 인원 추가
  function addPerson() {
    const newPerson = {
      id: Math.random().toString(36).slice(2),
      name: "",
      affiliation: "",
      department: ""
    };
    setPeople(prev => [...prev, newPerson]);
    updateLastUpdateTime();
  }

  // 인원 업데이트
  function updatePerson(index: number, field: string, value: string) {
    setPeople(prev => 
      prev.map((person, i) => 
        i === index ? { ...person, [field]: value } : person
      )
    );
    updateLastUpdateTime();
  }

  // 인원 삭제
  function deletePerson(index: number) {
    setPeople(prev => prev.filter((_, i) => i !== index));
    updateLastUpdateTime();
  }

  // 달력 열기
  function onCalendarOpen(person: any) {
    alert(`${person.name}의 달력이 열립니다.`);
  }

  // 인원 상태 업데이트
  function onStatusUpdate(managerId: string, dateKey: string, status: string) {
    setManagerStatuses(prev => ({
      ...prev,
      [managerId]: {
        ...prev[managerId],
        [dateKey]: status
      }
    }));
    updateLastUpdateTime();
  }

  // 필터링된 프로젝트
  const filteredProjects = useMemo(() => filterProjects(projects, query, statusFilter), [projects, query, statusFilter]);
  
  // 통계 데이터
  const statsData = useMemo(() => calculateStats(projects), [projects]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      {isMobile ? (
        <MobileHeader
          onSearchOpen={() => setSmartSearchOpen(true)}
          onMenuOpen={() => setMobileMenuOpen(true)}
          onNotificationOpen={() => setNotificationOpen(true)}
          notifications={unreadNotificationCount}
          userName="김관리자"
          // 스마트 액션 바 관련
          onOverviewOpen={() => setOverviewModalOpen(true)}
          onScheduleOpen={() => setScheduleModalOpen(true)}
          onPersonnelOpen={() => setPersonnelModalOpen(true)}
          onUrgentOpen={() => setUrgentModalOpen(true)}
          onQuickActionsOpen={() => console.log('빠른작업 열기')}
          totalProjects={projects.length}
          urgentCount={notifications.filter(n => n.type === 'urgent').length}
          todayTasks={Math.floor(Math.random() * 10) + 5}
          activePersonnel={Math.floor(Math.random() * 15) + 8}
        />
      ) : (
        <DashboardHeader 
          query={query}
          onQueryChange={setQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onCreate={onCreate}
          onHelpOpen={() => {}}
          lastUpdateTime={lastUpdateTime}
          onManualUpdate={updateLastUpdateTime}
        />
      )}

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* 월드맵 - 모바일에서는 축소 */}
        {!isMobile && <WorldMap projects={filteredProjects} />}

        {/* 상태별 현황 */}
        {isMobile ? (
          <div className="grid grid-cols-1 gap-4">
            <MobileStatusOverview projects={projects} />
            <MobileLocationSummary projects={projects} />
          </div>
        ) : (
        <StatusOverview projects={projects} />
        )}

        {/* 프로젝트 리스트 */}
        {isMobile ? (
          // 모바일 카드 뷰
          <div className="space-y-4 pb-20">
            {/* 활성 필터 표시 */}
            {(query || statusFilter) && (
              <div className="flex flex-wrap gap-2 px-1">
                {query && (
                  <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                    <Search className="h-3 w-3" />
                    {query}
                    <button onClick={() => setQuery('')} className="ml-1">
                      <XCircle className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {statusFilter && (
                  <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                    {statusFilter}
                    <button onClick={() => setStatusFilter(undefined)} className="ml-1">
                      <XCircle className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* 프로젝트 카드들 */}
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <EnhancedMobileProjectCard
                  key={project.id}
                  project={project}
                  onEdit={onEdit}
                  onQuickEdit={onQuickEdit}
                  onSchedule={onSchedule}
                  onEquipmentHistory={onEquipmentHistory}
                  onCostHistory={onCostHistory}
                  onDelete={onDelete}
                  onFavorite={(id) => console.log('Favorite:', id)}
                  onComment={(project) => console.log('Comment:', project)}
                  isFavorite={Math.random() > 0.7} // 임시로 랜덤
                  priority={Math.random() > 0.8 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low'}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <Search className="h-12 w-12 mx-auto mb-4" />
                </div>
                <p className="text-gray-500">검색 결과가 없습니다</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setQuery('');
                    setStatusFilter(undefined);
                  }}
                  className="mt-4"
                >
                  필터 초기화
                </Button>
              </div>
            )}
          </div>
        ) : (
          // 데스크톱 테이블 뷰
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <ProjectTable
              projects={filteredProjects}
              onEdit={onEdit}
              onSchedule={onSchedule}
              onEquipmentHistory={onEquipmentHistory}
              onCostHistory={onCostHistory}
              onDelete={onDelete}
            />
          </CardContent>
        </Card>
        )}
      </main>

      {/* Floating Action Buttons */}
      <FloatingActions
        onCreate={onCreate}
        onOverview={() => {}}
        onProjects={() => {}}
      />

      {/* Editor Dialog */}
      {isMobile ? (
        <MobileDialog open={open} onOpenChange={setOpen}>
          <MobileDialogContent>
            <MobileDialogHeader>
              <MobileDialogTitle>{selected?.pjtNo ? "프로젝트 수정" : "신규 프로젝트"}</MobileDialogTitle>
            </MobileDialogHeader>
          <div className="space-y-6 pr-2 pb-4">
            {/* 기본 정보 섹션 */}
            <div className="space-y-4">
              <div className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                기본 정보
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label>PJT NO</Label>
                  <Input value={selected?.pjtNo ?? ""} onChange={(e) => setSelected((s: any) => ({ ...s, pjtNo: e.target.value }))} placeholder="예: PJT-25001" />
                </div>
                <div>
                  <Label>프로젝트명</Label>
                  <Input value={selected?.name ?? ""} onChange={(e) => setSelected((s: any) => ({ ...s, name: e.target.value }))} placeholder="예: Dryer Retrofit" />
                </div>
                <div>
                  <Label>상태</Label>
                  <Select value={selected?.status ?? "계획"} onValueChange={(v) => setSelected((s: any) => ({ ...s, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="계획">계획</SelectItem>
                      <SelectItem value="진행 중">진행 중</SelectItem>
                      <SelectItem value="진행 중(관리필요)">진행 중<br/>(관리필요)</SelectItem>
                      <SelectItem value="일시 중단">일시 중단</SelectItem>
                      <SelectItem value="완료">완료</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 담당자 정보 섹션 */}
            <div className="border-t pt-4 space-y-4">
              <div className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                담당자 정보
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label>PM</Label>
                  <Input value={selected?.pm ?? ""} onChange={(e) => setSelected((s: any) => ({ ...s, pm: e.target.value }))} placeholder="프로젝트 매니저" />
                </div>
                <div></div>
                <div>
                  <Label>영업 담당자</Label>
                  <Input 
                    value={salesManagersInput}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      setSalesManagersInput(inputValue);
                      const managers = inputValue.split(',').map(m => m.trim()).filter(Boolean);
                      setSelected((s: any) => ({ ...s, salesManagers: managers }));
                    }} 
                    placeholder="담당자1, 담당자2" 
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    쉼표(,)로 구분하여 여러 담당자를 입력할 수 있습니다
                  </p>
                </div>
                <div>
                  <Label>기술 담당자</Label>
                  <Input value={selected?.techManager ?? ""} onChange={(e) => setSelected((s: any) => ({ ...s, techManager: e.target.value }))} placeholder="기술 담당자" />
                </div>
              </div>
            </div>

            {/* 비고 섹션 */}
            <div className="border-t pt-4 space-y-4">
              <div className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                추가 정보
              </div>
              <div>
                <Label>비고</Label>
                <Textarea value={selected?.note ?? ""} onChange={(e) => setSelected((s: any) => ({ ...s, note: e.target.value }))} placeholder="메모" />
              </div>
            </div>

            {/* 위치 정보 섹션 */}
            <div className="border-t pt-4 space-y-4">
              <div className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                위치 정보
              </div>
              <LocationManager
                lat={selected?.lat}
                lng={selected?.lng}
                onLocationChange={(lat, lng) => setSelected((s: any) => ({ ...s, lat, lng }))}
              />
            </div>

            {/* 비용 정보 섹션 */}
            <div className="border-t pt-4 space-y-4">
              <div className="text-sm font-medium text-zinc-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                비용 정보
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>예산 (KRW)</Label>
                  <Input 
                    type="text" 
                    value={selected?.budget ? selected.budget.toLocaleString() : '0'} 
                    onChange={(e) => {
                      const rawValue = e.target.value;
                      const numericValue = parseNumberFromString(rawValue);
                      if (!isNaN(numericValue)) {
                        setSelected((s: any) => ({ ...s, budget: numericValue }));
                      }
                    }} 
                    placeholder="예: 1,000,000"
                  />
                </div>
                <div>
                  <Label>투입원가 (KRW)</Label>
                  <Input 
                    type="text" 
                    value={selected?.actualCost ? selected.actualCost.toLocaleString() : '0'} 
                    onChange={(e) => {
                      const rawValue = e.target.value;
                      const numericValue = parseNumberFromString(rawValue);
                      if (!isNaN(numericValue)) {
                        setSelected((s: any) => ({ ...s, actualCost: numericValue }));
                      }
                    }} 
                    placeholder="실제 지출된 비용 (예: 1,000,000)" 
                  />
                  {selected?.budget > 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ 투입률이 70%를 넘으면 상태가 자동으로 "진행 중(관리필요)"로 변경됩니다
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
            <MobileDialogFooter>
              <Button onClick={onSave} className="flex-1 mobile-modal-button bg-blue-600 hover:bg-blue-700 text-white">
                <CheckCircle2 className="h-5 w-5 mr-2"/>저장하기
              </Button>
              <Button onClick={() => setOpen(false)} variant="outline" className="flex-1 mobile-modal-button border-gray-300 text-gray-600">
                <XCircle className="h-5 w-5 mr-2"/>취소
              </Button>
            </MobileDialogFooter>
          </MobileDialogContent>
        </MobileDialog>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selected?.pjtNo ? "프로젝트 수정" : "신규 프로젝트"}</DialogTitle>
            </DialogHeader>
            <div className="mobile-modal-content space-y-6 sm:pr-2 sm:pb-4 sm:px-0 sm:space-y-6">
              {/* 기본 정보 섹션 */}
              <div className="mobile-modal-section">
                <button 
                  onClick={() => toggleSection('basic')}
                  className="mobile-section-title basic sm:text-sm sm:font-medium sm:text-zinc-700 sm:flex sm:items-center sm:gap-2 w-full justify-between items-center cursor-pointer sm:cursor-default"
                >
                  <span>📋 기본 정보</span>
                  <ChevronDown className={`h-5 w-5 transition-transform sm:hidden ${expandedSections.basic ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.basic && (
                <div className="space-y-5 sm:grid sm:grid-cols-3 sm:gap-3 sm:space-y-0 sm:block">
                  <div className="mobile-input-group sm:mb-0">
                    <Label>프로젝트 번호 <span className="text-red-500">*</span></Label>
                    <Input value={selected?.pjtNo ?? ""} onChange={(e) => setSelected((s: any) => ({ ...s, pjtNo: e.target.value }))} placeholder="예: PJT-25001" required />
                  </div>
                  <div className="mobile-input-group sm:mb-0">
                    <Label>프로젝트명 <span className="text-red-500">*</span></Label>
                    <Input value={selected?.name ?? ""} onChange={(e) => setSelected((s: any) => ({ ...s, name: e.target.value }))} placeholder="예: 건조기 개조 프로젝트" required />
                  </div>
                  <div className="mobile-input-group sm:mb-0">
                    <Label>상태</Label>
                    <Select value={selected?.status ?? "계획"} onValueChange={(v) => setSelected((s: any) => ({ ...s, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="계획">계획</SelectItem>
                        <SelectItem value="진행 중">진행 중</SelectItem>
                        <SelectItem value="진행 중(관리필요)">진행 중<br/>(관리필요)</SelectItem>
                        <SelectItem value="일시 중단">일시 중단</SelectItem>
                        <SelectItem value="완료">완료</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                )}
              </div>

              {/* 담당자 정보 섹션 */}
              <div className="mobile-modal-section sm:border-t sm:border-gray-200 sm:pt-4">
                <button 
                  onClick={() => toggleSection('manager')}
                  className="mobile-section-title manager sm:text-sm sm:font-medium sm:text-zinc-700 sm:flex sm:items-center sm:gap-2 w-full justify-between items-center cursor-pointer sm:cursor-default"
                >
                  <span>👥 담당자</span>
                  <ChevronDown className={`h-5 w-5 transition-transform sm:hidden ${expandedSections.manager ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.manager && (
                <div className="space-y-5 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0 sm:block">
                  <div className="mobile-input-group sm:mb-0">
                    <Label>담당자 (PM)</Label>
                    <Input value={selected?.pm ?? ""} onChange={(e) => setSelected((s: any) => ({ ...s, pm: e.target.value }))} placeholder="담당 PM 이름" />
                  </div>
                  <div className="mobile-input-group sm:mb-0">
                    <Label>기술 책임자</Label>
                    <Input value={selected?.techManager ?? ""} onChange={(e) => setSelected((s: any) => ({ ...s, techManager: e.target.value }))} placeholder="기술 담당자 이름" />
                  </div>
                  <div className="mobile-input-group sm:mb-0 sm:col-span-2">
                    <Label>영업 담당자</Label>
                    <Input 
                      value={salesManagersInput}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        setSalesManagersInput(inputValue);
                        const managers = inputValue.split(',').map(m => m.trim()).filter(Boolean);
                        setSelected((s: any) => ({ ...s, salesManagers: managers }));
                      }} 
                      placeholder="담당자1, 담당자2" 
                    />
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      쉼표(,)로 구분하여 여러 담당자를 입력할 수 있습니다
                    </p>
                  </div>
                </div>
                )}
              </div>

              {/* 비고 섹션 */}
              <div className="mobile-modal-section sm:border-t sm:border-gray-200 sm:pt-4">
                <button 
                  onClick={() => toggleSection('info')}
                  className="mobile-section-title info sm:text-sm sm:font-medium sm:text-zinc-700 sm:flex sm:items-center sm:gap-2 w-full justify-between items-center cursor-pointer sm:cursor-default"
                >
                  <span>📝 메모 <span className="text-xs text-gray-400 sm:hidden">(선택사항)</span></span>
                  <ChevronDown className={`h-5 w-5 transition-transform sm:hidden ${expandedSections.info ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.info && (
                <div className="mobile-input-group">
                  <Label>메모</Label>
                  <Textarea value={selected?.note ?? ""} onChange={(e) => setSelected((s: any) => ({ ...s, note: e.target.value }))} placeholder="프로젝트 관련 메모를 입력하세요" />
                </div>
                )}
              </div>

              {/* 위치 정보 섹션 */}
              <div className="mobile-modal-section sm:border-t sm:border-gray-200 sm:pt-4">
                <div className="mobile-section-title location sm:text-sm sm:font-medium sm:text-zinc-700 sm:flex sm:items-center sm:gap-2">
                  위치 정보
                </div>
                <LocationManager
                  lat={selected?.lat}
                  lng={selected?.lng}
                  onLocationChange={(lat, lng) => setSelected((s: any) => ({ ...s, lat, lng }))}
                />
              </div>

              {/* 비용 정보 섹션 */}
              <div className="mobile-modal-section sm:border-t sm:border-gray-200 sm:pt-4">
                <div className="mobile-section-title cost sm:text-sm sm:font-medium sm:text-zinc-700 sm:flex sm:items-center sm:gap-2">
                  비용 정보
                </div>
                                <div className="space-y-5 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0">
                  <div className="mobile-input-group sm:mb-0">
                    <Label>💰 예산</Label>
                    <Input 
                      type="text" 
                      inputMode="numeric"
                      value={selected?.budget ? selected.budget.toLocaleString() : '0'} 
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        const numericValue = parseNumberFromString(rawValue);
                        if (!isNaN(numericValue)) {
                          setSelected((s: any) => ({ ...s, budget: numericValue }));
                        }
                      }} 
                      placeholder="예: 1,000,000"
                    />
                  </div>
                  <div className="mobile-input-group sm:mb-0">
                    <Label>💸 실제 비용</Label>
                    <Input 
                      type="text" 
                      inputMode="numeric"
                      value={selected?.actualCost ? selected.actualCost.toLocaleString() : '0'} 
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        const numericValue = parseNumberFromString(rawValue);
                        if (!isNaN(numericValue)) {
                          setSelected((s: any) => ({ ...s, actualCost: numericValue }));
                        }
                      }} 
                      placeholder="실제 지출 비용 (예: 800,000)" 
                    />
                    {selected?.budget > 0 && (
                      <p className="text-xs text-amber-600 mt-2 leading-relaxed">
                        ⚠️ 투입률이 70%를 넘으면 상태가 자동으로 "진행 중(관리필요)"로 변경됩니다
                      </p>
                    )}
                  </div>
                </div>
            </div>
          </div>
          <DialogFooter>
            <div className="flex items-center gap-2">
              <Button onClick={() => setOpen(false)} variant="ghost"><XCircle className="h-4 w-4 mr-1"/>취소</Button>
              <Button onClick={onSave}><CheckCircle2 className="h-4 w-4 mr-1"/>저장</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}

      {/* 설비이력 관리 모달 */}
      {isMobile ? (
        <MobileDialog open={equipmentHistoryOpen} onOpenChange={setEquipmentHistoryOpen}>
          <MobileDialogContent>
            <MobileDialogHeader>
              <MobileDialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                설비이력 관리
              </MobileDialogTitle>
            </MobileDialogHeader>
            
            <div className="space-y-4 px-4 sm:px-0">
              {/* 모바일: 헤더와 빠른 추가 버튼 */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                <div className="text-sm text-gray-600">
                  총 <span className="font-semibold text-purple-600">{equipmentHistory.length}</span>건의 이력이 있습니다.
                </div>
                <div className="flex gap-2 sm:gap-2">
                  <Button 
                    onClick={() => onAddEquipment(true)}
                    className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 sm:bg-purple-600 sm:hover:bg-purple-700"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="sm:hidden">🚨 긴급 추가</span>
                    <span className="hidden sm:inline">새 이력 추가</span>
                  </Button>
                  <Button 
                    onClick={() => onAddEquipment(false)}
                    variant="outline"
                    className="flex-1 sm:hidden"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    일반 추가
                  </Button>
                </div>
              </div>

              {/* 모바일: 카드 리스트, 데스크톱: 테이블 */}
              {isMobile ? (
                <div className="space-y-3">
                  {equipmentHistory.length > 0 ? (
                    equipmentHistory.map((history) => (
                      <MobileEquipmentHistoryCard
                        key={history.id}
                        history={history}
                        onEdit={onEditEquipment}
                        onDelete={(id) => {
                          setEquipmentHistory(prev => prev.filter(item => item.id !== id));
                        }}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <div className="text-lg font-medium mb-2 text-gray-500">설비 이력이 없습니다</div>
                      <div className="text-sm text-gray-400 mb-4">첫 번째 이력을 추가해보세요</div>
                      <Button 
                        onClick={() => onAddEquipment(false)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        이력 추가하기
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <EquipmentHistoryTable
                  equipmentHistory={equipmentHistory}
                  onUpdate={(id: string, field: string, value: any) => {
                    setEquipmentHistory(prev => 
                      prev.map(item => 
                        item.id === id ? { ...item, [field]: value } : item
                      )
                    );
                  }}
                  onDelete={(id: string) => {
                    setEquipmentHistory(prev => prev.filter(item => item.id !== id));
                  }}
                />
              )}
            </div>

            <MobileDialogFooter>
              <Button onClick={() => setEquipmentHistoryOpen(false)} className="flex-1 mobile-modal-button">
                닫기
              </Button>
            </MobileDialogFooter>
          </MobileDialogContent>
        </MobileDialog>
      ) : (
      <Dialog open={equipmentHistoryOpen} onOpenChange={setEquipmentHistoryOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              설비이력 관리 - {selected?.name || "프로젝트"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                총 <span className="font-semibold text-purple-600">{equipmentHistory.length}</span>건의 이력이 있습니다.
              </div>
              <Button 
                onClick={() => {
                  const newHistory = {
                    id: Math.random().toString(36).slice(2),
                    date: new Date().toISOString().split('T')[0],
                    description: "",
                    cost: 0
                  };
                  setEquipmentHistory(prev => [...prev, newHistory]);
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                새 이력 추가
              </Button>
            </div>

            <EquipmentHistoryTable
              equipmentHistory={equipmentHistory}
              onUpdate={(id: string, field: string, value: any) => {
                setEquipmentHistory(prev => 
                  prev.map(item => 
                    item.id === id ? { ...item, [field]: value } : item
                  )
                );
              }}
              onDelete={(id: string) => {
                setEquipmentHistory(prev => prev.filter(item => item.id !== id));
              }}
            />
          </div>

          <DialogFooter>
            <Button onClick={() => setEquipmentHistoryOpen(false)} variant="outline">
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}

      {/* 일정 및 인원투입 관리 모달 */}
      <Dialog open={scheduleOpen} onOpenChange={(open) => {
        if (!open && scheduleItems.length > 0) {
          const shouldSave = confirm('저장하지 않은 변경사항이 있습니다. 저장하시겠습니까?');
          if (shouldSave) {
            saveSchedule();
          }
        }
        setScheduleOpen(open);
      }}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              일정 및 인원투입 관리 - {selectedSchedule?.name || "프로젝트"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">프로젝트 번호:</span>
                  <span className="ml-2 text-gray-600">{selectedSchedule?.pjtNo}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">상태:</span>
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {selectedSchedule?.status || "상태 없음"}
                  </span>
                </div>
              </div>
            </div>

            {isMobile ? (
              <SimpleMobileGanttChart
                scheduleItems={scheduleItems}
                people={people}
                managerStatuses={managerStatuses}
                onScheduleItemUpdate={updateScheduleItem}
                onScheduleItemDelete={deleteScheduleItem}
                onScheduleItemAdd={addScheduleItem}
                onPersonUpdate={updatePerson}
                onPersonAdd={addPerson}
                onStatusUpdate={onStatusUpdate}
                onSave={saveSchedule}
              />
            ) : (
              <GanttChart
                projects={[selectedSchedule].filter(Boolean)}
                scheduleItems={scheduleItems}
                people={people}
                managerStatuses={managerStatuses}
                onScheduleItemUpdate={updateScheduleItem}
                onScheduleItemDelete={deleteScheduleItem}
                onScheduleItemAdd={addScheduleItem}
                onPersonUpdate={updatePerson}
                onPersonAdd={addPerson}
                onPersonDelete={deletePerson}
                onCalendarOpen={onCalendarOpen}
                onSave={saveSchedule}
                onStatusUpdate={onStatusUpdate}
              />
            )}
          </div>

          <DialogFooter>
            <div className="flex items-center gap-2">
              <Button onClick={() => setScheduleOpen(false)} variant="ghost">
                <XCircle className="h-4 w-4 mr-1"/>취소
              </Button>
              <Button onClick={saveSchedule}>
                <CheckCircle2 className="h-4 w-4 mr-1"/>저장
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 투입률 이력 관리 모달 */}
      {costHistoryOpen && selectedCostHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {(() => {
            let calculatedBudget = 0;
            let calculatedActualCost = 0;
            
            if (selectedCostHistory.costHistory && selectedCostHistory.costHistory.length > 0) {
              const latestHistory = selectedCostHistory.costHistory[0];
              calculatedBudget = latestHistory.budget;
              calculatedActualCost = latestHistory.actualCost;
            } else {
              calculatedBudget = selectedCostHistory.budget || 0;
              calculatedActualCost = selectedCostHistory.actualCost || 0;
            }
            
            return (
              <CostHistoryManager
                projectId={selectedCostHistory.id}
                projectName={selectedCostHistory.name}
                currentBudget={calculatedBudget}
                currentActualCost={calculatedActualCost}
                costHistory={selectedCostHistory.costHistory || []}
                onSave={onCostHistorySave}
                onClose={() => {
                  setCostHistoryOpen(false);
                  setSelectedCostHistory(null);
                }}
              />
            );
          })()}
        </div>
      )}

      {/* 모바일 하단 네비게이션 */}
      {isMobile && (
        <MobileBottomNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSearchOpen={() => setMobileSearchOpen(true)}
          onFilterOpen={() => setMobileFilterOpen(true)}
          onCreateNew={onCreate}
        />
      )}

      {/* 모바일 검색/필터 다이얼로그 */}
      <MobileSearchFilter
        searchOpen={mobileSearchOpen}
        filterOpen={mobileFilterOpen}
        onSearchClose={() => setMobileSearchOpen(false)}
        onFilterClose={() => setMobileFilterOpen(false)}
        query={query}
        onQueryChange={setQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* 설비 이력 추가/편집 폼 */}
      <MobileEquipmentHistoryForm
        open={equipmentFormOpen}
        onClose={() => {
          setEquipmentFormOpen(false);
          setEditingEquipment(null);
        }}
        onSave={onSaveEquipment}
        editingHistory={editingEquipment}
        isQuickAdd={isQuickAdd}
      />

      {/* 빠른 프로젝트 편집 폼 */}
      <QuickProjectEditForm
        open={quickEditOpen}
        onClose={() => {
          setQuickEditOpen(false);
          setSelected(null);
        }}
        onSave={onQuickSave}
        project={selected}
      />

      {/* 스마트 검색 */}
      <SmartMobileSearch
        open={smartSearchOpen}
        onClose={() => setSmartSearchOpen(false)}
        onSearch={handleSmartSearch}
        recentSearches={['설비 점검', '건조기 프로젝트', '김팀장']}
        popularSearches={['진행중 프로젝트', '예산 초과', '이번 주 일정']}
        suggestions={['컨베이어 벨트', '온도 센서', '제어 시스템']}
      />

      {/* 알림센터 */}
      <MobileNotificationCenter
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDeleteNotification={handleDeleteNotification}
        onNotificationAction={handleNotificationAction}
      />

      {/* 스마트 액션 바 모달들 */}
      <OverviewModal
        open={overviewModalOpen}
        onClose={() => setOverviewModalOpen(false)}
        projects={projects}
      />

      <ScheduleManagementModal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        projects={projects}
        onScheduleUpdate={(projectId, scheduleData) => {
          console.log('Schedule updated:', projectId, scheduleData);
        }}
      />

      <PersonnelManagementModal
        open={personnelModalOpen}
        onClose={() => setPersonnelModalOpen(false)}
        projects={projects}
        onPersonnelUpdate={(personnelData) => {
          console.log('Personnel updated:', personnelData);
        }}
      />

      <UrgentModal
        open={urgentModalOpen}
        onClose={() => setUrgentModalOpen(false)}
        projects={projects}
        onUrgentAction={(actionType, itemId) => {
          console.log('Urgent action:', actionType, itemId);
          // 햅틱 피드백 - Vercel 호환
          if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            try {
              navigator.vibrate(200);
            } catch (error) {
              console.warn('Vibration failed:', error);
            }
          }
        }}
      />
    </div>
  );
}