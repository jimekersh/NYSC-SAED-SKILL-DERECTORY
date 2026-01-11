
import React, { useState } from 'react';
import { Instructor } from '../types';
import { COLORS } from '../constants';

interface InstructorCardProps {
  instructor: Instructor;
  onViewProfile?: (id: string) => void;
  showApply?: boolean;
}

const InstructorCard: React.FC<InstructorCardProps> = ({ 
  instructor, 
  onViewProfile, 
  showApply = false 
}) => {
  const [imgError, setImgError] = useState(false);
  const instructorSkills = instructor.skills ?? [];

  // Professional fallback URL
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.name)}&background=004d2c&color=fff&size=256&bold=true`;

  return (
    <div className="bg-white border-2 border-slate-100 rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl hover:border-[#00df82]/30 transition-all duration-500 group flex flex-col h-full text-center">
      {/* Dynamic Cover Header */}
      <div className="h-28 relative overflow-hidden bg-slate-100">
        <img 
          src={instructor.coverImage || 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=600&auto=format&fit=crop'} 
          className="w-full h-full object-cover opacity-90 transition-transform duration-1000 group-hover:scale-110" 
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        {/* Verification Badge */}
        {instructor.verified !== false && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-lg border border-white/20 flex items-center space-x-1">
            <i className="fa-solid fa-circle-check text-green-500 text-[10px]"></i>
            <span className="text-[8px] font-black uppercase tracking-widest text-green-700">Verified</span>
          </div>
        )}
      </div>

      {/* Profile & Name Area (Centralized) */}
      <div className="px-6 pb-2 relative pt-12 flex flex-col items-center">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
          <div className="w-20 h-20 bg-white rounded-[1.8rem] p-1 shadow-2xl ring-4 ring-white relative overflow-hidden flex items-center justify-center">
            {imgError ? (
               <div className="w-full h-full bg-[#004d2c] rounded-[1.6rem] flex items-center justify-center text-white text-2xl font-black">
                 {instructor.name.charAt(0).toUpperCase()}
               </div>
            ) : (
              <img 
                src={instructor.profilePic || fallbackUrl} 
                className="w-full h-full object-cover rounded-[1.6rem] transition-transform duration-500 group-hover:scale-105" 
                alt=""
                onError={() => setImgError(true)}
              />
            )}
          </div>
        </div>

        <div className="mb-2 w-full">
          <h3 className="text-lg font-[1000] text-[#1e293b] leading-tight tracking-tight mb-1 truncate px-2">
            {instructor.name}
          </h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 line-clamp-1 opacity-90" style={{ color: COLORS.accent }}>
            {instructor.headline}
          </p>
          
          {/* Continuous Sliding Skill Set */}
          <div className="w-full overflow-hidden py-2 bg-slate-50/50 border-y border-slate-100/50 mb-3 cursor-default">
            <div className="animate-marquee whitespace-nowrap flex items-center">
              {[...instructorSkills, ...instructorSkills, ...instructorSkills].map((skill, i) => (
                <div key={i} className="flex items-center">
                  <span className="mx-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">{skill}</span>
                  <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center space-x-2">
             <div className="flex text-[#FFCC00] text-[9px] space-x-0.5">
               {[...Array(5)].map((_, i) => <i key={i} className="fa-solid fa-star"></i>)}
             </div>
             <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">({instructor.reviewCount || 0} Reviews)</span>
          </div>
        </div>
      </div>

      {/* Meta Information Footer (Tighter Spacing & Centralized) */}
      <div className="mt-auto px-6 pb-6 pt-4 bg-slate-50/50 border-t border-slate-50 flex flex-col items-center space-y-2.5">
        <div className="flex flex-row gap-2 w-full justify-center">
          <div className="flex items-center justify-center px-3 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex-1 max-w-[120px]">
            <i className="fa-solid fa-location-dot text-[10px] mr-2" style={{ color: COLORS.accent }}></i> 
            <span className="text-[8px] font-[900] text-[#1e293b] uppercase truncate">{instructor.location?.lga}</span>
          </div>
          <div className="flex items-center justify-center px-3 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex-1 max-w-[120px]">
            <i className="fa-solid fa-phone text-blue-600 text-[10px] mr-2"></i> 
            <span className="text-[8px] font-[900] text-[#1e293b] truncate">Contact Portal</span>
          </div>
        </div>
        
        <div className="flex items-center justify-center text-[9px] font-black text-slate-400">
          <i className="fa-solid fa-building mr-1.5 text-slate-300 text-[11px]"></i> 
          <span className="italic uppercase tracking-tighter truncate max-w-[200px]">{instructor.location?.address}</span>
        </div>
        
        {showApply && (
          <button 
            onClick={() => onViewProfile?.(instructor.id)}
            className="w-full bg-[#004d2c] hover:bg-[#1e293b] text-white py-4 rounded-[2rem] text-[9px] font-[1000] uppercase tracking-[0.3em] transition-all shadow-lg active:scale-95 flex items-center justify-center space-x-3"
          >
            <span>View Profile</span>
            <i className="fa-solid fa-user-tie text-[10px]"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default InstructorCard;
