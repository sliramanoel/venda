# NeuroVita - Guia de Instalação em VPS

## 📋 Requisitos Mínimos

- **VPS**: 1 vCPU, 2GB RAM, 20GB SSD
- **Sistema**: Ubuntu 20.04/22.04 ou Debian 11/12
- **Domínio**: Apontando para o IP da VPS
- **Portas**: 80 e 443 liberadas no firewall

---

## 🚀 Instalação Rápida (Recomendada)

### 1. Baixar o Projeto

```bash
# Conectar na VPS via SSH
ssh root@seu-ip

# Clonar ou baixar o projeto
cd /tmp
git clone https://github.com/seu-usuario/neurovita.git
cd neurovita
```

### 2. Executar o Instalador

```bash
# Dar permissão de execução
chmod +x install.sh

# Executar
sudo bash install.sh
```

O instalador irá:
- ✅ Instalar Node.js, Python, MongoDB, Nginx
- ✅ Configurar o backend e frontend
- ✅ Criar serviços systemd
- ✅ Configurar SSL com Let's Encrypt
- ✅ Configurar firewall
- ✅ Criar usuário admin

### 3. Acessar o Site

Após a instalação:
- **Site**: https://seu-dominio.com
- **Admin**: https://seu-dominio.com/admin

---

## 🐳 Instalação com Docker (Alternativa)

### 1. Instalar Docker

```bash
# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Instalar Docker Compose
apt install docker-compose-plugin
```

### 2. Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env
cat > .env << EOF
REACT_APP_BACKEND_URL=https://seu-dominio.com
CORS_ORIGINS=https://seu-dominio.com
ORIONPAY_API_KEY=sua-api-key
JWT_SECRET_KEY=$(openssl rand -base64 64)
EOF
```

### 3. Iniciar os Containers

```bash
# Build e start
docker compose up -d --build

# Ver logs
docker compose logs -f
```

### 4. Configurar Nginx Externo (para SSL)

Se quiser usar SSL, configure um Nginx externo ou use Traefik.

---

## 📁 Estrutura de Arquivos

```
/var/www/neurovita/
├── backend/
│   ├── server.py          # API FastAPI
│   ├── routers/           # Endpoints
│   ├── models.py          # Modelos Pydantic
│   ├── venv/              # Ambiente virtual Python
│   ├── uploads/           # Imagens enviadas
│   └── .env               # Variáveis de ambiente
├── frontend/
│   ├── index.html         # Build React
│   ├── static/            # Assets
│   └── .env               # URL do backend
└── logs/
    ├── nginx_access.log
    └── nginx_error.log
```

---

## ⚙️ Comandos Úteis

### Gerenciar Backend

```bash
# Status
sudo systemctl status neurovita-backend

# Reiniciar
sudo systemctl restart neurovita-backend

# Ver logs em tempo real
sudo journalctl -u neurovita-backend -f

# Parar
sudo systemctl stop neurovita-backend
```

### Gerenciar Nginx

```bash
# Testar configuração
sudo nginx -t

# Recarregar configuração
sudo systemctl reload nginx

# Ver logs
tail -f /var/www/neurovita/logs/nginx_access.log
```

### Gerenciar MongoDB

```bash
# Status
sudo systemctl status mongod

# Acessar shell
mongosh

# Backup
mongodump --db neurovita_db --out /backup/
```

### Gerenciar SSL

```bash
# Renovar certificado
sudo certbot renew

# Verificar certificado
sudo certbot certificates
```

---

## 🔧 Configuração Manual

### Backend (.env)

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=neurovita_db
CORS_ORIGINS=https://seu-dominio.com
ORIONPAY_API_KEY=opay_xxxxx
JWT_SECRET_KEY=sua-chave-secreta
```

### Frontend (.env)

```env
REACT_APP_BACKEND_URL=https://seu-dominio.com
```

---

## 🔒 Segurança

### Alterar Senha do Admin

1. Acesse https://seu-dominio.com/admin
2. Faça login com as credenciais geradas
3. (Implementar) Altere a senha nas configurações

### Backup Automático

Crie um cron job para backup diário:

```bash
# Editar crontab
crontab -e

# Adicionar linha (backup às 3h da manhã)
0 3 * * * mongodump --db neurovita_db --out /backup/$(date +\%Y\%m\%d)/
```

### Monitoramento

Instale ferramentas de monitoramento:

```bash
# Instalar htop
apt install htop

# Verificar uso de disco
df -h

# Verificar uso de memória
free -h
```

---

## 🐛 Troubleshooting

### Backend não inicia

```bash
# Verificar logs
sudo journalctl -u neurovita-backend -n 50

# Verificar se MongoDB está rodando
sudo systemctl status mongod

# Testar manualmente
cd /var/www/neurovita/backend
source venv/bin/activate
python -c "from server import app; print('OK')"
```

### Erro 502 Bad Gateway

```bash
# Verificar se backend está rodando
curl http://localhost:8001/health

# Verificar configuração do Nginx
sudo nginx -t
```

### SSL não funciona

```bash
# Verificar certificado
sudo certbot certificates

# Renovar certificado
sudo certbot renew --dry-run
```

---

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs
2. Consulte este guia
3. Entre em contato pelo WhatsApp configurado no site

---

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados.
