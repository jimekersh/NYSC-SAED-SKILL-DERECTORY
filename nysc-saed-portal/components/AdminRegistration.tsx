
import React, { useState, useEffect } from 'react';
import { NYSC_LOGO_URL, NYSC_LOGO_BACKUP, COLORS } from '../constants';
import { fetchUsersByRole } from '../services/supabaseService';

interface RegistrationProps {
  onComplete: (data: any, mode: 'LOGIN' | 'SIGNUP') => void;
  onDemo?: () => void;
  adminExists: boolean;
}

const AdminRegistration: React.FC<RegistrationProps> = ({ onComplete, onDemo, adminExists }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>(adminExists ? 'LOGIN' : 'SIGNUP');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [forceEnableSignup, setForceEnableSignup] = useState(false);
  const [showStuckHelper, setShowStuckHelper] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    securityKey: '',
  });
  
  const [showHelper, setShowHelper] = useState(false);
  const [registeredAdmins, setRegisteredAdmins] = useState<any[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  // Safety timer to show a "Stuck?" message if verification takes more than 7 seconds
  useEffect(() => {
    let timer: any;
    if (isSubmitting) {
      timer = setTimeout(() => setShowStuckHelper(true), 7000);
    } else {
      setShowStuckHelper(false);
    }
    return () => clearTimeout(timer);
  }, [isSubmitting]);

  useEffect(() => {
    if (adminExists && !forceEnableSignup) {
      setMode('LOGIN');
    }
  }, [adminExists, forceEnableSignup]);

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== NYSC_LOGO_BACKUP) {
      target.src = NYSC_LOGO_BACKUP;
    }
  };

  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const admins = await fetchUsersByRole('ADMIN');
      setRegisteredAdmins(admins || []);
    } catch (err) {
      console.error("Failed to fetch admin list", err);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const toggleHelper = () => {
    const newStatus = !showHelper;
    setShowHelper(newStatus);
    if (newStatus) fetchAdmins();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await onComplete(formData, mode);
    } catch (err: any) {
      console.error("Admin Registration UI Error:", err);
      if (err.message?.includes('fetch')) {
        setAuthError("Network Failure: Your Supabase project might be paused. Log in to Supabase.com to wake it up.");
      } else if (err.message?.includes('profiles') || err.message?.includes('relation')) {
        setAuthError("Database Schema Error: The 'profiles' table is missing. Use the Setup Wizard below.");
      } else {
        setAuthError(err.message || "Authentication failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualReset = () => {
    setIsSubmitting(false);
    setShowStuckHelper(false);
    setAuthError("Verification cancelled. Please ensure your database is active.");
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-[#020617] rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] border border-gray-800 overflow-hidden grid md:grid-cols-2 min-h-[600px]">
        {/* Left Side Branding */}
        <div className="bg-[#008751] p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40 blur-3xl"></div>
          <div className="relative z-10">
            <div className="bg-white p-4 rounded-3xl shadow-2xl mb-8 w-24 h-24 flex items-center justify-center">
               <img src={NYSC_LOGO_URL} className="w-16 h-16 object-contain" alt="NYSC" onError={handleImgError} />
            </div>
            <h2 className="text-3xl font-black mb-4 tracking-tighter">National Command Center</h2>
            <p className="text-green-100 font-bold text-sm leading-relaxed mb-10 opacity-80">
              Administrative portal for system architects. Valid security keys required for root level operations.
            </p>

            {adminExists && !forceEnableSignup ? (
              <div className="bg-red-500/20 p-5 rounded-2xl border border-red-500/30 flex items-center space-x-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white shadow-lg">
                  <i className="fa-solid fa-lock"></i>
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-white">Security Lockdown</p>
                   <p className="text-[10px] font-bold text-red-200">New Registration Disabled</p>
                   <button 
                     type="button"
                     onClick={() => setForceEnableSignup(true)}
                     className="text-[8px] underline text-white/50 hover:text-white mt-1"
                   >
                     Force Enable Signup?
                   </button>
                </div>
              </div>
            ) : (
              <div className="bg-green-500/20 p-5 rounded-2xl border border-green-500/30 flex items-center space-x-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-green-500 animate-pulse flex items-center justify-center text-white shadow-lg">
                  <i className="fa-solid fa-door-open"></i>
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-white">Setup Mode</p>
                   <p className="text-[10px] font-bold text-green-200">Awaiting Root Initialization</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="relative z-10 mt-auto space-y-4">
             <div className="p-4 border border-white/10 rounded-2xl bg-black/10 text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/40 italic leading-relaxed">
                   STUCK? This usually means the project is paused or the SQL script hasn't been run.
                </p>
             </div>
             
             {/* ALWAYS CLICKABLE SETUP WIZARD LINK */}
             <button 
                type="button"
                onClick={() => window.location.hash = '#/dashboard'} 
                className="w-full bg-[#FFCC00] hover:bg-yellow-500 text-green-950 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition flex items-center justify-center gap-3 border-b-4 border-yellow-700"
             >
                <i className="fa-solid fa-database text-lg"></i> 
                <span>Open SQL Setup Wizard</span>
             </button>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="p-12 md:p-16 flex flex-col justify-center bg-[#020617]">
          {authError && (
             <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-[10px] font-black text-red-400 uppercase tracking-widest leading-relaxed">
                <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                {authError}
             </div>
          )}

          {showStuckHelper && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl animate-fade-in">
              <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-3">Verification taking too long?</p>
              <button 
                type="button"
                onClick={handleManualReset}
                className="w-full py-2 bg-amber-500 text-black text-[9px] font-black uppercase rounded-lg shadow-lg active:scale-95 transition"
              >
                Abort & Retry
              </button>
            </div>
          )}

          <div className="flex justify-center mb-10 bg-gray-900/50 p-1.5 rounded-2xl w-full border border-gray-800">
            <button 
              type="button"
              disabled={isSubmitting}
              onClick={() => setMode('LOGIN')} 
              className={`flex-grow px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'LOGIN' ? 'bg-[#008751] text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Admin Login
            </button>
            {(!adminExists || forceEnableSignup) && (
              <button 
                type="button"
                disabled={isSubmitting}
                onClick={() => setMode('SIGNUP')} 
                className={`flex-grow px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'SIGNUP' ? 'bg-[#008751] text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}
              >
                New Root
              </button>
            )}
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {mode === 'SIGNUP' && (
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Identity Display Name</label>
                   <input required type="text" className="w-full px-6 py-4 rounded-2xl bg-gray-900 border border-gray-800 outline-none transition font-bold text-white focus:border-green-700 disabled:opacity-50" placeholder="e.g. Master Architect" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={isSubmitting} />
                </div>
              )}
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Work Email</label>
                 <input required type="email" className="w-full px-6 py-4 rounded-2xl bg-gray-900 border border-gray-800 outline-none transition font-bold text-white focus:border-green-700 disabled:opacity-50" placeholder="admin@nysc.gov.ng" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Master Password</label>
                 <input required minLength={6} type="password" text-white className="w-full px-6 py-4 rounded-2xl bg-gray-900 border border-gray-800 outline-none transition font-bold text-white focus:border-green-700 disabled:opacity-50" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Root MFA Security Key</label>
                 <input required type="password" text-white className="w-full px-6 py-4 rounded-2xl bg-gray-900 border border-gray-800 outline-none transition font-bold text-white focus:border-green-700 disabled:opacity-50" placeholder="••••" value={formData.securityKey} onChange={e => setFormData({...formData, securityKey: e.target.value})} disabled={isSubmitting} />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#008751] hover:bg-green-600 text-[#FFCC00] font-black py-5 rounded-2xl transition shadow-2xl active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center space-x-3 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin text-lg"></i>
                  <span>Verifying Gateway...</span>
                </>
              ) : (
                <span>{mode === 'SIGNUP' ? 'Initialize Database Root' : 'Secure Entry'}</span>
              )}
            </button>
            
            <div className="text-center space-y-4">
              <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold">
                 {adminExists ? 'Authorized Personnel Only' : 'Secure connection to Supabase required.'}
              </p>
              
              <button 
                type="button" 
                onClick={toggleHelper}
                disabled={isSubmitting}
                className="text-[9px] text-[#008751] uppercase tracking-[0.2em] font-black hover:underline transition"
              >
                {showHelper ? 'Hide Emails' : 'Forgot Login? View Active Emails'}
              </button>

              {showHelper && (
                <div className="mt-4 p-4 bg-gray-900/50 rounded-2xl border border-gray-800 animate-fade-in text-left">
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-800 pb-2">Active Admin Registrations</p>
                  {loadingAdmins ? (
                    <div className="flex items-center justify-center py-2">
                       <i className="fa-solid fa-spinner fa-spin text-green-700"></i>
                    </div>
                  ) : registeredAdmins.length > 0 ? (
                    <div className="space-y-2">
                      {registeredAdmins.map((adm, i) => (
                        <div key={i} className="text-[10px] font-bold text-green-500 font-mono break-all">{adm.email}</div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[9px] text-gray-500 font-bold italic">No active admin profiles detected. Use the Setup Wizard.</p>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminRegistration;
