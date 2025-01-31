import { FC, Fragment, useEffect, useState } from "react";
import { CheckboxInput, Label } from "@canonical/react-components";
import ResourceLink from "components/ResourceLink";
import FormEditButton from "components/FormEditButton";
import { ClusterSpecificValues } from "components/ClusterSpecificSelect";
import { useClusterMembers } from "context/useClusterMembers";
import DiskSizeSelector from "./DiskSizeSelector";

interface Props {
  canToggleSpecific?: boolean;
  id: string;
  toggleReadOnly: () => void;
  setMemoryLimit: (value: ClusterSpecificValues) => void;
  sizeValues?: ClusterSpecificValues;
  isReadOnly?: boolean;
  isDefaultSpecific?: boolean;
  clusterMemberLinkTarget?: (member: string) => string;
  disabled?: boolean;
  helpText?: string;
}

const ClusteredDiskSizeSelector: FC<Props> = ({
  id,
  canToggleSpecific = true,
  toggleReadOnly,
  setMemoryLimit,
  sizeValues,
  isReadOnly,
  isDefaultSpecific = null,
  clusterMemberLinkTarget = () => "/ui/cluster",
  disabled = false,
  helpText,
}) => {
  const { data: clusterMembers = [] } = useClusterMembers();
  const memberNames = clusterMembers.map((member) => member.server_name);
  const [isSpecific, setIsSpecific] = useState<boolean | null>(
    isDefaultSpecific,
  );
  const firstValue = Object.values(sizeValues ?? {})[0];

  useEffect(() => {
    const rawValues = Object.values(sizeValues ?? {});
    if (isSpecific === null && rawValues.length > 0) {
      const newDefaultSpecific = rawValues.some(
        (item) => item !== rawValues[0],
      );
      setIsSpecific(newDefaultSpecific);
    }
  }, [isSpecific, sizeValues]);

  const setValueForAllMembers = (value: string) => {
    const update: ClusterSpecificValues = {};
    memberNames.forEach((member) => (update[member] = value));
    setMemoryLimit(update);
  };

  const setValueForMember = (value: string, member: string) => {
    const update = {
      ...sizeValues,
      [member]: value,
    };
    setMemoryLimit(update);
  };

  return (
    <div className="u-sv3">
      <Label forId="sizePerClusterMember">Size</Label>
      {canToggleSpecific && !isReadOnly && (
        <CheckboxInput
          id={`${id}-same-for-all-toggle`}
          label="Same for all cluster members"
          checked={!isSpecific}
          onChange={() => {
            setIsSpecific((val) => !val);
          }}
        />
      )}
      {isSpecific && (
        <div className="cluster-specific-input">
          {memberNames.map((item) => {
            const activeValue = sizeValues?.[item] ?? "";

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
                      <FormEditButton toggleReadOnly={toggleReadOnly} />
                    </>
                  ) : (
                    <DiskSizeSelector
                      id={
                        memberNames.indexOf(item) === 0 ? id : `${id}-${item}`
                      }
                      value={activeValue}
                      setMemoryLimit={(value) => setValueForMember(value, item)}
                      disabled={disabled}
                      classname="u-no-margin--bottom"
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
              <FormEditButton toggleReadOnly={toggleReadOnly} />
            </>
          ) : (
            <>
              <DiskSizeSelector
                id={id}
                value={firstValue}
                setMemoryLimit={(value) => setValueForAllMembers(value)}
                disabled={disabled}
                help={helpText}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ClusteredDiskSizeSelector;
