import { FC } from "react";
import Navigation from "components/Navigation";
import { QueuedNotification } from "@canonical/react-components";
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
import CombinedNotificationProvider from "context/CombinedNotificationProvider";
import StatusBar from "components/StatusBar";
import OperationsProvider from "context/operationsProvider";

const queryClient = new QueryClient();

const Root: FC = () => {
  const location = useLocation() as QueuedNotification;

  return (
    <ErrorBoundary fallback={ErrorPage}>
      <CombinedNotificationProvider
        state={location.state}
        pathname={location.pathname}
      >
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ProjectProvider>
              <InstanceLoadingProvider>
                <OperationsProvider>
                  <EventQueueProvider>
                    <div className="l-application" role="presentation">
                      <Navigation />
                      <ErrorBoundary fallback={ErrorPage}>
                        <App />
                        <Panels />
                        <Events />
                        <StatusBar />
                      </ErrorBoundary>
                    </div>
                  </EventQueueProvider>
                </OperationsProvider>
              </InstanceLoadingProvider>
            </ProjectProvider>
          </AuthProvider>
        </QueryClientProvider>
      </CombinedNotificationProvider>
    </ErrorBoundary>
  );
};

export default Root;
