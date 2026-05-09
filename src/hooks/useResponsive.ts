import { useEffect, useState } from 'react';

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

function getInitialState(): ResponsiveState {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    };
  }

  return {
    isMobile: window.matchMedia('(max-width: 767px)').matches,
    isTablet: window.matchMedia('(min-width: 768px) and (max-width: 1024px)').matches,
    isDesktop: window.matchMedia('(min-width: 1025px)').matches,
  };
}

export function useResponsive() {
  const [state, setState] = useState<ResponsiveState>(() => getInitialState());

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const tabletQuery = window.matchMedia('(min-width: 768px) and (max-width: 1024px)');
    const desktopQuery = window.matchMedia('(min-width: 1025px)');

    const update = () => {
      setState({
        isMobile: mobileQuery.matches,
        isTablet: tabletQuery.matches,
        isDesktop: desktopQuery.matches,
      });
    };

    update();

    mobileQuery.addEventListener('change', update);
    tabletQuery.addEventListener('change', update);
    desktopQuery.addEventListener('change', update);

    return () => {
      mobileQuery.removeEventListener('change', update);
      tabletQuery.removeEventListener('change', update);
      desktopQuery.removeEventListener('change', update);
    };
  }, []);

  return state;
}
