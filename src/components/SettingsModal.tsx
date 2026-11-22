import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Save,
  RotateCcw,
  X,
  CheckCircle2,
  Image,
  Upload,
  Trash2,
  Sparkles,
  Link,
  Palette,
  Moon,
  Sun,
  Zap,
  Check,
} from 'lucide-react';
import { CompanySettings, AppTheme } from '../types';
import { BrandLogo } from './BrandLogo';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CompanySettings;
  onSaveSettings: (settings: CompanySettings) => void;
  onSelectTheme?: (theme: AppTheme) => void;
  defaultSettings: CompanySettings;
}

interface ThemeOption {
  id: AppTheme;
  name: string;
  buttonLabel: string;
  description: string;
  swatches: [string, string, string];
  previewBg: string;
  previewText: string;
  previewBorder: string;
  icon: React.ComponentType<{ className?: string }>;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'dark',
    name: 'DARK Theme (Default)',
    buttonLabel: 'DARK Theme',
    description: 'Deep slate night surface with crisp white typography and teal/blue accents',
    swatches: ['#020617', '#0f172a', '#2dd4bf'],
    previewBg: 'bg-[#0f172a]',
    previewText: 'text-[#f1f5f9]',
    previewBorder: 'border-[#2dd4bf]',
    icon: Moon,
  },
  {
    id: 'teal-pink',
    name: 'Teal, White & Pink',
    buttonLabel: 'Teal, White & Pink',
    description: 'Clean white workspace with teal green & pink accents, bold black borders and shadings',
    swatches: ['#0d9488', '#000000', '#ec4899'],
    previewBg: 'bg-[#f4fbfa]',
    previewText: 'text-[#042f2e]',
    previewBorder: 'border-black shadow-md',
    icon: Sun,
  },
  {
    id: 'black-yellow',
    name: 'Black & Yellow Theme',
    buttonLabel: 'Black & Yellow',
    description: 'High-contrast pure black backdrop paired with bold electric yellow buttons & headings',
    swatches: ['#050505', '#111111', '#facc15'],
    previewBg: 'bg-[#050505]',
    previewText: 'text-[#facc15]',
    previewBorder: 'border-[#facc15]',
    icon: Zap,
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onSelectTheme,
  defaultSettings,
}) => {
  const [formData, setFormData] = useState<CompanySettings>(settings);
  const [activeTab, setActiveTab] = useState<'profile' | 'logo' | 'themes'>('themes');
  const [savedNotice, setSavedNotice] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);
  const [logoNotice, setLogoNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(settings);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const activeTheme: AppTheme = formData.theme || 'dark';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 1200);
  };

  const handleThemeButtonClick = (themeId: AppTheme) => {
    const updated: CompanySettings = { ...formData, theme: themeId };
    setFormData(updated);
    document.documentElement.setAttribute('data-theme', themeId);
    if (onSelectTheme) {
      onSelectTheme(themeId);
    } else {
      onSaveSettings(updated);
    }
    const label = THEME_OPTIONS.find((t) => t.id === themeId)?.buttonLabel || themeId;
    setLogoNotice(`Active theme switched to ${label}!`);
    setTimeout(() => setLogoNotice(null), 2500);
  };

  const handleReset = () => {
    setFormData(defaultSettings);
    const resetTheme = defaultSettings.theme || 'dark';
    document.documentElement.setAttribute('data-theme', resetTheme);
    if (onSelectTheme) {
      onSelectTheme(resetTheme);
    }
    setLogoNotice('Settings reset to defaults');
    setTimeout(() => setLogoNotice(null), 2500);
  };

  // Logo file upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoNotice('Please select an image file (PNG, JPG, SVG, WebP).');
      setTimeout(() => setLogoNotice(null), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setFormData((prev) => ({ ...prev, logoUrl: dataUrl }));
        setLogoNotice('Logo uploaded successfully!');
        setTimeout(() => setLogoNotice(null), 3000);
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Logo delete handler
  const handleDeleteLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: '' }));
    setImageUrlInput('');
    setLogoNotice('Company logo removed. Reverted to default dealership emblem.');
    setTimeout(() => setLogoNotice(null), 3000);
  };

  // Logo URL apply handler
  const handleApplyLogoUrl = () => {
    if (!imageUrlInput.trim()) return;
    setFormData((prev) => ({ ...prev, logoUrl: imageUrlInput.trim() }));
    setImageUrlInput('');
    setShowUrlField(false);
    setLogoNotice('Logo URL applied!');
    setTimeout(() => setLogoNotice(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 th-overlay backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="th-card-strong border-2 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b th-border-subtle pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl th-btn-primary flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black th-heading">Dealership &amp; Theme Settings</h3>
              <p className="text-xs th-text-muted">
                Switch color themes, update dealership details, logo, address, and contact numbers
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="th-text-muted hover:opacity-80 p-2 rounded-xl th-subpanel border border-transparent cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation in Settings */}
        <div className="flex items-center gap-2 th-subpanel p-1.5 rounded-xl border">
          <button
            type="button"
            onClick={() => setActiveTab('themes')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'themes'
                ? 'th-btn-primary shadow-md font-black'
                : 'th-text-secondary hover:opacity-90'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Themes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'th-btn-primary shadow-md font-black'
                : 'th-text-secondary hover:opacity-90'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Company Info</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logo')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'logo'
                ? 'th-btn-primary shadow-md font-black'
                : 'th-text-secondary hover:opacity-90'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Company Logo</span>
            {formData.logoUrl && (
              <span className="w-2 h-2 rounded-full bg-current opacity-80"></span>
            )}
          </button>
        </div>

        {savedNotice && (
          <div className="th-badge-alt border text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Settings saved successfully! Updating quotations, header and layout...</span>
          </div>
        )}

        {logoNotice && (
          <div className="th-badge border text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{logoNotice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* TAB 1: THEMES */}
          {activeTab === 'themes' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-black th-heading flex items-center gap-2">
                    <Palette className="w-4 h-4 th-accent" />
                    <span>Select Portal Theme</span>
                  </h4>
                  <p className="text-xs th-text-muted mt-0.5">
                    Click any theme button below to apply immediately across the portal.
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full th-badge border">
                  Active: {THEME_OPTIONS.find((t) => t.id === activeTheme)?.buttonLabel}
                </span>
              </div>

              {/* Quick Theme Action Buttons (DARK Default, Black & Yellow, Teal White & Pink) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleThemeButtonClick('dark')}
                  className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl font-black text-xs border-2 cursor-pointer transition-all shadow-sm ${
                    activeTheme === 'dark'
                      ? 'bg-[#020617] text-[#2dd4bf] border-[#2dd4bf] ring-2 ring-[#38bdf8]/50'
                      : 'bg-[#0f172a] text-[#f1f5f9] border-[#334155] hover:border-[#2dd4bf]'
                  }`}
                >
                  <Moon className="w-4 h-4 text-[#2dd4bf]" />
                  <span>DARK Theme</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleThemeButtonClick('black-yellow')}
                  className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl font-black text-xs border-2 cursor-pointer transition-all shadow-sm ${
                    activeTheme === 'black-yellow'
                      ? 'bg-[#050505] text-[#facc15] border-[#facc15] ring-2 ring-[#facc15]/60'
                      : 'bg-[#050505] text-[#facc15] border-[#52525b] hover:border-[#facc15]'
                  }`}
                >
                  <Zap className="w-4 h-4 text-[#facc15]" />
                  <span>Black &amp; Yellow</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleThemeButtonClick('teal-pink')}
                  className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl font-black text-xs border-2 border-black cursor-pointer transition-all shadow-[3px_3px_0px_#000000] ${
                    activeTheme === 'teal-pink'
                      ? 'bg-[#f4fbfa] text-[#042f2e] ring-2 ring-[#ec4899]/60'
                      : 'bg-[#f4fbfa] text-[#042f2e] hover:bg-[#ccfbf1]'
                  }`}
                >
                  <Sun className="w-4 h-4 text-[#0d9488]" />
                  <span>Teal, White &amp; Pink</span>
                </button>
              </div>

              {/* Detailed Theme Preview Cards */}
              <div className="space-y-2.5 pt-1">
                {THEME_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = activeTheme === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleThemeButtonClick(option.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'th-hero th-border-strong shadow-md'
                          : 'th-subpanel th-border hover:opacity-90'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center shrink-0 ${option.previewBg} ${option.previewText} ${option.previewBorder}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-black th-heading">{option.name}</span>
                            {isSelected && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full th-btn-primary">
                                <Check className="w-3 h-3" />
                                <span>Active</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs th-text-muted mt-0.5">{option.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {option.swatches.map((color, idx) => (
                          <span
                            key={idx}
                            className="w-5 h-5 rounded-full border th-border shadow-sm"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: COMPANY PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Company Name */}
              <div>
                <label className="block th-accent font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Name of Company / Dealership</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, companyName: e.target.value }))
                  }
                  placeholder="e.g. Motorcycle Financing & Loan Calculators"
                  className="w-full th-input border rounded-xl px-3.5 py-2.5 text-sm font-medium"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block th-accent font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 th-accent-2" />
                  <span>Company / Showroom Address</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder="e.g. 141 8th Street, corner 11th Avenue, Grace Park East, Caloocan City"
                  className="w-full th-input border rounded-xl px-3.5 py-2 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Contact Number */}
                <div>
                  <label className="block th-accent font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Contact Number / Hotline</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, contactNumber: e.target.value }))
                    }
                    placeholder="e.g. (+63) 917 123 4567"
                    className="w-full th-input border rounded-xl px-3.5 py-2.5 text-sm font-medium"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block th-accent font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 th-accent-2" />
                    <span>Official Inquiries Email</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="e.g. sales@motorcycleloans.ph"
                    className="w-full th-input border rounded-xl px-3.5 py-2.5 text-sm font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPANY LOGO */}
          {activeTab === 'logo' && (
            <div className="space-y-5">
              {/* Current Logo Preview Card */}
              <div className="th-subpanel border rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5">
                <div className="w-24 h-24 rounded-2xl th-card border p-2 flex items-center justify-center shrink-0 shadow-md relative group">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Company Logo Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-1">
                      <div className="w-12 h-12">
                        <BrandLogo />
                      </div>
                      <span className="text-[9px] uppercase font-bold mt-1 th-accent">Default Emblem</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <h4 className="text-sm font-bold th-heading">Dealership Logo Status</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        formData.logoUrl
                          ? 'th-badge'
                          : 'th-badge-alt'
                      }`}
                    >
                      {formData.logoUrl ? 'Custom Logo Active' : 'Default Teardrop Leaf Emblem'}
                    </span>
                  </div>
                  <p className="text-xs th-text-muted leading-relaxed">
                    This logo appears on your top navigation bar, printable sales quotations, and official dealership documents.
                  </p>

                  {/* Actions for Logo */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 th-btn-primary font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{formData.logoUrl ? 'Change Logo (Upload Image)' : 'Upload Logo Image'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowUrlField(!showUrlField)}
                      className="flex items-center gap-1.5 th-btn-secondary font-bold px-3 py-1.5 rounded-xl border cursor-pointer transition-colors"
                    >
                      <Link className="w-3.5 h-3.5 th-accent-2" />
                      <span>{showUrlField ? 'Hide URL Input' : 'Use Image URL'}</span>
                    </button>

                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={handleDeleteLogo}
                        className="flex items-center gap-1.5 th-badge border font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
                        title="Delete Company Logo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Logo</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Image URL input field */}
              {showUrlField && (
                <div className="th-subpanel border p-4 rounded-xl space-y-2">
                  <label className="block th-accent font-bold text-xs uppercase tracking-wider">
                    Enter Direct Image URL (HTTPS)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="flex-1 th-input border rounded-lg px-3 py-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleApplyLogoUrl}
                      className="th-btn-primary font-bold px-3 py-2 rounded-lg cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t th-border-subtle">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 th-text-muted hover:opacity-80 font-semibold cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl th-btn-secondary border font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 th-btn-primary font-black px-5 py-2.5 rounded-xl shadow-lg cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
