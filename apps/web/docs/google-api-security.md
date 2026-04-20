# Google Places API — Segurança e Controle de Custos

Runbook para operar a integração Google Places do TRPY com segurança e teto de custo.

---

## 1. Arquitetura de segurança

### Duas chaves distintas

| Variável | Escopo | Restrições no GCP Console |
|----------|--------|---------------------------|
| `GOOGLE_PLACES_API_KEY` | **Server-only.** Usada em rotas `/api/...` para Autocomplete, Details, Text Search, Photo, Geocode. | APIs habilitadas: **Places API**, **Geocoding API**. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | **Browser.** Usada apenas pelo Maps JS SDK (mapa interativo). | APIs habilitadas: **Maps JavaScript API** apenas. Restrição de **HTTP referrer**. |

> A chave pública é inevitável: o Maps JS SDK carrega no browser. A proteção real vem da restrição de domínio + scoping ao SDK mais barato.

### Restrições a aplicar no Google Cloud Console

**Para `GOOGLE_PLACES_API_KEY` (privada):**

1. Abra: https://console.cloud.google.com/apis/credentials
2. Clique na chave → **Application restrictions** → **None** (ver caixa abaixo sobre IP).
3. **API restrictions** → **Restrict key** → marcar apenas:
   - `Places API`
   - `Geocoding API`
4. Salvar.

> **Sobre restrição por IP:** o Vercel não publica lista estável de IPs de saída fora do plano Enterprise. Há três caminhos:
> - (A) **Aceitar sem restrição de IP** e depender das quotas + kill switch. É o default neste projeto.
> - (B) **Proxy dedicado** em um servidor de IP fixo (Fly.io, DigitalOcean) que encaminha para o Google — todas as chamadas passam por lá, o Google vê apenas aquele IP. Custo operacional extra.
> - (C) **Cloudflare Worker** com IP fixo do CF. Mesma ideia, mais simples de operar.

**Para `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (pública):**

1. Mesma tela de credenciais.
2. **Application restrictions** → **HTTP referrers** → adicionar:
   - `https://trpy.com/*`
   - `https://*.trpy.com/*`
   - `https://*.vercel.app/*` (opcional, preview deploys)
   - `http://localhost:3001/*` (dev)
3. **API restrictions** → apenas `Maps JavaScript API`.
4. Salvar.

### Quotas no console GCP (última camada de defesa)

Mesmo com o kill switch da aplicação, configure quotas no próprio GCP — se a aplicação falhar, o Google para antes da conta detonar.

1. Abra: https://console.cloud.google.com/apis/api/places-backend.googleapis.com/quotas
2. Defina limite diário para **Autocomplete (per session)**, **Place Details**, **Text Search**, **Photo**: comece com 3.000/dia cada (ajuste conforme tráfego real).
3. Configure **billing alerts**: https://console.cloud.google.com/billing/budgets
   - Budget de R$500/mês, alertas em 50%/80%/100%.

---

## 2. Kill switch e monitoramento

### Variáveis de ambiente

```env
GOOGLE_PLACES_API_KEY=AIza...              # server-only
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...    # browser, Maps SDK

GOOGLE_MONTHLY_BUDGET_USD=80               # teto mensal em USD (default 80 ≈ R$400)
GOOGLE_API_DISABLED=false                  # hard kill via env

ADMIN_SECRET=<token-longo-aleatorio>       # protege /api/admin/*
```

### Camadas do kill switch (em ordem de precedência)

1. **`GOOGLE_API_DISABLED=true`** — hard kill via env. Desliga tudo imediatamente.
2. **`killed: true` no banco** — acionado via endpoint admin (rápido, sem redeploy).
3. **Budget excedido** — ao atingir `GOOGLE_MONTHLY_BUDGET_USD` no mês, trava automaticamente até o primeiro do mês seguinte (reset natural pelo campo `period = YYYY-MM`).

### Monitorar uso

```bash
curl https://trpy.com/api/admin/google-usage \
  -H "x-admin-secret: $ADMIN_SECRET"
```

Resposta:
```json
{
  "status": {
    "blocked": false,
    "reason": null,
    "usagePercent": 34.50,
    "totalUsd": "27.60",
    "budgetUsd": "80.00",
    "period": "2026-04"
  },
  "breakdown": [
    { "operation": "autocomplete", "calls": 15420, "costUsd": "4.36" },
    { "operation": "details",       "calls": 892,   "costUsd": "15.16" },
    { "operation": "photo",         "calls": 1148,  "costUsd": "8.04" }
  ]
}
```

### Acionar/liberar kill switch manual

```bash
# Parar todas as chamadas ao Google imediatamente
curl -X POST https://trpy.com/api/admin/google-usage \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -H "content-type: application/json" \
  -d '{"killed": true}'

# Reativar
curl -X POST https://trpy.com/api/admin/google-usage \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -H "content-type: application/json" \
  -d '{"killed": false}'
```

---

## 3. Modo degradado (o que o usuário vê)

Quando o guard bloqueia:

| Endpoint | Comportamento bloqueado |
|---------|-------------------------|
| `/api/places/autocomplete` | Retorna apenas resultados da base local (`lib/search/local-destinations.ts`). Header `X-Search-Degraded`. |
| `/api/places/search` | Retorna `[]`. O caller (card de destination, listagem) mostra o estado vazio. |
| `/api/places/[id]` | Retorna 404 (place não encontrado). |
| `/api/place-photo` | Retorna 204 (sem imagem). UI cai para placeholder. |
| `/api/destination-photo` | Retorna `{ photoUrl: null }`. UI usa placeholder. |

Nenhum endpoint "quebra" — todos têm fallback gracioso.

---

## 4. Rate limiting

Proteção adicional contra abuso de um mesmo IP (scrapers, bugs de loop):

| Endpoint | Limite |
|----------|--------|
| `/api/places/autocomplete` | 60 req/min por IP |
| `/api/places/search`       | 30 req/min por IP |
| `/api/places/[id]`         | 60 req/min por IP |
| `/api/destination-photo`   | 60 req/min por IP |

Implementação em memória por instância serverless (sliding window em `lib/rate-limit.ts`). O limit é de proteção, não de fairness — o teto de custo real é enforçado pelo kill switch.

---

## 5. Validação de input

Todos os endpoints validam:

- **Query**: regex `/^[\p{L}\p{N}\s'\-,.()]+$/u` (letras Unicode, números, espaços, pontuação comum).
- **place_id**: regex `/^[A-Za-z0-9_\-]{5,256}$/`.
- **photo_reference**: idem, 20–2048 chars.
- **maxwidth**: clamped para `[200, 1600]`.
- **country**: ISO 3166-1 alpha-2.

---

## 6. Checklist de produção

- [ ] Criar 2 API keys separadas no GCP (server + browser).
- [ ] Restringir **API keys** por tipo de API (Places/Geocoding para server, Maps JS para browser).
- [ ] Configurar **HTTP referrers** para a chave do browser.
- [ ] Configurar **quotas diárias** no GCP (3k/dia por operação).
- [ ] Configurar **billing alerts** (50/80/100% de R$500).
- [ ] Setar `GOOGLE_MONTHLY_BUDGET_USD=80` no Vercel.
- [ ] Gerar `ADMIN_SECRET` aleatório longo (`openssl rand -hex 32`).
- [ ] Rodar `prisma migrate deploy` para criar `api_usage`.
- [ ] Testar `/api/admin/google-usage` em produção.
- [ ] Anotar o dashboard no Notion/Linear para checagem semanal.
