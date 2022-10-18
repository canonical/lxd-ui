import React, { FC, useState } from "react";
import { startInstance } from "../../api/instances";
import { LxdInstance } from "../../types/instance";

type Props = {
  instance: LxdInstance;
  onSuccess: Function;
  onFailure: Function;
};

const StartInstanceBtn: FC<Props> = ({ instance, onSuccess, onFailure }) => {
  const [isLoading, setLoading] = useState(false);

  const handleStart = () => {
    setLoading(true);
    startInstance(instance)
      .then(() => {
        setLoading(false);
        onSuccess();
      })
      .catch(() => {
        setLoading(false);
        onFailure("Error on instance start.");
      });
  };

  return (
    <button
      onClick={handleStart}
      className="is-dense"
      disabled={isLoading || instance.status !== "Stopped"}
    >
      <i
        className={
          isLoading ? "p-icon--spinner u-animation--spin" : "p-icon--video-play"
        }
      >
        Start
      </i>
    </button>
  );
};

export default StartInstanceBtn;
