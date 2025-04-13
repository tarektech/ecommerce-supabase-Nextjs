# Project Documentation

## Introduction

This is the documentation for our e-commerce application built with React, Vite and Supabase. The application allows users to create accounts, browse products, place orders, and manage their profiles.

## Getting Started

To run the project locally:

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file based on `.env.example`
4. Start the development server with `npm run dev`

## Documentation Index

### Core Documentation

- [Architecture Overview](./architecture.md): Overall system architecture and code organization
- [Database Schema](./schema.md): Database tables, relationships, and Row-Level Security policies
- [API Documentation](./api.md): API endpoints, data flow, and error handling

### Additional Resources

- [Supabase Documentation](https://supabase.com/docs): Official documentation for Supabase
- [React Documentation](https://reactjs.org/docs/getting-started.html): Official React documentation
- [Vite Documentation](https://vitejs.dev/guide/): Vite build tool documentation
- [Tailwind CSS Documentation](https://tailwindcss.com/docs): Tailwind CSS styling documentation
- [shadcn/ui Documentation](https://ui.shadcn.com/docs): UI component library documentation

## Common Tasks

### Adding a New Page

1. Create a new component in `src/pages/`
2. Add the route to `src/App.tsx`
3. Link to the page from the navigation component

### Creating a New Database Table

1. Create the table in Supabase
2. Add appropriate RLS policies
3. Add the table schema to [Database Schema](./schema.md)
4. Create a new file in `src/db/` for table operations
5. Update the TypeScript types in `src/types.ts`

### Implementing a New Feature

1. Identify the components, hooks, and database operations needed
2. Create or update the necessary files
3. Add tests for the new functionality
4. Update documentation

## Troubleshooting

### Common Issues

#### Authentication Problems

- Check browser console for JWT errors
- Ensure RLS policies are correctly configured
- Verify that the user has the correct permissions

#### Database Errors

- Check RLS policies if seeing permission denied errors
- Verify data types match the schema
- Look for missing required fields

#### UI Issues

- Check component props and types
- Verify CSS classes are applied correctly
- Check for responsive design issues

## Contributing

Please follow these guidelines when contributing to the project:

1. Follow the established code style and patterns
2. Add tests for new functionality
3. Update documentation for significant changes
4. Use pull requests for all changes

## Maintenance

### Regular Tasks

- Update dependencies monthly
- Review and test RLS policies
- Monitor Supabase usage and performance 