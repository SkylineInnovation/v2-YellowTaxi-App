# Firestore Indexes Documentation

## Overview
This document explains the Firestore composite indexes required for the YellowTaxi ride-booking app. These indexes are essential for the complex queries used in real-time ride matching, driver management, and notification systems.

## Why Indexes Are Required

Firestore requires composite indexes when queries use:
- Multiple `where()` clauses on different fields
- `where()` clause combined with `orderBy()` on different fields
- Array membership queries with additional filters

Without proper indexes, queries will fail with "The query requires an index" error.

## Index Configuration

### Current Indexes in `firestore.indexes.json`

#### 1. **Ride Requests (Customer Side)**
```json
{
  "collectionGroup": "ride-requests",
  "fields": [
    {"fieldPath": "customerId", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
}
```
**Purpose**: Get customer's ride requests ordered by creation time

#### 2. **Orders - Customer History**
```json
{
  "collectionGroup": "orders",
  "fields": [
    {"fieldPath": "customerId", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
}
```
**Purpose**: Get customer's ride history ordered by date

#### 3. **Orders - Customer Active Rides**
```json
{
  "collectionGroup": "orders",
  "fields": [
    {"fieldPath": "customerId", "order": "ASCENDING"},
    {"fieldPath": "status", "order": "ASCENDING"}
  ]
}
```
**Purpose**: Find customer's active rides by status

#### 4. **Driver Ride Requests**
```json
{
  "collectionGroup": "driver_ride_requests",
  "fields": [
    {"fieldPath": "driverId", "order": "ASCENDING"},
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
}
```
**Purpose**: Get pending ride requests for a specific driver

#### 5. **Driver Ride Request Management**
```json
{
  "collectionGroup": "driver_ride_requests",
  "fields": [
    {"fieldPath": "rideId", "order": "ASCENDING"},
    {"fieldPath": "status", "order": "ASCENDING"}
  ]
}
```
**Purpose**: Find all pending requests for a specific ride (for declining others)

#### 6. **Driver Active Rides**
```json
{
  "collectionGroup": "orders",
  "fields": [
    {"fieldPath": "driverId", "order": "ASCENDING"},
    {"fieldPath": "status", "order": "ASCENDING"}
  ]
}
```
**Purpose**: Find driver's current active ride

#### 7. **Driver Ride History**
```json
{
  "collectionGroup": "orders",
  "fields": [
    {"fieldPath": "driverId", "order": "ASCENDING"},
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "completedAt", "order": "DESCENDING"}
  ]
}
```
**Purpose**: Get driver's completed rides ordered by completion date

#### 8. **Driver Earnings Calculation**
```json
{
  "collectionGroup": "orders",
  "fields": [
    {"fieldPath": "driverId", "order": "ASCENDING"},
    {"fieldPath": "status", "order": "ASCENDING"},
    {"fieldPath": "completedAt", "order": "ASCENDING"}
  ]
}
```
**Purpose**: Calculate driver earnings for specific time periods

#### 9. **Available Drivers**
```json
{
  "collectionGroup": "drivers",
  "fields": [
    {"fieldPath": "isOnline", "order": "ASCENDING"},
    {"fieldPath": "isAvailable", "order": "ASCENDING"},
    {"fieldPath": "status", "order": "ASCENDING"}
  ]
}
```
**Purpose**: Find online and available drivers for ride matching

#### 10. **User Notifications**
```json
{
  "collectionGroup": "notifications",
  "fields": [
    {"fieldPath": "userId", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
}
```
**Purpose**: Get user's notifications ordered by creation time

#### 11. **Unread Notifications**
```json
{
  "collectionGroup": "notifications",
  "fields": [
    {"fieldPath": "userId", "order": "ASCENDING"},
    {"fieldPath": "read", "order": "ASCENDING"}
  ]
}
```
**Purpose**: Find and manage unread notifications for a user

## Deployment Instructions

### Prerequisites
1. **Firebase CLI installed**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase project configured**:
   ```bash
   firebase login
   firebase use your-project-id
   ```

### Method 1: Automated Deployment (Recommended)
```bash
# Run the deployment script
./scripts/deploy-firestore.sh
```

### Method 2: Manual Deployment
```bash
# Deploy indexes
firebase deploy --only firestore:indexes

# Deploy security rules
firebase deploy --only firestore:rules
```

### Method 3: Deploy Specific Components
```bash
# Deploy only indexes
firebase deploy --only firestore:indexes

# Deploy only rules
firebase deploy --only firestore:rules
```

## Index Creation Process

### Timeline
- **Small collections** (< 1000 documents): 1-2 minutes
- **Medium collections** (1000-10000 documents): 5-10 minutes  
- **Large collections** (> 10000 documents): 15-30 minutes

### Monitoring Progress
1. **Firebase Console**: 
   - Go to Firestore > Indexes
   - Monitor "Building" status
   
2. **CLI Status**:
   ```bash
   firebase firestore:indexes
   ```

### Index States
- **Building**: Index is being created
- **Ready**: Index is active and ready to use
- **Error**: Index creation failed

## Query Examples

### Customer Queries
```typescript
// Get customer's ride requests
firestore
  .collection('ride-requests')
  .where('customerId', '==', userId)
  .orderBy('createdAt', 'desc')
  .get()

// Get customer's active rides
firestore
  .collection('orders')
  .where('customerId', '==', userId)
  .where('status', 'in', ['searching', 'assigned', 'in_progress'])
  .get()
```

### Driver Queries
```typescript
// Get driver's pending requests
firestore
  .collection('driver_ride_requests')
  .where('driverId', '==', driverId)
  .where('status', '==', 'pending')
  .orderBy('createdAt', 'desc')
  .get()

// Get driver's earnings for time period
firestore
  .collection('orders')
  .where('driverId', '==', driverId)
  .where('status', '==', 'completed')
  .where('completedAt', '>=', startDate)
  .get()
```

### Driver Matching Query
```typescript
// Find available drivers
firestore
  .collection('drivers')
  .where('isOnline', '==', true)
  .where('isAvailable', '==', true)
  .where('status', '==', 'online')
  .get()
```

## Security Rules

The `firestore.rules` file includes security rules for:

### Collections Protected:
- **users**: Users can only access their own data
- **ride-requests**: Customers and assigned drivers can access
- **orders**: Customers and assigned drivers can access
- **drivers**: Public read, drivers can update their own profile
- **driver_ride_requests**: Drivers and customers can access their requests
- **location_updates**: Users can update their own location
- **notifications**: Users can access their own notifications
- **driver_locations**: Public read for matching, drivers update own

### Security Features:
- **Authentication required** for all operations
- **User-specific access** to personal data
- **Role-based access** for drivers and customers
- **Read-only access** for driver discovery

## Troubleshooting

### Common Issues

#### 1. "The query requires an index" Error
**Solution**: Check if the required index exists and is in "Ready" state

#### 2. Index Creation Failed
**Possible Causes**:
- Invalid field paths
- Conflicting indexes
- Insufficient permissions

**Solution**: 
- Verify field names match your data structure
- Check Firebase Console for error details
- Ensure proper Firebase project permissions

#### 3. Query Still Failing After Index Creation
**Solution**:
- Wait for index to reach "Ready" state
- Verify query matches index field order exactly
- Check if field names are correct

### Debug Commands
```bash
# List all indexes
firebase firestore:indexes

# Check specific project
firebase use your-project-id
firebase firestore:indexes

# Validate rules
firebase firestore:rules
```

## Performance Optimization

### Best Practices
1. **Limit query results** with `.limit()` when possible
2. **Use pagination** for large result sets
3. **Cache frequently accessed data** in Redux store
4. **Monitor query performance** in Firebase Console
5. **Avoid complex queries** during peak usage times

### Query Optimization Tips
1. **Order fields strategically** in composite indexes
2. **Use equality filters** before range filters
3. **Minimize the number of `where()` clauses**
4. **Consider denormalizing data** for frequently accessed combinations

## Maintenance

### Regular Tasks
1. **Monitor index usage** in Firebase Console
2. **Remove unused indexes** to reduce storage costs
3. **Update indexes** when query patterns change
4. **Review security rules** periodically

### Cost Considerations
- Each index consumes storage space
- Index writes have costs
- Monitor usage in Firebase Console billing section

## Support

### Resources
- [Firestore Index Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Console](https://console.firebase.google.com/)

### Getting Help
- Firebase Support (for paid plans)
- Stack Overflow with `firebase` and `firestore` tags
- Firebase Community Slack

---

**Note**: All indexes must be deployed before the ride-booking functionality will work properly. The app will show errors for complex queries until indexes are created and reach "Ready" state.
