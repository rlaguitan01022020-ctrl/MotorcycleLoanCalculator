import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  BookOpen,
  CheckCircle2,
  FileCheck,
  Building2,
  Briefcase,
  Bike,
  ShieldCheck,
  Printer,
  Sparkles,
  HelpCircle,
  Home,
  CreditCard,
  Upload,
  Image,
  Trash2,
  Mail,
  ExternalLink,
  Copy,
  Check,
  Camera,
  Eye,
  X,
  Calculator,
  ArrowRight,
  Download,
  AlertCircle,
  Clock,
  Layers,
  FileText,
} from 'lucide-react';
import {
  LOAN_REQUIREMENTS_DATA,
  STORAGE_KEYS,
  CFMOTO_SERIES_MAP,
  ALL_MOTORCYCLES,
  LOAN_SETTINGS,
} from '../data/motostradaData';
import { CompanySettings, UploadedRequirementFile } from '../types';
import { calculateLoan, formatPHP } from '../utils/calculator';

interface LoanRequirementsProps {
  onAskAI?: (query: string) => void;
  companySettings: CompanySettings;
  onNavigateToCalculator?: () => void;
  onNavigateToApplication?: () => void;
}

export interface RequirementSlot {
  key: string;
  category: 'identity' | 'residency' | 'income';
  incomeType?: 'employed' | 'business_owners' | 'tnvs_delivery_drivers';
  title: string;
  description: string;
  examples: string[];
  mandatory: boolean;
}

export const REQUIREMENT_SLOTS: RequirementSlot[] = [
  // 1. Identity & Government IDs
  {
    key: 'id_primary_front',
    category: 'identity',
    title: 'Primary Government ID (Front)',
    description: 'Front view of your primary valid government-issued photo ID',
    examples: ["Driver's License", 'UMID', 'Philippine Passport', 'National ID (PhilSys)'],
    mandatory: true,
  },
  {
    key: 'id_primary_back',
    category: 'identity',
    title: 'Primary Government ID (Back)',
    description: 'Back view of your primary valid government ID showing signature & barcode',
    examples: ['Signature panel', 'Card barcode', 'Card security marks'],
    mandatory: true,
  },
  {
    key: 'id_secondary',
    category: 'identity',
    title: 'Secondary ID or Company ID',
    description: 'Second government ID, company ID with photo, or TIN / Postal card',
    examples: ['Company ID with signature', 'Postal ID', 'Voter’s ID', 'PRC ID', 'SSS ID'],
    mandatory: true,
  },
  {
    key: 'id_civil',
    category: 'identity',
    title: 'PSA Birth or Marriage Certificate',
    description: 'PSA or NSO authenticated copy (required if married or for co-borrower)',
    examples: ['PSA Birth Certificate', 'PSA Marriage Certificate'],
    mandatory: false,
  },

  // 2. Proof of Residency
  {
    key: 'res_electric',
    category: 'residency',
    title: 'Electricity Utility Bill (Latest 2 Mos)',
    description: 'Original electricity billing under borrower address',
    examples: ['Meralco Bill', 'Provincial Electric Coop Bill (e.g. BENECO, PELCO)'],
    mandatory: true,
  },
  {
    key: 'res_water_telco',
    category: 'residency',
    title: 'Water or Broadband / Cable Bill',
    description: 'Latest utility statement supporting your permanent residence',
    examples: ['Maynilad', 'Manila Water', 'PLDT Home', 'Converge', 'Globe Fiber'],
    mandatory: false,
  },
  {
    key: 'res_brgy',
    category: 'residency',
    title: 'Barangay Certificate of Residency',
    description: 'Certificate of Residency or Barangay Clearance with official seal',
    examples: ['Barangay Clearance for Loan Purposes', 'Barangay Residency Certification'],
    mandatory: false,
  },

  // 3. Proof of Income - Employed
  {
    key: 'inc_emp_coe',
    category: 'income',
    incomeType: 'employed',
    title: 'Certificate of Employment (COE)',
    description: 'Official COE stating job position, date hired, and monthly compensation',
    examples: ['COE on official company letterhead signed by HR', 'Compensation Breakdown'],
    mandatory: true,
  },
  {
    key: 'inc_emp_payslips',
    category: 'income',
    incomeType: 'employed',
    title: 'Latest 3 Months Payslips',
    description: 'Complete monthly payslips showing gross salary and deductions',
    examples: ['3 consecutive months payslips', 'Digital payroll system printouts'],
    mandatory: true,
  },
  {
    key: 'inc_emp_bank',
    category: 'income',
    incomeType: 'employed',
    title: 'Bank Statement / Payroll ATM Printout',
    description: 'Bank statements or payroll transaction records for the last 3 months',
    examples: ['Bank statement with bank seal', 'Online banking statement (PDF/Image)'],
    mandatory: false,
  },
  {
    key: 'inc_emp_itr',
    category: 'income',
    incomeType: 'employed',
    title: 'Latest ITR / BIR Form 2316',
    description: 'Certificate of Compensation Payment / Tax Withheld',
    examples: ['BIR Form 2316 with employer and employee signatures'],
    mandatory: false,
  },

  // 3. Proof of Income - Business Owners
  {
    key: 'inc_biz_dti',
    category: 'income',
    incomeType: 'business_owners',
    title: 'DTI Registration Certificate / SEC',
    description: 'Valid Department of Trade and Industry certificate or SEC Articles',
    examples: ['DTI Certificate of Business Name Registration', 'SEC Registration'],
    mandatory: true,
  },
  {
    key: 'inc_biz_permit',
    category: 'income',
    incomeType: 'business_owners',
    title: "Mayor's / Business Permit (Current Year)",
    description: 'Current business permit issued by local city or municipal hall',
    examples: ["Current Year Mayor's Permit", 'Official Receipt of Permit Renewal'],
    mandatory: true,
  },
  {
    key: 'inc_biz_bank',
    category: 'income',
    incomeType: 'business_owners',
    title: 'Latest 3 to 6 Months Bank Statements',
    description: 'Commercial bank account statements under business or owner name',
    examples: ['Current account / savings account passbook or statements'],
    mandatory: true,
  },
  {
    key: 'inc_biz_itr',
    category: 'income',
    incomeType: 'business_owners',
    title: 'BIR Form 1701 / Audited Financials',
    description: 'Annual Income Tax Return and financial statements',
    examples: ['BIR Form 1701 stamped received by BIR / Authorized Bank'],
    mandatory: false,
  },

  // 3. Proof of Income - TNVS / Delivery Drivers
  {
    key: 'inc_tnvs_license',
    category: 'income',
    incomeType: 'tnvs_delivery_drivers',
    title: "Professional Driver's License",
    description: 'Valid Professional Driver’s License with Restriction 1 / A / A1',
    examples: ['LTO Driver’s License (Professional) with Official Receipt (OR)'],
    mandatory: true,
  },
  {
    key: 'inc_tnvs_profile',
    category: 'income',
    incomeType: 'tnvs_delivery_drivers',
    title: 'Driver App Profile Screenshot',
    description: 'Clear screenshot of active driver account profile in Angkas, JoyRide, MoveIt, Grab, or Lalamove',
    examples: ['Angkas Biker Profile', 'JoyRide Driver Profile', 'Grab Driver App screen'],
    mandatory: true,
  },
  {
    key: 'inc_tnvs_earnings',
    category: 'income',
    incomeType: 'tnvs_delivery_drivers',
    title: 'In-App Weekly / Monthly Earnings History',
    description: 'Screenshot of wallet earnings history over the past 4 to 8 weeks',
    examples: ['In-app weekly pay summary', 'Cash-out bank transfers history'],
    mandatory: true,
  },
  {
    key: 'inc_tnvs_clearance',
    category: 'income',
    incomeType: 'tnvs_delivery_drivers',
    title: 'Police Clearance or NBI Clearance',
    description: 'Valid national clearance document',
    examples: ['National Police Clearance System (NPCS)', 'NBI Clearance'],
    mandatory: false,
  },
];

export const LoanRequirements: React.FC<LoanRequirementsProps> = ({
  onAskAI,
  companySettings,
  onNavigateToCalculator,
  onNavigateToApplication,
}) => {
  // Main view tab: guidelines, upload_each (dedicated per-requirement upload!), email_options, calculator
  const [activeMainTab, setActiveMainTab] = useState<'guidelines' | 'upload_each' | 'email_options' | 'calculator'>('upload_each');

  // Income category tab within guidelines & upload
  const [activeIncomeTab, setActiveIncomeTab] = useState<'employed' | 'business_owners' | 'tnvs_delivery_drivers'>('employed');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Image Uploads state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedRequirementFile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.uploads_key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeSlotFilter, setActiveSlotFilter] = useState<'all' | 'identity' | 'residency' | 'income'>('all');
  const [applicantNameForEmail, setApplicantNameForEmail] = useState<string>('Juan Dela Cruz');
  const [applicantContactForEmail, setApplicantContactForEmail] = useState<string>('0917-xxx-xxxx');
  const [emailCopied, setEmailCopied] = useState<boolean>(false);
  const [previewModalImage, setPreviewModalImage] = useState<UploadedRequirementFile | null>(null);

  // Hidden file inputs mapped by slot key
  const slotInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Quick Calculator state inside Requirements Tab
  const [calcSelectedSeries, setCalcSelectedSeries] = useState<string>('CL Series');
  const [calcSelectedModel, setCalcSelectedModel] = useState<string>('450CL-C Bobber');
  const [calcSrp, setCalcSrp] = useState<number>(338900);
  const [calcDpPercent, setCalcDpPercent] = useState<number>(20);
  const [calcTermMonths, setCalcTermMonths] = useState<number>(36);

  // Save uploads to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.uploads_key, JSON.stringify(uploadedFiles));
    } catch (e) {
      console.warn('Failed to save uploads to storage:', e);
    }
  }, [uploadedFiles]);

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const { documentary_requirements, applies_to } = LOAN_REQUIREMENTS_DATA;

  // Filter slots applicable to current active income tab
  const relevantSlots = useMemo(() => {
    return REQUIREMENT_SLOTS.filter((slot) => {
      if (slot.category !== 'income') return true;
      return slot.incomeType === activeIncomeTab;
    });
  }, [activeIncomeTab]);

  const filteredSlots = useMemo(() => {
    if (activeSlotFilter === 'all') return relevantSlots;
    return relevantSlots.filter((s) => s.category === activeSlotFilter);
  }, [relevantSlots, activeSlotFilter]);

  // Upload handler for a specific requirement slot
  const handleSlotUpload = (slot: RequirementSlot, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      // Remove existing upload for this slot if any
      const filtered = uploadedFiles.filter((f) => f.requirementKey !== slot.key);

      const newUpload: UploadedRequirementFile = {
        id: 'up_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: file.name,
        category: slot.title,
        requirementKey: slot.key,
        dataUrl,
        size: file.size,
        uploadedAt: new Date().toLocaleDateString('en-PH', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setUploadedFiles([...filtered, newUpload]);

      // Automatically check off corresponding guideline if available
      setCheckedItems((prev) => ({ ...prev, [slot.key]: true }));
    };
    reader.readAsDataURL(file);

    // Reset input
    if (slotInputRefs.current[slot.key]) {
      slotInputRefs.current[slot.key]!.value = '';
    }
  };

  const handleDeleteUpload = (slotKey: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.requirementKey !== slotKey && f.id !== slotKey));
    setCheckedItems((prev) => ({ ...prev, [slotKey]: false }));
  };

  // Calculate readiness score based on uploaded slots
  const mandatorySlots = relevantSlots.filter((s) => s.mandatory);
  const uploadedMandatoryCount = mandatorySlots.filter((s) =>
    uploadedFiles.some((f) => f.requirementKey === s.key)
  ).length;

  const totalMandatory = mandatorySlots.length;
  const uploadReadinessPercent = totalMandatory > 0 ? Math.round((uploadedMandatoryCount / totalMandatory) * 100) : 0;

  // Embedded calculator computation
  const embeddedCalcResult = useMemo(() => {
    return calculateLoan({
      srp: calcSrp,
      downPaymentPercent: calcDpPercent,
      termMonths: calcTermMonths,
      monthlyRatePercent: 1.99,
      feeLines: [],
      ltoCash: LOAN_SETTINGS.lto_registration_cash,
    });
  }, [calcSrp, calcDpPercent, calcTermMonths]);

  const [isCopiedEmbeddedNotepad, setIsCopiedEmbeddedNotepad] = useState(false);

  const handleCopyEmbeddedCalcToNotepad = async () => {
    let text = `MOTORCYCLE LOAN QUOTATION SUMMARY\n`;
    text += `Date: ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;

    text += `Model Name: ${calcSelectedModel}\n`;
    text += `SRP: ${formatPHP(calcSrp)}\n\n`;

    text += `DOWN PAYMENT & TERMS\n`;
    text += `• Down Payment: ${calcDpPercent}% (${formatPHP(embeddedCalcResult.downPaymentAmount)})\n`;
    text += `• Repayment Term: ${calcTermMonths} Months\n`;
    text += `• Monthly Rate: 1.99% / month\n`;
    text += `• LTO Registration (Cash Out): ${formatPHP(embeddedCalcResult.ltoCash)}\n\n`;

    text += `★ MONTHLY AMORTIZATION: ${formatPHP(embeddedCalcResult.monthlyAmortization)} / month\n`;
    text += `★ TOTAL CASH OUT: ${formatPHP(embeddedCalcResult.totalCashOut)}\n\n`;

    text += `TERM COMPARISON\n`;
    [12, 18, 24, 36].forEach((term) => {
      const c = calculateLoan({
        srp: calcSrp,
        downPaymentPercent: calcDpPercent,
        termMonths: term,
        monthlyRatePercent: 1.99,
        feeLines: [],
        ltoCash: LOAN_SETTINGS.lto_registration_cash,
      });
      text += `• ${term} Months : ${formatPHP(c.monthlyAmortization)} / mo\n`;
    });
    text += `\n`;

    text += `Freebies Included:\n`;
    text += `✓ 1st PMS Labor (500-1500KM/1mo)  ✓ Official T-Shirt\n`;
    text += `141 8th Street, corner 11th Avenue, Grace Park East, Caloocan City\n`;

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
      setIsCopiedEmbeddedNotepad(true);
      setTimeout(() => setIsCopiedEmbeddedNotepad(false), 2500);
    } catch (err) {
      console.warn(err);
    }
  };

  // Email formatting functions
  const generateEmailBody = () => {
    const attachedSlotNames = uploadedFiles
      .map((f, i) => `${i + 1}. [${f.category}] - ${f.name}`)
      .join('\n');

    return `Dear ${companySettings.companyName} Loan Underwriting Team,

Good day! I am submitting my documentary requirements for my motorcycle loan application.

APPLICANT DETAILS:
- Full Name: ${applicantNameForEmail}
- Contact Number: ${applicantContactForEmail}
- Employment / Income Profile: ${
      activeIncomeTab === 'employed'
        ? 'Regular Employee'
        : activeIncomeTab === 'business_owners'
        ? 'Business Owner'
        : 'TNVS / Delivery Driver'
    }
- Target Dealership: ${companySettings.companyName} (${companySettings.address})

ATTACHED DOCUMENTARY IMAGES (${uploadedFiles.length} files attached):
${attachedSlotNames || '(Please see attached ID and income document photos)'}

Kindly review my loan eligibility and advise me on the next credit investigation steps.

Thank you very much.

Best regards,
${applicantNameForEmail}
${applicantContactForEmail}`;
  };

  const openGmailCompose = () => {
    const subject = encodeURIComponent(
      `Motorcycle Loan Requirements Submission - ${applicantNameForEmail}`
    );
    const body = encodeURIComponent(generateEmailBody());
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      companySettings.email
    )}&su=${subject}&body=${body}`;
    window.open(url, '_blank');
  };

  const openOutlookCompose = () => {
    const subject = encodeURIComponent(
      `Motorcycle Loan Requirements Submission - ${applicantNameForEmail}`
    );
    const body = encodeURIComponent(generateEmailBody());
    const url = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(
      companySettings.email
    )}&subject=${subject}&body=${body}`;
    window.open(url, '_blank');
  };

  const openDefaultMail = () => {
    const subject = encodeURIComponent(
      `Motorcycle Loan Requirements Submission - ${applicantNameForEmail}`
    );
    const body = encodeURIComponent(generateEmailBody());
    window.location.href = `mailto:${companySettings.email}?subject=${subject}&body=${body}`;
  };

  const handleCopyEmailText = () => {
    navigator?.clipboard?.writeText(generateEmailBody())?.catch?.(() => {});
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-8 font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <BookOpen className="w-80 h-80 text-amber-500" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Credit Underwriting Guide & Document Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Motorcycle Loan Documentary Requirements
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Upload images for each specific requirement, review underwriting guidelines, calculate your loan amortization, or email documents directly to our credit committee via Gmail and Outlook.
          </p>

          {/* Progress Tracker */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-400">
                Mandatory Documents Attached:
              </span>
              <span className="font-mono font-bold text-amber-400">
                {uploadedMandatoryCount} of {totalMandatory} Mandatory Attached ({uploadReadinessPercent}%) • {uploadedFiles.length} Total Files
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadReadinessPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Mode Tabs: Guidelines vs Upload Each Requirement vs Mail vs Calculator */}
      <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-lg overflow-x-auto">
        <button
          onClick={() => setActiveMainTab('upload_each')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeMainTab === 'upload_each'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload Image for Each Requirement</span>
          {uploadedFiles.length > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeMainTab === 'upload_each'
                  ? 'bg-slate-950 text-amber-400'
                  : 'bg-amber-500 text-slate-950'
              }`}
            >
              {uploadedFiles.length} Attached
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveMainTab('guidelines')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeMainTab === 'guidelines'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Documentary Guidelines</span>
        </button>

        <button
          onClick={() => setActiveMainTab('email_options')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeMainTab === 'email_options'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Mail via Gmail / Outlook</span>
        </button>

        <button
          onClick={() => setActiveMainTab('calculator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeMainTab === 'calculator'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Loan Calculator</span>
        </button>
      </div>

      {/* VIEW 1: UPLOAD IMAGE FOR EACH REQUIREMENT (DEDICATED PER-REQUIREMENT SLOTS) */}
      {activeMainTab === 'upload_each' && (
        <div className="space-y-6">
          {/* Header Controls with Category Filters & Income Type Switcher */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-amber-400" />
                  <span>Document Image Slots (Upload Per Requirement)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Upload a clear photo or scan for each requirement below. Each item has its own dedicated upload slot and status badge.
                </p>
              </div>

              {/* Income Profile Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
                <span className="text-[11px] font-bold text-slate-400 px-2">Income Profile:</span>
                <button
                  type="button"
                  onClick={() => setActiveIncomeTab('employed')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeIncomeTab === 'employed'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Briefcase className="w-3 h-3" />
                  <span>Employed</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIncomeTab('business_owners')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeIncomeTab === 'business_owners'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3 h-3" />
                  <span>Business</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIncomeTab('tnvs_delivery_drivers')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeIncomeTab === 'tnvs_delivery_drivers'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Bike className="w-3 h-3" />
                  <span>TNVS / Riders</span>
                </button>
              </div>
            </div>

            {/* Filter Pills for Slot Types */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold">Filter Slots:</span>
                {(['all', 'identity', 'residency', 'income'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveSlotFilter(filter)}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer capitalize ${
                      activeSlotFilter === filter
                        ? 'bg-slate-800 text-amber-400 border border-amber-500/40'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {filter === 'all' ? 'All Requirements' : filter}
                  </button>
                ))}
              </div>

              {uploadedFiles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setUploadedFiles([])}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Uploads</span>
                </button>
              )}
            </div>

            {/* Grid of Dedicated Requirement Slots */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
              {filteredSlots.map((slot) => {
                const uploadedFile = uploadedFiles.find(
                  (f) => f.requirementKey === slot.key || f.category === slot.title
                );
                const isUploaded = !!uploadedFile;

                return (
                  <div
                    key={slot.key}
                    className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition-all ${
                      isUploaded
                        ? 'bg-slate-850 border-emerald-500/40 shadow-lg'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Header info */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {slot.category === 'identity' && (
                            <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
                          )}
                          {slot.category === 'residency' && (
                            <Home className="w-4 h-4 text-sky-400 shrink-0" />
                          )}
                          {slot.category === 'income' && (
                            <Briefcase className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          <span className="font-bold text-white text-sm line-clamp-1">
                            {slot.title}
                          </span>
                        </div>

                        {slot.mandatory ? (
                          <span className="text-[10px] uppercase font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded shrink-0">
                            Required
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded shrink-0">
                            Optional
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {slot.description}
                      </p>

                      <div className="text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-400">Accepted: </span>
                        {slot.examples.join(', ')}
                      </div>
                    </div>

                    {/* Slot Upload State or Thumbnail Preview */}
                    <div>
                      {/* Hidden File Input for this specific slot */}
                      <input
                        type="file"
                        accept="image/*"
                        ref={(el) => {
                          slotInputRefs.current[slot.key] = el;
                        }}
                        onChange={(e) => handleSlotUpload(slot, e)}
                        className="hidden"
                      />

                      {isUploaded ? (
                        <div className="space-y-3">
                          {/* Image Thumbnail Box */}
                          <div
                            onClick={() => setPreviewModalImage(uploadedFile)}
                            className="relative h-36 rounded-xl overflow-hidden bg-slate-950 border border-slate-750 cursor-pointer group"
                          >
                            <img
                              src={uploadedFile.dataUrl}
                              alt={uploadedFile.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1.5">
                              <Eye className="w-4 h-4" />
                              <span>Click to Enlarge</span>
                            </div>
                            <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Attached</span>
                            </div>
                          </div>

                          {/* File metadata and action buttons */}
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                            <div className="truncate pr-2">
                              <span className="font-medium text-slate-200 block truncate">
                                {uploadedFile.name}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {(uploadedFile.size / 1024).toFixed(0)} KB • {uploadedFile.uploadedAt}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => slotInputRefs.current[slot.key]?.click()}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors cursor-pointer"
                                title="Replace Image"
                              >
                                <Camera className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUpload(slot.key)}
                                className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                                title="Delete Image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => slotInputRefs.current[slot.key]?.click()}
                          className="border-2 border-dashed border-slate-700/80 hover:border-amber-500/80 bg-slate-950/40 hover:bg-slate-800/40 rounded-xl p-4 text-center cursor-pointer transition-all space-y-2 group"
                        >
                          <div className="w-9 h-9 rounded-full bg-slate-800 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-400 mx-auto flex items-center justify-center transition-colors">
                            <Camera className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-amber-400 group-hover:text-amber-300 block">
                              Upload {slot.title}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Click or tap to take photo / upload file
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Action to email documents */}
            {uploadedFiles.length > 0 && (
              <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-amber-500/15 border border-amber-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs mt-6">
                <div>
                  <strong className="text-white block font-bold text-sm">
                    {uploadedFiles.length} Requirement Images Attached & Ready!
                  </strong>
                  <span className="text-slate-300">
                    Submit your documents directly to the credit underwriting team via Gmail or Outlook.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveMainTab('email_options')}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black px-4 py-2 rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Proceed to Mail Options →</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: DOCUMENTARY GUIDELINES (DETAILED CRITERIA) */}
      {activeMainTab === 'guidelines' && (
        <div className="space-y-8">
          {/* Grid of 2 Pillars: ID and Residency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar 1: Identification */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
              <div className="flex items-center gap-2.5 text-amber-400 font-bold text-base border-b border-slate-800 pb-3">
                <CreditCard className="w-5 h-5" />
                <span>1. Identification Requirements</span>
              </div>

              <p className="text-xs text-slate-400">
                Mandatory identity verification documents required for all applicants and co-borrowers:
              </p>

              <div className="space-y-3">
                {documentary_requirements.identification.map((item, idx) => {
                  const id = `id_${idx}`;
                  const isChecked = !!checkedItems[id];

                  return (
                    <div
                      key={id}
                      onClick={() => toggleCheck(id)}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-slate-100'
                          : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 h-4 w-4 border-slate-700 bg-slate-900 cursor-pointer"
                      />
                      <div className="text-xs font-medium leading-relaxed">{item}</div>
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                <strong>Accepted IDs:</strong> Philippine Passport, Driver’s License, UMID, SSS ID, PRC ID, Postal ID, National ID (PhilSys), Voter’s ID.
              </div>
            </div>

            {/* Pillar 2: Proof of Residency */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
              <div className="flex items-center gap-2.5 text-amber-400 font-bold text-base border-b border-slate-800 pb-3">
                <Home className="w-5 h-5" />
                <span>2. Proof of Residency</span>
              </div>

              <p className="text-xs text-slate-400">
                Verifies your current residential address within dealer service coverage area:
              </p>

              <div className="space-y-3">
                {documentary_requirements.proof_of_residency.map((item, idx) => {
                  const id = `res_${idx}`;
                  const isChecked = !!checkedItems[id];

                  return (
                    <div
                      key={id}
                      onClick={() => toggleCheck(id)}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-slate-100'
                          : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 h-4 w-4 border-slate-700 bg-slate-900 cursor-pointer"
                      />
                      <div className="text-xs font-medium leading-relaxed">{item}</div>
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                <strong>Helpful Tip:</strong> Meralco, Maynilad, Manila Water, PLDT, Converge, or Globe Fiber bills are strongly preferred. Must be issued within the last 2 months.
              </div>
            </div>
          </div>

          {/* Pillar 3: Proof of Income (3 Category Tabs) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                  <Briefcase className="w-5 h-5" />
                  <span>3. Proof of Income by Employment / Earning Type</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select your income profile below to see the exact documentary checklist:
                </p>
              </div>

              {/* Income Category Switcher Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                <button
                  onClick={() => setActiveIncomeTab('employed')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeIncomeTab === 'employed'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Employed</span>
                </button>
                <button
                  onClick={() => setActiveIncomeTab('business_owners')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeIncomeTab === 'business_owners'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Business Owners</span>
                </button>
                <button
                  onClick={() => setActiveIncomeTab('tnvs_delivery_drivers')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeIncomeTab === 'tnvs_delivery_drivers'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>TNVS / Delivery Drivers</span>
                </button>
              </div>
            </div>

            {/* Selected Income Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documentary_requirements.proof_of_income[activeIncomeTab].map((doc, idx) => {
                const id = `inc_${activeIncomeTab}_${idx}`;
                const isChecked = !!checkedItems[id];

                return (
                  <div
                    key={id}
                    onClick={() => toggleCheck(id)}
                    className={`p-4 rounded-xl border flex items-start gap-3 transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-slate-100'
                        : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 h-4 w-4 border-slate-700 bg-slate-900 cursor-pointer"
                    />
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white">{doc}</div>
                      <div className="text-[11px] text-slate-400">
                        {activeIncomeTab === 'tnvs_delivery_drivers'
                          ? 'Angkas, JoyRide, Move It, Grab, or Lalamove accredited'
                          : activeIncomeTab === 'business_owners'
                          ? 'Registered commercial entity or registered micro-business'
                          : 'Private or government regular/probationary employee'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: MAIL OPTION FOR GMAIL OR OUTLOOK */}
      {activeMainTab === 'email_options' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-amber-400" />
              <span>Email Requirements Submission</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Send your loan documents directly to the credit underwriting department via Gmail, Outlook, or your default mail application.
            </p>
          </div>

          {/* Recipient & Applicant Config */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold uppercase mb-1">
                Applicant Name
              </label>
              <input
                type="text"
                value={applicantNameForEmail}
                onChange={(e) => setApplicantNameForEmail(e.target.value)}
                placeholder="Juan Dela Cruz"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold uppercase mb-1">
                Contact Number
              </label>
              <input
                type="text"
                value={applicantContactForEmail}
                onChange={(e) => setApplicantContactForEmail(e.target.value)}
                placeholder="0917-xxx-xxxx"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold uppercase mb-1">
                Recipient Underwriting Email
              </label>
              <input
                type="text"
                disabled
                value={companySettings.email}
                className="w-full bg-slate-800/60 border border-slate-700 text-amber-400 font-mono font-bold rounded-xl px-3 py-2"
              />
            </div>
          </div>

          {/* Direct Email Action Buttons: Gmail, Outlook, Default Mail */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              Choose Email Platform to Send:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Gmail Button */}
              <button
                type="button"
                onClick={openGmailCompose}
                className="bg-red-600/15 hover:bg-red-600/25 border-2 border-red-500/50 hover:border-red-500 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg transition-all cursor-pointer group hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-black text-red-400 group-hover:text-red-300 block">
                    Send via Gmail
                  </span>
                  <span className="text-[10px] text-slate-400">Opens mail.google.com compose</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white mt-1" />
              </button>

              {/* Outlook Button */}
              <button
                type="button"
                onClick={openOutlookCompose}
                className="bg-sky-600/15 hover:bg-sky-600/25 border-2 border-sky-500/50 hover:border-sky-500 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg transition-all cursor-pointer group hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-md">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-black text-sky-400 group-hover:text-sky-300 block">
                    Send via Outlook
                  </span>
                  <span className="text-[10px] text-slate-400">Opens outlook.live.com compose</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white mt-1" />
              </button>

              {/* Default Email App Button */}
              <button
                type="button"
                onClick={openDefaultMail}
                className="bg-amber-600/15 hover:bg-amber-600/25 border-2 border-amber-500/50 hover:border-amber-500 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg transition-all cursor-pointer group hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-black text-amber-400 group-hover:text-amber-300 block">
                    Default Email App
                  </span>
                  <span className="text-[10px] text-slate-400">Apple Mail, Thunderbird, etc.</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white mt-1" />
              </button>
            </div>
          </div>

          {/* Email Preview & Copy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Generated Email Draft Preview:
              </span>
              <button
                type="button"
                onClick={handleCopyEmailText}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
              >
                {emailCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{emailCopied ? 'Copied to Clipboard!' : 'Copy Email Body'}</span>
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed shadow-inner">
              {generateEmailBody()}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
            <strong>Tip when sending email:</strong> Attach your saved document image files to the composer window before hitting send!
          </div>
        </div>
      )}

      {/* VIEW 4: QUICK LOAN CALCULATOR TAB */}
      {activeMainTab === 'calculator' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                <span>Instant Financing & Loan Calculator</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Estimate your monthly amortization and cash out while reviewing your documentary requirements.
              </p>
            </div>

            {onNavigateToCalculator && (
              <button
                type="button"
                onClick={onNavigateToCalculator}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold px-4 py-2 rounded-xl border border-slate-700 cursor-pointer"
              >
                <span>Open Full Loan Calculator</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Controls */}
            <div className="lg:col-span-7 space-y-4">
              {/* Bike Series & Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Motorcycle Series
                  </label>
                  <select
                    value={calcSelectedSeries}
                    onChange={(e) => {
                      const series = e.target.value;
                      setCalcSelectedSeries(series);
                      const firstModel = CFMOTO_SERIES_MAP[series]?.[0];
                      if (firstModel) {
                        setCalcSelectedModel(firstModel.model);
                        setCalcSrp(firstModel.srp);
                      }
                    }}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <optgroup label="CFMOTO Philippines">
                      {Object.keys(CFMOTO_SERIES_MAP)
                        .filter((s) => !s.startsWith('MV Agusta') && !s.startsWith('Peugeot'))
                        .map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="MV Agusta Philippines">
                      {Object.keys(CFMOTO_SERIES_MAP)
                        .filter((s) => s.startsWith('MV Agusta'))
                        .map((s) => (
                          <option key={s} value={s}>
                            {s.replace('MV Agusta - ', '')}
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="Peugeot Motocycles Philippines">
                      {Object.keys(CFMOTO_SERIES_MAP)
                        .filter((s) => s.startsWith('Peugeot'))
                        .map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Motorcycle Model
                  </label>
                  <select
                    value={calcSelectedModel}
                    onChange={(e) => {
                      const modelName = e.target.value;
                      setCalcSelectedModel(modelName);
                      const modelObj = CFMOTO_SERIES_MAP[calcSelectedSeries]?.find(
                        (m) => m.model === modelName
                      );
                      if (modelObj) {
                        setCalcSrp(modelObj.srp);
                      }
                    }}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                  >
                    {CFMOTO_SERIES_MAP[calcSelectedSeries]?.map((m) => (
                      <option key={m.model} value={m.model}>
                        {m.model} ({formatPHP(m.srp)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SRP */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Suggested Retail Price (SRP)
                </label>
                <input
                  type="number"
                  value={calcSrp}
                  onChange={(e) => setCalcSrp(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white font-mono font-bold rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Down Payment Presets */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-400 uppercase">Down Payment %</span>
                  <span className="font-mono font-bold text-amber-400">{calcDpPercent}% ({formatPHP((calcSrp * calcDpPercent) / 100)})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 20, 30, 40, 50].map((dp) => (
                    <button
                      key={dp}
                      type="button"
                      onClick={() => setCalcDpPercent(dp)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        calcDpPercent === dp
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {dp}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Term (Months) including 60 mos */}
              <div className="space-y-1.5">
                <span className="block text-xs font-bold text-slate-400 uppercase">Loan Term (Months)</span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {LOAN_SETTINGS.terms_months.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCalcTermMonths(t)}
                      className={`py-2 rounded-xl text-xs font-bold text-center cursor-pointer transition-colors ${
                        calcTermMonths === t
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {t}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Calculation Results Card */}
            <div className="lg:col-span-5 bg-slate-850 border border-slate-750 rounded-2xl p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400 block">
                  Financing Summary
                </span>

                <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-center space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">
                    Monthly Amortization
                  </span>
                  <div className="text-3xl font-black text-amber-400 font-mono">
                    {formatPHP(embeddedCalcResult.monthlyAmortization)}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    {calcTermMonths} months @ 1.99% monthly add-on rate
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400 font-sans">Down Payment ({calcDpPercent}%):</span>
                    <span className="font-bold text-white">{formatPHP(embeddedCalcResult.downPaymentAmount)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400 font-sans">Financed Principal:</span>
                    <span className="font-bold text-slate-200">{formatPHP(embeddedCalcResult.principal)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400 font-sans">Add-On Interest:</span>
                    <span className="font-bold text-slate-200">{formatPHP(embeddedCalcResult.addOnInterest)}</span>
                  </div>
                  {embeddedCalcResult.ltoCash > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-teal-400 font-sans">LTO Registration (Fixed Cash Out):</span>
                      <span className="font-bold text-teal-400">{formatPHP(embeddedCalcResult.ltoCash)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 font-bold">
                    <span className="text-amber-400 font-sans">Total Cash Out Required:</span>
                    <span className="text-amber-400">{formatPHP(embeddedCalcResult.totalCashOut)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyEmbeddedCalcToNotepad}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 text-amber-400 font-bold text-xs py-2.5 rounded-xl border border-amber-500/30 transition-colors cursor-pointer mt-3"
                >
                  {isCopiedEmbeddedNotepad ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied to Notepad!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                      <span>Copy Summary to Notepad</span>
                    </>
                  )}
                </button>
              </div>

              {onNavigateToApplication && (
                <button
                  type="button"
                  onClick={onNavigateToApplication}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg cursor-pointer"
                >
                  <span>Apply for Loan with these Terms</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Preview Modal */}
      {previewModalImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-5 space-y-4 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-400">
                  {previewModalImage.category}
                </span>
                <h4 className="text-sm font-bold text-white truncate max-w-md">
                  {previewModalImage.name}
                </h4>
              </div>
              <button
                onClick={() => setPreviewModalImage(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-hidden rounded-xl bg-black flex items-center justify-center p-2">
              <img
                src={previewModalImage.dataUrl}
                alt={previewModalImage.name}
                className="max-h-[66vh] w-auto object-contain"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400">
                Uploaded: {previewModalImage.uploadedAt} • {(previewModalImage.size / 1024).toFixed(0)} KB
              </span>
              <button
                onClick={() => setPreviewModalImage(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Support Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">Need assistance with your documentary submission?</h4>
          <p className="text-xs text-slate-400">
            Please ask your assigned sales specialist for guidances regarding co-borrowers, OFW remitters, and requirements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-700 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Requirements List</span>
          </button>
        </div>
      </div>
    </div>
  );
};
