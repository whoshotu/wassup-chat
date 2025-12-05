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
  refresh: () => void;
  toggleFavorite: (id: string) => void;
  deleteMessage: (id: string) => void;
  search: (query: string) => DecodedMessage[];
  clearAll: () => void;
}

export function useHistory(): UseHistoryReturn {
  const [messages, setMessages] = useState<DecodedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setMessages(historyService.getAll());
  }, []);

  // Load on mount
  useEffect(() => {
    refresh();
    setIsLoading(false);
  }, [refresh]);

  const toggleFavorite = useCallback((id: string) => {
    historyService.toggleFavorite(id);
    refresh();
  }, [refresh]);

  const deleteMessage = useCallback((id: string) => {
    historyService.delete(id);
    refresh();
  }, [refresh]);

  const search = useCallback((query: string): DecodedMessage[] => {
    if (!query.trim()) return messages;
    return historyService.search(query);
  }, [messages]);

  const clearAll = useCallback(() => {
    historyService.clearAll();
    refresh();
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
