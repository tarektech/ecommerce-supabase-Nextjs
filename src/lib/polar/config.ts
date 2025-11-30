import { Polar } from "@polar-sh/sdk";

// Environment configuration for Polar
const POLAR_ACCESS_TOKEN = process.env.POLAR_ACCESS_TOKEN || "";
const POLAR_SERVER = (process.env.NEXT_PUBLIC_POLAR_SERVER || "sandbox") as
  | "production"
  | "sandbox";
const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET || "";

if (!POLAR_ACCESS_TOKEN) {
  console.warn(
    "POLAR_ACCESS_TOKEN is not set. Polar integration will not work.",
  );
}

// Initialize Polar SDK client
export const polar = new Polar({
  accessToken: POLAR_ACCESS_TOKEN,
  server: POLAR_SERVER,
});

export { POLAR_WEBHOOK_SECRET, POLAR_SERVER };



