import type { FC } from "react";
import type { LxdResources } from "types/resources";
import { humanFileSize } from "util/helpers";
import type { LxdClusterMemberState } from "types/cluster";

interface Props {
  resources: LxdResources;
  state?: LxdClusterMemberState;
}

const ClusterMemberDetailCPU: FC<Props> = ({ resources, state }) => {
  return (
    <table>
      <tbody>
        <tr>
          <th className="u-text--muted">Architecture</th>
          <td>{resources?.cpu.architecture}</td>
        </tr>
        <tr>
          <th className="u-text--muted">Total</th>
          <td>{resources?.cpu.total}</td>
        </tr>
        {state && (
          <tr>
            <th className="u-text--muted">Logical</th>
            <td>{state?.sysinfo.logical_cpus}</td>
          </tr>
        )}
        <tr>
          <th className="u-text--muted">Sockets</th>
          <td>
            {resources?.cpu.sockets?.map((socket, index) => (
              <div key={index}>
                <strong>{socket.name}</strong>
                <div>Vendor: {socket.vendor}</div>
                <div>Socket #: {socket.socket}</div>

                {/* Cache info */}
                {(socket.cache ?? []).length > 0 && (
                  <div>
                    Cache:
                    <ul>
                      {socket.cache?.map((c, i) => (
                        <li key={i}>
                          Level {c.level} {c.type} - {humanFileSize(c.size)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Core info */}
                {(socket.cores ?? []).length > 0 && (
                  <div>
                    Cores:
                    <ul>
                      {socket.cores?.map((core, i) => (
                        <li key={i}>
                          Core {core.core}, Die {core.die}
                          <ul>
                            {core.threads?.map((thread, j) => (
                              <li key={j}>
                                Thread {thread.id} (NUMA {thread.numa_node}) -{" "}
                                {thread.online ? "Online" : "Offline"},{" "}
                                {thread.isolated ? "Isolated" : "Not isolated"}
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
  );
};

export default ClusterMemberDetailCPU;
