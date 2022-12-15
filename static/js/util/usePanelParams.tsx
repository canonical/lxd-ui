import { useSearchParams } from "react-router-dom";

export interface PanelHelper {
  panel: string | null;
  instance: string | null;
  profile: string | null;
  clear: () => void;
  openInstanceFormGuided: () => void;
  openInstanceFormYaml: (instance?: string) => void;
  openImageImport: () => void;
  openProfileFormGuided: () => void;
  openProfileFormYaml: (profile?: string) => void;
}

export const panels = {
  instanceFormGuided: "instance-form-guided",
  instanceFormYaml: "instance-form-yaml",
  imageImport: "image-import",
  profileFormGuided: "profile-form-guided",
  profileFormYaml: "profile-form-yaml",
};

type ParamMap = Record<string, string>;

const usePanelParams = (): PanelHelper => {
  const [params, setParams] = useSearchParams();

  const setPanelParams = (panel: string, args: ParamMap = {}) => {
    const newParams = new URLSearchParams();
    newParams.set("panel", panel);
    for (const [key, value] of Object.entries(args)) {
      newParams.set(key, value);
    }
    setParams(newParams);
  };

  return {
    panel: params.get("panel"),
    instance: params.get("instance"),
    profile: params.get("profile"),

    clear: () => {
      setParams(new URLSearchParams());
    },

    openInstanceFormGuided: () => {
      setPanelParams(panels.instanceFormGuided);
    },

    openInstanceFormYaml: (instance) => {
      setPanelParams(panels.instanceFormYaml, instance ? { instance } : {});
    },

    openImageImport: () => {
      setPanelParams(panels.imageImport);
    },

    openProfileFormGuided: () => {
      setPanelParams(panels.profileFormGuided);
    },

    openProfileFormYaml: (profile) => {
      setPanelParams(panels.profileFormYaml, profile ? { profile } : {});
    },
  };
};

export default usePanelParams;
