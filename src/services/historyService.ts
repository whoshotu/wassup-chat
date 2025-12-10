/**
 * Message History Service
 * Handles storage and retrieval of decoded messages using Supabase
 */

import { supabase } from '@/lib/supabase';
import type { DecodedMessage, DecodeResponse } from '@/types';

const STORAGE_KEY = 'chatDecoder_history';
const MAX_HISTORY_ITEMS = 500;

// Fallback to localStorage if Supabase is not available
const getStoredHistory = (): DecodedMessage[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveHistory = (history: DecodedMessage[]) => {
  const trimmed = history.slice(0, MAX_HISTORY_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
};

/**
 * History Service - manages message history
 */
export const historyService = {
  /**
   * Get all messages
   */
  async getAll(userId?: string): Promise<DecodedMessage[]> {
    if (!userId) return getStoredHistory();

    try {
      const { data, error } = await supabase
        .from('decoded_messages')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return (data || []).map(msg => ({
        id: msg.id,
        originalText: msg.original_text,
        detectedLanguage: msg.detected_language,
        region: msg.detected_region,
        translation: msg.translation || '',
        plainExplanation: msg.plain_explanation,
        slangItems: msg.slang_items || [],
        toneTags: msg.tone_tags || [],
        suggestedResponses: msg.suggested_responses || [],
        createdAt: msg.timestamp,
        favorited: msg.favorited || false,
      }));
    } catch {
      return getStoredHistory();
    }
  },

  /**
   * Add a new decoded message to history
   */
  async add(response: DecodeResponse, userId?: string): Promise<DecodedMessage> {
    const message: DecodedMessage = {
      ...response,
      id: crypto.randomUUID(),
      favorited: false,
    };

    if (userId) {
      try {
        const { error } = await supabase
          .from('decoded_messages')
          .insert([{
            id: message.id,
            user_id: userId,
            original_text: message.originalText,
            detected_language: message.detectedLanguage,
            detected_region: message.region,
            translation: message.translation,
            plain_explanation: message.plainExplanation,
            slang_items: message.slangItems,
            tone_tags: message.toneTags,
            suggested_responses: message.suggestedResponses,
            timestamp: message.createdAt,
            favorited: false,
          }]);

        if (error) throw error;
        return message;
      } catch (err) {
        console.error('Failed to save to Supabase:', err);
      }
    }

    // Fallback to localStorage
    const history = getStoredHistory();
    history.unshift(message);
    saveHistory(history);
    return message;
  },

  /**
   * Toggle favorite status
   */
  async toggleFavorite(id: string, userId?: string): Promise<DecodedMessage | null> {
    if (userId) {
      try {
        const { data: current } = await supabase
          .from('decoded_messages')
          .select('favorited')
          .eq('id', id)
          .single();

        const { error } = await supabase
          .from('decoded_messages')
          .update({ favorited: !current?.favorited })
          .eq('id', id);

        if (error) throw error;

        const { data } = await supabase
          .from('decoded_messages')
          .select('*')
          .eq('id', id)
          .single();

        if (data) {
          return {
            id: data.id,
            originalText: data.original_text,
            detectedLanguage: data.detected_language,
            region: data.detected_region,
            translation: data.translation || '',
            plainExplanation: data.plain_explanation,
            slangItems: data.slang_items || [],
            toneTags: data.tone_tags || [],
            suggestedResponses: data.suggested_responses || [],
            createdAt: data.timestamp,
            favorited: data.favorited,
          };
        }
      } catch (err) {
        console.error('Failed to toggle favorite:', err);
      }
    }

    // Fallback to localStorage
    const history = getStoredHistory();
    const index = history.findIndex(m => m.id === id);
    if (index === -1) return null;
    
    history[index].favorited = !history[index].favorited;
    saveHistory(history);
    return history[index];
  },

  /**
   * Get favorites only
   */
  async getFavorites(userId?: string): Promise<DecodedMessage[]> {
    if (userId) {
      try {
        const { data, error } = await supabase
          .from('decoded_messages')
          .select('*')
          .eq('user_id', userId)
          .eq('favorited', true)
          .order('timestamp', { ascending: false });

        if (error) throw error;

        return (data || []).map(msg => ({
          id: msg.id,
          originalText: msg.original_text,
          detectedLanguage: msg.detected_language,
          region: msg.detected_region,
          translation: msg.translation || '',
          plainExplanation: msg.plain_explanation,
          slangItems: msg.slang_items || [],
          toneTags: msg.tone_tags || [],
          suggestedResponses: msg.suggested_responses || [],
          createdAt: msg.timestamp,
          favorited: msg.favorited,
        }));
      } catch {
        return getStoredHistory().filter(m => m.favorited);
      }
    }

    return getStoredHistory().filter(m => m.favorited);
  },

  /**
   * Search messages
   */
  async search(searchQuery: string, userId?: string): Promise<DecodedMessage[]> {
    const lowerQuery = searchQuery.toLowerCase();

    if (userId) {
      try {
        const { data, error } = await supabase
          .from('decoded_messages')
          .select('*')
          .eq('user_id', userId)
          .or(`original_text.ilike.%${searchQuery}%,plain_explanation.ilike.%${searchQuery}%,detected_language.ilike.%${searchQuery}%`)
          .order('timestamp', { ascending: false });

        if (error) throw error;

        return (data || []).map(msg => ({
          id: msg.id,
          originalText: msg.original_text,
          detectedLanguage: msg.detected_language,
          region: msg.detected_region,
          translation: msg.translation || '',
          plainExplanation: msg.plain_explanation,
          slangItems: msg.slang_items || [],
          toneTags: msg.tone_tags || [],
          suggestedResponses: msg.suggested_responses || [],
          createdAt: msg.timestamp,
          favorited: msg.favorited,
        }));
      } catch {
        return getStoredHistory().filter(m => 
          m.originalText.toLowerCase().includes(lowerQuery) ||
          m.plainExplanation.toLowerCase().includes(lowerQuery) ||
          m.detectedLanguage.toLowerCase().includes(lowerQuery)
        );
      }
    }

    return getStoredHistory().filter(m => 
      m.originalText.toLowerCase().includes(lowerQuery) ||
      m.plainExplanation.toLowerCase().includes(lowerQuery) ||
      m.detectedLanguage.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * Delete a message
   */
  async delete(id: string, userId?: string): Promise<boolean> {
    if (userId) {
      try {
        const { error } = await supabase
          .from('decoded_messages')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error('Failed to delete from Supabase:', err);
      }
    }

    const history = getStoredHistory();
    const filtered = history.filter(m => m.id !== id);
    
    if (filtered.length === history.length) return false;
    
    saveHistory(filtered);
    return true;
  },

  /**
   * Clear all history
   */
  async clearAll(userId?: string): Promise<void> {
    if (userId) {
      try {
        await supabase
          .from('decoded_messages')
          .delete()
          .eq('user_id', userId);
      } catch (err) {
        console.error('Failed to clear Supabase history:', err);
      }
    }
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Get message by ID
   */
  async getById(id: string, userId?: string): Promise<DecodedMessage | null> {
    if (userId) {
      try {
        const { data, error } = await supabase
          .from('decoded_messages')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .single();

        if (error) throw error;

        if (data) {
          return {
            id: data.id,
            originalText: data.original_text,
            detectedLanguage: data.detected_language,
            region: data.detected_region,
            translation: data.translation || '',
            plainExplanation: data.plain_explanation,
            slangItems: data.slang_items || [],
            toneTags: data.tone_tags || [],
            suggestedResponses: data.suggested_responses || [],
            createdAt: data.timestamp,
            favorited: data.favorited,
          };
        }
      } catch {
        return getStoredHistory().find(m => m.id === id) || null;
      }
    }

    return getStoredHistory().find(m => m.id === id) || null;
  },

  /**
   * Get recent messages (limited)
   */
  async getRecent(limit: number = 10, userId?: string): Promise<DecodedMessage[]> {
    if (userId) {
      try {
        const { data, error } = await supabase
          .from('decoded_messages')
          .select('*')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false })
          .limit(limit);

        if (error) throw error;

        return (data || []).map(msg => ({
          id: msg.id,
          originalText: msg.original_text,
          detectedLanguage: msg.detected_language,
          region: msg.detected_region,
          translation: msg.translation || '',
          plainExplanation: msg.plain_explanation,
          slangItems: msg.slang_items || [],
          toneTags: msg.tone_tags || [],
          suggestedResponses: msg.suggested_responses || [],
          createdAt: msg.timestamp,
          favorited: msg.favorited,
        }));
      } catch {
        return getStoredHistory().slice(0, limit);
      }
    }

    return getStoredHistory().slice(0, limit);
  },

  /**
   * Export history as JSON
   */
  async export(userId?: string): Promise<string> {
    const messages = await this.getAll(userId);
    return JSON.stringify(messages, null, 2);
  },

  /**
   * Import history from JSON
   */
  async import(json: string, userId?: string): Promise<boolean> {
    try {
      const data = JSON.parse(json);
      if (!Array.isArray(data)) return false;
      
      if (userId) {
        const items = data.map(item => ({
          id: item.id || crypto.randomUUID(),
          user_id: userId,
          original_text: item.originalText,
          detected_language: item.detectedLanguage,
          detected_region: item.region,
          translation: item.translation || '',
          plain_explanation: item.plainExplanation,
          slang_items: item.slangItems,
          tone_tags: item.toneTags,
          suggested_responses: item.suggestedResponses || [],
          timestamp: item.createdAt,
          favorited: item.favorited || false,
        }));

        const { error } = await supabase
          .from('decoded_messages')
          .insert(items);

        if (error) throw error;
        return true;
      }

      const history = getStoredHistory();
      const newItems = data.filter((item: DecodedMessage) => 
        !history.some(h => h.id === item.id)
      );
      
      saveHistory([...newItems, ...history]);
      return true;
    } catch {
      return false;
    }
  },
};

export default historyService;
