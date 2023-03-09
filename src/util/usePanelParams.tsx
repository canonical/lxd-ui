import { useSearchParams } from "react-router-dom";

export interface PanelHelper {
  panel: string | null;
  instance: string | null;
  profile: string | null;
  project: string;
  clear: () => void;
  openInstanceSummary: (instance: string, project: string) => void;
  openImageImport: () => void;
  openStorageForm: (project: string) => void;
}

export const panels = {
  instanceSummary: "instance-summary",
  imageImport: "image-import",
  storageForm: "storage-form",
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
    project: params.get("project") ?? "default",

    clear: () => {
      setParams(new URLSearchParams());
    },

    openInstanceSummary: (instance, project) => {
      setPanelParams(panels.instanceSummary, { instance, project });
    },

    openImageImport: () => {
      setPanelParams(panels.imageImport);
    },

    openStorageForm: (project) => {
      setPanelParams(panels.storageForm, { project });
    },
  };
};

export default usePanelParams;
