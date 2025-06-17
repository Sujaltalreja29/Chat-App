// src/hooks/useKeyboard.js
import { useState, useEffect } from 'react';

export const useVirtualKeyboard = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    // Only for mobile devices
    if (!('visualViewport' in window)) {
      return;
    }

    const initialHeight = window.visualViewport.height;
    
    const handleViewportChange = () => {
      const currentHeight = window.visualViewport.height;
      const heightDifference = initialHeight - currentHeight;
      
      // Keyboard is likely open if viewport height decreased significantly
      const keyboardOpen = heightDifference > 150;
      
      setIsKeyboardOpen(keyboardOpen);
      setKeyboardHeight(keyboardOpen ? heightDifference : 0);
      
      // Add CSS custom property for dynamic height calculations
      document.documentElement.style.setProperty(
        '--keyboard-height', 
        `${keyboardOpen ? heightDifference : 0}px`
      );
    };

    window.visualViewport.addEventListener('resize', handleViewportChange);
    
    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
      document.documentElement.style.removeProperty('--keyboard-height');
    };
  }, []);

  return { isKeyboardOpen, keyboardHeight };
};