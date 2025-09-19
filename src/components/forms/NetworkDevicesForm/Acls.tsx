import type { FC } from "react";
import type { LxdNicDevice } from "types/device";
import type { LxdNetwork } from "types/network";
import type { CustomNetworkDevice } from "util/formDevices";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import ExpandableList from "components/ExpandableList";
import ResourceLink from "components/ResourceLink";
import NetworkAclSelector from "pages/networks/forms/NetworkAclSelector";

interface Props {
  project: string;
  managedNetworks: LxdNetwork[];
  device: LxdNicDevice | CustomNetworkDevice;
  readOnly?: boolean;
  formik?: InstanceAndProfileFormikProps;
  index?: number;
  canSelectManualAcls?: boolean;
}

const Acls: FC<Props> = ({
  project,
  managedNetworks,
  device,
  readOnly,
  formik,
  index,
  canSelectManualAcls,
}) => {
  const getNetworkAcls = (networkName: string) => {
    const network = managedNetworks.find((t) => t.name === networkName);
    if (network) {
      return network.config["security.acls"]?.split(",") || [];
    }
    return [];
  };

  const getDeviceAcls = (device: LxdNicDevice | CustomNetworkDevice) => {
    return (device as LxdNicDevice)["security.acls"]?.split(",") || [];
  };

  const networkAcls = getNetworkAcls((device as LxdNicDevice).network);
  const deviceAcls = getDeviceAcls(device);

  return (
    <>
      {networkAcls.length > 0 && (
        <div className="acls-from-network">
          ACLs from network
          <div className="acls-list">
            <ExpandableList
              items={networkAcls.map((acl) => (
                <div key={acl} className="u-whitespace-nowrap">
                  <ResourceLink
                    type="network-acl"
                    value={acl}
                    to={`/ui/project/${encodeURIComponent(project || "default")}/network-acl/${encodeURIComponent(acl)}`}
                  />
                </div>
              ))}
            />
          </div>
        </div>
      )}
      {(deviceAcls.length > 0 ||
        (!readOnly &&
          formik &&
          index !== undefined &&
          canSelectManualAcls)) && (
        <div>
          Manual ACLs
          {readOnly && (
            <ExpandableList
              items={deviceAcls.map((acl) => (
                <div key={acl} className="u-whitespace-nowrap">
                  <ResourceLink
                    type="network-acl"
                    value={acl}
                    to={`/ui/project/${encodeURIComponent(project || "default")}/network-acl/${encodeURIComponent(acl)}`}
                  />
                </div>
              ))}
            />
          )}
          {!readOnly &&
            formik &&
            index !== undefined &&
            canSelectManualAcls && (
              <NetworkAclSelector
                project={project}
                selectedAcls={
                  (formik.values.devices[index] as LxdNicDevice)[
                    "security.acls"
                  ]
                    ?.split(",")
                    .filter((t: string) => t) || []
                }
                setSelectedAcls={(selectedItems) => {
                  formik.setFieldValue(
                    `devices.${index}["security.acls"]`,
                    selectedItems.join(","),
                  );
                }}
              />
            )}
        </div>
      )}
    </>
  );
};

export default Acls;
