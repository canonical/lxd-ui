import type { FC } from "react";
import type { LxdResources } from "types/resources";

interface Props {
  resources: LxdResources;
}

const ClusterMemberDetailUSB: FC<Props> = ({ resources }) => {
  return (
    <table className="usb">
      <tbody>
        {resources?.usb.devices?.length === 0 && (
          <tr>
            <td className="u-text--muted">No USB devices found</td>
          </tr>
        )}
        {resources?.usb.devices?.map((device, i) => (
          <tr key={i}>
            <th className="u-text--muted">Device #{i + 1}</th>
            <td>
              <div>Bus Address: {device.bus_address}</div>
              <div>Device Address: {device.device_address}</div>
              {device.vendor && <div>Vendor: {device.vendor}</div>}
              {device.product && <div>Product: {device.product}</div>}
              {device.serial && device.serial !== "" && (
                <div>Serial: {device.serial}</div>
              )}
              {(device.interfaces ?? []).length > 0 && (
                <div>
                  Interfaces:
                  <ul>
                    {(device.interfaces ?? []).map((iface, j) => (
                      <li key={j}>
                        <div>Class: {iface.class}</div>
                        <div>Subclass: {iface.subclass}</div>
                        <div>Protocol: {iface.protocol}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ClusterMemberDetailUSB;
