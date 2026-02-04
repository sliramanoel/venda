# NeuroVita - Product Requirements Document

## Problema Original
Plataforma de e-commerce whitelabel completa para venda de produtos, com painel administrativo configurável, integração de pagamentos PIX via OrionPay, rastreamento de conversões via Meta Pixel, e sistema de Analytics.

## Público-Alvo
- Empreendedores que desejam vender produtos online
- Lojas que precisam de sistema de pagamento PIX
- Negócios que anunciam no Meta Ads

## Funcionalidades Implementadas

### Sistema Whitelabel
- [x] Página de vendas dinâmica e configurável
- [x] Todas as informações vêm do banco de dados
- [x] Imagens, textos e preços editáveis via admin

### Painel Administrativo
- [x] Autenticação JWT segura
- [x] Gestão de conteúdo do site
- [x] Upload de imagens persistente
- [x] Configuração de pagamentos (OrionPay)
- [x] Configuração de Meta Pixel
- [x] Customização de tema/cores
- [x] Visualização de pedidos com filtros e estatísticas
- [x] **NEW: Dashboard de Analytics**

### Sistema de Analytics (NOVO)
- [x] Tracking de pageviews
- [x] Tracking de ações (cliques, checkout, etc.)
- [x] Contagem de visitantes únicos
- [x] Sessões de usuários
- [x] Usuários online em tempo real
- [x] Filtros por período (Hoje, 7 dias, 30 dias, Mês)
- [x] Detecção de dispositivo (mobile/desktop)
- [x] Detecção de navegador e SO
- [x] Captura de UTM parameters

### Pagamentos
- [x] Integração OrionPay para PIX
- [x] Geração de QR Code funcional
- [x] Webhook para confirmação automática
- [x] Página de sucesso pós-compra

### Marketing/SEO
- [x] Meta Pixel integrado
- [x] Rastreamento de eventos (PageView, Purchase)
- [x] Captura de parâmetros UTM
- [x] Tags Open Graph configuráveis

### Validações
- [x] Validação de email em tempo real
- [x] Validação de telefone brasileiro
- [x] Proteção contra pedidos falsos

### Deployment
- [x] Script install.sh para VPS (v2.0 - testado)
- [x] docker-compose.yml para containerização
- [x] Badge Emergent removido

---

## Arquitetura Técnica

### Backend (FastAPI)
- `/app/backend/server.py` - Aplicação principal
- `/app/backend/routers/analytics.py` - Sistema de Analytics
- `/app/backend/routers/` - Outros endpoints

### Frontend (React)
- `/app/frontend/src/pages/Admin.jsx` - Painel admin com Analytics
- `/app/frontend/src/components/AnalyticsDashboard.jsx` - Dashboard de Analytics
- `/app/frontend/src/services/api.js` - Cliente API com analyticsApi

### Banco de Dados (MongoDB)
- **settings** - Configurações do site
- **orders** - Pedidos
- **users** - Usuários admin
- **pageviews** - Tracking de páginas (NOVO)
- **sessions** - Sessões de usuários (NOVO)
- **actions** - Ações rastreadas (NOVO)

---

## API Endpoints de Analytics

```
POST /api/analytics/track/pageview - Rastrear visualização de página
POST /api/analytics/track/action - Rastrear ação do usuário
GET /api/analytics/stats/overview - Estatísticas gerais
GET /api/analytics/stats/realtime - Usuários online em tempo real
GET /api/analytics/stats/pageviews - Páginas mais visitadas
GET /api/analytics/stats/devices - Dispositivos e navegadores
GET /api/analytics/stats/traffic-sources - Fontes de tráfego (UTM)
GET /api/analytics/stats/timeline - Visualizações ao longo do tempo
GET /api/analytics/stats/actions - Ações dos usuários
```

---

## Instalação em Produção

**Site Testado:** neurovitanatural.com
**VPS:** VDSina (Ubuntu 22.04)

### Comandos para Atualizar na VPS:
```bash
cd /var/www/neurovita
git pull
cd frontend && yarn build && cp -r build/* .
systemctl restart neurovita-backend
```

---

## Backlog (P2)
- [ ] Gráficos de linha para timeline de visualizações
- [ ] Exportar dados de analytics para CSV
- [ ] Sistema de backup automático MongoDB
- [ ] Notificações por WhatsApp

---

## Última Atualização
- **Data:** 04 de Fevereiro de 2026
- **Status:** MVP Completo + Sistema de Analytics
