import { useEffect, useState } from 'react';
import { personaLoader } from '../utils/personaLoader';

export const usePersonaLibrary = (companyDomain) => {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const library = await personaLoader.loadPersonaLibrary(companyDomain);
        if (!isMounted) return;
        setState({ data: library, loading: false, error: null });
      } catch (error) {
        console.error('Failed to load persona library:', error);
        if (!isMounted) return;
        setState({ data: null, loading: false, error: error.message || 'Failed to load persona library' });
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [companyDomain]);

  return state;
};
