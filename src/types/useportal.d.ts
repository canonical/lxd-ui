declare module "react-useportal" {
  import { BaseSyntheticEvent, ComponentClass } from "react";

  export interface returnType {
    openPortal: (e: BaseSyntheticEvent) => void;
    closePortal: () => void;
    isOpen: boolean;
    Portal: ComponentClass;
  }
  export default function usePortal(): returnType;
}
