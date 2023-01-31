import React, { FC } from "react";
import { Route, Routes } from "react-router-dom";
import ClusterList from "pages/cluster/ClusterList";
import ImageList from "pages/images/ImageList";
import InstanceList from "pages/instances/InstanceList";
import ProfileList from "pages/profiles/ProfileList";
import NetworkList from "pages/networks/NetworkList";
import NoMatch from "components/NoMatch";
import ProjectList from "pages/projects/ProjectList";
import WarningList from "pages/warnings/WarningList";
import Settings from "pages/settings/Settings";
import InstanceDetail from "pages/instances/InstanceDetail";
import StorageList from "pages/storages/StorageList";
import ProfileDetail from "pages/profiles/ProfileDetail";
import CertificateGenerate from "pages/certificates/CertificateGenerate";
import CertificateMain from "pages/certificates/CertificateMain";
import ProtectedRoute from "components/ProtectedRoute";

const App: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute outlet={<InstanceList />} />} />
      <Route
        path="/ui"
        element={<ProtectedRoute outlet={<InstanceList />} />}
      />
      <Route
        path="/ui/instances"
        element={<ProtectedRoute outlet={<InstanceList />} />}
      />
      <Route
        path="/ui/instances/:name"
        element={<ProtectedRoute outlet={<InstanceDetail />} />}
      />
      <Route
        path="/ui/instances/:name/:activeTab"
        element={<ProtectedRoute outlet={<InstanceDetail />} />}
      />
      <Route
        path="/ui/images"
        element={<ProtectedRoute outlet={<ImageList />} />}
      />
      <Route
        path="/ui/profiles"
        element={<ProtectedRoute outlet={<ProfileList />} />}
      />
      <Route
        path="/ui/profiles/:name"
        element={<ProtectedRoute outlet={<ProfileDetail />} />}
      />
      <Route
        path="/ui/networks"
        element={<ProtectedRoute outlet={<NetworkList />} />}
      />
      <Route
        path="/ui/projects"
        element={<ProtectedRoute outlet={<ProjectList />} />}
      />
      <Route
        path="/ui/storages"
        element={<ProtectedRoute outlet={<StorageList />} />}
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
  );
};

export default App;
