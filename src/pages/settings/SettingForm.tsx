import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { updateClusteredSettings, updateSettings } from "api/server";
import type { ConfigField } from "types/config";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "context/auth";
import SettingFormCheckbox from "./SettingFormCheckbox";
import SettingFormInput from "./SettingFormInput";
import SettingFormPassword from "./SettingFormPassword";
import ResourceLabel from "components/ResourceLabel";
import { useServerEntitlements } from "util/entitlements/server";
import ClusteredSettingFormInput from "./ClusteredSettingFormInput";
import type { ClusterSpecificValues } from "components/ClusterSpecificSelect";
import { useIsClustered } from "context/useIsClustered";

export const getConfigId = (key: string) => {
  return key.replace(".", "___");
};

interface Props {
  configField: ConfigField;
  value?: string;
  clusteredValue?: ClusterSpecificValues;
  isLast?: boolean;
}

const SettingForm: FC<Props> = ({
  configField,
  value,
  clusteredValue,
  isLast,
}) => {
  const { isRestricted } = useAuth();
  const [isEditMode, setEditMode] = useState(false);
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { canEditServerConfiguration } = useServerEntitlements();
  const isClustered = useIsClustered();

  const editRef = useRef<HTMLDivElement | null>(null);

  // Special cases
  const isTrustPassword = configField.key === "core.trust_password";
  const isLokiAuthPassword = configField.key === "loki.auth.password";
  const isSecret = isTrustPassword || isLokiAuthPassword;
  const isClusteredInput = isClustered && configField.scope === "local";

  const settingLabel = (
    <ResourceLabel bold type="setting" value={configField.key} />
  );

  const onSubmit = (newValue: string | boolean | ClusterSpecificValues) => {
    const mutation =
      isClusteredInput || typeof newValue === "object"
        ? updateClusteredSettings(
            newValue as ClusterSpecificValues,
            configField.key,
          )
        : updateSettings({ [configField.key]: String(newValue) });

    mutation
      .then(() => {
        toastNotify.success(<>Setting {settingLabel} updated.</>);
        setEditMode(false);
      })
      .catch((e) => {
        notify.failure("Setting update failed", e, settingLabel);
      })
      .finally(() => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.settings],
        });
        queryClient.invalidateQueries({
          queryKey: [queryKeys.settings, queryKeys.cluster],
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

  if (isClusteredInput) {
    return (
      <ClusteredSettingFormInput
        key={`${JSON.stringify(clusteredValue)}-${isEditMode}`}
        initialValue={clusteredValue ?? {}}
        disableReason={
          canEditServerConfiguration()
            ? undefined
            : "You do not have permission to edit server configuration"
        }
        configField={configField}
        onSubmit={onSubmit}
        onCancel={onCancel}
        readonly={!isEditMode}
        toggleReadOnly={() => {
          setEditMode(true);
        }}
      />
    );
  }

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
              disabled={!canEditServerConfiguration()}
              title={
                canEditServerConfiguration()
                  ? ""
                  : "You do not have permission to edit server configuration"
              }
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
