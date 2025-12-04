import type { FC, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { QueuedNotification } from "@canonical/react-components";
import {
  NotificationProvider,
  ToastNotificationProvider,
} from "@canonical/react-components";
import { useLocation } from "react-router-dom";
import { AuthProvider } from "context/auth";
import { EventQueueProvider } from "context/eventQueue";
import { InstanceLoadingProvider } from "context/instanceLoading";
import { ProjectProvider } from "context/useCurrentProject";
import OperationsProvider from "context/operationsProvider";
import { MetricHistoryProvider } from "context/metricHistory";
import { MemberLoadingProvider } from "context/memberLoading";
import { ModalProvider } from "context/useModal";
import { LxdApiError } from "util/helpers";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        if (error instanceof LxdApiError) {
          // Do not retry for 404 errors
          if (error.status === 404) {
            return false;
          }
        }

        // Retry a maximum of 3 times for other errors
        return failureCount < 3;
      },
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
}

const AppProviders: FC<AppProvidersProps> = ({ children }) => {
  const location = useLocation();
  const locationState = location.state as QueuedNotification | undefined;
  const notificationState = locationState?.state;
  const pathname = location.pathname;

  return (
    <ToastNotificationProvider>
      <NotificationProvider state={notificationState} pathname={pathname}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ProjectProvider>
              <OperationsProvider>
                <InstanceLoadingProvider>
                  <MemberLoadingProvider>
                    <EventQueueProvider>
                      <MetricHistoryProvider>
                        <ModalProvider>{children}</ModalProvider>
                      </MetricHistoryProvider>
                    </EventQueueProvider>
                  </MemberLoadingProvider>
                </InstanceLoadingProvider>
              </OperationsProvider>
            </ProjectProvider>
          </AuthProvider>
        </QueryClientProvider>
      </NotificationProvider>
    </ToastNotificationProvider>
  );
};

export default AppProviders;
