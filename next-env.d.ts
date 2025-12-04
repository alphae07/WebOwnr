/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// Global Next.js Typing Fix

declare module "next" {
  export interface PageProps {
    params?: Record<string, unknown>;
    searchParams?: Record<string, unknown>;
  }
}
