import type { FC } from "react";
import { Fragment, useState } from "react";
import { CheckboxInput, Select } from "@canonical/react-components";

type Direction = "Ingress" | "Egress";

export interface DefaultACLSelectOption {
  trafficDirection: string;
  values: string[];
}

interface Props {
  id: string;
  className?: string;
  isReadOnly: boolean;
  onChange: (fieldValue: string, value: string) => void;
  values?: Record<Direction, string>;
  disabled?: boolean;
}

const NetworkDefaultACLSelector: FC<Props> = ({
  id,
  className = "",
  isReadOnly,
  values,
  onChange,
  disabled,
}) => {
  const [isSpecific, setIsSpecific] = useState(
    values?.Egress !== values?.Ingress,
  );
  const DIRECTIONS = ["Egress", "Ingress"];
  const ACTIONS = ["Allow", "Drop", "Reject"];
  const firstValue = Object.values(values ?? {})[0];
  const FIELD_BY_DIRECTION: Record<Direction, string> = {
    Egress: "security_acls_default_egress",
    Ingress: "security_acls_default_ingress",
  };

  const allOptions = [
    { label: "Select option", value: "" },
    ...ACTIONS.map((value) => ({
      label: value,
      value: value.toLowerCase(),
    })),
  ];

  const setValueForAllDirections = (value: string) => {
    onChange(FIELD_BY_DIRECTION.Egress, value);
    onChange(FIELD_BY_DIRECTION.Ingress, value);
  };

  const setDirectionValue = (direction: Direction, value: string) => {
    onChange(FIELD_BY_DIRECTION[direction], value);
  };

  return (
    <div className={className}>
      <CheckboxInput
        id={`${id}-same-for-all-toggle`}
        label="Bi-directional behavior when no ACL rule matches"
        checked={!isSpecific}
        onChange={() => {
          if (isSpecific) {
            setValueForAllDirections(firstValue ?? "");
          }
          setIsSpecific((val) => !val);
        }}
        disabled={isReadOnly || disabled}
      />
      {isSpecific && (
        <div className="direction-specific-input">
          {DIRECTIONS.map((direction) => {
            const activeValue = values?.[direction as Direction];

            return (
              <Fragment key={direction}>
                <div className="direction-specific-key">{direction}</div>
                <div className="direction-specific-value">
                  <Select
                    id={`${id}-${direction}`}
                    className="u-no-margin--bottom"
                    options={allOptions}
                    onChange={(e) => {
                      setDirectionValue(direction as Direction, e.target.value);
                    }}
                    value={activeValue}
                    disabled={isReadOnly || disabled}
                  />
                </div>
              </Fragment>
            );
          })}
        </div>
      )}
      {!isSpecific && (
        <div className="direction-specific-value-wrapper">
          <Select
            id={id}
            options={allOptions}
            onChange={(e) => {
              setValueForAllDirections(e.target.value);
            }}
            value={firstValue}
            disabled={isReadOnly || disabled}
          />
        </div>
      )}
    </div>
  );
};

export default NetworkDefaultACLSelector;
