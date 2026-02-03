#!/bin/bash

#===============================================================================
# NeuroVita - Script de Instalação para VPS
# Compatível com: Ubuntu 20.04/22.04, Debian 11/12
#===============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
APP_NAME="neurovita"
APP_DIR="/var/www/$APP_NAME"
BACKEND_PORT=8001
FRONTEND_PORT=3000

# Funções de utilidade
print_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}  $1"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Verificar se está rodando como root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Este script precisa ser executado como root"
        echo "Execute: sudo bash install.sh"
        exit 1
    fi
}

# Corrigir problema do apt_pkg (comum em Ubuntu 22.04/24.04)
fix_apt_pkg() {
    print_header "Verificando apt_pkg"
    
    # Testar se apt_pkg funciona
    if python3 -c "import apt_pkg" 2>/dev/null; then
        print_success "apt_pkg está funcionando corretamente"
        return 0
    fi
    
    print_warning "apt_pkg com problema, corrigindo..."
    
    cd /usr/lib/python3/dist-packages
    
    # Detectar arquitetura
    ARCH=$(dpkg --print-architecture)
    if [ "$ARCH" = "amd64" ]; then
        ARCH_NAME="x86_64-linux-gnu"
    else
        ARCH_NAME="aarch64-linux-gnu"
    fi
    
    # Detectar versão do Python
    PY_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}{sys.version_info.minor}')")
    
    # Nome do arquivo esperado
    APT_PKG_FILE="apt_pkg.cpython-${PY_VERSION}-${ARCH_NAME}.so"
    
    # Verificar se o arquivo existe
    if [ -f "$APT_PKG_FILE" ]; then
        # Remover symlink antigo/incorreto
        rm -f apt_pkg.so
        
        # Criar symlink correto
        ln -s "$APT_PKG_FILE" apt_pkg.so
        
        print_success "Symlink criado: apt_pkg.so -> $APT_PKG_FILE"
    else
        # Tentar encontrar qualquer arquivo apt_pkg
        APT_PKG_FOUND=$(ls apt_pkg.cpython-*-${ARCH_NAME}.so 2>/dev/null | head -1)
        
        if [ -n "$APT_PKG_FOUND" ]; then
            rm -f apt_pkg.so
            ln -s "$APT_PKG_FOUND" apt_pkg.so
            print_success "Symlink criado: apt_pkg.so -> $APT_PKG_FOUND"
        else
            print_error "Arquivo apt_pkg não encontrado, tentando reinstalar..."
            apt download python3-apt 2>/dev/null || true
            dpkg --force-all -i python3-apt*.deb 2>/dev/null || true
            rm -f python3-apt*.deb 2>/dev/null || true
        fi
    fi
    
    # Testar novamente
    if python3 -c "import apt_pkg" 2>/dev/null; then
        print_success "apt_pkg corrigido com sucesso!"
    else
        print_warning "Não foi possível corrigir apt_pkg, desabilitando script problemático..."
        chmod -x /usr/lib/cnf-update-db 2>/dev/null || true
    fi
    
    cd - > /dev/null
}

# Coletar informações do usuário
collect_info() {
    print_header "Configuração Inicial"
    
    read -p "Digite o domínio do site (ex: neurovita.com.br): " DOMAIN
    read -p "Digite o email para SSL (Let's Encrypt): " SSL_EMAIL
    read -p "Digite a chave API do OrionPay (ou deixe vazio): " ORIONPAY_KEY
    
    # Gerar senha aleatória para MongoDB
    MONGO_PASSWORD=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 24)
    JWT_SECRET=$(openssl rand -base64 64 | tr -dc 'a-zA-Z0-9' | head -c 64)
    
    echo ""
    print_success "Domínio: $DOMAIN"
    print_success "Email SSL: $SSL_EMAIL"
}

# Atualizar sistema
update_system() {
    print_header "Atualizando Sistema"
    
    # Corrigir possíveis problemas de lock
    rm -f /var/lib/dpkg/lock-frontend /var/lib/apt/lists/lock /var/cache/apt/archives/lock 2>/dev/null || true
    dpkg --configure -a 2>/dev/null || true
    
    # Configurar para não perguntar durante atualizações
    export DEBIAN_FRONTEND=noninteractive
    
    apt update && apt upgrade -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"
    apt install -y curl wget git build-essential software-properties-common
    
    print_success "Sistema atualizado"
}

# Instalar Node.js
install_nodejs() {
    print_header "Instalando Node.js 20 LTS"
    
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    
    # Instalar Yarn
    npm install -g yarn
    
    print_success "Node.js $(node -v) instalado"
    print_success "Yarn $(yarn -v) instalado"
}

# Instalar Python
install_python() {
    print_header "Instalando Python 3.11"
    
    # Adicionar repositório deadsnakes para Python 3.11
    add-apt-repository -y ppa:deadsnakes/ppa
    apt update
    
    apt install -y python3.11 python3.11-venv python3.11-dev python3-pip
    
    # Criar link simbólico
    update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1 || true
    
    print_success "Python $(python3 --version) instalado"
}

# Instalar MongoDB
install_mongodb() {
    print_header "Instalando MongoDB 7.0"
    
    # Importar chave GPG
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
        gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    
    # Adicionar repositório
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
        tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    
    apt update
    apt install -y mongodb-org
    
    # Iniciar e habilitar MongoDB
    systemctl start mongod
    systemctl enable mongod
    
    print_success "MongoDB instalado e rodando"
}

# Instalar Nginx
install_nginx() {
    print_header "Instalando Nginx"
    
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    
    print_success "Nginx instalado"
}

# Instalar Certbot para SSL
install_certbot() {
    print_header "Instalando Certbot (Let's Encrypt)"
    
    apt install -y certbot python3-certbot-nginx
    
    print_success "Certbot instalado"
}

# Criar estrutura de diretórios
create_directories() {
    print_header "Criando Estrutura de Diretórios"
    
    mkdir -p $APP_DIR
    mkdir -p $APP_DIR/backend
    mkdir -p $APP_DIR/frontend
    mkdir -p $APP_DIR/logs
    mkdir -p $APP_DIR/uploads
    
    print_success "Diretórios criados em $APP_DIR"
}

# Copiar arquivos do projeto
copy_project_files() {
    print_header "Copiando Arquivos do Projeto"
    
    # Assumindo que o script está na raiz do projeto
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # Copiar backend
    cp -r $SCRIPT_DIR/backend/* $APP_DIR/backend/
    
    # Copiar frontend (apenas arquivos de build)
    if [ -d "$SCRIPT_DIR/frontend/build" ]; then
        cp -r $SCRIPT_DIR/frontend/build/* $APP_DIR/frontend/
    else
        # Se não tiver build, copiar tudo e fazer build depois
        cp -r $SCRIPT_DIR/frontend/* $APP_DIR/frontend/
    fi
    
    print_success "Arquivos copiados"
}

# Configurar ambiente do Backend
setup_backend() {
    print_header "Configurando Backend"
    
    cd $APP_DIR/backend
    
    # Criar ambiente virtual
    python3 -m venv venv
    source venv/bin/activate
    
    # Instalar dependências
    pip install --upgrade pip setuptools wheel
    pip install -r requirements.txt
    
    # Criar arquivo .env
    cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=${APP_NAME}_db
CORS_ORIGINS=https://${DOMAIN}
ORIONPAY_API_KEY=${ORIONPAY_KEY}
JWT_SECRET_KEY=${JWT_SECRET}
EOF
    
    deactivate
    
    print_success "Backend configurado"
}

# Configurar ambiente do Frontend
setup_frontend() {
    print_header "Configurando Frontend"
    
    cd $APP_DIR/frontend
    
    # Criar arquivo .env
    cat > .env << EOF
REACT_APP_BACKEND_URL=https://${DOMAIN}
EOF
    
    # Se não tiver build, fazer build
    if [ ! -f "index.html" ]; then
        yarn install
        yarn build
        
        # Mover arquivos de build para a raiz
        mv build/* .
        rm -rf build
    fi
    
    print_success "Frontend configurado"
}

# Criar serviço systemd para o Backend
create_backend_service() {
    print_header "Criando Serviço do Backend"
    
    cat > /etc/systemd/system/${APP_NAME}-backend.service << EOF
[Unit]
Description=NeuroVita Backend API
After=network.target mongod.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=${APP_DIR}/backend
Environment="PATH=${APP_DIR}/backend/venv/bin"
ExecStart=${APP_DIR}/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port ${BACKEND_PORT}
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable ${APP_NAME}-backend
    systemctl start ${APP_NAME}-backend
    
    print_success "Serviço do backend criado e iniciado"
}

# Configurar Nginx
configure_nginx() {
    print_header "Configurando Nginx"
    
    cat > /etc/nginx/sites-available/${APP_NAME} << EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    # Redirecionar para HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};
    
    # SSL será configurado pelo Certbot
    
    # Logs
    access_log ${APP_DIR}/logs/nginx_access.log;
    error_log ${APP_DIR}/logs/nginx_error.log;
    
    # Frontend (arquivos estáticos)
    root ${APP_DIR}/frontend;
    index index.html;
    
    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # Cache de arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API Backend
    location /api/ {
        proxy_pass http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://${DOMAIN}" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    }
    
    # Uploads
    location /uploads/ {
        alias ${APP_DIR}/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }
    
    # SPA fallback
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

    # Ativar site
    ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
    
    # Remover site padrão
    rm -f /etc/nginx/sites-enabled/default
    
    # Testar configuração
    nginx -t
    
    # Recarregar Nginx
    systemctl reload nginx
    
    print_success "Nginx configurado"
}

# Configurar SSL com Let's Encrypt
setup_ssl() {
    print_header "Configurando SSL (Let's Encrypt)"
    
    certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos -m ${SSL_EMAIL}
    
    # Configurar renovação automática
    systemctl enable certbot.timer
    systemctl start certbot.timer
    
    print_success "SSL configurado"
}

# Configurar firewall
setup_firewall() {
    print_header "Configurando Firewall"
    
    apt install -y ufw
    
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 'Nginx Full'
    
    echo "y" | ufw enable
    
    print_success "Firewall configurado"
}

# Ajustar permissões
set_permissions() {
    print_header "Ajustando Permissões"
    
    chown -R www-data:www-data $APP_DIR
    chmod -R 755 $APP_DIR
    chmod 600 $APP_DIR/backend/.env
    
    print_success "Permissões ajustadas"
}

# Criar usuário admin padrão
create_admin_user() {
    print_header "Criando Usuário Admin"
    
    # Gerar senha aleatória
    ADMIN_PASSWORD=$(openssl rand -base64 12 | tr -dc 'a-zA-Z0-9' | head -c 12)
    
    # Esperar o backend iniciar
    sleep 5
    
    # Criar usuário via API
    curl -s -X POST "http://localhost:${BACKEND_PORT}/api/auth/register" \
        -H "Content-Type: application/json" \
        -d "{\"name\":\"Admin\",\"email\":\"admin@${DOMAIN}\",\"password\":\"${ADMIN_PASSWORD}\"}" > /dev/null 2>&1 || true
    
    echo ""
    print_success "Usuário admin criado:"
    echo -e "   Email: ${GREEN}admin@${DOMAIN}${NC}"
    echo -e "   Senha: ${GREEN}${ADMIN_PASSWORD}${NC}"
    echo ""
    print_warning "IMPORTANTE: Anote essas credenciais e altere a senha após o primeiro login!"
}

# Exibir resumo final
show_summary() {
    print_header "Instalação Concluída!"
    
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${NC}  NeuroVita instalado com sucesso!                          ${GREEN}║${NC}"
    echo -e "${GREEN}╠════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║${NC}                                                            ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}  🌐 Site: https://${DOMAIN}                    ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}  🔧 Admin: https://${DOMAIN}/admin             ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}                                                            ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}  📁 Diretório: ${APP_DIR}                      ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}  📋 Logs: ${APP_DIR}/logs                      ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}                                                            ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}  Comandos úteis:                                           ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}  - Status: systemctl status ${APP_NAME}-backend ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}  - Logs: journalctl -u ${APP_NAME}-backend -f   ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}  - Reiniciar: systemctl restart ${APP_NAME}-backend ${GREEN}║${NC}"
    echo -e "${GREEN}║${NC}                                                            ${GREEN}║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
}

# Função principal
main() {
    clear
    echo -e "${GREEN}"
    echo "  _   _                     __     __ _  _          "
    echo " | \ | |  ___  _   _  _ __ \ \   / /(_)| |_   __ _ "
    echo " |  \| | / _ \| | | || '__| \ \ / / | || __| / _\` |"
    echo " | |\  ||  __/| |_| || |     \ V /  | || |_ | (_| |"
    echo " |_| \_| \___| \__,_||_|      \_/   |_| \__| \__,_|"
    echo -e "${NC}"
    echo "  Instalador Automático para VPS"
    echo "  ================================"
    echo ""
    
    check_root
    collect_info
    
    update_system
    install_nodejs
    install_python
    install_mongodb
    install_nginx
    install_certbot
    
    create_directories
    copy_project_files
    setup_backend
    setup_frontend
    
    create_backend_service
    configure_nginx
    setup_ssl
    setup_firewall
    set_permissions
    
    create_admin_user
    show_summary
}

# Executar
main "$@"
