import type { FC } from "react";
import { useEffect } from "react";
import { Spinner, useNotify } from "@canonical/react-components";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import { getInheritedNetworks } from "util/configInheritance";
import { useNetworks } from "context/useNetworks";
import { useProfiles } from "context/useProfiles";
import NetworkDeviceFormInherited from "components/forms/NetworkDevicesForm/read/NetworkDeviceFormInherited";
import NetworkDeviceFormCustom from "components/forms/NetworkDevicesForm/read/NetworkDeviceFormCustom";
import ScrollableForm from "components/ScrollableForm";

interface Props {
  formik: InstanceAndProfileFormikProps;
  project: string;
}

const NetworkDevicesForm: FC<Props> = ({ formik, project }) => {
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
    data: networks = [],
    isLoading: isNetworkLoading,
    error: networkError,
  } = useNetworks(project);

  useEffect(() => {
    if (networkError) {
      notify.failure("Loading networks failed", networkError);
    }
  }, [networkError]);

  if (isProfileLoading || isNetworkLoading) {
    return <Spinner className="u-loader" text="Loading..." />;
  }

  const managedNetworks = networks.filter((network) => network.managed);

  const inheritedNetworks = getInheritedNetworks(formik.values, profiles);

  return (
    <div className="network-device-form device-form">
      <ScrollableForm>
        <NetworkDeviceFormInherited
          formik={formik}
          inheritedNetworkDevices={inheritedNetworks}
          project={project}
          managedNetworks={managedNetworks}
        />
        <NetworkDeviceFormCustom
          formik={formik}
          inheritedNetworkDevices={inheritedNetworks}
          project={project}
          managedNetworks={managedNetworks}
        />
      </ScrollableForm>
    </div>
  );
};
export default NetworkDevicesForm;
