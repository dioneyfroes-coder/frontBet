import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('sobre', 'routes/sobre.tsx'),
  route('contato', 'routes/contato.tsx'),
  route('login/*', 'routes/login.tsx'),
  route('perfil', 'routes/perfil.tsx'),
  route('perfil/atividade', 'routes/perfil.atividade.tsx'),
  route('loja', 'routes/loja.tsx'),
  route('jogos', 'routes/jogos.tsx'),
  route('auditoria', 'routes/auditoria.tsx'),
] satisfies RouteConfig;
