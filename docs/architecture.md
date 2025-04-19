# Architecture Documentation

## Overview

This document outlines the architecture and code organization of our e-commerce application built with React, Vite, and Supabase.

## Documentation Structure

Our documentation is organized into several key files:

- `README.md`: Project overview and getting started guide
- `architecture.md` (this file): System architecture and code organization
- `schema.md`: Database schema, relationships, and security policies
- `api.md`: API endpoints, data flow, and error handling

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth)
- **State Management**: React Context API
- **Routing**: React Router
- **Notifications**: sonner

## Directory Structure

```
src/
├── assets/           # Static assets like images
├── components/       # Reusable UI components
│   ├── ui/           # Base UI components from shadcn
│   └── ...           # App-specific components
├── context/          # React Context providers
├── db/               # Database access functions
├── hooks/            # Custom React hooks
├── layouts/          # Page layout components
├── pages/            # Route components
├── services/         # External service integrations
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── App.tsx           # Main application component
```

## Key Modules

### Authentication

Authentication is handled through the `AuthContext` provider which wraps Supabase Auth functionality.

**Files**:
- `src/context/AuthContext.tsx`: Context provider for auth state
- `src/hooks/useSupabaseAuth.tsx`: Hook that implements auth logic
- `src/db/auth.ts`: Database operations for auth-related functionality

### Profile Management

User profiles are managed through dedicated hooks and database functions.

**Files**:
- `src/hooks/useProfile.ts`: Hook for managing profile data
- `src/services/profileService.ts`: Service for profile-related database operations
- `src/pages/ProfilePage.tsx`: Profile page component
- `src/components/ProfileCard.tsx`: Profile display and edit component

### Error Handling

Centralized error handling approach for consistent user experience.

**Files**:
- `src/utils/errorHandling.ts`: Error utility functions
- Functions like `handleCommonErrors`, `isProfileAccessError`

## Data Flow

1. **User Authentication**:
   - User credentials → Supabase Auth → JWT token
   - JWT token used for subsequent API calls

2. **Data Fetching**:
   - React component → Custom hook → Database function → Supabase client → Database
   - Results flow back up the chain with error handling at each step

3. **State Management**:
   - Global state managed via Context API
   - Component-specific state managed with useState/useReducer

## Security

### Row-Level Security (RLS)

Supabase RLS policies ensure data access security:

- Users can only access their own profiles
- Users can only access their own orders
- Products are publicly readable but not writable by regular users

### JWT Authentication

Supabase JWT tokens are used to authenticate API requests, with automatic handling of token refresh.

## Performance Considerations

- React components organized to minimize unnecessary re-renders
- Data fetching optimized to minimize redundant requests
- Error boundaries used to prevent cascade failures

## Testing Strategy

- Component testing with React Testing Library
- API testing through manual verification
- End-to-end testing with browser automation tools

## Deployment

The application is deployed using [deployment platform] with the following workflow:

1. Code is pushed to main branch
2. CI/CD pipeline runs tests
3. Application is built
4. Application is deployed to hosting platform

## Extension Points

The architecture is designed to be extensible in these areas:

1. **Adding New Pages**: Create component in `pages/` and add route to Router
2. **New API Endpoints**: Add functions to appropriate files in `db/` directory
3. **New UI Components**: Add to `components/` following existing patterns
4. **New Features**: Consider whether it needs its own context, hooks, or service files

## Common Patterns

1. **Data Fetching**: Use custom hooks that call database functions
2. **Error Handling**: Use `handleCommonErrors` for consistent error processing
3. **Component Structure**: Follow the pattern of existing components
4. **Authentication Checks**: Use the `useAuth` hook to get current user state 