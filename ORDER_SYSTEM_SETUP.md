# Water Delivery App - Order System Setup & Usage Guide

## Overview

This document provides comprehensive instructions for setting up and using the new

system in the Water Delivery App. The system includes product management, dynamic address handling, payment integration, and order tracking.

## Features Implemented

### 🛍️ **Product Management**
- Dynamic product loading from Firestore
- Support for multiple product types (20L, 10L, 5L water bottles)
- Bulk pricing and discount calculations
- Stock management and availability checking
- Product specifications and features display

### 📍 **Dynamic Address Management**
- Automatic loading of user's community address
- Temporary address changes for specific orders
- Contact information management
- Special delivery instructions

### 💳 **Payment Integration**
- Support for multiple payment methods
- Card information display and selection
- Payment method management
- Order total calculations with delivery fees

### 📦 **Order Management**
- Complete order creation and tracking
- Order status management (placed, confirmed, preparing, out_for_delivery, delivered)
- Order history and details
- Cancellation and refund handling

## Setup Instructions

### 1. Install Required Dependencies

All necessary dependencies are already included in the project:

```bash
# Firebase packages (already installed)
@react-native-firebase/app
@react-native-firebase/auth
@react-native-firebase/firestore

# Navigation (already installed)
expo-router
@react-navigation/native

# Other utilities (already installed)
@react-native-async-storage/async-storage
```

### 2. Initialize Firestore Collections

#### Option A: Automatic Initialization (Recommended)
The app will automatically create initial data when needed:

1. **Products**: When you first access the
page, if no products exist, the app will automatically create sample products
2. **Communities**: When you access the Select Community page, initial communities will be created if none exist

#### Option B: Manual Initialization
If you prefer to manually initialize the data:

```bash
# Initialize products (requires Firebase Admin SDK setup)
npm run init:products

# Or initialize all data
npm run init:data
```

### 3. Firebase Admin SDK Setup (Optional)

For manual data initialization, you'll need to set up Firebase Admin SDK:

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file as `firebase-service-account.json` in the project root
4. Update the database URL in `scripts/init-products.js`

### 4. Firestore Security Rules

Ensure your Firestore has proper security rules. Add these to your `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Products are read-only for clients
    match /products/{productId} {
      allow read: if request.auth != null;
      allow write: if false; // Only admin can write
    }

    // Communities are read-only for clients
    match /communities/{communityId} {
      allow read: if request.auth != null;
      allow write: if false; // Only admin can write
    }

    // Orders - users can only access their own orders
    match /orders/{orderId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Usage Guide

### 1. Placing an Order

#### Customer Flow:
1. **Navigate to Order Page**: Tap "Order Now" from the home screen
2. **Select Product**: Choose from available water bottles (20L, 10L, 5L)
3. **Set Quantity**: Use +/- buttons to adjust quantity (respects max order limits)
4. **Verify Address**: Confirm delivery address or make temporary changes
5. **Choose Payment**: Select from saved payment methods
6. **Add Notes**: Optional special instructions for delivery
7. **Review Summary**: Check order total, delivery fee, and estimated delivery time
8. **Place Order**: Confirm and submit the order

#### Address Management:
- **Default Address**: Uses the address from community selection during registration
- **Temporary Changes**: Tap "Change" to modify contact info or add special instructions
- **Persistent Changes**: Future feature to permanently update default address

### 2. Order Data Structure

#### Products Collection (`/products/{productId}`)
```javascript
{
  id: "water_20l",
  name: "Premium Water Bottle",
  description: "Pure and clean 20-liter water bottle...",
  category: "water",
  subCategory: "bottled_water",
  specifications: {
    volume: "20 Liters",
    material: "Food-grade plastic",
    type: "Purified Spring Water",
    shelf_life: "6 months",
    certifications: ["ISI", "BIS", "FSSAI"]
  },
  pricing: {
    basePrice: 120,
    currency: "INR",
    bulkDiscount: 10,
    minBulkQuantity: 5,
    maxOrderQuantity: 20
  },
  availability: {
    isAvailable: true,
    stock: 1000,
    lowStockThreshold: 50
  },
  // ... other fields
}
```

#### Orders Collection (`/orders/{orderId}`)
```javascript
{
  orderId: "ORD1234567890",
  userId: "user_firebase_uid",
  communityId: "sunset_gardens",
  status: "placed",
  paymentStatus: "pending",
  products: [{
    productId: "water_20l",
    name: "Premium Water Bottle",
    quantity: 2,
    unitPrice: 120,
    totalPrice: 240,
    specifications: {...}
  }],
  subtotal: 240,
  deliveryFee: 0,
  totalAmount: 240,
  deliveryAddress: {
    communityId: "sunset_gardens",
    communityName: "Sunset Gardens",
    apartmentNumber: "101",
    fullAddress: "Sunset Gardens, 123 Sunset Street...",
    contactName: "John Doe",
    contactPhone: "+91-9876543210",
    specialInstructions: "Call before delivery"
  },
  paymentMethod: {
    type: "card",
    cardId: 1,
    cardLastFour: "4242",
    cardType: "Visa"
  },
  deliverySchedule: {
    preferredTime: "asap",
    estimatedDelivery: "2024-03-20T18:00:00.000Z",
    actualDelivery: null
  },
  statusHistory: [{
    status: "placed",
    timestamp: "2024-03-20T15:00:00.000Z",
    note: "Order placed successfully",
    updatedBy: "system"
  }],
  createdAt: "2024-03-20T15:00:00.000Z",
  updatedAt: "2024-03-20T15:00:00.000Z"
}
```

### 3. Order Status Flow

```
placed → confirmed → preparing → out_for_delivery → delivered
   ↓
cancelled (can be cancelled before out_for_delivery)
```

#### Status Descriptions:
- **placed**: Order submitted by customer
- **confirmed**: Order confirmed by admin/system
- **preparing**: Order being prepared for delivery
- **out_for_delivery**: Delivery partner has picked up the order
- **delivered**: Order successfully delivered to customer
- **cancelled**: Order cancelled by customer or admin
- **failed**: Order failed due to technical issues

### 4. Pricing Logic

#### Base Pricing:
- Products have a `basePrice` per unit
- Total = `basePrice × quantity`

#### Bulk Discounts:
- Applied when `quantity >= minBulkQuantity`
- Discount percentage defined in `bulkDiscount`
- Example: 10% discount on 5+ bottles

#### Delivery Fees:
- FREE delivery for orders above ₹500 or quantity > 3
- Standard delivery fee: ₹50
- Configurable per product

### 5. Stock Management

#### Automatic Stock Updates:
- Stock decreases when order is placed
- Stock restores when order is cancelled
- Low stock alerts when below `lowStockThreshold`

#### Availability Checking:
- Validates stock before order placement
- Checks against `maxOrderQuantity` limits
- Prevents overselling

## Configuration Options

### 1. Product Configuration

#### Adding New Products:
```javascript
// In ProductService.createInitialProducts() or via admin panel
{
  id: "new_product_id",
  name: "Product Name",
  pricing: {
    basePrice: 100,
    bulkDiscount: 15, // 15% discount
    minBulkQuantity: 3,
    maxOrderQuantity: 50
  },
  availability: {
    isAvailable: true,
    stock: 500,
    lowStockThreshold: 25
  }
  // ... other required fields
}
```

#### Updating Prices:
```javascript
// Via Firebase Console or admin interface
await firestore()
  .collection('products')
  .doc('product_id')
  .update({
    'pricing.basePrice': newPrice,
    updatedAt: new Date().toISOString()
  });
```

### 2. Delivery Configuration

#### Delivery Time Calculation:
- Business hours: 9 AM to 5 PM
- Same-day delivery within business hours (3-hour window)
- Next-day delivery outside business hours
- Configurable in `OrderService.calculateEstimatedDelivery()`

#### Delivery Fee Rules:
```javascript
// In ProductService.calculateDeliveryFee()
if (totalOrderValue >= 500 || quantity > 3) {
  return 0; // Free delivery
}
return 50; // Standard fee
```

### 3. Order Limits

#### Quantity Limits:
- Per-product `maxOrderQuantity`
- Global order limits (configurable)
- Stock availability limits

#### Order Value Limits:
- Minimum order value (if needed)
- Maximum order value (if needed)
- Payment method limits

## Testing

### 1. Test Order Flow

1. **Create Test User**: Register with phone number
2. **Select Community**: Choose from available communities
3. **Place Test Order**:
   - Select product (20L water bottle)
   - Set quantity (2)
   - Use default address
   - Select payment method
   - Add order notes
   - Submit order

4. **Verify Data**: Check Firestore for:
   - Order document created
   - Product stock updated
   - User order history

### 2. Test Scenarios

#### Valid Orders:
- ✅ Single product, normal quantity
- ✅ Multiple products (if implemented)
- ✅ Bulk order with discount
- ✅ Free delivery threshold
- ✅ Temporary address change

#### Edge Cases:
- ❌ Out of stock product
- ❌ Exceeding max quantity
- ❌ Invalid payment method
- ❌ Missing delivery address
- ❌ Network connectivity issues

### 3. Error Handling

The system handles various error scenarios:
- Network timeouts
- Firestore permission errors
- Product availability changes
- Payment processing failures
- Invalid input validation

## Troubleshooting

### Common Issues

#### 1. Products Not Loading
**Problem**: "Failed to load products" error
**Solution**:
- Check Firestore security rules
- Verify user authentication
- Run manual product initialization

#### 2. Order Creation Failed
**Problem**: Order submission fails
**Solution**:
- Check all required fields are filled
- Verify product availability
- Check network connection
- Review Firestore permissions

#### 3. Address Not Loading
**Problem**: Delivery address shows "Loading..."
**Solution**:
- Verify user has completed community selection
- Check community data exists in Firestore
- Ensure user profile is complete

#### 4. Payment Methods Not Showing
**Problem**: No payment methods available
**Solution**:
- Currently using mock data
- Implement actual payment method storage
- Add payment method management screens

### Debug Mode

Enable debug logging by adding this to your app:

```javascript
// In your main App.js or _layout.jsx
if (__DEV__) {
  console.log('Debug mode enabled');
  // Add debug flags for order system
  global.DEBUG_ORDERS = true;
}
```

## Future Enhancements

### Phase 2 Features
- [ ] Real payment gateway integration (Stripe/Razorpay)
- [ ] Push notifications for order status updates
- [ ] Order tracking with real-time location
- [ ] Recurring order scheduling
- [ ] Multiple delivery slots selection
- [ ] Order modification after placement
- [ ] Referral and loyalty programs
- [ ] Admin dashboard for order management

### Phase 3 Features
- [ ] Multiple product categories (milk, eggs, etc.)
- [ ] Subscription-based orders
- [ ] AI-powered demand forecasting
- [ ] Route optimization for delivery
- [ ] Customer reviews and ratings
- [ ] Inventory management system
- [ ] Analytics and reporting

## Support

For technical support or questions:

1. **Check Documentation**: Review this guide and related files
2. **Review Code**: Check service files in `/src/services/`
3. **Check Firestore**: Verify data structure and permissions
4. **Test Locally**: Use development environment for debugging
5. **Create Issue**: Document the problem with steps to reproduce

## File Structure

```
WaterDeliveryApp/
├── app/
│   ├── order.jsx                 # Main place order page
│   ├── orders/[id].jsx          # Order details page
│   └── (customer)/(tabs)/home.jsx # Home page with order button
├── src/services/
│   ├── product.js               # Product management service
│   ├── order.js                 # Order management service
│   ├── community.js             # Community service
│   └── user.js                  # User service
├── scripts/
│   └── init-products.js         # Product initialization script
└── ORDER_SYSTEM_SETUP.md        # This documentation
```

---

*Last updated: March 2024*
*Version: 1.0.0*
