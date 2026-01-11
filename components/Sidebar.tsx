
import React, { useState } from 'react';
import { UserRole } from '../types';
import { NYSC_LOGO_URL, NYSC_LOGO_BACKUP, COLORS } from '../constants';

interface SidebarProps {
  role: UserRole;
  currentHash: string;
  setRole: (role: UserRole) => void;
  navigateTo: (path: string) => void;
  onSignOut: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, currentHash, setRole, navigateTo, onSignOut, isOpen, onClose }) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== NYSC_LOGO_BACKUP) {
      target.src = NYSC_LOGO_BACKUP;
    }
    setImgLoaded(true);
  };

  const getLinks = () => {
    const homeLink = { label: 'Home', hash: '#/home', icon: 'fa-house' };
    
    let roleLinks: { label: string; hash: string; icon: string }[] = [];

    switch (role) {
      case 'ADMIN':
        roleLinks = [
          { label: 'Control Panel', hash: '#/dashboard', icon: 'fa-shield-halved' },
          { label: 'Browse Directory', hash: '#/directory', icon: 'fa-magnifying-glass' },
        ];
        break;
      case 'STAFF':
        roleLinks = [
          { label: 'National Dashboard', hash: '#/dashboard', icon: 'fa-chart-pie' },
        ];
        break;
      case 'INSTRUCTOR':
        roleLinks = [
          { label: 'My Dashboard', hash: '#/dashboard', icon: 'fa-chalkboard-user' },
        ];
        break;
      case 'CORPER':
        roleLinks = [
          { label: 'My Training', hash: '#/dashboard', icon: 'fa-rocket' },
          { label: 'Map Search', hash: '#/map', icon: 'fa-map-location-dot' },
          { label: 'Browse Directory', hash: '#/directory', icon: 'fa-magnifying-glass' },
        ];
        break;
      default: // GUEST
        roleLinks = [
          { label: 'Map Search', hash: '#/map', icon: 'fa-map-location-dot' },
          { label: 'Browse Directory', hash: '#/directory', icon: 'fa-magnifying-glass' },
        ];
        break;
    }

    return [homeLink, ...roleLinks];
  };

  const links = getLinks();
  
  const isActive = (targetHash: string) => {
    return currentHash === targetHash;
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div 
        className={`fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[55] transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>

      <aside className={`
        w-72 bg-white border-r border-gray-100 h-screen fixed top-0 left-0 flex flex-col z-[60] shadow-2xl md:shadow-none
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Mobile Header Close Button */}
        <div className="md:hidden flex justify-end p-4">
           <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
              <i className="fa-solid fa-xmark"></i>
           </button>
        </div>

        <div className="p-8 border-b border-gray-50 flex flex-col items-center text-center">
          <div 
            onClick={() => navigateTo('#/home')}
            className="bg-white p-3 rounded-2xl shadow-xl shadow-green-900/10 mb-5 border border-gray-100 flex items-center justify-center overflow-hidden w-28 h-28 relative cursor-pointer group"
          >
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 animate-pulse">
                <i className="fa-solid fa-circle-notch fa-spin text-gray-300"></i>
              </div>
            )}
            <img 
              src={NYSC_LOGO_URL} 
              alt="NYSC Official Logo" 
              className={`w-full h-full object-contain pointer-events-none relative z-10 transition-all duration-300 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`} 
              onLoad={() => setImgLoaded(true)}
              onError={handleImgError}
            />
          </div>
          <div className="space-y-1">
            <h1 className="font-black text-gray-900 text-xl tracking-tight leading-none">SAED PORTAL</h1>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: COLORS.green }}>
              National Youth Service Corps
            </p>
          </div>
        </div>
        
        <nav className="flex-grow p-6 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="text-[11px] font-bold text-gray-300 uppercase tracking-[0.2em] px-4 mb-4">Portal Menu</div>
          {links.map((link, idx) => {
            const active = isActive(link.hash);
            return (
              <button
                key={`${link.hash}-${idx}`}
                onClick={() => navigateTo(link.hash)}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm text-left ${
                  active
                    ? 'text-white shadow-lg'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: active ? COLORS.green : 'transparent',
                  color: active ? 'white' : ''
                }}
              >
                <i className={`fa-solid ${link.icon} w-5 text-center`}></i>
                <span>{link.label}</span>
              </button>
            );
          })}

          {role === 'GUEST' && (
            <div className="pt-8 space-y-3">
               <div className="text-[11px] font-bold text-gray-300 uppercase tracking-[0.2em] px-4 mb-2">Login Access</div>
               <button 
                onClick={() => navigateTo('#/register-corper')}
                className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition border border-transparent hover:border-green-100"
                style={{ backgroundColor: `${COLORS.green}10`, color: COLORS.green }}
               >
                 <i className="fa-solid fa-user-graduate w-5"></i>
                 <span>Corper Login</span>
               </button>
               <button 
                onClick={() => navigateTo('#/register-staff')}
                className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-sm font-bold bg-yellow-400 text-white hover:bg-yellow-500 transition shadow-sm"
               >
                 <i className="fa-solid fa-building-user w-5"></i>
                 <span>Staff Hub Access</span>
               </button>
               <button 
                onClick={() => navigateTo('#/register-instructor')}
                className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-sm font-bold bg-gray-900 text-white hover:bg-gray-800 transition"
               >
                 <i className="fa-solid fa-chalkboard-user w-5"></i>
                 <span>Instructor Access</span>
               </button>
               <button 
                onClick={() => navigateTo('#/register-admin')}
                className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-sm font-bold bg-red-800 text-white hover:bg-red-900 transition shadow-lg"
               >
                 <i className="fa-solid fa-shield-halved w-5"></i>
                 <span>Root Admin Console</span>
               </button>
            </div>
          )}
        </nav>

        <div className="p-6 border-t border-gray-50 bg-gray-50/50">
          <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden p-1.5 border border-gray-50 ${role === 'ADMIN' ? 'bg-red-100' : 'bg-gray-100'}`}>
                <img src={NYSC_LOGO_URL} className="w-full h-full object-contain" alt="NYSC Logo" onError={handleImgError} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-black text-gray-900 truncate">{role} Mode</p>
                <p className="text-[9px] font-bold text-green-600 truncate uppercase tracking-tighter">Active Session</p>
              </div>
            </div>
            {role !== 'GUEST' && (
              <button 
                onClick={onSignOut}
                className="w-full text-xs font-black text-red-500 hover:bg-red-50 py-2.5 rounded-xl transition"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
