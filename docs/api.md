# API Documentation

## Overview

This document outlines the API endpoints and data flow for our e-commerce application. The API is built on top of Supabase's client library with custom wrapper functions to handle error cases and business logic.

## Authentication

Authentication is managed through Supabase Auth, which provides JWT tokens for authenticated requests.

### Auth Endpoints

#### Sign Up
- **Function**: `signUp(email, password)`
- **Description**: Registers a new user and automatically creates their profile
- **Returns**: User object and session if successful

#### Sign In
- **Function**: `signIn(email, password)`
- **Description**: Authenticates a user
- **Returns**: User object and session if successful

#### Sign Out
- **Function**: `signOut()`
- **Description**: Logs out the current user
- **Returns**: Success/failure status

## Profile Management

### Endpoints

#### Get Profile
- **Function**: `profileService.getProfileById(userId)`
- **Description**: Retrieves a user's profile
- **Returns**: Profile data including username, email, avatar URL, and creation date
- **Access Control**: Users can only access their own profiles

#### Create Profile
- **Function**: `profileService.createProfile(profileData)`
- **Description**: Creates a new profile for a user
- **Returns**: The newly created profile data
- **Access Control**: Users can only create their own profiles
- **Note**: Usually handled automatically during sign-up
- **Default Values**:
  - username: empty string
  - email: empty string
  - avatar_url: empty string

#### Update Profile
- **Function**: `profileService.updateProfile(userId, profileData)`
- **Description**: Updates a user's profile
- **Parameters**:
  - `userId`: The user's ID
  - `profileData`: Object containing `username`, `email`, and/or `avatar_url`
- **Returns**: Updated profile data
- **Access Control**: Users can only update their own profiles
- **Validation**: Email updates must match the user's verified email in auth.users

## Address Management

### Endpoints

#### Get User Addresses
- **Function**: `getUserAddresses(userId)`
- **Description**: Retrieves all addresses for a specific user
- **Returns**: Array of address objects
- **Access Control**: Users can only access their own addresses

#### Create Address
- **Function**: `createAddress(userId, addressData)`
- **Description**: Creates a new address for a user
- **Parameters**:
  - `userId`: The user's ID
  - `addressData`: Object containing address details
- **Returns**: The newly created address
- **Access Control**: Users can only create addresses for themselves

#### Set Default Address
- **Function**: `setDefaultAddress(userId, addressId)`
- **Description**: Sets an address as the default for a user
- **Parameters**:
  - `userId`: The user's ID
  - `addressId`: The address ID to set as default
- **Returns**: Updated address
- **Access Control**: Users can only modify their own addresses

## Order Management

### Endpoints

#### Get User Orders
- **Function**: `getUserOrders(userId)`
- **Description**: Retrieves all orders for a specific user
- **Returns**: Array of order objects
- **Access Control**: Users can only access their own orders

#### Create Order
- **Function**: `createOrder(userId, orderData)`
- **Description**: Creates a new order
- **Parameters**:
  - `userId`: The user's ID
  - `orderData`: Object containing order details including items, shipping_address_id, and payment info
- **Returns**: The newly created order
- **Access Control**: Users can only create orders for themselves

#### Get Order Details
- **Function**: `getOrderDetails(orderId)`
- **Description**: Retrieves details for a specific order including all items
- **Returns**: Order object with items array
- **Access Control**: Users can only access their own orders

#### Update Order Status
- **Function**: `updateOrderStatus(orderId, status)`
- **Description**: Updates the status of an order
- **Parameters**:
  - `orderId`: The order ID
  - `status`: New status (one of: 'pending', 'processing', 'shipped', 'delivered', 'cancelled')
- **Returns**: Updated order
- **Access Control**: Users can only update their own orders, certain status changes may be admin-only

## Product Management

### Endpoints

#### Get Products
- **Function**: `getProducts()`
- **Description**: Retrieves all products
- **Returns**: Array of product objects
- **Access Control**: Public access

#### Get Product Details
- **Function**: `getProductDetails(productId)`
- **Description**: Retrieves details for a specific product
- **Returns**: Product object
- **Access Control**: Public access

#### Get Products by Category
- **Function**: `getProductsByCategory(categoryId)`
- **Description**: Retrieves all products in a category
- **Returns**: Array of product objects
- **Access Control**: Public access

## Review Management

### Endpoints

#### Get Product Reviews
- **Function**: `getProductReviews(productId)`
- **Description**: Retrieves all reviews for a specific product
- **Returns**: Array of review objects with user information
- **Access Control**: Public access

#### Create Review
- **Function**: `createReview(userId, productId, reviewData)`
- **Description**: Creates a new review for a product
- **Parameters**:
  - `userId`: The user's ID
  - `productId`: The product ID
  - `reviewData`: Object containing rating and optional comment
- **Returns**: The newly created review
- **Access Control**: Users can only create reviews for themselves

## Error Handling

All API functions use a consistent error handling approach:

1. Database errors (Postgrest errors) are caught and processed
2. Row-level security violations are identified and handled appropriately
3. Errors are logged to the console with context
4. User-friendly toast notifications are shown for errors that impact the user experience

### Common Error Types

- `PGRST116`: No rows returned
- `42501`: Row-level security policy violation
- Network errors
- Authentication errors

## Data Flow Examples

### Profile Creation Flow

1. User signs up with email/password
2. Auth system creates user in auth.users table
3. `ensureUserProfile` is called to create entry in profiles table
4. RLS policy validates that user can only create their own profile
5. Profile is created with default values (empty strings for username, email, and avatar_url)
6. Profile is returned to the client

### Profile Update Flow

1. User updates their profile information
2. `profileService.updateProfile` is called with user ID and update data
3. RLS policy validates that user can only update their own profile
4. If email is being updated, it must match their auth.users email
5. Profile is updated and returned to the client

### Order Creation Flow

1. User adds items to cart
2. User proceeds to checkout
3. `createOrder` is called with user ID and order details
4. RLS policy validates that user can only create orders for themselves
5. Order and order items are created in the database
6. Order details are returned to the client

## Extending the API

When adding new API endpoints:

1. Create functions in appropriate files under `src/db/`
2. Follow the established pattern for error handling
3. Ensure proper RLS policies are in place
4. Update this documentation

## Testing the API

Manual testing can be done through the browser console:

```javascript
// Example: Get current user's profile
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('profile_id', 'user-id-here')
  .single();

console.log(data, error);

// Example: Get products in a category
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('category_id', 1);

console.log(data, error);

// Example: Get order with items
const { data, error } = await supabase
  .from('orders')
  .select(`
    *,
    order_items:order_items(
      *,
      product:products(product_id, title, image)
    )
  `)
  .eq('id', 1)
  .eq('user_id', 'user-id-here')
  .single();

console.log(data, error);
``` 