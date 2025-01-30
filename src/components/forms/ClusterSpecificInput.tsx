import { FC, Fragment, useEffect, useState } from "react";
import { CheckboxInput, Input } from "@canonical/react-components";
import ResourceLink from "components/ResourceLink";
import FormEditButton from "components/FormEditButton";
import { ClusterSpecificValues } from "components/ClusterSpecificSelect";

interface Props {
  id: string;
  isReadOnly: boolean;
  onChange: (value: ClusterSpecificValues) => void;
  toggleReadOnly?: () => void;
  memberNames: string[];
  values?: ClusterSpecificValues;
  canToggleSpecific?: boolean;
  isDefaultSpecific?: boolean;
  clusterMemberLinkTarget?: (member: string) => string;
  disabled?: boolean;
  helpText?: string;
  placeholder?: string;
  classname?: string;
}

const ClusterSpecificInput: FC<Props> = ({
  values,
  id,
  isReadOnly,
  memberNames,
  onChange,
  toggleReadOnly = () => {},
  canToggleSpecific = true,
  isDefaultSpecific = null,
  clusterMemberLinkTarget = () => "/ui/cluster",
  disabled = false,
  helpText,
  placeholder,
  classname = "u-sv3",
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
        />
      )}
      {isSpecific && (
        <div className="cluster-specific-input">
          {memberNames.map((item) => {
            const activeValue = values?.[item];

            return (
              <Fragment key={item}>
                <div className="cluster-specific-member">
                  <ResourceLink
                    type="cluster-member"
                    value={item}
                    to={clusterMemberLinkTarget(item)}
                  />
                </div>
                <div className="cluster-specific-value">
                  {isReadOnly ? (
                    <>
                      {activeValue}
                      {!disabled && (
                        <FormEditButton toggleReadOnly={toggleReadOnly} />
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
                      onChange={(e) => setValueForMember(e.target.value, item)}
                      disabled={disabled}
                      placeholder={placeholder}
                    />
                  )}
                </div>
              </Fragment>
            );
          })}
          {helpText && (
            <div className="p-form-help-text cluster-specific-helptext">
              {helpText}
            </div>
          )}
        </div>
      )}
      {!isSpecific && (
        <div>
          {isReadOnly ? (
            <>
              {firstValue}
              {!disabled && <FormEditButton toggleReadOnly={toggleReadOnly} />}
            </>
          ) : (
            <Input
              id={id}
              type="text"
              value={firstValue}
              onChange={(e) => setValueForAllMembers(e.target.value)}
              disabled={disabled}
              help={helpText}
              placeholder={placeholder}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ClusterSpecificInput;
