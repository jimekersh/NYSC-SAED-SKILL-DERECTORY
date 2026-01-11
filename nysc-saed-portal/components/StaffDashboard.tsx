
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateQuarterlyReportSummary } from '../services/geminiService';
import { Registration, Staff } from '../types';
import { NIGERIA_STATES, NIGERIA_LGAS, COLORS, NYSC_LOGO_URL } from '../constants';

interface StaffDashboardProps {
  registrations: Registration[];
  staff: Staff | null;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ registrations, staff }) => {
  const [selectedState, setSelectedState] = useState<string>('National');
  const [selectedLga, setSelectedLga] = useState<string>('All LGAs');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('All Year');
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Available LGAs based on selected state
  const availableLgas = useMemo(() => {
    if (selectedState === 'National') return [];
    return NIGERIA_LGAS[selectedState] || NIGERIA_LGAS['Default'];
  }, [selectedState]);

  // If staff is pending, show the review screen
  if (staff?.status === 'PENDING') {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4">
        <div className="bg-white rounded-[4rem] shadow-2xl border border-gray-100 p-12 md:p-24 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
           <div className="relative z-10">
              <div className="w-40 h-40 bg-white rounded-[3rem] shadow-xl border border-green-100 mx-auto flex items-center justify-center mb-10 group hover:scale-105 transition duration-500">
                 <img src={NYSC_LOGO_URL} className="w-24 h-24 object-contain animate-pulse" alt="NYSC" />
              </div>
              <h1 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Staff Credentials Under Review</h1>
              <p className="text-lg text-gray-500 font-medium max-w-lg mx-auto leading-relaxed mb-12">
                Your administrative access request is currently being processed. Monitoring & Evaluation capabilities will be activated upon official clearance.
              </p>
           </div>
        </div>
      </div>
    );
  }

  // Helper to determine quarter from date string
  const getQuarterFromDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth(); // 0-11
    if (month <= 2) return '1st QT';
    if (month <= 5) return '2nd QT';
    if (month <= 8) return '3rd QT';
    return '4th QT';
  };

  // Filtered registrations based on ALL controls
  const filteredRegs = useMemo(() => {
    return registrations.filter(reg => {
      // In a real database, state/lga would be part of registration or join
      // We assume Kaduna/Chikun for mock/demo purposes if fields are missing
      const regState = 'Kaduna'; 
      const regLga = 'Chikun';
      const regQuarter = getQuarterFromDate(reg.date);

      const stateMatch = selectedState === 'National' || regState === selectedState;
      const lgaMatch = selectedLga === 'All LGAs' || regLga === selectedLga;
      const quarterMatch = selectedQuarter === 'All Year' || regQuarter === selectedQuarter;

      return stateMatch && lgaMatch && quarterMatch;
    });
  }, [registrations, selectedState, selectedLga, selectedQuarter]);

  // Aggregate metrics for the filtered set
  const metrics = useMemo(() => {
    const maleCount = filteredRegs.filter(r => r.gender === 'MALE').length;
    const femaleCount = filteredRegs.filter(r => r.gender === 'FEMALE').length;
    const completedCount = filteredRegs.filter(r => r.status === 'COMPLETED').length;
    
    // Group by state for the chart
    const stateStats: Record<string, number> = {};
    filteredRegs.forEach(r => {
      const s = 'Kaduna'; // Mock logic for grouping
      stateStats[s] = (stateStats[s] || 0) + 1;
    });

    const chartData = Object.entries(stateStats).map(([name, count]) => ({ name, count }));

    return {
      total: filteredRegs.length,
      male: maleCount,
      female: femaleCount,
      completed: completedCount,
      chartData
    };
  }, [filteredRegs]);

  const handleGenerateOfficialReport = async () => {
    setLoading(true);
    const summary = await generateQuarterlyReportSummary({
      context: `Performance Analysis: ${selectedState} > ${selectedLga} [${selectedQuarter}]`,
      metrics: {
        totalEnrolled: metrics.total,
        genderSplit: { male: metrics.male, female: metrics.female },
        completionRate: metrics.total > 0 ? (metrics.completed / metrics.total) * 100 : 0
      },
      totalSystemWide: registrations.length
    });
    setReport(summary);
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">Directorate Monitoring</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.25em]">Strategic Reporting & Live Auditing</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          {/* State Filter */}
          <div className="relative flex-grow sm:flex-grow-0">
            <select 
              className="w-full sm:w-44 px-6 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm font-black text-[10px] uppercase tracking-widest text-[#008751] outline-none appearance-none pr-12 cursor-pointer"
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedLga('All LGAs');
              }}
            >
              <option value="National">National</option>
              {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <i className="fa-solid fa-earth-africa absolute right-6 top-1/2 -translate-y-1/2 text-green-700 pointer-events-none text-xs"></i>
          </div>

          {/* LGA Filter */}
          <div className="relative flex-grow sm:flex-grow-0">
            <select 
              disabled={selectedState === 'National'}
              className="w-full sm:w-44 px-6 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm font-black text-[10px] uppercase tracking-widest text-[#008751] outline-none appearance-none pr-12 cursor-pointer disabled:opacity-30"
              value={selectedLga}
              onChange={(e) => setSelectedLga(e.target.value)}
            >
              <option value="All LGAs">All LGAs</option>
              {availableLgas.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <i className="fa-solid fa-location-dot absolute right-6 top-1/2 -translate-y-1/2 text-green-700 pointer-events-none text-xs"></i>
          </div>

          {/* Quarter Filter */}
          <div className="relative flex-grow sm:flex-grow-0">
            <select 
              className="w-full sm:w-44 px-6 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm font-black text-[10px] uppercase tracking-widest text-[#008751] outline-none appearance-none pr-12 cursor-pointer"
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
            >
              <option value="All Year">All Year</option>
              <option value="1st QT">1st QT (Jan-Mar)</option>
              <option value="2nd QT">2nd QT (Apr-Jun)</option>
              <option value="3rd QT">3rd QT (Jul-Sep)</option>
              <option value="4th QT">4th QT (Oct-Dec)</option>
            </select>
            <i className="fa-solid fa-calendar-check absolute right-6 top-1/2 -translate-y-1/2 text-green-700 pointer-events-none text-xs"></i>
          </div>

          <button 
            onClick={handleGenerateOfficialReport}
            disabled={loading || filteredRegs.length === 0}
            className="bg-[#008751] hover:bg-green-800 text-[#FFCC00] px-8 py-4 rounded-2xl font-black shadow-xl flex items-center justify-center space-x-3 transition active:scale-95 disabled:opacity-50 flex-grow sm:flex-grow-0"
          >
            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
            <span className="uppercase text-[10px] tracking-widest">Generate Report</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <i className="fa-solid fa-users text-6xl"></i>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Enrolled ({selectedQuarter})</p>
          <div className="flex items-end space-x-3">
            <p className="text-5xl font-black text-gray-900 tracking-tighter">{metrics.total}</p>
            <span className="text-green-600 font-black text-[10px] mb-2 uppercase">Students</span>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl group">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Male Participation</p>
          <p className="text-4xl font-black text-gray-900 tracking-tighter">{metrics.male}</p>
          <div className="w-full h-1.5 bg-gray-100 rounded-full mt-5 overflow-hidden">
            <div className="h-full bg-green-600" style={{ width: `${(metrics.male / (metrics.total || 1)) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl group">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Female Participation</p>
          <p className="text-4xl font-black text-gray-900 tracking-tighter">{metrics.female}</p>
          <div className="w-full h-1.5 bg-gray-100 rounded-full mt-5 overflow-hidden">
            <div className="h-full bg-yellow-500" style={{ width: `${(metrics.female / (metrics.total || 1)) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-[#008751] p-8 rounded-[2.5rem] text-[#FFCC00] shadow-2xl">
           <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Success Rate</p>
           <p className="text-4xl font-[1000] tracking-tighter">
             {metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0}%
           </p>
           <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] mt-3">Verified Completions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Visualization Card */}
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl h-[500px] flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-gray-900 flex items-center space-x-3">
               <i className="fa-solid fa-chart-line text-[#008751]"></i>
               <span>Trend Analysis</span>
            </h3>
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Regional Volume</span>
          </div>
          <div className="flex-grow">
            {metrics.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '15px', border: 'none', fontWeight: '900', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#008751" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 font-black uppercase text-xs">
                <i className="fa-solid fa-database mb-4 text-4xl opacity-20"></i>
                <span>No records found for filters</span>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Breakdown Card */}
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl h-[500px] flex flex-col">
          <h3 className="text-xl font-black text-gray-900 mb-10 flex items-center space-x-3">
             <i className="fa-solid fa-table-list text-yellow-500"></i>
             <span>Audited Breakdown</span>
          </h3>
          <div className="flex-grow overflow-y-auto custom-scrollbar space-y-4 pr-2">
            {filteredRegs.length > 0 ? filteredRegs.slice(0, 15).map((reg: any, idx: number) => (
              <div key={reg.id} className="flex items-center p-5 rounded-[2rem] bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-lg transition">
                 <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-[10px] text-gray-400 border border-gray-100 mr-5">{idx+1}</div>
                 <div className="flex-grow">
                   <h4 className="font-black text-gray-900 text-sm leading-none mb-1">{reg.corper_name}</h4>
                   <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{reg.skill_name} • {getQuarterFromDate(reg.date)}</p>
                 </div>
                 <div className="text-right">
                    <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                      reg.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {reg.status}
                    </span>
                 </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                 <i className="fa-solid fa-magnifying-glass text-5xl mb-4"></i>
                 <p className="font-black uppercase text-[10px] tracking-widest">Adjust filters to find records</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Intelligence Output */}
      {report && (
        <div className="bg-white p-12 rounded-[4rem] border-2 border-[#008751]/20 shadow-2xl animate-fade-in max-w-5xl mx-auto">
          <div className="flex items-center space-x-8 mb-10">
            <div className="bg-[#008751] p-5 rounded-[2.5rem] text-[#FFCC00] shadow-2xl">
               <i className="fa-solid fa-microchip text-3xl"></i>
            </div>
            <div>
              <h3 className="text-3xl font-black text-gray-900">SAED Strategic Insight</h3>
              <p className="text-green-700 font-black text-[10px] uppercase tracking-[0.3em]">Audited for {selectedState} ({selectedQuarter})</p>
            </div>
          </div>
          <div className="prose max-w-none text-gray-700 leading-relaxed font-medium whitespace-pre-wrap text-lg bg-gray-50 p-10 rounded-[3rem] border border-gray-100">
            {report}
          </div>
          <div className="mt-8 text-center">
             <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Official AI output • Confidential Directorate Document</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
