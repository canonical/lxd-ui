import React, { FC } from "react";
import { Link } from "react-router-dom";

const OpenInstanceListBtn: FC = () => {
  return (
    <Link className="p-button u-no-margin--bottom" to="/instances">
      Back
    </Link>
  );
};

export default OpenInstanceListBtn;
