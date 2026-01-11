
import React, { useState, useRef } from 'react';
import { getSkillRecommendations, analyzeResumeForSkills } from '../services/geminiService';
import { Registration, Instructor } from '../types';
import { MOCK_INSTRUCTORS, NYSC_LOGO_URL, SKILLS, COLORS } from '../constants';

interface CorperDashboardProps {
  registrations: Registration[];
  onSelectSkill?: (skill: string) => void;
  instructors?: Instructor[];
  isDemo?: boolean;
}

const CorperDashboard: React.FC<CorperDashboardProps> = ({ registrations, onSelectSkill, instructors = [], isDemo = false }) => {
  const [interests, setInterests] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGetRecommendations = async () => {
    if (!interests.trim()) return;
    setLoading(true);
    const res = await getSkillRecommendations(interests);
    setRecommendations(res || []);
    setLoading(false);
  };

  const activeInstructors = instructors.length > 0 ? instructors : MOCK_INSTRUCTORS;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Session Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
           <div className={`w-3 h-3 rounded-full ${isDemo ? 'bg-amber-500 animate-pulse' : 'bg-[#00df82] shadow-[0_0_8px_rgba(0,223,130,0.5)]'}`}></div>
           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
             {isDemo ? 'Sandbox Mode Active' : 'Master Database Synced'}
           </span>
        </div>
        <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
           Ref: SAED-2026-LIVE
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-[#004d2c] rounded-[3rem] p-10 md:p-14 text-white shadow-2xl mb-12 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40 blur-3xl"></div>
        <div className="md:w-3/5 mb-8 md:mb-0 relative z-10">
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight tracking-tighter">Plan Your Future, <br/>Great Nation Builder!</h1>
          <p className="text-green-100 text-xl mb-10 max-w-lg font-medium opacity-90 leading-relaxed">Our AI strategy engine maps your career aspirations to high-impact SAED skills.</p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow max-w-md group">
               <input 
                type="text" 
                placeholder="Your Interests (e.g. Design, Agro, AI)"
                className="w-full bg-white/10 border border-white/20 rounded-[2rem] py-5 pl-8 pr-28 focus:outline-none focus:ring-4 focus:ring-green-400/30 transition text-white placeholder-green-200/50 font-bold"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
               />
               <button 
                onClick={handleGetRecommendations}
                className="absolute right-2 top-2 bottom-2 bg-[#FFCC00] text-green-950 px-8 rounded-[1.5rem] font-black uppercase text-xs hover:bg-[#FFD700] transition active:scale-95"
               >
                 {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'AI Plan'}
               </button>
            </div>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#00df82] hover:bg-[#00ff95] text-green-950 px-8 py-5 rounded-[2rem] font-black transition shadow-xl flex items-center justify-center space-x-3 text-xs uppercase tracking-widest"
            >
              <i className="fa-solid fa-file-invoice"></i>
              <span>Analyze CV</span>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".txt" />
          </div>
        </div>
        <div className="md:w-2/5 flex justify-center relative z-10">
           <img src={NYSC_LOGO_URL} alt="NYSC" className="w-64 opacity-20 transform hover:scale-110 transition duration-1000" />
        </div>
      </div>

      {/* NEW: Skill Directory & Geo-Location Section */}
      <div className="mb-16">
          <div className="flex justify-between items-end mb-8">
             <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Skill Directory</h2>
                <p className="font-bold uppercase text-[10px] tracking-widest mt-1" style={{ color: COLORS.accent }}>Geo-Location Mentor Discovery</p>
             </div>
             <button 
                onClick={() => window.location.hash = '#/map'}
                className="bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#004d2c] shadow-xl hover:shadow-2xl transition flex items-center space-x-3"
             >
                <i className="fa-solid fa-map-location-dot" style={{ color: COLORS.accent }}></i>
                <span>Open Full Map</span>
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Interactive Directory Previews */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 flex flex-col justify-between hover:border-green-200 transition group cursor-pointer" onClick={() => onSelectSkill?.('Web Design')}>
                  <div>
                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-[#004d2c] mb-6 group-hover:bg-[#00df82] group-hover:text-green-950 transition-all duration-500">
                      <i className="fa-solid fa-code text-xl"></i>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-2">ICT & Digital</h3>
                    <p className="text-xs font-medium text-gray-400 leading-relaxed">Web Design, App Dev, Data Science & Cyber Security.</p>
                  </div>
                  <div className="mt-8 flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase bg-green-50 px-3 py-1 rounded-full text-green-700">42 Mentors Near You</span>
                     <i className="fa-solid fa-chevron-right text-gray-200 group-hover:translate-x-2 transition-transform"></i>
                  </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 flex flex-col justify-between hover:border-amber-200 transition group cursor-pointer" onClick={() => onSelectSkill?.('Agro-allied')}>
                  <div>
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-600 group-hover:text-white transition-all duration-500">
                      <i className="fa-solid fa-seedling text-xl"></i>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-2">Agro-Allied</h3>
                    <p className="text-xs font-medium text-gray-400 leading-relaxed">Poultry Farming, Fisheries, and Crop Processing.</p>
                  </div>
                  <div className="mt-8 flex items-center justify-between">
                     <span className="text-[10px] font-black text-amber-600 uppercase bg-amber-50 px-3 py-1 rounded-full">18 Mentors Near You</span>
                     <i className="fa-solid fa-chevron-right text-gray-200 group-hover:translate-x-2 transition-transform"></i>
                  </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 flex flex-col justify-between hover:border-blue-200 transition group cursor-pointer" onClick={() => onSelectSkill?.('Construction')}>
                  <div>
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                      <i className="fa-solid fa-helmet-safety text-xl"></i>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 mb-2">Engineering</h3>
                    <p className="text-xs font-medium text-gray-400 leading-relaxed">Construction, Automobile, and Energy Systems.</p>
                  </div>
                  <div className="mt-8 flex items-center justify-between">
                     <span className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full">12 Mentors Near You</span>
                     <i className="fa-solid fa-chevron-right text-gray-200 group-hover:translate-x-2 transition-transform"></i>
                  </div>
              </div>

              <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between group cursor-pointer hover:scale-105 transition duration-500" onClick={() => window.location.hash = '#/directory'}>
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                      <i className="fa-solid fa-compass text-xl"></i>
                    </div>
                    <div className="bg-[#00df82] text-green-950 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Global</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white mb-2">View All Categories</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Browse Full Directory</p>
                  </div>
                  <div className="mt-8 flex items-center space-x-3 text-white">
                     <span className="text-[10px] font-black uppercase" style={{ color: COLORS.accent }}>Start Searching</span>
                     <i className="fa-solid fa-arrow-right animate-bounce-x" style={{ color: COLORS.accent }}></i>
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
           <h2 className="text-3xl font-[1000] text-gray-900 tracking-tighter mb-8">Current Enrolments</h2>
           <div className="space-y-6">
              {registrations.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                    <i className="fa-solid fa-folder-open text-3xl"></i>
                  </div>
                  <p className="font-bold text-gray-400 mb-8 max-w-xs uppercase text-[10px] tracking-widest">No active training found in database.</p>
                  <button 
                    onClick={() => window.location.hash = '#/directory'}
                    className="bg-[#004d2c] text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition"
                  >
                    Enroll in a New Skill
                  </button>
                </div>
              ) : registrations.map((reg) => {
                const mentor = activeInstructors.find(i => i.id === reg.instructor_id);
                return (
                  <div key={reg.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-50 flex items-center justify-between shadow-xl">
                    <div className="flex items-center space-x-6">
                        <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-inner bg-gray-50 border border-gray-100 p-1">
                          <img src={mentor?.profilePic || 'https://via.placeholder.com/100'} className="w-full h-full object-cover rounded-[1.2rem]" />
                        </div>
                        <div>
                          <p className="font-black text-2xl text-gray-900">{reg.skill_name}</p>
                          <p className="text-xs font-black uppercase tracking-widest mt-1" style={{ color: COLORS.accent }}>Instructor: {mentor?.name || 'Vetted Expert'}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <span className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                          reg.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          reg.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border-green-100' :
                          reg.status === 'COMPLETED' ? 'bg-gray-900 text-white border-black' :
                          'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {reg.status}
                        </span>
                        <div className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">Validated Session</div>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>
        
        <div className="space-y-10">
          <div className="bg-gray-900 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 rounded-full blur-3xl"></div>
             <h3 className="text-2xl font-black mb-10 flex items-center space-x-4">
               <i className="fa-solid fa-award" style={{ color: COLORS.accent }}></i>
               <span>Skill Progress</span>
             </h3>
             <div className="space-y-8">
                <div className="flex justify-between items-center pb-6 border-b border-gray-800">
                   <span className="text-gray-500 font-black uppercase text-[10px] tracking-[0.25em]">Mastery Level</span>
                   <span className="font-black text-sm uppercase tracking-widest" style={{ color: COLORS.accent }}>Beginner</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-gray-500 font-black uppercase text-[10px] tracking-[0.25em]">Completed Tasks</span>
                   <span className="font-black text-sm">3 / 10 Units</span>
                </div>
                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                   <div className="h-full bg-[#00df82] shadow-[0_0_15px_rgba(0,223,130,0.5)]" style={{ width: '30%' }}></div>
                </div>
                <button className="w-full bg-[#004d2c] hover:bg-green-700 py-5 rounded-[1.5rem] font-black transition shadow-xl active:scale-95 text-xs uppercase tracking-widest text-white mt-4 border-b-4 border-green-950">
                   Access Materials
                </button>
             </div>
          </div>
          
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 border-b border-gray-50 pb-6">Official Support Channels</h4>
              <div className="space-y-4">
                  <a href="mailto:saed@nysc.gov.ng" className="flex items-center space-x-6 p-6 bg-gray-50 rounded-[2rem] hover:bg-gray-100 transition border border-gray-100">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm" style={{ color: COLORS.accent }}><i className="fa-solid fa-envelope"></i></div>
                      <span className="text-xs font-black text-gray-700 uppercase tracking-widest">Official Helpline</span>
                  </a>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorperDashboard;
