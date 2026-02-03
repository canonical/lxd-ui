declare global {
  interface Window {
    ROOT_PATH: string;
  }
}

export const ROOT_PATH =
  typeof window !== "undefined" ? window?.ROOT_PATH || "" : "";
