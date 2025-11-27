# 🏗️ Azure Architecture - Blood Bank Application

## 📐 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           INTERNET / USERS                              │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 │ HTTPS
                                 │
┌────────────────────────────────┼────────────────────────────────────────┐
│                          AZURE CLOUD                                    │
│                                │                                         │
│                                ▼                                         │
│                     ┌──────────────────────┐                            │
│                     │   Azure Front Door   │ (Optional)                 │
│                     │   (CDN + WAF)        │                            │
│                     └──────────┬───────────┘                            │
│                                │                                         │
│                    ┌───────────┴───────────┐                            │
│                    │                       │                            │
│                    ▼                       ▼                            │
│         ┌─────────────────────┐ ┌─────────────────────┐                │
│         │  App Service         │ │  App Service        │                │
│         │  bloodbank-frontend  │ │  bloodbank-backend  │                │
│         │  (React Build)       │ │  (Node.js/Express)  │                │
│         │  Runtime: Node 18    │ │  Runtime: Node 18   │                │
│         │  Port: 8080          │ │  Port: 8080         │                │
│         └──────────┬────────────┘ └──────────┬──────────┘                │
│                    │                         │                          │
│                    │   API Calls (HTTPS)     │                          │
│                    └────────────►────────────┘                          │
│                                               │                          │
│                                               │                          │
│                                               ▼                          │
│                                    ┌──────────────────────┐             │
│                                    │  Azure Cosmos DB     │             │
│                                    │  (MongoDB API)       │             │
│                                    │  bloodbank-db        │             │
│                                    │  Mode: Serverless    │             │
│                                    └──────────────────────┘             │
│                                                                          │
│   ┌──────────────────────────────────────────────────────────────────┐ │
│   │                    MONITORING & LOGGING                           │ │
│   │                                                                    │ │
│   │  ┌────────────────────┐    ┌────────────────────┐                │ │
│   │  │ Application        │    │  Log Analytics     │                │ │
│   │  │ Insights           │    │  Workspace         │                │ │
│   │  │ (Telemetry)        │    │  (Logs & Metrics)  │                │ │
│   │  └────────────────────┘    └────────────────────┘                │ │
│   └──────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                          CI/CD PIPELINE                                  │
│                                                                           │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐               │
│  │ Developer  │────▶│ Azure Repos  │────▶│   Azure     │               │
│  │ (Git Push) │     │ or GitHub    │     │  Pipelines  │               │
│  └────────────┘     └──────────────┘     └──────┬──────┘               │
│                                                  │                       │
│                                   ┌──────────────┴──────────────┐       │
│                                   │                             │       │
│                                   ▼                             ▼       │
│                          ┌─────────────────┐          ┌─────────────┐   │
│                          │ Backend Build   │          │ Frontend    │   │
│                          │ & Deploy        │          │ Build &     │   │
│                          │                 │          │ Deploy      │   │
│                          └────────┬────────┘          └──────┬──────┘   │
│                                   │                          │          │
│                                   ▼                          ▼          │
│                          App Service (Backend)    App Service (Frontend)│
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Component Details

### 1. Frontend Layer

**Technology:** React.js (Static Build)

**Azure Resource:** App Service (Linux, Node 18)

**Configuration:**
```yaml
Name: bloodbank-frontend
Runtime: Node.js 18 LTS
OS: Linux
Deployment: ZIP deployment from pipeline
Startup: npx serve -s . -l 8080
```

**Environment Variables:**
- `REACT_APP_API_URL` - Backend API URL
- `NODE_ENV` - production

**Features:**
- Automatic HTTPS/SSL
- Custom domain support
- Always-on availability
- Auto-scaling capable

---

### 2. Backend Layer

**Technology:** Node.js + Express.js

**Azure Resource:** App Service (Linux, Node 18)

**Configuration:**
```yaml
Name: bloodbank-backend
Runtime: Node.js 18 LTS
OS: Linux
Deployment: ZIP deployment from pipeline
Startup: node backend/server.js
```

**Environment Variables:**
- `NODE_ENV` - production
- `PORT` - 8080
- `MONGODB_URI` - Cosmos DB connection
- `JWT_SECRET` - Authentication secret
- `CLIENT_URL` - Frontend URL
- `ENCRYPTION_KEY` - API credentials encryption

**Features:**
- RESTful API endpoints
- JWT authentication
- MongoDB integration
- Socket.io for real-time features
- CORS configured
- Rate limiting

---

### 3. Database Layer

**Technology:** MongoDB (via Azure Cosmos DB)

**Azure Resource:** Cosmos DB with MongoDB API

**Configuration:**
```yaml
Name: bloodbank-db
API: MongoDB
Capacity Mode: Serverless (pay per use)
Consistency: Session (default)
```

**Collections:**
- users
- donors
- bloodbanks
- hospitals
- requests
- inventory
- donationcamps
- notifications
- apiconfigurations

**Features:**
- Global distribution (optional)
- Automatic indexing
- Point-in-time restore
- Automatic backups
- 99.99% SLA

---

### 4. CI/CD Pipeline

**Technology:** Azure Pipelines (YAML)

**Stages:**

#### Backend Pipeline
```yaml
Trigger: Changes to backend/*, package.json
  ↓
Build Stage:
  - Install Node.js 18
  - npm install
  - Create ZIP archive
  - Publish artifact
  ↓
Deploy Stage:
  - Download artifact
  - Deploy to App Service
  - Restart service
```

#### Frontend Pipeline
```yaml
Trigger: Changes to frontend/*
  ↓
Build Stage:
  - Install Node.js 18
  - npm install
  - npm run build (React)
  - Create ZIP archive
  - Publish artifact
  ↓
Deploy Stage:
  - Download artifact
  - Deploy to App Service
  - Restart service
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: Network Security                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │ • HTTPS/TLS 1.2+ enforced                          │    │
│  │ • Azure DDoS Protection (Basic)                    │    │
│  │ • App Service built-in firewall                    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Layer 2: Authentication & Authorization                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ • JWT tokens for API authentication                │    │
│  │ • Role-based access control (RBAC)                 │    │
│  │ • Admin-only routes protection                     │    │
│  │ • Token expiration (7 days)                        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Layer 3: Data Security                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │ • Cosmos DB encryption at rest                     │    │
│  │ • TLS encryption in transit                        │    │
│  │ • API credentials encrypted (AES-256)              │    │
│  │ • Secrets stored in App Configuration             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Layer 4: Application Security                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ • Input validation                                  │    │
│  │ • SQL injection prevention (Mongoose)              │    │
│  │ • XSS protection                                    │    │
│  │ • CORS configured                                   │    │
│  │ • Rate limiting                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagrams

### User Registration Flow

```
User (Browser)
    │
    │ POST /api/auth/register
    ▼
Frontend (React)
    │
    │ Axios Request
    ▼
Backend (Express)
    │
    ├─► Validate input
    ├─► Hash password
    ├─► Create user document
    │
    ▼
Cosmos DB (MongoDB)
    │
    │ Save user
    ▼
Backend
    │
    ├─► Generate JWT token
    ├─► Send response
    │
    ▼
Frontend
    │
    ├─► Store token
    ├─► Redirect to dashboard
    │
    ▼
User sees dashboard
```

### Blood Request Flow

```
Hospital (Browser)
    │
    │ Create urgent blood request
    ▼
Frontend
    │
    │ POST /api/requests
    ▼
Backend
    │
    ├─► Validate request
    ├─► Save to database
    ├─► Find eligible donors
    │
    ▼
Notification Service
    │
    ├─► Send in-app notifications
    ├─► Send SMS (Twilio/MSG91)
    ├─► Send Emails (SMTP/SendGrid)
    │
    ▼
Eligible Donors
    │
    └─► Receive multi-channel alerts
```

---

## 🔄 Deployment Flow

```
Developer
    │
    │ git commit & push
    ▼
Git Repository (Azure Repos/GitHub)
    │
    │ Webhook trigger
    ▼
Azure Pipelines
    │
    ├─► Checkout code
    ├─► Install dependencies
    ├─► Run tests (optional)
    ├─► Build application
    ├─► Create deployment package
    │
    ▼
Build Artifacts
    │
    │ Deploy to App Service
    ▼
App Service
    │
    ├─► Stop current instance
    ├─► Deploy new package
    ├─► Restart with new code
    │
    ▼
Application Live (3-5 minutes)
```

---

## 💰 Cost Breakdown

### Monthly Cost Estimate

**Free Tier (Development)**
```
├─ App Service (Frontend) F1        : $0.00
├─ App Service (Backend) F1         : $0.00
├─ Cosmos DB Serverless             : $0.00 - $25.00
├─ Application Insights (5GB)       : $0.00
├─ Bandwidth (5GB)                  : $0.00
└─ Total                            : $0.00 - $25.00/month
```

**Basic Tier (Production)**
```
├─ App Service (Frontend) B1        : $13.14
├─ App Service (Backend) B1         : $13.14
├─ Cosmos DB Serverless             : $25.00 - $50.00
├─ Application Insights (10GB)      : $2.30
├─ Bandwidth (50GB)                 : $4.35
└─ Total                            : $57.93 - $82.93/month
```

**Standard Tier (High Traffic)**
```
├─ App Service (Frontend) S1        : $70.08
├─ App Service (Backend) S1         : $70.08
├─ Cosmos DB Provisioned (1000 RU/s): $58.40
├─ Application Insights (50GB)      : $11.50
├─ Azure Front Door                 : $35.00
├─ Bandwidth (200GB)                : $17.40
└─ Total                            : $262.46/month
```

---

## 🎯 Scalability Options

### Vertical Scaling (Scale Up)

```
F1 (Free)
    ↓ $0 → $13/month
B1 (Basic) - 1.75GB RAM, 1 Core
    ↓ $13 → $70/month
S1 (Standard) - 1.75GB RAM, 1 Core + Features
    ↓ $70 → $140/month
P1V2 (Premium) - 3.5GB RAM, 1 Core + Advanced
```

### Horizontal Scaling (Scale Out)

```
1 Instance (Default)
    ↓ Enable auto-scale
2-10 Instances (Based on load)
    ↓ Advanced rules
Custom scaling based on:
    • CPU %
    • Memory %
    • HTTP queue length
    • Custom metrics
```

---

## 📈 Performance Optimization

### Frontend Optimization
```
✓ React build minified
✓ Code splitting
✓ Lazy loading components
✓ CDN for static assets (optional)
✓ Compression enabled
✓ Browser caching
```

### Backend Optimization
```
✓ Database connection pooling
✓ Response caching
✓ Gzip compression
✓ Rate limiting
✓ Query optimization
✓ Indexes on frequently queried fields
```

### Database Optimization
```
✓ Appropriate indexes
✓ Query optimization
✓ Serverless mode for variable load
✓ Connection string optimization
✓ Read/write operation balance
```

---

## 🔍 Monitoring Stack

```
Application
    │
    ├─► Application Insights
    │   ├─ Request telemetry
    │   ├─ Dependency tracking
    │   ├─ Exception tracking
    │   ├─ Custom events
    │   └─ Performance metrics
    │
    ├─► Azure Monitor
    │   ├─ Metrics
    │   ├─ Alerts
    │   ├─ Dashboards
    │   └─ Workbooks
    │
    └─► Log Analytics
        ├─ Application logs
        ├─ System logs
        ├─ Query capabilities
        └─ Log retention
```

---

## 🌐 Network Architecture

```
Internet
    │
    │ HTTPS (443)
    ▼
Azure Front Door (Optional)
    │
    ├─► WAF Rules
    ├─► DDoS Protection
    ├─► SSL/TLS Termination
    │
    ▼
Azure Load Balancer
    │
    ├─► Health Checks
    ├─► Load Distribution
    │
    ▼
App Service VNet Integration (Optional)
    │
    ├─► Frontend: 10.0.1.0/24
    ├─► Backend: 10.0.2.0/24
    │
    ▼
Private Endpoint to Cosmos DB (Optional)
    │
    └─► Secure database access
```

---

## 🎯 High Availability Setup

```
┌─────────────────────────────────────┐
│         Region: East US             │
├─────────────────────────────────────┤
│ Frontend App Service (Primary)      │
│ Backend App Service (Primary)       │
│ Cosmos DB (Primary)                 │
└─────────────────────────────────────┘
         │
         │ Optional: Geo-replication
         ▼
┌─────────────────────────────────────┐
│         Region: West US             │
├─────────────────────────────────────┤
│ Frontend App Service (Secondary)    │
│ Backend App Service (Secondary)     │
│ Cosmos DB (Replica)                 │
└─────────────────────────────────────┘
```

---

## 🎉 Summary

Your Blood Bank Application architecture on Azure includes:

✅ **2 App Services** - Frontend & Backend  
✅ **1 Cosmos DB** - MongoDB-compatible database  
✅ **CI/CD Pipelines** - Automated deployments  
✅ **Application Insights** - Monitoring & telemetry  
✅ **HTTPS/SSL** - Automatic encryption  
✅ **Auto-scaling** - Handle traffic spikes  
✅ **High Availability** - 99.95% SLA  
✅ **Global Reach** - Deploy closer to users  

**Total Setup Time:** ~1 hour  
**Deployment Time:** 3-5 minutes per update  
**Monthly Cost:** $0-25 (Free tier) or $50-100 (Production)

---

*Architecture designed for scalability, security, and cost-efficiency*

