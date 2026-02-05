/**
 * Configuration module
 * Variables are injected by Netlify at build time or set manually for development
 */

const CONFIG = {
    // Supabase Configuration
    SUPABASE_URL: 'https://iqbmqjwggktrjitacmnj.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxYm1xandnZ2t0cmppdGFjbW5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDMxMDEsImV4cCI6MjA4NTc3OTEwMX0.XWMC62PqiKHjdYETEeffUPEoNY_T6EY8hojveliJzrU',

    // n8n Webhook Configuration
    N8N_WEBHOOK_URL: 'https://6075-68-66-113-220.ngrok-free.app/webhook/dda36856-64ca-41d6-81b9-d335e8e807a9/chat',

    // App Configuration
    APP_NAME: 'Family6 SaaS',
    APP_URL: window.location.origin,

    // Routes
    ROUTES: {
        HOME: '/index.html',
        LOGIN: '/login.html',
        REGISTER: '/register.html',
        DASHBOARD: '/dashboard.html',
        RESET_PASSWORD: '/reset-password.html',
        UPDATE_PASSWORD: '/update-password.html',
        CONFIRM: '/confirm.html'
    },

    // Protected routes that require authentication
    PROTECTED_ROUTES: ['/dashboard.html', '/conversaciones.html', '/analiticas.html', '/configuracion.html'],

    // Auth routes that should redirect to dashboard if already logged in
    AUTH_ROUTES: ['/login.html', '/register.html']
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.ROUTES);

export default CONFIG;
