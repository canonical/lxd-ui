import React, { FC } from "react";
import { Link } from "react-router-dom";
import { LxdInstance } from "types/instance";

interface Props {
  instance: LxdInstance;
}

const OpenInstanceDetailBtn: FC<Props> = ({ instance }) => {
  return (
    <Link
      className="p-button is-dense u-no-margin--bottom"
      to={`/ui/${instance.project}/instances/${instance.name}`}
    >
      View instance
    </Link>
  );
};

export default OpenInstanceDetailBtn;
