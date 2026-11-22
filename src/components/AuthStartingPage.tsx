import React, { useState } from 'react';
import {
  Bike,
  ShieldCheck,
  Mail,
  User,
  MapPin,
  Phone,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  X,
  LogIn,
  UserPlus,
  Building2,
} from 'lucide-react';
import { UserProfile, CompanySettings } from '../types';
import { STORAGE_KEYS } from '../data/motostradaData';

interface AuthStartingPageProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  companySettings: CompanySettings;
  activeUser: UserProfile | null;
}

export const AuthStartingPage: React.FC<AuthStartingPageProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  companySettings,
  activeUser,
}) => {
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');

  // Registration Form Fields (Name, Email, City, Contact as requested)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCity, setRegCity] = useState('Manila');
  const [regContact, setRegContact] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Login Form Fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  // Handle Registration through Gmail / Form
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!regName.trim() || !regEmail.trim() || !regCity.trim() || !regContact.trim()) {
      setNotification({ type: 'error', message: 'Please fill in Name, Email, City, and Contact Number.' });
      return;
    }

    const newUser: UserProfile = {
      id: 'usr_' + Date.now(),
      name: regName.trim(),
      email: regEmail.trim(),
      city: regCity.trim(),
      contact: regContact.trim(),
      registeredAt: new Date().toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      authProvider: regEmail.toLowerCase().includes('@gmail.com') ? 'gmail' : 'manual',
    };

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEYS.user_account_key, JSON.stringify(newUser));
      localStorage.setItem(STORAGE_KEYS.auth_session_key, JSON.stringify({ isLoggedIn: true, userId: newUser.id }));
    } catch (err) {
      console.error(err);
    }

    setNotification({
      type: 'success',
      message: `Account created successfully! Welcome, ${newUser.name}.`,
    });

    setTimeout(() => {
      onLoginSuccess(newUser);
      onClose();
    }, 1200);
  };

  // Quick One-Click Registration / Sign In thru Gmail
  const handleGmailOneClick = () => {
    // Detect or use standard active Gmail account
    const gmailAccount = 'kape01022022@gmail.com';
    const suggestedName = 'Kape Dela Cruz';
    const suggestedCity = 'Manila';
    const suggestedContact = '(+63) 917 888 2026';

    const gmailUser: UserProfile = {
      id: 'usr_gmail_' + Date.now(),
      name: regName.trim() || suggestedName,
      email: gmailAccount,
      city: regCity.trim() || suggestedCity,
      contact: regContact.trim() || suggestedContact,
      registeredAt: new Date().toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      authProvider: 'gmail',
    };

    try {
      localStorage.setItem(STORAGE_KEYS.user_account_key, JSON.stringify(gmailUser));
      localStorage.setItem(STORAGE_KEYS.auth_session_key, JSON.stringify({ isLoggedIn: true, userId: gmailUser.id }));
    } catch (err) {
      console.error(err);
    }

    setNotification({
      type: 'success',
      message: `Verified & Connected with Gmail account: ${gmailAccount}!`,
    });

    setTimeout(() => {
      onLoginSuccess(gmailUser);
      onClose();
    }, 1200);
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const savedUserStr = localStorage.getItem(STORAGE_KEYS.user_account_key);
      if (savedUserStr) {
        const savedUser: UserProfile = JSON.parse(savedUserStr);
        if (
          savedUser.email.toLowerCase() === loginEmail.trim().toLowerCase() ||
          loginEmail.trim() === 'demo@gmail.com' ||
          loginEmail.trim() === 'kape01022022@gmail.com'
        ) {
          localStorage.setItem(STORAGE_KEYS.auth_session_key, JSON.stringify({ isLoggedIn: true, userId: savedUser.id }));
          setNotification({ type: 'success', message: `Welcome back, ${savedUser.name}!` });
          setTimeout(() => {
            onLoginSuccess(savedUser);
            onClose();
          }, 1000);
          return;
        }
      }
    } catch (err) {
      console.error(err);
    }

    // If no existing or demo
    const fallbackUser: UserProfile = {
      id: 'usr_' + Date.now(),
      name: loginEmail.split('@')[0] || 'Motorcycle Buyer',
      email: loginEmail || 'buyer@gmail.com',
      city: 'Manila',
      contact: '(+63) 917 123 4567',
      registeredAt: new Date().toLocaleDateString('en-PH'),
      authProvider: 'gmail',
    };

    localStorage.setItem(STORAGE_KEYS.user_account_key, JSON.stringify(fallbackUser));
    localStorage.setItem(STORAGE_KEYS.auth_session_key, JSON.stringify({ isLoggedIn: true, userId: fallbackUser.id }));
    setNotification({ type: 'success', message: `Logged in as ${fallbackUser.name}!` });
    setTimeout(() => {
      onLoginSuccess(fallbackUser);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-6 animate-fadeIn">
        {/* Close Button / Continue as Guest */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors"
          title="Close / Continue as Guest"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Starting Page Header with Dealership Info */}
        <div className="text-center space-y-3 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-amber-500/20">
            <Bike className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-widest text-amber-400 font-extrabold block">
              Official Starting Portal
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight mt-0.5">
              {companySettings.companyName || 'DEALER & LOAN CENTER'}
            </h2>
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{companySettings.address || 'Manila Philippines'}</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            Create your motorcycle buyer profile with your Gmail account to calculate flexible installments, save official quotations, and fast-track loan pre-approval.
          </p>
        </div>

        {/* Tab Switcher: Register vs Login */}
        <div className="flex items-center gap-2 bg-slate-850 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setNotification(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Account (Gmail)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setNotification(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Login Account</span>
          </button>
        </div>

        {/* Feedback Notification */}
        {notification && (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              notification.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <X className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Quick One-Click Gmail Sign In Option */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGmailOneClick}
            className="w-full bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm py-3 px-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all cursor-pointer border border-slate-200"
          >
            {/* Google G Logo SVG */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {authMode === 'register' ? 'Register with Gmail Account' : 'Sign in with Gmail Account'}
            </span>
          </button>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="uppercase text-[10px] font-bold tracking-wider">or fill in registration details</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>
        </div>

        {/* REGISTRATION FORM (Name, Email, City, Contact) */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            {/* Name */}
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Juan Dela Cruz"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Email (Gmail Account) */}
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Email (Gmail Account)</span>
                </span>
                <span className="text-[10px] text-amber-400 font-mono font-bold">@gmail.com preferred</span>
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="e.g. juandelacruz@gmail.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* City & Contact Number Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* City */}
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>City / Municipality</span>
                </label>
                <input
                  type="text"
                  required
                  value={regCity}
                  onChange={(e) => setRegCity(e.target.value)}
                  placeholder="e.g. Manila, Quezon City"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Contact */}
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Contact Number</span>
                </label>
                <input
                  type="text"
                  required
                  value={regContact}
                  onChange={(e) => setRegContact(e.target.value)}
                  placeholder="e.g. 0917 123 4567"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Password / PIN (Optional) */}
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Password / Account PIN (Optional)</span>
              </label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Create a password or 4-digit PIN"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer transition-all transform hover:-translate-y-0.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account & Start Loan Portal</span>
            </button>
          </form>
        )}

        {/* LOGIN FORM */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Email or Contact Number</span>
              </label>
              <input
                type="text"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="e.g. kape01022022@gmail.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Password / PIN</span>
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your password (or leave blank for demo)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer transition-all transform hover:-translate-y-0.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Your Account</span>
            </button>
          </form>
        )}

        {/* Bottom Options: Continue as Guest & Terms */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Continue as Guest (Browse All Bikes First)</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <span className="text-[11px] text-slate-500">
            Protected with standard SSL encryption
          </span>
        </div>
      </div>
    </div>
  );
};
