import React, {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

interface ContextProps {
  menuCollapsed: boolean;
  setMenuCollapsed: Dispatch<SetStateAction<boolean>>;
}

const initialState: ContextProps = {
  menuCollapsed: false,
  setMenuCollapsed: () => undefined,
};

export const MenuCollapsedContext = createContext<ContextProps>(initialState);

interface ProviderProps {
  children: ReactNode;
}

export const MenuCollapsedProvider: FC<ProviderProps> = ({ children }) => {
  const [menuCollapsed, setMenuCollapsed] = useState(false);

  return (
    <MenuCollapsedContext.Provider
      value={{
        menuCollapsed,
        setMenuCollapsed,
      }}
    >
      {children}
    </MenuCollapsedContext.Provider>
  );
};

export function useMenuCollapsed() {
  return useContext(MenuCollapsedContext);
}
