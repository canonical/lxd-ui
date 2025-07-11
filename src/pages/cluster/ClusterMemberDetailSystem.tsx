import type { FC } from "react";
import type { LxdResources } from "types/resources";

interface Props {
  resources: LxdResources;
}

const ClusterMemberDetailSystem: FC<Props> = ({ resources }) => {
  return (
    <table>
      <tbody>
        <tr>
          <th className="u-text--muted">UUID</th>
          <td>{resources?.system.uuid}</td>
        </tr>
        <tr>
          <th className="u-text--muted">Vendor</th>
          <td>{resources?.system.vendor}</td>
        </tr>
        <tr>
          <th className="u-text--muted">Product</th>
          <td>{resources?.system.product}</td>
        </tr>
        <tr>
          <th className="u-text--muted">Family</th>
          <td>{resources?.system.family || "N/A"}</td>
        </tr>
        <tr>
          <th className="u-text--muted">Version</th>
          <td>{resources?.system.version}</td>
        </tr>
        <tr>
          <th className="u-text--muted">SKU</th>
          <td>{resources?.system.sku || "N/A"}</td>
        </tr>
        <tr>
          <th className="u-text--muted">Type</th>
          <td>{resources?.system.type}</td>
        </tr>

        {/* Firmware section */}
        {resources?.system.firmware && (
          <>
            <tr>
              <th className="u-text--muted">Firmware Vendor</th>
              <td>{resources.system.firmware.vendor}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Firmware Date</th>
              <td>{resources.system.firmware.date}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Firmware Version</th>
              <td>{resources.system.firmware.version}</td>
            </tr>
          </>
        )}

        {/* Chassis section */}
        {resources?.system.chassis && (
          <>
            <tr>
              <th className="u-text--muted">Chassis Vendor</th>
              <td>{resources.system.chassis.vendor}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Chassis Type</th>
              <td>{resources.system.chassis.type}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Chassis Serial</th>
              <td>{resources.system.chassis.serial || "N/A"}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Chassis Version</th>
              <td>{resources.system.chassis.version || "N/A"}</td>
            </tr>
          </>
        )}

        {/* Motherboard section */}
        {resources?.system.motherboard && (
          <>
            <tr>
              <th className="u-text--muted">Motherboard Vendor</th>
              <td>{resources.system.motherboard.vendor}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Motherboard Product</th>
              <td>{resources.system.motherboard.product}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Motherboard Serial</th>
              <td>{resources.system.motherboard.serial || "N/A"}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Motherboard Version</th>
              <td>{resources.system.motherboard.version || "N/A"}</td>
            </tr>
          </>
        )}
      </tbody>
    </table>
  );
};

export default ClusterMemberDetailSystem;
