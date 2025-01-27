import { FC, Fragment, useEffect, useState } from "react";
import { CheckboxInput, Label } from "@canonical/react-components";
import ResourceLink from "components/ResourceLink";
import { ClusterSpecificValues } from "components/ClusterSpecificSelect";
import { useClusterMembers } from "context/useClusterMembers";
import DiskSizeSelector from "./DiskSizeSelector";

interface Props {
  id: string;
  setValue: (value: ClusterSpecificValues) => void;
  values?: ClusterSpecificValues;
  helpText?: string;
}

const ClusteredDiskSizeSelector: FC<Props> = ({
  id,
  setValue,
  values,
  helpText,
}) => {
  const { data: clusterMembers = [] } = useClusterMembers();
  const memberNames = clusterMembers.map((member) => member.server_name);
  const [isSpecific, setIsSpecific] = useState<boolean | null>(null);
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
    setValue(update);
  };

  const setValueForMember = (value: string, member: string) => {
    const update = {
      ...values,
      [member]: value,
    };
    setValue(update);
  };

  return (
    <div className="u-sv3">
      <Label forId="sizePerClusterMember">Size</Label>
      {
        <CheckboxInput
          id={`${id}-same-for-all-toggle`}
          label="Same for all cluster members"
          checked={!isSpecific}
          onChange={() => {
            setValueForAllMembers(firstValue);
            setIsSpecific((val) => !val);
          }}
        />
      }
      {isSpecific && (
        <div className="cluster-specific-input">
          {memberNames.map((item) => {
            const activeValue = values?.[item] ?? "";

            return (
              <Fragment key={item}>
                <div className="cluster-specific-member">
                  <ResourceLink
                    type="cluster-member"
                    value={item}
                    to={"/ui/cluster"}
                  />
                </div>

                <div className="cluster-specific-value">
                  <DiskSizeSelector
                    id={memberNames.indexOf(item) === 0 ? id : `${id}-${item}`}
                    value={activeValue}
                    setMemoryLimit={(value) => setValueForMember(value, item)}
                    disabled={false}
                    classname="u-no-margin--bottom"
                  />
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
          {
            <DiskSizeSelector
              id={id}
              value={firstValue}
              setMemoryLimit={(value) => setValueForAllMembers(value)}
              disabled={false}
              help={helpText}
            />
          }
        </div>
      )}
    </div>
  );
};

export default ClusteredDiskSizeSelector;
