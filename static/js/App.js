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
              <Route exact path="/" element={<InstanceList />} />
              <Route exact path="/instances" element={<InstanceList />} />
              <Route exact path="/instances/add" element={<InstanceForm />} />
              <Route exact path="/images" element={<ImageList />} />
              <Route element={NoMatch} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

const root = createRoot(document.getElementById("app"));
root.render(<App />);
