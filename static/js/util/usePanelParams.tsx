import { useSearchParams } from "react-router-dom";

export interface PanelHelper {
  panel: string | null;
  image: string | null;
  instance: string | null;
  clear: () => void;
  openInstanceForm: (image?: string) => void;
  openImageImport: () => void;
  openSnapshots: (instanceName: string) => void;
}

export const panels = {
  instanceForm: "instance-form",
  imageImport: "image-import",
  snapshots: "snapshots",
};

type ParamMap = {
  [key: string]: string;
};

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

    openInstanceForm: (image) => {
      setPanelParams(panels.instanceForm, image ? { image } : {});
    },

    openImageImport: () => {
      setPanelParams(panels.imageImport);
    },

    openSnapshots: (instanceName) => {
      setPanelParams(panels.snapshots, { instance: instanceName });
    },
  };
};

export default usePanelParams;
