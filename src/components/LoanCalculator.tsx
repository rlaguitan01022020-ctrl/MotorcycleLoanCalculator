import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Plus,
  Trash2,
  ChevronRight,
  Info,
  DollarSign,
  Calendar,
  Percent,
  Layers,
  ArrowRight,
  Sparkles,
  Bike,
  CheckCircle2,
  TrendingUp,
  Wallet,
  Building,
  PiggyBank,
  Check,
  Copy,
  FileText,
  Download,
  X,
  Share2,
  UserCheck,
  Phone,
  Upload,
} from 'lucide-react';
import { MotorcycleEntryModal, MotorcycleModalTab } from './MotorcycleEntryModal';
import {
  CFMOTO_SERIES_MAP,
  ALL_MOTORCYCLES,
  LOAN_SETTINGS,
  STORAGE_KEYS,
} from '../data/motostradaData';

const ViberIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M19.78 3.51A13.8 13.8 0 0 0 12.08 2C5.9 2 2.2 5.56 2.02 11.23c-.1 3.19 1.05 5.92 3.12 8.04l-.06 2.05c-.03 1.08.97 1.77 1.87 1.34l2.67-1.3c.8.18 1.63.27 2.47.27 6.18 0 9.87-3.55 10.05-9.23.18-5.7-3.48-8.89-2.36-8.89zm-1.89 12.63c-.22.65-.95 1.05-1.7.92-1.95-.34-4.14-1.38-6.13-3.37-1.98-1.99-3.03-4.18-3.37-6.13-.13-.75.27-1.48.92-1.7.67-.22 1.41.08 1.75.72l.9 1.8c.28.56.14 1.25-.33 1.66l-.54.47c.5.95 1.26 1.71 2.21 2.21l.47-.54c.41-.47 1.1-.61 1.66-.33l1.8.9c.64.34.94 1.08.72 1.75zM15.5 8.5c-.28 0-.5-.22-.5-.5a3 3 0 0 0-3-3 .5.5 0 0 1 0-1 4 4 0 0 1 4 4c0 .28-.22.5-.5.5zm1.5 0c-.28 0-.5-.22-.5-.5a4.5 4.5 0 0 0-4.5-4.5.5.5 0 0 1 0-1 5.5 5.5 0 0 1 5.5 5.5c0 .28-.22.5-.5.5z" />
  </svg>
);
import { FeeLine, FeeBasis, FeeTreatment, MotorcycleModel } from '../types';
import { calculateLoan, formatPHP, formatNumber } from '../utils/calculator';
import { downloadMotorcycleMassExcelTemplate } from '../utils/excelTemplate';

interface LoanCalculatorProps {
  selectedSeries: string;
  selectedModel: string;
  onSelectSeries: (series: string) => void;
  onSelectModel: (model: string) => void;
  customSrp: number;
  onUpdateCustomSrp: (srp: number) => void;
  downPaymentPercent: number;
  onUpdateDownPaymentPercent: (dp: number) => void;
  termMonths: number;
  onUpdateTermMonths: (term: number) => void;
  monthlyRatePercent: number;
  onUpdateMonthlyRatePercent: (rate: number) => void;
  feeLines: FeeLine[];
  onUpdateFeeLines: (fees: FeeLine[]) => void;
  onApplyForLoan: () => void;
  onAskAI?: (query: string) => void;
  customMotorcycles?: MotorcycleModel[];
  deletedModels?: string[];
  onAddMotorcycles?: (bikes: MotorcycleModel[]) => void;
  onDeleteMotorcycles?: (modelNames: string[]) => void;
  onRestoreDefaultMotorcycles?: () => void;
}

export type CalculatorTabMode =
  | 'standard'
  | 'affordability'
  | 'cash_vs_loan';

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({
  selectedSeries,
  selectedModel,
  onSelectSeries,
  onSelectModel,
  customSrp,
  onUpdateCustomSrp,
  downPaymentPercent,
  onUpdateDownPaymentPercent,
  termMonths,
  onUpdateTermMonths,
  monthlyRatePercent,
  onUpdateMonthlyRatePercent,
  feeLines,
  onUpdateFeeLines,
  onApplyForLoan,
  onAskAI,
  customMotorcycles = [],
  deletedModels = [],
  onAddMotorcycles,
  onDeleteMotorcycles,
  onRestoreDefaultMotorcycles,
}) => {
  const [isCustomSrpMode, setIsCustomSrpMode] = useState(false);
  const [isEditingBike, setIsEditingBike] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [entryModalTab, setEntryModalTab] = useState<MotorcycleModalTab>('manual');
  const [bikeActionNotice, setBikeActionNotice] = useState<string | null>(null);

  // Combined Series & Brand Map (respecting custom additions & deleted models)
  const combinedSeriesMap = useMemo(() => {
    const deletedSet = new Set(deletedModels.map((m) => m.toLowerCase()));
    const map: Record<string, Array<{ model: string; srp: number; category?: string; displacement?: string; brand?: string; isCustom?: boolean }>> = {};

    Object.entries(CFMOTO_SERIES_MAP).forEach(([series, models]) => {
      const visible = models.filter((m) => !deletedSet.has(m.model.toLowerCase()));
      if (visible.length > 0) {
        map[series] = visible.map((m) => ({ ...m }));
      }
    });

    if (customMotorcycles && customMotorcycles.length > 0) {
      customMotorcycles.forEach((bike) => {
        if (deletedSet.has(bike.model.toLowerCase())) return;
        const sName = bike.series || (bike.brand ? `${bike.brand} Lineup` : 'Custom Lineup');
        if (!map[sName]) {
          map[sName] = [];
        }
        const existingIdx = map[sName].findIndex(
          (b) => b.model.toLowerCase() === bike.model.toLowerCase()
        );
        const entry = {
          model: bike.model,
          srp: bike.srp,
          category: bike.category || 'Motorcycle',
          displacement: bike.displacement || 'Standard',
          brand: bike.brand || 'Motorcycle Brand',
          isCustom: true,
        };
        if (existingIdx >= 0) {
          map[sName][existingIdx] = entry;
        } else {
          map[sName].push(entry);
        }
      });
    }
    return map;
  }, [customMotorcycles, deletedModels]);

  const allVisibleBikes = useMemo<MotorcycleModel[]>(() => {
    return Object.entries(combinedSeriesMap).flatMap(([series, models]) =>
      models.map((m) => ({
        brand: m.brand || 'CFMOTO',
        series,
        model: m.model,
        srp: m.srp,
        category: m.category,
        displacement: m.displacement,
        isCustom: m.isCustom,
      }))
    );
  }, [combinedSeriesMap]);

  const showBikeNotice = (msg: string) => {
    setBikeActionNotice(msg);
    setTimeout(() => setBikeActionNotice(null), 3500);
  };

  const openEntryModal = (tab: MotorcycleModalTab) => {
    setEntryModalTab(tab);
    setIsEntryModalOpen(true);
  };

  const handleDownloadMassTemplateDirect = () => {
    try {
      downloadMotorcycleMassExcelTemplate();
      showBikeNotice('Downloaded Excel Mass Template (.xlsx)');
    } catch {}
  };

  // Available models in current series
  const seriesKeys = Object.keys(combinedSeriesMap);
  const effectiveSeries = combinedSeriesMap[selectedSeries] ? selectedSeries : seriesKeys[0] || '';
  const seriesModels = effectiveSeries ? combinedSeriesMap[effectiveSeries] || [] : [];
  const currentModelObj =
    seriesModels.find(
      (m) =>
        m.model === selectedModel ||
        (m.model === '450CL-C Manual' &&
          (selectedModel === '450CL-C' ||
            selectedModel === '450 CL-C' ||
            selectedModel === '450 CL-C Manual'))
    ) || seriesModels[0];

  const handleDeleteCurrentModel = () => {
    const targetModel = currentModelObj?.model || selectedModel;
    if (!targetModel) return;
    onDeleteMotorcycles?.([targetModel]);

    // Select next available model so dropdown never points to deleted item
    const remainingInSeries = seriesModels.filter(
      (m) => m.model.toLowerCase() !== targetModel.toLowerCase()
    );
    if (remainingInSeries.length > 0) {
      onSelectModel(remainingInSeries[0].model);
    } else {
      const nextSeries = seriesKeys.find((s) => s !== effectiveSeries);
      if (nextSeries && combinedSeriesMap[nextSeries]?.length > 0) {
        onSelectSeries(nextSeries);
        onSelectModel(combinedSeriesMap[nextSeries][0].model);
      }
    }
    showBikeNotice(`Deleted "${targetModel}"`);
  };

  // Active SRP
  const activeSrp = (isCustomSrpMode || isEditingBike) ? customSrp : currentModelObj?.srp || customSrp || 150000;

  // Calculation result
  const result = useMemo(() => {
    return calculateLoan({
      srp: activeSrp,
      downPaymentPercent,
      termMonths,
      monthlyRatePercent,
      feeLines,
      ltoCash: LOAN_SETTINGS.lto_registration_cash,
    });
  }, [activeSrp, downPaymentPercent, termMonths, monthlyRatePercent, feeLines]);

  // Term comparison for quick decision
  const termComparisons = useMemo(() => {
    return [12, 18, 24, 36, 48, 60].map((term) => {
      const calc = calculateLoan({
        srp: activeSrp,
        downPaymentPercent,
        termMonths: term,
        monthlyRatePercent,
        feeLines,
        ltoCash: LOAN_SETTINGS.lto_registration_cash,
      });
      return {
        term,
        monthly: calc.monthlyAmortization,
        totalCost: calc.totalCostOfMotorcycle,
        totalInterest: calc.addOnInterest,
      };
    });
  }, [activeSrp, downPaymentPercent, monthlyRatePercent, feeLines]);

  // Fee management handlers
  const handleAddFeeLine = () => {
    if (feeLines.length >= LOAN_SETTINGS.maximum_fee_lines) return;
    const newFee: FeeLine = {
      id: 'fee_' + Date.now(),
      type: 'Processing Fees',
      basis: '% of approved loan',
      value: 2,
      treatment: 'Add to Loan',
    };
    onUpdateFeeLines([...feeLines, newFee]);
  };

  const handleRemoveFeeLine = (id: string) => {
    onUpdateFeeLines(feeLines.filter((f) => f.id !== id));
  };

  const handleUpdateFeeLine = (id: string, updates: Partial<FeeLine>) => {
    onUpdateFeeLines(
      feeLines.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  // Agent Details for Notepad & Quotations
  const [agentName, setAgentName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.agent_key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name !== undefined) return parsed.name;
      }
    } catch {}
    return 'Onad';
  });

  const [agentContact, setAgentContact] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.agent_key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.contact !== undefined) return parsed.contact;
      }
    } catch {}
    return '9914414670';
  });

  // Notepad Summary & Modal State
  const [isNotepadModalOpen, setIsNotepadModalOpen] = useState(false);
  const [isCopiedNotepad, setIsCopiedNotepad] = useState(false);
  const [isViberSent, setIsViberSent] = useState(false);
  const [notepadCustomText, setNotepadCustomText] = useState('');
  const [isModalCopied, setIsModalCopied] = useState(false);
  const [showRateGuidelines, setShowRateGuidelines] = useState(false);

  // Generate complete Notepad summary text (Clean format according to user specification)
  const generateNotepadSummary = (
    overrideName?: string,
    overrideContact?: string
  ) => {
    const bikeName = currentModelObj?.model || selectedModel;
    const srpFormatted = formatPHP(result.srp);
    const rawAgentName = (overrideName !== undefined ? overrideName : agentName).trim();
    const rawAgentContact = (overrideContact !== undefined ? overrideContact : agentContact).trim();
    const cleanAgentName = rawAgentName === 'Blank' ? '' : rawAgentName;
    const cleanAgentContact = rawAgentContact === 'Blank' ? '' : rawAgentContact;

    let text = `MOTORCYCLE LOAN QUOTATION SUMMARY\n`;
    text += `Date: ${new Date().toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}\n\n`;

    text += `Model Name: ${bikeName}\n`;
    text += `SRP: ${srpFormatted}\n\n`;

    text += `DOWN PAYMENT & TERMS\n`;
    text += `• Down Payment: ${result.downPaymentPercent}% (${formatPHP(result.downPaymentAmount)})\n`;
    text += `• Repayment Term: ${result.termMonths} Months\n`;
    text += `• Monthly Add-on Rate: ${result.monthlyRatePercent}% / month\n`;
    text += `• LTO Registration (Cash Out): ${formatPHP(result.ltoCash)}\n\n`;

    text += `★ MONTHLY AMORTIZATION: ${formatPHP(result.monthlyAmortization)} / month\n`;
    text += `★ TOTAL CASH OUT: ${formatPHP(result.totalCashOut)}\n\n`;

    text += `TERM COMPARISON\n`;
    const standardTerms = [12, 18, 24, 36];
    standardTerms.forEach((term) => {
      const comp = termComparisons.find((t) => t.term === term);
      const monthlyStr = comp ? formatPHP(comp.monthly) : formatPHP(result.monthlyAmortization);
      text += `• ${term} Months : ${monthlyStr} / mo\n`;
    });
    text += `\n`;
    text += `Agent Name: ${cleanAgentName}\n`;
    text += `Agent Contact Number: ${cleanAgentContact}\n\n`;

    text += `Freebies Included:\n`;
    text += `✓ 1st PMS Labor (500-1500KM/1mo)  ✓ Official T-Shirt\n`;
    text += `✓ Riding Tube Mask                ✓ Dealership Tote Bag\n\n`;
    text += `141 8th Street, corner 11th Avenue, Grace Park East, Caloocan City\n`;

    return text;
  };

  const handleCopyToNotepad = async () => {
    const text = generateNotepadSummary();
    setNotepadCustomText(text);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setIsCopiedNotepad(true);
      setTimeout(() => setIsCopiedNotepad(false), 3000);
    } catch (err) {
      console.warn('Clipboard write error:', err);
    }
    setIsNotepadModalOpen(true);
  };

  const handleSendToViber = (customText?: string) => {
    const textToSend =
      customText ||
      (isNotepadModalOpen && notepadCustomText ? notepadCustomText : generateNotepadSummary());

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToSend).catch(() => {
        try {
          const ta = document.createElement('textarea');
          ta.value = textToSend;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        } catch {}
      });
    }

    setIsViberSent(true);
    setTimeout(() => setIsViberSent(false), 3000);

    try {
      const viberUrl = `viber://forward?text=${encodeURIComponent(textToSend)}`;
      window.location.href = viberUrl;
    } catch {}
  };

  const handleDownloadTxt = () => {
    const text = notepadCustomText || generateNotepadSummary();
    const cleanModel = (selectedModel || 'Motorcycle').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Loan_Summary_${cleanModel}_${termMonths}mo.txt`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyFromModal = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(notepadCustomText);
      } else {
        const ta = document.createElement('textarea');
        ta.value = notepadCustomText;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setIsModalCopied(true);
      setTimeout(() => setIsModalCopied(false), 2500);
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* Top Banner & Quick Intro */}
      <div className="th-hero border-2 rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Bike className="w-80 h-80 th-accent" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 th-btn-primary text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-3 shadow-sm">
            <Calculator className="w-3.5 h-3.5" />
            <span>Financial Planning &amp; Amortization Suite</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black th-heading tracking-tight">
            Motorcycle Financing &amp; Loan Calculators
          </h2>
        </div>
      </div>

      {/* TAB 1: STANDARD LOAN CALCULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Configuration Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Motorcycle Selection Card */}
          <div className="th-card border rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 th-heading font-bold text-base sm:text-lg">
                <Bike className="w-5 h-5 th-accent-2" />
                <span>1. Motorcycle Brand / Lineup &amp; Model</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => openEntryModal('manual')}
                  className="text-xs px-3 py-1.5 rounded-xl font-black transition-all cursor-pointer flex items-center gap-1 th-btn-primary shadow-sm"
                  title="Upload manual new entry"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCurrentModel}
                  disabled={!currentModelObj}
                  className="text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 th-badge border disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Delete currently selected Motorcycle Brand / Lineup & Model"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isEditingBike) {
                      onUpdateCustomSrp(activeSrp);
                    }
                    setIsEditingBike(!isEditingBike);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isEditingBike
                      ? 'th-btn-primary border-transparent shadow-sm'
                      : 'th-btn-secondary'
                  }`}
                >
                  <span>{isEditingBike ? '✓ Done Editing' : '✏️ Edit Brand & Model'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomSrpMode(!isCustomSrpMode)}
                  className="text-xs th-accent hover:opacity-80 underline font-semibold cursor-pointer px-1"
                >
                  {isCustomSrpMode ? 'Lineup SRP' : 'Custom SRP'}
                </button>
              </div>
            </div>

            {/* Mass Entry, Mass Upload, Mass Delete & Mass Template Bar */}
            <div className="th-subpanel border rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold th-accent uppercase tracking-wider px-1">
                Entry &amp; Mass Tools:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openEntryModal('manual')}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg font-bold th-btn-secondary border flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3 th-accent" />
                  <span>Manual New Entry</span>
                </button>
                <button
                  type="button"
                  onClick={() => openEntryModal('mass')}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg font-black th-btn-primary flex items-center gap-1 cursor-pointer shadow-sm transition-all"
                >
                  <Upload className="w-3 h-3" />
                  <span>Mass Upload / Entry</span>
                </button>
                <button
                  type="button"
                  onClick={() => openEntryModal('delete')}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg font-bold th-badge border flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Mass Delete</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadMassTemplateDirect}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg font-bold th-badge-alt border flex items-center gap-1 cursor-pointer transition-colors"
                  title="Download Excel Mass Template (.xlsx)"
                >
                  <Download className="w-3 h-3" />
                  <span>Mass Template (.xlsx)</span>
                </button>
              </div>
            </div>

            {bikeActionNotice && (
              <div className="th-badge-alt border rounded-xl px-3 py-2 text-xs font-bold flex items-center justify-between gap-2">
                <span>{bikeActionNotice}</span>
                {deletedModels.length > 0 && onRestoreDefaultMotorcycles && (
                  <button
                    type="button"
                    onClick={() => {
                      onRestoreDefaultMotorcycles();
                      showBikeNotice('Restored default catalog models.');
                    }}
                    className="underline cursor-pointer text-[11px]"
                  >
                    Restore Defaults
                  </button>
                )}
              </div>
            )}

            {isEditingBike ? (
              /* Editable Direct Input Fields */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 th-subpanel p-4 rounded-2xl border animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold th-accent-2 uppercase tracking-wider mb-1.5">
                    ✏️ Motorcycle Brand / Lineup (Editable)
                  </label>
                  <input
                    type="text"
                    value={selectedSeries}
                    onChange={(e) => onSelectSeries(e.target.value)}
                    placeholder="e.g. Honda, Yamaha, Kawasaki, CFMOTO, Suzuki..."
                    className="w-full th-input border rounded-xl px-3.5 py-2.5 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold th-accent-2 uppercase tracking-wider mb-1.5">
                    ✏️ Model Name (Editable)
                  </label>
                  <input
                    type="text"
                    value={selectedModel}
                    onChange={(e) => onSelectModel(e.target.value)}
                    placeholder="e.g. ADV 160, Click 125, NMAX 155..."
                    className="w-full th-input border rounded-xl px-3.5 py-2.5 text-sm font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold th-accent uppercase tracking-wider mb-1.5">
                    Motorcycle Price / SRP (₱)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 th-accent font-bold">₱</span>
                    <input
                      type="number"
                      value={activeSrp}
                      onChange={(e) => {
                        setIsCustomSrpMode(true);
                        onUpdateCustomSrp(Number(e.target.value));
                      }}
                      placeholder="Enter Price in PHP..."
                      className="w-full th-input border rounded-xl pl-8 pr-3.5 py-2 text-sm th-accent font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            ) : !isCustomSrpMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Series / Brand Selector */}
                <div>
                  <label className="block text-xs font-semibold th-accent uppercase tracking-wider mb-1.5">
                    Motorcycle Brand / Lineup
                  </label>
                  <select
                    value={effectiveSeries}
                    onChange={(e) => {
                      const newSeries = e.target.value;
                      onSelectSeries(newSeries);
                      const models = combinedSeriesMap[newSeries];
                      if (models && models.length > 0) {
                        onSelectModel(models[0].model);
                      }
                    }}
                    className="w-full th-input border rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors"
                  >
                    <optgroup label="CFMOTO Philippines">
                      {Object.keys(combinedSeriesMap)
                        .filter(
                          (s) =>
                            !s.startsWith('MV Agusta') &&
                            !s.startsWith('Peugeot') &&
                            (!combinedSeriesMap[s][0]?.brand ||
                              combinedSeriesMap[s][0]?.brand === 'CFMOTO')
                        )
                        .map((series) => (
                          <option key={series} value={series}>
                            {series} ({combinedSeriesMap[series].length} models)
                          </option>
                        ))}
                    </optgroup>

                    <optgroup label="MV Agusta Philippines">
                      {Object.keys(combinedSeriesMap)
                        .filter(
                          (s) =>
                            s.startsWith('MV Agusta') ||
                            combinedSeriesMap[s][0]?.brand === 'MV Agusta'
                        )
                        .map((series) => (
                          <option key={series} value={series}>
                            {series.replace('MV Agusta - ', '')} ({combinedSeriesMap[series].length} models)
                          </option>
                        ))}
                    </optgroup>

                    <optgroup label="Peugeot Motocycles Philippines">
                      {Object.keys(combinedSeriesMap)
                        .filter(
                          (s) =>
                            s.startsWith('Peugeot') ||
                            combinedSeriesMap[s][0]?.brand?.includes('Peugeot')
                        )
                        .map((series) => (
                          <option key={series} value={series}>
                            {series} ({combinedSeriesMap[series].length} models)
                          </option>
                        ))}
                    </optgroup>

                    {Object.keys(combinedSeriesMap).some((s) => {
                      const b = combinedSeriesMap[s][0]?.brand;
                      return (
                        b &&
                        b !== 'CFMOTO' &&
                        b !== 'MV Agusta' &&
                        !b.includes('Peugeot') &&
                        !s.startsWith('MV Agusta') &&
                        !s.startsWith('Peugeot')
                      );
                    }) && (
                      <optgroup label="Custom / Other Lineups">
                        {Object.keys(combinedSeriesMap)
                          .filter((s) => {
                            const b = combinedSeriesMap[s][0]?.brand;
                            return (
                              b &&
                              b !== 'CFMOTO' &&
                              b !== 'MV Agusta' &&
                              !b.includes('Peugeot') &&
                              !s.startsWith('MV Agusta') &&
                              !s.startsWith('Peugeot')
                            );
                          })
                          .map((series) => (
                            <option key={series} value={series}>
                              {series} ({combinedSeriesMap[series].length} models)
                            </option>
                          ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                {/* Model Selector */}
                <div>
                  <label className="block text-xs font-semibold th-accent uppercase tracking-wider mb-1.5">
                    Model
                  </label>
                  <select
                    value={currentModelObj?.model || ''}
                    onChange={(e) => onSelectModel(e.target.value)}
                    className="w-full th-input border rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors"
                  >
                    {seriesModels.map((m) => (
                      <option key={m.model} value={m.model}>
                        {m.model} - {formatPHP(m.srp)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Model Details Snapshot */}
                <div className="sm:col-span-2 th-hero border rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-bold th-accent-2">
                      Selected: {currentModelObj?.model}
                    </span>
                    <div className="text-xs th-text-secondary">
                      {currentModelObj?.brand && (
                        <span className="th-accent font-bold">{currentModelObj.brand} • </span>
                      )}
                      {currentModelObj?.category} {currentModelObj?.displacement && `• ${currentModelObj?.displacement}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs th-accent block font-medium">Standard Retail Price (SRP)</span>
                    <span className="text-xl font-black th-heading font-mono">
                      {formatPHP(activeSrp)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold th-accent uppercase tracking-wider mb-1.5">
                  Custom Motorcycle SRP (₱)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 th-accent font-bold">₱</span>
                  <input
                    type="number"
                    min="10000"
                    step="1000"
                    value={customSrp}
                    onChange={(e) => onUpdateCustomSrp(Number(e.target.value) || 0)}
                    className="w-full th-input border rounded-xl pl-8 pr-4 py-2.5 text-base th-accent-2 font-bold font-mono"
                    placeholder="Enter SRP"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Down Payment & Loan Terms */}
          <div className="th-card border rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 th-heading font-bold text-base sm:text-lg">
                <Percent className="w-5 h-5 th-accent-2" />
                <span>2. Down Payment &amp; Terms</span>
              </div>
              <span className="text-xs th-accent font-semibold">Min. {LOAN_SETTINGS.minimum_down_payment_percent}% DP</span>
            </div>

            {/* Down Payment Slider and Presets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold th-accent uppercase tracking-wider">
                  Down Payment Percentage
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black th-accent-2 font-mono">
                    {downPaymentPercent}%
                  </span>
                  <span className="text-xs th-text-muted font-medium">
                    ({formatPHP(result.downPaymentAmount)})
                  </span>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min={LOAN_SETTINGS.minimum_down_payment_percent}
                max={60}
                step={1}
                value={downPaymentPercent}
                onChange={(e) => onUpdateDownPaymentPercent(Number(e.target.value))}
                className="w-full h-2 th-slider rounded-lg appearance-none cursor-pointer"
              />

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[5, 10, 15, 20, 25, 30, 40, 50].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onUpdateDownPaymentPercent(preset)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                      downPaymentPercent === preset
                        ? 'th-btn-primary border-transparent font-bold shadow-sm'
                        : 'th-btn-secondary'
                    }`}
                  >
                    {preset}% {preset === 20 && '(Default)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Term Months Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold th-accent uppercase tracking-wider block">
                Loan Term (Months)
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {LOAN_SETTINGS.terms_months.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onUpdateTermMonths(t)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer border ${
                      termMonths === t
                        ? 'th-btn-primary border-transparent shadow-md'
                        : 'th-btn-secondary'
                    }`}
                  >
                    <div>{t}</div>
                    <div className="text-[10px] font-normal opacity-80">Mos</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Add-on Interest Rate */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold th-accent uppercase tracking-wider">
                  Rate (%)
                </label>
                <span className="text-sm font-bold th-accent-2 font-mono">
                  {monthlyRatePercent}% / month
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.05"
                  value={monthlyRatePercent}
                  onChange={(e) => onUpdateMonthlyRatePercent(parseFloat(e.target.value) || 0)}
                  className="w-full h-2 th-slider rounded-lg appearance-none cursor-pointer"
                />
                <div className="relative w-28 shrink-0">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={monthlyRatePercent === 0 ? '' : monthlyRatePercent}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      onUpdateMonthlyRatePercent(isNaN(val) ? 0 : val);
                    }}
                    className="w-full th-input border rounded-xl px-3 py-2 text-sm font-mono font-bold text-right pr-8"
                  />
                  <span className="absolute right-2.5 top-2.5 text-xs th-accent font-bold">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* NOTE BELOW DOWN PAYMENT & TERMS: COLLAPSIBLE TOGGLE */}
          <div className="th-card border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowRateGuidelines(!showRateGuidelines)}
                className="flex items-center gap-2 th-accent hover:opacity-80 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
              >
                <Info className="w-4 h-4 shrink-0 th-accent-2" />
                <span>NOTE: Rate Guidelines</span>
                <span className="text-[10px] th-badge border px-2 py-0.5 rounded font-bold uppercase ml-1">
                  {showRateGuidelines ? 'Hide' : 'Click to View'}
                </span>
              </button>

              {showRateGuidelines && (
                <button
                  type="button"
                  onClick={() => {
                    const noteText = `NOTE:\n10%\n36 month 2.70%\n24 months 2.60%\n12 months 2.5%\n\nDP SMALL CC\n15% Monthly Add-on Interest Rate 2.25%\n3% Processing fee\n\nDP BIG CC\n20% up 1.85% Interest rate`;
                    if (navigator?.clipboard?.writeText) {
                      navigator.clipboard.writeText(noteText).catch(() => {});
                    }
                  }}
                  className="text-[11px] th-btn-secondary border px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors"
                >
                  Copy Note
                </button>
              )}
            </div>

            {/* Exact NOTE verbatim display (hidden by default, only shown if button pressed) */}
            {showRateGuidelines && (
              <div className="th-notepad-box border rounded-xl p-4 font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-inner select-all animate-fadeIn">
{`NOTE:
10%
36 month 2.70%
24 months 2.60%
12 months 2.5%

DP SMALL CC
15% Monthly Add-on Interest Rate 2.25%
3% Processing fee

DP BIG CC
20% up 1.85% Interest rate`}
              </div>
            )}
          </div>

          {/* 3. Fee Lines Manager */}
          <div className="th-card border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 th-heading font-bold text-base sm:text-lg">
                  <Layers className="w-5 h-5 th-accent" />
                  <span>3. Additional Fees &amp; Treatments</span>
                </div>
                <p className="text-xs th-text-muted mt-0.5">
                  LTO Registration is ₱5,500 fixed (automatic add in Total Motorcycle Cost &amp; Cash Out)
                </p>
              </div>
              {feeLines.length < LOAN_SETTINGS.maximum_fee_lines && (
                <button
                  type="button"
                  onClick={handleAddFeeLine}
                  className="flex items-center gap-1.5 th-btn-secondary text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Custom Fee</span>
                </button>
              )}
            </div>

            {/* Fixed LTO Registration Fee (₱5,500 Automatic Add) */}
            <div className="th-hero border rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg th-btn-primary flex items-center justify-center font-black text-xs shrink-0 tracking-wider">
                  LTO
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold th-heading">LTO Registration Fee</span>
                    <span className="text-[10px] th-badge-alt border font-bold px-2 py-0.5 rounded">
                      ₱5,500 Fixed
                    </span>
                    <span className="text-[10px] th-badge border font-semibold px-2 py-0.5 rounded">
                      Automatic in Total Motorcycle Cost
                    </span>
                  </div>
                  <p className="text-[11px] th-text-muted mt-0.5">
                    Standard 3-Year Motor Vehicle Registration &amp; TPL (Treatment: Cash Outright)
                  </p>
                </div>
              </div>
              <div className="text-right sm:text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end shrink-0">
                <span className="text-[10px] th-accent uppercase font-semibold">Treatment: Cash Outright</span>
                <span className="text-base font-black th-accent font-mono">₱5,500</span>
              </div>
            </div>

            {/* Dynamic Fee Lines */}
            {feeLines.length === 0 ? (
              <div className="text-center py-3 th-subpanel border border-dashed rounded-xl text-xs th-text-muted">
                No other custom fee lines added. (Optional: click &quot;Add Custom Fee&quot; for Processing, Insurance, or PN Stamps)
              </div>
            ) : (
              <div className="space-y-3">
                {feeLines.map((fee, idx) => (
                  <div
                    key={fee.id}
                    className="th-subpanel border rounded-xl p-3.5 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold th-accent-2 uppercase tracking-wider">
                        Fee Line #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeeLine(fee.id)}
                        className="th-text-muted hover:opacity-80 transition-colors p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <div className="sm:col-span-1">
                        <label className="text-[10px] uppercase font-semibold th-accent block mb-1">
                          Type
                        </label>
                        <select
                          value={fee.type}
                          onChange={(e) => handleUpdateFeeLine(fee.id, { type: e.target.value })}
                          className="w-full th-input border rounded-lg px-2.5 py-1.5 text-xs"
                        >
                          {LOAN_SETTINGS.fee_types.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-1">
                        <label className="text-[10px] uppercase font-semibold th-accent block mb-1">
                          Basis
                        </label>
                        <select
                          value={fee.basis}
                          onChange={(e) =>
                            handleUpdateFeeLine(fee.id, {
                              basis: e.target.value as FeeBasis,
                              value: e.target.value === '% of approved loan' ? 2 : 2500,
                            })
                          }
                          className="w-full th-input border rounded-lg px-2.5 py-1.5 text-xs"
                        >
                          {LOAN_SETTINGS.fee_basis.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-1">
                        <label className="text-[10px] uppercase font-semibold th-accent block mb-1">
                          {fee.basis === '% of approved loan' ? 'Rate (%)' : 'Amount (₱)'}
                        </label>
                        {fee.basis === '% of approved loan' ? (
                          <div className="space-y-1.5">
                            {/* 3, 5, 7, Blank button selector for Rate (%) */}
                            <div className="flex flex-wrap items-center gap-1">
                              {[3, 5, 7].map((rate) => (
                                <button
                                  key={rate}
                                  type="button"
                                  onClick={() => handleUpdateFeeLine(fee.id, { value: rate })}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors border ${
                                    fee.value === rate
                                      ? 'th-btn-primary border-transparent font-black'
                                      : 'th-btn-secondary'
                                  }`}
                                >
                                  {rate}%
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => handleUpdateFeeLine(fee.id, { value: 0 })}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors border ${
                                  fee.value === 0 || ![3, 5, 7].includes(fee.value)
                                    ? 'th-badge'
                                    : 'th-btn-secondary'
                                }`}
                              >
                                Blank
                              </button>
                            </div>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={fee.value === 0 ? '' : fee.value}
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                handleUpdateFeeLine(fee.id, { value: isNaN(val) ? 0 : val });
                              }}
                              placeholder="Rate %"
                              className="w-full th-input border rounded-lg px-2.5 py-1 text-xs th-accent-2 font-mono font-bold"
                            />
                          </div>
                        ) : (
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={fee.value}
                            onChange={(e) =>
                              handleUpdateFeeLine(fee.id, { value: Number(e.target.value) || 0 })
                            }
                            className="w-full th-input border rounded-lg px-2.5 py-1.5 text-xs th-accent-2 font-mono font-bold"
                          />
                        )}
                      </div>

                      <div className="sm:col-span-1">
                        <label className="text-[10px] uppercase font-semibold th-accent block mb-1">
                          Treatment
                        </label>
                        <select
                          value={fee.treatment}
                          onChange={(e) =>
                            handleUpdateFeeLine(fee.id, { treatment: e.target.value as FeeTreatment })
                          }
                          className="w-full th-input border rounded-lg px-2.5 py-1.5 text-xs"
                        >
                          {LOAN_SETTINGS.fee_treatment.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Real-Time Results & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Calculation Summary Card */}
          <div className="th-card-strong border-2 rounded-2xl p-6 shadow-md space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b th-border-subtle pb-4">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest th-btn-primary px-2.5 py-0.5 rounded-full">
                  Quotational Summary
                </span>
                <h3 className="text-xl font-black th-heading mt-1.5">
                  {isCustomSrpMode ? 'Custom Motorcycle Unit' : currentModelObj?.model}
                </h3>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-xs th-accent block font-medium">Unit SRP</span>
                <span className="text-lg font-black th-heading font-mono">{formatPHP(result.srp)}</span>
                <button
                  type="button"
                  onClick={handleCopyToNotepad}
                  className="mt-1 flex items-center gap-1.5 th-btn-secondary font-bold text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer shadow-sm"
                  title="Copy calculation summary to Notepad"
                >
                  {isCopiedNotepad ? (
                    <>
                      <Check className="w-3.5 h-3.5 th-accent" />
                      <span className="th-accent">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 th-accent" />
                      <span>Copy to Notepad</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleSendToViber()}
                  className="mt-1 flex items-center gap-1.5 bg-[#7360F2] hover:bg-[#6250e0] text-white font-bold text-[11px] px-2.5 py-1 rounded-lg border border-[#8b7cf6] transition-all cursor-pointer shadow-sm"
                  title="Send quotation summary to Viber"
                >
                  <ViberIcon className="w-3.5 h-3.5" />
                  <span>Send to Viber</span>
                </button>
              </div>
            </div>

            {/* Primary Hero Figures */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="th-hero border rounded-xl p-4 shadow-sm relative overflow-hidden">
                <span className="text-[11px] font-bold th-accent uppercase tracking-wider block">
                  Monthly Amortization
                </span>
                <div className="text-2xl sm:text-3xl font-black th-gradient-text font-mono mt-1">
                  {formatPHP(result.monthlyAmortization)}
                </div>
                <div className="text-[11px] th-text-muted mt-1 font-medium">
                  for {result.termMonths} mos @ {result.monthlyRatePercent}%/mo
                </div>
              </div>

              <div className="th-subpanel-accent border rounded-xl p-4 shadow-sm">
                <span className="text-[11px] font-bold th-accent-2 uppercase tracking-wider block">
                  Total Cash Out
                </span>
                <div className="text-2xl sm:text-3xl font-black th-heading font-mono mt-1">
                  {formatPHP(result.totalCashOut)}
                </div>
                <div className="text-[11px] th-text-muted mt-1 font-medium">
                  Down Payment + LTO (₱5,500) + Fees
                </div>
              </div>
            </div>

            {/* Itemized Calculation Breakdown */}
            <div className="space-y-2.5 text-xs th-text-secondary border-t th-border-subtle pt-4 font-mono">
              <div className="flex justify-between py-1">
                <span className="th-text-muted font-sans">Down Payment ({result.downPaymentPercent}%):</span>
                <span className="font-bold th-heading">{formatPHP(result.downPaymentAmount)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="th-text-muted font-sans">Principal Balance (SRP - DP):</span>
                <span className="font-bold th-text">{formatPHP(result.principal)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="th-text-muted font-sans">Fees Added to Loan:</span>
                <span className="font-bold th-text">{formatPHP(result.addedToLoanFeesTotal)}</span>
              </div>
              <div className="flex justify-between py-1 border-t th-border-subtle pt-1.5 font-bold">
                <span className="th-accent font-sans">Total Financed Amount:</span>
                <span className="th-accent">{formatPHP(result.financedAmount)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="th-text-muted font-sans">Add-On Interest ({result.termMonths} mos):</span>
                <span className="font-bold th-text">{formatPHP(result.addOnInterest)}</span>
              </div>
              {result.ltoCash > 0 && (
                <div className="flex justify-between py-1">
                  <span className="th-accent-2 font-sans font-semibold">LTO Registration (Fixed Cash Out):</span>
                  <span className="font-bold th-accent-2">{formatPHP(result.ltoCash)}</span>
                </div>
              )}
              {result.cashOutrightFeesTotal > 0 && (
                <div className="flex justify-between py-1">
                  <span className="th-text-muted font-sans">Other Outright Fees:</span>
                  <span className="font-bold th-text">{formatPHP(result.cashOutrightFeesTotal)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t th-border text-sm font-bold">
                <span className="th-heading font-sans">Total Motorcycle Cost:</span>
                <span className="th-heading">{formatPHP(result.totalCostOfMotorcycle)}</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="space-y-3 pt-2">
              {/* 📋 Copy to Notepad Button */}
              <button
                type="button"
                onClick={handleCopyToNotepad}
                className="w-full flex items-center justify-center gap-2.5 th-btn-primary font-black text-sm py-3.5 px-4 rounded-xl shadow-md cursor-pointer transition-all group"
              >
                {isCopiedNotepad ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span className="font-black">Copied to Clipboard! (Open Notepad)</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Copy to Notepad</span>
                  </>
                )}
              </button>

              {/* 💬 Send to Viber Button */}
              <button
                type="button"
                onClick={() => handleSendToViber()}
                className="w-full flex items-center justify-center gap-2.5 bg-[#7360F2] hover:bg-[#624ee8] text-white font-black text-sm py-3.5 px-4 rounded-xl shadow-md shadow-[#7360F2]/25 cursor-pointer transition-all group border border-[#8b7cf6]"
                title="Share quotation summary directly via Viber"
              >
                <ViberIcon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                <span>{isViberSent ? 'Opening Viber... (Copied to Clipboard!)' : 'Send to Viber'}</span>
              </button>

              <button
                type="button"
                onClick={onApplyForLoan}
                className="w-full flex items-center justify-center gap-2 th-badge font-bold text-sm py-3 px-4 rounded-xl border cursor-pointer transition-colors hover:opacity-90"
              >
                <span>Apply for this Loan Now</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Term Comparison Table */}
          <div className="th-card border rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider th-accent flex items-center gap-1.5">
                <Calendar className="w-4 h-4 th-accent-2" />
                <span>Term Comparison ({downPaymentPercent}% DP)</span>
              </h4>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyToNotepad}
                  className="text-[11px] th-btn-secondary font-bold flex items-center gap-1 cursor-pointer px-2 py-0.5 rounded border transition-colors"
                  title="Copy complete summary including term comparisons to Notepad"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy to Notepad</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendToViber()}
                  className="text-[11px] bg-[#7360F2] hover:bg-[#6250e0] text-white font-bold flex items-center gap-1 cursor-pointer px-2 py-0.5 rounded border border-[#7360F2] transition-colors"
                  title="Send quotation summary to Viber"
                >
                  <ViberIcon className="w-3 h-3" />
                  <span>Viber</span>
                </button>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              {termComparisons.map((item) => (
                <div
                  key={item.term}
                  onClick={() => onUpdateTermMonths(item.term)}
                  className={`py-2 px-2.5 rounded-lg flex items-center justify-between cursor-pointer border ${
                    termMonths === item.term
                      ? 'th-hero th-border-strong font-bold'
                      : 'border-transparent hover:opacity-90 th-subpanel'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono th-heading">{item.term} Mos</span>
                    {termMonths === item.term && (
                      <span className="text-[9px] th-btn-primary font-extrabold px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold th-heading">{formatPHP(item.monthly)}</span>
                    <span className="text-[10px] th-text-muted block font-sans">
                      Int: {formatPHP(item.totalInterest)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* NOTEPAD SUMMARY MODAL */}
      {isNotepadModalOpen && (
        <div className="fixed inset-0 z-50 th-overlay backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="th-card-strong border-2 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Notepad Window Header */}
            <div className="th-hero border-b th-border px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg th-btn-primary flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black th-heading font-mono">
                      Notepad - Loan_Summary.txt
                    </span>
                    <span className="text-[10px] th-badge-alt border font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Copied to Clipboard!</span>
                    </span>
                  </div>
                  <span className="text-[11px] th-text-muted block">
                    Plain-text quotation ready to paste into Windows Notepad, Word, SMS, Viber, or Messenger
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNotepadModalOpen(false)}
                className="th-text-muted hover:opacity-80 p-1.5 rounded-lg th-subpanel transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="th-subpanel border-b th-border px-4 py-2 flex items-center justify-between text-xs th-accent">
              <span className="font-semibold flex items-center gap-1.5">
                <span>📋</span>
                <span>The full quotation summary was copied to your clipboard!</span>
              </span>
              <span className="text-[10px] th-accent-2 font-mono font-bold hidden sm:inline">
                UTF-8 Plain Text
              </span>
            </div>

            {/* Agent Details in Notepad */}
            <div className="th-subpanel border-b th-border p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider th-accent block mb-1.5 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 th-accent-2" />
                  <span>Agent Name (In Notepad)</span>
                </label>
                <select
                  value={agentName === '' ? 'Blank' : agentName}
                  onChange={(e) => {
                    const sel = e.target.value;
                    const newName = sel === 'Blank' ? '' : sel;
                    let newContact = agentContact;
                    if (sel === 'Onad') {
                      newContact = '9914414670';
                    } else if (sel === 'Morris') {
                      newContact = '9761951262';
                    } else if (sel === 'Gerald') {
                      newContact = '9263739110';
                    } else if (sel === 'Blank') {
                      newContact = '';
                    }

                    setAgentName(newName);
                    setAgentContact(newContact);
                    try {
                      const prev = JSON.parse(localStorage.getItem(STORAGE_KEYS.agent_key) || '{}');
                      localStorage.setItem(
                        STORAGE_KEYS.agent_key,
                        JSON.stringify({ ...prev, name: newName, contact: newContact })
                      );
                    } catch {}
                    setNotepadCustomText(generateNotepadSummary(newName, newContact));
                  }}
                  className="w-full th-input border rounded-xl px-3 py-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  <option value="Onad">Onad</option>
                  <option value="Morris">Morris</option>
                  <option value="Gerald">Gerald</option>
                  <option value="Blank">Blank</option>
                  {agentName && !['Onad', 'Morris', 'Gerald', '', 'Blank'].includes(agentName) && (
                    <option value={agentName}>{agentName} (Custom)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider th-accent block mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 th-accent-2" />
                  <span>Agent Contact Number</span>
                </label>
                <select
                  value={agentContact === '' ? 'Blank' : agentContact}
                  onChange={(e) => {
                    const sel = e.target.value;
                    const newContact = sel === 'Blank' ? '' : sel;
                    setAgentContact(newContact);
                    try {
                      const prev = JSON.parse(localStorage.getItem(STORAGE_KEYS.agent_key) || '{}');
                      localStorage.setItem(
                        STORAGE_KEYS.agent_key,
                        JSON.stringify({ ...prev, name: agentName, contact: newContact })
                      );
                    } catch {}
                    setNotepadCustomText(generateNotepadSummary(agentName, newContact));
                  }}
                  className="w-full th-input border rounded-xl px-3 py-2 text-xs sm:text-sm font-mono font-bold transition-colors cursor-pointer"
                >
                  <option value="9914414670">9914414670</option>
                  <option value="9761951262">9761951262</option>
                  <option value="9263739110">9263739110</option>
                  <option value="Blank">Blank</option>
                  {agentContact && !['9914414670', '9761951262', '9263739110', '', 'Blank'].includes(agentContact) && (
                    <option value={agentContact}>{agentContact} (Custom)</option>
                  )}
                </select>
              </div>
            </div>

            {/* Notepad Editor Area */}
            <div className="p-4 flex-1 overflow-y-auto space-y-2 th-card">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider th-accent">
                  Notepad Text Content (Editable &amp; Selectable):
                </label>
                <span className="text-[10px] th-text-muted font-mono">
                  {notepadCustomText.length} characters
                </span>
              </div>
              <textarea
                value={notepadCustomText}
                onChange={(e) => setNotepadCustomText(e.target.value)}
                rows={14}
                className="w-full th-notepad-box border rounded-xl p-3.5 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none resize-y"
                placeholder="Loan quotation summary text..."
              />
            </div>

            {/* Modal Actions Footer */}
            <div className="th-card border-t th-border p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNotepadCustomText(generateNotepadSummary())}
                  className="text-xs th-accent hover:underline font-semibold cursor-pointer px-2 py-1"
                >
                  ↺ Reset Original
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="flex items-center gap-1.5 th-btn-secondary text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl border transition-colors cursor-pointer"
                  title="Download as Notepad .txt file"
                >
                  <Download className="w-4 h-4 th-accent" />
                  <span>Download .txt</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendToViber(notepadCustomText)}
                  className="flex items-center gap-1.5 bg-[#7360F2] hover:bg-[#624ee8] text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl shadow-md transition-all cursor-pointer"
                  title="Send to Viber"
                >
                  <ViberIcon className="w-4 h-4" />
                  <span>{isViberSent ? 'Opening Viber...' : 'Send to Viber'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyFromModal}
                  className="flex items-center gap-1.5 th-btn-primary text-xs sm:text-sm font-black px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isModalCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsNotepadModalOpen(false)}
                  className="th-btn-secondary border text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MOTORCYCLE BRAND / LINEUP & MODEL MANAGER MODAL */}
      <MotorcycleEntryModal
        isOpen={isEntryModalOpen}
        initialTab={entryModalTab}
        onClose={() => setIsEntryModalOpen(false)}
        existingSeries={seriesKeys}
        allVisibleBikes={allVisibleBikes}
        customMotorcycles={customMotorcycles}
        deletedModels={deletedModels}
        onAddMotorcycles={(bikes) => onAddMotorcycles?.(bikes)}
        onDeleteMotorcycles={(models) => {
          onDeleteMotorcycles?.(models);
          const targetSet = new Set(models.map((m) => m.toLowerCase()));
          if (currentModelObj && targetSet.has(currentModelObj.model.toLowerCase())) {
            const remaining = allVisibleBikes.filter(
              (b) => !targetSet.has(b.model.toLowerCase())
            );
            if (remaining.length > 0) {
              onSelectSeries(remaining[0].series);
              onSelectModel(remaining[0].model);
            }
          }
        }}
        onRestoreDefaults={() => onRestoreDefaultMotorcycles?.()}
        onSelectAddedBike={(series, model, srp) => {
          setIsEditingBike(false);
          setIsCustomSrpMode(false);
          onSelectSeries(series);
          onSelectModel(model);
          onUpdateCustomSrp(srp);
        }}
      />
    </div>
  );
};
