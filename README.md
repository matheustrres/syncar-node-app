# Syncar

**Português (Brasil)** · [English](#english)

## Português (Brasil)

O Syncar é uma plataforma para gestão de locadoras. Reúne informações da frota, motoristas, contratos, manutenções e financeiro em um só lugar.

### Áreas da plataforma

- Visão geral da operação
- Cadastro e acompanhamento de veículos e motoristas
- Gestão de contratos e manutenções
- Controle financeiro, cobranças e relatórios
- Perfil e notificações

As capturas de demonstração ficam em [`public/screenshots`](public/screenshots/). Elas não são incorporadas a este README.

### Tecnologias

- Next.js 15 e React 19
- TypeScript
- Prisma e PostgreSQL
- Redis para cache e controle de taxa
- NextAuth para autenticação
- Stripe para assinaturas

### Requisitos

- Node.js compatível com Next.js 15
- pnpm
- Docker Compose

### Executar localmente

1. Instale as dependências:

   ```bash
   pnpm install
   ```

2. Inicie PostgreSQL e Redis:

   ```bash
   docker compose up -d
   ```

   O PostgreSQL fica disponível em `127.0.0.1:5433` e os dados persistem no volume `postgres_data`. O Redis usa `127.0.0.1:6379` e o volume `redis_data`. As credenciais do PostgreSQL no Compose correspondem à URL do arquivo de desenvolvimento; se alterá-las, atualize também a URL. Um volume já inicializado mantém as credenciais originais.

3. Copie `.env.development.example` para `.env.development.local` e ajuste os valores para seu ambiente. O arquivo de exemplo já aponta para os serviços locais do Compose. Configure também os dados de teste do Stripe e do serviço de e-mail se for usar esses recursos.

4. Aplique as migrações e inicie o servidor:

   ```bash
   pnpm exec prisma migrate dev
   pnpm dev
   ```

5. Acesse [http://localhost:3000](http://localhost:3000).

O Next.js carrega `.env.development.local` durante `pnpm dev`. Para produção, configure as variáveis no ambiente de deploy; `.env.production.example` serve como referência. O Prisma CLI segue essa seleção por meio de `prisma.config.ts`. Não versione arquivos `.env*.local` nem use um `.env` genérico: o Next.js também o carrega em produção.

Para aplicar migrações em produção, configure as variáveis no ambiente de deploy e execute `NODE_ENV=production pnpm exec prisma migrate deploy`.

As variáveis `NEXT_PUBLIC_*` são incorporadas ao JavaScript durante `pnpm build`. Configure os IDs de preço do Stripe para o ambiente de destino antes da compilação. Use chaves de teste do Stripe em desenvolvimento e chaves live em produção. `NODE_ENV` é definido pelo Next.js e não deve ser colocado nos arquivos `.env*`.

### Cache

O Redis armazena resultados por usuário e escopo. As mutações incrementam a versão dos escopos afetados; entradas antigas deixam de ser lidas e expiram pelo TTL. Listas de veículos, motoristas, contratos, manutenções e relatórios usam TTL de 5 minutos; consultas financeiras, 1 minuto; dashboard e relatório de pagamentos vencidos, 30 segundos.

Para habilitar métricas do cache, defina `CACHE_METRICS_ENABLED=true`. Com atividade, os logs agregam a cada 60 segundos, por escopo, acessos, acertos, ausências, desvios por falha ou indisponibilidade do Redis e duração média/máxima de carregamento após uma ausência. Essa duração inclui a consulta ao banco e a preparação do resultado, não apenas o tempo de SQL. As métricas são locais a cada processo e reiniciam quando ele reinicia.

---

## English

Syncar is a fleet management platform for car rental businesses. It brings fleet, driver, contract, maintenance, and financial information together.

### Platform areas

- Operations overview
- Vehicle and driver records
- Contract and maintenance management
- Financial tracking, collections, and reports
- Profile and notifications

Demonstration screenshots are available in [`public/screenshots`](public/screenshots/). They are not embedded in this README.

### Tech stack

- Next.js 15 and React 19
- TypeScript
- Prisma and PostgreSQL
- Redis for caching and rate limiting
- NextAuth for authentication
- Stripe for subscriptions

### Requirements

- Node.js compatible with Next.js 15
- pnpm
- Docker Compose

### Run locally

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start PostgreSQL and Redis:

   ```bash
   docker compose up -d
   ```

   PostgreSQL is available at `127.0.0.1:5433`, with data persisted in the `postgres_data` volume. Redis uses `127.0.0.1:6379` and the `redis_data` volume. The Compose PostgreSQL credentials match the development database URL; update the URL if you change them. An initialized volume keeps its original credentials.

3. Copy `.env.development.example` to `.env.development.local` and set values for your environment. The example file is configured for the local Compose services. Add Stripe test credentials and email service settings if you plan to use those features.

4. Apply database migrations and start the development server:

   ```bash
   pnpm exec prisma migrate dev
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

Next.js loads `.env.development.local` when running `pnpm dev`. In production, set variables in the deployment environment; `.env.production.example` is provided as a reference. Prisma CLI follows this selection through `prisma.config.ts`. Do not commit `.env*.local` files or use a generic `.env` file, which Next.js also loads in production.

To apply production migrations, set variables in the deployment environment and run `NODE_ENV=production pnpm exec prisma migrate deploy`.

`NEXT_PUBLIC_*` variables are embedded in the JavaScript bundle during `pnpm build`. Set the Stripe price IDs for the target environment before building. Use Stripe test keys in development and live keys in production. Next.js sets `NODE_ENV`; do not add it to `.env*` files.

### Cache

Redis stores results by user and scope. Mutations increment the version of affected scopes, so older entries are no longer read and expire through their TTL. Vehicle, driver, contract, maintenance, and report lists use a 5-minute TTL; financial queries use 1 minute; the dashboard and overdue payment report use 30 seconds.

Set `CACHE_METRICS_ENABLED=true` to enable cache metrics. When there is activity, logs aggregate accesses, hits, misses, Redis failures or unavailability, and average/maximum load duration after a miss by scope every 60 seconds. This duration includes the database query and result preparation, not just SQL execution time. Metrics are local to each process and reset when it restarts.
