import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SCHEMA_SQL = `-- NYSC SAED PORTAL - THE ULTIMATE MASTER INITIALIZATION (V8.0)
-- AUTHOR: EXTOL TECHLINK NIGERIA
-- PURPOSE: COMPLETE DATABASE REBUILD & ADMIN PROVISIONING

-- 1. SYSTEM RESET (Wipe existing conflicts)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. CORE TABLE: PROFILES (The primary identity table)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'GUEST',
  status TEXT DEFAULT 'APPROVED',
  security_key TEXT,
  state_code TEXT,
  batch TEXT,
  state_of_service TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CORE TABLE: INSTRUCTORS (Directory Listings)
CREATE TABLE IF NOT EXISTS public.instructors (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  headline TEXT,
  about TEXT,
  skills TEXT[],
  phone_number TEXT,
  profile_pic TEXT,
  cover_image TEXT,
  location JSONB,
  status TEXT DEFAULT 'PENDING',
  rating FLOAT DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CORE TABLE: REGISTRATIONS (Training Enrollments)
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  corper_id UUID REFERENCES auth.users ON DELETE CASCADE,
  corper_name TEXT,
  instructor_id UUID REFERENCES auth.users ON DELETE CASCADE,
  skill_name TEXT,
  status TEXT DEFAULT 'PENDING',
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SELF-HEALING AUTH TRIGGER
-- Automatically creates a 'profile' entry whenever a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, status)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', 'New User'),
    'GUEST',
    'APPROVED'
  )
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. PROVISION SUPER ADMIN (extolempirellc@gmail.com)
-- This logic promotes your account to ADMIN status with your specific security key.
DO $$
DECLARE
  target_uid UUID;
BEGIN
  SELECT id INTO target_uid FROM auth.users WHERE email = 'extolempirellc@gmail.com';
  
  IF target_uid IS NOT NULL THEN
    INSERT INTO public.profiles (id, name, email, role, status, security_key)
    VALUES (target_uid, 'Super Admin', 'extolempirellc@gmail.com', 'ADMIN', 'APPROVED', '19901995')
    ON CONFLICT (id) DO UPDATE SET 
      role = 'ADMIN', 
      status = 'APPROVED', 
      security_key = '19901995';
    RAISE NOTICE 'SUPER ADMIN PROVISIONED SUCCESSFULLY';
  ELSE
    RAISE NOTICE 'ADMIN NOTICE: extolempirellc@gmail.com not found in auth.users yet.';
  END IF;
END $$;

-- 7. ENABLE PUBLIC ACCESS FOR INITIAL CONFIG
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations DISABLE ROW LEVEL SECURITY;

-- 8. ENABLE REALTIME
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
COMMIT;
`;

interface Props {
  onRetry: () => void;
  onSkip: () => void;
}

const DatabaseSetupWizard: React.FC<Props> = ({ onRetry, onSkip }) => {
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<'IDLE' | 'TESTING' | 'ONLINE' | 'OFFLINE'>('IDLE');

  const handleCopy = () => {
    navigator.clipboard.writeText(SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const testConnection = async () => {
    setTestStatus('TESTING');
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      if (error && (error.code === '42P01' || error.message.includes('relation'))) {
        setTestStatus('ONLINE');
      } else if (error) {
        throw error;
      } else {
        setTestStatus('ONLINE');
      }
    } catch (e) {
      setTestStatus('OFFLINE');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-[#001a0f] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-[3.5rem] shadow-2xl overflow-hidden animate-fade-in border-8 border-[#008751]/10">
        <div className="bg-[#008751] p-12 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="relative z-10">
            <div className="w-24 h-24 bg-white text-[#008751] rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <i className="fa-solid fa-crown text-4xl"></i>
            </div>
            <h1 className="text-4xl font-[1000] tracking-tighter mb-4 text-[#FFCC00]">Ultimate Master V8.0</h1>
            <p className="text-green-100 font-bold max-w-lg mx-auto leading-relaxed">
              Logins will fail unless you run this script! It creates the required "profiles" table used for access control.
            </p>
          </div>
        </div>

        <div className="p-12 space-y-10">
          <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 flex items-start space-x-4">
             <i className="fa-solid fa-triangle-exclamation text-red-500 mt-1"></i>
             <p className="text-xs font-bold text-red-700 leading-relaxed uppercase">
                CRITICAL: If you try to log in without running this SQL, you will be stuck in the "AUTHENTICATING" state or get "Access Denied". Run the SQL in your Supabase dashboard first!
             </p>
          </div>

          <div className="flex items-center justify-center mb-6">
             <div className={`px-6 py-2 rounded-full border flex items-center space-x-3 transition-all ${
               testStatus === 'ONLINE' ? 'bg-green-50 border-green-200 text-green-700' :
               testStatus === 'OFFLINE' ? 'bg-red-50 border-red-200 text-red-700' :
               'bg-gray-50 border-gray-200 text-gray-500'
             }`}>
                <div className={`w-2 h-2 rounded-full ${
                  testStatus === 'ONLINE' ? 'bg-green-500 animate-pulse' :
                  testStatus === 'OFFLINE' ? 'bg-red-500' : 'bg-gray-400'
                }`}></div>
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {testStatus === 'ONLINE' ? 'Database Status: Ready' : 'Connecting to Supabase...'}
                </span>
             </div>
          </div>

          <div className="relative group">
            <div className="absolute -top-3 left-6 bg-gray-900 text-[#FFCC00] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest z-10 border border-gray-700">
               NYSC_MASTER_V8.sql
            </div>
            <div className="bg-gray-900 rounded-[2.5rem] p-8 pt-10 font-mono text-[11px] text-green-400 overflow-x-auto h-80 border-4 border-gray-800 shadow-inner custom-scrollbar">
              <pre>{SCHEMA_SQL}</pre>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <button 
              onClick={handleCopy}
              className={`flex-grow py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition shadow-2xl active:scale-95 flex items-center justify-center gap-3 ${
                copied ? 'bg-green-500 text-white' : 'bg-gray-900 text-white'
              }`}
            >
              <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'} text-lg`}></i>
              {copied ? 'Copied to Clipboard' : 'Copy V8.0 Script'}
            </button>
            <button 
              onClick={onRetry}
              className="px-10 bg-[#008751] text-[#FFCC00] py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest transition active:scale-95 shadow-xl"
            >
              Refresh Portal
            </button>
          </div>

          <div className="p-8 bg-blue-50 rounded-[2.5rem] border-2 border-blue-200 text-[11px] font-bold text-blue-900">
             <div className="flex items-center space-x-3 mb-2">
                <i className="fa-solid fa-circle-info text-blue-500"></i>
                <span className="uppercase tracking-widest font-black">Execution Steps</span>
             </div>
             <ol className="list-decimal list-inside space-y-1 opacity-80">
                <li>Copy the SQL script above.</li>
                <li>Go to your Supabase project &rarr; SQL Editor &rarr; New Query.</li>
                <li>Paste and click "Run".</li>
                <li>Refresh this page and log in.</li>
             </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSetupWizard;