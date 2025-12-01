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
  member: string | null;
  subForm: GroupSubForm;
  project: string;
  bucket: string | null;
  key: string | null;
  pool: string | null;
  target: string | null;
  clear: () => void;
  openInstanceSummary: (instance: string, project: string) => void;
  openProfileSummary: (profile: string, project: string) => void;
  openIdentityGroups: (identity?: string) => void;
  openCreateGroup: (subForm?: GroupSubForm) => void;
  openEditGroup: (group: string, subForm?: GroupSubForm) => void;
  openGroupIdentities: (group?: string) => void;
  openCreateIdpGroup: () => void;
  openEditIdpGroup: (group: string) => void;
  openCreateTLSIdentity: () => void;
  openCreatePlacementGroup: () => void;
  openEditPlacementGroup: (placementGroup: string) => void;
  openCreateStorageBucket: (project: string) => void;
  openEditStorageBucket: (bucket: string, pool: string, target: string) => void;
  openCreateClusterGroup: () => void;
  openEditMember: (name: string) => void;
  openEditClusterGroup: (group: string) => void;
  openCreateStorageBucketKey: (project: string) => void;
  openEditStorageBucketKey: (key: string) => void;
}

export const panels = {
  instanceSummary: "instance-summary",
  profileSummary: "profile-summary",
  identityGroups: "identity-groups",
  createGroup: "create-groups",
  editGroup: "edit-groups",
  groupIdentities: "group-identities",
  createIdpGroup: "create-idp-groups",
  editIdpGroup: "edit-idp-groups",
  createTLSIdentity: "create-tls-identity",
  createPlacementGroup: "create-placement-group",
  editPlacementGroup: "edit-placement-group",
  createStorageBucket: "create-bucket",
  editStorageBucket: "edit-bucket",
  createStorageBucketKey: "create-bucket-key",
  editStorageBucketKey: "edit-bucket-key",
  createClusterGroup: "create-cluster-group",
  editClusterGroups: "edit-cluster-group",
  editClusterMember: "edit-cluster-member",
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
    newParams.delete("member");
    newParams.delete("panel");
    newParams.delete("profile");
    newParams.delete("panel-project");
    newParams.delete("sub-form");
    newParams.delete("bucket");
    newParams.delete("bucket-key");
    newParams.delete("panel-pool");
    newParams.delete("target");
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
    member: params.get("member"),
    subForm: params.get("sub-form") as GroupSubForm,
    bucket: params.get("bucket"),
    key: params.get("bucket-key"),
    pool: params.get("panel-pool"),
    target: params.get("target") ?? "",

    clear: () => {
      clearParams();
    },

    openInstanceSummary: (instance, project) => {
      setPanelParams(panels.instanceSummary, {
        instance,
        "panel-project": project,
      });
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

    openCreateGroup: (subForm) => {
      const params: ParamMap = {};
      if (subForm) {
        params["sub-form"] = subForm;
      }
      setPanelParams(panels.createGroup, params);
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

    openCreatePlacementGroup: () => {
      setPanelParams(panels.createPlacementGroup);
    },

    openEditPlacementGroup: (placementGroup: string) => {
      setPanelParams(panels.editPlacementGroup, {
        group: placementGroup || "",
      });
    },

    openEditStorageBucket: (bucket, pool, target) => {
      const params: ParamMap = {
        bucket: bucket || "",
        "panel-pool": pool || "",
        target: target || "",
      };
      setPanelParams(panels.editStorageBucket, params);
    },

    openCreateClusterGroup: () => {
      setPanelParams(panels.createClusterGroup);
    },

    openEditMember: (member) => {
      setPanelParams(panels.editClusterMember, { member });
    },

    openEditClusterGroup: (group) => {
      setPanelParams(panels.editClusterGroups, { group });
    },

    openCreateStorageBucketKey: () => {
      setPanelParams(panels.createStorageBucketKey);
    },

    openEditStorageBucketKey: (key) => {
      const params: ParamMap = {
        "bucket-key": key || "",
      };
      setPanelParams(panels.editStorageBucketKey, params);
    },
  };
};

export default usePanelParams;
