import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fqgprrdrbdjlohhzhtxq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxZ3BycmRyYmRqbG9oaHpodHhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1MzM3MTYsImV4cCI6MjA3NzEwOTcxNn0.QLZLmyg7myRuANcyBRKXsR6a0LgtemMjtI6ZdZODNuI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
