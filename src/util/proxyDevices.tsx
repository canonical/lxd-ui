import { Input, Label, Select } from "@canonical/react-components";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import { LxdProxyDevice } from "types/device";
import { ensureEditMode } from "./instanceEdit";
import { proxyAddressTypeOptions } from "./instanceOptions";
import { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";

type ConnectionType = "listen" | "connect";

export const getProxyAddress = (
  customRows: MainTableRow[],
  device: LxdProxyDevice,
  index: number,
  connectionType: ConnectionType,
  formik: InstanceAndProfileFormikProps,
  headingTitle: string,
) => {
  const deviceParts = device[connectionType]?.split(":") || [];
  const deviceType = deviceParts.length > 0 ? deviceParts[0] : "tcp";
  const deviceAddress = deviceParts.length > 1 ? deviceParts[1] : "";
  const devicePort = deviceParts.length > 2 ? deviceParts[2] : "";

  customRows.push(
    getConfigurationRowBase({
      className: "no-border-top inherited-with-form p-heading--6",
      configuration: headingTitle,
      inherited: "",
      override: "",
    }),
  );

  customRows.push(
    getConfigurationRowBase({
      className: "no-border-top inherited-with-form",
      configuration: (
        <Label forId={`devices.${index}.${connectionType}`}>Type</Label>
      ),
      inherited: (
        <Select
          id={`devices.${index}.${connectionType}`}
          onChange={(e) => {
            ensureEditMode(formik);
            const newType = e.target.value;
            void formik.setFieldValue(
              `devices.${index}.${connectionType}`,
              `${newType}:${deviceAddress}:${devicePort}`,
            );

            if (device.nat === "true") {
              const connectParts = device.connect?.split(":") || [];
              const connectAddress =
                connectParts.length > 1 ? connectParts[1] : "";
              const connectPort =
                connectParts.length > 2 ? connectParts[2] : "";

              void formik.setFieldValue(
                `devices.${index}.connect`,
                `${newType}:${connectAddress}:${connectPort}`,
              );
            }
          }}
          value={deviceType}
          options={proxyAddressTypeOptions}
          className="u-no-margin--bottom"
          disabled={connectionType === "connect" && device.nat === "true"}
          title={
            device.nat
              ? "This is determined by the listen type when nat mode is enabled"
              : undefined
          }
        />
      ),
      override: "",
    }),
  );

  customRows.push(
    getConfigurationRowBase({
      className: "no-border-top inherited-with-form",
      configuration:
        deviceType === "unix" ? (
          <Label forId={`devices.${index}.${connectionType}.unixsocket`}>
            *Socket path
          </Label>
        ) : (
          <Label forId={`devices.${index}.${connectionType}.address`}>
            *Address
          </Label>
        ),
      inherited:
        deviceType === "unix" ? (
          <Input
            id={`devices.${index}.${connectionType}.unixsocket`}
            onChange={(e) => {
              ensureEditMode(formik);
              const socketPath = e.target.value;
              void formik.setFieldValue(
                `devices.${index}.${connectionType}`,
                `unix:${socketPath}`,
              );
            }}
            value={deviceAddress}
            placeholder="/<socket_path>"
            type="text"
            className="u-no-margin--bottom"
          />
        ) : (
          <Input
            id={`devices.${index}.${connectionType}.address`}
            onChange={(e) => {
              ensureEditMode(formik);
              const newAddress = e.target.value;
              void formik.setFieldValue(
                `devices.${index}.${connectionType}`,
                `${deviceType}:${newAddress}:${devicePort}`,
              );
            }}
            value={deviceAddress}
            placeholder="127.0.0.1"
            type="text"
            className="u-no-margin--bottom"
          />
        ),
      override: "",
    }),
  );

  deviceType === "unix"
    ? null
    : customRows.push(
        getConfigurationRowBase({
          className: "no-border-top inherited-with-form",
          configuration: (
            <Label forId={`devices.${index}.${connectionType}.port`}>
              *Port
            </Label>
          ),

          inherited: (
            <Input
              id={`devices.${index}.${connectionType}.port`}
              onChange={(e) => {
                ensureEditMode(formik);
                const newPort = e.target.value;
                void formik.setFieldValue(
                  `devices.${index}.${connectionType}`,
                  `${deviceType}:${deviceAddress}:${newPort}`,
                );
              }}
              value={devicePort}
              placeholder="00[-00]"
              type="text"
              className="u-no-margin--bottom"
            />
          ),
          override: "",
        }),
      );
};
