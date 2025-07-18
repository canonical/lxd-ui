import type { FC } from "react";
import type { LxdResources } from "types/resources";
import { humanFileSize } from "util/helpers";

interface Props {
  resources: LxdResources;
}

const ClusterMemberDetailStorage: FC<Props> = ({ resources }) => {
  return (
    <table>
      <tbody>
        {resources?.storage.disks?.map((disk, i) => (
          <tr key={i}>
            <th className="u-text--muted">Disk #{i + 1}</th>
            <td>
              <div>
                Model: <strong>{disk.model}</strong>
              </div>
              <div>Type: {disk.type}</div>
              <div>ID: {disk.id}</div>
              <div>Serial: {disk.serial}</div>
              <div>Size: {humanFileSize(disk.size)}</div>
              <div>Firmware: {disk.firmware_version}</div>
              <div>Read-only: {disk.read_only ? "Yes" : "No"}</div>
              <div>Mounted: {disk.mounted ? "Yes" : "No"}</div>
              <div>Removable: {disk.removable ? "Yes" : "No"}</div>
              <div>RPM: {disk.rpm}</div>
              <div>Block Size: {humanFileSize(disk.block_size)}</div>
              <div>PCI Address: {disk.pci_address}</div>
              <div>NUMA Node: {disk.numa_node}</div>
              <div>Device Path: {disk.device_path}</div>
              <div>Device ID: {disk.device_id}</div>
              <div>WWN: {disk.wwn}</div>

              {/* Partitions */}
              {(disk.partitions ?? []).length > 0 && (
                <div>
                  Partitions:
                  <ul>
                    {(disk.partitions ?? []).map((part, j) => (
                      <li key={j}>
                        <div>ID: {part.id}</div>
                        <div>Device: {part.device}</div>
                        <div>Size: {humanFileSize(part.size)}</div>
                        <div>Partition #: {part.partition}</div>
                        <div>Mounted: {part.mounted ? "Yes" : "No"}</div>
                        {part.device_fs_uuid && (
                          <div>UUID: {part.device_fs_uuid}</div>
                        )}
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

export default ClusterMemberDetailStorage;
