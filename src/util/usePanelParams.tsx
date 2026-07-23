import { useSearchParams } from "react-router-dom";
import type { GroupSubForm } from "types/forms/permissionGroup";
import { useCurrentProject } from "context/useCurrentProject";

export interface PanelHelper {
  bucket: string | null;
  group: string | null;
  identity: string | null;
  editIdentityId: string | null;
  editIdentityAuthMethod: string | null;
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
  deviceName: string | null;
  localPeering: string | null;
  imageRegistry: string | null;
  replicator: string | null;
  replicaProject: string | null;
  clusterLink: string | null;
  clear: () => void;
  openCreateClusterGroup: () => void;
  openCreateClusterLink: () => void;
  openCreateGroup: (subForm?: GroupSubForm) => void;
  openCreateIdpGroup: () => void;
  openCreateStorageBucket: (project: string) => void;
  openCreateStorageBucketKey: (project: string) => void;
  openCreateIdentity: () => void;
  openEditClusterGroup: (group: string) => void;
  openEditClusterLink: (link: string) => void;
  openEditGroup: (group: string, subForm?: GroupSubForm) => void;
  openEditIdpGroup: (group: string) => void;
  openCreatePlacementGroup: () => void;
  openEditPlacementGroup: (placementGroup: string) => void;
  openEditMember: (name: string) => void;
  openEditStorageBucket: (bucket: string, pool: string, target: string) => void;
  openEditStorageBucketKey: (key: string) => void;
  openGroupIdentities: (group?: string) => void;
  openEditIdentity: (identityId: string, authMethod: string) => void;
  openInstanceSummary: (instance: string, project: string) => void;
  openProfileSummary: (profile: string, project: string) => void;
  openEditNetworkDevice: (deviceName: string) => void;
  openCreateNetworkDevice: () => void;
  openCreateLoadBalancerPool: () => void;
  openCreateLocalPeering: () => void;
  openEditLocalPeering: (peering: string) => void;
  openEditLoadBalancerPool: (pool: string) => void;
  openCreateImageRegistry: () => void;
  openEditImageRegistry: (imageRegistry: string) => void;
  openCreateReplicator: (replicaProject?: string, clusterLink?: string) => void;
  openEditReplicator: (project: string, replicator: string) => void;
}

export const panels = {
  createClusterGroup: "create-cluster-group",
  createClusterLink: "create-cluster-link",
  createGroup: "create-groups",
  createIdpGroup: "create-idp-groups",
  editIdpGroup: "edit-idp-groups",
  createLoadBalancerPool: "create-load-balancer-pool",
  createIdentity: "create-identity",
  createPlacementGroup: "create-placement-group",
  editPlacementGroup: "edit-placement-group",
  createStorageBucket: "create-bucket",
  createStorageBucketKey: "create-bucket-key",
  editClusterGroups: "edit-cluster-group",
  editClusterLink: "edit-cluster-link",
  editClusterMember: "edit-cluster-member",
  editLoadBalancerPool: "edit-load-balancer-pool",
  createNetworkDevice: "create-network-device",
  editNetworkDevice: "edit-network-device",
  createLocalPeering: "create-local-peering",
  editLocalPeering: "edit-local-peering",
  editGroup: "edit-groups",
  editStorageBucket: "edit-bucket",
  editStorageBucketKey: "edit-bucket-key",
  groupIdentities: "group-identities",
  editIdentity: "edit-identity",
  instanceSummary: "instance-summary",
  profileSummary: "profile-summary",
  createImageRegistry: "create-image-registry",
  editImageRegistry: "edit-image-registry",
  createReplicator: "create-replicator",
  editReplicator: "edit-replicator",
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
    newParams.delete("edit-identity-id");
    newParams.delete("edit-identity-auth-method");
    newParams.delete("idp-group");
    newParams.delete("instance");
    newParams.delete("member");
    newParams.delete("panel");
    newParams.delete("profile");
    newParams.delete("panel-pool");
    newParams.delete("panel-project");
    newParams.delete("sub-form");
    newParams.delete("target");
    newParams.delete("device-name");
    newParams.delete("local-peering");
    newParams.delete("create-image-registry");
    newParams.delete("image-registry");
    newParams.delete("create-replicator");
    newParams.delete("edit-replicator");
    newParams.delete("replicator");
    newParams.delete("replica-project");
    newParams.delete("cluster-link");
    setParams(newParams);
    craftResizeEvent();
  };

  return {
    bucket: params.get("bucket"),
    group: params.get("group"),
    identity: params.get("identity"),
    editIdentityId: params.get("edit-identity-id"),
    editIdentityAuthMethod: params.get("edit-identity-auth-method"),
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
    deviceName: params.get("device-name"),
    localPeering: params.get("local-peering"),
    imageRegistry: params.get("image-registry"),
    replicaProject: params.get("replica-project"),
    clusterLink: params.get("cluster-link"),
    replicator: params.get("replicator"),

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

    openCreateIdentity: () => {
      setPanelParams(panels.createIdentity);
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

    openEditStorageBucketKey: (key) => {
      const params: ParamMap = {
        "bucket-key": key || "",
      };
      setPanelParams(panels.editStorageBucketKey, params);
    },

    openEditNetworkDevice: (deviceName) => {
      const params: Record<string, string> = {
        "device-name": deviceName,
      };
      setPanelParams(panels.editNetworkDevice, params);
    },

    openCreateNetworkDevice: () => {
      setPanelParams(panels.createNetworkDevice);
    },

    openCreateLoadBalancerPool: () => {
      setPanelParams(panels.createLoadBalancerPool);
    },

    openCreateLocalPeering: () => {
      setPanelParams(panels.createLocalPeering);
    },

    openEditLocalPeering: (localPeering) => {
      const params: ParamMap = {
        "local-peering": localPeering || "",
      };
      setPanelParams(panels.editLocalPeering, params);
    },

    openEditLoadBalancerPool: (pool: string) => {
      const params: ParamMap = {
        "panel-pool": pool || "",
      };
      setPanelParams(panels.editLoadBalancerPool, params);
    },

    openGroupIdentities: (group) => {
      setPanelParams(panels.groupIdentities, { group: group || "" });
    },

    openEditIdentity: (identityId, authMethod) => {
      setPanelParams(panels.editIdentity, {
        "edit-identity-id": identityId,
        "edit-identity-auth-method": authMethod,
      });
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

    openCreateImageRegistry: () => {
      setPanelParams(panels.createImageRegistry);
    },

    openEditImageRegistry: (imageRegistry) => {
      setPanelParams(panels.editImageRegistry, {
        "image-registry": imageRegistry,
      });
    },
    openCreateReplicator: (replicaProject, clusterLink) => {
      const params: ParamMap = {};
      if (replicaProject) {
        params["replica-project"] = replicaProject;
      }
      if (clusterLink) {
        params["cluster-link"] = clusterLink;
      }
      setPanelParams(panels.createReplicator, params);
    },

    openEditReplicator: (project, replicator) => {
      setPanelParams(panels.editReplicator, {
        "panel-project": project || "default",
        replicator: replicator || "",
      });
    },
  };
};

export default usePanelParams;
