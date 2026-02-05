import type { FC } from "react";
import { Input, useNotify, Spinner } from "@canonical/react-components";
import type { InstanceAndProfileFormikProps } from "../../types/forms/instanceAndProfileFormProps";
import { getInheritedDiskDevices } from "util/configInheritance";
import DiskDeviceFormRoot from "./DiskDeviceFormRoot";
import DiskDeviceFormInherited from "./DiskDeviceFormInherited";
import DiskDeviceFormCustom from "./DiskDeviceFormCustom";
import classnames from "classnames";
import ScrollableForm from "components/ScrollableForm";
import { useProfiles } from "context/useProfiles";
import { useStoragePools } from "context/useStoragePools";

interface Props {
  formik: InstanceAndProfileFormikProps;
  project: string;
}

const DiskDeviceForm: FC<Props> = ({ formik, project }) => {
  const notify = useNotify();

  const {
    data: profiles = [],
    isLoading: isProfileLoading,
    error: profileError,
  } = useProfiles(project);

  if (profileError) {
    notify.failure("Loading profiles failed", profileError);
  }

  const {
    data: pools = [],
    isLoading: isStorageLoading,
    error: storageError,
  } = useStoragePools();

  if (storageError) {
    notify.failure("Loading storage pools failed", storageError);
  }

  if (isProfileLoading || isStorageLoading) {
    return <Spinner className="u-loader" text="Loading..." />;
  }

  const inheritedDiskDevices = getInheritedDiskDevices(formik.values, profiles);

  return (
    <div
      className={classnames("disk-device-form", "device-form", {
        "disk-device-form--edit": !formik.values.readOnly,
      })}
    >
      <ScrollableForm>
        {/* hidden submit to enable enter key in inputs */}
        <Input type="submit" hidden value="Hidden input" />
        <DiskDeviceFormRoot
          formik={formik}
          pools={pools}
          profiles={profiles}
          project={project}
        />
        <DiskDeviceFormInherited
          formik={formik}
          inheritedDiskDevices={inheritedDiskDevices}
          project={project}
        />
        <DiskDeviceFormCustom
          formik={formik}
          project={project}
          profiles={profiles}
        />
      </ScrollableForm>
    </div>
  );
};

export default DiskDeviceForm;
