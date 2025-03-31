import type { FC } from "react";
import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Loader from "components/Loader";
import ProjectRedirect from "pages/projects/ProjectRedirect";
import ProjectLoader from "pages/projects/ProjectLoader";
import ClusterGroupLoader from "pages/cluster/ClusterGroupLoader";
import { useAuth } from "context/auth";
import { setTitle } from "util/title";
import CustomLayout from "components/CustomLayout";
import NoMatch from "components/NoMatch";
import { logout } from "util/helpers";
import NoProject from "components/NoProject";
import lazy from "util/lazyWithRetry";
import { useSettings } from "context/useSettings";

const CertificateAdd = lazy(async () => import("pages/login/CertificateAdd"));
const CertificateGenerate = lazy(
  async () => import("pages/login/CertificateGenerate"),
);
const ClusterList = lazy(async () => import("pages/cluster/ClusterList"));
const CreateClusterGroup = lazy(
  async () => import("pages/cluster/CreateClusterGroup"),
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
const EditClusterGroup = lazy(
  async () => import("pages/cluster/EditClusterGroup"),
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
  async () => import("./pages/networks/NetworkAclList"),
);
const NetworkDetail = lazy(async () => import("pages/networks/NetworkDetail"));
const NetworkList = lazy(async () => import("./pages/networks/NetworkList"));
const OperationList = lazy(
  async () => import("pages/operations/OperationList"),
);
const ProfileDetail = lazy(async () => import("pages/profiles/ProfileDetail"));
const ProfileList = lazy(async () => import("pages/profiles/ProfileList"));
const ProjectConfig = lazy(
  async () => import("pages/projects/ProjectConfiguration"),
);
const ProtectedRoute = lazy(async () => import("components/ProtectedRoute"));
const Settings = lazy(async () => import("pages/settings/Settings"));
const StoragePools = lazy(async () => import("pages/storage/StoragePools"));
const StorageVolumes = lazy(async () => import("pages/storage/StorageVolumes"));
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
  const { defaultProject, hasNoProjects, isAuthLoading, isAuthenticated } =
    useAuth();
  const { data: settings } = useSettings();
  const hasOidc = settings?.auth_methods?.includes("oidc");
  const hasCertificate = settings?.client_certificate;
  setTitle();

  if (isAuthLoading) {
    return <Loader />;
  }

  if (!isAuthenticated && hasOidc != undefined && hasCertificate != undefined) {
    logout(hasOidc, hasCertificate);
  }

  if (!isAuthenticated && !window.location.href.includes("/ui/login")) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <CustomLayout>
          <Loader />
        </CustomLayout>
      }
    >
      <Routes>
        {HOME_REDIRECT_PATHS.map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <Navigate
                to={
                  hasNoProjects
                    ? "/ui/no-project"
                    : `/ui/project/${defaultProject}/instances`
                }
                replace={true}
              />
            }
          />
        ))}
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
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<InstanceDetail />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/instance/:name/:activeTab"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<InstanceDetail />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/instance/:name/:activeTab/:section"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<InstanceDetail />} />}
            />
          }
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
          path="/ui/project/:project/images"
          element={<ProtectedRoute outlet={<ImageList />} />}
        />
        <Route
          path="/ui/cluster"
          element={<ProtectedRoute outlet={<ClusterList />} />}
        />
        <Route
          path="/ui/cluster/groups/create"
          element={<ProtectedRoute outlet={<CreateClusterGroup />} />}
        />
        <Route
          path="/ui/cluster/group/:group"
          element={
            <ProtectedRoute
              outlet={<ClusterGroupLoader outlet={<ClusterList />} />}
            />
          }
        />
        <Route
          path="/ui/cluster/group/:group/edit"
          element={
            <ProtectedRoute
              outlet={<ClusterGroupLoader outlet={<EditClusterGroup />} />}
            />
          }
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
        <Route path="ui/no-project" element={<NoProject />} />
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </Suspense>
  );
};

export default App;
