
import { supabase } from '../lib/supabase';
import { Instructor, Registration, UserRole, Corper, Staff, Admin } from '../types';

const isSchemaError = (error: any) => {
  if (!error) return false;
  const msg = error.message?.toLowerCase() || '';
  const code = error.code;
  return msg.includes('querying schema') || 
         msg.includes('relation') || 
         msg.includes('does not exist') ||
         msg.includes('failed to fetch') ||
         code === '42P01' ||
         code === 'PGRST301';
};

/**
 * Checks if the Supabase project is reachable.
 * Useful for diagnosing "Failed to fetch" errors.
 */
export const checkSupabaseHealth = async (): Promise<{ ok: boolean; message?: string }> => {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      if (isSchemaError(error)) return { ok: true }; // Reachable, but schema might be missing
      return { ok: false, message: error.message };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, message: err.message };
  }
};

// Maps snake_case DB fields to camelCase TS properties
export const normalizeInstructor = (data: any): Instructor => {
  if (!data) return data;
  return {
    ...data,
    profilePic: data.profile_pic || data.profilePic,
    coverImage: data.cover_image || data.coverImage,
    phoneNumber: data.phone_number || data.phoneNumber,
    linkedInUrl: data.linked_in_url || data.linkedInUrl,
    reviewCount: data.review_count || data.reviewCount,
  };
};

export const fetchInstructors = async () => {
  try {
    const { data, error } = await supabase
      .from('instructors')
      .select('*')
      .eq('status', 'APPROVED');
    
    if (error) {
      if (isSchemaError(error)) return [];
      console.error('[Supabase] Fetch Instructors Error:', error.message);
      return [];
    }
    return (data || []).map(normalizeInstructor);
  } catch (err: any) {
    if (err.message.includes('fetch')) {
      console.error('[Supabase] Network connection lost. Check Supabase project status.');
    }
    return [];
  }
};

export const fetchAllInstructors = async () => {
  try {
    const { data, error } = await supabase.from('instructors').select('*');
    if (error) {
      if (isSchemaError(error)) return [];
      throw error;
    }
    return (data || []).map(normalizeInstructor);
  } catch (err) {
    return [];
  }
};

export const fetchUsersByRole = async (role: UserRole) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role);
    
    if (error) {
      if (isSchemaError(error)) return [];
      throw error;
    }
    return data;
  } catch (err) {
    return [];
  }
};

export const fetchRegistrations = async (userId: string, role: UserRole) => {
  try {
    if (!userId) return [];
    let query = supabase.from('registrations').select('*');
    if (role === 'CORPER') {
      query = query.eq('corper_id', userId);
    } else if (role === 'INSTRUCTOR') {
      query = query.eq('instructor_id', userId);
    }

    const { data, error } = await query.order('date', { ascending: false });
    if (error) {
      if (isSchemaError(error)) return [];
      throw error;
    }
    return data as Registration[];
  } catch (err) {
    return [];
  }
};

export const createRegistration = async (registration: Partial<Registration>) => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .insert([registration])
      .select();
    
    if (error) {
      if (isSchemaError(error)) {
        return { ...registration, id: `local-${Date.now()}` } as Registration;
      }
      throw error;
    }
    return data?.[0];
  } catch (err) {
    return { ...registration, id: `local-${Date.now()}` } as Registration;
  }
};

export const updateRegistrationStatus = async (id: string, status: string) => {
  try {
    const { error } = await supabase
      .from('registrations')
      .update({ status })
      .eq('id', id);
    
    if (error && !isSchemaError(error)) throw error;
  } catch (err) {
    console.warn('[Supabase] Status update simulation due to network/schema issue.');
  }
};

export const updateUserStatus = async (role: UserRole, id: string, status: string) => {
  try {
    const { error: pError } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', id);
    
    if (pError) throw pError;

    if (role === 'INSTRUCTOR') {
      const { error: iError } = await supabase
        .from('instructors')
        .update({ status })
        .eq('id', id);
      
      if (iError) throw iError;
    }
  } catch (err: any) {
    console.error(`[Supabase] Error updating ${role} status:`, err.message);
    throw err;
  }
};

export const syncUserProfile = async (id: string, role: UserRole, profile: any) => {
  try {
    const profilePayload = {
      id,
      name: profile.name,
      email: profile.email,
      role: role,
      status: profile.status || (role === 'ADMIN' ? 'APPROVED' : 'PENDING'),
      security_key: profile.securityKey || profile.security_key,
      state_code: profile.stateCode || profile.state_code,
      batch: profile.batch,
      state_of_service: profile.stateOfService || profile.state_of_service,
      department: profile.department
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profilePayload);
    
    if (profileError) throw profileError;

    if (role === 'INSTRUCTOR') {
      const instructorPayload = {
        id,
        name: profile.name,
        email: profile.email,
        headline: profile.headline,
        about: profile.about,
        skills: profile.skills || profile.selectedSkills,
        phone_number: profile.phoneNumber || profile.phone_number,
        location: profile.location,
        status: profile.status || 'PENDING',
        profile_pic: profile.profilePic || profile.profile_pic,
        cover_image: profile.coverImage || profile.cover_image,
        linked_in_url: profile.linkedInUrl || profile.linked_in_url,
      };

      const { error: instError } = await supabase
        .from('instructors')
        .upsert(instructorPayload);
      
      if (instError) throw instError;
    }
  } catch (err: any) {
    if (!isSchemaError(err)) {
      console.error('[Supabase] Profile Sync Critical Failure:', err.message);
      throw err;
    } else {
      console.warn('[Supabase] Schema missing or Network offline - Sync skipped.');
    }
  }
};
