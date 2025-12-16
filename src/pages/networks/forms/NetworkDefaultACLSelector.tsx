import type { FC } from "react";
import { Fragment } from "react";
import { Icon, Select } from "@canonical/react-components";
import { conjugateACLAction } from "util/helpers";

export type Direction = "Ingress" | "Egress";

interface Props {
  onChange: (fieldValue: string, value: string) => void;
  values?: Record<Direction, string>;
  disabled?: boolean;
}

const NetworkDefaultACLSelector: FC<Props> = ({
  values,
  onChange,
  disabled,
}) => {
  const DIRECTIONS: Direction[] = ["Egress", "Ingress"];
  const ACTIONS = ["allow", "drop", "reject"];
  const FIELD_BY_DIRECTION: Record<Direction, string> = {
    Egress: "security_acls_default_egress",
    Ingress: "security_acls_default_ingress",
  };

  const options = [
    { label: "Select option", value: "" },
    ...ACTIONS.map((value) => ({
      label: conjugateACLAction(value),
      value: value,
    })),
  ];

  return (
    <div>
      <div className="u-sv2">When no ACL rule matches:</div>
      <div className="network-default-acl-selector u-sv1">
        {DIRECTIONS.map((direction) => {
          return (
            <Fragment key={direction}>
              <div>
                <Icon
                  name={direction === "Egress" ? "arrow-left" : "arrow-right"}
                  className="network-default-acl-icon"
                />
                {direction} traffic will be{" "}
              </div>
              <div>
                <Select
                  className="u-no-margin--bottom"
                  options={options}
                  onChange={(e) => {
                    onChange(FIELD_BY_DIRECTION[direction], e.target.value);
                  }}
                  value={values?.[direction]}
                  disabled={disabled}
                />
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default NetworkDefaultACLSelector;
