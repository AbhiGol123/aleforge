// Vite plugin to add CORS headers
export const corsPlugin = () => {
  return {
    name: 'cors-plugin',
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
        next();
      });
    }
  };
};