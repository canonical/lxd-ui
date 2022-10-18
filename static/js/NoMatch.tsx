import React, { FC } from "react";
import { Strip } from "@canonical/react-components";

const NoMatch: FC = () => {
  return (
    <Strip>
      <h1>Page not found</h1>
      <p className="p-heading--4">Sorry, we could not find that page</p>
    </Strip>
  );
};

export default NoMatch;
