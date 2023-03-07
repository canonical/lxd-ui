import React, { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import { LxdInstance } from "types/instance";
import { fetchInstanceLogs } from "api/instances";
import FileRow from "pages/instances/FileRow";

interface Props {
  instance: LxdInstance;
}

const InstanceLogs: FC<Props> = ({ instance }) => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: [
      queryKeys.instances,
      instance.name,
      instance.project,
      queryKeys.logs,
    ],
    queryFn: () => fetchInstanceLogs(instance.name, instance.project),
  });

  return (
    <>
      {isLoading && <Loader text="Loading logs..." />}
      {!isLoading && logs.length === 0 && (
        <div className="u-align-text--center">
          There are no log files for this instance.
        </div>
      )}
      {!isLoading &&
        logs.length > 0 &&
        logs.map((path) => {
          return <FileRow instance={instance} path={path} key={path} />;
        })}
    </>
  );
};

export default InstanceLogs;
