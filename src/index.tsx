import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import Navigation from "components/Navigation";
import Panels from "components/Panels";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "context/auth";
import { NotifyProvider } from "context/notify";
import App from "./App";
import "./sass/styles.scss";
import { ProjectProvider } from "context/project";
import { InstanceLoadingProvider } from "context/instanceLoading";

const queryClient = new QueryClient();

const rootElement = document.getElementById("app");
if (!rootElement) throw new Error("Failed to find the root element");
const root = createRoot(rootElement);
root.render(
  <Router>
    <NotifyProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ProjectProvider>
            <InstanceLoadingProvider>
              <div className="l-application" role="presentation">
                <Navigation />
                <App />
                <Panels />
              </div>
            </InstanceLoadingProvider>
          </ProjectProvider>
        </AuthProvider>
      </QueryClientProvider>
    </NotifyProvider>
  </Router>
);
