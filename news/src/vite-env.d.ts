/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_RSS2JSON_API_KEY?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
