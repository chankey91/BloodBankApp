# 🚀 Azure Deployment Guide - Blood Bank Application

## Complete Step-by-Step Guide with CI/CD

This guide will help you deploy your Blood Bank Application to Azure with automatic CI/CD pipeline.

---

## 📋 Prerequisites

- ✅ Azure account (free tier works fine)
- ✅ Git installed on your machine
- ✅ Azure CLI installed (optional but recommended)
- ✅ Your application code ready

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Azure Cloud                          │
│                                                          │
│  ┌────────────────┐         ┌──────────────────┐       │
│  │  Azure Repos   │────────▶│  Azure Pipelines │       │
│  │  (Git)         │         │  (CI/CD)         │       │
│  └────────────────┘         └──────────────────┘       │
│         │                            │                  │
│         │                            ▼                  │
│         │                   ┌─────────────────┐        │
│         │                   │ Build & Deploy  │        │
│         │                   └─────────────────┘        │
│         │                            │                  │
│         └────────────────────────────┼──────────┐      │
│                                      ▼          ▼      │
│              ┌──────────────────┐         ┌─────────┐  │
│              │  App Service     │         │ App     │  │
│              │  (Backend)       │◀───────▶│ Service │  │
│              │  Node.js         │         │(Frontend│  │
│              └──────────────────┘         │ React)  │  │
│                      │                    └─────────┘  │
│                      │                                  │
│                      ▼                                  │
│         ┌────────────────────────┐                     │
│         │ Azure Cosmos DB        │                     │
│         │ (MongoDB API)          │                     │
│         └────────────────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Step 1: Set Up Azure Resources

### 1.1 Create Resource Group

1. **Login to Azure Portal**: https://portal.azure.com
2. Click **"Resource groups"** in the left menu
3. Click **"+ Create"**
4. Fill in details:
   - **Subscription**: Select your subscription
   - **Resource group**: `bloodbank-app-rg`
   - **Region**: `East US` (or closest to you)
5. Click **"Review + Create"** → **"Create"**

---

### 1.2 Create MongoDB Database

**Option A: Azure Cosmos DB (Recommended for Production)**

1. Search for **"Azure Cosmos DB"** in Azure Portal
2. Click **"+ Create"** → **"Azure Cosmos DB for MongoDB"**
3. Fill in details:
   - **Resource Group**: `bloodbank-app-rg`
   - **Account Name**: `bloodbank-db`
   - **API**: MongoDB
   - **Location**: Same as resource group
   - **Capacity mode**: Serverless (for cost optimization)
4. Click **"Review + Create"** → **"Create"**
5. After creation, go to the resource
6. Click **"Connection String"** in left menu
7. Copy the **PRIMARY CONNECTION STRING** (save it for later)

**Option B: MongoDB Atlas (Alternative)**

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Use this instead of Cosmos DB

---

### 1.3 Create App Service for Backend

1. Search for **"App Services"** in Azure Portal
2. Click **"+ Create"**
3. Fill in details:
   - **Resource Group**: `bloodbank-app-rg`
   - **Name**: `bloodbank-backend` (must be globally unique)
   - **Publish**: Code
   - **Runtime stack**: Node 18 LTS
   - **Operating System**: Linux
   - **Region**: Same as resource group
   - **Pricing Plan**: F1 (Free) or B1 (Basic - $13/month)
4. Click **"Review + Create"** → **"Create"**

---

### 1.4 Create App Service for Frontend

1. Click **"+ Create"** → **"Web App"**
2. Fill in details:
   - **Resource Group**: `bloodbank-app-rg`
   - **Name**: `bloodbank-frontend` (must be globally unique)
   - **Publish**: Code
   - **Runtime stack**: Node 18 LTS
   - **Operating System**: Linux
   - **Region**: Same as resource group
   - **Pricing Plan**: F1 (Free) or B1 (Basic)
3. Click **"Review + Create"** → **"Create"**

---

## 🔧 Step 2: Configure Environment Variables

### 2.1 Backend Configuration

1. Go to **"App Services"** → Select **"bloodbank-backend"**
2. Click **"Configuration"** in left menu
3. Click **"+ New application setting"** and add each:

```
NODE_ENV = production
PORT = 8080
MONGODB_URI = <Your_Cosmos_DB_Connection_String>
JWT_SECRET = <Generate_Random_32_Character_String>
JWT_EXPIRE = 7d
CLIENT_URL = https://bloodbank-frontend.azurewebsites.net
ENCRYPTION_KEY = <Your_32_Character_Hex_Key_From_.env>
```

4. Click **"Save"** at the top

**Generate Secrets:**
```bash
# For JWT_SECRET (run in terminal)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Use the ENCRYPTION_KEY from your .env file
```

---

### 2.2 Frontend Configuration

1. Go to **"App Services"** → Select **"bloodbank-frontend"**
2. Click **"Configuration"** in left menu
3. Add:

```
REACT_APP_API_URL = https://bloodbank-backend.azurewebsites.net
NODE_ENV = production
```

4. Click **"Save"**

---

## 📦 Step 3: Set Up Azure DevOps for CI/CD

### 3.1 Create Azure DevOps Organization

1. Go to https://dev.azure.com
2. Click **"Start free"**
3. Create organization: `bloodbank-org`
4. Create project: `BloodBankApp`

---

### 3.2 Initialize Git Repository

**Option A: Azure Repos**

1. In your project, click **"Repos"** in left menu
2. You'll see instructions to push your existing code
3. In your local project folder:

```bash
# Initialize git (if not already)
git init

# Add Azure remote
git remote add azure https://dev.azure.com/bloodbank-org/BloodBankApp/_git/BloodBankApp

# Create .gitignore if not exists
echo "node_modules/
.env
build/
dist/
.DS_Store" > .gitignore

# Commit all code
git add .
git commit -m "Initial commit"

# Push to Azure
git push -u azure master
```

**Option B: GitHub (if you prefer)**

1. Create GitHub repository
2. Push code to GitHub
3. Connect Azure Pipelines to GitHub (covered in Step 3.3)

---

### 3.3 Create Backend Pipeline

1. In Azure DevOps, click **"Pipelines"** → **"Create Pipeline"**
2. Select **"Azure Repos Git"** (or GitHub if you used that)
3. Select your repository
4. Choose **"Node.js"** template
5. Replace the generated YAML with this:

**Create file: `azure-pipelines-backend.yml`**

```yaml
# Backend CI/CD Pipeline
trigger:
  branches:
    include:
      - master
      - main
  paths:
    include:
      - backend/*
      - package.json

pool:
  vmImage: 'ubuntu-latest'

variables:
  azureSubscription: 'Your-Service-Connection'
  appName: 'bloodbank-backend'

stages:
- stage: Build
  displayName: 'Build Backend'
  jobs:
  - job: BuildJob
    displayName: 'Build'
    steps:
    - task: NodeTool@0
      displayName: 'Install Node.js'
      inputs:
        versionSpec: '18.x'

    - script: |
        npm install
        npm run build --if-present
      displayName: 'npm install and build'
      workingDirectory: '$(System.DefaultWorkingDirectory)'

    - task: ArchiveFiles@2
      displayName: 'Archive files'
      inputs:
        rootFolderOrFile: '$(System.DefaultWorkingDirectory)'
        includeRootFolder: false
        archiveType: 'zip'
        archiveFile: '$(Build.ArtifactStagingDirectory)/$(Build.BuildId).zip'
        replaceExistingArchive: true

    - task: PublishBuildArtifacts@1
      displayName: 'Publish Artifact'
      inputs:
        PathtoPublish: '$(Build.ArtifactStagingDirectory)'
        ArtifactName: 'backend-drop'

- stage: Deploy
  displayName: 'Deploy Backend'
  dependsOn: Build
  condition: succeeded()
  jobs:
  - deployment: DeployWeb
    displayName: 'Deploy to Azure App Service'
    environment: 'production'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureWebApp@1
            displayName: 'Deploy Azure Web App'
            inputs:
              azureSubscription: '$(azureSubscription)'
              appType: 'webAppLinux'
              appName: '$(appName)'
              package: '$(Pipeline.Workspace)/backend-drop/$(Build.BuildId).zip'
              runtimeStack: 'NODE|18-lts'
              startUpCommand: 'node backend/server.js'
```

---

### 3.4 Create Frontend Pipeline

**Create file: `azure-pipelines-frontend.yml`**

```yaml
# Frontend CI/CD Pipeline
trigger:
  branches:
    include:
      - master
      - main
  paths:
    include:
      - frontend/*

pool:
  vmImage: 'ubuntu-latest'

variables:
  azureSubscription: 'Your-Service-Connection'
  appName: 'bloodbank-frontend'

stages:
- stage: Build
  displayName: 'Build Frontend'
  jobs:
  - job: BuildJob
    displayName: 'Build'
    steps:
    - task: NodeTool@0
      displayName: 'Install Node.js'
      inputs:
        versionSpec: '18.x'

    - script: |
        cd frontend
        npm install
        npm run build
      displayName: 'npm install and build'
      env:
        REACT_APP_API_URL: 'https://bloodbank-backend.azurewebsites.net'

    - task: ArchiveFiles@2
      displayName: 'Archive build files'
      inputs:
        rootFolderOrFile: '$(System.DefaultWorkingDirectory)/frontend/build'
        includeRootFolder: false
        archiveType: 'zip'
        archiveFile: '$(Build.ArtifactStagingDirectory)/$(Build.BuildId).zip'
        replaceExistingArchive: true

    - task: PublishBuildArtifacts@1
      displayName: 'Publish Artifact'
      inputs:
        PathtoPublish: '$(Build.ArtifactStagingDirectory)'
        ArtifactName: 'frontend-drop'

- stage: Deploy
  displayName: 'Deploy Frontend'
  dependsOn: Build
  condition: succeeded()
  jobs:
  - deployment: DeployWeb
    displayName: 'Deploy to Azure App Service'
    environment: 'production'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureWebApp@1
            displayName: 'Deploy Azure Web App'
            inputs:
              azureSubscription: '$(azureSubscription)'
              appType: 'webAppLinux'
              appName: '$(appName)'
              package: '$(Pipeline.Workspace)/frontend-drop/$(Build.BuildId).zip'
              runtimeStack: 'NODE|18-lts'
              startUpCommand: 'npx serve -s . -l 8080'
```

---

### 3.5 Create Service Connection

1. In Azure DevOps, go to **Project Settings** (bottom left)
2. Click **"Service connections"**
3. Click **"New service connection"**
4. Select **"Azure Resource Manager"** → **"Next"**
5. Select **"Service principal (automatic)"**
6. Fill in:
   - **Subscription**: Your Azure subscription
   - **Resource group**: `bloodbank-app-rg`
   - **Service connection name**: `Azure-BloodBank-Connection`
7. Click **"Save"**
8. Copy the service connection name and update it in your YAML files

---

### 3.6 Update Package.json

Add startup scripts to your `package.json`:

```json
{
  "name": "bloodbank-app",
  "version": "1.0.0",
  "scripts": {
    "start": "node backend/server.js",
    "dev": "nodemon backend/server.js",
    "client": "cd frontend && npm start",
    "dev:all": "concurrently \"npm run dev\" \"npm run client\"",
    "install:all": "npm install && cd frontend && npm install",
    "build": "cd frontend && npm install && npm run build",
    "heroku-postbuild": "cd frontend && npm install && npm run build"
  }
}
```

---

## 🔒 Step 4: Configure CORS and Networking

### 4.1 Backend CORS Configuration

Ensure your `backend/server.js` has proper CORS:

```javascript
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:3000',
  'https://bloodbank-frontend.azurewebsites.net',
  process.env.CLIENT_URL
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

---

### 4.2 Configure Custom Domain (Optional)

1. Buy domain from Azure or external provider
2. In App Service → **"Custom domains"**
3. Add custom domain
4. Configure DNS records

---

## 🚀 Step 5: Deploy and Test

### 5.1 Push Code to Trigger CI/CD

```bash
# Make sure you're on master/main branch
git checkout master

# Add pipeline files
git add azure-pipelines-backend.yml azure-pipelines-frontend.yml
git commit -m "Add CI/CD pipelines"
git push azure master

# Or if using GitHub
git push origin master
```

---

### 5.2 Monitor Pipeline

1. Go to **"Pipelines"** in Azure DevOps
2. You should see pipelines running
3. Click on the running pipeline to see logs
4. Wait for both builds to complete (5-10 minutes)

---

### 5.3 Verify Deployment

1. **Backend**: Open `https://bloodbank-backend.azurewebsites.net/api/health`
2. **Frontend**: Open `https://bloodbank-frontend.azurewebsites.net`
3. Test login and key features

---

## 🐛 Step 6: Troubleshooting

### Common Issues

**Issue 1: Backend not starting**
```bash
# Check logs
az webapp log tail --name bloodbank-backend --resource-group bloodbank-app-rg

# Or in Azure Portal → App Service → Log stream
```

**Issue 2: Frontend showing 404**
```bash
# Add web.config for Azure (create in frontend/public/)
```

Create `frontend/public/web.config`:
```xml
<?xml version="1.0"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

**Issue 3: Database connection fails**
- Verify MongoDB connection string
- Check if IP is whitelisted in Cosmos DB firewall
- In Cosmos DB → **"Firewall and virtual networks"** → Enable **"Accept connections from within public Azure datacenters"**

**Issue 4: Environment variables not loading**
- Restart App Service after adding env vars
- Check spelling of environment variables
- In App Service → **"Configuration"** → Verify all variables

---

## 📊 Step 7: Monitoring and Scaling

### 7.1 Enable Application Insights

1. Go to your App Service
2. Click **"Application Insights"** in left menu
3. Click **"Turn on Application Insights"**
4. Create new resource or use existing
5. Click **"Apply"**

### 7.2 Set Up Alerts

1. In Application Insights → **"Alerts"**
2. Create alert rules for:
   - High response time
   - Server errors
   - High CPU usage

### 7.3 Auto-Scaling (Optional)

1. In App Service → **"Scale out (App Service plan)"**
2. Configure auto-scaling rules based on:
   - CPU percentage
   - Memory percentage
   - HTTP queue length

---

## 💰 Cost Optimization

### Free Tier Limits
- **App Service (F1)**: 1GB RAM, 60 min/day compute
- **Cosmos DB (Serverless)**: Pay per request
- **Bandwidth**: 5GB outbound/month free

### Recommendations
- Use B1 tier ($13/month) for better performance
- Enable auto-scaling only if needed
- Use Cosmos DB serverless for variable load
- Monitor costs in **Cost Management + Billing**

---

## 🔄 CI/CD Workflow

### How It Works

```
Developer pushes code to Git
         ↓
Azure Pipelines triggered
         ↓
Install dependencies (npm install)
         ↓
Run tests (if configured)
         ↓
Build application (npm run build)
         ↓
Create deployment package (.zip)
         ↓
Deploy to App Service
         ↓
App Service restarts with new code
         ↓
Application live! 🎉
```

### Deployment Time
- **First deployment**: 10-15 minutes
- **Subsequent deployments**: 3-5 minutes

---

## 📝 Post-Deployment Checklist

- [ ] Backend accessible at `https://bloodbank-backend.azurewebsites.net`
- [ ] Frontend accessible at `https://bloodbank-frontend.azurewebsites.net`
- [ ] Database connected (check logs)
- [ ] User registration works
- [ ] User login works
- [ ] Admin panel accessible
- [ ] File uploads work (if applicable)
- [ ] Notifications work
- [ ] API integrations configured
- [ ] SSL/HTTPS enabled (automatic)
- [ ] Environment variables set correctly
- [ ] CI/CD pipeline runs successfully
- [ ] Application Insights enabled
- [ ] Backup strategy in place

---

## 🎯 Alternative: Single App Service Deployment

If you want to deploy frontend and backend together:

1. **Serve React build from Express**:

Update `backend/server.js`:
```javascript
// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}
```

2. **Use single App Service**
3. **Single pipeline** that builds both and deploys to one service

---

## 📚 Additional Resources

- **Azure Documentation**: https://docs.microsoft.com/azure
- **Azure DevOps Docs**: https://docs.microsoft.com/azure/devops
- **Node.js on Azure**: https://docs.microsoft.com/azure/app-service/quickstart-nodejs
- **Cosmos DB**: https://docs.microsoft.com/azure/cosmos-db/

---

## 🆘 Support

If you encounter issues:

1. Check **Log Stream** in App Service
2. Review **Pipeline logs** in Azure DevOps
3. Check **Application Insights** for errors
4. Use Azure CLI: `az webapp log tail`
5. Restart App Service if needed

---

## 🎉 Success!

Your Blood Bank Application is now:
- ✅ Deployed on Azure
- ✅ Accessible worldwide via HTTPS
- ✅ Auto-deploying on every push
- ✅ Monitored with Application Insights
- ✅ Scalable and production-ready

**Your URLs:**
- Frontend: `https://bloodbank-frontend.azurewebsites.net`
- Backend: `https://bloodbank-backend.azurewebsites.net`

🎊 **Congratulations on deploying your first Azure application with CI/CD!** 🎊

