import { useSearchParams } from "react-router-dom";
import type { GroupSubForm } from "pages/permissions/panels/CreateGroupPanel";
import { useCurrentProject } from "context/useCurrentProject";

export interface PanelHelper {
  panel: string | null;
  instance: string | null;
  profile: string | null;
  group: string | null;
  idpGroup: string | null;
  identity: string | null;
  subForm: GroupSubForm;
  project: string;
  clear: () => void;
  openInstanceSummary: (instance: string, project: string) => void;
  openImageImport: () => void;
  openProfileSummary: (profile: string, project: string) => void;
  openIdentityGroups: (identity?: string) => void;
  openCreateGroup: () => void;
  openEditGroup: (group: string, subForm?: GroupSubForm) => void;
  openGroupIdentities: (group?: string) => void;
  openCreateIdpGroup: () => void;
  openEditIdpGroup: (group: string) => void;
  openCreateTLSIdentity: () => void;
  openCreateStorageBucket: (project: string) => void;
}

export const panels = {
  instanceSummary: "instance-summary",
  imageImport: "image-import",
  profileSummary: "profile-summary",
  identityGroups: "identity-groups",
  createGroup: "create-groups",
  editGroup: "edit-groups",
  groupIdentities: "group-identities",
  createIdpGroup: "create-idp-groups",
  editIdpGroup: "edit-idp-groups",
  createTLSIdentity: "create-tls-identity",
  createStorageBucket: "create-storage-bucket",
};

type ParamMap = Record<string, string>;

const usePanelParams = (): PanelHelper => {
  const { project } = useCurrentProject();
  const [params, setParams] = useSearchParams();

  const craftResizeEvent = () => {
    setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
  };

  const setPanelParams = (panel: string, args: ParamMap = {}) => {
    const newParams = new URLSearchParams();
    newParams.set("panel", panel);
    for (const [key, value] of Object.entries(args)) {
      if (value) {
        newParams.set(key, value);
      }
    }
    setParams(newParams);
    craftResizeEvent();
  };

  const clearParams = () => {
    const newParams = new URLSearchParams(params);
    // we only want to remove search params set when opening the panel
    // pre-existing search params should be kept e.g. params from the search bar
    newParams.delete("group");
    newParams.delete("identity");
    newParams.delete("idp-group");
    newParams.delete("instance");
    newParams.delete("panel");
    newParams.delete("profile");
    newParams.delete("panel-project");
    newParams.delete("sub-form");
    setParams(newParams);
    craftResizeEvent();
  };

  return {
    panel: params.get("panel"),
    instance: params.get("instance"),
    profile: params.get("profile"),
    project: params.get("panel-project") ?? project?.name ?? "default",
    identity: params.get("identity"),
    group: params.get("group"),
    idpGroup: params.get("idp-group"),
    subForm: params.get("sub-form") as GroupSubForm,

    clear: () => {
      clearParams();
    },

    openInstanceSummary: (instance, project) => {
      setPanelParams(panels.instanceSummary, {
        instance,
        "panel-project": project,
      });
    },

    openImageImport: () => {
      setPanelParams(panels.imageImport);
    },

    openProfileSummary: (profile, project) => {
      setPanelParams(panels.profileSummary, {
        profile,
        "panel-project": project,
      });
    },

    openIdentityGroups: (identity) => {
      const newParams = new URLSearchParams(params);
      newParams.append("identity", identity || "");
      setPanelParams(panels.identityGroups, Object.fromEntries(newParams));
    },

    openCreateGroup: () => {
      setPanelParams(panels.createGroup);
    },

    openEditGroup: (group, subForm) => {
      const params: ParamMap = { group: group || "" };
      if (subForm) {
        params["sub-form"] = subForm;
      }
      setPanelParams(panels.editGroup, params);
    },

    openGroupIdentities: (group) => {
      setPanelParams(panels.groupIdentities, { group: group || "" });
    },

    openCreateIdpGroup: () => {
      setPanelParams(panels.createIdpGroup);
    },

    openEditIdpGroup: (idpGroup) => {
      setPanelParams(panels.editIdpGroup, {
        "idp-group": idpGroup || "",
      });
    },

    openCreateTLSIdentity: () => {
      setPanelParams(panels.createTLSIdentity);
    },

    openCreateStorageBucket: () => {
      setPanelParams(panels.createStorageBucket);
    },
  };
};

export default usePanelParams;
