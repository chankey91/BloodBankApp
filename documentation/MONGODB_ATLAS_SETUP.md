# 🍃 MongoDB Atlas Setup Guide

Since you're using MongoDB Atlas (cloud database), follow this guide to configure your connection.

## 📋 Prerequisites

- MongoDB Atlas account (free tier available)
- Your deployment server IP: `103.230.227.5`

---

## 🚀 Step 1: Create MongoDB Atlas Cluster

### 1.1 Sign Up / Log In

Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create an account or log in.

### 1.2 Create a New Cluster

1. Click **"Build a Database"** or **"Create"**
2. Choose **FREE** tier (M0 Sandbox)
3. Select your preferred **Cloud Provider** and **Region** (choose closest to your server location)
4. **Cluster Name**: `BloodBankCluster` (or any name you prefer)
5. Click **"Create Cluster"**

Wait 3-5 minutes for cluster creation.

---

## 🔐 Step 2: Create Database User

1. Go to **Database Access** (left sidebar under Security)
2. Click **"Add New Database User"**
3. Configure:
   - **Authentication Method**: Password
   - **Username**: `bloodbank_admin` (or your choice)
   - **Password**: Generate a strong password or create your own
   - **Database User Privileges**: Read and write to any database
4. Click **"Add User"**

**⚠️ IMPORTANT**: Save your username and password securely!

---

## 🌐 Step 3: Whitelist IP Address

### 3.1 Add Your Server IP

1. Go to **Network Access** (left sidebar under Security)
2. Click **"Add IP Address"**
3. Add these IPs:
   - **Your Server**: `103.230.227.5/32` (Description: "Production Server")
   - **Your Development Machine**: Click "Add Current IP Address" (for local development)
   - **Optional**: `0.0.0.0/0` (Allow from anywhere - less secure but easier for testing)
4. Click **"Confirm"**

### 3.2 For Jenkins Server

If Jenkins is on a different server, also add its IP address.

---

## 🔗 Step 4: Get Connection String

1. Go to **Database** → **Clusters**
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select:
   - **Driver**: Node.js
   - **Version**: 4.1 or later
5. Copy the connection string. It looks like:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

## ⚙️ Step 5: Configure Your Application

### 5.1 Update Connection String

Replace placeholders in the connection string:

```
mongodb+srv://bloodbank_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/bloodbank?retryWrites=true&w=majority
```

- Replace `<username>` with your database username
- Replace `<password>` with your database password
- Add `/bloodbank` before the `?` to specify the database name

### 5.2 Update .env File on Server

SSH to your server:

```bash
ssh -p 2022 ubuntu@103.230.227.5
```

Edit the environment file:

```bash
cd /var/www/bloodbank/backend
nano .env
```

Update the `MONGO_URI`:

```env
MONGO_URI=mongodb+srv://bloodbank_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/bloodbank?retryWrites=true&w=majority
```

**⚠️ Security Note**: 
- Never commit `.env` file to Git
- Use strong passwords
- Restrict IP access in MongoDB Atlas

---

## 🗄️ Step 6: Create Database and Collections (Optional)

MongoDB will automatically create the database and collections when your app first runs, but you can create them manually:

1. Go to **Database** → **Browse Collections**
2. Click **"Add My Own Data"**
3. **Database Name**: `bloodbank`
4. **Collection Name**: `users` (or any collection)
5. Click **"Create"**

Your app will create these collections automatically:
- `users`
- `donors`
- `bloodbanks`
- `hospitals`
- `inventory`
- `requests`
- `notifications`
- `donationcamps`

---

## 🧪 Step 7: Test Connection

### Test Locally First

Create a test file `test-connection.js`:

```javascript
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://bloodbank_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/bloodbank?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connected successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
```

Run it:

```bash
node test-connection.js
```

### Test on Server

```bash
ssh -p 2022 ubuntu@103.230.227.5
cd /var/www/bloodbank/backend

# Test connection
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI || 'your_connection_string').then(() => { console.log('Connected!'); process.exit(0); }).catch(err => { console.error(err); process.exit(1); });"
```

---

## 📊 Step 8: Monitor Your Database

### Atlas Dashboard

1. Go to **Database** → **Clusters**
2. Click **"Metrics"** to see:
   - Connections
   - Operations per second
   - Network traffic
   - Storage usage

### View Data

1. Click **"Browse Collections"**
2. Select your database: `bloodbank`
3. View and manage your data

---

## 🔒 Security Best Practices

### 1. Use Strong Passwords

```bash
# Generate a strong password
openssl rand -base64 32
```

### 2. Restrict IP Access

Only whitelist necessary IPs:
- Production server: `103.230.227.5`
- Your development machine
- Jenkins server (if different)

**Avoid** `0.0.0.0/0` in production!

### 3. Use Environment Variables

Never hardcode credentials:

```javascript
// ❌ BAD
const uri = 'mongodb+srv://user:password123@cluster.mongodb.net/db';

// ✅ GOOD
const uri = process.env.MONGO_URI;
```

### 4. Enable Encryption

MongoDB Atlas encrypts data at rest and in transit by default.

### 5. Regular Backups

Atlas provides automatic backups:
1. Go to **Backup** tab
2. Enable **Cloud Backup** (available on paid tiers)
3. For free tier: Use `mongodump` for manual backups

---

## 🔄 Connection String Formats

### Standard Format (Atlas)
```
mongodb+srv://username:password@cluster.mongodb.net/database?options
```

### With Specific Options
```
mongodb+srv://username:password@cluster.mongodb.net/bloodbank?retryWrites=true&w=majority&appName=BloodBankApp
```

### Common Options

- `retryWrites=true` - Automatically retry write operations
- `w=majority` - Write concern (wait for majority of nodes)
- `maxPoolSize=10` - Maximum connection pool size
- `serverSelectionTimeoutMS=5000` - Server selection timeout

---

## 🐛 Troubleshooting

### Error: "Authentication failed"

**Solution:**
- Check username and password
- Ensure password doesn't contain special characters (or URL encode them)
- Verify user has correct permissions

### Error: "Connection timeout"

**Solution:**
- Check if server IP is whitelisted in Network Access
- Verify firewall allows outbound connections on port 27017
- Check connection string is correct

### Error: "MongoServerError: bad auth"

**Solution:**
```bash
# URL encode special characters in password
# Example: p@ssw0rd! becomes p%40ssw0rd%21
```

### Test Firewall

```bash
# On your server, test if you can reach MongoDB Atlas
telnet cluster0.xxxxx.mongodb.net 27017

# Or use curl
curl -v telnet://cluster0.xxxxx.mongodb.net:27017
```

### Enable Debug Logging

In your backend code:

```javascript
mongoose.set('debug', true);
```

---

## 📈 Performance Optimization

### 1. Connection Pooling

In `backend/config/config.js` or `server.js`:

```javascript
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10,
  minPoolSize: 2,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
});
```

### 2. Create Indexes

For better query performance:

```javascript
// In your models
donorSchema.index({ bloodType: 1, 'location.coordinates': '2dsphere' });
requestSchema.index({ status: 1, createdAt: -1 });
```

### 3. Monitor Slow Queries

In Atlas:
1. Go to **Performance Advisor**
2. Review slow queries
3. Create suggested indexes

---

## 💰 Pricing

### Free Tier (M0)
- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ Good for development and small apps
- ✅ No credit card required

### Paid Tiers
- **M2**: $9/month - 2GB storage
- **M5**: $25/month - 5GB storage
- More options available

For your Blood Bank App, **Free Tier** should be sufficient initially.

---

## 🔗 Useful Links

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Connection String Format](https://docs.mongodb.com/manual/reference/connection-string/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas Support](https://support.mongodb.com/)

---

## ✅ Checklist

Before deploying:

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with strong password
- [ ] Server IP (103.230.227.5) whitelisted
- [ ] Connection string obtained
- [ ] `.env` file updated on server
- [ ] Connection tested successfully
- [ ] Indexes created (optional but recommended)
- [ ] Backup strategy in place

---

## 📝 Example .env Configuration

```env
# Production Environment
NODE_ENV=production
PORT=5000

# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://bloodbank_admin:StrongP@ssw0rd123@cluster0.abc123.mongodb.net/bloodbank?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Frontend URL
CLIENT_URL=http://103.230.227.5

# Other configurations...
```

---

## 🎯 Quick Setup Commands

```bash
# 1. SSH to server
ssh -p 2022 ubuntu@103.230.227.5

# 2. Navigate to backend directory
cd /var/www/bloodbank/backend

# 3. Create/Edit .env file
nano .env

# 4. Add your MongoDB Atlas connection string
# MONGO_URI=mongodb+srv://...

# 5. Save and exit (Ctrl+X, Y, Enter)

# 6. Restart application
pm2 restart bloodbank-backend

# 7. Check logs
pm2 logs bloodbank-backend
```

---

**🎉 You're all set! Your Blood Bank App is now connected to MongoDB Atlas!**

