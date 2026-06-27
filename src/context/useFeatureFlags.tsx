import React, { createContext, type ReactNode, useContext } from "react";

// To add a new feature flag, add it to the FeatureFlag type below
// For example: export type FeatureFlag = "OVERVIEW" | "NEW_FEATURE";
// Then add a corresponding function in the FeatureFlagProvider
// For example: const isNewFeatureEnabled = () => isFeatureEnabled("NEW_FEATURE");
export type FeatureFlag = "OVERVIEW";

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
  const isFeatureEnabled = (flag: FeatureFlag): boolean => {
    return localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${flag}`) === "true";
  };

  const isOverviewEnabled = () => isFeatureEnabled("OVERVIEW");

  return (
    <FeatureFlagContext.Provider value={{ isOverviewEnabled }}>
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
