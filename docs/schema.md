# Database Schema Documentation

## Overview

This document outlines the database schema for our e-commerce application. We use Supabase (PostgreSQL) as our database provider.

## Tables

### profiles

Stores user profile information.

| Column       | Type         | Description                              | Constraints       |
|--------------|--------------|------------------------------------------|------------------|
| profile_id   | UUID         | Primary key, matches Supabase auth.uid() | PK, NOT NULL     |
| username     | TEXT         | User's display name                      | NULL allowed     |
| avatar_url   | TEXT         | URL to user's avatar image               | NULL allowed     |
| created_at   | TIMESTAMPTZ  | When the profile was created             | NOT NULL, DEFAULT now() |

#### RLS Policies
- Users can insert their own profile: `auth.uid() = profile_id`
- Users can view their own profile: `auth.uid() = profile_id`
- Users can update their own profile: `auth.uid() = profile_id`

### products

Stores product information.

| Column       | Type         | Description                              | Constraints       |
|--------------|--------------|------------------------------------------|------------------|
| product_id   | UUID         | Primary key                              | PK, NOT NULL, DEFAULT gen_random_uuid() |
| title        | VARCHAR      | Product title                            | NOT NULL        |
| description  | TEXT         | Product description                      | NOT NULL        |
| price        | NUMERIC      | Product price                            | NOT NULL, CHECK (price > 0) |
| image        | VARCHAR      | URL to product image                     | NULL allowed     |
| stock        | INTEGER      | Available stock                          | NOT NULL, DEFAULT 0, CHECK (stock >= 0) |
| sku          | VARCHAR      | Stock keeping unit                       | NULL allowed     |
| category_id  | INTEGER      | Reference to categories.id               | FK, NULL allowed |
| created_at   | TIMESTAMPTZ  | When the product was created             | DEFAULT CURRENT_TIMESTAMP |
| updated_at   | TIMESTAMPTZ  | When the product was last updated        | DEFAULT CURRENT_TIMESTAMP |

#### RLS Policies
- Everyone can view products: `true`
- Only admins can insert/update/delete products: `auth.uid() IN (SELECT profile_id FROM admin_users)`

### categories

Stores product categories.

| Column       | Type         | Description                              | Constraints       |
|--------------|--------------|------------------------------------------|------------------|
| id           | SERIAL       | Primary key                              | PK, NOT NULL     |
| name         | VARCHAR      | Category name                            | NOT NULL        |
| description  | TEXT         | Category description                     | NOT NULL        |
| parent_id    | INTEGER      | Reference to parent category             | FK (self), NULL allowed |

#### RLS Policies
- Everyone can view categories: `true`
- Only admins can insert/update/delete categories: `auth.uid() IN (SELECT profile_id FROM admin_users)`

### addresses

Stores user addresses.

| Column       | Type         | Description                              | Constraints       |
|--------------|--------------|------------------------------------------|------------------|
| id           | SERIAL       | Primary key                              | PK, NOT NULL     |
| user_id      | UUID         | Reference to profiles.profile_id         | FK, NOT NULL     |
| street       | VARCHAR      | Street address                           | NOT NULL        |
| city         | VARCHAR      | City                                     | NOT NULL        |
| state        | VARCHAR      | State/province                           | NULL allowed     |
| zip_code     | VARCHAR      | Postal/zip code                          | NOT NULL        |
| country      | VARCHAR      | Country                                  | NOT NULL        |
| is_default   | BOOLEAN      | Whether this is the default address      | DEFAULT FALSE    |

#### RLS Policies
- Users can view/insert/update their own addresses: `auth.uid() = user_id`

### orders

Stores order information.

| Column              | Type          | Description                        | Constraints       |
|--------------------|----------------|------------------------------------|--------------------|
| id                 | SERIAL        | Primary key                         | PK, NOT NULL       |
| user_id            | UUID          | Reference to profiles.profile_id    | FK, NOT NULL       |
| status             | order_status  | Order status (enum)                 | DEFAULT 'pending'  |
| total              | NUMERIC       | Total amount of the order           | NOT NULL, CHECK (total >= 0) |
| shipping_address_id| INTEGER       | Reference to addresses.id           | FK, NOT NULL       |
| payment_method     | VARCHAR       | Payment method used                 | NULL allowed       |
| payment_id         | VARCHAR       | Payment provider reference ID       | NULL allowed       |
| created_at         | TIMESTAMPTZ   | When the order was created          | DEFAULT CURRENT_TIMESTAMP |
| updated_at         | TIMESTAMPTZ   | When the order was last updated     | DEFAULT CURRENT_TIMESTAMP |

#### RLS Policies
- Users can insert their own orders: `auth.uid() = user_id`
- Users can view their own orders: `auth.uid() = user_id`

### order_items

Stores items in an order.

| Column       | Type         | Description                              | Constraints       |
|--------------|--------------|------------------------------------------|------------------|
| id           | SERIAL       | Primary key                              | PK, NOT NULL     |
| order_id     | INTEGER      | Reference to orders.id                   | FK, NOT NULL     |
| product_id   | UUID         | Reference to products.product_id         | FK, NOT NULL     |
| quantity     | INTEGER      | Quantity of the product                  | NOT NULL, CHECK (quantity > 0) |
| price        | NUMERIC      | Price of the product at time of purchase | NOT NULL, CHECK (price >= 0) |

#### RLS Policies
- Users can view their own order items: `auth.uid() = (SELECT user_id FROM orders WHERE id = order_id)`
- Users can insert items into their own orders: `auth.uid() = (SELECT user_id FROM orders WHERE id = order_id)`

### reviews

Stores product reviews.

| Column       | Type         | Description                              | Constraints       |
|--------------|--------------|------------------------------------------|------------------|
| id           | SERIAL       | Primary key                              | PK, NOT NULL     |
| product_id   | UUID         | Reference to products.product_id         | FK, NOT NULL     |
| user_id      | UUID         | Reference to profiles.profile_id         | FK, NOT NULL     |
| rating       | INTEGER      | Rating (1-5)                             | NOT NULL, CHECK (rating BETWEEN 1 AND 5) |
| comment      | TEXT         | Review text                              | NULL allowed     |
| created_at   | TIMESTAMPTZ  | When the review was created              | DEFAULT CURRENT_TIMESTAMP |

#### RLS Policies
- Everyone can view reviews: `true`
- Users can insert/update their own reviews: `auth.uid() = user_id`

## Custom Types

### order_status
An ENUM type with the following values:
- 'pending'
- 'processing'
- 'shipped'
- 'delivered'
- 'cancelled'

## Relationships

- `profiles.profile_id` ← `orders.user_id`: A user can have many orders
- `profiles.profile_id` ← `addresses.user_id`: A user can have many addresses
- `profiles.profile_id` ← `reviews.user_id`: A user can write many reviews
- `addresses.id` ← `orders.shipping_address_id`: An address can be used for many orders
- `orders.id` ← `order_items.order_id`: An order can have many order items (CASCADE on delete)
- `products.product_id` ← `order_items.product_id`: A product can be in many order items (RESTRICT on delete)
- `products.product_id` ← `reviews.product_id`: A product can have many reviews (CASCADE on delete)
- `categories.id` ← `products.category_id`: A category can have many products (SET NULL on delete)
- `categories.id` ← `categories.parent_id`: A category can have subcategories (SET NULL on delete)

## Indexes

- `idx_products_category`: Index on `products.category_id`
- `idx_orders_user`: Index on `orders.user_id`
- `idx_order_items_order`: Index on `order_items.order_id`
- `idx_order_items_product`: Index on `order_items.product_id`
- `idx_reviews_product`: Index on `reviews.product_id`
- `idx_reviews_user`: Index on `reviews.user_id`
- `idx_addresses_user`: Index on `addresses.user_id`

## Notes on Security

- All tables have Row Level Security (RLS) enabled
- Policies are designed to ensure users can only access their own data
- Product and category data is publicly readable but protected for writes
- Only administrators can create or modify products and categories 