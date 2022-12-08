import { useSearchParams } from "react-router-dom";

export interface PanelHelper {
  panel: string | null;
  instance: string | null;
  clear: () => void;
  openInstanceFormGuided: () => void;
  openInstanceFormYaml: (instance?: string) => void;
  openImageImport: () => void;
  openProfileForm: () => void;
}

export const panels = {
  instanceFormGuided: "instance-form-guided",
  instanceFormYaml: "instance-form-yaml",
  imageImport: "image-import",
  profileForm: "profile-form",
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

    openProfileForm: () => {
      setPanelParams(panels.profileForm);
    },
  };
};

export default usePanelParams;
