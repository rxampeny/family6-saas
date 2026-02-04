/**
 * Chat History Module
 * Funciones para obtener y procesar conversaciones desde Supabase
 */

import supabaseChatClient from './supabase-chat-client.js';

const TABLE_NAME = 'n8n_chat_historias_04022026';

/**
 * Obtiene todas las conversaciones agrupadas por session_id
 * @returns {Promise<Array>} Lista de conversaciones con metadata
 */
export async function getConversations() {
    try {
        // Obtener todos los mensajes ordenados por id
        const { data, error } = await supabaseChatClient
            .from(TABLE_NAME)
            .select('*')
            .order('id', { ascending: true });

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
                lastMessageId: session.messages[session.messages.length - 1]?.id
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
