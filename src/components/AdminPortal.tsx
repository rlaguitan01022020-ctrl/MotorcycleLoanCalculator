import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Trash2,
  Bike,
  User,
  PlusCircle,
  ChevronRight,
  LogOut,
  RefreshCw,
  FileSpreadsheet,
  Tag,
  Plus,
  Sparkles,
  Layers,
  DollarSign,
  Gauge,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  SYSTEM_INFO,
  STORAGE_KEYS,
  MOTORCYCLE_BRANDS_LIST,
  ALL_MOTORCYCLES,
} from '../data/motostradaData';
import { LoanApplicationData, MotorcycleModel } from '../types';
import { formatPHP } from '../utils/calculator';

interface AdminPortalProps {
  isLoggedIn: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
  customMotorcycles: MotorcycleModel[];
  onAddMotorcycle: (bike: MotorcycleModel) => void;
  onDeleteMotorcycle: (model: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isLoggedIn,
  onLoginSuccess,
  onLogout,
  customMotorcycles,
  onAddMotorcycle,
  onDeleteMotorcycle,
}) => {
  const [adminTab, setAdminTab] = useState<'applications' | 'inventory'>('applications');

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Applications State
  const [applications, setApplications] = useState<LoanApplicationData[]>([]);
  const [selectedApp, setSelectedApp] = useState<LoanApplicationData | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [appToDelete, setAppToDelete] = useState<string | null>(null);

  // Add Motorcycle State (Brand, Model, CC, Price)
  const [isAddBikeOpen, setIsAddBikeOpen] = useState(false);
  const [bikeBrand, setBikeBrand] = useState('CFMOTO');
  const [customBrandInput, setCustomBrandInput] = useState('');
  const [bikeModel, setBikeModel] = useState('');
  const [bikeCc, setBikeCc] = useState('');
  const [bikePrice, setBikePrice] = useState<number | ''>('');
  const [bikeCategory, setBikeCategory] = useState('');
  const [bikeNotice, setBikeNotice] = useState<string | null>(null);
  const [bikeSearch, setBikeSearch] = useState('');
  const [bikeBrandFilter, setBikeBrandFilter] = useState('All');

  // Load applications from localStorage
  const loadApplications = () => {
    try {
      const dataStr = localStorage.getItem(STORAGE_KEYS.applications_key);
      if (dataStr) {
        setApplications(JSON.parse(dataStr));
      } else {
        setApplications([]);
      }
    } catch (e) {
      console.error('Failed to load applications:', e);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadApplications();
    }
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      usernameInput === SYSTEM_INFO.demo_login.username &&
      passwordInput === SYSTEM_INFO.demo_login.password
    ) {
      onLoginSuccess();
      setLoginError('');
      loadApplications();
    } else {
      setLoginError('Invalid administrator credentials. Please check username and password.');
    }
  };

  const handleSeedDemoData = () => {
    const sample1: any = {
      id: 'MS-2026-89412',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      status: 'Pending',
      modelName: '450CL-C Bobber',
      seriesName: 'CL Series',
      srp: 299900,
      downPayment: 59980,
      downPaymentPercent: 20,
      monthlyAmortization: 11425,
      totalCashOut: 59980,
      agentName: 'Ricardo Valenzuela (Senior Sales Advisor)',
      amountApplied: '₱239,920',
      terms: '36',
      purpose: 'Daily Commute & Leisure Touring',
      lastName: 'Santos',
      firstName: 'Michael',
      middleName: 'Reyes',
      birthday: '1992-06-15',
      birthplace: 'Manila',
      age: 33,
      nationality: 'Filipino',
      civilStatus: 'Married',
      contactNumber: '0917-888-9922',
      housing: 'Own House',
      permanentAddress: 'Blk 12 Lot 4, Santa Cruz, Manila',
      permLength: '12 Years',
      spouseLastName: 'Santos',
      spouseFirstName: 'Maria',
      spouseContact: '0917-888-9923',
      employer: 'Metro Health BPO Solutions',
      employerAddress: 'BGC, Taguig City',
      employerContact: '(02) 8876-5432',
      position: 'Senior Operations Team Lead',
      yearsService: '4 Years',
      salary: 58000,
      otherIncome: 8000,
      totalIncome: 66000,
      livingExpenses: 28000,
      bankName: 'BDO Unibank',
      bankBranch: 'Manila Main',
      accountType: 'Savings Payroll',
      cp1Name: 'Dennis Cruz',
      cp1Contact: '0917-333-4455',
      cp1Position: 'Operations Manager',
      cp2Name: 'Elena Santos',
      cp2Contact: '0918-777-6655',
      cp2Position: 'Sister',
      ref1Name: 'Arturo Morales',
      ref1Rel: 'Colleague',
      ref1Contact: '0917-111-2233',
      ref1Address: 'Manila',
      ref2Name: 'Kagawad Robert Gomez',
      ref2Rel: 'Barangay Official',
      ref2Contact: '0920-444-5566',
      ref2Address: 'Santa Cruz, Manila',
      ref3Name: 'Teresa Lim',
      ref3Rel: 'Friend',
      ref3Contact: '0918-999-0011',
      ref3Address: 'Manila',
    };

    const newApps = [sample1, ...applications];
    setApplications(newApps);
    localStorage.setItem(STORAGE_KEYS.applications_key, JSON.stringify(newApps));
  };

  const handleUpdateStatus = (appId: string, newStatus: LoanApplicationData['status']) => {
    const updated = applications.map((app) =>
      app.id === appId ? { ...app, status: newStatus } : app
    );
    setApplications(updated);
    localStorage.setItem(STORAGE_KEYS.applications_key, JSON.stringify(updated));
    if (selectedApp && selectedApp.id === appId) {
      setSelectedApp({ ...selectedApp, status: newStatus });
    }
  };

  const confirmDeleteApplication = (appId: string) => {
    const updated = applications.filter((app) => app.id !== appId);
    setApplications(updated);
    localStorage.setItem(STORAGE_KEYS.applications_key, JSON.stringify(updated));
    if (selectedApp?.id === appId) {
      setSelectedApp(null);
    }
    setAppToDelete(null);
  };

  const handleExportCSV = () => {
    if (applications.length === 0) return;
    const headers = [
      'Application ID',
      'Date',
      'Status',
      'Applicant Name',
      'Contact',
      'Model',
      'SRP',
      'Down Payment',
      'Terms',
      'Monthly Amortization',
      'Employer',
    ];

    const rows = applications.map((app) => [
      app.id,
      new Date(app.createdAt).toLocaleDateString(),
      app.status,
      `"${app.lastName}, ${app.firstName}"`,
      app.contactNumber,
      app.modelName,
      app.srp,
      app.downPayment,
      app.terms,
      app.monthlyAmortization,
      `"${app.employer || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `loan_applications_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add Motorcycle Handler (Brand, Model, CC, Price)
  const handleAddBikeSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalBrand =
      bikeBrand === 'Other' ? customBrandInput.trim() || 'Custom Brand' : bikeBrand.trim();

    if (!bikeModel.trim() || !bikePrice || Number(bikePrice) <= 0) {
      alert('Please fill in Model and a valid Price (SRP).');
      return;
    }

    const newBike: MotorcycleModel = {
      brand: finalBrand,
      model: bikeModel.trim(),
      displacement: bikeCc.trim() ? `${bikeCc.replace(/cc/i, '').trim()}cc` : '150cc',
      srp: Number(bikePrice),
      series: bikeCategory.trim() || `${finalBrand} Lineup`,
      category: bikeCategory.trim() || 'Motorcycle',
      description: `Official ${finalBrand} ${bikeModel.trim()} with ${bikeCc.trim() || 'standard'} engine displacement.`,
      isCustom: true,
    };

    onAddMotorcycle(newBike);

    setBikeNotice(`Successfully added ${finalBrand} ${newBike.model} (SRP: ${formatPHP(newBike.srp)})!`);
    setTimeout(() => setBikeNotice(null), 3500);

    // Reset Form
    setBikeModel('');
    setBikeCc('');
    setBikePrice('');
    setBikeCategory('');
    setCustomBrandInput('');
    setIsAddBikeOpen(false);
  };

  // Filtered applications
  const filteredApplications = applications.filter((app) => {
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesSearch =
      app.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      app.firstName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      app.modelName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      app.contactNumber.includes(searchFilter);
    return matchesStatus && matchesSearch;
  });

  // All merged motorcycles for inventory view
  const allInventoryBikes = [...customMotorcycles, ...ALL_MOTORCYCLES];

  const filteredInventoryBikes = allInventoryBikes.filter((bike) => {
    const bBrand = bike.brand || 'CFMOTO';
    const matchesBrand = bikeBrandFilter === 'All' || bBrand.toLowerCase() === bikeBrandFilter.toLowerCase();
    const matchesSearch =
      bike.model.toLowerCase().includes(bikeSearch.toLowerCase()) ||
      bBrand.toLowerCase().includes(bikeSearch.toLowerCase()) ||
      (bike.displacement && bike.displacement.toLowerCase().includes(bikeSearch.toLowerCase()));
    return matchesBrand && matchesSearch;
  });

  // Unique brand list in inventory
  const uniqueBrands = ['All', ...Array.from(new Set(allInventoryBikes.map((b) => b.brand || 'CFMOTO')))];

  // Login view if not authenticated
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-white">Underwriting Admin Portal</h2>
            <p className="text-xs text-slate-400">
              Authorized dealership loan management, motorcycle inventory, and credit evaluation.
            </p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300">
            <span className="font-bold">Demo Login Credentials:</span>
            <div className="font-mono mt-1">Username: <strong>admin</strong></div>
            <div className="font-mono">Password: <strong>admin123</strong></div>
          </div>

          {loginError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter admin username"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer text-sm"
            >
              Sign In to Admin Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Admin Top Dashboard Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Underwriting & Inventory Management Portal
            </h2>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              Admin Session
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage credit applications, review underwriting details, and add motorcycle brands and inventory.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {adminTab === 'applications' && applications.length === 0 && (
            <button
              onClick={handleSeedDemoData}
              className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Load Sample Application</span>
            </button>
          )}

          {adminTab === 'inventory' && (
            <button
              onClick={() => setIsAddBikeOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black px-4 py-2 rounded-xl shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Motorcycle (Brand, Model, CC, Price)</span>
            </button>
          )}

          {adminTab === 'applications' && (
            <button
              onClick={handleExportCSV}
              disabled={applications.length === 0}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Admin Mode Switcher Tabs */}
      <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-lg">
        <button
          onClick={() => setAdminTab('applications')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            adminTab === 'applications'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Loan Applications ({applications.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('inventory')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            adminTab === 'inventory'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Motorcycle Inventory & Brands ({allInventoryBikes.length})</span>
          {customMotorcycles.length > 0 && (
            <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
              +{customMotorcycles.length} Custom
            </span>
          )}
        </button>
      </div>

      {/* Feedback banner */}
      {bikeNotice && (
        <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold p-3.5 rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{bikeNotice}</span>
        </div>
      )}

      {/* TAB 1: LOAN APPLICATIONS UNDERWRITING */}
      {adminTab === 'applications' && (
        <div className="space-y-6">
          {/* KPI Stats Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow">
              <span className="text-xs text-slate-400 font-semibold block">Total Applications</span>
              <span className="text-2xl font-black text-white font-mono mt-1 block">
                {applications.length}
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow">
              <span className="text-xs text-amber-400 font-semibold block">Pending Review</span>
              <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
                {applications.filter((a) => a.status === 'Pending').length}
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow">
              <span className="text-xs text-emerald-400 font-semibold block">Approved</span>
              <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">
                {applications.filter((a) => a.status === 'Approved').length}
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow">
              <span className="text-xs text-blue-400 font-semibold block">Under Review</span>
              <span className="text-2xl font-black text-blue-400 font-mono mt-1 block">
                {applications.filter((a) => a.status === 'Under Review').length}
              </span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search by ID, Customer Name, Model or Contact..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Status:</span>
              <div className="flex gap-1 bg-slate-800 p-1 rounded-xl">
                {['All', 'Pending', 'Under Review', 'Approved', 'Rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      statusFilter === status
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Ref Number</th>
                    <th className="py-3 px-4">Date Applied</th>
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Motorcycle Brand & Unit</th>
                    <th className="py-3 px-4">Financed Amt</th>
                    <th className="py-3 px-4">Monthly Amort.</th>
                    <th className="py-3 px-4">Underwriting Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        No loan applications found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">
                          {app.id}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">
                            {app.lastName}, {app.firstName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {app.contactNumber}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{app.modelName}</div>
                          <div className="text-[10px] text-slate-400">{app.seriesName}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-200">
                          {app.amountApplied}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-white">
                          {formatPHP(app.monthlyAmortization)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                              app.status === 'Approved'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : app.status === 'Rejected'
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                : app.status === 'Under Review'
                                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {app.status === 'Approved' && <CheckCircle className="w-3 h-3" />}
                            {app.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                            {app.status === 'Under Review' && <Clock className="w-3 h-3" />}
                            <span>{app.status}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedApp(app)}
                              className="p-1.5 text-slate-300 hover:text-amber-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                              title="Inspect Full Application"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setAppToDelete(app.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                              title="Delete Application"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MOTORCYCLE INVENTORY & BRANDS (ADD BRAND, MODEL, CC, PRICE) */}
      {adminTab === 'inventory' && (
        <div className="space-y-6">
          {/* Quick Header Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Bike className="w-5 h-5 text-amber-400" />
                <span>Motorcycle Brand & Model Inventory</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Add any Motorcycle Brand, Model, CC, and Price / SRP to display instantly in the Loan Calculator, Quotation, and Catalog.
              </p>
            </div>

            <button
              onClick={() => setIsAddBikeOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Motorcycle Brand, Model, CC, Price</span>
            </button>
          </div>

          {/* Search & Brand Filter for Inventory */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={bikeSearch}
                onChange={(e) => setBikeSearch(e.target.value)}
                placeholder="Search by Model, Brand (Honda, CFMOTO, Yamaha) or CC..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Filter Brand:</span>
              <select
                value={bikeBrandFilter}
                onChange={(e) => setBikeBrandFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
              >
                {uniqueBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Brand</th>
                    <th className="py-3 px-4">Model Name</th>
                    <th className="py-3 px-4">Displacement (CC)</th>
                    <th className="py-3 px-4">Category / Series</th>
                    <th className="py-3 px-4">Price (SRP)</th>
                    <th className="py-3 px-4">Origin</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-sans">
                  {filteredInventoryBikes.map((bike, idx) => {
                    const bBrand = bike.brand || 'CFMOTO';

                    return (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-amber-400 font-mono">
                          {bBrand}
                        </td>
                        <td className="py-3 px-4 font-bold text-white">
                          {bike.model}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {bike.displacement || '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {bike.category || bike.series}
                        </td>
                        <td className="py-3 px-4 font-mono font-black text-emerald-400">
                          {formatPHP(bike.srp)}
                        </td>
                        <td className="py-3 px-4">
                          {bike.isCustom ? (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                              Custom Added
                            </span>
                          ) : (
                            <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full font-medium">
                              Standard Catalog
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {bike.isCustom ? (
                            <button
                              onClick={() => onDeleteMotorcycle(bike.model)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                              title="Delete Custom Motorcycle"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD MOTORCYCLE (BRAND, MODEL, CC, PRICE) */}
      {isAddBikeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-750 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Add Motorcycle to Lineup</h3>
                  <p className="text-xs text-slate-400">
                    Add new Motorcycle Brand, Model, CC, and Price / SRP
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddBikeOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddBikeSubmit} className="space-y-4 text-xs">
              {/* 1. Motorcycle Brand */}
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Motorcycle Brand</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={bikeBrand}
                    onChange={(e) => setBikeBrand(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
                  >
                    {MOTORCYCLE_BRANDS_LIST.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                    <option value="Other">+ Type Custom Brand...</option>
                  </select>

                  {bikeBrand === 'Other' && (
                    <input
                      type="text"
                      required
                      value={customBrandInput}
                      onChange={(e) => setCustomBrandInput(e.target.value)}
                      placeholder="Enter Brand Name (e.g. Royal Enfield)"
                      className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  )}
                </div>
              </div>

              {/* 2. Model */}
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Bike className="w-3.5 h-3.5 text-amber-400" />
                  <span>Motorcycle Model</span>
                </label>
                <input
                  type="text"
                  required
                  value={bikeModel}
                  onChange={(e) => setBikeModel(e.target.value)}
                  placeholder="e.g. CBR500R, NMAX 155, 450SR, Ninja 400"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 3. CC / Displacement & Price / SRP Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CC / Displacement */}
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-amber-400" />
                    <span>Displacement (CC)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bikeCc}
                    onChange={(e) => setBikeCc(e.target.value)}
                    placeholder="e.g. 450cc, 155cc, 650cc"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Price / SRP */}
                <div>
                  <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                    <span>Price / SRP (PHP ₱)</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={bikePrice}
                    onChange={(e) => setBikePrice(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 299900"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 4. Category / Series (Optional) */}
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Category / Series (Optional)</span>
                </label>
                <input
                  type="text"
                  value={bikeCategory}
                  onChange={(e) => setBikeCategory(e.target.value)}
                  placeholder="e.g. Supersport, Scooter, Naked, Cruiser, Adventure"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddBikeOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Motorcycle to Inventory</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: APPLICATION INSPECTION DETAILS */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Application Dossier
                </span>
                <h3 className="text-xl font-black text-white font-mono">
                  {selectedApp.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="bg-slate-800/60 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 block">Current Underwriting Decision:</span>
                <span className="text-sm font-bold text-white">{selectedApp.status}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {(['Pending', 'Under Review', 'Approved', 'Rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedApp.id, st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedApp.status === st
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Set {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Application Sections */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-xs">
              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-amber-400 font-bold uppercase tracking-wider block">
                  1. Loan & Motorcycle Target
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Model:</span>
                    <span className="text-white font-bold">{selectedApp.modelName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">SRP:</span>
                    <span className="text-white">{formatPHP(selectedApp.srp)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Term:</span>
                    <span className="text-white">{selectedApp.terms} Mos</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Monthly Amort:</span>
                    <span className="text-amber-400 font-bold">
                      {formatPHP(selectedApp.monthlyAmortization)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-amber-400 font-bold uppercase tracking-wider block">
                  2. Personal Identification
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Applicant Name:</span>
                    <span className="text-white font-bold">
                      {selectedApp.lastName}, {selectedApp.firstName} {selectedApp.middleName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Contact Number:</span>
                    <span className="text-white font-mono">{selectedApp.contactNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Civil Status / Age:</span>
                    <span className="text-white">{selectedApp.civilStatus} • Age {selectedApp.age}</span>
                  </div>
                  <div className="sm:col-span-3">
                    <span className="text-slate-400 block text-[10px]">Permanent Address:</span>
                    <span className="text-slate-200">{selectedApp.permanentAddress} ({selectedApp.permLength})</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-amber-400 font-bold uppercase tracking-wider block">
                  3. Income & Employment Verification
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Employer / Business:</span>
                    <span className="text-white font-sans">{selectedApp.employer || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Position / Tenure:</span>
                    <span className="text-white font-sans">{selectedApp.position} ({selectedApp.yearsService || selectedApp.yearsBusiness || 'Standard'})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Declared Monthly Salary:</span>
                    <span className="text-emerald-400 font-bold">
                      {selectedApp.salary ? formatPHP(Number(selectedApp.salary)) : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedApp(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {appToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <h4 className="text-base font-black text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-400" />
              <span>Confirm Application Deletion</span>
            </h4>
            <p className="text-xs text-slate-300">
              Are you sure you want to permanently delete application{' '}
              <strong className="text-amber-400 font-mono">{appToDelete}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setAppToDelete(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDeleteApplication(appToDelete)}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
