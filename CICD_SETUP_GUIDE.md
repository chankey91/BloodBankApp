# 🚀 CI/CD Pipeline Setup Guide for Blood Bank App

Complete guide to set up Continuous Integration and Continuous Deployment from GitHub to your Ubuntu server using Jenkins.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Server Setup](#server-setup)
- [Jenkins Configuration](#jenkins-configuration)
- [GitHub Configuration](#github-configuration)
- [Pipeline Deployment](#pipeline-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Server Information
- **IP Address**: 103.230.227.5
- **SSH Port**: 2022
- **Jenkins Port**: 8080
- **OS**: Ubuntu Server
- **User**: ubuntu (or your deployment user)

### Required Software
- Node.js 18+
- MongoDB
- Nginx
- PM2 (Process Manager)
- Git
- Jenkins (already installed)

---

## 🖥️ Server Setup

### Step 1: Connect to Your Server

```bash
ssh -p 2022 ubuntu@103.230.227.5
```

### Step 2: Run the Deployment Setup Script

First, copy the `deploy.sh` script to your server:

```bash
# On your local machine
scp -P 2022 deploy.sh ubuntu@103.230.227.5:~/

# Connect to server
ssh -p 2022 ubuntu@103.230.227.5

# Make script executable and run
chmod +x deploy.sh
sudo ./deploy.sh
```

This script will:
- ✅ Install Node.js, MongoDB, Nginx, PM2
- ✅ Create application directories
- ✅ Configure Nginx as reverse proxy
- ✅ Setup firewall rules
- ✅ Configure PM2 for auto-restart

### Step 3: Manual Setup (Alternative)

If you prefer manual setup:

#### 3.1 Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v  # Verify installation
```

#### 3.2 Install MongoDB

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod
```

#### 3.3 Install Nginx

```bash
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 3.4 Install PM2

```bash
sudo npm install -g pm2
pm2 startup systemd
```

#### 3.5 Create Application Directories

```bash
sudo mkdir -p /var/www/bloodbank/{backend,frontend,logs}
sudo chown -R ubuntu:ubuntu /var/www/bloodbank
```

#### 3.6 Configure Nginx

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/bloodbank
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name 103.230.227.5;  # Or your domain name
    
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
    
    # Socket.io for real-time features
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
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/bloodbank /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

#### 3.7 Configure Firewall

```bash
sudo ufw allow 2022/tcp  # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8080/tcp  # Jenkins
sudo ufw enable
sudo ufw status
```

#### 3.8 Setup Environment Variables

```bash
cd /var/www/bloodbank/backend
nano .env
```

Copy content from `env.production.example` and update with your actual values.

---

## 🔨 Jenkins Configuration

### Step 1: Access Jenkins

Open your browser and go to:
```
http://103.230.227.5:8080
```

### Step 2: Install Required Plugins

1. Go to **Manage Jenkins** → **Manage Plugins**
2. Install these plugins:
   - **Git Plugin** (for GitHub integration)
   - **SSH Agent Plugin** (for SSH deployment)
   - **Pipeline Plugin** (for Jenkinsfile)
   - **NodeJS Plugin** (for Node.js builds)
   - **GitHub Integration Plugin**

### Step 3: Configure Node.js

1. Go to **Manage Jenkins** → **Global Tool Configuration**
2. Scroll to **NodeJS**
3. Click **Add NodeJS**
   - Name: `Node 18`
   - Version: `NodeJS 18.x`
   - Install automatically: ✅
4. Click **Save**

### Step 4: Add SSH Credentials

1. Go to **Manage Jenkins** → **Manage Credentials**
2. Click on **(global)** domain
3. Click **Add Credentials**
4. Configure:
   - **Kind**: SSH Username with private key
   - **ID**: `ubuntu-server-ssh`
   - **Username**: `ubuntu`
   - **Private Key**: Enter directly (paste your private key)
   - **Passphrase**: (if your key has one)
5. Click **OK**

#### Generate SSH Key (if needed)

On your Jenkins server:

```bash
# Generate SSH key
ssh-keygen -t rsa -b 4096 -f ~/.ssh/jenkins_deploy_key

# Copy public key to deployment server
ssh-copy-id -p 2022 -i ~/.ssh/jenkins_deploy_key.pub ubuntu@103.230.227.5

# Display private key (copy this to Jenkins credentials)
cat ~/.ssh/jenkins_deploy_key
```

### Step 5: Add GitHub Credentials (Optional for Private Repos)

1. Go to **Manage Jenkins** → **Manage Credentials**
2. Click **Add Credentials**
3. Configure:
   - **Kind**: Username with password
   - **Username**: Your GitHub username
   - **Password**: GitHub Personal Access Token
   - **ID**: `github-credentials`

To create GitHub Personal Access Token:
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` scope

---

## 🔗 GitHub Configuration

### Step 1: Add Jenkinsfile to Repository

The `Jenkinsfile` is already created in your repository root. Commit and push it:

```bash
git add Jenkinsfile deploy.sh env.production.example CICD_SETUP_GUIDE.md
git commit -m "Add CI/CD pipeline configuration"
git push origin main
```

### Step 2: Setup GitHub Webhook (Optional - for Auto-trigger)

1. Go to your GitHub repository: https://github.com/chankey91/BloodBankApp
2. Click **Settings** → **Webhooks** → **Add webhook**
3. Configure:
   - **Payload URL**: `http://103.230.227.5:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Which events**: Just the push event
   - **Active**: ✅
4. Click **Add webhook**

---

## 🚀 Pipeline Deployment

### Step 1: Create Jenkins Pipeline Job

1. From Jenkins dashboard, click **New Item**
2. Enter name: `BloodBank-CICD`
3. Select **Pipeline**
4. Click **OK**

### Step 2: Configure Pipeline

#### General Settings
- ✅ **GitHub project**: `https://github.com/chankey91/BloodBankApp/`

#### Build Triggers
- ✅ **GitHub hook trigger for GITScm polling** (if webhook is configured)
- ✅ **Poll SCM**: `H/5 * * * *` (check every 5 minutes as backup)

#### Pipeline Configuration
- **Definition**: Pipeline script from SCM
- **SCM**: Git
- **Repository URL**: `https://github.com/chankey91/BloodBankApp.git`
- **Credentials**: (select if private repo)
- **Branch Specifier**: `*/main`
- **Script Path**: `Jenkinsfile`

### Step 3: Save and Build

1. Click **Save**
2. Click **Build Now**
3. Monitor the build in **Console Output**

---

## 📊 Monitoring & Maintenance

### Check Application Status

```bash
# SSH to server
ssh -p 2022 ubuntu@103.230.227.5

# Check PM2 status
pm2 status

# Check application logs
pm2 logs bloodbank-backend

# Check Nginx status
sudo systemctl status nginx

# Check MongoDB status
sudo systemctl status mongod
```

### PM2 Commands

```bash
# View logs
pm2 logs bloodbank-backend

# Restart application
pm2 restart bloodbank-backend

# Stop application
pm2 stop bloodbank-backend

# Start application
pm2 start bloodbank-backend

# Monitor in real-time
pm2 monit

# Save PM2 configuration
pm2 save
```

### Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log
```

### MongoDB Commands

```bash
# Connect to MongoDB
mongosh

# Show databases
show dbs

# Use bloodbank database
use bloodbank

# Show collections
show collections

# Backup database
mongodump --db bloodbank --out /backup/mongodb/

# Restore database
mongorestore --db bloodbank /backup/mongodb/bloodbank/
```

---

## 🔒 Security Best Practices

### 1. Setup SSL Certificate (Recommended)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is setup automatically
# Test renewal
sudo certbot renew --dry-run
```

### 2. Secure MongoDB

```bash
# Enable MongoDB authentication
mongosh

use admin
db.createUser({
  user: "bloodbank_admin",
  pwd: "strong_password_here",
  roles: [ { role: "readWrite", db: "bloodbank" } ]
})

exit
```

Update `.env` with:
```
MONGO_URI=mongodb://bloodbank_admin:strong_password_here@localhost:27017/bloodbank
```

### 3. Secure Jenkins

1. Go to **Manage Jenkins** → **Configure Global Security**
2. Enable **Security Realm**: Jenkins' own user database
3. Enable **Authorization**: Matrix-based security
4. Create admin user with full permissions

### 4. Regular Updates

```bash
# Update system packages
sudo apt-get update
sudo apt-get upgrade -y

# Update Node.js packages
cd /var/www/bloodbank/backend
npm audit fix

# Update PM2
sudo npm update -g pm2
```

---

## 🐛 Troubleshooting

### Issue 1: Build Fails - SSH Connection Refused

**Solution:**
```bash
# Verify SSH credentials in Jenkins
# Test SSH connection manually
ssh -p 2022 ubuntu@103.230.227.5

# Check if SSH key is added to authorized_keys
cat ~/.ssh/authorized_keys
```

### Issue 2: Application Not Starting

**Solution:**
```bash
# Check PM2 logs
pm2 logs bloodbank-backend --lines 100

# Check if port 5000 is available
sudo netstat -tulpn | grep 5000

# Check environment variables
cd /var/www/bloodbank/backend
cat .env
```

### Issue 3: Nginx 502 Bad Gateway

**Solution:**
```bash
# Check if backend is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Verify backend is listening on port 5000
curl http://localhost:5000/api/health

# Restart services
pm2 restart bloodbank-backend
sudo systemctl restart nginx
```

### Issue 4: MongoDB Connection Error

**Solution:**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB if stopped
sudo systemctl start mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Verify connection string in .env
cat /var/www/bloodbank/backend/.env | grep MONGO_URI
```

### Issue 5: Frontend Not Loading

**Solution:**
```bash
# Check if build directory exists
ls -la /var/www/bloodbank/frontend/

# Check Nginx configuration
sudo nginx -t

# Check Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Rebuild frontend manually
cd /var/www/bloodbank/frontend
npm run build
```

### Issue 6: Jenkins Build Timeout

**Solution:**
1. Go to Jenkins job configuration
2. Increase timeout in Pipeline settings
3. Or add timeout in Jenkinsfile:
```groovy
options {
    timeout(time: 30, unit: 'MINUTES')
}
```

---

## 📝 Pipeline Workflow

The CI/CD pipeline follows these stages:

1. **Checkout** - Pull latest code from GitHub
2. **Install Dependencies** - Install npm packages for backend and frontend
3. **Build Frontend** - Create production build of React app
4. **Run Tests** - Execute test suites (if configured)
5. **Deploy to Server** - Copy files to production server via SSH
6. **Restart Application** - Restart backend with PM2
7. **Configure Nginx** - Ensure Nginx is properly configured
8. **Health Check** - Verify application is running correctly

---

## 🎯 Quick Commands Reference

### Deploy Manually (Without Jenkins)

```bash
# On your local machine
git pull origin main

# Build frontend
cd frontend
npm install
npm run build

# Deploy to server
scp -P 2022 -r backend/* ubuntu@103.230.227.5:/var/www/bloodbank/backend/
scp -P 2022 -r frontend/build/* ubuntu@103.230.227.5:/var/www/bloodbank/frontend/

# SSH to server and restart
ssh -p 2022 ubuntu@103.230.227.5
cd /var/www/bloodbank/backend
npm install --production
pm2 restart bloodbank-backend
```

### Rollback to Previous Version

```bash
# On server
ssh -p 2022 ubuntu@103.230.227.5

# If you have backups
cd /var/www/bloodbank
cp -r backend backend_backup_$(date +%Y%m%d)

# Or use PM2 to restart with previous code
pm2 restart bloodbank-backend
```

---

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review Jenkins console output for errors
3. Check application logs: `pm2 logs bloodbank-backend`
4. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

---

## ✅ Deployment Checklist

Before going live:

- [ ] Server setup completed
- [ ] All required software installed
- [ ] Environment variables configured
- [ ] MongoDB secured with authentication
- [ ] SSL certificate installed (if using domain)
- [ ] Firewall configured
- [ ] Jenkins pipeline tested
- [ ] GitHub webhook configured (optional)
- [ ] Backup strategy in place
- [ ] Monitoring setup
- [ ] Health check endpoint working
- [ ] Email notifications configured
- [ ] Domain DNS configured (if applicable)

---

**🎉 Congratulations! Your CI/CD pipeline is now set up!**

Every push to the `main` branch will automatically trigger a deployment to your production server.

