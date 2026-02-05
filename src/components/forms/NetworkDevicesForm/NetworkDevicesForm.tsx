import type { FC } from "react";
import { useEffect } from "react";
import { Button, Icon, Spinner, useNotify } from "@canonical/react-components";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";
import { getInheritedNetworks } from "util/configInheritance";
import { useNetworks } from "context/useNetworks";
import { useProfiles } from "context/useProfiles";
import NetworkDeviceFormInherited from "components/forms/NetworkDevicesForm/read/NetworkDeviceFormInherited";
import NetworkDeviceFormCustom from "components/forms/NetworkDevicesForm/read/NetworkDeviceFormCustom";
import ScrollableForm from "components/ScrollableForm";
import usePanelParams from "util/usePanelParams";

interface Props {
  formik: InstanceAndProfileFormikProps;
  project: string;
}

const NetworkDevicesForm: FC<Props> = ({ formik, project }) => {
  const notify = useNotify();
  const panelParams = usePanelParams();

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
        <Button
          onClick={panelParams.openCreateNetworkDevice}
          type="button"
          hasIcon
          disabled={!!formik.values.editRestriction}
          title={formik.values.editRestriction}
        >
          <Icon name="plus" />
          <span>Attach network</span>
        </Button>
      </ScrollableForm>
    </div>
  );
};
export default NetworkDevicesForm;
