/**
 * Layout Hook
 * Detects and manages layout mode (full vs overlay/narrow)
 */

import { useState, useEffect, useCallback } from 'react';
import type { LayoutMode } from '@/types';

const OVERLAY_BREAKPOINT = 420;
const NARROW_BREAKPOINT = 640;

interface LayoutState {
  mode: LayoutMode;
  width: number;
  isNarrow: boolean;
  isOverlay: boolean;
  isMobile: boolean;
}

export function useLayout(): LayoutState {
  const [state, setState] = useState<LayoutState>(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    return {
      mode: width <= OVERLAY_BREAKPOINT ? 'overlay' : 'full',
      width,
      isNarrow: width <= NARROW_BREAKPOINT,
      isOverlay: width <= OVERLAY_BREAKPOINT,
      isMobile: width <= 768,
    };
  });

  const updateLayout = useCallback(() => {
    const width = window.innerWidth;
    setState({
      mode: width <= OVERLAY_BREAKPOINT ? 'overlay' : 'full',
      width,
      isNarrow: width <= NARROW_BREAKPOINT,
      isOverlay: width <= OVERLAY_BREAKPOINT,
      isMobile: width <= 768,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updateLayout);
    updateLayout();
    
    return () => window.removeEventListener('resize', updateLayout);
  }, [updateLayout]);

  return state;
}

export default useLayout;
