# Ecommerce Supabase Next.js

A modern e-commerce application built with Next.js 15, React 19, TypeScript, and Supabase. This project features a beautiful UI using shadcn/ui components, Tailwind CSS v4, and includes comprehensive features like authentication, product management, cart functionality, and order processing.

## Features

- 🛍️ **Complete E-commerce Solution**: Product browsing, cart management, checkout process
- 🔐 **Authentication System**: Sign up, sign in, password reset with Supabase Auth
- 📱 **Responsive Design**: Mobile-first approach with Tailwind CSS v4
- 🎨 **Modern UI**: shadcn/ui components with Radix UI primitives
- 🔍 **Product Categories**: Electronics, Clothing, Accessories with dedicated pages
- 👤 **User Dashboard**: Profile management and order history
- 🛒 **Shopping Cart**: Persistent cart with real-time updates
- 💳 **Checkout Process**: Complete order flow with confirmation
- 📊 **Data Management**: TanStack Query for efficient data fetching and caching
- 🌙 **Dark Mode**: Theme switching with next-themes
- 📈 **Analytics**: Chart.js integration for dashboard analytics

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js (version 18 or higher)
- npm (version 9 or higher)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/ecommerce-supabase-next.git
   cd ecommerce-supabase-next
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
   ```

## Development

To start the development server:

```bash
npm run dev
```

This will start the Next.js development server with Turbo mode enabled. Open your browser and navigate to `http://localhost:3000` to view the application.

## Available Scripts

- `npm run dev`: Start the development server with Turbo mode
- `npm run build`: Build the application for production
- `npm run start`: Start the production server
- `npm run lint`: Run ESLint with Next.js configuration

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── (auth)/            # Authentication routes (signin, signup, reset-password)
│   ├── accessories/       # Accessories category page
│   ├── cart/              # Shopping cart page
│   ├── checkout/          # Checkout flow pages
│   ├── clothing/          # Clothing category page
│   ├── confirmation/      # Order confirmation page
│   ├── dashboard/         # User dashboard
│   ├── electronics/       # Electronics category page
│   ├── products/          # Product detail pages
│   ├── profile/           # User profile management
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page
├── components/            # Reusable React components
│   ├── checkout/          # Checkout-specific components
│   ├── dashboard/         # Dashboard components
│   └── ui/                # shadcn/ui components
├── context/               # React context providers
├── hooks/                 # Custom React hooks
│   └── queries/           # TanStack Query hooks
├── lib/                   # Library configurations and utilities
│   └── providers/         # Provider components
├── services/              # Service layer for API interactions
│   ├── address/           # Address management
│   ├── auth/              # Authentication services
│   ├── cart/              # Cart operations
│   ├── category/          # Category management
│   ├── order/             # Order processing
│   ├── product/           # Product operations
│   ├── profile/           # Profile management
│   └── review/            # Review system
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions and Supabase client setup
└── middleware.ts          # Next.js middleware for authentication
```

## Technologies Used

### Core Framework

- **Next.js 15** - React framework with App Router
- **React 19** - UI library with latest features
- **TypeScript** - Type-safe JavaScript

### Styling & UI

- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **Radix UI** - Headless UI primitives
- **next-themes** - Theme switching support
- **Lucide React** - Beautiful icon library

### Backend & Data

- **Supabase** - Backend-as-a-Service (Auth, Database, Storage)
- **@supabase/ssr** - Server-side rendering support
- **TanStack Query** - Data fetching and caching
- **Zod** - Schema validation

### Developer Experience

- **TanStack Form** - Type-safe form handling
- **Sonner** - Toast notifications
- **Chart.js** - Data visualization
- **ESLint** - Code linting with Next.js config

## Supabase Integration

This project uses Supabase for:

- **Authentication**: User sign up, sign in, password reset
- **Database**: Products, orders, user profiles, reviews
- **Row Level Security**: Data access control
- **Real-time subscriptions**: Live data updates

For detailed Supabase setup instructions, refer to the [SUPABASE_GUIDE.md](./SUPABASE_GUIDE.md) file.

## Key Features Implementation

### Authentication Flow

- Protected routes with middleware
- Social authentication support
- Password reset functionality
- Session management with SSR

### E-commerce Features

- Product catalog with categories
- Shopping cart with persistence
- Checkout process with order tracking
- User dashboard with order history
- Product reviews and ratings

### Performance Optimizations

- Next.js App Router for optimal loading
- TanStack Query for efficient data caching
- Image optimization with Next.js Image
- Turbo mode for faster development

## Configuration Files

- `next.config.mjs`: Next.js configuration with image optimization
- `tsconfig.json`: TypeScript configuration
- `postcss.config.js`: PostCSS configuration for Tailwind
- `tailwind.config.js`: Tailwind CSS v4 configuration
- `components.json`: shadcn/ui component configuration
- `eslint.config.js`: ESLint configuration with Next.js rules

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
