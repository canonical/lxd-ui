import type { FC } from "react";
import { useState } from "react";
import {
  MainTable,
  Notification,
  Row,
  ScrollableTable,
  SearchBox,
  useNotify,
  Spinner,
  CustomLayout,
} from "@canonical/react-components";
import SettingForm from "./SettingForm";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import { queryKeys } from "util/queryKeys";
import { fetchConfigOptions } from "api/server";
import { useQuery } from "@tanstack/react-query";
import type { ConfigField } from "types/config";
import ConfigFieldDescription from "pages/settings/ConfigFieldDescription";
import { toConfigFields } from "util/config";
import PageHeader from "components/PageHeader";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { useServerEntitlements } from "util/entitlements/server";
import type { ClusterSpecificValues } from "components/ClusterSpecificSelect";
import { useClusteredSettings } from "context/useSettings";
import type { LXDSettingOnClusterMember } from "types/server";
import { useProjects } from "context/useProjects";
import { getDefaultProject } from "util/loginProject";

const Settings: FC = () => {
  const [query, setQuery] = useState("");
  const notify = useNotify();
  const {
    hasMetadataConfiguration,
    settings,
    isSettingsLoading,
    settingsError,
  } = useSupportedFeatures();
  const { canEditServerConfiguration } = useServerEntitlements();

  const { data: configOptions, isLoading: isConfigOptionsLoading } = useQuery({
    queryKey: [queryKeys.configOptions],
    queryFn: async () => fetchConfigOptions(hasMetadataConfiguration),
  });
  const { data: clusteredSettings = [], error: clusterError } =
    useClusteredSettings();

  const { data: projects = [] } = useProjects();

  if (clusterError) {
    notify.failure("Loading clustered settings failed", clusterError);
  }

  if (isConfigOptionsLoading || isSettingsLoading) {
    return <Spinner className="u-loader" text="Loading..." isMainComponent />;
  }

  if (settingsError) {
    notify.failure("Loading settings failed", settingsError);
  }

  const getValue = (configField: ConfigField): string | undefined => {
    for (const [key, value] of Object.entries(settings?.config ?? {})) {
      if (key === configField.key) {
        return value;
      }
    }
    if (configField.type === "bool") {
      return configField.default === "true" ? "true" : "false";
    }
    if (configField.default === "-") {
      return undefined;
    }
    return configField.default;
  };

  const getClusteredValue = (
    clusteredSettings: LXDSettingOnClusterMember[],
    configField: ConfigField,
  ): ClusterSpecificValues => {
    const settingPerClusterMember: ClusterSpecificValues = {};

    clusteredSettings?.forEach((item) => {
      settingPerClusterMember[item.memberName] =
        item.config?.[configField.key] ?? configField.default ?? "";
    });

    return settingPerClusterMember;
  };

  const headers = [
    { content: "Group", className: "group" },
    { content: "Key", className: "key" },
    { content: "Value" },
  ];

  const configFields = toConfigFields(configOptions?.configs?.server ?? {});

  configFields.push({
    key: "user.ui_grafana_base_url",
    category: "user",
    default: "",
    longdesc:
      "e.g. https://example.org/dashboard?project={project}&name={instance}\n or https://192.0.2.1:3000/d/bGY-LSB7k/lxd?orgId=1",
    shortdesc:
      "LXD will replace `{instance}` and `{project}` with project and instance names for deep-linking to individual grafana pages.\nSee {ref}`grafana` for more information.",
    type: "string",
  });

  configFields.push({
    key: "user.ui_login_project",
    category: "user",
    default: getDefaultProject(projects),
    shortdesc: "Project to display on login.",
    type: "string",
  });

  configFields.push({
    key: "user.ui_theme",
    category: "user",
    default: "",
    shortdesc:
      "Set UI to dark theme, light theme, or to match the system theme.",
    type: "string",
  });

  configFields.push({
    key: "user.ui_title",
    category: "user",
    default: "",
    shortdesc: "Title for the LXD-UI web page. Shows the hostname when unset.",
    type: "string",
  });

  let lastCategory = "";
  const rows = configFields
    .filter((configField) => {
      if (!query) {
        return true;
      }
      return (
        configField.key.toLowerCase().includes(query.toLowerCase()) ||
        configField.shortdesc?.toLowerCase().includes(query.toLowerCase())
      );
    })
    .map((configField, index, { length }) => {
      const isDefault = !Object.keys(settings?.config ?? {}).some(
        (key) => key === configField.key,
      );
      const value = getValue(configField);

      const clusteredValue = getClusteredValue(clusteredSettings, configField);

      const isNewCategory = lastCategory !== configField.category;
      lastCategory = configField.category;

      return {
        key: configField.key,
        columns: [
          {
            content: isNewCategory && (
              <h2 className="p-heading--5">{configField.category}</h2>
            ),
            role: "rowheader",
            className: "group",
            "aria-label": "Group",
          },
          {
            content: (
              <div className="key-cell">
                {isDefault ? (
                  configField.key
                ) : (
                  <strong>{configField.key}</strong>
                )}
                <p className="p-text--small u-text--muted u-no-margin--bottom">
                  <ConfigFieldDescription description={configField.shortdesc} />
                </p>
              </div>
            ),
            role: "cell",
            className: "key",
            "aria-label": "Key",
          },
          {
            content: (
              <SettingForm
                configField={configField}
                value={value}
                clusteredValue={clusteredValue}
                isLast={index === length - 1}
              />
            ),
            role: "cell",
            "aria-label": "Value",
            className: "u-vertical-align-middle",
          },
        ],
      };
    });

  return (
    <>
      <CustomLayout
        header={
          <PageHeader>
            <PageHeader.Left>
              <PageHeader.Title>
                <HelpLink
                  docPath="/server/"
                  title="Learn more about server configuration"
                >
                  Settings
                </HelpLink>
              </PageHeader.Title>
              <PageHeader.Search>
                <SearchBox
                  name="search-setting"
                  type="text"
                  className="u-no-margin--bottom"
                  onChange={(value) => {
                    setQuery(value);
                  }}
                  placeholder="Search"
                  value={query}
                />
              </PageHeader.Search>
            </PageHeader.Left>
          </PageHeader>
        }
        contentClassName="settings"
      >
        <NotificationRow />
        <Row>
          {!canEditServerConfiguration() && (
            <Notification
              severity="caution"
              title="Restricted permissions"
              titleElement="h2"
            >
              You do not have permission to view or edit server settings
            </Notification>
          )}
          {!hasMetadataConfiguration && canEditServerConfiguration() && (
            <Notification
              severity="information"
              title="Get more server settings"
              titleElement="h2"
            >
              Update to LXD v5.19.0 or later to access more server settings
            </Notification>
          )}
          {canEditServerConfiguration() && (
            <ScrollableTable
              dependencies={[notify.notification, rows]}
              tableId="settings-table"
              belowIds={["status-bar"]}
            >
              <MainTable
                id="settings-table"
                headers={headers}
                rows={rows}
                emptyStateMsg="No data to display"
              />
            </ScrollableTable>
          )}
        </Row>
      </CustomLayout>
    </>
  );
};

export default Settings;
