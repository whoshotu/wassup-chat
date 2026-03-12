/**
 * History Hook
 * Manages message history state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { historyService } from '@/services/historyService';
import type { DecodedMessage } from '@/types';

interface UseHistoryReturn {
  // State
  messages: DecodedMessage[];
  favorites: DecodedMessage[];
  isLoading: boolean;
  
  // Actions
  refresh: () => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  search: (query: string) => Promise<DecodedMessage[]>;
  clearAll: () => Promise<void>;
}

export function useHistory(): UseHistoryReturn {
  const [messages, setMessages] = useState<DecodedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const allMessages = await historyService.getAll();
    setMessages(allMessages);
  }, []);

  // Load on mount
  useEffect(() => {
    refresh();
    setIsLoading(false);
  }, [refresh]);

  const toggleFavorite = useCallback(async (id: string) => {
    await historyService.toggleFavorite(id);
    await refresh();
  }, [refresh]);

  const deleteMessage = useCallback(async (id: string) => {
    await historyService.delete(id);
    await refresh();
  }, [refresh]);

  const search = useCallback(async (query: string): Promise<DecodedMessage[]> => {
    if (!query.trim()) return messages;
    return await historyService.search(query);
  }, [messages]);

  const clearAll = useCallback(async () => {
    await historyService.clearAll();
    await refresh();
  }, [refresh]);

  const favorites = messages.filter(m => m.favorited);

  return {
    messages,
    favorites,
    isLoading,
    refresh,
    toggleFavorite,
    deleteMessage,
    search,
    clearAll,
  };
}

export default useHistory;
