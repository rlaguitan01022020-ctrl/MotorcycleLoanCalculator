import React, { useState, useMemo } from 'react';
import {
  FileText,
  Bike,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Building,
  UserCheck,
  Phone,
  Landmark,
  Plus,
  Trash2,
  X,
  FileDown,
  Check,
  Copy,
  Download,
  Mail,
} from 'lucide-react';
import {
  SALES_QUOTATION_CONFIG,
  DEFAULT_FINANCING_PARTNERS,
  STORAGE_KEYS,
  LOAN_SETTINGS,
} from '../data/motostradaData';
import { LoanCalculationResult, CompanySettings, FeeLine } from '../types';
import { formatPHP, calculateLoan } from '../utils/calculator';

interface SalesQuotationProps {
  modelName: string;
  seriesName: string;
  calculation: LoanCalculationResult;
  feeLines?: FeeLine[];
  onProceedToApplication: () => void;
  companySettings: CompanySettings;
}

export const SalesQuotation: React.FC<SalesQuotationProps> = ({
  modelName,
  seriesName,
  calculation,
  feeLines = [],
  onProceedToApplication,
  companySettings,
}) => {
  // Client Details
  const [customerName, setCustomerName] = useState('Juan Dela Cruz');
  const [customerContact, setCustomerContact] = useState('+63 917 999 8888');
  const [customerAddress, setCustomerAddress] = useState('Metro Manila, Philippines');

  // Agent Details
  const [agentName, setAgentName] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.agent_key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name !== undefined) return parsed.name;
      }
    } catch {}
    return 'Onad';
  });

  const [agentContact, setAgentContact] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.agent_key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.contact !== undefined) return parsed.contact;
      }
    } catch {}
    return '9914414670';
  });

  const [agentEmail, setAgentEmail] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.agent_key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email !== undefined) return parsed.email;
      }
    } catch {}
    return 'onad@motostrada.ph';
  });

  // Financing Partner (Default can be blank or partner)
  const [financingPartner, setFinancingPartner] = useState<string>('');

  // Custom Financing Companies Management
  const [customPartners, setCustomPartners] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.financing_partners_key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isAddingPartner, setIsAddingPartner] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [partnerNotice, setPartnerNotice] = useState<string | null>(null);

  const allPartners = useMemo(() => {
    return Array.from(new Set([...DEFAULT_FINANCING_PARTNERS, ...customPartners]));
  }, [customPartners]);

  const handleAddCustomPartner = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newPartnerName.trim();
    if (!trimmed) return;
    if (!customPartners.includes(trimmed) && !DEFAULT_FINANCING_PARTNERS.includes(trimmed)) {
      const updated = [...customPartners, trimmed];
      setCustomPartners(updated);
      try {
        localStorage.setItem(STORAGE_KEYS.financing_partners_key, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save custom financing partner:', err);
      }
    }
    setFinancingPartner(trimmed);
    setNewPartnerName('');
    setIsAddingPartner(false);
    setPartnerNotice(`Added "${trimmed}"`);
    setTimeout(() => setPartnerNotice(null), 3000);
  };

  const handleDeletePartner = () => {
    if (!financingPartner) return;
    const current = financingPartner;
    // If it's a custom partner, also remove from customPartners list
    if (customPartners.includes(current)) {
      const updated = customPartners.filter((p) => p !== current);
      setCustomPartners(updated);
      try {
        localStorage.setItem(STORAGE_KEYS.financing_partners_key, JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
    }
    // Set to blank
    setFinancingPartner('');
    setPartnerNotice(`Financing partner cleared to blank`);
    setTimeout(() => setPartnerNotice(null), 2500);
  };

  const [quoteDate] = useState(() =>
    new Date().toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  );

  // Term comparison matching Loan Calculator & Notepad Summary exactly
  const termComparisons = useMemo(() => {
    return [12, 18, 24, 36].map((term) => {
      const calc = calculateLoan({
        srp: calculation.srp,
        downPaymentPercent: calculation.downPaymentPercent,
        termMonths: term,
        monthlyRatePercent: calculation.monthlyRatePercent,
        feeLines: feeLines || [],
        ltoCash: calculation.ltoCash || LOAN_SETTINGS.lto_registration_cash,
      });
      return {
        term,
        monthly: calc.monthlyAmortization,
      };
    });
  }, [
    calculation.srp,
    calculation.downPaymentPercent,
    calculation.monthlyRatePercent,
    calculation.ltoCash,
    feeLines,
  ]);

  const [isSavedToWord, setIsSavedToWord] = useState(false);
  const [isCopiedHtml, setIsCopiedHtml] = useState(false);
  const [isDownloadedNote, setIsDownloadedNote] = useState(false);

  // Generate the whole standalone HTML document for Word export, copying, and note download
  const generateQuotationHtml = () => {
    // Term comparison rows for Word/HTML table (compressed padding & line-height)
    const termRowsHtml = [12, 18, 24, 36]
      .map((term) => {
        const comp = termComparisons.find((t) => t.term === term);
        const monthlyStr = comp ? formatPHP(comp.monthly) : formatPHP(calculation.monthlyAmortization);
        const isActive = term === calculation.termMonths;
        return `
          <tr style="${isActive ? 'background-color: #f0fdfa;' : ''}">
            <td style="padding: 3pt 8pt; border: 1pt solid #cbd5e1; font-weight: ${isActive ? 'bold' : 'normal'}; color: ${isActive ? '#0d9488' : '#1e293b'}; font-size: 9pt; line-height: 1.15;">
              ${term} Months ${isActive ? '<strong>(Active)</strong>' : ''}
            </td>
            <td style="padding: 3pt 8pt; border: 1pt solid #cbd5e1; text-align: right; font-weight: bold; color: ${isActive ? '#0d9488' : '#1e293b'}; font-size: 9.5pt; line-height: 1.15;">
              ${monthlyStr} / mo
            </td>
          </tr>
        `;
      })
      .join('');

    const freebiesListHtml = SALES_QUOTATION_CONFIG.freebies
      .map((f) => `<li style="margin-bottom: 3pt;">${f}</li>`)
      .join('');

    return `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40' lang="en">
<head>
<meta charset='utf-8'>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!--[if gte mso 9]>
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
    <w:DoNotOptimizeForBrowser/>
  </w:WordDocument>
</xml>
<![endif]-->
<title>Sales Quotation</title>
<style>
  @page WordSection1 {
    size: 8.5in 11.0in;
    margin: 0.75in 0.75in 0.75in 0.75in;
    mso-header-margin: 0.5in;
    mso-footer-margin: 0.5in;
    mso-paper-source: 0;
  }
  div.WordSection1 {
    page: WordSection1;
  }
  body {
    font-family: 'Segoe UI', Calibri, Arial, sans-serif;
    color: #0f172a;
    background-color: #ffffff;
    font-size: 10pt;
    line-height: 1.35;
    margin: 0;
    padding: 18pt;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }
  .header-table {
    width: 100%;
    border-bottom: 2pt solid #0d9488;
    padding-bottom: 6pt;
    margin-bottom: 10pt;
  }
  .company-title {
    font-size: 14pt;
    font-weight: bold;
    color: #0f172a;
    margin: 0;
  }
  .company-sub {
    font-size: 9pt;
    color: #475569;
    margin: 2pt 0;
  }
  .quote-title {
    font-size: 13pt;
    font-weight: bold;
    color: #0d9488;
    text-align: right;
  }
  .quote-meta {
    font-size: 9pt;
    color: #334155;
    text-align: right;
  }
  .summary-bar {
    width: 100%;
    background-color: #f8fafc;
    border: 1pt solid #cbd5e1;
    margin-bottom: 10pt;
  }
  .summary-bar td {
    padding: 6pt 10pt;
    vertical-align: top;
    font-size: 9.5pt;
  }
  .section-heading {
    font-size: 10pt;
    font-weight: bold;
    color: #0f172a;
    text-transform: uppercase;
    letter-spacing: 0.5pt;
    margin-top: 10pt;
    margin-bottom: 4pt;
    border-bottom: 1pt solid #cbd5e1;
    padding-bottom: 2pt;
  }
  table.data-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 8pt;
    font-size: 9pt;
  }
  table.data-table th {
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: bold;
    padding: 3.5pt 8pt;
    text-align: left;
    border: 1pt solid #cbd5e1;
    line-height: 1.15;
  }
  table.data-table td {
    padding: 3pt 8pt;
    border: 1pt solid #e2e8f0;
    color: #1e293b;
    line-height: 1.15;
  }
  .highlight-row {
    background-color: #f0fdfa;
    font-weight: bold;
  }
  .highlight-row td {
    color: #0f766e;
    font-size: 9.5pt;
  }
  .cashout-table {
    width: 100%;
    background-color: #f8fafc;
    border: 1pt solid #cbd5e1;
    margin-bottom: 10pt;
  }
  .cashout-table td {
    padding: 5pt 10pt;
    font-size: 9.5pt;
  }
  .signature-table {
    width: 100%;
    margin-top: 22pt;
    border-collapse: collapse;
  }
  .signature-table td {
    width: 50%;
    text-align: center;
    vertical-align: bottom;
    padding: 0 25pt;
  }
  .signature-line {
    border-top: 1pt solid #334155;
    padding-top: 4pt;
    font-size: 9pt;
    font-weight: bold;
    color: #1e293b;
  }
</style>
</head>
<body>

<table class="header-table">
  <tr>
    <td style="vertical-align: middle; text-align: right;">
      <div class="quote-meta" style="font-size: 9.5pt; color: #475569;">Date: ${quoteDate}</div>
    </td>
  </tr>
</table>

<table class="summary-bar">
  <tr>
    <td style="width: 50%;">
      <span style="text-transform: uppercase; font-size: 8pt; color: #64748b; font-weight: bold; display: block;">Quotation Prepared For</span>
      <div style="font-size: 11pt; font-weight: bold; color: #0f172a; margin-top: 2pt;">${customerName || 'Valued Client'}</div>
      <div style="color: #334155;">${customerContact}</div>
      <div style="color: #64748b;">${customerAddress}</div>
    </td>
    <td style="width: 50%; text-align: right;">
      <span style="text-transform: uppercase; font-size: 8pt; color: #64748b; font-weight: bold; display: block;">Motorcycle Unit Applied</span>
      <div style="font-size: 11pt; font-weight: bold; color: #0f172a; margin-top: 2pt;">${modelName} (${seriesName})</div>
      <div style="font-size: 10pt; font-weight: bold; color: #0d9488;">SRP: ${formatPHP(calculation.srp)}</div>
      ${financingPartner ? `<div style="color: #334155;">Financing Partner: <strong>${financingPartner}</strong></div>` : ''}
    </td>
  </tr>
</table>

<div class="section-heading">Total Cash Out Summary</div>
<table class="cashout-table">
  <tr>
    <td style="width: 50%;">
      <span style="font-size: 8pt; color: #64748b; text-transform: uppercase; display: block; font-weight: bold;">Down Payment Equity (${calculation.downPaymentPercent}%)</span>
      <strong style="font-size: 10.5pt; color: #0f172a;">${formatPHP(calculation.downPaymentAmount)}</strong>
    </td>
    <td style="width: 50%;">
      <span style="font-size: 8pt; color: #64748b; text-transform: uppercase; display: block; font-weight: bold;">LTO Registration (Fixed)</span>
      <strong style="font-size: 10.5pt; color: #0d9488;">${formatPHP(calculation.ltoCash || 5500)}</strong>
    </td>
  </tr>
  <tr style="border-top: 1pt solid #cbd5e1;">
    <td style="padding-top: 6pt;">
      <strong style="font-size: 11pt; color: #0f172a;">TOTAL ESTIMATED CASH OUT:</strong>
      <span style="font-size: 13pt; font-weight: bold; color: #0d9488; margin-left: 8pt;">${formatPHP(calculation.totalCashOut)}</span>
    </td>
    <td style="padding-top: 6pt; text-align: right;">
      <span style="color: #64748b; font-size: 9pt;">Total Motorcycle Cost: </span>
      <strong style="font-size: 10.5pt; color: #0f172a;">${formatPHP(calculation.totalCostOfMotorcycle)}</strong>
    </td>
  </tr>
</table>

<div class="section-heading">Term Comparison (${calculation.downPaymentPercent}% Down Payment)</div>
<table class="data-table">
  <thead>
    <tr>
      <th style="width: 50%;">Repayment Term</th>
      <th style="width: 50%; text-align: right;">Monthly Payment</th>
    </tr>
  </thead>
  <tbody>
    ${termRowsHtml}
  </tbody>
</table>

<div class="section-heading">Included Dealer Freebies</div>
<ul style="margin: 4pt 0 12pt 18pt; font-size: 9.5pt; color: #334155;">
  ${freebiesListHtml}
</ul>

<div style="margin-top: 10pt; padding-top: 8pt; border-top: 1pt solid #cbd5e1; font-size: 8.5pt; color: #334155; line-height: 1.5;">
  <div style="font-family: monospace; font-size: 8.5pt; background: #f8fafc; padding: 6pt 10pt; border: 1pt solid #cbd5e1; border-radius: 4pt; white-space: pre-line; line-height: 1.45; margin-bottom: 6pt;">
NOTE:
10%
36 month 2.70%
24 months 2.60%
12 months 2.5%

DP SMALL CC
15% Monthly Add-on Interest Rate 2.25%
3% Processing fee

DP BIG CC
20% up 1.85% Interest rate
  </div>
  <div style="color: #64748b;"><strong>Note:</strong> ${SALES_QUOTATION_CONFIG.default_note}</div>
</div>

<table class="signature-table">
  <tr>
    <td style="width: 50%; vertical-align: top; text-align: center; padding: 0 15pt;">
      <div style="font-weight: bold; color: #0f172a; margin-bottom: 2pt;">${agentName || 'Sales Representative'}</div>
      <div class="signature-line">Prepared By (Sales Specialist)</div>
      <div style="font-size: 8.5pt; color: #0d9488; margin-top: 2pt;">${agentContact}</div>
      ${agentEmail ? `<div style="font-size: 8.5pt; color: #475569; margin-top: 1.5pt;">${agentEmail}</div>` : ''}
    </td>
    <td style="width: 50%; vertical-align: top; text-align: center; padding: 0 15pt;">
      <div style="font-weight: bold; color: #0f172a; margin-bottom: 2pt;">${customerName || 'Customer Conforme'}</div>
      <div class="signature-line">Customer Conforme</div>
      <div style="font-size: 8.5pt; color: #475569; margin-top: 4pt; font-style: italic; line-height: 1.35;">
        Note: Insert Motorcycle/Scooter/ATV Photo Click the link <a href="https://www.cfmoto.com/global" target="_blank" style="color: #0d9488; text-decoration: underline;">https://www.cfmoto.com/global</a>
      </div>
    </td>
  </tr>
</table>

<!-- Footer Address Page 1 -->
<table style="width: 100%; margin-top: 20pt; border-top: 1.5pt solid #0d9488; padding-top: 6pt;">
  <tr>
    <td style="text-align: center; font-size: 8.5pt; color: #475569; font-weight: 600;">
      141 8th Street, corner 11th Avenue, Grace Park East, Caloocan City
    </td>
  </tr>
</table>

<!-- PAGE BREAK: PAGE 2 BANK DETAILS -->
<br clear="all" style="page-break-before:always; mso-break-type:section-break;" />
<div style="page-break-before: always; mso-break-type: section-break; clear: both; padding-top: 16pt;">
  <table class="header-table" style="margin-bottom: 12pt;">
    <tr>
      <td style="vertical-align: middle;">
        <div style="font-size: 13pt; font-weight: 800; color: #0d9488; text-transform: uppercase; letter-spacing: 0.5pt;">
          OFFICIAL BANK DETAILS &amp; PAYMENT CHANNELS
        </div>
        <div style="font-size: 8.5pt; color: #64748b; margin-top: 2pt;">
          Unit Applied: <strong>${modelName} (${seriesName})</strong> | Quotation For: <strong>${customerName || 'Valued Client'}</strong>
        </div>
      </td>
      <td style="vertical-align: middle; text-align: right;">
        <div class="quote-meta" style="font-size: 9pt; color: #475569;">Page 2</div>
      </td>
    </tr>
  </table>

  <div class="section-heading" style="margin-top: 8pt;">BANK DETAILS</div>
  <div style="font-size: 9.5pt; font-weight: bold; color: #0f172a; margin-bottom: 8pt; padding: 6pt 10pt; background: #f0fdfa; border: 1pt solid #99f6e4; border-radius: 4pt;">
    ACCOUNT NAME: <span style="color: #0d9488; font-family: monospace; font-size: 10.5pt;">MOTOSTRADA BIKES &amp; GEARS SHOP</span>
  </div>
  <table class="data-table" style="width: 100%; border-collapse: collapse; margin-bottom: 14pt; font-size: 9pt;">
    <thead>
      <tr style="background-color: #f1f5f9;">
        <th style="padding: 6pt 10pt; border: 1pt solid #cbd5e1; text-align: left; width: 40%;">BANK</th>
        <th style="padding: 6pt 10pt; border: 1pt solid #cbd5e1; text-align: left; width: 60%;">ACCOUNT NUMBER</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style="padding: 5pt 10pt; border: 1pt solid #cbd5e1; font-weight: bold;">BDO</td><td style="padding: 5pt 10pt; border: 1pt solid #cbd5e1; font-family: monospace; font-weight: bold;">003-81801306-1</td></tr>
      <tr style="background-color: #f8fafc;"><td style="padding: 5pt 10pt; border: 1pt solid #cbd5e1; font-weight: bold;">AUB</td><td style="padding: 5pt 10pt; border: 1pt solid #cbd5e1; font-family: monospace; font-weight: bold;">039-01-000120-7</td></tr>
      <tr><td style="padding: 5pt 10pt; border: 1pt solid #cbd5e1; font-weight: bold;">METROBANK</td><td style="padding: 5pt 10pt; border: 1pt solid #cbd5e1; font-family: monospace; font-weight: bold;">004-7-00455390-6</td></tr>
      <tr style="background-color: #f8fafc;"><td style="padding: 5pt 10pt; border: 1pt solid #cbd5e1; font-weight: bold;">RCBC</td><td style="padding: 5pt 10pt; border: 1pt solid #cbd5e1; font-family: monospace; font-weight: bold;">0000007591342681</td></tr>
      <tr><td style="padding: 5pt 10pt; border: 1pt solid #cbd5e1; font-weight: bold;">BPI</td><td style="padding: 5pt 10pt; border: 1pt solid #cbd5e1; font-family: monospace; font-weight: bold;">3110-0192-45</td></tr>
      <tr style="background-color: #f8fafc;"><td style="padding: 5pt 10pt; border: 1pt solid #cbd5e1; font-weight: bold;">UNIONBANK</td><td style="padding: 5pt 10pt; border: 1pt solid #cbd5e1; font-family: monospace; font-weight: bold;">0020-5000-9830</td></tr>
      <tr><td style="padding: 5pt 10pt; border: 1pt solid #cbd5e1; font-weight: bold;">SECURITY BANK</td><td style="padding: 5pt 10pt; border: 1pt solid #cbd5e1; font-family: monospace; font-weight: bold;">000023904330</td></tr>
    </tbody>
  </table>

  <div style="background: #f8fafc; border: 1pt solid #cbd5e1; border-radius: 4pt; padding: 10pt; margin-bottom: 16pt; font-size: 8.5pt; color: #475569; line-height: 1.5;">
    <strong style="color: #0f172a; display: block; margin-bottom: 3pt;">Important Payment Instructions:</strong>
    All deposits and electronic bank transfers must be made solely to the official account name <strong>MOTOSTRADA BIKES &amp; GEARS SHOP</strong>. Please send your deposit confirmation or transaction screenshot to your Sales Specialist (${agentName || 'Sales Representative'} / ${agentContact}${agentEmail ? ` / ${agentEmail}` : ''}) for official receipting and release order processing.
  </div>

  <!-- Footer Address Page 2 -->
  <table style="width: 100%; margin-top: 36pt; border-top: 1.5pt solid #0d9488; padding-top: 6pt;">
    <tr>
      <td style="text-align: center; font-size: 8.5pt; color: #475569; font-weight: 600;">
        141 8th Street, corner 11th Avenue, Grace Park East, Caloocan City
      </td>
    </tr>
  </table>
</div>

</body>
</html>`;
  };

  // Generate and download Microsoft Word document (.doc)
  const handleSaveToWord = () => {
    const cleanCustomer = (customerName || 'Valued_Client').trim().replace(/[^a-zA-Z0-9]/g, '_');
    const cleanModel = (modelName || 'Motorcycle').trim().replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Sales_Quotation_${cleanCustomer}_${cleanModel}.doc`;
    const wordHtml = generateQuotationHtml();

    try {
      const blob = new Blob(['\ufeff', wordHtml], { type: 'application/msword;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsSavedToWord(true);
      setTimeout(() => setIsSavedToWord(false), 3000);
    } catch (err) {
      console.error('Save to Word error:', err);
    }
  };

  // Copy entire HTML code to clipboard
  const handleCopyHtml = async () => {
    const html = generateQuotationHtml();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(html);
      } else {
        const ta = document.createElement('textarea');
        ta.value = html;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setIsCopiedHtml(true);
      setTimeout(() => setIsCopiedHtml(false), 3000);
    } catch (err) {
      console.warn('Clipboard write error:', err);
    }
  };

  // Download entire HTML code as a note file (.html / .txt)
  const handleDownloadNote = () => {
    const html = generateQuotationHtml();
    const cleanCustomer = (customerName || 'Valued_Client').trim().replace(/[^a-zA-Z0-9]/g, '_');
    const cleanModel = (modelName || 'Motorcycle').trim().replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Sales_Quotation_Note_${cleanCustomer}_${cleanModel}.html`;

    try {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsDownloadedNote(true);
      setTimeout(() => setIsDownloadedNote(false), 3000);
    } catch (err) {
      console.error('Download note error:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Action Bar (Hidden when printing) */}
      <div className="no-print th-card border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 th-accent-2" />
          <div>
            <h2 className="text-base font-bold th-heading">Sales Quotation</h2>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Copy Whole HTML Code */}
          <button
            onClick={handleCopyHtml}
            className="flex items-center gap-2 th-btn-secondary font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border shadow-sm transition-all cursor-pointer group"
            title="Copy entire HTML code of this quotation to clipboard"
          >
            {isCopiedHtml ? (
              <>
                <Check className="w-4 h-4 th-accent" />
                <span className="th-accent font-bold">Copied HTML!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 th-accent group-hover:scale-110 transition-transform" />
                <span>Copy HTML Code</span>
              </>
            )}
          </button>

          {/* Download to Note (.html) */}
          <button
            onClick={handleDownloadNote}
            className="flex items-center gap-2 th-badge font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border shadow-sm transition-all cursor-pointer group hover:opacity-90"
            title="Download full HTML code to a note file (.html)"
          >
            {isDownloadedNote ? (
              <>
                <Check className="w-4 h-4" />
                <span className="font-bold">Downloaded Note!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Download to Note</span>
              </>
            )}
          </button>

          {/* Save to Word */}
          <button
            onClick={handleSaveToWord}
            className="flex items-center gap-2 th-btn-primary font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer group"
            title="Download formatted Microsoft Word (.doc) quotation document"
          >
            {isSavedToWord ? (
              <>
                <Check className="w-4 h-4" />
                <span className="font-extrabold">Saved to Word!</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Save to Word</span>
              </>
            )}
          </button>

          {/* Proceed to Application Form */}
          <button
            onClick={onProceedToApplication}
            className="flex items-center gap-2 th-card font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border transition-colors cursor-pointer hover:opacity-90"
          >
            <span>Proceed to Application Form</span>
            <ArrowRight className="w-4 h-4 th-accent-2" />
          </button>
        </div>
      </div>

      {/* Editable Quotation Configuration Panel (Client, Agent, Financing Partner) */}
      <div className="no-print th-card border rounded-2xl p-5 space-y-4 text-xs shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider th-accent-2 block border-b th-border-subtle pb-2">
          Quotation Parameters
        </span>

        {/* Row 1: Client Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="th-accent font-semibold uppercase tracking-wider block mb-1">
              Client Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full th-input border rounded-xl px-3 py-2 font-medium"
              placeholder="Applicant Name"
            />
          </div>
          <div>
            <label className="th-accent font-semibold uppercase tracking-wider block mb-1">
              Client Contact Number
            </label>
            <input
              type="text"
              value={customerContact}
              onChange={(e) => setCustomerContact(e.target.value)}
              className="w-full th-input border rounded-xl px-3 py-2 font-medium"
              placeholder="Mobile / Phone"
            />
          </div>
          <div>
            <label className="th-accent font-semibold uppercase tracking-wider block mb-1">
              Client City / Address
            </label>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full th-input border rounded-xl px-3 py-2 font-medium"
              placeholder="Address"
            />
          </div>
        </div>

        {/* Row 2: Agent Details & Financing Partner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t th-border-subtle">
          <div>
            <label className="th-accent font-bold uppercase tracking-wider mb-1 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 th-accent-2" />
                <span>Agent Name</span>
              </span>
              <span className="text-[10px] th-text-muted font-normal">Dropdown</span>
            </label>
            <div className="flex gap-1.5">
              <select
                value={['Onad', 'Morris', 'Gerald', ''].includes(agentName) ? (agentName || 'Blank') : 'custom'}
                onChange={(e) => {
                  const sel = e.target.value;
                  if (sel === 'custom') return;
                  const newName = sel === 'Blank' ? '' : sel;
                  let newContact = agentContact;
                  let newEmail = agentEmail;
                  if (sel === 'Onad') {
                    newContact = '9914414670';
                    newEmail = 'onad@motostrada.ph';
                  } else if (sel === 'Morris') {
                    newContact = '9761951262';
                    newEmail = 'morris@motostrada.ph';
                  } else if (sel === 'Gerald') {
                    newContact = '9263739110';
                    newEmail = 'gerald@motostrada.ph';
                  } else if (sel === 'Blank') {
                    newContact = '';
                    newEmail = '';
                  }

                  setAgentName(newName);
                  setAgentContact(newContact);
                  setAgentEmail(newEmail);
                  try {
                    localStorage.setItem(
                      STORAGE_KEYS.agent_key,
                      JSON.stringify({ name: newName, contact: newContact, email: newEmail })
                    );
                  } catch {}
                }}
                className="th-input border rounded-xl px-2.5 py-2 font-medium text-xs cursor-pointer"
              >
                <option value="Onad">Onad</option>
                <option value="Morris">Morris</option>
                <option value="Gerald">Gerald</option>
                <option value="Blank">Blank</option>
                {!['Onad', 'Morris', 'Gerald', ''].includes(agentName) && (
                  <option value="custom">Custom</option>
                )}
              </select>
              <input
                type="text"
                value={agentName}
                onChange={(e) => {
                  const val = e.target.value;
                  setAgentName(val);
                  try {
                    localStorage.setItem(
                      STORAGE_KEYS.agent_key,
                      JSON.stringify({ name: val, contact: agentContact, email: agentEmail })
                    );
                  } catch {}
                }}
                className="flex-1 th-input border rounded-xl px-3 py-2 font-medium text-xs"
                placeholder="Agent Name"
              />
            </div>

            {/* Email Address directly below Agent Name */}
            <div className="mt-2.5">
              <label className="th-accent font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 text-[11px]">
                <Mail className="w-3.5 h-3.5 th-accent-2" />
                <span>Agent Email Address</span>
              </label>
              <input
                type="email"
                value={agentEmail}
                onChange={(e) => {
                  const val = e.target.value;
                  setAgentEmail(val);
                  try {
                    localStorage.setItem(
                      STORAGE_KEYS.agent_key,
                      JSON.stringify({ name: agentName, contact: agentContact, email: val })
                    );
                  } catch {}
                }}
                className="w-full th-input border rounded-xl px-3 py-2 font-medium text-xs"
                placeholder="agent@motostrada.ph"
              />
            </div>
          </div>

          <div>
            <label className="th-accent font-bold uppercase tracking-wider mb-1 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 th-accent-2" />
                <span>Agent Contact Number</span>
              </span>
              <span className="text-[10px] th-text-muted font-normal">Dropdown</span>
            </label>
            <div className="flex gap-1.5">
              <select
                value={['9914414670', '9761951262', '9263739110', ''].includes(agentContact) ? (agentContact || 'Blank') : 'custom'}
                onChange={(e) => {
                  const sel = e.target.value;
                  if (sel === 'custom') return;
                  const newContact = sel === 'Blank' ? '' : sel;
                  setAgentContact(newContact);
                  try {
                    localStorage.setItem(STORAGE_KEYS.agent_key, JSON.stringify({ name: agentName, contact: newContact, email: agentEmail }));
                  } catch {}
                }}
                className="th-input border rounded-xl px-2.5 py-2 font-mono font-medium text-xs cursor-pointer"
              >
                <option value="9914414670">9914414670</option>
                <option value="9761951262">9761951262</option>
                <option value="9263739110">9263739110</option>
                <option value="Blank">Blank</option>
                {!['9914414670', '9761951262', '9263739110', ''].includes(agentContact) && (
                  <option value="custom">Custom</option>
                )}
              </select>
              <input
                type="text"
                value={agentContact}
                onChange={(e) => {
                  const val = e.target.value;
                  setAgentContact(val);
                  try {
                    localStorage.setItem(STORAGE_KEYS.agent_key, JSON.stringify({ name: agentName, contact: val, email: agentEmail }));
                  } catch {}
                }}
                className="flex-1 th-input border rounded-xl px-3 py-2 font-medium text-xs"
                placeholder="Phone"
              />
            </div>
          </div>

          {/* Financing Partner with Delete / Clear button */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="th-accent font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 th-accent-2" />
                <span>Financing Partner</span>
              </label>
              <button
                type="button"
                onClick={() => setIsAddingPartner(true)}
                className="flex items-center gap-1 text-[11px] th-accent-2 font-bold hover:underline cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Company</span>
              </button>
            </div>

            <div className="flex gap-1.5 items-center">
              <select
                value={financingPartner}
                onChange={(e) => {
                  if (e.target.value === '__ADD_NEW__') {
                    setIsAddingPartner(true);
                  } else {
                    setFinancingPartner(e.target.value);
                  }
                }}
                className="flex-1 th-input border rounded-xl px-3 py-2 font-medium text-xs"
              >
                <option value="">-- [ Blank ] --</option>
                {allPartners.map((partner) => (
                  <option key={partner} value={partner}>
                    {partner} {customPartners.includes(partner) ? '(Custom)' : ''}
                  </option>
                ))}
                <option value="__ADD_NEW__">+ Add Financing Company...</option>
              </select>

              {/* Explicit Delete / Clear Partner Button */}
              <button
                type="button"
                onClick={handleDeletePartner}
                className="p-2 th-badge border rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1 text-xs font-bold hover:opacity-90"
                title="Delete / Clear Financing Partner to Blank"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>

            {partnerNotice && (
              <span className="text-[10px] th-accent block font-semibold">
                ✓ {partnerNotice}
              </span>
            )}
          </div>
        </div>

        {/* Modal / Inline form to Add Custom Financing Partner */}
        {isAddingPartner && (
          <div className="p-4 th-subpanel border rounded-2xl space-y-3 mt-2 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 th-accent-2 font-bold text-xs">
                <Landmark className="w-4 h-4" />
                <span>Add Financing Partner / Institution</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingPartner(false)}
                className="th-text-muted hover:opacity-80 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPartnerName}
                onChange={(e) => setNewPartnerName(e.target.value)}
                placeholder="Enter Financing Company Name..."
                className="flex-1 th-input border rounded-xl px-3 py-2 text-xs"
              />
              <button
                type="button"
                onClick={() => handleAddCustomPartner()}
                className="th-btn-primary font-black px-4 py-2 rounded-xl text-xs cursor-pointer shadow-sm"
              >
                Save Partner
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
