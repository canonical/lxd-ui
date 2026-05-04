import type { FC } from "react";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import {
  MainTable,
  Notification,
  Spinner,
  useNotify,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { fetchConfigOptions } from "api/server";
import NotificationRow from "components/NotificationRow";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { useClusteredSettings } from "context/useClusteredSettings";
import SsoNotification from "pages/permissions/SsoNotification";
import { getSettingRow } from "pages/settings/SettingsRow";
import { toConfigFields } from "util/config";
import { queryKeys } from "util/queryKeys";
import { getConfigFieldClusteredValue } from "util/settings";

interface Props {
  closeModal: () => void;
}

const OidcConfigurationForm: FC<Props> = ({ closeModal }: Props) => {
  const notify = useNotify();
  const {
    hasMetadataConfiguration,
    settings,
    isSettingsLoading,
    settingsError,
  } = useSupportedFeatures();
  const { data: configOptions, isLoading: isConfigOptionsLoading } = useQuery({
    queryKey: [queryKeys.configOptions],
    queryFn: async () => fetchConfigOptions(hasMetadataConfiguration),
  });
  const {
    data: clusteredSettings = [],
    isLoading: isClusteredSettingsLoading,
    error: clusterError,
  } = useClusteredSettings();

  if (clusterError) {
    notify.failure("Loading clustered settings failed", clusterError);
    closeModal();
    return null;
  }

  if (settingsError) {
    notify.failure("Loading settings failed", settingsError);
    closeModal();
    return null;
  }

  if (
    isConfigOptionsLoading ||
    isSettingsLoading ||
    isClusteredSettingsLoading
  ) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  const headers = [
    { content: "Group", className: "u-hide" },
    { content: "Key", className: "key" },
    { content: "Value" },
  ];
  const configFields = toConfigFields(configOptions?.configs?.server ?? {});
  const rows: MainTableRow[] = configFields
    .filter((t) => t.key.startsWith("oidc"))
    .map((configField) => {
      const clusteredValue = getConfigFieldClusteredValue(
        clusteredSettings,
        configField,
      );

      return getSettingRow(
        configField,
        false,
        clusteredValue,
        () => {},
        settings,
        (message) => notify.success(message),
      );
    });

  return (
    <>
      {!hasMetadataConfiguration && (
        <Notification
          severity="caution"
          title="Get access to SSO configuration settings"
          titleElement="h2"
        >
          Update to LXD v5.19.0 or later to access these settings
        </Notification>
      )}
      <SsoNotification />
      <NotificationRow className="u-no-padding" />
      <MainTable
        id="settings-table"
        headers={headers}
        rows={rows}
        emptyStateMsg="No data to display"
      />
    </>
  );
};

export default OidcConfigurationForm;
