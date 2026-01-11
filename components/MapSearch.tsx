
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NIGERIA_STATES, NIGERIA_LGAS, SKILLS, COLORS } from '../constants';
import InstructorCard from './InstructorCard';
import { Instructor } from '../types';
import L from 'leaflet';

interface MapSearchProps {
  instructors: Instructor[];
  onViewProfile: (id: string) => void;
  initialSkill?: string;
  initialState?: string;
  initialLga?: string;
}

const MapSearch: React.FC<MapSearchProps> = ({ instructors, onViewProfile, initialSkill = '', initialState = 'All States', initialLga = 'All LGAs' }) => {
  const [selectedState, setSelectedState] = useState<string>(initialState);
  const [selectedLga, setSelectedLga] = useState<string>(initialLga);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Sectors');
  const [selectedSkill, setSelectedSkill] = useState<string>('All Skills');
  const [searchQuery, setSearchQuery] = useState(initialSkill);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (initialSkill) setSearchQuery(initialSkill);
    if (initialState) setSelectedState(initialState);
    if (initialLga) setSelectedLga(initialLga);
  }, [initialSkill, initialState, initialLga]);

  const categories = useMemo(() => {
    return ['All Sectors', ...Array.from(new Set(SKILLS.map(s => s.category))).sort()];
  }, []);

  const availableSkills = useMemo(() => {
    if (selectedCategory === 'All Sectors') return [];
    return SKILLS.filter(s => s.category === selectedCategory).map(s => s.name).sort();
  }, [selectedCategory]);

  const availableLgas = useMemo(() => {
    if (selectedState === 'All States') return [];
    return NIGERIA_LGAS[selectedState] || NIGERIA_LGAS['Default'];
  }, [selectedState]);

  const filtered = useMemo(() => {
    return instructors.filter(inst => {
      const matchesState = selectedState === 'All States' || inst.location.state === selectedState;
      const matchesLga = selectedLga === 'All LGAs' || inst.location.lga === selectedLga;
      const matchesCategory = selectedCategory === 'All Sectors' || inst.skills.some(s => {
        const skillObj = SKILLS.find(sk => sk.name === s);
        return skillObj?.category === selectedCategory;
      });
      const matchesSkill = selectedSkill === 'All Skills' || inst.skills.includes(selectedSkill);
      const matchesSearch = inst.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            inst.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesState && matchesLga && matchesCategory && matchesSkill && matchesSearch;
    });
  }, [instructors, selectedState, selectedLga, selectedCategory, selectedSkill, searchQuery]);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map-viewport', {
        zoomControl: false,
        attributionControl: false
      }).setView([9.082, 8.6753], 6); // Centered on Nigeria

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(mapRef.current);

      markerLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (markerLayerRef.current && mapRef.current) {
      markerLayerRef.current.clearLayers();

      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${COLORS.green}; width: 12px; height: 12px; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      const bounds = L.latLngBounds([]);
      let hasPoints = false;

      filtered.forEach(inst => {
        if (inst.location?.lat && inst.location?.lng) {
          const marker = L.marker([inst.location.lat, inst.location.lng], { icon: customIcon });
          marker.bindPopup(`
            <div style="font-family: sans-serif; padding: 5px;">
              <h4 style="margin: 0 0 5px 0; font-weight: 900; color: #1e293b;">${inst.name}</h4>
              <p style="margin: 0; font-size: 10px; color: ${COLORS.accent}; font-weight: bold; text-transform: uppercase;">${inst.headline}</p>
              <button onclick="window.location.hash='#/instructor/${inst.id}'" style="margin-top: 10px; width: 100%; background: ${COLORS.green}; color: white; border: none; padding: 6px; border-radius: 8px; font-weight: bold; font-size: 10px; cursor: pointer;">View Profile</button>
            </div>
          `);
          marker.addTo(markerLayerRef.current!);
          bounds.extend([inst.location.lat, inst.location.lng]);
          hasPoints = true;
        }
      });

      if (hasPoints && mapRef.current) {
        mapRef.current.flyToBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      } else if (mapRef.current) {
        mapRef.current.flyTo([9.082, 8.6753], 6);
      }
    }
  }, [filtered]);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-gray-50 overflow-hidden">
      {/* Top Search Bar */}
      <div className="bg-white border-b border-gray-100 p-4 md:p-6 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
            <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input 
              type="text" 
              placeholder="Search instructors by name or skill..."
              className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-900 border border-gray-100 focus:border-green-500 transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select 
              className="flex-1 px-4 py-4 bg-gray-50 rounded-2xl outline-none font-black text-[10px] uppercase tracking-widest border border-gray-100 focus:border-green-500 transition-all cursor-pointer"
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedLga('All LGAs');
              }}
            >
              <option>All States</option>
              {NIGERIA_STATES.map(state => <option key={state} value={state}>{state}</option>)}
            </select>
            <select 
              disabled={selectedState === 'All States'}
              className="flex-1 px-4 py-4 bg-gray-50 rounded-2xl outline-none font-black text-[10px] uppercase tracking-widest border border-gray-100 focus:border-green-500 transition-all disabled:opacity-30 cursor-pointer"
              value={selectedLga}
              onChange={(e) => setSelectedLga(e.target.value)}
            >
              <option>All LGAs</option>
              {availableLgas.map(lga => <option key={lga} value={lga}>{lga}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Main Split Content */}
      <div className="flex flex-col lg:flex-row flex-grow overflow-hidden relative">
        {/* Left Side: Map View */}
        <div className="w-full lg:w-3/5 h-[400px] lg:h-full relative z-10 p-4 lg:p-6">
           <div id="map-container" className="h-full w-full bg-slate-200 rounded-[3rem] shadow-inner overflow-hidden border-4 border-white">
              <div id="map-viewport" className="h-full w-full"></div>
              
              {/* Floating Map UI */}
              <div className="absolute top-10 left-10 pointer-events-none">
                 <div className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-white/20 pointer-events-auto">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Sector</p>
                    <select 
                      className="bg-transparent font-black text-xs uppercase text-green-800 outline-none cursor-pointer"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                 </div>
              </div>

              <div className="absolute bottom-10 left-10 right-10 flex justify-center pointer-events-none">
                 <div className="bg-gray-900/90 backdrop-blur-md px-6 py-4 rounded-[2rem] shadow-2xl border border-white/10 flex items-center space-x-4 pointer-events-auto text-white">
                    <div className="flex -space-x-3">
                      {filtered.slice(0, 3).map((inst, i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-gray-900 overflow-hidden bg-gray-800">
                          <img src={inst.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(inst.name)}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Total Vetted</p>
                       <p className="text-xs font-black">{filtered.length} Professional Mentors</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Side: Results List */}
        <div className="w-full lg:w-2/5 flex flex-col h-full bg-gray-50 border-l border-gray-100">
          <div className="p-6 md:p-8 flex-grow overflow-y-auto custom-scrollbar">
            <div className="mb-10 flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Directory</h2>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-gray-100">{filtered.length} Matches</span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {filtered.map(inst => (
                <div key={inst.id} className="animate-fade-in">
                  <InstructorCard 
                    instructor={inst} 
                    showApply={true} 
                    onViewProfile={onViewProfile} 
                  />
                </div>
              ))}
              
              {filtered.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center px-10">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100 text-gray-200">
                    <i className="fa-solid fa-map-pin text-3xl"></i>
                  </div>
                  <h3 className="text-xl font-black text-gray-800 mb-2">No results in this area</h3>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest max-w-[200px]">Try broadening your filters or searching a different state.</p>
                  <button 
                    onClick={() => {
                      setSelectedState('All States');
                      setSelectedCategory('All Sectors');
                      setSearchQuery('');
                    }}
                    className="mt-8 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapSearch;
