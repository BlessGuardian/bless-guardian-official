# BlessGuardian | Site

> Site institucional e dashboard de inteligência coletiva do projeto AntiFraud Agent.

---

## Sobre o projeto

Este é o site oficial do **BlessGuardian / AntiFraud Agent**, projeto desenvolvido como Trabalho de Conclusão de Curso (TCC) do curso de Ciências da Computação do **Instituto Mauá de Tecnologia (IMT)**.

O site cumpre dois papéis:

1. **Landing page** apresentando o projeto, a equipe e o problema dos golpes digitais no Brasil.
2. **Dashboard** que consome os `fraud_logs` registrados pelo backend e exibe estatísticas agregadas sobre golpes detectados.

---

## Equipe

| Nome | Papel |
|---|---|
| Ramon Santos Pereira | Desenvolvedor |
| Luiz Miguel Seixeiro | Desenvolvedor |
| Mitchell Miyake | Desenvolvedor |

**Orientador:** Prof. Rodrigo Bossini Tavares

---

## Arquitetura

```
[Navegador]
    │
    ▼
[Cloudflare Workers]
    │
    ├── Assets estáticos (React build em /dist)
    │
    └── /api/fraud-logs
          └── Worker → cliente PostgreSQL → Aiven
                                          (histórico legado de fraudes)
```

Em desenvolvimento local, o `server/index.mjs` substitui o Worker e serve o `/api/fraud-logs` a partir da mesma fonte (Aiven), sem expor credenciais no bundle React.

> **Nota:** o backend Python migrou para DynamoDB. Este dashboard ainda consome o histórico Aiven/PostgreSQL legado. A migração do dashboard para o DynamoDB do `fraud_message_detection` está no roadmap.

---

## Stack

- **Linguagem:** TypeScript
- **Framework:** React 18 + Vite 5
- **Estilização:** Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Estado de dados:** TanStack Query (React Query)
- **Gráficos:** Recharts
- **Roteamento:** React Router DOM 6
- **Validação:** React Hook Form + Zod
- **Server de dev:** Node (`server/index.mjs`)
- **Worker / Deploy:** Cloudflare Workers (Wrangler)
- **Banco consumido:** Aiven / PostgreSQL (tabela `fraud_logs`)
- **Testes:** Vitest + Testing Library + Playwright (E2E)

---

## Estrutura do projeto

```
bless-guardian-official/
├── src/
│   ├── App.tsx                  → bootstrap React + router
│   ├── main.tsx                 → entry point Vite
│   ├── pages/
│   │   ├── Index.tsx            → landing page
│   │   ├── Dashboard.tsx        → painel de estatísticas
│   │   ├── Login.tsx            → autenticação
│   │   └── NotFound.tsx         → 404
│   ├── components/              → componentes reutilizáveis (shadcn)
│   ├── hooks/                   → React hooks customizados
│   ├── integrations/            → clientes Supabase / PG
│   ├── lib/                     → utilitários
│   └── test/                    → testes unitários (Vitest)
├── server/
│   └── index.mjs                → server Node local (dev)
├── worker/
│   └── index.js                 → Cloudflare Worker (produção)
├── public/                      → assets estáticos
├── supabase/                    → configuração Supabase
├── playwright.config.ts         → E2E
├── vite.config.ts               → bundler
└── wrangler.jsonc               → config Cloudflare
```

---

## Variáveis de ambiente

Crie um `.env.local` para desenvolvimento:

```env
AIVEN_DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/defaultdb?sslmode=require
AIVEN_CA_CERT=
AIVEN_CA_CERT_FILE=
AIVEN_DB_SCHEMA=public
AIVEN_FRAUD_LOGS_TABLE=fraud_logs
```

As credenciais ficam exclusivamente no server Node — nunca são embarcadas no bundle React.

---

## Como executar localmente

1. Clone o repositório
```bash
git clone https://github.com/BlessGuardian/bless-guardian-official.git
cd bless-guardian-official
```

2. Instale as dependências
```bash
npm install
```

3. Configure o `.env.local` (ver seção acima)

4. Suba o server de dev (Node + Vite via proxy)
```bash
npm run dev
```

5. Acesse `http://localhost:5173`

### Outros comandos

| Comando | Descrição |
|---|---|
| `npm run build` | Gera build de produção em `dist/` |
| `npm run preview` | Roda o build localmente via Node |
| `npm run lint` | Verifica estilo com ESLint |
| `npm run test` | Roda testes unitários (Vitest) |
| `npm run test:watch` | Testes em modo watch |
| `npm run deploy` | Build + deploy no Cloudflare via Wrangler |

---

## Deploy no Cloudflare Workers

No painel do Cloudflare, configure as mesmas variáveis do `.env.local`:

```env
AIVEN_DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/defaultdb?sslmode=require
AIVEN_CA_CERT=MI...
AIVEN_DB_SCHEMA=public
AIVEN_FRAUD_LOGS_TABLE=fraud_logs
```

O Worker precisa do pacote `pg`, então a variável `SKIP_DEPENDENCY_INSTALL` (se existir) deve estar como `false` ou ausente, para que `npm install` rode antes do deploy.

Comando de deploy:

```bash
npm run deploy
```

---

## Repositórios relacionados

- **App Android:** [anti-fraud-agent-android](https://github.com/BlessGuardian/anti-fraud-agent-android)
- **Backend Python:** [fraud_message_detection](https://github.com/BlessGuardian/fraud_message_detection)

---

## Contexto acadêmico

**Instituição:** Instituto Mauá de Tecnologia (IMT)
**Curso:** Ciências da Computação
**Tipo:** Trabalho de Conclusão de Curso (TCC) — 2026
