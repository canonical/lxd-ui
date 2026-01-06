import type { FC } from "react";
import { Link } from "react-router-dom";
import ItemName from "components/ItemName";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  instance: {
    name: string;
    project: string;
  };
}

const InstanceLink: FC<Props> = ({ instance }) => {
  return (
    <Link
      to={`${ROOT_PATH}/ui/project/${encodeURIComponent(instance.project)}/instance/${encodeURIComponent(instance.name)}`}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <ItemName item={instance} />
    </Link>
  );
};

export default InstanceLink;
