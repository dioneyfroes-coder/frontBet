Projeto Frontend (Nome Temporário)

Este repositório contém a base frontend de uma plataforma modular voltada para experiências interativas em tempo real. A arquitetura foi desenhada para ser rápida, expansível e fácil de adaptar a diferentes produtos — inclusive comerciais.

Objetivos do Projeto

Fornecer uma fundação moderna usando React + Remix.

Oferecer um sistema de temas (light, dark, high-contrast) totalmente tokenizado.

Permitir adição de novos módulos/jogos sem retrabalho estrutural.

Integrar com provedores de autenticação como Clerk (substituível no futuro).

Garantir desempenho fluido, UI responsiva e máxima segurança.

Facilitar evolução para produtos customizados, whitelabel ou versões comerciais.

Funcionalidades Atuais

Autenticação simples via Clerk.

Layout responsivo com identidade visual modular.

Suporte a múltiplos temas.

Estrutura para jogos plug-and-play.

Suporte inicial para carteira (saldo, depósitos, saques).

Sistema de componentes base padronizados.

Tecnologias

React + Remix

TypeScript

Vite

Framer Motion

ESLint (flat config)

React Router Typegen

Web Workers / otimizações multicore (quando aplicável)

Status

O projeto está em desenvolvimento ativo. O nome atual é apenas interno — a identidade final pode ser definida conforme o produto evoluir ou for comercializado. A estrutura foi planejada para facilitar rebranding completo.

Como Rodar
npm install
npm run dev

Contribuição

Pull requests são bem-vindos. O foco atual é estabilidade, acessibilidade, consistência visual e modularidade dos componentes.

Configurando variáveis de ambiente

- Copie o arquivo de exemplo: `cp .env.example .env` e atualize valores sensíveis como chaves do Clerk.
- A variável recomendada para configurar a URL base do backend é `NEXT_PUBLIC_API_BASE_URL`. O código mantém compatibilidade com nomes antigos, mas prefira usar essa.
- Timeout de requisição: `API_TIMEOUT_MS` (milissegundos, `0` = sem timeout).

Ativando/desativando mocks (MSW)

- Para ativar mocks no browser (builds), defina `NEXT_PUBLIC_USE_MOCKS=true` antes de compilar/rodar o app.
- Para ativar mocks em ambientes Node (scripts, CI), defina `USE_MOCKS=true`.
- Nos testes, mocks são ativados automaticamente quando `NODE_ENV==='test'`.

Exemplo rápido:

```
# use o exemplo para criar seu .env local
cp .env.example .env

# ativar mocks localmente
export NEXT_PUBLIC_USE_MOCKS=true

# rodar app
npm run dev
```

Integração contínua (GitHub Actions)

- Defina `NEXT_PUBLIC_API_BASE_URL` e `API_TIMEOUT_MS` como _secrets_ no repositório (Settings → Secrets). O workflow `CI` já lê `NEXT_PUBLIC_API_BASE_URL` para validar e executar testes com o valor correto.
- Exemplo de como adicionar secret via CLI (local):

```
gh secret set NEXT_PUBLIC_API_BASE_URL --body "https://backbet.onrender.com"
gh secret set API_TIMEOUT_MS --body "10000"
```

- O workflow `CI` roda lint, checagem de tipos, testes, build (quando aplicável) e valida o arquivo `docs da backend/openapi.json`.
