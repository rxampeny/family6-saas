/**
 * Supabase Chat Client Module
 * Cliente separado para acceder al historial de chat en n8n_chat_historias_04022026
 */

// Import Supabase from CDN (loaded in HTML)
const { createClient } = supabase;

// Chat history database configuration
const CHAT_SUPABASE_URL = 'https://jpdlztscrvhewmqdcbbh.supabase.co';
const CHAT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZGx6dHNjcnZoZXdtcWRjYmJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NzI3MTQsImV4cCI6MjA4NDU0ODcxNH0.QgRybvkyO3uxh6U_wr22nign-s14ZI-kBUu-J5VRpTI';

// Initialize Supabase client for chat history (no session persistence needed)
const supabaseChatClient = createClient(CHAT_SUPABASE_URL, CHAT_SUPABASE_ANON_KEY, {
    auth: {
        persistSession: false
    }
});

export default supabaseChatClient;
