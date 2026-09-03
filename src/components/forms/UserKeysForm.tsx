import type { FC } from "react";
import {
  Button,
  Icon,
  Input,
  MainTable,
  Tooltip,
} from "@canonical/react-components";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { useParams } from "react-router-dom";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";
import type { UserKey } from "types/forms/instanceAndProfile";
import { ensureEditMode } from "util/editMode";
import { focusField } from "util/formFields";
import {
  getInheritedUserKeys,
  getUserKeyErrors,
  getUserKeyRows,
  hasBlankUserKeyName,
  hasBlankUserKeyValue,
} from "util/userKeys";
import { useProfiles } from "context/useProfiles";
import ProfileRichChip from "pages/profiles/ProfileRichChip";

interface Props {
  formik: InstanceAndProfileFormikProps;
  disabledReason?: string;
}

const UserKeysForm: FC<Props> = ({ formik, disabledReason }) => {
  const { project } = useParams<{ project: string }>();
  const { data: profiles = [] } = useProfiles(project ?? "");

  const userKeys = formik.values.user_keys ?? [];
  const keyErrors = getUserKeyErrors(userKeys);
  const inheritedKeys = getInheritedUserKeys(formik.values, profiles);
  const hasInherited = inheritedKeys.length > 0;
  const isReadOnly = formik.values.readOnly;

  const setUserKeys = (keys: UserKey[]) => {
    ensureEditMode(formik);
    formik.setFieldValue("user_keys", keys);
  };

  const updateUserKey = (index: number, changes: Partial<UserKey>) => {
    setUserKeys(
      userKeys.map((item, i) => (i === index ? { ...item, ...changes } : item)),
    );
  };

  const removeUserKey = (index: number) => {
    setUserKeys(userKeys.filter((_item, i) => i !== index));
  };

  const insertUserKey = (key: string, value: string) => {
    const nextIndex = userKeys.findIndex(
      (item) => item.sortKey === undefined || item.sortKey >= key,
    );
    const position = nextIndex < 0 ? userKeys.length : nextIndex;
    setUserKeys(
      userKeys
        .slice(0, position)
        .concat({ key, value, sortKey: key })
        .concat(userKeys.slice(position)),
    );
    focusField(`user-key-value-${position}`);
  };

  const profileHeader = (
    <>
      <span className="u-hide--large">Profile</span>
      <span className="u-hide--small u-hide--medium">
        Inherited from profile
      </span>
    </>
  );

  const headers = [
    { content: "Key", className: "key" },
    { content: "Value", className: "value" },
    ...(hasInherited ? [{ content: profileHeader, className: "profile" }] : []),
    { "aria-label": "Actions", className: "actions" },
  ];

  const actionButton = (
    label: string,
    icon: string,
    onClick: () => void,
    target: string,
  ) => {
    return (
      <Button
        onClick={onClick}
        type="button"
        hasIcon
        appearance="base"
        disabled={!!disabledReason}
        title={disabledReason ?? label}
        aria-label={`${label} ${target}`}
        className="u-no-margin--bottom"
      >
        <Icon name={icon} />
        <span className="u-hide--small u-hide--medium">{label}</span>
      </Button>
    );
  };

  const inheritedRow = (
    key: string,
    value: string,
    source: string,
  ): MainTableRow => {
    const overrideIndex = userKeys.findIndex((item) => item.key === key);
    const isOverridden = overrideIndex >= 0;

    return {
      key: `inherited-${key}`,
      className: isOverridden ? "u-text--muted u-text--line-through" : "",
      columns: [
        {
          content: key,
          role: "rowheader",
          "aria-label": "Key",
          className: "key u-truncate",
          title: key,
        },
        {
          content: value,
          title: value,
          role: "cell",
          "aria-label": "Value",
          className: "value u-truncate",
        },
        {
          content: (
            <ProfileRichChip
              profileName={source}
              projectName={project ?? ""}
              className="force-truncate"
              disabled={isOverridden}
            />
          ),
          role: "cell",
          "aria-label": "Profile",
          className: "profile",
        },
        {
          content: isOverridden
            ? actionButton(
                "Revert",
                "restart",
                () => {
                  removeUserKey(overrideIndex);
                },
                key,
              )
            : actionButton(
                "Override",
                "edit",
                () => {
                  insertUserKey(key, value);
                },
                key,
              ),
          role: "cell",
          "aria-label": "Actions",
          className: "actions",
        },
      ],
    };
  };

  const readRow = (userKey: UserKey, index: number): MainTableRow => {
    return {
      key: `local-${index}`,
      columns: [
        {
          content: userKey.key,
          role: "rowheader",
          "aria-label": "Key",
          className: "key u-truncate",
          title: userKey.key,
        },
        {
          content: userKey.value,
          title: userKey.value,
          role: "cell",
          "aria-label": "Value",
          className: "value u-truncate",
        },
        ...(hasInherited
          ? [
              {
                content: "",
                role: "cell",
                "aria-label": "Profile",
                className: "profile",
              },
            ]
          : []),
        {
          content: actionButton(
            "Edit",
            "edit",
            () => {
              ensureEditMode(formik);
              focusField(`user-key-value-${index}`);
            },
            userKey.key,
          ),
          role: "cell",
          "aria-label": "Actions",
          className: "actions",
        },
      ],
    };
  };

  const editRow = (userKey: UserKey, index: number): MainTableRow => {
    return {
      key: `local-${index}`,
      columns: [
        {
          content: (
            <Input
              id={`user-key-name-${index}`}
              aria-label={`User key ${index + 1}`}
              placeholder="Key"
              type="text"
              value={userKey.key}
              error={keyErrors[index]}
              caution={
                hasBlankUserKeyName(userKey) && !hasBlankUserKeyValue(userKey)
                  ? "Key is required, this entry will not be saved"
                  : undefined
              }
              disabled={!!disabledReason}
              title={disabledReason}
              onChange={(e) => {
                updateUserKey(index, { key: e.target.value });
              }}
            />
          ),
          role: "rowheader",
          "aria-label": "Key",
          className: "key",
        },
        {
          content: (
            <Input
              id={`user-key-value-${index}`}
              aria-label={`User key value ${index + 1}`}
              placeholder="Value"
              type="text"
              value={userKey.value}
              caution={
                hasBlankUserKeyValue(userKey) && !hasBlankUserKeyName(userKey)
                  ? "Value is required, this entry will not be saved"
                  : undefined
              }
              disabled={!!disabledReason}
              title={disabledReason}
              onChange={(e) => {
                updateUserKey(index, { value: e.target.value });
              }}
            />
          ),
          role: "cell",
          "aria-label": "Value",
          className: "value",
        },
        ...(hasInherited
          ? [
              {
                content: "",
                role: "cell",
                "aria-label": "Profile",
                className: "profile",
              },
            ]
          : []),
        {
          content: actionButton(
            "Remove",
            "delete",
            () => {
              removeUserKey(index);
            },
            `user key ${index + 1}`,
          ),
          role: "cell",
          "aria-label": "Actions",
          className: "actions",
        },
      ],
    };
  };

  const rows: MainTableRow[] = getUserKeyRows(userKeys, inheritedKeys).map(
    (row) => {
      if (row.type === "inherited") {
        return inheritedRow(row.userKey.key, row.userKey.value, row.source);
      }
      return isReadOnly
        ? readRow(row.userKey, row.index)
        : editRow(row.userKey, row.index);
    },
  );

  return (
    <div className="user-keys-form">
      <p className="p-form__label u-sv-1">
        User keys{" "}
        <Tooltip
          message={`Custom user.* configuration keys, used to tag an instance.`}
        >
          <Icon name="information" />
        </Tooltip>
      </p>

      {rows.length > 0 && (
        <MainTable
          id="user-keys-table"
          headers={headers}
          rows={rows}
          className="user-keys-table"
        />
      )}
      <Button
        id="add-user-key-btn"
        type="button"
        onClick={() => {
          // no anchor, so the new row stays at the bottom while it is typed in
          setUserKeys(userKeys.concat({ key: "", value: "" }));
          focusField(`user-key-name-${userKeys.length}`);
        }}
        hasIcon
        disabled={!!disabledReason}
        title={disabledReason}
      >
        <Icon name="plus" />
        <span>Add user key</span>
      </Button>
    </div>
  );
};

export default UserKeysForm;
