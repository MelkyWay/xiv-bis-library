declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_DEPLOYED_AT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
