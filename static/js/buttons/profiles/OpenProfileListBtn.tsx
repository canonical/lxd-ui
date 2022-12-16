import React, { FC } from "react";
import { Link } from "react-router-dom";

const OpenProfileListBtn: FC = () => {
  return (
    <Link className="p-button u-no-margin--bottom" to="/profiles">
      Back
    </Link>
  );
};

export default OpenProfileListBtn;
