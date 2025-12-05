/**
 * Decoder Hook
 * Manages decoding state and operations
 */

import { useState, useCallback } from 'react';
import { decoderService } from '@/services/decoderService';
import { historyService } from '@/services/historyService';
import type { DecodeRequest, DecodeResponse, DecodedMessage, ServiceStatus } from '@/types';

interface UseDecoderReturn {
  // State
  result: DecodeResponse | null;
  status: ServiceStatus;
  
  // Actions
  decode: (request: DecodeRequest) => Promise<DecodeResponse | null>;
  saveToHistory: () => DecodedMessage | null;
  clear: () => void;
}

export function useDecoder(): UseDecoderReturn {
  const [result, setResult] = useState<DecodeResponse | null>(null);
  const [status, setStatus] = useState<ServiceStatus>({
    isLoading: false,
    error: null,
  });

  const decode = useCallback(async (request: DecodeRequest): Promise<DecodeResponse | null> => {
    setStatus({ isLoading: true, error: null });
    
    try {
      const response = await decoderService.decodeMessage(request);
      setResult(response);
      setStatus({ isLoading: false, error: null });
      return response;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to decode message';
      setStatus({ isLoading: false, error });
      return null;
    }
  }, []);

  const saveToHistory = useCallback((): DecodedMessage | null => {
    if (!result) return null;
    return historyService.add(result);
  }, [result]);

  const clear = useCallback(() => {
    setResult(null);
    setStatus({ isLoading: false, error: null });
  }, []);

  return {
    result,
    status,
    decode,
    saveToHistory,
    clear,
  };
}

export default useDecoder;
