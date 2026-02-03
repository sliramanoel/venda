import { useEffect } from 'react';

/**
 * ThemeProvider - Applies dynamic color scheme from settings
 * Uses CSS custom properties for real-time color updates
 */
const ThemeProvider = ({ settings }) => {
  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;
    
    // Primary color and variants
    if (settings.primaryColor) {
      root.style.setProperty('--color-primary', settings.primaryColor);
      root.style.setProperty('--color-primary-rgb', hexToRgb(settings.primaryColor));
    }
    
    if (settings.primaryColorLight) {
      root.style.setProperty('--color-primary-light', settings.primaryColorLight);
    }
    
    if (settings.primaryColorDark) {
      root.style.setProperty('--color-primary-dark', settings.primaryColorDark);
    }
    
    // Secondary color
    if (settings.secondaryColor) {
      root.style.setProperty('--color-secondary', settings.secondaryColor);
    }
    
    // Accent color
    if (settings.accentColor) {
      root.style.setProperty('--color-accent', settings.accentColor);
    }

  }, [settings]);

  return null;
};

// Convert hex to RGB values for rgba() usage
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }
  return '5, 150, 105'; // Default emerald-600
}

export default ThemeProvider;
