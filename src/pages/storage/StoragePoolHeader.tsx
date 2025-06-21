import type { FC } from "react";
import { Link } from "react-router-dom";
import RenameHeader from "components/RenameHeader";
import type { LxdStoragePool } from "types/storage";
import DeleteStoragePoolBtn from "pages/storage/actions/DeleteStoragePoolBtn";

interface Props {
  name: string;
  pool: LxdStoragePool;
  project: string;
}

const StoragePoolHeader: FC<Props> = ({ name, pool, project }) => {
  return (
    <RenameHeader
      name={name}
      parentItems={[
        <Link to={`/ui/project/${project}/storage/pools`} key={1}>
          Storage pools
        </Link>,
      ]}
      controls={[
        <DeleteStoragePoolBtn
          key="delete"
          pool={pool}
          project={project}
          shouldExpand
        />,
      ]}
      isLoaded
      renameDisabledReason="Cannot rename storage pools"
    />
  );
};

export default StoragePoolHeader;
