/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RECEIVER_EMAIL: string;
  // VERCEL_ENV jest teraz obsługiwany przez __VERCEL_ENV__
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Deklaracja zmiennej globalnej zdefiniowanej w vite.config.ts
declare const __VERCEL_ENV__: string;
