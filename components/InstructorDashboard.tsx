
import React, { useRef, useState } from 'react';
import { Registration, Instructor } from '../types';
import { NYSC_LOGO_URL } from '../constants';
import { updateRegistrationStatus } from '../services/supabaseService';

interface InstructorDashboardProps {
  instructor: Instructor | null;
  onUpdateInstructor: (data: Partial<Instructor>) => void;
  registrations: Registration[];
  setRegistrations: React.Dispatch<React.SetStateAction<Registration[]>>;
}

const InstructorDashboard: React.FC<InstructorDashboardProps> = ({ instructor, onUpdateInstructor, registrations, setRegistrations }) => {
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Instructor>>({});

  const updateStatus = async (id: string, status: 'ACCEPTED' | 'REJECTED' | 'COMPLETED') => {
    try {
      await updateRegistrationStatus(id, status);
      // Local state will be updated via real-time subscription in App.tsx
    } catch (err: any) {
      alert("Status update failed: " + err.message);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (type === 'profile') {
        onUpdateInstructor({ profilePic: base64 });
      } else {
        onUpdateInstructor({ coverImage: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenEdit = () => {
    setEditFormData({
      name: instructor?.name || '',
      headline: instructor?.headline || '',
      about: instructor?.about || '',
      phoneNumber: instructor?.phoneNumber || '',
      linkedInUrl: instructor?.linkedInUrl || '',
      location: instructor?.location ? { ...instructor.location } : undefined
    });
    setIsEditing(true);
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateInstructor(editFormData);
    setIsEditing(false);
  };

  const currentInstructorStatus = instructor?.status || 'PENDING';
  const instructorId = instructor?.id || 'inst-1';

  if (currentInstructorStatus === 'PENDING') {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4">
        <div className="bg-white rounded-[4rem] shadow-2xl border border-gray-100 p-12 md:p-24 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
           
           <div className="relative z-10">
              <div className="w-40 h-40 bg-white rounded-[3rem] shadow-xl border border-yellow-100 mx-auto flex items-center justify-center mb-10 group hover:scale-105 transition duration-500">
                 <img src={NYSC_LOGO_URL} className="w-24 h-24 object-contain animate-pulse" alt="NYSC" />
              </div>
              
              <h1 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Application Under Review</h1>
              <p className="text-lg text-gray-500 font-medium max-w-lg mx-auto leading-relaxed mb-12">
                Thank you for your interest in the NYSC SAED program. Your professional profile is currently being vetted by our National Directorate for quality assurance.
              </p>

              <div className="max-w-xs mx-auto bg-gray-50 p-6 rounded-3xl border border-gray-100 mb-12">
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification Status</span>
                    <span className="text-[10px] font-black text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full uppercase">In Progress</span>
                 </div>
                 <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-yellow-400 animate-pulse"></div>
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                 <div className="flex items-center space-x-2 text-[#008751] font-bold">
                    <i className="fa-solid fa-circle-check"></i>
                    <span>Profile Registered</span>
                 </div>
                 <div className="flex items-center space-x-2 text-yellow-600 font-bold">
                    <i className="fa-solid fa-hourglass-half"></i>
                    <span>Admin Verification</span>
                 </div>
                 <div className="flex items-center space-x-2 text-gray-300 font-bold">
                    <i className="fa-solid fa-circle"></i>
                    <span>Portal Activated</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  const myRegistrations = registrations.filter(r => r.instructor_id === instructorId);

  const stats = {
    pending: myRegistrations.filter(r => r.status === 'PENDING').length,
    total: myRegistrations.length,
    completed: myRegistrations.filter(r => r.status === 'COMPLETED').length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl mb-12">
        <div 
          className="h-64 bg-cover bg-center relative group cursor-pointer bg-gray-100"
          style={{ backgroundImage: instructor?.coverImage ? `url(${instructor.coverImage})` : 'none' }}
          onClick={() => coverInputRef.current?.click()}
        >
          {!instructor?.coverImage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
               <i className="fa-solid fa-image text-5xl mb-2"></i>
               <p className="text-[10px] font-black uppercase tracking-widest">Click to upload cover</p>
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center">
              <i className="fa-solid fa-camera mr-2"></i> Change Cover Image
            </div>
          </div>
          <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} />
        </div>
        
        <div className="px-10 pb-10 relative">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8">
            <div className="flex flex-col md:flex-row items-end gap-8">
              {/* Profile Pic with Fallback */}
              <div className="relative group cursor-pointer -mt-24" onClick={() => profileInputRef.current?.click()}>
                <div className="p-1.5 bg-white rounded-[2.5rem] shadow-2xl relative z-10 w-44 h-44 overflow-hidden">
                  {instructor?.profilePic ? (
                    <img src={instructor.profilePic} className="w-full h-full rounded-[2.2rem] object-cover border-4 border-white shadow-inner" alt={instructor?.name} onError={(e) => (e.currentTarget.style.display = 'none')} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-200">
                      <i className="fa-solid fa-user text-6xl"></i>
                    </div>
                  )}
                </div>
                <div className="absolute inset-1.5 rounded-[2.2rem] bg-black/40 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-2xl">
                  <i className="fa-solid fa-camera"></i>
                </div>
                <input type="file" ref={profileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'profile')} />
              </div>
              
              <div className="pb-4 pt-2 text-center md:text-left">
                <h2 className="text-3xl font-black text-gray-900 flex items-center justify-center md:justify-start tracking-tight">
                  {instructor?.name}
                  <i className="fa-solid fa-circle-check text-green-600 ml-2 text-xl"></i>
                </h2>
                <p className="text-green-700 font-black uppercase tracking-widest text-[10px] mt-1">{instructor?.headline}</p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                  {instructor?.skills?.map(skill => (
                    <span key={skill} className="bg-gray-50 text-gray-500 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-gray-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pb-4">
               <button 
                  onClick={handleOpenEdit}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-2xl text-xs font-black transition flex items-center shadow-sm"
               >
                  <i className="fa-solid fa-pen-to-square mr-2"></i> Edit Details
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Details Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
           <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in">
              <div className="bg-[#008751] p-8 text-white flex justify-between items-center">
                 <div>
                   <h3 className="text-2xl font-black tracking-tighter">Edit Professional Profile</h3>
                   <p className="text-[10px] font-black uppercase tracking-widest text-green-200">National SAED Instructor Portal</p>
                 </div>
                 <button onClick={() => setIsEditing(false)} className="text-2xl hover:scale-110 transition">
                   <i className="fa-solid fa-xmark"></i>
                 </button>
              </div>
              <form onSubmit={handleSaveDetails} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Identity</label>
                       <input 
                         className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold outline-none focus:ring-4 focus:ring-green-500/10"
                         value={editFormData.name}
                         onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                         required
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                       <input 
                         className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold outline-none focus:ring-4 focus:ring-green-500/10"
                         value={editFormData.phoneNumber}
                         onChange={e => setEditFormData({...editFormData, phoneNumber: e.target.value})}
                         required
                       />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Professional Headline</label>
                    <input 
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold outline-none focus:ring-4 focus:ring-green-500/10"
                      value={editFormData.headline}
                      onChange={e => setEditFormData({...editFormData, headline: e.target.value})}
                      required
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">LinkedIn URL</label>
                    <input 
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold outline-none focus:ring-4 focus:ring-green-500/10"
                      value={editFormData.linkedInUrl}
                      onChange={e => setEditFormData({...editFormData, linkedInUrl: e.target.value})}
                      placeholder="https://linkedin.com/..."
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Office Address</label>
                    <input 
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold outline-none focus:ring-4 focus:ring-green-500/10"
                      value={editFormData.location?.address}
                      onChange={e => setEditFormData({
                        ...editFormData, 
                        location: editFormData.location ? { ...editFormData.location, address: e.target.value } : { address: e.target.value, lat: 0, lng: 0, state: '', lga: '' }
                      })}
                      required
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Biography / About Me</label>
                    <textarea 
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-4 focus:ring-green-500/10 h-32 resize-none"
                      value={editFormData.about}
                      onChange={e => setEditFormData({...editFormData, about: e.target.value})}
                      required
                    />
                 </div>

                 <div className="flex gap-4 pt-4 pb-2">
                    <button type="submit" className="flex-grow bg-[#008751] text-[#FFCC00] py-4 rounded-2xl font-black shadow-xl shadow-green-900/20 uppercase text-xs tracking-widest active:scale-95 transition">
                      Commit Changes
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} className="px-8 bg-gray-100 text-gray-400 py-4 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition">
                      Cancel
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl flex items-center space-x-6">
          <div className="bg-yellow-50 p-5 rounded-3xl text-yellow-600 shadow-inner">
            <i className="fa-solid fa-clock-rotate-left text-2xl"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Requests</p>
            <p className="text-3xl font-black text-gray-900">{stats.pending}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl flex items-center space-x-6">
          <div className="bg-blue-50 p-5 rounded-3xl text-blue-600 shadow-inner">
            <i className="fa-solid fa-users text-2xl"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Students</p>
            <p className="text-3xl font-black text-gray-900">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl flex items-center space-x-6">
          <div className="bg-green-50 p-5 rounded-3xl text-green-600 shadow-inner">
            <i className="fa-solid fa-graduation-cap text-2xl"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Completions</p>
            <p className="text-3xl font-black text-gray-900">{stats.completed}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="px-10 py-6 border-b bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-black text-gray-800 uppercase tracking-tighter">Registration Requests</h3>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Enrollment Data</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white">
                <th className="px-10 py-6">Corper Name</th>
                <th className="px-10 py-6">Applied Date</th>
                <th className="px-10 py-6">Skill Path</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {myRegistrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-gray-50 transition group">
                  <td className="px-10 py-6 font-black text-gray-900">{reg.corper_name}</td>
                  <td className="px-10 py-6 text-xs font-bold text-gray-500">{new Date(reg.date).toLocaleDateString()}</td>
                  <td className="px-10 py-6">
                    <span className="bg-green-50 text-[#008751] px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-green-100">
                      {reg.skill_name}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-colors ${
                      reg.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                      reg.status === 'ACCEPTED' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      reg.status === 'COMPLETED' ? 'bg-green-600 text-white border-green-700 shadow-md' :
                      'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {reg.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    {reg.status === 'PENDING' && (
                      <div className="flex justify-end space-x-3">
                        <button 
                          onClick={() => updateStatus(reg.id, 'ACCEPTED')} 
                          className="w-10 h-10 flex items-center justify-center bg-green-600 text-white rounded-xl shadow-lg shadow-green-900/20 hover:scale-110 transition active:scale-95"
                          title="Accept Enrolment"
                        >
                          <i className="fa-solid fa-check"></i>
                        </button>
                        <button 
                          onClick={() => updateStatus(reg.id, 'REJECTED')} 
                          className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 text-red-500 rounded-xl shadow-sm hover:bg-red-50 transition active:scale-95"
                          title="Reject Application"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    )}
                    {reg.status === 'ACCEPTED' && (
                      <button 
                        onClick={() => updateStatus(reg.id, 'COMPLETED')}
                        className="bg-yellow-400 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 transition shadow-lg shadow-yellow-900/20 active:scale-95 flex items-center ml-auto"
                      >
                        <i className="fa-solid fa-graduation-cap mr-2"></i>
                        Complete Training
                      </button>
                    )}
                    {reg.status === 'COMPLETED' && (
                      <div className="flex items-center justify-end space-x-4">
                        <div className="flex items-center text-green-600 font-black text-[10px] uppercase tracking-widest">
                          <i className="fa-solid fa-certificate mr-2"></i>
                          Certified
                        </div>
                        <button 
                          onClick={() => updateStatus(reg.id, 'ACCEPTED')}
                          className="text-gray-400 hover:text-red-500 transition-colors text-[9px] font-black uppercase tracking-widest flex items-center bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 shadow-sm"
                          title="Undo Completion"
                        >
                          <i className="fa-solid fa-rotate-left mr-1"></i> Undo
                        </button>
                      </div>
                    )}
                    {reg.status === 'REJECTED' && (
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Closed</span>
                    )}
                  </td>
                </tr>
              ))}
              {myRegistrations.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-10 py-20 text-center text-gray-400 font-bold">No applications received yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
