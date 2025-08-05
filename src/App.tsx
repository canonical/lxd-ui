import type { FC } from "react";
import { useEffect } from "react";
import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Loader from "components/Loader";
import ProjectRedirect from "pages/projects/ProjectRedirect";
import ProjectLoader from "pages/projects/ProjectLoader";
import { useAuth } from "context/auth";
import { setTitle } from "util/title";
import NoMatch from "components/NoMatch";
import { logout } from "util/helpers";
import lazy from "util/lazyWithRetry";
import { useSettings } from "context/useSettings";
import NotificationRow from "components/NotificationRow";
import { applyTheme, loadTheme, useNotify } from "@canonical/react-components";
import CustomLayout from "components/CustomLayout";

const CertificateAdd = lazy(async () => import("pages/login/CertificateAdd"));
const CertificateGenerate = lazy(
  async () => import("pages/login/CertificateGenerate"),
);
const ClusterGroupList = lazy(
  async () => import("pages/cluster/ClusterGroupList"),
);
const ClusterMemberList = lazy(
  async () => import("pages/cluster/ClusterMemberList"),
);
const ClusterMemberDetail = lazy(
  async () => import("pages/cluster/ClusterMemberDetail"),
);
const CreateInstance = lazy(
  async () => import("pages/instances/CreateInstance"),
);
const CreateNetwork = lazy(async () => import("pages/networks/CreateNetwork"));
const CreateNetworkAcl = lazy(
  async () => import("pages/networks/CreateNetworkAcl"),
);
const CreateNetworkForward = lazy(
  async () => import("pages/networks/CreateNetworkForward"),
);
const CreateProfile = lazy(async () => import("pages/profiles/CreateProfile"));
const CreateProject = lazy(async () => import("pages/projects/CreateProject"));
const CreateStoragePool = lazy(
  async () => import("pages/storage/CreateStoragePool"),
);
const EditNetworkForward = lazy(
  async () => import("pages/networks/EditNetworkForward"),
);
const ImageList = lazy(async () => import("pages/images/ImageList"));
const InstanceDetail = lazy(
  async () => import("pages/instances/InstanceDetail"),
);
const InstanceList = lazy(async () => import("pages/instances/InstanceList"));
const Login = lazy(async () => import("pages/login/Login"));
const NetworkAclDetail = lazy(
  async () => import("pages/networks/NetworkAclDetail"),
);
const NetworkAclList = lazy(
  async () => import("pages/networks/NetworkAclList"),
);
const NetworkDetail = lazy(async () => import("pages/networks/NetworkDetail"));
const NetworkIPAM = lazy(async () => import("pages/networks/NetworkIPAM"));
const NetworkList = lazy(async () => import("pages/networks/NetworkList"));
const OperationList = lazy(
  async () => import("pages/operations/OperationList"),
);
const PlacementGroupList = lazy(
  async () => import("pages/placement-groups/PlacementGroupList"),
);
const ProfileDetail = lazy(async () => import("pages/profiles/ProfileDetail"));
const ProfileList = lazy(async () => import("pages/profiles/ProfileList"));
const ProjectConfig = lazy(
  async () => import("pages/projects/ProjectConfiguration"),
);
const ProtectedRoute = lazy(async () => import("components/ProtectedRoute"));
const Server = lazy(async () => import("pages/cluster/Server"));
const Settings = lazy(async () => import("pages/settings/Settings"));
const StoragePools = lazy(async () => import("pages/storage/StoragePools"));
const StorageVolumes = lazy(async () => import("pages/storage/StorageVolumes"));
const StorageBuckets = lazy(async () => import("pages/storage/StorageBuckets"));
const CustomIsoList = lazy(async () => import("pages/storage/CustomIsoList"));
const StoragePoolDetail = lazy(
  async () => import("pages/storage/StoragePoolDetail"),
);
const CreateStorageVolume = lazy(
  async () => import("pages/storage/forms/CreateStorageVolume"),
);
const StorageVolumeDetail = lazy(
  async () => import("pages/storage/StorageVolumeDetail"),
);
const StorageBucketDetail = lazy(
  async () => import("pages/storage/StorageBucketDetail"),
);
const WarningList = lazy(async () => import("pages/warnings/WarningList"));
const PermissionIdentities = lazy(
  async () => import("pages/permissions/PermissionIdentities"),
);
const PermissionGroups = lazy(
  async () => import("pages/permissions/PermissionGroups"),
);
const PermissionIdpGroups = lazy(
  async () => import("pages/permissions/PermissionIdpGroups"),
);

const HOME_REDIRECT_PATHS = ["/", "/ui", "/ui/project"];

const App: FC = () => {
  const {
    defaultProject,
    hasNoProjects,
    isAuthLoading,
    isAuthenticated,
    authError,
  } = useAuth();
  const notify = useNotify();
  const { data: settings } = useSettings();
  const hasOidc = settings?.auth_methods?.includes("oidc");
  const hasCertificate = settings?.client_certificate;
  setTitle();

  useEffect(() => {
    const theme = loadTheme();
    applyTheme(theme);
  }, []);

  if (isAuthLoading) {
    return <Loader isMainComponent />;
  }

  if (authError) {
    const title = "Authentication failed";
    if (notify.notification?.title !== title) {
      const logoutAction = [
        {
          label: "Logout",
          onClick: () => (window.location.href = "/oidc/logout"),
        },
      ];

      notify.failure(title, authError, null, logoutAction);
    }

    return (
      <CustomLayout contentClassName="login">
        <NotificationRow />
      </CustomLayout>
    );
  }

  if (!isAuthenticated && hasOidc != undefined && hasCertificate != undefined) {
    logout(hasOidc, hasCertificate);
  }

  if (!isAuthenticated && !window.location.href.includes("/ui/login")) {
    return <Navigate to="/ui/login" replace={true} />;
  }

  return (
    <Suspense fallback={<Loader isMainComponent />}>
      <Routes>
        {HOME_REDIRECT_PATHS.map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <Navigate
                to={
                  hasNoProjects
                    ? "/ui/all-projects/instances"
                    : `/ui/project/${encodeURIComponent(defaultProject)}/instances`
                }
                replace={true}
              />
            }
          />
        ))}
        <Route
          path="/ui/all-projects/instances"
          element={<ProtectedRoute outlet={<InstanceList />} />}
        />
        <Route
          path="/ui/project/:project"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<ProjectRedirect />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/instances"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<InstanceList />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/instances/create"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<CreateInstance />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/instance/:name"
          element={<ProtectedRoute outlet={<InstanceDetail />} />}
        />
        <Route
          path="/ui/project/:project/instance/:name/:activeTab"
          element={<ProtectedRoute outlet={<InstanceDetail />} />}
        />
        <Route
          path="/ui/project/:project/instance/:name/:activeTab/:section"
          element={<ProtectedRoute outlet={<InstanceDetail />} />}
        />
        <Route
          path="/ui/project/:project/profiles"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<ProfileList />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/profiles/create"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<CreateProfile />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/profile/:name"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<ProfileDetail />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/profile/:name/:activeTab"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<ProfileDetail />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/profile/:name/:activeTab/:section"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<ProfileDetail />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/placement-groups"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<PlacementGroupList />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/networks"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<NetworkList />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/networks/create"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<CreateNetwork />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/network/:name"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<NetworkDetail />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/member/:member/network/:name"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<NetworkDetail />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/network/:name/:activeTab"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<NetworkDetail />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/network/:name/:activeTab/:section"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<NetworkDetail />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/network/:network/forwards/create"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<CreateNetworkForward />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/network/:network/forwards/:forwardAddress/edit"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<EditNetworkForward />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/network/:network/member/:memberName/forwards/:forwardAddress/edit"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<EditNetworkForward />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/network-acls"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<NetworkAclList />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/network-acls/create"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<CreateNetworkAcl />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/network-acl/:name"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<NetworkAclDetail />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/network-ipam"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<NetworkIPAM />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/configuration"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<ProjectConfig />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/configuration/:section"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<ProjectConfig />} />}
            />
          }
        />
        <Route
          path="/ui/projects/create"
          element={<ProtectedRoute outlet={<CreateProject />} />}
        />
        <Route
          path="/ui/project/:project/storage/pools"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<StoragePools />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/storage/pools/create"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<CreateStoragePool />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/storage/volumes"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<StorageVolumes />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/storage/volumes/create"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<CreateStorageVolume />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/storage/buckets"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<StorageBuckets />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/storage/custom-isos"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<CustomIsoList />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/storage/pool/:name"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<StoragePoolDetail />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/storage/pool/:name/:activeTab"
          element={<ProtectedRoute outlet={<StoragePoolDetail />} />}
        />
        <Route
          path="/ui/project/:project/storage/pool/:name/:activeTab/:section"
          element={<ProtectedRoute outlet={<StoragePoolDetail />} />}
        />
        <Route
          path="/ui/project/:project/storage/pool/:pool/volumes/:type/:volume"
          element={<ProtectedRoute outlet={<StorageVolumeDetail />} />}
        />
        <Route
          path="/ui/project/:project/storage/pool/:pool/volumes/:type/:volume/:activeTab"
          element={<ProtectedRoute outlet={<StorageVolumeDetail />} />}
        />
        <Route
          path="/ui/project/:project/storage/pool/:pool/volumes/:type/:volume/:activeTab/:section"
          element={<ProtectedRoute outlet={<StorageVolumeDetail />} />}
        />
        <Route
          path="/ui/project/:project/storage/pool/:pool/member/:member/volumes/:type/:volume"
          element={<ProtectedRoute outlet={<StorageVolumeDetail />} />}
        />
        <Route
          path="/ui/project/:project/storage/pool/:pool/member/:member/volumes/:type/:volume/:activeTab"
          element={<ProtectedRoute outlet={<StorageVolumeDetail />} />}
        />
        <Route
          path="/ui/project/:project/storage/pool/:pool/member/:member/volumes/:type/:volume/:activeTab/:section"
          element={<ProtectedRoute outlet={<StorageVolumeDetail />} />}
        />
        <Route
          path="/ui/project/:project/storage/pool/:pool/bucket/:bucket"
          element={<ProtectedRoute outlet={<StorageBucketDetail />} />}
        />
        <Route
          path="/ui/project/:project/images"
          element={<ProtectedRoute outlet={<ImageList />} />}
        />
        <Route
          path="/ui/server"
          element={<ProtectedRoute outlet={<Server />} />}
        />
        <Route
          path="/ui/server/clustering"
          element={
            <ProtectedRoute outlet={<Server activeTab="clustering" />} />
          }
        />
        <Route
          path="/ui/cluster/groups"
          element={<ProtectedRoute outlet={<ClusterGroupList />} />}
        />
        <Route
          path="/ui/cluster/members"
          element={<ProtectedRoute outlet={<ClusterMemberList />} />}
        />
        <Route
          path="/ui/cluster/member/:name"
          element={<ProtectedRoute outlet={<ClusterMemberDetail />} />}
        />
        <Route
          path="/ui/cluster/member/:name/:activeTab"
          element={<ProtectedRoute outlet={<ClusterMemberDetail />} />}
        />
        <Route
          path="/ui/operations"
          element={<ProtectedRoute outlet={<OperationList />} />}
        />
        <Route
          path="/ui/warnings"
          element={<ProtectedRoute outlet={<WarningList />} />}
        />
        <Route
          path="/ui/permissions/identities"
          element={<ProtectedRoute outlet={<PermissionIdentities />} />}
        />
        <Route
          path="/ui/permissions/groups"
          element={<ProtectedRoute outlet={<PermissionGroups />} />}
        />
        <Route
          path="/ui/permissions/idp-groups"
          element={<ProtectedRoute outlet={<PermissionIdpGroups />} />}
        />
        <Route
          path="/ui/settings"
          element={<ProtectedRoute outlet={<Settings />} />}
        />
        <Route path="/ui/login" element={<Login />} />
        <Route
          path="/ui/login/certificate-generate"
          element={<CertificateGenerate />}
        />
        <Route path="/ui/login/certificate-add" element={<CertificateAdd />} />
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </Suspense>
  );
};

export default App;
