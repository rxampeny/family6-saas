/**
 * Chat History Module
 * Funciones para obtener y procesar conversaciones desde Supabase
 */

import supabaseChatClient from './supabase-chat-client.js';

const TABLE_NAME = 'n8n_chat_historias_04022026';

/**
 * Extrae el userId del session_id (formato: {userId}_{uuid})
 * @param {string} sessionId - ID de la sesion
 * @returns {string|null} userId o null si no tiene formato correcto
 */
function extractUserIdFromSession(sessionId) {
    if (!sessionId || !sessionId.includes('_')) {
        return null;
    }
    return sessionId.split('_')[0];
}

/**
 * Obtiene todas las conversaciones agrupadas por session_id
 * @param {string} userId - ID del usuario para filtrar (opcional)
 * @returns {Promise<Array>} Lista de conversaciones con metadata
 */
export async function getConversations(userId = null) {
    try {
        // Obtener todos los mensajes ordenados por id
        let query = supabaseChatClient
            .from(TABLE_NAME)
            .select('*')
            .order('id', { ascending: true });

        // Si hay userId, filtrar por session_id que empiece con ese userId
        if (userId) {
            query = query.like('session_id', `${userId}_%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching conversations:', error);
            throw error;
        }

        if (!data || data.length === 0) {
            return [];
        }

        // Agrupar mensajes por session_id
        const sessionsMap = new Map();

        data.forEach(row => {
            const sessionId = row.session_id;

            if (!sessionsMap.has(sessionId)) {
                sessionsMap.set(sessionId, {
                    sessionId,
                    messages: [],
                    firstMessageId: row.id
                });
            }

            sessionsMap.get(sessionId).messages.push({
                id: row.id,
                type: row.message?.type || 'unknown',
                content: row.message?.content || ''
            });
        });

        // Convertir a array y procesar cada sesion
        const conversations = Array.from(sessionsMap.values()).map(session => {
            const humanMessages = session.messages.filter(m => m.type === 'human');
            const aiMessages = session.messages.filter(m => m.type === 'ai');

            // Usar primer mensaje humano como titulo
            const firstHumanMessage = humanMessages[0]?.content || 'Conversacion sin titulo';
            const title = truncateText(firstHumanMessage, 50);

            // Crear preview combinando primer mensaje humano y respuesta AI
            let preview = '';
            if (humanMessages[0]) {
                preview += `Usuario: ${truncateText(humanMessages[0].content, 60)}`;
            }
            if (aiMessages[0]) {
                preview += ` Asistente: ${truncateText(aiMessages[0].content, 60)}`;
            }

            return {
                sessionId: session.sessionId,
                title,
                preview: preview || 'Sin contenido',
                totalMessages: session.messages.length,
                humanMessages: humanMessages.length,
                aiMessages: aiMessages.length,
                firstMessageId: session.firstMessageId,
                lastMessageId: session.messages[session.messages.length - 1]?.id,
                messages: session.messages // Include all messages for expandable UI
            };
        });

        // Ordenar por el ID del ultimo mensaje (mas reciente primero)
        conversations.sort((a, b) => b.lastMessageId - a.lastMessageId);

        return conversations;
    } catch (error) {
        console.error('Error in getConversations:', error);
        throw error;
    }
}

/**
 * Obtiene todos los mensajes de una conversacion especifica
 * @param {string} sessionId - ID de la sesion
 * @returns {Promise<Array>} Lista de mensajes de la conversacion
 */
export async function getConversationMessages(sessionId) {
    try {
        const { data, error } = await supabaseChatClient
            .from(TABLE_NAME)
            .select('*')
            .eq('session_id', sessionId)
            .order('id', { ascending: true });

        if (error) {
            console.error('Error fetching conversation messages:', error);
            throw error;
        }

        return data.map(row => ({
            id: row.id,
            type: row.message?.type || 'unknown',
            content: row.message?.content || ''
        }));
    } catch (error) {
        console.error('Error in getConversationMessages:', error);
        throw error;
    }
}

/**
 * Trunca texto a un maximo de caracteres
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud maxima
 * @returns {string} Texto truncado
 */
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

/**
 * Obtiene estadisticas de conversaciones para un usuario
 * @param {string} userId - ID del usuario (opcional)
 * @returns {Promise<Object>} Estadisticas
 */
export async function getConversationStats(userId = null) {
    try {
        let query = supabaseChatClient
            .from(TABLE_NAME)
            .select('*')
            .order('id', { ascending: true });

        if (userId) {
            query = query.like('session_id', `${userId}_%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching stats:', error);
            throw error;
        }

        if (!data || data.length === 0) {
            return {
                totalConversations: 0,
                totalMessages: 0,
                humanMessages: 0,
                aiMessages: 0,
                messagesByDay: [],
                recentConversations: []
            };
        }

        // Count unique sessions
        const sessions = new Set();
        let humanCount = 0;
        let aiCount = 0;

        // Track messages by day (using message ID ranges as proxy for time)
        const messagesBySession = new Map();

        data.forEach(row => {
            sessions.add(row.session_id);

            const msgType = row.message?.type;
            if (msgType === 'human') humanCount++;
            else if (msgType === 'ai') aiCount++;

            // Group by session for recent activity
            if (!messagesBySession.has(row.session_id)) {
                messagesBySession.set(row.session_id, []);
            }
            messagesBySession.get(row.session_id).push(row);
        });

        // Get last 7 "days" worth of data (simulated by dividing IDs into 7 buckets)
        const minId = Math.min(...data.map(d => d.id));
        const maxId = Math.max(...data.map(d => d.id));
        const range = maxId - minId + 1;
        const bucketSize = Math.max(1, Math.ceil(range / 7));

        const dayLabels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
        const messagesByDay = dayLabels.map((label, index) => {
            const bucketStart = minId + (index * bucketSize);
            const bucketEnd = bucketStart + bucketSize;
            const count = data.filter(d => d.id >= bucketStart && d.id < bucketEnd).length;
            return { label, count };
        });

        // Find max for percentage calculation
        const maxCount = Math.max(...messagesByDay.map(d => d.count), 1);
        messagesByDay.forEach(day => {
            day.percentage = Math.round((day.count / maxCount) * 100);
        });

        // Recent conversations (last 5 sessions by last message ID)
        const sessionLastIds = Array.from(messagesBySession.entries()).map(([sessionId, messages]) => ({
            sessionId,
            lastId: Math.max(...messages.map(m => m.id)),
            messageCount: messages.length
        }));
        sessionLastIds.sort((a, b) => b.lastId - a.lastId);
        const recentConversations = sessionLastIds.slice(0, 5);

        return {
            totalConversations: sessions.size,
            totalMessages: data.length,
            humanMessages: humanCount,
            aiMessages: aiCount,
            messagesByDay,
            recentConversations
        };
    } catch (error) {
        console.error('Error in getConversationStats:', error);
        throw error;
    }
}
