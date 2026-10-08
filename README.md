# Syncar

## Variáveis de ambiente

O Next.js seleciona automaticamente os arquivos da raiz conforme o comando:

| Modo | Arquivo local | Referência versionada |
| --- | --- | --- |
| Desenvolvimento (`pnpm dev`) | `.env.development.local` | `.env.development.example` |
| Produção (`pnpm build` e `pnpm start`) | Variáveis do ambiente de deploy; `.env.production.local` apenas para simulação local | `.env.production.example` |

O Prisma CLI usa a mesma seleção por meio de `prisma.config.ts`. Para comandos locais, use `pnpm exec prisma ...`. Para migrações em produção, forneça as variáveis no ambiente de deploy e execute com `NODE_ENV=production`.

1. Inicie o PostgreSQL local com `docker compose up -d postgres`. O banco usa a porta `5433` apenas em `127.0.0.1` e mantém os dados no volume `postgres_data`.
2. Copie `.env.development.example` para `.env.development.local` se ainda não tiver o arquivo. Use `DATABASE_URL=postgresql://syncar:syncar-local@127.0.0.1:5433/syncar?schema=public` para conectar a aplicação e o Prisma executados no host. Substitua os valores de exemplo das integrações e gere valores diferentes para `NEXTAUTH_SECRET` e `CRON_SECRET`.
3. Execute `pnpm exec prisma migrate dev` e `pnpm dev`. Para verificar o banco, use `docker compose exec postgres pg_isready -U syncar -d syncar`.

O Compose não lê as variáveis da aplicação: as credenciais locais de desenvolvimento estão declaradas em `compose.yaml` e correspondem ao `DATABASE_URL` do exemplo. Se mudar usuário, senha, banco ou porta no Compose, atualize também `.env.development.local`. Um volume já inicializado mantém as credenciais originais; a alteração de `POSTGRES_*` não as troca automaticamente.

O arquivo `.env.development.local` é ignorado pelo Git. Não crie um `.env` genérico com credenciais locais, pois o Next.js também o carregaria em produção. Os valores `NEXT_PUBLIC_*` são incorporados ao JavaScript durante `pnpm build`; configure os IDs de preço do ambiente de destino antes da compilação. `NODE_ENV` é definido automaticamente pelo Next.js e não deve ser colocado nos arquivos `.env*`.

Stripe exige chaves e preços do modo de teste em desenvolvimento e valores live em produção. O envio de recuperação de senha exige um servidor SMTP configurado. A porta `1025` do exemplo local pressupõe um servidor SMTP de desenvolvimento, como Mailpit.
