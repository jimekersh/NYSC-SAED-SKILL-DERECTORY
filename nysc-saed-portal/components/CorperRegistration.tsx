
import React, { useState } from 'react';
import { NIGERIA_STATES, NYSC_LOGO_URL, NYSC_LOGO_BACKUP, COLORS } from '../constants';

interface RegistrationProps {
  onComplete: (data: any, mode: 'LOGIN' | 'SIGNUP') => void;
  onDemo?: () => void;
}

const CorperRegistration: React.FC<RegistrationProps> = ({ onComplete, onDemo }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('SIGNUP');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    stateCode: '',
    email: '', 
    batch: 'Batch A 2024',
    stateOfService: 'Lagos',
    interests: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== NYSC_LOGO_BACKUP) {
      target.src = NYSC_LOGO_BACKUP;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long for security.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onComplete(formData, mode);
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white rounded-[3.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border border-gray-100 p-10 md:p-16 relative overflow-hidden transition-all duration-500">
        
        <div className="flex flex-col items-center justify-center mb-10">
           <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-gray-100 mb-10 w-44 h-44 flex items-center justify-center overflow-hidden transition-transform hover:scale-105 duration-500 group">
              <img src={NYSC_LOGO_URL} className="w-full h-full object-contain group-hover:rotate-6 transition-transform" alt="NYSC Directorate" onError={handleImgError} />
           </div>
           <h1 className="text-[2.8rem] font-[900] text-center text-[#111827] mb-2 tracking-tight leading-none">Corper Portal Access</h1>
           <p className="text-gray-400 font-extrabold text-center text-[10px] uppercase tracking-[0.25em]">Strategic Skill Acquisition Hub</p>
        </div>

        <div className="flex justify-center mb-10 bg-gray-50 p-1.5 rounded-2xl w-fit mx-auto border border-gray-100">
          <button type="button" disabled={isSubmitting} onClick={() => setMode('SIGNUP')} className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'SIGNUP' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Registration</button>
          <button type="button" disabled={isSubmitting} onClick={() => setMode('LOGIN')} className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'LOGIN' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Sign In</button>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-center animate-fade-in">
              <i className="fa-solid fa-triangle-exclamation mr-2"></i> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mode === 'SIGNUP' && (
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-2">Full Name</label>
                <input required type="text" className="w-full px-8 py-5 rounded-[2rem] bg-gray-50/50 border border-gray-100 focus:bg-white outline-none transition-all font-bold text-gray-900 shadow-inner" placeholder="Abiola Tunde" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
            )}
            <div className={`space-y-2 ${mode === 'LOGIN' ? 'md:col-span-2' : ''}`}>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-2">State Code</label>
              <input required type="text" className="w-full px-8 py-5 rounded-[2rem] bg-gray-50/50 border border-gray-100 focus:bg-white outline-none transition-all font-bold text-gray-900 shadow-inner" placeholder="LA/23B/1234" value={formData.stateCode} onChange={e => setFormData({...formData, stateCode: e.target.value})} />
            </div>
          </div>

          {mode === 'SIGNUP' && (
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-2">Personal Email (Optional)</label>
              <input type="email" className="w-full px-8 py-5 rounded-[2rem] bg-gray-50/50 border border-gray-100 focus:bg-white outline-none transition-all font-bold text-gray-900 shadow-inner" placeholder="abiola@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-2">Password</label>
            <input required type="password" minLength={6} className="w-full px-8 py-5 rounded-[2rem] bg-gray-50/50 border border-gray-100 focus:bg-white outline-none transition-all font-bold text-gray-900 shadow-inner" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full text-white font-[900] py-6 rounded-[2.5rem] transition-all duration-300 shadow-xl text-lg uppercase tracking-widest hover:brightness-110 active:scale-[0.98] flex items-center justify-center space-x-3" 
            style={{ backgroundColor: COLORS.green }}
          >
            {isSubmitting && <i className="fa-solid fa-spinner fa-spin"></i>}
            <span>{isSubmitting ? 'Authenticating...' : (mode === 'SIGNUP' ? 'Access My Portal' : 'Login to Dashboard')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default CorperRegistration;
