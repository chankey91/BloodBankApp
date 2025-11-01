# ⚡ Azure Deployment - Quick Start Guide

## 🎯 TL;DR - Deploy in 30 Minutes

Follow these steps to get your app live on Azure with CI/CD.

---

## ✅ Pre-Deployment Checklist

```bash
# 1. Verify your code is ready
npm install
npm run dev:all  # Test locally

# 2. Generate secrets
node -e "console.log('JWT_SECRET:', require('crypto').randomBytes(32).toString('hex'))"
# Copy the output for later
```

---

## 🚀 Quick Deployment Steps

### Step 1: Create Azure Resources (10 min)

**In Azure Portal (portal.azure.com):**

1. **Resource Group**: `bloodbank-app-rg`
2. **Cosmos DB**: `bloodbank-db` (MongoDB API, Serverless)
3. **App Service (Backend)**: `bloodbank-backend` (Node 18 LTS, Linux, F1/B1)
4. **App Service (Frontend)**: `bloodbank-frontend` (Node 18 LTS, Linux, F1/B1)

**Get Connection String:**
- Go to Cosmos DB → Connection String → Copy PRIMARY CONNECTION STRING

---

### Step 2: Configure Environment Variables (5 min)

**Backend App Service → Configuration:**
```
NODE_ENV = production
PORT = 8080
MONGODB_URI = <Cosmos_DB_Connection_String>
JWT_SECRET = <Generated_Secret>
JWT_EXPIRE = 7d
CLIENT_URL = https://bloodbank-frontend.azurewebsites.net
ENCRYPTION_KEY = <Your_32_Char_Hex_From_.env>
```

**Frontend App Service → Configuration:**
```
REACT_APP_API_URL = https://bloodbank-backend.azurewebsites.net
NODE_ENV = production
```

Click **Save** after adding variables!

---

### Step 3: Set Up CI/CD (10 min)

1. **Create Azure DevOps Account**: dev.azure.com
2. **Create Project**: `BloodBankApp`
3. **Create Service Connection**:
   - Project Settings → Service Connections
   - New → Azure Resource Manager
   - Name: `Azure-BloodBank-Connection`

4. **Push Code**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add azure https://dev.azure.com/<your-org>/BloodBankApp/_git/BloodBankApp
git push -u azure master
```

5. **Create Pipelines**:
   - Pipelines → Create Pipeline → Azure Repos
   - Use `azure-pipelines-backend.yml`
   - Repeat for `azure-pipelines-frontend.yml`

---

### Step 4: Deploy! (5 min)

```bash
# Trigger deployment
git add .
git commit -m "Deploy to Azure"
git push azure master
```

Watch pipelines run in Azure DevOps!

---

## 🎉 Your App is Live!

- **Frontend**: `https://bloodbank-frontend.azurewebsites.net`
- **Backend**: `https://bloodbank-backend.azurewebsites.net`

---

## 🔍 Quick Troubleshooting

### Backend not working?
```bash
# Check logs in Azure Portal
App Service → Log Stream

# Or via CLI
az webapp log tail --name bloodbank-backend --resource-group bloodbank-app-rg
```

### Database connection issues?
- Cosmos DB → Firewall → Enable "Accept connections from public Azure datacenters"
- Verify MONGODB_URI in backend configuration
- Restart App Service

### Frontend showing blank page?
- Check browser console for API errors
- Verify REACT_APP_API_URL is correct
- Check CORS settings in backend

### Pipeline failing?
- Verify service connection name in YAML files
- Check Node.js version (should be 18.x)
- Review pipeline logs for specific errors

---

## 💡 Pro Tips

1. **Monitor Costs**: Check Cost Management daily
2. **Enable HTTPS**: Automatic with App Service
3. **Use Deployment Slots**: For zero-downtime deployments (requires Standard tier)
4. **Set Up Alerts**: Application Insights → Alerts
5. **Backup Database**: Cosmos DB → Backup & Restore

---

## 📞 Need Help?

1. Check `AZURE_DEPLOYMENT_GUIDE.md` for detailed steps
2. Azure Support: portal.azure.com → Help + Support
3. Azure Documentation: docs.microsoft.com/azure

---

## 🎯 Next Steps After Deployment

- [ ] Configure custom domain
- [ ] Set up SSL certificate (if custom domain)
- [ ] Enable Application Insights
- [ ] Set up automated backups
- [ ] Configure scaling rules
- [ ] Set up staging environment
- [ ] Configure API integration credentials
- [ ] Test all features in production

---

**Happy Deploying! 🚀**

