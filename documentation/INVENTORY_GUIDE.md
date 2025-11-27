# 📦 Blood Bank Inventory Management Guide

## 🎯 How to Manage Inventory as a Blood Bank

### Step-by-Step Process

#### 1️⃣ **Complete Your Blood Bank Profile** (One-time setup)
- Login as Blood Bank user
- Click "My Profile" in navbar
- If no profile exists, click "Create Blood Bank Profile"
- Fill in all required information:
  - Blood Bank Name & Registration Number
  - Location with coordinates
  - Contact Information
  - Storage Capacity
  - Facilities
- Submit the form

#### 2️⃣ **Access Inventory Management**
- Click "Inventory" in the navbar
- You'll see your current inventory dashboard

#### 3️⃣ **Add New Blood Units**
- Click the **"+ Add Blood Unit"** button (top right)
- Fill in the blood unit details:

##### Required Fields:
- **Blood Type**: Select from A+, A-, B+, B-, AB+, AB-, O+, O-
- **Component**: 
  - Whole Blood (35 days shelf life)
  - Red Blood Cells (42 days)
  - Plasma (1 year)
  - Platelets (5 days)
  - Cryoprecipitate (1 year)
- **Bag Number**: Unique identifier (e.g., BAG-2025-001)
- **Volume**: In milliliters (e.g., 450 ml)
- **Collection Date**: When blood was collected
- **Expiry Date**: Auto-calculated based on component type

##### Optional Fields:
- **Storage Location**: Where the unit is stored (e.g., Refrigerator-A, Shelf-3)
- **Donor ID**: If you know the donor's database ID

#### 4️⃣ **Submit the Form**
- Click "Add to Inventory"
- Blood unit is added to your inventory
- You'll be redirected to the inventory overview

#### 5️⃣ **View Your Inventory**
The inventory dashboard shows:
- **Stock Level Cards**: Each blood type + component combination
  - Current units available
  - Stock status (In Stock, Low Stock, Out of Stock)
  - Reorder level
  - Unit breakdown (Available, Reserved, Issued)
- **Low Stock Alerts**: Banner warning for items below reorder level
- **Blood Type Summary**: Total units by blood type

---

## 📊 Inventory Features

### Stock Levels
- 🟢 **In Stock**: Units above reorder level
- 🟡 **Low Stock**: Units at or below reorder level
- 🔴 **Out of Stock**: Zero units

### Unit Statuses
- **Available**: Ready to be issued
- **Reserved**: Held for a specific request
- **Issued**: Given to patient/hospital
- **Expired**: Past expiry date
- **Discarded**: Removed from inventory

### Automatic Features
- ✅ Auto-calculate expiry dates based on component type
- ✅ Low stock alerts
- ✅ Expiring units notification (via scheduled cron job)
- ✅ Real-time inventory updates

---

## 💡 Best Practices

### 1. **Unique Bag Numbers**
Use a consistent format:
- `BAG-2025-001`, `BAG-2025-002`, etc.
- Include year for easy tracking
- Sequential numbering

### 2. **Storage Location**
Use clear naming:
- `Fridge-A-Shelf-1`
- `Freezer-B-Section-2`
- `Mobile-Unit-1`

### 3. **Regular Updates**
- Add units immediately after collection
- Update status when issuing blood
- Monitor expiring units daily

### 4. **Set Appropriate Reorder Levels**
Default is 5 units, but adjust based on:
- Demand for specific blood types
- Storage capacity
- Collection frequency

---

## 🔍 Example Workflow

### Scenario: Adding O+ Whole Blood

1. **Donor comes in** → Blood collected
2. **Login to system** as Blood Bank
3. **Go to Inventory** → Click "Add Blood Unit"
4. **Fill form**:
   - Blood Type: O+
   - Component: Whole Blood
   - Bag Number: BAG-2025-042
   - Volume: 450 ml
   - Collection Date: 2025-10-03
   - Expiry Date: 2025-11-07 (auto-calculated: +35 days)
   - Storage: Fridge-A-Shelf-2
5. **Submit** → Unit appears in inventory!

---

## 📈 Monitoring & Analytics

### View in Dashboard
- Total units by blood type
- Stock levels across all components
- Low stock warnings

### Access Analytics
- Click "Analytics" in navbar
- View inventory trends
- Blood type distribution
- Demand forecasting

---

## ⚠️ Important Notes

### Expiry Periods (Automatic)
| Component | Shelf Life |
|-----------|------------|
| Whole Blood | 35 days |
| Red Blood Cells | 42 days |
| Platelets | 5 days ⚡ |
| Plasma | 1 year |
| Cryoprecipitate | 1 year |

### Daily Automated Tasks
The system automatically:
- ✅ Checks donor eligibility (9 AM daily)
- ✅ Monitors low inventory (10 AM daily)
- ✅ Identifies expiring units (8 AM daily)
- ✅ Sends notifications to relevant users

---

## 🎯 Quick Tips

1. **Add units immediately** after collection to maintain accurate counts
2. **Use descriptive bag numbers** for easy tracking
3. **Check low stock alerts** daily
4. **Monitor expiring units** to minimize waste
5. **Update unit status** when issuing to patients
6. **Keep storage locations consistent** for easier retrieval

---

## 🆘 Troubleshooting

### "Please complete your blood bank profile" error
→ Create your blood bank profile first (see Step 1)

### Can't add inventory
→ Make sure you're logged in as a Blood Bank user

### Don't see my inventory
→ Check that you've added units with the correct blood bank ID

### Need to update a unit
→ Currently view-only; future updates will add edit functionality

---

## 🚀 Ready to Start?

1. Login as Blood Bank → http://localhost:3000/login
2. Complete Profile → /bloodbank/profile/create
3. Add Inventory → /inventory/add
4. Manage Units → /inventory

---

**Your inventory system is now ready to use! Start adding blood units to help save lives! 🩸**

