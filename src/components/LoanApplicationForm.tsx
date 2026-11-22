import React, { useState } from 'react';
import {
  ClipboardCheck,
  User,
  Users,
  Briefcase,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Printer,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Home,
  Heart,
  UserCheck,
  Trash2,
} from 'lucide-react';
import { STORAGE_KEYS, SYSTEM_INFO } from '../data/motostradaData';
import { LoanApplicationData, LoanCalculationResult } from '../types';
import { formatPHP } from '../utils/calculator';

interface LoanApplicationFormProps {
  modelName: string;
  seriesName: string;
  calculation: LoanCalculationResult;
  onApplicationSubmitted: () => void;
}

export const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({
  modelName,
  seriesName,
  calculation,
  onApplicationSubmitted,
}) => {
  // Form State initialized with defaults
  const [formData, setFormData] = useState<Partial<LoanApplicationData>>({
    // Agent
    agentName: '',

    // Loan Details prefilled from calculator
    amountApplied: formatPHP(calculation.financedAmount),
    terms: `${calculation.termMonths} Months`,
    purpose: 'Personal Motorcycle / Daily Commute & Leisure',

    // Personal Info
    lastName: '',
    firstName: '',
    middleName: '',
    birthday: '',
    birthplace: '',
    age: '',
    nationality: 'Filipino',
    civilStatus: 'Single',
    contactNumber: '',
    housing: 'Own House',
    rentAddress: '',
    rentLength: '',
    permanentAddress: '',
    permLength: '5 years',

    // Parents Info
    mother: '',
    motherAge: '',
    father: '',
    fatherAge: '',

    // Dependents
    dependents: 0,
    dep1Name: '',
    dep1Age: '',
    dep1School: '',
    dep2Name: '',
    dep2Age: '',
    dep2School: '',

    // Spouse / Co-borrower
    spSurname: '',
    spFirst: '',
    spMiddle: '',
    spBirthday: '',
    spAge: '',
    spContact: '',

    // Employment
    employer: '',
    position: '',
    nature: '',
    yearsBusiness: '',
    office: '',

    // Contact Persons
    cp1Name: '',
    cp1Contact: '',
    cp1Position: '',
    cp2Name: '',
    cp2Contact: '',
    cp2Position: '',

    // 3 Character References
    ref1Name: '',
    ref1Rel: 'Friend',
    ref1Contact: '',
    ref1Address: '',

    ref2Name: '',
    ref2Rel: 'Colleague',
    ref2Contact: '',
    ref2Address: '',

    ref3Name: '',
    ref3Rel: 'Neighbor',
    ref3Contact: '',
    ref3Address: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedRefCode, setSubmittedRefCode] = useState('');

  const handleInputChange = (field: keyof LoanApplicationData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Demo auto-fill for testing/reviewing
  const handleAutoFillDemo = () => {
    setFormData((prev) => ({
      ...prev,
      agentName: 'Ricardo Valenzuela (Senior Sales Advisor)',
      amountApplied: formatPHP(calculation.financedAmount),
      terms: `${calculation.termMonths} Months`,
      purpose: 'Motorcycle Commute & Weekend Riding',
      lastName: 'Santillan',
      firstName: 'Marco',
      middleName: 'Reyes',
      birthday: '1995-04-18',
      birthplace: 'Quezon City',
      age: 31,
      nationality: 'Filipino',
      civilStatus: 'Married',
      contactNumber: '0917-889-4321',
      housing: 'Own House',
      permanentAddress: '124 Sampaguita St., Brgy. Sto. Domingo, Quezon City',
      permLength: '8 years',
      mother: 'Elena Reyes Santillan',
      motherAge: 58,
      father: 'Roberto Santillan',
      fatherAge: 62,
      dependents: 1,
      dep1Name: 'Leo Santillan',
      dep1Age: 6,
      dep1School: 'Sto. Domingo Elementary School',
      spSurname: 'Santillan',
      spFirst: 'Patricia',
      spMiddle: 'Cruz',
      spBirthday: '1996-09-12',
      spAge: 30,
      spContact: '0918-555-1234',
      employer: 'TechCorp Solutions Philippines Inc.',
      position: 'Senior Logistics Specialist',
      nature: 'IT & Transportation Logistics',
      yearsBusiness: '4 Years',
      office: '(02) 8888-7654',
      cp1Name: 'Dennis Tan',
      cp1Contact: '0917-111-2233',
      cp1Position: 'Operations Manager',
      cp2Name: 'Rowena Diaz',
      cp2Contact: '0920-333-4455',
      cp2Position: 'HR Supervisor',
      ref1Name: 'Carlos Mendoza',
      ref1Rel: 'Longtime Friend',
      ref1Contact: '0917-444-5566',
      ref1Address: 'Caloocan City',
      ref2Name: 'Aileen Gomez',
      ref2Rel: 'Colleague',
      ref2Contact: '0922-777-8899',
      ref2Address: 'Quezon City',
      ref3Name: 'Vicente Santos',
      ref3Rel: 'Barangay Kagawad',
      ref3Contact: '0919-666-3322',
      ref3Address: 'Sto. Domingo, QC',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const refCode = `APP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const newApplication: LoanApplicationData = {
      id: refCode,
      createdAt: new Date().toISOString(),
      status: 'Pending',
      modelName,
      seriesName,
      srp: calculation.srp,
      downPayment: calculation.downPaymentAmount,
      downPaymentPercent: calculation.downPaymentPercent,
      monthlyAmortization: calculation.monthlyAmortization,
      totalCashOut: calculation.totalCashOut,

      agentName: String(formData.agentName || ''),

      amountApplied: String(formData.amountApplied || formatPHP(calculation.financedAmount)),
      terms: String(formData.terms || `${calculation.termMonths} Months`),
      purpose: String(formData.purpose || 'Personal Motorcycle'),

      lastName: String(formData.lastName || 'Applicant'),
      firstName: String(formData.firstName || 'Valued'),
      middleName: String(formData.middleName || ''),
      birthday: String(formData.birthday || ''),
      birthplace: String(formData.birthplace || ''),
      age: formData.age || '',
      nationality: String(formData.nationality || 'Filipino'),
      civilStatus: String(formData.civilStatus || 'Single'),
      contactNumber: String(formData.contactNumber || ''),
      housing: String(formData.housing || 'Own House'),
      rentAddress: formData.rentAddress,
      rentLength: formData.rentLength,
      permanentAddress: String(formData.permanentAddress || ''),
      permLength: String(formData.permLength || ''),

      mother: String(formData.mother || ''),
      motherAge: formData.motherAge || '',
      father: String(formData.father || ''),
      fatherAge: formData.fatherAge || '',

      dependents: formData.dependents || 0,
      dep1Name: formData.dep1Name,
      dep1Age: formData.dep1Age,
      dep1School: formData.dep1School,
      dep2Name: formData.dep2Name,
      dep2Age: formData.dep2Age,
      dep2School: formData.dep2School,

      spSurname: formData.spSurname,
      spFirst: formData.spFirst,
      spMiddle: formData.spMiddle,
      spBirthday: formData.spBirthday,
      spAge: formData.spAge,
      spContact: formData.spContact,

      employer: String(formData.employer || ''),
      position: String(formData.position || ''),
      nature: String(formData.nature || ''),
      yearsBusiness: String(formData.yearsBusiness || ''),
      office: String(formData.office || ''),

      cp1Name: String(formData.cp1Name || ''),
      cp1Contact: String(formData.cp1Contact || ''),
      cp1Position: String(formData.cp1Position || ''),
      cp2Name: String(formData.cp2Name || ''),
      cp2Contact: String(formData.cp2Contact || ''),
      cp2Position: String(formData.cp2Position || ''),

      ref1Name: String(formData.ref1Name || ''),
      ref1Rel: String(formData.ref1Rel || ''),
      ref1Contact: String(formData.ref1Contact || ''),
      ref1Address: String(formData.ref1Address || ''),

      ref2Name: String(formData.ref2Name || ''),
      ref2Rel: String(formData.ref2Rel || ''),
      ref2Contact: String(formData.ref2Contact || ''),
      ref2Address: String(formData.ref2Address || ''),

      ref3Name: String(formData.ref3Name || ''),
      ref3Rel: String(formData.ref3Rel || ''),
      ref3Contact: String(formData.ref3Contact || ''),
      ref3Address: String(formData.ref3Address || ''),
    };

    // Save to localStorage 'ms_apps'
    try {
      const existingStr = localStorage.getItem(STORAGE_KEYS.applications_key);
      const existing: LoanApplicationData[] = existingStr ? JSON.parse(existingStr) : [];
      existing.unshift(newApplication);
      localStorage.setItem(STORAGE_KEYS.applications_key, JSON.stringify(existing));
    } catch (err) {
      console.error('Error saving application to storage:', err);
    }

    setSubmittedRefCode(refCode);
    setIsSubmitted(true);
    onApplicationSubmitted();
  };

  if (isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-6">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/50">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Loan Application Submitted Successfully!
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Your application for the <strong className="text-amber-400">{modelName}</strong> has been securely transmitted to the credit verification department.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 max-w-md mx-auto text-left space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Application Reference No:</span>
              <span className="text-amber-400 font-bold text-sm">{submittedRefCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Unit Applied:</span>
              <span className="text-white font-bold">{modelName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Est. Monthly Amortization:</span>
              <span className="text-amber-400 font-bold">{formatPHP(calculation.monthlyAmortization)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Term:</span>
              <span className="text-white">{calculation.termMonths} Months</span>
            </div>
          </div>

          {/* Next steps notice */}
          <div className="text-xs text-slate-400 text-left bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl space-y-1">
            <span className="font-bold text-amber-400 block uppercase tracking-wider text-[11px]">
              Next Steps for Release:
            </span>
            <p>1. Our credit investigator will call your contact numbers within 24-48 business hours.</p>
            <p>2. Please prepare your 2 valid government IDs, proof of billing, and 2 months proof of income.</p>
            <p>3. You can review and manage this application under the Admin Portal.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-700 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Application Slip</span>
            </button>
            <button
              onClick={() => setIsSubmitted(false)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Submit Another Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Official Dealership Loan Application</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Motorcycle Loan Application Form
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Applying for: <strong className="text-amber-400">{modelName}</strong> ({seriesName}) • SRP: {formatPHP(calculation.srp)}
          </p>
        </div>

        {/* Demo Fast Fill Button */}
        <button
          type="button"
          onClick={handleAutoFillDemo}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold px-4 py-2.5 rounded-xl border border-amber-500/30 shadow-md cursor-pointer transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>Auto-Fill Sample Data</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: LOAN DETAILS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-amber-400 font-bold text-sm uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>1. Loan Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Name of Agent with Delete Agent Name button */}
            <div className="sm:col-span-3 bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Name of Agent / Sales Representative</span>
                </label>
                {formData.agentName && (
                  <button
                    type="button"
                    onClick={() => handleInputChange('agentName', '')}
                    className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-bold px-2.5 py-1 rounded-lg border border-rose-500/30 hover:bg-rose-500/10 cursor-pointer transition-colors"
                    title="Clear / Delete Agent Name"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Agent Name</span>
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={formData.agentName || ''}
                  onChange={(e) => handleInputChange('agentName', e.target.value)}
                  placeholder="Enter Name of Agent (e.g. Ricardo Valenzuela)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Amount Applied (Financed Amount)
              </label>
              <input
                type="text"
                required
                value={formData.amountApplied}
                onChange={(e) => handleInputChange('amountApplied', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Terms (Months)
              </label>
              <input
                type="text"
                required
                value={formData.terms}
                onChange={(e) => handleInputChange('terms', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Purpose
              </label>
              <input
                type="text"
                required
                value={formData.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                placeholder="e.g. Daily Commute, Delivery, Leisure"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: PERSONAL INFORMATION */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-amber-400 font-bold text-sm uppercase tracking-wider">
            <User className="w-4 h-4" />
            <span>2. Personal Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Middle Name
              </label>
              <input
                type="text"
                value={formData.middleName}
                onChange={(e) => handleInputChange('middleName', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Birthday *
              </label>
              <input
                type="date"
                required
                value={formData.birthday}
                onChange={(e) => handleInputChange('birthday', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Birthplace
              </label>
              <input
                type="text"
                value={formData.birthplace}
                onChange={(e) => handleInputChange('birthplace', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Age
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Nationality
              </label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Civil Status
              </label>
              <select
                value={formData.civilStatus}
                onChange={(e) => handleInputChange('civilStatus', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Separated">Separated</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Contact Number *
              </label>
              <input
                type="text"
                required
                value={formData.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                placeholder="09xx-xxx-xxxx"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Own House or Renting?
              </label>
              <select
                value={formData.housing}
                onChange={(e) => handleInputChange('housing', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Own House">Own House</option>
                <option value="Renting">Renting</option>
                <option value="Living with Parents/Relatives">Living with Parents/Relatives</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Permanent Address *
              </label>
              <input
                type="text"
                required
                value={formData.permanentAddress}
                onChange={(e) => handleInputChange('permanentAddress', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Length of Stay (Permanent Address)
              </label>
              <input
                type="text"
                value={formData.permLength}
                onChange={(e) => handleInputChange('permLength', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {formData.housing === 'Renting' && (
              <>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    If Renting, Complete Address
                  </label>
                  <input
                    type="text"
                    value={formData.rentAddress}
                    onChange={(e) => handleInputChange('rentAddress', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Renting Length of Stay
                  </label>
                  <input
                    type="text"
                    value={formData.rentLength}
                    onChange={(e) => handleInputChange('rentLength', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* SECTION 3: PARENTS' INFORMATION */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-amber-400 font-bold text-sm uppercase tracking-wider">
            <Heart className="w-4 h-4" />
            <span>3. Parents' Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Mother's Full Maiden Name
              </label>
              <input
                type="text"
                value={formData.mother}
                onChange={(e) => handleInputChange('mother', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Age
              </label>
              <input
                type="number"
                value={formData.motherAge}
                onChange={(e) => handleInputChange('motherAge', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Father's Full Name
              </label>
              <input
                type="text"
                value={formData.father}
                onChange={(e) => handleInputChange('father', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Age
              </label>
              <input
                type="number"
                value={formData.fatherAge}
                onChange={(e) => handleInputChange('fatherAge', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: DEPENDENTS / CHILDREN */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-amber-400 font-bold text-sm uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>4. Dependents / Children</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Number of Dependents
              </label>
              <input
                type="number"
                value={formData.dependents}
                onChange={(e) => handleInputChange('dependents', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                1. Child Name
              </label>
              <input
                type="text"
                value={formData.dep1Name}
                onChange={(e) => handleInputChange('dep1Name', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Age
              </label>
              <input
                type="number"
                value={formData.dep1Age}
                onChange={(e) => handleInputChange('dep1Age', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Grade Level & School Name
              </label>
              <input
                type="text"
                value={formData.dep1School}
                onChange={(e) => handleInputChange('dep1School', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                2. Child Name
              </label>
              <input
                type="text"
                value={formData.dep2Name}
                onChange={(e) => handleInputChange('dep2Name', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Age
              </label>
              <input
                type="number"
                value={formData.dep2Age}
                onChange={(e) => handleInputChange('dep2Age', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Grade Level & School Name
              </label>
              <input
                type="text"
                value={formData.dep2School}
                onChange={(e) => handleInputChange('dep2School', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: SPOUSE / CO-BORROWER (if applicable) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-amber-400 font-bold text-sm uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>5. Spouse / Co-Borrower (if applicable)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Surname
              </label>
              <input
                type="text"
                value={formData.spSurname}
                onChange={(e) => handleInputChange('spSurname', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                First Name
              </label>
              <input
                type="text"
                value={formData.spFirst}
                onChange={(e) => handleInputChange('spFirst', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Middle Name
              </label>
              <input
                type="text"
                value={formData.spMiddle}
                onChange={(e) => handleInputChange('spMiddle', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Birthday
              </label>
              <input
                type="date"
                value={formData.spBirthday}
                onChange={(e) => handleInputChange('spBirthday', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Age
              </label>
              <input
                type="number"
                value={formData.spAge}
                onChange={(e) => handleInputChange('spAge', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Contact Number
              </label>
              <input
                type="text"
                value={formData.spContact}
                onChange={(e) => handleInputChange('spContact', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 6: EMPLOYMENT / BUSINESS DETAILS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-amber-400 font-bold text-sm uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            <span>6. Employment / Business Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Employer / Business Name *
              </label>
              <input
                type="text"
                required
                value={formData.employer}
                onChange={(e) => handleInputChange('employer', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Position *
              </label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Nature of Business
              </label>
              <input
                type="text"
                value={formData.nature}
                onChange={(e) => handleInputChange('nature', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Total Years Employed / In Business
              </label>
              <input
                type="text"
                value={formData.yearsBusiness}
                onChange={(e) => handleInputChange('yearsBusiness', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Office / Landline Number
              </label>
              <input
                type="text"
                value={formData.office}
                onChange={(e) => handleInputChange('office', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 7: CONTACT PERSONS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-amber-400 font-bold text-sm uppercase tracking-wider">
            <PhoneCall className="w-4 h-4" />
            <span>7. Contact Persons</span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  1. Contact Person Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cp1Name}
                  onChange={(e) => handleInputChange('cp1Name', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Contact Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cp1Contact}
                  onChange={(e) => handleInputChange('cp1Contact', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Position / Relation
                </label>
                <input
                  type="text"
                  value={formData.cp1Position}
                  onChange={(e) => handleInputChange('cp1Position', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  2. Contact Person Name
                </label>
                <input
                  type="text"
                  value={formData.cp2Name}
                  onChange={(e) => handleInputChange('cp2Name', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={formData.cp2Contact}
                  onChange={(e) => handleInputChange('cp2Contact', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Position / Relation
                </label>
                <input
                  type="text"
                  value={formData.cp2Position}
                  onChange={(e) => handleInputChange('cp2Position', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 8: THREE (3) CHARACTER REFERENCES */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-amber-400 font-bold text-sm uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>8. Three (3) Character References</span>
          </div>

          <div className="space-y-4">
            {/* Ref 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  1. Reference Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ref1Name}
                  onChange={(e) => handleInputChange('ref1Name', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Relation *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ref1Rel}
                  onChange={(e) => handleInputChange('ref1Rel', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Contact Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ref1Contact}
                  onChange={(e) => handleInputChange('ref1Contact', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.ref1Address}
                  onChange={(e) => handleInputChange('ref1Address', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            {/* Ref 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  2. Reference Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ref2Name}
                  onChange={(e) => handleInputChange('ref2Name', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Relation *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ref2Rel}
                  onChange={(e) => handleInputChange('ref2Rel', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Contact Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ref2Contact}
                  onChange={(e) => handleInputChange('ref2Contact', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.ref2Address}
                  onChange={(e) => handleInputChange('ref2Address', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            {/* Ref 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  3. Reference Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ref3Name}
                  onChange={(e) => handleInputChange('ref3Name', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Relation *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ref3Rel}
                  onChange={(e) => handleInputChange('ref3Rel', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Contact Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ref3Contact}
                  onChange={(e) => handleInputChange('ref3Contact', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.ref3Address}
                  onChange={(e) => handleInputChange('ref3Address', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Certification & Submit Button */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
          <p className="text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed">
            I hereby certify that all statements made in this loan application form are true, correct, and complete. I authorize the dealership and its authorized financing partners to conduct credit checks and verify all submitted references and information.
          </p>

          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm sm:text-base py-3.5 px-8 rounded-xl shadow-xl shadow-amber-500/25 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <FileCheck className="w-5 h-5" />
            <span>Submit Official Loan Application</span>
          </button>
        </div>
      </form>
    </div>
  );
};
