import React, { FC } from "react";
import Navigation from "components/Navigation";
import {
  NotificationProvider,
  QueuedNotification,
} from "@canonical/react-components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Panels from "components/Panels";
import { AuthProvider } from "context/auth";
import { EventQueueProvider } from "context/eventQueue";
import { InstanceLoadingProvider } from "context/instanceLoading";
import { ProjectProvider } from "context/project";
import Events from "pages/instances/Events";
import App from "./App";
import ErrorBoundary from "components/ErrorBoundary";
import ErrorPage from "components/ErrorPage";
import { useLocation } from "react-router-dom";

const queryClient = new QueryClient();

const Root: FC = () => {
  const location = useLocation() as QueuedNotification;

  return (
    <ErrorBoundary fallback={ErrorPage}>
      <NotificationProvider state={location.state} pathname={location.pathname}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ProjectProvider>
              <InstanceLoadingProvider>
                <EventQueueProvider>
                  <div className="l-application" role="presentation">
                    <Navigation />
                    <ErrorBoundary fallback={ErrorPage}>
                      <App />
                      <Panels />
                      <Events />
                    </ErrorBoundary>
                  </div>
                </EventQueueProvider>
              </InstanceLoadingProvider>
            </ProjectProvider>
          </AuthProvider>
        </QueryClientProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
};

export default Root;
