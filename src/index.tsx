import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./sass/styles.scss";
import Root from "./Root";

const rootElement = document.getElementById("app");

if (!rootElement) throw new Error("Failed to find the root element");

const root = createRoot(rootElement);

const router = createBrowserRouter([{ path: "*", Component: Root }]);

root.render(<RouterProvider router={router} />);
