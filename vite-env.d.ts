interface ImportMetaEnv {
  readonly VITE_RECEIVER_EMAIL: string;
  readonly VERCEL_ENV: string;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}