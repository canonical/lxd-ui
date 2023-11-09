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

const queryClient = new QueryClient();

const Root: FC = () => {
  return (
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
  );
};

export default Root;
