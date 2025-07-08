import { Info } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="flex w-full justify-center border-b bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-center text-sm text-white">
      <div className="mx-auto flex max-w-4xl items-center justify-center gap-2">
        <Info className="h-4 w-4 flex-shrink-0" />
        <span className="font-medium">🚀 Demo E-Commerce Website</span>
        <span className="hidden sm:flex">
          | Built with Next.js & Supabase Database
        </span>
      
      </div>
    </div>
  );
}
