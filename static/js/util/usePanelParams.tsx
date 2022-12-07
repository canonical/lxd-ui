import { useSearchParams } from "react-router-dom";

export interface PanelHelper {
  panel: string | null;
  image: string | null;
  instance: string | null;
  clear: () => void;
  openInstanceFormGuided: (image?: string) => void;
  openInstanceFormYaml: (image?: string) => void;
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
    image: params.get("image"),
    instance: params.get("instance"),

    clear: () => {
      setParams(new URLSearchParams());
    },

    openInstanceFormGuided: (image) => {
      setPanelParams(panels.instanceFormGuided, image ? { image } : {});
    },

    openInstanceFormYaml: (image) => {
      setPanelParams(panels.instanceFormYaml, image ? { image } : {});
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
