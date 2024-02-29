import { FC, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RenameHeader, { RenameHeaderValues } from "components/RenameHeader";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LxdStoragePool } from "types/storage";
import { renameStoragePool } from "api/storage-pools";
import DeleteStoragePoolBtn from "pages/storage/actions/DeleteStoragePoolBtn";
import { testDuplicateStoragePoolName } from "util/storagePool";
import { useNotify } from "@canonical/react-components";
import { useToastNotification } from "context/toastNotificationProvider";

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
        void formik.setFieldValue("isRenaming", false);
        formik.setSubmitting(false);
        return;
      }
      renameStoragePool(name, values.name, project)
        .then(() => {
          navigate(`/ui/project/${project}/storage/pool/${values.name}`);
          toastNotify.success(
            `Storage pool ${name} renamed to ${values.name}.`,
          );
          void formik.setFieldValue("isRenaming", false);
        })
        .catch((e) => {
          notify.failure("Renaming failed", e);
        })
        .finally(() => formik.setSubmitting(false));
    },
  });

  return (
    <RenameHeader
      name={name}
      parentItems={[
        <Link to={`/ui/project/${project}/storage`} key={1}>
          Storage pools
        </Link>,
      ]}
      controls={[
        <DeleteStoragePoolBtn
          key="delete"
          pool={pool}
          project={project}
          shouldExpand={true}
        />,
      ]}
      isLoaded={true}
      formik={formik}
      renameDisabledReason="Cannot rename storage pools"
    />
  );
};

export default StoragePoolHeader;
