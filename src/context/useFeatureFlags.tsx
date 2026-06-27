import React, { createContext, type ReactNode, useContext } from "react";

const LOCAL_STORAGE_PREFIX = "lxdui_ff_";

interface FeatureFlagContextType {
  isOverviewEnabled: () => boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(
  undefined,
);

export const FeatureFlagProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const isFeatureEnabled = (flag: string): boolean => {
    return localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${flag}`) === "true";
  };

  return (
    <FeatureFlagContext.Provider
      value={{
        isOverviewEnabled: () => isFeatureEnabled("OVERVIEW"),
      }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error("useFeatureFlags must be used within FeatureFlagProvider");
  }
  return context;
};
