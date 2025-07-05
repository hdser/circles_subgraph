/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUBGRAPH_URL: string
  readonly VITE_BLOCK_EXPLORER_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}