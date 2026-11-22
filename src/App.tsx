/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { LoanCalculator } from './components/LoanCalculator';
import { MotorcycleCatalog } from './components/MotorcycleCatalog';
import { RequirementList } from './components/RequirementList';
import { TextApplicationForm } from './components/TextApplicationForm';
import { SettingsModal } from './components/SettingsModal';

import {
  ALL_MOTORCYCLES,
  LOAN_SETTINGS,
  SALES_QUOTATION_CONFIG,
  STORAGE_KEYS,
  getStoredDeletedMotorcycles,
  saveDeletedMotorcycles,
} from './data/motostradaData';
import { FeeLine, CompanySettings, MotorcycleModel, AppTheme } from './types';
import { BrandLogo } from './components/BrandLogo';
import {
  Bike,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Settings,
  Calculator,
  FileText,
  ClipboardCheck,
  Home,
} from 'lucide-react';

const defaultCompanySettings: CompanySettings = {
  companyName: 'Motorcycle Financing & Loan Calculators',
  address: '141 8th Street, corner 11th Avenue, Grace Park East, Caloocan City',
  contactNumber: SALES_QUOTATION_CONFIG.contact_number,
  email: SALES_QUOTATION_CONFIG.email,
  theme: 'dark',
};

const VALID_THEMES: AppTheme[] = ['teal-pink', 'dark', 'black-yellow'];

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('calculator');
  const [selectedSeries, setSelectedSeries] = useState<string>('MT Series');
  const [selectedModel, setSelectedModel] = useState<string>('450MT');
  const [customSrp, setCustomSrp] = useState<number>(338900);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(
    LOAN_SETTINGS.default_down_payment_percent
  );
  const [termMonths, setTermMonths] = useState<number>(36);
  const [monthlyRatePercent, setMonthlyRatePercent] = useState<number>(1.99);

  // Custom Motorcycles (saved locally)
  const [customMotorcycles, setCustomMotorcycles] = useState<MotorcycleModel[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.custom_motorcycles_key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Deleted built-in models (saved locally)
  const [deletedModels, setDeletedModels] = useState<string[]>(() =>
    getStoredDeletedMotorcycles()
  );

  const handleAddMotorcycles = (bikes: MotorcycleModel[]) => {
    if (!bikes || bikes.length === 0) return;
    const incomingNames = new Set(bikes.map((b) => b.model.toLowerCase()));
    setCustomMotorcycles((prev) => {
      const remaining = prev.filter((b) => !incomingNames.has(b.model.toLowerCase()));
      const updated = [...bikes, ...remaining];
      try {
        localStorage.setItem(STORAGE_KEYS.custom_motorcycles_key, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setDeletedModels((prev) => {
      const updated = prev.filter((name) => !incomingNames.has(name.toLowerCase()));
      saveDeletedMotorcycles(updated);
      return updated;
    });
  };

  const handleDeleteMotorcycles = (modelNames: string[]) => {
    if (!modelNames || modelNames.length === 0) return;
    const targetSet = new Set(modelNames.map((n) => n.toLowerCase()));

    setCustomMotorcycles((prev) => {
      const updated = prev.filter((b) => !targetSet.has(b.model.toLowerCase()));
      try {
        localStorage.setItem(STORAGE_KEYS.custom_motorcycles_key, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    const builtInNames = new Set(ALL_MOTORCYCLES.map((m) => m.model.toLowerCase()));
    const builtInsToHide = modelNames.filter((n) => builtInNames.has(n.toLowerCase()));
    if (builtInsToHide.length > 0) {
      setDeletedModels((prev) => {
        const merged = Array.from(new Set([...prev, ...builtInsToHide]));
        saveDeletedMotorcycles(merged);
        return merged;
      });
    }
  };

  const handleRestoreDefaultMotorcycles = () => {
    setDeletedModels([]);
    saveDeletedMotorcycles([]);
  };

  // Company Settings
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.settings_key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          !parsed.companyName ||
          parsed.companyName === 'DEALER & LOAN CENTER' ||
          parsed.companyName === 'CFMOTO Manila Dealership' ||
          parsed.companyName === 'MOTOSTRADA BIKES & GEARS SHOP'
        ) {
          parsed.companyName = 'Motorcycle Financing & Loan Calculators';
        }
        if (
          !parsed.address ||
          parsed.address === 'Manila Philippines' ||
          parsed.address.includes('123 Rizal Avenue')
        ) {
          parsed.address = '141 8th Street, corner 11th Avenue, Grace Park East, Caloocan City';
        }
        if (!localStorage.getItem('ms_default_dark_migrated_v1')) {
          parsed.theme = 'dark';
          localStorage.setItem('ms_default_dark_migrated_v1', '1');
          localStorage.setItem(STORAGE_KEYS.settings_key, JSON.stringify(parsed));
        } else if (!parsed.theme || !VALID_THEMES.includes(parsed.theme)) {
          parsed.theme = 'dark';
        }
        return parsed;
      }
      return defaultCompanySettings;
    } catch {
      return defaultCompanySettings;
    }
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Sync active theme with document root
  useEffect(() => {
    const activeTheme = companySettings.theme && VALID_THEMES.includes(companySettings.theme)
      ? companySettings.theme
      : 'dark';
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [companySettings.theme]);

  // Initial Fee Lines
  const [feeLines, setFeeLines] = useState<FeeLine[]>([
    {
      id: 'fee_init_proc',
      type: 'Processing Fees',
      basis: '% of approved loan',
      value: 2,
      treatment: 'Add to Loan',
    },
  ]);

  // Number of stored applications
  const [applicationsCount, setApplicationsCount] = useState<number>(0);

  const refreshApplicationsCount = () => {
    try {
      const dataStr = localStorage.getItem(STORAGE_KEYS.applications_key);
      if (dataStr) {
        const apps = JSON.parse(dataStr);
        setApplicationsCount(Array.isArray(apps) ? apps.length : 0);
      } else {
        setApplicationsCount(0);
      }
    } catch {
      setApplicationsCount(0);
    }
  };

  useEffect(() => {
    refreshApplicationsCount();
  }, []);

  const handleSaveSettings = (newSettings: CompanySettings) => {
    const normalized: CompanySettings = {
      ...newSettings,
      theme: newSettings.theme && VALID_THEMES.includes(newSettings.theme)
        ? newSettings.theme
        : 'dark',
    };
    setCompanySettings(normalized);
    localStorage.setItem(STORAGE_KEYS.settings_key, JSON.stringify(normalized));
  };

  const handleSelectTheme = (theme: AppTheme) => {
    const updated: CompanySettings = {
      ...companySettings,
      theme,
    };
    setCompanySettings(updated);
    localStorage.setItem(STORAGE_KEYS.settings_key, JSON.stringify(updated));
  };

  // If quotation tab was directly selected, transition to calculator
  useEffect(() => {
    if (currentTab === ('quotation' as TabType)) {
      setCurrentTab('calculator');
    }
  }, [currentTab]);

  const handleSelectBikeFromCatalog = (series: string, model: string) => {
    setSelectedSeries(series);
    setSelectedModel(model);
    setCurrentTab('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen th-page flex flex-col">
      {/* Brand Header */}
      <Header
        companySettings={companySettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Navigation Tabs */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        applicationsCount={applicationsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20">
        {currentTab === 'calculator' && (
          <LoanCalculator
            selectedSeries={selectedSeries}
            selectedModel={selectedModel}
            onSelectSeries={setSelectedSeries}
            onSelectModel={setSelectedModel}
            customSrp={customSrp}
            onUpdateCustomSrp={setCustomSrp}
            downPaymentPercent={downPaymentPercent}
            onUpdateDownPaymentPercent={setDownPaymentPercent}
            termMonths={termMonths}
            onUpdateTermMonths={setTermMonths}
            monthlyRatePercent={monthlyRatePercent}
            onUpdateMonthlyRatePercent={setMonthlyRatePercent}
            feeLines={feeLines}
            onUpdateFeeLines={setFeeLines}
            onApplyForLoan={() => {
              setCurrentTab('application_form');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            customMotorcycles={customMotorcycles}
            deletedModels={deletedModels}
            onAddMotorcycles={handleAddMotorcycles}
            onDeleteMotorcycles={handleDeleteMotorcycles}
            onRestoreDefaultMotorcycles={handleRestoreDefaultMotorcycles}
          />
        )}

        {currentTab === 'catalog' && (
          <MotorcycleCatalog
            onSelectBikeForLoan={handleSelectBikeFromCatalog}
            customMotorcycles={customMotorcycles}
            deletedModels={deletedModels}
          />
        )}

        {currentTab === 'application_form' && (
          <TextApplicationForm
            companySettings={companySettings}
            selectedModel={selectedModel}
            selectedSeries={selectedSeries}
            customSrp={customSrp}
            termMonths={termMonths}
          />
        )}

        {currentTab === 'requirements' && (
          <RequirementList
            companySettings={companySettings}
            onNavigateToCalculator={() => {
              setCurrentTab('calculator');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToApplicationForm={() => {
              setCurrentTab('application_form');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Official Dealer Bar at the Bottom of Page */}
      <div className="th-card border-t-2 py-3 px-4 no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left text-xs">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <span className="th-badge border text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
              Official Dealer
            </span>
            <span className="font-extrabold th-heading text-sm">
              {companySettings.companyName} • Motorcycle Brand &amp; Loan Specialist
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-1 th-text-secondary text-xs">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 th-accent shrink-0" />
              <span>141 8th Street, corner 11th Avenue, Grace Park East, Caloocan City</span>
            </span>
            <span className="flex items-center gap-1.5 th-accent-2 font-mono font-bold">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>(+63) 917 123 4567 / (02) 8361-8888</span>
            </span>
          </div>
        </div>
      </div>

      {/* BELOW THE PAGE: Quick Portal, Home, Motorcycle Brands & Settings Bar */}
      <div className="no-print th-header border-t sticky bottom-0 z-30 backdrop-blur-md shadow-lg py-2.5 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {/* Quick Loan Portal Button */}
            <button
              onClick={() => {
                setCurrentTab('calculator');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 th-btn-primary font-black text-xs sm:text-sm px-3.5 sm:px-4 py-2.5 rounded-xl shadow-md cursor-pointer transition-all shrink-0"
            >
              <Calculator className="w-4 h-4" />
              <span>Loan Portal</span>
            </button>

            {/* Quick REQUIREMENTS LIST Checklist Button */}
            <button
              onClick={() => {
                setCurrentTab('requirements');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex items-center gap-2 font-bold text-xs sm:text-sm px-3 py-2.5 rounded-xl border cursor-pointer transition-all shrink-0 ${
                currentTab === 'requirements'
                  ? 'th-badge shadow-sm'
                  : 'th-btn-secondary'
              }`}
            >
              <ClipboardCheck className="w-4 h-4 th-accent" />
              <span>Requirements Checklist</span>
            </button>

            {/* Quick Text Application Form Button */}
            <button
              onClick={() => {
                setCurrentTab('application_form');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex items-center gap-2 font-bold text-xs sm:text-sm px-3 py-2.5 rounded-xl border cursor-pointer transition-all shrink-0 ${
                currentTab === 'application_form'
                  ? 'th-badge shadow-sm'
                  : 'th-btn-secondary'
              }`}
            >
              <FileText className="w-4 h-4 th-accent-2" />
              <span>Application Form</span>
            </button>
          </div>

          {/* Bottom Right: Home, Motorcycle Brands, and Settings Buttons */}
          <div className="flex items-center gap-2">
            {/* Home Button */}
            <button
              onClick={() => {
                setCurrentTab('calculator');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex items-center gap-1.5 font-extrabold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all shadow-sm ${
                currentTab === 'calculator'
                  ? 'th-btn-primary border-transparent font-black'
                  : 'th-card hover:opacity-90'
              }`}
              title="Return to Home / Calculator"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            {/* Motorcycle Brands Button */}
            <button
              onClick={() => {
                setCurrentTab('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex items-center gap-2 font-extrabold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all shadow-sm ${
                currentTab === 'catalog'
                  ? 'th-btn-primary border-transparent font-black'
                  : 'th-badge hover:opacity-90'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>Motorcycle Brands</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 th-card hover:opacity-90 font-extrabold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all shadow-sm"
            >
              <Settings className="w-4 h-4 th-accent" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dealership Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={companySettings}
        onSaveSettings={handleSaveSettings}
        onSelectTheme={handleSelectTheme}
        defaultSettings={defaultCompanySettings}
      />

      {/* Footer with Dynamic Company Settings */}
      <footer className="th-footer border-t-4 text-xs py-10 no-print">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              {companySettings.logoUrl ? (
                <div className="w-9 h-9 rounded-lg bg-white border th-border flex items-center justify-center p-1 overflow-hidden shrink-0">
                  <img
                    src={companySettings.logoUrl}
                    alt={companySettings.companyName}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-white border th-border p-1 flex items-center justify-center shrink-0 shadow-md">
                  <BrandLogo className="w-full h-full" />
                </div>
              )}
              <span className="text-base font-black text-white font-mono">
                {companySettings.companyName}
              </span>
            </div>
            <p className="opacity-90 leading-relaxed max-w-lg">
              Authorized motorcycle dealership and financing center. Providing high-performance bikes, flexible installment plans, low down payments, and comprehensive warranty coverage.
            </p>
            <div className="flex items-center gap-2 th-accent font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Freebies: 1st PMS Labor (500-1500KM/1mo) • Tshirt • Tubemask • Tote Bag</span>
            </div>
          </div>

          {/* Dealership Location */}
          <div className="space-y-2">
            <span className="text-white font-bold uppercase tracking-wider block text-[11px]">
              Head Office &amp; Showroom
            </span>
            <div className="flex items-start gap-2 opacity-90">
              <MapPin className="w-4 h-4 th-accent shrink-0 mt-0.5" />
              <span>{companySettings.address}</span>
            </div>
            <div className="flex items-center gap-2 opacity-90 pt-1">
              <Phone className="w-4 h-4 th-accent shrink-0" />
              <span>{companySettings.contactNumber}</span>
            </div>
            <div className="flex items-center gap-2 opacity-90">
              <Mail className="w-4 h-4 th-accent shrink-0" />
              <span>{companySettings.email}</span>
            </div>
          </div>

          {/* Quick Links & Notice */}
          <div className="space-y-2">
            <span className="text-white font-bold uppercase tracking-wider block text-[11px]">
              Loan &amp; Sales Systems
            </span>
            <ul className="space-y-1 opacity-90">
              <li>• Real-Time Financing Calculator</li>
              <li>• Official Quotation Generator</li>
              <li>• Plain-Text Requirements Checklist</li>
              <li>• Plain-Text Loan Application Form</li>
              <li>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="th-accent hover:underline font-semibold cursor-pointer"
                >
                  Dealership Settings &amp; Themes
                </button>
              </li>
            </ul>
            <p className="text-[10px] opacity-70 pt-2">
              © {new Date().getFullYear()} {companySettings.companyName}. All motorcycle specifications and SRPs are subject to official updates.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
