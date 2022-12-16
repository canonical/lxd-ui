import React, { FC } from "react";
import { Link } from "react-router-dom";

interface Props {
  instanceName: string;
}

const OpenInstanceDetailBtn: FC<Props> = ({ instanceName }) => {
  return (
    <Link
      className="p-button is-dense u-no-margin--bottom"
      to={`/instances/${instanceName}`}
    >
      View instance
    </Link>
  );
};

export default OpenInstanceDetailBtn;
