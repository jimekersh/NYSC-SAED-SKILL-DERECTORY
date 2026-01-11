
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserRole, Instructor, Registration, Corper, Staff, Admin } from './types';
import Layout from './components/Layout';
import MapSearch from './components/MapSearch';
import AdminDashboard from './components/AdminDashboard';
import InstructorDashboard from './components/InstructorDashboard';
import CorperDashboard from './components/CorperDashboard';
import StaffDashboard from './components/StaffDashboard';
import InstructorRegistration from './components/InstructorRegistration';
import CorperRegistration from './components/CorperRegistration';
import StaffRegistration from './components/StaffRegistration';
import AdminRegistration from './components/AdminRegistration';
import DatabaseSetupWizard from './components/DatabaseSetupWizard';
import InstructorProfileView from './components/InstructorProfileView';
import { MOCK_INSTRUCTORS } from './constants';
import { supabase } from './lib/supabase';
import { 
  fetchInstructors, 
  fetchAllInstructors, 
  fetchRegistrations, 
  syncUserProfile,
  fetchUsersByRole,
  updateUserStatus,
  normalizeInstructor,
  checkSupabaseHealth
} from './services/supabaseService';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>('GUEST');
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  
  const isAuthInProgress = useRef(false);
  const hasInitialized = useRef(false);

  const [directoryFilter, setDirectoryFilter] = useState('');
  const [currentHash, setCurrentHash] = useState(() => {
    const hash = window.location.hash;
    return (!hash || hash === '#' || hash === '#/') ? '#/home' : hash;
  });

  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [staffUsers, setStaffUsers] = useState<Staff[]>([]);
  const [corpers, setCorpers] = useState<Corper[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const navigateTo = useCallback((path: string) => {
    window.location.hash = path;
    setCurrentHash(path);
  }, []);

  const refreshGlobalData = useCallback(async () => {
    try {
      const [instList, corpList, staffList, admList] = await Promise.all([
        fetchAllInstructors(),
        fetchUsersByRole('CORPER'),
        fetchUsersByRole('STAFF'),
        fetchUsersByRole('ADMIN')
      ]);
      
      if (instList.length > 0) setInstructors(instList);
      if (corpList.length > 0) setCorpers(corpList as Corper[]);
      if (staffList.length > 0) setStaffUsers(staffList as Staff[]);
      if (admList.length > 0) setAdmins(admList as Admin[]);
    } catch (e) {
      console.warn("Global Data Refresh partial failure:", e);
    }
  }, []);

  const fetchProfileAndSetState = useCallback(async (userId: string) => {
    setIsSyncing(true);
    setConnectionError(false);
    
    try {
      let profile = null;
      let retries = 3;
      
      while (retries > 0) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        if (data) {
          profile = data;
          break;
        }

        if (error) {
          if (error.code === '42P01' || error.message.includes('relation')) {
            setSchemaMissing(true);
            return null;
          }
        }
        
        await new Promise(r => setTimeout(r, 800));
        retries--;
      }
      
      if (profile) {
        let finalUser = { ...profile };
        
        if (profile.role === 'INSTRUCTOR') {
          const { data: instData } = await supabase.from('instructors').select('*').eq('id', userId).maybeSingle();
          if (instData) finalUser = { ...finalUser, ...normalizeInstructor(instData) };
        }

        setCurrentUser(finalUser);
        setRole(profile.role as UserRole);
        
        const userRegs = await fetchRegistrations(userId, profile.role);
        setRegistrations(userRegs);
        
        await refreshGlobalData();
        return finalUser;
      }
      return null;
    } catch (e: any) {
      if (e.message.includes('fetch')) setConnectionError(true);
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [refreshGlobalData]);

  const initApp = useCallback(async () => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    setLoading(true);
    try {
      const health = await checkSupabaseHealth();
      if (!health.ok) {
        setConnectionError(true);
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const profile = await fetchProfileAndSetState(session.user.id);
        if (!profile && !schemaMissing) {
          // If session exists but profile doesn't, we might need a logout or sync
          setRole('GUEST');
        }
      } else {
        setRole('GUEST');
      }

      const instructorList = await fetchInstructors();
      setInstructors(instructorList.length > 0 ? instructorList : MOCK_INSTRUCTORS.map(i => ({...i, status: 'APPROVED'})));
      
      const adminList = await fetchUsersByRole('ADMIN');
      setAdmins(adminList as Admin[] || []);
    } catch (e) {
      setIsDemoMode(true);
      setInstructors(MOCK_INSTRUCTORS.map(i => ({...i, status: 'APPROVED'})));
    } finally {
      setLoading(false);
    }
  }, [fetchProfileAndSetState]);

  useEffect(() => {
    initApp();
  }, [initApp]);

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setRole('GUEST');
        setCurrentUser(null);
        setRegistrations([]);
        navigateTo('#/home');
      } else if (event === 'SIGNED_IN' && session?.user) {
        // Only trigger if not already being handled by handleAuth
        if (!isAuthInProgress.current) {
          await fetchProfileAndSetState(session.user.id);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchProfileAndSetState, navigateTo]);

  const handleDemoLogin = (demoRole: UserRole) => {
    setLoading(true);
    setIsDemoMode(true);
    setTimeout(() => {
      setRole(demoRole);
      setCurrentUser({ id: 'demo', name: `Demo ${demoRole}`, role: demoRole, status: 'APPROVED' });
      setLoading(false);
      navigateTo('#/dashboard');
    }, 500);
  };

  const handleAuth = async (data: any, mode: 'LOGIN' | 'SIGNUP', targetRole: UserRole) => {
    isAuthInProgress.current = true;
    try {
      if (mode === 'LOGIN') {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email.trim(),
          password: data.password.trim(),
        });
        if (error) throw error;
      } else {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password.trim(),
          options: { data: { name: data.name } }
        });
        if (error) throw error;
        
        if (authData.user) {
          await syncUserProfile(authData.user.id, targetRole, { ...data, status: targetRole === 'ADMIN' ? 'APPROVED' : 'PENDING' });
          if (!authData.session) {
            alert("Verification email sent. Please confirm your email.");
            navigateTo('#/home');
            return;
          }
        }
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfileAndSetState(session.user.id);
        navigateTo('#/dashboard');
      }
    } catch (err: any) {
      alert("Auth Error: " + (err.message || "Operation failed"));
      throw err;
    } finally {
      isAuthInProgress.current = false;
    }
  };

  const handleUpdateUser = async (userRole: UserRole, id: string, data: any) => {
    if (isDemoMode) { showToast("Demo Mode: Simulated Update"); return; }
    try {
      await updateUserStatus(userRole, id, data.status);
      showToast("Status updated.");
      await refreshGlobalData();
    } catch (err: any) {
      alert("Update Failed: " + err.message);
    }
  };

  const handleUpdateInstructor = async (update: Partial<Instructor>) => {
    if (!currentUser || isDemoMode) { showToast("Demo Mode: Simulated Update"); return; }
    try {
      const updated = { ...currentUser, ...update };
      setCurrentUser(updated);
      await syncUserProfile(currentUser.id, 'INSTRUCTOR', updated);
      showToast("Profile Synced");
    } catch (err: any) {
      alert("Sync Failed: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 border-4 border-[#004d2c] border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Accessing Directorate...</h2>
      </div>
    );
  }

  const renderContent = () => {
    if (schemaMissing && !isDemoMode) return <DatabaseSetupWizard onRetry={() => window.location.reload()} onSkip={() => handleDemoLogin('ADMIN')} />;
    if (connectionError && !isDemoMode) {
      return (
        <div className="py-40 text-center px-4">
           <i className="fa-solid fa-cloud-bolt text-5xl text-red-500 mb-6"></i>
           <h3 className="text-2xl font-black mb-4 uppercase">Portal Offline</h3>
           <p className="text-slate-500 mb-10 max-w-sm mx-auto">The backend project is currently hibernating or unreachable.</p>
           <div className="flex justify-center gap-4">
              <button onClick={() => window.location.reload()} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs">Retry</button>
              <button onClick={() => handleDemoLogin('GUEST')} className="bg-[#004d2c] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs">Offline Demo</button>
           </div>
        </div>
      );
    }

    if (currentHash.startsWith('#/instructor/')) {
       const id = currentHash.split('/')[2];
       const found = instructors.find(i => i.id === id);
       if (!found) return <div className="py-20 text-center font-black">Record Not Found</div>;
       return <InstructorProfileView instructor={found} role={role} onBack={() => navigateTo('#/directory')} onEnroll={(skill) => showToast(`Enrolled in ${skill}.`)} />;
    }

    switch (currentHash) {
      case '#/register-corper': return <CorperRegistration onComplete={(data, mode) => handleAuth(data, mode, 'CORPER')} onDemo={() => handleDemoLogin('CORPER')} />;
      case '#/register-instructor': return <InstructorRegistration onComplete={(data, mode) => handleAuth(data, mode || 'SIGNUP', 'INSTRUCTOR')} onDemo={() => handleDemoLogin('INSTRUCTOR')} />;
      case '#/register-staff': return <StaffRegistration onComplete={(data, mode) => handleAuth(data, mode, 'STAFF')} onDemo={() => handleDemoLogin('STAFF')} />;
      case '#/register-admin': return <AdminRegistration onComplete={(data, mode) => handleAuth(data, mode, 'ADMIN')} onDemo={() => handleDemoLogin('ADMIN')} adminExists={admins.length > 0} />;
      case '#/map': 
      case '#/directory':
        return <MapSearch instructors={instructors.filter(i => i.status === 'APPROVED')} onViewProfile={(id) => navigateTo(`#/instructor/${id}`)} initialSkill={directoryFilter} />;
      case '#/dashboard':
        if (isSyncing) return (
           <div className="py-40 text-center">
             <div className="w-12 h-12 border-4 border-[#004d2c] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
             <p className="font-black uppercase text-[10px] tracking-widest text-slate-400">Synchronizing Identity...</p>
           </div>
        );
        return (
          <div className="animate-fade-in w-full">
            {role === 'ADMIN' && <AdminDashboard instructors={instructors} corpers={corpers} staffUsers={staffUsers} admins={admins} onUpdateUser={handleUpdateUser} onAddAdmin={() => {}} />}
            {role === 'INSTRUCTOR' && <InstructorDashboard instructor={currentUser} onUpdateInstructor={handleUpdateInstructor} registrations={registrations} setRegistrations={setRegistrations} />}
            {role === 'CORPER' && <CorperDashboard registrations={registrations} onSelectSkill={(s) => {setDirectoryFilter(s); navigateTo('#/directory');}} instructors={instructors} isDemo={isDemoMode} />}
            {role === 'STAFF' && <StaffDashboard registrations={registrations} staff={currentUser} />}
            {role === 'GUEST' && <div className="py-20 text-center font-black uppercase text-slate-400">Session context lost. Please login.</div>}
          </div>
        );
      default:
        return (
          <div className="max-w-7xl mx-auto px-4 py-24 md:py-32 lg:py-40 text-center animate-fade-in flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-6xl md:text-8xl font-[1000] text-[#0f172a] tracking-tighter mb-10 leading-[0.9]">Empower Your <span className="text-[#004d2c]">Future.</span></h1>
            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto mb-20 font-medium leading-relaxed">Official SAED portal connecting Nigerian youth with world-class professional instructors.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-10 w-full max-w-2xl">
              <button onClick={() => navigateTo('#/directory')} className="flex-grow bg-[#004d2c] text-white px-10 py-6 md:py-8 rounded-[3rem] font-[900] shadow-2xl hover:scale-105 transition-all text-lg md:text-xl tracking-[0.2em] uppercase">Locate Instructors</button>
              <button onClick={() => navigateTo('#/directory')} className="flex-grow bg-white text-[#0f172a] border-4 border-slate-100 px-10 py-6 md:py-8 rounded-[3rem] font-[900] hover:bg-slate-50 transition-all text-lg md:text-xl tracking-[0.2em] uppercase shadow-xl">Browse Directory</button>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout role={role} setRole={setRole} currentHash={currentHash} navigateTo={navigateTo} onSignOut={() => supabase.auth.signOut()}>
      {successMessage && <div className="fixed bottom-10 right-10 z-[100] bg-[#0f172a] text-white p-8 rounded-[3rem] shadow-2xl border-4 border-[#004d2c] font-black uppercase text-xs tracking-widest">{successMessage}</div>}
      {renderContent()}
    </Layout>
  );
};

export default App;
