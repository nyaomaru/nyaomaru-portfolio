import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/_index.tsx'),
  route('profile', 'routes/profile.tsx'),
  route('articles', 'routes/articles.tsx'),
  route('game', 'routes/game.tsx'),
  route('api/ask', 'routes/api.ask.ts'),
] satisfies RouteConfig;
