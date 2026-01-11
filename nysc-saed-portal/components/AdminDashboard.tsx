
import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { generateQuarterlyReportSummary } from '../services/geminiService';
import { Instructor, Corper, UserRole, Staff, Admin, ApprovalStatus } from '../types';

interface AdminDashboardProps {
  instructors: Instructor[];
  corpers: Corper[];
  staffUsers: Staff[];
  admins: Admin[];
  onUpdateUser: (role: UserRole, id: string, data: any) => void;
  onAddAdmin: (data: any) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  instructors, 
  corpers,
  staffUsers,
  admins,
  onUpdateUser,
  onAddAdmin
}) => {
  const [activeTab, setActiveTab] = useState<'METRICS' | 'INSTRUCTORS' | 'CORPERS' | 'STAFF' | 'ADMINS'>('METRICS');
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<{role: UserRole, user: any} | null>(null);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', role: 'ADMIN' as UserRole });

  // Map plural tab IDs to singular UserRoles
  const getRoleFromTab = (tab: string): UserRole => {
    const map: Record<string, UserRole> = {
      'INSTRUCTORS': 'INSTRUCTOR',
      'CORPERS': 'CORPER',
      'STAFF': 'STAFF',
      'ADMINS': 'ADMIN'
    };
    return map[tab] || (tab as UserRole);
  };

  const metricData = [
    { name: 'ICT', value: instructors.filter(i => i.skills.includes('Web Design')).length * 50 || 450, color: '#10b981' },
    { name: 'Cosmetology', value: 300, color: '#f59e0b' },
    { name: 'Agriculture', value: 200, color: '#3b82f6' },
    { name: 'Construction', value: 150, color: '#ef4444' },
  ];

  const handleGenerateReport = async () => {
    setLoading(true);
    const summary = await generateQuarterlyReportSummary({ 
      stats: {
        totalInstructors: instructors.length,
        totalCorpers: corpers.length,
        totalStaff: staffUsers.length,
        pendingApprovals: [
          ...instructors, ...corpers, ...staffUsers, ...admins
        ].filter(u => u.status === 'PENDING').length
      }
    });
    setReport(summary);
    setLoading(false);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdateUser(editingUser.role, editingUser.user.id, editingUser.user);
      setEditingUser(null);
    }
  };

  const handleQuickStatusUpdate = (tabName: string, id: string, status: ApprovalStatus) => {
    onUpdateUser(getRoleFromTab(tabName), id, { status });
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAdmin({ ...newAdmin, id: `admin-${Date.now()}`, status: 'PENDING' });
    setShowAddAdmin(false);
    setNewAdmin({ name: '', email: '', password: '', role: 'ADMIN' });
  };

  const getCurrentData = () => {
    switch(activeTab) {
      case 'INSTRUCTORS': return instructors;
      case 'CORPERS': return corpers;
      case 'STAFF': return staffUsers;
      case 'ADMINS': return admins;
      default: return [];
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">Command Center</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.25em]">Full System Authority • Root Access</p>
        </div>
        
        <div className="bg-white p-1.5 rounded-[2rem] border border-gray-100 flex shadow-xl overflow-x-auto">
          {[
            { id: 'METRICS', icon: 'fa-chart-simple', label: 'Metrics' },
            { id: 'INSTRUCTORS', icon: 'fa-chalkboard-user', label: 'Instructors' },
            { id: 'CORPERS', icon: 'fa-user-graduate', label: 'Corpers' },
            { id: 'STAFF', icon: 'fa-building-user', label: 'Staff' },
            { id: 'ADMINS', icon: 'fa-shield-halved', label: 'Admins' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-[#008751] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <i className={`fa-solid ${tab.icon}`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'METRICS' && (
        <div className="animate-fade-in space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Pending Approvals</p>
               <p className="text-4xl font-black text-gray-900 tracking-tighter">
                 {[...instructors, ...corpers, ...staffUsers, ...admins].filter(u => u.status === 'PENDING').length}
               </p>
               <div className="mt-4 flex items-center space-x-2 text-yellow-600 font-black text-[10px] uppercase">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                  <span>Action Required</span>
               </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Total Instructors</p>
               <p className="text-4xl font-black text-gray-900 tracking-tighter">{instructors.length}</p>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Total Corpers</p>
               <p className="text-4xl font-black text-gray-900 tracking-tighter">{corpers.length}</p>
            </div>
            <div className="bg-[#008751] p-8 rounded-[2.5rem] shadow-2xl text-[#FFCC00]">
               <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-3">System Health</p>
               <p className="text-4xl font-black tracking-tighter">99.9%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 h-80">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={metricData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {metricData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 flex flex-col justify-center items-center text-center">
               <div className="w-20 h-20 bg-green-50 rounded-[2rem] flex items-center justify-center text-[#008751] mb-6">
                  <i className="fa-solid fa-wand-magic-sparkles text-3xl"></i>
               </div>
               <h3 className="text-2xl font-black text-gray-900 mb-2">AI Strategic Engine</h3>
               <p className="text-gray-500 font-medium mb-8 max-w-sm">Analyze across-role signups and system performance trends.</p>
               <button 
                  onClick={handleGenerateReport}
                  disabled={loading}
                  className="bg-[#008751] text-[#FFCC00] px-10 py-4 rounded-2xl font-black shadow-xl uppercase text-xs tracking-widest transition active:scale-95 disabled:opacity-50"
               >
                 {loading ? 'Processing...' : 'Run Analysis'}
               </button>
            </div>
          </div>

          {report && (
            <div className="bg-white p-12 rounded-[4rem] border-2 border-green-500/20 shadow-2xl animate-fade-in">
               <div className="prose max-w-none text-gray-700 leading-relaxed font-medium whitespace-pre-wrap text-lg">
                  {report}
               </div>
            </div>
          )}
        </div>
      )}

      {activeTab !== 'METRICS' && (
        <div className="animate-fade-in space-y-6">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-2xl font-black text-gray-900">{activeTab} Directory</h2>
             {activeTab === 'ADMINS' && (
               <button 
                onClick={() => setShowAddAdmin(true)}
                className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition"
               >
                 <i className="fa-solid fa-plus mr-2"></i> Add New Admin
               </button>
             )}
          </div>

          <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                   <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <th className="px-10 py-6">Identity</th>
                      <th className="px-10 py-6">Metadata</th>
                      <th className="px-10 py-6">Security Status</th>
                      <th className="px-10 py-6 text-right">Access Controls</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {getCurrentData().map((user: any) => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition duration-300">
                         <td className="px-10 py-6">
                            <div className="flex items-center space-x-4">
                               <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden border border-gray-100 p-1 flex items-center justify-center">
                                  {user.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover rounded-xl" /> : <i className="fa-solid fa-user text-gray-300"></i>}
                               </div>
                               <div>
                                  <p className="font-black text-gray-900">{user.name}</p>
                                  <p className="text-[10px] font-bold text-gray-400">{user.email}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-10 py-6">
                            <p className="text-xs font-bold text-gray-700">{user.location?.state || user.state || user.stateOfService || 'National'}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                              {activeTab === 'CORPERS' ? user.stateCode : activeTab === 'INSTRUCTORS' ? user.headline : user.department || 'Directorate'}
                            </p>
                         </td>
                         <td className="px-10 py-6">
                            <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border ${
                              user.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' : 
                              user.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 
                              'bg-red-50 text-red-700 border-red-100'
                            }`}>
                              {user.status || 'PENDING'}
                            </span>
                         </td>
                         <td className="px-10 py-6 text-right">
                            <div className="flex justify-end items-center space-x-3">
                               {user.status === 'PENDING' && (
                                 <div className="flex space-x-2 mr-4 pr-4 border-r border-gray-100">
                                   <button 
                                      onClick={() => handleQuickStatusUpdate(activeTab, user.id, 'APPROVED')}
                                      className="w-10 h-10 flex items-center justify-center bg-green-500 text-white rounded-xl shadow-lg shadow-green-900/20 hover:scale-110 transition"
                                      title="Approve User"
                                   >
                                      <i className="fa-solid fa-check"></i>
                                   </button>
                                   <button 
                                      onClick={() => handleQuickStatusUpdate(activeTab, user.id, 'REJECTED')}
                                      className="w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded-xl shadow-lg shadow-red-900/20 hover:scale-110 transition"
                                      title="Reject User"
                                   >
                                      <i className="fa-solid fa-xmark"></i>
                                   </button>
                                 </div>
                               )}
                               <button 
                                 onClick={() => setEditingUser({ role: getRoleFromTab(activeTab), user: {...user} })}
                                 className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 text-gray-600 rounded-xl shadow-sm hover:border-[#008751] hover:text-[#008751] transition"
                               >
                                  <i className="fa-solid fa-pen-to-square"></i>
                               </button>
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>
      )}

      {/* Editing Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in">
              <div className="bg-[#008751] p-8 text-white flex justify-between items-center">
                 <div>
                   <h3 className="text-2xl font-black tracking-tighter">Edit {editingUser.role} Profile</h3>
                   <p className="text-[10px] font-black uppercase tracking-widest text-green-200">System Override Active</p>
                 </div>
                 <button onClick={() => setEditingUser(null)} className="text-2xl hover:scale-110 transition"><i className="fa-solid fa-xmark"></i></button>
              </div>
              <form onSubmit={handleEditSave} className="p-10 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Identity</label>
                       <input 
                         className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold outline-none focus:ring-4 focus:ring-green-500/10"
                         value={editingUser.user.name}
                         onChange={e => setEditingUser({...editingUser, user: {...editingUser.user, name: e.target.value}})}
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Official Email</label>
                       <input 
                         className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold outline-none focus:ring-4 focus:ring-green-500/10"
                         value={editingUser.user.email}
                         onChange={e => setEditingUser({...editingUser, user: {...editingUser.user, email: e.target.value}})}
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">System Password</label>
                       <input 
                         type="text"
                         className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold outline-none focus:ring-4 focus:ring-green-500/10"
                         value={editingUser.user.password || ''}
                         placeholder="Set new password..."
                         onChange={e => setEditingUser({...editingUser, user: {...editingUser.user, password: e.target.value}})}
                       />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Status</label>
                      <select 
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold outline-none"
                        value={editingUser.user.status}
                        onChange={e => setEditingUser({...editingUser, user: {...editingUser.user, status: e.target.value}})}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </div>
                 </div>

                 {editingUser.role === 'CORPER' && (
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">State Code</label>
                       <input 
                         className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold outline-none focus:ring-4 focus:ring-green-500/10"
                         value={editingUser.user.stateCode}
                         onChange={e => setEditingUser({...editingUser, user: {...editingUser.user, stateCode: e.target.value}})}
                       />
                    </div>
                 )}

                 <div className="flex gap-4 pt-4">
                    <button type="submit" className="flex-grow bg-[#008751] text-[#FFCC00] py-4 rounded-2xl font-black shadow-xl shadow-green-900/20 uppercase text-xs tracking-widest">Commit Changes</button>
                    <button type="button" onClick={() => setEditingUser(null)} className="px-8 bg-gray-100 text-gray-400 py-4 rounded-2xl font-black uppercase text-xs tracking-widest">Cancel</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {showAddAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
              <div className="bg-gray-900 p-8 text-white flex justify-between items-center">
                 <h3 className="text-2xl font-black tracking-tighter">Provision New Admin</h3>
                 <button onClick={() => setShowAddAdmin(false)} className="text-2xl"><i className="fa-solid fa-xmark"></i></button>
              </div>
              <form onSubmit={handleCreateAdmin} className="p-10 space-y-6">
                 <div className="space-y-4">
                    <input 
                      placeholder="Admin Name"
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold outline-none"
                      value={newAdmin.name}
                      onChange={e => setNewAdmin({...newAdmin, name: e.target.value})}
                      required
                    />
                    <input 
                      placeholder="Admin Email"
                      type="email"
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold outline-none"
                      value={newAdmin.email}
                      onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                      required
                    />
                    <input 
                      placeholder="Initial Password"
                      type="text"
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold outline-none"
                      value={newAdmin.password}
                      onChange={e => setNewAdmin({...newAdmin, password: e.target.value})}
                      required
                    />
                 </div>
                 <button type="submit" className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black shadow-xl uppercase text-xs tracking-widest">Generate Credentials</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
