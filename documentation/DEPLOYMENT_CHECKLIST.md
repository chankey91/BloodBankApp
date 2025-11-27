# 📋 Azure Deployment Checklist

Use this checklist to ensure a smooth deployment process.

---

## 🔧 Pre-Deployment

### Local Environment
- [ ] Application runs successfully locally (`npm run dev:all`)
- [ ] All features tested and working
- [ ] Database connected and seeded with test data
- [ ] Environment variables documented
- [ ] `.gitignore` excludes `node_modules/`, `.env`, `build/`
- [ ] All dependencies listed in `package.json`
- [ ] No hardcoded secrets in code

### Code Preparation
- [ ] Latest code committed to Git
- [ ] Branch is `master` or `main`
- [ ] Pipeline YAML files added (`azure-pipelines-*.yml`)
- [ ] `web.config` added to `frontend/public/`
- [ ] `.deployment` file added to root
- [ ] Package.json has correct start scripts

### Secrets Generated
- [ ] JWT_SECRET generated (32-char hex)
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] ENCRYPTION_KEY copied from `.env` (32-char hex)
- [ ] Secrets stored securely (NOT in code!)

---

## ☁️ Azure Resources Creation

### Resource Group
- [ ] Resource group created: `bloodbank-app-rg`
- [ ] Region selected: `East US` (or preferred)

### Database (Cosmos DB)
- [ ] Cosmos DB account created: `bloodbank-db`
- [ ] API type: MongoDB
- [ ] Capacity mode: Serverless (or Provisioned)
- [ ] Connection string copied
- [ ] Firewall configured (allow Azure services)

### Backend App Service
- [ ] App Service created: `bloodbank-backend`
- [ ] Runtime: Node 18 LTS
- [ ] OS: Linux
- [ ] Pricing tier: F1 (Free) or B1 (Basic)
- [ ] Region: Same as resource group

### Frontend App Service
- [ ] App Service created: `bloodbank-frontend`
- [ ] Runtime: Node 18 LTS
- [ ] OS: Linux
- [ ] Pricing tier: F1 (Free) or B1 (Basic)
- [ ] Region: Same as resource group

---

## ⚙️ Configuration

### Backend Environment Variables
Go to: `App Services` → `bloodbank-backend` → `Configuration`

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `8080`
- [ ] `MONGODB_URI` = `<Cosmos_DB_Connection_String>`
- [ ] `JWT_SECRET` = `<Your_Generated_Secret>`
- [ ] `JWT_EXPIRE` = `7d`
- [ ] `CLIENT_URL` = `https://bloodbank-frontend.azurewebsites.net`
- [ ] `ENCRYPTION_KEY` = `<Your_32_Char_Hex>`
- [ ] Clicked "Save" and waited for restart

### Frontend Environment Variables
Go to: `App Services` → `bloodbank-frontend` → `Configuration`

- [ ] `REACT_APP_API_URL` = `https://bloodbank-backend.azurewebsites.net`
- [ ] `NODE_ENV` = `production`
- [ ] Clicked "Save" and waited for restart

---

## 🔄 CI/CD Setup

### Azure DevOps
- [ ] Azure DevOps account created
- [ ] Organization created
- [ ] Project created: `BloodBankApp`

### Service Connection
- [ ] Service connection created
- [ ] Type: Azure Resource Manager
- [ ] Name: `Azure-BloodBank-Connection`
- [ ] Subscription connected
- [ ] Resource group: `bloodbank-app-rg`
- [ ] Name copied for YAML files

### Repository
- [ ] Git initialized in project
- [ ] Remote added:
  ```bash
  git remote add azure https://dev.azure.com/<org>/BloodBankApp/_git/BloodBankApp
  ```
- [ ] Code pushed to Azure Repos (or GitHub)

### Pipelines
- [ ] Backend pipeline created
- [ ] `azure-pipelines-backend.yml` configured
- [ ] Service connection name updated in YAML
- [ ] App name updated in YAML
- [ ] Frontend pipeline created
- [ ] `azure-pipelines-frontend.yml` configured
- [ ] Service connection name updated in YAML
- [ ] App name updated in YAML
- [ ] API URL updated in YAML

---

## 🚀 Deployment

### Initial Deployment
- [ ] Code pushed to trigger pipeline:
  ```bash
  git add .
  git commit -m "Initial Azure deployment"
  git push azure master
  ```
- [ ] Backend pipeline triggered
- [ ] Backend pipeline completed successfully
- [ ] Frontend pipeline triggered
- [ ] Frontend pipeline completed successfully

### Verification
- [ ] Backend URL accessible: `https://bloodbank-backend.azurewebsites.net`
- [ ] Frontend URL accessible: `https://bloodbank-frontend.azurewebsites.net`
- [ ] No 404 or 500 errors
- [ ] Application loads without errors

---

## ✅ Post-Deployment Testing

### Basic Functionality
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] User registration works
- [ ] User login works
- [ ] JWT token stored correctly
- [ ] Protected routes work

### Core Features
- [ ] Blood bank registration
- [ ] Donor registration
- [ ] Blood request creation
- [ ] Blood search functionality
- [ ] Donation camp creation
- [ ] Inventory management
- [ ] Notifications display

### Admin Panel
- [ ] Admin login works
- [ ] User management accessible
- [ ] Blood bank management works
- [ ] Analytics display correctly
- [ ] Notifications can be sent
- [ ] API integrations page loads

### Database Operations
- [ ] Data persists after refresh
- [ ] CRUD operations work
- [ ] Database queries successful
- [ ] No connection errors in logs

---

## 📊 Monitoring Setup

### Application Insights
- [ ] Application Insights enabled for backend
- [ ] Application Insights enabled for frontend
- [ ] Telemetry data flowing

### Alerts
- [ ] Alert created for high response time
- [ ] Alert created for server errors (500)
- [ ] Alert created for high CPU usage
- [ ] Email notifications configured

### Logging
- [ ] Log Stream working
- [ ] Console logs visible
- [ ] Error logs captured
- [ ] Application logs enabled

---

## 🔒 Security

### SSL/HTTPS
- [ ] HTTPS enabled (automatic with App Service)
- [ ] HTTP redirects to HTTPS
- [ ] SSL certificate valid

### CORS
- [ ] CORS configured in backend
- [ ] Frontend URL whitelisted
- [ ] CORS errors resolved

### Secrets
- [ ] No secrets in source code
- [ ] All secrets in App Service Configuration
- [ ] `.env` file in `.gitignore`
- [ ] Connection strings secured

### Database
- [ ] Cosmos DB firewall configured
- [ ] Only Azure services allowed
- [ ] Admin access restricted

---

## 💰 Cost Management

### Monitoring
- [ ] Cost Management + Billing checked
- [ ] Budget alerts set up
- [ ] Daily cost emails enabled

### Optimization
- [ ] Free tier used where possible
- [ ] Auto-scaling disabled (if not needed)
- [ ] Unused resources deleted

---

## 📚 Documentation

### Code Documentation
- [ ] README updated with deployment info
- [ ] Architecture documented
- [ ] API endpoints documented

### Deployment Documentation
- [ ] `AZURE_DEPLOYMENT_GUIDE.md` reviewed
- [ ] `AZURE_QUICK_START.md` reviewed
- [ ] Team members trained on deployment process

---

## 🔄 Ongoing Maintenance

### Regular Tasks
- [ ] Monitor application logs weekly
- [ ] Review Application Insights weekly
- [ ] Check costs monthly
- [ ] Update dependencies monthly
- [ ] Backup database regularly

### Updates
- [ ] Process for hotfixes established
- [ ] Process for feature updates established
- [ ] Rollback plan documented

---

## 🐛 Troubleshooting Done

### Common Issues Resolved
- [ ] Backend 502/503 errors fixed
- [ ] Frontend 404 errors fixed
- [ ] Database connection issues resolved
- [ ] CORS errors fixed
- [ ] Environment variable issues resolved
- [ ] Pipeline failures debugged

---

## 🎯 Future Enhancements

### Next Steps
- [ ] Custom domain configured
- [ ] CDN enabled for frontend
- [ ] Staging environment created
- [ ] Deployment slots configured
- [ ] Auto-scaling rules set
- [ ] Load testing performed
- [ ] Backup/restore tested

---

## 📝 Sign-Off

**Deployed By:** _____________________  
**Date:** _____________________  
**Environment:** Production  
**Version:** _____________________  

**Notes:**
```
[Add any deployment notes, issues encountered, or special instructions]
```

---

## ✅ Deployment Complete!

Once all checkboxes are marked, your application is successfully deployed on Azure with CI/CD! 🎉

**URLs:**
- Frontend: `https://bloodbank-frontend.azurewebsites.net`
- Backend: `https://bloodbank-backend.azurewebsites.net`

**Monitoring:**
- Azure Portal: https://portal.azure.com
- Azure DevOps: https://dev.azure.com

---

*Keep this checklist for future deployments and updates!*

