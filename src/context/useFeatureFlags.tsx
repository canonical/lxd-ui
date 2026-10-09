import React, { createContext, type ReactNode, useContext } from "react";

type FeatureFlagContextType = Record<string, never>;

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(
  undefined,
);

export const FeatureFlagProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <FeatureFlagContext.Provider value={{}}>
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
