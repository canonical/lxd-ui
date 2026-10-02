import type { FC } from "react";
import { Icon } from "@canonical/react-components";
import { InlineCode } from "@canonical/react-ds-global";
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
      <InlineCode>{conjugateACLAction(egressAction || "reject")}</InlineCode>
      <br />
      <Icon name="arrow-right" className="network-default-acl-icon" />
      Ingress traffic is:{" "}
      <InlineCode>{conjugateACLAction(ingressAction || "reject")}</InlineCode>
    </div>
  );
};
export default NetworkDefaultACLRead;
