import type { FC } from "react";
import type { LxdResources } from "types/resources";

interface Props {
  resources: LxdResources;
}

const ClusterMemberDetailGPU: FC<Props> = ({ resources }) => {
  return (
    <table>
      <tbody>
        {resources?.gpu.cards?.map((card, index) => (
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
                <div>
                  DRM:
                  <div>
                    Card: {card.drm.card_name} ({card.drm.card_device})
                  </div>
                  <div>
                    Control: {card.drm.control_name} ({card.drm.control_device})
                  </div>
                  {card.drm.render_name && (
                    <div>
                      Render: {card.drm.render_name} ({card.drm.render_device})
                    </div>
                  )}
                </div>
              )}

              {/* SR-IOV info */}
              {card.sriov && (
                <div>
                  SR-IOV:
                  <div>
                    {card.sriov.current_vfs} / {card.sriov.maximum_vfs} VFs
                  </div>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ClusterMemberDetailGPU;
