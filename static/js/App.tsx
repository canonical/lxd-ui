import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import InstanceList from "./InstanceList";
import Navigation from "./Navigation";
import NoMatch from "./NoMatch";
import InstanceForm from "./InstanceForm";
import ImageList from "./ImageList";
import { createRoot } from "react-dom/client";

const App = () => {
  return (
    <Router>
      <div className="l-application" role="presentation">
        <Navigation />
        <main className="l-main">
          <div className="p-panel">
            <Routes>
              <Route path="/" element={<InstanceList />} />
              <Route path="/instances" element={<InstanceList />} />
              <Route path="/instances/add" element={<InstanceForm />} />
              <Route path="/images" element={<ImageList />} />
              <Route path="*" element={<NoMatch />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

const rootElement = document.getElementById("app");
if (!rootElement) throw new Error("Failed to find the root element");
const root = createRoot(rootElement);
root.render(<App />);
