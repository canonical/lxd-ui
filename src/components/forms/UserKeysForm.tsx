import { useState, type FC, type KeyboardEvent, type ReactNode } from "react";
import {
  Button,
  Icon,
  Input,
  MainTable,
  PrefixedInput,
  Tooltip,
} from "@canonical/react-components";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { useParams } from "react-router-dom";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";
import type { UserKey } from "types/forms/instanceAndProfile";
import { ensureEditMode } from "util/editMode";
import { generateUUID } from "util/helpers";
import {
  getInheritedUserKeys,
  getUserKeyNameError,
  visibleUserKeys,
} from "util/userKeys";
import { useProfiles } from "context/useProfiles";
import ProfileRichChip from "pages/profiles/ProfileRichChip";

interface UserKeyDraft {
  id: string;
  originalKey?: string;
  overrides?: string;
  key: string;
  value: string;
}

const draftAnchor = (draft: UserKeyDraft): string | undefined => {
  return draft.originalKey ?? draft.overrides;
};

interface Props {
  formik: InstanceAndProfileFormikProps;
  disabledReason?: string;
}

const UserKeysForm: FC<Props> = ({ formik, disabledReason }) => {
  const { project } = useParams<{ project: string }>();
  const { data: profiles = [] } = useProfiles(project ?? "");
  const [drafts, setDrafts] = useState<UserKeyDraft[]>([]);

  const allKeys = formik.values.user_keys ?? [];
  const localKeys = visibleUserKeys(allKeys);
  const inheritedKeys = getInheritedUserKeys(formik.values, profiles);
  const hasInherited = inheritedKeys.length > 0;

  const setUserKeys = (userKeys: UserKey[]) => {
    ensureEditMode(formik);
    const internalKeys = allKeys.filter(
      (item) => !localKeys.some((visible) => visible.key === item.key),
    );
    formik.setFieldValue("user_keys", internalKeys.concat(userKeys));
  };

  const addDraft = (draft: Omit<UserKeyDraft, "id">) => {
    setDrafts(drafts.concat({ ...draft, id: generateUUID() }));
  };

  const updateDraft = (id: string, changes: Partial<UserKeyDraft>) => {
    setDrafts(
      drafts.map((draft) =>
        draft.id === id ? { ...draft, ...changes } : draft,
      ),
    );
  };

  const discardDraft = (id: string) => {
    setDrafts(drafts.filter((draft) => draft.id !== id));
  };

  const commitDraft = (draft: UserKeyDraft) => {
    const userKey = { key: draft.key.trim(), value: draft.value };
    setUserKeys(
      draft.originalKey
        ? localKeys.map((item) =>
            item.key === draft.originalKey ? userKey : item,
          )
        : localKeys.concat(userKey),
    );
    discardDraft(draft.id);
  };

  const removeKey = (key: string) => {
    setUserKeys(localKeys.filter((item) => item.key !== key));
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
    { "aria-label": "Actions", className: "actions u-align--right" },
  ];

  const profileColumn = (content: ReactNode = "") => {
    return {
      content,
      role: "cell",
      "aria-label": "Profile",
      className: "profile",
    };
  };

  const actionColumn = (content: ReactNode) => {
    return {
      content,
      role: "cell",
      "aria-label": "Actions",
      className: "actions u-align--right",
    };
  };

  const iconButton = (
    label: string,
    icon: string,
    onClick: () => void,
    key: string,
  ) => {
    return (
      <Button
        onClick={onClick}
        dense
        type="button"
        hasIcon
        appearance="base"
        disabled={!!disabledReason}
        title={disabledReason ?? label}
        aria-label={`${label} ${key}`}
      >
        <Icon name={icon} />
      </Button>
    );
  };

  const draftRow = (draft: UserKeyDraft): MainTableRow => {
    const takenKeys = localKeys
      .filter((item) => item.key !== draft.originalKey)
      .map((item) => item.key);
    const keyError = getUserKeyNameError(draft.key.trim(), takenKeys);
    const isValid = keyError === undefined && draft.value.length > 0;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (isValid) {
          commitDraft(draft);
        }
      }
      if (e.key === "Escape") {
        e.preventDefault();
        discardDraft(draft.id);
      }
    };

    const isEdit = draft.originalKey !== undefined;

    return {
      key: draft.id,
      columns: [
        {
          content: (
            <div className="user-key-draft">
              <div className="user-key-draft-fields">
                <PrefixedInput
                  id={`user-key-name-${draft.id}`}
                  aria-label="User key"
                  placeholder="key"
                  immutableText="user."
                  value={draft.key}
                  error={draft.key.length > 0 ? keyError : undefined}
                  onChange={(e) => {
                    updateDraft(draft.id, { key: e.target.value });
                  }}
                  onKeyDown={onKeyDown}
                  wrapperClassName="user-key-draft-field"
                  autoFocus={!isEdit}
                />
                <Input
                  id={`user-key-value-${draft.id}`}
                  aria-label="User key value"
                  placeholder="Value"
                  type="text"
                  value={draft.value}
                  onChange={(e) => {
                    updateDraft(draft.id, { value: e.target.value });
                  }}
                  onKeyDown={onKeyDown}
                  wrapperClassName="user-key-draft-field"
                  autoFocus={isEdit}
                />
              </div>
              <div className="user-key-draft-actions">
                <Button
                  onClick={() => {
                    discardDraft(draft.id);
                  }}
                  dense
                  type="button"
                  appearance="base"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    commitDraft(draft);
                  }}
                  dense
                  type="button"
                  appearance="positive"
                  disabled={!isValid}
                >
                  Save
                </Button>
                {isEdit && (
                  <Button
                    onClick={() => {
                      discardDraft(draft.id);
                      removeKey(draft.originalKey as string);
                    }}
                    dense
                    type="button"
                    appearance="base"
                    hasIcon
                    aria-label={`Delete ${draft.originalKey}`}
                  >
                    <Icon name="delete" />
                    <span>Delete</span>
                  </Button>
                )}
              </div>
            </div>
          ),
          role: "rowheader",
          "aria-label": "Key",
          className: "user-key-draft-cell",
          colSpan: hasInherited ? 4 : 3,
        },
      ],
    };
  };

  const inheritedRow = (
    key: string,
    value: string,
    source: string,
  ): MainTableRow => {
    const isOverridden = localKeys.some((item) => item.key === key);
    const isBeingOverridden = drafts.some((draft) => draft.overrides === key);

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
        profileColumn(
          <ProfileRichChip
            profileName={source}
            projectName={project ?? ""}
            className="force-truncate"
            disabled={isOverridden}
          />,
        ),
        actionColumn(
          isOverridden
            ? iconButton(
                "Revert to the profile value of",
                "restart",
                () => {
                  removeKey(key);
                },
                key,
              )
            : !isBeingOverridden &&
                iconButton(
                  "Override",
                  "edit",
                  () => {
                    ensureEditMode(formik);
                    addDraft({ overrides: key, key, value });
                  },
                  key,
                ),
        ),
      ],
    };
  };

  const localRow = (userKey: UserKey): MainTableRow => {
    return {
      key: `local-${userKey.key}`,
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
        ...(hasInherited ? [profileColumn()] : []),
        actionColumn(
          iconButton(
            "Edit",
            "edit",
            () => {
              ensureEditMode(formik);
              addDraft({
                originalKey: userKey.key,
                key: userKey.key,
                value: userKey.value,
              });
            },
            userKey.key,
          ),
        ),
      ],
    };
  };

  const sortedKeys = [
    ...new Set(
      inheritedKeys
        .map((item) => item.userKey.key)
        .concat(localKeys.map((item) => item.key)),
    ),
  ].sort();

  const rows = sortedKeys
    .flatMap((key) => {
      const keyRows: MainTableRow[] = [];

      const inherited = inheritedKeys.find((item) => item.userKey.key === key);
      if (inherited) {
        keyRows.push(
          inheritedRow(key, inherited.userKey.value, inherited.source),
        );
      }

      const editDraft = drafts.find((draft) => draft.originalKey === key);
      const local = localKeys.find((item) => item.key === key);
      if (editDraft) {
        keyRows.push(draftRow(editDraft));
      } else if (local) {
        keyRows.push(localRow(local));
      }

      const overrideDraft = drafts.find((draft) => draft.overrides === key);
      if (overrideDraft) {
        keyRows.push(draftRow(overrideDraft));
      }

      return keyRows;
    })
    .concat(
      drafts
        .filter((draft) => draftAnchor(draft) === undefined)
        .map((draft) => draftRow(draft)),
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
          ensureEditMode(formik);
          addDraft({ key: "", value: "" });
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
