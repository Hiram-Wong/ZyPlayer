/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_SERVER_PORT: number;
  readonly VITE_API_SERVER_HOST: string;
  readonly VITE_CLIENT_PORT: number;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
