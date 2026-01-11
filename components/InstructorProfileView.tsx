import React, { useState, useMemo } from 'react';
import { Instructor, UserRole } from '../types';
import { SKILLS } from '../constants';

interface InstructorProfileViewProps {
  instructor: Instructor;
  role: UserRole;
  onBack: () => void;
  onEnroll: (skill: string) => void;
}

const InstructorProfileView: React.FC<InstructorProfileViewProps> = ({ instructor, role, onBack, onEnroll }) => {
  const [imgError, setImgError] = useState(false);
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.name)}&background=004d2c&color=fff&size=256&bold=true`;

  const getSkillFallbackImage = (skillName: string) => {
    const s = skillName?.trim() || '';
    const mapping: Record<string, string> = {
      'Web Design': 'https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=800&auto=format&fit=crop',
      'App Development': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop',
      'Digital Marketing': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
      'Solar Installation': 'https://images.unsplash.com/photo-1509391366360-fe5bef1693e7?q=80&w=800&auto=format&fit=crop',
      'Electrical Wiring': 'https://images.unsplash.com/photo-1558403194-611308249627?q=80&w=800&auto=format&fit=crop',
      'Agro-allied': 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=800&auto=format&fit=crop',
      'Fashion Design': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
      'Tailoring & Fashion Design': 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=800&auto=format&fit=crop',
      'Cosmetology': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
      'Makeup Artistry': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop',
    };
    return mapping[s] || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop';
  };

  const instructorSkills = Array.isArray(instructor.skills) ? instructor.skills : [];
  const primaryBrandImage = instructor.coverImage || 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200&auto=format&fit=crop';

  const handleAction = (skill: string) => {
    if (role === 'CORPER') {
      onEnroll(skill);
    } else if (role === 'GUEST') {
      window.location.hash = '#/register-corper';
    } else {
      alert("Instructor/Admin Mode: You cannot enroll in skill training paths.");
    }
  };

  const getButtonConfig = () => {
    if (role === 'CORPER') {
      return {
        text: 'Secure Slot',
        icon: 'fa-plus-circle',
        className: 'bg-slate-50 hover:bg-[#004d2c] text-[#004d2c] hover:text-white',
      };
    } else if (role === 'GUEST') {
      return {
        text: 'Login to Enroll',
        icon: 'fa-right-to-bracket',
        className: 'bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white',
      };
    } else {
      return {
        text: 'View Only Mode',
        icon: 'fa-eye',
        className: 'bg-slate-100 text-slate-400 cursor-not-allowed',
      };
    }
  };

  const buttonConfig = getButtonConfig();

  // Helper to find category for a skill
  const getSkillCategory = (skillName: string) => {
    const found = SKILLS.find(s => s.name.toLowerCase() === skillName.toLowerCase());
    return found ? found.category : 'SAED Training';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Navigation Header */}
      <div className="mb-8 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center space-x-3 text-slate-400 hover:text-[#004d2c] transition-colors font-black uppercase text-[10px] tracking-widest"
        >
          <i className="fa-solid fa-arrow-left-long"></i>
          <span>Back to Directory</span>
        </button>
        <div className="px-4 py-2 bg-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">
          Ref: {instructor.id}
        </div>
      </div>

      {/* Main Profile Hero */}
      <div className="bg-white rounded-[4rem] overflow-hidden shadow-2xl mb-12 border border-slate-50">
        <div className="h-72 relative overflow-hidden bg-slate-900">
          <img 
            src={primaryBrandImage} 
            className="w-full h-full object-cover" 
            alt="Instructor Cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        </div>

        <div className="bg-white px-10 pb-10 pt-4 relative">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-10">
            <div className="relative -mt-32 md:-mt-28 flex-shrink-0">
              <div className="w-44 h-44 bg-white rounded-[3.5rem] p-1.5 shadow-2xl ring-[12px] ring-white overflow-hidden flex items-center justify-center">
                {imgError ? (
                  <div className="w-full h-full bg-[#004d2c] rounded-[3.2rem] flex items-center justify-center text-white text-5xl font-black">
                    {instructor.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <img 
                    src={instructor.profilePic || fallbackUrl} 
                    className="w-full h-full object-cover rounded-[3.2rem]" 
                    alt={instructor.name}
                    onError={() => setImgError(true)}
                  />
                )}
              </div>
            </div>

            <div className="flex-grow text-center md:text-left pt-2">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-1">
                <h1 className="text-4xl font-[1000] text-[#1e293b] tracking-tighter leading-tight">
                  {instructor.name}
                </h1>
                <i className="fa-solid fa-circle-check text-green-500 text-2xl"></i>
              </div>
              <p className="text-sm font-black text-[#004d2c] uppercase tracking-[0.25em] mb-4">
                {instructor.headline}
              </p>
              <div className="flex items-center justify-center md:justify-start space-x-5 text-slate-300">
                <div className="flex items-center space-x-2">
                  <div className="flex text-[#FFCC00] text-xs">
                    {[...Array(5)].map((_, i) => <i key={i} className="fa-solid fa-star"></i>)}
                  </div>
                  <span className="text-[10px] font-[1000] text-slate-400 uppercase tracking-widest">{instructor.rating || 5.0} RATING</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-100"></div>
                <div className="flex items-center space-x-2">
                   <span className="text-[10px] font-[1000] text-slate-400 uppercase tracking-widest">{instructor.reviewCount || 0} VERIFIED STUDENTS</span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 md:ml-auto">
               <button className="bg-[#1e293b] hover:bg-black text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-xl hover:scale-105 transition-all flex items-center space-x-3">
                  <i className="fa-solid fa-share-nodes text-[12px]"></i>
                  <span>Share</span>
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-10">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
              <h3 className="text-xs font-black text-[#1e293b] uppercase tracking-[0.3em] mb-8 border-b border-slate-50 pb-6 flex items-center">
                <i className="fa-solid fa-circle-info text-[#004d2c] mr-3"></i>
                About Instructor
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed text-sm whitespace-pre-wrap italic">
                "{instructor.about || 'Professional SAED Certified Instructor'}"
              </p>
           </div>

           <div className="bg-[#1e293b] p-10 rounded-[3rem] shadow-xl text-white">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 border-b border-white/5 pb-6">
                Official Location
              </h3>
              <div className="space-y-6">
                 <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#FFCC00]">
                       <i className="fa-solid fa-location-dot"></i>
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">State / LGA</p>
                       <p className="font-bold text-sm">{instructor.location?.state || 'National'}, {instructor.location?.lga || 'HQ'}</p>
                    </div>
                 </div>
                 <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-green-400">
                       <i className="fa-solid fa-building"></i>
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Physical Address</p>
                       <p className="font-bold text-sm leading-relaxed">{instructor.location?.address || 'Certified Center Address Pending'}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Column: Skill Matrix */}
        <div className="lg:col-span-2 space-y-8">
           <div>
             <h2 className="text-2xl font-[1000] text-[#1e293b] tracking-tighter uppercase mb-2">Available Skill Paths</h2>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Select a skill to enroll for this service year</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {instructorSkills.length > 0 ? instructorSkills.map((skill, idx) => {
                const category = getSkillCategory(skill);
                return (
                  <div 
                    key={idx}
                    className="bg-white rounded-[3rem] border border-slate-100 shadow-xl hover:shadow-2xl hover:border-[#004d2c]/20 transition-all group flex flex-col overflow-hidden"
                  >
                    <div className="h-44 relative overflow-hidden bg-slate-200">
                      <img 
                        src={primaryBrandImage}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt={skill}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = getSkillFallbackImage(skill);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <div className="w-12 h-12 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center text-[#004d2c] shadow-lg">
                          <i className="fa-solid fa-award text-lg"></i>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4">
                         <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10 text-white flex items-center space-x-1.5">
                            <i className="fa-solid fa-star text-[10px] text-[#FFCC00]"></i>
                            <span className="text-[10px] font-black uppercase tracking-widest">4.9</span>
                         </div>
                      </div>
                    </div>

                    <div className="p-8 flex flex-col flex-grow">
                      <div className="mb-8">
                        <div className="flex items-center space-x-2 mb-2">
                           <span className="px-2 py-0.5 bg-[#004d2c]/5 text-[#004d2c] rounded-md text-[8px] font-black uppercase tracking-widest border border-[#004d2c]/10">
                              {category}
                           </span>
                        </div>
                        <h3 className="text-xl font-black text-[#1e293b] tracking-tight mb-1">{skill}</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">NYSC Certified Training Path</p>
                        
                        <div className="flex text-[#FFCC00] text-[10px] mt-4 space-x-1">
                          {[...Array(5)].map((_, i) => <i key={i} className="fa-solid fa-star"></i>)}
                          <span className="text-slate-300 ml-1 font-black">(Verified)</span>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <button 
                          onClick={() => handleAction(skill)}
                          className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-sm active:scale-95 flex items-center justify-center space-x-2 ${buttonConfig.className}`}
                        >
                          <span>{buttonConfig.text}</span>
                          <i className={`fa-solid ${buttonConfig.icon}`}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center px-10">
                   <i className="fa-solid fa-layer-group text-4xl text-slate-200 mb-6"></i>
                   <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">No Active Skill Paths</h3>
                   <p className="text-slate-400 text-xs font-bold mt-2">This instructor has not listed their training paths yet.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorProfileView;