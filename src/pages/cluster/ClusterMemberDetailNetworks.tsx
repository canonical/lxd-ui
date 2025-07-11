import type { FC } from "react";
import type { LxdResources } from "types/resources";

interface Props {
  resources: LxdResources;
}

const ClusterMemberDetailNetworks: FC<Props> = ({ resources }) => {
  return (
    <table>
      <tbody>
        {resources?.network.cards?.map((card, i) => (
          <tr key={i}>
            <th className="u-text--muted">Card #{i + 1}</th>
            <td>
              <div>Vendor: {card.vendor}</div>
              <div>Product: {card.product}</div>
              <div>
                Driver: {card.driver} ({card.driver_version})
              </div>
              {card.firmware_version && (
                <div>Firmware: {card.firmware_version}</div>
              )}
              {card.pci_address && <div>PCI Address: {card.pci_address}</div>}
              {card.usb_address && <div>USB Address: {card.usb_address}</div>}
              <div>NUMA Node: {card.numa_node}</div>

              {(card.ports ?? []).length > 0 && (
                <div>
                  Ports:
                  <ul>
                    {(card.ports ?? []).map((port, j) => (
                      <li key={j}>
                        <div>
                          ID: <strong>{port.id}</strong>
                        </div>
                        <div>MAC: {port.address}</div>
                        <div>Protocol: {port.protocol}</div>
                        <div>Link: {port.link_detected ? "Up" : "Down"}</div>
                        <div>
                          Auto-negotiation:{" "}
                          {port.auto_negotiation ? "Yes" : "No"}
                        </div>
                        <div>Port type: {port.port_type}</div>
                        <div>Transceiver: {port.transceiver_type}</div>
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

export default ClusterMemberDetailNetworks;
