import { BaseSyntheticEvent, ComponentClass } from "react";

declare module "react-useportal" {
  export interface returnType {
    openPortal: (e: BaseSyntheticEvent) => void;
    closePortal: () => void;
    isOpen: boolean;
    Portal: ComponentClass;
  }
  export default function usePortal(): returnType;
}
