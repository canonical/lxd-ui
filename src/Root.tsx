import React, { FC } from "react";
import Navigation from "components/Navigation";
import { NotificationProvider } from "@canonical/react-components";
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

const queryClient = new QueryClient();

const Root: FC = () => {
  return (
    <ErrorBoundary fallback={ErrorPage}>
      <NotificationProvider>
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
