import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import Navigation from "components/Navigation";
import Panels from "components/Panels";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SharedNotifyProvider } from "./context/sharedNotify";
import { AuthProvider } from "./context/auth";
import App from "./App";

const queryClient = new QueryClient();

const rootElement = document.getElementById("app");
if (!rootElement) throw new Error("Failed to find the root element");
const root = createRoot(rootElement);
root.render(
  <Router>
    <QueryClientProvider client={queryClient}>
      <SharedNotifyProvider>
        <AuthProvider>
          <div className="l-application" role="presentation">
            <Navigation />
            <App />
            <Panels />
          </div>
        </AuthProvider>
      </SharedNotifyProvider>
    </QueryClientProvider>
  </Router>
);
