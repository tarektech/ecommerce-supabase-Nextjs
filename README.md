# Ecommerce Supabase Vite

A modern e-commerce application built with React, Vite, TypeScript, and Supabase. This project features a beautiful UI using shadcn/ui components and Tailwind CSS.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js (version 18 or higher)
- npm (version 9 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ecommerce-supabase-vite.git
   cd ecommerce-supabase-vite
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL="your-supabase-url"
   VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
   ```

## Development

To start the development server:

```bash
npm run dev
```

This will start the Vite development server. Open your browser and navigate to `http://localhost:5173` to view the application.

## Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run preview`: Preview the production build locally
- `npm run lint`: Run ESLint to check for code quality and style issues

## Project Structure

```
src/
├── components/     # Reusable React components
├── context/       # React context providers
├── lib/          # Utility functions and helpers
├── services/     # Service layer for API interactions
├── utils/        # Utility functions including Supabase client setup
├── pages/        # Application pages and routes
└── App.tsx       # Main application component
```

## Technologies Used

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Supabase (Auth, Database, Storage)
- React Router DOM
- Radix UI primitives
- Lucide React icons
- Sonner for toast notifications

## Configuration Files

- `tsconfig.json`: TypeScript configuration
- `vite.config.ts`: Vite configuration
- `postcss.config.js`: PostCSS configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `eslint.config.js`: ESLint configuration

## Supabase Integration

This project uses Supabase for:
- Authentication
- Database
- Storage

For detailed Supabase setup instructions, refer to the [SUPABASE_GUIDE.md](./SUPABASE_GUIDE.md) file.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.