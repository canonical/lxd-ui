import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import Navigation from "components/Navigation";
import Panels from "components/Panels";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "context/auth";
import App from "./App";
import "./sass/styles.scss";
import { ProjectProvider } from "context/project";
import { InstanceLoadingProvider } from "context/instanceLoading";
import Events from "pages/instances/Events";
import { EventQueueProvider } from "context/eventQueue";
import { NotificationProvider } from "@canonical/react-components";

const queryClient = new QueryClient();

const rootElement = document.getElementById("app");
if (!rootElement) throw new Error("Failed to find the root element");
const root = createRoot(rootElement);
root.render(
  <Router>
    <NotificationProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ProjectProvider>
            <InstanceLoadingProvider>
              <EventQueueProvider>
                <div className="l-application" role="presentation">
                  <Navigation />
                  <App />
                  <Panels />
                  <Events />
                </div>
              </EventQueueProvider>
            </InstanceLoadingProvider>
          </ProjectProvider>
        </AuthProvider>
      </QueryClientProvider>
    </NotificationProvider>
  </Router>
);
