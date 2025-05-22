import type { FC } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { RenameHeaderValues } from "components/RenameHeader";
import RenameHeader from "components/RenameHeader";
import { useFormik } from "formik";
import * as Yup from "yup";
import type { LxdStorageVolume } from "types/storage";
import { hasLocation, testCopyStorageVolumeName } from "util/storageVolume";
import { useNotify } from "@canonical/react-components";
import { useToastNotification } from "context/toastNotificationProvider";
import ResourceLink from "components/ResourceLink";
import { renameStorageVolume } from "api/storage-volumes";
import { useStorageVolumeEntitlements } from "util/entitlements/storage-volumes";
import StorageVolumeDetailActions from "./StorageVolumeDetailActions";

interface Props {
  volume: LxdStorageVolume;
  project: string;
}

const StorageVolumeHeader: FC<Props> = ({ volume, project }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const controllerState = useState<AbortController | null>(null);
  const { canEditVolume } = useStorageVolumeEntitlements();

  const getDisabledReason = (volume: LxdStorageVolume) => {
    if ((volume.used_by?.length ?? 0) > 0) {
      return "Can not rename, volume is currently in use.";
    }
    if (!canEditVolume(volume)) {
      return "You do not have permission to rename this volume";
    }
    return undefined;
  };

  const RenameSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        ...testCopyStorageVolumeName(
          project,
          volume.type,
          controllerState,
          volume,
        ),
      )
      .required("This field is required"),
  });

  const formik = useFormik<RenameHeaderValues>({
    initialValues: {
      name: volume.name,
      isRenaming: false,
    } as RenameHeaderValues,
    validationSchema: RenameSchema,
    onSubmit: (values) => {
      if (volume.name === values.name) {
        formik.setFieldValue("isRenaming", false);
        formik.setSubmitting(false);
        return;
      }
      renameStorageVolume(project, volume, values.name, volume.location)
        .then(() => {
          const url = hasLocation(volume)
            ? `/ui/project/${project}/storage/pool/${volume.pool}/member/${volume.location}/volumes/${volume.type}/${values.name}`
            : `/ui/project/${project}/storage/pool/${volume.pool}/volumes/${volume.type}/${values.name}`;

          navigate(url);
          toastNotify.success(
            <>
              Storage volume <strong>{volume.name}</strong> renamed to{" "}
              <ResourceLink type="volume" value={values.name} to={url} />.
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
      name={volume.name}
      parentItems={[
        <Link to={`/ui/project/${project}/storage/volumes`} key={1}>
          Storage volumes
        </Link>,
      ]}
      controls={
        volume ? (
          <StorageVolumeDetailActions project={project} volume={volume} />
        ) : null
      }
      isLoaded={true}
      formik={formik}
      renameDisabledReason={getDisabledReason(volume)}
    />
  );
};

export default StorageVolumeHeader;
