import { Input, Label, Select } from "@canonical/react-components";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import type { LxdProxyDevice } from "types/device";
import { ensureEditMode } from "util/editMode";
import { proxyAddressTypeOptions } from "./instanceOptions";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { formatProxyAddress, parseProxyAddress } from "util/proxyAddress";

type ConnectionType = "listen" | "connect";

export const getProxyAddress = (
  customRows: MainTableRow[],
  device: LxdProxyDevice,
  index: number,
  connectionType: ConnectionType,
  formik: InstanceAndProfileFormikProps,
  headingTitle: string,
) => {
  const {
    type: deviceType,
    address: deviceAddress,
    port: devicePort,
  } = parseProxyAddress(device[connectionType]);

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
            formik.setFieldValue(
              `devices.${index}.${connectionType}`,
              formatProxyAddress({
                type: newType,
                address: deviceAddress,
                port: devicePort,
              }),
            );

            if (device.nat === "true") {
              formik.setFieldValue(
                `devices.${index}.connect`,
                formatProxyAddress({
                  ...parseProxyAddress(device.connect),
                  type: newType,
                }),
              );
            }
          }}
          value={deviceType}
          options={proxyAddressTypeOptions}
          className="u-no-margin--bottom"
          disabled={
            !!formik.values.editRestriction ||
            (connectionType === "connect" && device.nat === "true")
          }
          title={
            formik.values.editRestriction ??
            (device.nat
              ? "This is determined by the listen type when nat mode is enabled"
              : undefined)
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
          <Label
            forId={`devices.${index}.${connectionType}.unixsocket`}
            required
          >
            Socket path
          </Label>
        ) : (
          <Label forId={`devices.${index}.${connectionType}.address`} required>
            Address
          </Label>
        ),
      inherited:
        deviceType === "unix" ? (
          <Input
            id={`devices.${index}.${connectionType}.unixsocket`}
            onChange={(e) => {
              ensureEditMode(formik);
              const socketPath = e.target.value;
              formik.setFieldValue(
                `devices.${index}.${connectionType}`,
                formatProxyAddress({
                  type: "unix",
                  address: socketPath,
                  port: "",
                }),
              );
            }}
            value={deviceAddress}
            placeholder="/<socket_path>"
            type="text"
            className="u-no-margin--bottom"
            disabled={!!formik.values.editRestriction}
            title={formik.values.editRestriction}
          />
        ) : (
          <Input
            id={`devices.${index}.${connectionType}.address`}
            onChange={(e) => {
              ensureEditMode(formik);
              const newAddress = e.target.value;
              formik.setFieldValue(
                `devices.${index}.${connectionType}`,
                formatProxyAddress({
                  type: deviceType,
                  address: newAddress,
                  port: devicePort,
                }),
              );
            }}
            value={deviceAddress}
            placeholder="127.0.0.1 or ::1"
            type="text"
            className="u-no-margin--bottom"
            disabled={!!formik.values.editRestriction}
            title={formik.values.editRestriction}
          />
        ),
      override: "",
    }),
  );

  if (deviceType !== "unix") {
    customRows.push(
      getConfigurationRowBase({
        className: "no-border-top inherited-with-form",
        configuration: (
          <Label forId={`devices.${index}.${connectionType}.port`} required>
            Port
          </Label>
        ),

        inherited: (
          <Input
            id={`devices.${index}.${connectionType}.port`}
            onChange={(e) => {
              ensureEditMode(formik);
              const newPort = e.target.value;
              formik.setFieldValue(
                `devices.${index}.${connectionType}`,
                formatProxyAddress({
                  type: deviceType,
                  address: deviceAddress,
                  port: newPort,
                }),
              );
            }}
            value={devicePort}
            placeholder="00[-00]"
            type="text"
            className="u-no-margin--bottom"
            disabled={!!formik.values.editRestriction}
            title={formik.values.editRestriction}
          />
        ),
        override: "",
      }),
    );
  }
};
