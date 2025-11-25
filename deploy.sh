#!/bin/bash

#######################################
# Blood Bank App - Deployment Script
# For Ubuntu Server Deployment
#######################################

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/bloodbank"
BACKEND_DIR="${APP_DIR}/backend"
FRONTEND_DIR="${APP_DIR}/frontend"
PM2_APP_NAME="bloodbank-backend"
NGINX_CONFIG="/etc/nginx/sites-available/bloodbank"
DOMAIN="your-domain.com"  # Change this to your domain

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Blood Bank App Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Function to print colored messages
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root or with sudo
check_privileges() {
    if [ "$EUID" -ne 0 ]; then 
        print_error "Please run with sudo privileges"
        exit 1
    fi
}

# Install Node.js if not installed
install_nodejs() {
    if ! command -v node &> /dev/null; then
        print_message "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    else
        print_message "Node.js already installed: $(node -v)"
    fi
}

# Install MongoDB if not installed
install_mongodb() {
    if ! command -v mongod &> /dev/null; then
        print_message "Installing MongoDB..."
        wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
        echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
        apt-get update
        apt-get install -y mongodb-org
        systemctl start mongod
        systemctl enable mongod
    else
        print_message "MongoDB already installed"
    fi
}

# Install Nginx if not installed
install_nginx() {
    if ! command -v nginx &> /dev/null; then
        print_message "Installing Nginx..."
        apt-get install -y nginx
        systemctl start nginx
        systemctl enable nginx
    else
        print_message "Nginx already installed"
    fi
}

# Install PM2 if not installed
install_pm2() {
    if ! command -v pm2 &> /dev/null; then
        print_message "Installing PM2..."
        npm install -g pm2
    else
        print_message "PM2 already installed"
    fi
}

# Create application directories
create_directories() {
    print_message "Creating application directories..."
    mkdir -p ${APP_DIR}
    mkdir -p ${BACKEND_DIR}
    mkdir -p ${FRONTEND_DIR}
    mkdir -p ${APP_DIR}/logs
}

# Configure Nginx
configure_nginx() {
    print_message "Configuring Nginx..."
    
    cat > ${NGINX_CONFIG} << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # Change this
    
    # Frontend - React App
    location / {
        root /var/www/bloodbank/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Socket.io
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
EOF

    # Create symbolic link
    ln -sf ${NGINX_CONFIG} /etc/nginx/sites-enabled/bloodbank
    
    # Remove default site if exists
    rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    nginx -t
    
    # Reload Nginx
    systemctl reload nginx
    
    print_message "Nginx configured successfully"
}

# Configure firewall
configure_firewall() {
    print_message "Configuring firewall..."
    
    # Allow SSH on custom port
    ufw allow 2022/tcp
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Allow Jenkins
    ufw allow 8080/tcp
    
    # Enable firewall
    ufw --force enable
    
    print_message "Firewall configured"
}

# Setup PM2 startup
setup_pm2_startup() {
    print_message "Setting up PM2 startup..."
    
    # Get the deployment user (not root)
    DEPLOY_USER=${SUDO_USER:-ubuntu}
    
    pm2 startup systemd -u ${DEPLOY_USER} --hp /home/${DEPLOY_USER}
    
    print_message "PM2 startup configured"
}

# Create environment file template
create_env_template() {
    print_message "Creating environment file template..."
    
    cat > ${BACKEND_DIR}/.env.example << 'EOF'
# Environment
NODE_ENV=production

# Server
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/bloodbank

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# SMS Configuration (Optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# WhatsApp Configuration (Optional)
WHATSAPP_API_KEY=your_whatsapp_api_key

# Frontend URL
CLIENT_URL=http://your-domain.com

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_key

# Firebase Cloud Messaging (Optional)
FCM_SERVER_KEY=your_fcm_server_key
EOF

    print_warning "Please configure ${BACKEND_DIR}/.env with your actual values"
}

# Main installation
main() {
    print_message "Starting deployment setup..."
    
    # Update system
    print_message "Updating system packages..."
    apt-get update
    apt-get upgrade -y
    
    # Install dependencies
    install_nodejs
    install_mongodb
    install_nginx
    install_pm2
    
    # Setup application
    create_directories
    configure_nginx
    configure_firewall
    setup_pm2_startup
    create_env_template
    
    print_message "${GREEN}========================================${NC}"
    print_message "${GREEN}Deployment setup completed!${NC}"
    print_message "${GREEN}========================================${NC}"
    echo ""
    print_warning "Next steps:"
    echo "1. Configure ${BACKEND_DIR}/.env with your actual values"
    echo "2. Update Nginx configuration with your domain in ${NGINX_CONFIG}"
    echo "3. Deploy your application using Jenkins pipeline"
    echo "4. (Optional) Setup SSL certificate using Let's Encrypt"
    echo ""
    print_message "To setup SSL certificate, run:"
    echo "sudo apt-get install certbot python3-certbot-nginx"
    echo "sudo certbot --nginx -d your-domain.com -d www.your-domain.com"
}

# Run main function
main

