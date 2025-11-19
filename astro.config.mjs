// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';
import { corsPlugin } from './src/lib/corsPlugin.js';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind()],
  output: "static",
  adapter: cloudflare({
    routes: {
      extend: {
        include: [
          { pattern: '/game/*' },
          { pattern: '/game/*/*' }
        ]
      }
    }
  }),
  vite: {
    plugins: [corsPlugin()]
  }
});