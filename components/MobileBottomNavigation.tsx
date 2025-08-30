"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Home, Search, Filter, Plus, Menu } from "lucide-react";

interface MobileBottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSearchOpen: () => void;
  onFilterOpen: () => void;
  onCreateNew: () => void;
}

export default function MobileBottomNavigation({
  activeTab,
  onTabChange,
  onSearchOpen,
  onFilterOpen,
  onCreateNew
}: MobileBottomNavigationProps) {
  const tabs = [
    { id: 'overview', icon: Home, label: '홈' },
    { id: 'search', icon: Search, label: '검색' },
    { id: 'filter', icon: Filter, label: '필터' },
    { id: 'create', icon: Plus, label: '추가' },
    { id: 'menu', icon: Menu, label: '메뉴' }
  ];

  const handleTabClick = (tabId: string) => {
    switch (tabId) {
      case 'search':
        onSearchOpen();
        break;
      case 'filter':
        onFilterOpen();
        break;
      case 'create':
        onCreateNew();
        break;
      default:
        onTabChange(tabId);
    }
  };

  return (
    <div className="mobile-bottom-nav fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-50 sm:hidden">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center h-12 w-16 p-1 ${
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </Button>
          );
        })}
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom" />
    </div>
  );
}
