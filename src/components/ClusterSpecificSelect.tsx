import {
  FC,
  Fragment,
  type OptionHTMLAttributes,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CheckboxInput, Select } from "@canonical/react-components";
import ResourceLink from "components/ResourceLink";
import { intersection } from "util/intersection";
import FormEditButton from "components/FormEditButton";

export type ClusterSpecificValues = Record<string, string>;

export interface ClusterSpecificSelectOption {
  memberName: string;
  values: string[];
}

interface Props {
  id: string;
  isReadOnly: boolean;
  onChange: (value: ClusterSpecificValues) => void;
  toggleReadOnly: () => void;
  options: ClusterSpecificSelectOption[];
  values?: ClusterSpecificValues;
  canToggleSpecific?: boolean;
  isDefaultSpecific?: boolean;
  clusterMemberLinkTarget?: (member: string) => string;
  disableReason?: string;
}

const ClusterSpecificSelect: FC<Props> = ({
  id,
  isReadOnly,
  options,
  values,
  onChange,
  toggleReadOnly,
  canToggleSpecific = true,
  isDefaultSpecific = false,
  clusterMemberLinkTarget = () => "/ui/cluster",
  disableReason,
}) => {
  const [isSpecific, setIsSpecific] = useState(isDefaultSpecific);

  const toSelectOption = (
    value: string,
  ): OptionHTMLAttributes<HTMLOptionElement> => {
    return {
      label: value,
      value: value,
    };
  };

  const allMemberOptions = useMemo(() => {
    const result: OptionHTMLAttributes<HTMLOptionElement>[] = [];
    if (options.length > 0) {
      const optionsPerMember = options.map((item) => item.values);
      const optionsOnAllMembers = intersection(optionsPerMember);
      optionsOnAllMembers.forEach((value) => {
        const option = toSelectOption(value);
        result.push(option);
      });
    }
    result.unshift({
      label: result.length === 0 ? "No option available" : "Select option",
      value: "",
    });
    return result;
  }, [options]);

  const firstValue = Object.values(values ?? {})[0];
  const firstOptionOnAllMembers = allMemberOptions?.[1]?.value as string | null;

  const setValueForAllMembers = (value: string) => {
    const update: ClusterSpecificValues = {};
    options.forEach((item) => (update[item.memberName] = value));
    onChange(update);
  };

  const setValueForMember = (value: string, member: string) => {
    const update = {
      ...values,
      [member]: value,
    };
    onChange(update);
  };

  useEffect(() => {
    if (!isSpecific && !values) {
      setValueForAllMembers(firstOptionOnAllMembers ?? "");
    }
  }, [isSpecific, values, firstOptionOnAllMembers]);

  return (
    <div className="u-sv3">
      {canToggleSpecific && !isReadOnly && (
        <CheckboxInput
          id={`${id}-same-for-all-toggle`}
          label="Same for all cluster members"
          checked={!isSpecific}
          onChange={() => {
            if (isSpecific) {
              setValueForAllMembers(firstOptionOnAllMembers ?? "");
            }
            setIsSpecific((val) => !val);
          }}
        />
      )}
      {isSpecific && (
        <div className="cluster-specific-input">
          {options.map((item) => {
            const activeValue = values?.[item.memberName];
            const selectOptions = item.values.map(toSelectOption);
            selectOptions.unshift({
              label:
                selectOptions.length === 0 ? "None available" : "Select option",
              value: "",
            });

            return (
              <Fragment key={item.memberName}>
                <div className="cluster-specific-member">
                  <ResourceLink
                    type="cluster-member"
                    value={item.memberName}
                    to={clusterMemberLinkTarget(item.memberName)}
                  />
                </div>
                <div className="cluster-specific-value">
                  {isReadOnly ? (
                    <>
                      {activeValue}
                      <FormEditButton
                        toggleReadOnly={toggleReadOnly}
                        disableReason={disableReason}
                      />
                    </>
                  ) : (
                    <Select
                      id={
                        item.memberName === options[0].memberName
                          ? id
                          : `${id}-${item.memberName}`
                      }
                      className="u-no-margin--bottom"
                      options={selectOptions}
                      onChange={(e) =>
                        setValueForMember(e.target.value, item.memberName)
                      }
                      value={activeValue}
                    />
                  )}
                </div>
              </Fragment>
            );
          })}
        </div>
      )}
      {!isSpecific && (
        <div>
          {isReadOnly ? (
            <>
              {firstValue}
              <FormEditButton
                toggleReadOnly={toggleReadOnly}
                disableReason={disableReason}
              />
            </>
          ) : (
            <Select
              id={id}
              className="u-no-margin--bottom"
              options={allMemberOptions}
              onChange={(e) => setValueForAllMembers(e.target.value)}
              value={firstValue}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ClusterSpecificSelect;
