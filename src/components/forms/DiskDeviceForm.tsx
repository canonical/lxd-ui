import { FC } from "react";
import { Input, useNotify } from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchStoragePools } from "api/storage-pools";
import { InstanceAndProfileFormikProps } from "./instanceAndProfileFormValues";
import { fetchProfiles } from "api/profiles";
import Loader from "components/Loader";
import { getInheritedVolumes } from "util/configInheritance";
import DiskDeviceFormRoot from "./DiskDeviceFormRoot";
import DiskDeviceFormInherited from "./DiskDeviceFormInherited";
import DiskDeviceFormCustom from "./DiskDeviceFormCustom";
import classnames from "classnames";
import ScrollableForm from "components/ScrollableForm";

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
  } = useQuery({
    queryKey: [queryKeys.profiles],
    queryFn: () => fetchProfiles(project),
  });

  if (profileError) {
    notify.failure("Loading profiles failed", profileError);
  }

  const {
    data: pools = [],
    isLoading: isStorageLoading,
    error: storageError,
  } = useQuery({
    queryKey: [queryKeys.storage],
    queryFn: () => fetchStoragePools(project),
  });

  if (storageError) {
    notify.failure("Loading storage pools failed", storageError);
  }

  if (isProfileLoading || isStorageLoading) {
    return <Loader />;
  }

  const inheritedVolumes = getInheritedVolumes(formik.values, profiles);

  return (
    <div
      className={classnames("disk-device-form", {
        "disk-device-form--edit": !formik.values.readOnly,
      })}
    >
      <ScrollableForm>
        {/* hidden submit to enable enter key in inputs */}
        <Input type="submit" hidden value="Hidden input" />
        <DiskDeviceFormRoot
          formik={formik}
          project={project}
          pools={pools}
          profiles={profiles}
        />
        <DiskDeviceFormInherited
          formik={formik}
          inheritedVolumes={inheritedVolumes}
        />
        <DiskDeviceFormCustom
          formik={formik}
          project={project}
          inheritedVolumes={inheritedVolumes}
        />
      </ScrollableForm>
    </div>
  );
};

export default DiskDeviceForm;
