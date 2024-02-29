import { FC, lazy, Suspense } from "react";
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

const CertificateAdd = lazy(() => import("pages/login/CertificateAdd"));
const CertificateGenerate = lazy(
  () => import("pages/login/CertificateGenerate"),
);
const ClusterList = lazy(() => import("pages/cluster/ClusterList"));
const CreateClusterGroup = lazy(
  () => import("pages/cluster/CreateClusterGroup"),
);
const CreateInstance = lazy(() => import("pages/instances/CreateInstance"));
const CreateNetwork = lazy(() => import("pages/networks/CreateNetwork"));
const CreateNetworkForward = lazy(
  () => import("pages/networks/CreateNetworkForward"),
);
const CreateProfile = lazy(() => import("pages/profiles/CreateProfile"));
const CreateProject = lazy(() => import("pages/projects/CreateProject"));
const CreateStoragePool = lazy(() => import("pages/storage/CreateStoragePool"));
const EditClusterGroup = lazy(() => import("pages/cluster/EditClusterGroup"));
const EditNetworkForward = lazy(
  () => import("pages/networks/EditNetworkForward"),
);
const ImageList = lazy(() => import("pages/images/ImageList"));
const InstanceDetail = lazy(() => import("pages/instances/InstanceDetail"));
const InstanceList = lazy(() => import("pages/instances/InstanceList"));
const Login = lazy(() => import("pages/login/Login"));
const NetworkDetail = lazy(() => import("pages/networks/NetworkDetail"));
const NetworkList = lazy(() => import("./pages/networks/NetworkList"));
const NetworkMap = lazy(() => import("pages/networks/NetworkMap"));
const OperationList = lazy(() => import("pages/operations/OperationList"));
const ProfileDetail = lazy(() => import("pages/profiles/ProfileDetail"));
const ProfileList = lazy(() => import("pages/profiles/ProfileList"));
const ProjectConfig = lazy(() => import("pages/projects/ProjectConfiguration"));
const ProtectedRoute = lazy(() => import("components/ProtectedRoute"));
const Settings = lazy(() => import("pages/settings/Settings"));
const Storage = lazy(() => import("pages/storage/Storage"));
const StoragePoolDetail = lazy(() => import("pages/storage/StoragePoolDetail"));
const StorageVolumeCreate = lazy(
  () => import("pages/storage/forms/StorageVolumeCreate"),
);
const StorageVolumeDetail = lazy(
  () => import("pages/storage/StorageVolumeDetail"),
);
const WarningList = lazy(() => import("pages/warnings/WarningList"));

const HOME_REDIRECT_PATHS = ["/", "/ui", "/ui/project"];

const App: FC = () => {
  const { defaultProject, isAuthLoading, isAuthenticated } = useAuth();
  setTitle();

  if (isAuthLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    logout();
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
                to={`/ui/project/${defaultProject}/instances`}
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
          path="/ui/project/:project/networks/map"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<NetworkMap />} />}
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
          path="/ui/project/:project/storage"
          element={
            <ProtectedRoute outlet={<ProjectLoader outlet={<Storage />} />} />
          }
        />
        <Route
          path="/ui/project/:project/storage/create"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<CreateStoragePool />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/storage/:activeTab"
          element={
            <ProtectedRoute outlet={<ProjectLoader outlet={<Storage />} />} />
          }
        />
        <Route
          path="/ui/project/:project/storage/volumes/create"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<StorageVolumeCreate />} />}
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
