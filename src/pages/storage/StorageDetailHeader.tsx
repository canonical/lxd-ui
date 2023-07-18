import React, { FC, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RenameHeader, { RenameHeaderValues } from "components/RenameHeader";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LxdStoragePool } from "types/storage";
import { renameStoragePool } from "api/storage-pools";
import DeleteStorageBtn from "pages/storage/actions/DeleteStorageBtn";
import { testDuplicateName } from "util/storage";
import { useNotify } from "@canonical/react-components";

interface Props {
  name: string;
  storagePool: LxdStoragePool;
  project: string;
}

const StorageDetailHeader: FC<Props> = ({ name, storagePool, project }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const controllerState = useState<AbortController | null>(null);

  const RenameSchema = Yup.object().shape({
    name: Yup.string()
      .test(...testDuplicateName(project, controllerState))
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
          navigate(
            `/ui/project/${project}/storage/${values.name}`,
            notify.queue(notify.success("Storage pool renamed."))
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
      parentItem={
        <Link to={`/ui/project/${project}/storage`}>Storage pools</Link>
      }
      controls={
        <DeleteStorageBtn
          key="delete"
          storage={storagePool}
          project={project}
          shouldExpand={true}
        />
      }
      isLoaded={true}
      formik={formik}
      renameDisabledReason="Cannot rename storage pools"
    />
  );
};

export default StorageDetailHeader;
