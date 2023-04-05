import React, { FC, useState } from "react";
import { Link } from "react-router-dom";
import InstanceStateActions from "pages/instances/actions/InstanceStateActions";
import DeleteInstanceBtn from "./actions/DeleteInstanceBtn";
import { LxdInstance } from "types/instance";
import InstanceRename from "pages/instances/forms/InstanceRename";
import { Tooltip } from "@canonical/react-components";

interface Props {
  name: string;
  instance?: LxdInstance;
  project: string;
}

const InstanceDetail: FC<Props> = ({ name, instance, project }) => {
  const [isRename, setRename] = useState(false);
  const canRename = instance?.status === "Stopped";

  return (
    <div className="p-panel__header">
      <h1 className="u-off-screen">{name}</h1>
      {instance ? (
        <div className="p-panel__title">
          <nav
            key="breadcrumbs"
            className="p-breadcrumbs"
            aria-label="Breadcrumbs"
          >
            <ol className="p-breadcrumbs__items">
              <li className="p-breadcrumbs__item">
                <Link to={`/ui/${project}/instances`}>Instances</Link>
              </li>
              {isRename ? (
                <li className="p-breadcrumbs__item instance-rename">
                  <InstanceRename
                    instance={instance}
                    project={project}
                    closeForm={() => setRename(false)}
                  />
                </li>
              ) : (
                <li
                  className="p-breadcrumbs__item instance-name u-truncate"
                  onClick={() => canRename && setRename(true)}
                  title={name}
                >
                  <Tooltip
                    message={!canRename && "Stop the instance to rename"}
                    position="btm-left"
                  >
                    {name}
                  </Tooltip>
                </li>
              )}
            </ol>
          </nav>
          {!isRename && (
            <div>
              <i className="status u-text--muted">{instance.status}</i>
              <InstanceStateActions key="state" instance={instance} />
            </div>
          )}
        </div>
      ) : (
        <h4 className="p-panel__title">{name}</h4>
      )}
      <div className="p-panel__controls">
        {instance && !isRename && <DeleteInstanceBtn instance={instance} />}
      </div>
    </div>
  );
};

export default InstanceDetail;
