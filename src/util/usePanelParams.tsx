import { useSearchParams } from "react-router-dom";
import type { GroupSubForm } from "pages/permissions/panels/CreateGroupPanel";
import { useCurrentProject } from "context/useCurrentProject";

export interface PanelHelper {
  bucket: string | null;
  group: string | null;
  identity: string | null;
  idpGroup: string | null;
  instance: string | null;
  key: string | null;
  member: string | null;
  panel: string | null;
  pool: string | null;
  profile: string | null;
  project: string;
  subForm: GroupSubForm;
  target: string | null;

  clear: () => void;
  openCreateClusterGroup: () => void;
  openCreateClusterLink: () => void;
  openCreateGroup: (subForm?: GroupSubForm) => void;
  openCreateIdpGroup: () => void;
  openCreateStorageBucket: (project: string) => void;
  openCreateStorageBucketKey: (project: string) => void;
  openCreateTLSIdentity: () => void;
  openEditClusterGroup: (group: string) => void;
  openEditClusterLink: (link: string) => void;
  openEditGroup: (group: string, subForm?: GroupSubForm) => void;
  openEditIdpGroup: (group: string) => void;
  openEditMember: (name: string) => void;
  openEditStorageBucket: (bucket: string, pool: string, target: string) => void;
  openEditStorageBucketKey: (key: string) => void;
  openGroupIdentities: (group?: string) => void;
  openIdentityGroups: (identity?: string) => void;
  openInstanceSummary: (instance: string, project: string) => void;
  openProfileSummary: (profile: string, project: string) => void;
}

export const panels = {
  createClusterGroup: "create-cluster-group",
  createClusterLink: "create-cluster-link",
  createGroup: "create-groups",
  createIdpGroup: "create-idp-groups",
  createStorageBucket: "create-bucket",
  createStorageBucketKey: "create-bucket-key",
  createTLSIdentity: "create-tls-identity",
  editClusterGroups: "edit-cluster-group",
  editClusterLink: "edit-cluster-link",
  editClusterMember: "edit-cluster-member",
  editGroup: "edit-groups",
  editIdpGroup: "edit-idp-groups",
  editStorageBucket: "edit-bucket",
  editStorageBucketKey: "edit-bucket-key",
  groupIdentities: "group-identities",
  identityGroups: "identity-groups",
  instanceSummary: "instance-summary",
  profileSummary: "profile-summary",
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
    newParams.delete("bucket");
    newParams.delete("bucket-key");
    newParams.delete("group");
    newParams.delete("identity");
    newParams.delete("idp-group");
    newParams.delete("instance");
    newParams.delete("member");
    newParams.delete("panel");
    newParams.delete("profile");
    newParams.delete("panel-pool");
    newParams.delete("panel-project");
    newParams.delete("sub-form");
    newParams.delete("target");
    setParams(newParams);
    craftResizeEvent();
  };

  return {
    bucket: params.get("bucket"),
    group: params.get("group"),
    identity: params.get("identity"),
    idpGroup: params.get("idp-group"),
    instance: params.get("instance"),
    key: params.get("bucket-key"),
    member: params.get("member"),
    panel: params.get("panel"),
    pool: params.get("panel-pool"),
    profile: params.get("profile"),
    project: params.get("panel-project") ?? project?.name ?? "default",
    subForm: params.get("sub-form") as GroupSubForm,
    target: params.get("target") ?? "",

    clear: () => {
      clearParams();
    },

    openCreateClusterGroup: () => {
      setPanelParams(panels.createClusterGroup);
    },

    openCreateClusterLink: () => {
      setPanelParams(panels.createClusterLink);
    },

    openCreateGroup: (subForm) => {
      const params: ParamMap = {};
      if (subForm) {
        params["sub-form"] = subForm;
      }
      setPanelParams(panels.createGroup, params);
    },

    openCreateIdpGroup: () => {
      setPanelParams(panels.createIdpGroup);
    },

    openCreateStorageBucket: () => {
      setPanelParams(panels.createStorageBucket);
    },

    openCreateStorageBucketKey: () => {
      setPanelParams(panels.createStorageBucketKey);
    },

    openCreateTLSIdentity: () => {
      setPanelParams(panels.createTLSIdentity);
    },

    openEditClusterGroup: (group) => {
      setPanelParams(panels.editClusterGroups, { group });
    },

    openEditClusterLink: (identity) => {
      setPanelParams(panels.editClusterLink, { identity });
    },

    openEditGroup: (group, subForm) => {
      const params: ParamMap = { group: group || "" };
      if (subForm) {
        params["sub-form"] = subForm;
      }
      setPanelParams(panels.editGroup, params);
    },

    openEditIdpGroup: (idpGroup) => {
      setPanelParams(panels.editIdpGroup, {
        "idp-group": idpGroup || "",
      });
    },

    openEditMember: (member) => {
      setPanelParams(panels.editClusterMember, { member });
    },

    openEditStorageBucket: (bucket, pool, target) => {
      const params: ParamMap = {
        bucket: bucket || "",
        "panel-pool": pool || "",
        target: target || "",
      };
      setPanelParams(panels.editStorageBucket, params);
    },

    openEditStorageBucketKey: (key) => {
      const params: ParamMap = {
        "bucket-key": key || "",
      };
      setPanelParams(panels.editStorageBucketKey, params);
    },

    openGroupIdentities: (group) => {
      setPanelParams(panels.groupIdentities, { group: group || "" });
    },

    openIdentityGroups: (identity) => {
      const newParams = new URLSearchParams(params);
      newParams.append("identity", identity || "");
      setPanelParams(panels.identityGroups, Object.fromEntries(newParams));
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
  };
};

export default usePanelParams;
