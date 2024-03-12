import { useSearchParams } from "react-router-dom";
import {
  decodeIdentityNameFromUrl,
  encodeIdentityNameForUrl,
} from "./permissions";
import { LxdIdentity } from "types/permissions";

export interface PanelHelper {
  panel: string | null;
  instance: string | null;
  profile: string | null;
  project: string;
  identities: string[] | null;
  clear: () => void;
  openInstanceSummary: (instance: string, project: string) => void;
  openImageImport: () => void;
  openProfileSummary: (profile: string, project: string) => void;
  openIdentityGroups: (identities: LxdIdentity[]) => void;
  updatePanelParams: (key: string, value: string) => void;
}

export const panels = {
  instanceSummary: "instance-summary",
  imageImport: "image-import",
  profileSummary: "profile-summary",
  identityGroups: "identity-groups",
};

type ParamMap = Record<string, string>;

const usePanelParams = (): PanelHelper => {
  const [params, setParams] = useSearchParams();

  const craftResizeEvent = () => {
    setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
  };

  const setPanelParams = (panel: string, args: ParamMap = {}) => {
    const newParams = new URLSearchParams();
    newParams.set("panel", panel);
    for (const [key, value] of Object.entries(args)) {
      newParams.set(key, value);
    }
    setParams(newParams);
    craftResizeEvent();
  };

  const clearParams = () => {
    setParams(new URLSearchParams());
    craftResizeEvent();
  };

  return {
    panel: params.get("panel"),
    instance: params.get("instance"),
    profile: params.get("profile"),
    project: params.get("project") ?? "default",
    // identity name can be email or fingerprint which contains invalid chars for uri that needs to be transformed
    identities:
      params
        .get("identities")
        ?.split(",")
        .map((name) => decodeIdentityNameFromUrl(name)) || null,

    clear: () => {
      clearParams();
    },

    openInstanceSummary: (instance, project) => {
      setPanelParams(panels.instanceSummary, { instance, project });
    },

    openImageImport: () => {
      setPanelParams(panels.imageImport);
    },

    openProfileSummary: (profile, project) => {
      setPanelParams(panels.profileSummary, { profile, project });
    },

    openIdentityGroups: (identities: LxdIdentity[]) => {
      const identityNames = identities
        .map((identity) => encodeIdentityNameForUrl(identity.name))
        .join(",");
      setPanelParams(panels.identityGroups, { identities: identityNames });
    },

    updatePanelParams: (key: string, value: string) => {
      const newParams = new URLSearchParams(params);
      newParams.set(key, value);
      if (!value) {
        newParams.delete(key);
      }
      setParams(newParams);
    },
  };
};

export default usePanelParams;
