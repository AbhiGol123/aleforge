# Game Configurator for Cloudflare Deployment

This Astro project is configured for deployment to Cloudflare Pages with dynamic routes.

## 🚀 Project Structure

The project uses dynamic routing for game configurations:

```text
/
├── public/
├── src/
│   ├── components/
│   ├── layouts/
│   └── pages/
│       ├── index.astro
│       ├── plans.astro
│       └── game/
│           └── [gamename]/
│               ├── index.astro
│               └── [plan]/
│                   └── index.astro
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## ☁️ Deploying to Cloudflare Pages

This project is configured for deployment to Cloudflare Pages:

1. Build the project: `npm run build`
2. The build will generate all static assets in the `dist/` directory
3. Dynamic routes are configured to run as serverless functions on Cloudflare
4. The `_routes.json` file is automatically generated to control which routes use serverless functions

### Cloudflare Pages Settings

- Build command: `npm run build`
- Build output directory: `dist`

## 🔄 Dynamic Routes

The project uses the following dynamic routes:

- `/game/[gamename]` - Shows plans for a specific game
- `/game/[gamename]/[plan]` - Shows configuration for a specific game and plan

These routes are configured to run as serverless functions on Cloudflare Pages.
