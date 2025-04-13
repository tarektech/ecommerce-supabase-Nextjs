# E-Commerce Database Schema

This document outlines the database schema for our e-commerce application, explaining how tables are connected and their relationships.

## Tables Overview

Our database consists of the following tables:
- Products
- Profiles
- Addresses
- Categories
- Orders
- OrderItems
- Reviews

## Entity Relationship Diagram

```
Profiles 1──┐
  │         │
  │         │
  │         ▼
  │       Addresses
  │
  │         ▲
  │         │
  ├─────────┘
  │
  ▼
Orders ────┐
  │        │
  │        │
  │        ▼
  │    OrderItems ◄───┐
  │                   │
  ▼                   │
Reviews ────┐          │
            │          │
            ▼          │
         Products ◄────┘
            │
            │
            ▼
         Categories
```

## Table Schemas

### profiles
| Column       | Type         | Nullable | Default     | Description                   |
|--------------|--------------|----------|-------------|-------------------------------|
| profile_id   | UUID         | NO       | auth.uid()  | Primary key                   |
| username     | TEXT         | YES      | NULL        | User's display name           |
| email        | VARCHAR(255) | YES      | ''          | User's profile email          |
| avatar_url   | TEXT         | YES      | NULL        | URL to user's avatar image    |
| created_at   | TIMESTAMPTZ  | NO       | now()       | When the profile was created  |

### products
| Column       | Type         | Nullable | Default           | Description                   |
|--------------|--------------|----------|-------------------|-------------------------------|
| product_id   | UUID         | NO       | gen_random_uuid() | Primary key                   |
| title        | VARCHAR      | NO       | NULL              | Product title                 |
| description  | TEXT         | NO       | NULL              | Product description           |
| price        | NUMERIC      | NO       | NULL              | Product price (> 0)           |
| image        | VARCHAR      | YES      | NULL              | URL to product image          |
| stock        | INTEGER      | NO       | 0                 | Available stock (>= 0)        |
| sku          | VARCHAR      | YES      | NULL              | Stock keeping unit            |
| category_id  | INTEGER      | YES      | NULL              | Foreign key to categories     |
| created_at   | TIMESTAMPTZ  | YES      | CURRENT_TIMESTAMP | Creation timestamp            |
| updated_at   | TIMESTAMPTZ  | YES      | CURRENT_TIMESTAMP | Last update timestamp         |

### categories
| Column       | Type         | Nullable | Default | Description                        |
|--------------|--------------|----------|---------|----------------------------------- |
| id           | SERIAL       | NO       | NULL    | Primary key                        |
| name         | VARCHAR      | NO       | NULL    | Category name                      |
| description  | TEXT         | NO       | NULL    | Category description               |
| parent_id    | INTEGER      | YES      | NULL    | Self-reference for nested categories |

### addresses
| Column          | Type         | Nullable | Default | Description                        |
|-----------------|--------------|----------|---------|----------------------------------- |
| id              | SERIAL       | NO       | NULL    | Primary key                        |
| user_id         | UUID         | NO       | NULL    | Reference to profile_id            |
| street          | VARCHAR      | NO       | NULL    | Street address                     |
| city            | VARCHAR      | NO       | NULL    | City                               |
| state           | VARCHAR      | YES      | NULL    | State/province                     |
| zip_code        | VARCHAR      | NO       | NULL    | Postal/zip code                    |
| country         | VARCHAR      | NO       | NULL    | Country                            |
| is_default      | BOOLEAN      | YES      | FALSE   | Whether this is the default address |

### orders
| Column              | Type           | Nullable | Default     | Description                     |
|--------------------|----------------|----------|-------------|---------------------------------|
| id                 | SERIAL         | NO       | NULL        | Primary key                     |
| user_id            | UUID           | NO       | NULL        | Reference to profile_id         |
| status             | order_status   | YES      | 'pending'   | Order status (enum)             |
| total              | NUMERIC        | NO       | NULL        | Total amount (>= 0)             |
| shipping_address_id| INTEGER        | NO       | NULL        | Reference to addresses          |
| payment_method     | VARCHAR        | YES      | NULL        | Payment method used             |
| payment_id         | VARCHAR        | YES      | NULL        | Payment provider reference      |
| created_at         | TIMESTAMPTZ    | YES      | CURRENT_TIMESTAMP | Creation timestamp        |
| updated_at         | TIMESTAMPTZ    | YES      | CURRENT_TIMESTAMP | Last update timestamp     |

### order_items
| Column       | Type         | Nullable | Default | Description                         |
|--------------|--------------|----------|---------|-------------------------------------|
| id           | SERIAL       | NO       | NULL    | Primary key                         |
| order_id     | INTEGER      | NO       | NULL    | Reference to orders                 |
| product_id   | UUID         | NO       | NULL    | Reference to products               |
| quantity     | INTEGER      | NO       | NULL    | Quantity ordered (> 0)              |
| price        | NUMERIC      | NO       | NULL    | Unit price at time of purchase (>= 0)|

### reviews
| Column       | Type         | Nullable | Default           | Description                    |
|--------------|--------------|----------|-------------------|--------------------------------|
| id           | SERIAL       | NO       | NULL              | Primary key                    |
| product_id   | UUID         | NO       | NULL              | Reference to products          |
| user_id      | UUID         | NO       | NULL              | Reference to profiles          |
| rating       | INTEGER      | NO       | NULL              | Rating (1-5)                   |
| comment      | TEXT         | YES      | NULL              | Review text                    |
| created_at   | TIMESTAMPTZ  | YES      | CURRENT_TIMESTAMP | Creation timestamp             |

## Custom Types

### order_status
An ENUM type with the following values:
- 'pending'
- 'processing'
- 'shipped'
- 'delivered'
- 'cancelled'

## Foreign Key Relationships

1. `profiles.profile_id` → `auth.users.id` (One-to-One)
2. `addresses.user_id` → `profiles.profile_id` (Many-to-One)
3. `orders.user_id` → `profiles.profile_id` (Many-to-One)
4. `orders.shipping_address_id` → `addresses.id` (Many-to-One)
5. `order_items.order_id` → `orders.id` (Many-to-One, CASCADE on delete)
6. `order_items.product_id` → `products.product_id` (Many-to-One, RESTRICT on delete)
7. `reviews.user_id` → `profiles.profile_id` (Many-to-One)
8. `reviews.product_id` → `products.product_id` (Many-to-One, CASCADE on delete)
9. `products.category_id` → `categories.id` (Many-to-One, SET NULL on delete)
10. `categories.parent_id` → `categories.id` (Self-referencing, SET NULL on delete)

## Indexes

- `idx_products_category`: Index on `products.category_id`
- `idx_orders_user`: Index on `orders.user_id`
- `idx_order_items_order`: Index on `order_items.order_id`
- `idx_order_items_product`: Index on `order_items.product_id`
- `idx_reviews_product`: Index on `reviews.product_id`
- `idx_reviews_user`: Index on `reviews.user_id`
- `idx_addresses_user`: Index on `addresses.user_id`
- `idx_profiles_email`: Index on `profiles.email`

## Common Queries

### Get all products in a category
```sql
SELECT * FROM products WHERE category_id = [category_id];
```

### Get all orders for a user
```sql
SELECT * FROM orders WHERE user_id = [user_id];
```

### Get all items in an order with product details
```sql
SELECT oi.*, p.title, p.image 
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
WHERE oi.order_id = [order_id];
```

### Get all reviews for a product
```sql
SELECT r.*, p.username
FROM reviews r
JOIN profiles p ON r.user_id = p.profile_id
WHERE r.product_id = [product_id];
```

### Get user's default shipping address
```sql
SELECT * FROM addresses
WHERE user_id = [user_id] AND is_default = true;
``` 