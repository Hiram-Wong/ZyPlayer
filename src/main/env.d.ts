/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_MAIN_BUNDLE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
