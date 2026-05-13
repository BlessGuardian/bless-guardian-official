Site do nosso Projeto de TCC de CIÊNCIAS DA COMPUTAÇÃO - INSTITUTO MAUÁ DE TECNOLOGIA, Orientado pelo Prof. Rodrigo Bossini Tavares

## Rodando localmente com Aiven

Crie um arquivo `.env.local` com as credenciais do Aiven:

```env
AIVEN_DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/defaultdb?sslmode=require
AIVEN_CA_CERT=
AIVEN_CA_CERT_FILE=
AIVEN_DB_SCHEMA=public
AIVEN_FRAUD_LOGS_TABLE=fraud_logs
```

Depois rode:

```bash
npm.cmd install
npm.cmd run dev
```

O dashboard consome os logs em `/api/fraud-logs`. As credenciais do Aiven ficam apenas no servidor Node local, nunca no bundle do React.
