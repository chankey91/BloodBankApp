# 🚀 Quick Start Deployment Guide

This is a condensed guide to get your Blood Bank App deployed quickly.

## ⚡ Prerequisites

- Ubuntu Server: `103.230.227.5`
- SSH Port: `2022`
- Jenkins running on port `8080`
- GitHub repository: `https://github.com/chankey91/BloodBankApp.git`

---

## 📦 Step 1: Server Setup (5 minutes)

### Option A: Automated Setup (Recommended)

```bash
# Copy deployment script to server
scp -P 2022 deploy.sh ubuntu@103.230.227.5:~/

# SSH to server
ssh -p 2022 ubuntu@103.230.227.5

# Run deployment script
chmod +x deploy.sh
sudo ./deploy.sh
```

### Option B: Manual Setup

```bash
# SSH to server
ssh -p 2022 ubuntu@103.230.227.5

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt-get install -y nginx

# Install PM2
sudo npm install -g pm2

# Create directories
sudo mkdir -p /var/www/bloodbank/{backend,frontend,logs}
sudo chown -R ubuntu:ubuntu /var/www/bloodbank

# Configure Nginx
sudo nano /etc/nginx/sites-available/bloodbank
# Copy content from nginx.conf file

sudo ln -s /etc/nginx/sites-available/bloodbank /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# Configure firewall
sudo ufw allow 2022/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp
sudo ufw enable
```

---

## 🔑 Step 2: Configure Environment (2 minutes)

```bash
# SSH to server
ssh -p 2022 ubuntu@103.230.227.5

# Create environment file
cd /var/www/bloodbank/backend
nano .env
```

Paste this content (update with your actual values):

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://localhost:27017/bloodbank
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=30d
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
CLIENT_URL=http://103.230.227.5
```

---

## 🔧 Step 3: Jenkins Setup (5 minutes)

### 3.1 Install Plugins

1. Open Jenkins: `http://103.230.227.5:8080`
2. Go to **Manage Jenkins** → **Manage Plugins** → **Available**
3. Install:
   - Git Plugin
   - SSH Agent Plugin
   - Pipeline Plugin
   - NodeJS Plugin

### 3.2 Add SSH Credentials

```bash
# On Jenkins server, generate SSH key
ssh-keygen -t rsa -b 4096 -f ~/.ssh/jenkins_deploy_key

# Copy to deployment server
ssh-copy-id -p 2022 -i ~/.ssh/jenkins_deploy_key.pub ubuntu@103.230.227.5

# Display private key
cat ~/.ssh/jenkins_deploy_key
```

In Jenkins:
1. **Manage Jenkins** → **Manage Credentials** → **Add Credentials**
2. **Kind**: SSH Username with private key
3. **ID**: `ubuntu-server-ssh`
4. **Username**: `ubuntu`
5. **Private Key**: Paste the key from above
6. **Save**

### 3.3 Configure Node.js

1. **Manage Jenkins** → **Global Tool Configuration**
2. **NodeJS** → **Add NodeJS**
3. **Name**: `Node 18`
4. **Version**: NodeJS 18.x
5. **Save**

---

## 🚀 Step 4: Create Pipeline (3 minutes)

1. Jenkins Dashboard → **New Item**
2. **Name**: `BloodBank-CICD`
3. **Type**: Pipeline
4. **OK**

Configure:
- **GitHub project**: `https://github.com/chankey91/BloodBankApp/`
- **Build Triggers**: ✅ Poll SCM: `H/5 * * * *`
- **Pipeline**:
  - **Definition**: Pipeline script from SCM
  - **SCM**: Git
  - **Repository URL**: `https://github.com/chankey91/BloodBankApp.git`
  - **Branch**: `*/main`
  - **Script Path**: `Jenkinsfile`

**Save**

---

## 🎯 Step 5: Deploy (1 minute)

1. Click **Build Now**
2. Monitor **Console Output**
3. Wait for success message ✅

---

## ✅ Step 6: Verify Deployment

```bash
# Check backend
ssh -p 2022 ubuntu@103.230.227.5
pm2 status
pm2 logs bloodbank-backend

# Test API
curl http://localhost:5000/api/health

# Check Nginx
sudo systemctl status nginx
```

Open browser:
- **Frontend**: `http://103.230.227.5`
- **API**: `http://103.230.227.5/api/health`

---

## 🔄 Continuous Deployment

After initial setup, every push to GitHub `main` branch will:
1. Automatically trigger Jenkins build
2. Run tests
3. Build frontend
4. Deploy to server
5. Restart application

---

## 🐛 Quick Troubleshooting

### Backend not starting?
```bash
ssh -p 2022 ubuntu@103.230.227.5
pm2 logs bloodbank-backend
cd /var/www/bloodbank/backend
cat .env  # Check environment variables
```

### Nginx 502 error?
```bash
pm2 restart bloodbank-backend
sudo systemctl restart nginx
```

### MongoDB connection error?
```bash
sudo systemctl status mongod
sudo systemctl start mongod
```

### Jenkins build fails?
- Check SSH credentials in Jenkins
- Verify server is accessible: `ssh -p 2022 ubuntu@103.230.227.5`
- Check Console Output for specific errors

---

## 📚 Need More Details?

See the comprehensive guide: `CICD_SETUP_GUIDE.md`

---

## 🎉 Done!

Your CI/CD pipeline is ready! Push code to GitHub and watch it automatically deploy.

**Access your application:**
- Frontend: `http://103.230.227.5`
- Backend API: `http://103.230.227.5/api`
- Jenkins: `http://103.230.227.5:8080`

