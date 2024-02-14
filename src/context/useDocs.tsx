import { useSupportedFeatures } from "./useSupportedFeatures";

export const useDocs = (): string => {
  const remoteBase = "https://documentation.ubuntu.com/lxd/en/latest";
  const localBase = "/documentation";

  const { hasLocalDocumentation } = useSupportedFeatures();

  if (!hasLocalDocumentation) {
    return remoteBase;
  }

  return localBase;
};
