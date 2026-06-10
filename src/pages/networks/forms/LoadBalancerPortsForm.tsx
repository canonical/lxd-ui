import type { FC } from "react";
import {
  Button,
  Icon,
  Input,
  Label,
  Select,
  Tooltip,
} from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import type { LxdNetwork } from "types/network";
import type {
  LoadBalancerFormValues,
  LoadBalancerPortFormValues,
} from "types/forms/loadBalancers";
import LoadBalancerPoolSelector from "pages/networks/forms/LoadBalancerPoolSelector";
import { useLoadBalancerPools } from "context/useLoadBalancerPools";
import { useCurrentProject } from "context/useCurrentProject";
import EditLoadBalancerPoolBtn from "pages/networks/actions/EditLoadBalancerPoolBtn";
import { CREATE_POOL_VALUE } from "util/loadBalancers";
import usePanelParams from "util/usePanelParams";

interface Props {
  formik: FormikProps<LoadBalancerFormValues>;
  network: LxdNetwork;
}

const LoadBalancerPortsForm: FC<Props> = ({ formik, network }) => {
  const { projectName: project } = useCurrentProject();
  const panelParams = usePanelParams();
  const { data: loadBalancerPools = [] } = useLoadBalancerPools(
    network.name,
    project,
  );

  return (
    <table className="u-no-margin--bottom load-balancer-ports">
      <thead>
        <tr>
          <th className="listen-port">
            <Label
              required
              forId="ports.0.listenPort"
              className="u-no-margin--bottom"
            >
              Listen port
            </Label>
          </th>
          <th className="protocol">
            <Label
              required
              forId="ports.0.protocol"
              className="u-no-margin--bottom"
            >
              Protocol
            </Label>
          </th>
          <th className="target-pool">
            <Label
              required
              forId="ports.0.targetPool"
              className="u-no-margin--bottom"
            >
              Target pool
            </Label>
          </th>
          <th className="instances u-align--right u-text--muted">Instances</th>
          <th className="target-port u-align--right u-text--muted">
            Target port
          </th>
          <th className="pool-action">
            <span className="u-off-screen">Pool action</span>
          </th>
          <th className="actions">
            <span className="u-off-screen">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {formik.values.ports.map((port, index) => {
          const portError = formik.errors.ports?.[
            index
          ] as LoadBalancerPortFormValues | null;
          const selectedTargetPool = loadBalancerPools.find(
            (item) => item.name === port.targetPool,
          );

          const loadBalancerPoolBtn = (
            <Button
              appearance="link"
              className="p-text--small"
              type="button"
              onClick={() => {
                formik.setFieldValue(
                  `ports.${index}.targetPool`,
                  CREATE_POOL_VALUE,
                );
                panelParams.openCreateLoadBalancerPool();
              }}
            >
              load balancer pool
            </Button>
          );

          return (
            <tr key={port.key}>
              <td className="listen-port">
                <Input
                  {...formik.getFieldProps(`ports.${index}.listenPort`)}
                  id={`ports.${index}.listenPort`}
                  className="listen-port-input"
                  type="number"
                  required
                  placeholder="Port number"
                  error={
                    formik.touched.ports?.[index]?.listenPort
                      ? portError?.listenPort
                      : undefined
                  }
                />
              </td>
              <td className="protocol">
                <Select
                  {...formik.getFieldProps(`ports.${index}.protocol`)}
                  className="protocol-select"
                  id={`ports.${index}.protocol`}
                  options={[
                    { label: "TCP", value: "tcp" },
                    { label: "UDP", value: "udp" },
                  ]}
                  aria-label={`Port ${index} protocol`}
                  onChange={(e) => {
                    const value = e.target.value;
                    formik.setFieldValue(`ports.${index}.protocol`, value);
                    formik.setFieldValue(`ports.${index}.targetPool`, null);
                  }}
                />
              </td>
              <td className="target-pool">
                <LoadBalancerPoolSelector
                  id={`ports.${index}.targetPool`}
                  name={`ports.${index}.targetPool`}
                  availablePools={loadBalancerPools.filter(
                    (pool) => pool.config.protocol === port.protocol,
                  )}
                  value={port.targetPool}
                  setValue={(value) => {
                    formik.setFieldValue(`ports.${index}.targetPool`, value);
                  }}
                  error={
                    formik.touched.ports?.[index]?.targetPool
                      ? portError?.targetPool
                      : undefined
                  }
                  help={
                    index !==
                    formik.values.ports.length -
                      1 ? undefined : loadBalancerPools.length === 0 ? (
                      <>
                        Create your first {loadBalancerPoolBtn} for this
                        network.
                      </>
                    ) : (
                      <>Create a {loadBalancerPoolBtn} for this network.</>
                    )
                  }
                />
              </td>
              <td className="instances u-align--right mono-font">
                <b>{selectedTargetPool?.instances.length ?? "-"}</b>{" "}
                <Tooltip message="Determined by selected target pool">
                  <Icon name="information" />
                </Tooltip>
              </td>
              <td className="target-port u-align--right mono-font">
                <b>{selectedTargetPool?.config.target_port ?? "-"}</b>{" "}
                <Tooltip message="Determined by selected target pool">
                  <Icon name="information" />
                </Tooltip>
              </td>
              <td className="pool-action">
                <EditLoadBalancerPoolBtn
                  network={network}
                  pool={port.targetPool}
                />
              </td>
              <td className="actions u-align--right">
                <Button
                  appearance=""
                  onClick={async () =>
                    formik.setFieldValue("ports", [
                      ...formik.values.ports.slice(0, index),
                      ...formik.values.ports.slice(index + 1),
                    ])
                  }
                  hasIcon
                  className="u-no-margin--bottom"
                  type="button"
                  title="Detach port"
                >
                  <Icon name="disconnect" />
                  <span>Detach</span>
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default LoadBalancerPortsForm;
