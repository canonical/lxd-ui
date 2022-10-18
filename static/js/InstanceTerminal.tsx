import React, { FC } from "react";
import { useParams } from "react-router-dom";

const InstanceTerminal: FC = () => {
  const { name } = useParams();

  return (
    <>
      <div className="p-panel__header">
        <h4 className="p-panel__title">Terminal for {name}</h4>
      </div>
      <div className="p-panel__content">Here be dragons</div>
    </>
  );
};

export default InstanceTerminal;
