import type { FC } from "react";
import type { LxdResources } from "types/resources";
import { humanFileSize } from "util/helpers";

interface Props {
  resources: LxdResources;
}

const ClusterMemberDetailMemory: FC<Props> = ({ resources }) => {
  return (
    <table>
      <tbody>
        <tr>
          <th className="u-text--muted">Total</th>
          <td>{humanFileSize(resources?.memory?.total ?? 0)}</td>
        </tr>
        <tr>
          <th className="u-text--muted">Used</th>
          <td>{humanFileSize(resources?.memory?.used ?? 0)}</td>
        </tr>
        <tr>
          <th className="u-text--muted">Hugepages</th>
          <td>
            <div>Used: {resources?.memory.hugepages_used}</div>
            <div>Total: {resources?.memory.hugepages_total}</div>
            <div>
              Size: {humanFileSize(resources?.memory.hugepages_size ?? 0)}
            </div>
          </td>
        </tr>
        {resources?.memory.nodes?.map((node, index) => (
          <tr key={index}>
            <th className="u-text--muted">NUMA Node {node.numa_node}</th>
            <td>
              <div>Used: {humanFileSize(node.used)}</div>
              <div>Total: {humanFileSize(node.total)}</div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ClusterMemberDetailMemory;
