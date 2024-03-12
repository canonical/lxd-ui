import { useSearchParams } from "react-router-dom";

export interface PanelHelper {
  panel: string | null;
  instance: string | null;
  profile: string | null;
  group: string | null;
  idpGroup: string | null;
  identity: string | null;
  project: string;
  clear: () => void;
  clearPanel: () => void;
  openInstanceSummary: (instance: string, project: string) => void;
  openImageImport: () => void;
  openProfileSummary: (profile: string, project: string) => void;
  openIdentityGroups: (identity?: string) => void;
  openCreateGroup: () => void;
  openEditGroup: (group: string) => void;
  openGroupIdentities: (group?: string) => void;
  openGroupPermissions: (group?: string) => void;
  openCreateIdpGroup: () => void;
  openEditIdpGroup: (group: string) => void;
}

export const panels = {
  instanceSummary: "instance-summary",
  imageImport: "image-import",
  profileSummary: "profile-summary",
  identityGroups: "identity-groups",
  createGroup: "create-groups",
  editGroup: "edit-groups",
  groupIdentities: "group-identities",
  groupPermissions: "group-permissions",
  createIdpGroup: "create-idp-groups",
  editIdpGroup: "edit-idp-groups",
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
      if (value) {
        newParams.set(key, value);
      }
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
    identity: params.get("identity"),
    group: params.get("group"),
    idpGroup: params.get("idp-group"),

    clear: () => {
      clearParams();
    },

    clearPanel: () => {
      const newParams = new URLSearchParams(params);
      newParams.delete("panel");
      newParams.delete("identity");
      newParams.delete("group");
      newParams.delete("idp-group");
      setParams(newParams);
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

    openIdentityGroups: (identity) => {
      const newParams = new URLSearchParams(params);
      newParams.append("identity", identity || "");
      setPanelParams(panels.identityGroups, Object.fromEntries(newParams));
    },

    openCreateGroup: () => {
      setPanelParams(panels.createGroup);
    },

    openEditGroup: (group) => {
      setPanelParams(panels.editGroup, { group: group || "" });
    },

    openGroupIdentities: (group) => {
      setPanelParams(panels.groupIdentities, { group: group || "" });
    },

    openGroupPermissions: (group) => {
      setPanelParams(panels.groupPermissions, { group: group || "" });
    },

    openCreateIdpGroup: () => {
      setPanelParams(panels.createIdpGroup);
    },

    openEditIdpGroup: (idpGroup) => {
      setPanelParams(panels.editIdpGroup, {
        "idp-group": idpGroup || "",
      });
    },
  };
};

export default usePanelParams;
