import { useSearchParams } from "react-router-dom";

export interface PanelHelper {
  panel: string | null;
  instance: string | null;
  profile: string | null;
  project: string;
  clear: () => void;
  openInstanceSummary: (instance: string, project: string) => void;
  openCreateInstance: (project: string) => void;
  openEditInstance: (instance: string, project: string) => void;
  openImageImport: () => void;
  openProfileFormGuided: (project: string) => void;
  openProfileFormYaml: (profile: string, project: string) => void;
  openNewProfileFormYaml: (project: string) => void;
  openNewStorageForm: (project: string) => void;
}

export const panels = {
  instanceSummary: "instance-summary",
  createInstance: "create-instance",
  editInstance: "edit-instance",
  imageImport: "image-import",
  profileFormGuided: "profile-form-guided",
  profileFormYaml: "profile-form-yaml",
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

    openCreateInstance: (project) => {
      setPanelParams(panels.createInstance, { project });
    },

    openEditInstance: (instance, project) => {
      setPanelParams(panels.editInstance, { instance, project });
    },

    openImageImport: () => {
      setPanelParams(panels.imageImport);
    },

    openProfileFormGuided: (project: string) => {
      setPanelParams(panels.profileFormGuided, { project });
    },

    openProfileFormYaml: (profile, project) => {
      setPanelParams(panels.profileFormYaml, { profile, project });
    },

    openNewProfileFormYaml: (project) => {
      setPanelParams(panels.profileFormYaml, { project });
    },

    openNewStorageForm: (project) => {
      setPanelParams(panels.storageForm, { project });
    },
  };
};

export default usePanelParams;
