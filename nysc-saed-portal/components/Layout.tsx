
import React, { useState } from 'react';
import { UserRole } from '../types';
import Sidebar from './Sidebar';
import { NYSC_LOGO_URL, NYSC_LOGO_BACKUP } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentHash: string;
  navigateTo: (path: string) => void;
  onSignOut: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, role, setRole, currentHash, navigateTo, onSignOut }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== NYSC_LOGO_BACKUP) {
      target.src = NYSC_LOGO_BACKUP;
    }
  };

  const handleNavigate = (path: string) => {
    navigateTo(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative flex justify-center">
      <Sidebar 
        role={role} 
        currentHash={currentHash} 
        setRole={setRole} 
        navigateTo={handleNavigate} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onSignOut={onSignOut}
      />

      <div className="md:pl-72 flex flex-col min-h-screen w-full">
        {/* Mobile Header */}
        <header className="md:hidden bg-[#008751] text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-lg border-b border-white/10 w-full">
          <div className="flex items-center space-x-3">
             <div className="bg-white p-1 rounded-lg cursor-pointer" onClick={() => handleNavigate('#/home')}>
                <img src={NYSC_LOGO_URL} className="h-8 w-8 object-contain" alt="NYSC" onError={handleImgError} />
             </div>
             <div className="flex flex-col cursor-pointer" onClick={() => handleNavigate('#/home')}>
                <span className="font-black tracking-tight text-xs leading-none">SAED PORTAL</span>
                <span className="text-[7px] font-bold uppercase tracking-widest opacity-80 mt-1">Nigeria</span>
             </div>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl hover:bg-white/20 transition-all active:scale-90"
          >
             <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
          </button>
        </header>

        {/* Centralized Main Content */}
        <main className="flex-grow w-full flex flex-col items-center">
          <div className="w-full max-w-screen-2xl">
            <div className="p-4 md:p-8 lg:p-12">
              {children}
            </div>
          </div>
        </main>

        <footer className="px-6 md:px-12 py-12 bg-white border-t border-gray-100 w-full flex flex-col items-center">
          <div className="max-w-7xl w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-gray-400 text-sm">
              <div className="flex items-center space-x-4 mb-6 md:mb-0 cursor-pointer group" onClick={() => handleNavigate('#/home')}>
                <div className="w-12 h-12 bg-gray-50 rounded-xl p-2 flex items-center justify-center border border-gray-100 group-hover:border-green-200 transition-colors">
                  <img src={NYSC_LOGO_URL} className="w-full h-full object-contain" alt="NYSC Logo" onError={handleImgError} />
                </div>
                <div>
                  <p className="font-black text-gray-900 leading-none">NYSC SAED</p>
                  <p className="text-[10px] font-bold mt-1 text-gray-500">Skill Acquisition and Entrepreneurship Development</p>
                  <p className="text-[9px] font-black mt-1 text-green-700 uppercase tracking-tighter">developed by Extol Techlink NG. 2026</p>
                </div>
              </div>
              <div className="flex space-x-8 font-bold uppercase tracking-widest text-[10px]">
                <button onClick={() => handleNavigate('#/home')} className="hover:text-green-700 transition text-left">Terms</button>
                <button onClick={() => handleNavigate('#/home')} className="hover:text-green-700 transition text-left">Privacy</button>
                <button onClick={() => handleNavigate('#/home')} className="hover:text-green-700 transition text-left">HQ Contact</button>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-50 text-center flex flex-col items-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] leading-relaxed">
                © 2024 National Youth Service Corps. Service and Humility.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
