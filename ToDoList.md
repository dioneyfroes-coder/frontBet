Core de UX / Identidade

Criar design tokens (cores, tipografia, espaçamentos, bordas) independentes de tema.

Criar componentes base estilizados (Button, Card, Input, Toggle, Modal).

Definir animações padrões (fade, slide, hover) com framer-motion.

Criar layout principal (header, sidebar, content-area).

Implementar tema light/dark/high-contrast com persistência no user.

Autenticação e Segurança

Integrar Clerk no Remix (rotas públicas e privadas).

Criar middleware de proteção de rotas.

Tela de login simples + autenticação 2FA opcional.

Página de “atividade recente” para o usuário.

Auditoria de ações sensíveis (saques, depósitos).

Carteira (PIX)

- [x] Página de saldo + transações com WebSocket/stream.

- [x] Fluxo de depósito via PIX (geração, espera, confirmação).

- [x] Fluxo de saque via PIX (validação de dados).

- [x] Validações fortes no backend + feedback visual no front.

Jogos e Arquitetura Modular

Criar interface GameDescriptor: { id, name, icon, component, category }.

Criar registro global de jogos num array.

Menu gera itens automaticamente a partir do registro.

Página “/games/:slug” que carrega o componente dinâmico.

Criar placeholder de jogos e teste com backend real.

Perfil do Usuário

Formulário para dados pessoais (responsivo e simples).

Upload de documento (se necessário no futuro).

Configurações de notificação e segurança.

Dashboard

Cards com saldo, jogos mais jogados, promoções.

Histórico rápido de últimas ações.

Recomendações automáticas de jogos.

Performance

Remover tudo que for render redundante com React.memo.

Lazy load dos jogos.

Prefetch inteligente de rotas com Remix.

Futuro / Escalabilidade

Implementar feature flags.

Adicionar testes de UI com Playwright.

Monitorar erros com Sentry.

Telemetria de uso para descobrir onde o usuário trava.

extra:

multithreading / web workers para tarefas pesadas
offscreenCanvas para renderização gráfica
react + Concurrent Features
Suspense + React.lazy
useTransition para interações pesadas
memoização avançada com useMemo e useCallback

não esquecer de ser mobile first
linguagem padrão: português (Brasil)
acessibilidade (a11y) desde o início
internacionalização (i18n) desde o início
portugues brasil
portugues moçambique
ingles
espanhol

documentação clara do código e componentes

testes unitários e de integração

    CI/CD automatizado com testes e deploy automático
    monitoramento de performance e erros em produção
    SEO básico para páginas públicas

    otimização de imagens e assets
    suporte a múltiplos navegadores (cross-browser)

    otimização para web e mobile (PWA)
