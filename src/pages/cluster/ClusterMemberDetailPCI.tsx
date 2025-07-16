import type { FC } from "react";
import type { LxdResources } from "types/resources";

interface Props {
  resources: LxdResources;
}

const ClusterMemberDetailPCI: FC<Props> = ({ resources }) => {
  return (
    <table>
      <tbody>
        {resources?.pci.devices?.map((device, i) => (
          <tr key={i}>
            <th className="u-text--muted">Device #{i + 1}</th>
            <td>
              <div>
                Vendor: {device.vendor} ({device.vendor_id})
              </div>
              <div>
                Product: {device.product} ({device.product_id})
              </div>
              <div>PCI Address: {device.pci_address}</div>
              <div>Driver: {device.driver || "N/A"}</div>
              <div>Driver Version: {device.driver_version || "N/A"}</div>
              <div>NUMA Node: {device.numa_node}</div>
              <div>IOMMU Group: {device.iommu_group}</div>
              {/* Optionally show VPD if it contains keys */}
              {device.vpd && Object.keys(device.vpd).length > 0 && (
                <div>
                  VPD:
                  <ul>
                    {Object.entries(device.vpd).map(([key, value]) => (
                      <li key={key}>
                        {key}: {String(value)}
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

export default ClusterMemberDetailPCI;
