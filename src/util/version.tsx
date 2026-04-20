export const RECENT_MAJOR_SERVER_VERSION = 5;
export const UI_VERSION = "0.21";

// defined in vite.config.ts and injected at build time
declare const __UI_GIT_HASH__: string;
export const UI_GIT_HASH = __UI_GIT_HASH__ ?? "unknown";
