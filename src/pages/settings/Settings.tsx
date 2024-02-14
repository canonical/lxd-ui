import { FC, useState } from "react";
import {
  MainTable,
  Notification,
  Row,
  SearchBox,
  useNotify,
} from "@canonical/react-components";
import SettingForm from "./SettingForm";
import Loader from "components/Loader";
import NotificationRow from "components/NotificationRow";
import ScrollableTable from "components/ScrollableTable";
import HelpLink from "components/HelpLink";
import { useDocs } from "context/useDocs";
import { queryKeys } from "util/queryKeys";
import { fetchConfigOptions } from "api/server";
import { useQuery } from "@tanstack/react-query";
import { ConfigField } from "types/config";
import ConfigFieldDescription from "pages/settings/ConfigFieldDescription";
import { toConfigFields } from "util/config";
import CustomLayout from "components/CustomLayout";
import PageHeader from "components/PageHeader";
import { useSupportedFeatures } from "context/useSupportedFeatures";

const Settings: FC = () => {
  const docBaseLink = useDocs();
  const [query, setQuery] = useState("");
  const notify = useNotify();
  const {
    hasMetadataConfiguration,
    settings,
    isSettingsLoading,
    settingsError,
  } = useSupportedFeatures();

  const { data: configOptions, isLoading: isConfigOptionsLoading } = useQuery({
    queryKey: [queryKeys.configOptions],
    queryFn: () => fetchConfigOptions(hasMetadataConfiguration),
  });

  if (isConfigOptionsLoading || isSettingsLoading) {
    return <Loader />;
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

  const headers = [
    { content: "Group", className: "group" },
    { content: "Key", className: "key" },
    { content: "Value" },
  ];

  const configFields = toConfigFields(configOptions?.configs?.server ?? {});

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
      return configField.key.toLowerCase().includes(query.toLowerCase());
    })
    .map((configField, index, { length }) => {
      const isDefault = !Object.keys(settings?.config ?? {}).some(
        (key) => key === configField.key,
      );
      const value = getValue(configField);

      const isNewCategory = lastCategory !== configField.category;
      lastCategory = configField.category;

      return {
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
                {isDefault ? (
                  configField.key
                ) : (
                  <strong>{configField.key}</strong>
                )}
                <ConfigFieldDescription
                  description={configField.shortdesc}
                  className="p-text--small u-text--muted u-no-margin--bottom"
                />
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
                  href={`${docBaseLink}/server/`}
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
          {!hasMetadataConfiguration && (
            <Notification
              severity="information"
              title="Get more server settings"
              titleElement="h2"
            >
              Update to LXD v5.19.0 or later to access more server settings
            </Notification>
          )}
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
        </Row>
      </CustomLayout>
    </>
  );
};

export default Settings;
