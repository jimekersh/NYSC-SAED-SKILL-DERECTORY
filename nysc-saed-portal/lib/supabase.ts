
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hzirjgtflsettijgmbvj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6aXJqZ3RmbHNldHRpamdtYnZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NDUxMzEsImV4cCI6MjA4MzIyMTEzMX0.vs6CuHcyxIrzJoq3ToQL1DGmxu298IJOhsVkNRhdzIs';

export const supabase = createClient(supabaseUrl, supabaseKey);
