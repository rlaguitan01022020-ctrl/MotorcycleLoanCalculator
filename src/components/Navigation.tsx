import React, { useState, useRef, useEffect } from 'react';
import {
  Calculator,
  FileText,
  ClipboardCheck,
  ChevronDown,
} from 'lucide-react';

export type TabType =
  | 'calculator'
  | 'requirements'
  | 'catalog'
  | 'application_form'
  | 'quotation';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  applicationsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dropdownItems = [
    {
      id: 'requirements' as TabType,
      label: 'REQUIREMENTS LIST Checklist',
      sublabel: 'Documentary requirements & copy to Notepad',
      icon: ClipboardCheck,
      badge: 'All Brands',
    },
    {
      id: 'application_form' as TabType,
      label: 'Application Form',
      sublabel: 'Normal text format template with copy',
      icon: FileText,
      badge: 'Text Format',
    },
  ];

  const isDropdownActive = ['requirements', 'application_form'].includes(currentTab);
  const activeDropdownItem = dropdownItems.find((item) => item.id === currentTab);

  return (
    <nav className="th-nav border-b sticky top-[76px] sm:top-[84px] z-30 backdrop-blur-md no-print shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between sm:justify-start gap-2 py-2 overflow-x-visible">
          {/* Main Tab: Loan Calculator */}
          <button
            onClick={() => onSelectTab('calculator')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
              currentTab === 'calculator'
                ? 'th-btn-primary border-transparent shadow-md font-black'
                : 'th-card hover:opacity-90'
            }`}
          >
            <Calculator className={`w-4 h-4 ${currentTab === 'calculator' ? 'text-current' : 'th-accent'}`} />
            <span>Loan Calculator</span>
            <span
              className={`text-[10px] font-black px-1.5 py-0.5 rounded-full border ${
                currentTab === 'calculator' ? 'bg-black/15 border-white/25 text-current' : 'th-badge'
              }`}
            >
              Real-time
            </span>
          </button>

          {/* Dropdown Menu */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                isDropdownActive
                  ? 'th-btn-primary border-transparent shadow-md font-bold'
                  : 'th-card hover:opacity-90'
              }`}
            >
              {activeDropdownItem ? (
                <>
                  <activeDropdownItem.icon className="w-4 h-4 text-current" />
                  <span className="font-bold">{activeDropdownItem.label}</span>
                </>
              ) : (
                <>
                  <ClipboardCheck className="w-4 h-4 th-accent-2" />
                  <span>Requirements & Application Form</span>
                </>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isDropdownActive ? 'text-current' : 'th-accent'
                } ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Options Popup */}
            {isDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-72 sm:w-80 th-card border-2 rounded-2xl shadow-2xl p-1.5 z-50 animate-fadeIn">
                <div className="space-y-1">
                  {dropdownItems.map((item) => {
                    const Icon = item.icon;
                    const isSelected = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onSelectTab(item.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer border ${
                          isSelected
                            ? 'th-hero th-border-strong'
                            : 'border-transparent hover:opacity-90 th-subpanel'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? 'th-btn-primary'
                              : 'th-subpanel th-accent border'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs sm:text-sm font-bold th-heading truncate">
                              {item.label}
                            </span>
                            <span className="text-[10px] font-bold th-badge border px-1.5 py-0.5 rounded shrink-0">
                              {item.badge}
                            </span>
                          </div>
                          <span className="text-[11px] th-text-muted block line-clamp-1">
                            {item.sublabel}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Direct Quick Buttons for Easy 1-Tap Access on larger screens */}
          <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l th-border">
            {dropdownItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                    isActive
                      ? 'th-badge font-bold'
                      : 'border-transparent th-text-secondary hover:opacity-80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
