// @ts-check
import { defineConfig, envField } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  server: {
    port: 4321,
  },

  vite: {
    plugins: [tailwindcss()],
  },

  env: {
    schema: {
      PUBLIC_API_URL: envField.string({
        context: 'client',
        access: 'public',
        default: 'http://localhost:3000/api',
      }),
      PUBLIC_APP_NAME: envField.string({
        context: 'client',
        access: 'public',
        default: 'Sistema Taller',
      }),
    },
  },
});
