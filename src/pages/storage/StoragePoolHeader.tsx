import { useState, type FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import RenameHeader from "components/RenameHeader";
import type { RenameHeaderValues } from "components/RenameHeader";
import type { LxdStoragePool } from "types/storage";
import DeleteStoragePoolBtn from "pages/storage/actions/DeleteStoragePoolBtn";
import { useNotify, useToastNotification } from "@canonical/react-components";
import * as Yup from "yup";
import { testDuplicateStoragePoolName } from "util/storagePool";
import { useFormik } from "formik";
import { renameStoragePool } from "api/storage-pools";
import { ROOT_PATH } from "util/rootPath";
import StoragePoolRichChip from "./StoragePoolRichChip";

interface Props {
  name: string;
  pool: LxdStoragePool;
  project: string;
}

const StoragePoolHeader: FC<Props> = ({ name, pool, project }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const controllerState = useState<AbortController | null>(null);

  const RenameSchema = Yup.object().shape({
    name: Yup.string()
      .test(...testDuplicateStoragePoolName(project, controllerState))
      .required("This field is required"),
  });

  const formik = useFormik<RenameHeaderValues>({
    initialValues: {
      name,
      isRenaming: false,
    },
    validationSchema: RenameSchema,
    onSubmit: (values) => {
      if (name === values.name) {
        formik.setFieldValue("isRenaming", false);
        formik.setSubmitting(false);
        return;
      }
      renameStoragePool(name, values.name)
        .then(() => {
          const url = `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/storage/pool/${encodeURIComponent(values.name)}`;
          navigate(url);
          toastNotify.success(
            <>
              Storage pool <strong>{name}</strong> renamed to{" "}
              <StoragePoolRichChip
                poolName={values.name}
                projectName={project}
              />
            </>,
          );
          formik.setFieldValue("isRenaming", false);
        })
        .catch((e) => {
          notify.failure("Renaming failed", e);
        })
        .finally(() => {
          formik.setSubmitting(false);
        });
    },
  });

  return (
    <RenameHeader
      name={name}
      parentItems={[
        <Link
          to={`${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/storage/pools`}
          key={1}
        >
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
