import { FC, useEffect } from "react";
import {
  Button,
  Col,
  Form,
  Icon,
  Input,
  Label,
  Notification,
  RadioInput,
  Row,
  useNotify,
} from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import * as Yup from "yup";
import { LxdNetwork, LxdNetworkForward } from "types/network";
import { updateMaxHeight } from "util/updateMaxHeight";
import useEventListener from "util/useEventListener";
import { testValidIp, testValidPort } from "util/networks";
import NotificationRow from "components/NotificationRow";
import NetworkForwardFormPorts, {
  NetworkForwardPortFormValues,
} from "pages/networks/forms/NetworkForwardFormPorts";
import ScrollableForm from "components/ScrollableForm";
import { focusField } from "util/formFields";

export const toNetworkForward = (
  values: NetworkForwardFormValues,
): LxdNetworkForward => {
  return {
    listen_address: values.listenAddress,
    description: values.description,
    config: {
      target_address: values.defaultTargetAddress,
    },
    ports: values.ports.map((port) => ({
      listen_port: port.listenPort?.toString(),
      protocol: port.protocol,
      target_address: port.targetAddress?.toString(),
      target_port: port.targetPort?.toString(),
    })),
  };
};

export const NetworkForwardSchema = Yup.object().shape({
  listenAddress: Yup.string()
    .test("valid-ip", "Invalid IP address", testValidIp)
    .required("Listen address is required"),
  ports: Yup.array().of(
    Yup.object().shape({
      listenPort: Yup.string()
        .test("valid-port", "Invalid port number", testValidPort)
        .required("Listen port required"),
      protocol: Yup.string().required("Protocol is required"),
      targetAddress: Yup.string()
        .test("valid-ip", "Invalid IP address", testValidIp)
        .required("Target address is required"),
      targetPort: Yup.string()
        .nullable()
        .test("valid-port", "Invalid port number", testValidPort),
    }),
  ),
});

export interface NetworkForwardFormValues {
  listenAddress: string;
  defaultTargetAddress?: string;
  description?: string;
  ports: NetworkForwardPortFormValues[];
}

interface Props {
  formik: FormikProps<NetworkForwardFormValues>;
  isEdit?: boolean;
  network?: LxdNetwork;
}

const NetworkForwardForm: FC<Props> = ({ formik, isEdit, network }) => {
  const notify = useNotify();

  const updateFormHeight = () => {
    updateMaxHeight("form-contents", "p-bottom-controls");
  };
  useEffect(updateFormHeight, [notify.notification?.message]);
  useEventListener("resize", updateFormHeight);

  const addPort = () => {
    void formik.setFieldValue("ports", [
      ...formik.values.ports,
      {
        protocol: "tcp",
      },
    ]);

    const name = `ports.${formik.values.ports.length}.listenPort`;
    focusField(name);
  };

  const isOvnNetwork = network?.type === "ovn";
  const isManualListenAddress =
    !isOvnNetwork || !["0.0.0.0", "::"].includes(formik.values.listenAddress);

  return (
    <Form className="form network-forwards-form" onSubmit={formik.handleSubmit}>
      <Row className="form-contents">
        <Col size={12}>
          <ScrollableForm>
            {/* hidden submit to enable enter key in inputs */}
            <Input type="submit" hidden value="Hidden input" />
            <Row className="p-form__group p-form-validation">
              <NotificationRow />
              <Notification
                severity="information"
                title="Network information"
                titleElement="h2"
              >
                Name: {network?.name}
                <br />
                {network?.config["ipv4.address"] && (
                  <>
                    IPv4: {network?.config["ipv4.address"]}
                    <br />
                  </>
                )}
                {network?.config["ipv6.address"] && (
                  <>IPv6: {network?.config["ipv6.address"]}</>
                )}
              </Notification>
            </Row>
            <Row>
              <Col size={4}>
                <Label forId="listenAddress">Listen address</Label>
              </Col>
              <Col size={8}>
                {isOvnNetwork && !isEdit && (
                  <>
                    {network?.config["ipv4.address"] !== "none" && (
                      <RadioInput
                        label="Auto-assign IPv4 address"
                        checked={formik.values.listenAddress === "0.0.0.0"}
                        onChange={() => {
                          void formik.setFieldValue("listenAddress", "0.0.0.0");
                        }}
                      />
                    )}
                    {network?.config["ipv6.address"] !== "none" && (
                      <RadioInput
                        label="Auto-assign IPv6 address"
                        checked={formik.values.listenAddress === "::"}
                        onChange={() => {
                          void formik.setFieldValue("listenAddress", "::");
                        }}
                      />
                    )}
                    <RadioInput
                      label="Manually enter address"
                      checked={isManualListenAddress}
                      onChange={() => {
                        void formik.setFieldValue("listenAddress", "");
                      }}
                    />
                  </>
                )}
                <Input
                  {...formik.getFieldProps("listenAddress")}
                  id="listenAddress"
                  type="text"
                  placeholder="Enter IP address"
                  autoFocus
                  required
                  disabled={isEdit || !isManualListenAddress}
                  help="Any address routed to LXD."
                  error={
                    formik.touched.listenAddress
                      ? formik.errors.listenAddress
                      : undefined
                  }
                />
              </Col>
            </Row>
            <Input
              {...formik.getFieldProps("defaultTargetAddress")}
              id="defaultTargetAddress"
              type="text"
              label="Default target address"
              help={
                <>
                  Fallback target for traffic that does not match a port
                  specified below.
                  <br />
                  Must be from the network <b>{network?.name}</b>.
                </>
              }
              placeholder="Enter IP address"
              stacked
            />
            <Input
              {...formik.getFieldProps("description")}
              id="description"
              type="text"
              label="Description"
              placeholder="Enter description"
              stacked
            />
            {formik.values.ports.length > 0 && (
              <NetworkForwardFormPorts formik={formik} network={network} />
            )}
            <Button hasIcon onClick={addPort} type="button">
              <Icon name="plus" />
              <span>Add port</span>
            </Button>
          </ScrollableForm>
        </Col>
      </Row>
    </Form>
  );
};

export default NetworkForwardForm;
