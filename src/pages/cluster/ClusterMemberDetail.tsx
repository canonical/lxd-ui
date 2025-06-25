import type { FC } from "react";
import { Row, useNotify } from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { Link, useParams } from "react-router-dom";
import NotificationRow from "components/NotificationRow";
import { fetchResources } from "api/server";
import CustomLayout from "components/CustomLayout";
import RenameHeader from "components/RenameHeader";
import Loader from "components/Loader";
import TabLinks from "components/TabLinks";

const ClusterMemberDetail: FC = () => {
  const notify = useNotify();
  const { name: memberName, activeTab } = useParams<{
    name: string;
    activeTab?: string;
  }>();

  const {
    data: memberResources,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.cluster, queryKeys.members, memberName],
    queryFn: async () =>
      fetchResources(memberName === "1" ? undefined : memberName),
  });

  if (error) {
    notify.failure("Loading cluster member details failed", error);
  }

  if (isLoading) {
    return <Loader isMainComponent />;
  }

  const tabs = [
    "CPU",
    "GPU",
    "Memory",
    "Network",
    "PCI",
    "Storage",
    "System",
    "USB",
  ];

  return (
    <CustomLayout
      header={
        <RenameHeader
          name={memberName ?? ""}
          parentItems={[
            <Link to="/ui/cluster/members" key={1}>
              Cluster members
            </Link>,
          ]}
          isLoaded
          renameDisabledReason="Cannot rename cluster members"
        />
      }
      contentClassName="detail-page"
    >
      <NotificationRow />
      <Row>
        <TabLinks
          tabs={tabs}
          activeTab={activeTab}
          tabUrl={`/ui/cluster/member/${encodeURIComponent(memberName ?? "")}`}
        />

        {!activeTab && (
          <div role="tabpanel" aria-labelledby="CPU">
            <table>
              <tbody>
                <tr>
                  <th className="u-text--muted">Architecture</th>
                  <td>{memberResources?.cpu.architecture}</td>
                </tr>
                <tr>
                  <th className="u-text--muted">Total</th>
                  <td>{memberResources?.cpu.total}</td>
                </tr>
                <tr>
                  <th className="u-text--muted">Sockets</th>
                  <td>
                    {memberResources?.cpu.sockets?.map((socket, index) => (
                      <div key={index} style={{ marginBottom: "1em" }}>
                        <strong>{socket.name}</strong>
                        <div>Vendor: {socket.vendor}</div>
                        <div>Socket #: {socket.socket}</div>

                        {/* Cache info */}
                        {(socket.cache ?? []).length > 0 && (
                          <div>
                            <strong>Cache:</strong>
                            <ul>
                              {socket.cache?.map((c, i) => (
                                <li key={i}>
                                  Level {c.level} {c.type} - {c.size / 1024} KB
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Core info */}

                        {(socket.cores ?? []).length > 0 && (
                          <div>
                            <strong>Cores:</strong>
                            <ul>
                              {socket.cores?.map((core, i) => (
                                <li key={i}>
                                  Core {core.core}, Die {core.die}
                                  <ul>
                                    {core.threads?.map((thread, j) => (
                                      <li key={j}>
                                        Thread {thread.id} (NUMA{" "}
                                        {thread.numa_node}) -{" "}
                                        {thread.online ? "Online" : "Offline"},{" "}
                                        {thread.isolated
                                          ? "Isolated"
                                          : "Not isolated"}
                                      </li>
                                    ))}
                                  </ul>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )) || "None"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "gpu" && (
          <div role="tabpanel" aria-labelledby="GPU">
            <table>
              <tbody>
                {memberResources?.gpu.cards?.map((card, index) => (
                  <tr key={index}>
                    <th className="u-text--muted">Card #{index + 1}</th>
                    <td>
                      <div>Product: {card.product}</div>
                      <div>Vendor: {card.vendor}</div>
                      <div>PCI Address: {card.pci_address}</div>
                      <div>
                        Driver: {card.driver} ({card.driver_version})
                      </div>
                      <div>NUMA Node: {card.numa_node}</div>

                      {/* DRM info */}
                      {card.drm && (
                        <div style={{ marginTop: "0.5em" }}>
                          <strong>DRM:</strong>
                          <div>
                            Card: {card.drm.card_name} ({card.drm.card_device})
                          </div>
                          <div>
                            Control: {card.drm.control_name} (
                            {card.drm.control_device})
                          </div>
                          {card.drm.render_name && (
                            <div>
                              Render: {card.drm.render_name} (
                              {card.drm.render_device})
                            </div>
                          )}
                        </div>
                      )}

                      {/* SR-IOV info */}
                      {card.sriov && (
                        <div style={{ marginTop: "0.5em" }}>
                          <strong>SR-IOV:</strong>
                          <div>
                            {card.sriov.current_vfs} / {card.sriov.maximum_vfs}{" "}
                            VFs
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "memory" && (
          <div role="tabpanel" aria-labelledby="Memory">
            <table>
              <tbody>
                <tr>
                  <th className="u-text--muted">Total</th>
                  <td>
                    {(memberResources?.memory.total ?? 0 / 1024 ** 2).toFixed(
                      0,
                    )}{" "}
                    MB
                  </td>
                </tr>
                <tr>
                  <th className="u-text--muted">Used</th>
                  <td>
                    {(memberResources?.memory.used ?? 0 / 1024 ** 2).toFixed(0)}{" "}
                    MB
                  </td>
                </tr>
                <tr>
                  <th className="u-text--muted">Hugepages</th>
                  <td>
                    Used: {memberResources?.memory.hugepages_used}, Total:{" "}
                    {memberResources?.memory.hugepages_total}, Size:{" "}
                    {memberResources?.memory.hugepages_size} bytes
                  </td>
                </tr>
                {memberResources?.memory.nodes?.map((node, index) => (
                  <tr key={index}>
                    <th className="u-text--muted">
                      NUMA Node {node.numa_node}
                    </th>
                    <td>
                      Used: {(node.used / 1024 ** 2).toFixed(0)} MB / Total:{" "}
                      {(node.total / 1024 ** 2).toFixed(0)} MB
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "network" && (
          <div role="tabpanel" aria-labelledby="Networks">
            <table>
              <tbody>
                {" "}
                {memberResources?.network.cards?.map((card, i) => (
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
                      {card.pci_address && (
                        <div>PCI Address: {card.pci_address}</div>
                      )}
                      {card.usb_address && (
                        <div>USB Address: {card.usb_address}</div>
                      )}
                      <div>NUMA Node: {card.numa_node}</div>

                      {(card.ports ?? []).length > 0 && (
                        <div style={{ marginTop: "0.5em" }}>
                          <strong>Ports:</strong>
                          <ul>
                            {(card.ports ?? []).map((port, j) => (
                              <li key={j}>
                                <div>
                                  <strong>ID: {port.id}</strong>
                                </div>
                                <div>MAC: {port.address}</div>
                                <div>Protocol: {port.protocol}</div>
                                <div>
                                  Link: {port.link_detected ? "Up" : "Down"}
                                </div>
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
          </div>
        )}

        {activeTab === "pci" && (
          <div role="tabpanel" aria-labelledby="PCI">
            <table>
              <tbody>
                {memberResources?.pci.devices?.map((device, i) => (
                  <tr key={i}>
                    <th className="u-text--muted">Device #{i + 1}</th>
                    <td>
                      <div>
                        <strong>Vendor:</strong> {device.vendor} (
                        {device.vendor_id})
                      </div>
                      <div>
                        <strong>Product:</strong> {device.product} (
                        {device.product_id})
                      </div>
                      <div>
                        <strong>PCI Address:</strong> {device.pci_address}
                      </div>
                      <div>
                        <strong>Driver:</strong> {device.driver || "N/A"}
                      </div>
                      <div>
                        <strong>Driver Version:</strong>{" "}
                        {device.driver_version || "N/A"}
                      </div>
                      <div>
                        <strong>NUMA Node:</strong> {device.numa_node}
                      </div>
                      <div>
                        <strong>IOMMU Group:</strong> {device.iommu_group}
                      </div>
                      {/* Optionally show VPD if it contains keys */}
                      {device.vpd && Object.keys(device.vpd).length > 0 && (
                        <div>
                          <strong>VPD:</strong>
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
          </div>
        )}

        {activeTab === "storage" && (
          <div role="tabpanel" aria-labelledby="Storage">
            <table>
              <tbody>
                {memberResources?.storage.disks?.map((disk, i) => (
                  <tr key={i}>
                    <th className="u-text--muted">Disk #{i + 1}</th>
                    <td>
                      <div>
                        <strong>Model:</strong> {disk.model}
                      </div>
                      <div>
                        <strong>Type:</strong> {disk.type}
                      </div>
                      <div>
                        <strong>ID:</strong> {disk.id}
                      </div>
                      <div>
                        <strong>Serial:</strong> {disk.serial}
                      </div>
                      <div>
                        <strong>Size:</strong>{" "}
                        {(disk.size / 1024 ** 3).toFixed(1)} GB
                      </div>
                      <div>
                        <strong>Firmware:</strong> {disk.firmware_version}
                      </div>
                      <div>
                        <strong>Read-only:</strong>{" "}
                        {disk.read_only ? "Yes" : "No"}
                      </div>
                      <div>
                        <strong>Mounted:</strong> {disk.mounted ? "Yes" : "No"}
                      </div>
                      <div>
                        <strong>Removable:</strong>{" "}
                        {disk.removable ? "Yes" : "No"}
                      </div>
                      <div>
                        <strong>RPM:</strong> {disk.rpm}
                      </div>
                      <div>
                        <strong>Block Size:</strong> {disk.block_size} bytes
                      </div>
                      <div>
                        <strong>PCI Address:</strong> {disk.pci_address}
                      </div>
                      <div>
                        <strong>NUMA Node:</strong> {disk.numa_node}
                      </div>
                      <div>
                        <strong>Device Path:</strong> {disk.device_path}
                      </div>
                      <div>
                        <strong>Device ID:</strong> {disk.device_id}
                      </div>
                      <div>
                        <strong>WWN:</strong> {disk.wwn}
                      </div>

                      {/* Partitions */}
                      {(disk.partitions ?? []).length > 0 && (
                        <div style={{ marginTop: "0.5em" }}>
                          <strong>Partitions:</strong>
                          <ul>
                            {(disk.partitions ?? []).map((part, j) => (
                              <li key={j}>
                                <div>
                                  <strong>ID:</strong> {part.id}
                                </div>
                                <div>
                                  <strong>Device:</strong> {part.device}
                                </div>
                                <div>
                                  <strong>Size:</strong>{" "}
                                  {(part.size / 1024 ** 2).toFixed(1)} MB
                                </div>
                                <div>
                                  <strong>Partition #:</strong> {part.partition}
                                </div>
                                <div>
                                  <strong>Mounted:</strong>{" "}
                                  {part.mounted ? "Yes" : "No"}
                                </div>
                                {part.device_fs_uuid && (
                                  <div>
                                    <strong>UUID:</strong> {part.device_fs_uuid}
                                  </div>
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
          </div>
        )}

        {activeTab === "system" && (
          <div role="tabpanel" aria-labelledby="System">
            <table>
              <tbody>
                <tr>
                  <th className="u-text--muted">UUID</th>
                  <td>{memberResources?.system.uuid}</td>
                </tr>
                <tr>
                  <th className="u-text--muted">Vendor</th>
                  <td>{memberResources?.system.vendor}</td>
                </tr>
                <tr>
                  <th className="u-text--muted">Product</th>
                  <td>{memberResources?.system.product}</td>
                </tr>
                <tr>
                  <th className="u-text--muted">Family</th>
                  <td>{memberResources?.system.family || "N/A"}</td>
                </tr>
                <tr>
                  <th className="u-text--muted">Version</th>
                  <td>{memberResources?.system.version}</td>
                </tr>
                <tr>
                  <th className="u-text--muted">SKU</th>
                  <td>{memberResources?.system.sku || "N/A"}</td>
                </tr>
                <tr>
                  <th className="u-text--muted">Type</th>
                  <td>{memberResources?.system.type}</td>
                </tr>

                {/* Firmware section */}
                {memberResources?.system.firmware && (
                  <>
                    <tr>
                      <th className="u-text--muted">Firmware Vendor</th>
                      <td>{memberResources.system.firmware.vendor}</td>
                    </tr>
                    <tr>
                      <th className="u-text--muted">Firmware Date</th>
                      <td>{memberResources.system.firmware.date}</td>
                    </tr>
                    <tr>
                      <th className="u-text--muted">Firmware Version</th>
                      <td>{memberResources.system.firmware.version}</td>
                    </tr>
                  </>
                )}

                {/* Chassis section */}
                {memberResources?.system.chassis && (
                  <>
                    <tr>
                      <th className="u-text--muted">Chassis Vendor</th>
                      <td>{memberResources.system.chassis.vendor}</td>
                    </tr>
                    <tr>
                      <th className="u-text--muted">Chassis Type</th>
                      <td>{memberResources.system.chassis.type}</td>
                    </tr>
                    <tr>
                      <th className="u-text--muted">Chassis Serial</th>
                      <td>{memberResources.system.chassis.serial || "N/A"}</td>
                    </tr>
                    <tr>
                      <th className="u-text--muted">Chassis Version</th>
                      <td>{memberResources.system.chassis.version || "N/A"}</td>
                    </tr>
                  </>
                )}

                {/* Motherboard section */}
                {memberResources?.system.motherboard && (
                  <>
                    <tr>
                      <th className="u-text--muted">Motherboard Vendor</th>
                      <td>{memberResources.system.motherboard.vendor}</td>
                    </tr>
                    <tr>
                      <th className="u-text--muted">Motherboard Product</th>
                      <td>{memberResources.system.motherboard.product}</td>
                    </tr>
                    <tr>
                      <th className="u-text--muted">Motherboard Serial</th>
                      <td>
                        {memberResources.system.motherboard.serial || "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <th className="u-text--muted">Motherboard Version</th>
                      <td>
                        {memberResources.system.motherboard.version || "N/A"}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "usb" && (
          <div role="tabpanel" aria-labelledby="USB">
            <table>
              <tbody>
                {memberResources?.usb.devices?.map((device, i) => (
                  <tr key={i}>
                    <th className="u-text--muted">Device #{i + 1}</th>
                    <td>
                      <div>
                        <strong>Bus Address:</strong> {device.bus_address}
                      </div>
                      <div>
                        <strong>Device Address:</strong> {device.device_address}
                      </div>
                      {device.vendor && (
                        <div>
                          <strong>Vendor:</strong> {device.vendor}
                        </div>
                      )}
                      {device.product && (
                        <div>
                          <strong>Product:</strong> {device.product}
                        </div>
                      )}
                      {device.serial && device.serial !== "" && (
                        <div>
                          <strong>Serial:</strong> {device.serial}
                        </div>
                      )}
                      {(device.interfaces ?? []).length > 0 && (
                        <div style={{ marginTop: "0.5em" }}>
                          <strong>Interfaces:</strong>
                          <ul>
                            {(device.interfaces ?? []).map((iface, j) => (
                              <li key={j}>
                                <div>
                                  <strong>Class:</strong> {iface.class}
                                </div>
                                <div>
                                  <strong>Subclass:</strong> {iface.subclass}
                                </div>
                                <div>
                                  <strong>Protocol:</strong> {iface.protocol}
                                </div>
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
          </div>
        )}
      </Row>
    </CustomLayout>
  );
};

export default ClusterMemberDetail;
