'use client';

import React, { useState, useMemo } from 'react';
import { NativeModal, NativeModalHeader, NativeModalTitle, NativeModalContent } from '@/components/ui/native-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  User, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Clock,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Filter,
  Search
} from 'lucide-react';

interface PersonnelManagementModalProps {
  open: boolean;
  onClose: () => void;
  projects: any[];
  onPersonnelUpdate?: (personnelData: any) => void;
}

interface PersonnelMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'active' | 'busy' | 'away' | 'offline';
  currentProjects: string[];
  skills: string[];
  workload: number; // 0-100%
  location: string;
  joinDate: Date;
  performance: number; // 0-100%
  availability: 'available' | 'partial' | 'unavailable';
}

export default function PersonnelManagementModal({ 
  open, 
  onClose, 
  projects,
  onPersonnelUpdate 
}: PersonnelManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'allocation'>('overview');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'busy' | 'overloaded'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 샘플 인원 데이터
  const personnel: PersonnelMember[] = useMemo(() => [
    {
      id: '1',
      name: '김개발',
      role: '시니어 개발자',
      department: '개발팀',
      email: 'kim.dev@company.com',
      phone: '010-1234-5678',
      status: 'active',
      currentProjects: ['project-1', 'project-3'],
      skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
      workload: 85,
      location: '서울',
      joinDate: new Date('2022-03-15'),
      performance: 92,
      availability: 'partial'
    },
    {
      id: '2',
      name: '이설계',
      role: '시스템 설계자',
      department: '설계팀',
      email: 'lee.design@company.com',
      phone: '010-2345-6789',
      status: 'busy',
      currentProjects: ['project-2', 'project-4'],
      skills: ['System Design', 'Architecture', 'Database', 'Cloud'],
      workload: 95,
      location: '부산',
      joinDate: new Date('2021-08-20'),
      performance: 88,
      availability: 'unavailable'
    },
    {
      id: '3',
      name: '박테스트',
      role: 'QA 엔지니어',
      department: '품질관리팀',
      email: 'park.qa@company.com',
      phone: '010-3456-7890',
      status: 'active',
      currentProjects: ['project-1'],
      skills: ['Testing', 'Automation', 'Selenium', 'Jest'],
      workload: 60,
      location: '서울',
      joinDate: new Date('2023-01-10'),
      performance: 85,
      availability: 'available'
    },
    {
      id: '4',
      name: '최관리',
      role: '프로젝트 매니저',
      department: '관리팀',
      email: 'choi.pm@company.com',
      phone: '010-4567-8901',
      status: 'active',
      currentProjects: ['project-2', 'project-3', 'project-4'],
      skills: ['Project Management', 'Agile', 'Scrum', 'Leadership'],
      workload: 75,
      location: '대구',
      joinDate: new Date('2020-05-12'),
      performance: 95,
      availability: 'available'
    },
    {
      id: '5',
      name: '정디자인',
      role: 'UI/UX 디자이너',
      department: '디자인팀',
      email: 'jung.design@company.com',
      phone: '010-5678-9012',
      status: 'away',
      currentProjects: ['project-1', 'project-2'],
      skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping'],
      workload: 70,
      location: '서울',
      joinDate: new Date('2022-11-03'),
      performance: 90,
      availability: 'partial'
    }
  ], []);

  // 필터링된 인원
  const filteredPersonnel = useMemo(() => {
    return personnel.filter(person => {
      // 검색 필터
      if (searchQuery && !person.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !person.role.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !person.department.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // 상태 필터
      switch (filterStatus) {
        case 'available':
          return person.availability === 'available';
        case 'busy':
          return person.workload > 80;
        case 'overloaded':
          return person.workload > 90;
        default:
          return true;
      }
    });
  }, [personnel, searchQuery, filterStatus]);

  // 통계 계산
  const stats = useMemo(() => {
    const total = personnel.length;
    const available = personnel.filter(p => p.availability === 'available').length;
    const busy = personnel.filter(p => p.workload > 80).length;
    const overloaded = personnel.filter(p => p.workload > 90).length;
    const avgWorkload = Math.round(personnel.reduce((sum, p) => sum + p.workload, 0) / total);
    const avgPerformance = Math.round(personnel.reduce((sum, p) => sum + p.performance, 0) / total);

    return {
      total,
      available,
      busy,
      overloaded,
      avgWorkload,
      avgPerformance
    };
  }, [personnel]);

  // 상태 색상
  const getStatusColor = (status: PersonnelMember['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'busy': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'away': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'offline': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 가용성 색상
  const getAvailabilityColor = (availability: PersonnelMember['availability']) => {
    switch (availability) {
      case 'available': return 'bg-green-500';
      case 'partial': return 'bg-yellow-500';
      case 'unavailable': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // 업무량 색상
  const getWorkloadColor = (workload: number) => {
    if (workload >= 90) return 'bg-red-500';
    if (workload >= 80) return 'bg-yellow-500';
    if (workload >= 60) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <NativeModal open={open} onClose={onClose} fullScreen>
      <NativeModalHeader>
        <NativeModalTitle showCloseButton onClose={onClose}>
          👥 인원 관리 센터
        </NativeModalTitle>
        
        {/* 탭 네비게이션 */}
        <div className="flex mt-4 bg-gray-100 rounded-lg p-1">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('overview')}
            className="flex-1 h-8"
          >
            📊 현황
          </Button>
          <Button
            variant={activeTab === 'members' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('members')}
            className="flex-1 h-8"
          >
            👤 구성원
          </Button>
          <Button
            variant={activeTab === 'allocation' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('allocation')}
            className="flex-1 h-8"
          >
            📋 배정
          </Button>
        </div>

        {/* 통계 요약 */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-blue-600">총 인원</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-600">{stats.available}</div>
            <div className="text-xs text-green-600">투입가능</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-yellow-600">{stats.busy}</div>
            <div className="text-xs text-yellow-600">바쁨</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-red-600">{stats.overloaded}</div>
            <div className="text-xs text-red-600">과부하</div>
          </div>
        </div>
      </NativeModalHeader>

      <NativeModalContent>
        {/* 현황 탭 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 전체 통계 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">팀 성과 지표</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-700">평균 업무량</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{stats.avgWorkload}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${getWorkloadColor(stats.avgWorkload)}`}
                      style={{ width: `${stats.avgWorkload}%` }}
                    />
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-700">평균 성과</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{stats.avgPerformance}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: `${stats.avgPerformance}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 부서별 현황 */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4">부서별 현황</h3>
              
              <div className="space-y-3">
                {['개발팀', '설계팀', '품질관리팀', '관리팀', '디자인팀'].map((dept, index) => {
                  const deptMembers = personnel.filter(p => p.department === dept);
                  const avgWorkload = deptMembers.length > 0 
                    ? Math.round(deptMembers.reduce((sum, p) => sum + p.workload, 0) / deptMembers.length)
                    : 0;
                  
                  return (
                    <div key={dept} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800">{dept}</div>
                        <div className="text-sm text-gray-500">{deptMembers.length}명</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-800">{avgWorkload}%</div>
                        <div className="text-xs text-gray-500">평균 업무량</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 구성원 탭 */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            {/* 검색 및 필터 */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="이름, 역할, 부서 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                전체
              </Button>
              <Button
                variant={filterStatus === 'available' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('available')}
              >
                투입가능
              </Button>
            </div>

            {/* 구성원 목록 */}
            <div className="space-y-3">
              {filteredPersonnel.map((person) => (
                <div
                  key={person.id}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    {/* 아바타 */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {person.name.charAt(0)}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getAvailabilityColor(person.availability)} rounded-full border-2 border-white`} />
                    </div>

                    {/* 정보 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-800">{person.name}</h4>
                        <Badge className={`text-xs px-2 py-0.5 border ${getStatusColor(person.status)}`}>
                          {person.status === 'active' ? '활성' :
                           person.status === 'busy' ? '바쁨' :
                           person.status === 'away' ? '자리비움' : '오프라인'}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        {person.role} • {person.department}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {person.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {person.currentProjects.length}개 프로젝트
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          성과 {person.performance}%
                        </span>
                      </div>

                      {/* 업무량 */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>업무량</span>
                          <span>{person.workload}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getWorkloadColor(person.workload)}`}
                            style={{ width: `${person.workload}%` }}
                          />
                        </div>
                      </div>

                      {/* 스킬 태그 */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {person.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700">
                            {skill}
                          </Badge>
                        ))}
                        {person.skills.length > 3 && (
                          <Badge className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600">
                            +{person.skills.length - 3}
                          </Badge>
                        )}
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <User className="h-3 w-3 mr-1" />
                          상세보기
                        </Button>
                        <Button size="sm" variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          일정보기
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-3 w-3 mr-1" />
                          설정
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 새 구성원 추가 */}
            <div className="text-center py-6">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                새 구성원 추가
              </Button>
            </div>
          </div>
        )}

        {/* 배정 탭 */}
        {activeTab === 'allocation' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">스마트 인원 배정</h3>
              <p className="text-sm text-gray-600 mb-4">
                AI가 각 구성원의 스킬, 업무량, 성과를 분석하여 최적의 인원 배정을 제안합니다.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <Button className="bg-green-600 hover:bg-green-700">
                  자동 배정 제안
                </Button>
                <Button variant="outline">
                  수동 배정
                </Button>
              </div>
            </div>

            {/* 프로젝트별 인원 현황 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">프로젝트별 인원 현황</h3>
              
              {projects.slice(0, 3).map((project, index) => {
                const assignedMembers = personnel.filter(p => 
                  p.currentProjects.includes(project.id)
                );
                
                return (
                  <div key={project.id} className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">{project.name}</h4>
                      <Badge className="bg-blue-100 text-blue-700">
                        {assignedMembers.length}명 투입
                      </Badge>
                    </div>
                    
                    <div className="flex -space-x-2 mb-3">
                      {assignedMembers.map((member, memberIndex) => (
                        <div
                          key={member.id}
                          className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                          title={member.name}
                        >
                          {member.name.charAt(0)}
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-8 h-8 p-0 rounded-full ml-2"
                      >
                        <UserPlus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      필요 스킬: React, Node.js, AWS • 진행률: {project.progress || 0}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </NativeModalContent>
    </NativeModal>
  );
}
