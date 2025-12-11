// Manual declarations replacement for missing vite/client types
// This fixes the "Cannot find type definition file for 'vite/client'" error

declare module '*.css';
declare module '*.png';
declare module '*.svg';
declare module '*.jpeg';
declare module '*.jpg';

interface ImportMetaEnv {
  readonly VITE_RECEIVER_EMAIL: string;
  // Pozwalamy na dowolne inne klucze, żeby nie blokować builda
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Deklaracja zmiennej globalnej zdefiniowanej w vite.config.ts
declare const __VERCEL_ENV__: string;
