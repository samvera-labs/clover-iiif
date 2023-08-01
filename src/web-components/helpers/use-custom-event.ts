import { MutableRefObject, useCallback } from 'react';

export function useCustomEvent(wc: MutableRefObject<any>, name: string, map?: (detail: any) => any) {
  return useCallback((detail: any) => {
    if (wc.current) {
      wc.current.dispatchEvent(new CustomEvent(name, { detail: map ? map(detail) : detail }));
    }
  }, [])
}
