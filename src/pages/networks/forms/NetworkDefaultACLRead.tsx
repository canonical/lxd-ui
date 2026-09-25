import type { FC } from "react";

import { conjugateACLAction } from "util/helpers";
import type { Direction } from "./NetworkDefaultACLSelector";
import DsIcon from "components/DsIcon";

const NetworkDefaultACLRead: FC<{
  values: Record<Direction, string>;
}> = ({ values }) => {
  const egressAction = values.Egress;
  const ingressAction = values.Ingress;

  return (
    <div className="u-sv1">
      When no ACL rule matches:
      <br />
      <DsIcon icon="arrow-left" className="network-default-acl-icon" />
      Egress traffic is:{" "}
      <code>{conjugateACLAction(egressAction || "reject")}</code>
      <br />
      <DsIcon icon="arrow-right" className="network-default-acl-icon" />
      Ingress traffic is:{" "}
      <code>{conjugateACLAction(ingressAction || "reject")}</code>
    </div>
  );
};
export default NetworkDefaultACLRead;
