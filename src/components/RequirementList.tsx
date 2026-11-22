import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  X,
  ShieldCheck,
  Smartphone,
  ClipboardList,
} from 'lucide-react';
import { CompanySettings } from '../types';

interface RequirementListProps {
  companySettings: CompanySettings;
  onNavigateToCalculator?: () => void;
  onNavigateToApplicationForm?: () => void;
}

// Viber SVG Icon Component
const ViberIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M19.78 4.22A13.2 13.2 0 0 0 12 1.6C5.67 1.6 1.6 5.67 1.6 12c0 2.22.61 4.34 1.76 6.18L1.6 22.4l4.43-1.68A13.2 13.2 0 0 0 12 22.4c6.33 0 10.4-4.07 10.4-10.4 0-2.92-1.07-5.66-2.62-7.78zM12 20.8a11.6 11.6 0 0 1-5.18-1.22l-.37-.19-2.94 1.11 1.14-2.84-.23-.39A11.6 11.6 0 0 1 3.2 12C3.2 6.55 6.75 3.2 12 3.2s8.8 3.35 8.8 8.8c0 5.45-3.55 8.8-8.8 8.8zm4.72-6.52c-.26-.13-1.52-.75-1.76-.84-.24-.09-.41-.13-.58.13-.17.26-.67.84-.82 1.01-.15.17-.3.19-.56.06-.26-.13-1.08-.4-2.06-1.27-.76-.68-1.28-1.52-1.43-1.78-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.58-1.4-.8-1.92-.21-.51-.43-.44-.58-.45l-.5-.01c-.17 0-.45.06-.69.32-.24.26-.91.89-.91 2.17 0 1.28.93 2.52 1.06 2.7.13.17 1.83 2.8 4.44 3.93.62.27 1.11.43 1.49.55.63.2 1.2.17 1.65.1.5-.07 1.52-.62 1.74-1.22.21-.6.21-1.12.15-1.22-.06-.1-.24-.16-.5-.29z" />
  </svg>
);

export const RequirementList: React.FC<RequirementListProps> = ({
  companySettings,
  onNavigateToCalculator,
  onNavigateToApplicationForm,
}) => {
  const [isCopiedToNotepad, setIsCopiedToNotepad] = useState<boolean>(false);
  const [isNotepadModalOpen, setIsNotepadModalOpen] = useState<boolean>(false);

  // Exact normal text format as requested by the user
  const requirementText = `Applicable to ALL BRANDS of Brand-New Motorcycles! 💯

📋 DOCUMENTARY REQUIREMENTS CHECKLIST

🆔 1. IDENTIFICATION
✅ Duly Accomplished Loan Application Form
✅ 2 Valid Government-Issued IDs
✅ Birth Certificate / Marriage Certificate

🏠 2. PROOF OF RESIDENCY
✅ Electric or Water Bill (Latest 2 months)

(Note: If the bill is not under your name or co-borrower's name, submit a Barangay Clearance or Internet Bill instead)

💼 3. PROOF OF INCOME (Choose what applies to you)

🏢 For Business Owners:
• DTI Registration
• Mayor’s Permit / Business Permit / Barangay Permit
• Latest 2 Months Bank Statement

👔 For Employed:
• Company ID
• Certificate of Employment (COE)
• Latest 2 Months Payslip
• Latest 2 Months Payroll Bank Statement

🛵 For TNVS / Delivery Drivers (Angkas, JoyRide, etc.):
• Driver's License
• Certificate (for Angkas)
• Profile Screenshot from Application
• Latest 2 Months Screenshot of Earnings


Please submit your application and requirements thru viber`;

  // Copy to Notepad handler
  const handleCopyToNotepad = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(requirementText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = requirementText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setIsCopiedToNotepad(true);
      setIsNotepadModalOpen(true);
      setTimeout(() => setIsCopiedToNotepad(false), 2500);
    } catch (err) {
      console.warn('Clipboard copy error:', err);
      setIsNotepadModalOpen(true);
    }
  };

  // Send to Viber
  const handleSendToViber = () => {
    const viberUrl = `viber://forward?text=${encodeURIComponent(requirementText)}`;
    window.location.href = viberUrl;
  };

  // Download as .txt file
  const handleDownloadTxt = () => {
    const blob = new Blob([requirementText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Documentary_Requirements_Checklist.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 font-sans animate-fadeIn">
      {/* Top Header Card */}
      <div className="th-hero border-2 rounded-3xl p-5 sm:p-7 shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="th-btn-primary text-[10px] sm:text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>All Brands Requirements</span>
            </span>
            <span className="th-card border text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full th-accent">
              {companySettings.companyName}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black th-heading tracking-tight flex items-center gap-2">
            <span>REQUIREMENTS LIST Checklist</span>
          </h1>
        </div>
      </div>

      {/* NORMAL TEXT FORMAT DISPLAY BOX (No tick boxes, clean normal text format) */}
      <div className="th-card border rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b th-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg th-subpanel border flex items-center justify-center shrink-0">
              <ClipboardList className="w-4 h-4 th-accent" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider th-accent block">
                Requirements Format
              </span>
              <span className="text-sm font-black th-heading font-mono">
                Documentary_Requirements_Checklist.txt
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyToNotepad}
              className="text-xs th-badge border px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-colors hover:opacity-90"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
          </div>
        </div>

        {/* Normal Text Format Display Container */}
        <div className="th-notepad-box border rounded-2xl p-4 sm:p-6 overflow-x-auto shadow-inner">
          <pre className="text-xs sm:text-sm font-mono whitespace-pre-wrap leading-relaxed select-all">
            {requirementText}
          </pre>
        </div>
      </div>

      {/* ACTION BAR: BELOW ADD COPY TO NOTEPAD */}
      <div className="th-card-strong border-2 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b th-border-subtle pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl th-btn-primary flex items-center justify-center shrink-0 shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black th-heading">
                Save or Send Requirements Checklist
              </h3>
              <p className="text-xs th-text-muted">
                Copy text into Windows Notepad or directly forward to Viber for your motorcycle buyers.
              </p>
            </div>
          </div>
          {isCopiedToNotepad && (
            <span className="text-xs th-badge-alt border px-3 py-1 rounded-full font-bold flex items-center gap-1.5 self-start sm:self-auto animate-pulse">
              <Check className="w-3.5 h-3.5" />
              <span>Copied to Clipboard!</span>
            </span>
          )}
        </div>

        {/* Primary Action Buttons: COPY TO NOTEPAD (Prominent) + Send to Viber + Save as .txt */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. COPY TO NOTEPAD */}
          <button
            type="button"
            onClick={handleCopyToNotepad}
            className="flex items-center justify-center gap-2.5 th-btn-primary font-black text-sm px-5 py-3.5 rounded-2xl shadow-lg cursor-pointer active:scale-98 transition-all"
            title="Copy requirements checklist to Notepad"
          >
            <Copy className="w-4 h-4 stroke-[2.5]" />
            <span>Copy to Notepad</span>
          </button>

          {/* 2. SEND TO VIBER */}
          <button
            type="button"
            onClick={handleSendToViber}
            className="flex items-center justify-center gap-2 bg-[#7360F2] hover:bg-[#6250e0] text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-md shadow-[#7360F2]/25 cursor-pointer active:scale-98 transition-all"
            title="Send requirements checklist directly to Viber"
          >
            <ViberIcon className="w-4 h-4" />
            <span>Send to Viber</span>
          </button>

          {/* 3. DOWNLOAD .TXT FILE */}
          <button
            type="button"
            onClick={handleDownloadTxt}
            className="flex items-center justify-center gap-2 th-btn-secondary font-bold text-xs sm:text-sm px-4 py-3 rounded-2xl border cursor-pointer active:scale-98 transition-colors"
            title="Download text file as Notepad .txt"
          >
            <Download className="w-4 h-4 th-accent" />
            <span>Save as .txt</span>
          </button>
        </div>

        {/* Instruction Note */}
        <div className="pt-2 text-xs th-text-muted flex flex-wrap items-center justify-between gap-2 border-t th-border-subtle">
          <span className="flex items-center gap-1.5 th-accent font-semibold">
            <Smartphone className="w-3.5 h-3.5 th-accent-2" />
            <span>Please submit your application and requirements thru viber</span>
          </span>
          <div className="flex items-center gap-3">
            {onNavigateToApplicationForm && (
              <button
                type="button"
                onClick={onNavigateToApplicationForm}
                className="th-accent-2 font-bold hover:underline cursor-pointer"
              >
                Go to Application Form →
              </button>
            )}
            {onNavigateToCalculator && (
              <button
                type="button"
                onClick={onNavigateToCalculator}
                className="th-accent font-bold hover:underline cursor-pointer"
              >
                Loan Calculator →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* NOTEPAD PREVIEW MODAL */}
      {isNotepadModalOpen && (
        <div className="fixed inset-0 z-50 th-overlay backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="th-card-strong border-2 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Notepad Window Title Bar */}
            <div className="th-hero border-b th-border px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg th-btn-primary flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black th-heading font-mono">
                      Notepad - Requirements_List_Checklist.txt
                    </span>
                    <span className="text-[10px] th-badge-alt border font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Copied!</span>
                    </span>
                  </div>
                  <span className="text-[11px] th-text-muted block">
                    Plain-text format copied to your clipboard
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
                <span>The complete requirements checklist was copied to your clipboard!</span>
              </span>
              <span className="text-[10px] th-accent-2 font-mono font-bold hidden sm:inline">
                UTF-8 Plain Text
              </span>
            </div>

            {/* Notepad Text Content Box */}
            <div className="p-4 th-notepad-box flex-1 overflow-y-auto">
              <pre className="text-xs sm:text-sm font-mono whitespace-pre-wrap leading-relaxed select-all">
                {requirementText}
              </pre>
            </div>

            {/* Notepad Window Footer */}
            <div className="th-card border-t th-border px-4 py-3 flex flex-wrap items-center justify-between gap-2.5">
              <span className="text-xs th-text-muted font-mono">
                Press Ctrl+V to paste anywhere
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyToNotepad}
                  className="flex items-center gap-1.5 th-btn-secondary font-bold text-xs px-3 py-2 rounded-xl border cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 th-accent" />
                  <span>Copy Again</span>
                </button>
                <button
                  type="button"
                  onClick={handleSendToViber}
                  className="flex items-center gap-1.5 bg-[#7360F2] hover:bg-[#6250e0] text-white font-bold text-xs px-3 py-2 rounded-xl cursor-pointer"
                >
                  <ViberIcon className="w-3.5 h-3.5" />
                  <span>Send to Viber</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsNotepadModalOpen(false)}
                  className="th-btn-primary font-black text-xs px-4 py-2 rounded-xl cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
