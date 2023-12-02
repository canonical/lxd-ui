import React from "react";
import ReactDOM from "react-dom/client";
import { Link, RouterProvider, createBrowserRouter } from "react-router-dom";

import Panel from "components/Panel";
import ReBACAdmin from "components/ReBACAdmin";

import App from "./App";

import "./scss/index.scss";

const root = document.getElementById("root");

const defferRender = async () => {
  const { mockApiWorker } = await import("./mockApiWorker");
  return mockApiWorker.start();
};

const admin = () => <ReBACAdmin apiURL="/api" />;

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: (
          <Panel title="Demo">
            <div className="u-fixed-width">
              <Link to="/permissions">Go to ReBAC Admin</Link>
            </div>
          </Panel>
        ),
      },
      {
        path: "models",
        element: <Panel title="Models" />,
      },
      {
        path: "controllers",
        element: <Panel title="Controllers" />,
      },
      {
        path: "permissions/*",
        element: admin(),
      },
    ],
  },
]);

if (root) {
  defferRender()
    .then(() => {
      ReactDOM.createRoot(root).render(
        <React.StrictMode>
          <RouterProvider router={router} />
        </React.StrictMode>,
      );
      return;
    })
    .catch((error) =>
      console.error("Error while trying to start mock API worker.", error),
    );
} else {
  console.error("Root element not found in DOM.");
}
