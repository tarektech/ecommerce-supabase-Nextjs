# Supabase Client Structure

This directory contains a structured approach to using Supabase in Next.js applications, properly handling both client and server-side usage.

## Files

- `client.ts` - Client-side Supabase client (for Client Components)
- `server.ts` - Server-side Supabase client (for Server Components)
- `index.ts` - Exports from both clients for convenience

## Usage

### In Client Components

```tsx
'use client';

import { supabase } from '@/lib/supabase/client';
// or
import { supabase } from '@/lib/supabase'; // via index

// Use directly in client components
const { data } = await supabase.from('table').select('*');
```

### In Server Components

```tsx
import { createServerSupabase } from '@/lib/supabase/server';
// or use helper functions
import { getAuthenticatedUser, getUserProfile } from '@/lib/supabase/server';

// In an async Server Component
export default async function Page() {
  // Option 1: Use helper functions
  const user = await getAuthenticatedUser();
  
  // Option 2: Create and use the client directly 
  const supabase = await createServerSupabase();
  const { data } = await supabase.from('table').select('*');
  
  return <div>...</div>;
}
```

## Benefits

This structure provides several benefits:

1. Clear separation between server and client usage
2. Type safety for database schema
3. Proper handling of cookies in server components
4. Helper functions for common operations
5. No duplicate code 