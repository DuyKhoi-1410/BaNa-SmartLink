/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.PNG' {
  const src: string
  export default src
}

declare module '*.JPG' {
  const src: string
  export default src
}

declare module '*.JPEG' {
  const src: string
  export default src
}
