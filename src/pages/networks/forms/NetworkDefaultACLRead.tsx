import type { FC } from "react";
import { Icon } from "@canonical/react-components";
import { conjugateACLAction } from "util/helpers";
import type { Direction } from "./NetworkDefaultACLSelector";

const NetworkDefaultACLRead: FC<{
  values: Record<Direction, string>;
}> = ({ values }) => {
  const egressAction = values.Egress;
  const ingressAction = values.Ingress;

  return (
    <div className="u-sv1">
      When no ACL rule matches:
      <br />
      <Icon name="arrow-left" className="network-default-acl-icon" />
      Egress traffic is:{" "}
      <code>{conjugateACLAction(egressAction || "reject")}</code>
      <br />
      <Icon name="arrow-right" className="network-default-acl-icon" />
      Ingress traffic is:{" "}
      <code>{conjugateACLAction(ingressAction || "reject")}</code>
    </div>
  );
};
export default NetworkDefaultACLRead;
