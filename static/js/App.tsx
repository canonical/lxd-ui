import React, { FC } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ClusterList from "./ClusterList";
import ImageList from "./ImageList";
import InstanceList from "./InstanceList";
import InstanceTerminal from "./InstanceTerminal";
import Navigation from "./components/Navigation";
import ProfileList from "./ProfileList";
import NetworkList from "./NetworkList";
import NoMatch from "./components/NoMatch";
import ProjectList from "./ProjectList";
import WarningList from "./WarningList";
import InstanceVga from "./InstanceVga";
import Panels from "./panels/Panels";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
            <Route
              path="/instances/:name/terminal"
              element={<InstanceTerminal />}
            />
            <Route path="/instances/:name/vga" element={<InstanceVga />} />
            <Route path="/images" element={<ImageList />} />
            <Route path="/profiles" element={<ProfileList />} />
            <Route path="/networks" element={<NetworkList />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/cluster" element={<ClusterList />} />
            <Route path="/warnings" element={<WarningList />} />
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
