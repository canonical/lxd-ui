import type { FC, ReactNode } from "react";
import { Fragment, useEffect, useState } from "react";
import { CheckboxInput, Input } from "@canonical/react-components";
import FormEditButton from "components/FormEditButton";
import type { ClusterSpecificValues } from "types/cluster";
import ClusterMemberRichChip from "pages/cluster/ClusterMemberRichChip";

interface Props {
  id: string;
  isReadOnly: boolean;
  onChange: (value: ClusterSpecificValues) => void;
  memberNames: string[];
  toggleReadOnly?: () => void;
  values?: ClusterSpecificValues;
  disableReason?: string;
  canToggleSpecific?: boolean;
  isDefaultSpecific?: boolean;
  disabled?: boolean;
  helpText?: string | ReactNode;
  placeholder?: string;
  classname?: string;
  disabledReason?: string;
}

const ClusterSpecificInput: FC<Props> = ({
  disableReason,
  values,
  id,
  isReadOnly,
  memberNames,
  onChange,
  toggleReadOnly = () => {},
  canToggleSpecific = true,
  isDefaultSpecific = null,
  disabled = false,
  helpText,
  placeholder,
  classname = "u-sv3",
  disabledReason,
}) => {
  const [isSpecific, setIsSpecific] = useState<boolean | null>(
    isDefaultSpecific,
  );
  const firstValue = Object.values(values ?? {})[0];

  useEffect(() => {
    const rawValues = Object.values(values ?? {});
    if (isSpecific === null && rawValues.length > 0) {
      const newDefaultSpecific = rawValues.some(
        (item) => item !== rawValues[0],
      );
      setIsSpecific(newDefaultSpecific);
    }
  }, [isSpecific, values]);

  const setValueForAllMembers = (value: string) => {
    const update: ClusterSpecificValues = {};
    memberNames.forEach((member) => (update[member] = value));
    onChange(update);
  };

  const setValueForMember = (value: string, member: string) => {
    const update = {
      ...values,
      [member]: value,
    };
    onChange(update);
  };

  return (
    <div className={classname}>
      {canToggleSpecific && !isReadOnly && (
        <CheckboxInput
          id={`${id}-same-for-all-toggle`}
          label="Same for all cluster members"
          checked={!isSpecific}
          labelClassName="cluster-specific-toggle-label"
          onChange={() => {
            if (isSpecific) {
              setValueForAllMembers(firstValue ?? "");
            }
            setIsSpecific((val) => !val);
          }}
          disabled={!!disabledReason}
          title={disabledReason}
        />
      )}
      {isSpecific && (
        <div className="cluster-specific-input">
          {memberNames.map((item) => {
            const activeValue = values?.[item];

            return (
              <Fragment key={item}>
                <div className="cluster-specific-member">
                  <ClusterMemberRichChip clusterMember={item} />
                </div>
                <div className="cluster-specific-value-wrapper">
                  {isReadOnly ? (
                    <>
                      <span className="cluster-specific-value">
                        {activeValue}
                      </span>
                      {!disabled && (
                        <FormEditButton
                          disableReason={disableReason}
                          toggleReadOnly={toggleReadOnly}
                        />
                      )}
                    </>
                  ) : (
                    <Input
                      id={
                        memberNames.indexOf(item) === 0 ? id : `${id}-${item}`
                      }
                      type="text"
                      className="u-no-margin--bottom"
                      value={activeValue}
                      onChange={(e) => {
                        setValueForMember(e.target.value, item);
                      }}
                      disabled={!!disabledReason || disabled}
                      placeholder={placeholder}
                      title={disabledReason}
                    />
                  )}
                </div>
              </Fragment>
            );
          })}
          {helpText && !isReadOnly && (
            <div className="p-form-help-text cluster-specific-helptext">
              {helpText}
            </div>
          )}
        </div>
      )}
      {!isSpecific && (
        <div className="cluster-specific-value-wrapper">
          {isReadOnly ? (
            <>
              <span className="cluster-specific-value">
                {firstValue === "" ? "-" : firstValue}
              </span>
              {!disabled && (
                <FormEditButton
                  disableReason={disableReason}
                  toggleReadOnly={toggleReadOnly}
                />
              )}
            </>
          ) : (
            <Input
              id={id}
              type="text"
              value={firstValue}
              onChange={(e) => {
                setValueForAllMembers(e.target.value);
              }}
              disabled={!!disabledReason || disabled}
              help={helpText}
              placeholder={placeholder}
              title={disabledReason}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ClusterSpecificInput;
