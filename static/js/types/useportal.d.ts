import { ComponentClass } from "react";

declare module "react-useportal" {
  export interface returnType {
    openPortal: () => void;
    closePortal: () => void;
    isOpen: boolean;
    Portal: ComponentClass;
  }
  export default function usePortal(): returnType;
}
