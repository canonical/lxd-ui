import React, { FC } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ClusterList from "pages/cluster/ClusterList";
import ImageList from "pages/images/ImageList";
import InstanceList from "pages/instances/InstanceList";
import Navigation from "components/Navigation";
import ProfileList from "pages/profiles/ProfileList";
import NetworkList from "pages/networks/NetworkList";
import NoMatch from "components/NoMatch";
import ProjectList from "pages/projects/ProjectList";
import WarningList from "pages/warnings/WarningList";
import Panels from "components/Panels";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Settings from "pages/settings/Settings";
import InstanceDetail from "pages/instances/InstanceDetail";
import StorageList from "pages/storages/StorageList";
import ProfileDetail from "pages/profiles/ProfileDetail";

const queryClient = new QueryClient();

const App: FC = () => {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <div className="l-application" role="presentation">
          <Navigation />
          <Routes>
            <Route path="/" element={<InstanceList />} />
            <Route path="/instances" element={<InstanceList />} />
            <Route path="/instances/:name" element={<InstanceDetail />} />
            <Route
              path="/instances/:name/:activeTab"
              element={<InstanceDetail />}
            />
            <Route path="/images" element={<ImageList />} />
            <Route path="/profiles" element={<ProfileList />} />
            <Route path="/profiles/:name" element={<ProfileDetail />} />
            <Route path="/networks" element={<NetworkList />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/storages" element={<StorageList />} />
            <Route path="/cluster" element={<ClusterList />} />
            <Route path="/warnings" element={<WarningList />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NoMatch />} />
          </Routes>
          <Panels />
        </div>
      </QueryClientProvider>
    </Router>
  );
};

const rootElement = document.getElementById("app");
if (!rootElement) throw new Error("Failed to find the root element");
const root = createRoot(rootElement);
root.render(<App />);
