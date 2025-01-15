import { FC, Fragment, type OptionHTMLAttributes, useState } from "react";
import {
  Button,
  CheckboxInput,
  Icon,
  Select,
} from "@canonical/react-components";
import ResourceLink from "components/ResourceLink";
import { useParams } from "react-router-dom";
import { intersection } from "util/intersection";

export type ClusterSpecificSelectField = Record<string, string>;

interface Props {
  id: string;
  isReadOnly: boolean;
  onChange: (value: ClusterSpecificSelectField) => void;
  toggleReadOnly: () => void;
  options: {
    memberName: string;
    values: string[];
  }[];
  values?: ClusterSpecificSelectField;
  canToggleSpecific?: boolean;
  isDefaultSpecific?: boolean;
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
}) => {
  const { project } = useParams<{ project: string }>();

  const [isSpecific, setIsSpecific] = useState(isDefaultSpecific);

  const toSelectOption = (
    value: string,
  ): OptionHTMLAttributes<HTMLOptionElement> => {
    return {
      label: value,
      value: value,
    };
  };

  const allMemberOptions: OptionHTMLAttributes<HTMLOptionElement>[] = [];
  if (options.length > 0) {
    const optionsPerMember = options.map((item) => item.values);
    const optionsOnAllMembers = intersection(optionsPerMember);
    optionsOnAllMembers.forEach((value) => {
      const option = toSelectOption(value);
      allMemberOptions.push(option);
    });
  }
  allMemberOptions.unshift({
    label:
      allMemberOptions.length === 0 ? "No option available" : "Select option",
    value: "",
  });

  const firstValue = Object.values(values ?? {})[0];

  const setValueForAllMembers = (value: string) => {
    const update: ClusterSpecificSelectField = {};
    options.map((item) => (update[item.memberName] = value));
    onChange(update);
  };

  const setValueForMember = (value: string, member: string) => {
    const update = {
      ...values,
      [member]: value,
    };
    onChange(update);
  };

  const editButton = (
    <Button
      onClick={toggleReadOnly}
      className="u-no-margin--bottom"
      type="button"
      appearance="base"
      title="Edit"
      hasIcon
    >
      <Icon name="edit" />
    </Button>
  );

  return (
    <div className="u-sv3">
      {canToggleSpecific && !isReadOnly && (
        <CheckboxInput
          id={`${id}-same-for-all-toggle`}
          label="Same for all cluster members"
          checked={!isSpecific}
          onChange={() => {
            if (isSpecific) {
              setValueForAllMembers(allMemberOptions?.[0].value as string);
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
                    to={`/ui/project/${project}/networks?scope=${item.memberName}`}
                  />
                </div>
                <div className="cluster-specific-value">
                  {isReadOnly ? (
                    <>
                      {activeValue}
                      {editButton}
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
              {editButton}
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
