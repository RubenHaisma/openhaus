"use client";
import { ClerkProvider } from "@clerk/nextjs";

export function ClerkProviders({ children }: { children: React.ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>;
} 