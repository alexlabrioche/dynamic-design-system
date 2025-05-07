export function initializeTheme(): string {
  return `(function() {
    try {
      const persistedState = localStorage.getItem('theme-storage');
      let theme = 'light';
      
      if (persistedState) {
        const state = JSON.parse(persistedState);
        if (state && state.state && state.state.theme) {
          theme = state.state.theme;
        }
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Use system preference as fallback if no stored preference
        theme = 'dark';
      }
      
      document.documentElement.classList.add(theme);
      document.documentElement.setAttribute('data-theme', theme);
      
      // Prevent flash by setting display: none initially and removing after theme is applied
      // This can be removed or adjusted based on your app's needs
      const setInitialVisibility = function() {
        document.body.style.visibility = '';
      };
      document.addEventListener('DOMContentLoaded', setInitialVisibility);
      setTimeout(setInitialVisibility, 100);
    } catch (e) {
      console.error('Error setting initial theme:', e);
    }
  })();`
}
