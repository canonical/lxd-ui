import type { ReactNode, SyntheticEvent } from "react";
import { createContext, useContext, useState, useCallback } from "react";
import { usePortal } from "@canonical/react-components";

export interface ModalType {
  showModal: (content: ReactNode, event?: SyntheticEvent<HTMLElement>) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalType>({
  showModal: () => {},
  hideModal: () => {},
});

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<ReactNode | null>(null);
  const { openPortal, closePortal, isOpen, Portal } = usePortal({
    programmaticallyOpen: true,
  });

  const showModal = useCallback((content: ReactNode) => {
    setContent(content);
    openPortal();
  }, []);

  const hideModal = useCallback(() => {
    closePortal();
  }, []);

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {isOpen && <Portal>{content}</Portal>}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
