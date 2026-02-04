/**
 * Supabase Client Module
 * Initializes and exports the Supabase client instance
 */

import CONFIG from './config.js';

// Import Supabase from CDN (loaded in HTML)
const { createClient } = supabase;

// Initialize Supabase client
const supabaseClient = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
    }
});

export default supabaseClient;
