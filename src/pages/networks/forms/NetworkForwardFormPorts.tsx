import { FC } from "react";
import {
  Button,
  Icon,
  Input,
  Label,
  Select,
} from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import { NetworkForwardFormValues } from "pages/networks/forms/NetworkForwardForm";
import { LxdNetwork } from "types/network";

export interface NetworkForwardPortFormValues {
  listenPort: string;
  protocol: "tcp" | "udp";
  targetAddress: string;
  targetPort?: string;
}

interface Props {
  formik: FormikProps<NetworkForwardFormValues>;
  network?: LxdNetwork;
}

const NetworkForwardFormPorts: FC<Props> = ({ formik, network }) => {
  return (
    <table className="u-no-margin--bottom forward-ports">
      <thead>
        <tr>
          <th className="listen-port">
            <Label
              required
              forId="ports.0.listenPort"
              className="u-no-margin--bottom"
            >
              Listen port
            </Label>
          </th>
          <th className="protocol">
            <Label
              required
              forId="ports.0.protocol"
              className="u-no-margin--bottom"
            >
              Protocol
            </Label>
          </th>
          <th className="target-address">
            <Label
              required
              forId="ports.0.targetAddress"
              className="u-no-margin--bottom"
            >
              Target address
            </Label>
          </th>
          <th className="target-port">
            <Label forId="ports.0.targetPort" className="u-no-margin--bottom">
              Target port
            </Label>
          </th>
          <th className="u-off-screen">Actions</th>
        </tr>
      </thead>
      <tbody>
        {formik.values.ports.map((_port, index) => {
          const portError = formik.errors.ports?.[
            index
          ] as NetworkForwardPortFormValues | null;

          return (
            <tr key={index}>
              <td className="listen-port">
                <Input
                  {...formik.getFieldProps(`ports.${index}.listenPort`)}
                  id={`ports.${index}.listenPort`}
                  type="text"
                  aria-label={`Port ${index} listen port`}
                  placeholder="Port number(s)"
                  help={
                    index === formik.values.ports.length - 1 && (
                      <>e.g. 80,90-99.</>
                    )
                  }
                  error={
                    formik.touched.ports?.[index]?.listenPort
                      ? portError?.listenPort
                      : undefined
                  }
                />
              </td>
              <td className="protocol">
                <Select
                  {...formik.getFieldProps(`ports.${index}.protocol`)}
                  id={`ports.${index}.protocol`}
                  options={[
                    { label: "TCP", value: "tcp" },
                    { label: "UDP", value: "udp" },
                  ]}
                  aria-label={`Port ${index} protocol`}
                />
              </td>
              <td className="target-address">
                <Input
                  {...formik.getFieldProps(`ports.${index}.targetAddress`)}
                  id={`ports.${index}.targetAddress`}
                  type="text"
                  aria-label={`Port ${index} target address`}
                  placeholder="Enter IP address"
                  help={
                    index === formik.values.ports.length - 1 && (
                      <>
                        Must be from the network <b>{network?.name}</b>.
                      </>
                    )
                  }
                  error={
                    formik.touched.ports?.[index]?.targetAddress
                      ? portError?.targetAddress
                      : undefined
                  }
                />
              </td>
              <td className="target-port">
                <Input
                  {...formik.getFieldProps(`ports.${index}.targetPort`)}
                  id={`ports.${index}.targetPort`}
                  type="text"
                  aria-label={`Port ${index} target port`}
                  placeholder="Port number(s)"
                  help={
                    index === formik.values.ports.length - 1 &&
                    "Same as listen port if empty"
                  }
                  error={
                    formik.touched.ports?.[index]?.targetPort
                      ? portError?.targetPort
                      : undefined
                  }
                />
              </td>
              <td>
                <Button
                  onClick={() =>
                    formik.setFieldValue("ports", [
                      ...formik.values.ports.slice(0, index),
                      ...formik.values.ports.slice(index + 1),
                    ])
                  }
                  hasIcon
                  className="u-no-margin--bottom"
                  type="button"
                  aria-label={`Delete port ${index}`}
                >
                  <Icon name="delete" />
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default NetworkForwardFormPorts;
