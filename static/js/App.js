import React from "react";
import { render } from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import InstanceList from "./InstanceList";
import Navigation from "./Navigation";
import NoMatch from "./NoMatch";
import InstanceForm from "./InstanceForm";
import ImageList from "./ImageList";

const App = () => {
  let homepageComponent = <InstanceList />;

  return (
    <Router>
      <div className="l-application" role="presentation">
        <Navigation />
        <main className="l-main">
          <div className="p-panel">
            <Switch>
              <Route exact path="/">
                {homepageComponent}
              </Route>
              <Route exact path="/instances">
                <InstanceList />
              </Route>
              <Route exact path="/instances/add">
                <InstanceForm />
              </Route>
              <Route exact path="/images">
                <ImageList />
              </Route>
              <Route>
                <NoMatch />
              </Route>
            </Switch>
          </div>
        </main>
      </div>
    </Router>
  );
};

render(<App />, document.getElementById("app"));
