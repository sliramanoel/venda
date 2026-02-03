# NeuroVita - Product Requirements Document

## Problema Original
Plataforma de e-commerce whitelabel completa para venda de produtos, com painel administrativo configurável, integração de pagamentos PIX via OrionPay, e rastreamento de conversões via Meta Pixel.

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
- [x] Script install.sh para VPS (v2.0 - testado e corrigido)
- [x] docker-compose.yml para containerização
- [x] Dockerfiles para backend e frontend
- [x] Configuração Nginx para produção
- [x] Guia de instalação completo (INSTALACAO.md)

---

## Problemas Resolvidos na Instalação (v2.0)

### 1. apt_pkg não encontrado (Ubuntu 22.04/24.04)
- **Problema:** Symlink apontando para arquitetura errada (aarch64 vs x86_64)
- **Solução:** Função `fix_apt_pkg()` que detecta e corrige automaticamente

### 2. emergentintegrations no requirements.txt
- **Problema:** Pacote interno não disponível publicamente
- **Solução:** Removido e criado requirements.txt simplificado

### 3. Conflito de dependências pip
- **Problema:** Versões fixas conflitando entre si
- **Solução:** Requirements.txt com versões mínimas flexíveis

### 4. Nginx SSL antes do Certbot
- **Problema:** Config com SSL antes dos certificados existirem
- **Solução:** Config inicial sem SSL, Certbot adiciona depois

### 5. Certbot com erro de Python
- **Problema:** Incompatibilidade de versão Python
- **Solução:** Instalação via Snap (mais isolado)

### 6. bcrypt não funciona com www-data
- **Problema:** Permissões de biblioteca nativa
- **Solução:** Backend roda como root

### 7. Frontend com URL errada
- **Problema:** Build compilado com domínio antigo
- **Solução:** Recompilação após definir .env correto

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

## Instalação Testada em Produção

**Domínio:** neurovitanatural.com
**VPS:** VDSina (Ubuntu 22.04)
**Data:** Fevereiro 2026

---

## Backlog (P2)
- [ ] Refatorar Admin.jsx em componentes menores
- [ ] Sistema de backup automático MongoDB
- [ ] Dashboard com gráficos de vendas
- [ ] Notificações por email/WhatsApp
- [ ] Múltiplos produtos/variações

---

## Última Atualização
- **Data:** 03 de Fevereiro de 2026
- **Status:** MVP Completo, instalação em VPS testada e funcionando
