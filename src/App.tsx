import React, { FC, lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Loader from "components/Loader";

const ClusterList = lazy(() => import("pages/cluster/ClusterList"));
const ImageList = lazy(() => import("pages/images/ImageList"));
const InstanceList = lazy(() => import("pages/instances/InstanceList"));
const ProfileList = lazy(() => import("pages/profiles/ProfileList"));
const NetworkList = lazy(() => import("./pages/networks/NetworkList"));
const NoMatch = lazy(() => import("components/NoMatch"));
const ProjectList = lazy(() => import("pages/projects/ProjectList"));
const WarningList = lazy(() => import("pages/warnings/WarningList"));
const Settings = lazy(() => import("pages/settings/Settings"));
const InstanceDetail = lazy(() => import("pages/instances/InstanceDetail"));
const StorageList = lazy(() => import("pages/storages/StorageList"));
const ProfileDetail = lazy(() => import("pages/profiles/ProfileDetail"));
const CertificateGenerate = lazy(
  () => import("pages/certificates/CertificateGenerate")
);
const CertificateMain = lazy(
  () => import("pages/certificates/CertificateMain")
);
const ProtectedRoute = lazy(() => import("components/ProtectedRoute"));
const StorageDetail = lazy(() => import("pages/storages/StorageDetail"));
const NetworkMap = lazy(() => import("pages/networks/NetworkMap"));
const CreateInstanceForm = lazy(
  () => import("pages/instances/CreateInstanceForm")
);
const CreateProfileForm = lazy(
  () => import("pages/profiles/CreateProfileForm")
);

const App: FC = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/ui/default/instances" replace={true} />}
        />
        <Route
          path="/ui"
          element={<Navigate to="/ui/default/instances" replace={true} />}
        />
        <Route
          path="/ui/:project/instances"
          element={<ProtectedRoute outlet={<InstanceList />} />}
        />
        <Route
          path="/ui/:project/instances/create"
          element={<ProtectedRoute outlet={<CreateInstanceForm />} />}
        />
        <Route
          path="/ui/:project/instances/detail/:name"
          element={<ProtectedRoute outlet={<InstanceDetail />} />}
        />
        <Route
          path="/ui/:project/instances/detail/:name/:activeTab"
          element={<ProtectedRoute outlet={<InstanceDetail />} />}
        />
        <Route
          path="/ui/images"
          element={<ProtectedRoute outlet={<ImageList />} />}
        />
        <Route
          path="/ui/:project/profiles"
          element={<ProtectedRoute outlet={<ProfileList />} />}
        />
        <Route
          path="/ui/:project/profiles/create"
          element={<ProtectedRoute outlet={<CreateProfileForm />} />}
        />
        <Route
          path="/ui/:project/profiles/detail/:name"
          element={<ProtectedRoute outlet={<ProfileDetail />} />}
        />
        <Route
          path="/ui/:project/profiles/detail/:name/:activeTab"
          element={<ProtectedRoute outlet={<ProfileDetail />} />}
        />
        <Route
          path="/ui/:project/networks"
          element={<ProtectedRoute outlet={<NetworkList />} />}
        />
        <Route
          path="/ui/:project/networks/map"
          element={<ProtectedRoute outlet={<NetworkMap />} />}
        />
        <Route
          path="/ui/projects"
          element={<ProtectedRoute outlet={<ProjectList />} />}
        />
        <Route
          path="/ui/:project/storages"
          element={<ProtectedRoute outlet={<StorageList />} />}
        />
        <Route
          path="/ui/:project/storages/:name"
          element={<ProtectedRoute outlet={<StorageDetail />} />}
        />
        <Route
          path="/ui/cluster"
          element={<ProtectedRoute outlet={<ClusterList />} />}
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
