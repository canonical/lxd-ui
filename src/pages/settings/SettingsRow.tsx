import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import type { ClusterSpecificValues } from "components/ClusterSpecificSelect";
import SettingForm from "pages/settings/SettingForm";
import type { ConfigField } from "types/config";
import ConfigFieldDescription from "pages/settings/ConfigFieldDescription";
import { Input, Button, Form } from "@canonical/react-components";
import { generateUUID } from "util/helpers";
import { getConfigFieldValue, type UserSetting } from "util/settings";
import type { LxdSettings } from "types/server";

type SetUserSettings = (prev: (prev: UserSetting[]) => UserSetting[]) => void;

export const getSettingRow = (
  configField: ConfigField,
  isNewCategory: boolean,
  clusteredValue: ClusterSpecificValues,
  deleteUserSetting: (key: string) => void,
  settings?: LxdSettings,
): MainTableRow => {
  const isDefault = !Object.keys(settings?.config ?? {}).some(
    (key) => key === configField.key,
  );
  const value = getConfigFieldValue(configField, settings);
  return {
    key: configField.key,
    columns: [
      {
        content: isNewCategory && (
          <h2 className="p-heading--5">{configField.category}</h2>
        ),
        role: "cell",
        className: "group",
        "aria-label": "Group",
      },
      {
        content: (
          <div className="key-cell">
            {isDefault ? configField.key : <strong>{configField.key}</strong>}
            <p className="p-text--small u-text--muted u-no-margin--bottom">
              <ConfigFieldDescription description={configField.shortdesc} />
            </p>
          </div>
        ),
        role: "rowheader",
        className: "key",
        "aria-label": "Key",
      },
      {
        content: (
          <SettingForm
            configField={configField}
            value={value}
            clusteredValue={clusteredValue}
            onDelete={deleteUserSetting}
          />
        ),
        role: "cell",
        "aria-label": "Value",
        className: "u-vertical-align-middle",
      },
    ],
  };
};

export const getUserSettingInputRow = (
  userSettings: UserSetting[],
  index: number,
  setUserSettings: SetUserSettings,
  saveUserSetting: (index: number) => void,
): MainTableRow => {
  const userSetting = userSettings[index];
  const isKeyDuplicate = userSettings.some(
    (setting) => `user.${userSetting.key}` === setting.key,
  );
  const isFormDisabled =
    isKeyDuplicate || !userSetting.value || !userSetting.key;

  return {
    key: userSetting.id,
    columns: [
      {
        content: false,
        role: "cell",
        className: "group",
        "aria-label": "Group",
      },
      {
        content: (
          <>
            <Input
              aria-label="new user key"
              id={`new-user-defined-key-${index}`}
              placeholder="User key"
              type="text"
              value={userSetting.key}
              autoFocus
              error={
                isKeyDuplicate && <>Setting with this name already exists</>
              }
              onChange={(e) => {
                setUserSettings((prev) => {
                  const copy = [...prev];
                  copy[index] = {
                    ...copy[index],
                    key: e.target.value,
                  };
                  return copy;
                });
              }}
              help={
                <>
                  Key will be saved as <code>{"user.{your-key}"}</code>. Enter
                  only the part after user.
                </>
              }
            />
          </>
        ),
        role: "rowheader",
        className: "key",
        "aria-label": "key",
      },
      {
        content: (
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              saveUserSetting(index);
            }}
          >
            <Input
              type="submit"
              hidden
              value="Hidden input"
              disabled={isFormDisabled}
            />
            <Input
              aria-label="new user value"
              id={`new-user-defined-value-${index}`}
              placeholder="Value"
              type="text"
              value={userSetting.value}
              onChange={(e) => {
                setUserSettings((prev) => {
                  const copy = [...prev];
                  copy[index] = {
                    ...copy[index],
                    value: e.target.value,
                  };
                  return copy;
                });
              }}
            />
            <Button
              type="button"
              appearance="base"
              className="button"
              onClick={() => {
                setUserSettings((prev) => {
                  const copy = [...prev];
                  copy.splice(index, 1);
                  return copy;
                });
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isFormDisabled}
              appearance="positive"
            >
              Save
            </Button>
          </Form>
        ),
        role: "cell",
        className: "u-vertical-align-middle",
        "aria-label": "Value",
      },
    ],
  };
};

export const getAddSettingButton = (setNewUserSettings: SetUserSettings) => {
  return {
    key: "add-user-config-button",
    columns: [
      {
        content: false,
        role: "cell",
        className: "group",
        "aria-label": "Group",
      },
      {
        content: (
          <Button
            type="button"
            onClick={() => {
              setNewUserSettings((prev) => {
                return [
                  ...prev,
                  {
                    key: "",
                    value: "",
                    default: "",
                    category: "user",
                    type: "string",
                    isSaved: false,
                    isUserDefined: true,
                    id: generateUUID(),
                  },
                ];
              });
            }}
          >
            Add user setting
          </Button>
        ),
        role: "rowheader",
        className: "key",
      },
    ],
  };
};
