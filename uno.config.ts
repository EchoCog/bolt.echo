import { defineConfig } from 'unocss';

export default defineConfig({
  // unocss configuration
  shortcuts: [
    // add your shortcuts here
  ],
  theme: {
    colors: {
      // Ensure theme colors are available
      'bolt-elements': {
        borderColor: 'var(--bolt-elements-borderColor)',
        borderColorActive: 'var(--bolt-elements-borderColorActive)',
        'bg-depth-1': 'var(--bolt-elements-bg-depth-1)',
        'bg-depth-2': 'var(--bolt-elements-bg-depth-2)',
        'bg-depth-3': 'var(--bolt-elements-bg-depth-3)',
        'bg-depth-4': 'var(--bolt-elements-bg-depth-4)',
        textPrimary: 'var(--bolt-elements-textPrimary)',
        textSecondary: 'var(--bolt-elements-textSecondary)',
        textTertiary: 'var(--bolt-elements-textTertiary)',
        'background-depth-1': 'var(--bolt-elements-bg-depth-1)',
        'background-depth-2': 'var(--bolt-elements-bg-depth-2)',
        'background-depth-3': 'var(--bolt-elements-bg-depth-3)',
        'background-depth-4': 'var(--bolt-elements-bg-depth-4)',
        'terminals-background': 'var(--bolt-elements-terminals-background)',
        'terminals-buttonBackground': 'var(--bolt-elements-terminals-buttonBackground)',
        'preview-addressBar-background': 'var(--bolt-elements-preview-addressBar-background)',
        'preview-addressBar-backgroundHover': 'var(--bolt-elements-preview-addressBar-backgroundHover)',
        'preview-addressBar-backgroundActive': 'var(--bolt-elements-preview-addressBar-backgroundActive)',
        'preview-addressBar-text': 'var(--bolt-elements-preview-addressBar-text)',
        'preview-addressBar-textActive': 'var(--bolt-elements-preview-addressBar-textActive)',
        'sidebar-dropdownShadow': 'var(--bolt-elements-sidebar-dropdownShadow)',
        'sidebar-buttonBackgroundDefault': 'var(--bolt-elements-sidebar-buttonBackgroundDefault)',
        'sidebar-buttonBackgroundHover': 'var(--bolt-elements-sidebar-buttonBackgroundHover)',
        'sidebar-buttonText': 'var(--bolt-elements-sidebar-buttonText)',
      },
    },

    // add your theme customizations here
  },
  rules: [
    // add your custom rules here
  ],
});
