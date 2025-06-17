// src/hooks/useResponsive.js
import { useState, useEffect } from 'react';

export const useResponsive = () => {
  const [screenData, setScreenData] = useState(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      width,
      height,
      // Device type detection
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      isLargeDesktop: width >= 1536,
      
      // Specific mobile breakpoints
      isSmallMobile: width < 640,
      isMediumMobile: width >= 640 && width < 768,
      
      // Chat-specific responsive states
      showMobileLayout: width < 768,
      showSidebarOverlay: width < 1024,
      canShowBothPanes: width >= 1024,
      
      // Orientation
      isLandscape: width > height,
      isPortrait: height >= width,
      
      // Touch device detection
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenData({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isLargeDesktop: width >= 1536,
        isSmallMobile: width < 640,
        isMediumMobile: width >= 640 && width < 768,
        showMobileLayout: width < 768,
        showSidebarOverlay: width < 1024,
        canShowBothPanes: width >= 1024,
        isLandscape: width > height,
        isPortrait: height >= width,
        isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      });
    };

    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return screenData;
};