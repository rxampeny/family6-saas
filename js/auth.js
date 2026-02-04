/**
 * Authentication Module
 * Handles all authentication operations with Supabase
 */

import supabaseClient from './supabase-client.js';
import CONFIG from './config.js';

/**
 * Sign up a new user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<{data: Object, error: Object}>}
 */
export async function signUp(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${CONFIG.APP_URL}${CONFIG.ROUTES.CONFIRM}`
            }
        });

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        console.error('Sign up error:', error);
        return { data: null, error };
    }
}

/**
 * Sign in an existing user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<{data: Object, error: Object}>}
 */
export async function signIn(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        console.error('Sign in error:', error);
        return { data: null, error };
    }
}

/**
 * Sign out the current user
 * @returns {Promise<{error: Object}>}
 */
export async function signOut() {
    try {
        const { error } = await supabaseClient.auth.signOut();

        if (error) throw error;

        return { error: null };
    } catch (error) {
        console.error('Sign out error:', error);
        return { error };
    }
}

/**
 * Send a password reset email
 * @param {string} email - User's email
 * @returns {Promise<{data: Object, error: Object}>}
 */
export async function resetPassword(email) {
    try {
        const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${CONFIG.APP_URL}${CONFIG.ROUTES.UPDATE_PASSWORD}`
        });

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        console.error('Reset password error:', error);
        return { data: null, error };
    }
}

/**
 * Update user's password (after reset)
 * @param {string} newPassword - New password
 * @returns {Promise<{data: Object, error: Object}>}
 */
export async function updatePassword(newPassword) {
    try {
        const { data, error } = await supabaseClient.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        console.error('Update password error:', error);
        return { data: null, error };
    }
}

/**
 * Get the current session
 * @returns {Promise<{data: {session: Object}, error: Object}>}
 */
export async function getSession() {
    try {
        const { data, error } = await supabaseClient.auth.getSession();

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        console.error('Get session error:', error);
        return { data: null, error };
    }
}

/**
 * Get the current user
 * @returns {Promise<{data: {user: Object}, error: Object}>}
 */
export async function getUser() {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();

        if (error) throw error;

        return { data: { user }, error: null };
    } catch (error) {
        console.error('Get user error:', error);
        return { data: null, error };
    }
}

/**
 * Subscribe to auth state changes
 * @param {Function} callback - Callback function (event, session)
 * @returns {Object} Subscription object with unsubscribe method
 */
export function onAuthStateChange(callback) {
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });

    return subscription;
}

/**
 * Handle OAuth callback tokens from URL
 * Used on confirm.html and update-password.html
 * @returns {Promise<{data: Object, error: Object}>}
 */
export async function handleAuthCallback() {
    try {
        // Get the hash fragment from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (accessToken && refreshToken) {
            const { data, error } = await supabaseClient.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            });

            if (error) throw error;

            return { data, error: null, type };
        }

        // Check for error in hash
        const errorDescription = hashParams.get('error_description');
        if (errorDescription) {
            throw new Error(errorDescription);
        }

        return { data: null, error: null, type: null };
    } catch (error) {
        console.error('Auth callback error:', error);
        return { data: null, error, type: null };
    }
}

export default {
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    getSession,
    getUser,
    onAuthStateChange,
    handleAuthCallback
};
