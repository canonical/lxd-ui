import { useEffect, useState, type FC } from "react";
import type { LxdNicDevice } from "types/device";
import type { LxdNetwork } from "types/network";
import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import NetworkSelector from "pages/projects/forms/NetworkSelector";
import NetworkAclSelector from "pages/networks/forms/NetworkAclSelector";
import { Button, Icon } from "@canonical/react-components";
import { ensureEditMode } from "util/instanceEdit";

interface Props {
  index: number;
  readOnly: boolean;
  project: string;
  formik: InstanceAndProfileFormikProps;
  focusNetwork: (id: number) => void;
  removeNetwork: (id: number) => void;
  managedNetworks: LxdNetwork[];
}

const NetworkDevice: FC<Props> = ({
  index,
  readOnly,
  project,
  formik,
  focusNetwork,
  removeNetwork,
  managedNetworks,
}) => {
  const shouldDisplayAcls = () => {
    const selectedNetwork = (formik.values.devices[index] as LxdNicDevice)
      .network;
    const managedNetwork = managedNetworks.find(
      (t) => t.name === selectedNetwork,
    );
    if (managedNetwork) {
      return managedNetwork.type === "ovn";
    }
    return false;
  };

  const [isAclsDisplayed, setIsAclsDisplayed] =
    useState<boolean>(shouldDisplayAcls());

  useEffect(() => {
    setIsAclsDisplayed(shouldDisplayAcls());
  }, [(formik.values.devices[index] as LxdNicDevice).network]);

  return (
    <div className="network-device" key={index}>
      <div>
        {readOnly ? (
          <div>{(formik.values.devices[index] as LxdNicDevice).network}</div>
        ) : (
          <>
            <NetworkSelector
              value={(formik.values.devices[index] as LxdNicDevice).network}
              project={project}
              onBlur={formik.handleBlur}
              setValue={(value) =>
                void formik.setFieldValue(`devices.${index}.network`, value)
              }
              id={`devices.${index}.network`}
              name={`devices.${index}.network`}
            />
            {isAclsDisplayed && (
              <>
                ACLs
                <NetworkAclSelector
                  project={project}
                  selectedAcls={
                    (formik.values.devices[index] as LxdNicDevice)[ // eslint-disable-line
                      "security_acls"
                    ]
                      ?.split(",") // eslint-disable-line
                      .filter((t: string) => t) || [] // eslint-disable-line
                  }
                  setSelectedAcls={(selectedItems) => {
                    formik.setFieldValue(
                      `devices.${index}.security_acls`,
                      selectedItems.join(","),
                    );
                  }}
                />
              </>
            )}
          </>
        )}
      </div>
      <div>
        {readOnly && (
          <Button
            onClick={() => {
              ensureEditMode(formik);
              focusNetwork(index);
            }}
            type="button"
            appearance="base"
            title={formik.values.editRestriction ?? "Edit network"}
            className="u-no-margin--top"
            hasIcon
            dense
            disabled={!!formik.values.editRestriction}
          >
            <Icon name="edit" />
          </Button>
        )}
        <Button
          className="delete-device u-no-margin--top"
          onClick={() => {
            ensureEditMode(formik);
            removeNetwork(index);
          }}
          type="button"
          appearance="base"
          hasIcon
          dense
          title={formik.values.editRestriction ?? "Detach network"}
          disabled={!!formik.values.editRestriction}
        >
          <Icon name="disconnect" />
          <span>Detach</span>
        </Button>
      </div>
    </div>
  );
};

export default NetworkDevice;
