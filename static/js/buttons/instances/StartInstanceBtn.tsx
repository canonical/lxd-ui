import React, { FC, useState } from "react";
import { startInstance } from "../../api/instances";
import { LxdInstance } from "../../types/instance";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../util/queryKeys";

type Props = {
  instance: LxdInstance;
  onFailure: Function;
};

const StartInstanceBtn: FC<Props> = ({ instance, onFailure }) => {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleStart = () => {
    setLoading(true);
    startInstance(instance)
      .then(() => {
        setLoading(false);
        queryClient.invalidateQueries({
          queryKey: [queryKeys.instances],
        });
      })
      .catch((e) => {
        setLoading(false);
        onFailure(`Error on instance start. ${e.toString()}`);
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
