import React from 'react';
import { CompanySettings } from '../types';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  companySettings: CompanySettings;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  companySettings,
}) => {
  return (
    <header className="th-header border-b-2 sticky top-0 z-40 backdrop-blur-md shadow-sm no-print">
      {/* Top Accent Bar */}
      <div className="h-1.5 w-full th-accent-bar" />
      {/* Main header bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            {companySettings.logoUrl ? (
              <div className="w-11 h-11 rounded-xl th-card border-2 flex items-center justify-center p-1 overflow-hidden shadow-sm shrink-0">
                <img
                  src={companySettings.logoUrl}
                  alt={companySettings.companyName}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-2xl th-hero border-2 p-1.5 flex items-center justify-center shadow-sm shrink-0 group transition-colors">
                <BrandLogo className="w-full h-full group-hover:scale-105 transition-transform" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black tracking-tight th-heading font-mono">
                  {companySettings.companyName.length > 65
                    ? companySettings.companyName.slice(0, 65) + '...'
                    : companySettings.companyName}
                </h1>
                <span className="th-btn-primary text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  LOAN PORTAL
                </span>
              </div>
              <p className="text-xs th-accent font-semibold tracking-wide">
                Motorcycle Loan System & Sales Quotation Portal
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
