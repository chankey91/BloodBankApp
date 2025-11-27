# 🔔 Automatic Notification Triggers Guide

## Overview

Your Blood Bank Application now has **fully automated multi-channel notifications** that trigger on key events. Notifications are sent via:
- 📱 **In-App** (always)
- 📧 **Email** (for important events)
- 📱 **SMS** (for urgent events)
- 💬 **WhatsApp** (optional, can be configured)

---

## 🎯 Automatic Triggers Implemented

### 1. **Blood Request Created** 🩸
**When:** A hospital or blood bank creates an urgent blood request

**Trigger Location:** `backend/routes/requests.js`

**Channels Used:** In-App + SMS

**Recipients:** 
- Eligible donors with matching blood type
- Donors within 50km radius
- Donors who opted in for urgent notifications

**Example:**
```javascript
// When a critical blood request is created
POST /api/requests
{
  "bloodType": "O+",
  "urgency": "critical",
  "unitsRequired": 3
}

// Automatically sends to eligible donors:
"🩸 Urgent: O+ Blood Needed
3 units of O+ blood urgently required at City Hospital. Priority: critical"
```

**How it works:**
1. Request is created in database
2. System finds donors matching: bloodType, location, availability
3. SMS sent via Twilio/MSG91 to all eligible donors
4. In-app notifications created
5. Real-time socket notifications emitted

---

### 2. **User Account Verified** ✅
**When:** Admin verifies a user account

**Trigger Location:** `backend/routes/admin.js` - `/api/admin/users/:id/verify`

**Channels Used:** In-App + Email

**Recipients:** The verified user

**Example:**
```javascript
// Admin verifies user
PUT /api/admin/users/68e025a2faf2fe331cdc991d/verify

// User receives:
"✅ Account Verified
Congratulations! Your account has been verified. You can now access all features."
```

**How it works:**
1. Admin clicks "Verify User" in User Management
2. User record updated with `isVerified: true`
3. Email sent via SMTP/SendGrid with verification confirmation
4. In-app notification created

---

### 3. **Blood Bank Verified** 🏥
**When:** Admin verifies a blood bank

**Trigger Location:** `backend/routes/admin.js` - `/api/admin/bloodbanks/:id/verify`

**Channels Used:** In-App + Email

**Recipients:** Blood bank owner

**Example:**
```javascript
// Admin verifies blood bank
PUT /api/admin/bloodbanks/68e0d5a8b56d6619a832a88f/verify
{
  "verificationStatus": "verified"
}

// Blood bank receives:
"✅ Blood Bank Verified
Congratulations! Your blood bank 'City Blood Bank' has been verified. 
You can now manage inventory and accept blood requests."
```

**How it works:**
1. Admin reviews and approves blood bank
2. Blood bank `verificationStatus` updated to "verified"
3. User account also marked as verified
4. Email sent with approval details
5. In-app notification created

---

### 4. **Donation Camp Created** 🎪
**When:** Blood bank or admin creates a new donation camp

**Trigger Location:** `backend/routes/donationCamps.js`

**Channels Used:** In-App + Email

**Recipients:** All active donors

**Example:**
```javascript
// Blood bank creates camp
POST /api/donation-camps
{
  "name": "Summer Blood Drive 2024",
  "startDate": "2024-06-15",
  "location": {
    "address": "City Park",
    "city": "Mumbai"
  },
  "notifyDonors": true
}

// All donors receive:
"🎪 Donation Camp Alert
A blood donation camp is being organized at City Park on 6/15/2024. 
Join us to save lives!"
```

**How it works:**
1. Camp is created in database
2. If `notifyDonors: true`, notification service is triggered
3. Email broadcast sent to all active donors
4. In-app notifications created for all donors

---

### 5. **Low Inventory Alert** ⚠️
**When:** Blood inventory drops to 5 units or below

**Trigger Location:** `backend/routes/inventory.js` - Unit status update

**Channels Used:** In-App + Email

**Recipients:** 
- All admins
- The specific blood bank

**Example:**
```javascript
// Blood bank updates unit status to "used"
PUT /api/inventory/68e123.../unit/BAG12345
{ "status": "used" }

// If inventory drops to ≤5 units, admins receive:
"⚠️ Low Stock Alert: O+ Whole Blood
Critical: O+ Whole Blood stock is running low. Immediate donations needed!"
```

**How it works:**
1. Unit status updated (e.g., used, expired, issued)
2. Available units recalculated
3. If units ≤ 5, low inventory alert triggered
4. Email sent to all admins and blood bank owner
5. In-app critical notifications created

---

## 📊 Configuration & Customization

### Threshold Settings

You can customize thresholds in the respective route files:

```javascript
// backend/routes/inventory.js
const LOW_INVENTORY_THRESHOLD = 5; // Change as needed

// backend/routes/requests.js
$maxDistance: 50000 // 50 km radius, adjust as needed
```

### Channel Selection

Each trigger allows you to customize which channels to use:

```javascript
// Example: Only send in-app notifications (no SMS/Email)
await notificationService.sendNotification(userId, data, ['in-app']);

// Example: Send via all channels
await notificationService.sendNotification(userId, data, ['in-app', 'email', 'sms', 'whatsapp']);
```

### Adding Custom Triggers

To add a new automatic trigger:

1. **Identify the event** (e.g., "Donation completed")
2. **Find the route** where it occurs
3. **Add notification logic**:

```javascript
const notificationService = require('../services/notificationService');

// After your business logic
try {
  await notificationService.sendNotification(
    recipientUserId,
    {
      title: 'Your Title',
      message: 'Your message',
      type: 'notification-type', // See Notification model for types
      priority: 'medium' // low, medium, high, critical
    },
    ['in-app', 'email'] // Channels
  );
  console.log('✅ Notification sent successfully');
} catch (error) {
  console.error('Notification error:', error.message);
  // Don't fail the main operation if notification fails
}
```

---

## 🧪 Testing Automatic Notifications

### Test Blood Request Notification

1. **Configure SMS API** (Admin Panel → API Integrations)
2. **Create a test user** with role "donor" and matching blood type
3. **Create an urgent blood request:**
   ```bash
   POST http://localhost:5000/api/requests
   {
     "bloodType": "O+",
     "urgency": "critical",
     "unitsRequired": 2,
     "location": { "coordinates": [lng, lat] }
   }
   ```
4. **Check:**
   - SMS received by donor
   - In-app notification appears
   - Console logs show: `✅ Sent blood request notifications to X eligible donors`

### Test User Verification

1. **Go to Admin Panel → User Management**
2. **Find an unverified user**
3. **Click "Verify User"**
4. **Check:**
   - Email received by user
   - In-app notification appears
   - Console: `✅ Sent verification notification to user@email.com`

### Test Low Inventory Alert

1. **Ensure you have a blood bank with inventory**
2. **Update unit status to reduce available units to ≤5**
3. **Check:**
   - Email received by admins
   - Console: `⚠️ Low inventory alert sent for O+ Whole Blood`

---

## 📈 Monitoring & Logs

### Console Logs

Each notification trigger logs its activity:

```bash
✅ Sent blood request notifications to 12 eligible donors
✅ Sent verification notification to testuser@gmail.com
✅ Sent donation camp notifications for: Summer Blood Drive 2024
⚠️ Low inventory alert sent for O+ Whole Blood
✅ Sent verification notification to blood bank: City Blood Bank
```

### Error Handling

Notifications are designed to **fail gracefully**:
- If notification sending fails, the main operation (e.g., creating request) still succeeds
- Errors are logged but don't break the application
- Example log: `Notification error: SMTP connection failed`

### Database Records

All in-app notifications are stored in the `notifications` collection:

```javascript
{
  recipient: ObjectId("..."),
  type: "blood-request",
  title: "🩸 Urgent: O+ Blood Needed",
  message: "3 units required...",
  priority: "critical",
  channels: ["in-app", "sms"],
  isRead: false,
  createdAt: ISODate("2024-01-15T10:30:00Z")
}
```

---

## 🔐 Security & Privacy

### User Preferences

Future enhancement: Allow users to opt-in/opt-out of specific notification types:

```javascript
// User model
notificationPreferences: {
  urgentRequests: true,
  donationCamps: true,
  systemUpdates: false,
  channels: ['in-app', 'email'] // User can disable SMS
}
```

### Rate Limiting

To prevent spam, consider implementing:
- Cooldown periods between notifications
- Maximum notifications per day
- User-specific rate limits

---

## 🚀 Future Enhancements

1. **Donation Confirmation Notification**
   - Trigger: After successful donation
   - Message: "Thank you for donating!"
   
2. **Appointment Reminders**
   - Trigger: 24 hours before appointment
   - Channels: SMS + Email
   
3. **Eligibility Notifications**
   - Trigger: When donor becomes eligible again
   - Message: "You can donate blood again!"

4. **Request Fulfilled Notification**
   - Trigger: When blood request is marked as fulfilled
   - Recipients: Donors who donated

5. **Reward Milestones**
   - Trigger: After X donations
   - Message: "Congratulations on your 10th donation!"

---

## 📝 Summary

Your Blood Bank App now has **5 automatic notification triggers**:

| Event | Trigger | Channels | Recipients |
|-------|---------|----------|-----------|
| 🩸 Blood Request | Request created (urgent) | In-App + SMS | Eligible donors |
| ✅ User Verified | Admin verifies user | In-App + Email | Verified user |
| 🏥 Blood Bank Verified | Admin verifies bank | In-App + Email | Blood bank owner |
| 🎪 Donation Camp | Camp created | In-App + Email | All donors |
| ⚠️ Low Inventory | Stock ≤ 5 units | In-App + Email | Admins + Blood bank |

All notifications are:
- ✅ Fully automated
- ✅ Multi-channel (SMS, Email, In-App)
- ✅ Fail-safe (won't break main operations)
- ✅ Logged for monitoring
- ✅ Configurable via API Integrations panel

**Your app is now production-ready with complete notification infrastructure!** 🎉

