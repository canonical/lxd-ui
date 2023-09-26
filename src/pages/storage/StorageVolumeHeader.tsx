import React, { FC, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RenameHeader, { RenameHeaderValues } from "components/RenameHeader";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LxdStorageVolume } from "types/storage";
import { renameStorageVolume } from "api/storage-pools";
import { testDuplicateStorageVolumeName } from "util/storageVolume";
import { useNotify } from "@canonical/react-components";
import DeleteStorageVolumeBtn from "pages/storage/actions/DeleteStorageVolumeBtn";

interface Props {
  volume: LxdStorageVolume;
  project: string;
  storagePool: string;
}

const StorageVolumeHeader: FC<Props> = ({ volume, project, storagePool }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const controllerState = useState<AbortController | null>(null);

  const RenameSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        ...testDuplicateStorageVolumeName(
          project,
          volume.type,
          storagePool,
          controllerState,
          volume.name
        )
      )
      .required("This field is required"),
  });

  const formik = useFormik<RenameHeaderValues>({
    initialValues: {
      name: volume.name,
      isRenaming: false,
    },
    validationSchema: RenameSchema,
    onSubmit: (values) => {
      if (volume.name === values.name) {
        void formik.setFieldValue("isRenaming", false);
        formik.setSubmitting(false);
        return;
      }
      renameStorageVolume(storagePool, project, volume, values.name)
        .then(() => {
          navigate(
            `/ui/project/${project}/storage/detail/${storagePool}/${volume.type}/${values.name}`,
            notify.queue(notify.success("Storage volume renamed."))
          );
          void formik.setFieldValue("isRenaming", false);
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
      name={volume.name}
      parentItems={[
        <Link to={`/ui/project/${project}/storage`} key={1}>
          Storage pools
        </Link>,
        <Link
          to={`/ui/project/${project}/storage/detail/${storagePool}/volumes`}
          key={2}
        >
          {storagePool}
        </Link>,
      ]}
      controls={
        <DeleteStorageVolumeBtn
          label="Delete"
          pool={storagePool}
          volume={volume}
          project={project}
          appearance=""
          hasIcon={false}
          onFinish={() => {
            navigate(
              `/ui/project/${project}/storage/detail/${storagePool}/volumes`,
              notify.queue(
                notify.success(`Storage volume ${volume.name} deleted.`)
              )
            );
          }}
        />
      }
      isLoaded={true}
      formik={formik}
      renameDisabledReason={
        (volume.used_by?.length ?? 0) > 0
          ? "Can not rename, volume is currently in use."
          : undefined
      }
    />
  );
};

export default StorageVolumeHeader;
