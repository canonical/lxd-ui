import type { FC } from "react";
import { useState } from "react";
import { Button, Input, Notification } from "@canonical/react-components";
import type { InstanceAndProfileFormikProps } from "./instanceAndProfileFormValues";
import type { EditInstanceFormValues } from "pages/instances/EditInstance";
import type { CustomNetworkDevice } from "util/formDevices";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchConfigOptions } from "api/server";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { toConfigFields } from "util/config";
import ConfigFieldDescription from "pages/settings/ConfigFieldDescription";
import type { LxdMetadata } from "types/config";
import type { LxdNicDevice } from "types/device";

interface Props {
  formik: InstanceAndProfileFormikProps;
  index: number;
}

const NetworkDeviceOptions: FC<Props> = ({ formik, index }) => {
  const [isAdvanced, setIsAdvanced] = useState(false);
  const { hasMetadataConfiguration } = useSupportedFeatures();
  const { data: configOptions } = useQuery({
    queryKey: [queryKeys.configOptions],
    queryFn: async () => fetchConfigOptions(hasMetadataConfiguration),
  });

  const readOnly = (formik.values as EditInstanceFormValues).readOnly;

  const device = formik.values.devices[index] as CustomNetworkDevice;
  const optionKey =
    `device-nic-${device.bare.nictype}` as keyof LxdMetadata["configs"];
  const rawOptions = configOptions?.configs[optionKey];
  const configFields = rawOptions ? toConfigFields(rawOptions) : [];

  if (readOnly) {
    return null;
  }

  return (
    <>
      <Notification severity="information">
        The network is unmanaged.
      </Notification>
      <Button
        onClick={() => {
          setIsAdvanced(!isAdvanced);
        }}
        appearance="link"
        type="button"
      >
        {isAdvanced ? "Hide advanced options" : "Show advanced options"}
      </Button>
      {isAdvanced &&
        configFields.map((configField) => {
          const field = configField.key as keyof LxdNicDevice;
          if (field === "network" || field === "parent") {
            return null;
          }

          return (
            <Input
              id={field}
              key={field}
              name={field}
              label={field}
              value={device.bare[field] ?? ""}
              onChange={(e) => {
                void formik.setFieldValue(
                  `devices.${index}.bare.${field}`,
                  e.target.value,
                );
              }}
              help={
                <ConfigFieldDescription
                  description={configField.longdesc}
                  className="p-form-help-text"
                />
              }
              type="text"
            />
          );
        })}
    </>
  );
};
export default NetworkDeviceOptions;
