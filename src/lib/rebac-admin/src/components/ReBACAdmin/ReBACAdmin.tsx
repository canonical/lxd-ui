import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { Route, Routes } from "react-router-dom";

import Panel from "components/Panel";
import urls from "urls";

export type Props = {
  // The absolute API URL.
  apiURL: `${"http" | "/"}${string}`;
};

const ReBACAdmin = ({ apiURL }: Props) => {
  const queryClient = new QueryClient();
  axios.defaults.baseURL = apiURL;

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route
          path={urls.index}
          element={<Panel title="Canonical ReBAC Admin" />}
        />
        <Route
          path={urls.accessGovernance.index}
          element={<Panel title="Access Governance" />}
        />
        <Route
          path={urls.authentication.index}
          element={<Panel title="Authentication" />}
        />
        <Route
          path={urls.entitlements}
          element={<Panel title="Entitlements" />}
        />
        <Route path={urls.groups.index} element={<Panel title="Groups" />} />
        <Route
          path={urls.resources.index}
          element={<Panel title="Resources" />}
        />
        <Route path={urls.roles.index} element={<Panel title="Roles" />} />
        <Route path={urls.users.index} element={<Panel title="Users" />} />
      </Routes>
    </QueryClientProvider>
  );
};

export default ReBACAdmin;
