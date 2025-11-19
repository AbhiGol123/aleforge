// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';
import cloudflare from '@astrojs/cloudflare';
import { corsPlugin } from './src/lib/corsPlugin.js';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind()],
  output: "static",
  adapter: cloudflare(),
  //adapter: node({ mode: 'standalone' }),
  vite: {
    plugins: [corsPlugin()]
  }
});


