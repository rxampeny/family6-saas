/**
 * Supabase Chat Client Module
 * Cliente separado para acceder al historial de chat en n8n_chat_historias_04022026
 */

// Import Supabase from CDN (loaded in HTML)
const { createClient } = supabase;

// Chat history database configuration
const CHAT_SUPABASE_URL = 'https://jpdlztscrvhewmqdcbbh.supabase.co';
const CHAT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZGx6dHNjcnZoZXdtcWRjYmJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MjQ0ODIsImV4cCI6MjA1NDIwMDQ4Mn0.qBJTKuS5T3piVMgff31twjLgFzAz7ll8VHYTqvbyBxU';

// Initialize Supabase client for chat history (no session persistence needed)
const supabaseChatClient = createClient(CHAT_SUPABASE_URL, CHAT_SUPABASE_ANON_KEY, {
    auth: {
        persistSession: false
    }
});

export default supabaseChatClient;
