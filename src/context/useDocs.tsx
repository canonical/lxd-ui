import { useSupportedFeatures } from "./useSupportedFeatures";

export const useDocs = (): string => {
  const remoteBase = "https://canonical.com/lxd/docs/latest";
  const localBase = "/documentation";

  const { hasLocalDocumentation } = useSupportedFeatures();

  if (!hasLocalDocumentation) {
    return remoteBase;
  }

  return localBase;
};
