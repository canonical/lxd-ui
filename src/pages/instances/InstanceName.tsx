import React, { FC } from "react";

interface Props {
  instance: {
    name: string;
  };
  bold?: boolean;
}

const InstanceName: FC<Props> = ({ instance, bold = false }) => {
  const name = <span className="u-break-long-names">{instance.name}</span>;
  return bold ? <b>{name}</b> : name;
};

export default InstanceName;
