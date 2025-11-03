import type { FC } from "react";
import Navigation from "components/Navigation";
import { Application, SkipLink } from "@canonical/react-components";
import Events from "pages/instances/Events";
import App from "./App";
import ErrorBoundary from "components/ErrorBoundary";
import ErrorPage from "components/ErrorPage";
import StatusBar from "components/StatusBar";
import AppProviders from "context/appProviders";

const Root: FC = () => {
  return (
    <ErrorBoundary fallback={ErrorPage}>
      <AppProviders>
        <Application id="l-application">
          <SkipLink mainId="main-content" />
          <Navigation />
          <ErrorBoundary fallback={ErrorPage}>
            <App />
            <Events />
            <StatusBar />
          </ErrorBoundary>
        </Application>
      </AppProviders>
    </ErrorBoundary>
  );
};

export default Root;
