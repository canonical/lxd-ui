import React, { FC, useState } from "react";
import { stopInstance } from "../../api/instances";
import { LxdInstance } from "../../types/instance";

type Props = {
  instance: LxdInstance;
  onSuccess: Function;
  onFailure: Function;
};

const StopInstanceBtn: FC<Props> = ({ instance, onSuccess, onFailure }) => {
  const [isLoading, setLoading] = useState(false);

  const handleStop = () => {
    setLoading(true);
    stopInstance(instance)
      .then(() => {
        setLoading(false);
        onSuccess();
      })
      .catch(() => {
        setLoading(false);
        onFailure("Error on instance stop.");
      });
  };

  return (
    <button
      onClick={handleStop}
      className="is-dense"
      disabled={isLoading || instance.status !== "Running"}
    >
      <i
        className={
          isLoading ? "p-icon--spinner u-animation--spin" : "p-icon--power-off"
        }
      >
        Stop
      </i>
    </button>
  );
};

export default StopInstanceBtn;
