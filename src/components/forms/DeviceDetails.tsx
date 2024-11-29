import { FC } from "react";
import { Col, Row } from "@canonical/react-components";
import { LxdGPUDevice, LxdOtherDevice } from "types/device";
import { deviceKeyToLabel } from "util/devices";

interface Props {
  device: LxdGPUDevice | LxdOtherDevice;
}

const DeviceDetails: FC<Props> = ({ device }) => {
  return (
    <>
      {Object.keys(device).map((key) => {
        if (key === "name" || key === "type") {
          return null;
        }
        return (
          <Row key={key}>
            <Col size={4}>{deviceKeyToLabel(key)}</Col>
            <Col size={8} className="mono-font">
              <b>{device[key as keyof typeof device]}</b>
            </Col>
          </Row>
        );
      })}
    </>
  );
};

export default DeviceDetails;
