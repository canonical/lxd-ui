import { FC, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RenameHeader, { RenameHeaderValues } from "components/RenameHeader";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LxdStorageVolume } from "types/storage";
import { renameStorageVolume } from "api/storage-pools";
import { testDuplicateStorageVolumeName } from "util/storageVolume";
import { useNotify } from "@canonical/react-components";
import DeleteStorageVolumeBtn from "pages/storage/actions/DeleteStorageVolumeBtn";
import { useToastNotification } from "context/toastNotificationProvider";

interface Props {
  volume: LxdStorageVolume;
  project: string;
}

const StorageVolumeHeader: FC<Props> = ({ volume, project }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const controllerState = useState<AbortController | null>(null);

  const RenameSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        ...testDuplicateStorageVolumeName(
          project,
          volume.type,
          controllerState,
          volume.name,
        ),
      )
      .required("This field is required"),
  });

  const formik = useFormik<RenameHeaderValues>({
    initialValues: {
      name: volume.name,
      isRenaming: false,
      pool: volume.pool,
    } as RenameHeaderValues,
    validationSchema: RenameSchema,
    onSubmit: (values) => {
      if (volume.name === values.name) {
        void formik.setFieldValue("isRenaming", false);
        formik.setSubmitting(false);
        return;
      }
      renameStorageVolume(project, volume, values.name)
        .then(() => {
          navigate(
            `/ui/project/${project}/storage/pool/${volume.pool}/volumes/${volume.type}/${values.name}`,
          );
          toastNotify.success(
            `Storage volume ${volume.name} renamed to ${values.name}.`,
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
        <Link to={`/ui/project/${project}/storage/volumes`} key={1}>
          Storage volumes
        </Link>,
      ]}
      controls={
        <DeleteStorageVolumeBtn
          label="Delete volume"
          volume={volume}
          project={project}
          appearance=""
          hasIcon={false}
          onFinish={() => {
            navigate(`/ui/project/${project}/storage/volumes`);
            toastNotify.success(`Storage volume ${volume.name} deleted.`);
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
