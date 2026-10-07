# Syncar

## Variáveis de ambiente

O Next.js seleciona automaticamente os arquivos da raiz conforme o comando:

| Modo | Arquivo local | Referência versionada |
| --- | --- | --- |
| Desenvolvimento (`pnpm dev`) | `.env.development.local` | `.env.development.example` |
| Produção (`pnpm build` e `pnpm start`) | Variáveis do ambiente de deploy; `.env.production.local` apenas para simulação local | `.env.production.example` |

O Prisma CLI usa a mesma seleção por meio de `prisma.config.ts`. Para comandos locais, use `pnpm exec prisma ...`. Para migrações em produção, forneça as variáveis no ambiente de deploy e execute com `NODE_ENV=production`.

1. Copie `.env.development.example` para `.env.development.local` se ainda não tiver o arquivo.
2. Configure `DATABASE_URL` para um PostgreSQL local e substitua os valores de exemplo usados pelas integrações. Gere valores diferentes para `NEXTAUTH_SECRET` e `CRON_SECRET`.
3. Execute `pnpm exec prisma migrate dev` e `pnpm dev`.

O arquivo `.env.development.local` é ignorado pelo Git. Não crie um `.env` genérico com credenciais locais, pois o Next.js também o carregaria em produção. Os valores `NEXT_PUBLIC_*` são incorporados ao JavaScript durante `pnpm build`; configure os IDs de preço do ambiente de destino antes da compilação. `NODE_ENV` é definido automaticamente pelo Next.js e não deve ser colocado nos arquivos `.env*`.

Stripe exige chaves e preços do modo de teste em desenvolvimento e valores live em produção. O envio de recuperação de senha exige um servidor SMTP configurado. A porta `1025` do exemplo local pressupõe um servidor SMTP de desenvolvimento, como Mailpit.
