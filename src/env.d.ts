/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly MISTRAL_API_KEY: string;
  readonly DEEPL_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
