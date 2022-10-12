import React, { useState } from "react";
import { LxdInstance, stopInstance } from "../../api/instances";

type Props = {
  instance: LxdInstance;
  onSuccess: Function;
  onFailure: Function;
};

function StopInstanceBtn({ instance, onSuccess, onFailure }: Props) {
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
}

export default StopInstanceBtn;
