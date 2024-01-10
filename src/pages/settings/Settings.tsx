import React, { FC, useState } from "react";
import {
  Col,
  MainTable,
  Row,
  SearchBox,
  useNotify,
} from "@canonical/react-components";
import BaseLayout from "components/BaseLayout";
import SettingForm from "./SettingForm";
import Loader from "components/Loader";
import { useSettings } from "context/useSettings";
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

const Settings: FC = () => {
  const docBaseLink = useDocs();
  const [query, setQuery] = useState("");
  const notify = useNotify();

  const { data: configOptions, isLoading: isConfigOptionsLoading } = useQuery({
    queryKey: [queryKeys.configOptions],
    queryFn: fetchConfigOptions,
  });

  const { data: settings, error, isLoading: isSettingsLoading } = useSettings();

  if (isConfigOptionsLoading || isSettingsLoading) {
    return <Loader />;
  }

  if (error) {
    notify.failure("Loading settings failed", error);
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

  const configFields = toConfigFields(configOptions?.configs.server ?? {});

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
      <BaseLayout
        title={
          <HelpLink
            href={`${docBaseLink}/server/`}
            title="Learn more about server configuration"
          >
            Settings
          </HelpLink>
        }
        contentClassName="settings"
      >
        <NotificationRow />
        <Row>
          <Col size={8}>
            <SearchBox
              name="search-setting"
              type="text"
              onChange={(value) => {
                setQuery(value);
              }}
              placeholder="Search"
              value={query}
            />
          </Col>
        </Row>
        <Row>
          <ScrollableTable
            dependencies={[notify.notification, rows]}
            tableId="settings-table"
          >
            <MainTable
              id="settings-table"
              headers={headers}
              rows={rows}
              emptyStateMsg="No data to display"
            />
          </ScrollableTable>
        </Row>
      </BaseLayout>
    </>
  );
};

export default Settings;
