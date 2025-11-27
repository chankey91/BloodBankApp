# 🩸 Blood Bank Network Application

A comprehensive blood bank network application that connects donors, patients, hospitals, and blood banks in real-time to save lives.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🔑 Core Features

#### 1. **Blood Availability Search**
- Search by blood type, location, and component (whole blood, plasma, platelets)
- Real-time inventory updates from connected blood banks
- Geolocation-based search with customizable radius
- Interactive map showing nearby blood banks

#### 2. **Donor Registration & Management**
- Complete donor profile with health information
- Eligibility tracking based on last donation date
- Automatic reminders when eligible to donate again
- Donation history with certificates
- Health profile management

#### 3. **Blood Request System**
- Hospitals and patients can post urgent requests
- Push notifications to matching donors nearby
- Real-time request status tracking
- Priority levels: Critical, Urgent, Normal

#### 4. **Blood Bank Network**
- Integration between multiple blood banks
- Comprehensive inventory management
- Stock transfer coordination
- Low stock alerts

### 📱 Advanced Features

#### 5. **Geo-Location Integration**
- Find nearest blood bank with required blood
- Route maps for donors to reach donation centers
- Location-based donor notifications

#### 6. **Real-Time Notifications**
- Emergency broadcast to nearby donors
- Eligibility reminders
- Low inventory alerts
- Request fulfillment updates
- Socket.io for instant notifications

#### 7. **Gamification & Rewards**
- Points system for donations
- Achievement badges (First Donation, Regular Donor, Hero Donor)
- Certificates for donors
- Leaderboard (coming soon)

#### 8. **Donation Camps**
- Blood banks and NGOs can announce drives
- Direct registration through the app
- Location-based camp notifications
- Camp management dashboard

#### 9. **Analytics Dashboard**
- Track donation trends and patterns
- Blood type distribution
- Demand forecasting
- Inventory trends
- City-wise statistics

#### 10. **Security Features**
- JWT authentication
- Role-based access control (Donor, Blood Bank, Hospital, Admin)
- Password encryption with bcrypt
- Rate limiting
- Helmet.js for security headers

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **Email**: Nodemailer
- **Validation**: Express Validator
- **Security**: Helmet, bcryptjs, CORS
- **Task Scheduling**: node-cron

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Maps**: React Leaflet
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: React Icons
- **Notifications**: React Toastify
- **Date Handling**: date-fns

### DevOps & Tools
- **Version Control**: Git
- **Package Manager**: npm
- **API Testing**: Postman (recommended)

## 📁 Project Structure

```
BloodBankApp/
├── backend/
│   ├── middleware/
│   │   └── auth.js                 # Authentication middleware
│   ├── models/
│   │   ├── User.js                 # User model (authentication)
│   │   ├── Donor.js                # Donor profile model
│   │   ├── BloodBank.js            # Blood bank model
│   │   ├── Inventory.js            # Blood inventory model
│   │   ├── Request.js              # Blood request model
│   │   ├── Notification.js         # Notification model
│   │   └── DonationCamp.js         # Donation camp model
│   ├── routes/
│   │   ├── auth.js                 # Authentication routes
│   │   ├── donors.js               # Donor management routes
│   │   ├── bloodBanks.js           # Blood bank routes
│   │   ├── inventory.js            # Inventory management routes
│   │   ├── requests.js             # Blood request routes
│   │   ├── notifications.js        # Notification routes
│   │   ├── analytics.js            # Analytics routes
│   │   └── donationCamps.js        # Donation camp routes
│   ├── utils/
│   │   ├── notifications.js        # Email & push notification utilities
│   │   └── scheduler.js            # Cron job scheduler
│   └── server.js                   # Main server file
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.js
│   │   │   │   └── Footer.js
│   │   │   └── routing/
│   │   │       └── PrivateRoute.js
│   │   ├── context/
│   │   │   ├── AuthContext.js      # Authentication context
│   │   │   └── SocketContext.js    # Socket.io context
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Dashboard.js
│   │   │   ├── SearchBlood.js
│   │   │   ├── Notifications.js
│   │   │   ├── auth/
│   │   │   │   ├── Login.js
│   │   │   │   └── Register.js
│   │   │   ├── donor/
│   │   │   │   └── DonorProfile.js
│   │   │   ├── bloodbank/
│   │   │   │   └── BloodBankProfile.js
│   │   │   ├── requests/
│   │   │   │   ├── Requests.js
│   │   │   │   └── CreateRequest.js
│   │   │   ├── camps/
│   │   │   │   └── DonationCamps.js
│   │   │   ├── inventory/
│   │   │   │   └── Inventory.js
│   │   │   └── analytics/
│   │   │       └── Analytics.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd BloodBankApp
```

### Step 2: Install Backend Dependencies
```bash
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### Step 4: Setup Environment Variables
Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/bloodbank
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=30d

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Google Maps API (for geolocation)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Frontend URL
CLIENT_URL=http://localhost:3000

# Firebase Cloud Messaging (for push notifications)
FCM_SERVER_KEY=your_fcm_server_key
```

## ⚙️ Configuration

### MongoDB Setup
1. Install MongoDB on your system
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # Linux/Mac
   sudo systemctl start mongod
   ```
3. The application will automatically create the database and collections

### Email Configuration
1. For Gmail, enable "Less secure app access" or use App Passwords
2. Update `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`

### Google Maps API
1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps JavaScript API and Geocoding API
3. Add key to `.env`

## 🏃 Running the Application

### Development Mode

#### Option 1: Run Backend and Frontend Separately
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

#### Option 2: Run Both Concurrently
```bash
npm run dev:all
```

### Production Mode
```bash
# Build frontend
cd frontend
npm run build

# Start server
npm start
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "donor"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Donor Endpoints

#### Create Donor Profile
```http
POST /api/donors
Authorization: Bearer <token>
Content-Type: application/json

{
  "bloodType": "O+",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "weight": 70,
  "location": {
    "coordinates": [longitude, latitude],
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA"
  }
}
```

#### Get Donor Profile
```http
GET /api/donors/profile
Authorization: Bearer <token>
```

#### Search Donors
```http
GET /api/donors/search?bloodType=O+&latitude=40.7128&longitude=-74.0060&radius=10
Authorization: Bearer <token>
```

### Blood Bank Endpoints

#### Get All Blood Banks
```http
GET /api/bloodbanks
```

#### Get Nearby Blood Banks
```http
GET /api/bloodbanks/nearby?latitude=40.7128&longitude=-74.0060&radius=50
```

### Inventory Endpoints

#### Search Blood Inventory
```http
GET /api/inventory/search?bloodType=O+&component=whole%20blood&latitude=40.7128&longitude=-74.0060
```

#### Get Low Stock Items
```http
GET /api/inventory/low-stock
Authorization: Bearer <token>
```

### Request Endpoints

#### Create Blood Request
```http
POST /api/requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "patient": {
    "name": "Jane Doe",
    "bloodType": "O+",
    "age": 30,
    "gender": "female"
  },
  "bloodType": "O+",
  "component": "whole blood",
  "unitsRequired": 2,
  "urgency": "critical",
  "location": {
    "coordinates": [longitude, latitude],
    "city": "New York",
    "state": "NY"
  },
  "requiredBy": "2025-10-10"
}
```

#### Get All Requests
```http
GET /api/requests?status=open&urgency=critical
Authorization: Bearer <token>
```

#### Respond to Request
```http
POST /api/requests/:id/respond
Authorization: Bearer <token>
Content-Type: application/json

{
  "response": "willing",
  "message": "I'm available to donate"
}
```

### Analytics Endpoints

#### Get Dashboard Analytics
```http
GET /api/analytics/dashboard
Authorization: Bearer <token>
```

#### Get Demand Forecast
```http
GET /api/analytics/demand-forecast
Authorization: Bearer <token>
```

## 🗄️ Database Schema

### User Collection
- name, email, password (hashed)
- phone, role (donor/bloodbank/hospital/admin)
- isVerified, fcmToken

### Donor Collection
- user (reference to User)
- bloodType, dateOfBirth, gender, weight
- location (GeoJSON Point)
- lastDonationDate, isEligible
- donationHistory, rewards, badges

### BloodBank Collection
- user (reference to User)
- name, registrationNumber, type
- location (GeoJSON Point)
- contact, operatingHours, facilities
- verificationStatus

### Inventory Collection
- bloodBank (reference)
- bloodType, component, units
- unit array (bag details with expiry, status, tests)

### Request Collection
- requestedBy (user and organization)
- patient info, bloodType, component
- unitsRequired, urgency, status
- location (GeoJSON Point)
- fulfillments, responses

### Notification Collection
- recipient, type, title, message
- priority, isRead, channels

## 🔐 Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Password Hashing**: bcrypt for secure password storage
3. **Rate Limiting**: Prevents abuse and DoS attacks
4. **Helmet.js**: Security headers
5. **CORS**: Controlled cross-origin requests
6. **Input Validation**: Express Validator for request validation
7. **Role-Based Access**: Authorization middleware

## 📅 Scheduled Tasks

The application runs automated cron jobs:

1. **Daily at 9 AM**: Check donor eligibility and send reminders
2. **Daily at 10 AM**: Check for low inventory levels
3. **Daily at 8 AM**: Check for expiring blood units

## 🎯 User Roles

1. **Donor**: Register, donate, respond to requests
2. **Blood Bank**: Manage inventory, create camps, view analytics
3. **Hospital**: Create blood requests, search inventory
4. **Admin**: Full access to all features and analytics

## 🔄 Real-Time Features

- Instant notifications for urgent requests
- Live inventory updates
- Real-time request status changes
- Socket.io integration for bi-directional communication

## 🚀 Future Enhancements

- [ ] AI-based demand forecasting
- [ ] IoT integration for smart storage units
- [ ] Blockchain ledger for transparency
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Payment gateway integration
- [ ] Advanced analytics with ML
- [ ] Telemedicine integration

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Support

For support, email support@bloodbanknetwork.com or join our Slack channel.

## 🙏 Acknowledgments

- All blood donors who save lives every day
- Healthcare workers and blood bank staff
- Open source community

---

**Made with ❤️ for saving lives**

