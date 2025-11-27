import type { FC } from "react";
import type { LxdResources } from "types/resources";
import { humanFileSize } from "util/helpers";
import Meter from "components/Meter";
import type { LxdClusterMemberState, LxdClusterMember } from "types/cluster";
import ClusterMemberMemoryUsage from "pages/cluster/ClusterMemberMemoryUsage";

interface Props {
  resources: LxdResources;
  state?: LxdClusterMemberState;
  member: LxdClusterMember;
}

const ClusterMemberDetailMemory: FC<Props> = ({ resources, state, member }) => {
  const totalSwap = state?.sysinfo.free_swap ?? 0;
  const freeSwap = state?.sysinfo.free_swap ?? 0;

  return (
    <table>
      <tbody>
        <tr>
          <th className="u-text--muted">Overview</th>
          <td>
            <ClusterMemberMemoryUsage member={member} />
          </td>
        </tr>
        <tr>
          <th className="u-text--muted">Total</th>
          <td>{humanFileSize(resources?.memory?.total ?? 0)}</td>
        </tr>
        <tr>
          <th className="u-text--muted">Used</th>
          <td>{humanFileSize(resources?.memory?.used ?? 0)}</td>
        </tr>
        {state && (
          <>
            <tr>
              <th className="u-text--muted">Free</th>
              <td>{humanFileSize(state?.sysinfo.free_ram ?? 0)}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Shared</th>
              <td>{humanFileSize(state?.sysinfo.shared_ram ?? 0)}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Buffered</th>
              <td>{humanFileSize(state?.sysinfo.buffered_ram ?? 0)}</td>
            </tr>
            <tr>
              <th className="u-text--muted">Swap</th>
              <td>
                <Meter
                  percentage={(100 / totalSwap) * (totalSwap - freeSwap)}
                  text={
                    humanFileSize(totalSwap - freeSwap) +
                    " of " +
                    humanFileSize(totalSwap)
                  }
                  hoverText={
                    `free: ${humanFileSize(freeSwap)}\n` +
                    `total: ${humanFileSize(totalSwap)}`
                  }
                />
              </td>
            </tr>
          </>
        )}
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
