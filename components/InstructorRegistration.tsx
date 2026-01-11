import React, { useState, useMemo, useEffect } from 'react';
import { SKILLS, NIGERIA_STATES, NIGERIA_LGAS, COLORS } from '../constants';
import { Instructor, Skill } from '../types';

interface RegistrationProps {
  onComplete: (data: Partial<Instructor>, mode?: 'LOGIN' | 'SIGNUP') => void;
  onDemo?: () => void;
}

const InstructorRegistration: React.FC<RegistrationProps> = ({ onComplete, onDemo }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('SIGNUP');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSkillItem, setSelectedSkillItem] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    headline: '',
    about: '',
    phoneNumber: '',
    linkedInUrl: '',
    state: 'Lagos',
    lga: '',
    address: '',
    selectedSkills: [] as string[]
  });

  useEffect(() => {
    let timeout: any;
    if (isSubmitting) {
      timeout = setTimeout(() => {
        setIsSubmitting(false);
      }, 15000);
    }
    return () => clearTimeout(timeout);
  }, [isSubmitting]);

  const availableLgas = useMemo(() => {
    return NIGERIA_LGAS[formData.state] || NIGERIA_LGAS['Default'];
  }, [formData.state]);

  const categories = useMemo(() => {
    return Array.from(new Set(SKILLS.map(s => s.category))).sort();
  }, []);

  const filteredSkills = useMemo<Skill[]>(() => {
    if (!selectedCategory) return [];
    return SKILLS.filter(s => s.category === selectedCategory).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedCategory]);

  const addSkill = () => {
    if (selectedSkillItem && !formData.selectedSkills.includes(selectedSkillItem)) {
      setFormData(prev => ({
        ...prev,
        selectedSkills: [...prev.selectedSkills, selectedSkillItem]
      }));
      setSelectedSkillItem('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'SIGNUP' && formData.selectedSkills.length === 0) {
      alert("Please select at least one skill you teach.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (mode === 'SIGNUP') {
        const fullData: Partial<Instructor> = {
          ...formData,
          id: `inst-${Math.random().toString(36).substr(2, 9)}`,
          rating: 5.0,
          reviewCount: 0,
          profilePic: '', 
          coverImage: '', 
          skills: formData.selectedSkills,
          location: {
            lat: 9.0765,
            lng: 7.3986,
            address: formData.address,
            state: formData.state,
            lga: formData.lga || availableLgas[0]
          }
        };
        await onComplete(fullData, 'SIGNUP');
      } else {
        await onComplete({ email: formData.email, password: formData.password } as any, 'LOGIN');
      }
    } catch (err: any) {
      console.error("Submission failed:", err);
      alert("Error: " + (err.message || "Authentication failed."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-[3.2rem] font-[1000] text-[#111827] mb-2 tracking-tighter leading-none">
          {mode === 'SIGNUP' ? 'Instructor Enrolment' : 'Secure Portal Login'}
        </h1>
        <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.4em]">
          Official National Youth Service Corps SAED Portal
        </p>
      </div>

      <div className="bg-white rounded-[4.5rem] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden grid md:grid-cols-12 min-h-[900px]">
        
        {/* Left Sidebar */}
        <div className="md:col-span-4 bg-[#004d2c] text-white relative overflow-hidden flex flex-col">
          <div className="p-10 md:p-14 space-y-10 flex-grow relative z-10">
            <div>
               <h2 className="text-2xl font-black mb-3 tracking-tighter">Enrolment Guide</h2>
               <p className="text-[10px] font-black uppercase tracking-widest text-green-400 opacity-90 border-b border-white/10 pb-4">Onboarding your training center</p>
            </div>

            <nav className="space-y-6">
              {[
                { step: '01', title: 'Account Identity', icon: 'fa-user-shield' },
                { step: '02', title: 'Expert Profile', icon: 'fa-id-badge' },
                { step: '03', title: 'Geo-Mapping', icon: 'fa-location-dot' },
                { step: '04', title: 'Skill Matrix', icon: 'fa-layer-group' }
              ].map((s, i) => (
                <div key={i} className="flex items-center group">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center font-black text-[11px] mr-5 group-hover:bg-green-500 transition-all">
                    <i className={`fa-solid ${s.icon}`}></i>
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest">{s.title}</p>
                    <p className="text-[9px] font-bold text-green-100/30 uppercase">Step {s.step}</p>
                  </div>
                </div>
              ))}
            </nav>

            <div className="pt-8 border-t border-white/10">
              <div className="bg-[#002d1a] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl text-center">
                <p className="text-white font-[1000] text-[11px] italic leading-relaxed">
                  "Professional training is the bedrock of national productivity."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="md:col-span-8 p-8 md:p-20 overflow-y-auto custom-scrollbar bg-gray-50/30">
          <div className="flex justify-end mb-16">
            <div className="bg-gray-100 p-1.5 rounded-2xl flex border border-gray-200">
              <button type="button" disabled={isSubmitting} onClick={() => setMode('SIGNUP')} className={`px-12 py-3.5 rounded-xl text-[10px] font-[1000] uppercase tracking-widest transition-all ${mode === 'SIGNUP' ? 'bg-white text-[#004d2c] shadow-lg border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>New Instructor</button>
              <button type="button" disabled={isSubmitting} onClick={() => setMode('LOGIN')} className={`px-12 py-3.5 rounded-xl text-[10px] font-[1000] uppercase tracking-widest transition-all ${mode === 'LOGIN' ? 'bg-white text-[#004d2c] shadow-lg border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>Portal Sign-In</button>
            </div>
          </div>

          <form className="space-y-14" onSubmit={handleSubmit}>
            {mode === 'SIGNUP' ? (
              <div className="space-y-14 animate-fade-in">
                {/* 01 Identity */}
                <div className="space-y-10 bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="flex items-center space-x-4">
                    <span className="w-10 h-10 rounded-2xl bg-[#004d2c] text-[#FFCC00] flex items-center justify-center font-black text-xs shadow-lg">01</span>
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.4em]">Account Identity</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <input required className="w-full px-8 py-5 rounded-[2rem] bg-gray-50/50 border-2 border-gray-100 focus:bg-white outline-none transition-all font-bold" placeholder="Full Name / Center Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <input required className="w-full px-8 py-5 rounded-[2rem] bg-gray-50/50 border-2 border-gray-100 focus:bg-white outline-none transition-all font-bold" placeholder="Official Mobile" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <input required type="email" className="w-full px-8 py-5 rounded-[2rem] bg-gray-50/50 border-2 border-gray-100 focus:bg-white outline-none transition-all font-bold" placeholder="Corporate Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <input required type="password" minLength={6} className="w-full px-8 py-5 rounded-[2rem] bg-gray-50/50 border-2 border-gray-100 focus:bg-white outline-none transition-all font-bold" placeholder="Portal Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                </div>

                {/* 02 Profile */}
                <div className="space-y-10 bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="flex items-center space-x-4">
                    <span className="w-10 h-10 rounded-2xl bg-[#004d2c] text-[#FFCC00] flex items-center justify-center font-black text-xs shadow-lg">02</span>
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.4em]">Expert Profile</h3>
                  </div>
                  <input required className="w-full px-8 py-5 rounded-[2rem] bg-gray-50/50 border-2 border-gray-100 focus:bg-white outline-none transition-all font-bold" placeholder="Professional Headline (e.g. Lead Instructor | Master Solar Technician)" value={formData.headline} onChange={e => setFormData({...formData, headline: e.target.value})} />
                  <textarea required className="w-full px-8 py-7 rounded-[2.5rem] bg-gray-50/50 border-2 border-gray-100 focus:bg-white outline-none transition-all font-bold min-h-[150px]" placeholder="Biography / Training Experience..." value={formData.about} onChange={e => setFormData({...formData, about: e.target.value})} />
                </div>

                {/* 03 Geo-Mapping */}
                <div className="space-y-10 bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="flex items-center space-x-4">
                    <span className="w-10 h-10 rounded-2xl bg-[#004d2c] text-[#FFCC00] flex items-center justify-center font-black text-xs shadow-lg">03</span>
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.4em]">Geo-Mapping</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <select className="w-full px-8 py-5 rounded-[2rem] bg-gray-50/50 border-2 border-gray-100 outline-none font-bold" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value, lga: ''})}>
                      {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select className="w-full px-8 py-5 rounded-[2rem] bg-gray-50/50 border-2 border-gray-100 outline-none font-bold" value={formData.lga} onChange={e => setFormData({...formData, lga: e.target.value})}>
                      <option value="">Select LGA</option>
                      {availableLgas.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <input required className="w-full px-8 py-5 rounded-[2rem] bg-gray-50/50 border-2 border-gray-100 focus:bg-white outline-none transition-all font-bold" placeholder="Physical Training Center Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>

                {/* 04 Skill Matrix */}
                <div className="space-y-10 bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="flex items-center space-x-4">
                    <span className="w-10 h-10 rounded-2xl bg-[#004d2c] text-[#FFCC00] flex items-center justify-center font-black text-xs shadow-lg">04</span>
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.4em]">Skill Matrix</h3>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <select className="flex-1 px-8 py-5 rounded-[2rem] bg-gray-50/50 border-2 border-gray-100 outline-none font-bold" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select className="flex-1 px-8 py-5 rounded-[2rem] bg-gray-50/50 border-2 border-gray-100 outline-none font-bold" value={selectedSkillItem} onChange={e => setSelectedSkillItem(e.target.value)}>
                      <option value="">Select Skill</option>
                      {filteredSkills.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                    <button type="button" onClick={addSkill} className="px-10 bg-gray-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-black transition-all">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-6">
                    {formData.selectedSkills.map(s => (
                      <span key={s} className="bg-green-50 text-[#004d2c] px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-green-100 flex items-center">
                        {s}
                        <button type="button" onClick={() => removeSkill(s)} className="ml-3 text-red-500 hover:text-red-700"><i className="fa-solid fa-xmark"></i></button>
                      </span>
                    ))}
                    {formData.selectedSkills.length === 0 && <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">No skills selected yet.</p>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-12 py-32 animate-fade-in max-w-md mx-auto text-center">
                <div className="w-28 h-28 bg-gray-50 rounded-[3.5rem] flex items-center justify-center mx-auto mb-10 border border-gray-100 shadow-inner">
                  <i className="fa-solid fa-lock text-5xl text-gray-200"></i>
                </div>
                <div className="space-y-6">
                  <input required type="email" className="w-full px-10 py-6 rounded-[2.5rem] bg-gray-50 border-2 border-gray-100 outline-none transition font-black focus:border-[#004d2c]" placeholder="instructor@saed.ng" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  <input required type="password" minLength={6} className="w-full px-10 py-6 rounded-[2.5rem] bg-gray-50 border-2 border-gray-100 outline-none transition font-black focus:border-[#004d2c]" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>
            )}

            <div className="pt-10">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#004d2c] hover:bg-[#003a21] text-white font-[1000] py-9 rounded-[3.5rem] transition-all shadow-2xl active:scale-[0.98] uppercase tracking-[0.35em] text-sm flex items-center justify-center space-x-6 disabled:opacity-70"
              >
                {isSubmitting && <i className="fa-solid fa-circle-notch fa-spin text-2xl"></i>}
                <span>{mode === 'SIGNUP' ? 'Initiate Official Enrolment' : 'Secure Portal Entry'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InstructorRegistration;