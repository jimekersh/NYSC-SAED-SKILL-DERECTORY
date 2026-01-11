
import React, { useState } from 'react';
import { NYSC_LOGO_URL, NYSC_LOGO_BACKUP, COLORS, NIGERIA_STATES } from '../constants';

interface RegistrationProps {
  onComplete: (data: any, mode: 'LOGIN' | 'SIGNUP') => void;
  onDemo?: () => void;
}

const StaffRegistration: React.FC<RegistrationProps> = ({ onComplete, onDemo }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('SIGNUP');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    staffId: '',
    state: 'Lagos',
    department: 'SAED Directorate'
  });

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== NYSC_LOGO_BACKUP) {
      target.src = NYSC_LOGO_BACKUP;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onComplete(formData, mode);
    } catch (err) {
      console.error("Staff auth error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="bg-white rounded-[3.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden grid md:grid-cols-10 min-h-[650px]">
        {/* Left Side Info */}
        <div className="md:col-span-4 bg-[#008751] p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="bg-white p-5 rounded-[2.5rem] shadow-xl mb-8 w-32 h-32 flex items-center justify-center">
               <img src={NYSC_LOGO_URL} className="w-20 h-20 object-contain" alt="NYSC" onError={handleImgError} />
            </div>
            <h2 className="text-3xl font-black mb-4 tracking-tighter">Directorate Access</h2>
            <p className="text-green-100 font-bold text-sm leading-relaxed mb-10 opacity-80">Authorized Monitoring and Evaluation portal for SAED personnel.</p>
          </div>
          <p className="relative z-10 text-[9px] font-black uppercase tracking-[0.3em] text-center text-white/40">Federal Republic of Nigeria</p>
        </div>

        {/* Right Form Area */}
        <div className="md:col-span-6 p-12 md:p-16 flex flex-col justify-center">
          <div className="flex justify-center mb-10 bg-gray-50 p-1.5 rounded-2xl w-fit mx-auto border border-gray-100">
            <button disabled={isSubmitting} onClick={() => setMode('SIGNUP')} className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'SIGNUP' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Staff Sign Up</button>
            <button disabled={isSubmitting} onClick={() => setMode('LOGIN')} className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'LOGIN' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Sign In</button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {mode === 'SIGNUP' ? (
              <div className="space-y-6 animate-fade-in">
                <input required type="text" className="w-full px-6 py-4 rounded-2xl border border-gray-200 outline-none transition font-bold" placeholder="Official Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input required type="email" className="w-full px-6 py-4 rounded-2xl border border-gray-200 outline-none transition font-bold" placeholder="Official Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <input required minLength={6} type="password" className="w-full px-6 py-4 rounded-2xl border border-gray-200 outline-none transition font-bold" placeholder="Password (min 6 chars)" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            ) : (
              <div className="space-y-6 py-10 animate-fade-in max-w-sm mx-auto">
                <input required type="email" className="w-full px-8 py-4 rounded-2xl border border-gray-200 outline-none transition font-bold" placeholder="staff@nysc.gov.ng" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <input required minLength={6} type="password" className="w-full px-8 py-4 rounded-2xl border border-gray-200 outline-none transition font-bold" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            )}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#008751] hover:bg-green-800 text-[#FFCC00] font-black py-5 rounded-2xl transition shadow-xl active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center space-x-3"
            >
              {isSubmitting && <i className="fa-solid fa-spinner fa-spin"></i>}
              <span>{mode === 'SIGNUP' ? (isSubmitting ? 'Processing...' : 'Create Official Account') : (isSubmitting ? 'Verifying...' : 'Authenticate & Enter Hub')}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffRegistration;
