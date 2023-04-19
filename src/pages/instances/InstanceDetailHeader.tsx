import React, { FC, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DeleteInstanceBtn from "./actions/DeleteInstanceBtn";
import { LxdInstance } from "types/instance";
import RenameHeader from "components/RenameHeader";
import { renameInstance } from "api/instances";
import { useNotify } from "context/notify";
import InstanceStateActions from "pages/instances/actions/InstanceStateActions";

interface Props {
  name: string;
  instance?: LxdInstance;
  project: string;
}

const InstanceDetailHeader: FC<Props> = ({ name, instance, project }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const [isSubmitting, setSubmitting] = useState(false);

  const handleRename = (newName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (name === newName) {
        return resolve();
      }
      setSubmitting(true);
      renameInstance(name, newName, project)
        .then(() => {
          navigate(
            `/ui/${project}/instances/detail/${newName}`,
            notify.queue(notify.success("Instance renamed."))
          );
          resolve();
        })
        .catch((e) => {
          notify.failure("Renaming failed", e);
          reject();
        })
        .finally(() => setSubmitting(false));
    });
  };

  return (
    <RenameHeader
      name={name}
      parentItem={<Link to={`/ui/${project}/instances`}>Instances</Link>}
      renameDisabledReason={
        !instance || instance.status !== "Stopped"
          ? "Stop the instance to rename"
          : undefined
      }
      centerControls={
        instance ? (
          <div>
            <i className="status u-text--muted">{instance.status}</i>
            <InstanceStateActions key="state" instance={instance} />
          </div>
        ) : null
      }
      controls={
        instance ? <DeleteInstanceBtn key="delete" instance={instance} /> : null
      }
      isLoaded={Boolean(instance)}
      onRename={handleRename}
      isRenaming={isSubmitting}
    />
  );
};

export default InstanceDetailHeader;
