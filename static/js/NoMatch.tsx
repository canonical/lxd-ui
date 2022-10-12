import React from "react";
import { Strip } from "@canonical/react-components";

const NoMatch = () => {
  return (
    <Strip>
      <h1>Page not found</h1>
      <p className="p-heading--4">Sorry, we could not find that page</p>
    </Strip>
  );
};

export default NoMatch;
