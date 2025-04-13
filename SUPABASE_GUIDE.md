# Supabase Integration Guide

This guide explains how to integrate Supabase authentication and database functionality into your React application.

## Setting Up Supabase

1. Sign up for a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project in Supabase dashboard
3. Get your project URL and anon key from the project settings
4. Update the `src/lib/supabase.ts` file with your project URL and anon key:

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Database Setup

1. Go to the SQL Editor in your Supabase dashboard
2. Execute the SQL queries provided in the database schema to create the necessary tables
3. Apply the RLS (Row Level Security) policies to secure your data

The main tables in your application are:
- Products
- Users
- Addresses
- Categories
- Orders
- OrderItems
- Reviews

## Authentication Flow

The application includes a complete authentication system with:
- Sign Up form (`/sign-up`)
- Sign In form (`/sign-in`)
- Profile page (protected route at `/profile`)
- Sign Out functionality

Authentication state is managed through the `AuthContext` provider, which:
- Initializes and tracks the user session
- Provides sign-in, sign-up, and sign-out methods
- Makes authentication state available throughout the app

## Fetching Data from Supabase

The application includes a product service that demonstrates how to fetch data:

```ts
// Example: Fetching products
const { data, error } = await supabase
  .from('Products')
  .select('*');
```

For more complex queries with relationships:

```ts
// Example: Fetching orders with related items and products
const { data, error } = await supabase
  .from('Orders')
  .select(`
    id,
    total,
    status,
    createdAt,
    OrderItems (
      id,
      quantity,
      price,
      Products (
        id,
        title,
        image
      )
    )
  `)
  .eq('userId', user.id)
  .order('createdAt', { ascending: false });
```

## Row Level Security (RLS)

The application uses Supabase's Row Level Security to ensure users can only access:
- Their own user data
- Their own orders and addresses
- Public product and category data

Make sure to apply the RLS policies from the database schema document to your Supabase project.

## Testing the Integration

1. Start your application with `npm run dev`
2. Try signing up a new user
3. Sign in with the user credentials
4. Browse products from the Supabase database
5. Add products to the cart
6. Access the profile page to view user information

## Troubleshooting

- Check the browser console for any errors
- Verify that your Supabase URL and anon key are correct
- Ensure that the necessary tables are created in your Supabase project
- Make sure RLS policies are properly configured 