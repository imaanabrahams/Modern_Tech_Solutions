/* Theme management for light and dark modes */

const THEME_KEY = 'app-theme';
const DARK_THEME = 'dark';
const LIGHT_THEME = 'light';

class ThemeManager {
  constructor() {
    this.currentTheme = this.loadTheme();
    this.applyTheme(this.currentTheme);
    this.setupSystemThemeListener();
  }

  loadTheme() {
    // Check localStorage first
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return DARK_THEME;
    }
    return DARK_THEME; // Default to dark theme
  }

  applyTheme(theme) {
    const html = document.documentElement;
    
    if (theme === LIGHT_THEME) {
      html.setAttribute('data-theme', LIGHT_THEME);
      html.style.colorScheme = 'light';
    } else {
      html.removeAttribute('data-theme');
      html.style.colorScheme = 'dark';
    }

    this.currentTheme = theme;
    localStorage.setItem(THEME_KEY, theme);
    this.dispatchThemeChange();
  }

  toggle() {
    const newTheme = this.currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
    this.applyTheme(newTheme);
    return newTheme;
  }

  getCurrent() {
    return this.currentTheme;
  }

  isDark() {
    return this.currentTheme === DARK_THEME;
  }

  isLight() {
    return this.currentTheme === LIGHT_THEME;
  }

  setupSystemThemeListener() {
    if (!window.matchMedia) return;
    
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeQuery.addEventListener('change', (e) => {
      // Only apply if user hasn't manually set a theme
      if (!localStorage.getItem(THEME_KEY)) {
        this.applyTheme(e.matches ? DARK_THEME : LIGHT_THEME);
      }
    });
  }

  dispatchThemeChange() {
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: this.currentTheme } }));
  }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Export for use in other scripts
window.themeManager = themeManager;
