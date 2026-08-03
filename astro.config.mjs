// @ts-check
import { defineConfig, envField } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  output: 'server',
  adapter: node({ mode: 'standalone' }),

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
