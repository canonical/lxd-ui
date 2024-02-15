import { FC, useEffect, useRef, useState } from "react";
import { Button, Icon, useNotify } from "@canonical/react-components";
import { updateSettings } from "api/server";
import { ConfigField } from "types/config";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "context/auth";
import SettingFormCheckbox from "./SettingFormCheckbox";
import SettingFormInput from "./SettingFormInput";
import SettingFormPassword from "./SettingFormPassword";
import { useToastNotification } from "context/toastNotificationProvider";

export const getConfigId = (key: string) => {
  return key.replace(".", "___");
};

interface Props {
  configField: ConfigField;
  value?: string;
  isLast?: boolean;
}

const SettingForm: FC<Props> = ({ configField, value, isLast }) => {
  const { isRestricted } = useAuth();
  const [isEditMode, setEditMode] = useState(false);
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();

  const editRef = useRef<HTMLDivElement | null>(null);

  // Special cases
  const isTrustPassword = configField.key === "core.trust_password";
  const isLokiAuthPassword = configField.key === "loki.auth.password";
  const isSecret = isTrustPassword || isLokiAuthPassword;

  const onSubmit = (newValue: string | boolean) => {
    const config = {
      [configField.key]: String(newValue),
    };
    updateSettings(config)
      .then(() => {
        toastNotify.success(`Setting ${configField.key} updated.`);
        setEditMode(false);
      })
      .catch((e) => {
        notify.failure("Setting update failed", e);
      })
      .finally(() => {
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.settings],
        });
      });
  };

  const onCancel = () => {
    setEditMode(false);
  };

  const getReadModeValue = () => {
    // special case: secret values are provided by the api as boolean for the read mode
    if (isSecret) {
      return <em>{value ? "set" : "not set"}</em>;
    }
    if (typeof value === "boolean") {
      return String(value);
    }
    return value ? value : "-";
  };

  useEffect(() => {
    if (isEditMode && isLast) {
      editRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isEditMode]);

  return (
    <>
      {isEditMode && (
        <div ref={editRef}>
          {isSecret && (
            <SettingFormPassword
              isSet={Boolean(value)}
              configField={configField}
              onSubmit={onSubmit}
              onCancel={onCancel}
            />
          )}
          {!isSecret && (
            <>
              {configField.type === "bool" ? (
                <SettingFormCheckbox
                  initialValue={value}
                  configField={configField}
                  onSubmit={onSubmit}
                  onCancel={onCancel}
                />
              ) : (
                <SettingFormInput
                  initialValue={value ?? ""}
                  configField={configField}
                  onSubmit={onSubmit}
                  onCancel={onCancel}
                />
              )}
            </>
          )}
        </div>
      )}
      {!isEditMode && (
        <>
          {isRestricted ? (
            <span>{value ?? "-"}</span>
          ) : (
            <Button
              appearance="base"
              className="readmode-button u-no-margin"
              onClick={() => {
                setEditMode(true);
              }}
              hasIcon
            >
              <div className="readmode-value u-truncate">
                {getReadModeValue()}
              </div>
              <Icon name="edit" className="edit-icon" />
            </Button>
          )}
        </>
      )}
    </>
  );
};

export default SettingForm;
