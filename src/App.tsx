import React, { FC, lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Loader from "components/Loader";
import ProjectRedirect from "pages/projects/ProjectRedirect";
import ProjectLoader from "pages/projects/ProjectLoader";
import ClusterGroupLoader from "pages/cluster/ClusterGroupLoader";

const ClusterList = lazy(() => import("pages/cluster/ClusterList"));
const ImageList = lazy(() => import("pages/images/ImageList"));
const InstanceList = lazy(() => import("pages/instances/InstanceList"));
const ProfileList = lazy(() => import("pages/profiles/ProfileList"));
const NetworkList = lazy(() => import("./pages/networks/NetworkList"));
const NoMatch = lazy(() => import("components/NoMatch"));
const WarningList = lazy(() => import("pages/warnings/WarningList"));
const Settings = lazy(() => import("pages/settings/Settings"));
const InstanceDetail = lazy(() => import("pages/instances/InstanceDetail"));
const StorageList = lazy(() => import("pages/storage/StorageList"));
const ProfileDetail = lazy(() => import("pages/profiles/ProfileDetail"));
const OperationList = lazy(() => import("pages/operations/OperationList"));
const CertificateGenerate = lazy(
  () => import("pages/certificates/CertificateGenerate")
);
const CertificateMain = lazy(
  () => import("pages/certificates/CertificateMain")
);
const ProtectedRoute = lazy(() => import("components/ProtectedRoute"));
const StorageDetail = lazy(() => import("pages/storage/StorageDetail"));
const NetworkMap = lazy(() => import("pages/networks/NetworkMap"));
const CreateInstanceForm = lazy(
  () => import("pages/instances/CreateInstanceForm")
);
const CreateProfileForm = lazy(
  () => import("pages/profiles/CreateProfileForm")
);
const CreateProjectForm = lazy(
  () => import("pages/projects/CreateProjectForm")
);
const ProjectConfiguration = lazy(
  () => import("pages/projects/ProjectConfiguration")
);
const CreateClusterGroup = lazy(
  () => import("pages/cluster/CreateClusterGroup")
);
const EditClusterGroup = lazy(() => import("pages/cluster/EditClusterGroup"));

const HOME_REDIRECT_PATHS = ["/", "/ui", "/ui/project"];

const App: FC = () => {
  return (
    <Suspense
      fallback={
        <main className="l-main">
          <Loader />
        </main>
      }
    >
      <Routes>
        {HOME_REDIRECT_PATHS.map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <Navigate to="/ui/project/default/instances" replace={true} />
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
              outlet={<ProjectLoader outlet={<CreateInstanceForm />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/instances/detail/:name"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<InstanceDetail />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/instances/detail/:name/:activeTab"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<InstanceDetail />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/instances/detail/:name/:activeTab/:activeSection"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<InstanceDetail />} />}
            />
          }
        />
        <Route
          path="/ui/images"
          element={<ProtectedRoute outlet={<ImageList />} />}
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
              outlet={<ProjectLoader outlet={<CreateProfileForm />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/profiles/detail/:name"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<ProfileDetail />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/profiles/detail/:name/:activeTab"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<ProfileDetail />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/profiles/detail/:name/:activeTab/:activeSection"
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
          path="/ui/project/:project/networks/map"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<NetworkMap />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/operations"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<OperationList />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/configuration"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<ProjectConfiguration />} />}
            />
          }
        />
        <Route
          path="/ui/projects/create"
          element={<ProtectedRoute outlet={<CreateProjectForm />} />}
        />
        <Route
          path="/ui/project/:project/storage"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<StorageList />} />}
            />
          }
        />
        <Route
          path="/ui/project/:project/storage/:name"
          element={
            <ProtectedRoute
              outlet={<ProjectLoader outlet={<StorageDetail />} />}
            />
          }
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
          path="/ui/cluster/groups/detail/:group"
          element={
            <ProtectedRoute
              outlet={<ClusterGroupLoader outlet={<ClusterList />} />}
            />
          }
        />
        <Route
          path="/ui/cluster/groups/detail/:group/edit"
          element={
            <ProtectedRoute
              outlet={<ClusterGroupLoader outlet={<EditClusterGroup />} />}
            />
          }
        />
        <Route
          path="/ui/warnings"
          element={<ProtectedRoute outlet={<WarningList />} />}
        />
        <Route
          path="/ui/settings"
          element={<ProtectedRoute outlet={<Settings />} />}
        />
        <Route path="/ui/certificates" element={<CertificateMain />} />
        <Route
          path="/ui/certificates/generate"
          element={<CertificateGenerate />}
        />
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </Suspense>
  );
};

export default App;
