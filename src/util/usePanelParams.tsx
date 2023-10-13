import { useSearchParams } from "react-router-dom";

export interface PanelHelper {
  panel: string | null;
  instance: string | null;
  profile: string | null;
  project: string;
  clear: () => void;
  openInstanceSummary: (instance: string, project: string) => void;
  openImageImport: () => void;
  openProfileSummary: (profile: string, project: string) => void;
}

export const panels = {
  instanceSummary: "instance-summary",
  imageImport: "image-import",
  profileSummary: "profile-summary",
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
  };
};

export default usePanelParams;
