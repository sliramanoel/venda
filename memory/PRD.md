# NeuroVita - Product Requirements Document

## Problema Original
Plataforma de e-commerce whitelabel completa para venda de produtos, com painel administrativo configurável, integração de pagamentos PIX via OrionPay, e rastreamento de conversões via Meta Pixel.

## Público-Alvo
- Empreendedores que desejam vender produtos online
- Lojas que precisam de sistema de pagamento PIX
- Negócios que anunciam no Meta Ads

## Funcionalidades Principais

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
- [x] Script install.sh para VPS manual
- [x] docker-compose.yml para containerização
- [x] Dockerfiles para backend e frontend
- [x] Configuração Nginx para produção
- [x] Guia de instalação completo (INSTALACAO.md)

---

## Arquitetura Técnica

### Backend (FastAPI)
- `/app/backend/server.py` - Aplicação principal
- `/app/backend/routers/` - Endpoints da API
- `/app/backend/models.py` - Schemas Pydantic

### Frontend (React + Vite)
- `/app/frontend/src/pages/` - Páginas da aplicação
- `/app/frontend/src/components/` - Componentes reutilizáveis
- `/app/frontend/src/api/api.js` - Cliente Axios

### Banco de Dados (MongoDB)
- **settings** - Configurações do site (singleton)
- **orders** - Pedidos dos clientes
- **users** - Usuários admin

---

## Integrações
- **OrionPay** - Pagamentos PIX
- **Meta Pixel** - Rastreamento de conversões

---

## Backlog (P2)
- [ ] Refatorar Admin.jsx em componentes menores
- [ ] Sistema de backup automático MongoDB
- [ ] Dashboard com gráficos de vendas
- [ ] Notificações por email/WhatsApp
- [ ] Múltiplos produtos/variações

---

## Última Atualização
- **Data:** Dezembro 2025
- **Status:** MVP Completo, scripts de deploy prontos para teste
