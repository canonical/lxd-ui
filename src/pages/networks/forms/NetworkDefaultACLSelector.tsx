import type { FC } from "react";
import { Fragment } from "react";
import { Icon, Label, Select } from "@canonical/react-components";
import { conjugateACLAction } from "util/helpers";

export type Direction = "Ingress" | "Egress";

interface Props {
  onChange: (fieldValue: string, value: string) => void;
  values?: Record<Direction, string>;
  disabled?: boolean;
  directionField: Record<Direction, string>;
}

const NetworkDefaultACLSelector: FC<Props> = ({
  values,
  onChange,
  disabled,
  directionField,
}) => {
  const DIRECTIONS: Direction[] = ["Egress", "Ingress"];
  const ACTIONS = ["allow", "drop", "reject"];

  const options = [
    { label: "Select option", value: "" },
    ...ACTIONS.map((value) => ({
      label: conjugateACLAction(value),
      value: value,
    })),
  ];

  const getId = (direction: Direction) =>
    `${direction.toLowerCase()}-default-action`;

  return (
    <div>
      <div className="u-sv2">When no ACL rule matches:</div>
      <div className="network-default-acl-selector u-sv1">
        {DIRECTIONS.map((direction) => {
          return (
            <Fragment key={direction}>
              <Label forId={getId(direction)}>
                <Icon
                  name={direction === "Egress" ? "arrow-left" : "arrow-right"}
                  className="network-default-acl-icon"
                />
                {direction} traffic is{" "}
              </Label>
              <div>
                <Select
                  className="u-no-margin--bottom"
                  options={options}
                  onChange={(e) => {
                    onChange(directionField[direction], e.target.value);
                  }}
                  value={values?.[direction]}
                  disabled={disabled}
                  id={getId(direction)}
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
